/* 模型评分板块（通用 · 可在个人档案等页面复用）
 * 原零售信贷「单客画像」页的模型评分 2×2：额度建议 + 智察 / 智信 / 智融 三卡。
 * 抽成独立组件：数字营销新版个人档案直接引用，自带样例数据，纯展示（不跳转得分详情）。
 */
import { useState } from 'react'

export interface CustScoreCard {
  name: string // 智察(反欺诈) / 智信(信用) / 智融(综合)
  score: number // 评分（模型各自量纲）
  level: string // 等级：优 / 良 / 中 / 差
}
export interface CustScores {
  zhiCha: CustScoreCard
  zhiXin: CustScoreCard
  zhiRong: CustScoreCard
  limitSuggest: { suggested: number; current: number }
}

// 数字营销个人档案样例（与评分产品口径一致；演示数据）
export const SAMPLE_SCORES: CustScores = {
  zhiCha: { name: '智察（反欺诈）', score: 86, level: '优' },
  zhiXin: { name: '智信（信用）', score: 74, level: '良' },
  zhiRong: { name: '智融（综合）', score: 81, level: '良' },
  limitSuggest: { suggested: 200000, current: 200000 },
}

const SCORE_KIND: Record<string, 'green' | 'blue' | 'amber' | 'red'> = { 优: 'green', 良: 'blue', 中: 'amber', 差: 'red' }

function money(n: number) {
  return `¥${n.toLocaleString()}`
}

/* 模型评分面板：额度建议 + 三卡。onCardClick 可选（默认无操作，纯展示）。 */
export function ModelScorePanel({
  scores = SAMPLE_SCORES,
  onCardClick,
}: {
  scores?: CustScores
  onCardClick?: (prod: string) => void
}) {
  const cards = [
    { prod: 'zhicha', c: scores.zhiCha },
    { prod: 'zhixin', c: scores.zhiXin },
    { prod: 'zhirong', c: scores.zhiRong },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 8, flex: 1, minHeight: 0 }}>
      {/* 额度建议：最左上角 */}
      <div style={{ border: '1px solid #EDE9FE', borderRadius: 10, padding: 10, background: '#F5F3FF', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#6D28D9' }}>额度建议</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#6D28D9', marginTop: 3 }}>{money(scores.limitSuggest.suggested)}</div>
        <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>当前 {money(scores.limitSuggest.current)}</div>
      </div>
      {cards.map(({ prod, c }) => (
        <button
          key={prod}
          onClick={() => onCardClick?.(prod)}
          disabled={!onCardClick}
          title={`查看 ${c.name} 详情`}
          style={{
            border: '1px solid #E2E8F0', borderRadius: 10, padding: 10, background: '#fff', cursor: onCardClick ? 'pointer' : 'default',
            textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 3, height: '100%', justifyContent: 'center', transition: 'border-color .15s, box-shadow .15s',
          }}
          onMouseEnter={(e) => { if (onCardClick) { e.currentTarget.style.borderColor = '#A78BFA'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(139,92,246,.12)' } }}
          onMouseLeave={(e) => { if (onCardClick) { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none' } }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#334155' }}>{c.name}</span>
            <ScoreBadge level={c.level}>{c.level}</ScoreBadge>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>{c.score}</div>
          <div style={{ height: 4, borderRadius: 3, background: '#EEF2FF', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, Math.round(c.score / 10))}%`, background: '#8B5CF6' }} />
          </div>
          <div style={{ fontSize: 10, color: '#8B5CF6' }}>› 查看模型详情</div>
        </button>
      ))}
    </div>
  )
}

// 轻量等级徽标（不依赖 ui.tsx 的 Badge，保持组件自包含）
function ScoreBadge({ level, children }: { level: string; children: React.ReactNode }) {
  const kind = SCORE_KIND[level] ?? 'blue'
  const bg: Record<string, string> = { green: '#F0FDF4', blue: '#EFF6FF', amber: '#FFFBEB', red: '#FEF2F2' }
  const color: Record<string, string> = { green: '#16A34A', blue: '#2563EB', amber: '#D97706', red: '#DC2626' }
  return (
    <span style={{ fontSize: 11, padding: '1px 8px', borderRadius: 999, background: bg[kind], color: color[kind], fontWeight: 600 }}>
      {children}
    </span>
  )
}

/* 带标题外壳的模型评分板块（个人档案页直接用的整块） */
export function ModelScoreSection({ scores, onCardClick }: { scores?: CustScores; onCardClick?: (prod: string) => void }) {
  // 仅占位：避免未使用告警
  void useState
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#1d2129' }}>模型评分</span>
        <span style={{ fontSize: 12, color: '#86909c' }}>智察 / 智信 / 智融 三模型 + 额度建议</span>
      </div>
      <div style={{ height: 200 }}>
        <ModelScorePanel scores={scores} onCardClick={onCardClick} />
      </div>
    </div>
  )
}
