import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageShell } from './PageShell';
import { loadQixinPage, QixinPage } from './qixinRuntime';

/* 集团户 · 详情 · 1:1 原样复刻
 * 两个 tab：
 *   集团信息(tab-basicInfo)  ← 营销 - 集团户 - 详情
 *   商机信息(tab-businessInfo) ← 营销 - 集团户 - 详情 - 商机信息
 * 进入来源：集团户列表卡片点击 / 企业档案·集团信息（集团名链接）
 *   URL: /console/dm/group-account-detail?name=xxx&from=dm
 */

type DetailTab = { key: string; label: string; tabId: string; src: string; html: string };

const TABS: DetailTab[] = [
  { key: 'basic', label: '集团信息', tabId: 'tab-basicInfo', src: '营销 - 集团户 - 详情', html: '营销 - 集团户 - 详情.html' },
  { key: 'business', label: '商机信息', tabId: 'tab-businessInfo', src: '营销 - 集团户 - 详情 - 商机信息', html: '营销 - 集团户 - 详情 - 商机信息.html' },
];

const PATCH = `
  #content{min-height:auto !important;background:transparent !important;}
  .page-content{padding-bottom:24px !important;}
  /* 顶部固定面包屑：在 SaaS 框架内会与全局 header 重叠，改为文档流，由 PageShell 提供层级 */
  .detail-breadcrumb.p-fixed{position:static !important;background:transparent !important;border-bottom:1px solid #edf0f5 !important;}
  .detail-breadcrumb-placeholder{display:none !important;}
`;

export default function DmGroupAccountDetail() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const name = params.get('name') || '集团详情';
  const backUrl = params.get('back') || `/console/${params.get('from') || 'dm'}/group-account`;

  const [hash, setHash] = useState('basic');
  const [page, setPage] = useState<QixinPage | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  // hash 路由同步
  useEffect(() => {
    const sync = () => {
      const h = window.location.hash.replace(/^#\/?/, '');
      const tab = TABS.find((t) => t.key === h);
      setHash(tab ? tab.key : 'basic');
    };
    sync();
    if (!window.location.hash) window.location.replace('#basic');
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  // 加载当前 tab
  useEffect(() => {
    const tab = TABS.find((t) => t.key === hash);
    if (!tab) return;
    let alive = true;
    setPage(null);
    loadQixinPage(tab.src, tab.html, PATCH)
      .then((p) => { if (alive) setPage(p); })
      .catch((err) => console.error('loadQixinPage group-detail error:', err));
    return () => { alive = false; };
  }, [hash]);

  // Shadow DOM 注入 + tab/返回绑定
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

    // tab 切换
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

    // 返回按钮 + 面包屑「集团户」链接 → 列表页（保留入口外壳）
    const backIcon = body.querySelector('.detail-breadcrumb .icon_arrowleft') as HTMLElement | null;
    if (backIcon) {
      backIcon.style.cursor = 'pointer';
      backIcon.addEventListener('click', () => nav(backUrl));
    }
    const crumbLink = Array.from(body.querySelectorAll('.detail-breadcrumb .hover-link, .detail-breadcrumb span'))
      .find((n) => (n.textContent || '').trim() === '集团户') as HTMLElement | null;
    if (crumbLink) {
      crumbLink.style.cursor = 'pointer';
      crumbLink.addEventListener('click', () => nav(backUrl));
    }
  }, [page, nav, backUrl]);

  const subtitle = useMemo(() => {
    const t = TABS.find((x) => x.key === hash);
    return `${name} · ${t?.label ?? ''}`;
  }, [hash, name]);

  return (
    <>
      <PageShell title="集团户详情" crumb="数字营销 / 潜客挖掘 / 集团户" subtitle={subtitle} legend={false} />
      <div
        ref={hostRef}
        style={{ width: '100%', maxWidth: 1440, margin: '0 auto', minHeight: 600, padding: '0 24px' }}
      />
    </>
  );
}
