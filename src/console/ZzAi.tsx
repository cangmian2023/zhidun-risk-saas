// 催贷管理 · 模块7 AI协催机器人
import { useState } from 'react'
import { ZzPage, ZzCard, ZzBtn, ZzModal, ZzTable, ZzFilterBar, ZzField, ZzInput, ZzSelect, ZzTextarea, ZzBadge, ZzStat, BLUE } from './zzUi'
import { ZZ_AI_TASKS, ZZ_AI_TEMPLATES, ZZ_AI_CALLS, ZZ_AI_BOARD, ZZ_GRAPH_PROFILES, ZZ_GRAPH_TAG_COLOR } from './zzData'

const GREEN = '#16A34A'; const RED = '#DC2626'; const AMBER = '#D97706'; const GRAY = '#9CA3AF'
function tColor(s: string) { return s === '运行中' ? GREEN : s === '已暂停' ? GRAY : AMBER }
function getCalls(ids: string[]) { return ZZ_AI_CALLS.filter((c) => ids.includes(c.id)) }

export function ZzAiModule({ pageKey }: { pageKey: string }) {
  if (pageKey === 'zz:ai-template') return <ZzAiTemplate />
  return <ZzAiTask />
}

/* ============================ 外呼任务总览（核心主页面） ============================ */
function ZzAiTask() {
  const [tasks, setTasks] = useState<any[]>(ZZ_AI_TASKS)
  const [detail, setDetail] = useState<any | null>(null)
  const [newManual, setNewManual] = useState(false)
  const [newAuto, setNewAuto] = useState(false)
  const b = ZZ_AI_BOARD

  return (
    <ZzPage title="外呼任务总览" crumb="催贷管理 / AI协催" subtitle="手动临时任务 + 自动周期任务（系统按策略自动外呼，无需每次手动新建）">
      <div className="mb-4 flex flex-wrap gap-3">
        <ZzStat label="呼叫总量" value={b.total} accent={BLUE} />
        <ZzStat label="接通量" value={b.connected} accent={GREEN} />
        <ZzStat label="有效对话占比" value={(b.effective * 100).toFixed(0) + '%'} />
        <ZzStat label="转人工" value={b.toHuman} accent={AMBER} />
        <ZzStat label="异常任务" value={b.abnormal} accent={RED} />
      </div>

      <ZzFilterBar>
        <ZzField label="任务名称"><ZzInput placeholder="任务名称关键词" /></ZzField>
        <ZzField label="任务类型"><ZzSelect defaultValue=""><option value="">全部</option><option>自动周期</option><option>手动临时</option></ZzSelect></ZzField>
        <ZzField label="对话模板"><ZzSelect defaultValue=""><option value="">全部</option>{ZZ_AI_TEMPLATES.map((t) => <option key={t.id}>{t.name}</option>)}</ZzSelect></ZzField>
        <ZzField label="状态"><ZzSelect defaultValue=""><option value="">全部</option><option>运行中</option><option>已暂停</option></ZzSelect></ZzField>
        <ZzBtn primary>查询</ZzBtn>
        <ZzBtn onClick={() => setNewManual(true)}>新建临时任务</ZzBtn>
        <ZzBtn primary onClick={() => setNewAuto(true)}>新建自动周期任务</ZzBtn>
      </ZzFilterBar>

      <ZzCard title="任务列表" extra={<span className="text-xs text-gray-400">共 {tasks.length} 个任务</span>}>
        <ZzTable head={['任务名称', '类型', '对话模板', '状态', '执行周期/时间', '总待呼', '已呼叫', '接通', '接通率', '操作']} rows={tasks.map((t) => [
          t.name, <ZzBadge color={t.type === '自动周期' ? BLUE : AMBER}>{t.type}</ZzBadge>, t.template, <ZzBadge color={tColor(t.status)}>{t.status}</ZzBadge>,
          t.schedule, t.kpi.pending, t.kpi.called, t.kpi.connected, (t.kpi.connectRate * 100).toFixed(2) + '%',
          <div className="flex flex-wrap gap-1">
            <ZzBtn sm onClick={() => setDetail(t)}>详情</ZzBtn>
            {t.type === '自动周期' && <ZzBtn sm>配置</ZzBtn>}
            {t.status === '运行中'
              ? <ZzBtn sm danger onClick={() => setTasks((ts) => ts.map((x) => x.id === t.id ? { ...x, status: '已暂停' } : x))}>暂停</ZzBtn>
              : <ZzBtn sm primary onClick={() => setTasks((ts) => ts.map((x) => x.id === t.id ? { ...x, status: '运行中' } : x))}>启动</ZzBtn>}
            {t.type === '手动临时' && <ZzBtn sm onClick={() => alert('已复制任务配置，请修改后新建')}>复制</ZzBtn>}
          </div>,
        ])} />
      </ZzCard>

      {detail && <ZzAiTaskDetail t={detail} tasks={tasks} setTasks={setTasks} onClose={() => setDetail(null)} />}
      {newManual && <NewManualModal onClose={() => setNewManual(false)} onOk={(name) => { setTasks((ts) => [...ts, { id: 'AI-' + (ts.length + 1), name, type: '手动临时', template: '标准开场白', status: '运行中', schedule: '立即执行一次', nextRun: '-', filter: '导入客户池', strategy: '每客户最大呼叫 3 次', kpi: { pending: 100, called: 0, connected: 0, connectRate: 0, noAnswer: 0, busy: 0, promise: 0, toHuman: 0 }, fail: { 关机: 0, 空号: 0, 拒接: 0, 号码错误: 0 }, calls: [] }]); setNewManual(false) }} />}
      {newAuto && <NewAutoModal onClose={() => setNewAuto(false)} onOk={(name) => { setTasks((ts) => [...ts, { id: 'AI-' + (ts.length + 1), name, type: '自动周期', template: '标准开场白', status: '运行中', schedule: '每日自动执行', nextRun: '2026-08-26 09:00', filter: '逾期 M1-M3；排除已人工/外访/法务/禁止AI', strategy: '每客户最大呼叫 2 次；夜间禁止', kpi: { pending: 800, called: 0, connected: 0, connectRate: 0, noAnswer: 0, busy: 0, promise: 0, toHuman: 0 }, fail: { 关机: 0, 空号: 0, 拒接: 0, 号码错误: 0 }, calls: [] }]); setNewAuto(false) }} />}
    </ZzPage>
  )
}

