/* ============================================================================
 * 评分可视化 —— 「模板配置页预览」与「报告详情页」共用的唯一实现
 *
 * 为什么要抽出来：
 *   在此之前两边各画各的 —— 配置页预览支持四种形态但不做语义翻转，详情页做了
 *   语义翻转却写死只渲染「大数字」。结果就是「模板上配了环形图，报告里还是大
 *   数字」。所见即所得不能靠两边人肉对齐，只能靠共用同一个组件从结构上保证。
 *
 * 坐标系约定：
 *   入参 rawScore 一律是「模型原始分」，与 grades 的 minScore/maxScore 同一坐标
 *   系（异常值空间，越高越危险）。语义翻转（scoreSemantic='credit' → 展示
 *   满分−原始分、刻度条整条左右翻转）在组件内部统一处理，调用方不换算。
 *
 * 命中判定始终用 rawScore 去撞 grades，因此无论展示成哪种语义，
 * 落在哪一段、什么颜色、什么自动审核结论都不会变。
 * ========================================================================== */
import type { CSSProperties, ReactNode } from 'react'
import {
  buildScoreBar,
  toDisplayScore,
  matchGrade,
  type ScoreDisplayConfig,
  type ScoreGrade,
  type ScoreSemantic,
} from './reportTemplateData'

/** 风险标签行的渲染上下文（配置页借此把标签换成可内联编辑的下拉） */
export interface ScoreVisualCtx {
  grade?: ScoreGrade
  gradeIndex: number
  color: string
}

const tagStyle = (c: string): CSSProperties => ({
  padding: '1px 8px',
  fontSize: 11,
  fontWeight: 600,
  borderRadius: 999,
  color: c,
  border: `1px solid ${c}55`,
  background: `${c}14`,
})

