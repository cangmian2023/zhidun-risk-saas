import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from './PageShell';
import { loadQixinPage, QixinPage } from './qixinRuntime';

/* 科创金融 · 1:1 原样复刻（record/qixin 快照运行时加载）
 * 主页面 2 个 tab：
 *   科创金融工作台(tab-tech-innovate-home) ← 营销 - 科创金融
 *   科创企业库(tab-tech-innovate-search)   ← 营销 - 科创金融 - 科创企业库
 * 两个 tab 内点击任意企业名称(.company-name-link .name-span) → 科创企业详情 dm:techfin-detail
 */

type TabDef = { key: string; label: string; tabId: string; src: string; html: string };

const TABS: TabDef[] = [
  { key: 'workbench', label: '科创金融工作台', tabId: 'tab-tech-innovate-home', src: '营销 - 科创金融', html: '营销 - 科创金融.html' },
  // 科创企业库 .html 实为 qiankun 微应用局部 DOM dump（无 <head>/<link>/_files），提取不到 CSS；
  // 该 tab 与工作台同属一个 Vue 应用，CSS 全部来自主页面 营销 - 科创金融.html，故复用其作 CSS 源。
  { key: 'corp-lib', label: '科创企业库', tabId: 'tab-tech-innovate-search', src: '营销 - 科创金融 - 科创企业库', html: '营销 - 科创金融.html' },
];

// 轻量样式补丁：让快照内容在 SaaS 容器内自然铺展；隐藏顶部固定面包屑
const PATCH = `
  #content{min-height:auto !important;background:transparent !important;}
  .page-content{padding-bottom:24px !important;}
  .detail-breadcrumb.p-fixed{position:static !important;background:transparent !important;border-bottom:1px solid #edf0f5 !important;}
  .detail-breadcrumb-placeholder{display:none !important;}
`;

export default function DmTechFin() {
  const nav = useNavigate();
  const [hash, setHash] = useState('workbench');
  const [page, setPage] = useState<QixinPage | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  // hash 路由同步
  useEffect(() => {
    const sync = () => {
      const h = window.location.hash.replace(/^#\/?/, '');
      const tab = TABS.find((t) => t.key === h);
      setHash(tab ? tab.key : 'workbench');
    };
    sync();
    if (!window.location.hash) window.location.replace('#workbench');
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  // 运行时加载当前 tab
  useEffect(() => {
    const tab = TABS.find((t) => t.key === hash);
    if (!tab) return;
    let alive = true;
    setPage(null);
    loadQixinPage(tab.src, tab.html, PATCH)
      .then((p) => { if (alive) setPage(p); })
      .catch((err) => console.error('loadQixinPage techfin error:', err));
    return () => { alive = false; };
  }, [hash]);

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

    // 1) tab 点击 → hash 切换（两个 tab 各自文件都有完整 tab 导航，跨文件跳转也对）
    TABS.forEach((t) => {
      const node = body.querySelector(`#${t.tabId}`) as HTMLElement | null;
      if (node) {
        node.style.cursor = 'pointer';
        node.addEventListener('click', (e) => {
          e.stopPropagation();
          window.location.hash = t.key;
        });
      }
    });

    // 2) 企业名称点击 → 科创企业详情
    const links = Array.from(body.querySelectorAll('.company-name-link')) as HTMLElement[];
    links.forEach((link) => {
      const nameEl = link.querySelector('.name-span') || link;
      const name = (nameEl.textContent || '').trim();
      if (!name) return;
      link.style.cursor = 'pointer';
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        nav(`/console/dm/techfin-detail?name=${encodeURIComponent(name)}&back=/console/dm/techfin`);
      });
    });
  }, [page, nav]);

  const subtitle = useMemo(() => {
    const t = TABS.find((x) => x.key === hash);
    return `科创企业专属金融服务 · ${t?.label ?? ''}`;
  }, [hash]);

  return (
    <>
      <PageShell title="科创金融" crumb="数字营销 / 专题营销" subtitle={subtitle} legend={false} />
      <div
        ref={hostRef}
        style={{ width: '100%', maxWidth: 1440, margin: '0 auto', minHeight: 600, padding: '0 24px' }}
      />
    </>
  );
}
