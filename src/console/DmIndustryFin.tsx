import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from './PageShell';
import { loadQixinPage, QixinPage } from './qixinRuntime';

/* 产业金融 · 主链接 · 1:1 原样复刻
 * 源快照为 Vue SPA 静默壳（"ent-micro doesn't work properly without JavaScript"），行业卡片栅格未被保存工具捕获渲染。
 * 做法：原样加载快照；绑定 .industry-item 点击进入详情。
 * 兜底：若快照内无渲染出的行业卡片，则按源详情面包屑中真实存在的产业名「人工智能」补一个入口，保证「点击→详情」链路可用（不编造数据）。
 * URL: /console/dm/industry-fin
 */

const PATCH = `
  #content{min-height:auto !important;background:transparent !important;}
  .app-header-v3,header{position:static !important;}
`;

function gotoDetail(nav: (u: string) => void, name: string) {
  nav(`/console/dm/industry-fin-detail?name=${encodeURIComponent(name)}&back=/console/dm/industry-fin`);
}

export default function DmIndustryFin() {
  const nav = useNavigate();
  const [page, setPage] = useState<QixinPage | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    loadQixinPage('营销 - 产业金融', '营销 - 产业金融.html', PATCH)
      .then((p) => { if (alive) setPage(p); })
      .catch((e) => console.error('loadQixinPage industry-fin error:', e));
    return () => { alive = false; };
  }, []);

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

    const items = body.querySelectorAll('.industry-item');
    items.forEach((node) => {
      const n = node as HTMLElement;
      n.style.cursor = 'pointer';
      n.addEventListener('click', () => {
        const nameEl = n.querySelector('.content_name .name') || n.querySelector('.name');
        gotoDetail(nav, (nameEl?.textContent || '').trim() || '人工智能');
      });
    });
    body.querySelectorAll('.industry-item .el-button').forEach((b) =>
      b.addEventListener('click', (e) => e.stopPropagation()),
    );

    // 兜底：快照未渲染行业栅格时，补一个源中真实存在的「人工智能」入口
    if (items.length === 0) {
      const wrap = body.querySelector('#content, .app-content, body') || body;
      const card = document.createElement('div');
      card.className = 'industry-item industry-fallback';
      card.style.cssText =
        'display:inline-flex;align-items:center;gap:12px;margin:16px;padding:16px 20px;border:1px solid #e6ebf2;border-radius:10px;cursor:pointer;background:#fff;';
      card.innerHTML =
        '<span style="font-size:16px;font-weight:600;color:#0d1a26;">人工智能</span>' +
        '<span style="font-size:12px;color:#76788b;">点击查看产业详情</span>';
      card.addEventListener('click', () => gotoDetail(nav, '人工智能'));
      wrap.appendChild(card);
    }
  }, [page, nav]);

  return (
    <>
      <PageShell
        title="产业金融"
        crumb="数字营销 / 专题营销"
        subtitle="聚焦重点产业的链式营销：产业概览、产业链图、产业地图、财务分析、企业名单与风险图谱"
        legend={false}
      />
      {!page && <div style={{ padding: '40px 24px', color: '#97a3b0', maxWidth: 1440, margin: '0 auto' }}>加载中…</div>}
      <div
        ref={hostRef}
        style={{ width: '100%', maxWidth: 1440, margin: '0 auto', minHeight: 600, padding: '0 24px' }}
      />
    </>
  );
}
