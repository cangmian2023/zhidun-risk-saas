// 风控中心 · 风险预警（fk-risk-warning）· 1:1 复刻「风险预警」列表页
// 数据：本地样例 fkRisk.json（橘 Sam）
import { useState } from 'react'
import { EpPage, EpCard, EpStat, EpTag, EpBtn, EpDrawer, DataTable, useSample, Sam } from '../../epCommon'
import { AddMonitorDrawer } from '../components/AddMonitorDrawer'
import { RiskContentDrawer } from '../components/RiskContentDrawer'
import type { Row, Column } from '../../../../components/ui'
import { usePageNav } from '../../../pageNav'
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
  const { goDetail } = usePageNav()

  // 监控筛选
  const [timeMode, setTimeMode] = useState<'推送时间' | '发生时间'>('推送时间')
  const [range, setRange] = useState('近30天')
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
  const [owner, setOwner] = useState<string[]>([])
  const [adder, setAdder] = useState<string[]>([])
  const [related, setRelated] = useState<string[]>([])

  // 风险类型（含子维度）
  const [riskTypes, setRiskTypes] = useState<string[]>(['不限'])
  const [riskDims, setRiskDims] = useState<Record<string, string[]>>({})

  const [selected, setSelected] = useState<string[]>([])

  // 筛选下拉：同一时间只开一个
  const [openKey, setOpenKey] = useState('')

  const [addOpen, setAddOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [riskDetailOpen, setRiskDetailOpen] = useState(false)
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

  // 风险类型子维度选项
  const RISK_DIMS: Record<string, string[]> = {
    基本信息: ['地址信息', '经营范围', '法定代表人', '注册资本', '经营期限'],
    经营风险: ['股东信息', '大股东变更', '主要人员', '企业名称', '企业类型'],
    司法风险: ['被告/被上诉人/被申请人', '新增开庭公告', '新增法院公告', '被执行'],
    经营信息: ['邮箱变更', '电话变更', '网址变更'],
    企业舆情: ['业绩亏损/下降', '现金流恶化', '负面报道', '高管舆情'],
    供应链风险: ['供应商变更', '大客户流失', '供应链中断'],
    关联方风险: ['新增地址', '注册地址变更', '新增对外投资'],
    关键词舆情: ['企业征信推荐关键词', '自定义关键词'],
  }

  const rows = data.rows.filter((r) => {
    if (kw && !`${r.title ?? ''}`.includes(kw) && !`${r.content ?? ''}`.includes(kw)) return false
    if (levels.length && !levels.includes(String(r.level))) return false
    if (followState.length && !followState.includes(String(r.status))) return false
    if (riskTypes.length && !riskTypes.includes('不限') && !riskTypes.includes(String(r.type))) return false
    return true
  })

  const resetFilters = () => {
    setLevels([]); setReadState([]); setFollowState([]); setMarkState([]); setRuleState([])
    setScope([]); setRegion([]); setEpTag([]); setEpGroup([]); setOwner([]); setAdder([]); setRelated([])
    setRiskTypes(['不限']); setRiskDims({}); setKw(''); setRange('近30天')
  }

  // 已选条件 chips
  const chips: { label: string; text: string; onRemove: () => void }[] = [
    { label: timeMode, text: range, onRemove: () => { setTimeMode('推送时间'); setRange('近30天') } },
    ...(levels.length ? [{ label: '风险等级', text: levels.join('、'), onRemove: () => setLevels([]) }] : []),
    ...(readState.length ? [{ label: '阅读状态', text: readState.join('、'), onRemove: () => setReadState([]) }] : []),
    ...(followState.length ? [{ label: '跟进状态', text: followState.join('、'), onRemove: () => setFollowState([]) }] : []),
    ...(markState.length ? [{ label: '标记动态', text: markState.join('、'), onRemove: () => setMarkState([]) }] : []),
    ...(ruleState.length ? [{ label: '监控规则', text: ruleState.join('、'), onRemove: () => setRuleState([]) }] : []),
    ...(scope.length ? [{ label: '国内/境外', text: scope.join('、'), onRemove: () => setScope([]) }] : []),
    ...(region.length ? [{ label: '国家地区', text: region.join('、'), onRemove: () => setRegion([]) }] : []),
    ...(epTag.length ? [{ label: '企业标签', text: epTag.join('、'), onRemove: () => setEpTag([]) }] : []),
    ...(epGroup.length ? [{ label: '企业分组', text: epGroup.join('、'), onRemove: () => setEpGroup([]) }] : []),
    ...(owner.length ? [{ label: '负责人/部门', text: owner.join('、'), onRemove: () => setOwner([]) }] : []),
    ...(adder.length ? [{ label: '添加人', text: adder.join('、'), onRemove: () => setAdder([]) }] : []),
    ...(related.length ? [{ label: '关联企业', text: related.join('、'), onRemove: () => setRelated([]) }] : []),
    ...(riskTypes.filter((t) => t !== '不限').length ? [{ label: '风险类型', text: riskTypes.filter((t) => t !== '不限').join('、'), onRemove: () => setRiskTypes(['不限']) }] : []),
    ...(Object.entries(riskDims).filter(([, v]) => v.length).map(([k, v]) => ({ label: k, text: v.join('、'), onRemove: () => { const n = { ...riskDims }; delete n[k]; setRiskDims(n) } }))),
  ]

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
      style={{ maxWidth: 640, minWidth: 380, whiteSpace: 'normal', lineHeight: 1.7, cursor: 'pointer' }}
      onClick={() => { setCur(r as unknown as RiskRow); setRiskDetailOpen(true) }}
    >
      <div style={{ color: '#0F172A', fontWeight: 500, fontSize: 13, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{String(r.title)}</div>
      <div style={{ color: '#64748B', fontSize: 12, marginTop: 3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{String(r.content)}</div>
    </div>
  )

  const opCell = (r: Row) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', fontSize: 13 }}>
      <a style={lk} onClick={() => { setCur(r as unknown as RiskRow); setRiskDetailOpen(true) }}>解读</a>
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
    { key: 'op', label: '操作', width: '90px', fixed: 'right', render: opCell },
  ]

  return (
    <EpPage
      title="风险预警"
      crumb="风控中心 / 风险预警"
      actions={
        <span style={{ display: 'inline-flex', gap: 8 }}>
          <EpBtn variant="default" onClick={() => goDetail('/console/ep/fk-monitor-manage')}>风险和推送设置</EpBtn>
          <EpBtn variant="primary" onClick={() => setAddOpen(true)}>+ 添加监控</EpBtn>
        </span>
      }
    >
      {/* 筛选区 */}
      <EpCard pad={false}>
        <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
          {/* 监控筛选 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 18px' }}>
            <span style={{ color: '#0F172A', fontWeight: 600, marginRight: 2, minWidth: 64 }}>监控筛选</span>
            <FilterChip
              k="push" kind="radio" label="推送时间" active={timeMode === '推送时间'} open={openKey === 'push'}
              onOpen={(kk) => setOpenKey(openKey === kk ? '' : kk)}
              onLabel={() => { setTimeMode('推送时间'); setOpenKey('push') }}
              panel={
                <>
                  {['近7天', '近30天', '自定义'].map((r) => (
                    <FilterRadioOpt key={r} label={r} checked={range === r} onChange={() => { setRange(r); setOpenKey('') }} />
                  ))}
                </>
              }
            />
            <FilterChip
              k="happen" kind="radio" label="发生时间" active={timeMode === '发生时间'} open={openKey === 'happen'}
              onOpen={(kk) => setOpenKey(openKey === kk ? '' : kk)}
              onLabel={() => { setTimeMode('发生时间'); setOpenKey('happen') }}
              panel={
                <>
                  {['近7天', '近30天', '自定义'].map((r) => (
                    <FilterRadioOpt key={r} label={r} checked={range === r} onChange={() => { setRange(r); setOpenKey('') }} />
                  ))}
                </>
              }
            />
            <FilterChip
              k="level" kind="check" label="风险等级" active={levels.length > 0} open={openKey === 'level'}
              onOpen={(kk) => setOpenKey(openKey === kk ? '' : kk)}
              panel={
                <>
                  {['高风险', '中风险', '低风险', '轻微风险'].map((o) => (
                    <FilterOpt key={o} label={o} checked={levels.includes(o)} onChange={() => toggle(levels, setLevels, o)} />
                  ))}
                </>
              }
            />
            <FilterChip
              k="read" kind="check" label="阅读状态" active={readState.length > 0} open={openKey === 'read'}
              onOpen={(kk) => setOpenKey(openKey === kk ? '' : kk)}
              panel={
                <>
                  {['已读', '未读'].map((o) => (
                    <FilterOpt key={o} label={o} checked={readState.includes(o)} onChange={() => toggle(readState, setReadState, o)} />
                  ))}
                </>
              }
            />
            <FilterChip
              k="follow" kind="check" label="跟进状态" active={followState.length > 0} open={openKey === 'follow'}
              onOpen={(kk) => setOpenKey(openKey === kk ? '' : kk)}
              panel={
                <>
                  {['未处理', '处理中', '已处理', '无需处理'].map((o) => (
                    <FilterOpt key={o} label={o} checked={followState.includes(o)} onChange={() => toggle(followState, setFollowState, o)} />
                  ))}
                </>
              }
            />
            <FilterChip
              k="mark" kind="check" label="标记动态" active={markState.length > 0} open={openKey === 'mark'}
              onOpen={(kk) => setOpenKey(openKey === kk ? '' : kk)}
              panel={
                <>
                  {['重点关注风险', '存在信用风险', '重大工商变更', '外部供应链风险'].map((o) => (
                    <FilterOpt key={o} label={o} checked={markState.includes(o)} onChange={() => toggle(markState, setMarkState, o)} />
                  ))}
                </>
              }
            />
            <FilterChip
              k="rule" kind="check" label="监控规则" active={ruleState.length > 0} open={openKey === 'rule'}
              onOpen={(kk) => setOpenKey(openKey === kk ? '' : kk)}
              panel={
                <>
                  {['企业征信默认规则(国内)', '企业征信默认规则(境外)', '外部供应链风险'].map((o) => (
                    <FilterOpt key={o} label={o} checked={ruleState.includes(o)} onChange={() => toggle(ruleState, setRuleState, o)} />
                  ))}
                </>
              }
            />
          </div>

          {/* 企业筛选 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 18px' }}>
            <span style={{ color: '#0F172A', fontWeight: 600, marginRight: 2, minWidth: 64 }}>企业筛选</span>
            <FilterChip
              k="scope" kind="check" label="国内/境外" active={scope.length > 0} open={openKey === 'scope'}
              onOpen={(kk) => setOpenKey(openKey === kk ? '' : kk)}
              panel={
                <>
                  {['国内', '境外'].map((o) => (
                    <FilterOpt key={o} label={o} checked={scope.includes(o)} onChange={() => toggle(scope, setScope, o)} />
                  ))}
                </>
              }
            />
            <FilterChip
              k="region" kind="check" label="国家地区" active={region.length > 0} open={openKey === 'region'}
              onOpen={(kk) => setOpenKey(openKey === kk ? '' : kk)}
              panel={
                <>
                  {['中国', '德国', '美国'].map((o) => (
                    <FilterOpt key={o} label={o} checked={region.includes(o)} onChange={() => toggle(region, setRegion, o)} />
                  ))}
                </>
              }
            />
            <FilterChip
              k="tag" kind="check" label="企业标签" active={epTag.length > 0} open={openKey === 'tag'}
              onOpen={(kk) => setOpenKey(openKey === kk ? '' : kk)}
              panel={
                <>
                  {['存款', '贷款', '战略客户', '睡眠户', '招采贷', '科技贷'].map((o) => (
                    <FilterOpt key={o} label={o} checked={epTag.includes(o)} onChange={() => toggle(epTag, setEpTag, o)} />
                  ))}
                </>
              }
            />
            <FilterChip
              k="group" kind="check" label="企业分组" active={epGroup.length > 0} open={openKey === 'group'}
              onOpen={(kk) => setOpenKey(openKey === kk ? '' : kk)}
              panel={
                <>
                  {['未分组', '长时间未联系', '重点维护'].map((o) => (
                    <FilterOpt key={o} label={o} checked={epGroup.includes(o)} onChange={() => toggle(epGroup, setEpGroup, o)} />
                  ))}
                </>
              }
            />
            <FilterChip
              k="owner" kind="check" label="负责人/部门" active={owner.length > 0} open={openKey === 'owner'}
              onOpen={(kk) => setOpenKey(openKey === kk ? '' : kk)}
              panel={
                <>
                  {['19156027703'].map((o) => (
                    <FilterOpt key={o} label={o} checked={owner.includes(o)} onChange={() => toggle(owner, setOwner, o)} />
                  ))}
                </>
              }
            />
            <FilterChip
              k="adder" kind="check" label="添加人" active={adder.length > 0} open={openKey === 'adder'}
              onOpen={(kk) => setOpenKey(openKey === kk ? '' : kk)}
              panel={
                <>
                  {['19156027703'].map((o) => (
                    <FilterOpt key={o} label={o} checked={adder.includes(o)} onChange={() => toggle(adder, setAdder, o)} />
                  ))}
                </>
              }
            />
            <FilterChip
              k="related" kind="check" label="关联企业" active={related.length > 0} open={openKey === 'related'}
              onOpen={(kk) => setOpenKey(openKey === kk ? '' : kk)}
              panel={
                <>
                  {['比亚迪股份有限公司', '宁德时代新能源科技股份有限公司', '华为技术有限公司'].map((o) => (
                    <FilterOpt key={o} label={o} checked={related.includes(o)} onChange={() => toggle(related, setRelated, o)} />
                  ))}
                </>
              }
            />
          </div>

          {/* 风险类型 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 18px' }}>
            <span style={{ color: '#0F172A', fontWeight: 600, marginRight: 2, minWidth: 64 }}>风险类型</span>
            {RISK_TYPE_LIST.map((t) =>
              t === '不限' ? (
                <FilterChip
                  key={t} k={`t-${t}`} kind="check" label={t} active={riskTypes.includes(t)} open={false}
                  onOpen={() => {}} onLabel={() => toggle(riskTypes, setRiskTypes, t)}
                />
              ) : (
                <FilterChip
                  key={t} k={`t-${t}`} kind="check" label={t} active={riskTypes.includes(t)} open={openKey === `t-${t}`}
                  onOpen={(kk) => setOpenKey(openKey === kk ? '' : kk)}
                  onLabel={() => toggle(riskTypes, setRiskTypes, t)}
                  panel={
                    <>
                      {(RISK_DIMS[t] ?? []).map((dim) => {
                        const dims = riskDims[t] ?? []
                        return (
                          <FilterOpt key={dim} label={dim} checked={dims.includes(dim)} onChange={() => {
                            const n = { ...riskDims, [t]: dims.includes(dim) ? dims.filter((x) => x !== dim) : [...dims, dim] }
                            setRiskDims(n)
                          }} />
                        )
                      })}
                    </>
                  }
                />
              )
            )}
          </div>

          {/* 已选条件 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px dashed #E2E8F0', paddingTop: 12, flexWrap: 'wrap' }}>
            <span style={{ color: '#475569' }}>已选条件</span>
            {chips.map((c, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', background: '#F2F3F5', borderRadius: 4, fontSize: 12, color: '#4E5969' }}>
                {c.label}：{c.text}
                <span style={{ marginLeft: 2, cursor: 'pointer', color: '#86909C' }} onClick={c.onRemove}>×</span>
              </span>
            ))}
            <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 10 }}>
              <a style={lk}>保存条件</a>
              <a style={lk} onClick={resetFilters}>清空</a>
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

      {/* 风险内容 / AI 解读 共用最终版弹窗 */}
      <RiskContentDrawer
        open={riskDetailOpen}
        row={cur ? (cur as unknown as Record<string, any>) : null}
        read={data.read as any}
        onClose={() => setRiskDetailOpen(false)}
        onCase={() => setCaseOpen(true)}
        onCompanyRisk={() => { setRiskDetailOpen(false); setDetailOpen(true) }}
      />
    </EpPage>
  )
}

function CareIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

/* 文档风筛选条件：图标 + 标签 + 下拉面板 */
function FilterChip({ k, kind, label, active, open, onOpen, onLabel, panel }: {
  k: string
  kind: 'radio' | 'check'
  label: string
  active: boolean
  open: boolean
  onOpen: (k: string) => void
  onLabel?: () => void
  panel?: React.ReactNode
}) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <span
        onClick={() => (onLabel ? onLabel() : onOpen(k))}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: '#4E5969', userSelect: 'none', whiteSpace: 'nowrap' }}
      >
        {kind === 'radio' ? (
          <span style={{ width: 14, height: 14, borderRadius: '50%', border: `1px solid ${active ? '#165DFF' : '#C9CDD4'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
            {active && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#165DFF' }} />}
          </span>
        ) : (
          <span style={{ width: 14, height: 14, borderRadius: 3, border: `1px solid ${active ? '#165DFF' : '#C9CDD4'}`, background: active ? '#165DFF' : '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            {active && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </span>
        )}
        <span style={{ color: active ? '#165DFF' : '#4E5969' }}>{label}</span>
        {panel !== undefined && <span style={{ display: 'inline-flex', color: active ? '#165DFF' : '#C9CDD4' }}><CareIcon /></span>}
      </span>
      {open && panel !== undefined && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 39 }} onClick={() => onOpen('')} />
          <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 40, minWidth: 176, marginTop: 4, background: '#fff', border: '1px solid #E5E6EB', borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', padding: 6 }}>
            {panel}
          </div>
        </>
      )}
    </span>
  )
}

function FilterOpt({ label, checked, onChange, indent }: { label: string; checked: boolean; onChange: () => void; indent?: boolean }) {
  return (
    <div
      onClick={onChange}
      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 13, color: checked ? '#165DFF' : '#1D2129', marginLeft: indent ? 14 : 0 }}
    >
      <span style={{ width: 14, height: 14, borderRadius: 3, border: `1px solid ${checked ? '#165DFF' : '#C9CDD4'}`, background: checked ? '#165DFF' : '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {checked && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      <span>{label}</span>
    </div>
  )
}

function FilterRadioOpt({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <div onClick={onChange} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 13, color: checked ? '#165DFF' : '#1D2129' }}>
      <span style={{ width: 14, height: 14, borderRadius: '50%', border: `1px solid ${checked ? '#165DFF' : '#C9CDD4'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {checked && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#165DFF' }} />}
      </span>
      <span>{label}</span>
    </div>
  )
}

const RISK_TYPE_LIST = ['不限', '基本信息', '经营风险', '司法风险', '经营信息', '企业舆情', '供应链风险', '关联方风险', '关键词舆情']

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
