// 企业尽调 · 常规筛查 + 尽调助手双 Tab（jd-company）
// 数据：本地样例 jdCompany.json（橘 Sam）
import { useState } from 'react'
import { EpPage, EpCard, EpTag, EpBtn, useSample, Sam } from '../../epCommon'
import { usePageNav } from '../../../pageNav'

type Data = {
  pageTitle: string
  tabs: { key: string; label: string; badge?: string }[]
  activeTab: string
  topActions: { batchScreen: string; settings: string }
  normal: {
    title: string
    placeholder: string
    defaultConfig: string
    screenBtn: string
    trySearchPrefix: string
    trySearch: { name: string }[]
    historyTitle: string
    batchDownload: string
    more: string
    failTag: string
    history: { id: number; name: string; time: string; result: string }[]
  }
  ai: {
    title: string
    placeholder: string
    defaultConfig: string
    prompts: { label: string; mention: string }[]
    historyTitle: string
    history: { id: number; title: string; time: string }[]
  }
}

const seed: Data = {
  pageTitle: '企业尽调',
  tabs: [
    { key: 'normal', label: '常规筛查' },
    { key: 'ai', label: '尽调助手' },
  ],
  activeTab: 'normal',
  topActions: { batchScreen: '批量筛查', settings: '筛查设置' },
  normal: {
    title: '一键筛查合作方资质风险',
    placeholder: '请输入企业名称/统一社会信用代码',
    defaultConfig: '默认配置',
    screenBtn: '筛查',
    trySearchPrefix: '试着搜索：',
    trySearch: [
      { name: '广州博鳌纵横网络科技有限公司' },
      { name: '中经汇通电子商务有限公司' },
    ],
    historyTitle: '历史筛查',
    batchDownload: '批量下载',
    more: '更多',
    failTag: '不通过',
    history: [
      { id: 1, name: '广州博鳌纵横网络科技有限公司', time: '2026-08-19 22:22', result: 'fail' },
      { id: 2, name: '乐视网信息技术（北京）股份有限公司', time: '2026-08-19 22:17', result: 'fail' },
      { id: 3, name: '广州博鳌纵横网络科技有限公司', time: '2026-08-19 21:21', result: 'fail' },
    ],
  },
  ai: {
    title: '智能分析合作方资质风险',
    placeholder: '输入您的尽调需求。使用 @企业名称 选择企业',
    defaultConfig: '默认配置',
    prompts: [
      { label: '从供应商准入角度分析：', mention: '@乐视网信息技术（北京）股份有限公司' },
      { label: '从客户授信角度分析：', mention: '@广州粤信科技有限公司' },
    ],
    historyTitle: '历史会话',
    history: [
      { id: 1, title: '供应商准入视角下的乐视分析', time: '2026-08-17 18:12' },
      { id: 2, title: '分析乐视供应商准入', time: '2026-08-17 15:52' },
    ],
  },
}

