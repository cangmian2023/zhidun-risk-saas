// 风控中心 · 风险预警（fk-risk-warning）· 1:1 复刻「风控 - 风险预警」
// 折叠子快照：风控 - 风险预警 - 添加监控 / - 解读 / - 风险和推送设置 / - 风险详情 / - 风险详情 - 案件串联（均为抽屉）
// 数据：本地样例 fkRisk.json（橘 Sam）
import { useState } from 'react'
import { EpPage, EpCard, EpStat, EpTag, EpBtn, EpDrawer, DataTable, useSample, Sam } from '../epCommon'
import type { Row, Column } from '../../../../components/ui'
import seedJson from '../../../fkRisk.json'

type RiskRow = (typeof seedJson.rows)[number]

const LEVEL: Record<string, { c: string; b: string }> = {
  高风险: { c: '#B91C1C', b: '#FEE2E2' },
  中风险: { c: '#C2410C', b: '#FFEDD5' },
  低风险: { c: '#1D4ED8', b: '#EFF6FF' },
  轻微风险: { c: '#0F766E', b: '#CCFBF1' },
  日常资讯: { c: '#475569', b: '#F1F5F9' },
}

const RISK_TYPES = ['不限', '基本信息', '经营风险', '司法风险', '经营信息', '企业舆情', '供应链风险', '关联方风险', '关键词舆情']
const MARKS = ['重点关注风险', '存在信用风险', '重大工商变更', '外部供应链风险']

