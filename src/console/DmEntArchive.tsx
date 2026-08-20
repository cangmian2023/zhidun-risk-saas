import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from './PageShell';
import { loadQixinPage } from './qixinRuntime';
import { extractHeader, extractContent, ARCHIVE_PATCH, FALLBACK_HIDE } from './qixinInject';
import EntChainGraph from './EntChainGraph';

/* 企业档案 · 1:1 原样复刻（record/qixin 快照，运行时直接加载，无需预生成）
 * 结构：
 *   概要（ent-basic 提取，所有 tab 共用）—— 正常流，随页滚走
 *   主 Tab 工具条（原生 React，吸顶；悬停展开统一大白色 mega 面板，列出所有 tab 的下拉项）
 *   内容区（随 tab 切换）
 */

type Sub = { label: string; hash: string };
type Tab = { label: string; hash: string; count?: string; sub?: Sub[] };

// 企业档案主 Tab；历史信息置于最后一位，财产信息/集团信息在新闻舆情之后
const ENT_TABS: Tab[] = [
  {
    label: '基本信息', hash: 'basic', count: '243',
    sub: [
      { label: '工商信息', hash: 'basic' }, { label: '股东信息', hash: 'basic' },
      { label: '主要人员', hash: 'basic' }, { label: '对外投资', hash: 'basic' },
      { label: '变更记录', hash: 'basic' }, { label: '实际控制权', hash: 'basic' },
      { label: '疑似关系', hash: 'basic' }, { label: '同业分析', hash: 'basic' },
    ],
  },
  {
    label: '企业图谱', hash: 'graph',
    sub: [
      { label: '企业链图', hash: 'graph-rel' },
      { label: '股权穿透', hash: 'graph-penetrate' },
      { label: '股权结构', hash: 'graph-stock' },
      { label: '控制人关系', hash: 'graph-controller' },
      { label: '受益所有人', hash: 'graph-beneficiary' },
      { label: '企业关系', hash: 'graph-relation' },
      { label: '关联方认定', hash: 'graph-related' },
      { label: '十大受益人', hash: 'graph-bene10' },
    ],
  },
  {
    label: '司法风险', hash: 'lawsuit', count: '999+',
    sub: [
      { label: '裁判文书', hash: 'lawsuit' }, { label: '立案信息', hash: 'lawsuit' },
      { label: '开庭公告', hash: 'lawsuit' }, { label: '法院公告', hash: 'lawsuit' },
      { label: '失信被执行人', hash: 'lawsuit' }, { label: '被执行人', hash: 'lawsuit' },
      { label: '司法协助', hash: 'lawsuit' }, { label: '行政处罚', hash: 'lawsuit' },
    ],
  },
  {
    label: '知识产权', hash: 'ip', count: '999+',
    sub: [
      { label: '商标', hash: 'ip' }, { label: '专利', hash: 'ip' },
      { label: '著作权', hash: 'ip' }, { label: '网站备案', hash: 'ip' },
    ],
  },
  {
    label: '经营信息', hash: 'operate', count: '999+',
    sub: [
      { label: '招投标', hash: 'operate' }, { label: '债券', hash: 'operate' },
      { label: '招聘', hash: 'operate' }, { label: '税务评级', hash: 'operate' },
      { label: '购地信息', hash: 'operate' }, { label: '进出口', hash: 'operate' },
      { label: '行政许可', hash: 'operate' }, { label: '抽查检查', hash: 'operate' },
    ],
  },
  {
    label: '经营风险', hash: 'operate-risk', count: '7',
    sub: [
      { label: '经营异常', hash: 'operate-risk' }, { label: '行政处罚', hash: 'operate-risk' },
      { label: '严重违法', hash: 'operate-risk' }, { label: '股权出质', hash: 'operate-risk' },
      { label: '动产抵押', hash: 'operate-risk' }, { label: '欠税', hash: 'operate-risk' },
      { label: '司法拍卖', hash: 'operate-risk' }, { label: '清算信息', hash: 'operate-risk' },
    ],
  },
  {
    label: '新闻舆情', hash: 'news', count: '999+',
    sub: [
      { label: '新闻', hash: 'news' }, { label: '微博', hash: 'news' },
      { label: '公告', hash: 'news' },
    ],
  },
  {
    label: '财产信息', hash: 'property',
    sub: [{ label: '财产线索', hash: 'property' }],
  },
  {
    label: '集团信息', hash: 'group',
    sub: [
      { label: '集团信息', hash: 'group-info' },
      { label: '查看图谱', hash: 'group-graph' },
    ],
  },
  {
    label: '历史信息', hash: 'history', count: '999+',
    sub: [
      { label: '历史工商', hash: 'history' }, { label: '历史股东', hash: 'history' },
      { label: '历史主要人员', hash: 'history' }, { label: '历史对外投资', hash: 'history' },
      { label: '历史变更', hash: 'history' },
    ],
  },
];

