var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// /tmp/cprof-test/entry.tsx
var import_react5 = __toESM(require("react"));
var import_react_dom2 = __toESM(require("react-dom"));

// src/console/CustProfile.tsx
var import_react4 = require("react");

// src/components/ui.tsx
var import_react2 = require("react");
var import_react_dom = require("react-dom");

// src/console/sourceTagConfig.ts
var import_react = require("react");
var showSourceTags = true;
var listeners = /* @__PURE__ */ new Set();
function emit() {
  listeners.forEach((l) => l());
}
function loadFromDisk() {
  fetch("/api/load-source-tag").then((r) => r.ok ? r.json() : null).then((data2) => {
    if (data2 && typeof data2.showSourceTags === "boolean") {
      if (data2.showSourceTags !== showSourceTags) {
        showSourceTags = data2.showSourceTags;
        emit();
      }
    } else {
      saveToDisk(true);
    }
  }).catch(() => {
  });
}
function saveToDisk(v) {
  fetch("/api/save-source-tag", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ showSourceTags: v })
  }).catch(() => {
  });
}
loadFromDisk();
function getShowSourceTags() {
  return showSourceTags;
}
function subscribe(cb) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
function useShowSourceTags() {
  return (0, import_react.useSyncExternalStore)(subscribe, getShowSourceTags, getShowSourceTags);
}

// src/console/SourceTag.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var tagS = {
  display: "inline-block",
  fontSize: 9,
  fontFamily: "monospace",
  padding: "0 3px",
  borderRadius: 2,
  marginLeft: 3,
  verticalAlign: "middle",
  lineHeight: "14px",
  fontWeight: 400,
  whiteSpace: "nowrap"
};
var KIND_META = {
  cfg: { label: "\u914D\u7F6EJSON", bg: "#DBEAFE", fg: "#1D4ED8", bd: "#93C5FD" },
  sample: { label: "\u6837\u4F8BJSON", bg: "#FFF7ED", fg: "#C2410C", bd: "#FDBA74" },
  calc: { label: "\u5B9E\u65F6\u8BA1\u7B97", bg: "#F3F4F6", fg: "#6B7280", bd: "#D1D5DB" }
};
function SourceTag({ kind, label, value }) {
  if (!useShowSourceTags()) return null;
  const m = KIND_META[kind];
  const showLabel = label && label !== m.label ? `\xB7${label}` : "";
  const text = `${m.label}${showLabel}${value !== void 0 ? `:${value}` : ""}`;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "span",
    {
      style: {
        ...tagS,
        background: m.bg,
        color: m.fg,
        border: `1px solid ${m.bd}`
      },
      title: `\u6570\u636E\u6765\u6E90\uFF1A${m.label}${showLabel}`,
      children: text
    }
  );
}
var Cfg = (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceTag, { kind: "cfg", ...props });
var Sam = (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceTag, { kind: "sample", ...props });
var Cal = (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceTag, { kind: "calc", ...props });
function SourceTagLegend() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 10, alignItems: "center", margin: "8px 0 16px", fontSize: 11, color: "#94A3B8" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { fontWeight: 500, color: "#64748B" }, children: "\u6570\u636E\u6765\u6E90\uFF1A" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cfg, {}),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sam, {}),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cal, {}),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { marginLeft: 2 }, children: "\uFF08\u84DD=\u914D\u7F6EJSON \uFF5C \u6A58=\u6837\u4F8BJSON \uFF5C \u7070=\u5B9E\u65F6\u8BA1\u7B97\uFF09" })
  ] });
}

