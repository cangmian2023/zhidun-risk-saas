import React, { useEffect, useRef, useState } from 'react';
import { PageShell } from './PageShell';
import { loadQixinPage } from './qixinRuntime';
import { extractPersonHeader, extractPersonContent, extractPersonNav, PERSON_UNIFY } from './qixinInject';
import type { PersonNavTab, PersonNavSection } from './qixinInject';

/* 个人档案 · 1:1 原样复刻（record/qixin 快照，运行时直接加载，无需预生成）
 * 结构（与企业档案保持一致）：
 *   概要（基本信息源 #peolpe-basic-info 提取，所有 tab 共用）—— 正常流，随页滚走
 *   主 Tab 工具条（原生 React，吸顶；悬停展开统一大白色 mega 面板，列出所有 tab 的下拉项）
 *   内容区（随 tab 切换）
 */

type Tab = { label: string; hash: string; count?: string };

// 个人档案主 Tab（与源站 #peolpe-navigator 顺序一致）
// 子项（分区标题）从对应源文件内容动态提取，不在此静态声明
const PERSON_TABS: Tab[] = [
  { label: '基本信息', hash: 'basic', count: '999+' },
  { label: '风险信息', hash: 'risk', count: '9' },
  { label: '专利信息', hash: 'patent', count: '14' },
  { label: '关联企业风险', hash: 'related-risk' },
  { label: '个人图谱', hash: 'graph' },
  { label: '历史信息', hash: 'history', count: '199' },
];

// 每个 hash → 源文件（无后缀=HTML 内容，.html=CSS 来源）
const PREFIX = '尽调 - 人员尽调 - 人员详情 - ';
const PERSON_FILES: Record<string, { src: string; html: string }> = {
  'basic': { src: PREFIX + '基本信息', html: PREFIX + '基本信息.html' },
  'risk': { src: PREFIX + '风险信息', html: PREFIX + '风险信息.html' },
  'history': { src: PREFIX + '历史信息', html: PREFIX + '历史信息.html' },
  'related-risk': { src: PREFIX + '关联企业风险', html: PREFIX + '关联企业风险.html' },
  'graph': { src: PREFIX + '个人图谱', html: PREFIX + '个人图谱.html' },
  'patent': { src: PREFIX + '专利信息', html: PREFIX + '专利信息.html' },
};

type Resolved = { tabIdx: number; pageKey: string };
type SectionItem = { id: string; title: string; count: string; disabled: boolean; hasContent: boolean };

function resolve(hash: string): Resolved {
  for (let i = 0; i < PERSON_TABS.length; i++) {
    const t = PERSON_TABS[i];
    if (t.hash === hash) return { tabIdx: i, pageKey: t.hash };
  }
  return { tabIdx: 0, pageKey: 'basic' };
}

// 基本信息概要（缓存，所有 tab 共用）
let basicPromise: Promise<{ html: string; css: string }> | null = null;
function loadBasic() {
  if (!basicPromise) basicPromise = loadQixinPage(PREFIX + '基本信息', PREFIX + '基本信息.html');
  return basicPromise;
}

