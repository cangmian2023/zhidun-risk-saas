import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from './PageShell';
import { loadQixinPage, QixinPage } from './qixinRuntime';

/* 供应链 · 1:1 原样复刻（record/qixin 快照运行时加载）
 * 数据源二分法：
 *   - HTML 内容 = 无后缀快照「营销 - 供应链」（Vue 渲染后的纯 DOM dump，含全部卡片/表格/数字，无样式）
 *   - CSS = 兄弟营销列表页「营销 - 招投标.html」提取（供应链模块全套组件样式：supply-chain-list /
 *     qxb-filters / el-table / el-cascader / value-capital / app-company-link 等均在内）
 * Shadow DOM 注入：样式与宿主 SaaS 完全隔离，类名不污染全局。
 * 交互接管（剥离 Vue 后手动绑定）：
 *   - 表格公司名链接(.app-company-link a) 点击 → 企业档案 dm:ent-archive
 *   - 「企业尽调」操作按钮(.el-button--text) 点击 → 企业档案 dm:ent-archive
 */
const SRC = '营销 - 供应链'; // 无后缀 = HTML 内容主源
const CSS_HTML = '营销 - 招投标.html'; // .html = CSS 来源（同 Vue 应用，供应链模块组件样式齐全）

// 轻量样式补丁：让快照在 SaaS 容器内自然铺展（去掉原页固定面包屑 min-height / 白底）
const PATCH = `
  #content{min-height:auto !important;background:transparent !important;}
  .page-content{padding-bottom:24px !important;}
  .supply-chain{padding-bottom:0 !important;}
`;

export default function DmSupplyChain() {
  const nav = useNavigate();
  const [page, setPage] = useState<QixinPage | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  // 运行时加载快照（HTML + CSS）
  useEffect(() => {
    let alive = true;
    setPage(null);
    loadQixinPage(SRC, CSS_HTML, PATCH)
      .then((p) => { if (alive) setPage(p); })
      .catch((err) => console.error('loadQixinPage supply-chain error:', err));
    return () => { alive = false; };
  }, []);

  // Shadow DOM 注入 + 交互绑定
  useEffect(() => {
    const el = hostRef.current;
    if (!el || !page) return;
    const root = el.shadowRoot || el.attachShadow({ mode: 'open' });
    root.innerHTML = '';
    const style = document.createElement('style');
    style.textContent = page.css;
    const body = document.createElement('div');
    body.innerHTML = page.html;
    root.append(style, body);

    // 公司名链接（.app-company-link a）→ 企业档案
    const links = Array.from(body.querySelectorAll('.app-company-link a')) as HTMLElement[];
    links.forEach((a) => {
      a.style.cursor = 'pointer';
      a.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        nav('/console/dm/ent-archive');
      });
    });

    // 「企业尽调」操作按钮 → 企业档案
    const buttons = Array.from(body.querySelectorAll('.el-table__body .el-button--text')) as HTMLElement[];
    buttons.forEach((b) => {
      const txt = (b.textContent || '').trim();
      if (txt !== '企业尽调') return;
      b.style.cursor = 'pointer';
      b.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        nav('/console/dm/ent-archive');
      });
    });
  }, [page, nav]);

  return (
    <>
      <PageShell title="供应链" crumb="数字营销 / 潜客挖掘" subtitle="产业链上下游企业挖掘与供应链金融商机识别" legend={false} />
      <div
        ref={hostRef}
        style={{ width: '100%', maxWidth: 1440, margin: '0 auto', minHeight: 600, padding: '0 24px' }}
      />
    </>
  );
}
