// 企业档案 · 司法风险（arc-legal）· 1:1 复刻「企业档案 - 司法风险」
// 数据：本地样例 arcLegal.json（橘 Sam）
import { useState } from 'react';
import { EpPage, EpCard, EpStat, EpTag, EpBtn, DataTable, useSample } from '../../epCommon';
import type { Row, Column } from '../../../../components/ui';

const seed = {
  judgments: [
    { id: 1, name: '某甲公司、某丙公司名誉权纠纷一审裁定书', no: '（2025）浙0282民初24012号', cause: '名誉权纠纷', party: '原告：某甲公司（疑似吉利汽车集团有限公司）；被告：某丙公司、北京抖音信息服务有限公司', amount: '-', publish: '2026-06-24', judge: '2025-10-24', result: '准许原告某甲公司撤诉。案件受理费减半收取计200元，由原告负担并交纳本院。[对方撤诉]' },
    { id: 2, name: '叶衍银与北京抖音信息服务有限公司网络服务合同纠纷', no: '（2026）京0491民初10112号', cause: '网络服务合同纠纷', party: '原告：Y某某；被告：北京抖音信息服务有限公司', amount: '-', publish: '2026-06-22', judge: '-', result: '准许原告Y某某撤回对被告某信息服务有限公司的起诉。案件受理费35元，由原告Y某某负担（已交纳）' },
    { id: 3, name: '北京某信息服务有限公司、广州市天河区某维修服务部产品责任纠纷一审民事裁定书', no: '（2026）浙0206民初4818号', cause: '产品责任纠纷', party: '原告：L某某；被告：广州市天河区某维修服务部（个体工商户）、北京某信息服务有限公司', amount: '-', publish: '2026-06-18', judge: '2026-06-04', result: '准许原告L某某撤回对被告广州市天河区某维修服务部（个体工商户）、北京某信息服务有限公司的起诉。本案受理费50元，减半收取25元，由原告L某某负担' },
    { id: 4, name: '朱唯一与北京抖音信息服务有限公司侵权责任纠纷一审民事裁定书', no: '（2026）豫1102民初1833号', cause: '侵权责任纠纷', party: '原告：Z某某；被告：北京抖音信息服务有限公司', amount: '-', publish: '2026-06-13', judge: '2026-04-27', result: '准予原告Z某某撤诉。案件受理费减半收取50元（原告已预交），由原告承担' },
    { id: 5, name: '泛诚（福州）物业管理有限公司与北京某有限公司侵权责任纠纷一审民事裁定书', no: '（2026）闽0111民初496号', cause: '侵权责任纠纷', party: '原告：某物业公司；被告：北京某有限公司', amount: '-', publish: '2026-06-05', judge: '2026-03-04', result: '准许某物业公司撤诉。案件受理费770元，减半收取计385元，由某物业公司负担' },
  ],
  cases: [
    { id: 1, name: 'W某某、S某某与徐州秦之杭商贸有限公司、北京抖音信息服务有限公司产品销售者责任纠纷', date: '2026-08-10', stage: '民事一审', cause: '产品销售者责任纠纷', no: '（2026）浙0902民初4118号', role: '被告', court: '舟山市定海区人民法院' },
    { id: 2, name: '北京抖音信息服务有限公司、上海格物致品网络科技有限公司与北京微梦创科网络技术有限公司名誉权纠纷', date: '2026-08-07', stage: '民事一审', cause: '名誉权纠纷', no: '（2026）沪0110民初15318号', role: '原告', court: '上海市杨浦区人民法院' },
    { id: 3, name: 'C某某与北京抖音信息服务有限公司隐私权纠纷', date: '2026-08-06', stage: '民事一审', cause: '隐私权纠纷', no: '（2026）沪0115民初74807号', role: '被告', court: '上海市浦东新区人民法院' },
  ],
  hearings: [
    { id: 1, no: '（2026）鄂0192民初12345号', party: '原告/上诉人/申请人：武汉市东湖新技术开发区枫越百货商行；被告/被上诉人/被申请人：北京抖音信息服务有限公司', cause: '网络购物合同纠纷', fileDate: '2026-09-01', openDate: '2026-10-15 09:30:00', endDate: '-', status: '已排期', op: '详情' },
    { id: 2, no: '（2026）京0491民初6789号', party: '原告：G某某；被告：北京抖音信息服务有限公司', cause: '网络服务合同纠纷', fileDate: '2026-08-20', openDate: '2026-09-28 14:00:00', endDate: '-', status: '已排期', op: '详情' },
    { id: 3, no: '（2026）浙0282民初3456号', party: '原告：某甲公司；被告：北京抖音信息服务有限公司', cause: '名誉权纠纷', fileDate: '2026-08-10', openDate: '2026-09-15 10:00:00', endDate: '-', status: '已排期', op: '详情' },
  ],
  courtNotices: [
    { id: 1, role: '被告', party: '北京抖音信息服务有限公司', cause: '网络侵权责任纠纷', type: '起诉状副本及开庭传票', court: '杭州市余杭区人民法院', date: '2026-08-12', op: '详情' },
    { id: 2, role: '原告', party: '北京抖音信息服务有限公司', cause: '名誉权纠纷', type: '裁判文书', court: '上海市杨浦区人民法院', date: '2026-08-07', op: '详情' },
    { id: 3, role: '被申请人', party: '北京抖音信息服务有限公司', cause: '著作权权属、侵权纠纷', type: '起诉状副本及开庭传票', court: '北京互联网法院', date: '2026-07-30', op: '详情' },
  ],
}