/* 新建临时任务 */
function NewManualModal({ onClose, onOk }: { onClose: () => void; onOk: (name: string) => void }) {
  const [name, setName] = useState('M3协催临时批次')
  return (
    <ZzModal open title="新建临时任务（一次性专项外呼）" onClose={onClose} width={640}
      footer={<><ZzBtn onClick={onClose}>取消</ZzBtn><ZzBtn primary onClick={() => onOk(name)}>提交执行</ZzBtn></>}>
      <div className="space-y-3">
        <ZzField label="任务名称"><ZzInput value={name} onChange={(e) => setName(e.target.value)} /></ZzField>
        <ZzField label="客户案件池"><ZzTextarea rows={2} placeholder="条件筛选（逾期阶段/天数）或导入名单" /></ZzField>
        <ZzField label="绑定对话模板"><ZzSelect defaultValue={ZZ_AI_TEMPLATES[1].name}>{ZZ_AI_TEMPLATES.map((t) => <option key={t.id}>{t.name}</option>)}</ZzSelect></ZzField>
        <div className="grid grid-cols-2 gap-3">
          <ZzField label="外呼时间窗口"><ZzInput placeholder="09:00-12:00" /></ZzField>
          <ZzField label="最大呼叫次数"><ZzInput type="number" defaultValue={3} /></ZzField>
        </div>
        <ZzField label="重呼策略"><ZzSelect defaultValue="失败4h后重呼"><option>失败4h后重呼</option><option>失败6h后重呼</option><option>不重呼</option></ZzSelect></ZzField>
      </div>
    </ZzModal>
  )
}

