import { useEffect, useRef, useState } from 'react';
import { PageShell } from './PageShell';
import { loadQixinPage, QixinPage } from './qixinRuntime';

/* 网格营销 · record/qixin 快照运行时加载
 * 源：营销 - 网格营销（内容）+ 营销 - 网格营销.html（CSS）
 * 特点：纯高德地图视图，地图上直接显示统计标记（新增企业/园区/协会/新商机/企业）
 */

const PATCH = `
/* 确保地图容器占满 Shadow DOM */
.amap-maps{height:100% !important;width:100% !important;}
.amap-layers{height:100% !important;width:100% !important;}
/* 覆盖 canvas 固定显示尺寸 */
.amap-layer{width:100% !important;height:100% !important;}
/* 去掉 body 默认 padding（源 CSS 有多个 body 定义） */
body{padding:0 !important;margin:0 !important;}
`;

export default function DmGridMarketing() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState<QixinPage | null>(null);

  useEffect(() => {
    let alive = true;
    loadQixinPage('营销 - 网格营销', '营销 - 网格营销.html', PATCH)
      .then((p) => { if (alive) setPage(p); })
      .catch((err) => console.error('loadQixinPage error:', err));
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
    body.style.height = '100%';
    body.innerHTML = page.html;
    root.append(style, body);
  }, [page]);

  return (
    <>
      <PageShell title="网格营销" subtitle="网格化责任片区管理：片区客户分布、商机跟进与业绩看板" legend={false} />
      <div ref={hostRef} style={{ width: '100%', height: 'calc(100vh - 56px)' }} />
    </>
  );
}