const causeOptions = ['侵害作品信息网络传播权纠纷', '名誉权纠纷', '网络侵权责任纠纷', '著作权权属、侵权纠纷', '不正当竞争纠纷', '其他案由']

export default function Legal({ params }: { params: URLSearchParams }) {
  const [data] = useSample('arcLegal.json', seed)
  const [tab, setTab] = useState('裁判文书')
  const tabs = ['裁判文书', '开庭公告', '法院公告', '立案信息', '被执行人', '失信被执行人', '限制高消费', '终本案件']

  const caseCols: Column[] = [
    { key: 'idx', label: '序号', width: '60px', render: (row: Row) => row.id },
    { key: 'name', label: '案件名称', render: (row: Row) => <b style={{ color: '#0F172A' }}>{String(row.name)}</b> },
    { key: 'date', label: '进程日期' },
    { key: 'stage', label: '案件进程', render: (row: Row) => <EpTag>{String(row.stage)}</EpTag> },
    { key: 'cause', label: '案由' },
    { key: 'no', label: '案号' },
    { key: 'role', label: '案件身份', render: (row: Row) => <EpTag color={row.role === '原告' ? '#15803D' : '#B91C1C'} bg={row.role === '原告' ? '#F0FDF4' : '#FEF2F2'}>{String(row.role)}</EpTag> },
    { key: 'court', label: '法院' },
  ]

  const judgmentCols: Column[] = [
    { key: 'idx', label: '序号', width: '60px', render: (row: Row) => row.id },
    { key: 'name', label: '案件名称', render: (row: Row) => <b style={{ color: '#0F172A' }}>{String(row.name)}</b> },
    { key: 'no', label: '案号' },
    { key: 'cause', label: '案由', render: (row: Row) => <EpTag>{String(row.cause)}</EpTag> },
    { key: 'party', label: '当事人' },
    { key: 'amount', label: '涉案金额(元)' },
    { key: 'publish', label: '发布时间' },
    { key: 'judge', label: '裁决时间' },
    { key: 'result', label: '判决结果', render: (row: Row) => <span style={{ color: '#64748B' }}>{String(row.result)}</span> },
  ]

  const hearingCols: Column[] = [
    { key: 'idx', label: '序号', width: '60px', render: (row: Row) => row.id },
    { key: 'no', label: '案号' },
    { key: 'party', label: '当事人' },
    { key: 'cause', label: '案由', render: (row: Row) => <EpTag>{String(row.cause)}</EpTag> },
    { key: 'fileDate', label: '立案时间' },
    { key: 'openDate', label: '开庭时间' },
    { key: 'endDate', label: '结束时间' },
    { key: 'status', label: '案件状态', render: (row: Row) => <EpTag color="#2563EB" bg="#EFF6FF">{String(row.status)}</EpTag> },
    { key: 'op', label: '操作', render: () => <a style={{ color: '#2563EB', cursor: 'pointer' }}>详情</a> },
  ]

  const noticeCols: Column[] = [
    { key: 'idx', label: '序号', width: '60px', render: (row: Row) => row.id },
    { key: 'role', label: '身份', render: (row: Row) => <EpTag>{String(row.role)}</EpTag> },
    { key: 'party', label: '当事人' },
    { key: 'cause', label: '案由', render: (row: Row) => <EpTag>{String(row.cause)}</EpTag> },
    { key: 'type', label: '公告类型' },
    { key: 'court', label: '公告法院' },
    { key: 'date', label: '公告日期' },
    { key: 'op', label: '操作', render: () => <a style={{ color: '#2563EB', cursor: 'pointer' }}>详情</a> },
  ]

  return (
    <EpPage
      title="企业档案 · 司法风险"
      subtitle="北京抖音信息服务有限公司 · 裁判文书 1895 条"
      crumb="企业档案 / 司法风险"
      actions={<EpBtn variant="primary">下载数据</EpBtn>}
    >
      {/* 统计摘要 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
        <EpStat label="裁判文书" value="1895" accent="#DC2626" sub="含名誉权/网络侵权等" />
        <EpStat label="开庭公告" value="2008" sub="历史开庭公告 1090" />
        <EpStat label="司法案件" value={data.cases.length} sub="近 30 天新增" />
        <EpStat label="法院公告" value={data.courtNotices.length} sub="起诉状/裁判文书" />
      </div>

      {/* 筛选项 */}
      <EpCard className="mb-4">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <select style={{ padding: '7px 10px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13 }}>
            <option>文书类型：不限</option>
            <option>判决书</option>
            <option>裁定书</option>
            <option>调解书</option>
          </select>
          <select style={{ padding: '7px 10px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13 }}>
            <option>案件身份：不限</option>
            <option>原告</option>
            <option>被告</option>
            <option>上诉人</option>
          </select>
          <select style={{ padding: '7px 10px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13 }}>
            <option>审判结果：不限</option>
            <option>胜诉</option>
            <option>败诉</option>
          </select>
          <select style={{ padding: '7px 10px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13 }}>
            <option>涉案金额：不限</option>
            <option>1万及以下</option>
            <option>1-10万</option>
            <option>10-100万</option>
            <option>100-1000万</option>
            <option>1000万以上</option>
          </select>
          <input
            placeholder="案由（如 名誉权纠纷）"
            style={{ flex: 1, minWidth: 200, padding: '7px 10px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13 }}
            list="legal-cause"
          />
          <datalist id="legal-cause">
            {causeOptions.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <EpBtn variant="primary" size="sm">查询</EpBtn>
        </div>
      </EpCard>

      {/* 多 Tab 表格 */}
      <EpCard
        title="司法风险明细"
        actions={
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {tabs.map((t) => (
              <EpBtn key={t} size="sm" variant={tab === t ? 'primary' : 'default'} onClick={() => setTab(t)}>
                {t}
              </EpBtn>
            ))}
          </div>
        }
        className="mb-4"
      >
        {tab === '裁判文书' && (
          <DataTable columns={judgmentCols} rows={data.judgments as unknown as Row[]} pager exportable exportName="裁判文书" empty="暂无数据" />
        )}
        {tab === '开庭公告' && (
          <DataTable columns={hearingCols} rows={data.hearings as unknown as Row[]} pager exportable exportName="开庭公告" empty="暂无数据" />
        )}
        {tab === '法院公告' && (
          <DataTable columns={noticeCols} rows={data.courtNotices as unknown as Row[]} pager exportable exportName="法院公告" empty="暂无数据" />
        )}
        {tab === '立案信息' && (
          <DataTable columns={caseCols} rows={data.cases as unknown as Row[]} pager exportable exportName="立案信息" empty="暂无数据" />
        )}
        {(tab === '被执行人' || tab === '失信被执行人' || tab === '限制高消费' || tab === '终本案件') && (
          <div style={{ padding: '28px 0', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
            该维度（{tab}）公开数据为空或演示占位
          </div>
        )}
      </EpCard>
    </EpPage>
  )
}
