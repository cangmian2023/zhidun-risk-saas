/* ============================================================================
 * 模板配置全局 store（轻量）
 *
 * 设计：以 `seedReportTemplates` 为唯一可变数据源，叠加「版本号 + 订阅」，
 * 使「报告模板配置页」的任意编辑（开关 / 分值 / 维度 / 字段 / 权重 …）能
 * 实时反映到「报告详情 / 预览 / 评分维度分布表」，无需跨路由传参或刷新。
 *
 * 用法：
 *   - 配置页编辑后调用 updateTemplate(id, fn)（内部写回 seed 并 emit）。
 *   - 详情 / 预览 / 维度表组件用 useTemplate(id?) / useTemplate(undefined, type)
 *     订阅，模板变化即重新渲染。
 * ========================================================================== */
import { useSyncExternalStore } from 'react'
import { seedReportTemplates, type ReportTemplate, type ReportType, type SectionConfig, type CardDisplayMode } from './reportTemplateData'

/* ---------- 本地文件持久化（通过 Vite 插件代理写入 templateSeed.json）---------- */
let saveTimer: ReturnType<typeof setTimeout> | null = null
function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    fetch('/api/save-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(seedReportTemplates),
    }).catch(() => { /* dev server may restart */ })
  }, 300)
}

// 启动时尝试加载已保存的文件
try {
  const saved = await fetch('/api/load-templates').then(r => r.ok ? r.json() : null).catch(() => null)
  if (saved && Array.isArray(saved) && saved.length > 0) {
    seedReportTemplates.length = 0
    seedReportTemplates.push(...saved)
  }
} catch { /* 首次启动无文件时用代码 seed */ }

let version = 0
const listeners = new Set<() => void>()

function emit() {
  version++
  listeners.forEach((l) => l())
  scheduleSave()
}

export function subscribe(cb: () => void): () => void {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

export function getVersion(): number {
  return version
}

/** 仅通知订阅者重渲染（用于配置页已直接改过 seed 后手动触发详情/预览刷新） */
export function touch(): void {
  emit()
}

/** 按 id 编辑模板：写回 seedReportTemplates 并通知所有订阅者（触发详情/预览重渲染） */
export function updateTemplate(id: string, fn: (t: ReportTemplate) => ReportTemplate): void {
  const i = seedReportTemplates.findIndex((t) => t.id === id)
  if (i < 0) return
  const next = fn(seedReportTemplates[i])
  if (next !== seedReportTemplates[i]) seedReportTemplates[i] = next
  emit()
}

export function getTemplateById(id: string): ReportTemplate | undefined {
  return seedReportTemplates.find((t) => t.id === id)
}

/* 按报告类型取模板。
 * 同一类型下可能并存多个模板（正式版 / 备用版 / 草稿版），不能简单取数组第一个 ——
 * 那样配置页的「设为默认」按钮就成了空操作（它承诺"新进件将使用新模板"），
 * 且调整 seed 顺序会让报告详情页悄悄换掉模板。
 * 取用优先级：本类型下被标为默认的 → 已启用的 → 兜底第一个。 */
export function getTemplateByType(type: ReportType): ReportTemplate | undefined {
  const list = seedReportTemplates.filter((t) => t.reportType === type)
  return list.find((t) => t.isDefault) ?? list.find((t) => t.status === '已启用') ?? list[0]
}

/** 订阅模板变化；返回按 id / type 查到的模板（每次渲染重新读取，确保拿到最新对象） */
export function useTemplate(id?: string, type?: ReportType): ReportTemplate | undefined {
  useSyncExternalStore(subscribe, getVersion)
  if (id) return getTemplateById(id)
  if (type) return getTemplateByType(type)
  return undefined
}

export function useTemplates(): ReportTemplate[] {
  useSyncExternalStore(subscribe, getVersion)
  return seedReportTemplates
}

/** 编辑某模板下的单个分段（写回 seed 并通知订阅者） */
export function patchSection(tplId: string, sid: string, fn: (s: SectionConfig) => SectionConfig): void {
  updateTemplate(tplId, (t) => ({
    ...t,
    sections: t.sections.map((s) => (s.id === sid ? fn(s) : s)),
  }))
}

/** 详情页「显示方式」开关：返回当前分段显示方式 + 切换函数（列表 ⇄ 小卡片），落库到模板分段 */
export function useSectionDisplayMode(reportType: ReportType, sectionId: string) {
  const tpl = useTemplate(undefined, reportType)
  const mode: CardDisplayMode = tpl?.sections.find((s) => s.id === sectionId)?.displayMode ?? 'list'
  const setMode = (next: CardDisplayMode) => {
    if (!tpl) return
    patchSection(tpl.id, sectionId, (s) => ({ ...s, displayMode: next }))
  }
  const toggle = () => setMode(mode === 'list' ? 'card' : 'list')
  return { mode, setMode, toggle }
}
