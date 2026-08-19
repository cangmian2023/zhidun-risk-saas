import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from './PageShell';
import { loadQixinPage, QixinPage } from './qixinRuntime';

/* 集团户 · 1:1 原样复刻（record/qixin 快照运行时加载）
 * 主链接 tab：关注 / 央企 / 国企 / 民营 / 外资 / 机构
 *   - 每个 tab 加载各自的无后缀 DOM 快照（含 tab 导航 + 对应 pane 内容）
 *   - .html 文件作为 CSS 来源（_files 目录被浏览器缓存，切 tab 不重复下载）
 * 点击集团卡片(.enterprise .e-name) → 集团详情 dm:group-account-detail
 */

type TabDef = { key: string; label: string; tabId: string; src: string; html: string };

const TABS: TabDef[] = [
  { key: 'watch', label: '关注', tabId: 'tab-watch', src: '营销 - 集团户', html: '营销 - 集团户 - 央企.html' },
  { key: 'yangqi', label: '央企', tabId: 'tab-10104002', src: '营销 - 集团户 - 央企', html: '营销 - 集团户 - 央企.html' },
  { key: 'guoqi', label: '国企', tabId: 'tab-10104001', src: '营销 - 集团户 - 国企', html: '营销 - 集团户 - 国企.html' },
  { key: 'minying', label: '民营', tabId: 'tab-10104022', src: '营销 - 集团户 - 民营', html: '营销 - 集团户 - 民营.html' },
  { key: 'waizi', label: '外资', tabId: 'tab-10104015', src: '营销 - 集团户 - 外资', html: '营销 - 集团户 - 外资.html' },
  { key: 'jigou', label: '机构', tabId: 'tab-10000000', src: '营销 - 集团户 - 机构', html: '营销 - 集团户 - 机构.html' },
];

// 轻量样式补丁：让快照内容在 SaaS 容器内自然铺展；隐藏顶部固定面包屑（主列表页没有，仅保险）
const PATCH = `
  #content{min-height:auto !important;background:transparent !important;}
  .page-content{padding-bottom:24px !important;}
  .detail-breadcrumb.p-fixed{position:static !important;}
`;

export default function DmGroupAccount() {
  const nav = useNavigate();
  const [hash, setHash] = useState('watch');
  const [page, setPage] = useState<QixinPage | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  // hash 路由同步
  useEffect(() => {
    const sync = () => {
      const h = window.location.hash.replace(/^#/, '');
      const tab = TABS.find((t) => t.key === h);
      setHash(tab ? tab.key : 'watch');
    };
    sync();
    if (!window.location.hash) window.location.replace('#watch');
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
      .catch((err) => console.error('loadQixinPage group error:', err));
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

    // 1) tab 点击 → hash 切换
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

    // 2) 集团卡片点击 → 集团详情（取 .e-name 文本作为集团名）
    const cards = Array.from(body.querySelectorAll('.enterprise')) as HTMLElement[];
    cards.forEach((card) => {
      const nameEl = card.querySelector('.e-name');
      const name = (nameEl?.textContent || '').trim();
      if (!name) return;
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        // 「关注」按钮等内部控件不触发跳转
        const target = e.target as HTMLElement;
        if (target.closest('.add-btn')) return;
        e.preventDefault();
        nav(`/console/dm/group-account-detail?name=${encodeURIComponent(name)}&back=/console/dm/group-account`);
      });
    });
  }, [page, nav]);

  const subtitle = useMemo(() => {
    const t = TABS.find((x) => x.key === hash);
    return `集团客户管理 · ${t?.label ?? ''}`;
  }, [hash]);

  return (
    <>
      <PageShell title="集团户" crumb="数字营销 / 潜客挖掘" subtitle={subtitle} legend={false} />
      <div
        ref={hostRef}
        style={{ width: '100%', maxWidth: 1440, margin: '0 auto', minHeight: 600, padding: '0 24px' }}
      />
    </>
  );
}
