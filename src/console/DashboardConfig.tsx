/* ============================================================
 * 管理中心-公共配置-数据看板配置
 * 贷中监控下的页面均为数据看板，本页对看板页面进行统一管理：
 * - 页面增删改查、启用/停用、恢复默认
 * - 页面位置（子系统/分区/菜单分组/排序）
 * - 展示数据（数据集选择）与数据可视化（组件类型/宽度/顺序）配置
 * ========================================================== */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader, Panel, Button, Badge, StatusTag, Modal } from '../components/ui'
import {
  DATASETS,
  WIDGET_TYPE_META,
  loadDashboards,
  saveDashboards,
  resetDashboards,
  datasetById,
  type DashboardPage,
  type DashWidget,
  type WidgetType,
} from './dashboardData'

const inp: React.CSSProperties = {
  height: 34,
  padding: '0 10px',
  borderRadius: 8,
  border: '1px solid #E5E7EB',
  fontSize: 13,
  color: '#111827',
  outline: 'none',
  background: '#fff',
}

const WIDGET_TYPES = Object.keys(WIDGET_TYPE_META) as WidgetType[]

let seq = 1
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${seq++}`

export default function DashboardConfig() {
  const nav = useNavigate()
  const [pages, setPages] = useState<DashboardPage[]>(() => loadDashboards())
  const [editing, setEditing] = useState<DashboardPage | null>(null) // 正在编辑的副本
  const [isNew, setIsNew] = useState(false)
  const [confirmDel, setConfirmDel] = useState<DashboardPage | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2000)
  }

  const persist = (next: DashboardPage[]) => {
    setPages(next)
    saveDashboards(next)
  }

  const groups = useMemo(() => {
    const set = new Set(pages.filter((p) => p.section === '贷中监控').map((p) => p.group))
    return Array.from(set)
  }, [pages])

  /* ---------- 操作 ---------- */
  const openNew = () => {
    const id = uid('db-custom')
    setEditing({
      id,
      key: `cr:mid-${id}`,
      name: '',
      sub: 'cr',
      section: '贷中监控',
      group: groups[0] ?? '客群风险',
      order: 99,
      enabled: true,
      desc: '',
      widgets: [],
      updatedAt: '',
    })
    setIsNew(true)
  }

  const openEdit = (p: DashboardPage) => {
    setEditing(JSON.parse(JSON.stringify(p)) as DashboardPage)
    setIsNew(false)
  }

  const toggleEnabled = (p: DashboardPage) => {
    persist(pages.map((x) => (x.id === p.id ? { ...x, enabled: !x.enabled, updatedAt: nowStr() } : x)))
    showToast(p.enabled ? `已停用「${p.name}」，该页面将从菜单隐藏` : `已启用「${p.name}」`)
  }

  const doDelete = () => {
    if (!confirmDel) return
    persist(pages.filter((x) => x.id !== confirmDel.id))
    showToast(`已删除「${confirmDel.name}」`)
    setConfirmDel(null)
  }

  const doReset = () => {
    persist(resetDashboards())
    showToast('已恢复默认看板配置')
  }

  const saveEditing = () => {
    if (!editing) return
    if (!editing.name.trim()) {
      alert('看板名称为必填项，请先填写')
      return
    }
    if (editing.widgets.length === 0) {
      alert('请至少添加一个展示组件')
      return
    }
    for (const w of editing.widgets) {
      if (!w.datasetId) {
        alert(`组件「${w.title || WIDGET_TYPE_META[w.type].label}」尚未选择数据集`)
        return
      }
    }
    const next = editing.updatedAt === '' || isNew
      ? [...pages, { ...editing, updatedAt: nowStr() }]
      : pages.map((x) => (x.id === editing.id ? { ...editing, updatedAt: nowStr() } : x))
    persist(next)
    setEditing(null)
    showToast(isNew ? '看板页面已创建' : '看板配置已保存')
  }

  const previewPath = (p: DashboardPage) => `/console/${p.sub}/${p.key.split(':')[1]}`

  /* ---------- 渲染 ---------- */
  return (
    <div className="space-y-6">
      <PageHeader
        title="数据看板配置"
        crumb="管理中心 / 公共配置"
        subtitle="统一管理贷中监控下的数据看板页面：增删改查、页面位置、展示数据与可视化配置。"
        actions={
          <>
            <Button variant="secondary" onClick={doReset}>恢复默认配置</Button>
            <Button onClick={openNew}>+ 新增看板页面</Button>
          </>
        }
      />

      <Panel
        title="看板页面列表"
        desc="停用的页面会同步从左侧菜单隐藏；「预览」直接跳转至实际展示页。"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ tableLayout: 'auto' }}>
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                <th className="px-3 py-2.5 font-medium">看板名称</th>
                <th className="px-3 py-2.5 font-medium">页面标识</th>
                <th className="px-3 py-2.5 font-medium">页面位置</th>
                <th className="px-3 py-2.5 font-medium">组件数</th>
                <th className="px-3 py-2.5 font-medium">来源</th>
                <th className="px-3 py-2.5 font-medium">状态</th>
                <th className="px-3 py-2.5 font-medium">更新时间</th>
                <th className="px-3 py-2.5 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                  <td className="px-3 py-3 font-medium text-ink-900">{p.name}</td>
                  <td className="px-3 py-3 text-slate-500">{p.key}</td>
                  <td className="px-3 py-3 text-slate-600">
                    零售信贷风控 · {p.section} · {p.group}
                    <span className="ml-1 text-xs text-slate-400">#{p.order}</span>
                  </td>
                  <td className="px-3 py-3 tabular-nums text-slate-600">{p.widgets.length}</td>
                  <td className="px-3 py-3">
                    <Badge kind={p.builtin ? 'blue' : 'violet'}>{p.builtin ? '内置' : '自建'}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    <StatusTag kind={p.enabled ? 'green' : 'gray'}>{p.enabled ? '已启用' : '已停用'}</StatusTag>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-400">{p.updatedAt}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <button className="rounded-md px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50" onClick={() => openEdit(p)}>编辑</button>
                      <button className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100" onClick={() => nav(previewPath(p))}>预览</button>
                      <button className="rounded-md px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50" onClick={() => toggleEnabled(p)}>
                        {p.enabled ? '停用' : '启用'}
                      </button>
                      <button className="rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50" onClick={() => setConfirmDel(p)}>删除</button>
                    </div>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-10 text-center text-sm text-slate-400">
                    暂无看板页面，点击右上角「新增看板页面」创建，或「恢复默认配置」。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="内置数据集" desc="看板组件从以下数据集中选取展示数据（模拟指标集市，实际环境对接数仓 / 指标平台）。">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DATASETS.map((d) => (
            <div key={d.id} className="rounded-xl border border-slate-100 px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-ink-900">{d.name}</p>
                <Badge kind={d.kind === 'metrics' ? 'blue' : d.kind === 'series' ? 'cyan' : d.kind === 'donut' ? 'violet' : 'gray'}>
                  {d.kind === 'metrics' ? '指标' : d.kind === 'series' ? '序列' : d.kind === 'donut' ? '占比' : '明细表'}
                </Badge>
              </div>
              <p className="mt-1 truncate text-xs text-slate-400">{d.desc ?? d.id}</p>
            </div>
          ))}
        </div>
      </Panel>

      {/* 编辑弹窗 */}
      {editing && (
        <EditModal
          page={editing}
          isNew={isNew}
          groups={groups}
          onChange={setEditing}
          onCancel={() => setEditing(null)}
          onSave={saveEditing}
        />
      )}

      {/* 删除确认 */}
      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} title="删除看板页面">
        {confirmDel && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              确认删除看板「<span className="font-medium text-ink-900">{confirmDel.name}</span>」？
              删除后该页面将从左侧菜单移除{confirmDel.builtin ? '，内置看板可通过「恢复默认配置」找回' : '，自建看板删除后不可恢复'}。
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmDel(null)}>取消</Button>
              <Button className="!bg-rose-600 hover:!bg-rose-700" onClick={doDelete}>确认删除</Button>
            </div>
          </div>
        )}
      </Modal>

      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-ink-900 px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}

function nowStr() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

/* ============================================================
 * 编辑弹窗：基本信息 + 页面位置 + 组件配置
 * ========================================================== */
function EditModal({
  page,
  isNew,
  groups,
  onChange,
  onCancel,
  onSave,
}: {
  page: DashboardPage
  isNew: boolean
  groups: string[]
  onChange: (p: DashboardPage) => void
  onCancel: () => void
  onSave: () => void
}) {
  const set = (patch: Partial<DashboardPage>) => onChange({ ...page, ...patch })

  const setWidget = (idx: number, patch: Partial<DashWidget>) => {
    const widgets = page.widgets.map((w, i) => (i === idx ? { ...w, ...patch } : w))
    set({ widgets })
  }
  const addWidget = () => {
    set({ widgets: [...page.widgets, { id: uid('w'), type: 'line', title: '', datasetId: '', span: 1 }] })
  }
  const removeWidget = (idx: number) => {
    set({ widgets: page.widgets.filter((_, i) => i !== idx) })
  }
  const moveWidget = (idx: number, dir: -1 | 1) => {
    const j = idx + dir
    if (j < 0 || j >= page.widgets.length) return
    const widgets = [...page.widgets]
    ;[widgets[idx], widgets[j]] = [widgets[j], widgets[idx]]
    set({ widgets })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <div
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-base font-semibold text-ink-900">{isNew ? '新增看板页面' : `编辑看板 · ${page.name || '未命名'}`}</h3>
          <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" onClick={onCancel}>✕</button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {/* 基本信息 */}
          <section>
            <h4 className="mb-3 text-sm font-semibold text-ink-900">基本信息</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs text-slate-500">
                看板名称<span className="text-rose-600">*</span>
                <input
                  style={{ ...inp, width: '100%', marginTop: 6, borderColor: page.name.trim() ? undefined : '#DC2626' }}
                  value={page.name}
                  placeholder="输入看板名称（必填），将作为菜单名与页面标题"
                  onChange={(e) => set({ name: e.target.value })}
                />
              </label>
              <label className="block text-xs text-slate-500">
                页面标识（路由 key，自动生成）
                <input style={{ ...inp, width: '100%', marginTop: 6, background: '#F9FAFB', color: '#9CA3AF' }} value={page.key} readOnly />
              </label>
              <label className="block text-xs text-slate-500 sm:col-span-2">
                页面描述
                <input
                  style={{ ...inp, width: '100%', marginTop: 6 }}
                  value={page.desc ?? ''}
                  placeholder="展示在页面标题下方的说明文字"
                  onChange={(e) => set({ desc: e.target.value })}
                />
              </label>
            </div>
          </section>

          {/* 页面位置 */}
          <section>
            <h4 className="mb-3 text-sm font-semibold text-ink-900">页面位置</h4>
            <div className="grid gap-4 sm:grid-cols-4">
              <label className="block text-xs text-slate-500">
                子系统
                <input style={{ ...inp, width: '100%', marginTop: 6, background: '#F9FAFB', color: '#9CA3AF' }} value="零售信贷风控" readOnly />
              </label>
              <label className="block text-xs text-slate-500">
                菜单分区
                <input style={{ ...inp, width: '100%', marginTop: 6, background: '#F9FAFB', color: '#9CA3AF' }} value={page.section} readOnly />
              </label>
              <label className="block text-xs text-slate-500">
                菜单分组
                <input
                  style={{ ...inp, width: '100%', marginTop: 6 }}
                  value={page.group}
                  list="dash-group-options"
                  placeholder="选择已有分组或输入新分组名"
                  onChange={(e) => set({ group: e.target.value })}
                />
                <datalist id="dash-group-options">
                  {groups.map((g) => (
                    <option key={g} value={g} />
                  ))}
                </datalist>
              </label>
              <label className="block text-xs text-slate-500">
                分组内排序
                <input
                  type="number"
                  style={{ ...inp, width: '100%', marginTop: 6 }}
                  value={page.order}
                  onChange={(e) => set({ order: Number(e.target.value) || 0 })}
                />
              </label>
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={page.enabled} onChange={(e) => set({ enabled: e.target.checked })} />
              启用该看板页面（停用后从左侧菜单隐藏）
            </label>
          </section>

          {/* 组件配置 */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-ink-900">展示组件（按顺序渲染）</h4>
              <Button variant="secondary" onClick={addWidget}>+ 添加组件</Button>
            </div>
            {page.widgets.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
                尚未添加组件，点击「添加组件」配置指标卡、图表或数据表。
              </div>
            )}
            <div className="space-y-3">
              {page.widgets.map((w, i) => {
                const meta = WIDGET_TYPE_META[w.type]
                const compatible = DATASETS.filter((d) => d.kind === meta.kind)
                const ds = datasetById(w.datasetId)
                return (
                  <div key={w.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                    <div className="flex flex-wrap items-end gap-3">
                      <span className="pb-2 text-xs font-semibold text-slate-400">#{i + 1}</span>
                      <label className="block text-xs text-slate-500">
                        组件类型
                        <select
                          style={{ ...inp, width: 120, marginTop: 6 }}
                          value={w.type}
                          onChange={(e) => {
                            const t = e.target.value as WidgetType
                            // 类型切换后，若原数据集不兼容则清空
                            const stillOk = DATASETS.some((d) => d.id === w.datasetId && d.kind === WIDGET_TYPE_META[t].kind)
                            setWidget(i, { type: t, datasetId: stillOk ? w.datasetId : '' })
                          }}
                        >
                          {WIDGET_TYPES.map((t) => (
                            <option key={t} value={t}>{WIDGET_TYPE_META[t].label}</option>
                          ))}
                        </select>
                      </label>
                      <label className="block text-xs text-slate-500">
                        组件标题
                        <input
                          style={{ ...inp, width: 200, marginTop: 6 }}
                          value={w.title}
                          placeholder={ds?.name ?? '如：近14日预警趋势'}
                          onChange={(e) => setWidget(i, { title: e.target.value })}
                        />
                      </label>
                      <label className="block text-xs text-slate-500">
                        数据集<span className="text-rose-600">*</span>
                        <select
                          style={{ ...inp, width: 220, marginTop: 6, borderColor: w.datasetId ? undefined : '#DC2626' }}
                          value={w.datasetId}
                          onChange={(e) => {
                            const nd = datasetById(e.target.value)
                            setWidget(i, { datasetId: e.target.value, title: w.title || nd?.name || '' })
                          }}
                        >
                          <option value="">请选择数据集</option>
                          {compatible.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </label>
                      {(w.type === 'line' || w.type === 'bar' || w.type === 'donut') && (
                        <label className="block text-xs text-slate-500">
                          宽度
                          <select
                            style={{ ...inp, width: 90, marginTop: 6 }}
                            value={String(w.span ?? 1)}
                            onChange={(e) => setWidget(i, { span: Number(e.target.value) === 2 ? 2 : 1 })}
                          >
                            <option value="1">半宽</option>
                            <option value="2">全宽</option>
                          </select>
                        </label>
                      )}
                      <div className="ml-auto flex items-center gap-1 pb-1">
                        <button className="rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-200 disabled:opacity-30" disabled={i === 0} onClick={() => moveWidget(i, -1)}>上移</button>
                        <button className="rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-200 disabled:opacity-30" disabled={i === page.widgets.length - 1} onClick={() => moveWidget(i, 1)}>下移</button>
                        <button className="rounded-md px-2 py-1 text-xs text-rose-600 hover:bg-rose-50" onClick={() => removeWidget(i)}>删除</button>
                      </div>
                    </div>
                    {ds?.desc && <p className="mt-2 pl-7 text-xs text-slate-400">数据说明：{ds.desc}</p>}
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <Button variant="ghost" onClick={onCancel}>取消</Button>
          <Button onClick={onSave}>{isNew ? '创建看板' : '保存配置'}</Button>
        </div>
      </div>
    </div>
  )
}