/* 新建自动周期任务（真正全自动） */
function NewAutoModal({ onClose, onOk }: { onClose: () => void; onOk: (name: string) => void }) {
  const [name, setName] = useState('M1每日自动提醒')
  return (
    <ZzModal open title="新建自动周期任务（系统全自动外呼）" onClose={onClose} width={640}
      footer={<><ZzBtn onClick={onClose}>取消</ZzBtn><ZzBtn primary onClick={() => onOk(name)}>启用自动任务</ZzBtn></>}>
      <div className="mb-3 rounded bg-blue-50 p-2 text-xs text-blue-700">💡 自动周期任务：系统按配置的筛选条件与调度时间，自动扫描逾期案件池生成 AI 外呼，无需每次手动新建；临时任务用于一次性专项批次。</div>
      <div className="space-y-3">
        <ZzField label="任务名称"><ZzInput value={name} onChange={(e) => setName(e.target.value)} /></ZzField>
        <ZzField label="案件筛选条件（核心）">
          <div className="flex flex-wrap gap-2">
            <ZzSelect defaultValue="M1-M3"><option>M1</option><option>M1-M3</option><option>全部逾期</option></ZzSelect>
            <ZzSelect defaultValue="逾期1-90天"><option>逾期1-30天</option><option>逾期1-90天</option><option>全部</option></ZzSelect>
          </div>
          <ZzTextarea rows={2} className="mt-2" defaultValue="排除已人工跟进/已承诺还款/禁止AI协催/已转外访或法务" />
        </ZzField>
        <ZzField label="绑定对话模板"><ZzSelect defaultValue={ZZ_AI_TEMPLATES[0].name}>{ZZ_AI_TEMPLATES.map((t) => <option key={t.id}>{t.name}</option>)}</ZzSelect></ZzField>
        <div className="grid grid-cols-2 gap-3">
          <ZzField label="执行频率"><ZzSelect defaultValue="每日"><option>每日</option><option>每周</option></ZzSelect></ZzField>
          <ZzField label="每日呼叫时段"><ZzInput defaultValue="09:00-12:00, 14:00-18:00" /></ZzField>
        </div>
        <ZzField label="外呼控制策略"><ZzTextarea rows={2} defaultValue="每客户最大呼叫 2 次；失败重呼间隔 4h；接通后不再重呼；夜间禁止外呼" /></ZzField>
        <ZzField label="开关"><ZzSelect defaultValue="启用"><option>启用</option><option>停用</option></ZzSelect></ZzField>
      </div>
    </ZzModal>
  )
}

