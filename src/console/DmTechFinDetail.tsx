import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageShell } from './PageShell';
import { loadQixinPage, QixinPage } from './qixinRuntime';

/* 科创金融 · 企业详情 · 1:1 原样复刻
 * 详情内 7 个 tab（各自独立无后缀快照 + 同名 .html 作 CSS 源）：
 *   企业概览(tab-tech-innovate-detail-overview)  ← 营销 - 科创金融 - 科创企业库 - 企业概览
 *   科创力分析(tab-tech-innovate-detail-creativity) ← 营销 - 科创金融 - 科创企业库 - 科创力分析
 *   科创成果分析(tab-tech-innovate-detail-achievement) ← 营销 - 科创金融 - 科创企业库 - 科创成果分析
 *   科研团队分析(tab-tech-innovate-detail-team)  ← 营销 - 科创金融 - 科创企业库 - 科研团队分析
 *   荣誉资质(tab-tech-innovate-detail-honor)  ← 营销 - 科创金融 - 科创企业库 - 荣誉资质
 *   资产分析(tab-tech-innovate-detail-property) ← 营销 - 科创金融 - 科创企业库 - 资产分析
 *   风险分析(tab-tech-innovate-detail-risk)  ← 营销 - 科创金融 - 科创企业库 - 风险分析
 * 进入来源：科创金融·科创企业库列表企业名点击
 *   URL: /console/dm/techfin-detail?name=xxx&back=/console/dm/techfin
 */

type DetailTab = { key: string; label: string; tabId: string; src: string; html: string };

const BASE = '营销 - 科创金融 - 科创企业库';
const TABS: DetailTab[] = [
  { key: 'overview', label: '企业概览', tabId: 'tab-tech-innovate-detail-overview', src: `${BASE} - 企业概览`, html: `${BASE} - 企业概览.html` },
  { key: 'creativity', label: '科创力分析', tabId: 'tab-tech-innovate-detail-creativity', src: `${BASE} - 科创力分析`, html: `${BASE} - 科创力分析.html` },
  { key: 'achievement', label: '科创成果分析', tabId: 'tab-tech-innovate-detail-achievement', src: `${BASE} - 科创成果分析`, html: `${BASE} - 科创成果分析.html` },
  { key: 'team', label: '科研团队分析', tabId: 'tab-tech-innovate-detail-team', src: `${BASE} - 科研团队分析`, html: `${BASE} - 科研团队分析.html` },
  { key: 'honor', label: '荣誉资质', tabId: 'tab-tech-innovate-detail-honor', src: `${BASE} - 荣誉资质`, html: `${BASE} - 荣誉资质.html` },
  { key: 'property', label: '资产分析', tabId: 'tab-tech-innovate-detail-property', src: `${BASE} - 资产分析`, html: `${BASE} - 资产分析.html` },
  { key: 'risk', label: '风险分析', tabId: 'tab-tech-innovate-detail-risk', src: `${BASE} - 风险分析`, html: `${BASE} - 风险分析.html` },
];

const PATCH = `
  #content{min-height:auto !important;background:transparent !important;}
  .page-content{padding-bottom:24px !important;}
  /* 顶部固定面包屑：在 SaaS 框架内会与全局 header 重叠，改为文档流，由 PageShell 提供层级 */
  .detail-breadcrumb.p-fixed{position:static !important;background:transparent !important;border-bottom:1px solid #edf0f5 !important;}
  .detail-breadcrumb-placeholder{display:none !important;}
`;

export default function DmTechFinDetail() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const name = params.get('name') || '科创企业详情';
  const backUrl = params.get('back') || '/console/dm/techfin';

  const [hash, setHash] = useState('overview');
  const [page, setPage] = useState<QixinPage | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  // hash 路由同步
  useEffect(() => {
    const sync = () => {
      const h = window.location.hash.replace(/^#\/?/, '');
      const tab = TABS.find((t) => t.key === h);
      setHash(tab ? tab.key : 'overview');
    };
    sync();
    if (!window.location.hash) window.location.replace('#overview');
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
      .catch((err) => console.error('loadQixinPage techfin-detail error:', err));
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

    // 返回按钮 + 面包屑「科创金融」链接 → 列表页（保留入口外壳）
    const backIcon = body.querySelector('.detail-breadcrumb .icon_arrowleft') as HTMLElement | null;
    if (backIcon) {
      backIcon.style.cursor = 'pointer';
      backIcon.addEventListener('click', () => nav(backUrl));
    }
    const crumbLink = Array.from(body.querySelectorAll('.detail-breadcrumb .hover-link, .detail-breadcrumb span'))
      .find((n) => (n.textContent || '').trim() === '科创金融') as HTMLElement | null;
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
      <PageShell title="科创企业详情" crumb="数字营销 / 专题营销 / 科创金融" subtitle={subtitle} legend={false} />
      <div
        ref={hostRef}
        style={{ width: '100%', maxWidth: 1440, margin: '0 auto', minHeight: 600, padding: '0 24px' }}
      />
    </>
  );
}
