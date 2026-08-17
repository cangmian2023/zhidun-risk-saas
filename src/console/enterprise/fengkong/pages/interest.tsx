// 风控中心 · 利益排查（fk-interest）· 1:1 复刻「风控 - 利益排查」
// 数据：本地样例 fkInterest.json（橘 Sam）
import { useState } from 'react'
import { EpPage, EpCard, EpTag, EpBtn, DataTable, useSample, Sam } from '../../epCommon'
import type { Row } from '../../../../components/ui'

type Item = {
  id: number
  name: string
  no: string
  tag: string
  note: string
  conflictCount: number
  conflictNames: string
  reason: string
}

const seed = {
  items: [
    { id: 1, name: '刘延峰', no: '00001', tag: '销售部', note: '-', conflictCount: 2, conflictNames: '乐视网信息技术（北京）股份有限公司', reason: '持股任职、电话关联' },
    { id: 2, name: '王敏', no: '00002', tag: '市场部', note: '-', conflictCount: 1, conflictNames: '北京微梦创科网络技术有限公司', reason: '电话关联' },
    { id: 3, name: '李强', no: '00003', tag: '采购部', note: '亲属持股', conflictCount: 3, conflictNames: '深圳市腾讯计算机系统有限公司', reason: '持股任职' },
  ] as Item[],
}

export default function FkInterest({ params }: { params: URLSearchParams }) {
  const [data, save] = useSample('fkInterest.json', seed)
  const [kw, setKw] = useState('')
  const [scaned, setScaned] = useState(true)
  const rows = data.items.filter((i) => !kw || i.name.includes(kw) || i.conflictNames.includes(kw))

  const totalEmp = data.items.length
  const totalPartner = data.items.reduce((s, i) => s + i.conflictCount, 0)

  const columns = [
    { key: 'idx', label: '序号', render: (r: Row) => r.id },
    { key: 'name', label: '员工姓名' },
    { key: 'no', label: '员工编号' },
    { key: 'tag', label: '员工标签', render: (r: Row) => <EpTag>{String(r.tag)}</EpTag> },
    { key: 'note', label: '备注' },
    { key: 'conflictCount', label: '疑似冲突企业数', render: (r: Row) => <b style={{ color: '#DC2626' }}>{r.conflictCount}</b> },
    { key: 'conflictNames', label: '疑似冲突企业名称' },
    { key: 'reason', label: '原因' },
    {
      key: 'op',
      label: '操作',
      render: () => (
        <a style={{ color: '#2563EB', cursor: 'pointer' }} onClick={() => alert('查看利益冲突详情')}>
          详情
        </a>
      ),
    },
  ]

  return (
    <EpPage
      title="利益排查"
      subtitle="上传员工 / 企业名单，识别合作方疑似利益冲突"
      crumb="风控中心 / 利益排查"
      actions={<EpBtn variant="primary" onClick={() => setScaned(true)}>排查利益冲突</EpBtn>}
    >
      {/* 搜索 + 上传 */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <input
          value={kw}
          onChange={(e) => setKw(e.target.value)}
          placeholder="搜索关联企业或人员"
          style={{ flex: 1, minWidth: 240, padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13 }}
        />
      </div>

      <EpCard title="上传名单排查" desc="支持 Excel 上传，单次可上传 2000 家企业 / 员工">
        <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
          <Stepper />
          <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.8 }}>
            <div>· 将要查询的企业全名放在第一列</div>
            <div>· 仅支持 Excel 格式文件（xls / xlsx）</div>
            <EpBtn variant="ghost" size="sm" style={{ marginTop: 6 }}>
              下载样例文件
            </EpBtn>
          </div>
        </div>
      </EpCard>

      {/* 结果摘要 */}
      <div
        style={{
          marginTop: 16,
          background: '#F0FDF4',
          border: '1px solid #BBF7D0',
          borderRadius: 12,
          padding: '12px 18px',
          fontSize: 13,
          color: '#15803D',
        }}
      >
        已查出 <b>{totalEmp}</b> 名员工、<b>{totalPartner}</b> 家合作伙伴有疑似利益关系
        <span style={{ marginLeft: 12, color: '#64748B' }}>发现 {data.items.length} 条数据</span>
        <span style={{ float: 'right' }}>
          <EpBtn variant="default" size="sm" onClick={() => alert('导出利益排查结果 CSV')}>
            导出结果
          </EpBtn>
        </span>
      </div>

      {/* 结果表 */}
      <div style={{ marginTop: 14 }}>
        <EpCard title="疑似利益冲突明细" desc={<Sam value="fkInterest.json" />}>
          <DataTable columns={columns} rows={rows as unknown as Row[]} pager exportable exportName="利益排查结果" empty="暂无数据" />
        </EpCard>
      </div>
    </EpPage>
  )
}

function Stepper() {
  const steps = ['上传名单', '数据校验', '上传完成']
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: i === 0 ? '#2563EB' : '#E2E8F0',
              color: i === 0 ? '#fff' : '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {i + 1}
          </div>
          <span style={{ fontSize: 13, color: i === 0 ? '#1E293B' : '#94A3B8' }}>{s}</span>
          {i < steps.length - 1 && <span style={{ width: 36, height: 1, background: '#E2E8F0' }} />}
        </div>
      ))}
      <EpBtn variant="primary" size="sm" style={{ marginLeft: 8 }}>
        点击上传
      </EpBtn>
    </div>
  )
}
