import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Panel, DataTable, Button, Badge } from "../components/ui";
import { Sam, Cal } from "./SourceTag";
import { PageShell } from "./PageShell";
import { RelationGraphView } from "./RelationGraphView";
import {
  useCustData,
  toggleFollowCust
} from "./custProfileData";
const CRUMB = "\u96F6\u552E\u4FE1\u8D37\u98CE\u63A7 / \u8D37\u4E2D\u76D1\u63A7 / \u5355\u5BA2\u8BE6\u60C5";
function useScreenCols() {
  const calc = () => {
    if (typeof window === "undefined") return 3;
    const w = window.innerWidth;
    if (w >= 1080) return 3;
    if (w >= 720) return 2;
    return 1;
  };
  const [cols, setCols] = useState(calc);
  useEffect(() => {
    const onResize = () => setCols(calc());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return cols;
}
function photoDataUri(label, bg) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='110' height='140'><rect width='110' height='140' rx='8' fill='${bg}'/><circle cx='55' cy='52' r='23' fill='#fff' opacity='0.92'/><rect x='31' y='82' width='48' height='38' rx='24' fill='#fff' opacity='0.92'/><text x='55' y='132' font-size='10' fill='#fff' text-anchor='middle' font-family='sans-serif'>${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
function appShotDataUri(shot) {
  const color = shot.status === "\u4E00\u81F4" ? "#16A34A" : shot.status === "\u5F02\u5E38" ? "#DC2626" : "#D97706";
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='200'><rect width='160' height='200' rx='12' fill='#fff' stroke='#E2E8F0'/><path d='M0 12 a12 12 0 0 1 12 -12 h136 a12 12 0 0 1 12 12 v16 h-160 z' fill='#F8FAFC'/><circle cx='14' cy='14' r='4' fill='#CBD5E1'/><rect x='24' y='9' width='78' height='10' rx='5' fill='#E2E8F0'/><rect x='110' y='6' width='40' height='16' rx='8' fill='${color}' opacity='0.14'/><text x='130' y='18' font-size='9' fill='${color}' text-anchor='middle' font-family='sans-serif'>${shot.status}</text><rect x='12' y='44' width='136' height='92' rx='8' fill='#F1F5F9'/><text x='80' y='92' font-size='12' fill='#334155' text-anchor='middle' font-family='sans-serif'>${shot.title}</text><text x='80' y='114' font-size='10' fill='#94A3B8' text-anchor='middle' font-family='sans-serif'>mock \u622A\u5C4F</text><text x='80' y='168' font-size='10' fill='#475569' text-anchor='middle' font-family='sans-serif'>${shot.note}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
function SummaryCard({ label, value, unit, danger }) {
  return /* @__PURE__ */ jsxs("div", { style: { background: "#F8FAFC", borderRadius: 8, padding: "10px 12px" }, children: [
    /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: "#94A3B8" }, children: label }),
    /* @__PURE__ */ jsxs("div", { style: { fontSize: 24, fontWeight: 500, color: danger ? "#DC2626" : "#1E293B", marginTop: 2 }, children: [
      value,
      /* @__PURE__ */ jsx("span", { style: { fontSize: 12, color: "#94A3B8", marginLeft: 2 }, children: unit })
    ] })
  ] });
}
function Stat({ label, value, danger }) {
  return /* @__PURE__ */ jsxs("div", { style: { background: "#F8FAFC", borderRadius: 10, padding: "10px 14px", border: danger ? "1px solid #FECACA" : "1px solid #EEF2F7" }, children: [
    /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: "#94A3B8" }, children: label }),
    /* @__PURE__ */ jsx("div", { style: { fontSize: 20, fontWeight: 600, color: danger ? "#DC2626" : "#1E293B", marginTop: 3 }, children: value })
  ] });
}
function tabBadge(t, cur) {
  switch (t) {
    case "\u592E\u884C\u5F81\u4FE1":
      return `${cur.credit.accounts.length} \u6237`;
    case "\u6388\u4FE1\u8D1F\u503A\u4E0E\u5171\u503A":
      return `${cur.loans.length} \u501F\u636E \xB7 ${cur.coDebt.orgs.length} \u5171\u503A \xB7 ${cur.collections.length} \u50AC\u6536`;
    case "\u5173\u7CFB\u7F51\u7EDC":
      return `${cur.relationGraph.nodes.length} \u8282\u70B9`;
    default:
      return "";
  }
}
const STATUS_KIND = {
  \u6B63\u5E38: "green",
  \u5173\u6CE8: "amber",
  \u903E\u671F: "red",
  \u51BB\u7ED3: "gray"
};
const STAGE_KIND = { M1: "blue", M2: "amber", "M3+": "red" };
const SCORE_KIND = { \u4F18: "green", \u826F: "blue", \u4E2D: "amber", \u5DEE: "red" };
const TABS = [
  "\u57FA\u672C\u4FE1\u606F",
  "\u592E\u884C\u5F81\u4FE1",
  "\u6388\u4FE1\u8D1F\u503A\u4E0E\u5171\u503A",
  "\u5173\u7CFB\u7F51\u7EDC"
];
function money(n) {
  return `\xA5${n.toLocaleString()}`;
}
function VerifyMark({ checks }) {
  const [hover, setHover] = useState(false);
  const hasFail = checks.some((c) => c.status === "\u5F02\u5E38");
  const pending = checks.some((c) => c.status === "\u5F85\u6838");
  const status = hasFail ? "\u5F02\u5E38" : pending ? "\u5F85\u6838" : "\u4E00\u81F4";
  const color = status === "\u4E00\u81F4" ? "#16A34A" : status === "\u5F02\u5E38" ? "#CA8A04" : "#94A3B8";
  const icon = status === "\u4E00\u81F4" ? "\u2713" : status === "\u5F02\u5E38" ? "\u26A0" : "?";
  const tip = checks.map((c) => {
    const tail = [c.verifyOrg, c.verifyTime, c.cost != null ? `\xA5${c.cost}` : null].filter(Boolean).join(" \xB7 ");
    return `${c.source}\xB7${c.item}\uFF1A${c.result}\uFF08${c.status}\uFF09${tail ? ` \uFF5C ${tail}` : ""}`;
  }).join("\uFF1B");
  return /* @__PURE__ */ jsxs(
    "span",
    {
      title: tip,
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => setHover(false),
      style: { position: "relative", display: "inline-flex", alignItems: "center", marginLeft: 6, cursor: "help" },
      children: [
        /* @__PURE__ */ jsx("span", { style: { color, fontSize: 13, fontWeight: 700 }, children: icon }),
        status === "\u4E00\u81F4" && /* @__PURE__ */ jsx("span", { style: { color, fontSize: 9, fontWeight: 700, marginLeft: 0.5 }, children: "!" }),
        hover && /* @__PURE__ */ jsx(
          "span",
          {
            style: {
              position: "absolute",
              bottom: "150%",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#0F172A",
              color: "#fff",
              fontSize: 11,
              lineHeight: 1.5,
              padding: "6px 9px",
              borderRadius: 8,
              whiteSpace: "nowrap",
              zIndex: 50,
              boxShadow: "0 4px 12px rgba(0,0,0,.18)"
            },
            children: tip
          }
        )
      ]
    }
  );
}
function ModelScorePanel({ scores, custId }) {
  const nav = useNavigate();
  const cards = [
    { prod: "zhicha", c: scores.zhiCha },
    { prod: "zhixin", c: scores.zhiXin },
    { prod: "zhirong", c: scores.zhiRong }
  ];
  const go = (prod) => nav(`/console/cr/mid-cust-score?cust=${custId}&prod=${prod}`);
  return /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 8, flex: 1, minHeight: 0 }, children: [
    /* @__PURE__ */ jsxs("div", { style: { border: "1px solid #EDE9FE", borderRadius: 10, padding: 10, background: "#F5F3FF", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }, children: [
      /* @__PURE__ */ jsx("div", { style: { fontSize: 11, fontWeight: 600, color: "#6D28D9" }, children: "\u989D\u5EA6\u5EFA\u8BAE" }),
      /* @__PURE__ */ jsx("div", { style: { fontSize: 18, fontWeight: 800, color: "#6D28D9", marginTop: 3 }, children: money(scores.limitSuggest.suggested) }),
      /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: "#64748B", marginTop: 2 }, children: [
        "\u5F53\u524D ",
        money(scores.limitSuggest.current)
      ] })
    ] }),
    cards.map(({ prod, c }) => /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => go(prod),
        title: `\u67E5\u770B ${c.name} \u8BE6\u60C5`,
        style: {
          border: "1px solid #E2E8F0",
          borderRadius: 10,
          padding: 10,
          background: "#fff",
          cursor: "pointer",
          textAlign: "left",
          display: "flex",
          flexDirection: "column",
          gap: 3,
          height: "100%",
          justifyContent: "center",
          transition: "border-color .15s, box-shadow .15s"
        },
        onMouseEnter: (e) => {
          e.currentTarget.style.borderColor = "#A78BFA";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(139,92,246,.12)";
        },
        onMouseLeave: (e) => {
          e.currentTarget.style.borderColor = "#E2E8F0";
          e.currentTarget.style.boxShadow = "none";
        },
        children: [
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ jsx("span", { style: { fontSize: 11, fontWeight: 600, color: "#334155" }, children: c.name }),
            /* @__PURE__ */ jsx(Badge, { kind: SCORE_KIND[c.level], children: c.level })
          ] }),
          /* @__PURE__ */ jsx("div", { style: { fontSize: 18, fontWeight: 800, color: "#0F172A" }, children: c.score }),
          /* @__PURE__ */ jsx("div", { style: { height: 4, borderRadius: 3, background: "#EEF2FF", overflow: "hidden" }, children: /* @__PURE__ */ jsx("div", { style: { height: "100%", width: `${Math.min(100, Math.round(c.score / 10))}%`, background: "#8B5CF6" } }) }),
          /* @__PURE__ */ jsx("div", { style: { fontSize: 10, color: "#8B5CF6" }, children: "\u203A \u67E5\u770B\u6A21\u578B\u8BE6\u60C5" })
        ]
      },
      prod
    ))
  ] });
}
function Timeline({ items }) {
  if (!items.length) return /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: "#94A3B8" }, children: "\u6682\u65E0\u64CD\u4F5C\u8BB0\u5F55" });
  return /* @__PURE__ */ jsxs("div", { style: { position: "relative", paddingLeft: 18 }, children: [
    /* @__PURE__ */ jsx("div", { style: { position: "absolute", left: 5, top: 4, bottom: 4, width: 2, background: "#E2E8F0" } }),
    items.map((e, i) => /* @__PURE__ */ jsxs("div", { style: { position: "relative", paddingBottom: 16 }, children: [
      /* @__PURE__ */ jsx("span", { style: { position: "absolute", left: -16, top: 4, width: 10, height: 10, borderRadius: 999, background: e.kind === "task" ? "#2563EB" : "#7C3AED", border: "2px solid #fff" } }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsx("span", { style: { fontSize: 13, fontWeight: 600, color: "#1E293B" }, children: e.title }),
        e.status && /* @__PURE__ */ jsx(Badge, { kind: e.status === "\u5F85\u5904\u7F6E" ? "red" : e.status === "\u5904\u7F6E\u4E2D" ? "amber" : "green", children: e.status })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: "#64748B", marginTop: 2 }, children: [
        e.time,
        " \xB7 ",
        e.sub
      ] })
    ] }, i))
  ] });
}
function CustProfile() {
  const d = useCustData();
  const cur = d.customers[0];
  const [tab, setTab] = useState("\u57FA\u672C\u4FE1\u606F");
  const [relTheme, setRelTheme] = useState("\u7EFC\u5408");
  const [relSel, setRelSel] = useState(null);
  const fieldCols = useScreenCols();
  if (!cur) return /* @__PURE__ */ jsx("div", { style: { padding: 24 }, children: "\u6682\u65E0\u5355\u5BA2\u6863\u6848" });
  const infoDefs = [
    { field: "custId", label: "\u5BA2\u6237\u6807\u8BC6", value: cur.custId },
    { field: "maskedId", label: "\u8BC1\u4EF6\u53F7\uFF08\u8131\u654F\uFF09", value: cur.maskedId },
    { field: "gender", label: "\u6027\u522B", value: cur.gender },
    { field: "age", label: "\u5E74\u9F84", value: `${cur.age} \u5C81` },
    { field: "education", label: "\u5B66\u5386", value: cur.education },
    { field: "marital", label: "\u5A5A\u59FB\u72B6\u51B5", value: cur.marital },
    { field: "region", label: "\u6240\u5728\u5730", value: cur.region }
  ];
  const jobDefs = [
    { field: "occupation", label: "\u804C\u4E1A", value: cur.occupation },
    { field: "employer", label: "\u5DE5\u4F5C\u5355\u4F4D", value: cur.employer },
    { field: "income", label: "\u6708\u6536\u5165", value: money(cur.income) },
    { field: "channel", label: "\u8FDB\u4EF6\u6E20\u9053", value: cur.channel }
  ];
  const contactDefs = [
    { field: "phone", label: "\u624B\u673A\u53F7", value: cur.phones[0].number },
    { field: "email", label: "\u90AE\u7BB1", value: cur.email },
    ...cur.addresses.map((a) => ({ field: "", label: a.type, value: a.value }))
  ];
  const [phoneHover, setPhoneHover] = useState(false);
  const taxShots = cur.externalChecks.filter((e) => e.field === "income").map((e) => ({ title: `${e.source}\xB7${e.item}`, note: e.result, status: e.status }));
  const checksByField = {};
  cur.externalChecks.forEach((e) => {
    if (e.field) (checksByField[e.field] ??= []).push(e);
  });
  const otherChecks = cur.externalChecks.filter((e) => !e.field);
  const redCount = cur.alerts.filter((a) => a.level === "\u7EA2").length;
  const yellowCount = cur.alerts.filter((a) => a.level === "\u9EC4").length;
  const pendingCount = cur.alerts.filter((a) => a.status === "\u5F85\u5904\u7F6E").length;
  const alertCols = [
    { key: "id", label: "\u9884\u8B66\u53F7", type: "text", width: "140px" },
    { key: "rule", label: "\u547D\u4E2D\u89C4\u5219", type: "text" },
    { key: "level", label: "\u7B49\u7EA7", type: "badge", badgeKind: "red", width: "90px" },
    { key: "date", label: "\u89E6\u53D1\u65E5\u671F", type: "text", width: "120px" },
    { key: "desc", label: "\u8BF4\u660E", type: "text" },
    { key: "status", label: "\u5904\u7F6E\u72B6\u6001", type: "badge", badgeKind: "blue", width: "110px" }
  ];
  const alertRows = cur.alerts.map((a) => ({
    id: a.id,
    rule: a.rule,
    level: { v: a.level, kind: a.level === "\u7EA2" ? "red" : a.level === "\u9EC4" ? "amber" : "blue" },
    date: a.date,
    desc: a.desc,
    status: { v: a.status, kind: a.status === "\u5F85\u5904\u7F6E" ? "red" : a.status === "\u5904\u7F6E\u4E2D" ? "amber" : "green" }
  }));
  const BEHAVIOR_GROUPS = [
    { key: "\u7528\u4FE1", title: "\u7528\u4FE1\u884C\u4E3A", desc: "\u501F\u6B3E\u652F\u7528\u9891\u6B21\u3001\u65F6\u6BB5\u4E0E\u989D\u5EA6\u5360\u7528\uFF0C\u53CD\u6620\u8D44\u91D1\u9965\u6E34\u5EA6\u4E0E\u518D\u878D\u8D44\u503E\u5411" },
    { key: "\u8FD8\u6B3E", title: "\u8FD8\u6B3E\u884C\u4E3A", desc: "\u5386\u53F2\u8FD8\u6B3E\u5C65\u7EA6\u60C5\u51B5\uFF0C\u662F\u4FE1\u7528\u8BC4\u4F30\u6700\u6838\u5FC3\u7684\u56DE\u770B\u4FE1\u53F7" },
    { key: "\u67E5\u8BE2", title: "\u67E5\u8BE2\u4E0E\u591A\u5934", desc: "\u673A\u6784\u67E5\u8BE2\u4E0E\u8DE8\u673A\u6784\u501F\u8D37\u5BC6\u5EA6\uFF0C\u9884\u8B66\u591A\u5934\u5171\u503A\u4E0E\u4EE5\u8D37\u517B\u8D37" },
    { key: "\u98CE\u9669", title: "\u98CE\u9669\u6807\u8BB0", desc: "\u547D\u4E2D\u53CD\u6B3A\u8BC8 / \u98CE\u9669\u89C4\u5219\u7684\u884C\u4E3A\u4FE1\u53F7" }
  ];
  const dangerBehavior = cur.behavior.filter((b) => b.danger && b.count > 0).length;
  const devDanger = cur.device.envRiskScore >= 60 || cur.device.simulator;
  const sameDevRows = cur.device.sameDeviceAccounts.map((s, i) => ({ id: `d${i}`, name: s.name, custId: s.custId }));
  const queryCols = [
    { key: "org", label: "\u67E5\u8BE2\u673A\u6784", type: "text", fixed: "left", width: "200px" },
    { key: "date", label: "\u65E5\u671F", type: "text", width: "140px" },
    { key: "type", label: "\u67E5\u8BE2\u7C7B\u578B", type: "text" }
  ];
  const queryRows = cur.credit.recentQueries.map((q, i) => ({ id: `q${i}`, org: q.org, date: q.date, type: q.type }));
  const acctCols = [
    { key: "type", label: "\u8D26\u6237\u7C7B\u578B", type: "text", fixed: "left", width: "150px" },
    { key: "bank", label: "\u673A\u6784", type: "text", width: "150px" },
    { key: "openDate", label: "\u5F00\u7ACB\u65E5\u671F", type: "text", width: "120px" },
    { key: "dueDate", label: "\u5230\u671F\u65E5", type: "text", width: "120px" },
    { key: "creditLimit", label: "\u6388\u4FE1\u989D\u5EA6", type: "money", width: "130px" },
    { key: "balance", label: "\u4F59\u989D", type: "money", width: "130px" },
    { key: "guarantee", label: "\u62C5\u4FDD\u65B9\u5F0F", type: "text", width: "90px" },
    { key: "currency", label: "\u5E01\u79CD", type: "text", width: "90px" },
    { key: "overdue", label: "\u5F53\u524D\u903E\u671F", type: "text", width: "150px" },
    { key: "status", label: "\u72B6\u6001", type: "badge", badgeKind: "green", width: "100px" }
  ];
  const acctRows = cur.credit.accounts.map((a, i) => ({
    id: `a${i}`,
    type: a.type,
    bank: a.bank,
    openDate: a.openDate,
    dueDate: a.dueDate,
    creditLimit: a.creditLimit,
    balance: a.balance,
    guarantee: a.guarantee,
    currency: a.currency,
    overdue: a.overdueMonths > 0 ? `${a.overdueMonths} \u671F \xB7 ${money(a.overdueAmt)}` : "\u2014",
    status: {
      v: a.status,
      kind: a.status === "\u903E\u671F" || a.status === "\u5446\u8D26" || a.status === "\u51BB\u7ED3" || a.status === "\u6B62\u4ED8" ? "red" : a.status === "\u5173\u6CE8" ? "amber" : "green"
    }
  }));
  const selfQueryCols = [
    { key: "date", label: "\u65E5\u671F", type: "text", width: "140px" },
    { key: "type", label: "\u67E5\u8BE2\u539F\u56E0", type: "text" }
  ];
  const selfQueryRows = cur.credit.selfQueries.map((q, i) => ({ id: `sq${i}`, date: q.date, type: q.type }));
  const agreeCols = [
    { key: "org", label: "\u7BA1\u7406\u673A\u6784", type: "text", fixed: "left", width: "160px" },
    { key: "limit", label: "\u6388\u4FE1\u989D\u5EA6", type: "money", width: "130px" },
    { key: "currency", label: "\u5E01\u79CD", type: "text", width: "90px" },
    { key: "shareAccounts", label: "\u534F\u8BAE\u8D26\u6237\u6570", type: "text", width: "100px" },
    { key: "effectiveDate", label: "\u751F\u6548\u65E5", type: "text", width: "120px" },
    { key: "expireDate", label: "\u5230\u671F\u65E5", type: "text", width: "120px" },
    { key: "status", label: "\u72B6\u6001", type: "badge", badgeKind: "green", width: "100px" }
  ];
  const agreeRows = cur.credit.agreements.map((a, i) => ({
    id: `ag${i}`,
    org: a.org,
    limit: a.limit,
    currency: a.currency,
    shareAccounts: a.shareAccounts,
    effectiveDate: a.effectiveDate,
    expireDate: a.expireDate,
    status: { v: a.status, kind: a.status === "\u7EC8\u6B62" ? "red" : a.status === "\u5173\u6CE8" ? "amber" : "green" }
  }));
  const repayCols = [
    { key: "name", label: "\u8D23\u4EFB\u4EBA", type: "text", fixed: "left", width: "120px" },
    { key: "relation", label: "\u5173\u7CFB", type: "text", width: "90px" },
    { key: "org", label: "\u7BA1\u7406\u673A\u6784", type: "text", width: "150px" },
    { key: "product", label: "\u4E1A\u52A1\u54C1\u79CD", type: "text", width: "120px" },
    { key: "amount", label: "\u8D23\u4EFB\u91D1\u989D", type: "money", width: "130px" },
    { key: "status", label: "\u72B6\u6001", type: "badge", badgeKind: "green", width: "100px" }
  ];
  const repayRows = cur.credit.relatedRepayList.map((r, i) => ({
    id: `rp${i}`,
    name: r.name,
    relation: r.relation,
    org: r.org,
    product: r.product,
    amount: r.amount,
    status: { v: r.status, kind: r.status === "\u903E\u671F" ? "red" : r.status === "\u5173\u6CE8" ? "amber" : "green" }
  }));
  const pubCols = [
    { key: "type", label: "\u8BB0\u5F55\u7C7B\u578B", type: "text", fixed: "left", width: "120px" },
    { key: "org", label: "\u8BB0\u5F55\u673A\u6784", type: "text", width: "220px" },
    { key: "date", label: "\u53D1\u751F\u65E5\u671F", type: "text", width: "130px" },
    { key: "content", label: "\u5185\u5BB9", type: "text" },
    { key: "status", label: "\u72B6\u6001", type: "badge", badgeKind: "gray", width: "100px" }
  ];
  const pubRows = cur.credit.publicRecords.map((p, i) => ({
    id: `pr${i}`,
    type: p.type,
    org: p.org,
    date: p.date,
    content: p.content,
    status: { v: p.status, kind: p.status === "\u672A\u5C65\u884C" || p.status === "\u903E\u671F" ? "red" : p.status === "\u5DF2\u5C65\u884C" || p.status === "\u5DF2\u7ED3\u6E05" ? "green" : "amber" }
  }));
  const limitCols = [
    { key: "product", label: "\u8D37\u6B3E\u4EA7\u54C1", type: "text", fixed: "left", width: "220px" },
    { key: "balance", label: "\u5DF2\u7528\u989D\u5EA6", type: "money", width: "140px", tag: "calc" },
    { key: "rate", label: "\u5E74\u5316\u5229\u7387", type: "percent", width: "120px" },
    { key: "status", label: "\u72B6\u6001", type: "badge", badgeKind: "green", width: "110px" }
  ];
  const limitRows = cur.loans.map((l) => ({
    id: l.id,
    product: l.product,
    balance: l.balance,
    rate: l.rate,
    status: { v: l.status, kind: l.status === "\u903E\u671F" ? "red" : l.status === "\u7ED3\u6E05" ? "gray" : "green" }
  }));
  const debtCols = [
    { key: "id", label: "\u501F\u636E\u53F7", type: "text", fixed: "left", width: "130px" },
    { key: "product", label: "\u4EA7\u54C1", type: "text", width: "200px" },
    { key: "principal", label: "\u5408\u540C\u672C\u91D1", type: "money", width: "140px" },
    { key: "balance", label: "\u5F53\u524D\u4F59\u989D", type: "money", width: "140px" },
    { key: "rate", label: "\u5E74\u5316", type: "percent", width: "90px" },
    { key: "term", label: "\u671F\u9650(\u6708)", type: "number", width: "100px" },
    { key: "monthly", label: "\u6708\u4F9B", type: "money", width: "120px" },
    { key: "dueDays", label: "\u903E\u671F\u5929\u6570", type: "number", width: "100px" },
    { key: "status", label: "\u72B6\u6001", type: "badge", badgeKind: "green", width: "100px" }
  ];
  const debtRows = cur.loans.map((l) => ({
    id: l.id,
    product: l.product,
    principal: l.principal,
    balance: l.balance,
    rate: l.rate,
    term: l.term,
    monthly: l.monthly,
    dueDays: l.dueDays ?? 0,
    status: { v: l.status, kind: l.status === "\u903E\u671F" ? "red" : l.status === "\u7ED3\u6E05" ? "gray" : "green" }
  }));
  const coDebtCols = [
    { key: "org", label: "\u673A\u6784", type: "text", fixed: "left", width: "200px" },
    { key: "product", label: "\u4EA7\u54C1", type: "text", width: "200px" },
    { key: "balance", label: "\u4F59\u989D", type: "money", width: "140px" },
    { key: "status", label: "\u72B6\u6001", type: "badge", badgeKind: "green", width: "110px" }
  ];
  const coDebtRows = cur.coDebt.orgs.map((o, i) => ({ id: `o${i}`, org: o.org, product: o.product, balance: o.balance, status: { v: o.status, kind: o.status === "\u903E\u671F" ? "red" : o.status === "\u5173\u6CE8" ? "amber" : "green" } }));
  const relNodeMap = useMemo(() => {
    const m = {};
    cur.relationGraph.nodes.forEach((nn) => m[nn.id] = nn);
    return m;
  }, [cur.relationGraph]);
  return /* @__PURE__ */ jsxs("div", { style: { padding: 24, maxWidth: 1360 }, children: [
    /* @__PURE__ */ jsx(
      PageShell,
      {
        title: "\u5355\u5BA2\u8BE6\u60C5",
        crumb: `${CRUMB} / ${cur.name}`,
        actions: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Sam, { label: "\u5355\u5BA2\u6837\u4F8B", value: "custProfileData.ts" }),
          /* @__PURE__ */ jsx(Cal, { label: "\u5B9E\u65F6\u805A\u5408" })
        ] })
      }
    ),
    /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)", gap: 12, alignItems: "stretch", marginBottom: 12 }, children: [
      /* @__PURE__ */ jsxs("div", { style: { border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, background: "#fff" }, children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12 }, children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                style: {
                  width: 52,
                  height: 52,
                  borderRadius: 10,
                  background: "linear-gradient(135deg,#8B5CF6,#D946EF)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  fontWeight: 700
                },
                children: cur.avatarText
              }
            ),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { style: { fontSize: 18, fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: 8 }, children: [
                cur.name,
                " ",
                /* @__PURE__ */ jsx(Badge, { kind: STATUS_KIND[cur.status], children: cur.status })
              ] }),
              /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }, children: cur.tags.map((t) => /* @__PURE__ */ jsx(Badge, { kind: "blue", children: t }, t)) })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { style: { display: "flex", alignItems: "center", gap: 12 }, children: /* @__PURE__ */ jsx(Button, { size: "sm", variant: cur.followed ? "secondary" : "primary", onClick: () => toggleFollowCust(cur.custId), children: cur.followed ? "\u5DF2\u5173\u6CE8" : "\uFF0B \u5173\u6CE8" }) })
        ] }),
        /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: 12, marginTop: 14 }, children: [
          ["\u8EAB\u4EFD\u8BC1\u7167\u7247", "#475569"],
          ["\u8EAB\u4EFD\u8BC1\u5934\u50CF", "#0F766E"],
          ["\u6700\u8FD1\u91C7\u96C6\u7167\u7247", "#7C3AED"]
        ].map(([label, bg]) => /* @__PURE__ */ jsxs("div", { style: { textAlign: "center" }, children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: photoDataUri(label, bg),
              alt: label,
              style: { width: 92, height: 116, borderRadius: 8, border: "1px solid #E2E8F0", objectFit: "cover", display: "block" }
            }
          ),
          /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: "#64748B", marginTop: 4 }, children: label })
        ] }, label)) }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 18, flexWrap: "wrap", marginTop: 6, fontSize: 12, color: "#64748B" }, children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "\u8BC1\u4EF6\u53F7\uFF1A",
            cur.maskedId
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            "\u624B\u673A\u53F7\uFF1A",
            cur.phone
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            "\u6240\u5728\u5730\uFF1A",
            cur.region
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            "\u8FDB\u4EF6\u6E20\u9053\uFF1A",
            cur.channel
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 18, flexWrap: "wrap", marginTop: 6, fontSize: 12, color: "#64748B" }, children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "\u6027\u522B\uFF1A",
            cur.gender
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            "\u5E74\u9F84\uFF1A",
            cur.age,
            " \u5C81"
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            "\u5B66\u5386\uFF1A",
            cur.education
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            "\u5A5A\u59FB\u72B6\u51B5\uFF1A",
            cur.marital
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            "\u5BA2\u6237\u6807\u8BC6\uFF1A",
            cur.custId
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { border: "1px solid #E2E8F0", borderRadius: 12, padding: 12, background: "#fff", display: "flex", flexDirection: "column" }, children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }, children: [
          /* @__PURE__ */ jsx("span", { style: { fontSize: 13, fontWeight: 700, color: "#0F172A" }, children: "\u6A21\u578B\u8BC4\u5206" }),
          /* @__PURE__ */ jsxs("span", { style: { fontSize: 11, color: "#94A3B8" }, children: [
            "\u70B9\u51FB\u5361\u7247\u67E5\u770B\u660E\u7EC6 ",
            /* @__PURE__ */ jsx(Sam, { label: "\u6837\u4F8B", value: "custProfileData.ts" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(ModelScorePanel, { scores: cur.scores, custId: cur.custId })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: 4, borderBottom: "1px solid #E2E8F0", marginBottom: 14, flexWrap: "wrap" }, children: TABS.map((t) => {
      const badge = tabBadge(t, cur);
      return /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setTab(t),
          style: {
            padding: "8px 14px",
            fontSize: 13,
            border: "none",
            background: "none",
            cursor: "pointer",
            color: t === tab ? "#8B5CF6" : "#64748B",
            fontWeight: t === tab ? 700 : 400,
            borderBottom: t === tab ? "2px solid #8B5CF6" : "2px solid transparent",
            marginBottom: -1
          },
          children: [
            t,
            badge && /* @__PURE__ */ jsxs("span", { style: { fontSize: 11, opacity: 0.7, marginLeft: 2 }, children: [
              "\uFF08",
              badge,
              "\uFF09"
            ] })
          ]
        },
        t
      );
    }) }),
    tab === "\u57FA\u672C\u4FE1\u606F" && /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [
      devDanger && /* @__PURE__ */ jsxs("div", { style: { borderRadius: 12, border: "1px solid #FECACA", background: "#FEF2F2", padding: "10px 14px", fontSize: 13, color: "#B91C1C" }, children: [
        "\u26A0 \u73AF\u5883\u98CE\u9669\u5206 ",
        cur.device.envRiskScore,
        "\uFF08",
        cur.device.simulator ? "\u68C0\u6D4B\u5230\u6A21\u62DF\u5668" : "\u504F\u9AD8",
        "\uFF09\uFF0C\u540C\u8BBE\u5907\u5173\u8054 ",
        cur.device.sameDeviceAccounts.length,
        " \u4E2A\u8D26\u53F7\uFF0C\u7591\u4F3C\u56E2\u4F19\u6B3A\u8BC8\u3002"
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }, children: [
        /* @__PURE__ */ jsx(Stat, { label: "\u98CE\u9669\u7B49\u7EA7", value: cur.status, danger: cur.status !== "\u6B63\u5E38" }),
        /* @__PURE__ */ jsx(Stat, { label: "\u6388\u4FE1\u603B\u989D", value: money(cur.creditLimit) }),
        /* @__PURE__ */ jsx(Stat, { label: "\u5DF2\u7528\u989D\u5EA6", value: money(cur.usedLimit) }),
        /* @__PURE__ */ jsx(Stat, { label: "\u5728\u8D37\u4F59\u989D", value: money(cur.totalDebt) }),
        /* @__PURE__ */ jsx(Stat, { label: "\u5F53\u524D\u903E\u671F", value: money(cur.overdueAmt), danger: cur.overdueAmt > 0 }),
        /* @__PURE__ */ jsx(Stat, { label: "\u98CE\u9669\u9884\u8B66", value: `${cur.alerts.length} \u6761`, danger: redCount > 0 }),
        /* @__PURE__ */ jsx(Stat, { label: "\u5171\u503A\u673A\u6784", value: `${cur.coDebt.orgs.length} \u5BB6`, danger: cur.coDebt.orgs.some((o) => o.status === "\u903E\u671F") }),
        /* @__PURE__ */ jsx(Stat, { label: "\u8FD130\u5929\u591A\u5934", value: `${cur.coDebt.applications30d} \u6B21`, danger: cur.coDebt.applications30d >= 5 })
      ] }),
      /* @__PURE__ */ jsxs(Panel, { title: "\u98CE\u9669\u9884\u8B66", desc: /* @__PURE__ */ jsxs("span", { children: [
        "\u8D37\u4E2D\u76D1\u63A7\u547D\u4E2D\u89C4\u5219 \xB7 \u4F18\u5148\u5904\u7F6E\u5165\u53E3 \xB7 ",
        /* @__PURE__ */ jsx(Sam, { value: "custProfileData.ts" })
      ] }), children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }, children: [
          /* @__PURE__ */ jsxs("span", { style: { fontSize: 12, padding: "4px 10px", borderRadius: 999, background: "#FEF2F2", color: "#DC2626" }, children: [
            "\u7EA2 ",
            redCount
          ] }),
          /* @__PURE__ */ jsxs("span", { style: { fontSize: 12, padding: "4px 10px", borderRadius: 999, background: "#FFFBEB", color: "#D97706" }, children: [
            "\u9EC4 ",
            yellowCount
          ] }),
          /* @__PURE__ */ jsxs("span", { style: { fontSize: 12, padding: "4px 10px", borderRadius: 999, background: "#EFF6FF", color: "#2563EB" }, children: [
            "\u5F85\u5904\u7F6E ",
            pendingCount
          ] })
        ] }),
        /* @__PURE__ */ jsx(DataTable, { columns: alertCols, rows: alertRows, empty: "\u65E0\u9884\u8B66\u8BB0\u5F55", pager: true, defaultPageSize: 10 })
      ] }),
      /* @__PURE__ */ jsxs(Panel, { title: "\u57FA\u7840\u6863\u6848", desc: /* @__PURE__ */ jsxs("span", { children: [
        "\u8EAB\u4EFD / \u804C\u4E1A / \u8054\u7CFB \xB7 \u5B57\u6BB5\u7EA7\u5916\u90E8\u6838\u9A8C\u6807\u8BB0 \xB7 ",
        /* @__PURE__ */ jsx(Sam, { value: "custProfileData.ts" })
      ] }), children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }, children: [
          [
            ["\u8EAB\u4EFD\u8BC1\u7167\u7247", "#475569"],
            ["\u8EAB\u4EFD\u8BC1\u5934\u50CF", "#0F766E"],
            ["\u6700\u8FD1\u91C7\u96C6\u7167\u7247", "#7C3AED"]
          ].map(([label, bg]) => /* @__PURE__ */ jsxs("div", { style: { textAlign: "center" }, children: [
            /* @__PURE__ */ jsx("img", { src: photoDataUri(label, bg), alt: label, style: { width: 92, height: 116, borderRadius: 8, border: "1px solid #E2E8F0", objectFit: "cover", display: "block" } }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: "#64748B", marginTop: 4 }, children: label })
          ] }, label)),
          taxShots.map((s, i) => /* @__PURE__ */ jsxs("div", { style: { textAlign: "center" }, children: [
            /* @__PURE__ */ jsx("img", { src: appShotDataUri(s), alt: s.title, style: { width: 92, height: 116, borderRadius: 8, border: "1px solid #E2E8F0", objectFit: "cover", display: "block" } }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: "#64748B", marginTop: 4 }, children: s.title })
          ] }, i))
        ] }),
        /* @__PURE__ */ jsx("div", { style: { fontSize: 13, fontWeight: 600, color: "#475569", margin: "2px 0 8px" }, children: "\u8EAB\u4EFD\u4FE1\u606F" }),
        /* @__PURE__ */ jsx("div", { style: { display: "grid", gridTemplateColumns: fieldCols === 3 ? "1fr 1fr 1fr" : fieldCols === 2 ? "1fr 1fr" : "1fr", gap: "6px 24px", fontSize: 13, marginBottom: 16 }, children: infoDefs.map((def) => {
          const cs = checksByField[def.field];
          return /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #F1F5F9", paddingBottom: 4 }, children: [
            /* @__PURE__ */ jsx("span", { style: { color: "#94A3B8", whiteSpace: "nowrap" }, children: def.label }),
            /* @__PURE__ */ jsxs("span", { style: { color: "#334155", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 2 }, children: [
              def.value,
              cs && /* @__PURE__ */ jsx(VerifyMark, { checks: cs })
            ] })
          ] }, def.field);
        }) }),
        /* @__PURE__ */ jsx("div", { style: { fontSize: 13, fontWeight: 600, color: "#475569", margin: "2px 0 8px" }, children: "\u8054\u7CFB\u65B9\u5F0F" }),
        /* @__PURE__ */ jsx("div", { style: { display: "grid", gridTemplateColumns: fieldCols === 3 ? "1fr 1fr 1fr" : fieldCols === 2 ? "1fr 1fr" : "1fr", gap: "6px 24px", fontSize: 13, marginBottom: 16 }, children: contactDefs.map((def, i) => {
          const cs = def.field ? checksByField[def.field] : void 0;
          if (def.field === "phone") {
            return /* @__PURE__ */ jsxs(
              "div",
              {
                onMouseEnter: () => setPhoneHover(true),
                onMouseLeave: () => setPhoneHover(false),
                style: { position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed #F1F5F9", paddingBottom: 4 },
                children: [
                  /* @__PURE__ */ jsx("span", { style: { color: "#94A3B8", whiteSpace: "nowrap" }, children: def.label }),
                  /* @__PURE__ */ jsxs("span", { style: { color: "#334155", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 6 }, children: [
                    def.value,
                    cur.phones.length > 1 && /* @__PURE__ */ jsxs("span", { style: { fontSize: 11, lineHeight: 1, background: "#EEF2FF", color: "#534AB7", borderRadius: 999, padding: "2px 7px" }, children: [
                      "\u5171 ",
                      cur.phones.length,
                      " \u4E2A"
                    ] })
                  ] }),
                  phoneHover && cur.phones.length > 1 && /* @__PURE__ */ jsxs("div", { style: { position: "absolute", top: "100%", left: 0, marginTop: 6, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, boxShadow: "0 8px 24px rgba(15,23,42,.12)", padding: 10, zIndex: 20, minWidth: 230 }, children: [
                    /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: "#64748B", marginBottom: 6 }, children: "\u5168\u90E8\u624B\u673A\u53F7\uFF08\u8131\u654F \xB7 \u6838\u9A8C\uFF09" }),
                    cur.phones.map((p, j) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, padding: "5px 0", borderBottom: j < cur.phones.length - 1 ? "1px dashed #F1F5F9" : "none" }, children: [
                      /* @__PURE__ */ jsxs("span", { style: { color: "#334155" }, children: [
                        p.number,
                        j === 0 && /* @__PURE__ */ jsx("span", { style: { color: "#94A3B8", fontSize: 11, marginLeft: 4 }, children: "\u4E3B\u53F7" })
                      ] }),
                      /* @__PURE__ */ jsx("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: p.verified ? "#16A34A" : "#D97706" }, children: p.verified ? "\u2713 \u5DF2\u6838\u9A8C" : "\u5F85\u6838" })
                    ] }, j))
                  ] })
                ]
              },
              i
            );
          }
          return /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #F1F5F9", paddingBottom: 4 }, children: [
            /* @__PURE__ */ jsx("span", { style: { color: "#94A3B8", whiteSpace: "nowrap" }, children: def.label }),
            /* @__PURE__ */ jsxs("span", { style: { color: "#334155", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 2, textAlign: "right" }, children: [
              def.value,
              cs && /* @__PURE__ */ jsx(VerifyMark, { checks: cs })
            ] })
          ] }, i);
        }) }),
        /* @__PURE__ */ jsx("div", { style: { fontSize: 13, fontWeight: 600, color: "#475569", margin: "2px 0 8px" }, children: "\u804C\u4E1A\u4E0E\u6536\u5165" }),
        /* @__PURE__ */ jsx("div", { style: { display: "grid", gridTemplateColumns: fieldCols === 3 ? "1fr 1fr 1fr" : fieldCols === 2 ? "1fr 1fr" : "1fr", gap: "6px 24px", fontSize: 13 }, children: jobDefs.map((def) => {
          const cs = checksByField[def.field];
          return /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #F1F5F9", paddingBottom: 4 }, children: [
            /* @__PURE__ */ jsx("span", { style: { color: "#94A3B8", whiteSpace: "nowrap" }, children: def.label }),
            /* @__PURE__ */ jsxs("span", { style: { color: "#334155", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 2 }, children: [
              def.value,
              cs && /* @__PURE__ */ jsx(VerifyMark, { checks: cs })
            ] })
          ] }, def.field);
        }) })
      ] }),
      otherChecks.length > 0 && /* @__PURE__ */ jsx(Panel, { title: "\u5176\u4ED6\u5916\u90E8\u6838\u9A8C", desc: /* @__PURE__ */ jsxs("span", { children: [
        "\u53F8\u6CD5 / \u5DE5\u5546\u7B49\u6E20\u9053\u6838\u9A8C \xB7 \u542B\u6838\u9A8C\u65F6\u95F4 \xB7 \u7B2C\u4E09\u65B9\u6838\u9A8C\u5355\u4F4D \xB7 \u5355\u6B21\u82B1\u8D39 \xB7 ",
        /* @__PURE__ */ jsx(Sam, { value: "custProfileData.ts" })
      ] }), children: /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: otherChecks.map((e, i) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px dashed #F1F5F9", paddingBottom: 8 }, children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
          /* @__PURE__ */ jsx(Badge, { kind: "blue", children: e.source }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { style: { fontSize: 13, color: "#334155", fontWeight: 500 }, children: [
              e.item,
              "\uFF1A",
              e.result
            ] }),
            /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: "#94A3B8" }, children: [
              e.verifyOrg ?? "\u6570\u636E\u6E90\u672A\u6807\u6CE8",
              " \uFF5C ",
              e.verifyTime ?? "\u65F6\u95F4\u672A\u6807\u6CE8",
              e.cost != null && /* @__PURE__ */ jsxs(Fragment, { children: [
                " \uFF5C \u82B1\u8D39 \xA5",
                e.cost
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Badge, { kind: e.status === "\u4E00\u81F4" ? "green" : e.status === "\u5F02\u5E38" ? "red" : "amber", children: e.status })
      ] }, i)) }) }),
      /* @__PURE__ */ jsx(Panel, { title: "\u5B9E\u540D\u4E0E\u8BBE\u5907\u6838\u9A8C", desc: /* @__PURE__ */ jsxs("span", { children: [
        "\u8BBE\u5907\u6307\u7EB9 / \u73AF\u5883\u53CD\u6B3A\u8BC8 \xB7 ",
        /* @__PURE__ */ jsx(Sam, { value: "custProfileData.ts" })
      ] }), children: /* @__PURE__ */ jsx("div", { style: { display: "grid", gridTemplateColumns: fieldCols === 3 ? "1fr 1fr 1fr" : fieldCols === 2 ? "1fr 1fr" : "1fr", gap: "6px 24px", fontSize: 13 }, children: [
        ["\u8BBE\u5907\u53F7", cur.device.device],
        ["\u673A\u578B", cur.device.model],
        ["\u64CD\u4F5C\u7CFB\u7EDF", cur.device.os],
        ["\u5E38\u7528\u767B\u5F55\u5730", cur.device.loginRegion],
        ["\u6700\u8FD1\u767B\u5F55", cur.device.lastLogin],
        ["\u73AF\u5883\u98CE\u9669\u5206", String(cur.device.envRiskScore)],
        ["\u6A21\u62DF\u5668", cur.device.simulator ? "\u662F\uFF08\u98CE\u9669\uFF09" : "\u5426"]
      ].map(([k, v]) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #F1F5F9", paddingBottom: 4 }, children: [
        /* @__PURE__ */ jsx("span", { style: { color: "#94A3B8" }, children: k }),
        /* @__PURE__ */ jsx("span", { style: { color: "#334155", fontWeight: 500 }, children: v })
      ] }, k)) }) }),
      cur.device.sameDeviceAccounts.length > 0 && /* @__PURE__ */ jsx(Panel, { title: "\u540C\u8BBE\u5907\u591A\u8D26\u53F7", desc: /* @__PURE__ */ jsxs("span", { children: [
        "\u540C\u8BBE\u5907\u767B\u5F55\u7684\u5176\u4ED6\u501F\u8D37\u8D26\u53F7 \xB7 ",
        /* @__PURE__ */ jsx(Cal, { label: "\u5B9E\u65F6\u805A\u5408" })
      ] }), children: /* @__PURE__ */ jsx(
        DataTable,
        {
          columns: [{ key: "name", label: "\u59D3\u540D", type: "text", fixed: "left" }, { key: "custId", label: "\u5BA2\u6237\u6807\u8BC6", type: "text" }],
          rows: sameDevRows,
          empty: "\u65E0",
          pager: true,
          defaultPageSize: 8
        }
      ) }),
      /* @__PURE__ */ jsxs(Panel, { title: "\u884C\u4E3A\u753B\u50CF", desc: /* @__PURE__ */ jsxs("span", { children: [
        "\u7528\u4FE1 / \u8FD8\u6B3E / \u67E5\u8BE2 / \u98CE\u9669\u7684\u884C\u4E3A\u7279\u5F81 \xB7 ",
        /* @__PURE__ */ jsx(Cal, { label: "\u5B9E\u65F6\u805A\u5408" })
      ] }), children: [
        dangerBehavior > 0 && /* @__PURE__ */ jsxs("div", { style: { marginBottom: 12, borderRadius: 12, border: "1px solid #FECACA", background: "#FEF2F2", padding: "10px 14px", fontSize: 13, color: "#B91C1C" }, children: [
          "\u26A0 \u547D\u4E2D ",
          dangerBehavior,
          " \u9879\u98CE\u9669\u884C\u4E3A\uFF08\u903E\u671F\u8FD8\u6B3E / \u591A\u5934\u501F\u8D37 / \u591C\u95F4\u7528\u4FE1 / \u989D\u5EA6\u4F7F\u7528\u7387\u8FC7\u9AD8\uFF09\uFF0C\u5EFA\u8BAE\u7ED3\u5408\u98CE\u9669\u9884\u8B66\u8054\u52A8\u5904\u7F6E\u3002"
        ] }),
        /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: 14 }, children: BEHAVIOR_GROUPS.map((g) => {
          const items = cur.behavior.filter((b) => (b.category ?? "\u98CE\u9669") === g.key);
          if (!items.length) return null;
          return /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { style: { fontSize: 13, fontWeight: 600, color: "#475569" }, children: g.title }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: "#94A3B8", margin: "2px 0 8px" }, children: g.desc }),
            /* @__PURE__ */ jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 8 }, children: items.map((it) => /* @__PURE__ */ jsxs(
              "div",
              {
                style: {
                  border: "1px solid #E2E8F0",
                  borderRadius: 8,
                  padding: "8px 10px",
                  background: it.danger ? "#FEF2F2" : "#fff"
                },
                children: [
                  /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
                    /* @__PURE__ */ jsx("span", { style: { fontSize: 12, color: it.danger ? "#DC2626" : "#475569" }, children: it.name }),
                    /* @__PURE__ */ jsx("span", { style: { fontSize: 13, fontWeight: 600, color: it.danger ? "#DC2626" : "#334155" }, children: it.count })
                  ] }),
                  it.desc && /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: "#94A3B8", marginTop: 3 }, children: it.desc })
                ]
              },
              it.name
            )) })
          ] }, g.key);
        }) })
      ] }),
      /* @__PURE__ */ jsxs(Panel, { title: "\u62C5\u4FDD\u4E0E\u7ECF\u8425", desc: /* @__PURE__ */ jsxs("span", { children: [
        "\u62B5\u62BC / \u8D28\u62BC\u7269 + \u7ECF\u8425\u5B9E\u4F53 \xB7 \u542B\u7B2C\u4E09\u65B9\u6838\u9A8C \xB7 ",
        /* @__PURE__ */ jsx(Sam, { value: "custProfileData.ts" })
      ] }), children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8 }, children: "\u62C5\u4FDD\u62B5\u62BC\u7269" }),
        cur.collateralBiz.collateral.length ? /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }, children: [
          cur.collateralBiz.collateral.map((c, i) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: "1px dashed #F1F5F9", paddingBottom: 4 }, children: [
            /* @__PURE__ */ jsxs("span", { style: { color: "#64748B" }, children: [
              c.name,
              "\uFF08",
              c.type,
              "\uFF09"
            ] }),
            /* @__PURE__ */ jsxs("span", { style: { color: "#334155", display: "inline-flex", alignItems: "center", gap: 6 }, children: [
              money(c.value),
              " \xB7 ",
              /* @__PURE__ */ jsx(Badge, { kind: c.status === "\u8BC4\u4F30\u4E2D" ? "amber" : "gray", children: c.status }),
              c.verified != null && /* @__PURE__ */ jsx(Badge, { kind: c.verified ? "green" : "amber", children: c.verified ? "\u5DF2\u6838\u9A8C" : "\u5F85\u6838\u9A8C" })
            ] })
          ] }, i)),
          cur.collateralBiz.collateral.some((c) => c.verifyOrg) && /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: "#94A3B8" }, children: [
            "\u6838\u9A8C\u6765\u6E90\uFF1A",
            cur.collateralBiz.collateral.filter((c) => c.verifyOrg).map((c) => `${c.name}\xB7${c.verifyOrg}${c.verifyTime ? `(${c.verifyTime})` : ""}`).join("\uFF1B")
          ] })
        ] }) : /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: "#94A3B8", marginBottom: 16 }, children: "\u65E0\u62C5\u4FDD\u62B5\u62BC\u7269\uFF08\u7EAF\u4FE1\u7528\u5BA2\u6237\uFF09" }),
        /* @__PURE__ */ jsx("div", { style: { fontSize: 13, fontWeight: 600, color: "#475569", margin: "2px 0 8px" }, children: "\u7ECF\u8425\u5B9E\u4F53" }),
        cur.collateralBiz.business.length ? /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: cur.collateralBiz.business.map((b, i) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: "1px dashed #F1F5F9", paddingBottom: 4 }, children: [
          /* @__PURE__ */ jsx("span", { style: { color: "#64748B" }, children: b.name }),
          /* @__PURE__ */ jsxs("span", { style: { color: "#334155", display: "inline-flex", alignItems: "center", gap: 6 }, children: [
            b.role,
            " \xB7 ",
            /* @__PURE__ */ jsx(Badge, { kind: b.status === "\u5B58\u7EED" ? "green" : "gray", children: b.status }),
            b.verified != null && /* @__PURE__ */ jsx(Badge, { kind: b.verified ? "green" : "amber", children: b.verified ? "\u5DF2\u6838\u9A8C" : "\u5F85\u6838\u9A8C" }),
            b.verifyOrg && /* @__PURE__ */ jsx("span", { style: { fontSize: 11, color: "#94A3B8" }, children: b.verifyOrg })
          ] })
        ] }, i)) }) : /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: "#94A3B8" }, children: "\u65E0\u7ECF\u8425\u5B9E\u4F53" })
      ] }),
      /* @__PURE__ */ jsxs(Panel, { title: "\u8D37\u540E\u98CE\u9669", desc: /* @__PURE__ */ jsxs("span", { children: [
        "\u8D44\u91D1\u6D41\u5411\u76D1\u63A7 + \u9ED1\u540D\u5355\u53CD\u6B3A\u8BC8 \xB7 \u4E0E\u98CE\u9669\u9884\u8B66\u540C\u5C5E\u8D37\u4E2D\u76D1\u63A7 \xB7 ",
        /* @__PURE__ */ jsx(Cal, { label: "\u5B9E\u65F6\u805A\u5408" })
      ] }), children: [
        /* @__PURE__ */ jsx(
          DataTable,
          {
            columns: [
              { key: "date", label: "\u65E5\u671F", type: "text", width: "130px" },
              { key: "direction", label: "\u65B9\u5411", type: "text", width: "80px" },
              { key: "counterparty", label: "\u4EA4\u6613\u5BF9\u624B", type: "text" },
              { key: "amount", label: "\u91D1\u989D", type: "money", width: "140px" },
              { key: "flag", label: "\u6807\u8BB0", type: "badge", badgeKind: "red", width: "140px" }
            ],
            rows: cur.postRisk.fundFlow.map((f, i) => ({ id: `f${i}`, date: f.date, direction: f.direction, counterparty: f.counterparty, amount: f.amount, flag: { v: f.flag, kind: f.flag.includes("\u7591\u4F3C") || f.flag.includes("\u4E0D\u660E") ? "red" : "blue" } })),
            empty: "\u65E0\u8D44\u91D1\u6D41\u5411",
            pager: true,
            defaultPageSize: 8
          }
        ),
        /* @__PURE__ */ jsx("div", { style: { fontSize: 13, fontWeight: 600, color: "#475569", margin: "16px 0 8px" }, children: "\u9ED1\u540D\u5355\u53CD\u6B3A\u8BC8" }),
        cur.postRisk.blacklist.length ? /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: cur.postRisk.blacklist.map((b, i) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: "1px dashed #F1F5F9", paddingBottom: 4 }, children: [
          /* @__PURE__ */ jsxs("span", { style: { color: "#64748B" }, children: [
            b.list,
            "\uFF1A",
            b.hit
          ] }),
          /* @__PURE__ */ jsx(Badge, { kind: b.status === "\u6B63\u5E38" ? "green" : b.status === "\u9AD8\u98CE\u9669" ? "red" : "amber", children: b.status })
        ] }, i)) }) : /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: "#94A3B8" }, children: "\u672A\u547D\u4E2D\u9ED1\u540D\u5355" })
      ] }),
      /* @__PURE__ */ jsx(Panel, { title: "\u64CD\u4F5C\u65E5\u5FD7", desc: /* @__PURE__ */ jsxs("span", { children: [
        "\u5904\u7F6E\u5DE5\u5355 + \u5386\u53F2\u64CD\u4F5C\u8BB0\u5F55 \xB7 ",
        /* @__PURE__ */ jsx(Sam, { value: "custProfileData.ts" })
      ] }), children: /* @__PURE__ */ jsx(Timeline, { items: cur.disposeLog }) })
    ] }),
    tab === "\u592E\u884C\u5F81\u4FE1" && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10, padding: "12px 16px" }, children: [
        /* @__PURE__ */ jsxs("span", { style: { fontSize: 13, color: "#475569" }, children: [
          "\u62A5\u544A\u7F16\u53F7\uFF1A",
          /* @__PURE__ */ jsx("b", { style: { color: "#1E293B" }, children: cur.credit.header.reportNo })
        ] }),
        /* @__PURE__ */ jsxs("span", { style: { fontSize: 13, color: "#475569" }, children: [
          "\u67E5\u8BE2\u65F6\u95F4\uFF1A",
          /* @__PURE__ */ jsx("b", { style: { color: "#1E293B" }, children: cur.credit.header.queryTime })
        ] }),
        /* @__PURE__ */ jsxs("span", { style: { fontSize: 13, color: "#475569" }, children: [
          "\u88AB\u67E5\u8BE2\u8005\uFF1A",
          /* @__PURE__ */ jsx("b", { style: { color: "#1E293B" }, children: cur.credit.header.queriedBy }),
          "\uFF08",
          cur.credit.header.idNo,
          "\uFF09"
        ] }),
        /* @__PURE__ */ jsx("span", { style: { marginLeft: "auto", fontSize: 11, color: "#94A3B8" }, children: "\u6570\u636E\u6765\u6E90\uFF1A\u4EBA\u884C\u5F81\u4FE1\u63A5\u53E3\uFF08\u6837\u4F8B\uFF09" })
      ] }),
      /* @__PURE__ */ jsxs(Panel, { title: "\u4FE1\u606F\u6982\u8981", desc: /* @__PURE__ */ jsxs("span", { children: [
        "\u8D26\u6237\u6570\u6C47\u603B \xB7 ",
        /* @__PURE__ */ jsx(Sam, { value: "custProfileData.ts" })
      ] }), className: "mt-3", children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: "#94A3B8", marginBottom: 8 }, children: "\u2460 \u8D26\u6237\u6570" }),
        /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }, children: [
          /* @__PURE__ */ jsx(SummaryCard, { label: "\u4FE1\u7528\u5361\u8D26\u6237", value: cur.credit.summary.creditCards, unit: "\u4E2A" }),
          /* @__PURE__ */ jsx(SummaryCard, { label: "\u8D37\u6B3E\u7B14\u6570", value: cur.credit.summary.loans, unit: "\u7B14" }),
          /* @__PURE__ */ jsx(SummaryCard, { label: "\u903E\u671F\u8D26\u6237", value: cur.credit.summary.overdueAccounts, unit: "\u4E2A", danger: cur.credit.summary.overdueAccounts > 0 }),
          /* @__PURE__ */ jsx(SummaryCard, { label: "90\u5929\u4EE5\u4E0A\u903E\u671F", value: cur.credit.summary.overdue90Plus, unit: "\u4E2A", danger: cur.credit.summary.overdue90Plus > 0 }),
          /* @__PURE__ */ jsx(SummaryCard, { label: "\u5BF9\u5916\u62C5\u4FDD", value: cur.credit.summary.guaranteeCount, unit: "\u7B14", danger: cur.credit.summary.guaranteeCount > 0 }),
          /* @__PURE__ */ jsx(SummaryCard, { label: "\u76F8\u5173\u8FD8\u6B3E\u8D23\u4EFB", value: cur.credit.summary.relatedRepay, unit: "\u4E2A", danger: cur.credit.summary.relatedRepay > 0 })
        ] }),
        /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: "#94A3B8", margin: "16px 0 8px" }, children: "\u2461 \u91D1\u989D\u7EF4\u5EA6\uFF08\u672A\u7ED3\u6E05\u8D26\u6237\uFF09" }),
        /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }, children: [
          /* @__PURE__ */ jsx(SummaryCard, { label: "\u9996\u7B14\u4E1A\u52A1\u5E74\u4EFD", value: cur.credit.summaryAmount.firstBizYear, unit: "\u5E74" }),
          /* @__PURE__ */ jsx(SummaryCard, { label: "\u6388\u4FE1\u603B\u989D", value: cur.credit.summaryAmount.openCreditLimit, unit: "\u5143" }),
          /* @__PURE__ */ jsx(SummaryCard, { label: "\u4F59\u989D\u5408\u8BA1", value: cur.credit.summaryAmount.usedBalance, unit: "\u5143" }),
          /* @__PURE__ */ jsx(SummaryCard, { label: "\u5355\u6708\u6700\u9AD8\u903E\u671F", value: cur.credit.summaryAmount.maxMonthlyOverdue, unit: "\u5143", danger: cur.credit.summaryAmount.maxMonthlyOverdue > 0 }),
          /* @__PURE__ */ jsx(SummaryCard, { label: "\u6700\u957F\u903E\u671F", value: cur.credit.summaryAmount.longestOverdueMonths, unit: "\u6708", danger: cur.credit.summaryAmount.longestOverdueMonths > 0 })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Panel, { title: "\u8FD1 6 \u6708\u67E5\u8BE2\u8BB0\u5F55", desc: /* @__PURE__ */ jsxs("span", { children: [
        "\u5F81\u4FE1\u67E5\u8BE2\u660E\u7EC6 \xB7 ",
        /* @__PURE__ */ jsx(Sam, { value: "custProfileData.ts" })
      ] }), className: "mt-3", children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: "#94A3B8", marginBottom: 8 }, children: "\u673A\u6784\u67E5\u8BE2" }),
        /* @__PURE__ */ jsx(DataTable, { columns: queryCols, rows: queryRows, empty: "\u65E0\u673A\u6784\u67E5\u8BE2\u8BB0\u5F55", pager: true, defaultPageSize: 8 }),
        /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: "#94A3B8", margin: "16px 0 8px" }, children: "\u672C\u4EBA\u67E5\u8BE2" }),
        cur.credit.selfQueries.length ? /* @__PURE__ */ jsx(DataTable, { columns: selfQueryCols, rows: selfQueryRows, empty: "\u65E0\u672C\u4EBA\u67E5\u8BE2", pager: true, defaultPageSize: 8 }) : /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: "#94A3B8" }, children: "\u65E0\u672C\u4EBA\u67E5\u8BE2\u8BB0\u5F55" })
      ] }),
      /* @__PURE__ */ jsx(Panel, { title: "\u4FE1\u8D37\u8D26\u6237\u660E\u7EC6", desc: /* @__PURE__ */ jsxs("span", { children: [
        "\u4EBA\u884C\u5F81\u4FE1\u8D26\u6237 \xB7 ",
        /* @__PURE__ */ jsx(Sam, { value: "custProfileData.ts" })
      ] }), className: "mt-3", children: /* @__PURE__ */ jsx(DataTable, { columns: acctCols, rows: acctRows, empty: "\u65E0\u4FE1\u8D37\u8D26\u6237", pager: true, defaultPageSize: 8 }) }),
      /* @__PURE__ */ jsx(Panel, { title: "\u6388\u4FE1\u534F\u8BAE\u4FE1\u606F", desc: /* @__PURE__ */ jsxs("span", { children: [
        "\u5FAA\u73AF\u989D\u5EA6\u5171\u4EAB\u534F\u8BAE \xB7 ",
        /* @__PURE__ */ jsx(Sam, { value: "custProfileData.ts" })
      ] }), className: "mt-3", children: /* @__PURE__ */ jsx(DataTable, { columns: agreeCols, rows: agreeRows, empty: "\u65E0\u6388\u4FE1\u534F\u8BAE", pager: true, defaultPageSize: 8 }) }),
      /* @__PURE__ */ jsx(Panel, { title: "\u76F8\u5173\u8FD8\u6B3E\u8D23\u4EFB\uFF08\u5171\u540C\u501F\u6B3E\uFF09", desc: /* @__PURE__ */ jsxs("span", { children: [
        "\u5171\u540C\u501F\u6B3E / \u8FDE\u5E26\u8D23\u4EFB \xB7 ",
        /* @__PURE__ */ jsx(Sam, { value: "custProfileData.ts" })
      ] }), className: "mt-3", children: cur.credit.relatedRepayList.length ? /* @__PURE__ */ jsx(DataTable, { columns: repayCols, rows: repayRows, empty: "\u65E0\u76F8\u5173\u8FD8\u6B3E\u8D23\u4EFB", pager: true, defaultPageSize: 8 }) : /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: "#94A3B8" }, children: "\u65E0\u76F8\u5173\u8FD8\u6B3E\u8D23\u4EFB\u8BB0\u5F55" }) }),
      /* @__PURE__ */ jsx(Panel, { title: "\u516C\u5171\u8BB0\u5F55\u660E\u7EC6", desc: /* @__PURE__ */ jsxs("span", { children: [
        "\u6B20\u7A0E / \u6C11\u4E8B\u5224\u51B3 / \u5F3A\u5236\u6267\u884C / \u884C\u653F\u5904\u7F5A \xB7 ",
        /* @__PURE__ */ jsx(Sam, { value: "custProfileData.ts" })
      ] }), className: "mt-3", children: cur.credit.publicRecords.length ? /* @__PURE__ */ jsx(DataTable, { columns: pubCols, rows: pubRows, empty: "\u65E0\u516C\u5171\u8BB0\u5F55", pager: true, defaultPageSize: 8 }) : /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: "#94A3B8" }, children: "\u65E0\u516C\u5171\u8BB0\u5F55\uFF08\u6B20\u7A0E / \u6C11\u4E8B\u5224\u51B3 / \u5F3A\u5236\u6267\u884C / \u884C\u653F\u5904\u7F5A\uFF09" }) }),
      /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }, children: [
        /* @__PURE__ */ jsx(Panel, { title: "\u5F81\u4FE1\u903E\u671F", desc: /* @__PURE__ */ jsxs("span", { children: [
          "\u5F53\u524D\u5F81\u4FE1\u903E\u671F \xB7 ",
          /* @__PURE__ */ jsx(Cal, { label: "\u5B9E\u65F6\u805A\u5408" })
        ] }), children: /* @__PURE__ */ jsxs("div", { style: { fontSize: 13, color: "#475569" }, children: [
          "\u903E\u671F\u7B14\u6570\uFF1A",
          /* @__PURE__ */ jsx("b", { style: { color: cur.credit.overdue.count > 0 ? "#DC2626" : "#16A34A" }, children: cur.credit.overdue.count }),
          " \u7B14 \uFF5C \u903E\u671F\u91D1\u989D\uFF1A",
          /* @__PURE__ */ jsx("b", { style: { color: cur.credit.overdue.amount > 0 ? "#DC2626" : "#16A34A" }, children: money(cur.credit.overdue.amount) })
        ] }) }),
        /* @__PURE__ */ jsx(Panel, { title: "\u5BF9\u5916\u62C5\u4FDD", desc: /* @__PURE__ */ jsxs("span", { children: [
          "\u62C5\u4FDD\u8D23\u4EFB \xB7 ",
          /* @__PURE__ */ jsx(Sam, { value: "custProfileData.ts" })
        ] }), children: cur.credit.guarantee.length ? /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: cur.credit.guarantee.map((g, i) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: "1px dashed #F1F5F9", paddingBottom: 4 }, children: [
          /* @__PURE__ */ jsx("span", { style: { color: "#64748B" }, children: g.name }),
          /* @__PURE__ */ jsxs("span", { style: { color: "#334155" }, children: [
            money(g.amount),
            " \xB7 ",
            /* @__PURE__ */ jsx(Badge, { kind: g.status === "\u5173\u6CE8" ? "amber" : "gray", children: g.status })
          ] })
        ] }, i)) }) : /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: "#94A3B8" }, children: "\u65E0\u5BF9\u5916\u62C5\u4FDD" }) })
      ] }),
      /* @__PURE__ */ jsx(Panel, { title: "\u6807\u6CE8\u53CA\u58F0\u660E\u4FE1\u606F", desc: /* @__PURE__ */ jsxs("span", { children: [
        "\u672C\u4EBA\u58F0\u660E / \u5F02\u8BAE\u6807\u6CE8 \xB7 ",
        /* @__PURE__ */ jsx(Sam, { value: "custProfileData.ts" })
      ] }), className: "mt-3", children: cur.credit.annotations.length ? /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: cur.credit.annotations.map((a, i) => /* @__PURE__ */ jsxs("div", { style: { borderLeft: `3px solid ${a.type === "\u5F02\u8BAE\u6807\u6CE8" ? "#D97706" : "#2563EB"}`, paddingLeft: 10, background: "#F8FAFC", borderRadius: 6, padding: "8px 10px" }, children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748B", marginBottom: 2 }, children: [
          /* @__PURE__ */ jsx(Badge, { kind: a.type === "\u5F02\u8BAE\u6807\u6CE8" ? "amber" : "blue", children: a.type }),
          /* @__PURE__ */ jsx("span", { children: a.date })
        ] }),
        /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: "#334155" }, children: a.content })
      ] }, i)) }) : /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: "#94A3B8" }, children: "\u65E0\u6807\u6CE8\u53CA\u58F0\u660E\u4FE1\u606F" }) })
    ] }),
    tab === "\u6388\u4FE1\u8D1F\u503A\u4E0E\u5171\u503A" && /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [
      /* @__PURE__ */ jsx(Panel, { title: "\u989D\u5EA6\u4E0E\u8D1F\u503A\u6982\u89C8", desc: /* @__PURE__ */ jsxs("span", { children: [
        "\u672C\u884C\u6388\u4FE1\u4E0E\u5728\u8D37\u603B\u89C8 \xB7 ",
        /* @__PURE__ */ jsx(Cal, { label: "\u5B9E\u65F6\u805A\u5408" })
      ] }), children: /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }, children: [
        /* @__PURE__ */ jsx(SummaryCard, { label: "\u6388\u4FE1\u603B\u989D", value: cur.creditLimit, unit: "\u5143" }),
        /* @__PURE__ */ jsx(SummaryCard, { label: "\u5DF2\u7528\u989D\u5EA6", value: cur.usedLimit, unit: "\u5143", danger: cur.usedLimit / Math.max(cur.creditLimit, 1) > 0.9 }),
        /* @__PURE__ */ jsx(SummaryCard, { label: "\u53EF\u7528\u989D\u5EA6", value: cur.availLimit, unit: "\u5143" }),
        /* @__PURE__ */ jsx(SummaryCard, { label: "\u5728\u8D37\u4F59\u989D", value: cur.totalDebt, unit: "\u5143" }),
        /* @__PURE__ */ jsx(SummaryCard, { label: "\u6708\u4F9B\u5408\u8BA1", value: cur.monthlyPay, unit: "\u5143" }),
        /* @__PURE__ */ jsx(SummaryCard, { label: "\u6700\u5927\u903E\u671F\u5929\u6570", value: cur.overdueDays, unit: "\u5929", danger: cur.overdueDays > 0 }),
        /* @__PURE__ */ jsx(SummaryCard, { label: "\u5F53\u524D\u903E\u671F\u91D1\u989D", value: cur.overdueAmt, unit: "\u5143", danger: cur.overdueAmt > 0 })
      ] }) }),
      /* @__PURE__ */ jsx(Panel, { title: "\u989D\u5EA6\u660E\u7EC6", desc: /* @__PURE__ */ jsxs("span", { children: [
        "\u5404\u4EA7\u54C1\u5DF2\u7528\u989D\u5EA6 \xB7 ",
        /* @__PURE__ */ jsx(Cal, { label: "\u5B9E\u65F6\u805A\u5408" })
      ] }), children: /* @__PURE__ */ jsx(DataTable, { columns: limitCols, rows: limitRows, empty: "\u65E0", pager: true, defaultPageSize: 10 }) }),
      /* @__PURE__ */ jsx(Panel, { title: "\u8D37\u6B3E\u53F0\u8D26", desc: /* @__PURE__ */ jsxs("span", { children: [
        "\u5728\u8D37\u501F\u636E\u660E\u7EC6 \xB7 \u672C\u884C\u6838\u5FC3\u7CFB\u7EDF \xB7 ",
        /* @__PURE__ */ jsx(Sam, { value: "custProfileData.ts" })
      ] }), children: /* @__PURE__ */ jsx(DataTable, { columns: debtCols, rows: debtRows, empty: "\u65E0\u5728\u8D37\u8BB0\u5F55", pager: true, defaultPageSize: 10 }) }),
      /* @__PURE__ */ jsxs(Panel, { title: "\u591A\u5934\u5171\u503A", desc: /* @__PURE__ */ jsxs("span", { children: [
        "\u8DE8\u673A\u6784\u5171\u503A\u660E\u7EC6 \xB7 \u8FD1 30 \u5929\u591A\u5934\u7533\u8BF7 ",
        cur.coDebt.applications30d,
        " \u6B21 \xB7 ",
        /* @__PURE__ */ jsx(Cal, { label: "\u5B9E\u65F6\u805A\u5408" })
      ] }), children: [
        /* @__PURE__ */ jsx(DataTable, { columns: coDebtCols, rows: coDebtRows, empty: "\u65E0\u5171\u503A", pager: true, defaultPageSize: 8 }),
        cur.coDebt.chain.length > 0 && /* @__PURE__ */ jsxs("div", { style: { marginTop: 12 }, children: [
          /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: "#94A3B8", marginBottom: 8 }, children: "\u5171\u503A\u94FE\u6761" }),
          /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: cur.coDebt.chain.map((c, i) => /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: "#334155", borderLeft: "3px solid #DC2626", paddingLeft: 10 }, children: c }, i)) })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Panel, { title: "\u50AC\u6536\u6848\u4EF6", desc: /* @__PURE__ */ jsxs("span", { children: [
        "\u903E\u671F\u50AC\u6536\u8FDB\u5C55 \xB7 ",
        /* @__PURE__ */ jsx(Sam, { value: "custProfileData.ts" })
      ] }), children: cur.collections.length ? /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: cur.collections.map((cs) => /* @__PURE__ */ jsxs("div", { style: { border: "1px solid #E2E8F0", borderRadius: 12, padding: "14px 16px" }, children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 10 }, children: [
          /* @__PURE__ */ jsx("span", { style: { fontSize: 14, fontWeight: 700, color: "#1E293B" }, children: cs.id }),
          /* @__PURE__ */ jsx(Badge, { kind: STAGE_KIND[cs.stage], children: cs.stage }),
          /* @__PURE__ */ jsx("span", { style: { fontSize: 12, color: "#64748B" }, children: cs.product }),
          /* @__PURE__ */ jsx(Badge, { kind: cs.status === "\u59D4\u5916" || cs.status === "\u6838\u9500" ? "red" : cs.status === "\u627F\u8BFA\u8FD8\u6B3E" ? "green" : "blue", children: cs.status }),
          /* @__PURE__ */ jsxs("span", { style: { fontSize: 12, color: "#94A3B8", marginLeft: "auto" }, children: [
            "\u50AC\u6536\u5458 ",
            cs.owner,
            " \uFF5C \u6700\u8FD1\u89E6\u8FBE ",
            cs.lastTouch
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 10 }, children: [
          /* @__PURE__ */ jsxs("div", { style: { background: "#F8FAFC", borderRadius: 8, padding: "8px 10px" }, children: [
            /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: "#94A3B8" }, children: "\u903E\u671F\u91D1\u989D" }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 16, fontWeight: 700, color: "#DC2626" }, children: money(cs.overdueAmt) })
          ] }),
          /* @__PURE__ */ jsxs("div", { style: { background: "#F8FAFC", borderRadius: 8, padding: "8px 10px" }, children: [
            /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: "#94A3B8" }, children: "\u903E\u671F\u5929\u6570" }),
            /* @__PURE__ */ jsxs("div", { style: { fontSize: 16, fontWeight: 700, color: "#1E293B" }, children: [
              cs.overdueDays,
              " \u5929"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { style: { background: "#F8FAFC", borderRadius: 8, padding: "8px 10px" }, children: [
            /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: "#94A3B8" }, children: "\u5E94\u8FD8\u65E5" }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 16, fontWeight: 700, color: "#1E293B" }, children: cs.dueDate })
          ] }),
          /* @__PURE__ */ jsxs("div", { style: { background: "#F8FAFC", borderRadius: 8, padding: "8px 10px" }, children: [
            /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: "#94A3B8" }, children: "\u89E6\u8FBE" }),
            /* @__PURE__ */ jsxs("div", { style: { fontSize: 16, fontWeight: 700, color: "#1E293B" }, children: [
              cs.calls,
              " \u547C / ",
              cs.sms,
              " \u4FE1"
            ] })
          ] })
        ] }),
        cs.notes.length > 0 && /* @__PURE__ */ jsxs("div", { style: { borderTop: "1px dashed #E2E8F0", paddingTop: 8 }, children: [
          /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 4 }, children: "\u50AC\u6536\u8BB0\u5F55" }),
          cs.notes.slice(0, 3).map((n, i) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, fontSize: 12, padding: "3px 0", color: "#334155" }, children: [
            /* @__PURE__ */ jsx("span", { style: { color: "#94A3B8", flexShrink: 0 }, children: n.time }),
            /* @__PURE__ */ jsx("span", { style: { color: "#64748B", flexShrink: 0 }, children: n.who }),
            /* @__PURE__ */ jsx("span", { children: n.what })
          ] }, i))
        ] })
      ] }, cs.id)) }) : /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: "#94A3B8" }, children: "\u8BE5\u5BA2\u6237\u5F53\u524D\u65E0\u50AC\u6536\u6848\u4EF6" }) })
    ] }),
    tab === "\u5173\u7CFB\u7F51\u7EDC" && /* @__PURE__ */ jsx(Panel, { title: "\u5173\u7CFB\u56FE\u8C31", desc: /* @__PURE__ */ jsxs("span", { children: [
      "\u878D\u5408\u8054\u7CFB\u4EBA\u3001\u5171\u503A\u3001\u8D44\u91D1\u3001\u62C5\u4FDD\u3001\u8BBE\u5907\u7B49\u591A\u7EF4\u5173\u7CFB \xB7 \u70B9\u51FB\u8282\u70B9/\u5173\u7CFB\u67E5\u770B\u5C5E\u6027 \xB7 \u53F3\u4FA7\u6E05\u5355\u4E0E\u56FE\u8C31\u8054\u52A8 \xB7 ",
      /* @__PURE__ */ jsx(Sam, { value: "custProfileData.ts" })
    ] }), children: /* @__PURE__ */ jsx(
      RelationGraphView,
      {
        graph: cur.relationGraph,
        theme: relTheme,
        onTheme: setRelTheme,
        sel: relSel,
        onPick: setRelSel,
        nodeMap: relNodeMap
      }
    ) })
  ] });
}
export {
  CustProfile
};
