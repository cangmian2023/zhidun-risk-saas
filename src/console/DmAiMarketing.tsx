import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

/* 数字营销 · AI营销 · 1:1 复刻
 * 源截图：
 * - 输入页：screencapture-b.qixin.com-2026-08-19-11-07-13.png
 * - 结果页：screencapture-b.qixin.com-2026-08-19-11-08-17.png
 */

const EXAMPLES = [
  '@合合信息科技股份有限公司 访前营销一页纸分析',
  '上海市注册资本500万以下,成立3年以上,有联系方式的企业名单',
  '常州市新能源汽车产业链的上游供应商的企业名单',
  '我要找本地的科创金融企业客群名单',
  '最近 7 天上海市静安区应收帐款融资到期的企业',
]

const HISTORY = [
  { title: '合合信息访前营销分析', time: '2026-08-18 22:04' },
  { title: '分析合合信息访前营销', time: '2026-08-18 16:31' },
  { title: '合合信息访前营销分析', time: '2026-08-18 10:08' },
]

// 输入页（主链接）
export default function DmAiMarketing() {
  const nav = useNavigate()
  const [q, setQ] = useState('')

  const go = (query: string) => {
    const qq = query.trim()
    if (!qq) return
    nav(`/console/dm/ai-marketing-result?q=${encodeURIComponent(qq)}`)
  }

  return (
    <div style={{ 
      minHeight: 'calc(100vh - 48px)',
      background: 'linear-gradient(180deg, #eaf4ff 0%, #ffffff 35%)',
      paddingTop: 80
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
        {/* 标题区域 */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h1 style={{ 
            fontSize: 42, 
            fontWeight: 700, 
            color: '#1d2129',
            marginBottom: 16,
            letterSpacing: 1
          }}>
            一句话找企业、找客群、匹配产品
          </h1>
          <p style={{ fontSize: 15, color: '#86909c', margin: 0 }}>
            已匹配 4,071 家银行、10万+ 个金融产品
          </p>
        </div>

        {/* 搜索输入框 */}
        <div style={{
          border: '2px solid #c9e2ff',
          borderRadius: 12,
          background: '#fff',
          boxShadow: '0 8px 30px rgba(22, 93, 255, 0.08)',
          padding: '24px 20px 16px',
          marginBottom: 20
        }}>
          <textarea
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="输入企业/客群/金融产品，生成营销方案，输入 @企业名 可搜索企业"
            rows={4}
            style={{
              width: '100%',
              resize: 'none',
              border: 'none',
              outline: 'none',
              fontSize: 15,
              color: '#1d2129',
              background: 'transparent',
              lineHeight: 1.6,
              fontFamily: 'inherit'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              disabled={!q.trim()}
              onClick={() => go(q)}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: 'none',
                background: q.trim() ? 'linear-gradient(135deg, #165dff 0%, #4080ff 100%)' : '#e5e6eb',
                color: '#fff',
                cursor: q.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                transition: 'all 0.2s'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>

        {/* 快捷示例 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 100 }}>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => go(ex)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: '1px solid #e5e6eb',
                background: '#fff',
                fontSize: 14,
                color: '#4e5969',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#165dff'
                e.currentTarget.style.color = '#165dff'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#e5e6eb'
                e.currentTarget.style.color = '#4e5969'
              }}
            >
              {ex}
            </button>
          ))}
        </div>

        {/* 历史会话 */}
        <div style={{ maxWidth: 850, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#1d2129', margin: 0 }}>历史会话</h3>
            <button style={{
              background: 'none',
              border: 'none',
              fontSize: 14,
              color: '#4e5969',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              更多
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>

          <div>
            {HISTORY.map((item, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 0',
                  borderBottom: idx < HISTORY.length - 1 ? '1px solid #f2f3f5' : 'none',
                  cursor: 'pointer'
                }}
                onClick={() => go(item.title)}
              >
                <span style={{ fontSize: 15, color: '#1d2129' }}>{item.title}</span>
                <span style={{ fontSize: 13, color: '#86909c' }}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// 结果页数据
const RESULT_COMPANIES = [
  { id: 1, name: '上海傅利叶智能科技股份有限公司', capital: '405万', region: '上海市', year: '2015年' },
  { id: 2, name: '上海得物信息集团有限公司', capital: '200万', region: '上海市', year: '2015年' },
  { id: 3, name: '上海宇翼企业管理咨询合伙企业（有限合伙）', capital: '80万', region: '上海市', year: '2020年' },
  { id: 4, name: '上海沪尚茗居装修有限公司', capital: '200万', region: '上海市', year: '2021年' },
  { id: 5, name: '上海钛虎机器人科技有限公司', capital: '470万', region: '上海市', year: '2020年' },
]

// AI营销结果页
export function DmAiMarketingResult() {
  const nav = useNavigate()
  const [inputValue, setInputValue] = useState('')
  const [query] = useState(() => new URLSearchParams(window.location.search).get('q') || '获取上海低注册资本老企业名录')

  const handleBack = () => {
    nav('/console/dm/ai-marketing')
  }

  return (
    <div style={{ 
      minHeight: 'calc(100vh - 48px)',
      background: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 24px 40px' }}>
        {/* 顶部面包屑 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <span style={{ color: '#4e5969', cursor: 'pointer' }} onClick={handleBack}>AI营销</span>
            <span style={{ color: '#86909c' }}>/</span>
            <span style={{ color: '#1d2129', fontWeight: 500 }}>{query}</span>
            <span style={{ 
              background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
              color: '#fff',
              fontSize: 12,
              padding: '2px 8px',
              borderRadius: 4,
              marginLeft: 8
            }}>AI生成</span>
            <button style={{
              marginLeft: 12,
              border: '1px solid #165dff',
              color: '#165dff',
              background: '#fff',
              borderRadius: 20,
              padding: '4px 12px',
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }} onClick={handleBack}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              新对话
            </button>
          </div>
          <button style={{
            background: 'none',
            border: 'none',
            fontSize: 14,
            color: '#4e5969',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            已导出
          </button>
        </div>

        {/* 查询条件 */}
        <div style={{ marginBottom: 24, paddingLeft: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1d2129', marginBottom: 8 }}>查询条件</div>
          <div style={{ fontSize: 15, color: '#1d2129' }}>
            <span style={{ marginRight: 4 }}>📍</span>
            行政区：上海市 | 资本&lt;500万 | 成立3年+ | 有手机号
          </div>
        </div>

        {/* 查询结果 */}
        <div style={{ marginBottom: 20, paddingLeft: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2129', marginBottom: 8 }}>查询结果</div>
          <div style={{ fontSize: 15, color: '#1d2129', marginBottom: 20 }}>
            找到 <span style={{ color: '#165dff', fontWeight: 600 }}>2,630,991</span> 家 企业
          </div>

          {/* 结果表格 */}
          <div style={{ 
            border: '1px solid #e5e6eb',
            borderRadius: 12,
            overflow: 'hidden',
            maxWidth: 600
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f2f3f5' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 14, fontWeight: 600, color: '#1d2129', borderBottom: '1px solid #e5e6eb' }}>#</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 14, fontWeight: 600, color: '#1d2129', borderBottom: '1px solid #e5e6eb' }}>企业名称</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 14, fontWeight: 600, color: '#1d2129', borderBottom: '1px solid #e5e6eb' }}>注册资本</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 14, fontWeight: 600, color: '#1d2129', borderBottom: '1px solid #e5e6eb' }}>地区</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 14, fontWeight: 600, color: '#1d2129', borderBottom: '1px solid #e5e6eb' }}>成立年份</th>
                </tr>
              </thead>
              <tbody>
                {RESULT_COMPANIES.map((company, idx) => (
                  <tr key={company.id} style={{ borderBottom: idx < RESULT_COMPANIES.length - 1 ? '1px solid #f2f3f5' : 'none' }}>
                    <td style={{ padding: '14px 16px', fontSize: 14, color: '#4e5969' }}>{company.id}</td>
                    <td style={{ padding: '14px 16px', fontSize: 14, color: '#1d2129' }}>{company.name}</td>
                    <td style={{ padding: '14px 16px', fontSize: 14, color: '#1d2129' }}>{company.capital}</td>
                    <td style={{ padding: '14px 16px', fontSize: 14, color: '#1d2129' }}>{company.region}</td>
                    <td style={{ padding: '14px 16px', fontSize: 14, color: '#1d2129' }}>{company.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 结果提示 */}
          <div style={{ marginTop: 20, fontSize: 14, color: '#4e5969', lineHeight: 1.6 }}>
            结果较多（2,630,991家），建议：缩小到具体区县 或 添加行业/资质筛选（如高新技术企业、制造业等）
          </div>
        </div>

        {/* AI营销卡片 */}
        <div style={{ 
          margin: '30px 24px',
          background: 'linear-gradient(135deg, #f6ffed 0%, #f0fdf4 100%)',
          border: '1px solid #d9f7be',
          borderRadius: 12,
          padding: 20,
          maxWidth: 400,
          position: 'relative',
          display: 'flex',
          gap: 16
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <span style={{ color: '#52c41a', fontSize: 16 }}>🧩</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#1d2129' }}>AI营销-挖掘名单</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2129', marginBottom: 8 }}>找上海小微企业</div>
            <div style={{ fontSize: 14, color: '#4e5969' }}>
              全维搜索 <span style={{ color: '#00b42a', fontWeight: 600 }}>2,630,991</span> 家企业
            </div>
          </div>
          <div style={{ width: 120, height: 80, background: '#fff', borderRadius: 8, border: '1px solid #e5e6eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 100, height: 60, background: 'repeating-linear-gradient(#f2f3f5 0px, #f2f3f5 1px, transparent 1px, transparent 15px), repeating-linear-gradient(90deg, #f2f3f5 0px, #f2f3f5 1px, transparent 1px, transparent 20px)' }}>
              <div style={{ position: 'absolute', top: 20, right: 20, background: '#52c41a', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 4 }}>企业列表</div>
            </div>
          </div>
        </div>

        {/* 操作栏 */}
        <div style={{ 
          margin: '0 24px 30px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          paddingLeft: 8
        }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#86909c', padding: 4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#86909c', padding: 4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#86909c', padding: 4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
              <polyline points="16 6 12 2 8 6"></polyline>
              <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
          </button>
          <div style={{ width: 1, height: 16, background: '#e5e6eb' }}></div>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#86909c', padding: 4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
            </svg>
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#86909c', padding: 4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
            </svg>
          </button>
          <div style={{ flex: 1 }}></div>
          <span style={{ fontSize: 13, color: '#86909c' }}>消耗 41 额度</span>
        </div>

        {/* 底部输入框 */}
        <div style={{ 
          maxWidth: 800,
          margin: '0 auto',
          position: 'relative'
        }}>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="询问关于这次营销的任何问题"
            rows={2}
            style={{
              width: '100%',
              padding: '16px 60px 16px 20px',
              borderRadius: 12,
              border: '1px solid #e5e6eb',
              background: '#f7f8fa',
              fontSize: 15,
              color: '#1d2129',
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
            }}
          />
          <button
            disabled={!inputValue.trim()}
            style={{
              position: 'absolute',
              right: 16,
              bottom: 16,
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: 'none',
              background: inputValue.trim() ? 'linear-gradient(135deg, #165dff 0%, #4080ff 100%)' : '#c9cdd4',
              color: '#fff',
              cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
          </button>
          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: '#c9cdd4' }}>
            内容由 AI 生成，仅供参考
          </div>
        </div>
      </div>
    </div>
  )
}