/* ============================ 任务详情页（4卡片 + 通话详情弹窗） ============================ */
function ZzAiTaskDetail({ t, tasks, setTasks, onClose }: { t: any; tasks: any[]; setTasks: (f: (p: any[]) => any[]) => void; onClose: () => void }) {
  const [callDetail, setCallDetail] = useState<any | null>(null)
  const calls = getCalls(t.calls ?? [])
  const k = t.kpi
  const toggle = () => setTasks((ts) => ts.map((x) => x.id === t.id ? { ...x, status: x.status === '运行中' ? '已暂停' : '运行中' } : x))
  return (
    <ZzModal open title={`外呼任务详情 · ${t.name}`} onClose={onClose} width={960}
      footer={<>
        <ZzBtn onClick={() => alert('已导出本任务全部通话记录（含录音/转写/标签）')}>导出通话记录</ZzBtn>
        {t.type === '手动临时' && <ZzBtn onClick={() => alert('已复制任务配置')}>复制任务</ZzBtn>}
        <ZzBtn>{t.status === '运行中' ? '暂停' : '启动'}</ZzBtn>
        <ZzBtn primary onClick={onClose}>关闭</ZzBtn>
      </>}>
      <div className="max-h-[78vh] space-y-4 overflow-auto pr-1">
        {/* 卡片1 基础信息 */}
        <ZzCard title="① 任务基础信息">
          <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
            {[['任务类型', <ZzBadge color={t.type === '自动周期' ? BLUE : AMBER}>{t.type}</ZzBadge>], ['绑定模板', t.template], ['状态', <ZzBadge color={tColor(t.status)}>{t.status}</ZzBadge>],
            ['调度/时间', t.schedule], t.type === '自动周期' ? ['下次执行', t.nextRun] : ['执行区间', t.schedule], ['呼叫策略', t.strategy]].map(([key, val]) => (
              <div key={key as string} className="rounded border px-3 py-2"><div className="text-xs text-gray-400">{key}</div><div className="mt-0.5 font-medium">{val}</div></div>
            ))}
          </div>
          {t.type === '自动周期' && <div className="mt-2 rounded bg-blue-50 p-2 text-xs text-blue-700">当前生效筛选：{t.filter}</div>}
        </ZzCard>

        {/* 卡片2 指标概览 */}
        <ZzCard title="② 任务指标概览">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <ZzStat label="总待呼" value={k.pending} />
            <ZzStat label="已发起呼叫" value={k.called} accent={BLUE} />
            <ZzStat label="接通量" value={k.connected} accent={GREEN} />
            <ZzStat label="接通率" value={(k.connectRate * 100).toFixed(2) + '%'} good />
            <ZzStat label="无人接听" value={k.noAnswer} />
            <ZzStat label="占线拒接" value={k.busy} />
            <ZzStat label="达成还款承诺" value={k.promise} good />
            <ZzStat label="转人工" value={k.toHuman} accent={AMBER} />
          </div>
        </ZzCard>

        {/* 卡片3 本任务通话明细 */}
        <ZzCard title="③ 本任务通话明细">
          <ZzTable head={['客户', '关联案件', '呼叫时间', '时长', '结果', 'NLP意图', '标签回写', '操作']} rows={calls.map((c) => [
            c.target, c.caseId, c.time, c.duration, c.result, <ZzBadge color={c.intent === '承诺还款' ? GREEN : c.intent === '拒绝还款' ? RED : GRAY}>{c.intent}</ZzBadge>, <ZzBadge color={BLUE}>{c.tag}</ZzBadge>,
            <ZzBtn sm onClick={() => setCallDetail(c)}>通话详情</ZzBtn>,
          ])} />
          {calls.length === 0 && <div className="mt-2 text-sm text-gray-400">暂无通话记录。</div>}
        </ZzCard>

        {/* 卡片4 异常失败统计 */}
        <ZzCard title="④ 异常 & 失败统计">
          <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
            {Object.entries(t.fail ?? {}).map(([key, val]) => (
              <div key={key} className="rounded border px-3 py-2"><div className="text-xs text-gray-400">{key}</div><div className="mt-0.5 font-medium text-red-500">{String(val)}</div></div>
            ))}
          </div>
        </ZzCard>

        {/* 卡片5 图谱语义增强（AI 外呼前读取客户图谱画像，动态调整话术，并在通话后回写关联风险标签） */}
        <ZzCard title="⑤ 图谱语义增强（AI 更聪明）">
          <div className="mb-2 rounded bg-[#eef4ff] p-2 text-xs text-[#1677ff]">AI 外呼前自动读取被叫客户图谱画像（是否团伙逾期 / 多次失联 / 有无稳定关联人），动态调整话术策略；通话结束后把关联风险写入案件标签，供人工接手时一目了然。</div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {calls.map((c) => {
              const g = ZZ_GRAPH_PROFILES[c.caseId]
              return (
                <div key={c.id} className="rounded border p-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{c.target}（{c.caseId}）</span>
                    {g?.tags?.map((tg: any, i: number) => <ZzBadge key={i} color={ZZ_GRAPH_TAG_COLOR[tg]}>{tg}</ZzBadge>)}
                  </div>
                  <div className="mt-1 text-xs text-gray-600">
                    {!g ? '无图谱关联线索 → 话术侧重诱导获取新联系方式' :
                      g.gang.inGang ? '团伙逾期客户 → 话术加强施压' :
                      g.contacts.length ? '有合法关联人 → 引导客户主动还款' : '多次失联 → 侧重诱导获取新联系方式'}
                    {g ? `｜失联修复得分 ${g.lostRepair.score}` : ''}
                  </div>
                </div>
              )
            })}
            {calls.length === 0 && <div className="text-sm text-gray-400">暂无通话记录。</div>}
          </div>
        </ZzCard>
      </div>
      {callDetail && <CallDetailModal c={callDetail} onClose={() => setCallDetail(null)} />}
    </ZzModal>
  )
}

/* 单条通话详情弹窗 */
function CallDetailModal({ c, onClose }: { c: any; onClose: () => void }) {
  return (
    <ZzModal open title={`通话详情 · ${c.id}`} onClose={onClose} width={720}
      footer={<><ZzBtn onClick={() => alert('已回写催收案件 ' + c.caseId)}>回写催收案件</ZzBtn><ZzBtn primary onClick={onClose}>关闭</ZzBtn></>}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
          {[['客户', c.target], ['关联案件', c.caseId], ['呼叫时间', c.time], ['通话时长', c.duration], ['结果', c.result], ['识别意图', c.intent]].map(([key, val]) => (
            <div key={key} className="rounded border px-3 py-2"><div className="text-xs text-gray-400">{key}</div><div className="mt-0.5 font-medium">{val}</div></div>
          ))}
        </div>
        <div className="rounded bg-gray-50 p-3">
          <div className="mb-1 text-xs text-gray-500">录音播放</div>
          <div className="flex items-center gap-2"><span className="text-blue-600">▶</span><div className="h-2 flex-1 rounded bg-blue-100"><div className="h-2 w-1/3 rounded bg-blue-500" /></div><span className="text-xs text-gray-400">{c.duration}</span></div>
        </div>
        <ZzField label="ASR 完整对话转写">
          <div className="space-y-1 rounded border p-3 text-sm">
            {(c.asr?.length ?? 0) === 0 && <div className="text-gray-400">未接通，无转写文本</div>}
            {c.asr?.map((line: any[], i: number) => (
              <div key={i} className={line[0] === 'AI' ? 'text-blue-700' : 'text-gray-800'}>{line[0]}：{line[1]}</div>
            ))}
          </div>
        </ZzField>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="rounded border px-3 py-2"><div className="text-xs text-gray-400">是否承诺还款</div><div className="font-medium">{c.nlp?.promise ?? '—'}</div></div>
          <div className="rounded border px-3 py-2"><div className="text-xs text-gray-400">期望还款日期</div><div className="font-medium">{c.nlp?.expectDate || '—'}</div></div>
          <div className="rounded border px-3 py-2"><div className="text-xs text-gray-400">是否转人工</div><div className="font-medium">{c.nlp?.transfer ?? '—'}</div></div>
        </div>
        <div className="rounded border px-3 py-2 text-sm"><div className="text-xs text-gray-400">标签回写状态</div><div className="font-medium" style={{ color: c.tag === '已回写' ? GREEN : GRAY }}>{c.tag}</div></div>
        <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm"><div className="text-xs text-amber-600">后续处置建议</div><div className="font-medium text-amber-700">{c.suggest}</div></div>
      </div>
    </ZzModal>
  )
}

