// 风控中心 · 风险预警（fk-risk-warning）· 1:1 复刻「风险预警」列表页
// 数据：本地样例 fkRisk.json（橘 Sam）
import { useState } from 'react'
import { EpPage, EpCard, EpStat, EpTag, EpBtn, EpDrawer, DataTable, useSample, Sam } from '../../epCommon'
import { AddMonitorDrawer } from '../components/AddMonitorDrawer'
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

export default function FkRiskWarning({ params }: { params: URLSearchParams }) {
  const [data] = useSample('fkRisk.json', seedJson)
  const [kw, setKw] = useState(params.get('kw') || '')

  // 监控筛选
  const [timeMode, setTimeMode] = useState<'推送时间' | '发生时间'>('推送时间')
  const [levels, setLevels] = useState<string[]>([])
  const [readState, setReadState] = useState<string[]>([])
  const [followState, setFollowState] = useState<string[]>([])
  const [markState, setMarkState] = useState<string[]>([])
  const [ruleState, setRuleState] = useState<string[]>([])

  // 企业筛选
  const [scope, setScope] = useState<string[]>([])
  const [region, setRegion] = useState<string[]>([])
  const [epTag, setEpTag] = useState<string[]>([])
  const [epGroup, setEpGroup] = useState<string[]>([])
  const [owner, setOwner] = useState('')
  const [adder, setAdder] = useState('')
  const [related, setRelated] = useState('')

  // 风险类型
  const [riskTypes, setRiskTypes] = useState<string[]>(['不限'])

  const [selected, setSelected] = useState<string[]>([])

  const [addOpen, setAddOpen] = useState(false)
  const [cfgOpen, setCfgOpen] = useState(false)
  const [readOpen, setReadOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [riskDetailOpen, setRiskDetailOpen] = useState(false)
  const [aiExpand, setAiExpand] = useState(true)
  const [caseOpen, setCaseOpen] = useState(false)
  const [cur, setCur] = useState<RiskRow | null>(null)

  const toggle = (list: string[], setList: (v: string[]) => void, v: string) => {
    if (v === '不限') {
      setList(list.includes('不限') ? [] : ['不限'])
      return
    }
    const next = list.includes('不限') ? [v] : list.includes(v) ? list.filter((x) => x !== v) : [...list, v]
    setList(next)
  }

  const rows = data.rows.filter((r) => {
    if (kw && !r.subject.includes(kw) && !r.content.includes(kw) && !r.title.includes(kw)) return false
    if (levels.length && !levels.includes(r.level)) return false
    return true
  })

  const levelCell = (r: Row) => {
    const l = String(r.level)
    return <EpTag color={LEVEL[l]?.c} bg={LEVEL[l]?.b}>{l}</EpTag>
  }

  const typeCell = (r: Row) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#475569' }}>
      <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#F59E0B', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
      </span>
      {String(r.type)}
    </span>
  )

  const contentCell = (r: Row) => (
    <div
      style={{ maxWidth: 520, whiteSpace: 'normal', lineHeight: 1.6, cursor: 'pointer' }}
      onClick={() => { setCur(r as unknown as RiskRow); setRiskDetailOpen(true) }}
    >
      <div style={{ color: '#0F172A', fontWeight: 500, fontSize: 13 }}>{String(r.title)}</div>
      <div style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>{String(r.content)}</div>
    </div>
  )

  const opCell = (r: Row) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', fontSize: 13 }}>
      <a style={lk} onClick={() => { setCur(r as unknown as RiskRow); setReadOpen(true) }}>AI 解读</a>
      <span style={{ color: '#CBD5E1' }}>|</span>
      <a style={lk}>推送</a>
      <span style={{ color: '#CBD5E1' }}>|</span>
      <a style={lk}>更多</a>
    </span>
  )

  const cols: Column[] = [
    { key: 'push', label: '推送时间', width: '110px' },
    { key: 'level', label: '风险等级', width: '90px', render: levelCell },
    { key: 'type', label: '风险类型', width: '130px', render: typeCell },
    { key: 'content', label: '风险内容', render: contentCell },
    { key: 'score', label: '风险评分', width: '90px', align: 'center' },
    { key: 'affectEp', label: '影响企业', width: '150px' },
    { key: 'affectArea', label: '影响地区', width: '110px' },
    { key: 'happen', label: '发生时间', width: '110px' },
    { key: 'owner', label: '负责人', width: '110px' },
    { key: 'status', label: '处理状态', width: '100px' },
    { key: 'doneTime', label: '处理完成时间', width: '130px' },
    { key: 'cycle', label: '处理周期（天）', width: '120px', align: 'center' },
    { key: 'op', label: '操作', width: '150px', fixed: 'right', render: opCell },
  ]

  const filterChip = (on: boolean) => ({
    cursor: 'pointer',
    padding: '2px 10px',
    borderRadius: 12,
    fontSize: 12,
    border: `1px solid ${on ? '#2563EB' : '#E2E8F0'}`,
    background: on ? '#EFF6FF' : '#fff',
    color: on ? '#2563EB' : '#475569',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  } as React.CSSProperties)

  return (
    <EpPage
      title="风险预警 AI"
      crumb="风控中心 / 风险预警"
      actions={
        <span style={{ display: 'inline-flex', gap: 8 }}>
          <EpBtn variant="default" onClick={() => setCfgOpen(true)}>风险和推送设置</EpBtn>
          <EpBtn variant="primary" onClick={() => setAddOpen(true)}>+ 添加监控</EpBtn>
        </span>
      }
    >
      {/* 筛选区 */}
      <EpCard pad={false}>
        <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
          {/* 监控筛选 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 16px' }}>
            <span style={{ color: '#0F172A', fontWeight: 600, marginRight: 4 }}>监控筛选</span>
            <RadioGroup label="" options={['推送时间', '发生时间']} value={timeMode} onChange={(v) => setTimeMode(v as typeof timeMode)} />
            <CheckboxGroup label="风险等级" options={['高风险', '中风险', '低风险', '轻微风险']} value={levels} onChange={(v) => toggle(levels, setLevels, v)} />
            <CheckboxGroup label="阅读状态" options={['已读', '未读']} value={readState} onChange={(v) => toggle(readState, setReadState, v)} />
            <CheckboxGroup label="跟进状态" options={['未处理', '处理中', '已处理', '无需处理']} value={followState} onChange={(v) => toggle(followState, setFollowState, v)} />
            <CheckboxGroup label="标记动态" options={['重点关注风险', '存在信用风险', '重大工商变更', '外部供应链风险']} value={markState} onChange={(v) => toggle(markState, setMarkState, v)} />
            <CheckboxGroup label="监控规则" options={['启信慧眼默认规则(国内)', '启信慧眼默认规则(境外)', '外部供应链风险']} value={ruleState} onChange={(v) => toggle(ruleState, setRuleState, v)} />
          </div>

          {/* 企业筛选 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 16px' }}>
            <span style={{ color: '#0F172A', fontWeight: 600, marginRight: 4 }}>企业筛选</span>
            <CheckboxGroup label="" options={['国内', '境外']} value={scope} onChange={(v) => toggle(scope, setScope, v)} />
            <CheckboxGroup label="国家地区" options={['中国', '德国', '美国']} value={region} onChange={(v) => toggle(region, setRegion, v)} />
            <CheckboxGroup label="企业标签" options={['全选', '默认分组']} value={epTag} onChange={(v) => toggle(epTag, setEpTag, v)} />
            <CheckboxGroup label="企业分组" options={['未分组', '长时间未联系', '重点维护']} value={epGroup} onChange={(v) => toggle(epGroup, setEpGroup, v)} />
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#475569' }}>
              负责人/部门
              <select style={{ ...inp, width: 130 }} value={owner} onChange={(e) => setOwner(e.target.value)}>
                <option value="">请选择</option>
                <option>19156027703</option>
              </select>
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#475569' }}>
              添加人
              <select style={{ ...inp, width: 130 }} value={adder} onChange={(e) => setAdder(e.target.value)}>
                <option value="">请选择</option>
                <option>19156027703</option>
              </select>
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#475569' }}>
              关联企业
              <input placeholder="请输入企业名称" style={{ ...inp, width: 160 }} value={related} onChange={(e) => setRelated(e.target.value)} />
            </label>
          </div>

          {/* 风险类型 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 16px' }}>
            <span style={{ color: '#0F172A', fontWeight: 600, marginRight: 4 }}>风险类型</span>
            <CheckboxGroup label="" options={['不限', '基本信息', '经营风险', '司法风险', '经营信息', '企业舆情', '供应链风险', '关联方风险', '关键词舆情']} value={riskTypes} onChange={(v) => toggle(riskTypes, setRiskTypes, v)} />
          </div>

          {/* 已选条件 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px dashed #E2E8F0', paddingTop: 12, flexWrap: 'wrap' }}>
            <span style={{ color: '#475569' }}>已选条件</span>
            <EpTag>
              <span style={{ color: '#475569' }}>{timeMode}：</span>
              <span style={{ color: '#2563EB' }}>{data.range}</span>
              <span style={{ marginLeft: 6, cursor: 'pointer', color: '#94A3B8' }}>×</span>
            </EpTag>
            <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 10 }}>
              <a style={lk}>保存条件</a>
              <a style={lk} onClick={() => {
                setLevels([]); setReadState([]); setFollowState([]); setMarkState([]); setRuleState([])
                setScope([]); setRegion([]); setEpTag([]); setEpGroup([]); setOwner(''); setAdder(''); setRelated('')
                setRiskTypes(['不限']); setKw('')
              }}>清空</a>
            </span>
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

      {/* 结果工具条 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: '#0F172A' }}>找到 <b>{rows.length}</b> 条结果</span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'inline-flex', gap: 2 }}>
            <button style={iconBtn}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></button>
            <button style={iconBtn}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg></button>
          </span>
          <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" style={{ position: 'absolute', left: 8 }}><circle cx="11" cy="11" r="8"/><path d="M21 21L16.65 16.65"/></svg>
            <input placeholder="请输入企业名称" style={{ ...inp, width: 180, paddingLeft: 28 }} value={kw} onChange={(e) => setKw(e.target.value)} />
          </span>
          <EpBtn variant="default" size="sm">标为已读</EpBtn>
          <EpBtn variant="default" size="sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
            展示字段
          </EpBtn>
          <EpBtn variant="default" size="sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            导出列表
          </EpBtn>
        </span>
      </div>

      <EpCard desc={<Sam value="fkRisk.json" />}>
        <DataTable
          columns={cols}
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

      {/* 添加监控 · 与监控列表页共用同一弹窗 */}
      <AddMonitorDrawer open={addOpen} onClose={() => setAddOpen(false)} />

      {/* 风险和推送设置 */}
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
              {['高风险', '中风险', '低风险', '轻微风险', '日常资讯'].map((l) => <span key={l} style={filterChip(l !== '日常资讯')}>{l}</span>)}
            </div>
          </div>
          <div>
            <div style={{ color: '#64748B', fontSize: 12, marginBottom: 6 }}>推送方式</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['站内消息', '邮件', '短信', '企业微信'].map((l) => <span key={l} style={filterChip(l === '站内消息')}>{l}</span>)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <EpBtn variant="default" onClick={() => setCfgOpen(false)}>取 消</EpBtn>
            <EpBtn variant="primary" onClick={() => setCfgOpen(false)}>确 定</EpBtn>
          </div>
        </div>
      </EpDrawer>

      {/* AI 解读 */}
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

      {/* 风险详情 */}
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
      </EpDrawer>

      {/* 案件串联 */}
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

      {/* 风险预警详情（点击列表「风险内容」字段弹出） */}
      <EpDrawer open={riskDetailOpen} onClose={() => setRiskDetailOpen(false)} width={760}>
        {cur && (() => {
          const d = (cur as unknown as Record<string, any>).detail as
            | {
                tag?: string
                overview?: string
                aiReading?: { status?: string; generating?: boolean; items?: string[] }
                happenTime?: string
                riskType?: string
                affectRegions?: string[]
                articleTitle?: string
                article?: string
              }
            | undefined
          return (
            <div>
              {/* 顶部：类型标签 + 标题 + 操作按钮 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
                {d?.tag && <EpTag color="#C2410C" bg="#FFEDD5">{d.tag}</EpTag>}
                <div style={{ flex: 1, minWidth: 280, fontSize: 16, fontWeight: 700, color: '#0F172A', lineHeight: 1.5 }}>{String(cur.title)}</div>
                <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 8 }}>
                  <EpBtn variant="ghost" size="sm">更多</EpBtn>
                  <EpBtn variant="ghost" size="sm">风险推送</EpBtn>
                  <EpBtn variant="primary" size="sm" onClick={() => { setRiskDetailOpen(false); setDetailOpen(true) }}>企业风险</EpBtn>
                </span>
              </div>

              {/* 中部：风险等级 / 评分 / 负责人 */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 13, marginBottom: 12 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#94A3B8' }}>风险等级：</span>
                  <EpTag color={LEVEL[String(cur.level)]?.c} bg={LEVEL[String(cur.level)]?.b}>{String(cur.level)}</EpTag>
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#94A3B8' }}>风险评分：</span>
                  <b style={{ color: '#0F172A' }}>{cur.score}分</b>
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#94A3B8' }}>负责人：</span>
                  <span style={{ color: '#0F172A' }}>{String(cur.owner)}</span>
                </span>
              </div>
              <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.8, background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: 10, padding: '12px 14px', marginBottom: 14, whiteSpace: 'normal' }}>
                {d?.overview ?? String(cur.content)}
              </div>

              {/* AI 风险解读折叠面板 */}
              <EpCard
                title={
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span>AI 风险解读</span>
                    <span style={{ padding: '1px 8px', borderRadius: 10, fontSize: 11, background: d?.aiReading?.generating ? '#FEF3C7' : '#DCFCE7', color: d?.aiReading?.generating ? '#92400E' : '#166534' }}>
                      {d?.aiReading?.generating ? '解读中...' : 'AI生成'}
                    </span>
                  </span>
                }
                desc={
                  <span style={{ cursor: 'pointer', fontSize: 12, color: '#2563EB' }} onClick={() => setAiExpand((v) => !v)}>
                    {aiExpand ? '收起' : '展开'}
                  </span>
                }
              >
                {aiExpand && (
                  <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.9 }}>
                    {(d?.aiReading?.items ?? ['正在为您解读']).map((it, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8 }}>
                        <span style={{ color: '#94A3B8' }}>·</span>
                        <span>{it}</span>
                      </div>
                    ))}
                  </div>
                )}
              </EpCard>

              {/* 底部分栏：发生时间 / 风险类型 / 风险等级 / 影响范围 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, margin: '14px 0' }}>
                <div style={{ border: '1px solid #F1F5F9', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>发生时间</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginTop: 4 }}>{d?.happenTime ?? String(cur.happen)}</div>
                </div>
                <div style={{ border: '1px solid #F1F5F9', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>风险类型</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginTop: 4 }}>{d?.riskType ?? String(cur.type)}</div>
                </div>
                <div style={{ border: '1px solid #F1F5F9', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>风险等级</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginTop: 4 }}>
                    <EpTag color={LEVEL[String(cur.level)]?.c} bg={LEVEL[String(cur.level)]?.b}>{String(cur.level)}</EpTag>
                  </div>
                </div>
                <div style={{ border: '1px solid #F1F5F9', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>影响范围</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginTop: 4 }}>{(d?.affectRegions ?? []).join('、') || '-'}</div>
                </div>
              </div>

              {/* 正文区：详细原文 + 查看原文 */}
              <EpCard title={d?.articleTitle ?? String(cur.title)}>
                <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{d?.article ?? String(cur.content)}</div>
                <a style={{ ...lk, fontSize: 12, marginTop: 8, display: 'inline-block' }}>查看原文 &gt;</a>
              </EpCard>
            </div>
          )
        })()}
      </EpDrawer>
    </EpPage>
  )
}

