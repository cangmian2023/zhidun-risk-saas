// 风控中心 · 账户年检（fk-account-yearly）· 1:1 复刻「风控 - 账户年检」
// 列表：第一列企业名称，其余维度列用 ✅/❌ 呈现通过/不通过
// 详情弹窗：参考「企业风控 - 账户年检 - 详情弹窗.md」按维度分组 1:1 复刻
// 数据：本地样例 fkYearly.json（橘 Sam）
import { useState } from 'react';
import { EpPage, EpCard, EpBtn, EpDrawer, DataTable, useSample } from '../../epCommon';
import type { Row, Column } from '../../../../components/ui';
import seedJson from '../../../fkYearly.json'

// 体检维度（排除"企业名称"，其作为首列）
const DIMS = ['经营状态', '经营期限', '注册资本', '经营范围', '经营地址', '联系电话', '法定代表人', '股东', '主要人员', '经营异常', '严重违法失信', '行政处罚']

function markStyle(ok: boolean): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 20, height: 20, borderRadius: '50%', fontSize: 12, lineHeight: 1,
    color: '#fff', background: ok ? '#16A34A' : '#DC2626',
  }
}
const failMark = <span style={markStyle(false)}>✕</span>
const passMark = <span style={markStyle(true)}>✓</span>

// 详情弹窗数据（参考文档，按维度分组）
const DETAIL: Record<string, { title: string; result: '通过' | '不通过'; items: { k: string; v: string; ok: boolean }[] }[]> = {
  抖音有限公司: [
    { title: '基本信息', result: '通过', items: [
      { k: '企业名称', v: '抖音有限公司', ok: true },
      { k: '统一社会信用代码', v: '91110108MA01C4X91H', ok: true },
      { k: '企业类型', v: '有限责任公司(法人独资)', ok: true },
      { k: '法定代表人', v: '银平', ok: true },
      { k: '注册资本', v: '10000 万人民币', ok: true },
      { k: '成立日期', v: '2016-05-04', ok: true },
      { k: '经营状态', v: '存续（在营、开业、在册）', ok: true },
      { k: '经营期限', v: '2016-05-04 ~ 2036-05-03', ok: true },
      { k: '登记机关', v: '北京市海淀区市场监督管理局', ok: true },
    ] },
    { title: '资质资格', result: '通过', items: [
      { k: '资质资格异常', v: '未匹配到资质资格异常信息', ok: true },
    ] },
    { title: '行政处罚', result: '通过', items: [
      { k: '行政处罚记录', v: '未匹配到行政处罚记录', ok: true },
    ] },
    { title: '经营范围', result: '通过', items: [
      { k: '经营范围', v: '技术开发、技术推广、技术转让、技术咨询、技术服务；计算机系统服务；设计、制作、代理、发布广告等', ok: true },
    ] },
    { title: '经营地址', result: '通过', items: [
      { k: '经营地址', v: '北京市海淀区北三环西路甲23号院1号楼3层327', ok: true },
    ] },
    { title: '联系电话', result: '通过', items: [
      { k: '联系电话', v: '010-58341751、010-58341796', ok: true },
    ] },
    { title: '法定代表人', result: '通过', items: [
      { k: '法定代表人', v: '银平', ok: true },
      { k: '变更记录', v: '未匹配到异常变更', ok: true },
    ] },
    { title: '股东', result: '通过', items: [
      { k: '股东', v: '厦门星辰启点科技有限公司、张利东', ok: true },
    ] },
    { title: '主要人员', result: '通过', items: [
      { k: '主要人员', v: '银平、李雪、夏绪宏', ok: true },
    ] },
    { title: '经营异常', result: '通过', items: [
      { k: '经营异常', v: '未匹配到经营异常记录', ok: true },
    ] },
    { title: '严重违法失信', result: '通过', items: [
      { k: '严重违法失信', v: '未匹配到严重违法失信记录', ok: true },
    ] },
  ],
  抖音视界有限公司: [
    { title: '基本信息', result: '通过', items: [
      { k: '企业名称', v: '抖音视界有限公司', ok: true },
      { k: '统一社会信用代码', v: '91110108MA01D7Y85K', ok: true },
      { k: '法定代表人', v: '银平', ok: true },
      { k: '注册资本', v: '100 万人民币', ok: true },
      { k: '成立日期', v: '2018-11-20', ok: true },
      { k: '经营状态', v: '存续（在营、开业、在册）', ok: true },
      { k: '经营期限', v: '2018-11-20 ~ 2048-11-19', ok: true },
    ] },
    { title: '资质资格', result: '通过', items: [{ k: '资质资格异常', v: '未匹配到资质资格异常信息', ok: true }] },
    { title: '行政处罚', result: '通过', items: [{ k: '行政处罚记录', v: '未匹配到行政处罚记录', ok: true }] },
    { title: '经营范围', result: '通过', items: [{ k: '经营范围', v: '技术开发、技术推广；计算机系统服务；设计、制作、代理、发布广告等', ok: true }] },
    { title: '经营地址', result: '通过', items: [{ k: '经营地址', v: '北京市海淀区北三环西路甲23号院1号楼3层328', ok: true }] },
    { title: '联系电话', result: '通过', items: [{ k: '联系电话', v: '010-58341751', ok: true }] },
    { title: '法定代表人', result: '通过', items: [{ k: '法定代表人', v: '银平', ok: true }] },
    { title: '股东', result: '通过', items: [{ k: '股东', v: '抖音有限公司', ok: true }] },
    { title: '主要人员', result: '通过', items: [{ k: '主要人员', v: '银平、李雪、夏绪宏', ok: true }] },
    { title: '经营异常', result: '通过', items: [{ k: '经营异常', v: '未匹配到经营异常记录', ok: true }] },
    { title: '严重违法失信', result: '通过', items: [{ k: '严重违法失信', v: '未匹配到严重违法失信记录', ok: true }] },
  ],
}