/* ============================ 对话模板管理 ============================ */
function ZzAiTemplate() {
  const [rows, setRows] = useState<any[]>(ZZ_AI_TEMPLATES)
  const [preview, setPreview] = useState<any | null>(null)
  const [edit, setEdit] = useState<any | null>(null)
  const [sim, setSim] = useState<any | null>(null)
  return (
    <ZzPage title="对话模板管理" crumb="催贷管理 / AI协催" subtitle="多轮对话话术模板、分支流程与模拟测试">
      <ZzCard title="话术模板" extra={<ZzBtn sm primary onClick={() => setEdit({ id: 'T-' + (rows.length + 1), name: '新模板', scenario: '', enabled: true, nodeCount: 1, nodes: [{ id: 'n1', role: 'AI', text: '您好', branch: [] }] })}>新增模板</ZzBtn>}>
        <ZzTable head={['模板名称', '适用场景', '节点数', '分支数', '启用', '操作']} rows={rows.map((t) => [
          t.name, t.scenario, t.nodeCount, t.nodes.reduce((a: number, n: any) => a + (n.branch?.length ?? 0), 0), <ZzBadge color={t.enabled ? GREEN : GRAY}>{t.enabled ? '启用' : '停用'}</ZzBadge>,
          <div className="flex flex-wrap gap-1">
            <ZzBtn sm onClick={() => setEdit(t)}>编辑</ZzBtn>
            <ZzBtn sm primary onClick={() => setPreview(t)}>预览对话流程</ZzBtn>
            <ZzBtn sm onClick={() => setSim(t)}>模拟测试</ZzBtn>
            <ZzBtn sm onClick={() => alert('已复制模板 ' + t.name)}>复制</ZzBtn>
          </div>,
        ])} />
      </ZzCard>
      {preview && <FlowPreview t={preview} onClose={() => setPreview(null)} />}
      {edit && <TemplateEditor t={edit} onClose={() => setEdit(null)} onSave={(nt) => { setRows((rs) => { const i = rs.findIndex((x) => x.id === nt.id); return i >= 0 ? rs.map((x) => x.id === nt.id ? nt : x) : [...rs, nt] })(); setEdit(null) }} />}
      {sim && <Simulator t={sim} onClose={() => setSim(null)} />}
    </ZzPage>
  )
}

/* 对话流程图预览 */
function FlowPreview({ t, onClose }: { t: any; onClose: () => void }) {
  return (
    <ZzModal open title={`对话流程预览 · ${t.name}`} onClose={onClose} width={640}
      footer={<ZzBtn primary onClick={onClose}>关闭</ZzBtn>}>
      <div className="space-y-2">
        {t.nodes.map((n: any, i: number) => (
          <div key={n.id} className="rounded border p-3">
            <div className="text-sm font-medium text-blue-700">{n.id}｜{n.role}：{n.text}</div>
            {(n.branch?.length ?? 0) > 0 && <div className="mt-2 space-y-1 pl-3 text-sm text-gray-600">
              {n.branch.map((b: any, j: number) => (
                <div key={j}>├ 客户「{b.answer}」 → 跳转 {b.next}{b.action ? `（动作：${b.action}）` : ''}</div>
              ))}
            </div>}
          </div>
        ))}
        <div className="rounded bg-gray-50 p-3 text-xs text-gray-500">示例路径：开场 → 客户说没钱 → 共情分期 → 同意分期 → 记录还款承诺结束；拒绝 → 转人工；辱骂 → 终止标记拒绝。</div>
      </div>
    </ZzModal>
  )
}

