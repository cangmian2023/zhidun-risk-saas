// 企业档案 · 经营信息（arc-operate）· 1:1 复刻「企业档案 - 经营信息」
// 数据：本地样例 arcOperate.json（橘 Sam）
import { useState } from 'react'
import { EpPage, EpCard, EpStat, EpTag, EpBtn, DataTable, useSample, Sam } from '../epCommon'
import type { Row, Column } from '../../../../components/ui'

const seed = {
  quals: [
    { id: 1, name: '质量管理体系认证（ISO9001）', type: '质量管理体系认证', no: '138-26-Q-00002-R1-01', from: '2026-02-06', to: '2029-02-05', status: '有效', op: '查看详情' },
    { id: 2, name: '信息安全管理体系认证', type: '信息安全管理体系认证', no: 'CCRC-2021-ISMS-G-351-R1', from: '2021-12-09', to: '2027-12-09', status: '有效', op: '查看详情' },
    { id: 3, name: '所有未列明的其他管理体系认证', type: '其他管理体系认证', no: 'CCRC-2021-PIMS-G-001-R1', from: '2021-12-09', to: '2027-12-09', status: '有效', op: '查看详情' },
    { id: 4, name: '网络文化经营许可证', type: '网络文化经营', no: '京网文[2023]3628-111号', from: '2025-04-18', to: '2026-10-06', status: '有效', op: '查看详情' },
    { id: 5, name: '互联网药品信息服务资格证书', type: '互联网药品信息', no: '[京]-非经营性-2016-0081', from: '2016-07-15', to: '2026-07-14', status: '有效', op: '查看详情' },
  ],
  permits: [
    { id: 1, no: '110000120171', name: '营业性演出许可证', from: '2026-05-26', to: '2028-01-09', office: '北京市文化和旅游局', status: '有效' },
    { id: 2, no: '京(2025)0000021', name: '互联网宗教信息服务许可证', from: '2025-09-16', to: '2028-09-15', office: '北京市民族宗教事务委员会', status: '有效' },
    { id: 3, no: '京网文〔2023〕3628-111号', name: '网络文化经营许可证', from: '2025-04-01', to: '2028-04-30', office: '北京市海淀区新闻出版局', status: '有效' },
  ],
  partners: [
    { id: 1, name: '成都小澄安全科技有限公司', date: '2026-08-16', count: 12, op: '详情' },
    { id: 2, name: '开封欣珩电子商务有限公司', date: '2026-08-15', count: 9, op: '详情' },
    { id: 3, name: '北京职在北方教育科技有限公司杭州分公司', date: '2026-08-14', count: 7, op: '详情' },
    { id: 4, name: '重庆市锦鹏信息科技有限公司', date: '2026-08-12', count: 6, op: '详情' },
    { id: 5, name: '广州佐庭信息科技有限公司', date: '2026-08-11', count: 5, op: '详情' },
  ],
  bids: [
    { id: 1, name: '音乐公司2026年5月视频彩铃的内容合作伙伴公开招募项目招募公告', role: '被提及', date: '2026-06-01', type: '招标', area: '广州市', tenderer: '联通沃音乐文化有限公司', winner: '-' },
    { id: 2, name: '音乐公司2026年3月视频彩铃的内容合作伙伴公开招募项目—招募公告', role: '被提及', date: '2026-03-23', type: '招标', area: '广州市', tenderer: '联通沃音乐文化有限公司', winner: '-' },
    { id: 3, name: '蒙牛乳业低温眉山工厂污水厌氧布水系统维修项目（二次）竞争性谈判公告', role: '被提及', date: '2026-01-21', type: '招标：竞谈', area: '呼和浩特市', tenderer: '内蒙古蒙牛乳业（集团）股份有限公司', winner: '-' },
    { id: 4, name: '蒙牛乳业常温礼盒、片箱、大包装箱机及垫片机设备采购项目竞争性谈判公告', role: '被提及', date: '2026-01-20', type: '招标：竞谈', area: '呼和浩特市', tenderer: '内蒙古蒙牛乳业（集团）股份有限公司', winner: '-' },
    { id: 5, name: '蒙牛乳业冰品事业部2026年度巧克力涂挂槽项目询比价公告', role: '被提及', date: '2026-01-18', type: '询比价', area: '呼和浩特市', tenderer: '内蒙古蒙牛乳业（集团）股份有限公司', winner: '-' },
  ],
  taxCredits: [
    { id: 1, year: '2024', no: '911101085923662400', level: 'A级', name: '北京抖音信息服务有限公司' },
    { id: 2, year: '2023', no: '911101085923662400', level: 'A级', name: '北京抖音信息服务有限公司' },
  ],
  taxQuals: [
    { id: 1, no: '911101085923662400', type: '简易办法征收一般纳税人', office: '国家税务总局北京市海淀区税务局', reg: '2017-03-01', from: '2017-03-01', to: '9999-12-31' },
    { id: 2, no: '911101085923662400', type: '增值税一般纳税人', office: '国家税务总局北京市海淀区税务局', reg: '2014-01-01', from: '2014-01-01', to: '9999-12-31' },
  ],
  honors: [
    { id: 1, name: '独角兽企业', level: '正式公告', publish: '2024-04-09', to: '2027-04-09', license: '2024年胡润全球独角兽榜', attach: '查看' },
    { id: 2, name: '国家文化出口重点企业', level: '正式公告', publish: '2023-11-20', to: '2026-11-19', license: '文旅贸发〔2023〕12号', attach: '查看' },
  ],
  recruits: [
    { id: 1, date: '2026-08-15', post: '算法工程师（推荐系统）', salary: '40-70K·16薪', edu: '本科', area: '北京市', exp: '3-5年', detail: '负责抖音推荐算法优化' },
    { id: 2, date: '2026-08-14', post: '内容安全审核专家', salary: '25-45K·14薪', edu: '本科', area: '北京市', exp: '3-5年', detail: '负责平台内容安全策略' },
    { id: 3, date: '2026-08-13', post: '产品经理（电商）', salary: '30-55K·15薪', edu: '本科', area: '上海市', exp: '5-10年', detail: '负责抖音电商产品规划' },
  ],
}

