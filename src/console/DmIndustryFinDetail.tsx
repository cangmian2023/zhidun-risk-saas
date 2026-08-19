import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageShell } from './PageShell';
import { loadQixinPage, QixinPage } from './qixinRuntime';

/* 产业金融 · 详情 · 1:1 原样复刻
 * 11 个 tab（产业概览/综合评价/产业链图/产业地图/产业发展/产业引导基金/财务分析/企业名单/风险图谱/产业动态/客户列表）
 * 注意：源快照为 Vue SPA 静默壳，多数 tab 的 pane 内容未被保存工具捕获（仅「企业名单」含真实表格）。
 *       仅做原样加载 + tab 激活/显隐，绝不编造数据；无独立源文件的「产业地图」复用概览快照的空 pane 并标注暂无数据。
 * URL: /console/dm/industry-fin-detail?name=人工智能&back=/console/dm/industry-fin
 */

type Tab = { key: string; label: string; tabId: string; paneId: string; src: string; html: string; empty?: boolean };

const TABS: Tab[] = [
  { key: 'overview', label: '产业概览', tabId: 'tab-industry-detail-overview', paneId: 'pane-industry-detail-overview', src: '营销 - 产业金融 - 产业概览', html: '营销 - 产业金融 - 产业概览.html' },
  { key: 'synthetic', label: '综合评价', tabId: 'tab-industry-detail-synthetic-evaluate', paneId: 'pane-industry-detail-synthetic-evaluate', src: '营销 - 产业金融 - 综合评价', html: '营销 - 产业金融 - 综合评价.html' },
  { key: 'chains', label: '产业链图', tabId: 'tab-industry-detail-chains', paneId: 'pane-industry-detail-chains', src: '营销 - 产业金融 - 产业链图', html: '营销 - 产业金融 - 产业链图.html' },
  { key: 'map', label: '产业地图', tabId: 'tab-industry-detail-map', paneId: 'pane-industry-detail-map', src: '营销 - 产业金融 - 产业概览', html: '营销 - 产业金融 - 产业概览.html', empty: true },
  { key: 'evolution', label: '产业发展', tabId: 'tab-industry-detail-evolution', paneId: 'pane-industry-detail-evolution', src: '营销 - 产业金融 - 产业发展', html: '营销 - 产业金融 - 产业发展.html' },
  { key: 'guidance', label: '产业引导基金', tabId: 'tab-industry-detail-guidance-fund', paneId: 'pane-industry-detail-guidance-fund', src: '营销 - 产业金融 - 产业引导基金', html: '营销 - 产业金融 - 产业引导基金.html' },
  { key: 'financing', label: '财务分析', tabId: 'tab-industry-detail-financing-analyse', paneId: 'pane-industry-detail-financing-analyse', src: '营销 - 产业金融 - 财务分析', html: '营销 - 产业金融 - 财务分析.html' },
  { key: 'main-ent', label: '企业名单', tabId: 'tab-industry-detail-main-ent', paneId: 'pane-industry-detail-main-ent', src: '营销 - 产业金融 - 企业名单', html: '营销 - 产业金融 - 企业名单.html' },
  { key: 'risk', label: '风险图谱', tabId: 'tab-industry-detail-risk-profile', paneId: 'pane-industry-detail-risk-profile', src: '营销 - 产业金融 - 风险图谱', html: '营销 - 产业金融 - 风险图谱.html' },
  { key: 'dynamics', label: '产业动态', tabId: 'tab-industry-detail-dynamics', paneId: 'pane-industry-detail-dynamics', src: '营销 - 产业金融 - 产业动态', html: '营销 - 产业金融 - 产业动态.html' },
  { key: 'customer', label: '客户列表', tabId: 'tab-industry-detail-customer-list', paneId: 'pane-industry-detail-customer-list', src: '营销 - 产业金融 - 客户列表', html: '营销 - 产业金融 - 客户列表.html' },
];

const PATCH = `
  #content{min-height:auto !important;background:transparent !important;}
  .page-content{padding-bottom:24px !important;}
  .detail-breadcrumb.p-fixed{position:static !important;background:transparent !important;border-bottom:1px solid #edf0f5 !important;}
  .detail-breadcrumb-placeholder{display:none !important;}
`;

function activateTab(body: HTMLElement, key: string) {
  TABS.forEach((t) => {
    const tabNode = body.querySelector(`#${t.tabId}`) as HTMLElement | null;
    if (tabNode) {
      tabNode.classList.toggle('is-active', t.key === key);
      tabNode.setAttribute('aria-selected', t.key === key ? 'true' : 'false');
    }
    const paneNode = body.querySelector(`#${t.paneId}`) as HTMLElement | null;
    if (paneNode) {
      if (t.key === key) {
        paneNode.style.display = 'block';
        paneNode.setAttribute('aria-hidden', 'false');
        if (t.empty) {
          const tip = paneNode.querySelector('.qxb-empty-tip') as HTMLElement | null;
          if (!tip) {
            const d = document.createElement('div');
            d.className = 'qxb-empty-tip';
            d.style.cssText = 'padding:60px 0;text-align:center;color:#97a3b0;font-size:14px;';
            d.textContent = '暂无数据（该产业地图资料待补充）';
            paneNode.appendChild(d);
          }
        }
      } else {
        paneNode.style.display = 'none';
        paneNode.setAttribute('aria-hidden', 'true');
      }
    }
  });
}

export default function DmIndustryFinDetail() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const name = params.get('name') || '人工智能';
  const backUrl = params.get('back') || `/console/${params.get('from') || 'dm'}/industry-fin`;

  const [key, setKey] = useState('overview');
  const [page, setPage] = useState<QixinPage | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tab = TABS.find((t) => t.key === key);
    if (!tab) return;
    let alive = true;
    setPage(null);
    loadQixinPage(tab.src, tab.html, PATCH)
      .then((p) => { if (alive) setPage(p); })
      .catch((err) => console.error('loadQixinPage industry-fin-detail error:', err));
    return () => { alive = false; };
  }, [key]);

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

    activateTab(body, key);

    TABS.forEach((t) => {
      const node = body.querySelector(`#${t.tabId}`) as HTMLElement | null;
      if (node) {
        node.style.cursor = 'pointer';
        node.addEventListener('click', (e) => {
          e.stopPropagation();
          setKey(t.key);
        });
      }
    });

    const backIcon = body.querySelector('.detail-breadcrumb .icon_arrowleft') as HTMLElement | null;
    if (backIcon) {
      backIcon.style.cursor = 'pointer';
      backIcon.addEventListener('click', () => nav(backUrl));
    }
    const crumbLink = Array.from(body.querySelectorAll('.detail-breadcrumb .hover-link, .detail-breadcrumb span'))
      .find((n) => (n.textContent || '').trim() === '产业金融') as HTMLElement | null;
    if (crumbLink) {
      crumbLink.style.cursor = 'pointer';
      crumbLink.addEventListener('click', () => nav(backUrl));
    }
  }, [page, key, nav, backUrl]);

  const subtitle = `${name} · ${(TABS.find((t) => t.key === key) || {}).label || ''}`;

  return (
    <>
      <PageShell title="产业金融详情" crumb="数字营销 / 专题营销 / 产业金融" subtitle={subtitle} legend={false} />
      {!page && <div style={{ padding: '40px 24px', color: '#97a3b0', maxWidth: 1440, margin: '0 auto' }}>加载中…</div>}
      <div
        ref={hostRef}
        style={{ width: '100%', maxWidth: 1440, margin: '0 auto', minHeight: 600, padding: '0 24px' }}
      />
    </>
  );
}
