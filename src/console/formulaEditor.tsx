import React, { useState } from 'react'
import {
  DECISION_SCORE_VARS,
  evaluateFormula,
  formulaText,
  type FormulaTerm,
  type FormulaVar,
  type ScoreFormula,
} from './reportTemplateData'

interface Props {
  formula?: ScoreFormula
  vars?: FormulaVar[]
  canEdit: boolean
  onSave: (f: ScoreFormula) => void
}

const card: React.CSSProperties = { border: '1px solid #E5E7EB', borderRadius: 10, background: '#F8FAFC', padding: '12px 14px' }
const miniBtn: React.CSSProperties = { padding: '4px 10px', borderRadius: 6, border: '1px solid #D1D5DB', background: '#fff', fontSize: 12, cursor: 'pointer' }
const inp: React.CSSProperties = { padding: '4px 8px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13 }

function newTerm(vars: FormulaVar[]): FormulaTerm {
  return { id: 't' + Math.random().toString(36).slice(2, 8), op: '+', kind: 'var', varId: vars[0]?.id, factor: 1 }
}

/**
 * 综合总分公式编辑器（可视化公式构建器）
 * - 收起态：小卡片显示已配公式（变量 chip + 运算符），右侧「编辑」按钮
 * - 展开态：行式 builder，每行 = 运算符(±) / 类型(变量·常数) / 变量下拉(带方向提示) 或 常数 / ×系数 / 删除；可增项；实时预览求值
 * 参考成熟系统：Airtable / Notion 字段公式构建器（选字段+运算符+参数）、信贷评分卡编辑器（Σ变量×权重，支持加减方向）
 */
export default function FormulaEditor({ formula, vars = DECISION_SCORE_VARS, canEdit, onSave }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<FormulaTerm[]>([])
  const [saved, setSaved] = useState(false)

  const open = () => {
    setDraft(formula?.terms.map((t) => ({ ...t })) ?? [newTerm(vars)])
    setEditing(true)
    setSaved(false)
  }
  const update = (i: number, p: Partial<FormulaTerm>) =>
    setDraft((d) => d.map((t, k) => (k === i ? { ...t, ...p } : t)))
  const remove = (i: number) => setDraft((d) => d.filter((_, k) => k !== i))
  const add = () => setDraft((d) => [...d, newTerm(vars)])

  const sampleValues = vars.reduce<Record<string, number>>((a, v) => ((a[v.id] = v.sample), a), {})
  const preview = evaluateFormula({ terms: draft }, sampleValues)

  const save = () => {
    const clean = draft
      .filter((t) => (t.kind === 'var' ? !!t.varId : true))
      .map((t) => ({ ...t }))
    onSave({ terms: clean, updatedAt: new Date().toISOString() })
    setEditing(false)
    setSaved(true)
  }

  /* ---------- 收起态：公式摘要卡片 ---------- */
  if (!editing) {
    const terms = formula?.terms ?? []
    return (
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>综合总分计算公式</span>
          {saved && <span style={{ fontSize: 12, color: '#047857' }}>● 已保存</span>}
          <span style={{ flex: 1 }} />
          {canEdit && <button onClick={open} style={{ ...miniBtn, borderColor: '#6D28D9', color: '#6D28D9' }}>编辑</button>}
        </div>
        {terms.length === 0 ? (
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>未配置公式，点击「编辑」设置三大报告分数的聚合方式（支持加减不同方向）。</span>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {terms.map((t) => {
              const v = t.kind === 'var' ? vars.find((x) => x.id === t.varId) : undefined
              const label = t.kind === 'var' ? (v?.label ?? t.varId) : `常数(${t.constVal ?? 0})`
              const fac = Math.abs(t.factor) === 1 ? '' : `×${Number(t.factor)}`
              return (
                <span key={t.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 6, padding: '3px 8px', fontSize: 12, color: '#374151' }}>
                  <b style={{ color: t.op === '-' ? '#DC2626' : '#047857' }}>{t.op}</b>
                  <span>{label}{fac}</span>
                </span>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  /* ---------- 展开态：可视化公式构建器 ---------- */
  return (
    <div style={{ ...card, borderColor: '#6D28D9' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#6D28D9' }}>编辑综合总分公式</span>
        <span style={{ fontSize: 12, color: '#9CA3AF' }}>选择变量、符号与系数，组合出综合总分算法</span>
        <span style={{ flex: 1 }} />
        <button onClick={() => setEditing(false)} style={miniBtn}>取消</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {draft.map((t, i) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => update(i, { op: t.op === '+' ? '-' : '+' })}
              title="切换加减符号"
              style={{ width: 34, height: 34, borderRadius: '50%', border: `1px solid ${t.op === '-' ? '#DC2626' : '#047857'}`, color: t.op === '-' ? '#DC2626' : '#047857', fontWeight: 700, background: '#fff', cursor: 'pointer' }}>
              {t.op}
            </button>
            <select value={t.kind} disabled={!canEdit} onChange={(e) => update(i, { kind: e.target.value as 'var' | 'const' })} style={{ ...inp, width: 90 }}>
              <option value="var">变量</option>
              <option value="const">常数</option>
            </select>
            {t.kind === 'var' ? (
              <select value={t.varId} disabled={!canEdit} onChange={(e) => update(i, { varId: e.target.value })} style={{ ...inp, minWidth: 170 }}>
                {vars.map((v) => (
                  <option key={v.id} value={v.id}>{v.label}（{v.dir === 'up-good' ? '越高越好' : '越高越险'}）</option>
                ))}
              </select>
            ) : (
              <input type="number" value={t.constVal ?? 0} disabled={!canEdit} onChange={(e) => update(i, { constVal: +e.target.value })} style={{ ...inp, width: 110 }} placeholder="常数" />
            )}
            <span style={{ fontSize: 13, color: '#9CA3AF' }}>×</span>
            <input type="number" step="0.1" value={t.factor} disabled={!canEdit} onChange={(e) => update(i, { factor: +e.target.value })} style={{ ...inp, width: 80 }} />
            <button onClick={() => remove(i)} disabled={!canEdit} style={{ ...miniBtn, borderColor: '#FCA5A5', color: '#DC2626' }}>删除</button>
            {i === 0 && <span style={{ fontSize: 12, color: '#9CA3AF' }}>（首项符号即整体加减方向）</span>}
          </div>
        ))}
      </div>

      <button onClick={add} disabled={!canEdit} style={{ ...miniBtn, marginTop: 10, borderColor: '#6D28D9', color: '#6D28D9' }}>＋ 添加项</button>

      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', border: '1px solid #EDE9FE', background: '#F5F3FF', borderRadius: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: '#6B7280' }}>预览（样例值）：</span>
        <code style={{ fontSize: 13, color: '#4C1D95' }}>{formulaText({ terms: draft }, vars)}</code>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: '#4C1D95' }}>综合总分 ≈ <b>{preview == null ? '—' : preview.toFixed(2)}</b></span>
      </div>

      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button onClick={() => setEditing(false)} style={miniBtn}>放弃</button>
        <button onClick={save} disabled={!canEdit} style={{ ...miniBtn, background: '#6D28D9', color: '#fff', borderColor: '#6D28D9' }}>保存公式</button>
      </div>
    </div>
  )
}