export default function Operate({ params }: { params: URLSearchParams }) {
  const [data] = useSample('arcOperate.json', seed)
  const [tab, setTab] = useState('资质认证')
  const tabs = ['资质认证', '行政许可', '直接合作', '间接合作', '标讯信息', '税务信息', '荣誉资质', '招聘信息']

  const qualCols: Column[] = [
    { key: 'idx', label: '序号', width: '60px', render: (row: Row) => row.id },
    { key: 'name', label: '证书名称', render: (row: Row) => <b>{String(row.name)}</b> },
    { key: 'type', label: '证书类型' },
    { key: 'no', label: '证书编号' },
    { key: 'from', label: '发证日期' },
    { key: 'to', label: '截止日期' },
    { key: 'status', label: '状态', render: (row: Row) => <EpTag color="#15803D" bg="#F0FDF4">{String(row.status)}</EpTag> },
    { key: 'op', label: '操作', render: () => <a style={{ color: '#2563EB', cursor: 'pointer' }}>查看详情</a> },
  ]

  const permitCols: Column[] = [
    { key: 'idx', label: '序号', width: '60px', render: (row: Row) => row.id },
    { key: 'no', label: '许可文件编号' },
    { key: 'name', label: '许可文件名称', render: (row: Row) => <b>{String(row.name)}</b> },
    { key: 'from', label: '有效期自' },
    { key: 'to', label: '有效期至' },
    { key: 'office', label: '许可机关' },
    { key: 'status', label: '状态', render: (row: Row) => <EpTag color="#15803D" bg="#F0FDF4">{String(row.status)}</EpTag> },
  ]

  const partnerCols: Column[] = [
    { key: 'idx', label: '序号', width: '60px', render: (row: Row) => row.id },
    { key: 'name', label: '企业名称', render: (row: Row) => <b>{String(row.name)}</b> },
    { key: 'date', label: '最新事件日期' },
    { key: 'count', label: '合作次数', render: (row: Row) => <b style={{ color: '#DC2626' }}>{String(row.count)}</b> },
    { key: 'op', label: '操作', render: () => <a style={{ color: '#2563EB', cursor: 'pointer' }}>详情</a> },
  ]

  const bidCols: Column[] = [
    { key: 'idx', label: '序号', width: '60px', render: (row: Row) => row.id },
    { key: 'name', label: '项目名称', render: (row: Row) => <b style={{ color: '#0F172A' }}>{String(row.name)}</b> },
    { key: 'role', label: '企业角色', render: (row: Row) => <EpTag>{String(row.role)}</EpTag> },
    { key: 'date', label: '发布日期' },
    { key: 'type', label: '标讯类型' },
    { key: 'area', label: '地区' },
    { key: 'tenderer', label: '招标方' },
    { key: 'winner', label: '中标方' },
  ]

  const taxCreditCols: Column[] = [
    { key: 'idx', label: '序号', width: '60px', render: (row: Row) => row.id },
    { key: 'year', label: '评价年度' },
    { key: 'no', label: '纳税人识别号' },
    { key: 'level', label: '纳税信用等级', render: (row: Row) => <EpTag color="#15803D" bg="#F0FDF4">{String(row.level)}</EpTag> },
    { key: 'name', label: '纳税人名称', render: (row: Row) => <b>{String(row.name)}</b> },
  ]

  const taxQualCols: Column[] = [
    { key: 'idx', label: '序号', width: '60px', render: (row: Row) => row.id },
    { key: 'no', label: '纳税人识别号' },
    { key: 'type', label: '纳税人资格类型', render: (row: Row) => <EpTag>{String(row.type)}</EpTag> },
    { key: 'office', label: '主管税务机关' },
    { key: 'reg', label: '登记时间' },
    { key: 'from', label: '有效期起' },
    { key: 'to', label: '有效期止' },
  ]

  const honorCols: Column[] = [
    { key: 'idx', label: '序号', width: '60px', render: (row: Row) => row.id },
    { key: 'name', label: '名称', render: (row: Row) => <b>{String(row.name)}</b> },
    { key: 'level', label: '级别', render: (row: Row) => <EpTag color="#2563EB" bg="#EFF6FF">{String(row.level)}</EpTag> },
    { key: 'publish', label: '发布日期' },
    { key: 'to', label: '有效期至' },
    { key: 'license', label: '许可证号' },
    { key: 'attach', label: '附件', render: () => <a style={{ color: '#2563EB', cursor: 'pointer' }}>查看</a> },
  ]

  const recruitCols: Column[] = [
    { key: 'idx', label: '序号', width: '60px', render: (row: Row) => row.id },
    { key: 'date', label: '发布时间' },
    { key: 'post', label: '职位', render: (row: Row) => <b>{String(row.post)}</b> },
    { key: 'salary', label: '薪资' },
    { key: 'edu', label: '学历' },
    { key: 'area', label: '地区' },
    { key: 'exp', label: '经验' },
    { key: 'detail', label: '职位详情' },
  ]

  return (
    <EpPage
      title="企业档案 · 经营信息"
      subtitle="北京抖音信息服务有限公司 · 资质认证 13 项"
      crumb="企业档案 / 经营信息"
      actions={<EpBtn variant="primary">导出数据</EpBtn>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
        <EpStat label="资质认证" value="13" sub="历史 9" />
        <EpStat label="行政许可" value="8" sub="历史 17" />
        <EpStat label="直接合作" value="587" accent="#2563EB" sub="间接合作 59" />
        <EpStat label="纳税信用" value="A级" accent="#15803D" sub="增值税一般纳税人" />
      </div>

      <EpCard
        title="经营信息明细"
        desc={<Sam value="arcOperate.json" />}
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
        {tab === '资质认证' && <DataTable columns={qualCols} rows={data.quals as unknown as Row[]} pager exportable exportName="资质认证" empty="暂无数据" />}
        {tab === '行政许可' && <DataTable columns={permitCols} rows={data.permits as unknown as Row[]} pager exportable exportName="行政许可" empty="暂无数据" />}
        {tab === '直接合作' && <DataTable columns={partnerCols} rows={data.partners as unknown as Row[]} pager exportable exportName="直接合作" empty="暂无数据" />}
        {tab === '间接合作' && <div style={{ padding: '24px 0', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>间接合作 59 条（演示占位）</div>}
        {tab === '标讯信息' && <DataTable columns={bidCols} rows={data.bids as unknown as Row[]} pager exportable exportName="标讯信息" empty="暂无数据" />}
        {tab === '税务信息' && (
          <>
            <div className="text-[13px] font-semibold text-slate-700" style={{ marginBottom: 8 }}>纳税信用等级</div>
            <DataTable columns={taxCreditCols} rows={data.taxCredits as unknown as Row[]} />
            <div className="text-[13px] font-semibold text-slate-700" style={{ margin: '8px 0' }}>纳税人资格信息</div>
            <DataTable columns={taxQualCols} rows={data.taxQuals as unknown as Row[]} />
          </>
        )}
        {tab === '荣誉资质' && <DataTable columns={honorCols} rows={data.honors as unknown as Row[]} pager exportable exportName="荣誉资质" empty="暂无数据" />}
        {tab === '招聘信息' && <DataTable columns={recruitCols} rows={data.recruits as unknown as Row[]} pager exportable exportName="招聘信息" empty="暂无数据" />}
      </EpCard>
    </EpPage>
  )
}