// src/components/ui.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function PageHeader({
  title,
  subtitle,
  actions,
  crumb
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "sticky top-14 z-30 -mx-4 border-b border-slate-100 bg-slate-50 px-4 pb-5 pt-1 lg:-mx-8 lg:px-8", children: [
    crumb && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "text-xs text-slate-400", children: crumb }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "mt-2 flex flex-wrap items-start justify-between gap-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h1", { className: "text-2xl font-bold tracking-tight text-ink-900", children: title }),
        subtitle && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-500", children: subtitle })
      ] }),
      actions && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "flex flex-wrap items-center gap-2", children: actions })
    ] })
  ] });
}
function Panel({
  title,
  desc,
  note,
  actions,
  children,
  id,
  className = "",
  hoverTip
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("section", { id, className: `scroll-mt-24 rounded-2xl border border-slate-100 bg-white p-5 shadow-card ${className}`, children: [
    (title || actions) && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "mb-4 flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center gap-1.5", children: [
          title && (typeof title === "string" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h3", { className: "text-base font-semibold text-ink-900", children: title }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h3", { className: "text-base font-semibold text-ink-900", children: title })),
          hoverTip && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "group relative inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-400", children: [
            "?",
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "pointer-events-none absolute left-1/2 top-full z-40 mt-1.5 w-52 -translate-x-1/2 whitespace-normal rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs font-normal leading-relaxed text-slate-600 opacity-0 shadow-lg transition-opacity group-hover:opacity-100", children: hoverTip })
          ] })
        ] }),
        desc && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "mt-0.5 text-xs text-slate-400", children: desc })
      ] }),
      actions
    ] }),
    note && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "mb-4 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3 text-xs leading-relaxed text-brand-800", children: [
      "\u{1F4A1} ",
      note
    ] }),
    children
  ] });
}
function StatCard({
  label,
  value,
  delta,
  deltaType,
  hint,
  accent = "brand"
}) {
  const accents = {
    brand: "text-brand-600",
    cyan: "text-cyan-600",
    violet: "text-violet-600",
    amber: "text-amber-600",
    emerald: "text-emerald-600",
    rose: "text-rose-600"
  };
  const deltaColor = deltaType === "up" ? "text-emerald-600" : deltaType === "down" ? "text-rose-600" : "text-slate-400";
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "rounded-2xl border border-slate-100 bg-white p-5 shadow-card", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "text-sm text-slate-500", children: label }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: `mt-2 text-3xl font-bold tabular-nums ${accents[accent]}`, children: value }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "mt-1.5 flex items-center gap-2 text-xs", children: [
      delta && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: `font-medium ${deltaColor}`, children: delta }),
      hint && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "text-slate-400", children: hint })
    ] })
  ] });
}
var badgeStyles = {
  red: "bg-rose-50 text-rose-700 ring-rose-200",
  orange: "bg-orange-50 text-orange-700 ring-orange-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  blue: "bg-brand-50 text-brand-700 ring-brand-200",
  cyan: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
  gray: "bg-slate-100 text-slate-600 ring-slate-200"
};
function Badge({ kind = "gray", children, className }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${badgeStyles[kind]} ${className ?? ""}`, children });
}
function ProgressBar({ value, color = "bg-brand-500" }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "h-1.5 w-full overflow-hidden rounded-full bg-slate-100", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: `h-full rounded-full ${color}`, style: { width: `${Math.min(100, Math.max(0, value))}%` } }) });
}
function DataTable({
  columns,
  rows,
  empty = "\u6682\u65E0\u6570\u636E",
  clickableKey,
  onCellClick,
  actions,
  pager = false,
  defaultPageSize = 20,
  pageSizeOptions = [10, 20, 50, 100]
}) {
  const [page, setPage] = (0, import_react2.useState)(1);
  const [ps, setPs] = (0, import_react2.useState)(defaultPageSize);
  const actionsRef = (0, import_react2.useRef)(null);
  const [actionsW, setActionsW] = (0, import_react2.useState)(0);
  (0, import_react2.useLayoutEffect)(() => {
    if (actionsRef.current) setActionsW(actionsRef.current.offsetWidth);
  }, [actions, rows]);
  const total = rows.length;
  const totalPages = pager ? Math.max(1, Math.ceil(total / ps)) : 1;
  const curPage = pager ? Math.min(page, totalPages) : 1;
  const view = pager ? rows.slice((curPage - 1) * ps, curPage * ps) : rows;
  (0, import_react2.useEffect)(() => {
    setPage(1);
  }, [rows, ps]);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "overflow-x-auto", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("table", { className: "w-full border-collapse text-sm", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("tr", { className: "border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-400", children: [
        columns.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "th",
          {
            className: `whitespace-nowrap px-3 py-3 bg-white ${c.fixed === "left" || i === 0 ? "sticky left-0 z-20" : ""} ${c.fixed === "right" ? "sticky z-20" : ""}`,
            style: { width: c.width, textAlign: c.align ?? "left", ...c.fixed === "right" ? { right: actionsW } : {} },
            children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: c.label }),
              c.tag && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ColumnTag, { tag: c.tag })
            ] })
          },
          c.key
        )),
        actions && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("th", { ref: actionsRef, className: "whitespace-nowrap px-3 py-3 bg-white sticky right-0 z-20 text-left", children: "\u64CD\u4F5C" })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("tbody", { children: view.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("td", { colSpan: columns.length + (actions ? 1 : 0), className: "px-3 py-10 text-center text-sm text-slate-400", children: empty }) }) : view.map((r) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("tr", { className: "group border-b border-slate-50 transition hover:bg-slate-50/60", children: [
        columns.map((c, i) => {
          const clickable = !!clickableKey && c.key === clickableKey;
          return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "td",
            {
              className: `whitespace-nowrap px-3 py-3 text-slate-600 ${c.fixed === "left" || i === 0 ? "sticky left-0 z-10 bg-white group-hover:bg-slate-50/60" : ""} ${c.fixed === "right" ? "sticky z-10 bg-white group-hover:bg-slate-50/60" : ""}`,
              style: { textAlign: c.align ?? "left", ...c.fixed === "right" ? { right: actionsW } : {} },
              children: clickable ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                "button",
                {
                  type: "button",
                  onClick: () => onCellClick?.(r),
                  className: "font-medium text-brand-600 hover:underline",
                  children: renderCell(r, c)
                }
              ) : renderCell(r, c)
            },
            c.key
          );
        }),
        actions && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("td", { className: "whitespace-nowrap px-3 py-3 text-left sticky right-0 z-10 bg-white group-hover:bg-slate-50/60", children: actions(r) })
      ] }, r.id)) })
    ] }) }),
    pager && total > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "\u6BCF\u9875\u663E\u793A" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "select",
          {
            value: ps,
            onChange: (e) => setPs(Number(e.target.value)),
            style: { height: 30, border: "1px solid #CBD5E1", borderRadius: 6, padding: "0 6px", fontSize: 12, background: "#fff" },
            children: pageSizeOptions.map((o) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("option", { value: o, children: [
              o,
              " \u884C"
            ] }, o))
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { children: [
          "\u5171 ",
          total,
          " \u6761"
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { children: [
          "\u7B2C ",
          curPage,
          " / ",
          totalPages,
          " \u9875"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "button",
          {
            type: "button",
            disabled: curPage <= 1,
            onClick: () => setPage(curPage - 1),
            style: { padding: "4px 10px", borderRadius: 6, border: "1px solid #E2E8F0", background: curPage <= 1 ? "#F1F5F9" : "#fff", color: curPage <= 1 ? "#94A3B8" : "#334155", cursor: curPage <= 1 ? "not-allowed" : "pointer" },
            children: "\u4E0A\u4E00\u9875"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "button",
          {
            type: "button",
            disabled: curPage >= totalPages,
            onClick: () => setPage(curPage + 1),
            style: { padding: "4px 10px", borderRadius: 6, border: "1px solid #E2E8F0", background: curPage >= totalPages ? "#F1F5F9" : "#fff", color: curPage >= totalPages ? "#94A3B8" : "#334155", cursor: curPage >= totalPages ? "not-allowed" : "pointer" },
            children: "\u4E0B\u4E00\u9875"
          }
        )
      ] })
    ] })
  ] });
}
function ColumnTag({ tag }) {
  if (!tag) return null;
  if (typeof tag === "string") return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(SourceTag, { kind: tag });
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(SourceTag, { kind: tag.kind, value: tag.value });
}
function renderCell(r, c) {
  const v = r[c.key];
  const t = c.type ?? "text";
  if (c.render) return c.render(r);
  if (typeof v === "object" && v !== null && "kind" in v && "v" in v) {
    const b = v;
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Badge, { kind: b.kind ?? "gray", children: b.v });
  }
  if (t === "badge") {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Badge, { kind: c.badgeKind ?? "gray", children: v });
  }
  if (t === "progress")
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ProgressBar, { value: Number(v), color: c.progressColor ?? "bg-brand-500" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "w-10 text-right text-xs tabular-nums text-slate-500", children: [
        v,
        "%"
      ] })
    ] });
  if (t === "money") return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "tabular-nums text-slate-700", children: [
    "\xA5",
    v.toLocaleString()
  ] });
  if (t === "number") return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "tabular-nums text-slate-700", children: v });
  if (t === "percent") return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "tabular-nums text-slate-700", children: [
    v,
    "%"
  ] });
  if (t === "score") return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "font-semibold tabular-nums text-ink-900", children: v });
  if (t === "mask-name" || t === "mask-id" || t === "mask-phone") return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "font-mono text-slate-700", children: v });
  if (t === "datetime") return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "text-slate-500", children: v });
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "text-slate-700", children: v });
}
function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...rest
}) {
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700",
    secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100"
  };
  const sizes = {
    sm: "px-2.5 py-1.5 text-xs",
    md: "px-3.5 py-2 text-sm"
  };
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    "button",
    {
      ...rest,
      className: `inline-flex items-center gap-1.5 rounded-lg font-medium transition ${sizes[size]} ${variants[variant]} ${className}`
    }
  );
}

// src/console/PageShell.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
function PageShell({
  title,
  subtitle,
  crumb,
  actions,
  header,
  legend = true
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
    header ?? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(PageHeader, { title: title ?? "", subtitle, crumb, actions }),
    legend && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(SourceTagLegend, {})
  ] });
}

// src/console/custProfileData.ts
var import_react3 = require("react");
var SEED_CUST = {
  customers: [
    {
      custId: "CUST-100237",
      name: "\u5F20\u660E\u8FDC",
      maskedId: "3301**********1234",
      status: "\u6B63\u5E38",
      tags: ["\u4F18\u8D28\u5BA2\u6237", "\u989D\u5EA6\u5185\u7528\u4FE1"],
      avatarText: "\u5F20",
      gender: "\u7537",
      age: 34,
      channel: "APP \u81EA\u4E3B\u8FDB\u4EF6",
      region: "\u6D59\u6C5F\u7701\u676D\u5DDE\u5E02",
      occupation: "\u8F6F\u4EF6\u5DE5\u7A0B\u5E08",
      employer: "\u676D\u5DDE\u4E91\u7B97\u79D1\u6280\u6709\u9650\u516C\u53F8",
      income: 28e3,
      incomeProof: "\u793E\u4FDD + \u4E2A\u7A0E app \u622A\u5C4F",
      education: "\u672C\u79D1",
      marital: "\u5DF2\u5A5A",
      phone: "138****6621",
      creditLimit: 2e5,
      usedLimit: 86e3,
      availLimit: 114e3,
      annualRate: 11.8,
      totalDebt: 86e3,
      monthlyPay: 2680,
      overdueDays: 0,
      overdueAmt: 0,
      loans: [
        { id: "LN-88231", product: "\u968F\u501F\u968F\u8FD8\xB7\u6D88\u8D39\u8D37", principal: 1e5, balance: 56e3, rate: 11.8, term: 36, monthly: 0, status: "\u6B63\u5E38" },
        { id: "LN-90115", product: "\u73B0\u91D1\u5206\u671F\xB7\u6559\u80B2", principal: 5e4, balance: 3e4, rate: 12.6, term: 24, monthly: 2680, status: "\u6B63\u5E38" }
      ],
      behavior: [
        { name: "\u7528\u4FE1\u7B14\u6570", count: 42 },
        { name: "\u63D0\u524D\u8FD8\u6B3E", count: 3 },
        { name: "\u6B63\u5E38\u8FD8\u6B3E", count: 39 },
        { name: "\u903E\u671F\u8FD8\u6B3E", count: 0, danger: true },
        { name: "\u673A\u6784\u67E5\u8BE2", count: 6 },
        { name: "\u591A\u5934\u501F\u8D37", count: 1, danger: true },
        { name: "\u591C\u95F4\u7528\u4FE1", count: 8 },
        { name: "\u989D\u5EA6\u4F7F\u7528\u7387", count: 43 }
      ],
      alerts: [
        { id: "AL-2026-0312", rule: "\u989D\u5EA6\u4F7F\u7528\u7387\u8D85 40% \u6301\u7EED 60 \u5929", level: "\u84DD", date: "2026-07-28", desc: "\u5BA2\u6237\u989D\u5EA6\u4F7F\u7528\u7387\u957F\u671F\u504F\u9AD8\uFF0C\u5173\u6CE8\u518D\u878D\u8D44\u503E\u5411", status: "\u5DF2\u95ED\u73AF" },
        { id: "AL-2026-0288", rule: "\u8FD1 90 \u5929\u673A\u6784\u67E5\u8BE2 \u2265 5", level: "\u9EC4", date: "2026-06-15", desc: "\u67E5\u8BE2\u6B21\u6570\u504F\u591A\uFF0C\u5B58\u5728\u591A\u5934\u7533\u8BF7\u8FF9\u8C61", status: "\u5904\u7F6E\u4E2D" }
      ],
      contacts: [
        { id: "CT-01", name: "\u674E\u82B8", relation: "\u914D\u5076", phone: "139****2048", coDebt: true },
        { id: "CT-02", name: "\u5F20\u5EFA\u56FD", relation: "\u7D27\u6025\u8054\u7CFB\u4EBA", phone: "137****7711" },
        { id: "CT-03", name: "\u5173\u8054\u8D26\u6237\xB7\u5FAE\u4FE1", relation: "\u5173\u8054\u8D26\u6237", phone: "wxid_****m9k2" }
      ],
      scores: {
        zhiCha: {
          name: "\u667A\u5BDF\uFF08\u53CD\u6B3A\u8BC8\uFF09",
          score: 892,
          level: "\u4F18",
          factors: [
            { name: "\u8BBE\u5907\u73AF\u5883", impact: "\u6B63\u9762", detail: "\u5E38\u7528\u8BBE\u5907\u4E00\u81F4\uFF0C\u65E0\u6A21\u62DF\u5668" },
            { name: "\u7533\u8BF7\u884C\u4E3A", impact: "\u6B63\u9762", detail: "\u65E0\u5F02\u5E38\u9AD8\u9891\u7533\u8BF7" },
            { name: "\u9ED1\u7070\u540D\u5355", impact: "\u6B63\u9762", detail: "\u65E0\u547D\u4E2D" }
          ]
        },
        zhiXin: {
          name: "\u667A\u4FE1\uFF08\u4FE1\u7528\uFF09",
          score: 768,
          level: "\u826F",
          factors: [
            { name: "\u5386\u53F2\u8FD8\u6B3E", impact: "\u6B63\u9762", detail: "\u5386\u53F2 39 \u6B21\u6B63\u5E38\u8FD8\u6B3E" },
            { name: "\u8D1F\u503A\u6BD4", impact: "\u4E2D\u6027", detail: "DTI \u5904\u4E8E\u4E2D\u7B49\u6C34\u5E73" },
            { name: "\u67E5\u8BE2\u5BC6\u5EA6", impact: "\u8D1F\u9762", detail: "\u8FD1 90 \u5929\u67E5\u8BE2 6 \u6B21\u504F\u591A" }
          ]
        },
        zhiRong: {
          name: "\u667A\u878D\uFF08\u7EFC\u5408\uFF09",
          score: 815,
          level: "\u826F",
          factors: [
            { name: "\u6536\u5165\u7A33\u5B9A\u6027", impact: "\u6B63\u9762", detail: "\u5728\u804C\u7A33\u5B9A\uFF0C\u793E\u4FDD\u8FDE\u7EED" },
            { name: "\u989D\u5EA6\u4F7F\u7528\u7387", impact: "\u8D1F\u9762", detail: "\u4F7F\u7528\u7387 43% \u957F\u671F\u504F\u9AD8" },
            { name: "\u7EFC\u5408\u7A33\u5B9A\u6027", impact: "\u6B63\u9762", detail: "\u65E0\u903E\u671F\u8BB0\u5F55" }
          ]
        },
        limitSuggest: { suggested: 2e5, current: 2e5, note: "\u7EF4\u6301\u5F53\u524D\u6388\u4FE1\uFF0C\u5173\u6CE8\u989D\u5EA6\u4F7F\u7528\u7387\u8D8B\u52BF" }
      },
      credit: {
        recentQueries: [
          { org: "\u672C\u884C", date: "2026-07-12", type: "\u8D37\u540E\u7BA1\u7406" },
          { org: "\u62DB\u5546\u94F6\u884C", date: "2026-06-15", type: "\u4FE1\u7528\u5361\u5BA1\u6279" },
          { org: "\u8682\u8681\u6D88\u91D1", date: "2026-05-20", type: "\u8D37\u6B3E\u5BA1\u6279" }
        ],
        accounts: [
          { type: "\u4F4F\u623F\u8D37\u6B3E", bank: "\u5DE5\u5546\u94F6\u884C", balance: 12e5, status: "\u6B63\u5E38" },
          { type: "\u4FE1\u7528\u5361", bank: "\u62DB\u5546\u94F6\u884C", balance: 18e3, status: "\u6B63\u5E38" },
          { type: "\u6D88\u8D39\u8D37", bank: "\u672C\u884C", balance: 86e3, status: "\u6B63\u5E38" }
        ],
        overdue: { count: 0, amount: 0 },
        guarantee: []
      },
      device: {
        device: "iPhone 15 Pro",
        model: "iPhone15,3",
        os: "iOS 17.4",
        envRiskScore: 8,
        simulator: false,
        sameDeviceAccounts: [],
        loginRegion: "\u6D59\u6C5F\u7701\u676D\u5DDE\u5E02",
        lastLogin: "2026-08-09 21:34"
      },
      externalChecks: [
        { source: "\u5DE5\u5546", item: "\u540D\u4E0B\u4F01\u4E1A", result: "\u65E0\u5173\u8054\u4F01\u4E1A", status: "\u4E00\u81F4" },
        { source: "\u53F8\u6CD5", item: "\u6D89\u8BC9\u67E5\u8BE2", result: "\u65E0\u672A\u7ED3\u6848\u4EF6", status: "\u4E00\u81F4" },
        { source: "\u7A0E\u52A1", item: "\u4E2A\u7A0E\u7F34\u7EB3", result: "\u8FDE\u7EED\u7F34\u7EB3 36 \u4E2A\u6708", status: "\u4E00\u81F4" },
        { source: "\u793E\u4FDD\u516C\u79EF\u91D1", item: "\u793E\u4FDD\u72B6\u6001", result: "\u5728\u7F34\u3001\u57FA\u6570\u6B63\u5E38", status: "\u4E00\u81F4" }
      ],
      collateralBiz: { collateral: [], business: [] },
      relationGraph: {
        nodes: [
          { id: "self", name: "\u5F20\u660E\u8FDC", type: "person", rel: "\u672C\u4EBA" },
          { id: "spouse", name: "\u674E\u82B8", type: "person", rel: "\u914D\u5076", openAlerts: 0 },
          { id: "ec", name: "\u5F20\u5EFA\u56FD", type: "person", rel: "\u7D27\u6025\u8054\u7CFB\u4EBA" },
          { id: "emp", name: "\u676D\u5DDE\u4E91\u7B97\u79D1\u6280", type: "company", rel: "\u4EFB\u804C\u5355\u4F4D" }
        ],
        edges: [
          { source: "self", target: "spouse", rel: "\u914D\u5076" },
          { source: "self", target: "ec", rel: "\u7D27\u6025\u8054\u7CFB\u4EBA" },
          { source: "self", target: "emp", rel: "\u4EFB\u804C" }
        ]
      },
      coDebt: {
        applications30d: 1,
        orgs: [{ org: "\u672C\u884C", product: "\u6D88\u8D39\u8D37", balance: 86e3, status: "\u5728\u8D37" }],
        chain: ["\u672C\u884C\u6D88\u8D39\u8D37 \u2192 \u672C\u884C\u6559\u80B2\u5206\u671F\uFF08\u540C\u4E00\u5BA2\u6237\uFF09"]
      },
      collections: [],
      postRisk: {
        fundFlow: [
          { date: "2026-08-05", direction: "\u51FA", counterparty: "\u676D\u5DDE\u4E91\u7B97\u79D1\u6280", amount: 28e3, flag: "\u5DE5\u8D44\u5165\u8D26" },
          { date: "2026-08-06", direction: "\u51FA", counterparty: "\u623F\u8D37\u6263\u6B3E", amount: 6800, flag: "\u6B63\u5E38\u8FD8\u6B3E" }
        ],
        blacklist: [{ list: "\u672C\u884C\u9ED1\u540D\u5355", hit: "\u672A\u547D\u4E2D", status: "\u6B63\u5E38" }]
      },
      disposeLog: [
        { time: "2026-07-28 10:12", kind: "op", title: "\u989D\u5EA6\u4F7F\u7528\u7387\u9884\u8B66\u95ED\u73AF", sub: "\u7CFB\u7EDF\u81EA\u52A8\u590D\u6838\u540E\u5173\u95ED" },
        { time: "2026-06-15 14:30", kind: "task", title: "\u67E5\u8BE2\u504F\u591A\u6838\u67E5", sub: "\u5DF2\u6838\u67E5\u4E3A\u6B63\u5E38\u4FE1\u8D37\u9700\u6C42", status: "\u5DF2\u95ED\u73AF" }
      ],
      followed: false
    },
    {
      custId: "CUST-100891",
      name: "\u9648\u6653\u6960",
      maskedId: "4401**********5566",
      status: "\u903E\u671F",
      tags: ["\u5171\u503A\u5ACC\u7591", "\u8D37\u4E2D\u9884\u8B66"],
      avatarText: "\u9648",
      gender: "\u5973",
      age: 29,
      channel: "\u5408\u4F5C\u6E20\u9053\xB7H5",
      region: "\u5E7F\u4E1C\u7701\u6DF1\u5733\u5E02",
      occupation: "\u81EA\u7531\u804C\u4E1A",
      employer: "\u4E2A\u4F53\u7ECF\u8425\uFF08\u7535\u5546\uFF09",
      income: 15e3,
      incomeProof: "\u6D41\u6C34 + \u7ECF\u8425\u8BC1\u660E",
      education: "\u5927\u4E13",
      marital: "\u672A\u5A5A",
      phone: "159****3380",
      creditLimit: 12e4,
      usedLimit: 118e3,
      availLimit: 2e3,
      annualRate: 15.4,
      totalDebt: 118e3,
      monthlyPay: 6120,
      overdueDays: 23,
      overdueAmt: 6120,
      loans: [
        { id: "LN-77320", product: "\u5927\u989D\u5206\u671F\xB7\u7ECF\u8425", principal: 8e4, balance: 71e3, rate: 15.4, term: 24, monthly: 4120, status: "\u903E\u671F", dueDays: 23 },
        { id: "LN-79002", product: "\u968F\u501F\u968F\u8FD8\xB7\u6D88\u8D39\u8D37", principal: 6e4, balance: 47e3, rate: 16.8, term: 12, monthly: 2e3, status: "\u903E\u671F", dueDays: 11 }
      ],
      behavior: [
        { name: "\u7528\u4FE1\u7B14\u6570", count: 71 },
        { name: "\u63D0\u524D\u8FD8\u6B3E", count: 0 },
        { name: "\u6B63\u5E38\u8FD8\u6B3E", count: 14 },
        { name: "\u903E\u671F\u8FD8\u6B3E", count: 9, danger: true },
        { name: "\u673A\u6784\u67E5\u8BE2", count: 19 },
        { name: "\u591A\u5934\u501F\u8D37", count: 6, danger: true },
        { name: "\u591C\u95F4\u7528\u4FE1", count: 33, danger: true },
        { name: "\u989D\u5EA6\u4F7F\u7528\u7387", count: 98, danger: true }
      ],
      alerts: [
        { id: "AL-2026-0401", rule: "\u8FDE\u7EED\u903E\u671F \u2265 20 \u5929", level: "\u7EA2", date: "2026-08-02", desc: "\u4E3B\u501F\u4EA7\u54C1\u903E\u671F\u8D85 20 \u5929\uFF0C\u89E6\u53D1\u7EA2\u706F\u9884\u8B66", status: "\u5F85\u5904\u7F6E" },
        { id: "AL-2026-0388", rule: "\u591A\u5934\u501F\u8D37 \u2265 5 \u5BB6\u673A\u6784", level: "\u7EA2", date: "2026-07-22", desc: "\u8DE8\u673A\u6784\u501F\u8D37\u96C6\u4E2D\uFF0C\u5171\u503A\u98CE\u9669\u9AD8", status: "\u5904\u7F6E\u4E2D" },
        { id: "AL-2026-0355", rule: "\u989D\u5EA6\u4F7F\u7528\u7387 \u2265 95%", level: "\u9EC4", date: "2026-07-05", desc: "\u989D\u5EA6\u8FD1\u4E4E\u7528\u6EE1\uFF0C\u518D\u878D\u8D44\u7A7A\u95F4\u6781\u4F4E", status: "\u5DF2\u95ED\u73AF" }
      ],
      contacts: [
        { id: "CT-01", name: "\u738B\u6D69", relation: "\u7D27\u6025\u8054\u7CFB\u4EBA", phone: "186****9920" },
        { id: "CT-02", name: "\u5173\u8054\u8D26\u6237\xB7\u652F\u4ED8\u5B9D", relation: "\u5173\u8054\u8D26\u6237", phone: "2088****3321" },
        { id: "CT-03", name: "\u5468\u654F", relation: "\u5171\u503A\u5173\u8054", phone: "150****6644", coDebt: true },
        { id: "CT-04", name: "\u5218\u6D0B", relation: "\u5171\u503A\u5173\u8054", phone: "133****1187", coDebt: true }
      ],
      scores: {
        zhiCha: {
          name: "\u667A\u5BDF\uFF08\u53CD\u6B3A\u8BC8\uFF09",
          score: 412,
          level: "\u5DEE",
          factors: [
            { name: "\u8BBE\u5907\u73AF\u5883", impact: "\u8D1F\u9762", detail: "\u68C0\u6D4B\u5230\u6A21\u62DF\u5668\u8FD0\u884C" },
            { name: "\u540C\u8BBE\u5907\u591A\u8D26\u53F7", impact: "\u8D1F\u9762", detail: "\u540C\u8BBE\u5907\u5173\u8054 3 \u4E2A\u501F\u8D37\u8D26\u53F7" },
            { name: "\u9ED1\u7070\u540D\u5355", impact: "\u8D1F\u9762", detail: "\u547D\u4E2D\u7070\u540D\u5355" }
          ]
        },
        zhiXin: {
          name: "\u667A\u4FE1\uFF08\u4FE1\u7528\uFF09",
          score: 388,
          level: "\u5DEE",
          factors: [
            { name: "\u5386\u53F2\u8FD8\u6B3E", impact: "\u8D1F\u9762", detail: "\u8FD1 6 \u6708\u903E\u671F 9 \u6B21" },
            { name: "\u8D1F\u503A\u6BD4", impact: "\u8D1F\u9762", detail: "DTI \u8D85 100%" },
            { name: "\u67E5\u8BE2\u5BC6\u5EA6", impact: "\u8D1F\u9762", detail: "\u8FD1 90 \u5929\u67E5\u8BE2 19 \u6B21" }
          ]
        },
        zhiRong: {
          name: "\u667A\u878D\uFF08\u7EFC\u5408\uFF09",
          score: 351,
          level: "\u5DEE",
          factors: [
            { name: "\u6536\u5165\u7A33\u5B9A\u6027", impact: "\u8D1F\u9762", detail: "\u81EA\u7531\u804C\u4E1A\u3001\u6D41\u6C34\u6CE2\u52A8\u5927" },
            { name: "\u989D\u5EA6\u4F7F\u7528\u7387", impact: "\u8D1F\u9762", detail: "\u4F7F\u7528\u7387 98%" },
            { name: "\u5171\u503A\u96C6\u4E2D", impact: "\u8D1F\u9762", detail: "\u8DE8 6 \u5BB6\u673A\u6784\u5171\u503A" }
          ]
        },
        limitSuggest: { suggested: 0, current: 12e4, note: "\u5EFA\u8BAE\u51BB\u7ED3\u65B0\u589E\u6388\u4FE1\uFF0C\u542F\u52A8\u8D37\u4E2D\u5904\u7F6E" }
      },
      credit: {
        recentQueries: [
          { org: "\u672C\u884C", date: "2026-07-22", type: "\u8D37\u540E\u7BA1\u7406" },
          { org: "\u9A6C\u4E0A\u6D88\u91D1", date: "2026-07-18", type: "\u8D37\u6B3E\u5BA1\u6279" },
          { org: "360 \u501F\u6761", date: "2026-07-10", type: "\u8D37\u6B3E\u5BA1\u6279" },
          { org: "\u4EAC\u4E1C\u91D1\u6761", date: "2026-06-29", type: "\u8D37\u6B3E\u5BA1\u6279" },
          { org: "\u5FAE\u7C92\u8D37", date: "2026-06-21", type: "\u8D37\u6B3E\u5BA1\u6279" }
        ],
        accounts: [
          { type: "\u6D88\u8D39\u8D37", bank: "\u672C\u884C", balance: 118e3, status: "\u903E\u671F" },
          { type: "\u6D88\u8D39\u8D37", bank: "\u9A6C\u4E0A\u6D88\u91D1", balance: 42e3, status: "\u903E\u671F" },
          { type: "\u73B0\u91D1\u8D37", bank: "360 \u501F\u6761", balance: 28e3, status: "\u6B63\u5E38" },
          { type: "\u4FE1\u7528\u5361", bank: "\u5E7F\u53D1\u94F6\u884C", balance: 35e3, status: "\u5173\u6CE8" }
        ],
        overdue: { count: 2, amount: 6120 },
        guarantee: [{ name: "\u4E3A\u5468\u654F\u62C5\u4FDD", amount: 5e4, status: "\u5173\u6CE8" }]
      },
      device: {
        device: "\u672A\u77E5 Android",
        model: "Pixel_Emulator",
        os: "Android 13 (\u6A21\u62DF\u5668)",
        envRiskScore: 86,
        simulator: true,
        sameDeviceAccounts: [
          { custId: "CUST-100891", name: "\u9648\u6653\u6960" },
          { custId: "CUST-100902", name: "\u6797\u6653" },
          { custId: "CUST-100915", name: "\u8D75\u857E" }
        ],
        loginRegion: "\u5E7F\u4E1C\u7701\u4E1C\u839E\u5E02",
        lastLogin: "2026-08-09 02:11"
      },
      externalChecks: [
        { source: "\u5DE5\u5546", item: "\u540D\u4E0B\u4F01\u4E1A", result: "\u4E2A\u4F53\u6237\xB7\u7535\u5546\uFF08\u5B58\u7EED\uFF09", status: "\u4E00\u81F4" },
        { source: "\u53F8\u6CD5", item: "\u6D89\u8BC9\u67E5\u8BE2", result: "\u6C11\u95F4\u501F\u8D37\u7EA0\u7EB7 1 \u8D77", status: "\u5F02\u5E38" },
        { source: "\u7A0E\u52A1", item: "\u4E2A\u7A0E\u7F34\u7EB3", result: "\u8FD1 6 \u6708\u65E0\u7533\u62A5", status: "\u5F02\u5E38" },
        { source: "\u793E\u4FDD\u516C\u79EF\u91D1", item: "\u793E\u4FDD\u72B6\u6001", result: "\u65AD\u7F34\u8D85 12 \u4E2A\u6708", status: "\u5F02\u5E38" }
      ],
      collateralBiz: {
        collateral: [{ name: "\u7535\u5546\u5E97\u94FA\u7ECF\u8425\u6743", type: "\u7ECF\u8425\u6743\u8D28\u62BC", value: 6e4, status: "\u8BC4\u4F30\u4E2D" }],
        business: [{ name: "\u6DF1\u5733\u5E02\u67D0\u7535\u5546\u5546\u884C", role: "\u7ECF\u8425\u8005", status: "\u5B58\u7EED" }]
      },
      relationGraph: {
        nodes: [
          { id: "self", name: "\u9648\u6653\u6960", type: "person", rel: "\u672C\u4EBA", risk: "\u9AD8\u5371", openAlerts: 3 },
          { id: "zhou", name: "\u5468\u654F", type: "person", rel: "\u5171\u503A\u5173\u8054", risk: "\u9AD8\u5371", openAlerts: 2 },
          { id: "liu", name: "\u5218\u6D0B", type: "person", rel: "\u5171\u503A\u5173\u8054", risk: "\u9AD8\u5371", openAlerts: 1 },
          { id: "lin", name: "\u6797\u6653", type: "person", rel: "\u540C\u8BBE\u5907\u8D26\u53F7", risk: "\u9AD8\u5371", openAlerts: 1 },
          { id: "shop", name: "\u6DF1\u5733\u67D0\u7535\u5546\u5546\u884C", type: "company", rel: "\u7ECF\u8425\u4E3B\u4F53" }
        ],
        edges: [
          { source: "self", target: "zhou", rel: "\u5171\u503A" },
          { source: "self", target: "liu", rel: "\u5171\u503A" },
          { source: "self", target: "lin", rel: "\u540C\u8BBE\u5907" },
          { source: "self", target: "shop", rel: "\u7ECF\u8425" },
          { source: "zhou", target: "liu", rel: "\u5171\u503A\u94FE\u6761" }
        ]
      },
      coDebt: {
        applications30d: 6,
        orgs: [
          { org: "\u672C\u884C", product: "\u7ECF\u8425\u8D37", balance: 71e3, status: "\u903E\u671F" },
          { org: "\u9A6C\u4E0A\u6D88\u91D1", product: "\u6D88\u8D39\u8D37", balance: 42e3, status: "\u903E\u671F" },
          { org: "360 \u501F\u6761", product: "\u73B0\u91D1\u8D37", balance: 28e3, status: "\u6B63\u5E38" },
          { org: "\u5FAE\u7C92\u8D37", product: "\u6D88\u8D39\u8D37", balance: 19e3, status: "\u5173\u6CE8" },
          { org: "\u4EAC\u4E1C\u91D1\u6761", product: "\u6D88\u8D39\u8D37", balance: 23e3, status: "\u6B63\u5E38" },
          { org: "\u5206\u671F\u4E50", product: "\u6D88\u8D39\u8D37", balance: 15e3, status: "\u903E\u671F" }
        ],
        chain: ["\u9648\u6653\u6960 \u2192 \u5468\u654F \u2192 \u5218\u6D0B\uFF08\u540C\u4E00\u8D44\u91D1\u4E2D\u4ECB\u5171\u503A\u94FE\u6761\uFF09", "\u9648\u6653\u6960 \u2194 \u6797\u6653\uFF08\u540C\u8BBE\u5907\u591A\u8D26\u53F7\uFF09"]
      },
      collections: [
        {
          id: "COL-2026-00771",
          stage: "M3+",
          product: "\u5927\u989D\u5206\u671F\xB7\u7ECF\u8425",
          status: "\u59D4\u5916",
          owner: "\u50AC\u6536\u5458\xB7\u5434\u654F",
          lastTouch: "2026-08-08",
          overdueAmt: 71e3,
          overdueDays: 23,
          dueDate: "2026-07-16",
          calls: 18,
          sms: 32,
          notes: [
            { time: "2026-08-08 10:02", who: "\u5434\u654F", what: "\u7B2C 3 \u6B21\u7535\u8BDD\uFF0C\u63A5\u901A\u540E\u627F\u8BFA\u672C\u5468\u8FD8\u6B3E 5000" },
            { time: "2026-08-05 19:30", who: "\u7CFB\u7EDF", what: "\u81EA\u52A8 SMS \u63D0\u9192\u5DF2\u53D1\u9001" },
            { time: "2026-08-01 09:15", who: "\u5434\u654F", what: "\u8054\u7CFB\u7D27\u6025\u8054\u7CFB\u4EBA\u738B\u6D69\uFF0C\u8F6C\u544A\u903E\u671F\u60C5\u51B5" }
          ]
        },
        {
          id: "COL-2026-00772",
          stage: "M2",
          product: "\u968F\u501F\u968F\u8FD8\xB7\u6D88\u8D39\u8D37",
          status: "\u627F\u8BFA\u8FD8\u6B3E",
          owner: "\u50AC\u6536\u5458\xB7\u5434\u654F",
          lastTouch: "2026-08-07",
          overdueAmt: 47e3,
          overdueDays: 11,
          dueDate: "2026-07-28",
          calls: 9,
          sms: 21,
          notes: [{ time: "2026-08-07 14:20", who: "\u5434\u654F", what: "\u5BA2\u6237\u8868\u793A\u8D44\u91D1\u5468\u8F6C\u4E2D\uFF0C\u627F\u8BFA 8 \u6708\u5E95\u524D\u7ED3\u6E05" }]
        }
      ],
      postRisk: {
        fundFlow: [
          { date: "2026-08-03", direction: "\u51FA", counterparty: "\u5468\u654F", amount: 12e3, flag: "\u7591\u4F3C\u8D44\u91D1\u56DE\u6D41" },
          { date: "2026-08-01", direction: "\u5165", counterparty: "\u672A\u77E5\u4E2A\u4EBA\u8D26\u6237", amount: 3e4, flag: "\u6765\u6E90\u4E0D\u660E" },
          { date: "2026-07-28", direction: "\u51FA", counterparty: "\u5206\u671F\u4E50", amount: 8e3, flag: "\u62C6\u501F\u8FD8\u6B3E" }
        ],
        blacklist: [
          { list: "\u672C\u884C\u9ED1\u540D\u5355", hit: "\u547D\u4E2D\uFF08\u8D37\u540E\uFF09", status: "\u9AD8\u98CE\u9669" },
          { list: "\u4E92\u91D1\u534F\u4F1A\u7070\u540D\u5355", hit: "\u547D\u4E2D", status: "\u5173\u6CE8" }
        ]
      },
      disposeLog: [
        { time: "2026-08-02 09:00", kind: "task", title: "\u8FDE\u7EED\u903E\u671F\u7EA2\u706F\u5904\u7F6E", sub: "\u6D3E\u53D1\u5904\u7F6E\u5DE5\u5355 D-2026-0401", status: "\u5F85\u5904\u7F6E" },
        { time: "2026-07-22 16:40", kind: "task", title: "\u591A\u5934\u5171\u503A\u6838\u67E5", sub: "\u6D3E\u53D1\u6838\u67E5\u5DE5\u5355 D-2026-0388", status: "\u5904\u7F6E\u4E2D" },
        { time: "2026-07-05 11:20", kind: "op", title: "\u989D\u5EA6\u4F7F\u7528\u7387\u9884\u8B66\u95ED\u73AF", sub: "\u7CFB\u7EDF\u81EA\u52A8\u590D\u6838\u540E\u5173\u95ED" }
      ],
      followed: false
    }
  ]
};
var data = JSON.parse(JSON.stringify(SEED_CUST));
var version = 0;
var listeners2 = /* @__PURE__ */ new Set();
function emit2() {
  version++;
  listeners2.forEach((fn) => fn());
}
function useSnap(sel) {
  (0, import_react3.useSyncExternalStore)(
    (l) => {
      listeners2.add(l);
      return () => {
        listeners2.delete(l);
      };
    },
    () => version
  );
  return sel();
}
function useCustData() {
  return useSnap(() => data);
}
function toggleFollowCust(custId) {
  data = {
    ...data,
    customers: data.customers.map((c) => c.custId === custId ? { ...c, followed: !c.followed } : c)
  };
  emit2();
}

// src/console/CustProfile.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
var CRUMB = "\u96F6\u552E\u4FE1\u8D37\u98CE\u63A7 / \u8D37\u4E2D\u76D1\u63A7 / \u5355\u5BA2\u8BE6\u60C5";
var STATUS_KIND = {
  \u6B63\u5E38: "green",
  \u5173\u6CE8: "amber",
  \u903E\u671F: "red",
  \u51BB\u7ED3: "gray"
};
var CHECK_KIND = { \u4E00\u81F4: "green", \u5F85\u6838: "amber", \u5F02\u5E38: "red" };
var STAGE_KIND = { M1: "blue", M2: "amber", "M3+": "red" };
var SCORE_KIND = { \u4F18: "green", \u826F: "blue", \u4E2D: "amber", \u5DEE: "red" };
var TABS = [
  "\u57FA\u672C\u4FE1\u606F",
  "\u6388\u4FE1\u4E0E\u989D\u5EA6",
  "\u8D1F\u503A\u4E0E\u903E\u671F",
  "\u884C\u4E3A\u753B\u50CF",
  "\u98CE\u9669\u9884\u8B66",
  "\u8054\u7CFB\u4EBA\u5173\u7CFB",
  "\u6A21\u578B\u8BC4\u5206",
  "\u5F81\u4FE1",
  "\u8BBE\u5907\u4E0E\u6B3A\u8BC8",
  "\u5916\u90E8\u6570\u636E\u6838\u9A8C",
  "\u62C5\u4FDD\u4E0E\u7ECF\u8425",
  "\u5173\u7CFB\u56FE\u8C31",
  "\u591A\u5934\u5171\u503A",
  "\u50AC\u6536\u6848\u4EF6",
  "\u8D37\u540E\u98CE\u9669",
  "\u5904\u7F6E\u4E0E\u64CD\u4F5C\u65E5\u5FD7"
];
function money(n) {
  return `\xA5${n.toLocaleString()}`;
}
function ModelScorePanel({ scores }) {
  const cards = [scores.zhiCha, scores.zhiXin, scores.zhiRong];
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Panel, { title: "\u6A21\u578B\u8BC4\u5206", desc: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
    "\u51C6\u5165 / \u6388\u4FE1\u4E09\u8BC4\u5206\u5361 ",
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Sam, { label: "\u6837\u4F8B" }),
    " \u667A\u5BDF(\u53CD\u6B3A\u8BC8) / \u667A\u4FE1(\u4FE1\u7528) / \u667A\u878D(\u7EFC\u5408) \u4E0E\u989D\u5EA6\u5EFA\u8BAE"
  ] }), className: "mb-3", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }, children: [
    cards.map((c) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { border: "1px solid #E2E8F0", borderRadius: 12, padding: 14, background: "#fff" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { fontSize: 13, fontWeight: 600, color: "#334155" }, children: c.name }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Badge, { kind: SCORE_KIND[c.level], children: c.level })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 26, fontWeight: 800, color: "#0F172A", marginTop: 6 }, children: c.score }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }, children: c.factors.map((f) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748B" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: f.name }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { color: f.impact === "\u6B63\u9762" ? "#16A34A" : f.impact === "\u8D1F\u9762" ? "#DC2626" : "#94A3B8" }, children: f.detail })
      ] }, f.name)) })
    ] }, c.name)),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { border: "1px solid #EDE9FE", borderRadius: 12, padding: 14, background: "#F5F3FF" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 13, fontWeight: 600, color: "#6D28D9" }, children: "\u989D\u5EA6\u5EFA\u8BAE" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 22, fontWeight: 800, color: "#6D28D9", marginTop: 6 }, children: money(scores.limitSuggest.suggested) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { fontSize: 12, color: "#64748B", marginTop: 2 }, children: [
        "\u5F53\u524D\u6388\u4FE1 ",
        money(scores.limitSuggest.current)
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 12, color: "#64748B", marginTop: 8 }, children: scores.limitSuggest.note })
    ] })
  ] }) });
}
function RelationGraph({ graph }) {
  const W = 680;
  const H = 340;
  const cx = W / 2;
  const cy = H / 2;
  const others = graph.nodes.filter((n) => n.id !== "self");
  const R = Math.min(W, H) / 2 - 60;
  const pos = {};
  const self = graph.nodes.find((n) => n.id === "self");
  if (self) pos[self.id] = { x: cx, y: cy };
  others.forEach((n, i) => {
    const ang = Math.PI * 2 * i / others.length - Math.PI / 2;
    pos[n.id] = { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang) };
  });
  const color = (kind) => kind === "company" ? "#2563EB" : "#7C3AED";
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "1fr 240px", gap: 16, alignItems: "start" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("svg", { viewBox: `0 0 ${W} ${H}`, style: { width: "100%", background: "#F8FAFC", borderRadius: 12, border: "1px solid #E2E8F0" }, children: [
      graph.edges.map((e, i) => {
        const a = pos[e.source];
        const b = pos[e.target];
        if (!a || !b) return null;
        return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: e.rel === "\u5171\u503A" || e.rel === "\u5171\u503A\u94FE\u6761" ? "#DC2626" : "#CBD5E1", strokeWidth: e.rel === "\u5171\u503A" || e.rel === "\u5171\u503A\u94FE\u6761" ? 1.8 : 1.2, strokeDasharray: e.rel === "\u5171\u503A\u94FE\u6761" ? "4 2" : void 0 }, i);
      }),
      graph.nodes.map((n) => {
        const p = pos[n.id];
        const c = color(n.type);
        const isHi = n.risk === "\u9AD8\u5371";
        const r = n.type === "company" ? 24 : 19;
        return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("g", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("circle", { cx: p.x, cy: p.y, r, fill: c, fillOpacity: isHi ? 0.18 : 0.1, stroke: isHi ? "#DC2626" : c, strokeWidth: isHi ? 2 : 1.4 }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("text", { x: p.x, y: p.y - 2, textAnchor: "middle", fontSize: n.type === "company" ? 11 : 10, fontWeight: 600, fill: c, children: n.name.slice(0, 5) }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("text", { x: p.x, y: p.y + 11, textAnchor: "middle", fontSize: 9, fill: "#64748B", children: n.rel }),
          isHi && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("text", { x: p.x, y: p.y - r - 6, textAnchor: "middle", fontSize: 10, fontWeight: 700, fill: "#DC2626", children: [
            n.openAlerts ?? "",
            " \u9AD8\u5371"
          ] })
        ] }, n.id);
      })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }, children: "\u5173\u7CFB\u5217\u8868" }),
      graph.nodes.filter((n) => n.id !== "self").map((n) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { border: "1px solid #E2E8F0", borderRadius: 8, padding: "6px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", background: n.risk === "\u9AD8\u5371" ? "#FEF2F2" : "#fff" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { fontSize: 12, color: "#334155" }, children: n.name }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Badge, { kind: n.risk === "\u9AD8\u5371" ? "red" : n.type === "company" ? "blue" : "violet", children: n.rel })
      ] }, n.id))
    ] })
  ] });
}
function Timeline({ items }) {
  if (!items.length) return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 13, color: "#94A3B8" }, children: "\u6682\u65E0\u5904\u7F6E\u4E0E\u64CD\u4F5C\u8BB0\u5F55" });
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { position: "relative", paddingLeft: 18 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { position: "absolute", left: 5, top: 4, bottom: 4, width: 2, background: "#E2E8F0" } }),
    items.map((e, i) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { position: "relative", paddingBottom: 16 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { position: "absolute", left: -16, top: 4, width: 10, height: 10, borderRadius: 999, background: e.kind === "task" ? "#2563EB" : "#7C3AED", border: "2px solid #fff" } }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { fontSize: 13, fontWeight: 600, color: "#1E293B" }, children: e.title }),
        e.status && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Badge, { kind: e.status === "\u5F85\u5904\u7F6E" ? "red" : e.status === "\u5904\u7F6E\u4E2D" ? "amber" : "green", children: e.status })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { fontSize: 12, color: "#64748B", marginTop: 2 }, children: [
        e.time,
        " \xB7 ",
        e.sub
      ] })
    ] }, i))
  ] });
}
function CustProfile() {
  const d = useCustData();
  const [cur, setCur] = (0, import_react4.useState)(d.customers[0]);
  const [tab, setTab] = (0, import_react4.useState)("\u57FA\u672C\u4FE1\u606F");
  const switchTo = (c) => {
    setCur(c);
    setTab("\u57FA\u672C\u4FE1\u606F");
  };
  if (!cur) return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { padding: 24 }, children: "\u6682\u65E0\u5355\u5BA2\u6863\u6848" });
  const infoRows = [
    ["\u5BA2\u6237\u6807\u8BC6", cur.custId],
    ["\u8BC1\u4EF6\u53F7\uFF08\u8131\u654F\uFF09", cur.maskedId],
    ["\u6027\u522B", cur.gender],
    ["\u5E74\u9F84", `${cur.age} \u5C81`],
    ["\u5B66\u5386", cur.education],
    ["\u5A5A\u59FB\u72B6\u51B5", cur.marital],
    ["\u6240\u5728\u5730", cur.region]
  ];
  const jobRows = [
    ["\u804C\u4E1A", cur.occupation],
    ["\u5DE5\u4F5C\u5355\u4F4D", cur.employer],
    ["\u6708\u6536\u5165", money(cur.income)],
    ["\u6536\u5165\u8BC1\u660E", cur.incomeProof],
    ["\u8FDB\u4EF6\u6E20\u9053", cur.channel]
  ];
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
  const redCount = cur.alerts.filter((a) => a.level === "\u7EA2").length;
  const yellowCount = cur.alerts.filter((a) => a.level === "\u9EC4").length;
  const pendingCount = cur.alerts.filter((a) => a.status === "\u5F85\u5904\u7F6E").length;
  const contactCols = [
    { key: "name", label: "\u59D3\u540D", type: "text", fixed: "left", width: "140px" },
    { key: "relation", label: "\u5173\u7CFB", type: "text", width: "140px" },
    { key: "phone", label: "\u8054\u7CFB\u65B9\u5F0F\uFF08\u8131\u654F\uFF09", type: "text", width: "180px" },
    { key: "coDebt", label: "\u662F\u5426\u5171\u503A", type: "badge", badgeKind: "red", width: "110px" }
  ];
  const contactRows = cur.contacts.map((c) => ({
    id: c.id,
    name: c.name,
    relation: c.relation,
    phone: c.phone,
    coDebt: c.coDebt ? { v: "\u5171\u503A", kind: "red" } : { v: "\u5426", kind: "gray" }
  }));
  const coDebtCount = cur.contacts.filter((c) => c.coDebt).length;
  const relationCount = cur.contacts.filter((c) => c.relation === "\u5173\u8054\u8D26\u6237").length;
  const dangerBehavior = cur.behavior.filter((b) => b.danger && b.count > 0).length;
  const queryCols = [
    { key: "org", label: "\u67E5\u8BE2\u673A\u6784", type: "text", fixed: "left", width: "200px" },
    { key: "date", label: "\u65E5\u671F", type: "text", width: "140px" },
    { key: "type", label: "\u67E5\u8BE2\u7C7B\u578B", type: "text" }
  ];
  const queryRows = cur.credit.recentQueries.map((q, i) => ({ id: `q${i}`, org: q.org, date: q.date, type: q.type }));
  const acctCols = [
    { key: "type", label: "\u8D26\u6237\u7C7B\u578B", type: "text", fixed: "left", width: "160px" },
    { key: "bank", label: "\u673A\u6784", type: "text", width: "180px" },
    { key: "balance", label: "\u4F59\u989D/\u6388\u4FE1", type: "money", width: "160px" },
    { key: "status", label: "\u72B6\u6001", type: "badge", badgeKind: "green", width: "110px" }
  ];
  const acctRows = cur.credit.accounts.map((a, i) => ({
    id: `a${i}`,
    type: a.type,
    bank: a.bank,
    balance: a.balance,
    status: { v: a.status, kind: a.status === "\u903E\u671F" ? "red" : a.status === "\u5173\u6CE8" ? "amber" : "green" }
  }));
  const devDanger = cur.device.envRiskScore >= 60 || cur.device.simulator;
  const sameDevRows = cur.device.sameDeviceAccounts.map((s, i) => ({ id: `d${i}`, name: s.name, custId: s.custId }));
  const extCols = [
    { key: "source", label: "\u6765\u6E90", type: "text", fixed: "left", width: "140px" },
    { key: "item", label: "\u6838\u9A8C\u9879", type: "text", width: "160px" },
    { key: "result", label: "\u7ED3\u679C", type: "text" },
    { key: "status", label: "\u72B6\u6001", type: "badge", badgeKind: "green", width: "110px" }
  ];
  const extRows = cur.externalChecks.map((e, i) => ({
    id: `e${i}`,
    source: e.source,
    item: e.item,
    result: e.result,
    status: { v: e.status, kind: CHECK_KIND[e.status] }
  }));
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { padding: 24, maxWidth: 1360 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      PageShell,
      {
        title: "\u5355\u5BA2\u8BE6\u60C5",
        crumb: `${CRUMB} / ${cur.name}`,
        subtitle: "\u96F6\u552E\u4FE1\u8D37\u5355\u5BA2 360\xB0 \u753B\u50CF\uFF1A\u8EAB\u4EFD\u4E0E\u804C\u4E1A\u6536\u5165\u3001\u6388\u4FE1\u989D\u5EA6\u3001\u8D1F\u503A\u4E0E\u903E\u671F\u3001\u884C\u4E3A\u753B\u50CF\u3001\u98CE\u9669\u9884\u8B66\u3001\u8054\u7CFB\u4EBA\u5173\u7CFB\uFF0C\u53CA\u6A21\u578B\u8BC4\u5206 / \u5F81\u4FE1 / \u8BBE\u5907\u4E0E\u6B3A\u8BC8 / \u5916\u90E8\u6838\u9A8C / \u62C5\u4FDD\u4E0E\u7ECF\u8425 / \u5173\u7CFB\u56FE\u8C31 / \u591A\u5934\u5171\u503A / \u50AC\u6536 / \u8D37\u540E\u98CE\u9669 / \u5904\u7F6E\u65E5\u5FD7",
        actions: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Sam, { label: "\u5355\u5BA2\u6837\u4F8B", value: "custProfileData.ts" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Cal, { label: "\u5B9E\u65F6\u805A\u5408" })
        ] })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, background: "#fff", marginBottom: 12 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 12 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
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
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { fontSize: 18, fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: 8 }, children: [
              cur.name,
              " ",
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Badge, { kind: STATUS_KIND[cur.status], children: cur.status })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }, children: cur.tags.map((t) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Badge, { kind: "blue", children: t }, t)) })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 12 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { textAlign: "right" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 12, color: "#94A3B8" }, children: "\u7EFC\u5408\u8BC4\u5206" }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { fontSize: 22, fontWeight: 800, color: "#8B5CF6" }, children: [
              cur.scores.zhiRong.score,
              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { style: { fontSize: 12, fontWeight: 500, color: "#94A3B8" }, children: [
                " \xB7 ",
                cur.scores.zhiRong.level
              ] })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Button, { size: "sm", variant: cur.followed ? "secondary" : "primary", onClick: () => toggleFollowCust(cur.custId), children: cur.followed ? "\u5DF2\u5173\u6CE8" : "\uFF0B \u5173\u6CE8" })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", gap: 18, flexWrap: "wrap", marginTop: 14, fontSize: 13, color: "#475569" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
          "\u6388\u4FE1\u989D\u5EA6\uFF1A",
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("b", { children: money(cur.creditLimit) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
          "\u5DF2\u7528\u989D\u5EA6\uFF1A",
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("b", { children: money(cur.usedLimit) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
          "\u53EF\u7528\u989D\u5EA6\uFF1A",
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("b", { children: money(cur.availLimit) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
          "\u5728\u8D37\u4F59\u989D\uFF1A",
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("b", { children: money(cur.totalDebt) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
          "\u6708\u4F9B\u5408\u8BA1\uFF1A",
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("b", { children: money(cur.monthlyPay) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
          "\u804C\u4E1A\uFF1A",
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("b", { children: cur.occupation })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", gap: 18, flexWrap: "wrap", marginTop: 6, fontSize: 12, color: "#64748B" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
          "\u8BC1\u4EF6\u53F7\uFF1A",
          cur.maskedId
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
          "\u624B\u673A\u53F7\uFF1A",
          cur.phone
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
          "\u6240\u5728\u5730\uFF1A",
          cur.region
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
          "\u8FDB\u4EF6\u6E20\u9053\uFF1A",
          cur.channel
        ] })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }, children: d.customers.map((c) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "button",
      {
        onClick: () => switchTo(c),
        style: {
          fontSize: 12,
          padding: "4px 10px",
          borderRadius: 999,
          border: "1px solid",
          borderColor: c.custId === cur.custId ? "#8B5CF6" : "#E2E8F0",
          background: c.custId === cur.custId ? "#F5F3FF" : "#fff",
          color: c.custId === cur.custId ? "#6D28D9" : "#475569",
          cursor: "pointer"
        },
        children: c.name
      },
      c.custId
    )) }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(ModelScorePanel, { scores: cur.scores }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { display: "flex", gap: 4, borderBottom: "1px solid #E2E8F0", marginBottom: 14, flexWrap: "wrap" }, children: TABS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
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
        children: t
      },
      t
    )) }),
    tab === "\u57FA\u672C\u4FE1\u606F" && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 14 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u8D37\u6B3E\u4EA7\u54C1\u6570", value: String(cur.loans.length), accent: "violet", hint: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Sam, { label: "\u6837\u4F8B" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u5728\u8D37\u4F59\u989D", value: money(cur.totalDebt), accent: "brand", hint: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Cal, { label: "\u5B9E\u65F6\u805A\u5408" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u6388\u4FE1\u989D\u5EA6", value: money(cur.creditLimit), accent: "cyan", hint: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Sam, { label: "\u6837\u4F8B" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u6A21\u578B\u7EFC\u5408\u5206", value: `${cur.scores.zhiRong.score}`, accent: "violet", hint: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Sam, { label: "\u6837\u4F8B" }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Panel, { title: "\u8EAB\u4EFD\u4FE1\u606F", desc: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
          "\u57FA\u7840\u767B\u8BB0\u4FE1\u606F \xB7 ",
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Sam, { value: "custProfileData.ts" })
        ] }), children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 24px", fontSize: 13 }, children: infoRows.map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #F1F5F9", paddingBottom: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { color: "#94A3B8" }, children: k }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { color: "#334155", fontWeight: 500 }, children: v })
        ] }, k)) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Panel, { title: "\u804C\u4E1A\u4E0E\u6536\u5165", desc: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
          "\u6536\u5165\u4E0E\u804C\u4E1A \xB7 ",
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Sam, { value: "custProfileData.ts" })
        ] }), children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 24px", fontSize: 13 }, children: jobRows.map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #F1F5F9", paddingBottom: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { color: "#94A3B8" }, children: k }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { color: "#334155", fontWeight: 500 }, children: v })
        ] }, k)) }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Panel, { title: "\u8054\u7CFB\u65B9\u5F0F", desc: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
        "\u8131\u654F\u8054\u7CFB\u65B9\u5F0F \xB7 ",
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Sam, { value: "custProfileData.ts" })
      ] }), className: "mt-3", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px 24px", fontSize: 13 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #F1F5F9", paddingBottom: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { color: "#94A3B8" }, children: "\u624B\u673A\u53F7" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { color: "#334155", fontWeight: 500 }, children: cur.phone })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #F1F5F9", paddingBottom: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { color: "#94A3B8" }, children: "\u8FDB\u4EF6\u6E20\u9053" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { color: "#334155", fontWeight: 500 }, children: cur.channel })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #F1F5F9", paddingBottom: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { color: "#94A3B8" }, children: "\u6240\u5728\u5730" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { color: "#334155", fontWeight: 500 }, children: cur.region })
        ] })
      ] }) })
    ] }),
    tab === "\u6388\u4FE1\u4E0E\u989D\u5EA6" && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 14 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u6388\u4FE1\u989D\u5EA6", value: money(cur.creditLimit), accent: "violet", hint: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Sam, { label: "\u6837\u4F8B" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u5DF2\u7528\u989D\u5EA6", value: money(cur.usedLimit), accent: "brand", hint: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Cal, { label: "\u5B9E\u65F6\u805A\u5408" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u53EF\u7528\u989D\u5EA6", value: money(cur.availLimit), accent: "cyan", hint: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Cal, { label: "\u5B9E\u65F6\u805A\u5408" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u989D\u5EA6\u5E74\u5316", value: `${cur.annualRate}%`, accent: "amber", hint: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Sam, { label: "\u6837\u4F8B" }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Panel, { title: "\u989D\u5EA6\u660E\u7EC6", desc: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
        "\u5404\u4EA7\u54C1\u5DF2\u7528\u989D\u5EA6 \xB7 ",
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Cal, { label: "\u5B9E\u65F6\u805A\u5408" })
      ] }), children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(DataTable, { columns: limitCols, rows: limitRows, empty: "\u65E0", pager: true, defaultPageSize: 10 }) })
    ] }),
    tab === "\u8D1F\u503A\u4E0E\u903E\u671F" && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 14 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u8D37\u6B3E\u4F59\u989D", value: money(cur.totalDebt), accent: "brand", hint: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Cal, { label: "\u5B9E\u65F6\u805A\u5408" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u6708\u4F9B\u5408\u8BA1", value: money(cur.monthlyPay), accent: "cyan", hint: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Cal, { label: "\u5B9E\u65F6\u805A\u5408" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u5F53\u524D\u903E\u671F\u5929\u6570", value: String(cur.overdueDays), accent: cur.overdueDays > 0 ? "rose" : "emerald", hint: "0 \u8868\u793A\u672A\u903E\u671F" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u5F53\u524D\u903E\u671F\u91D1\u989D", value: money(cur.overdueAmt), accent: cur.overdueAmt > 0 ? "rose" : "emerald", hint: "0 \u8868\u793A\u672A\u903E\u671F" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Panel, { title: "\u8D37\u6B3E\u53F0\u8D26", desc: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
        "\u5728\u8D37\u501F\u636E\u660E\u7EC6 \xB7 ",
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Sam, { value: "custProfileData.ts" })
      ] }), children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(DataTable, { columns: debtCols, rows: debtRows, empty: "\u65E0\u5728\u8D37\u8BB0\u5F55", pager: true, defaultPageSize: 10 }) })
    ] }),
    tab === "\u884C\u4E3A\u753B\u50CF" && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 14 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u7528\u4FE1\u7B14\u6570", value: String(cur.behavior.find((b) => b.name === "\u7528\u4FE1\u7B14\u6570")?.count ?? 0), accent: "violet", hint: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Cal, { label: "\u5B9E\u65F6\u805A\u5408" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u6B63\u5E38\u8FD8\u6B3E", value: String(cur.behavior.find((b) => b.name === "\u6B63\u5E38\u8FD8\u6B3E")?.count ?? 0), accent: "emerald", hint: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Cal, { label: "\u5B9E\u65F6\u805A\u5408" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u673A\u6784\u67E5\u8BE2", value: String(cur.behavior.find((b) => b.name === "\u673A\u6784\u67E5\u8BE2")?.count ?? 0), accent: "cyan", hint: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Cal, { label: "\u5B9E\u65F6\u805A\u5408" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u591A\u5934\u501F\u8D37", value: String(cur.behavior.find((b) => b.name === "\u591A\u5934\u501F\u8D37")?.count ?? 0), accent: "amber", hint: "\u5BB6\u6570" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8 }, children: cur.behavior.map((it) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
        "div",
        {
          style: {
            border: "1px solid #E2E8F0",
            borderRadius: 8,
            padding: "8px 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: it.danger ? "#FEF2F2" : "#fff"
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { fontSize: 12, color: it.danger ? "#DC2626" : "#475569" }, children: it.name }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { fontSize: 13, fontWeight: 600, color: it.danger ? "#DC2626" : "#334155" }, children: it.count })
          ]
        },
        it.name
      )) }),
      dangerBehavior > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { marginTop: 12, borderRadius: 12, border: "1px solid #FECACA", background: "#FEF2F2", padding: "10px 14px", fontSize: 13, color: "#B91C1C" }, children: [
        "\u26A0 \u547D\u4E2D ",
        dangerBehavior,
        " \u9879\u98CE\u9669\u884C\u4E3A\uFF08\u903E\u671F\u8FD8\u6B3E / \u591A\u5934\u501F\u8D37 / \u591C\u95F4\u7528\u4FE1 / \u989D\u5EA6\u4F7F\u7528\u7387\u8FC7\u9AD8\uFF09\uFF0C\u5EFA\u8BAE\u7ED3\u5408\u98CE\u9669\u9884\u8B66\u8054\u52A8\u5904\u7F6E\u3002"
      ] })
    ] }),
    tab === "\u98CE\u9669\u9884\u8B66" && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 14 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u9884\u8B66\u603B\u6570", value: String(cur.alerts.length), accent: "violet", hint: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Sam, { label: "\u6837\u4F8B" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u7EA2\u706F", value: String(redCount), accent: "rose", hint: "\u9700\u7ACB\u5373\u5904\u7F6E" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u9EC4\u706F", value: String(yellowCount), accent: "amber", hint: "\u5173\u6CE8" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u5F85\u5904\u7F6E", value: String(pendingCount), accent: "brand", hint: "\u6D41\u7A0B\u5728\u9014" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Panel, { title: "\u9884\u8B66\u8BB0\u5F55", desc: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
        "\u8D37\u4E2D\u76D1\u63A7\u547D\u4E2D\u89C4\u5219 \xB7 ",
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Sam, { value: "custProfileData.ts" })
      ] }), children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(DataTable, { columns: alertCols, rows: alertRows, empty: "\u65E0\u9884\u8B66\u8BB0\u5F55", pager: true, defaultPageSize: 10 }) })
    ] }),
    tab === "\u8054\u7CFB\u4EBA\u5173\u7CFB" && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 14 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u8054\u7CFB\u4EBA", value: String(cur.contacts.length), accent: "violet", hint: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Sam, { label: "\u6837\u4F8B" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u5171\u503A\u4EBA\u6570", value: String(coDebtCount), accent: "rose", hint: "\u5171\u503A\u5173\u8054" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u5173\u8054\u8D26\u6237", value: String(relationCount), accent: "cyan", hint: "\u8DE8\u8D26\u6237" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u98CE\u9669\u5173\u8054", value: String(coDebtCount), accent: "amber", hint: "\u5171\u503A\u6807\u8BB0" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Panel, { title: "\u8054\u7CFB\u4EBA / \u5173\u7CFB", desc: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
        "\u7D27\u6025\u8054\u7CFB\u4EBA\u3001\u5173\u8054\u8D26\u6237\u4E0E\u5171\u503A\u5173\u7CFB \xB7 ",
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Sam, { value: "custProfileData.ts" })
      ] }), children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(DataTable, { columns: contactCols, rows: contactRows, empty: "\u65E0", pager: true, defaultPageSize: 10 }) })
    ] }),
    tab === "\u6A21\u578B\u8BC4\u5206" && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(Panel, { title: "\u6A21\u578B\u8BC4\u5206\u660E\u7EC6", desc: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
      "\u667A\u5BDF / \u667A\u4FE1 / \u667A\u878D \u5206\u9879\u4E0E\u989D\u5EA6\u5EFA\u8BAE \xB7 ",
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Sam, { value: "custProfileData.ts" })
    ] }), children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }, children: [cur.scores.zhiCha, cur.scores.zhiXin, cur.scores.zhiRong].map((c) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { border: "1px solid #E2E8F0", borderRadius: 12, padding: 14 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { fontSize: 13, fontWeight: 600, color: "#334155" }, children: c.name }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Badge, { kind: SCORE_KIND[c.level], children: c.level })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 28, fontWeight: 800, color: "#0F172A", marginTop: 6 }, children: c.score }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }, children: c.factors.map((f) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { fontSize: 12, color: "#475569" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: f.name }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { color: f.impact === "\u6B63\u9762" ? "#16A34A" : f.impact === "\u8D1F\u9762" ? "#DC2626" : "#94A3B8" }, children: f.impact })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { color: "#94A3B8", fontSize: 11 }, children: f.detail })
        ] }, f.name)) })
      ] }, c.name)) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { marginTop: 12, borderRadius: 12, border: "1px solid #EDE9FE", background: "#F5F3FF", padding: 14 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 13, fontWeight: 600, color: "#6D28D9" }, children: "\u989D\u5EA6\u5EFA\u8BAE" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { fontSize: 13, color: "#475569", marginTop: 6 }, children: [
          "\u5EFA\u8BAE\u6388\u4FE1 ",
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("b", { children: money(cur.scores.limitSuggest.suggested) }),
          " \uFF5C \u5F53\u524D\u6388\u4FE1 ",
          money(cur.scores.limitSuggest.current)
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 12, color: "#64748B", marginTop: 4 }, children: cur.scores.limitSuggest.note })
      ] })
    ] }),
    tab === "\u5F81\u4FE1" && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 14 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u8FD16\u6708\u67E5\u8BE2", value: String(cur.credit.recentQueries.length), accent: "cyan", hint: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Cal, { label: "\u5B9E\u65F6\u805A\u5408" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u4FE1\u8D37\u8D26\u6237", value: String(cur.credit.accounts.length), accent: "violet", hint: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Cal, { label: "\u5B9E\u65F6\u805A\u5408" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u903E\u671F\u7B14\u6570", value: String(cur.credit.overdue.count), accent: cur.credit.overdue.count > 0 ? "rose" : "emerald", hint: "\u5F81\u4FE1\u903E\u671F" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u5BF9\u5916\u62C5\u4FDD", value: String(cur.credit.guarantee.length), accent: "amber", hint: "\u62C5\u4FDD\u7B14\u6570" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Panel, { title: "\u8FD1 6 \u6708\u67E5\u8BE2\u8BB0\u5F55", desc: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
        "\u5F81\u4FE1\u67E5\u8BE2\u660E\u7EC6 \xB7 ",
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Sam, { value: "custProfileData.ts" })
      ] }), children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(DataTable, { columns: queryCols, rows: queryRows, empty: "\u65E0\u67E5\u8BE2\u8BB0\u5F55", pager: true, defaultPageSize: 8 }) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Panel, { title: "\u4FE1\u8D37\u8D26\u6237\u660E\u7EC6", desc: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
        "\u4EBA\u884C\u5F81\u4FE1\u8D26\u6237 \xB7 ",
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Sam, { value: "custProfileData.ts" })
      ] }), className: "mt-3", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(DataTable, { columns: acctCols, rows: acctRows, empty: "\u65E0\u4FE1\u8D37\u8D26\u6237", pager: true, defaultPageSize: 8 }) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Panel, { title: "\u5F81\u4FE1\u903E\u671F", desc: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
          "\u5F53\u524D\u5F81\u4FE1\u903E\u671F \xB7 ",
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Cal, { label: "\u5B9E\u65F6\u805A\u5408" })
        ] }), children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { fontSize: 13, color: "#475569" }, children: [
          "\u903E\u671F\u7B14\u6570\uFF1A",
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("b", { style: { color: cur.credit.overdue.count > 0 ? "#DC2626" : "#16A34A" }, children: cur.credit.overdue.count }),
          " \u7B14 \uFF5C \u903E\u671F\u91D1\u989D\uFF1A",
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("b", { style: { color: cur.credit.overdue.amount > 0 ? "#DC2626" : "#16A34A" }, children: money(cur.credit.overdue.amount) })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Panel, { title: "\u5BF9\u5916\u62C5\u4FDD", desc: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
          "\u62C5\u4FDD\u8D23\u4EFB \xB7 ",
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Sam, { value: "custProfileData.ts" })
        ] }), children: cur.credit.guarantee.length ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: cur.credit.guarantee.map((g, i) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: "1px dashed #F1F5F9", paddingBottom: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { color: "#64748B" }, children: g.name }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { style: { color: "#334155" }, children: [
            money(g.amount),
            " \xB7 ",
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Badge, { kind: g.status === "\u5173\u6CE8" ? "amber" : "gray", children: g.status })
          ] })
        ] }, i)) }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 13, color: "#94A3B8" }, children: "\u65E0\u5BF9\u5916\u62C5\u4FDD" }) })
      ] })
    ] }),
    tab === "\u8BBE\u5907\u4E0E\u6B3A\u8BC8" && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 14 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u73AF\u5883\u98CE\u9669\u5206", value: String(cur.device.envRiskScore), accent: devDanger ? "rose" : "emerald", hint: "\u8D8A\u9AD8\u8D8A\u5371\u9669" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u6A21\u62DF\u5668", value: cur.device.simulator ? "\u662F" : "\u5426", accent: cur.device.simulator ? "rose" : "emerald", hint: "\u8FD0\u884C\u73AF\u5883" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u540C\u8BBE\u5907\u8D26\u53F7", value: String(cur.device.sameDeviceAccounts.length), accent: cur.device.sameDeviceAccounts.length > 1 ? "rose" : "cyan", hint: "\u56E2\u4F19\u4FE1\u53F7" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u767B\u5F55\u5730\u533A", value: cur.device.loginRegion, accent: "brand", hint: "\u5E38\u7528\u5730" })
      ] }),
      devDanger && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { borderRadius: 12, border: "1px solid #FECACA", background: "#FEF2F2", padding: "10px 14px", fontSize: 13, color: "#B91C1C", marginBottom: 12 }, children: [
        "\u26A0 \u73AF\u5883\u98CE\u9669\u5206 ",
        cur.device.envRiskScore,
        "\uFF08",
        cur.device.simulator ? "\u68C0\u6D4B\u5230\u6A21\u62DF\u5668" : "\u504F\u9AD8",
        "\uFF09\uFF0C\u540C\u8BBE\u5907\u5173\u8054 ",
        cur.device.sameDeviceAccounts.length,
        " \u4E2A\u8D26\u53F7\uFF0C\u7591\u4F3C\u56E2\u4F19\u6B3A\u8BC8\u3002"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Panel, { title: "\u8BBE\u5907\u6307\u7EB9\u4E0E\u767B\u5F55\u73AF\u5883", desc: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
        "\u8BBE\u5907\u53F7 / \u673A\u578B / \u7CFB\u7EDF \xB7 ",
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Sam, { value: "custProfileData.ts" })
      ] }), children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8, fontSize: 13 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #F1F5F9", paddingBottom: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { color: "#94A3B8" }, children: "\u8BBE\u5907" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { color: "#334155", fontWeight: 500 }, children: cur.device.device })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #F1F5F9", paddingBottom: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { color: "#94A3B8" }, children: "\u673A\u578B" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { color: "#334155", fontWeight: 500 }, children: cur.device.model })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #F1F5F9", paddingBottom: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { color: "#94A3B8" }, children: "\u7CFB\u7EDF" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { color: "#334155", fontWeight: 500 }, children: cur.device.os })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #F1F5F9", paddingBottom: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { color: "#94A3B8" }, children: "\u6700\u8FD1\u767B\u5F55" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { color: "#334155", fontWeight: 500 }, children: cur.device.lastLogin })
        ] })
      ] }) }),
      cur.device.sameDeviceAccounts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Panel, { title: "\u540C\u8BBE\u5907\u591A\u8D26\u53F7", desc: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
        "\u540C\u8BBE\u5907\u767B\u5F55\u7684\u5176\u4ED6\u501F\u8D37\u8D26\u53F7 \xB7 ",
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Cal, { label: "\u5B9E\u65F6\u805A\u5408" })
      ] }), className: "mt-3", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        DataTable,
        {
          columns: [{ key: "name", label: "\u59D3\u540D", type: "text", fixed: "left" }, { key: "custId", label: "\u5BA2\u6237\u6807\u8BC6", type: "text" }],
          rows: sameDevRows,
          empty: "\u65E0",
          pager: true,
          defaultPageSize: 8
        }
      ) })
    ] }),
    tab === "\u5916\u90E8\u6570\u636E\u6838\u9A8C" && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 14 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u6838\u9A8C\u6765\u6E90", value: String(cur.externalChecks.length), accent: "violet", hint: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Sam, { label: "\u6837\u4F8B" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u4E00\u81F4", value: String(cur.externalChecks.filter((e) => e.status === "\u4E00\u81F4").length), accent: "emerald", hint: "\u6838\u9A8C\u901A\u8FC7" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u5F02\u5E38", value: String(cur.externalChecks.filter((e) => e.status === "\u5F02\u5E38").length), accent: "rose", hint: "\u9700\u6838\u67E5" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u5F85\u6838", value: String(cur.externalChecks.filter((e) => e.status === "\u5F85\u6838").length), accent: "amber", hint: "\u5904\u7406\u4E2D" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Panel, { title: "\u8DE8\u6E90\u5916\u90E8\u6570\u636E\u6838\u9A8C", desc: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
        "\u5DE5\u5546 / \u53F8\u6CD5 / \u7A0E\u52A1 / \u793E\u4FDD\u516C\u79EF\u91D1 \xB7 ",
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Sam, { value: "custProfileData.ts" })
      ] }), children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(DataTable, { columns: extCols, rows: extRows, empty: "\u65E0\u6838\u9A8C\u6570\u636E", pager: true, defaultPageSize: 8 }) })
    ] }),
    tab === "\u62C5\u4FDD\u4E0E\u7ECF\u8425" && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 14 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u62B5\u62BC\u7269", value: String(cur.collateralBiz.collateral.length), accent: "violet", hint: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Sam, { label: "\u6837\u4F8B" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u62B5\u62BC\u7269\u4EF7\u503C", value: money(cur.collateralBiz.collateral.reduce((s, c) => s + c.value, 0)), accent: "brand", hint: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Cal, { label: "\u5B9E\u65F6\u805A\u5408" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u7ECF\u8425\u5B9E\u4F53", value: String(cur.collateralBiz.business.length), accent: "cyan", hint: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Sam, { label: "\u6837\u4F8B" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u5B9E\u4F53\u72B6\u6001", value: cur.collateralBiz.business.length ? cur.collateralBiz.business[0].status : "\u65E0", accent: "amber", hint: "\u7ECF\u8425\u8D37" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Panel, { title: "\u62C5\u4FDD\u62B5\u62BC\u7269", desc: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
        "\u62B5\u62BC / \u8D28\u62BC\u7269 \xB7 ",
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Sam, { value: "custProfileData.ts" })
      ] }), children: cur.collateralBiz.collateral.length ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: cur.collateralBiz.collateral.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: "1px dashed #F1F5F9", paddingBottom: 4 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { style: { color: "#64748B" }, children: [
          c.name,
          "\uFF08",
          c.type,
          "\uFF09"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { style: { color: "#334155" }, children: [
          money(c.value),
          " \xB7 ",
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Badge, { kind: c.status === "\u8BC4\u4F30\u4E2D" ? "amber" : "gray", children: c.status })
        ] })
      ] }, i)) }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 13, color: "#94A3B8" }, children: "\u65E0\u62C5\u4FDD\u62B5\u62BC\u7269\uFF08\u7EAF\u4FE1\u7528\u5BA2\u6237\uFF09" }) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Panel, { title: "\u7ECF\u8425\u5B9E\u4F53", desc: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
        "\u540D\u4E0B\u7ECF\u8425\u5B9E\u4F53 \xB7 ",
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Sam, { value: "custProfileData.ts" })
      ] }), className: "mt-3", children: cur.collateralBiz.business.length ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: cur.collateralBiz.business.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: "1px dashed #F1F5F9", paddingBottom: 4 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { color: "#64748B" }, children: b.name }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { style: { color: "#334155" }, children: [
          b.role,
          " \xB7 ",
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Badge, { kind: b.status === "\u5B58\u7EED" ? "green" : "gray", children: b.status })
        ] })
      ] }, i)) }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 13, color: "#94A3B8" }, children: "\u65E0\u7ECF\u8425\u5B9E\u4F53" }) })
    ] }),
    tab === "\u5173\u7CFB\u56FE\u8C31" && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Panel, { title: "\u5173\u7CFB\u56FE\u8C31", desc: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
      "\u5173\u7CFB\u7F51\u7EDC\u4E0E\u9AD8\u5371\u6807\u8BB0 \xB7 ",
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Cal, { label: "\u5B9E\u65F6\u805A\u5408" })
    ] }), children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(RelationGraph, { graph: cur.relationGraph }) }),
    tab === "\u591A\u5934\u5171\u503A" && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 14 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u8FD130\u5929\u7533\u8BF7", value: String(cur.coDebt.applications30d), accent: cur.coDebt.applications30d >= 5 ? "rose" : "cyan", hint: "\u591A\u5934\u7533\u8BF7" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u5171\u503A\u673A\u6784", value: String(cur.coDebt.orgs.length), accent: cur.coDebt.orgs.length >= 5 ? "rose" : "amber", hint: "\u5BB6\u6570" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u5171\u503A\u94FE\u6761", value: String(cur.coDebt.chain.length), accent: "violet", hint: "\u94FE\u6761\u6570" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u5728\u8D37\u5171\u503A\u989D", value: money(cur.coDebt.orgs.filter((o) => o.status !== "\u7ED3\u6E05").reduce((s, o) => s + o.balance, 0)), accent: "brand", hint: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Cal, { label: "\u5B9E\u65F6\u805A\u5408" }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Panel, { title: "\u5171\u503A\u673A\u6784\u6E05\u5355", desc: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
        "\u8DE8\u673A\u6784\u5171\u503A\u660E\u7EC6 \xB7 ",
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Cal, { label: "\u5B9E\u65F6\u805A\u5408" })
      ] }), children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        DataTable,
        {
          columns: [
            { key: "org", label: "\u673A\u6784", type: "text", fixed: "left", width: "200px" },
            { key: "product", label: "\u4EA7\u54C1", type: "text", width: "200px" },
            { key: "balance", label: "\u4F59\u989D", type: "money", width: "140px" },
            { key: "status", label: "\u72B6\u6001", type: "badge", badgeKind: "green", width: "110px" }
          ],
          rows: cur.coDebt.orgs.map((o, i) => ({ id: `o${i}`, org: o.org, product: o.product, balance: o.balance, status: { v: o.status, kind: o.status === "\u903E\u671F" ? "red" : o.status === "\u5173\u6CE8" ? "amber" : "green" } })),
          empty: "\u65E0\u5171\u503A",
          pager: true,
          defaultPageSize: 8
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Panel, { title: "\u5171\u503A\u94FE\u6761", desc: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
        "\u8D44\u91D1\u4E2D\u4ECB / \u540C\u8BBE\u5907\u5173\u8054 \xB7 ",
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Cal, { label: "\u5B9E\u65F6\u805A\u5408" })
      ] }), className: "mt-3", children: cur.coDebt.chain.length ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: cur.coDebt.chain.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 13, color: "#334155", borderLeft: "3px solid #DC2626", paddingLeft: 10 }, children: c }, i)) }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 13, color: "#94A3B8" }, children: "\u65E0\u5171\u503A\u94FE\u6761" }) })
    ] }),
    tab === "\u50AC\u6536\u6848\u4EF6" && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 14 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u50AC\u6536\u6848\u4EF6", value: String(cur.collections.length), accent: "violet", hint: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Sam, { label: "\u6837\u4F8B" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "M3+ \u6848\u4EF6", value: String(cur.collections.filter((c) => c.stage === "M3+").length), accent: "rose", hint: "\u91CD\u5EA6\u903E\u671F" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u59D4\u5916/\u6838\u9500", value: String(cur.collections.filter((c) => c.status === "\u59D4\u5916" || c.status === "\u6838\u9500").length), accent: "rose", hint: "\u5916\u7F6E\u5904\u7F6E" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u603B\u903E\u671F\u91D1\u989D", value: money(cur.collections.reduce((s, c) => s + c.overdueAmt, 0)), accent: "brand", hint: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Cal, { label: "\u5B9E\u65F6\u805A\u5408" }) })
      ] }),
      cur.collections.length ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: cur.collections.map((cs) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { border: "1px solid #E2E8F0", borderRadius: 12, padding: "14px 16px" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 10 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { fontSize: 14, fontWeight: 700, color: "#1E293B" }, children: cs.id }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Badge, { kind: STAGE_KIND[cs.stage], children: cs.stage }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { fontSize: 12, color: "#64748B" }, children: cs.product }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Badge, { kind: cs.status === "\u59D4\u5916" || cs.status === "\u6838\u9500" ? "red" : cs.status === "\u627F\u8BFA\u8FD8\u6B3E" ? "green" : "blue", children: cs.status }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { style: { fontSize: 12, color: "#94A3B8", marginLeft: "auto" }, children: [
            "\u50AC\u6536\u5458 ",
            cs.owner,
            " \uFF5C \u6700\u8FD1\u89E6\u8FBE ",
            cs.lastTouch
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 10 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { background: "#F8FAFC", borderRadius: 8, padding: "8px 10px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 11, color: "#94A3B8" }, children: "\u903E\u671F\u91D1\u989D" }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 16, fontWeight: 700, color: "#DC2626" }, children: money(cs.overdueAmt) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { background: "#F8FAFC", borderRadius: 8, padding: "8px 10px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 11, color: "#94A3B8" }, children: "\u903E\u671F\u5929\u6570" }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { fontSize: 16, fontWeight: 700, color: "#1E293B" }, children: [
              cs.overdueDays,
              " \u5929"
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { background: "#F8FAFC", borderRadius: 8, padding: "8px 10px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 11, color: "#94A3B8" }, children: "\u5E94\u8FD8\u65E5" }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 16, fontWeight: 700, color: "#1E293B" }, children: cs.dueDate })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { background: "#F8FAFC", borderRadius: 8, padding: "8px 10px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 11, color: "#94A3B8" }, children: "\u89E6\u8FBE" }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { fontSize: 16, fontWeight: 700, color: "#1E293B" }, children: [
              cs.calls,
              " \u547C / ",
              cs.sms,
              " \u4FE1"
            ] })
          ] })
        ] }),
        cs.notes.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { borderTop: "1px dashed #E2E8F0", paddingTop: 8 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 4 }, children: "\u50AC\u6536\u8BB0\u5F55" }),
          cs.notes.slice(0, 3).map((n, i) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", gap: 8, fontSize: 12, padding: "3px 0", color: "#334155" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { color: "#94A3B8", flexShrink: 0 }, children: n.time }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { color: "#64748B", flexShrink: 0 }, children: n.who }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: n.what })
          ] }, i))
        ] })
      ] }, cs.id)) }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 13, color: "#94A3B8" }, children: "\u8BE5\u5BA2\u6237\u5F53\u524D\u65E0\u50AC\u6536\u6848\u4EF6" })
    ] }),
    tab === "\u8D37\u540E\u98CE\u9669" && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 14 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u8D44\u91D1\u6D41\u5411", value: String(cur.postRisk.fundFlow.length), accent: "cyan", hint: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Cal, { label: "\u5B9E\u65F6\u805A\u5408" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u9ED1\u540D\u5355\u547D\u4E2D", value: String(cur.postRisk.blacklist.filter((b) => b.status !== "\u6B63\u5E38").length), accent: "rose", hint: "\u53CD\u6B3A\u8BC8" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u5F02\u5E38\u6D41\u5411", value: String(cur.postRisk.fundFlow.filter((f) => f.flag.includes("\u7591\u4F3C") || f.flag.includes("\u4E0D\u660E")).length), accent: "amber", hint: "\u9700\u6838\u67E5" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(StatCard, { label: "\u76D1\u63A7\u540D\u5355", value: String(cur.postRisk.blacklist.length), accent: "violet", hint: "\u540D\u5355\u6570" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Panel, { title: "\u8D44\u91D1\u6D41\u5411\u76D1\u63A7", desc: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
        "\u8D37\u540E\u8D44\u91D1\u6D41\u5411\u4E0E\u6807\u8BB0 \xB7 ",
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Cal, { label: "\u5B9E\u65F6\u805A\u5408" })
      ] }), children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
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
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Panel, { title: "\u9ED1\u540D\u5355\u53CD\u6B3A\u8BC8", desc: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
        "\u672C\u884C / \u4E92\u91D1\u534F\u4F1A\u7B49\u540D\u5355 \xB7 ",
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Cal, { label: "\u5B9E\u65F6\u805A\u5408" })
      ] }), className: "mt-3", children: cur.postRisk.blacklist.length ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: cur.postRisk.blacklist.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: "1px dashed #F1F5F9", paddingBottom: 4 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { style: { color: "#64748B" }, children: [
          b.list,
          "\uFF1A",
          b.hit
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Badge, { kind: b.status === "\u6B63\u5E38" ? "green" : b.status === "\u9AD8\u98CE\u9669" ? "red" : "amber", children: b.status })
      ] }, i)) }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 13, color: "#94A3B8" }, children: "\u672A\u547D\u4E2D\u9ED1\u540D\u5355" }) })
    ] }),
    tab === "\u5904\u7F6E\u4E0E\u64CD\u4F5C\u65E5\u5FD7" && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Panel, { title: "\u5904\u7F6E\u4E0E\u64CD\u4F5C\u65E5\u5FD7", desc: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
      "\u5904\u7F6E\u5DE5\u5355 + \u5386\u53F2\u64CD\u4F5C\u8BB0\u5F55 \xB7 ",
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Sam, { value: "custProfileData.ts" })
    ] }), children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Timeline, { items: cur.disposeLog }) })
  ] });
}

// /tmp/cprof-test/entry.tsx
var container = document.createElement("div");
document.body.appendChild(container);
try {
  import_react_dom2.default.render(import_react5.default.createElement(CustProfile), container);
  setTimeout(() => {
    const len = container.innerHTML.length;
    console.log("RENDER_OK html_len=" + len);
    if (len < 200) console.log("WARN: rendered html suspiciously small");
  }, 200);
} catch (e) {
  console.log("RENDER_ERROR: " + (e && e.stack ? e.stack : e));
}
