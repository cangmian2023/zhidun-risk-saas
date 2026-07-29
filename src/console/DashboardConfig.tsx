/* ============================================================
 * 管理中心-公共配置-数据看板配置
 * ------------------------------------------------------------
 * 两个一级区域：
 *  1) 看板页面：对贷中监控下的数据看板页面增删改查、启停、页面位置。
 *     每个页面的组件用「神策式」构建器配置：选数据集 → 选维度/度量(计算)
 *     → 加筛选 → 选图表类型。
 *  2) 数据集：数据看板的数据来源（内置指标集市 + 用户注册的 接口/SQL）。
 *     解决“内置数据集该放在哪”的问题——它是所有看板组件的底座，
 *     在此集中管理、查看字段与样例，并可注册自有数据源。
 * ========================================================== */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader, Panel, Button, Badge, StatusTag, Modal } from '../components/ui'
import {
  loadDashboards,
  saveDashboards,
  resetDashboards,
  loadDatasets,
  saveUserDatasets,
  AGG_META,
  OP_META,
  WIDGET_META,
  newId,
  type DashboardPage,
  type DashWidget,
  type WidgetType,
  type WidgetMeasure,
  type WidgetFilter,
  type Dataset,
  type DatasetField,
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
const sel: React.CSSProperties = { ...inp, paddingRight: 24 }

const WIDGET_TYPES = Object.keys(WIDGET_META) as WidgetType[]

function nowStr() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

/* 新建组件时的合理默认：取第一个度量 + 第一个维度 */
function defaultWidget(type: WidgetType, ds: Dataset): DashWidget {
  const measures = ds.fields.filter((f) => f.kind === 'measure')
  const dims = ds.fields.filter((f) => f.kind === 'dim')
  const firstMeasure = measures[0]
  return {
    id: newId('w'),
    type,
    title: ds.name,
    datasetId: ds.id,
    dimensions: type === 'metric' ? [] : dims[0] ? [dims[0].key] : [],
    measures: firstMeasure ? [{ id: newId('m'), field: firstMeasure.key, agg: firstMeasure.type === 'number' ? 'sum' : 'count' }] : [],
    filters: [],
    span: type === 'metric' || type === 'table' ? 2 : 1,
  }
}

export default function DashboardConfig() {
  const nav = useNavigate()
  const [tab, setTab] = useState<'pages' | 'datasets'>('pages')
  const [pages, setPages] = useState<DashboardPage[]>(() => loadDashboards())
  const [datasets, setDatasets] = useState<Dataset[]>(() => loadDatasets())
  const [editing, setEditing] = useState<DashboardPage | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [confirmDel, setConfirmDel] = useState<DashboardPage | null>(null)
  const [datasetModal, setDatasetModal] = useState(false)
  const [delDataset, setDelDataset] = useState<Dataset | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2000)
  }
  const persistPages = (next: DashboardPage[]) => {
    setPages(next)
    saveDashboards(next)
  }
  const persistDatasets = (all: Dataset[]) => {
    setDatasets(all)
    const user = all.filter((d) => d.source !== 'builtin')
    saveUserDatasets(user)
  }

  const groups = useMemo(() => {
    const set = new Set(pages.filter((p) => p.section === '贷中监控').map((p) => p.group))
    return Array.from(set)
  }, [pages])

  /* ---------- 看板页面操作 ---------- */
  const openNew = () => {
    const id = newId('db-custom')
    setEditing({
      id, key: `cr:mid-${id}`, name: '', sub: 'cr', section: '贷中监控',
      group: groups[0] ?? '客群风险', order: 99, enabled: true, desc: '', widgets: [], updatedAt: '',
    })
    setIsNew(true)
  }
  const openEdit = (p: DashboardPage) => {
    setEditing(JSON.parse(JSON.stringify(p)) as DashboardPage)
    setIsNew(false)
  }
  const toggleEnabled = (p: DashboardPage) => {
    persistPages(pages.map((x) => (x.id === p.id ? { ...x, enabled: !x.enabled, updatedAt: nowStr() } : x)))
    showToast(p.enabled ? `已停用「${p.name}」，该页面将从菜单隐藏` : `已启用「${p.name}」`)
  }
  const doDelete = () => {
    if (!confirmDel) return
    persistPages(pages.filter((x) => x.id !== confirmDel.id))
    showToast(`已删除「${confirmDel.name}」`)
    setConfirmDel(null)
  }
  const doReset = () => {
    persistPages(resetDashboards())
    showToast('已恢复默认看板配置')
  }
  const saveEditing = () => {
    if (!editing) return
    if (!editing.name.trim()) { alert('看板名称为必填项，请先填写'); return }
    if (editing.widgets.length === 0) { alert('请至少添加一个展示组件'); return }
    for (const w of editing.widgets) {
      if (!w.datasetId) { alert(`组件「${w.title || WIDGET_META[w.type].label}」尚未选择数据集`); return }
      if ((w.type === 'line' || w.type === 'bar' || w.type === 'donut') && (!w.dimensions.length || !w.measures.length)) {
        alert(`图表组件「${w.title || WIDGET_META[w.type].label}」需配置维度字段与度量字段`); return
      }
      if ((w.type === 'metric' || w.type === 'table') && w.type === 'metric' && !w.measures.length) {
        alert(`指标卡组件「${w.title}」需至少配置一个度量字段`); return
      }
    }
    const next = editing.updatedAt === '' || isNew
      ? [...pages, { ...editing, updatedAt: nowStr() }]
      : pages.map((x) => (x.id === editing.id ? { ...editing, updatedAt: nowStr() } : x))
    persistPages(next)
    setEditing(null)
    showToast(isNew ? '看板页面已创建' : '看板配置已保存')
  }
  const previewPath = (p: DashboardPage) => `/console/${p.sub}/${p.key.split(':')[1]}`

  /* ---------- 数据集操作 ---------- */
  const addDataset = (ds: Dataset) => {
    persistDatasets([...datasets, ds])
    showToast(`已新增数据集「${ds.name}」`)
    setDatasetModal(false)
  }
  const deleteDataset = () => {
    if (!delDataset) return
    persistDatasets(datasets.filter((d) => d.id !== delDataset.id))
    showToast(`已删除数据集「${delDataset.name}」`)
    setDelDataset(null)
  }

  /* ---------- 渲染 ---------- */
  return (
    <div className="space-y-6">
      <PageHeader
        title="数据看板配置"
        crumb="管理中心 / 公共配置"
        subtitle="统一管理贷中监控下的数据看板：页面增删改查、数据集来源、组件的数据与可视化配置。"
        actions={
          tab === 'pages' ? (
            <>
              <Button variant="secondary" onClick={doReset}>恢复默认配置</Button>
              <Button onClick={openNew}>+ 新增看板页面</Button>
            </>
          ) : (
            <Button onClick={() => setDatasetModal(true)}>+ 注册数据集（接口/SQL）</Button>
          )
        }
      />

      {/* 一级区域切换 */}
      <div className="inline-flex rounded-xl bg-slate-100 p-1 text-sm">
        <button
          className={`rounded-lg px-4 py-1.5 font-medium transition ${tab === 'pages' ? 'bg-white text-ink-900 shadow-sm' : 'text-slate-500'}`}
          onClick={() => setTab('pages')}
        >看板页面</button>
        <button
          className={`rounded-lg px-4 py-1.5 font-medium transition ${tab === 'datasets' ? 'bg-white text-ink-900 shadow-sm' : 'text-slate-500'}`}
          onClick={() => setTab('datasets')}
        >数据集</button>
      </div>

      {tab === 'pages' ? (
        <Panel title="看板页面列表" desc="停用的页面会同步从左侧菜单隐藏；「预览」直接跳转至实际展示页。">
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
                    <td className="px-3 py-3"><Badge kind={p.builtin ? 'blue' : 'violet'}>{p.builtin ? '内置' : '自建'}</Badge></td>
                    <td className="px-3 py-3"><StatusTag kind={p.enabled ? 'green' : 'gray'}>{p.enabled ? '已启用' : '已停用'}</StatusTag></td>
                    <td className="px-3 py-3 text-xs text-slate-400">{p.updatedAt}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button className="rounded-md px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50" onClick={() => openEdit(p)}>编辑</button>
                        <button className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100" onClick={() => nav(previewPath(p))}>预览</button>
                        <button className="rounded-md px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50" onClick={() => toggleEnabled(p)}>{p.enabled ? '停用' : '启用'}</button>
                        <button className="rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50" onClick={() => setConfirmDel(p)}>删除</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pages.length === 0 && (
                  <tr><td colSpan={8} className="px-3 py-10 text-center text-sm text-slate-400">暂无看板页面，点击右上角「新增看板页面」创建。</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : (
        <Panel title="数据集（看板的数据来源）" desc="看板组件从此处选取数据集，再选字段、做计算、加筛选。内置数据集模拟指标集市；用户可注册接口(API)/SQL 数据源。">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {datasets.map((d) => {
              const dims = d.fields.filter((f) => f.kind === 'dim')
              const meas = d.fields.filter((f) => f.kind === 'measure')
              const builtin = d.source === 'builtin'
              return (
                <div key={d.id} className="flex flex-col rounded-xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-ink-900">{d.name}</p>
                    <Badge kind={builtin ? 'blue' : 'violet'}>{builtin ? '内置' : d.source === 'api' ? '接口' : 'SQL'}</Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-400">{d.desc ?? d.id}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">维度 {dims.length}</span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">度量 {meas.length}</span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">明细 {d.rows.length} 行</span>
                  </div>
                  <details className="mt-3 group">
                    <summary className="cursor-pointer text-xs font-medium text-brand-700">查看字段</summary>
                    <div className="mt-2 space-y-2">
                      <div>
                        <p className="mb-1 text-[11px] font-semibold text-slate-400">维度</p>
                        <div className="flex flex-wrap gap-1">
                          {dims.map((f) => <span key={f.key} className="rounded bg-brand-50 px-1.5 py-0.5 text-[11px] text-brand-700">{f.label}</span>)}
                        </div>
                      </div>
                      <div>
                        <p className="mb-1 text-[11px] font-semibold text-slate-400">度量</p>
                        <div className="flex flex-wrap gap-1">
                          {meas.map((f) => <span key={f.key} className="rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] text-emerald-700">{f.label}{f.unit ? `(${f.unit})` : ''}</span>)}
                        </div>
                      </div>
                    </div>
                  </details>
                  {!builtin && (
                    <button className="mt-3 self-start rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50" onClick={() => setDelDataset(d)}>删除数据集</button>
                  )}
                </div>
              )
            })}
          </div>
        </Panel>
      )}

      {/* 编辑弹窗（看板页面 + 神策式组件构建器） */}
      {editing && (
        <EditModal
          page={editing}
          isNew={isNew}
          groups={groups}
          datasets={datasets}
          onChange={setEditing}
          onCancel={() => setEditing(null)}
          onSave={saveEditing}
        />
      )}

      {/* 新增数据集弹窗 */}
      {datasetModal && (
        <DatasetModal onCancel={() => setDatasetModal(false)} onSave={addDataset} />
      )}

      {/* 看板删除确认 */}
      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} title="删除看板页面">
        {confirmDel && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              确认删除看板「<span className="font-medium text-ink-900">{confirmDel.name}</span>」？删除后该页面将从左侧菜单移除
              {confirmDel.builtin ? '，内置看板可通过「恢复默认配置」找回' : '，自建看板删除后不可恢复'}。
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmDel(null)}>取消</Button>
              <Button className="!bg-rose-600 hover:!bg-rose-700" onClick={doDelete}>确认删除</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 数据集删除确认 */}
      <Modal open={!!delDataset} onClose={() => setDelDataset(null)} title="删除数据集">
        {delDataset && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              确认删除自建数据集「<span className="font-medium text-ink-900">{delDataset.name}</span>」？引用它的看板组件将变为「数据集不存在」。
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDelDataset(null)}>取消</Button>
              <Button className="!bg-rose-600 hover:!bg-rose-700" onClick={deleteDataset}>确认删除</Button>
            </div>
          </div>
        )}
      </Modal>

      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-ink-900 px-4 py-2.5 text-sm text-white shadow-lg">{toast}</div>
      )}
    </div>
  )
}

