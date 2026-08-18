import React, { useEffect, useRef, useState } from 'react';
import { PageShell } from './PageShell';
import { loadQixinPage, loadQixinPageFromHtml, QixinPage } from './qixinRuntime';

/* 全维搜索 · 1:1 原样复刻（record/qixin 原始快照运行时加载）
 * 数据源：
 *   企业 = 营销 - 全维搜索（无后缀）+ 营销 - 全维搜索.html
 *   人员/商机/风险/研报 = 营销 - 全维搜索 - {人员|商机|风险|研报}.html
 * 渲染 = Shadow DOM 注入（样式与宿主零污染）
 */

const TABS = [
  { key: 'ent', label: '企业' },
  { key: 'person', label: '人员' },
  { key: 'clue', label: '商机' },
  { key: 'risk', label: '风险' },
  { key: 'report', label: '研报' },
] as const;

const loaders: Record<string, () => Promise<QixinPage>> = {
  ent: () => loadQixinPage('营销 - 全维搜索', '营销 - 全维搜索.html'),
  person: () => loadQixinPageFromHtml('营销 - 全维搜索 - 人员.html'),
  clue: () => loadQixinPageFromHtml('营销 - 全维搜索 - 商机.html'),
  risk: () => loadQixinPageFromHtml('营销 - 全维搜索 - 风险.html'),
  report: () => loadQixinPageFromHtml('营销 - 全维搜索 - 研报.html'),
};

export default function DmFullSearch() {
  const [hash, setHash] = useState('ent');
  const [page, setPage] = useState<QixinPage | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  /* hash 路由同步 */
  useEffect(() => {
    const sync = () => {
      const h = window.location.hash.replace(/^#/, '');
      const tab = TABS.find((t) => t.key === h);
      setHash(tab ? tab.key : 'ent');
    };
    sync();
    if (!window.location.hash) window.location.replace('#ent');
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  /* 运行时加载当前页 */
  useEffect(() => {
    const loader = loaders[hash];
    if (!loader) return;
    let alive = true;
    setPage(null);
    loader()
      .then((p) => {
        if (alive) setPage(p);
      })
      .catch((err) => {
        console.error('loadQixinPage error:', err);
      });
    return () => {
      alive = false;
    };
  }, [hash]);

  /* Shadow DOM 注入 + Tab 点击事件绑定 */
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

    // 绑定 Tab 点击：el-tabs__item id → hash
    const tabMap: Record<string, string> = {
      'tab-search-advanced': 'ent',
      'tab-search-advanced-person': 'person',
      'tab-search-advanced-clue': 'clue',
      'tab-search-advanced-risk': 'risk',
      'tab-search-advanced-monitor': 'monitor',
      'tab-search-advanced-report': 'report',
    };
    Object.entries(tabMap).forEach(([id, key]) => {
      const tab = body.querySelector(`#${id}`);
      if (tab) {
        tab.addEventListener('click', () => {
          window.location.hash = key;
        });
        tab.setAttribute('style', (tab.getAttribute('style') || '') + ';cursor:pointer;');
      }
    });
  }, [page]);

  return (
    <>
      <PageShell title="全维搜索" subtitle="高级搜索 · 启信慧眼" legend={false} />
      <div ref={hostRef} style={{ width: '100%', minHeight: 600 }} />
    </>
  );
}
