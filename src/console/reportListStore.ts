// 报告模块列表数据持久化（与 midStore 同一套路）
// 数据流：启动从磁盘 {saveFile} 读取 → 缺失则用打包 JSON 作 SEED（不强制落盘，文件本就随 import 存在）
//        → 编辑（审核流转）经 updateReportRows 写回本地 JSON（/api/save-list）
// 这样「审核操作」在 dev 与生产构建下都能真正落到本地 JSON、刷新不丢，且列表页/详情页共用同一份缓存保持一致。
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
  if (loading.has(file)) return
  loading.add(file)
  try {
    const r = await fetch(`/api/load-list?file=${encodeURIComponent(file)}`)
    if (r.ok) {
      const data = await r.json()
      // 二次校验：若异步期间审核已写盘（cache 已更新），不覆盖为旧磁盘数据
      if (Array.isArray(data) && data.length && !(file in cache)) { cache[file] = data; notify(); return }
    }
  } catch { /* 忽略，回落 SEED */ }
  if (!(file in cache)) { cache[file] = seed; notify() }
}

export function useReportRows(file: string, seed: any[]): any[] {
  useSyncExternalStore(subscribe, getVersion)
  useEffect(() => { ensureLoaded(file, seed) }, [file])
  return cache[file] ?? seed
}

export function updateReportRows(file: string, fn: (rows: any[]) => any[]) {
  const next = fn(cache[file] ?? [])
  cache[file] = next
  notify()
  fetch(`/api/save-list?file=${encodeURIComponent(file)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next),
  }).catch(() => {})
}
