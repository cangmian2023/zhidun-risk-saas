import React, { useEffect, useState } from 'react';
import { PageShell } from './PageShell';
import { loadQixinPage } from './qixinRuntime';
import { parsePersonSummary, parsePersonSections } from './qixinPersonAdapter';
import { Panel, Badge, DataTable, type Column, type Row } from '../components/ui';

/* 个人档案 · 1:1 原样复刻（record/qixin 快照，运行时直接加载，无需预生成）
 * 结构（与企业档案保持一致）：
 *   概要（基本信息源 #peolpe-basic-info 提取，所有 tab 共用）—— 正常流，随页滚走
 *   主 Tab 工具条（原生 React，吸顶；悬停展开统一大白色 mega 面板，列出所有 tab 的下拉项）
 *   内容区（随 tab 切换）
 */

type Sub = { label: string; hash: string };
type Tab = { label: string; hash: string; count?: string; sub?: Sub[] };

// 个人档案主 Tab（顺序与源站导航一致）
const PERSON_TABS: Tab[] = [
  {
    label: '基本信息', hash: 'basic', count: '999+',
    sub: [
      { label: '合作伙伴', hash: 'basic' },
      { label: '担任法定代表人的企业', hash: 'basic' },
      { label: '担任股东的企业', hash: 'basic' },
      { label: '担任高管的企业', hash: 'basic' },
      { label: '持股企业', hash: 'basic' },
    ],
  },
  {
    label: '风险信息', hash: 'risk', count: '9',
    sub: [
      { label: '失信被执行人', hash: 'risk' },
      { label: '被执行人', hash: 'risk' },
      { label: '限制高消费', hash: 'risk' },
      { label: '股权冻结', hash: 'risk' },
      { label: '股权出质', hash: 'risk' },
    ],
  },
  {
    label: '专利信息', hash: 'patent', count: '14',
    sub: [
      { label: '专利信息概览', hash: 'patent' },
      { label: '专利信息', hash: 'patent' },
    ],
  },
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

type Resolved = { tabIdx: number; subHash: string; pageKey: string };

function resolve(hash: string): Resolved {
  for (let i = 0; i < PERSON_TABS.length; i++) {
    const t = PERSON_TABS[i];
    if (t.sub) {
      const s = t.sub.find((x) => x.hash === hash);
      if (s) return { tabIdx: i, subHash: hash, pageKey: s.hash };
    } else if (t.hash === hash) {
      return { tabIdx: i, subHash: hash, pageKey: hash };
    }
  }
  const t = PERSON_TABS.find((x) => x.hash === hash);
  if (t && t.sub) {
    const s = t.sub[0];
    return { tabIdx: PERSON_TABS.indexOf(t), subHash: s.hash, pageKey: s.hash };
  }
  return { tabIdx: 0, subHash: 'basic', pageKey: 'basic' };
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
  const [summary, setSummary] = useState<ReturnType<typeof parsePersonSummary>>(null);
  const [sections, setSections] = useState<ReturnType<typeof parsePersonSections>>([]);

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

  // 加载概要（基本信息源）
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
    if (f) loadQixinPage(f.src, f.html).then((m) => { if (alive) setPage(m); });
    return () => { alive = false; };
  }, [resolved.pageKey]);

  // 概要：从基本信息源解析成结构化模型，用我们自己的组件渲染
  useEffect(() => {
    if (!basic) return;
    setSummary(parsePersonSummary(basic.html));
  }, [basic]);

  // 内容：从当前页解析成区块模型，用我们自己的组件渲染
  useEffect(() => {
    if (!page) return;
    setSections(parsePersonSections(page.html));
  }, [page]);

  const go = (h: string) => { window.location.hash = h; };

  return (
    <>
      <PageShell title="个人档案" subtitle="人员尽调档案 · 启信慧眼快照 1:1 原样复刻（record/qixin）" legend={false} />
      <style>{`
        .ent-tabbar-wrap{position:sticky;top:0;z-index:300;background:#fff;border-bottom:1px solid #edf0f5;box-shadow:0 2px 10px rgba(0,0,0,.05)}
        .ent-tabbar{display:flex;align-items:stretch;gap:2px;max-width:1440px;margin:0 auto;padding:0 24px;height:52px}
        .ent-tab-item{display:flex;align-items:center}
        .ent-tab-btn{display:inline-flex;align-items:center;gap:5px;height:52px;padding:0 14px;border:none;background:transparent;font-size:15px;color:#4a5160;cursor:pointer;position:relative;transition:color .15s}
        .ent-tab-btn:hover{color:#2b6de5}
        .ent-tab-btn.active{color:#2b6de5;font-weight:600}
        .ent-tab-btn.active::after{content:'';position:absolute;left:14px;right:14px;bottom:0;height:3px;border-radius:2px;background:#2b6de5}
        .ent-tab-count{font-size:11px;color:#ff5a5f;background:#fff0f0;border-radius:8px;padding:1px 6px;font-weight:500}
        .ent-mega{position:absolute;top:100%;left:0;width:100%;background:#fff;border-top:1px solid #edf0f5;box-shadow:0 14px 34px rgba(0,0,0,.14);z-index:400;padding:18px 24px}
        .ent-mega-inner{max-width:1440px;margin:0 auto;display:flex;flex-wrap:wrap;gap:10px 30px}
        .ent-mega-col{min-width:132px;flex:0 1 auto}
        .ent-mega-h{display:flex;align-items:center;gap:5px;font-size:13px;font-weight:600;color:#2b6de5;margin:0 0 8px;cursor:pointer}
        .ent-mega-h:hover{text-decoration:underline}
        .ent-mega-item{display:block;width:100%;text-align:left;border:none;background:transparent;padding:6px 8px;border-radius:6px;font-size:13px;color:#4a5160;cursor:pointer;white-space:nowrap}
        .ent-mega-item:hover{background:#f3f7ff;color:#2b6de5}
        .ent-mega-item.active{color:#2b6de5;font-weight:600;background:#f3f7ff}
        .ent-loading{padding:40px 24px;color:#9aa3b2;font-size:14px}
      `}</style>
      {/* 概要：随页滚走，使用我们自己的卡片组件 */}
      <div style={{ padding: '16px 24px 0', maxWidth: 1440, margin: '0 auto', width: '100%' }}>
        {summary && <PersonSummaryCard s={summary} />}
      </div>
      {/* 原生 Tab 工具条：吸顶；悬停展开统一大白色 mega 面板 */}
      <div className="ent-tabbar-wrap" onMouseLeave={() => setHover(false)}>
        <div className="ent-tabbar" onMouseEnter={() => setHover(true)}>
          {PERSON_TABS.map((t, i) => (
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
        {hover && (
          <div className="ent-mega">
            <div className="ent-mega-inner">
              {PERSON_TABS.map((t, i) => (
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
      {/* 内容区：统一用 Panel + DataTable 渲染（我们自己的框架） */}
      <div style={{ padding: '16px 24px 24px', maxWidth: 1440, margin: '0 auto' }}>
        {!page && <div className="ent-loading">加载中…</div>}
        {page && resolved.pageKey === 'graph' && <PersonGraphCard summary={summary} />}
        {page && resolved.pageKey !== 'graph' && (
          <div className="flex flex-col gap-4">
            {sections.length === 0 && <div className="ent-loading">该栏目暂无结构化内容</div>}
            {sections.map((sec, i) => (
              <PersonSectionPanel key={i} sec={sec} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ---------- 用我们自己的组件框架渲染（替代 Shadow DOM 注入） ---------- */

function PersonSummaryCard({ s }: { s: NonNullable<ReturnType<typeof parsePersonSummary>> }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-start gap-5">
        {s.avatarUrl && (
          <img
            src={s.avatarUrl}
            alt={s.name}
            className="h-20 w-20 shrink-0 rounded-xl border border-slate-100 object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold text-ink-900">{s.name || '—'}</h2>
          {s.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {s.tags.map((t, i) => (
                <Badge key={i} kind={t.kind === 'risk' ? 'red' : t.kind === 'top' ? 'blue' : 'gray'}>
                  {t.text}
                </Badge>
              ))}
            </div>
          )}
          {s.intro && (
            <p className="mt-3 max-w-4xl text-sm leading-relaxed text-slate-500">{s.intro}</p>
          )}
          {s.risk && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge kind="red">{s.risk.label}</Badge>
              {s.risk.groups.map((g, i) => (
                <React.Fragment key={i}>
                  <span className="text-xs text-slate-400">{g.name}</span>
                  <Badge kind="gray">{g.total}</Badge>
                  {g.items.map((it, j) => (
                    <Badge key={j} kind={it.count === '0' ? 'green' : 'orange'}>
                      {it.name} {it.count}
                    </Badge>
                  ))}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PersonTable({ t }: { t: { headers: string[]; rows: string[][] } }) {
  const columns: Column[] = t.headers.map((h, i) => ({
    key: 'c' + i,
    label: h || `列${i + 1}`,
    align: i === 0 ? 'left' : 'center',
  }));
  const rows: Row[] = t.rows.map((r, ri) => {
    const row: Row = { id: String(ri) };
    t.headers.forEach((_h, ci) => {
      row['c' + ci] = r[ci] ?? '';
    });
    return row;
  });
  return <DataTable columns={columns} rows={rows} />;
}

function PersonSectionPanel({ sec }: { sec: NonNullable<ReturnType<typeof parsePersonSections>>[number] }) {
  return (
    <Panel title={sec.title}>
      {sec.chips.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {sec.chips.map((c, i) => (
            <Badge key={i} kind="blue">
              {c.label}
              {c.count ? ` ${c.count}` : ''}
            </Badge>
          ))}
        </div>
      )}
      {sec.tables.map((t, i) => (
        <div key={i} className={i > 0 ? 'mt-4' : ''}>
          <PersonTable t={t} />
        </div>
      ))}
      {!sec.tables.length && !sec.chips.length && sec.text && (
        <p className="text-sm leading-relaxed text-slate-500">{sec.text}</p>
      )}
    </Panel>
  );
}

function PersonGraphCard({
  summary,
}: {
  summary: NonNullable<ReturnType<typeof parsePersonSummary>> | null;
}) {
  const cats = ['合作伙伴', '担任法定代表人的企业', '担任股东的企业', '担任高管的企业', '持股企业'];
  return (
    <Panel
      title="个人关系图谱"
      desc="基于人员尽调关系维度的结构化呈现（交互式关系图需接入实时数据接口）"
    >
      <div className="flex flex-col items-center gap-6 py-8">
        <div className="grid h-24 w-24 place-items-center rounded-full bg-brand-50 text-lg font-bold text-brand-700 ring-2 ring-brand-200">
          {summary?.name || '本人'}
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {cats.map((c) => (
            <div
              key={c}
              className="w-36 rounded-xl border border-slate-100 bg-white px-4 py-3 text-center shadow-card"
            >
              <div className="text-sm font-medium text-ink-900">{c}</div>
              <div className="mt-1 text-xs text-slate-400">关系维度</div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
