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
import { seedReportTemplates, type ReportTemplate, type ReportType } from './reportTemplateData'

let version = 0
const listeners = new Set<() => void>()

function emit() {
  version++
  listeners.forEach((l) => l())
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

export function getTemplateByType(type: ReportType): ReportTemplate | undefined {
  return seedReportTemplates.find((t) => t.reportType === type)
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
