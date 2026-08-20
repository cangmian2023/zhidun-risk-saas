// 尽调中心 · 人员尽调（jd-person）· 搜索人员 → 结果列表
// 数据：本地样例 jdPerson.json（橘 Sam）
import { useState } from 'react'
import { EpPage, useSample, Sam } from '../../epCommon'

type FilterRow = { title: string; items: string[] }
type PersonRow = {
  id: string
  name: string
  partners: string[]
  legalRep: string[]
  shareholder: string[]
  executive: string[]
}
type Data = {
  source: string
  pageTitle: string
  search: { placeholder: string; initialValue: string; btn: string }
  filter: { selectedTitle: string; clear: string; expand: string; rows: FilterRow[] }
  result: {
    selectAll: string
    found: string
    count: number
    export: string
    rows: PersonRow[]
  }
  loading: { text: string }
  empty: { text: string }
}

const seed: Data = {
  source: 'jdPerson',
  pageTitle: '人员尽调',
  search: { placeholder: '请输入人员姓名', initialValue: '雷军', btn: '查询' },
  filter: {
    selectedTitle: '已选条件',
    clear: '清空',
    expand: '展开',
    rows: [
      {
        title: '省市地区',
        items: ['北京', '天津', '上海', '重庆', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '广西', '海南', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '青海', '宁夏'],
      },
      {
        title: '行业门类',
        items: ['农、林、牧、渔业', '采矿业', '制造业', '电力、热力、燃气及水生产和供应业', '建筑业', '批发和零售业', '交通运输、仓储和邮政业', '住宿和餐饮业', '信息传输、软件和信息技术服务业', '金融业', '房地产业'],
      },
    ],
  },
  result: {
    selectAll: '全选',
    found: '找到 {count} 条相关结果',
    count: 3910,
    export: '导出',
    rows: [
      {
        id: 'p1',
        name: '雷军',
        partners: ['刘德', '王川', '孙谦', '邹涛', '洪锋', 'CHEWSHOUZI', '林斌', '马文静', '刘芹', '刘伟', '黎万强', '彭博', '求伟芹', '林世伟', '张彤', '曹莉平', '求伯君', '卢伟冰', '周受资', '龚道军'],
        legalRep: ['小米科技有限责任公司', '北京顺为创业投资有限公司', '北京顺为资本投资咨询有限公司'],
        shareholder: ['小米科技有限责任公司', '北京口袋时尚科技有限公司', '北京雷石天地电子技术股份有限公司'],
        executive: ['小米科技有限责任公司', '小米通讯技术有限公司', '广州华多网络科技有限公司'],
      },
      {
        id: 'p2',
        name: '雷军',
        partners: ['赵晋华', '李光', '李珺', '耿庆宇', '尹华', '孙桐林', '马建军', '李少先', '朱德开', '张挺军', '马栋', '熊晖', '阮宏毅', '张解潭', '程晓钊', '孟文林', '秦'],
        legalRep: [],
        shareholder: [],
        executive: [],
      },
    ],
  },
  loading: { text: '正在查询人员信息...' },
  empty: { text: '输入人员姓名后点击查询，即可排查人员风险' },
}

const AVATAR_COLORS = ['#334155', '#2563EB', '#7C3AED', '#DB2777', '#059669', '#D97706', '#DC2626']

function PersonAvatar({ name }: { name: string }) {
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
  return (
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: 6,
        background: color,
        color: '#fff',
        fontSize: 26,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {name.slice(0, 1)}
    </div>
  )
}

function InfoLine({ label, values }: { label: string; values: string[] }) {
  if (!values || values.length === 0) return null
  return (
    <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.7, color: '#334155' }}>
      <span style={{ color: '#64748B' }}>{label}</span>
      {values.map((v, i) => (
        <span key={v}>
          {i > 0 && <span style={{ color: '#CBD5E1' }}>、</span>}
          <span style={{ color: '#1677ff', cursor: 'pointer' }}>{v}</span>
        </span>
      ))}
    </div>
  )
}

