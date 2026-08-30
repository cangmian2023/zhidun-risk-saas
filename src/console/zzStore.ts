// 催贷管理子系统 · 统一数据层（跨页面共享 + 本地 JSON 持久化）
// 数据流：启动从磁盘读取 → 缺失则用打包常量作 SEED（并立即占位，避免并发写入丢数据）
//        → 任何页面的改动都写回本地 JSON，其他页面即时可见，刷新不丢
// 端点：/api/load-mid?file= 与 /api/save-mid?file=（文件名必须在 vite.config.js 的 ALLOWED_FILES 白名单内）
import { useEffect, useSyncExternalStore } from 'react'

const cache: Record<string, any[]> = {}
let version = 0
const listeners = new Set<() => void>()
const loading = new Set<string>()

function notify() { version += 1; listeners.forEach((l) => l()) }
function subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l) } }
function getVersion() { return version }

async function ensureLoaded(file: string, seed: any[]) {
  if (file in cache) return
  // 先用 SEED 占位：保证磁盘还没读回来时的写入不会基于空数组而丢数据
  cache[file] = seed
  notify()
  if (loading.has(file)) return
  loading.add(file)
  try {
    const r = await fetch(`/api/load-mid?file=${encodeURIComponent(file)}`)
    if (r.ok) {
      const data = await r.json()
      if (Array.isArray(data) && data.length) { cache[file] = data; notify(); return }
    }
  } catch { /* 忽略，保持 SEED */ }
  if (!(file in cache)) { cache[file] = seed; notify() }
}

/** 读取一份共享列表数据；未落盘时回落到 seed（打包常量） */
export function useZzList<T = any>(file: string, seed: T[]): T[] {
  useSyncExternalStore(subscribe, getVersion)
  useEffect(() => { ensureLoaded(file, seed as any[]) }, [file])
  return (cache[file] ?? seed) as T[]
}

/** 修改一份共享列表数据：改内存 + 通知所有页面 + 落盘 */
export function updateZzList<T = any>(file: string, fn: (rows: T[]) => T[]) {
  const next = fn((cache[file] ?? []) as T[])
  cache[file] = next as any[]
  notify()
  fetch(`/api/save-mid?file=${encodeURIComponent(file)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next),
  }).catch(() => {})
}

/** 催贷持久化文件清单（新增文件需同步加入 vite.config.js 的 ALLOWED_FILES 白名单） */
export const ZZ_FILE = {
  cases: 'zzCases.json',       // 案件（案件管理 / 坐席工作台 / 委外 / 法务 共用）
  ptp: 'zzPtp.json',           // 还款承诺 PTP
  waivers: 'zzWaivers.json',   // 减免审批单
  logs: 'zzLogs.json',         // 操作日志（全局）
  qa: 'zzQa.json',             // 通话质检记录（含整改状态）
  entrusts: 'zzEntrusts.json', // 委外委托
  visits: 'zzVisits.json',     // 外访任务
  legal: 'zzLegal.json',       // 法务案件
  aiTasks: 'zzAiTasks.json',   // AI 外呼任务
  policy: 'zzPolicy.json',     // 合规管控配置（禁呼时段 / 每日最大呼叫次数），策略画布配、外呼侧执行
  words: 'zzWords.json',       // 敏感词库：词库页维护，质检命中判定实时读取
  visitors: 'zzVisitors.json', // 外访人员档案：人员管理页维护，外访分配下拉实时读取（停用不可派）
  sms: 'zzSms.json',           // 短信模板：模板库维护，含审核状态流转（未过审不可启用）
  settle: 'zzSettle.json',     // 佣金结算账单：结算页确认结算 / 应用费率后即时生效
  flows: 'zzFlows.json',       // 策略画布当前内容（节点/连线），支持回滚还原
  strategyVer: 'zzStrategyVer.json', // 策略版本记录（保存即产生版本，含画布快照）
  exec: 'zzExec.json',         // 策略执行记录：发布后生成，执行监控读真实命中
} as const

/** 合规管控默认配置（策略画布未配置时的回落值） */
export const DEFAULT_POLICY = { callWindow: '22:00-08:00 禁止外呼', maxCall: 2 }

/** 读取合规管控配置：禁呼时段 + 单客户每日最大呼叫次数 */
export function useCompliancePolicy() {
  const rows = useZzList<any>(ZZ_FILE.policy, [DEFAULT_POLICY])
  const p = rows[0] ?? DEFAULT_POLICY
  return { banWindow: String(p.callWindow ?? DEFAULT_POLICY.callWindow), maxCall: Number(p.maxCall ?? DEFAULT_POLICY.maxCall) }
}

/** 判断当前小时是否落在禁呼时段内（支持跨零点，如 22:00-08:00） */
export function inBanWindow(hour: number, banWindow: string) {
  const m = banWindow.match(/(\d{1,2}):\d{2}\s*-\s*(\d{1,2}):\d{2}/)
  const from = m ? Number(m[1]) : 22
  const to = m ? Number(m[2]) : 8
  return from > to ? (hour >= from || hour < to) : (hour >= from && hour < to)
}