/* 模板编辑器 */
function TemplateEditor({ t, onClose, onSave }: { t: any; onClose: () => void; onSave: (t: any) => void }) {
  const [draft, setDraft] = useState<any>(JSON.parse(JSON.stringify(t)))
  const setNode = (id: string, patch: any) => setDraft((d: any) => ({ ...d, nodes: d.nodes.map((n: any) => n.id === id ? { ...n, ...patch } : n) }))
  return (
    <ZzModal open title={`模板编辑 · ${t.name}`} onClose={onClose} width={760}
      footer={<><ZzBtn onClick={onClose}>取消</ZzBtn><ZzBtn primary onClick={() => onSave({ ...draft, nodeCount: draft.nodes.length })}>保存</ZzBtn></>}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <ZzField label="模板名称"><ZzInput value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></ZzField>
          <ZzField label="适用逾期阶段"><ZzInput value={draft.scenario} onChange={(e) => setDraft({ ...draft, scenario: e.target.value })} placeholder="如 M1/M2 催收提醒" /></ZzField>
        </div>
        <div className="space-y-2">
          {draft.nodes.map((n: any, i: number) => (
            <div key={n.id} className="rounded border p-3">
              <div className="mb-1 text-xs text-gray-400">节点 {n.id}（{n.role}）</div>
              <ZzTextarea rows={2} value={n.text} onChange={(e) => setNode(n.id, { text: e.target.value })} />
              <div className="mt-2 space-y-1">
                {(n.branch ?? []).map((b: any, j: number) => (
                  <div key={j} className="flex gap-2 text-sm"><span className="text-gray-400">客户应答：</span><span className="font-medium">{b.answer}</span><span className="text-gray-400">→ 跳转 {b.next}</span>{b.action && <span className="text-amber-600">动作：{b.action}</span>}</div>
                ))}
                {(n.branch ?? []).length === 0 && <div className="text-xs text-gray-400">（无分支，结束节点）</div>}
              </div>
            </div>
          ))}
        </div>
        <ZzBtn sm onClick={() => setDraft((d: any) => ({ ...d, nodes: [...d.nodes, { id: 'n' + (d.nodes.length + 1), role: 'AI', text: '', branch: [] }] }))}>新增节点</ZzBtn>
        <ZzBtn sm onClick={() => alert('已保存模板，可在任务中绑定使用')}>模拟测试</ZzBtn>
      </div>
    </ZzModal>
  )
}

/* 模拟测试：输入客户回答跑一遍 */
function Simulator({ t, onClose }: { t: any; onClose: () => void }) {
  const [log, setLog] = useState<string[]>([])
  const [done, setDone] = useState(false)
  const run = () => {
    const lines = [t.nodes[0].text]
    let node = t.nodes[0]
    for (let step = 0; step < 6; step++) {
      const br = node.branch?.[0]
      if (!br) { lines.push('（结束）' + (node.role === 'AI' ? '' : '')); break }
      lines.push('客户：' + br.answer)
      const next = t.nodes.find((n: any) => n.id === br.next)
      if (!next) break
      lines.push(next.text)
      if (br.action) lines.push('→ 执行动作：' + br.action)
      if (next.branch?.length === 0) { lines.push('（流程结束）'); break }
      node = next
    }
    setLog(lines); setDone(true)
  }
  return (
    <ZzModal open title={`模拟测试 · ${t.name}`} onClose={onClose} width={640}
      footer={<><ZzBtn onClick={run}>{done ? '重新模拟' : '开始模拟'}</ZzBtn><ZzBtn primary onClick={onClose}>关闭</ZzBtn></>}>
      <p className="mb-2 text-xs text-gray-500">输入模拟客户回答，直接跑一遍完整对话，验证话术分支是否通顺（示例走第一条分支）。</p>
      <div className="space-y-1 rounded border p-3 text-sm">
        {log.length === 0 && <div className="text-gray-400">点击「开始模拟」预览对话走向</div>}
        {log.map((l, i) => <div key={i} className={l.startsWith('客户') ? 'text-gray-800' : l.startsWith('→') ? 'text-amber-600' : 'text-blue-700'}>{l}</div>)}
      </div>
    </ZzModal>
  )
}