export default function JdPerson({ params }: { params: URLSearchParams }) {
  const [data] = useSample<Data>('jdPerson.json', seed)
  const [kw, setKw] = useState(data.search.initialValue)
  const [chips, setChips] = useState<string[]>([data.search.initialValue])
  const [phase, setPhase] = useState<'idle' | 'loading' | 'done'>('idle')
  const [sel, setSel] = useState<Set<string>>(new Set())

  const startSearch = () => {
    const value = kw.trim()
    if (!value) return
    setChips([value])
    setPhase('loading')
    window.setTimeout(() => {
      setPhase('done')
      setSel(new Set())
    }, 2000)
  }

  const removeChip = (idx: number) => {
    const next = [...chips]
    next.splice(idx, 1)
    setChips(next)
    if (next.length === 0) {
      setPhase('idle')
      setSel(new Set())
    }
  }

  const clearAll = () => {
    setChips([])
    setKw('')
    setPhase('idle')
    setSel(new Set())
  }

  const toggleRow = (id: string) => {
    const next = new Set(sel)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSel(next)
  }
  const toggleAll = () => {
    if (sel.size === data.result.rows.length) setSel(new Set())
    else setSel(new Set(data.result.rows.map((r) => r.id)))
  }

  const showResult = phase !== 'idle'

  return (
    <EpPage title={data.pageTitle} actions={<Sam value={data.source} />}>
      {/* 顶部搜索区域 */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
        <div style={{ display: 'flex', width: 640, maxWidth: '100%' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              value={kw}
              onChange={(e) => setKw(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && startSearch()}
              placeholder={data.search.placeholder}
              style={{
                width: '100%',
                padding: '11px 34px 11px 16px',
                borderRadius: '8px 0 0 8px',
                border: '1px solid #E2E8F0',
                borderRight: 'none',
                background: '#F5F7FA',
                fontSize: 14,
                color: '#334155',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {kw && (
              <button
                title="清除"
                onClick={() => setKw('')}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  border: 'none',
                  background: '#CBD5E1',
                  color: '#fff',
                  fontSize: 11,
                  lineHeight: '18px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                ×
              </button>
            )}
          </div>
          <button
            onClick={startSearch}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '0 24px',
              borderRadius: '0 8px 8px 0',
              border: 'none',
              background: '#ffc53d',
              color: '#1F2937',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.5" y2="16.5" />
            </svg>
            {data.search.btn}
          </button>
        </div>
      </div>

      {/* 筛选条件栏 */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E2E8F0', padding: '14px 18px', marginTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: '#64748B' }}>{data.filter.selectedTitle}</span>
          {chips.map((c, idx) => (
            <span
              key={c + idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '3px 10px',
                borderRadius: 12,
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                color: '#1677ff',
                fontSize: 13,
              }}
            >
              {c}
              <button
                onClick={() => removeChip(idx)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#1677ff',
                  fontSize: 13,
                  lineHeight: 1,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                ×
              </button>
            </span>
          ))}
          <button
            onClick={clearAll}
            style={{ marginLeft: 'auto', border: 'none', background: 'transparent', color: '#1677ff', fontSize: 13, cursor: 'pointer' }}
          >
            {data.filter.clear}
          </button>
        </div>

        {data.filter.rows.map((row) => (
          <div key={row.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginTop: 8 }}>
            <span style={{ width: 64, flexShrink: 0, fontSize: 13, color: '#64748B', marginTop: 1 }}>{row.title}</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', flex: 1, fontSize: 13, color: '#94A3B8' }}>
              {row.items.map((it) => (
                <span key={it} style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {it}
                </span>
              ))}
            </div>
            <button style={{ border: 'none', background: 'transparent', color: '#1677ff', fontSize: 13, cursor: 'pointer', flexShrink: 0 }}>
              {data.filter.expand} ▾
            </button>
          </div>
        ))}
      </div>

      {/* 结果区 */}
      <div style={{ marginTop: 14 }}>
        {phase === 'idle' && (
          <div style={{ padding: 70, textAlign: 'center', color: '#94A3B8', fontSize: 14 }}>{data.empty.text}</div>
        )}

        {phase === 'loading' && (
          <div style={{ padding: 70, textAlign: 'center' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: '3px solid #E2E8F0',
                borderTopColor: '#1677ff',
                margin: '0 auto',
                animation: 'spin 1s linear infinite',
              }}
            />
            <div style={{ marginTop: 14, fontSize: 14, color: '#64748B' }}>{data.loading.text}</div>
          </div>
        )}

        {showResult && phase === 'done' && (
          <>
            {/* 结果操作栏 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={data.result.rows.length > 0 && sel.size === data.result.rows.length}
                  onChange={toggleAll}
                  style={{ accentColor: '#1677ff', width: 15, height: 15, cursor: 'pointer' }}
                />
                {data.result.selectAll}
              </label>
              <span style={{ fontSize: 13, color: '#334155' }}>
                {data.result.found.replace('{count}', String(data.result.count)).replace('3910', String(data.result.count))}
              </span>
              <button
                style={{
                  marginLeft: 'auto',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: '1px solid #CBD5E1',
                  background: '#fff',
                  color: '#334155',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {data.result.export}
              </button>
            </div>

            {/* 人员结果列表 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.result.rows.map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: 'flex',
                    gap: 16,
                    background: '#fff',
                    borderRadius: 10,
                    border: '1px solid #E2E8F0',
                    padding: '18px 20px',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={sel.has(r.id)}
                    onChange={() => toggleRow(r.id)}
                    style={{ accentColor: '#1677ff', width: 15, height: 15, marginTop: 24, cursor: 'pointer' }}
                  />
                  <PersonAvatar name={r.name} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>{r.name}</div>
                    <InfoLine label="合作伙伴：" values={r.partners} />
                    <InfoLine label="担任法定代表人的企业：" values={r.legalRep} />
                    <InfoLine label="担任股东的企业：" values={r.shareholder} />
                    <InfoLine label="担任高管的企业：" values={r.executive} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </EpPage>
  )
}
