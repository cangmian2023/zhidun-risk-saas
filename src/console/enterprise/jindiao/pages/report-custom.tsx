// 尽调中心 · 报告中心 · 自定义报告（jd-report-custom）· 左配置面板 + 右实时预览
// 数据：本地样例 jdReportCustom.json（橘 Sam）
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { EpPage, EpBtn, useSample } from '../../epCommon';
import { usePageNav } from '../../../pageNav';

type SubOpt = { key: string; label: string }
type TreeGroup = {
  key: string
  label: string
  open: boolean
  checked: boolean
  children: { key: string; label: string }[]
}
type Data = {
  source: string
  pageTitle: string
  crumb: string
  topActions: { label: string }
  panel: { title: string; chooseTemplate: string }
  cover: {
    nameLabel: string
    nameValue: string
    belongLabel: string
    belongPlaceholder: string
    subtitleLabel: string
    subtitleOptions: SubOpt[]
    logoLabel: string
    logoBtn: string
    logoFile: string
    descLabel: string
    descOptions: SubOpt[]
    qrLabel: string
    qrOptions: SubOpt[]
    bgLabel: string
    bgColors: string[]
  }
  dataTree: { title: string; total: number; groups: TreeGroup[] }
  panelActions: { clear: string; preview: string; done: string }
  preview: {
    logoText: string
    title: string
    subtitle: string[]
    noteLines: string[]
    nav: string[]
    toc: string[]
  }
}

const seed: Data = {
  source: 'jdReportCustom',
  pageTitle: '自定义报告',
  crumb: '报告中心 / 自定义报告',
  topActions: { label: '报告' },
  panel: { title: '自定义报告', chooseTemplate: '选择报告模板' },
  cover: {
    nameLabel: '报告名称',
    nameValue: '企业信用报告',
    belongLabel: '报告归属',
    belongPlaceholder: '请输入报告归属',
    subtitleLabel: '副标题',
    subtitleOptions: [
      { key: 'company', label: '企业名称' },
      { key: 'legal', label: '法人' },
    ],
    logoLabel: '上传logo',
    logoBtn: '上传Logo',
    logoFile: '企业征信logo.png',
    descLabel: '说明信息',
    descOptions: [
      { key: 'default', label: '默认说明' },
      { key: 'custom', label: '自定义' },
    ],
    qrLabel: '二维码',
    qrOptions: [
      { key: 'default', label: '默认二维码' },
      { key: 'custom', label: '自定义' },
    ],
    bgLabel: '封面背景',
    bgColors: ['#1677ff', '#003e8f', '#1f2329', '#006b55', '#722ed1', '#13c2c2'],
  },
  dataTree: {
    title: '选择数据',
    total: 175,
    groups: [
      {
        key: 'qixin',
        label: '企业健康度',
        open: true,
        checked: false,
        children: [
          { key: 'score', label: '企业健康度' },
          { key: 'shell', label: '空壳指数' },
          { key: 'contract', label: '合同违约指数' },
          { key: 'judicial', label: '司法风险' },
        ],
      },
      {
        key: 'basic',
        label: '基本信息',
        open: true,
        checked: false,
        children: [
          { key: 'ic', label: '工商信息' },
          { key: 'tag', label: '企业标签' },
        ],
      },
    ],
  },
  panelActions: { clear: '清空数据', preview: '预览', done: '完成' },
  preview: {
    logoText: '企业征信',
    title: '企业信用报告',
    subtitle: ['上海xxxxxxx科技股份有限公司', '法定代表人：xxxxx'],
    noteLines: [
      '本报告生成时间为20xx年xx月xx日 xx:xx:xx',
      '您所看到的报告内容为截至该时间点该公司的企业征信数据快照。',
      '电话咨询：xxxxxxxxx 官网地址：b.qixin.com',
      '本报告仅为您的决策提供参考，我们不对该查询结果的全面、准确、真实性负责',
    ],
    nav: ['封面', '目录'],
    toc: ['一、企业基本信息', '二、企业健康度', '三、司法风险', '四、经营信息', '五、知识产权'],
  },
}

