import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef } from "react";
const TYPE_COLOR = {
  self: "#8B5CF6",
  person: "#7C3AED",
  company: "#2563EB",
  account: "#0EA5E9",
  device: "#F59E0B",
  product: "#10B981",
  org: "#64748B"
};
const TYPE_LABEL = {
  self: "\u672C\u4EBA",
  person: "\u4E2A\u4EBA",
  company: "\u4F01\u4E1A",
  account: "\u8D26\u6237",
  device: "\u8BBE\u5907",
  product: "\u4EA7\u54C1",
  org: "\u673A\u6784"
};
const THEME_COLOR = {
  \u5BB6\u65CF: "#7C3AED",
  \u793E\u4EA4: "#0EA5E9",
  \u8D44\u91D1: "#10B981",
  \u7ECF\u8425: "#2563EB",
  \u5171\u503A: "#DC2626",
  \u62C5\u4FDD: "#D97706",
  \u8BBE\u5907: "#F59E0B"
};
const GROUP_PRIORITY = ["\u7ECF\u8425", "\u5171\u503A", "\u62C5\u4FDD", "\u5BB6\u65CF", "\u793E\u4EA4", "\u8BBE\u5907", "\u8D44\u91D1"];
function primaryGroup(nodeId, edges, theme) {
  if (theme !== "\u7EFC\u5408") return theme;
  const selfEdges = edges.filter(
    (e) => e.source === "self" && e.target === nodeId || e.target === "self" && e.source === nodeId
  );
  for (const g of GROUP_PRIORITY) if (selfEdges.some((e) => e.theme === g)) return g;
  if (selfEdges.length) return selfEdges[0].theme;
  const any = edges.find((e) => e.source === nodeId || e.target === nodeId);
  return any ? any.theme : "\u793E\u4EA4";
}
function chipW(name) {
  return Math.min(128, 26 + [...name].length * 11);
}
function RelationGraphView({
  graph,
  theme,
  onTheme,
  sel,
  onPick,
  nodeMap
}) {
  const W = 820;
  const H = 520;
  const cx = W / 2;
  const cy = H / 2;
  const { nodes, pos, highRisk } = useMemo(() => {
    const active2 = theme === "\u7EFC\u5408" ? graph.edges : graph.edges.filter((e) => e.theme === theme);
    const activeIds = /* @__PURE__ */ new Set(["self"]);
    active2.forEach((e) => {
      activeIds.add(e.source);
      activeIds.add(e.target);
    });
    const ns = graph.nodes.filter((n) => activeIds.has(n.id));
    const ps = {};
    const self = ns.find((n) => n.type === "self");
    if (self) ps[self.id] = { x: cx, y: cy };
    const grp = {};
    ns.filter((n) => n.type !== "self").forEach((n) => {
      const g = primaryGroup(n.id, active2, theme);
      (grp[g] ??= []).push(n);
    });
    const order = (theme === "\u7EFC\u5408" ? Object.keys(THEME_COLOR) : [theme]).filter(
      (g) => (grp[g]?.length ?? 0) > 0
    );
    const total = order.reduce((s, g) => s + Math.sqrt(grp[g].length), 0) || 1;
    let angle = -Math.PI / 2;
    const R1 = 140;
    const R2 = 214;
    order.forEach((g) => {
      const cnt = grp[g].length;
      const span = Math.sqrt(cnt) / total * Math.PI * 2;
      const start = angle + span * 0.14;
      const end = angle + span * 0.86;
      grp[g].forEach((n, i) => {
        const t = cnt === 1 ? 0.5 : i / (cnt - 1);
        const a = start + t * (end - start);
        const ring = i % 2 === 0 ? R1 : R2;
        ps[n.id] = { x: cx + Math.cos(a) * ring, y: cy + Math.sin(a) * ring };
      });
      angle += span;
    });
    const hr = ns.filter((n) => n.risk === "\u9AD8\u5371").length;
    return { nodes: ns, pos: ps, highRisk: hr };
  }, [graph, theme]);
  const persons = useMemo(() => nodes.filter((n) => n.type !== "self"), [nodes]);
  const rowRefs = useRef({});
  useEffect(() => {
    if (sel?.kind === "node") rowRefs.current[sel.node.id]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [sel]);
  const themeList = graph.themes ?? ["\u7EFC\u5408"];
  const active = theme === "\u7EFC\u5408" ? graph.edges : graph.edges.filter((e) => e.theme === theme);
  const edgePath = (ax, ay, bx, by) => {
    const mx = (ax + bx) / 2;
    const my = (ay + by) / 2;
    const dx = mx - cx;
    const dy = my - cy;
    const len = Math.hypot(dx, dy) || 1;
    const push = Math.min(44, len * 0.16);
    const cxp = mx + dx / len * push;
    const cyp = my + dy / len * push;
    return `M ${ax} ${ay} Q ${cxp} ${cyp} ${bx} ${by}`;
  };
  return /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }, children: [
    /* @__PURE__ */ jsxs("div", { style: { flex: "1 1 520px", minWidth: 480, position: "relative" }, children: [
      /* @__PURE__ */ jsxs(
        "div",
        {
          style: {
            display: "flex",
            flexWrap: "wrap",
            gap: 14,
            alignItems: "center",
            fontSize: 12,
            color: "#64748B",
            marginBottom: 10
          },
          children: [
            /* @__PURE__ */ jsxs("span", { children: [
              "\u{1F552} \u91C7\u96C6\u65F6\u95F4\uFF1A",
              /* @__PURE__ */ jsx("b", { style: { color: "#334155" }, children: graph.collectedAt })
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              "\u{1F4E1} \u6765\u6E90\uFF1A",
              /* @__PURE__ */ jsx("b", { style: { color: "#334155" }, children: graph.source })
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              "\u8282\u70B9 ",
              /* @__PURE__ */ jsx("b", { style: { color: "#334155" }, children: nodes.length })
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              "\u5173\u7CFB ",
              /* @__PURE__ */ jsx("b", { style: { color: "#334155" }, children: active.length })
            ] }),
            highRisk > 0 && /* @__PURE__ */ jsxs("span", { style: { color: "#DC2626", fontWeight: 600 }, children: [
              "\u9AD8\u5371\u8282\u70B9 ",
              highRisk
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 10 }, children: [
        /* @__PURE__ */ jsx("span", { style: { fontSize: 12, color: "#94A3B8", marginRight: 2 }, children: "\u56FE\u8C31\u4E3B\u9898" }),
        themeList.map((th) => {
          const on = th === theme;
          const col = THEME_COLOR[th] ?? "#8B5CF6";
          return /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => {
                onTheme(th);
                onPick(null);
              },
              style: {
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                padding: "5px 12px",
                borderRadius: 999,
                border: `1px solid ${on ? col : "#E2E8F0"}`,
                background: on ? col : "#fff",
                color: on ? "#fff" : THEME_COLOR[th] ?? "#475569",
                cursor: "pointer",
                fontWeight: on ? 600 : 500
              },
              children: [
                !on && /* @__PURE__ */ jsx(
                  "span",
                  {
                    style: { width: 7, height: 7, borderRadius: "50%", background: col, display: "inline-block" }
                  }
                ),
                th
              ]
            },
            th
          );
        })
      ] }),
      /* @__PURE__ */ jsxs(
        "svg",
        {
          viewBox: `0 0 ${W} ${H}`,
          style: {
            width: "100%",
            height: "auto",
            background: "radial-gradient(circle at 50% 45%, #FBFCFE 0%, #EEF2F7 100%)",
            borderRadius: 14,
            border: "1px solid #E2E8F0",
            display: "block"
          },
          onClick: () => onPick(null),
          children: [
            active.map((e, i) => {
              const a = pos[e.source];
              const b = pos[e.target];
              if (!a || !b) return null;
              const inc = sel?.kind === "node" && (e.source === sel.node.id || e.target === sel.node.id);
              const isSel = sel?.kind === "edge" && sel.edge === e;
              const dim = sel ? !inc && !isSel : false;
              const col = e.danger ? "#DC2626" : THEME_COLOR[e.theme] ?? "#CBD5E1";
              const d = edgePath(a.x, a.y, b.x, b.y);
              const mx = (a.x + b.x) / 2;
              const my = (a.y + b.y) / 2;
              return /* @__PURE__ */ jsxs(
                "g",
                {
                  style: { cursor: "pointer" },
                  onClick: (ev) => {
                    ev.stopPropagation();
                    onPick({ kind: "edge", edge: e });
                  },
                  children: [
                    /* @__PURE__ */ jsx(
                      "path",
                      {
                        d,
                        fill: "none",
                        stroke: col,
                        strokeWidth: isSel ? 3 : inc ? 2.4 : e.danger ? 1.8 : 1.2,
                        strokeDasharray: e.danger ? "5 3" : void 0,
                        strokeOpacity: dim ? 0.14 : inc || isSel ? 1 : 0.62
                      }
                    ),
                    /* @__PURE__ */ jsx("path", { d, fill: "none", stroke: "transparent", strokeWidth: 14 }),
                    e.danger && /* @__PURE__ */ jsx(
                      "text",
                      {
                        x: mx,
                        y: my - 4,
                        textAnchor: "middle",
                        fontSize: 9,
                        fontWeight: 700,
                        fill: "#DC2626",
                        style: { paintOrder: "stroke", stroke: "#fff", strokeWidth: 3 },
                        children: e.rel
                      }
                    )
                  ]
                },
                i
              );
            }),
            nodes.map((n) => {
              const p = pos[n.id];
              if (!p) return null;
              const c = TYPE_COLOR[n.type] ?? "#64748B";
              const isSelf = n.type === "self";
              const seld = sel?.kind === "node" && sel.node.id === n.id;
              const w = isSelf ? Math.min(150, 34 + [...n.name].length * 13) : chipW(n.name);
              const h = isSelf ? 36 : 28;
              return /* @__PURE__ */ jsxs(
                "g",
                {
                  transform: `translate(${p.x},${p.y})`,
                  style: { cursor: "pointer" },
                  onClick: (ev) => {
                    ev.stopPropagation();
                    onPick({ kind: "node", node: n });
                  },
                  children: [
                    seld && /* @__PURE__ */ jsx(
                      "rect",
                      {
                        x: -w / 2 - 5,
                        y: -h / 2 - 5,
                        width: w + 10,
                        height: h + 10,
                        rx: 16,
                        fill: "none",
                        stroke: c,
                        strokeWidth: 2,
                        strokeOpacity: 0.5
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "rect",
                      {
                        x: -w / 2,
                        y: -h / 2,
                        width: w,
                        height: h,
                        rx: isSelf ? 18 : 14,
                        fill: isSelf ? c : "#fff",
                        stroke: c,
                        strokeWidth: seld ? 2.2 : n.risk === "\u9AD8\u5371" ? 1.8 : 1.3,
                        strokeDasharray: n.risk === "\u5173\u6CE8" ? "4 2" : void 0
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "circle",
                      {
                        cx: -w / 2 + (isSelf ? 16 : 14),
                        cy: 0,
                        r: isSelf ? 6 : 5,
                        fill: isSelf ? "#fff" : c,
                        stroke: isSelf ? "rgba(255,255,255,.6)" : "none"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "text",
                      {
                        x: -w / 2 + (isSelf ? 30 : 26),
                        y: isSelf ? 5 : 4,
                        fontSize: isSelf ? 13 : 11.5,
                        fontWeight: 600,
                        fill: isSelf ? "#fff" : "#334155",
                        children: n.name
                      }
                    ),
                    !!n.openAlerts && /* @__PURE__ */ jsxs("g", { children: [
                      /* @__PURE__ */ jsx("circle", { cx: w / 2 - 12, cy: -h / 2 + 12, r: 8, fill: "#DC2626", stroke: "#fff", strokeWidth: 1.5 }),
                      /* @__PURE__ */ jsx(
                        "text",
                        {
                          x: w / 2 - 12,
                          y: -h / 2 + 15.5,
                          textAnchor: "middle",
                          fontSize: 10,
                          fontWeight: 700,
                          fill: "#fff",
                          children: n.openAlerts
                        }
                      )
                    ] }),
                    n.risk === "\u9AD8\u5371" && !n.openAlerts && /* @__PURE__ */ jsx("circle", { cx: w / 2 - 10, cy: -h / 2 + 10, r: 5, fill: "#DC2626", stroke: "#fff", strokeWidth: 1.5 })
                  ]
                },
                n.id
              );
            })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 14, fontSize: 11, color: "#64748B", marginTop: 10, flexWrap: "wrap" }, children: [
        Object.keys(TYPE_COLOR).filter((k) => k !== "self").map((k) => /* @__PURE__ */ jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 }, children: [
          /* @__PURE__ */ jsx("span", { style: { width: 9, height: 9, borderRadius: "50%", background: TYPE_COLOR[k], display: "inline-block" } }),
          TYPE_LABEL[k] ?? k
        ] }, k)),
        /* @__PURE__ */ jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 }, children: [
          /* @__PURE__ */ jsx("span", { style: { width: 16, height: 0, borderTop: "2px dashed #DC2626", display: "inline-block" } }),
          "\u9AD8\u5371 / \u98CE\u9669\u5173\u7CFB"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(RelSide, { persons, sel, nodeMap, onPick, rowRefs })
  ] });
}
function KV({ k, v, danger }) {
  return /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 10, padding: "3px 0", fontSize: 12 }, children: [
    /* @__PURE__ */ jsx("span", { style: { color: "#94A3B8" }, children: k }),
    /* @__PURE__ */ jsx("span", { style: { color: danger ? "#DC2626" : "#334155", fontWeight: 500, textAlign: "right" }, children: v })
  ] });
}
function RelDetail({
  sel,
  nodeMap,
  onClose
}) {
  if (!sel) {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          border: "1px dashed #CBD5E1",
          borderRadius: 12,
          padding: "16px",
          fontSize: 12,
          color: "#94A3B8",
          background: "#F8FAFC",
          lineHeight: 1.6
        },
        children: [
          "\u70B9\u51FB\u5DE6\u4FA7\u56FE\u8C31\u4E2D\u7684 ",
          /* @__PURE__ */ jsx("b", { style: { color: "#8B5CF6" }, children: "\u8282\u70B9" }),
          " \u6216 ",
          /* @__PURE__ */ jsx("b", { style: { color: "#DC2626" }, children: "\u5173\u7CFB" }),
          "\uFF0C\u6216\u4E0B\u65B9\u6E05\u5355\u4E2D\u7684\u4EFB\u4E00\u5173\u7CFB\u4EBA\uFF0C\u67E5\u770B\u5BF9\u8C61\u5C5E\u6027\u3002"
        ]
      }
    );
  }
  if (sel.kind === "node") {
    const n = sel.node;
    return /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          background: "#fff",
          border: "1px solid #E2E8F0",
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(15,23,42,.1)",
          padding: "12px 14px"
        },
        children: [
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }, children: [
            /* @__PURE__ */ jsx("span", { style: { fontSize: 14, fontWeight: 700, color: "#0F172A" }, children: n.name }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: onClose,
                style: { border: "none", background: "none", cursor: "pointer", color: "#94A3B8", fontSize: 16, lineHeight: 1 },
                children: "\xD7"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(KV, { k: "\u7C7B\u578B", v: TYPE_LABEL[n.type] ?? n.type }),
          /* @__PURE__ */ jsx(KV, { k: "\u5173\u7CFB", v: n.rel }),
          n.risk && /* @__PURE__ */ jsx(KV, { k: "\u98CE\u9669\u7B49\u7EA7", v: n.risk, danger: n.risk !== "\u6B63\u5E38" }),
          n.phone && /* @__PURE__ */ jsx(KV, { k: "\u8054\u7CFB\u7535\u8BDD", v: n.phone }),
          n.openAlerts != null && /* @__PURE__ */ jsx(KV, { k: "\u5173\u8054\u9884\u8B66", v: `${n.openAlerts} \u6761`, danger: n.openAlerts > 0 }),
          n.detail && /* @__PURE__ */ jsx(KV, { k: "\u8BF4\u660E", v: n.detail })
        ]
      }
    );
  }
  const e = sel.edge;
  const sName = nodeMap[e.source]?.name ?? e.source;
  const tName = nodeMap[e.target]?.name ?? e.target;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      style: {
        background: "#fff",
        border: "1px solid #E2E8F0",
        borderRadius: 12,
        boxShadow: "0 8px 24px rgba(15,23,42,.1)",
        padding: "12px 14px"
      },
      children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }, children: [
          /* @__PURE__ */ jsx("span", { style: { fontSize: 14, fontWeight: 700, color: "#0F172A" }, children: "\u5173\u7CFB\u5C5E\u6027" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: onClose,
              style: { border: "none", background: "none", cursor: "pointer", color: "#94A3B8", fontSize: 16, lineHeight: 1 },
              children: "\xD7"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(KV, { k: "\u5173\u7CFB\u7C7B\u578B", v: e.rel, danger: e.danger }),
        /* @__PURE__ */ jsx(KV, { k: "\u8D77\u70B9", v: sName }),
        /* @__PURE__ */ jsx(KV, { k: "\u7EC8\u70B9", v: tName }),
        /* @__PURE__ */ jsx(KV, { k: "\u6240\u5C5E\u4E3B\u9898", v: e.theme }),
        /* @__PURE__ */ jsx(KV, { k: "\u98CE\u9669\u6807\u8BB0", v: e.danger ? "\u9AD8\u5371 / \u98CE\u9669\u8FB9" : "\u6B63\u5E38", danger: e.danger })
      ]
    }
  );
}
function RelSide({
  persons,
  sel,
  nodeMap,
  onPick,
  rowRefs
}) {
  return /* @__PURE__ */ jsxs("div", { style: { flex: "0 0 320px", minWidth: 280, display: "flex", flexDirection: "column", gap: 10 }, children: [
    /* @__PURE__ */ jsx(RelDetail, { sel, nodeMap, onClose: () => onPick(null) }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          fontSize: 12,
          color: "#64748B",
          fontWeight: 600,
          display: "flex",
          justifyContent: "space-between"
        },
        children: [
          /* @__PURE__ */ jsx("span", { children: "\u5173\u7CFB\u4EBA\u6E05\u5355" }),
          /* @__PURE__ */ jsxs("span", { children: [
            persons.length,
            " \u4EBA"
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: 6, maxHeight: 430, overflowY: "auto", paddingRight: 4 }, children: persons.map((n) => {
      const seld = sel?.kind === "node" && sel.node.id === n.id;
      const c = TYPE_COLOR[n.type] ?? "#64748B";
      return /* @__PURE__ */ jsxs(
        "div",
        {
          ref: (el) => {
            rowRefs.current[n.id] = el;
          },
          onClick: () => onPick({ kind: "node", node: n }),
          style: {
            border: `1px solid ${seld ? "#8B5CF6" : "#E2E8F0"}`,
            borderLeft: `3px solid ${c}`,
            borderRadius: 10,
            padding: "8px 10px",
            background: seld ? "#F5F3FF" : n.risk === "\u9AD8\u5371" ? "#FEF2F2" : "#fff",
            cursor: "pointer"
          },
          children: [
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }, children: [
              /* @__PURE__ */ jsx("span", { style: { fontSize: 13, fontWeight: 600, color: "#334155" }, children: n.name }),
              /* @__PURE__ */ jsx("span", { style: { fontSize: 11, color: c }, children: TYPE_LABEL[n.type] ?? n.type })
            ] }),
            /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: "#94A3B8", marginTop: 3 }, children: [
              n.rel,
              n.risk && n.risk !== "\u6B63\u5E38" ? ` \xB7 ${n.risk}` : ""
            ] }),
            n.detail && /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: "#94A3B8", marginTop: 2, lineHeight: 1.45 }, children: n.detail })
          ]
        },
        n.id
      );
    }) })
  ] });
}
export {
  RelationGraphView
};