function RadioGroup({ label, options, value, onChange }: { label?: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      {label && <span style={{ color: '#475569' }}>{label}</span>}
      {options.map((o) => (
        <label key={o} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 13, color: '#475569' }}>
          <span style={{ width: 14, height: 14, borderRadius: '50%', border: `1px solid ${value === o ? '#2563EB' : '#CBD5E1'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            {value === o && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563EB' }} />}
          </span>
          <span onClick={() => onChange(o)}>{o}</span>
        </label>
      ))}
    </span>
  )
}

function CheckboxGroup({ label, options, value, onChange }: { label?: string; options: string[]; value: string[]; onChange: (v: string) => void }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      {label && <span style={{ color: '#475569' }}>{label}</span>}
      {options.map((o) => {
        const checked = value.includes(o)
        return (
          <label key={o} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 13, color: '#475569' }}>
            <span style={{ width: 14, height: 14, borderRadius: 3, border: `1px solid ${checked ? '#2563EB' : '#CBD5E1'}`, background: checked ? '#2563EB' : '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              {checked && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
            <span onClick={() => onChange(o)}>{o}</span>
          </label>
        )
      })}
    </span>
  )
}

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
const iconBtn: React.CSSProperties = { width: 28, height: 28, border: '1px solid #E2E8F0', background: '#fff', borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }

function SortIcon() {
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', lineHeight: 0.6 }}>
      <svg width="8" height="5" viewBox="0 0 24 24" fill="#94A3B8"><path d="M12 4l8 8H4z"/></svg>
      <svg width="8" height="5" viewBox="0 0 24 24" fill="#94A3B8"><path d="M12 20l-8-8h16z"/></svg>
    </span>
  )
}

function FilterIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  )
}