const inpStyle: React.CSSProperties = { padding: '7px 12px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff', minWidth: 130 }
const dropStyle: React.CSSProperties = { padding: '7px 12px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff', minWidth: 120 }

export default function FkAccountYearly({ params }: { params: URLSearchParams }) {
  const [data] = useSample('fkYearly.json', seedJson)
  const [filterTab, setFilterTab] = useState('全部')
  const [started, setStarted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [detailName, setDetailName] = useState<string | null>(null)

  const onStart = () => {
    setLoading(true)
    window.setTimeout(() => { setStarted(true); setLoading(false) }, 600)
  }

  const rows = (data.rows as unknown as Row[]).filter(
    (r) => !started ? false : filterTab === '全部' || String((r as any).result) === filterTab,
  )

  const columns: Column[] = [
    { key: 'name', label: '企业名称', width: '200px', align: 'left' },
    ...DIMS.map((d) => ({
      key: d,
      label: d,
      width: '90px',
      align: 'center' as const,
      render: (r: Row) => {
        const dr = (r as any).dimResult as Record<string, string>
        return dr?.[d] === '通过' ? passMark : failMark
      },
    })),
    {
      key: 'op',
      label: '操作',
      width: '80px',
      align: 'center',
      render: (r: Row) => (
        <a style={{ color: '#2563EB', cursor: 'pointer' }} onClick={() => setDetailName(String((r as any).name))}>详情</a>
      ),
    },
  ]

  const resultTab = (t: string) => (
    <span
      onClick={() => setFilterTab(t)}
      style={{
        cursor: 'pointer', padding: '6px 14px', borderRadius: 8, fontSize: 13,
        border: `1px solid ${filterTab === t ? '#2563EB' : '#E2E8F0'}`,
        color: filterTab === t ? '#2563EB' : '#475569',
        background: filterTab === t ? '#EFF6FF' : '#fff',
      }}
    >{t}</span>
  )

  const detail = detailName ? DETAIL[detailName] : null

  return (
    <EpPage
      title="账户年检"
      desc="按年检查验企业工商、经营、风险维度的一致性"
    >
      {/* 查询条 */}
      <EpCard>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: '#475569' }}>目标客群</span>
          <select style={dropStyle} defaultValue={data.group}>
            <option>{data.group}</option>
          </select>
          <EpBtn variant="default" size="sm" onClick={() => setUploadOpen(true)}>+ 上传企业</EpBtn>
          <span style={{ fontSize: 13, color: '#475569' }}>开始日期</span>
          <input style={inpStyle} type="text" defaultValue={data.startDate} />
          <EpBtn variant="primary" size="sm" onClick={onStart} disabled={loading} style={{ marginLeft: 'auto' }}>
            {loading ? '查询中…' : '开始查询'}
          </EpBtn>
        </div>
      </EpCard>

      {!started ? (
        <EpCard style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '28px 8px' }}>
            <span style={{ fontSize: 28, lineHeight: 1 }}>📋</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>尚未生成账户年检结果</div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
                请在上方选择目标客群并点击「开始查询」，系统将按年检查验企业工商、经营、风险维度的一致性。
              </div>
            </div>
            <EpBtn variant="primary" size="sm" onClick={onStart} disabled={loading} style={{ flexShrink: 0 }}>
              {loading ? '查询中…' : '开始查询'}
            </EpBtn>
          </div>
        </EpCard>
      ) : (
        <>
          {/* 统计行 */}
          <div style={{ fontSize: 13, color: '#475569', margin: '14px 0 12px' }}>
            共计年检 <b style={{ color: '#0F172A' }}>{data.total}</b> 家，其中{' '}
            <b style={{ color: '#DC2626' }}>{data.failed}</b> 家年检不通过（年检周期：{data.cycle}）
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {resultTab('全部')}
              {resultTab('不通过')}
              {resultTab('通过')}
            </div>
            <EpBtn variant="default" size="sm" onClick={() => alert('下载年检列表')}>下载</EpBtn>
          </div>

          <EpCard pad={false}>
            <div style={{ overflowX: 'auto' }}>
              <DataTable columns={columns} rows={rows} rowKey="id" />
            </div>
          </EpCard>
        </>
      )}

      {/* 上传企业弹窗 */}
      <EpDrawer open={uploadOpen} onClose={() => setUploadOpen(false)} title="上传企业" width={560}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>单个企业</div>
          <input placeholder="请输入企业名称" style={{ ...inpStyle, width: '100%' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>批量上传企业</div>
          <div style={{ border: '1px dashed #CBD5E1', borderRadius: 8, padding: 24, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
            点击或拖拽文件到此处上传（支持 .xlsx / .csv）
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 8 }}>
            模板示例：企业名称、统一社会信用代码（一行一个企业）
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <EpBtn variant="default" onClick={() => setUploadOpen(false)}>取 消</EpBtn>
          <EpBtn variant="primary" onClick={() => setUploadOpen(false)}>确 定</EpBtn>
        </div>
      </EpDrawer>

      {/* 年检详情弹窗（参考文档，按维度分组 1:1 复刻） */}
      <EpDrawer open={!!detailName} onClose={() => setDetailName(null)} title={`账户年检详情 · ${detailName ?? ''}`} width={720}>
        {detail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {detail.map((sec) => (
              <div key={sec.title} style={{ border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{sec.title}</span>
                  <span style={{ fontSize: 12, padding: '2px 10px', borderRadius: 999, color: sec.result === '通过' ? '#16A34A' : '#DC2626', background: sec.result === '通过' ? '#DCFCE7' : '#FEE2E2' }}>
                    年检结果：{sec.result}
                  </span>
                </div>
                <div style={{ padding: 14 }}>
                  {sec.items.map((it) => (
                    <div key={it.k} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: '1px dashed #F1F5F9', fontSize: 13 }}>
                      <span style={{ color: '#64748B', minWidth: 110, flexShrink: 0 }}>{it.k}</span>
                      <span style={{ color: '#334155', flex: 1, wordBreak: 'break-all' }}>{it.v}</span>
                      <span style={{ flexShrink: 0 }}>{it.ok ? passMark : failMark}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </EpDrawer>
    </EpPage>
  )
}