// 每个 hash → 源文件（无后缀=HTML 内容，.html=CSS 来源）
const ENT_FILES: Record<string, { src: string; html: string }> = {
  'basic': { src: '企业档案 - 基本信息', html: '企业档案 - 基本信息.html' },
  'graph-rel': { src: '企业档案 - 企业图谱', html: '企业档案 - 企业图谱.html' },
  'graph-penetrate': { src: '企业档案 - 企业图谱- 股权穿透', html: '企业档案 - 企业图谱- 股权穿透.html' },
  'graph-stock': { src: '企业档案 - 企业图谱 - 股权结构', html: '企业档案 - 企业图谱 - 股权结构.html' },
  'graph-controller': { src: '企业档案 - 企业图谱 - 控制人关系', html: '企业档案 - 企业图谱 - 控制人关系.html' },
  'graph-beneficiary': { src: '企业档案 - 企业图谱 - 受益所有人', html: '企业档案 - 企业图谱 - 受益所有人.html' },
  'graph-relation': { src: '企业档案 - 企业图谱 - 企业关系', html: '企业档案 - 企业图谱 - 企业关系.html' },
  'graph-related': { src: '企业档案 - 企业图谱 - 关联方认定', html: '企业档案 - 企业图谱 - 关联方认定.html' },
  'graph-bene10': { src: '企业档案 - 企业图谱 -十大受益人', html: '企业档案 - 企业图谱 - 企业关系.html' },
  'history': { src: '企业档案 - 历史信息（桌面）', html: '企业档案 - 历史信息.html' },
  'lawsuit': { src: '企业档案 - 司法风险', html: '企业档案 - 司法风险.html' },
  'ip': { src: '企业档案 - 知识产权.html', html: '企业档案 - 知识产权.html' },
  'operate': { src: '企业档案 - 经营信息', html: '企业档案 - 经营信息.html' },
  'operate-risk': { src: '企业档案 - 经营风险', html: '企业档案 - 经营风险.html' },
  'news': { src: '企业档案 - 新闻舆情', html: '企业档案 - 新闻舆情.html' },
  'property': { src: '企业档案 - 财产信息 也是 风控子系统的 财产线索', html: '企业档案 - 财产信息 也是 风控子系统的 财产线索.html' },
  'group-info': { src: '企业档案 - 集团信息', html: '企业档案 - 集团信息.html' },
  'group-graph': { src: '企业档案 - 集团信息 - 查看图谱', html: '企业档案 - 集团信息 - 查看图谱.html' },
};

type Resolved = { tabIdx: number; subHash: string; pageKey: string };

function resolve(hash: string): Resolved {
  for (let i = 0; i < ENT_TABS.length; i++) {
    const t = ENT_TABS[i];
    if (t.sub) {
      const s = t.sub.find((x) => x.hash === hash);
      if (s) return { tabIdx: i, subHash: hash, pageKey: s.hash };
    } else if (t.hash === hash) {
      return { tabIdx: i, subHash: hash, pageKey: hash };
    }
  }
  // 父级 hash（graph/group）或未知 → 取第一个子项 / 默认 basic
  const t = ENT_TABS.find((x) => x.hash === hash);
  if (t && t.sub) {
    const s = t.sub[0];
    return { tabIdx: ENT_TABS.indexOf(t), subHash: s.hash, pageKey: s.hash };
  }
  return { tabIdx: 0, subHash: 'basic', pageKey: 'basic' };
}

// ent-basic 概要（缓存，所有 tab 共用）
let basicPromise: Promise<{ html: string; css: string }> | null = null;
function loadBasic() {
  if (!basicPromise) basicPromise = loadQixinPage('企业档案 - 基本信息', '企业档案 - 基本信息.html');
  return basicPromise;
}