export default function FkRiskWarning({ params }: { params: URLSearchParams }) {
  const [data] = useSample('fkRisk.json', seedJson)
  const [kw, setKw] = useState(params.get('kw') || '')
  const [pushTime, setPushTime] = useState('最近30天')
  const [happenTime, setHappenTime] = useState('不限')
  const [levels, setLevels] = useState<string[]>([])
  const [readState, setReadState] = useState('不限')
  const [followState, setFollowState] = useState('不限')
  const [riskType, setRiskType] = useState('不限')
  const [rule, setRule] = useState('全部')
  const [view, setView] = useState<'主体' | '全字段'>('主体')
  const [selected, setSelected] = useState<string[]>([])

  const [addOpen, setAddOpen] = useState(false)
  const [addTab, setAddTab] = useState('输入粘贴上传')
  const [cfgOpen, setCfgOpen] = useState(false)
  const [readOpen, setReadOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [caseOpen, setCaseOpen] = useState(false)
  const [cur, setCur] = useState<RiskRow | null>(null)

  const rows = data.rows.filter((r) => {
    if (kw && !r.subject.includes(kw) && !r.content.includes(kw) && !r.title.includes(kw)) return false
    if (levels.length && !levels.includes(r.level)) return false
    if (followState !== '不限' && r.status !== followState) return false
    return true
  })

  const toggleLevel = (l: string) => setLevels(levels.includes(l) ? levels.filter((x) => x !== l) : [...levels, l])

  const levelCell = (r: Row) => {
    const l = String(r.level)
    return <EpTag color={LEVEL[l]?.c} bg={LEVEL[l]?.b}>{l}</EpTag>
  }
  const contentCell = (r: Row) => (
    <div style={{ maxWidth: 460, whiteSpace: 'normal', lineHeight: 1.6 }}>
      {r.title !== r.content && <div style={{ color: '#0F172A', fontWeight: 500 }}>{String(r.title)}</div>}
      <div style={{ color: '#64748B', fontSize: 12 }}>{String(r.content)}</div>
      <span style={{ display: 'inline-flex', gap: 8, marginTop: 4 }}>
        <a style={lk} onClick={() => { setCur(r as unknown as RiskRow); setReadOpen(true) }}>AI解读</a>
        {(r as unknown as RiskRow).caseLink && (
          <a style={lk} onClick={() => { setCur(r as unknown as RiskRow); setCaseOpen(true) }}>案件串联</a>
        )}
      </span>
    </div>
  )
  const opCell = (r: Row) => (
    <span style={{ display: 'inline-flex', gap: 8, whiteSpace: 'nowrap' }}>
      <a style={lk} onClick={() => { setCur(r as unknown as RiskRow); setDetailOpen(true) }}>企业风险</a>
      <a style={lk}>推送</a>
      <a style={lk}>供应商</a>
      <a style={lk}>标记动态</a>
      <a style={lk}>收藏动态</a>
    </span>
  )

  const colsSubject: Column[] = [
    { key: 'subject', label: '监控主体', width: '180px', render: (r: Row) => (
      <a style={lk} onClick={() => { setCur(r as unknown as RiskRow); setDetailOpen(true) }}>{String(r.subject)}</a>
    ) },
    { key: 'level', label: '风险等级', render: levelCell },
    { key: 'happen', label: '发生时间' },
    { key: 'type', label: '风险类型', width: '140px' },
    { key: 'content', label: '风险内容', render: contentCell },
    { key: 'score', label: '风险评分', align: 'center' },
    { key: 'push', label: '推送时间' },
    { key: 'owner', label: '负责人' },
    { key: 'status', label: '处理状态' },
    { key: 'op', label: '操作', fixed: 'right', render: opCell },
  ]

  const colsFull: Column[] = [
    { key: 'push', label: '推送时间' },
    { key: 'level', label: '风险等级', render: levelCell },
    { key: 'type', label: '风险类型', width: '140px' },
    { key: 'content', label: '风险内容', render: contentCell },
    { key: 'score', label: '风险评分', align: 'center' },
    { key: 'affectEp', label: '影响企业', width: '180px' },
    { key: 'affectArea', label: '影响地区' },
    { key: 'happen', label: '发生时间' },
    { key: 'owner', label: '负责人' },
    { key: 'status', label: '处理状态' },
    { key: 'doneTime', label: '处理完成时间' },
    { key: 'cycle', label: '处理周期（天）', align: 'center' },
    { key: 'op', label: '操作', fixed: 'right', render: opCell },
  ]

  return (
    <EpPage
      title="风险预警"
      subtitle="按监控规则推送企业风险动态，支持解读、跟进与案件串联"
      crumb="风控中心 / 风险预警"
      actions={
        <span style={{ display: 'inline-flex', gap: 8 }}>
          <EpBtn variant="default" onClick={() => setCfgOpen(true)}>风险和推送设置</EpBtn>
          <EpBtn variant="primary" onClick={() => setAddOpen(true)}>添加监控</EpBtn>
        </span>
      }
    >
      {/* 顶部同步与额度 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 14 }}>
        <EpStat label="已同步" value={`${data.synced} 家`} sub="家企业3个月监控动态数据" accent="#2563EB" />
        <EpStat label="剩余额度" value={data.quota} sub="添加监控：输入添加 / Excel上传 / 从客户列表导入" accent="#0F766E" />
      </div>

      {/* 监控筛选 */}
      <EpCard title="监控筛选" pad={false}>
        <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
          <Row2 label="推送时间" opts={['今天', '昨天', '最近7天', '最近30天', '最近3个月', '自定义']} value={pushTime} onChange={setPushTime} />
          <Row2 label="发生时间" opts={['不限', '今天', '昨天', '最近7天', '最近30天', '最近3个月', '自定义']} value={happenTime} onChange={setHappenTime} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ color: '#475569', width: 84 }}>风险等级</span>
            {['高风险', '中风险', '低风险', '轻微风险', '日常资讯'].map((l) => (
              <span key={l} onClick={() => toggleLevel(l)} style={chip(levels.includes(l))}>{l}</span>
            ))}
          </div>
          <Row2 label="阅读状态" opts={['不限', '已读', '未读']} value={readState} onChange={setReadState} />
          <Row2 label="跟进状态" opts={['不限', '未处理', '处理中', '已处理', '无需处理']} value={followState} onChange={setFollowState} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ color: '#475569', width: 84 }}>标记动态</span>
            {MARKS.map((m) => <span key={m} style={chip(false)}>{m}</span>)}
          </div>
          <Row2 label="监控规则" opts={['全部', '启信慧眼默认规则(国内)', '启信慧眼默认规则(境外)']} value={rule} onChange={setRule} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ color: '#475569', width: 84 }}>企业筛选</span>
            {['国内', '境外'].map((m) => <span key={m} style={chip(false)}>{m}</span>)}
            <span style={{ color: '#475569', marginLeft: 8 }}>国家地区</span>
            {['中国', '德国', '美国'].map((m) => <span key={m} style={chip(false)}>{m}</span>)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ color: '#475569', width: 84 }}>企业标签</span>
            {['全选', '默认分组'].map((m) => <span key={m} style={chip(false)}>{m}</span>)}
            <EpBtn variant="ghost" size="sm">编辑标签</EpBtn>
            <span style={{ color: '#475569', marginLeft: 8 }}>企业分组</span>
            {['未分组', '长时间未联系', '重点维护'].map((m) => <span key={m} style={chip(false)}>{m}</span>)}
            <EpBtn variant="ghost" size="sm">编辑分组</EpBtn>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ color: '#475569', width: 84 }}>负责人/部门</span>
            <select style={{ ...inp, width: 180 }}><option>请选择</option><option>19156027703</option></select>
            <span style={{ color: '#475569' }}>添加人</span>
            <select style={{ ...inp, width: 160 }}><option>19156027703</option></select>
            <span style={{ color: '#475569' }}>关联企业</span>
            <input placeholder="请输入企业名称" style={{ ...inp, width: 180 }} />
          </div>
          <Row2 label="风险类型" opts={RISK_TYPES} value={riskType} onChange={setRiskType} />
          {/* 已选条件 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px dashed #E2E8F0', paddingTop: 10, flexWrap: 'wrap' }}>
            <span style={{ color: '#475569' }}>已选条件</span>
            <EpTag>推送时间：{data.range}</EpTag>
            <input value={kw} onChange={(e) => setKw(e.target.value)} placeholder="请输入关键词搜索" style={{ ...inp, width: 200 }} />
            <EpBtn variant="default" size="sm">保存条件</EpBtn>
            <EpBtn variant="ghost" size="sm" onClick={() => { setLevels([]); setFollowState('不限'); setKw('') }}>清空</EpBtn>
          </div>
        </div>
      </EpCard>

      {/* 统计条 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, margin: '14px 0' }}>
        <EpStat label="总数量" value={`${data.stat.total}条`} accent="#2563EB" />
        <EpStat label="未处理" value={`${data.stat.todo}条`} accent="#DC2626" />
        <EpStat label="处理中" value={`${data.stat.doing}条`} />
        <EpStat label="已处理" value={`${data.stat.done}条`} />
        <EpStat label="无需处理" value={`${data.stat.skip}条`} />
      </div>

      {/* 工具条 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: '#0F172A' }}>找到 <b>{rows.length}</b> 条结果</span>
        <span style={{ marginLeft: 8, display: 'inline-flex', gap: 8 }}>
          <EpBtn variant="default" size="sm">标为已读</EpBtn>
          <EpBtn variant="ghost" size="sm">已读所选</EpBtn>
          <EpBtn variant="ghost" size="sm">已读全部</EpBtn>
        </span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#64748B' }}>展示字段</span>
          {(['主体', '全字段'] as const).map((v) => (
            <span key={v} onClick={() => setView(v)} style={chip(view === v)}>{v === '主体' ? '监控主体视图' : '全字段视图'}</span>
          ))}
          <EpBtn variant="default" size="sm">导出列表</EpBtn>
          <EpBtn variant="ghost" size="sm">导出所选</EpBtn>
          <EpBtn variant="ghost" size="sm">导出全部</EpBtn>
        </span>
      </div>

      <EpCard desc={<Sam value="fkRisk.json" />}>
        <DataTable
          columns={view === '主体' ? colsSubject : colsFull}
          rows={rows as unknown as Row[]}
          selectable
          selected={selected}
          onSelectChange={setSelected}
          pager
          exportable
          exportName="风险预警"
          empty="暂无数据"
        />
      </EpCard>

      {/* 添加监控（快照：风控 - 风险预警 - 添加监控） */}
      <EpDrawer open={addOpen} onClose={() => setAddOpen(false)} title="添加监控" width={640}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {['输入粘贴上传', 'Excel上传', '客户列表导入'].map((t) => (
            <span key={t} onClick={() => setAddTab(t)} style={tab(addTab === t)}>{t}</span>
          ))}
        </div>
        <div style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>
          剩余额度 <b style={{ color: '#0F172A' }}>18</b>
          <a style={{ ...lk, marginLeft: 10 }}>添加境外企业</a>
        </div>
        {addTab === '输入粘贴上传' && (
          <>
            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>
              1、企业信息可手动输入添加，也可直接复制粘贴，如：乐视网信息技术（北京）股份有限公司
            </div>
            <textarea placeholder="请输入企业名称或选择分组" style={{ ...inp, height: 150, resize: 'vertical' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: '#94A3B8' }}>
              <span>0 / 540</span>
              <span style={{ display: 'inline-flex', gap: 10 }}>
                <a style={lk}>清空</a>
                <a style={lk}>立即匹配</a>
              </span>
            </div>
            <div style={{ marginTop: 12, border: '1px solid #F1F5F9', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 13, color: '#0F172A' }}>已选目标 <b>0</b> <span style={{ color: '#94A3B8' }}>/18</span>
                <a style={{ ...lk, marginLeft: 10, fontSize: 12 }}>下载名单</a>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: '#94A3B8' }}>您添加的企业将展示在这里</div>
            </div>
          </>
        )}
        {addTab === 'Excel上传' && (
          <div>
            <div style={{ display: 'flex', gap: 8, fontSize: 12, color: '#64748B', marginBottom: 10 }}>
              {['1 上传名单', '2 数据校验', '3 信息校验', '4 上传完成'].map((s) => (
                <span key={s} style={{ padding: '3px 10px', borderRadius: 12, background: '#F1F5F9' }}>{s}</span>
              ))}
            </div>
            <div style={{ border: '1px dashed #CBD5E1', borderRadius: 12, padding: 30, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
              将Excel文件拖拽至框内上传
              <div style={{ fontSize: 12, marginTop: 6 }}>可添加 18 个目标 · 仅支持 Excel 格式文件(xls, xlsx)</div>
              <div style={{ marginTop: 10, display: 'inline-flex', gap: 10 }}>
                <EpBtn variant="primary" size="sm">点击上传</EpBtn>
                <EpBtn variant="default" size="sm">下载样例文件</EpBtn>
              </div>
              <div style={{ marginTop: 10, fontSize: 12 }}>上传中 0% · 预计剩余时长 - 秒</div>
            </div>
            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <EpBtn variant="primary" size="sm">下一步</EpBtn>
            </div>
          </div>
        )}
        {addTab === '客户列表导入' && (
          <div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              <input placeholder="输入企业关键字" style={{ ...inp, width: 200 }} />
              <select style={{ ...inp, width: 140 }}><option>部门人员</option><option>19156027703</option></select>
              <select style={{ ...inp, width: 140 }}>
                <option>客商标签</option>
                {['开户', '存款', '贷款', '战略客户', '睡眠户', '招采贷', '科技贷'].map((t) => <option key={t}>{t}</option>)}
              </select>
              <select style={{ ...inp, width: 140 }}>
                <option>客商分组</option>
                {['未分组', '长时间未联系', '重点维护'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <DataTable
              columns={[
                { key: 'name', label: '选择本页' },
                { key: 'group', label: '分组' },
                { key: 'tag', label: '标签' },
                { key: 'owner', label: '负责人' },
                { key: 'time', label: '添加时间' },
              ]}
              rows={[
                { id: 'i1', name: '抖音有限公司', group: '未分组', tag: '开户', owner: '19156027703', time: '2026-08-17' },
                { id: 'i2', name: '深圳书读科技有限公司', group: '重点维护', tag: '贷款', owner: '19156027703', time: '2026-08-17' },
              ]}
              selectable
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#94A3B8' }}>共 2 条结果</div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
          <EpBtn variant="default" onClick={() => setAddOpen(false)}>取消</EpBtn>
          <EpBtn variant="primary" onClick={() => setAddOpen(false)}>确定</EpBtn>
        </div>
      </EpDrawer>

      {/* 风险和推送设置（快照：风控 - 风险预警 - 风险和推送设置 → 跳转到监控管理） */}
      <EpDrawer open={cfgOpen} onClose={() => setCfgOpen(false)} title="风险和推送设置" width={560}>
        <div style={{ background: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#1E3A8A' }}>
          该入口跳转到「监控管理」，在监控规则中统一维护风险项与推送方式。
        </div>
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
          <div>
            <div style={{ color: '#64748B', fontSize: 12, marginBottom: 6 }}>监控规则</div>
            <select style={inp}>
              <option>启信慧眼默认规则(国内)</option>
              <option>启信慧眼默认规则(境外)</option>
            </select>
          </div>
          <div>
            <div style={{ color: '#64748B', fontSize: 12, marginBottom: 6 }}>推送风险等级</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['高风险', '中风险', '低风险', '轻微风险', '日常资讯'].map((l) => <span key={l} style={chip(l !== '日常资讯')}>{l}</span>)}
            </div>
          </div>
          <div>
            <div style={{ color: '#64748B', fontSize: 12, marginBottom: 6 }}>推送方式</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['站内消息', '邮件', '短信', '企业微信'].map((l) => <span key={l} style={chip(l === '站内消息')}>{l}</span>)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <EpBtn variant="default" onClick={() => setCfgOpen(false)}>取 消</EpBtn>
            <EpBtn variant="primary" onClick={() => setCfgOpen(false)}>确 定</EpBtn>
          </div>
        </div>
      </EpDrawer>

      {/* 解读（快照：风控 - 风险预警 - 解读） */}
      <EpDrawer open={readOpen} onClose={() => setReadOpen(false)} title={cur ? `${cur.subject}-${cur.type}` : data.read.title} width={680}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {['标记动态', '收藏动态', '下载动态', '风险推送', '供应商', '企业风险'].map((b) => (
            <EpBtn key={b} variant="default" size="sm">{b}</EpBtn>
          ))}
          {cur?.caseLink && <EpBtn variant="primary" size="sm" onClick={() => setCaseOpen(true)}>案件串联</EpBtn>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
          <div><span style={dt}>风险等级：</span><EpTag color={LEVEL[cur?.level ?? data.read.level]?.c} bg={LEVEL[cur?.level ?? data.read.level]?.b}>{cur?.level ?? data.read.level}</EpTag></div>
          <div><span style={dt}>风险评分：</span>{cur ? `${cur.score}分` : data.read.score}</div>
          <div><span style={dt}>负责人/部门：</span>{cur?.owner ?? data.read.owner}</div>
          <div><span style={dt}>风险概览：</span><span style={{ color: '#334155' }}>{cur?.content ?? data.read.overview}</span></div>
          <div><span style={dt}>监控企业：</span><a style={lk}>{cur?.subject ?? data.read.monitorEp}</a></div>
        </div>
        <EpCard title="风险解读" desc={`深度思考 ${data.read.think}`} className="mt-3.5">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, lineHeight: 1.8 }}>
            {data.read.items.map((it) => (
              <div key={it.k}>
                <b style={{ color: '#0F172A' }}>{it.k}</b>
                <span style={{ color: '#334155' }}>：{it.v}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: '#94A3B8' }}>{data.read.footer}</div>
        </EpCard>
        <EpCard title={data.read.notice.type} className="mt-3.5">
          <dl style={{ margin: 0, fontSize: 13, display: 'grid', gridTemplateColumns: '90px 1fr', rowGap: 8 }}>
            <dt style={dt}>案号</dt><dd style={{ margin: 0 }}>{data.read.notice.caseNo}</dd>
            <dt style={dt}>公告日期</dt><dd style={{ margin: 0 }}>{data.read.notice.date}</dd>
            <dt style={dt}>案由</dt><dd style={{ margin: 0 }}>{data.read.notice.cause}</dd>
            <dt style={dt}>当事人</dt>
            <dd style={{ margin: 0 }}>
              {data.read.notice.parties.map((p) => (
                <div key={p.name}><EpTag color="#475569" bg="#F1F5F9">{p.role}</EpTag> <span style={{ marginLeft: 6 }}>{p.name}</span></div>
              ))}
            </dd>
          </dl>
        </EpCard>
      </EpDrawer>

      {/* 风险详情（快照：风控 - 风险预警 - 风险详情） */}
      <EpDrawer open={detailOpen} onClose={() => setDetailOpen(false)} title={`${cur?.subject ?? data.detail.name} 风险详情`} width={760}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>{cur?.subject ?? data.detail.name}</span>
          <EpTag color="#0F766E" bg="#CCFBF1">{data.detail.status}</EpTag>
          <span style={{ fontSize: 12, color: '#64748B' }}>{data.detail.legal} · {data.detail.capital} · {data.detail.found} · {data.detail.area}</span>
          <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 8 }}>
            <EpBtn variant="ghost" size="sm">关联地址</EpBtn>
            <EpBtn variant="ghost" size="sm">关联企业</EpBtn>
          </span>
        </div>

        <EpCard title="企业信息" pad={false}>
          <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', margin: 0 }}>
            {[
              ['信用代码', data.detail.code], ['国家/地区', data.detail.country], ['详细地址', data.detail.address],
              ['联系邮箱', data.detail.email], ['企业编号', data.detail.epNo], ['企业简称', data.detail.shortName],
              ['关联企业', data.detail.relatedEp], ['企业标签', data.detail.epTag], ['企业分组', data.detail.epGroup],
              ['负责人/部门', data.detail.owner], ['备注信息', data.detail.note], ['添加人员', data.detail.adder],
              ['添加时间', data.detail.addTime], ['监控规则', data.detail.rule],
            ].map(([k, v]) => (
              <div key={k} style={{ padding: '9px 16px', borderBottom: '1px solid #F1F5F9', fontSize: 12 }}>
                <span style={{ color: '#94A3B8', marginRight: 8 }}>{k}</span>
                <span style={{ color: '#0F172A' }}>{v}</span>
              </div>
            ))}
          </dl>
        </EpCard>

        <EpCard title="风险概览" desc="推送时间 / 发生时间 · 今日 昨日 最近7天 最近30天 更多 自定义" className="mt-3.5">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            <EpStat label="风险分数" value={data.detail.score} accent="#DC2626" />
            <EpStat label="风险总数" value={data.detail.riskTotal} />
            <EpStat label="高风险" value={data.detail.highRisk} accent="#B91C1C" />
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: '#64748B' }}>
            风险分数趋势
            <span style={{ marginLeft: 8, display: 'inline-flex', gap: 6 }}>
              {['按天', '按周', '按月'].map((t) => <span key={t} style={chip(t === '按天')}>{t}</span>)}
            </span>
            <div style={{ marginTop: 6, color: '#94A3B8' }}>2026年08月04日 · 风险分值 0 · 风险总数 0 · 已处理 0 · 风险分环比无变化</div>
          </div>
        </EpCard>

        <EpCard title="风险分布" className="mt-3.5">
          {data.detail.dist.map((g) => (
            <div key={g.type}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{g.type}{g.count}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {g.items.map((it) => (
                  <div key={it.name} style={{ border: '1px solid #F1F5F9', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ fontSize: 13 }}>{it.name} <span style={{ color: '#64748B' }}>{it.num}</span> <EpTag color={LEVEL[it.level]?.c} bg={LEVEL[it.level]?.b}>{it.level}</EpTag></div>
                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>{it.content}</div>
                    <a style={{ ...lk, fontSize: 12 }}>查看更多 &gt;</a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </EpCard>

        <EpCard title="风险动态" desc={<Sam value="fkRisk.json" />} className="mt-3.5">
          <DataTable
            columns={[
              { key: 'subject', label: '监控主体' },
              { key: 'level', label: '风险等级', render: levelCell },
              { key: 'happen', label: '发生时间' },
              { key: 'type', label: '风险类型' },
              { key: 'content', label: '风险内容', render: (r: Row) => <div style={{ maxWidth: 300, whiteSpace: 'normal' }}>{String(r.content)}</div> },
              { key: 'score', label: '风险评分' },
              { key: 'push', label: '推送时间' },
              { key: 'owner', label: '负责人' },
              { key: 'status', label: '处理状态' },
            ]}
            rows={data.rows.filter((r) => !cur || r.subject === cur.subject) as unknown as Row[]}
            empty="暂无数据"
          />
        </EpCard>
      </EpDrawer>

      {/* 案件串联（快照：风控 - 风险预警 - 风险详情 - 案件串联） */}
      <EpDrawer open={caseOpen} onClose={() => setCaseOpen(false)} title="案件详情" width={640}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{data.caseLink.title}</div>
        <div style={{ marginTop: 4, fontSize: 12, color: '#64748B' }}>{data.caseLink.ep}</div>
        <dl style={{ marginTop: 12, fontSize: 13, display: 'grid', gridTemplateColumns: '110px 1fr', rowGap: 8 }}>
          <dt style={dt}>案由：</dt><dd style={{ margin: 0 }}>{data.caseLink.cause}</dd>
          <dt style={dt}>最新审理程序：</dt><dd style={{ margin: 0 }}>{data.caseLink.process}</dd>
          <dt style={dt}>案号：</dt><dd style={{ margin: 0 }}>{data.caseLink.caseNo}</dd>
          <dt style={dt}>状态：</dt><dd style={{ margin: 0 }}>{data.caseLink.status}</dd>
          <dt style={dt}>其他：</dt><dd style={{ margin: 0 }}>{data.caseLink.others}</dd>
          <dt style={dt}>被告：</dt><dd style={{ margin: 0 }}>{data.caseLink.defendant}</dd>
          <dt style={dt}>法院：</dt><dd style={{ margin: 0 }}>{data.caseLink.court}</dd>
        </dl>
        <div style={{ marginTop: 16 }}>
          {data.caseLink.timeline.map((t) => (
            <div key={t.date} style={{ borderLeft: '2px solid #DBEAFE', paddingLeft: 14, paddingBottom: 16, position: 'relative' }}>
              <span style={{ position: 'absolute', left: -5, top: 4, width: 8, height: 8, borderRadius: 8, background: '#2563EB' }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
                {t.date} · {t.type} <a style={{ ...lk, fontSize: 12, marginLeft: 6 }}>详情 &gt;</a>
              </div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 4, lineHeight: 1.8 }}>
                <div>状态：{t.status}</div>
                <div>身份：{t.identity}</div>
                <div>{t.parties}</div>
                <div>案由：{t.cause}</div>
              </div>
            </div>
          ))}
        </div>
      </EpDrawer>
    </EpPage>
  )
}

function Row2({ label, opts, value, onChange }: { label: string; opts: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span style={{ color: '#475569', width: 84 }}>{label}</span>
      {opts.map((o) => <span key={o} onClick={() => onChange(o)} style={chip(value === o)}>{o}</span>)}
    </div>
  )
}

const chip = (on: boolean): React.CSSProperties => ({
  cursor: 'pointer',
  padding: '3px 12px',
  borderRadius: 14,
  fontSize: 12,
  border: `1px solid ${on ? '#2563EB' : '#E2E8F0'}`,
  background: on ? '#EFF6FF' : '#fff',
  color: on ? '#2563EB' : '#64748B',
})

const tab = (on: boolean): React.CSSProperties => ({
  cursor: 'pointer',
  padding: '6px 14px',
  fontSize: 13,
  borderBottom: `2px solid ${on ? '#2563EB' : 'transparent'}`,
  color: on ? '#2563EB' : '#64748B',
  fontWeight: on ? 600 : 400,
})

const dt: React.CSSProperties = { color: '#94A3B8' }
const lk: React.CSSProperties = { color: '#2563EB', cursor: 'pointer' }
const inp: React.CSSProperties = { padding: '7px 12px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13, outline: 'none', width: '100%' }