const LABEL: CSSProperties = { fontSize: 13, color: '#333', marginBottom: 6 }
const INPUT: CSSProperties = {
  width: '100%',
  padding: '7px 10px',
  borderRadius: 6,
  border: '1px solid #D9D9D9',
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box',
}
const OUTLINE_BTN: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  padding: '5px 12px',
  borderRadius: 6,
  border: '1px solid #D9D9D9',
  background: '#fff',
  color: '#333',
  fontSize: 12.5,
  cursor: 'pointer',
}

function QrCode() {
  // 伪二维码：随机黑白方块 + 中心 logo
  const cells: boolean[] = []
  let n = 1
  for (let i = 0; i < 121; i++) {
    n = (n * 1103515245 + 12345) & 0x7fffffff
    cells.push((n % 100) < 46)
  }
  return (
    <svg width="92" height="92" viewBox="0 0 11 11" style={{ display: 'block' }}>
      <rect width="11" height="11" fill="#fff" />
      {cells.map((c, i) => {
        const x = i % 11
        const y = Math.floor(i / 11)
        return c ? <rect key={i} x={x} y={y} width="1" height="1" fill="#1F2329" /> : null
      })}
      <rect x="0.5" y="0.5" width="3.2" height="3.2" fill="none" stroke="#1F2329" strokeWidth="0.9" />
      <rect x="7.3" y="0.5" width="3.2" height="3.2" fill="none" stroke="#1F2329" strokeWidth="0.9" />
      <rect x="0.5" y="7.3" width="3.2" height="3.2" fill="none" stroke="#1F2329" strokeWidth="0.9" />
      <rect x="4.4" y="4.4" width="2.2" height="2.2" rx="0.4" fill="#1677ff" />
    </svg>
  )
}

function CoverWaves() {
  return (
    <svg viewBox="0 0 500 120" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: 120, display: 'block' }}>
      <path
        d="M0,70 C60,40 110,95 170,70 C230,45 280,90 340,65 C400,40 450,80 500,58 L500,120 L0,120 Z"
        fill="#e6f0ff"
      />
      <path
        d="M0,100 C70,75 130,115 200,95 C270,75 330,115 400,92 C440,78 470,95 500,85 L500,120 L0,120 Z"
        fill="#1677ff"
      />
    </svg>
  )
}