export function ScoreVisual({
  sd,
  rawScore,
  tagSlot,
}: {
  sd?: ScoreDisplayConfig
  rawScore: number
  /** 覆盖默认的风险标签行；配置页传入以支持内联改「风险等级 / 自动审核结果」 */
  tagSlot?: (ctx: ScoreVisualCtx) => ReactNode
}) {
  const grades = sd?.grades ?? []
  const semantic: ScoreSemantic = sd?.scoreSemantic ?? 'risk'
  const comp = sd?.displayComponent ?? '大数字'

  const bar = buildScoreBar(grades, semantic)
  // 超出分段覆盖范围时就近吸附到首/末段，避免出现「无等级」的空白态
  const grade =
    matchGrade(rawScore, grades) ??
    (grades.length ? (rawScore < grades[0].minScore ? grades[0] : grades[grades.length - 1]) : undefined)
  const gradeIndex = grade ? grades.indexOf(grade) : -1
  const color = grade?.color ?? '#1D4ED8'

  const shown = toDisplayScore(rawScore, semantic, grades)
  const span = Math.max(1, bar.max - bar.min)
  const pct = Math.max(0, Math.min(1, (shown - bar.min) / span))

  const chip = grade ? (
    <span
      style={{ padding: '2px 10px', fontSize: 12, fontWeight: 600, borderRadius: 999, color: '#fff', background: color }}
      title={grade.description}
    >
      {grade.label ? `${grade.grade} · ${grade.label}` : grade.grade}
    </span>
  ) : null

  /* ---------- 阈值刻度条：段宽/配色/边界刻度全部取自 bar（已含语义翻转） ---------- */
  const thresholdBar = (
    <div style={{ width: '100%', minWidth: 200 }}>
      <div style={{ position: 'relative', height: 10, borderRadius: 999, background: '#E5E7EB', overflow: 'hidden' }}>
        {bar.segs.map((s) => (
          <div
            key={s.grade.grade}
            style={{
              position: 'absolute',
              left: `${s.left}%`,
              width: `${Math.max(0, s.width)}%`,
              height: '100%',
              background: s.grade.color,
              opacity: grade && s.grade.grade !== grade.grade ? 0.35 : 1,
            }}
            title={`${s.grade.grade}｜原始分 ${s.grade.minScore}–${s.grade.maxScore}｜${s.grade.autoResult}`}
          />
        ))}
        {/* 指针 */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: `${pct * 100}%`,
            transform: 'translate(-50%, -50%)',
            width: 14,
            height: 14,
            borderRadius: 999,
            border: '2px solid #fff',
            background: '#1E293B',
            boxShadow: '0 1px 3px rgba(0,0,0,.25)',
          }}
        />
      </div>
      <div style={{ position: 'relative', height: 16, marginTop: 4, width: '100%' }}>
        {bar.bounds.map((b, i, arr) => {
          const left = ((b - bar.min) / span) * 100
          const tx = i === 0 ? 'translateX(0)' : i === arr.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)'
          // 展示坐标下：credit 语义左端是原始分最高处（最差），risk 语义左端才是最优
          const tail =
            i === 0
              ? `· ${semantic === 'credit' ? '最差' : '最优'}`
              : i === arr.length - 1
                ? `· ${semantic === 'credit' ? '最优' : '最差'}`
                : ''
          return (
            <span
              key={`${b}-${i}`}
              style={{
                position: 'absolute',
                left: `${left}%`,
                transform: tx,
                fontSize: 11,
                color: tail ? '#6B7280' : '#9CA3AF',
                whiteSpace: 'nowrap',
              }}
            >
              {b} {tail}
            </span>
          )
        })}
      </div>
    </div>
  )

  /* ---------- 四种展示形态 ---------- */
  let visual: ReactNode = null
  if (comp === '大数字') {
    visual = (
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontSize: 46, fontWeight: 800, color, lineHeight: 1 }}>{shown}</span>
        <span style={{ fontSize: 13, color: '#9CA3AF' }}>/ {bar.max} 分</span>
        {chip}
      </div>
    )
  } else if (comp === '环形图') {
    const R = 46
    const C = 2 * Math.PI * R
    visual = (
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={R} fill="none" stroke="#E5E7EB" strokeWidth="12" />
          <circle
            cx="60"
            cy="60"
            r={R}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${(C * pct).toFixed(1)} ${C.toFixed(1)}`}
            transform="rotate(-90 60 60)"
          />
          <text x="60" y="58" textAnchor="middle" fontSize="26" fontWeight="800" fill={color}>{shown}</text>
          <text x="60" y="76" textAnchor="middle" fontSize="11" fill="#9CA3AF">/ {bar.max} 分</text>
        </svg>
        {chip}
      </div>
    )
  } else if (comp === '进度条') {
    visual = (
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color }}>{shown} 分</span>
          {chip}
        </div>
        <div style={{ position: 'relative', height: 16, borderRadius: 999, overflow: 'hidden', background: '#F1F5F9' }}>
          {bar.segs.map((s) => (
            <div
              key={s.grade.grade}
              style={{
                position: 'absolute',
                left: `${s.left}%`,
                width: `${Math.max(0, s.width)}%`,
                height: '100%',
                background: s.grade.color,
                opacity: 0.28,
              }}
            />
          ))}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${pct * 100}%`,
              background: color,
              opacity: 0.9,
              borderRadius: 999,
            }}
          />
        </div>
      </div>
    )
  } else {
    /* 仪表盘：半圆弧按分段着色 + 指针，弧与指针同在展示坐标系下铺满整弧 */
    const cx = 90
    const cy = 84
    const R2 = 66
    const pt = (p: number, r: number) => ({ x: cx - r * Math.cos(p * Math.PI), y: cy - r * Math.sin(p * Math.PI) })
    const arc = (p1: number, p2: number, r: number) => {
      const a = pt(p1, r)
      const b = pt(p2, r)
      return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} A ${r} ${r} 0 0 1 ${b.x.toFixed(1)} ${b.y.toFixed(1)}`
    }
    const needle = pt(pct, R2 - 16)
    visual = (
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <svg width="180" height="104" viewBox="0 0 180 104">
          {bar.segs.map((s) => {
            const p1 = Math.max(0, s.left / 100)
            const p2 = Math.min(1, (s.left + s.width) / 100)
            if (p2 <= p1) return null
            return (
              <path
                key={s.grade.grade}
                d={arc(p1, p2, R2)}
                fill="none"
                stroke={s.grade.color}
                strokeWidth="12"
                opacity={grade && s.grade.grade === grade.grade ? 1 : 0.35}
              />
            )
          })}
          <line x1={cx} y1={cy} x2={needle.x.toFixed(1)} y2={needle.y.toFixed(1)} stroke="#334155" strokeWidth="3" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="5" fill="#334155" />
          <text x={cx} y={cy + 16} textAnchor="middle" fontSize="20" fontWeight="800" fill={color}>{shown}</text>
        </svg>
        {chip}
      </div>
    )
  }

  // 进度条本身就是横向长条，再并排刻度条会互相挤，改为上下堆叠
  const stack = comp === '进度条'

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: stack ? 'stretch' : 'center',
          flexDirection: stack ? 'column' : 'row',
          gap: stack ? 12 : 20,
        }}
      >
        {visual}
        {(sd?.showThresholdBar ?? true) && <div style={{ flex: 1, minWidth: 200 }}>{thresholdBar}</div>}
      </div>

      {(sd?.showRiskTags ?? true) &&
        (tagSlot
          ? tagSlot({ grade, gradeIndex, color })
          : grade && (
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={tagStyle(color)}>风险{grade.riskLevel}</span>
                <span style={tagStyle('#64748B')}>{grade.autoResult}</span>
              </div>
            ))}

      {(sd?.showDescription ?? true) && grade?.description && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#6B7280' }}>{grade.description}</div>
      )}
    </div>
  )
}
