"use strict";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DetailHeader, Panel, Badge } from "../components/ui";
import ScoreGauge from "../components/ScoreGauge";
import { LineChart } from "../components/charts";
import { Sam } from "./SourceTag";
import { PageShell } from "./PageShell";
import { useMidCustomers, useMidAlerts } from "./midStore";
import { useFlows, matchFlowGraph } from "./flowStore";
import { models } from "./data";
const PROD_KEYS = ["zhicha", "zhixin", "zhirong"];
const PROD_META = {
  zhicha: { label: "\u667A\u5BDF\u5206", sub: "\u53CD\u6B3A\u8BC8", color: "#ef4444", danger: true },
  zhixin: { label: "\u667A\u4FE1\u5206", sub: "\u4FE1\u7528", color: "#16a34a", danger: false },
  zhirong: { label: "\u667A\u878D\u5206", sub: "\u7EFC\u5408", color: "#8b5cf6", danger: false }
};
const LEVEL_COLOR = { \u9AD8: "#DC2626", \u4E2D: "#D97706", \u4F4E: "#16A34A" };
const TAG_KIND = {
  \u547D\u4E2D: "red",
  \u5173\u6CE8: "amber",
  \u8BC4\u5206\u9879: "blue",
  \u878D\u5408\u6765\u6E90: "violet"
};
const DIM_LABEL = {
  \u8D1F\u503A: "\u8D1F\u503A\u6C34\u5E73",
  \u591A\u5934: "\u591A\u5934\u501F\u8D37",
  \u6B3A\u8BC8: "\u6B3A\u8BC8\u98CE\u9669",
  \u53F8\u6CD5: "\u53F8\u6CD5\u6D89\u8BC9",
  \u884C\u4E3A: "\u884C\u4E3A\u8BC4\u5206",
  \u8206\u60C5: "\u8206\u60C5\u98CE\u9669"
};
const DIM_WEIGHT = { \u6B3A\u8BC8: 0.3, \u591A\u5934: 0.25, \u884C\u4E3A: 0.2, \u53F8\u6CD5: 0.15, \u8D1F\u503A: 0.1, \u8206\u60C5: 0.05 };
function deriveFallback(cust, prod) {
  const dims = cust.riskDims ?? [];
  const used = dims.filter((d) => DIM_WEIGHT[d.dim] != null);
  if (!used.length) return null;
  const wsum = used.reduce((s, d) => s + DIM_WEIGHT[d.dim], 0);
  const riskAvg = used.reduce((s, d) => s + d.score * DIM_WEIGHT[d.dim], 0) / wsum;
  let score, range, unit, hint;
  if (prod === "zhicha") {
    score = Math.round(riskAvg);
    range = [0, 100];
    unit = "\u6B3A\u8BC8\u5206";
    hint = "\u6B3A\u8BC8\u98CE\u9669\u8BC4\u5206\uFF0C\u5206\u6570\u8D8A\u9AD8\u6B3A\u8BC8\u98CE\u9669\u8D8A\u5927";
  } else if (prod === "zhixin") {
    score = Math.round(900 - riskAvg * 3.4);
    range = [300, 900];
    unit = "\u4FE1\u7528\u5206";
    hint = "\u4FE1\u7528\u8BC4\u5206\uFF0C\u5206\u6570\u8D8A\u9AD8\u4FE1\u7528\u8D8A\u597D";
  } else {
    score = Math.round(900 - riskAvg * 3.8);
    range = [300, 900];
    unit = "\u7EFC\u5408\u5206";
    hint = "\u7EFC\u5408\u98CE\u9669\u4E0E\u4EF7\u503C\u8BC4\u5206\uFF0C\u5206\u6570\u8D8A\u9AD8\u7EFC\u5408\u8868\u73B0\u8D8A\u597D";
  }
  score = Math.max(range[0], Math.min(range[1], score));
  const total = used.reduce((s, d) => s + d.score, 0) || 1;
  const factors = used.map((d) => ({
    name: DIM_LABEL[d.dim] ?? d.dim,
    level: d.score >= 75 ? "\u9AD8" : d.score >= 55 ? "\u4E2D" : "\u4F4E",
    contribution: Math.round(d.score / total * 100)
  })).sort((a, b) => b.contribution - a.contribution);
  const evidence = (cust.alerts ?? []).slice(0, 6).map((a) => ({
    name: a.ruleName,
    value: `${a.scene} \xB7 \u89E6\u53D1\u503C ${a.metricValue}\uFF08\u9608\u503C ${a.threshold}\uFF09\xB7 \u5F53\u524D${a.status}`,
    weight: a.level === "RED" ? 24 : a.level === "YELLOW" ? 16 : 10,
    tag: a.level === "RED" ? "\u547D\u4E2D" : a.level === "YELLOW" ? "\u5173\u6CE8" : "\u8BC4\u5206\u9879"
  }));
  return { score, range, unit, hint, factors, evidence: evidence.length ? evidence : void 0 };
}
function bandOf(item) {
  const s = item.score;
  const hi = item.range[1] > 100;
  if (hi) {
    if (s >= 780) return "A";
    if (s >= 660) return "B";
    if (s >= 580) return "C";
    return "D";
  }
  if (s >= 70) return "\u9AD8";
  if (s >= 40) return "\u4E2D";
  return "\u4F4E";
}
const GRADE_LABEL = { A: "\u4F18\u8D28", B: "\u826F\u597D", C: "\u4E00\u822C", D: "\u8F83\u5DEE", \u9AD8: "\u9AD8\u98CE\u9669", \u4E2D: "\u4E2D\u98CE\u9669", \u4F4E: "\u4F4E\u98CE\u9669" };
function enrich(item, prod) {
  const band = bandOf(item);
  const score = item.score;
  const isFraud = prod === "zhicha";
  const probability = item.probability ?? (isFraud ? score >= 70 ? "72.5%" : score >= 40 ? "38.2%" : "9.6%" : band === "A" ? "3.1%" : band === "B" ? "6.8%" : band === "C" ? "14.2%" : "26.5%");
  const grade = item.grade ?? band;
  const gradeLabel = item.gradeLabel ?? GRADE_LABEL[band] ?? "";
  const suggestion = item.suggestion ?? (isFraud ? score >= 70 ? "\u5EFA\u8BAE\u62D2\u7EDD / \u8F6C\u4EBA\u5DE5\u590D\u6838" : score >= 40 ? "\u5EFA\u8BAE\u4EBA\u5DE5\u590D\u6838" : "\u901A\u8FC7\uFF08\u7EE7\u7EED\u51C6\u5165\u8BC4\u4F30\uFF09" : band === "A" ? "\u5EFA\u8BAE\u51C6\u5165\uFF08\u6807\u51C6\u989D\u5EA6\uFF09" : band === "B" ? "\u5EFA\u8BAE\u51C6\u5165\uFF08\u5BA1\u614E\u6388\u4FE1\uFF09" : band === "C" ? "\u5EFA\u8BAE\u964D\u989D / \u52A0\u5F3A\u76D1\u6D4B" : "\u5EFA\u8BAE\u62D2\u7EDD");
  const modelVersion = item.modelVersion ?? (prod === "zhicha" ? "\u667A\u5BDFV3.2" : prod === "zhixin" ? "\u667A\u4FE1V4.0" : "\u667A\u878DV2.1");
  const calcedAt = item.calcedAt ?? "2026-08-08 10:30:12";
  const evidence = item.evidence && item.evidence.length ? item.evidence : prod === "zhicha" ? [
    { name: "\u591A\u5934\u501F\u8D37\u5F3A\u5EA6", value: "\u8FD130\u5929\u7533\u8D37 7 \u5BB6\uFF08\u9608\u503C\u22655\uFF09", weight: 28, tag: "\u547D\u4E2D" },
    { name: "\u8BBE\u5907\u73AF\u5883\u98CE\u9669", value: "\u6A21\u62DF\u5668\u7279\u5F81\u547D\u4E2D", weight: 22, tag: "\u547D\u4E2D" },
    { name: "\u547D\u4E2D\u7070\u540D\u5355", value: "\u5916\u90E8\u7070\u540D\u5355 ID#88231", weight: 20, tag: "\u547D\u4E2D" },
    { name: "\u540C\u8BBE\u5907\u5173\u8054\u8D26\u53F7", value: "3 \u4E2A\u5173\u8054\u8D26\u53F7", weight: 18, tag: "\u5173\u6CE8" }
  ] : prod === "zhixin" ? [
    { name: "\u5386\u53F2\u903E\u671F\u8BB0\u5F55", value: "\u8FD12\u5E74 M3+ 1 \u6B21", weight: 26, tag: "\u8BC4\u5206\u9879" },
    { name: "\u8D1F\u503A\u6536\u5165\u6BD4", value: "58%\uFF08\u9608\u503C 70%\uFF09", weight: 22, tag: "\u8BC4\u5206\u9879" },
    { name: "\u5F81\u4FE1\u67E5\u8BE2\u9891\u6B21", value: "\u8FD16\u6708 8 \u6B21", weight: 18, tag: "\u8BC4\u5206\u9879" },
    { name: "\u6536\u5165\u7A33\u5B9A\u6027", value: "\u8FDE\u7EED 14 \u6708\u7A33\u5B9A", weight: 20, tag: "\u8BC4\u5206\u9879" }
  ] : [
    { name: "\u8FDD\u7EA6\u7EF4\u5EA6", value: "\u5F15\u7528 \xB7 \u667A\u4FE1\u5206\uFF08\u4FE1\u7528\u5206 712\uFF09", weight: 34, tag: "\u878D\u5408\u6765\u6E90" },
    { name: "\u6B3A\u8BC8\u7EF4\u5EA6", value: "\u5F15\u7528 \xB7 \u667A\u5BDF\u5206\uFF08\u6B3A\u8BC8\u5206 78\uFF09", weight: 28, tag: "\u878D\u5408\u6765\u6E90" },
    { name: "\u4EF7\u503C\u7EF4\u5EA6", value: "\u81EA\u6709 \xB7 \u501F\u8D37\u5174\u8DA3\uFF08\u8FD130\u5929\u6D3B\u8DC3 18 \u5929\uFF09", weight: 24, tag: "\u878D\u5408\u6765\u6E90" },
    { name: "\u8D44\u4EA7\u7EF4\u5EA6", value: "\u81EA\u6709 \xB7 \u8D44\u4EA7\u753B\u50CF\uFF08\u623F\u4EA7 + \u7406\u8D22\u6301\u4ED3\uFF09", weight: 14, tag: "\u878D\u5408\u6765\u6E90" }
  ];
  return { ...item, probability, grade, gradeLabel, suggestion, modelVersion, calcedAt, evidence };
}
const THRESHOLDS = {
  zhicha: [
    { range: "0 - 39", grade: "\u4F4E\u98CE\u9669", label: "\u65E0\u660E\u663E\u6B3A\u8BC8\u7279\u5F81", color: "#16A34A", action: "\u901A\u8FC7\uFF08\u7EE7\u7EED\u51C6\u5165/\u8D37\u4E2D\u8BC4\u4F30\uFF09" },
    { range: "40 - 69", grade: "\u4E2D\u98CE\u9669", label: "\u5B58\u5728\u90E8\u5206\u98CE\u9669\u4FE1\u53F7", color: "#D97706", action: "\u4EBA\u5DE5\u590D\u6838 / \u52A0\u5F3A\u76D1\u6D4B" },
    { range: "70 - 100", grade: "\u9AD8\u98CE\u9669", label: "\u6B3A\u8BC8\u7279\u5F81\u663E\u8457", color: "#DC2626", action: "\u62D2\u7EDD / \u8F6C\u4EBA\u5DE5\u590D\u6838 / \u51BB\u7ED3\u6B62\u4ED8" }
  ],
  zhixin: [
    { range: "780 - 900", grade: "A \xB7 \u4F18\u8D28", label: "\u8FDD\u7EA6\u6982\u7387\u4F4E", color: "#16A34A", action: "\u51C6\u5165\uFF08\u6807\u51C6\u989D\u5EA6\uFF09" },
    { range: "660 - 779", grade: "B \xB7 \u826F\u597D", label: "\u8FDD\u7EA6\u6982\u7387\u8F83\u4F4E", color: "#65A30D", action: "\u51C6\u5165\uFF08\u5BA1\u614E\u6388\u4FE1\uFF09" },
    { range: "580 - 659", grade: "C \xB7 \u4E00\u822C", label: "\u8FDD\u7EA6\u6982\u7387\u4E2D\u7B49", color: "#D97706", action: "\u964D\u989D / \u52A0\u5F3A\u76D1\u6D4B" },
    { range: "300 - 579", grade: "D \xB7 \u8F83\u5DEE", label: "\u8FDD\u7EA6\u6982\u7387\u9AD8", color: "#DC2626", action: "\u62D2\u7EDD / \u51BB\u7ED3" }
  ],
  zhirong: [
    { range: "780 - 900", grade: "A \xB7 \u4F18\u8D28", label: "\u7EFC\u5408\u98CE\u9669\u4F4E\u3001\u4EF7\u503C\u9AD8", color: "#16A34A", action: "\u51C6\u5165\uFF08\u6807\u51C6\u989D\u5EA6\uFF09" },
    { range: "660 - 779", grade: "B \xB7 \u826F\u597D", label: "\u7EFC\u5408\u8868\u73B0\u826F\u597D", color: "#65A30D", action: "\u51C6\u5165\uFF08\u5BA1\u614E\u6388\u4FE1\uFF09" },
    { range: "580 - 659", grade: "C \xB7 \u4E00\u822C", label: "\u7EFC\u5408\u8868\u73B0\u4E00\u822C", color: "#D97706", action: "\u964D\u989D / \u52A0\u5F3A\u76D1\u6D4B" },
    { range: "300 - 579", grade: "D \xB7 \u8F83\u5DEE", label: "\u7EFC\u5408\u98CE\u9669\u9AD8", color: "#DC2626", action: "\u62D2\u7EDD / \u51BB\u7ED3" }
  ]
};
function bandOfScore(prod, score) {
  const rows = THRESHOLDS[prod];
  const parse = (r) => Number(r.split(" - ")[0]);
  for (let i = rows.length - 1; i >= 0; i--) {
    if (score >= parse(rows[i].range)) return rows[i];
  }
  return rows[0];
}
const PROD_TO_MODEL = { zhicha: "M-\u667A\u5BDF\u5206", zhixin: "M-\u667A\u4FE1\u5206", zhirong: "M-\u667A\u878D\u5206" };
const MODEL_CAPA = {
  zhicha: {
    method: "XGBoost + \u89C4\u5219\u5F15\u64CE\u878D\u5408\uFF1A\u57FA\u4E8E 2019\u20132025 \u5E74\u5386\u53F2\u6B3A\u8BC8\u6837\u672C\u8BAD\u7EC3\uFF0C\u53E0\u52A0\u53CD\u6B3A\u8BC8\u4E13\u5BB6\u89C4\u5219\u4E0E\u4EBA\u5DE5\u590D\u6838\u5E72\u9884",
    owner: "\u53CD\u6B3A\u8BC8\u6A21\u578B\u7EC4 \xB7 \u5468\u660E",
    applicable: "\u5168\u4EA7\u54C1\u8D37\u524D/\u8D37\u4E2D\u53CD\u6B3A\u8BC8\u7B5B\u67E5",
    psi: 0.08,
    monitor: "\u65E5\u7EA7 PSI \u76D1\u63A7\uFF0C\u9608\u503C 0.25 \u89E6\u53D1\u544A\u8B66\u590D\u6838",
    lineage: [
      { stage: "\u6570\u636E\u63A5\u5165", detail: "\u8BBE\u5907\u6307\u7EB9 / \u591A\u5934\u501F\u8D37 / \u9ED1\u7070\u540D\u5355 / \u7533\u8BF7\u884C\u4E3A\uFF08\u8F93\u5165\u6570\u636E\u7248\u672C 2026Q2\uFF09" },
      { stage: "\u7279\u5F81\u5DE5\u7A0B", detail: "36 \u4E2A\u53CD\u6B3A\u8BC8\u7279\u5F81\uFF08\u805A\u96C6\u5EA6\u3001\u7533\u8BF7\u9891\u6B21\u3001\u73AF\u5883\u98CE\u9669\u2026\uFF09" },
      { stage: "\u6A21\u578B\u8BA1\u7B97", detail: "\u667A\u5BDF\u5206 V3.2\uFF08XGBoost\uFF09\u8F93\u51FA 0\u2013100 \u6B3A\u8BC8\u5206" },
      { stage: "\u4E13\u5BB6\u89C4\u5219", detail: "\u53E0\u52A0\u4E13\u5BB6\u89C4\u5219\u4E0E\u4EBA\u5DE5\u590D\u6838\uFF0C\u5F62\u6210\u6700\u7EC8\u6B3A\u8BC8\u5206" }
    ],
    global: [{ name: "\u8BBE\u5907\u805A\u96C6", importance: 24 }, { name: "\u7533\u8BF7\u9891\u6B21", importance: 21 }, { name: "\u9ED1\u4EA7\u7279\u5F81", importance: 16 }, { name: "\u540C\u8BBE\u5907\u5173\u8054", importance: 12 }, { name: "IP/\u5B9A\u4F4D\u5F02\u5E38", importance: 10 }],
    versions: [
      { version: "V3.2", date: "2026-04-18", note: "\u65B0\u589E\u8BBE\u5907\u805A\u96C6\u7279\u5F81\uFF0C\u63D0\u5347\u6A21\u62DF\u5668\u8BC6\u522B\u51C6\u786E\u7387\uFF1B\u591A\u5934\u9608\u503C\u7531 \u22656 \u8C03\u6574\u4E3A \u22655\uFF0C\u964D\u4F4E\u6F0F\u62A5" },
      { version: "V3.1", date: "2025-11-02", note: "\u8C03\u6574\u7533\u8BF7\u9891\u6B21\u6743\u91CD\uFF0C\u51CF\u5C11\u65FA\u5B63\u8BEF\u62A5\uFF1B\u8865\u5145\u7070\u540D\u5355\u5173\u8054\u89C4\u5219" },
      { version: "V3.0", date: "2025-06-15", note: "\u57FA\u7EBF\u7248\u672C\uFF08XGBoost + \u89C4\u5219\u5F15\u64CE\u878D\u5408\uFF09\uFF0C36 \u4E2A\u53CD\u6B3A\u8BC8\u7279\u5F81" }
    ]
  },
  zhixin: {
    method: "LightGBM \u8BC4\u5206\u5361\uFF1A\u57FA\u4E8E\u8FD1 5 \u5E74\u4FE1\u8D37\u8868\u73B0\u6837\u672C\u8BAD\u7EC3\uFF0C\u53E0\u52A0\u4FE1\u7528\u4E13\u5BB6\u89C4\u5219\u4E0E\u4EBA\u5DE5\u590D\u6838\u5E72\u9884",
    owner: "\u4FE1\u7528\u6A21\u578B\u7EC4 \xB7 \u674E\u822A",
    applicable: "\u4FE1\u7528\u8D37/\u6D88\u8D39\u8D37\u6388\u4FE1\u4E0E\u5B9A\u4EF7",
    psi: 0.06,
    monitor: "\u5468\u7EA7 PSI \u76D1\u63A7\uFF0C\u9608\u503C 0.20 \u89E6\u53D1\u544A\u8B66\u590D\u6838",
    lineage: [
      { stage: "\u6570\u636E\u63A5\u5165", detail: "\u4EBA\u884C\u5F81\u4FE1 / \u8D1F\u503A\u7ED3\u6784 / \u6536\u5165\u6D41\u6C34 / \u5386\u53F2\u8FD8\u6B3E\uFF08\u8F93\u5165\u6570\u636E\u7248\u672C 2026Q2\uFF09" },
      { stage: "\u7279\u5F81\u5DE5\u7A0B", detail: "42 \u4E2A\u4FE1\u7528\u7279\u5F81\uFF08\u903E\u671F\u5386\u53F2\u3001\u8D1F\u503A\u6BD4\u3001\u7A33\u5B9A\u6027\u2026\uFF09" },
      { stage: "\u6A21\u578B\u8BA1\u7B97", detail: "\u667A\u4FE1\u5206 V4.0\uFF08LightGBM\uFF09\u8F93\u51FA 300\u2013900 \u4FE1\u7528\u5206" },
      { stage: "\u4E13\u5BB6\u89C4\u5219", detail: "\u53E0\u52A0\u4E13\u5BB6\u89C4\u5219\u4E0E\u4EBA\u5DE5\u590D\u6838\uFF0C\u5F62\u6210\u6700\u7EC8\u4FE1\u7528\u5206" }
    ],
    global: [{ name: "\u5386\u53F2\u8FD8\u6B3E", importance: 28 }, { name: "\u8D1F\u503A\u7ED3\u6784", importance: 22 }, { name: "\u6536\u5165\u7A33\u5B9A", importance: 20 }, { name: "\u5F81\u4FE1\u67E5\u8BE2", importance: 14 }, { name: "\u804C\u4E1A\u5C5E\u6027", importance: 9 }],
    versions: [
      { version: "V4.0", date: "2026-03-10", note: "\u5F15\u5165\u6536\u5165\u6D41\u6C34\u7279\u5F81\uFF0812 \u4E2A\u6708\uFF09\uFF0C\u7279\u5F81\u6269\u81F3 42 \u4E2A\uFF1B\u91CD\u65B0\u6821\u51C6\u8FDD\u7EA6\u6982\u7387\u8F93\u51FA" },
      { version: "V3.9", date: "2025-10-21", note: "\u8D1F\u503A\u6536\u5165\u6BD4\u9608\u503C\u7531 75% \u6536\u7D27\u81F3 70%\uFF1B\u4FEE\u590D\u4F4E\u5206\u6BB5\u6982\u7387\u504F\u79FB" },
      { version: "V3.8", date: "2025-05-08", note: "\u57FA\u7EBF\u7248\u672C\uFF08LightGBM \u8BC4\u5206\u5361\uFF09\uFF0C38 \u4E2A\u4FE1\u7528\u7279\u5F81" }
    ]
  },
  zhirong: {
    method: "\u878D\u5408\u6A21\u578B\uFF1A\u5F15\u7528\u667A\u4FE1\u5206(\u4FE1\u7528) + \u667A\u5BDF\u5206(\u6B3A\u8BC8) + \u4EF7\u503C/\u8D44\u4EA7\u81EA\u6709\u7279\u5F81\uFF0C\u903B\u8F91\u56DE\u5F52\u878D\u5408",
    owner: "\u7EFC\u5408\u6A21\u578B\u7EC4 \xB7 \u9648\u7490",
    applicable: "\u7EFC\u5408\u6388\u4FE1\u4E0E\u989D\u5EA6\u6838\u5B9A",
    psi: 0.1,
    monitor: "\u65E5\u7EA7 PSI \u76D1\u63A7\uFF0C\u9608\u503C 0.25 \u89E6\u53D1\u544A\u8B66\u590D\u6838",
    lineage: [
      { stage: "\u6570\u636E\u63A5\u5165", detail: "\u667A\u4FE1\u5206 / \u667A\u5BDF\u5206 / \u4EF7\u503C\u4E0E\u8D44\u4EA7\u7279\u5F81\uFF08\u8F93\u5165\u6570\u636E\u7248\u672C 2026Q2\uFF09" },
      { stage: "\u7279\u5F81\u5DE5\u7A0B", detail: "\u8FDD\u7EA6\u7EF4\u5EA6 + \u6B3A\u8BC8\u7EF4\u5EA6 + \u4EF7\u503C\u7EF4\u5EA6 + \u8D44\u4EA7\u7EF4\u5EA6" },
      { stage: "\u6A21\u578B\u8BA1\u7B97", detail: "\u667A\u878D\u5206 V2.1\uFF08\u878D\u5408\u903B\u8F91\u56DE\u5F52\uFF09\u8F93\u51FA 300\u2013900 \u7EFC\u5408\u5206" },
      { stage: "\u4E13\u5BB6\u89C4\u5219", detail: "\u53E0\u52A0\u4E13\u5BB6\u89C4\u5219\u4E0E\u4EBA\u5DE5\u590D\u6838\uFF0C\u5F62\u6210\u6700\u7EC8\u7EFC\u5408\u5206" }
    ],
    global: [{ name: "\u8FDD\u7EA6\u7EF4\u5EA6", importance: 34 }, { name: "\u6B3A\u8BC8\u7EF4\u5EA6", importance: 28 }, { name: "\u4EF7\u503C\u7EF4\u5EA6", importance: 24 }, { name: "\u8D44\u4EA7\u7EF4\u5EA6", importance: 14 }],
    versions: [
      { version: "V2.1", date: "2026-02-06", note: "\u8C03\u6574\u667A\u4FE1\u5206/\u667A\u5BDF\u5206\u878D\u5408\u6743\u91CD\uFF08\u4FE1\u7528 0.55 / \u6B3A\u8BC8 0.45\uFF09\uFF1B\u52A0\u5165\u501F\u8D37\u5174\u8DA3\u4EF7\u503C\u7279\u5F81" },
      { version: "V2.0", date: "2025-12-01", note: "\u57FA\u7EBF\u878D\u5408\u7248\u672C\uFF08\u903B\u8F91\u56DE\u5F52\u878D\u5408\u667A\u4FE1\u5206 + \u667A\u5BDF\u5206 + \u4EF7\u503C/\u8D44\u4EA7\u7279\u5F81\uFF09" }
    ]
  }
};
const MODEL_OPS = {
  zhicha: {
    metrics: [
      { label: "\u8BC4\u5206\u8986\u76D6\u7387", value: "98.5%", sub: "\u6709\u8BC4\u5206\u5BA2\u6237 / \u603B\u5BA2\u6237", color: "#2563EB" },
      { label: "\u9884\u8B66\u51C6\u786E\u7387", value: "86.2%", sub: "\u9884\u8B66\u540E\u6838\u5B9E\u4E3A\u771F\u5B9E\u6B3A\u8BC8", color: "#16A34A" },
      { label: "\u5904\u7F6E\u53CA\u65F6\u7387", value: "92.0%", sub: "\u89C4\u5B9A\u65F6\u9650\u5185\u5B8C\u6210\u5904\u7F6E", color: "#7C3AED" },
      { label: "\u672C\u6708\u8C03\u7528", value: "12,480 \u6B21", sub: "\u6A21\u578B\u8BC4\u5206\u8C03\u7528\u603B\u91CF", color: "#D97706" }
    ],
    trend: [
      { month: "03\u6708", coverage: 97.2, accuracy: 82.1, timely: 88.5 },
      { month: "04\u6708", coverage: 97.8, accuracy: 83.5, timely: 89.2 },
      { month: "05\u6708", coverage: 98.1, accuracy: 84.2, timely: 90.1 },
      { month: "06\u6708", coverage: 98.3, accuracy: 85, timely: 91 },
      { month: "07\u6708", coverage: 98.4, accuracy: 85.8, timely: 91.6 },
      { month: "08\u6708", coverage: 98.5, accuracy: 86.2, timely: 92 }
    ]
  },
  zhixin: {
    metrics: [
      { label: "\u8BC4\u5206\u8986\u76D6\u7387", value: "99.1%", sub: "\u6709\u8BC4\u5206\u5BA2\u6237 / \u603B\u5BA2\u6237", color: "#2563EB" },
      { label: "\u9884\u8B66\u51C6\u786E\u7387", value: "88.5%", sub: "\u9884\u8B66\u540E\u6838\u5B9E\u4E3A\u771F\u5B9E\u98CE\u9669", color: "#16A34A" },
      { label: "\u5904\u7F6E\u53CA\u65F6\u7387", value: "94.3%", sub: "\u89C4\u5B9A\u65F6\u9650\u5185\u5B8C\u6210\u5904\u7F6E", color: "#7C3AED" },
      { label: "\u672C\u6708\u8C03\u7528", value: "18,620 \u6B21", sub: "\u6A21\u578B\u8BC4\u5206\u8C03\u7528\u603B\u91CF", color: "#D97706" }
    ],
    trend: [
      { month: "03\u6708", coverage: 98.5, accuracy: 85, timely: 91.2 },
      { month: "04\u6708", coverage: 98.7, accuracy: 86.1, timely: 92 },
      { month: "05\u6708", coverage: 98.9, accuracy: 87, timely: 92.8 },
      { month: "06\u6708", coverage: 99, accuracy: 87.8, timely: 93.5 },
      { month: "07\u6708", coverage: 99, accuracy: 88.2, timely: 94 },
      { month: "08\u6708", coverage: 99.1, accuracy: 88.5, timely: 94.3 }
    ]
  },
  zhirong: {
    metrics: [
      { label: "\u8BC4\u5206\u8986\u76D6\u7387", value: "95.8%", sub: "\u6709\u8BC4\u5206\u5BA2\u6237 / \u603B\u5BA2\u6237", color: "#2563EB" },
      { label: "\u9884\u8B66\u51C6\u786E\u7387", value: "83.6%", sub: "\u9884\u8B66\u540E\u6838\u5B9E\u4E3A\u771F\u5B9E\u98CE\u9669", color: "#16A34A" },
      { label: "\u5904\u7F6E\u53CA\u65F6\u7387", value: "90.1%", sub: "\u89C4\u5B9A\u65F6\u9650\u5185\u5B8C\u6210\u5904\u7F6E", color: "#7C3AED" },
      { label: "\u672C\u6708\u8C03\u7528", value: "8,360 \u6B21", sub: "\u6A21\u578B\u8BC4\u5206\u8C03\u7528\u603B\u91CF", color: "#D97706" }
    ],
    trend: [
      { month: "03\u6708", coverage: 94.2, accuracy: 79.5, timely: 86.8 },
      { month: "04\u6708", coverage: 94.8, accuracy: 80.8, timely: 87.5 },
      { month: "05\u6708", coverage: 95.2, accuracy: 81.9, timely: 88.3 },
      { month: "06\u6708", coverage: 95.5, accuracy: 82.8, timely: 89.2 },
      { month: "07\u6708", coverage: 95.7, accuracy: 83.3, timely: 89.7 },
      { month: "08\u6708", coverage: 95.8, accuracy: 83.6, timely: 90.1 }
    ]
  }
};
const MODEL_DIM_DEFS = {
  zhicha: [
    { dim: "\u591A\u5934\u805A\u96C6", from: "\u591A\u5934", fb: 60 },
    // 近30天申贷/在贷平台 → 多头聚集
    { dim: "\u8BBE\u5907\u73AF\u5883", from: "\u6B3A\u8BC8", fb: 65 },
    // 模拟器/设备指纹 → 设备环境
    { dim: "\u7533\u8BF7\u884C\u4E3A", from: "\u884C\u4E3A", fb: 55 },
    // 申请频次/征信查询 → 申请行为
    { dim: "\u9ED1\u4EA7\u5173\u8054", from: "\u53F8\u6CD5", fb: 50 },
    // 黑灰名单 → 黑产关联
    { dim: "\u7F51\u7EDC\u5173\u8054", from: "\u591A\u5934", fb: 45 },
    // 同设备/关联账号 → 网络关联
    { dim: "\u53F8\u6CD5\u6D89\u8BC9", from: "\u53F8\u6CD5", fb: 50 }
    // 被执行/失信 → 司法涉诉
  ],
  zhixin: [
    { dim: "\u8FD8\u6B3E\u8BB0\u5F55", from: "\u884C\u4E3A", fb: 60 },
    // 历史逾期/还款表现 → 还款记录
    { dim: "\u8D1F\u503A\u7ED3\u6784", from: "\u8D1F\u503A", fb: 62 },
    // 负债收入比/在贷余额 → 负债结构
    { dim: "\u6536\u5165\u7A33\u5B9A", from: "\u884C\u4E3A", fb: 50 },
    // 流水连续性 → 收入稳定
    { dim: "\u5F81\u4FE1\u884C\u4E3A", from: "\u591A\u5934", fb: 45 },
    // 查询频次/账户数 → 征信行为
    { dim: "\u804C\u4E1A\u7A33\u5B9A", fb: 40 },
    // 司龄/社保 → 职业稳定
    { dim: "\u53F8\u6CD5\u6D89\u8BC9", from: "\u53F8\u6CD5", fb: 50 }
    // 被执行/失信 → 司法涉诉
  ],
  zhirong: [
    { dim: "\u4FE1\u7528\u98CE\u9669", from: "\u8D1F\u503A", fb: 60 },
    // 引用智信分 → 信用风险
    { dim: "\u6B3A\u8BC8\u98CE\u9669", from: "\u6B3A\u8BC8", fb: 65 },
    // 引用智察分 → 欺诈风险
    { dim: "\u4EF7\u503C\u6F5C\u529B", from: "\u884C\u4E3A", fb: 45 },
    // 借贷兴趣/活跃 → 价值潜力
    { dim: "\u8D44\u4EA7\u5B9E\u529B", fb: 40 },
    // 房产/理财 → 资产实力
    { dim: "\u7528\u4FE1\u7A33\u5B9A", from: "\u591A\u5934", fb: 50 }
    // 用信习惯/共债 → 用信稳定
  ]
};
function dimsOf(prod, riskDims) {
  return MODEL_DIM_DEFS[prod].map((x) => {
    const score = (x.from && riskDims.find((d) => d.dim === x.from)?.score) ?? x.fb;
    return { dim: x.dim, score, lvl: score >= 75 ? "\u9AD8" : score >= 55 ? "\u4E2D" : "\u4F4E" };
  });
}
function CapCell({ label, value, danger }) {
  return /* @__PURE__ */ jsxs("div", { style: { background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 10px" }, children: [
    /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: "#94A3B8" }, children: label }),
    /* @__PURE__ */ jsx("div", { style: { fontSize: 13, fontWeight: 600, color: danger ? "#DC2626" : "#1E293B", marginTop: 2 }, children: value })
  ] });
}
const INPUT_DETAILS = {
  zhicha: [
    {
      name: "\u8FD130\u5929\u7533\u8D37\u7B14\u6570",
      source: "\u591A\u5934\u501F\u8D37\u6570\u636E",
      window: "2026-07-10 ~ 08-08",
      value: "7 \u7B14\uFF08\u9608\u503C \u22655\uFF09",
      status: "\u89E6\u53D1",
      feat: "\u591A\u5934\u805A\u96C6",
      detailTitle: "\u7533\u8D37\u8BB0\u5F55\uFF08\u8FD1 30 \u5929 \xB7 \u9010\u7B14\uFF09",
      cols: ["\u7533\u8BF7\u65E5\u671F", "\u673A\u6784", "\u4EA7\u54C1", "\u72B6\u6001"],
      rows: [
        ["07-12", "\u67D0\u94F6\u884C", "\u6D88\u8D39\u8D37", "\u5DF2\u653E\u6B3E"],
        ["07-15", "\u67D0\u6D88\u8D39\u91D1\u878D", "\u73B0\u91D1\u8D37", "\u5DF2\u653E\u6B3E"],
        ["07-18", "\u67D0\u7F51\u8D37\u5E73\u53F0", "\u5C0F\u989D\u8D37", "\u62D2\u7EDD"],
        ["07-23", "\u67D0\u94F6\u884C", "\u4FE1\u7528\u8D37", "\u5BA1\u6279\u4E2D"],
        ["07-27", "\u67D0\u6D88\u91D1", "\u5FAA\u73AF\u989D\u5EA6", "\u5DF2\u653E\u6B3E"],
        ["08-02", "\u67D0\u5E73\u53F0", "\u73B0\u91D1\u5206\u671F", "\u5BA1\u6279\u4E2D"],
        ["08-06", "\u67D0\u94F6\u884C", "\u6D88\u8D39\u5206\u671F", "\u7533\u8BF7"]
      ]
    },
    {
      name: "\u540C\u65F6\u5728\u8D37\u5E73\u53F0\u6570",
      source: "\u591A\u5934\u501F\u8D37\u6570\u636E",
      window: "\u5F53\u524D\u65F6\u70B9",
      value: "5 \u5BB6\uFF08\u9608\u503C \u22654\uFF09",
      status: "\u89E6\u53D1",
      feat: "\u591A\u5934\u805A\u96C6",
      detailTitle: "\u5728\u8D37\u5E73\u53F0\uFF08\u5F53\u524D\uFF09",
      cols: ["\u5E73\u53F0", "\u5728\u8D37\u4F59\u989D", "\u72B6\u6001"],
      rows: [
        ["\u5E73\u53F0A", "\xA512,000", "\u6B63\u5E38"],
        ["\u5E73\u53F0B", "\xA58,500", "\u6B63\u5E38"],
        ["\u5E73\u53F0C", "\xA515,000", "\u5173\u6CE8\uFF08\u8FD130\u5929\u6709\u7533\u8BF7\uFF09"],
        ["\u5E73\u53F0D", "\xA56,000", "\u6B63\u5E38"],
        ["\u5E73\u53F0E", "\xA520,000", "\u6B63\u5E38"]
      ]
    },
    {
      name: "\u8BBE\u5907\u73AF\u5883",
      source: "\u8BBE\u5907\u6307\u7EB9",
      window: "\u7533\u8BF7\u65F6\u70B9",
      value: "\u6A21\u62DF\u5668\u7279\u5F81\u547D\u4E2D",
      status: "\u89E6\u53D1",
      feat: "\u8BBE\u5907\u73AF\u5883",
      detailTitle: "\u8BBE\u5907\u6307\u7EB9\uFF08\u7533\u8BF7\u65F6\u70B9\u91C7\u96C6\uFF09",
      cols: ["\u68C0\u6D4B\u9879", "\u7ED3\u679C"],
      rows: [
        ["\u8BBE\u5907\u6307\u7EB9", "DEV-A3F8-9C21\uFF08\u8FD130\u5929 3 \u53F0\u5173\u8054\u8BBE\u5907\uFF09"],
        ["\u73AF\u5883\u7279\u5F81", "\u6A21\u62DF\u5668\u7279\u5F81\u547D\u4E2D\uFF08\u7F6E\u4FE1\u5EA6 0.92\uFF09"],
        ["IP \u5F52\u5C5E", "202.xx.xx.16 \xB7 \u5F02\u5730\uFF08\u4E0E\u5E38\u9A7B\u5730\u4E0D\u7B26\uFF09"]
      ]
    },
    {
      name: "\u9ED1\u540D\u5355\u547D\u4E2D",
      source: "\u9ED1\u7070\u540D\u5355\u5E93",
      window: "\u5F53\u524D",
      value: "\u5916\u90E8\u7070\u540D\u5355 ID#88231",
      status: "\u89E6\u53D1",
      feat: "\u9ED1\u4EA7\u5173\u8054",
      detailTitle: "\u540D\u5355\u547D\u4E2D\uFF08\u9ED1\u7070\u540D\u5355\u5E93\u8BB0\u5F55\uFF09",
      cols: ["\u9879", "\u5185\u5BB9"],
      rows: [
        ["\u540D\u5355\u7C7B\u578B", "\u5916\u90E8\u7070\u540D\u5355\uFF08\u4E92\u91D1\u534F\u4F1A\u5171\u4EAB\uFF09"],
        ["\u540D\u5355\u7F16\u53F7", "ID#88231"],
        ["\u5165\u540D\u5355\u539F\u56E0", "2025-11 \u7591\u4F3C\u7EC4\u56E2\u7533\u8D37"],
        ["\u547D\u4E2D\u65F6\u70B9", "2026-08-08 10:30:12"]
      ]
    },
    {
      name: "\u540C\u8BBE\u5907\u5173\u8054\u8D26\u53F7",
      source: "\u8D26\u53F7\u5173\u7CFB\u56FE\u8C31",
      window: "\u5F53\u524D",
      value: "3 \u4E2A\uFF08\u9608\u503C \u22655 \u89E6\u53D1\uFF09",
      status: "\u5173\u6CE8",
      feat: "\u7F51\u7EDC\u5173\u8054",
      detailTitle: "\u540C\u8BBE\u5907\u8D26\u53F7\uFF08\u8BBE\u5907\u7EF4\u5EA6\u5173\u8054\uFF09",
      cols: ["\u8D26\u53F7", "\u5173\u7CFB", "\u98CE\u9669"],
      rows: [
        ["\u5F20*\u660E", "\u672C\u4EBA", "\u6B63\u5E38"],
        ["\u738B*\u82B3", "\u540C\u8BBE\u5907\u767B\u5F55 2 \u6B21", "\u5173\u6CE8"],
        ["\u674E*\u534E", "\u540C\u8BBE\u5907\u767B\u5F55 1 \u6B21", "\u5173\u6CE8"]
      ]
    },
    {
      name: "\u5F81\u4FE1\u67E5\u8BE2\u6B21\u6570",
      source: "\u4EBA\u884C\u5F81\u4FE1",
      window: "\u8FD1 6 \u6708",
      value: "8 \u6B21\uFF08\u9608\u503C \u226510\uFF09",
      status: "\u6B63\u5E38",
      feat: "\u7533\u8BF7\u884C\u4E3A",
      detailTitle: "\u5F81\u4FE1\u67E5\u8BE2\u8BB0\u5F55\uFF08\u8FD1 6 \u6708 \xB7 \u9010\u7B14\uFF09",
      cols: ["\u67E5\u8BE2\u65E5\u671F", "\u67E5\u8BE2\u673A\u6784", "\u67E5\u8BE2\u7C7B\u578B"],
      rows: [
        ["03-02", "\u67D0\u94F6\u884C", "\u8D37\u524D\u5BA1\u6279\uFF08\u4FE1\u7528\u5361\uFF09"],
        ["03-15", "\u67D0\u6D88\u8D39\u91D1\u878D", "\u8D37\u524D\u5BA1\u6279"],
        ["04-11", "\u67D0\u94F6\u884C", "\u8D37\u524D\u5BA1\u6279\uFF08\u8D37\u6B3E\uFF09"],
        ["05-06", "\u67D0\u6D88\u91D1", "\u8D37\u524D\u5BA1\u6279"],
        ["06-20", "\u672C\u4EBA", "\u672C\u4EBA\u67E5\u8BE2"],
        ["07-08", "\u67D0\u7F51\u8D37\u5E73\u53F0", "\u8D37\u524D\u5BA1\u6279"],
        ["07-22", "\u67D0\u94F6\u884C", "\u8D37\u540E\u7BA1\u7406"],
        ["08-02", "\u67D0\u6D88\u8D39\u91D1\u878D", "\u8D37\u540E\u7BA1\u7406"]
      ]
    },
    {
      name: "\u6536\u5165\u6D41\u6C34\u7A33\u5B9A\u6027",
      source: "\u94F6\u884C\u6D41\u6C34",
      window: "\u8FD1 12 \u6708",
      value: "\u8FDE\u7EED 14 \u6708\u7A33\u5B9A",
      status: "\u6B63\u5E38",
      feat: "\u2014",
      detailTitle: "\u6536\u5165\u6D41\u6C34\uFF08\u8FD1 12 \u6708\u6C47\u603B\uFF09",
      cols: ["\u9879", "\u503C"],
      rows: [
        ["\u6708\u5747\u5165\u8D26", "\xA518,000\uFF08\u4EE3\u53D1\u5DE5\u8D44\uFF09"],
        ["\u8FDE\u7EED\u5165\u8D26\u6708\u6570", "14 \u4E2A\u6708"],
        ["\u5927\u989D\u5F02\u52A8", "\u65E0"]
      ]
    },
    {
      name: "\u53F8\u6CD5\u6D89\u8BC9",
      source: "\u53F8\u6CD5\u6570\u636E",
      window: "\u8FD1 2 \u5E74",
      value: "\u65E0\u8BB0\u5F55",
      status: "\u6B63\u5E38",
      feat: "\u53F8\u6CD5\u6D89\u8BC9",
      detailTitle: "\u6D89\u8BC9\u8BB0\u5F55\uFF08\u8FD1 2 \u5E74\uFF09",
      cols: ["\u7C7B\u578B", "\u7ED3\u679C"],
      rows: [
        ["\u88AB\u6267\u884C", "\u65E0\u8BB0\u5F55"],
        ["\u5931\u4FE1\u540D\u5355", "\u65E0\u8BB0\u5F55"],
        ["\u5F00\u5EAD\u516C\u544A", "\u65E0\u8BB0\u5F55"]
      ]
    }
  ],
  zhixin: [
    {
      name: "\u5386\u53F2\u903E\u671F\u8BB0\u5F55",
      source: "\u4EBA\u884C\u5F81\u4FE1",
      window: "\u8FD1 2 \u5E74",
      value: "M3+ \u903E\u671F 1 \u6B21",
      status: "\u89E6\u53D1",
      feat: "\u8FD8\u6B3E\u8BB0\u5F55",
      detailTitle: "\u903E\u671F\u8BB0\u5F55\uFF08\u8FD1 2 \u5E74 \xB7 \u9010\u7B14\uFF09",
      cols: ["\u65E5\u671F", "\u8D26\u6237", "\u660E\u7EC6"],
      rows: [
        ["2024-09", "\u67D0\u94F6\u884C\u4FE1\u7528\u5361", "\u903E\u671F 95 \u5929\uFF08M3+\uFF09"],
        ["2024-12", "\u67D0\u6D88\u91D1", "\u903E\u671F 12 \u5929\uFF08M1\uFF09\u5DF2\u7ED3\u6E05"],
        ["2025-06", "\u67D0\u5E73\u53F0", "\u903E\u671F 5 \u5929\uFF08\u5DF2\u7ED3\u6E05\uFF09"]
      ]
    },
    {
      name: "\u8D1F\u503A\u6536\u5165\u6BD4",
      source: "\u5F81\u4FE1 + \u6536\u5165\u6D41\u6C34",
      window: "\u5F53\u524D",
      value: "58%\uFF08\u9608\u503C 70%\uFF09",
      status: "\u5173\u6CE8",
      feat: "\u8D1F\u503A\u7ED3\u6784",
      detailTitle: "\u8D1F\u503A\u6784\u6210\uFF08\u5F53\u524D\uFF09",
      cols: ["\u9879", "\u503C"],
      rows: [
        ["\u6708\u6536\u5165", "\xA518,000"],
        ["\u6708\u8FD8\u6B3E\u989D", "\xA510,440"],
        ["\u8D1F\u503A\u6536\u5165\u6BD4", "58%"],
        ["\u5728\u8D37\u4F59\u989D\u5408\u8BA1", "\xA561,500"]
      ]
    },
    {
      name: "\u5F81\u4FE1\u67E5\u8BE2\u9891\u6B21",
      source: "\u4EBA\u884C\u5F81\u4FE1",
      window: "\u8FD1 6 \u6708",
      value: "8 \u6B21\uFF08\u9608\u503C \u226510\uFF09",
      status: "\u6B63\u5E38",
      feat: "\u5F81\u4FE1\u884C\u4E3A",
      detailTitle: "\u5F81\u4FE1\u67E5\u8BE2\u8BB0\u5F55\uFF08\u8FD1 6 \u6708 \xB7 \u9010\u7B14\uFF09",
      cols: ["\u67E5\u8BE2\u65E5\u671F", "\u67E5\u8BE2\u673A\u6784", "\u67E5\u8BE2\u7C7B\u578B"],
      rows: [
        ["03-02", "\u67D0\u94F6\u884C", "\u8D37\u524D\u5BA1\u6279\uFF08\u4FE1\u7528\u5361\uFF09"],
        ["03-15", "\u67D0\u6D88\u8D39\u91D1\u878D", "\u8D37\u524D\u5BA1\u6279"],
        ["04-11", "\u67D0\u94F6\u884C", "\u8D37\u524D\u5BA1\u6279\uFF08\u8D37\u6B3E\uFF09"],
        ["05-06", "\u67D0\u6D88\u91D1", "\u8D37\u524D\u5BA1\u6279"],
        ["06-20", "\u672C\u4EBA", "\u672C\u4EBA\u67E5\u8BE2"],
        ["07-08", "\u67D0\u7F51\u8D37\u5E73\u53F0", "\u8D37\u524D\u5BA1\u6279"],
        ["07-22", "\u67D0\u94F6\u884C", "\u8D37\u540E\u7BA1\u7406"],
        ["08-02", "\u67D0\u6D88\u8D39\u91D1\u878D", "\u8D37\u540E\u7BA1\u7406"]
      ]
    },
    {
      name: "\u6536\u5165\u7A33\u5B9A\u6027",
      source: "\u94F6\u884C\u6D41\u6C34",
      window: "\u8FD1 12 \u6708",
      value: "\u8FDE\u7EED 14 \u6708\u7A33\u5B9A",
      status: "\u6B63\u5E38",
      feat: "\u6536\u5165\u7A33\u5B9A",
      detailTitle: "\u6536\u5165\u6D41\u6C34\uFF08\u8FD1 12 \u6708\u6C47\u603B\uFF09",
      cols: ["\u9879", "\u503C"],
      rows: [
        ["\u6708\u5747\u5165\u8D26", "\xA518,000\uFF08\u4EE3\u53D1\u5DE5\u8D44\uFF09"],
        ["\u8FDE\u7EED\u5165\u8D26\u6708\u6570", "14 \u4E2A\u6708"],
        ["\u5927\u989D\u5F02\u52A8", "\u65E0"]
      ]
    },
    {
      name: "\u804C\u4E1A\u5C5E\u6027",
      source: "\u7533\u8BF7\u4FE1\u606F",
      window: "\u5F53\u524D",
      value: "\u5236\u9020\u4E1A \xB7 \u5728\u804C",
      status: "\u6B63\u5E38",
      feat: "\u804C\u4E1A\u7A33\u5B9A",
      detailTitle: "\u804C\u4E1A\u4FE1\u606F\uFF08\u7533\u8BF7\u65F6\u70B9\uFF09",
      cols: ["\u9879", "\u503C"],
      rows: [
        ["\u5355\u4F4D", "\u67D0\u5236\u9020\u96C6\u56E2\uFF08\u5728\u804C 4 \u5E74\uFF09"],
        ["\u5C97\u4F4D", "\u751F\u4EA7\u7BA1\u7406"],
        ["\u793E\u4FDD\u7F34\u7EB3", "\u8FDE\u7EED 36 \u4E2A\u6708"]
      ]
    },
    {
      name: "\u53F8\u6CD5\u6D89\u8BC9",
      source: "\u53F8\u6CD5\u6570\u636E",
      window: "\u8FD1 2 \u5E74",
      value: "\u65E0\u8BB0\u5F55",
      status: "\u6B63\u5E38",
      feat: "\u53F8\u6CD5\u6D89\u8BC9",
      detailTitle: "\u6D89\u8BC9\u8BB0\u5F55\uFF08\u8FD1 2 \u5E74\uFF09",
      cols: ["\u7C7B\u578B", "\u7ED3\u679C"],
      rows: [
        ["\u88AB\u6267\u884C", "\u65E0\u8BB0\u5F55"],
        ["\u5931\u4FE1\u540D\u5355", "\u65E0\u8BB0\u5F55"]
      ]
    }
  ],
  zhirong: [
    {
      name: "\u6B3A\u8BC8\u7EF4\u5EA6\uFF08\u5F15\u7528\u667A\u5BDF\u5206\uFF09",
      source: "\u667A\u5BDF\u5206",
      window: "\u672C\u6B21\u8BC4\u5206",
      value: "\u6B3A\u8BC8\u5206 78",
      status: "\u89E6\u53D1",
      feat: "\u6B3A\u8BC8\u98CE\u9669",
      detailTitle: "\u667A\u5BDF\u5206\u5F15\u7528\uFF08\u672C\u6B21\u8BC4\u5206\uFF09",
      cols: ["\u9879", "\u503C"],
      rows: [
        ["\u6B3A\u8BC8\u5206", "78\uFF08\u9AD8\u98CE\u9669\u6863\uFF09"],
        ["\u4E3B\u8981\u89E6\u53D1", "\u591A\u5934\u501F\u8D37\u5F3A\u5EA6 28% \xB7 \u8BBE\u5907\u73AF\u5883\u98CE\u9669 22%"]
      ]
    },
    {
      name: "\u8FDD\u7EA6\u7EF4\u5EA6\uFF08\u5F15\u7528\u667A\u4FE1\u5206\uFF09",
      source: "\u667A\u4FE1\u5206",
      window: "\u672C\u6B21\u8BC4\u5206",
      value: "\u4FE1\u7528\u5206 688",
      status: "\u5173\u6CE8",
      feat: "\u4FE1\u7528\u98CE\u9669",
      detailTitle: "\u667A\u4FE1\u5206\u5F15\u7528\uFF08\u672C\u6B21\u8BC4\u5206\uFF09",
      cols: ["\u9879", "\u503C"],
      rows: [
        ["\u4FE1\u7528\u5206", "688\uFF08C \u6863 \xB7 \u4E00\u822C\uFF09"],
        ["\u4E3B\u8981\u6263\u5206\u9879", "\u5386\u53F2\u903E\u671F M3+ 1 \u6B21 \xB7 \u8D1F\u503A\u6536\u5165\u6BD4 58%"]
      ]
    },
    {
      name: "\u4EF7\u503C\u7EF4\u5EA6\uFF08\u501F\u8D37\u5174\u8DA3\uFF09",
      source: "\u884C\u4E3A\u6570\u636E",
      window: "\u8FD1 30 \u5929",
      value: "\u6D3B\u8DC3 18 \u5929",
      status: "\u6B63\u5E38",
      feat: "\u4EF7\u503C\u6F5C\u529B",
      detailTitle: "\u884C\u4E3A\u6D3B\u8DC3\uFF08\u8FD1 30 \u5929\uFF09",
      cols: ["\u9879", "\u503C"],
      rows: [
        ["\u6D3B\u8DC3\u5929\u6570", "18 / 30 \u5929"],
        ["\u504F\u597D\u4EA7\u54C1", "\u6D88\u8D39\u5206\u671F \xB7 \u73B0\u91D1\u5206\u671F"]
      ]
    },
    {
      name: "\u8D44\u4EA7\u7EF4\u5EA6",
      source: "\u8D44\u4EA7\u753B\u50CF",
      window: "\u5F53\u524D",
      value: "\u623F\u4EA7 + \u7406\u8D22\u6301\u4ED3",
      status: "\u6B63\u5E38",
      feat: "\u8D44\u4EA7\u5B9E\u529B",
      detailTitle: "\u8D44\u4EA7\uFF08\u5F53\u524D\uFF09",
      cols: ["\u9879", "\u503C"],
      rows: [
        ["\u623F\u4EA7", "\u81EA\u6709\u4F4F\u623F\uFF08\u6309\u63ED\u4E2D\uFF09"],
        ["\u7406\u8D22\u6301\u4ED3", "\xA580,000\uFF08\u8D27\u5E01\u57FA\u91D1\uFF09"]
      ]
    }
  ]
};
const REL_COLOR = {
  company: "#2563EB",
  person: "#D97706",
  device: "#7C3AED",
  contact: "#059669"
};
const REL_LABEL = {
  company: "\u4F01\u4E1A",
  person: "\u4E2A\u4EBA",
  device: "\u8BBE\u5907",
  contact: "\u8054\u7CFB\u4EBA"
};
const RISK_COLOR = { \u9AD8: "#DC2626", \u4E2D: "#D97706", \u4F4E: "#059669" };
const RING_PALETTE = ["#DC2626", "#0891B2", "#7C3AED", "#D97706", "#0D9488"];
const THEME_LABEL = { type: "\u5173\u7CFB\u7F51\u7EDC", risk: "\u98CE\u9669\u5206\u5E03", ring: "\u56E2\u4F19\u8BC6\u522B" };
function RelationGraph({ cust, colorBy, rings }) {
  const rels = cust.relations ?? [];
  const W = 560, H = 260, CX = W / 2, CY = H / 2, R = 92;
  if (!rels.length) return /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: "#94A3B8" }, children: "\u6682\u65E0\u5173\u8054\u5B9E\u4F53" });
  const pts = rels.map((r, i) => {
    const ang = Math.PI * 2 * i / rels.length - Math.PI / 2;
    return { r, x: CX + R * Math.cos(ang), y: CY + R * Math.sin(ang) };
  });
  const ringColor = (r) => r.ringId ? RING_PALETTE[(r.ringId - 1) % RING_PALETTE.length] : "#94A3B8";
  const nodeColor = (r) => colorBy === "risk" ? r.riskLevel ? RISK_COLOR[r.riskLevel] : "#94A3B8" : colorBy === "ring" ? ringColor(r) : REL_COLOR[r.type];
  return /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "center" }, children: [
    /* @__PURE__ */ jsxs("svg", { width: "100%", viewBox: `0 0 ${W} ${H}`, style: { maxWidth: W }, role: "img", "aria-label": "\u5173\u8054\u5173\u7CFB\u56FE\u8C31", children: [
      pts.map(({ r, x, y }) => /* @__PURE__ */ jsx("g", { children: /* @__PURE__ */ jsx("line", { x1: CX, y1: CY, x2: x, y2: y, stroke: r.risk === "\u9AD8\u5371" ? "#DC2626" : "#CBD5E1", strokeWidth: r.risk ? 1.6 : 1, strokeDasharray: r.risk ? "4 2" : void 0 }) }, r.id)),
      /* @__PURE__ */ jsx("circle", { cx: CX, cy: CY, r: 34, fill: "#2563EB" }),
      /* @__PURE__ */ jsx("text", { x: CX, y: CY - 4, textAnchor: "middle", fontSize: 13, fontWeight: 700, fill: "#fff", children: cust.name }),
      /* @__PURE__ */ jsx("text", { x: CX, y: CY + 12, textAnchor: "middle", fontSize: 10, fill: "#DBEAFE", children: "\u672C\u4EBA" }),
      pts.map(({ r, x, y }) => {
        const c = nodeColor(r);
        const isHi = r.risk === "\u9AD8\u5371";
        return /* @__PURE__ */ jsxs("g", { children: [
          /* @__PURE__ */ jsx("circle", { cx: x, cy: y, r: r.type === "company" ? 24 : 19, fill: c, fillOpacity: r.risk ? 0.16 : 0.1, stroke: isHi ? "#DC2626" : c, strokeWidth: isHi ? 2 : 1.4 }),
          /* @__PURE__ */ jsx("text", { x, y: y + (r.type === "company" ? -2 : 3), textAnchor: "middle", fontSize: r.type === "company" ? 11 : 10, fontWeight: 600, fill: c, children: r.name.length > 6 ? r.name.slice(0, 5) + "\u2026" : r.name }),
          /* @__PURE__ */ jsx("text", { x, y: y + (r.type === "company" ? 14 : 16), textAnchor: "middle", fontSize: 9, fill: "#64748B", children: r.rel }),
          isHi && /* @__PURE__ */ jsx("text", { x, y: y - (r.type === "company" ? 30 : 26), textAnchor: "middle", fontSize: 10, fontWeight: 700, fill: "#DC2626", children: r.risk }),
          !!r.openAlerts && /* @__PURE__ */ jsxs("g", { children: [
            /* @__PURE__ */ jsx("circle", { cx: x + (r.type === "company" ? 22 : 17), cy: y - (r.type === "company" ? 22 : 17), r: 9, fill: "#DC2626", stroke: "#fff", strokeWidth: 1.5 }),
            /* @__PURE__ */ jsx("text", { x: x + (r.type === "company" ? 22 : 17), y: y - (r.type === "company" ? 22 : 17) + 3.5, textAnchor: "middle", fontSize: 10, fontWeight: 700, fill: "#fff", children: r.openAlerts })
          ] })
        ] }, r.id);
      })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 12, fontSize: 11, color: "#64748B", marginTop: 4, flexWrap: "wrap", justifyContent: "center" }, children: [
      colorBy === "type" ? Object.keys(REL_COLOR).map((t) => /* @__PURE__ */ jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 }, children: [
        /* @__PURE__ */ jsx("span", { style: { width: 8, height: 8, borderRadius: "50%", background: REL_COLOR[t], display: "inline-block" } }),
        REL_LABEL[t]
      ] }, t)) : colorBy === "risk" ? ["\u9AD8", "\u4E2D", "\u4F4E"].map((k) => /* @__PURE__ */ jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 }, children: [
        /* @__PURE__ */ jsx("span", { style: { width: 8, height: 8, borderRadius: "50%", background: RISK_COLOR[k], display: "inline-block" } }),
        k,
        "\u98CE\u9669"
      ] }, k)) : /* @__PURE__ */ jsxs(Fragment, { children: [
        rings.map((rg) => /* @__PURE__ */ jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 }, children: [
          /* @__PURE__ */ jsx("span", { style: { width: 8, height: 8, borderRadius: "50%", background: RING_PALETTE[(rg.id - 1) % RING_PALETTE.length], display: "inline-block" } }),
          rg.name
        ] }, rg.id)),
        /* @__PURE__ */ jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 }, children: [
          /* @__PURE__ */ jsx("span", { style: { width: 8, height: 8, borderRadius: "50%", background: "#94A3B8", display: "inline-block" } }),
          "\u65E0\u56E2\u4F19"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 }, children: [
        /* @__PURE__ */ jsx("span", { style: { width: 8, height: 8, borderRadius: "50%", border: "2px solid #DC2626", display: "inline-block" } }),
        "\u9AD8\u5371"
      ] }),
      /* @__PURE__ */ jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 }, children: [
        /* @__PURE__ */ jsx("span", { style: { width: 16, height: 16, borderRadius: "50%", background: "#DC2626", color: "#fff", fontSize: 10, display: "inline-flex", alignItems: "center", justifyContent: "center" }, children: "n" }),
        "\u5173\u8054\u9884\u8B66\u6570"
      ] })
    ] })
  ] });
}
function RelationDrawer({ r, custName, onClose }) {
  const fields = [
    { label: "\u5173\u7CFB", value: r.rel },
    { label: "\u7C7B\u578B", value: REL_LABEL[r.type] },
    { label: "\u98CE\u9669\u7B49\u7EA7", value: r.riskLevel ? /* @__PURE__ */ jsxs(Badge, { kind: r.riskLevel === "\u9AD8" ? "red" : r.riskLevel === "\u4E2D" ? "amber" : "green", children: [
      r.riskLevel,
      "\u98CE\u9669"
    ] }) : "\u2014" },
    { label: "\u5173\u8054\u9884\u8B66", value: /* @__PURE__ */ jsxs("span", { style: { color: "#DC2626", fontWeight: 600 }, children: [
      r.openAlerts ?? 0,
      " \u6761"
    ] }) },
    { label: "\u8BC1\u4EF6\u53F7", value: r.idCard ?? "\u2014" },
    { label: "\u624B\u673A\u53F7", value: r.phone ?? "\u2014" },
    { label: "\u6CE8\u518C\u8D44\u672C", value: r.regCapital ?? "\u2014" },
    { label: "\u6CD5\u5B9A\u4EE3\u8868\u4EBA", value: r.legalPerson ?? "\u2014" },
    { label: "\u63A5\u5165\u6E20\u9053", value: r.channel ?? "\u2014" },
    { label: "\u5907\u6CE8", value: r.note ?? "\u2014" }
  ];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { onClick: onClose, style: { position: "fixed", inset: 0, background: "rgba(15,23,42,0.35)", zIndex: 50 } }),
    /* @__PURE__ */ jsxs("div", { style: { position: "fixed", top: 0, right: 0, height: "100vh", width: 380, maxWidth: "90vw", background: "#fff", boxShadow: "-8px 0 24px rgba(0,0,0,0.12)", zIndex: 51, padding: 24, overflowY: "auto" }, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }, children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
          /* @__PURE__ */ jsx("span", { style: { width: 36, height: 36, borderRadius: "50%", background: REL_COLOR[r.type], color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }, children: r.name[0] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { style: { fontSize: 16, fontWeight: 700, color: "#1E293B" }, children: r.name }),
            /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: "#94A3B8" }, children: [
              r.rel,
              " \xB7 \u4E0E ",
              custName,
              " \u5173\u8054"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("span", { onClick: onClose, style: { fontSize: 22, color: "#94A3B8", cursor: "pointer", lineHeight: 1 }, children: "\xD7" })
      ] }),
      /* @__PURE__ */ jsx("div", { style: { borderTop: "1px solid #F1F5F9", paddingTop: 12 }, children: fields.map((f, i) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #F8FAFC", fontSize: 13 }, children: [
        /* @__PURE__ */ jsx("span", { style: { color: "#94A3B8", flexShrink: 0, marginRight: 16 }, children: f.label }),
        /* @__PURE__ */ jsx("span", { style: { color: "#334155", textAlign: "right" }, children: f.value })
      ] }, i)) })
    ] })
  ] });
}
function relImpact(r) {
  if (r.type === "device") return "\u667A\u5BDF\u5206 \xB7 \u7F51\u7EDC\u5173\u8054\uFF08\u8BBE\u5907\u7EF4\u5EA6\uFF09";
  if (r.type === "company") return r.risk === "\u9AD8\u5371" ? "\u667A\u5BDF\u5206 \xB7 \u9ED1\u4EA7\u5173\u8054\uFF08\u9AD8\u5371\u5B9E\u4F53\uFF09" : "\u667A\u4FE1\u5206 \xB7 \u7ECF\u8425\u98CE\u9669\uFF08\u53C2\u8003\uFF09";
  if (r.rel.includes("\u5171\u501F") || r.rel.includes("\u62C5\u4FDD")) return "\u667A\u4FE1\u5206 \xB7 \u5171\u503A / \u62C5\u4FDD\u98CE\u9669\u4F20\u5BFC\uFF08\u53C2\u8003\uFF09";
  if (r.type === "contact") return "\u667A\u4FE1\u5206 \xB7 \u8054\u7CFB\u4EBA\u98CE\u9669\u4F20\u5BFC\uFF08\u53C2\u8003\uFF09";
  return "\u2014";
}
const FLOW_STAGES = ["\u9884\u8B66\u786E\u8BA4", "\u98CE\u9669\u7814\u5224", "\u51BB\u7ED3\u6B62\u4ED8", "\u5DF2\u7ED3\u6848"];
const ALERT_MODEL = {
  \u8BBE\u5907\u5F02\u5E38: "zhicha",
  \u53CD\u6B3A\u8BC8\u547D\u4E2D: "zhicha",
  \u591A\u5934\u501F\u8D37: "zhicha",
  \u884C\u4E3A\u8BC4\u5206\u4E0B\u964D: "zhicha",
  \u8206\u60C5\u8D1F\u9762: "zhicha",
  \u8D1F\u503A\u6FC0\u589E: "zhixin",
  \u903E\u671F\u9884\u8B66: "zhixin",
  \u53F8\u6CD5\u6D89\u8BC9: "zhixin",
  \u8FD8\u6B3E\u80FD\u529B\u4E0D\u8DB3: "zhixin",
  \u56DE\u8BBF\u5931\u8054: "zhixin",
  \u5173\u8054\u4F01\u4E1A\u98CE\u9669: "zhixin",
  \u63D0\u989D\u673A\u4F1A: "zhirong",
  \u9700\u6C42\u4E0A\u5347: "zhirong"
};
function alertModelOf(type) {
  return type ? ALERT_MODEL[type] ?? null : null;
}
function buildEvents(cust, calcedAt, prod) {
  const ev = [];
  (cust.modelScoreHistory ?? []).forEach((p) => {
    const v = p[prod];
    if (v != null) ev.push({
      time: p.month,
      tag: "\u8BC4\u5206",
      text: `${PROD_META[prod].label}\u8BC4\u5206\uFF1A${v} \u5206\uFF08\u6708\u5EA6\u5FEB\u7167\uFF09`,
      kind: "cyan"
    });
  });
  (cust.alerts ?? []).forEach((a) => ev.push({
    time: a.time,
    tag: a.level === "RED" ? "\u9884\u8B66" : a.level === "OPPORTUNITY" ? "\u673A\u4F1A" : "\u9884\u8B66",
    text: `${a.scene}\uFF08${a.ruleName}\uFF09\u89E6\u53D1 \xB7 \u5F53\u524D${a.status}`,
    kind: a.level === "RED" ? "red" : a.level === "YELLOW" ? "amber" : "green"
  }));
  (cust.disposes ?? []).forEach((d) => ev.push({
    time: d.time,
    tag: "\u5904\u7F6E",
    text: `${d.action}\uFF1A${d.result}${d.note ? `\uFF08${d.note}\uFF09` : ""}`,
    kind: "blue"
  }));
  (cust.approvalRecords ?? []).forEach((r) => ev.push({
    time: r.time,
    tag: "\u5BA1\u6279",
    text: `${r.kind} \xB7 ${r.result}\uFF08${r.opinion}\uFF09\xB7 ${r.operator}`,
    kind: "green"
  }));
  (cust.externalChecks ?? []).forEach((c) => ev.push({
    time: calcedAt,
    tag: "\u6838\u9A8C",
    text: `\u5916\u90E8\u6838\u9A8C \xB7 ${c.category}\xB7${c.item} \u2192 ${c.result}\uFF08${c.status}\uFF09`,
    kind: "amber"
  }));
  return ev.sort((a, b) => b.time.localeCompare(a.time));
}
function EventLine({ ev }) {
  const tagColor = { red: "#DC2626", amber: "#D97706", blue: "#185FA5", cyan: "#0891B2", green: "#16A34A" };
  return /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 10, padding: "7px 0", borderBottom: "1px dashed #F1F5F9" }, children: [
    /* @__PURE__ */ jsx("span", { style: { fontSize: 11, color: "#fff", background: tagColor[ev.kind], borderRadius: 6, padding: "2px 8px", flexShrink: 0 }, children: ev.tag }),
    /* @__PURE__ */ jsx("span", { style: { fontSize: 12, color: "#94A3B8", width: 90, flexShrink: 0, fontVariantNumeric: "tabular-nums" }, children: ev.time }),
    /* @__PURE__ */ jsx("span", { style: { fontSize: 12.5, color: "#334155", lineHeight: 1.6 }, children: ev.text })
  ] });
}
const TABS = [
  { key: "score", label: "\u6A21\u578B\u5206" },
  { key: "graph", label: "\u5173\u8054\u56FE\u8C31" },
  { key: "alert", label: "\u9884\u8B66\u4E0E\u5904\u7F6E" },
  { key: "data", label: "\u7528\u6237\u6570\u636E" },
  { key: "model", label: "\u6A21\u578B\u4FE1\u606F" }
];
export default function CustScoreDetail() {
  const [params] = useSearchParams();
  const custId = params.get("cust") ?? "";
  const prodParam = params.get("prod") ?? "zhicha";
  const prod = PROD_KEYS.includes(prodParam) ? prodParam : "zhicha";
  const fromAlertId = params.get("id") ?? "";
  const nav = useNavigate();
  const customers = useMidCustomers();
  const globalAlerts = useMidAlerts();
  const [tab, setTab] = useState("score");
  const [openInput, setOpenInput] = useState({});
  const [graphTheme, setGraphTheme] = useState("type");
  const [selRel, setSelRel] = useState(null);
  const cust = useMemo(
    () => customers.find((c) => c.custId === custId) ?? customers[0],
    [customers, custId]
  );
  const meta = PROD_META[prod];
  const item = useMemo(() => {
    if (!cust) return null;
    const raw = cust.scores?.[prod] ?? deriveFallback(cust, prod);
    return raw ? enrich(raw, prod) : null;
  }, [cust, prod]);
  const backTo = () => nav("/console/cr/mid-cust-detail?cust=" + custId + (fromAlertId ? "&id=" + fromAlertId : ""));
  const reg = models.find((m) => m.id === PROD_TO_MODEL[prod]) ?? {};
  const capa = MODEL_CAPA[prod];
  const history = cust?.modelScoreHistory ?? [];
  const isFraud = prod === "zhicha";
  if (!cust || !item) {
    return /* @__PURE__ */ jsxs("div", { style: { padding: 24 }, children: [
      /* @__PURE__ */ jsx(PageShell, { header: /* @__PURE__ */ jsx(DetailHeader, { title: "\u5F97\u5206\u8BE6\u60C5", crumb: "\u8D37\u4E2D\u76D1\u63A7 / \u5355\u5BA2\u8BE6\u60C5 / \u5F97\u5206\u8BE6\u60C5", backLabel: "\u2190 \u8FD4\u56DE\u5355\u5BA2\u8BE6\u60C5", onBack: backTo }) }),
      /* @__PURE__ */ jsx(Panel, { title: "\u6682\u65E0\u8BC4\u5206\u6570\u636E", desc: "\u8BE5\u5BA2\u6237\u6CA1\u6709\u6A21\u578B\u8BC4\u5206\u5FEB\u7167", children: /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: "#94A3B8", padding: "16px 0" }, children: "\u8BF7\u8FD4\u56DE\u5355\u5BA2\u8BE6\u60C5\u9875\u67E5\u770B\u5176\u5B83\u677F\u5757\u3002" }) })
    ] });
  }
  const scoreColor = meta.danger ? item.score >= 70 ? "#DC2626" : item.score >= 40 ? "#D97706" : "#16A34A" : item.score >= 660 ? "#16A34A" : item.score >= 580 ? "#D97706" : "#DC2626";
  const gradeBadgeKind = meta.danger ? item.grade === "\u9AD8" ? "red" : item.grade === "\u4E2D" ? "amber" : "green" : item.grade === "A" ? "green" : item.grade === "B" ? "green" : item.grade === "C" ? "amber" : "red";
  const dims = dimsOf(prod, cust.riskDims ?? []);
  const allEvents = buildEvents(cust, item?.calcedAt ?? "", prod);
  const ringsSummary = useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    (cust?.relations ?? []).forEach((r) => {
      if (!r.ringId) return;
      const cur = map.get(r.ringId) ?? { name: r.ringName ?? "\u5173\u8054\u56E2\u4F19" + r.ringId, risk: r.ringRisk ?? "\u4E2D", count: 0 };
      cur.count += 1;
      map.set(r.ringId, cur);
    });
    return [...map.entries()].map(([id, m]) => ({ id, ...m }));
  }, [cust]);
  const custGlobalAlerts = globalAlerts.filter((a) => a.cust_id === cust.custId);
  const alertCards = custGlobalAlerts.filter((a) => alertModelOf(a.alert_type) === prod);
  const otherAlerts = custGlobalAlerts.filter((a) => alertModelOf(a.alert_type) !== prod);
  const flow = alertCards.find((a) => a.flowKey) ?? custGlobalAlerts.find((a) => a.flowKey);
  const alertFlowItem = useFlows().find((f) => f.id === "f-alert-dispose");
  const matched = matchFlowGraph(alertFlowItem, flow ? { level: flow.level, alert_type: flow.alert_type } : {});
  const flowSteps = matched.steps && matched.steps.length ? matched.steps : FLOW_STAGES.map((s) => ({ state: s, action: "", next: "" }));
  const curStage = flow ? flowSteps.findIndex((s) => s.state === flow.flowState) : -1;
  const flowName = matched.name || alertFlowItem?.name || "\u9884\u8B66\u5904\u7F6E\u6D41\u7A0B";
  const goAlertDetail = (alertId) => {
    if (alertId) nav("/console/cr/mid-alert-detail?id=" + alertId);
  };
  const hist = history.filter((p) => p[prod] != null);
  const lastScore = hist.length ? hist[hist.length - 1][prod] : null;
  const prevScore = hist.length > 1 ? hist[hist.length - 2][prod] : null;
  const delta = lastScore != null && prevScore != null ? lastScore - prevScore : null;
  let trend = null;
  if (hist.length >= 3) {
    const vals = hist.slice(-3).map((p) => p[prod]);
    const up = vals[2] > vals[0];
    const worsened = isFraud ? up : !up;
    trend = worsened ? { t: "\u8FD1 3 \u6708\u98CE\u9669\u6301\u7EED\u4E0A\u5347", c: "#DC2626" } : { t: "\u8FD1 3 \u6708\u98CE\u9669\u8D8B\u7A33 / \u5411\u597D", c: "#16A34A" };
  }
  const custTags = [];
  if (cust.riskLevel) custTags.push({ label: cust.riskLevel, kind: cust.riskLevel === "\u9AD8\u98CE\u9669" ? "red" : cust.riskLevel === "\u4E2D\u98CE\u9669" ? "amber" : "green" });
  if ((cust.alerts ?? []).some((a) => a.level === "RED")) custTags.push({ label: "\u8D37\u4E2D\u9884\u8B66", kind: "red" });
  if ((cust.alerts ?? []).some((a) => a.scene.includes("\u903E\u671F") || a.ruleName.includes("\u903E\u671F"))) custTags.push({ label: "\u903E\u671F", kind: "amber" });
  if ((cust.alerts ?? []).some((a) => a.scene.includes("\u8D1F\u503A") || a.scene.includes("\u591A\u5934"))) custTags.push({ label: "\u5171\u503A\u5ACC\u7591", kind: "amber" });
  custTags.push({ label: "\u6A21\u578B\u8BC4\u5206", kind: "gray" });
  const scoreOf = (k) => {
    if (cust.scores?.[k]?.score != null) return cust.scores[k].score;
    const d = deriveFallback(cust, k);
    return d ? d.score : null;
  };
  const infoRow = (label, value, strong) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #F1F5F9", padding: "9px 0" }, children: [
    /* @__PURE__ */ jsx("span", { style: { color: "#64748B" }, children: label }),
    /* @__PURE__ */ jsx("span", { style: strong ? { fontWeight: 700, color: "#1E293B" } : { color: "#334155" }, children: value })
  ] });
  return /* @__PURE__ */ jsxs("div", { style: { padding: 24, maxWidth: 1160 }, children: [
    /* @__PURE__ */ jsx(PageShell, { header: /* @__PURE__ */ jsx(DetailHeader, { title: `${meta.label} \xB7 ${cust.name}`, crumb: "\u8D37\u4E2D\u76D1\u63A7 / \u5355\u5BA2\u8BE6\u60C5 / \u5F97\u5206\u8BE6\u60C5", subtitle: `\u5BA2\u6237\u53F7 ${cust.custId} \uFF5C \u4EA7\u54C1 ${cust.product ?? ""} \uFF5C \u8BC1\u4EF6\u53F7 ${cust.idCard}`, backLabel: "\u2190 \u8FD4\u56DE\u5355\u5BA2\u8BE6\u60C5", onBack: backTo, sticky: false }) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 14, padding: "12px 16px" }, children: [
        /* @__PURE__ */ jsxs("div", { style: { flex: "1 1 340px", minWidth: 0 }, children: [
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: 15, fontWeight: 700, color: "#1E293B" }, children: [
            cust.name,
            custTags.map((t) => /* @__PURE__ */ jsx(Badge, { kind: t.kind, children: t.label }, t.label))
          ] }),
          /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: "#64748B", marginTop: 6, lineHeight: 1.7 }, children: [
            "\u5BA2\u6237\u53F7 ",
            cust.custId,
            " \uFF5C \u4EA7\u54C1 ",
            cust.product ?? "\u2014",
            " \uFF5C \u8BC1\u4EF6\u53F7 ",
            cust.idCard,
            " \uFF5C \u8D37\u6B3E\u72B6\u6001 ",
            cust.loanStatus ?? "\u2014",
            " \uFF5C \u6570\u636E\u6765\u6E90 ",
            /* @__PURE__ */ jsx(Sam, { label: "\u6837\u4F8B", value: "midCustomers.json" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { flexShrink: 0 }, children: [
          /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: "#94A3B8", marginBottom: 6 }, children: "\u6A21\u578B\u8BC4\u5206\u5FEB\u6377\u5165\u53E3" }),
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }, children: [
            PROD_KEYS.map((k) => {
              const m = PROD_META[k];
              const s = scoreOf(k);
              const active = k === prod;
              return /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  title: `\u8FDB\u5165 ${m.label} \u5F97\u5206\u9875\u9762`,
                  onClick: () => nav("/console/cr/mid-cust-score?cust=" + custId + "&prod=" + k + (fromAlertId ? "&id=" + fromAlertId : "")),
                  style: {
                    border: active ? "1.5px solid " + m.color : "1px solid #E2E8F0",
                    background: active ? m.color + "0f" : "#fff",
                    borderRadius: 8,
                    padding: "6px 10px",
                    cursor: "pointer",
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 5
                  },
                  children: [
                    /* @__PURE__ */ jsx("span", { style: { width: 6, height: 6, borderRadius: 999, background: m.color } }),
                    /* @__PURE__ */ jsx("span", { style: { fontWeight: active ? 600 : 500, color: active ? m.color : "#475569" }, children: m.label }),
                    /* @__PURE__ */ jsx("b", { style: { color: "#334155", fontVariantNumeric: "tabular-nums" }, children: s ?? "\u2014" })
                  ]
                },
                k
              );
            }),
            /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: "#64748B", borderLeft: "1px solid #E2E8F0", paddingLeft: 12, marginLeft: 4 }, children: [
              "\u989D\u5EA6\u5EFA\u8BAE ",
              /* @__PURE__ */ jsx("b", { style: { color: "#6D28D9" }, children: cust.scores?.limitSuggest ?? "\u2014" }),
              cust.scores?.limit ? /* @__PURE__ */ jsxs("span", { style: { color: "#94A3B8" }, children: [
                " / \xA5",
                cust.scores.limit.toLocaleString()
              ] }) : null
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { style: { position: "sticky", top: 56, zIndex: 30, background: "#fff", borderBottom: "1px solid #E2E8F0", margin: "12px 0 0", padding: "6px 2px 0", display: "flex", gap: 2 }, children: TABS.map((t) => /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setTab(t.key),
          style: {
            padding: "9px 16px",
            fontSize: 13.5,
            cursor: "pointer",
            background: "none",
            border: "none",
            borderBottom: tab === t.key ? "2px solid #1E293B" : "2px solid transparent",
            color: tab === t.key ? "#1E293B" : "#64748B",
            fontWeight: tab === t.key ? 600 : 400
          },
          children: t.label
        },
        t.key
      )) }),
      tab === "score" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Panel, { title: "\u6A21\u578B\u5206\u6982\u89C8", desc: "\u6A21\u578B\u8BC4\u5206\u5FEB\u7167 + \u7EF4\u5EA6\u62C6\u89E3", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-[minmax(0,1fr)_440px]", children: [
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }, children: [
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }, children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }, children: "\u603B\u5206" }),
              /* @__PURE__ */ jsx(ScoreGauge, { value: item.score, min: item.range[0], max: item.range[1], label: `${item.unit}\uFF08${item.range[0]}-${item.range[1]}\uFF09`, color: meta.color, hint: void 0 }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 11.5, color: "#94A3B8", marginTop: 2 }, children: isFraud ? "\u5206\u6570\u8D8A\u9AD8\uFF0C\u6B3A\u8BC8\u98CE\u9669\u8D8A\u5927" : "\u5206\u6570\u8D8A\u9AD8\uFF0C\u8868\u73B0\u8D8A\u597D" })
            ] }),
            /* @__PURE__ */ jsxs("div", { style: { flex: 1, minWidth: 240, fontSize: 13 }, children: [
              infoRow("\u5F53\u524D\u5F97\u5206", /* @__PURE__ */ jsx("b", { style: { fontSize: 18, color: scoreColor, fontVariantNumeric: "tabular-nums" }, children: item.score })),
              infoRow("\u98CE\u9669\u7B49\u7EA7", /* @__PURE__ */ jsxs(Badge, { kind: gradeBadgeKind, children: [
                item.grade,
                item.gradeLabel ? ` \xB7 ${item.gradeLabel}` : ""
              ] })),
              infoRow(isFraud ? "\u6B3A\u8BC8\u6982\u7387" : "\u8FDD\u7EA6\u6982\u7387", item.probability),
              infoRow("\u6A21\u578B\u7248\u672C", item.modelVersion),
              infoRow("\u8BC4\u5206\u65F6\u95F4", item.calcedAt)
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { style: { minWidth: 0, display: "flex", flexDirection: "column" }, children: [
            /* @__PURE__ */ jsxs("div", { style: { fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 8 }, children: [
              "\u7EF4\u5EA6\u62C6\u89E3 ",
              /* @__PURE__ */ jsx("span", { style: { fontSize: 11, fontWeight: 400, color: "#94A3B8" }, children: "\u98CE\u9669\u7EF4\u5EA6\u5F97\u5206 0-100" })
            ] }),
            /* @__PURE__ */ jsx("div", { style: { flex: 1, border: "1px solid #F1F5F9", borderRadius: 10, padding: "2px 12px" }, children: [...dims].sort((a, b) => b.score - a.score).map((d, i) => {
              const lvl = d.lvl;
              return /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, padding: "10px 0", borderBottom: i < dims.length - 1 ? "1px dashed #F1F5F9" : "none" }, children: [
                /* @__PURE__ */ jsx("span", { style: { width: 64, flexShrink: 0, color: "#334155", fontWeight: 600 }, children: d.dim }),
                /* @__PURE__ */ jsx("div", { style: { flex: 1, height: 6, background: "#F1F5F9", borderRadius: 999, overflow: "hidden" }, children: /* @__PURE__ */ jsx("div", { style: { width: `${Math.min(d.score, 100)}%`, height: "100%", background: LEVEL_COLOR[lvl], borderRadius: 999 } }) }),
                /* @__PURE__ */ jsx("span", { style: { width: 26, textAlign: "right", color: "#475569", fontVariantNumeric: "tabular-nums" }, children: d.score }),
                /* @__PURE__ */ jsx(Badge, { kind: lvl === "\u9AD8" ? "red" : lvl === "\u4E2D" ? "amber" : "green", children: lvl })
              ] }, i);
            }) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs(Panel, { title: "\u6A21\u578B\u5206\u8D8B\u52BF", desc: "\u8D37\u4E2D\u91CD\u8BC4\u8F68\u8FF9\u4E0E\u5F71\u54CD\u4E8B\u4EF6", children: [
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 14 }, children: [
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "baseline", gap: 8 }, children: [
              /* @__PURE__ */ jsx("span", { style: { fontSize: 11, color: "#94A3B8" }, children: "\u6700\u65B0\u5F97\u5206" }),
              /* @__PURE__ */ jsx("span", { style: { fontSize: 30, fontWeight: 800, color: scoreColor, fontVariantNumeric: "tabular-nums", lineHeight: 1 }, children: lastScore ?? "\u2014" }),
              delta != null && /* @__PURE__ */ jsxs("span", { style: { fontSize: 13, fontWeight: 700, color: (isFraud ? delta > 0 : delta < 0) ? "#DC2626" : "#16A34A" }, children: [
                delta > 0 ? "\u25B2" : delta < 0 ? "\u25BC" : "\uFF1D",
                " ",
                Math.abs(delta)
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: "#64748B" }, children: prevScore != null ? `\u8F83\u4E0A\u6B21\u91CD\u8BC4\uFF08${hist[hist.length - 2]?.month ?? ""} \xB7 ${prevScore} \u5206\uFF09` : "\u5C1A\u65E0\u5386\u53F2\u5BF9\u6BD4" }),
            trend && /* @__PURE__ */ jsx(Badge, { kind: trend.c === "#DC2626" ? "red" : "green", children: trend.t })
          ] }),
          history.length ? /* @__PURE__ */ jsx(
            LineChart,
            {
              labels: history.map((p) => p.month),
              series: [{ name: meta.label, color: meta.color, data: history.map((p) => p[prod]) }],
              unit: "\u5206",
              height: 200
            }
          ) : /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: "#94A3B8", padding: "6px 0" }, children: "\u6682\u65E0\u91CD\u8BC4\u8F68\u8FF9\uFF08\u8D37\u4E2D\u91CD\u8BC4\u8BB0\u5F55\u968F\u9884\u8B66/\u5904\u7F6E\u751F\u6210\u540E\u7559\u75D5\uFF09\u3002" }),
          (cust.alerts ?? []).filter((a) => a.level !== "OPPORTUNITY").length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("div", { style: { fontSize: 13, fontWeight: 600, color: "#475569", margin: "12px 0 8px" }, children: "\u8FD1\u671F\u5F71\u54CD\u5F97\u5206\u7684\u4E8B\u4EF6" }),
            /* @__PURE__ */ jsx("div", { className: "space-y-1.5", children: (cust.alerts ?? []).filter((a) => a.level !== "OPPORTUNITY").slice(0, 4).map((a, i) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, borderBottom: "1px dashed #F1F5F9", padding: "6px 0" }, children: [
              /* @__PURE__ */ jsx("span", { style: { fontSize: 11, color: "#fff", background: a.level === "RED" ? "#DC2626" : "#D97706", borderRadius: 6, padding: "2px 8px" }, children: a.level === "RED" ? "\u7EA2" : "\u9EC4" }),
              /* @__PURE__ */ jsx("span", { style: { color: "#94A3B8", width: 90, flexShrink: 0 }, children: a.time }),
              /* @__PURE__ */ jsxs("span", { style: { color: "#334155", flex: 1 }, children: [
                a.scene,
                "\uFF08",
                a.ruleName,
                "\uFF09"
              ] }),
              /* @__PURE__ */ jsx("span", { style: { color: a.level === "RED" ? "#DC2626" : "#D97706", flexShrink: 0 }, children: isFraud ? "\u62C9\u9AD8\u6B3A\u8BC8\u98CE\u9669" : "\u5F71\u54CD\u4FE1\u7528/\u7EFC\u5408\u5206" })
            ] }, i)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Panel, { title: "\u64CD\u4F5C\u65E5\u5FD7", desc: "\u8BC4\u5206 \xB7 \u9884\u8B66 \xB7 \u5904\u7F6E \xB7 \u5BA1\u6279 \xB7 \u6838\u9A8C\uFF08\u6309\u65F6\u95F4\u5012\u5E8F\uFF0C\u81EA\u52A8\u4E0E\u4EBA\u5DE5\u5BF9\u6A21\u578B\u7684\u5F71\u54CD\u5168\u7559\u75D5\uFF09", children: [
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 12, fontSize: 11, color: "#94A3B8", marginBottom: 8, flexWrap: "wrap" }, children: [
            /* @__PURE__ */ jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 }, children: [
              /* @__PURE__ */ jsx("span", { style: { width: 8, height: 8, borderRadius: "50%", background: "#0891B2", display: "inline-block" } }),
              "\u8BC4\u5206/\u91CD\u8BC4"
            ] }),
            /* @__PURE__ */ jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 }, children: [
              /* @__PURE__ */ jsx("span", { style: { width: 8, height: 8, borderRadius: "50%", background: "#DC2626", display: "inline-block" } }),
              "\u9884\u8B66"
            ] }),
            /* @__PURE__ */ jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 }, children: [
              /* @__PURE__ */ jsx("span", { style: { width: 8, height: 8, borderRadius: "50%", background: "#185FA5", display: "inline-block" } }),
              "\u5904\u7F6E"
            ] }),
            /* @__PURE__ */ jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 }, children: [
              /* @__PURE__ */ jsx("span", { style: { width: 8, height: 8, borderRadius: "50%", background: "#16A34A", display: "inline-block" } }),
              "\u5BA1\u6279"
            ] }),
            /* @__PURE__ */ jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 }, children: [
              /* @__PURE__ */ jsx("span", { style: { width: 8, height: 8, borderRadius: "50%", background: "#D97706", display: "inline-block" } }),
              "\u6838\u9A8C"
            ] })
          ] }),
          allEvents.length ? /* @__PURE__ */ jsx("div", { className: "space-y-1", children: allEvents.map((ev, i) => /* @__PURE__ */ jsx(EventLine, { ev }, i)) }) : /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: "#94A3B8", padding: "12px 0" }, children: "\u6682\u65E0\u64CD\u4F5C\u65E5\u5FD7\u3002" })
        ] })
      ] }),
      tab === "graph" && /* @__PURE__ */ jsx(Panel, { title: "\u5173\u8054\u5173\u7CFB\u56FE\u8C31", desc: "\u5BA2\u6237\u4E3A\u4E2D\u5FC3\u7684\u5173\u7CFB\u7F51\u7EDC \xB7 \u70B9\u51FB\u8282\u70B9/\u5217\u8868\u9879\u67E5\u770B\u8BE6\u60C5 \xB7 \u6807\u6CE8\u4E0E\u5F53\u524D\u6A21\u578B\u7684\u5173\u7CFB", children: (cust.relations ?? []).length ? /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 16, alignItems: "flex-start" }, children: [
        /* @__PURE__ */ jsxs("div", { style: { width: 280, flexShrink: 0 }, children: [
          /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 8 }, children: [
            "\u5173\u7CFB\u5217\u8868\uFF08",
            cust.relations.length,
            "\uFF09"
          ] }),
          /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: cust.relations.map((r) => /* @__PURE__ */ jsxs(
            "div",
            {
              onClick: () => setSelRel(r),
              style: {
                border: "1px solid " + (selRel?.id === r.id ? "#2563EB" : "#E2E8F0"),
                background: selRel?.id === r.id ? "#EFF6FF" : "#fff",
                borderRadius: 10,
                padding: "10px 12px",
                cursor: "pointer",
                transition: "all .15s"
              },
              children: [
                /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
                  /* @__PURE__ */ jsx("span", { style: { fontSize: 13, fontWeight: 600, color: "#1E293B" }, children: r.name }),
                  /* @__PURE__ */ jsx("span", { style: { fontSize: 11, color: "#fff", background: REL_COLOR[r.type], borderRadius: 999, padding: "1px 7px" }, children: REL_LABEL[r.type] })
                ] }),
                /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, marginTop: 6, flexWrap: "wrap" }, children: [
                  /* @__PURE__ */ jsx("span", { style: { fontSize: 12, color: REL_COLOR[r.type] }, children: r.rel }),
                  r.riskLevel && /* @__PURE__ */ jsxs(Badge, { kind: r.riskLevel === "\u9AD8" ? "red" : r.riskLevel === "\u4E2D" ? "amber" : "green", children: [
                    r.riskLevel,
                    "\u98CE\u9669"
                  ] }),
                  !!r.openAlerts && /* @__PURE__ */ jsxs("span", { style: { fontSize: 11, color: "#DC2626", fontWeight: 600 }, children: [
                    "\u26A0 ",
                    r.openAlerts,
                    " \u9884\u8B66"
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: r.type === "device" || r.risk === "\u9AD8\u5371" ? "#A32D2D" : "#94A3B8", marginTop: 4 }, children: relImpact(r) })
              ]
            },
            r.id
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 12 }, children: [
            graphTheme === "ring" ? /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: "#64748B" }, children: [
              "\u68C0\u6D4B\u5230 ",
              /* @__PURE__ */ jsx("b", { style: { color: "#DC2626" }, children: ringsSummary.length }),
              " \u4E2A\u56E2\u4F19\uFF1A",
              ringsSummary.map((rg) => /* @__PURE__ */ jsxs("span", { style: { marginLeft: 8, display: "inline-flex", alignItems: "center", gap: 4 }, children: [
                /* @__PURE__ */ jsx("span", { style: { width: 8, height: 8, borderRadius: "50%", background: RING_PALETTE[(rg.id - 1) % RING_PALETTE.length], display: "inline-block" } }),
                rg.name,
                "\uFF08",
                rg.count,
                " \u5B9E\u4F53\uFF0C",
                rg.risk,
                "\u98CE\u9669\uFF09"
              ] }, rg.id))
            ] }) : /* @__PURE__ */ jsx("span", {}),
            /* @__PURE__ */ jsx("div", { style: { display: "inline-flex", border: "1px solid #E2E8F0", borderRadius: 8, overflow: "hidden", flexShrink: 0 }, children: ["type", "risk", "ring"].map((t) => /* @__PURE__ */ jsx(
              "span",
              {
                onClick: () => setGraphTheme(t),
                style: {
                  fontSize: 12,
                  padding: "4px 12px",
                  cursor: "pointer",
                  background: graphTheme === t ? "#2563EB" : "#fff",
                  color: graphTheme === t ? "#fff" : "#475569"
                },
                children: THEME_LABEL[t]
              },
              t
            )) })
          ] }),
          /* @__PURE__ */ jsx(RelationGraph, { cust, colorBy: graphTheme, rings: ringsSummary }),
          /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: "#64748B", marginTop: 10, lineHeight: 1.7, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 12px" }, children: prod === "zhicha" ? /* @__PURE__ */ jsxs(Fragment, { children: [
            "\u5F53\u524D\u4E3A",
            /* @__PURE__ */ jsx("b", { style: { color: "#A32D2D" }, children: "\u667A\u5BDF\u5206\uFF08\u53CD\u6B3A\u8BC8\uFF09" }),
            "\uFF1A\u8BBE\u5907\u8282\u70B9\u4E0E\u9AD8\u5371\u5B9E\u4F53\u76F4\u63A5\u5F71\u54CD\u300C\u540C\u8BBE\u5907\u5173\u8054 / \u9ED1\u4EA7\u5173\u8054\u300D\u7279\u5F81\uFF1B\u5171\u501F / \u8054\u7CFB\u4EBA\u8282\u70B9\u4E3A\u667A\u4FE1\u5206\u98CE\u9669\u4F20\u5BFC\u5019\u9009\uFF0C\u6682\u672A\u5165\u6A21\u3002"
          ] }) : prod === "zhixin" ? /* @__PURE__ */ jsxs(Fragment, { children: [
            "\u5F53\u524D\u4E3A",
            /* @__PURE__ */ jsx("b", { style: { color: "#3B6D11" }, children: "\u667A\u4FE1\u5206\uFF08\u4FE1\u7528\uFF09" }),
            "\uFF1A\u5171\u501F / \u62C5\u4FDD / \u8054\u7CFB\u4EBA\u8282\u70B9\u662F\u300C\u5171\u503A / \u98CE\u9669\u4F20\u5BFC\u300D\u5019\u9009\u7279\u5F81\uFF1B\u8BBE\u5907\u4E0E\u9AD8\u5371\u5B9E\u4F53\u4E3B\u8981\u4F9B\u667A\u5BDF\u5206\uFF08\u53CD\u6B3A\u8BC8\uFF09\u4F7F\u7528\u3002"
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            "\u5F53\u524D\u4E3A",
            /* @__PURE__ */ jsx("b", { style: { color: "#534AB7" }, children: "\u667A\u878D\u5206\uFF08\u7EFC\u5408\uFF09" }),
            "\uFF1A\u901A\u8FC7\u5F15\u7528\u667A\u5BDF\u5206 / \u667A\u4FE1\u5206\u95F4\u63A5\u53D7\u5173\u8054\u5B9E\u4F53\u5F71\u54CD\u3002"
          ] }) })
        ] })
      ] }) : /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: "#94A3B8", padding: "12px 0" }, children: "\u8BE5\u5BA2\u6237\u6682\u65E0\u5173\u8054\u5B9E\u4F53\u3002" }) }),
      selRel && /* @__PURE__ */ jsx(RelationDrawer, { r: selRel, custName: cust.name, onClose: () => setSelRel(null) }),
      tab === "alert" && /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs(Panel, { title: "\u9884\u8B66\u4E0E\u5904\u7F6E", desc: "\u5206\u503C/\u89C4\u5219\u9884\u8B66 \u2192 \u5904\u7F6E\u6D41\u7A0B\uFF08\u7BA1\u7406\u4E2D\u5FC3 f-alert-dispose \u8054\u52A8\uFF09\u2192 \u5904\u7F6E\u52A8\u4F5C", children: [
        (() => {
          const band = bandOfScore(prod, item.score);
          return /* @__PURE__ */ jsxs("div", { style: { border: "1px solid " + band.color + "55", background: band.color + "0d", borderRadius: 10, padding: "10px 14px" }, children: [
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", fontSize: 13 }, children: [
              /* @__PURE__ */ jsx(Badge, { kind: band.color === "#DC2626" ? "red" : band.color === "#D97706" ? "amber" : "green", children: band.grade }),
              /* @__PURE__ */ jsxs("span", { style: { fontWeight: 600, color: "#1E293B" }, children: [
                meta.label,
                " ",
                item.score
              ] }),
              /* @__PURE__ */ jsxs("span", { style: { color: "#64748B" }, children: [
                "\u843D\u5165\u300C",
                band.range,
                "\u300D\u533A\u95F4\uFF08",
                band.label,
                "\uFF09\u2192 \u89E6\u53D1\u5206\u503C\u9884\u8B66"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: "#64748B", marginTop: 6, lineHeight: 1.7 }, children: [
              "\u5EFA\u8BAE\u5904\u7F6E\uFF1A",
              /* @__PURE__ */ jsx("b", { style: { color: band.color }, children: band.action }),
              "\u3002\u5206\u503C\u9884\u8B66\u7531\u7EFC\u5408\u5206\u78B0\u649E\u9608\u503C\u533A\u95F4\u4EA7\u751F\uFF1B\u4E0B\u65B9\u89C4\u5219\u547D\u4E2D\u9884\u8B66\u7531\u6570\u636E\u9879\u72EC\u7ACB\u8E29\u7EBF\u89E6\u53D1\uFF08\u4E00\u7968\u5426\u51B3\u5F0F\u8FDB\u6D41\u7A0B\uFF09\uFF0C\u4E24\u7C7B\u5171\u540C\u9A71\u52A8\u5904\u7F6E\u3002"
            ] })
          ] });
        })(),
        flow ? /* @__PURE__ */ jsxs("div", { style: { border: "1px solid #E2E8F0", borderRadius: 10, padding: "12px 14px", margin: "12px 0" }, children: [
          /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: "#94A3B8", marginBottom: 8 }, children: [
            "\u5904\u7F6E\u6D41\u7A0B\u7531\u300C",
            flow.alert_type,
            "\u300D\u9884\u8B66\u9A71\u52A8",
            alertModelOf(flow.alert_type) === prod ? /* @__PURE__ */ jsxs("span", { style: { color: meta.color, fontWeight: 600 }, children: [
              "\uFF08\u4E0E\u5F53\u524D ",
              meta.label,
              " \u76F8\u5173\uFF09"
            ] }) : /* @__PURE__ */ jsxs("span", { children: [
              "\uFF08\u8BE5\u9884\u8B66\u4E3B\u8981\u5F71\u54CD ",
              flow.alert_type ? PROD_META[alertModelOf(flow.alert_type) ?? "zhicha"].label : "",
              "\uFF09"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4, fontSize: 12 }, children: [
            flowSteps.map((s, i) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
              /* @__PURE__ */ jsx("span", { style: {
                padding: "3px 10px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: i === curStage ? 700 : 400,
                color: i === curStage ? "#fff" : i < curStage ? "#059669" : "#94A3B8",
                background: i === curStage ? s.color ?? "#D97706" : i < curStage ? "#EAF3DE" : "#F1F5F9"
              }, children: s.state }),
              i < flowSteps.length - 1 && /* @__PURE__ */ jsx("span", { style: { color: "#CBD5E1", fontSize: 11 }, children: "\u2192" })
            ] }, i)),
            /* @__PURE__ */ jsx("span", { style: { marginLeft: "auto", fontSize: 11, color: "#94A3B8" }, children: flowName })
          ] }),
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 10, paddingTop: 10, borderTop: "1px dashed #E2E8F0" }, children: [
            /* @__PURE__ */ jsxs("span", { style: { fontSize: 12.5, color: "#64748B" }, children: [
              "\u9884\u8B66\u72B6\u6001\uFF1A",
              /* @__PURE__ */ jsx("b", { style: { color: "#D97706" }, children: flow.flowState }),
              "\uFF08",
              flow.alert_type,
              " \xB7 ",
              flow.alert_date,
              " \xB7 \u6D41\u7A0B ",
              flow.flowKey,
              "\uFF09"
            ] }),
            /* @__PURE__ */ jsxs("span", { style: { marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }, children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => nav("/console/cr/mid-dispose-workbench"),
                  style: { fontSize: 13, background: "#1E293B", color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", cursor: "pointer" },
                  children: "\u524D\u5F80\u5904\u7F6E"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => goAlertDetail(flow.alert_id),
                  style: { fontSize: 13, background: "#fff", color: "#334155", border: "1px solid #E2E8F0", borderRadius: 8, padding: "7px 16px", cursor: "pointer" },
                  children: "\u67E5\u770B\u9884\u8B66\u8BE6\u60C5"
                }
              )
            ] })
          ] })
        ] }) : /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", border: "1px solid #E2E8F0", borderRadius: 10, padding: "12px 14px", margin: "12px 0" }, children: [
          /* @__PURE__ */ jsx("span", { style: { fontSize: 12.5, color: "#94A3B8" }, children: "\u8BE5\u5BA2\u6237\u6682\u65E0\u8FDB\u884C\u4E2D\u7684\u5904\u7F6E\u6D41\u7A0B" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => nav("/console/cr/mid-dispose-workbench"),
              style: { fontSize: 13, background: "#1E293B", color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", cursor: "pointer" },
              children: "\u53D1\u8D77\u5904\u7F6E"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { fontSize: 13, fontWeight: 600, color: "#475569", margin: "14px 0 8px" }, children: [
          "\u89C4\u5219\u547D\u4E2D\u9884\u8B66\uFF08",
          alertCards.length,
          " \u6761\uFF09",
          /* @__PURE__ */ jsxs("span", { style: { fontSize: 11, fontWeight: 400, color: "#94A3B8", marginLeft: 8 }, children: [
            meta.label,
            " \u76F8\u5173 \xB7 \u7531\u6570\u636E\u9879\u8E29\u7EBF\u89E6\u53D1"
          ] })
        ] }),
        alertCards.length ? /* @__PURE__ */ jsx("div", { className: "space-y-2", children: alertCards.map((a, i) => /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => goAlertDetail(a.alert_id),
            style: {
              display: "flex",
              alignItems: "center",
              gap: 12,
              width: "100%",
              textAlign: "left",
              border: "1px solid " + meta.color + "66",
              borderRadius: 10,
              padding: "10px 14px",
              background: meta.color + "0a",
              cursor: "pointer"
            },
            children: [
              /* @__PURE__ */ jsx(Badge, { kind: a.level === "RED" ? "red" : a.level === "YELLOW" ? "amber" : "green", children: a.level === "RED" ? "\u7EA2" : a.level === "YELLOW" ? "\u9EC4" : "\u673A" }),
              /* @__PURE__ */ jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
                /* @__PURE__ */ jsxs("div", { style: { fontSize: 13, fontWeight: 600, color: "#1E293B", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
                  a.alert_type,
                  " \xB7 ",
                  a.scene,
                  /* @__PURE__ */ jsx("span", { style: { fontSize: 10.5, color: "#fff", background: meta.color, borderRadius: 6, padding: "1px 7px" }, children: "\u672C\u6A21\u578B\u76F8\u5173" })
                ] }),
                /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: "#94A3B8", marginTop: 2 }, children: [
                  a.rule_name,
                  " \xB7 \u89E6\u53D1\u503C ",
                  a.metric_value,
                  "\uFF08\u9608\u503C ",
                  a.threshold,
                  "\uFF09\xB7 ",
                  a.alert_date
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: a.flowState ? "#D97706" : "#94A3B8", flexShrink: 0 }, children: a.flowState ?? (a.status ?? "\u5F85\u5904\u7F6E") }),
              /* @__PURE__ */ jsx("span", { style: { fontSize: 12, color: "#94A3B8", flexShrink: 0 }, children: "\u203A" })
            ]
          },
          i
        )) }) : /* @__PURE__ */ jsxs("div", { style: { fontSize: 13, color: "#94A3B8", padding: "12px 0" }, children: [
          "\u8BE5\u5BA2\u6237\u6682\u65E0\u4E0E ",
          meta.label,
          " \u76F8\u5173\u7684\u89C4\u5219\u547D\u4E2D\u9884\u8B66\u3002"
        ] }),
        otherAlerts.length > 0 && /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: "#94A3B8", marginTop: 10, lineHeight: 1.8, background: "#F8FAFC", border: "1px dashed #E2E8F0", borderRadius: 8, padding: "8px 12px" }, children: [
          "\u53E6\u6709 ",
          otherAlerts.length,
          " \u6761\u9884\u8B66\u5C5E\u4E8E\u5176\u4ED6\u6A21\u578B\uFF1A",
          otherAlerts.map((a, i) => /* @__PURE__ */ jsxs("span", { style: { marginLeft: 8 }, children: [
            /* @__PURE__ */ jsx("span", { style: { color: PROD_META[alertModelOf(a.alert_type) ?? "zhicha"].color }, children: PROD_META[alertModelOf(a.alert_type) ?? "zhicha"].label }),
            "\xB7 ",
            a.alert_type,
            /* @__PURE__ */ jsx("span", { style: { color: "#CBD5E1" }, children: "\uFF5C" })
          ] }, i)),
          /* @__PURE__ */ jsx("span", { children: "\u53EF\u5728\u5BF9\u5E94\u6A21\u578B\u8BC4\u5206\u9875\u67E5\u770B\u3002" })
        ] })
      ] }) }),
      tab === "data" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs(Panel, { title: "\u6570\u636E\u660E\u7EC6", desc: `${meta.label} \u8BC4\u5206\u4F7F\u7528\u7684\u539F\u59CB\u6570\u636E \xB7 \u70B9\u51FB\u884C\u5C55\u5F00\u9010\u7B14\u660E\u7EC6 \xB7 \u300C\u2192 \u7279\u5F81\u300D\u4E3A\u8BE5\u6570\u636E\u4F9B\u54EA\u4E2A\u6A21\u578B\u7EF4\u5EA6\u4F7F\u7528`, children: [
          INPUT_DETAILS[prod].map((d, i) => {
            const open = !!openInput[i];
            const statusKind = d.status === "\u89E6\u53D1" ? "red" : d.status === "\u5173\u6CE8" ? "amber" : "green";
            return /* @__PURE__ */ jsxs("div", { style: { border: "1px solid " + (open ? "#CBD5E1" : "#F1F5F9"), borderRadius: 10, marginBottom: 8, overflow: "hidden" }, children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => setOpenInput((s) => ({ ...s, [i]: !s[i] })),
                  style: { width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#fff", border: "none", cursor: "pointer", textAlign: "left" },
                  children: [
                    /* @__PURE__ */ jsx("span", { style: { fontSize: 11, color: "#94A3B8", flexShrink: 0, width: 16, textAlign: "center" }, children: open ? "\u25BE" : "\u25B8" }),
                    /* @__PURE__ */ jsx("span", { style: { fontSize: 12.5, fontWeight: 600, color: "#1E293B", width: 140, flexShrink: 0 }, children: d.name }),
                    /* @__PURE__ */ jsx("span", { style: { fontSize: 12, color: "#94A3B8", width: 100, flexShrink: 0 }, children: d.source }),
                    /* @__PURE__ */ jsx("span", { style: { fontSize: 12, color: "#94A3B8", width: 120, flexShrink: 0 }, children: d.window }),
                    /* @__PURE__ */ jsx("span", { style: { fontSize: 12, color: "#475569", flex: 1, minWidth: 0 }, children: d.value }),
                    /* @__PURE__ */ jsxs("span", { style: { fontSize: 11, color: "#185FA5", flexShrink: 0 }, children: [
                      "\u2192 \u7279\u5F81\uFF1A",
                      d.feat
                    ] }),
                    /* @__PURE__ */ jsx(Badge, { kind: statusKind, children: d.status })
                  ]
                }
              ),
              open && /* @__PURE__ */ jsxs("div", { style: { padding: "8px 14px 12px 42px", background: "#F8FAFC", borderTop: "1px dashed #E2E8F0" }, children: [
                /* @__PURE__ */ jsx("div", { style: { fontSize: 11.5, fontWeight: 600, color: "#64748B", marginBottom: 6 }, children: d.detailTitle }),
                /* @__PURE__ */ jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 12 }, children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { children: d.cols.map((c, j) => /* @__PURE__ */ jsx("th", { style: { textAlign: "left", padding: "5px 8px", color: "#94A3B8", fontWeight: 500, borderBottom: "1px solid #E2E8F0" }, children: c }, j)) }) }),
                  /* @__PURE__ */ jsx("tbody", { children: d.rows.map((r, j) => /* @__PURE__ */ jsx("tr", { style: { borderBottom: "1px solid #EEF2F7" }, children: r.map((cell, k) => /* @__PURE__ */ jsx("td", { style: { padding: "5px 8px", color: "#334155" }, children: cell }, k)) }, j)) })
                ] })
              ] })
            ] }, i);
          }),
          /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: "#94A3B8", marginTop: 8 }, children: "\u300C\u89E6\u53D1\u300D= \u8E29\u7EBF\u5E76\u547D\u4E2D\u89C4\u5219\u9884\u8B66\uFF1B\u300C\u5173\u6CE8\u300D= \u63A5\u8FD1\u9608\u503C\u5F85\u89C2\u5BDF\uFF1B\u300C\u6B63\u5E38\u300D= \u6B63\u5E38\u53C2\u4E0E\u8BC4\u5206\u3002\u539F\u59CB\u6570\u636E\u7ECF\u6570\u636E\u6CBB\u7406\u540E\u63D0\u70BC\u4E3A\u6A21\u578B\u7279\u5F81\uFF0C\u518D\u53C2\u4E0E\u8BC4\u5206\uFF08\u89C1\u6A21\u578B\u4FE1\u606F Tab\uFF09\u3002" })
        ] }),
        /* @__PURE__ */ jsxs(Panel, { title: "\u6570\u636E\u6765\u6E90", desc: "\u6A21\u578B\u8BC4\u5206\u4F9D\u8D56\u7684\u8F93\u5165\u6570\u636E", children: [
          /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: "#334155", lineHeight: 1.9 }, children: capa.lineage.map((s, i) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 10, padding: "6px 0", borderBottom: i < capa.lineage.length - 1 ? "1px dashed #F1F5F9" : "none" }, children: [
            /* @__PURE__ */ jsx("span", { style: { flexShrink: 0, fontSize: 12, fontWeight: 600, color: meta.color, width: 110 }, children: s.stage }),
            /* @__PURE__ */ jsx("span", { style: { fontSize: 12.5, color: "#64748B" }, children: s.detail })
          ] }, i)) }),
          /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: "#94A3B8", marginTop: 10, display: "flex", alignItems: "center", gap: 6 }, children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => nav("/console/cr/mid-single-cust"),
                style: { fontSize: 12.5, color: "#185FA5", background: "none", border: "none", padding: 0, cursor: "pointer", textDecoration: "underline" },
                children: "\u67E5\u770B\u5B8C\u6574\u7528\u6237\u6570\u636E\u6863\u6848 \u2192"
              }
            ),
            /* @__PURE__ */ jsx("span", { children: "\uFF08\u5355\u5BA2 360\xB0 \u753B\u50CF\uFF09" })
          ] })
        ] })
      ] }),
      tab === "model" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs(Panel, { title: "\u57FA\u672C\u4FE1\u606F", desc: "\u6A21\u578B\u7248\u672C\u4E0E\u5F52\u5C5E", children: [
          /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }, children: [
            /* @__PURE__ */ jsx(CapCell, { label: "\u6A21\u578B", value: `${meta.label} \xB7 ${item.modelVersion}` }),
            /* @__PURE__ */ jsx(CapCell, { label: "\u6A21\u578B\u7C7B\u578B", value: isFraud ? "XGBoost + \u89C4\u5219\u878D\u5408" : prod === "zhixin" ? "LightGBM \u8BC4\u5206\u5361" : "\u878D\u5408\u903B\u8F91\u56DE\u5F52" }),
            /* @__PURE__ */ jsx(CapCell, { label: "\u6700\u8FD1\u8BAD\u7EC3", value: reg.lastTrain ?? "\u2014" }),
            /* @__PURE__ */ jsx(CapCell, { label: "\u8F93\u5165\u6570\u636E\u7248\u672C", value: "2026Q2" }),
            /* @__PURE__ */ jsx(CapCell, { label: "\u9002\u7528\u5BA2\u7FA4", value: capa.applicable }),
            /* @__PURE__ */ jsx(CapCell, { label: "\u6A21\u578B\u8D1F\u8D23\u4EBA", value: capa.owner }),
            /* @__PURE__ */ jsx(CapCell, { label: "\u72B6\u6001", value: reg.status?.v ?? "\u2014" }),
            /* @__PURE__ */ jsx(CapCell, { label: "\u8BC4\u5206\u65F6\u95F4", value: item.calcedAt })
          ] }),
          /* @__PURE__ */ jsx("div", { style: { fontSize: 12.5, fontWeight: 600, color: "#475569", margin: "16px 0 8px" }, children: "\u7248\u672C\u5386\u53F2" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2", children: capa.versions.map((v, i) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 12, padding: "8px 12px", border: "1px solid #F1F5F9", borderRadius: 10, background: i === 0 ? meta.color + "08" : "#fff" }, children: [
            /* @__PURE__ */ jsxs("div", { style: { flexShrink: 0, width: 110 }, children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 12.5, fontWeight: 700, color: meta.color }, children: v.version }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: "#94A3B8", marginTop: 2 }, children: v.date })
            ] }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 12.5, color: "#475569", lineHeight: 1.7 }, children: v.note }),
            i === 0 && /* @__PURE__ */ jsx(Badge, { kind: meta.danger ? "red" : "green", children: "\u5F53\u524D" })
          ] }, i)) })
        ] }),
        /* @__PURE__ */ jsxs(Panel, { title: "\u7ED3\u679C\u542B\u4E49", desc: "\u5206\u6570\u533A\u95F4 \u2192 \u7B49\u7EA7 \u2192 \u5EFA\u8BAE\u52A8\u4F5C", children: [
          /* @__PURE__ */ jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 13 }, children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { style: { color: "#94A3B8", fontSize: 12, textAlign: "left", borderBottom: "1px solid #E2E8F0" }, children: [
              /* @__PURE__ */ jsx("th", { style: { padding: "8px 10px", fontWeight: 500 }, children: "\u5206\u6570\u533A\u95F4" }),
              /* @__PURE__ */ jsx("th", { style: { padding: "8px 10px", fontWeight: 500 }, children: "\u7B49\u7EA7" }),
              /* @__PURE__ */ jsx("th", { style: { padding: "8px 10px", fontWeight: 500 }, children: "\u542B\u4E49" }),
              /* @__PURE__ */ jsx("th", { style: { padding: "8px 10px", fontWeight: 500 }, children: "\u5EFA\u8BAE\u52A8\u4F5C" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { children: THRESHOLDS[prod].map((t, i) => /* @__PURE__ */ jsxs("tr", { style: { borderBottom: "1px solid #F1F5F9" }, children: [
              /* @__PURE__ */ jsx("td", { style: { padding: "8px 10px", fontVariantNumeric: "tabular-nums", color: "#334155" }, children: t.range }),
              /* @__PURE__ */ jsx("td", { style: { padding: "8px 10px", fontWeight: 600, color: t.color }, children: t.grade }),
              /* @__PURE__ */ jsx("td", { style: { padding: "8px 10px", color: "#64748B" }, children: t.label }),
              /* @__PURE__ */ jsx("td", { style: { padding: "8px 10px", color: "#475569" }, children: t.action })
            ] }, i)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: "#94A3B8", marginTop: 8 }, children: [
            "\u5F53\u524D\u5F97\u5206 ",
            item.score,
            " \u843D\u5728\u300C",
            item.grade,
            "\u300D\u6863\u4F4D\uFF0C\u89E6\u53D1\u5206\u503C\u9884\u8B66\uFF08\u89C1\u300C\u9884\u8B66\u4E0E\u5904\u7F6E\u300DTab\uFF09\u3002"
          ] })
        ] }),
        /* @__PURE__ */ jsx(Panel, { title: "\u8FD0\u8425\u6548\u679C", desc: "\u6A21\u578B\u4E0A\u7EBF\u540E\u7684\u4E1A\u52A1\u8868\u73B0\u4E0E\u8D8B\u52BF", children: (() => {
          const ops = MODEL_OPS[prod];
          return /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 16 }, children: ops.metrics.map((m, i) => /* @__PURE__ */ jsxs("div", { style: { background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10, padding: "12px 14px" }, children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: "#94A3B8" }, children: m.label }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 22, fontWeight: 800, color: m.color, marginTop: 4, fontVariantNumeric: "tabular-nums" }, children: m.value }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: "#94A3B8", marginTop: 2 }, children: m.sub })
            ] }, i)) }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 8 }, children: "\u8FD1 6 \u6708\u8D8B\u52BF" }),
            /* @__PURE__ */ jsx(
              LineChart,
              {
                labels: ops.trend.map((t) => t.month),
                series: [
                  { name: "\u8BC4\u5206\u8986\u76D6\u7387", color: "#2563EB", data: ops.trend.map((t) => t.coverage) },
                  { name: "\u9884\u8B66\u51C6\u786E\u7387", color: "#16A34A", data: ops.trend.map((t) => t.accuracy) },
                  { name: "\u5904\u7F6E\u53CA\u65F6\u7387", color: "#7C3AED", data: ops.trend.map((t) => t.timely) }
                ],
                unit: "%",
                height: 200,
                yMin: 75
              }
            ),
            /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: "#94A3B8", marginTop: 10, lineHeight: 1.7, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 12px" }, children: [
              /* @__PURE__ */ jsx("b", { style: { color: "#475569" }, children: "\u6307\u6807\u8BF4\u660E\uFF1A" }),
              "\u8BC4\u5206\u8986\u76D6\u7387 = \u6709\u8BC4\u5206\u5BA2\u6237\u5360\u76EE\u6807\u5BA2\u7FA4\u6BD4\u4F8B\uFF1B\u9884\u8B66\u51C6\u786E\u7387 = \u9884\u8B66\u540E\u7ECF\u6838\u5B9E\u786E\u5B9E\u5B58\u5728\u98CE\u9669\u7684\u6BD4\u4F8B\uFF1B\u5904\u7F6E\u53CA\u65F6\u7387 = \u5728\u89C4\u5B9A\u65F6\u9650\u5185\u5B8C\u6210\u5904\u7F6E\u7684\u9884\u8B66\u5360\u6BD4\u3002\u4E09\u9879\u6307\u6807\u6301\u7EED\u5411\u597D\u8BF4\u660E\u6A21\u578B\u8FD0\u8425\u7A33\u5065\u3002"
            ] })
          ] });
        })() }),
        /* @__PURE__ */ jsxs(Panel, { title: "\u7B97\u6CD5\u89E3\u91CA", desc: "\u6A21\u578B\u600E\u4E48\u7B97\u51FA\u6765\u7684", children: [
          /* @__PURE__ */ jsxs("div", { style: { fontSize: 13, color: "#334155", lineHeight: 1.9, marginBottom: 14 }, children: [
            /* @__PURE__ */ jsx("b", { children: "\u65B9\u6CD5\uFF1A" }),
            capa.method
          ] }),
          /* @__PURE__ */ jsx("div", { style: { fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 8 }, children: "\u7279\u5F81\u4E0E\u8840\u7F18" }),
          /* @__PURE__ */ jsx("div", { style: { display: "flex", alignItems: "stretch", gap: 0, flexWrap: "wrap", marginBottom: 16 }, children: capa.lineage.map((s, i) => /* @__PURE__ */ jsxs("div", { style: { flex: "1 1 200px", minWidth: 180, position: "relative", padding: "0 8px" }, children: [
            /* @__PURE__ */ jsxs("div", { style: { border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 12px", height: "100%", background: "#fff" }, children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: 700, color: meta.color }, children: s.stage }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: "#64748B", marginTop: 6, lineHeight: 1.6 }, children: s.detail })
            ] }),
            i < capa.lineage.length - 1 && /* @__PURE__ */ jsx("div", { style: { position: "absolute", right: -6, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: 16 }, children: "\u2192" })
          ] }, i)) }),
          /* @__PURE__ */ jsx("div", { style: { fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 8 }, children: "\u5168\u5C40\u7279\u5F81\u91CD\u8981\u6027\uFF08\u6A21\u578B\u7EA7\uFF0C\u533A\u522B\u4E8E\u672C\u5BA2\u5C40\u90E8\u56E0\u5B50\uFF09" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2", children: capa.global.map((g, i) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
            /* @__PURE__ */ jsx("span", { style: { fontSize: 12, color: "#334155", width: 90, flexShrink: 0 }, children: g.name }),
            /* @__PURE__ */ jsx("div", { style: { flex: 1, height: 7, background: "#F1F5F9", borderRadius: 999, overflow: "hidden" }, children: /* @__PURE__ */ jsx("div", { style: { width: `${Math.min(g.importance * 2.4, 100)}%`, height: "100%", background: meta.color, borderRadius: 999 } }) }),
            /* @__PURE__ */ jsxs("span", { style: { fontSize: 12, color: "#64748B", width: 36, textAlign: "right" }, children: [
              g.importance,
              "%"
            ] })
          ] }, i)) })
        ] })
      ] })
    ] })
  ] });
}