export default function JdReportCustom({ params }: { params: URLSearchParams }) {
  const [data] = useSample<Data>('jdReportCustom.json', seed)
  const { back } = usePageNav()
  const [coverOpen, setCoverOpen] = useState(true)
  const [dataOpen, setDataOpen] = useState(true)
  const [bgSel, setBgSel] = useState(data.cover.bgColors[0])
  const [descSel, setDescSel] = useState('default')
  const [qrSel, setQrSel] = useState('default')
  const [subSel, setSubSel] = useState<Set<string>>(() => new Set(data.cover.subtitleOptions.map((o) => o.key)))
  const [treeOpen, setTreeOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(data.dataTree.groups.map((g) => [g.key, g.open]))
  )
  const [treeSel, setTreeSel] = useState<Set<string>>(new Set())
  const [previewNav, setPreviewNav] = useState(data.preview.nav[0])
  const [name, setName] = useState(data.cover.nameValue)
  const [belong, setBelong] = useState('')
  const [logoFile, setLogoFile] = useState(data.cover.logoFile)

  const cv = data.cover
  const pv = data.preview
  const panel = data.panel

  const toggleSub = (key: string) => {
    const next = new Set(subSel)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setSubSel(next)
  }

  const toggleGroup = (key: string) => {
    const next = { ...treeOpen }
    next[key] = !next[key]
    setTreeOpen(next)
  }

  const toggleLeaf = (key: string) => {
    const next = new Set(treeSel)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setTreeSel(next)
  }

  return (
    <EpPage
      title={data.pageTitle}
      crumb={data.crumb}
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <EpBtn ghost onClick={() => back('/console/ep/jd-report')}>返回</EpBtn>
        </div>
      }
    >
      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
        {/* 左侧配置面板 */}
        <div
          style={{
            width: 320,
            flexShrink: 0,
            background: '#fff',
            borderRadius: 10,
            border: '1px solid #E8E8E8',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}
        >
          {/* 面板头部 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #F0F0F0' }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>{panel.title}</span>
            <button style={OUTLINE_BTN}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="8" y1="13" x2="12" y2="13" />
              </svg>
              {panel.chooseTemplate}
            </button>
          </div>

          {/* 封面模块 */}
          <div style={{ borderBottom: '1px solid #F0F0F0' }}>
            <div
              onClick={() => setCoverOpen((v) => !v)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', cursor: 'pointer' }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>封面</span>
              <span style={{ color: '#94A3B8', fontSize: 12 }}>{coverOpen ? '⌃' : '⌄'}</span>
            </div>
            {coverOpen && (
              <div style={{ padding: '4px 16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <div style={LABEL}>{cv.nameLabel}</div>
                  <input value={name} onChange={(e) => setName(e.target.value)} style={INPUT} />
                </div>
                <div>
                  <div style={LABEL}>{cv.belongLabel}</div>
                  <input value={belong} onChange={(e) => setBelong(e.target.value)} placeholder={cv.belongPlaceholder} style={INPUT} />
                </div>
                <div>
                  <div style={LABEL}>{cv.subtitleLabel}</div>
                  <div style={{ display: 'flex', gap: 18 }}>
                    {cv.subtitleOptions.map((o) => (
                      <label key={o.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#333', cursor: 'pointer' }}>
                        <input type="checkbox" checked={subSel.has(o.key)} onChange={() => toggleSub(o.key)} style={{ accentColor: '#1677ff', width: 14, height: 14 }} />
                        {o.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={LABEL}>{cv.logoLabel}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button style={OUTLINE_BTN}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      {cv.logoBtn}
                    </button>
                    {logoFile && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#1677ff', background: '#EFF6FF', borderRadius: 4, padding: '2px 8px' }}>
                        {logoFile}
                        <button
                          onClick={() => setLogoFile('')}
                          style={{ border: 'none', background: 'transparent', color: '#1677ff', cursor: 'pointer', padding: 0, fontSize: 12, lineHeight: 1 }}
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <div style={LABEL}>{cv.descLabel}</div>
                  <div style={{ display: 'flex', gap: 18 }}>
                    {cv.descOptions.map((o) => (
                      <label key={o.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#333', cursor: 'pointer' }}>
                        <input type="radio" name="desc" checked={descSel === o.key} onChange={() => setDescSel(o.key)} style={{ accentColor: '#1677ff' }} />
                        {o.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={LABEL}>{cv.qrLabel}</div>
                  <div style={{ display: 'flex', gap: 18 }}>
                    {cv.qrOptions.map((o) => (
                      <label key={o.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#333', cursor: 'pointer' }}>
                        <input type="radio" name="qr" checked={qrSel === o.key} onChange={() => setQrSel(o.key)} style={{ accentColor: '#1677ff' }} />
                        {o.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={LABEL}>{cv.bgLabel}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {cv.bgColors.map((c) => (
                      <button
                        key={c}
                        title={c}
                        onClick={() => setBgSel(c)}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 6,
                          background: c,
                          border: bgSel === c ? '2px solid #fff' : '1px solid rgba(0,0,0,0.08)',
                          outline: bgSel === c ? '2px solid #1677ff' : 'none',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 选择数据模块 */}
          <div style={{ borderBottom: '1px solid #F0F0F0' }}>
            <div
              onClick={() => setDataOpen((v) => !v)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', cursor: 'pointer' }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>
                {data.dataTree.title}
                <span style={{ color: '#94A3B8', fontWeight: 400, marginLeft: 6 }}>({data.dataTree.total})</span>
              </span>
              <span style={{ color: '#94A3B8', fontSize: 12 }}>{dataOpen ? '⌃' : '⌄'}</span>
            </div>
            {dataOpen && (
              <div style={{ padding: '0 16px 14px', maxHeight: 280, overflowY: 'auto' }}>
                {data.dataTree.groups.map((g) => (
                  <div key={g.key} style={{ marginTop: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#333', cursor: 'pointer' }} onClick={() => toggleGroup(g.key)}>
                      <span style={{ fontSize: 10, color: '#94A3B8', width: 12 }}>{treeOpen[g.key] ? '▾' : '▸'}</span>
                      <input type="checkbox" checked={treeSel.has(g.key)} onChange={() => toggleLeaf(g.key)} style={{ accentColor: '#1677ff', width: 14, height: 14, cursor: 'pointer' }} />
                      {g.label}
                    </div>
                    {treeOpen[g.key] && (
                      <div style={{ marginLeft: 34, marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {g.children.map((c) => (
                          <label key={c.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#555', cursor: 'pointer' }}>
                            <input type="checkbox" checked={treeSel.has(c.key)} onChange={() => toggleLeaf(c.key)} style={{ accentColor: '#1677ff', width: 14, height: 14 }} />
                            {c.label}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div style={{ marginTop: 12, textAlign: 'center', fontSize: 12, color: '#BFBFBF' }}>共 {data.dataTree.total} 项可选数据，下方可滚动查看更多</div>
              </div>
            )}
          </div>

          {/* 底部操作 */}
          <div style={{ display: 'flex', gap: 8, padding: 14, background: '#FAFAFA' }}>
            <button style={OUTLINE_BTN}>{data.panelActions.clear}</button>
            <button style={OUTLINE_BTN}>{data.panelActions.preview}</button>
            <button
              style={{
                flex: 1,
                padding: '7px 0',
                borderRadius: 6,
                border: 'none',
                background: '#2563EB',
                color: '#fff',
                fontSize: 13.5,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {data.panelActions.done}
            </button>
          </div>
        </div>

        {/* 右侧预览区 */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            background: '#f5f7fa',
            borderRadius: 10,
            border: '1px solid #E8E8E8',
            padding: 26,
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {/* A4 纸张 */}
          <div
            style={{
              width: 460,
              maxWidth: '100%',
              background: '#fff',
              boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative',
              minHeight: 560,
              paddingBottom: 130,
              boxSizing: 'border-box',
            }}
          >
            {previewNav === '封面' ? (
              <div style={{ padding: '34px 40px 0' }}>
                {/* 顶部 logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      background: 'linear-gradient(135deg, #1677ff, #3B82F6)',
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    启
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#1F2329' }}>{pv.logoText}</span>
                </div>

                {/* 居中标题 */}
                <div style={{ textAlign: 'center', marginTop: 90 }}>
                  <div style={{ fontSize: 30, fontWeight: 800, color: '#1F2329', letterSpacing: 2 }}>{name || pv.title}</div>
                  <div style={{ marginTop: 22, fontSize: 13, color: '#8C8C8C', lineHeight: 2 }}>
                    {pv.subtitle.map((s) => (
                      <div key={s}>{s}</div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '34px 40px' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1F2329', marginBottom: 18, textAlign: 'center' }}>目录</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 14, color: '#333' }}>
                  {pv.toc.map((t) => (
                    <div key={t} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E5E5E5', paddingBottom: 6 }}>
                      <span>{t}</span>
                      <span style={{ color: '#BFBFBF' }}>1</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 底部波浪 + 说明 + 二维码 */}
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 130 }}>
              <CoverWaves />
              <div style={{ position: 'absolute', left: 18, top: 24, zIndex: 2, color: '#fff', fontSize: 9.5, lineHeight: 1.7, width: 320 }}>
                {pv.noteLines.map((l) => (
                  <div key={l}>{l}</div>
                ))}
              </div>
              <div style={{ position: 'absolute', right: 18, bottom: 10, zIndex: 2, background: '#fff', padding: 4, borderRadius: 4 }}>
                <QrCode />
              </div>
            </div>
          </div>

          {/* 右侧浮动导航 */}
          <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pv.nav.map((n, i) => (
              <button
                key={n}
                onClick={() => setPreviewNav(n)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  width: 52,
                  padding: '8px 0',
                  borderRadius: 8,
                  border: '1px solid #D9D9D9',
                  background: previewNav === n ? '#1677ff' : '#fff',
                  color: previewNav === n ? '#fff' : '#333',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {i === 0 ? (
                    <>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </>
                  ) : (
                    <>
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" />
                      <line x1="3" y1="12" x2="3.01" y2="12" />
                      <line x1="3" y1="18" x2="3.01" y2="18" />
                    </>
                  )}
                </svg>
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    </EpPage>
  )
}
