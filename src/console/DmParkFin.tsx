import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from './PageShell';
import { loadQixinPage, QixinPage } from './qixinRuntime';

/* 园区金融 · 1:1 原样复刻（record/qixin 快照运行时加载）
 * 主页面 2 个 tab：
 *   园区金融(tab-park-finance-home)  ← 营销 - 园区金融（开发区企业列表）
 *   园区列表(tab-park-finance-search) ← 营销 - 园区金融 - 园区列表
 * 两个 tab 的快照各自独立（主文件 search pane 为懒加载空壳，故按 tab 分别加载其完整快照）。
 */

type TabDef = { key: string; label: string; tabId: string; src: string; html: string };

const TABS: TabDef[] = [
  { key: 'park-finance', label: '园区金融', tabId: 'tab-park-finance-home', src: '营销 - 园区金融', html: '营销 - 园区金融.html' },
  { key: 'park-list', label: '园区列表', tabId: 'tab-park-finance-search', src: '营销 - 园区金融 - 园区列表', html: '营销 - 园区金融 - 园区列表.html' },
];

// 轻量样式补丁：让快照在 SaaS 容器内自然铺展；隐藏顶部固定面包屑避免与全局 header 重叠
const PATCH = `
  #content{min-height:auto !important;background:transparent !important;}
  .page-content{padding-bottom:24px !important;}
  .detail-breadcrumb.p-fixed{position:static !important;background:transparent !important;border-bottom:1px solid #edf0f5 !important;}
  .detail-breadcrumb-placeholder{display:none !important;}
`;

export default function DmParkFin() {
  const nav = useNavigate();
  const [hash, setHash] = useState('park-finance');
  const [page, setPage] = useState<QixinPage | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  // hash 路由同步
  useEffect(() => {
    const sync = () => {
      const h = window.location.hash.replace(/^#\/?/, '');
      const tab = TABS.find((t) => t.key === h);
      setHash(tab ? tab.key : 'park-finance');
    };
    sync();
    if (!window.location.hash) window.location.replace('#park-finance');
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
      .catch((err) => console.error('loadQixinPage park-fin error:', err));
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

    // 1) tab 点击 → hash 切换（两文件各有完整 tab 导航，跨文件跳转也对）
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

    // 2) 企业名称点击 → 企业档案
    const links = Array.from(body.querySelectorAll('.company-name-link')) as HTMLElement[];
    links.forEach((link) => {
      const nameEl = link.querySelector('.name-span') || link.querySelector('.name-wrapper') || link;
      const name = (nameEl.textContent || '').trim();
      if (!name) return;
      link.style.cursor = 'pointer';
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        nav(`/console/dm/ent-archive?name=${encodeURIComponent(name)}&back=/console/dm/park-fin`);
      });
    });
  }, [page, nav]);

  const subtitle = useMemo(() => {
    const t = TABS.find((x) => x.key === hash);
    return `园区金融产品及企业触达 · ${t?.label ?? ''}`;
  }, [hash]);

  return (
    <>
      <PageShell title="园区金融" crumb="数字营销 / 专题营销" subtitle={subtitle} legend={false} />
      <div
        ref={hostRef}
        style={{ width: '100%', maxWidth: 1440, margin: '0 auto', minHeight: 600, padding: '0 24px' }}
      />
    </>
  );
}