export default function DmEntArchive() {
  const nav = useNavigate();
  const [hash, setHash] = useState('basic');
  const [hover, setHover] = useState(false);
  const [resolved, setResolved] = useState<Resolved>(resolve('basic'));
  const [basic, setBasic] = useState<{ html: string; css: string } | null>(null);
  const [page, setPage] = useState<{ html: string; css: string } | null>(null);
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

  useEffect(() => { setResolved(resolve(hash)); }, [hash]);

  // 加载概要（ent-basic）
  useEffect(() => {
    let alive = true;
    loadBasic().then((b) => { if (alive) setBasic(b); });
    return () => { alive = false; };
  }, []);

  // 加载当前页（graph-rel 走自定义企业链图组件，无需加载快照）
  useEffect(() => {
    let alive = true;
    if (resolved.pageKey === 'graph-rel') return () => { alive = false; };
    const f = ENT_FILES[resolved.pageKey];
    setPage(null);
    if (f) loadQixinPage(f.src, f.html).then((m) => { if (alive) setPage(m); });
    return () => { alive = false; };
  }, [resolved.pageKey]);

  // 概要：ent-basic ent-header（随页滚走，不吸顶）
  useEffect(() => {
    const el = summaryRef.current;
    if (!el || !basic) return;
    const root = el.shadowRoot || el.attachShadow({ mode: 'open' });
    root.innerHTML = '';
    const style = document.createElement('style');
    style.textContent = (basic.css || '') + '\n' + ARCHIVE_PATCH;
    const body = document.createElement('div');
    body.innerHTML = extractHeader(basic.html);
    root.append(style, body);
  }, [basic]);

  // 内容：干净切分（去概要 + 主 Tab 工具条）；兜底时隐藏页面自带概要/Tab
  useEffect(() => {
    const el = contentRef.current;
    if (!el || !page || !basic) return;
    const root = el.shadowRoot || el.attachShadow({ mode: 'open' });
    root.innerHTML = '';
    const contentHtml = extractContent(page.html);
    const isFallback = contentHtml === page.html;
    const style = document.createElement('style');
    style.textContent =
      (basic.css || '') + '\n' + (page.css || '') + '\n' + ARCHIVE_PATCH + (isFallback ? '\n' + FALLBACK_HIDE : '');
    const body = document.createElement('div');
    body.innerHTML = contentHtml;
    root.append(style, body);
  }, [page, basic]);

  // 集团信息：点击集团名 → 集团详情页
  useEffect(() => {
    if (resolved.pageKey !== 'group-info') return;
    const el = contentRef.current;
    if (!el) return;
    const root = el.shadowRoot;
    if (!root) return;
    const names = Array.from(root.querySelectorAll('.enterprise-name')) as HTMLElement[];
    names.forEach((n) => {
      const name = (n.textContent || '').trim();
      if (!name) return;
      n.style.cursor = 'pointer';
      n.style.color = '#2b6de5';
      n.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        nav(`/console/dm/group-account-detail?name=${encodeURIComponent(name)}&back=/console/dm/ent-archive`);
      };
    });
  }, [page, resolved.pageKey, nav]);

  // 图谱主题条（#navigator .menu-container）：文本→hash 映射，点击切换主题 + 高亮当前
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const root = el.shadowRoot;
    if (!root) return;
    const items = Array.from(root.querySelectorAll('#navigator .menu-item')) as HTMLElement[];
    if (!items.length) return;
    const THEME_MAP: Record<string, string> = {
      '企业链图': 'graph-rel',
      '股权穿透': 'graph-penetrate',
      '股权结构': 'graph-stock',
      '控制人关系': 'graph-controller',
      '受益所有人': 'graph-beneficiary',
      '企业关系': 'graph-relation',
      '关联方认定': 'graph-related',
      '十大受益人': 'graph-bene10',
    };
    items.forEach((it) => {
      const label = (it.textContent || '').trim();
      const h = THEME_MAP[label];
      it.classList.toggle('active', !!h && h === resolved.pageKey);
      if (h) it.onclick = () => { window.location.hash = h; };
    });
  }, [page, basic, resolved.pageKey]);

  const go = (h: string) => { window.location.hash = h; };

  return (
    <>
      <PageShell title="企业档案" subtitle="企业尽调档案 · qixin 快照 1:1 原样复刻（record/qixin）" legend={false} />
      <style>{`
        /* 统一宽度容器：与 PageHeader 左右边距一致 */
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
        .ent-loading{padding:40px 24px;color:#9aa3b2;font-size:14px}
      `}</style>
      {/* 概要：随页滚走，宽度与内容/表格对齐 */}
      <div className="dm-archive-frame">
        <div ref={summaryRef} style={{ width: '100%' }} />
      </div>
      {/* 原生 Tab 工具条：吸顶在 PageHeader 下方，卡片式居中（与上下卡片同宽） */}
      <div className="ent-tabbar-wrap" onMouseLeave={() => setHover(false)}>
        <div className="ent-tabbar">
          <div className="ent-tabbar-inner" onMouseEnter={() => setHover(true)}>
            {ENT_TABS.map((t, i) => (
              <div key={t.hash} className="ent-tab-item">
                <button
                  className={`ent-tab-btn ${i === resolved.tabIdx ? 'active' : ''}`}
                  onClick={() => go(t.sub ? t.sub[0].hash : t.hash)}
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
              {ENT_TABS.map((t, i) => (
                <div key={t.hash} className="ent-mega-col">
                  <div
                    className="ent-mega-h"
                    onClick={() => go(t.sub ? t.sub[0].hash : t.hash)}
                  >
                    {t.label}
                    {t.count && <span className="ent-tab-count">{t.count}</span>}
                  </div>
                  {(t.sub || [{ label: t.label, hash: t.hash }]).map((s) => (
                    <button
                      key={s.hash + s.label}
                      className={`ent-mega-item ${s.hash === resolved.subHash ? 'active' : ''}`}
                      onClick={() => go(s.hash)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* 内容区：宽度与概要/tabbar 对齐 */}
      <div className="dm-archive-frame" style={{ paddingTop: 16, paddingBottom: 24 }}>
        {resolved.pageKey === 'graph-rel' ? (
          <EntChainGraph />
        ) : (
          <div ref={contentRef} style={{ width: '100%', minHeight: 400 }}>
            {!page && <div className="ent-loading">加载中…</div>}
          </div>
        )}
      </div>
    </>
  );
}
