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

/* ============================================================================
 * 磁盘 JSON 四块格式（templateSeed.json 存储结构）
 *   basic        基本信息（name/type/scope/status/开关…）
 *   content      报告内容配置 → sections（content/log 分段；score/flow 分段已废弃不再生成）
 *   autoReview   自动审核 → scoreBlock/scoreDisplay/scoreFormula/specialRules
 *   manualReview 人工审核 → flowBlock/businessFlow
 * 运行时内存仍是扁平 ReportTemplate，仅序列化/反序列化做分组，页面代码零改动。
 * ========================================================================== */

/** 扁平 → 磁盘四块 */
export function convertToDisk(t: ReportTemplate) {
  return {
    id: t.id,
    basic: {
      name: t.name, reportType: t.reportType, scope: t.scope, status: t.status, isDefault: t.isDefault,
      description: t.description, version: t.version, lastEditor: t.lastEditor, lastEditTime: t.lastEditTime,
      showOpLog: t.showOpLog, showSectionTotals: t.showSectionTotals,
    },
    content: { sections: t.sections },
    autoReview: {
      scoreBlock: t.scoreBlock, scoreDisplay: t.scoreDisplay, scoreFormula: t.scoreFormula, specialRules: t.specialRules,
    },
    manualReview: {
      flowBlock: t.flowBlock, businessFlow: t.businessFlow,
    },
    theme: t.theme, export: t.export, changeLogs: t.changeLogs, demoApplicant: t.demoApplicant,
  }
}

/** 磁盘四块 → 扁平（兼容旧版扁平格式：无 basic 字段时按旧格式原样返回；兼容旧文件残留的 score/flow 分段） */
export function convertFromDisk(d: any): ReportTemplate {
  if (!d || !d.basic) return d as ReportTemplate
  const b = d.basic ?? {}
  const c = d.content ?? { sections: [] }
  const ar = d.autoReview ?? {}
  const mr = d.manualReview ?? {}
  return {
    id: d.id, name: b.name, reportType: b.reportType, scope: b.scope ?? [], status: b.status,
    isDefault: b.isDefault ?? false, description: b.description ?? '', version: b.version ?? 'V1.0',
    lastEditor: b.lastEditor ?? 'admin', lastEditTime: b.lastEditTime ?? '',
    // 兼容旧文件：autoReview.sections / manualReview.sections 里的遗留分段一并并入（拍平后按 order 排序）
    sections: [...(c.sections ?? []), ...(ar.sections ?? []), ...(mr.sections ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    scoreBlock: ar.scoreBlock, flowBlock: mr.flowBlock,
    showOpLog: b.showOpLog ?? true, showSectionTotals: b.showSectionTotals ?? true,
    scoreDisplay: ar.scoreDisplay, scoreFormula: ar.scoreFormula, specialRules: ar.specialRules,
    businessFlow: mr.businessFlow,
    theme: d.theme, export: d.export, changeLogs: d.changeLogs, demoApplicant: d.demoApplicant,
  } as unknown as ReportTemplate
}

/* ---------- 本地文件持久化（通过 Vite 插件代理写入 templateSeed.json）---------- */
let saveTimer: ReturnType<typeof setTimeout> | null = null
/* 保存状态通知：saved=成功 / error=失败（供页面显示 toast，5 秒后由页面自行消失） */
let saveNotifier: ((s: 'saved' | 'error', msg?: string) => void) | null = null
export function subscribeSaveStatus(cb: (s: 'saved' | 'error', msg?: string) => void): () => void {
  saveNotifier = cb
  return () => { if (saveNotifier === cb) saveNotifier = null }
}
function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    fetch('/api/save-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(seedReportTemplates.map(convertToDisk)),
    }).then((r) => {
      if (r.ok) saveNotifier?.('saved', '模板已保存到本地')
      else { console.error('[templateStore] 保存失败:', r.status, r.statusText); saveNotifier?.('error', `保存失败（HTTP ${r.status}）`) }
    }).catch((e) => {
      console.error('[templateStore] 保存异常（dev server 未重启？POST /api/save-templates 404 → 磁盘不更新）:', e)
      saveNotifier?.('error', '保存失败，请确认 dev server 已重启（POST /api/save-templates）')
    })
  }, 300)
}

// 启动时尝试加载已保存的文件
;(async () => {
  try {
    const saved = await fetch('/api/load-templates').then(r => r.ok ? r.json() : null).catch(() => null)
    if (saved && Array.isArray(saved) && saved.length > 0) {
      seedReportTemplates.length = 0
      seedReportTemplates.push(...saved.map(convertFromDisk))
    }
  } catch { /* 首次启动无文件时用代码 seed */ }
})()

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