export default function JdCompany({ params }: { params: URLSearchParams }) {
  const [data] = useSample<Data>('jdCompany.json', seed)
  const [tab, setTab] = useState(data.activeTab)
  const [input, setInput] = useState('')
  const { goDetail } = usePageNav()

  const openResult = (name: string) => {
    goDetail(`/console/ep/jd-company-result?name=${encodeURIComponent(name)}`)
  }

  const isNormal = tab === 'normal'
  const cfg = isNormal ? data.normal : data.ai

  const topActions = isNormal ? (
    <>
      <EpBtn variant="default" size="sm">
        <span style={{ marginRight: 4 }}>📊</span>
        {data.topActions.batchScreen}
      </EpBtn>
      <EpBtn variant="default" size="sm">
        <span style={{ marginRight: 4 }}>⚙</span>
        {data.topActions.settings}
      </EpBtn>
    </>
  ) : undefined

  return (
    <EpPage title={data.pageTitle} actions={topActions}>
      <div style={{ maxWidth: 820, margin: '0 auto', paddingBottom: 40 }}>
        {/* 主标题 */}
        <h1
          style={{
            textAlign: 'center',
            fontSize: 30,
            fontWeight: 700,
            color: '#0F172A',
            margin: '8px 0 26px 0',
          }}
        >
          {cfg.title}
        </h1>

        {/* Tab 切换 */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div
            style={{
              display: 'inline-flex',
              background: '#F1F5F9',
              borderRadius: 8,
              padding: 4,
            }}
          >
            {data.tabs.map((t) => {
              const active = tab === t.key
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  style={{
                    position: 'relative',
                    padding: '7px 18px',
                    borderRadius: 6,
                    border: 'none',
                    fontSize: 14,
                    cursor: 'pointer',
                    color: active ? '#2563EB' : '#64748B',
                    background: active ? '#fff' : 'transparent',
                    fontWeight: active ? 600 : 400,
                    boxShadow: active ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {t.label}
                  {t.badge && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#2563EB',
                        color: '#fff',
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: 10,
                        lineHeight: 1,
                      }}
                    >
                      {t.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* 常规筛查 */}
        {isNormal && (
          <>
            {/* 输入卡片 */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #E2E8F0',
                borderRadius: 12,
                boxShadow: '0 2px 12px rgba(0,0,0,.04)',
                display: 'flex',
                alignItems: 'center',
                padding: '6px 6px 6px 0',
                gap: 4,
              }}
            >
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  border: 'none',
                  background: 'transparent',
                  fontSize: 14,
                  color: '#475569',
                  cursor: 'pointer',
                  padding: '10px 14px',
                  borderRight: '1px solid #F1F5F9',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ fontSize: 14 }}>⚙</span>
                {data.normal.defaultConfig}
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={data.normal.placeholder}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: 14,
                  padding: '10px 12px',
                  color: '#0F172A',
                  background: 'transparent',
                }}
              />
              <EpBtn
                variant="primary"
                size="md"
                style={{ background: '#2563EB', borderColor: '#2563EB', borderRadius: 8, padding: '8px 22px' }}
              >
                {data.normal.screenBtn}
              </EpBtn>
            </div>

            {/* 试着搜索 */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 12,
                marginTop: 16,
                fontSize: 13,
                color: '#64748B',
                flexWrap: 'wrap',
              }}
            >
              <span>{data.normal.trySearchPrefix}</span>
              {data.normal.trySearch.map((s, idx) => (
                <span key={idx}>
                  <button
                    onClick={() => openResult(s.name)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#2563EB',
                      cursor: 'pointer',
                      fontSize: 13,
                      padding: 0,
                    }}
                  >
                    {s.name}
                  </button>
                  {idx < data.normal.trySearch.length - 1 && (
                    <span style={{ marginLeft: 12, color: '#CBD5E1' }}>|</span>
                  )}
                </span>
              ))}
            </div>

            {/* 历史筛查 */}
            <EpCard style={{ marginTop: 48, padding: '20px 22px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>
                    {data.normal.historyTitle}
                  </span>
                  <button
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#64748B',
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>⬇</span>
                    {data.normal.batchDownload}
                  </button>
                </div>
                <button
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#64748B',
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  {data.normal.more}
                  <span style={{ fontSize: 10 }}>▾</span>
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {data.normal.history.map((h) => (
                  <div
                    key={h.id}
                    onClick={() => openResult(h.name)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <EpTag color="#B91C1C" bg="#FEE2E2">
                        {data.normal.failTag}
                      </EpTag>
                      <span style={{ fontSize: 14, color: '#2563EB' }}>{h.name}</span>
                    </div>
                    <span style={{ color: '#94A3B8', fontSize: 13, whiteSpace: 'nowrap' }}>
                      {h.time}
                    </span>
                  </div>
                ))}
              </div>
            </EpCard>
          </>
        )}

        {/* 尽调助手 */}
        {!isNormal && (
          <>
            {/* 输入卡片 */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #E2E8F0',
                borderRadius: 12,
                boxShadow: '0 2px 12px rgba(0,0,0,.04)',
                padding: '18px 20px 14px',
              }}
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={data.ai.placeholder}
                rows={3}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: '#0F172A',
                  background: 'transparent',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: '1px solid #F1F5F9',
                }}
              >
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    border: 'none',
                    background: 'transparent',
                    fontSize: 13,
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 14 }}>⚙</span>
                  {data.ai.defaultConfig}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      fontSize: 18,
                      padding: 4,
                    }}
                    title="附件"
                  >
                    📎
                  </button>
                  <button
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      border: 'none',
                      background: input.trim() ? '#2563EB' : '#E2E8F0',
                      color: '#fff',
                      cursor: input.trim() ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                    }}
                  >
                    ➤
                  </button>
                </div>
              </div>
            </div>

            {/* 快捷提示词 */}
            <div
              style={{
                display: 'flex',
                gap: 12,
                marginTop: 20,
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {data.ai.prompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(`${p.label}${p.mention}`)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 20,
                    border: '1px solid #E2E8F0',
                    background: '#fff',
                    fontSize: 13,
                    color: '#475569',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span style={{ color: '#94A3B8' }}>{p.label}</span>
                  <span style={{ color: '#2563EB' }}>{p.mention}</span>
                </button>
              ))}
            </div>

            {/* 历史会话 */}
            <div style={{ marginTop: 48 }}>
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#0F172A',
                  margin: '0 0 16px 0',
                }}
              >
                {data.ai.historyTitle}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {data.ai.history.map((h) => (
                  <div
                    key={h.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: 14,
                      color: '#0F172A',
                      cursor: 'pointer',
                      padding: '8px 4px',
                      borderRadius: 6,
                    }}
                  >
                    <span>{h.title}</span>
                    <span style={{ color: '#94A3B8', fontSize: 13, whiteSpace: 'nowrap' }}>
                      {h.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Sam value="jdCompany.json" />
      </div>
    </EpPage>
  )
}