/* ============================================================
 * 编辑弹窗：基本信息 + 页面位置 + 组件构建器
 * ========================================================== */
function EditModal({
  page, isNew, groups, datasets, onChange, onCancel, onSave,
}: {
  page: DashboardPage
  isNew: boolean
  groups: string[]
  datasets: Dataset[]
  onChange: (p: DashboardPage) => void
  onCancel: () => void
  onSave: () => void
}) {
  const set = (patch: Partial<DashboardPage>) => onChange({ ...page, ...patch })
  const setWidget = (idx: number, patch: Partial<DashWidget>) => {
    set({ widgets: page.widgets.map((w, i) => (i === idx ? { ...w, ...patch } : w)) })
  }
  const addWidget = () => {
    const ds = datasets[0]
    set({ widgets: [...page.widgets, ds ? defaultWidget('line', ds) : { id: newId('w'), type: 'line', title: '', datasetId: '', dimensions: [], measures: [], filters: [], span: 1 }] })
  }
  const removeWidget = (idx: number) => set({ widgets: page.widgets.filter((_, i) => i !== idx) })
  const moveWidget = (idx: number, dir: -1 | 1) => {
    const j = idx + dir
    if (j < 0 || j >= page.widgets.length) return
    const widgets = [...page.widgets]
    ;[widgets[idx], widgets[j]] = [widgets[j], widgets[idx]]
    set({ widgets })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
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
                <input style={{ ...inp, width: '100%', marginTop: 6, borderColor: page.name.trim() ? undefined : '#DC2626' }} value={page.name} placeholder="输入看板名称（必填），将作为菜单名与页面标题" onChange={(e) => set({ name: e.target.value })} />
              </label>
              <label className="block text-xs text-slate-500">
                页面标识（路由 key，自动生成）
                <input style={{ ...inp, width: '100%', marginTop: 6, background: '#F9FAFB', color: '#9CA3AF' }} value={page.key} readOnly />
              </label>
              <label className="block text-xs text-slate-500 sm:col-span-2">
                页面描述
                <input style={{ ...inp, width: '100%', marginTop: 6 }} value={page.desc ?? ''} placeholder="展示在页面标题下方的说明文字" onChange={(e) => set({ desc: e.target.value })} />
              </label>
            </div>
          </section>

          {/* 页面位置 */}
          <section>
            <h4 className="mb-3 text-sm font-semibold text-ink-900">页面位置</h4>
            <div className="grid gap-4 sm:grid-cols-4">
              <label className="block text-xs text-slate-500">子系统<input style={{ ...inp, width: '100%', marginTop: 6, background: '#F9FAFB', color: '#9CA3AF' }} value="零售信贷风控" readOnly /></label>
              <label className="block text-xs text-slate-500">菜单分区<input style={{ ...inp, width: '100%', marginTop: 6, background: '#F9FAFB', color: '#9CA3AF' }} value={page.section} readOnly /></label>
              <label className="block text-xs text-slate-500">
                菜单分组
                <input style={{ ...inp, width: '100%', marginTop: 6 }} value={page.group} list="dash-group-options" placeholder="选择已有分组或输入新分组名" onChange={(e) => set({ group: e.target.value })} />
                <datalist id="dash-group-options">{groups.map((g) => <option key={g} value={g} />)}</datalist>
              </label>
              <label className="block text-xs text-slate-500">
                分组内排序
                <input type="number" style={{ ...inp, width: '100%', marginTop: 6 }} value={page.order} onChange={(e) => set({ order: Number(e.target.value) || 0 })} />
              </label>
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={page.enabled} onChange={(e) => set({ enabled: e.target.checked })} />
              启用该看板页面（停用后从左侧菜单隐藏）
            </label>
          </section>

          {/* 组件构建器 */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-ink-900">展示组件（神策式：选数据集 → 选字段/计算 → 加筛选 → 选图表）</h4>
              <Button variant="secondary" onClick={addWidget}>+ 添加组件</Button>
            </div>
            {page.widgets.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">尚未添加组件，点击「添加组件」开始配置。</div>
            )}
            <div className="space-y-4">
              {page.widgets.map((w, i) => (
                <WidgetEditor
                  key={w.id}
                  widget={w}
                  index={i}
                  total={page.widgets.length}
                  datasets={datasets}
                  onChange={(patch) => setWidget(i, patch)}
                  onRemove={() => removeWidget(i)}
                  onMove={(dir) => moveWidget(i, dir)}
                />
              ))}
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

/* ============================================================
 * 单个组件编辑器（核心：数据集 → 维度/度量 → 筛选 → 图表）
 * ========================================================== */
function WidgetEditor({
  widget, index, total, datasets, onChange, onRemove, onMove,
}: {
  widget: DashWidget
  index: number
  total: number
  datasets: Dataset[]
  onChange: (patch: Partial<DashWidget>) => void
  onRemove: () => void
  onMove: (dir: -1 | 1) => void
}) {
  const ds = datasets.find((d) => d.id === widget.datasetId)
  const dimFields = ds?.fields.filter((f) => f.kind === 'dim') ?? []
  const measureFields = ds?.fields.filter((f) => f.kind === 'measure') ?? []
  const allFields = ds?.fields ?? []

  const toggleDim = (key: string) => {
    const has = widget.dimensions.includes(key)
    onChange({ dimensions: has ? widget.dimensions.filter((k) => k !== key) : [...widget.dimensions, key] })
  }
  const setMeasure = (idx: number, patch: Partial<WidgetMeasure>) => {
    onChange({ measures: widget.measures.map((mm, i) => (i === idx ? { ...mm, ...patch } : mm)) })
  }
  const addMeasure = () => {
    const f = measureFields[0]
    if (!f) return
    onChange({ measures: [...widget.measures, { id: newId('m'), field: f.key, agg: f.type === 'number' ? 'sum' : 'count' }] })
  }
  const removeMeasure = (idx: number) => onChange({ measures: widget.measures.filter((_, i) => i !== idx) })

  const setFilter = (idx: number, patch: Partial<WidgetFilter>) => {
    onChange({ filters: widget.filters.map((ff, i) => (i === idx ? { ...ff, ...patch } : ff)) })
  }
  const addFilter = () => {
    const f = allFields[0]
    if (!f) return
    onChange({ filters: [...widget.filters, { id: newId('f'), field: f.key, op: 'eq', value: '' }] })
  }
  const removeFilter = (idx: number) => onChange({ filters: widget.filters.filter((_, i) => i !== idx) })

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">#{index + 1}</span>
        <span className="text-xs font-semibold text-slate-500">{WIDGET_META[widget.type].label}</span>
        <span className="text-[11px] text-slate-400">{WIDGET_META[widget.type].hint}</span>
        <div className="ml-auto flex items-center gap-1">
          <button className="rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-200 disabled:opacity-30" disabled={index === 0} onClick={() => onMove(-1)}>上移</button>
          <button className="rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-200 disabled:opacity-30" disabled={index === total - 1} onClick={() => onMove(1)}>下移</button>
          <button className="rounded-md px-2 py-1 text-xs text-rose-600 hover:bg-rose-50" onClick={onRemove}>删除</button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs text-slate-500">
          图表类型
          <select style={{ ...sel, width: '100%', marginTop: 6 }} value={widget.type} onChange={(e) => onChange({ type: e.target.value as WidgetType })}>
            {WIDGET_TYPES.map((t) => <option key={t} value={t}>{WIDGET_META[t].label}</option>)}
          </select>
        </label>
        <label className="block text-xs text-slate-500">
          组件标题
          <input style={{ ...inp, width: '100%', marginTop: 6 }} value={widget.title} placeholder={ds?.name ?? '如：近14日预警趋势'} onChange={(e) => onChange({ title: e.target.value })} />
        </label>
      </div>

      {/* 数据集 */}
      <label className="mt-3 block text-xs text-slate-500">
        数据集（数据来源）<span className="text-rose-600">*</span>
        <select style={{ ...sel, width: '100%', marginTop: 6, borderColor: widget.datasetId ? undefined : '#DC2626' }} value={widget.datasetId} onChange={(e) => {
          const nd = datasets.find((d) => d.id === e.target.value)
          onChange({ datasetId: e.target.value, title: widget.title || nd?.name || '', dimensions: [], measures: nd ? defaultWidget(widget.type, nd).measures : [] })
        }}>
          <option value="">请选择数据集</option>
          {datasets.map((d) => <option key={d.id} value={d.id}>{d.name}{d.source === 'builtin' ? '（内置）' : d.source === 'api' ? '（接口）' : '（SQL）'}</option>)}
        </select>
      </label>

      {!ds && <p className="mt-2 text-xs text-slate-400">请先选择数据集，再配置维度与度量。</p>}

      {ds && (
        <div className="mt-3 space-y-3 rounded-lg border border-slate-200 bg-white p-3">
          {/* 维度字段 */}
          <div>
            <p className="mb-1.5 text-xs font-semibold text-slate-600">
              维度字段（分组 / 坐标轴 / 标签）
              {widget.type === 'metric' ? '（指标卡可选，留空则按全量聚合）' : '（必选）'}
            </p>
            {dimFields.length === 0 ? <p className="text-xs text-slate-400">该数据集无维度字段。</p> : (
              <div className="flex flex-wrap gap-1.5">
                {dimFields.map((f) => {
                  const on = widget.dimensions.includes(f.key)
                  return (
                    <button key={f.key} type="button"
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${on ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      onClick={() => toggleDim(f.key)}>
                      {f.label}{f.type === 'date' ? ' · 日期' : ''}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* 度量字段 + 计算方式 */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-600">度量字段 + 计算方式{widget.type === 'metric' || widget.type === 'line' || widget.type === 'bar' || widget.type === 'donut' ? '（必选）' : ''}</p>
              <button type="button" className="rounded-md px-2 py-0.5 text-xs font-medium text-brand-700 hover:bg-brand-50" onClick={addMeasure} disabled={!measureFields.length}>+ 添加度量</button>
            </div>
            {widget.measures.length === 0 && <p className="text-xs text-slate-400">尚未添加度量字段。</p>}
            <div className="space-y-2">
              {widget.measures.map((mm, mi) => (
                <div key={mm.id} className="flex flex-wrap items-center gap-2">
                  <select style={{ ...sel, width: 180 }} value={mm.field} onChange={(e) => setMeasure(mi, { field: e.target.value })}>
                    <option value="*">（全部记录）</option>
                    {measureFields.map((f) => <option key={f.key} value={f.key}>{f.label}{f.unit ? `(${f.unit})` : ''}</option>)}
                  </select>
                  <select style={{ ...sel, width: 130 }} value={mm.agg} onChange={(e) => setMeasure(mi, { agg: e.target.value as WidgetMeasure['agg'] })}>
                    {Object.entries(AGG_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <input style={{ ...inp, width: 150 }} value={mm.alias ?? ''} placeholder="别名（可选）" onChange={(e) => setMeasure(mi, { alias: e.target.value })} />
                  <button className="rounded-md px-2 py-1 text-xs text-rose-600 hover:bg-rose-50" onClick={() => removeMeasure(mi)}>移除</button>
                </div>
              ))}
            </div>
          </div>

          {/* 筛选条件 */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-600">筛选条件（全部 AND，可选）</p>
              <button type="button" className="rounded-md px-2 py-0.5 text-xs font-medium text-brand-700 hover:bg-brand-50" onClick={addFilter} disabled={!allFields.length}>+ 添加筛选</button>
            </div>
            {widget.filters.length === 0 && <p className="text-xs text-slate-400">无筛选，使用数据集全部明细。</p>}
            <div className="space-y-2">
              {widget.filters.map((ff, fi) => (
                <div key={ff.id} className="flex flex-wrap items-center gap-2">
                  <select style={{ ...sel, width: 160 }} value={ff.field} onChange={(e) => setFilter(fi, { field: e.target.value })}>
                    {allFields.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                  </select>
                  <select style={{ ...sel, width: 130 }} value={ff.op} onChange={(e) => setFilter(fi, { op: e.target.value as WidgetFilter['op'] })}>
                    {Object.entries(OP_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <input style={{ ...inp, width: 160 }} value={ff.value} placeholder={OP_META[ff.op].needsValue ? '值' : '无需值'} disabled={!OP_META[ff.op].needsValue} onChange={(e) => setFilter(fi, { value: e.target.value })} />
                  <button className="rounded-md px-2 py-1 text-xs text-rose-600 hover:bg-rose-50" onClick={() => removeFilter(fi)}>移除</button>
                </div>
              ))}
            </div>
          </div>

          {/* 宽度 / 限制 */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            {(widget.type === 'line' || widget.type === 'bar' || widget.type === 'donut') && (
              <label className="flex items-center gap-2 text-xs text-slate-500">
                宽度
                <select style={{ ...sel, width: 100 }} value={String(widget.span ?? 1)} onChange={(e) => onChange({ span: Number(e.target.value) === 2 ? 2 : 1 })}>
                  <option value="1">半宽</option>
                  <option value="2">全宽</option>
                </select>
              </label>
            )}
            {widget.type === 'table' && (
              <label className="flex items-center gap-2 text-xs text-slate-500">
                明细最大行数
                <input type="number" style={{ ...inp, width: 90 }} value={widget.limit ?? 50} onChange={(e) => onChange({ limit: Number(e.target.value) || 50 })} />
              </label>
            )}
            {widget.type === 'table' && (
              <span className="text-[11px] text-slate-400">未选维度 → 展示原始明细；选了维度 → 按维度分组汇总。</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ============================================================
 * 新增数据集弹窗（接口 / SQL）
 * ========================================================== */
function DatasetModal({ onCancel, onSave }: { onCancel: () => void; onSave: (ds: Dataset) => void }) {
  const [name, setName] = useState('')
  const [source, setSource] = useState<'api' | 'sql'>('api')
  const [endpoint, setEndpoint] = useState('')
  const [desc, setDesc] = useState('')
  const [fields, setFields] = useState<DatasetField[]>([{ key: 'field_1', label: '字段1', kind: 'dim', type: 'string' }])

  const setField = (i: number, patch: Partial<DatasetField>) =>
    setFields((fs) => fs.map((f, j) => (j === i ? { ...f, ...patch } : f)))
  const addField = () => setFields((fs) => [...fs, { key: `field_${fs.length + 1}`, label: `字段${fs.length + 1}`, kind: 'dim', type: 'string' }])
  const removeField = (i: number) => setFields((fs) => fs.filter((_, j) => j !== i))

  const submit = () => {
    if (!name.trim()) { alert('请填写数据集名称'); return }
    if (!fields.length) { alert('请至少配置一个字段'); return }
    onSave({
      id: newId('ds'), name: name.trim(), source, desc: desc.trim() || undefined,
      endpoint: source === 'api' ? endpoint.trim() || undefined : endpoint.trim() || undefined,
      fields, rows: [],
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-base font-semibold text-ink-900">注册数据集（接口 / SQL）</h3>
          <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" onClick={onCancel}>✕</button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs text-slate-500">数据集名称<span className="text-rose-600">*</span>
              <input style={{ ...inp, width: '100%', marginTop: 6, borderColor: name.trim() ? undefined : '#DC2626' }} value={name} onChange={(e) => setName(e.target.value)} placeholder="如：信贷审批流水" />
            </label>
            <label className="block text-xs text-slate-500">数据来源
              <select style={{ ...sel, width: '100%', marginTop: 6 }} value={source} onChange={(e) => setSource(e.target.value as 'api' | 'sql')}>
                <option value="api">接口 API</option>
                <option value="sql">SQL 查询</option>
              </select>
            </label>
            <label className="block text-xs text-slate-500 sm:col-span-2">
              {source === 'api' ? '接口地址' : 'SQL 语句'}
              <input style={{ ...inp, width: '100%', marginTop: 6 }} value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder={source === 'api' ? 'https://api.example.com/...' : 'SELECT ... FROM ...'} />
            </label>
            <label className="block text-xs text-slate-500 sm:col-span-2">说明
              <input style={{ ...inp, width: '100%', marginTop: 6 }} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="数据集用途简述" />
            </label>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-600">字段定义（维度 / 度量）</p>
              <button type="button" className="rounded-md px-2 py-0.5 text-xs font-medium text-brand-700 hover:bg-brand-50" onClick={addField}>+ 添加字段</button>
            </div>
            <div className="space-y-2">
              {fields.map((f, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2">
                  <input style={{ ...inp, width: 130 }} value={f.label} placeholder="标签" onChange={(e) => setField(i, { label: e.target.value })} />
                  <input style={{ ...inp, width: 120 }} value={f.key} placeholder="字段名" onChange={(e) => setField(i, { key: e.target.value })} />
                  <select style={{ ...sel, width: 100 }} value={f.kind} onChange={(e) => setField(i, { kind: e.target.value as DatasetField['kind'] })}>
                    <option value="dim">维度</option>
                    <option value="measure">度量</option>
                  </select>
                  <select style={{ ...sel, width: 100 }} value={f.type} onChange={(e) => setField(i, { type: e.target.value as DatasetField['type'] })}>
                    <option value="string">文本</option>
                    <option value="number">数值</option>
                    <option value="date">日期</option>
                  </select>
                  <input style={{ ...inp, width: 80 }} value={f.unit ?? ''} placeholder="单位" onChange={(e) => setField(i, { unit: e.target.value })} />
                  <button className="rounded-md px-2 py-1 text-xs text-rose-600 hover:bg-rose-50" onClick={() => removeField(i)}>移除</button>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-slate-400">注册后，看板组件即可引用该数据集的字段进行配置；明细数据需对接后端后回填（当前为占位，预览将显示“无数据”）。</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <Button variant="ghost" onClick={onCancel}>取消</Button>
          <Button onClick={submit}>注册数据集</Button>
        </div>
      </div>
    </div>
  )
}
