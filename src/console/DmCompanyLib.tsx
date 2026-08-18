import React, { useEffect, useRef, useState } from 'react';
import { PageShell } from './PageShell';
import { loadQixinPage, QixinPage } from './qixinRuntime';

/* 企业库 · record/qixin 快照运行时加载
 *  - 主页（home）：营销 - 企业库（卡片落地页）
 *      · 顶部 8 主题 tab 始终吸顶（重点推荐/科技认定/绿色信贷/重大项目/学校医院/优质供应商/金融机构/其他）
 *      · 「所有卡片在一个滚动页里」按主题分区块（#cardBody → .library-box → .library-item，全站 46 张）
 *      · 点 tab = 平滑滚到对应主题区块（不切视图）；滚动时 tab 自动高亮当前区块（scrollspy）
 *      · 点卡片 → 进入企业列表
 *  - 列表（list）：营销 - 企业库 - 列表（左侧筛选 + 数据表），Shadow DOM 注入
 */

// 主页补丁：隐藏原站自带分类条 + 顶部多余标题头（与框架 PageShell 标题重复、含空白 headerBottom）；区块加 scroll-margin 避开吸顶 tab
const HOME_PATCH = `
.qxb-container__header{display:none !important;}
.el-tabs__header{display:none !important;}
.library-wrapper{display:block !important;}
#cardBody{padding:0 !important;}
.library-box{scroll-margin-top:120px;margin-bottom:8px;}
`;

// 列表补丁：去除原站冗余 tab 头/陈旧面包屑、约束宽度、表格留白
const LIST_PATCH = `
.el-tabs__header{display:none !important;}
.enterprise-library-layout{display:block !important}
.qxb-container.page-template-wrapper{padding:0 !important}
.filter-card{margin:0 0 14px !important}
.qxb-breadcrumb,.breadcrumb{display:none !important}
.el-table{width:100% !important;font-size:13px}
.el-table th{background:#f7f9fc !important;color:#4a5160;font-weight:600}
.el-table td,.el-table th{padding:9px 12px !important}
.el-table .cell{line-height:1.5 !important}
.el-pagination{margin-top:14px !important}
`;

const THEMES = [
  { key: 'zdtj', label: '重点推荐' },
  { key: 'kjrd', label: '科技认定' },
  { key: 'lsxd', label: '绿色信贷' },
  { key: 'zdxm', label: '重大项目' },
  { key: 'xxyy', label: '学校医院' },
  { key: 'gys', label: '优质供应商' },
  { key: 'jrjg', label: '金融机构' },
  { key: 'qt', label: '其他' },
] as const;

export default function DmCompanyLib() {
  const [view, setView] = useState<'home' | 'list'>('home'); // 默认主页（卡片）
  const [active, setActive] = useState<string>('zdtj'); // 当前高亮主题
  const [pages, setPages] = useState<{ home: QixinPage | null; list: QixinPage | null }>({
    home: null,
    list: null,
  });
  const hostRef = useRef<HTMLDivElement>(null);
  const boxesRef = useRef<{ id: string; el: HTMLElement }[]>([]);

  /* 同时加载主页卡片 + 企业列表快照 */
  useEffect(() => {
    let alive = true;
    Promise.all([
      loadQixinPage('营销 - 企业库', '营销 - 企业库.html', HOME_PATCH),
      loadQixinPage('营销 - 企业库 - 列表', '营销 - 企业库 - 列表.html', LIST_PATCH),
    ])
      .then(([home, list]) => {
        if (alive) setPages({ home, list });
      })
      .catch((err) => console.error('loadQixinPage error:', err));
    return () => {
      alive = false;
    };
  }, []);

  /* Shadow DOM 注入 */
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const page = view === 'home' ? pages.home : pages.list;
    if (!page) return;

    const root = el.shadowRoot || el.attachShadow({ mode: 'open' });
    root.innerHTML = '';
    const style = document.createElement('style');
    style.textContent = page.css;
    const body = document.createElement('div');
    body.innerHTML = page.html;
    root.append(style, body);

    if (view === 'home') {
      // 收集各主题区块（全部显示，不切视图）
      boxesRef.current = THEMES.map((t) => ({
        id: t.key,
        el: root.getElementById(t.key) as HTMLElement,
      })).filter((b) => b.el);
      // 卡片点击 → 进入企业列表
      body.querySelectorAll<HTMLElement>('.library-item').forEach((it) => {
        it.style.cursor = 'pointer';
        it.addEventListener('click', () => setView('list'));
      });
    }
  }, [view, pages]);

  /* scrollspy：滚动时高亮当前主题区块 */
  useEffect(() => {
    if (view !== 'home') return;
    const onScroll = () => {
      const offset = 112; // 框架头部(56) + 吸顶 tab(52) + 余量
      let cur = THEMES[0].key;
      for (const b of boxesRef.current) {
        if (b.el.getBoundingClientRect().top - offset <= 0) cur = b.id;
      }
      setActive((prev) => (prev === cur ? prev : cur));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [view, pages]);

  // 点 tab：平滑滚到对应区块（不减视图）
  const onTheme = (key: string) => {
    setActive(key);
    const target = hostRef.current?.shadowRoot?.getElementById(key);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <PageShell title="企业库" subtitle="潜客企业名录 · 启信慧眼" legend={false} />
      {/* 8 主题 tab：仅卡片主页显示（吸顶锚点导航，点击平滑滚动到区块）；企业列表视图隐藏 */}
      {view === 'home' && (
        <div className="cl-tabbar-wrap">
          <div className="cl-tabbar">
            {THEMES.map((t) => (
              <button
                key={t.key}
                className={`cl-tab-btn ${active === t.key ? 'active' : ''}`}
                onClick={() => onTheme(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="cl-content">
        <div ref={hostRef} style={{ width: '100%', minHeight: 600 }} />
      </div>
      <style>{`
        .cl-tabbar-wrap{position:sticky;top:56px;z-index:300;background:#fff;border-bottom:1px solid #edf0f5;box-shadow:0 2px 10px rgba(0,0,0,.05)}
        .cl-tabbar{display:flex;align-items:stretch;gap:2px;max-width:1440px;margin:0 auto;padding:0 24px;height:52px}
        .cl-tab-btn{height:52px;padding:0 16px;border:none;background:transparent;font-size:15px;color:#4a5160;cursor:pointer;position:relative;transition:color .15s;white-space:nowrap}
        .cl-tab-btn:hover{color:#2b6de5}
        .cl-tab-btn.active{color:#2b6de5;font-weight:600}
        .cl-tab-btn.active::after{content:'';position:absolute;left:16px;right:16px;bottom:0;height:3px;border-radius:2px;background:#2b6de5}
        .cl-content{padding:16px 24px 24px;max-width:1440px;margin:0 auto}
      `}</style>
    </>
  );
}