export default function DmPersonArchive() {
  const [hash, setHash] = useState('basic');
  const [hover, setHover] = useState(false);
  const [resolved, setResolved] = useState<Resolved>(resolve('basic'));
  const [basic, setBasic] = useState<{ html: string; css: string } | null>(null);
  const [page, setPage] = useState<{ html: string; css: string } | null>(null);
  const [navTabs, setNavTabs] = useState<PersonNavTab[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [activeSection, setActiveSection] = useState('');
  const summaryRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // hash 路由同步
  useEffect(() => {
    const apply = () => {
      const h = window.location.hash.replace(/^#\/?/, '');
      setHash(h || 'basic');
      if (!window.location.hash) window.location.replace('#basic');
    };
    apply();
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
  }, []);

  useEffect(() => { setResolved(resolve(hash)); setSections([]); setActiveSection(''); }, [hash]);

  // 加载概要（基本信息）
  useEffect(() => {
    let alive = true;
    loadBasic().then((b) => { if (alive) setBasic(b); });
    return () => { alive = false; };
  }, []);

  // 加载当前页
  useEffect(() => {
    let alive = true;
    const f = PERSON_FILES[resolved.pageKey];
    setPage(null);
    setSections([]);
    setActiveSection('');
    if (f) loadQixinPage(f.src, f.html).then((m) => { if (alive) setPage(m); });
    return () => { alive = false; };
  }, [resolved.pageKey]);

  // 概要：#peolpe-basic-info + 从导航提取完整分区列表
  useEffect(() => {
    const el = summaryRef.current;
    if (!el || !basic) return;
    const root = el.shadowRoot || el.attachShadow({ mode: 'open' });
    root.innerHTML = '';
    const style = document.createElement('style');
    style.textContent = (basic.css || '') + '\n' + PERSON_UNIFY;
    const body = document.createElement('div');
    body.innerHTML = extractPersonHeader(basic.html);
    root.append(style, body);

    // 从基本信息提取完整导航（含所有 tab 的分区列表和 disabled 空项）
    const nav = extractPersonNav(basic.html);
    if (nav.length > 0) setNavTabs(nav);
  }, [basic]);

  // 内容：切分 + 匹配导航分区 + 空数据补空状态卡片
  useEffect(() => {
    const el = contentRef.current;
    if (!el || !page || !basic) return;
    const root = el.shadowRoot || el.attachShadow({ mode: 'open' });
    root.innerHTML = '';
    const contentHtml = extractPersonContent(page.html);
    const style = document.createElement('style');
    style.textContent = (basic.css || '') + '\n' + (page.css || '') + '\n' + PERSON_UNIFY;
    const body = document.createElement('div');
    body.innerHTML = contentHtml;

    // 从导航获取当前 tab 的完整分区列表
    const currentNavTab = navTabs[resolved.tabIdx];
    const navSections: PersonNavSection[] = currentNavTab?.sections || [];

    // 从渲染内容中抓已有的 section（按标题匹配）
    const renderedSecs = Array.from(body.querySelectorAll('section.bg-white'));
    const renderedTitles = new Map<string, HTMLElement>();
    renderedSecs.forEach((s) => {
      const titleEl = s.querySelector('.company-section-title');
      const title = (titleEl?.textContent || '').trim();
      if (title) renderedTitles.set(title, s as HTMLElement);
    });

    const secList: SectionItem[] = [];
    const container = document.createElement('div');

    if (navSections.length > 0) {
      // 有导航分区：按导航顺序排列，有内容用源内容，没内容补空状态
      navSections.forEach((ns, i) => {
        const id = `sec-${i}`;
        const rendered = renderedTitles.get(ns.title);
        if (rendered) {
          rendered.id = id;
          container.appendChild(rendered);
        } else {
          const emptyCard = document.createElement('section');
          emptyCard.id = id;
          emptyCard.className = 'section bg-white';
          emptyCard.innerHTML = `
            <div class="section-top"><div class="company-section-title-container">
              <div class="company-section-title">${ns.title}</div>
            </div></div>
            <div class="section-body">
              <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 0;color:#9aa3b2;font-size:14px;">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style="margin-bottom:12px;opacity:.4">
                  <rect x="6" y="10" width="36" height="28" rx="4" stroke="currentColor" stroke-width="2"/>
                  <path d="M6 18h36M14 26h8M14 32h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span>暂无${ns.title}数据</span>
              </div>
            </div>`;
          container.appendChild(emptyCard);
        }
        secList.push({ id, title: ns.title, count: ns.count, disabled: ns.disabled, hasContent: !!rendered });
      });
    } else {
      // 无导航分区（图谱页等）：直接放渲染内容
      renderedSecs.forEach((s, i) => {
        const id = `sec-${i}`;
        s.id = id;
        container.appendChild(s);
        const titleEl = s.querySelector('.company-section-title');
        secList.push({ id, title: (titleEl?.textContent || '').trim() || `第${i + 1}项`, count: '', disabled: false, hasContent: true });
      });
      if (renderedSecs.length === 0 && body.children.length > 0) {
        Array.from(body.children).forEach((ch) => container.appendChild(ch.cloneNode(true)));
      }
    }

    root.append(style, container);
    setSections(secList);
    if (secList.length > 0) setActiveSection(secList[0].id);
  }, [page, basic, navTabs, resolved.tabIdx]);

  const go = (h: string) => { window.location.hash = h; };

  // 滚动到指定 section（考虑吸顶高度偏移）
  const scrollToSection = (secId: string) => {
    const el = contentRef.current;
    if (!el) return;
    const root = el.shadowRoot;
    if (!root) return;
    const target = root.getElementById(secId);
    if (target) {
      const y = target.getBoundingClientRect().top + window.scrollY - 210;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSection(secId);
    }
  };

  return (
    <>
      <PageShell title="个人档案" subtitle="人员尽调档案 · qixin 快照 1:1 原样复刻（record/qixin）" legend={false} />
      <style>{`
        /* 统一宽度容器：与 PageHeader 左右边距一致（lg: px-8 = 32px） */
        .dm-archive-frame{max-width:1440px;margin:0 auto;padding:0 24px}
        /* 吸顶位置：框架 header 56px + PageHeader 约 84px → 总 top:140px */
        .ent-tabbar-wrap{position:sticky;top:140px;z-index:290;background:transparent;border:none;box-shadow:none;padding:12px 0}
        .ent-tabbar{display:flex;align-items:stretch;gap:2px;max-width:1440px;margin:0 auto;padding:0 24px;height:52px}
        .ent-tabbar-inner{background:#fff;border:1px solid #edf0f5;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.06);display:flex;align-items:stretch;gap:2px;padding:0 8px;height:52px;width:100%}
        .ent-tab-item{display:flex;align-items:center}
        .ent-tab-btn{display:inline-flex;align-items:center;gap:5px;height:52px;padding:0 14px;border:none;background:transparent;font-size:15px;color:#4a5160;cursor:pointer;position:relative;transition:color .15s}
        .ent-tab-btn:hover{color:#2b6de5}
        .ent-tab-btn.active{color:#2b6de5;font-weight:600}
        .ent-tab-btn.active::after{content:'';position:absolute;left:14px;right:14px;bottom:0;height:3px;border-radius:2px;background:#2b6de5}
        .ent-tab-count{font-size:11px;color:#ff5a5f;background:#fff0f0;border-radius:8px;padding:1px 6px;font-weight:500}
        .ent-mega{position:absolute;top:calc(100% - 4px);left:50%;transform:translateX(-50%);width:calc(100% - 48px);max-width:1440px;background:#fff;border:1px solid #edf0f5;border-top:none;border-radius:0 0 8px 8px;box-shadow:0 14px 34px rgba(0,0,0,.14);z-index:400;padding:16px 0}
        .ent-mega-inner{max-width:none;margin:0 auto;padding:0 16px;display:flex;flex-wrap:wrap;gap:10px 30px}
        .ent-mega-col{min-width:132px;flex:0 1 auto}
        .ent-mega-h{display:flex;align-items:center;gap:5px;font-size:13px;font-weight:600;color:#2b6de5;margin:0 0 8px;cursor:pointer}
        .ent-mega-h:hover{text-decoration:underline}
        .ent-mega-item{display:block;width:100%;text-align:left;border:none;background:transparent;padding:6px 8px;border-radius:6px;font-size:13px;color:#4a5160;cursor:pointer;white-space:nowrap}
        .ent-mega-item:hover{background:#f3f7ff;color:#2b6de5}
        .ent-mega-item.active{color:#2b6de5;font-weight:600;background:#f3f7ff}
        .ent-mega-item.disabled{color:#c0c4cc;cursor:not-allowed}
        .ent-mega-item.disabled:hover{background:transparent;color:#c0c4cc}
        .ent-mega-item .cnt{font-size:11px;color:#9aa3b2;margin-left:4px}
        .ent-loading{padding:40px 24px;color:#9aa3b2;font-size:14px}
        /* 内容分区 tab 条 */
        .sec-tabbar-wrap{position:sticky;top:204px;z-index:280;background:#f8fafc;padding:8px 0 10px}
        .sec-tabbar{display:flex;flex-wrap:wrap;gap:6px;max-width:1440px;margin:0 auto;padding:0 24px}
        .sec-tab-btn{display:inline-flex;align-items:center;gap:4px;height:30px;padding:0 12px;border-radius:6px;border:1px solid #e6eaf2;background:#fff;font-size:13px;color:#4a5160;cursor:pointer;white-space:nowrap;transition:all .15s}
        .sec-tab-btn:hover{border-color:#1a53ff;color:#1a53ff}
        .sec-tab-btn.active{background:#1a53ff;border-color:#1a53ff;color:#fff;font-weight:500}
        .sec-tab-btn.empty{color:#c0c4cc;border-style:dashed}
        .sec-tab-btn.empty .cnt{color:#c0c4cc}
        .sec-tab-btn .cnt{font-size:11px;opacity:.7}
      `}</style>
      {/* 概要：随页滚走，宽度与内容/表格对齐 */}
      <div className="dm-archive-frame">
        <div ref={summaryRef} style={{ width: '100%' }} />
      </div>
      {/* 原生 Tab 工具条：吸顶在 PageHeader 下方，卡片式居中（与上下卡片同宽） */}
      <div className="ent-tabbar-wrap" onMouseLeave={() => setHover(false)}>
        <div className="ent-tabbar">
          <div className="ent-tabbar-inner" onMouseEnter={() => setHover(true)}>
            {PERSON_TABS.map((t, i) => (
              <div key={t.hash} className="ent-tab-item">
                <button
                  className={`ent-tab-btn ${i === resolved.tabIdx ? 'active' : ''}`}
                  onClick={() => go(t.hash)}
                >
                  {t.label}
                  {t.count && <span className="ent-tab-count">{t.count}</span>}
                </button>
              </div>
            ))}
          </div>
        </div>
        {hover && (
          <div className="ent-mega">
            <div className="ent-mega-inner">
              {PERSON_TABS.map((t, i) => {
                const navTab = navTabs[i];
                const secs = navTab?.sections || [];
                return (
                  <div key={t.hash} className="ent-mega-col">
                    <div className="ent-mega-h" onClick={() => go(t.hash)}>
                      {t.label}
                      {t.count && <span className="ent-tab-count">{t.count}</span>}
                    </div>
                    {secs.length > 0 ? secs.map((s, si) => (
                      <button
                        key={s.title + si}
                        className={`ent-mega-item ${i === resolved.tabIdx && sections[si]?.id === activeSection ? 'active' : ''} ${s.disabled ? 'disabled' : ''}`}
                        onClick={() => {
                          if (i !== resolved.tabIdx) { go(t.hash); return; }
                          scrollToSection(`sec-${si}`);
                        }}
                      >
                        {s.title}
                        {s.count && s.count !== '0' && <span className="cnt">{s.count}</span>}
                      </button>
                    )) : (
                      <button className="ent-mega-item" onClick={() => go(t.hash)}>
                        {t.label}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {/* 内容分区 tab：有多个分区时显示，吸顶在主 tabbar 下 */}
      {sections.length > 1 && (
        <div className="sec-tabbar-wrap">
          <div className="sec-tabbar">
            {sections.map((s) => (
              <button
                key={s.id}
                className={`sec-tab-btn ${s.id === activeSection ? 'active' : ''} ${!s.hasContent ? 'empty' : ''}`}
                onClick={() => scrollToSection(s.id)}
              >
                {s.title}
                {s.count && s.count !== '0' && <span className="cnt">{s.count}</span>}
              </button>            ))}
          </div>
        </div>
      )}
      {/* 内容区 */}
      <div className="dm-archive-frame" style={{ paddingTop: 0, paddingBottom: 24 }}>
        <div ref={contentRef} style={{ width: '100%', minHeight: 400 }}>
          {!page && <div className="ent-loading">加载中…</div>}
        </div>
      </div>
    </>
  );
}
