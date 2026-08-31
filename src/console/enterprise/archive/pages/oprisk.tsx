// 企业档案 · 经营风险（arc-oprisk）· 1:1 复刻「企业档案 - 经营风险」
// 数据：本地样例 arcOprisk.json（橘 Sam）
import { useState } from 'react';
import { EpPage, EpCard, EpStat, EpTag, EpBtn, DataTable, useSample } from '../../epCommon';
import type { Row, Column } from '../../../../components/ui';

const seed = {
  punishes: [
    { id: 1, no: '京工商东处字〔2017〕第795号', type: '历史记录', content: '北京当当科文电子商务有限公司：1、没收违法所得：2548.7元； 2、罚款：18000元； 罚没款合计20548.7元', fine: '1.8万元', office: '北京市工商行政管理局海淀分局', date: '2017-10-20', op: '查看详情' },
  ],
  histPunishes: [
    { id: 1, no: '京海市监罚字〔2019〕第1234号', type: '广告违法', content: '发布违法广告，处以罚款并责令停止发布。', fine: '3.2万元', office: '北京市海淀区市场监督管理局', date: '2019-08-12', op: '查看详情' },
    { id: 2, no: '京网文罚〔2020〕第556号', type: '网络文化违法', content: '未落实内容安全主体责任，给予警告并罚款。', fine: '5万元', office: '北京市文化和旅游局', date: '2020-03-19', op: '查看详情' },
    { id: 3, no: '沪市监罚〔2021〕第880号', type: '不正当竞争', content: '虚假宣传，责令停止并处罚款。', fine: '8万元', office: '上海市市场监督管理局', date: '2021-06-30', op: '查看详情' },
    { id: 4, no: '粤市监罚〔2021〕第991号', type: '消费者权益', content: '未尽到平台审核义务，责令改正并罚款。', fine: '4万元', office: '广东省市场监督管理局', date: '2021-11-08', op: '查看详情' },
    { id: 5, no: '京税罚〔2022〕第201号', type: '税务违法', content: '发票管理违规，处以罚款。', fine: '1万元', office: '国家税务总局北京市税务局', date: '2022-02-14', op: '查看详情' },
    { id: 6, no: '浙市监罚〔2022〕第312号', type: '广告违法', content: '医疗广告未经审查发布，罚款并责令整改。', fine: '6.5万元', office: '浙江省市场监督管理局', date: '2022-07-22', op: '查看详情' },
    { id: 7, no: '京网信罚〔2023〕第77号', type: '网络安全', content: '未有效处置违法信息，警告并罚款。', fine: '10万元', office: '北京市互联网信息办公室', date: '2023-04-11', op: '查看详情' },
    { id: 8, no: '沪知罚〔2023〕第440号', type: '知识产权', content: '侵犯著作权，责令停止并赔偿。', fine: '2万元', office: '上海市知识产权局', date: '2023-09-05', op: '查看详情' },
    { id: 9, no: '苏市监罚〔2024〕第118号', type: '不正当竞争', content: '刷单炒信，罚款并公示。', fine: '7万元', office: '江苏省市场监督管理局', date: '2024-01-17', op: '查看详情' },
    { id: 10, no: '京市监罚〔2024〕第662号', type: '消费者权益', content: '格式条款不公平，责令改正并罚款。', fine: '3万元', office: '北京市市场监督管理局', date: '2024-05-20', op: '查看详情' },
    { id: 11, no: '粤市监罚〔2025〕第303号', type: '广告违法', content: '虚假宣传，罚款并停止发布。', fine: '9万元', office: '广东省市场监督管理局', date: '2025-03-28', op: '查看详情' },
    { id: 12, no: '京网文罚〔2025〕第880号', type: '网络文化违法', content: '内容违规，警告并罚款。', fine: '12万元', office: '北京市文化和旅游局', date: '2025-12-09', op: '查看详情' },
  ],
  softwares: [
    { id: 1, name: '今日头条', version: '8.2.4', source: '-', violation: '违反必要原则，收集与其提供的服务无关的个人信息；未经用户同意收集使用个人信息等。', from: '中华人民共和国互联网信息办公室', confirmDate: '2021-06-11', publishDate: '2021-06-11 15:30:00', deadline: '2021-06-26', op: '详情' },
    { id: 2, name: '今日头条极速版', version: '8.2.4.0', source: '-', violation: '违反必要原则，收集与其提供的服务无关的个人信息等。', from: '中华人民共和国互联网信息办公室', confirmDate: '2021-06-11', publishDate: '2021-06-11 15:30:00', deadline: '2021-06-26', op: '详情' },
    { id: 3, name: '悟空问答', version: '2.6.3', source: '小米应用商店', violation: '隐私不合规。', from: '国家移动互联网应用安全管理中心', confirmDate: '2019-12-04', publishDate: '2019-12-11 11:26:07', deadline: '-', op: '详情' },
    { id: 4, name: '西瓜视频', version: '2.6.4', source: '应用宝', violation: '隐私不合规。', from: '国家移动互联网应用安全管理中心', confirmDate: '2019-12-04', publishDate: '2019-12-11 11:26:07', deadline: '-', op: '详情' },
    { id: 5, name: '抖音', version: '12.3.0', source: 'App Store', violation: '未经同意收集个人信息。', from: '工业和信息化部', confirmDate: '2020-07-24', publishDate: '2020-07-24 10:00:00', deadline: '2020-08-10', op: '详情' },
    { id: 6, name: '抖音火山版', version: '9.1.5', source: '华为应用市场', violation: '强制索取权限。', from: '工业和信息化部', confirmDate: '2020-07-24', publishDate: '2020-07-24 10:00:00', deadline: '2020-08-10', op: '详情' },
  ],
}

export default function Oprisk({ params }: { params: URLSearchParams }) {
  const [data] = useSample('arcOprisk.json', seed)
  const [tab, setTab] = useState('行政处罚')
  const tabs = ['行政处罚', '历史行政处罚', '软件违规']

  const punishCols: Column[] = [
    { key: 'idx', label: '序号', width: '60px', render: (row: Row) => row.id },
    { key: 'no', label: '行政处罚决定书文号', render: (row: Row) => <b>{String(row.no)}</b> },
    { key: 'type', label: '违法行为类型', render: (row: Row) => <EpTag color="#B91C1C" bg="#FEF2F2">{String(row.type)}</EpTag> },
    { key: 'content', label: '行政处罚内容' },
    { key: 'fine', label: '罚款金额', render: (row: Row) => <b style={{ color: '#DC2626' }}>{String(row.fine)}</b> },
    { key: 'office', label: '作出行政处罚决定机关名称' },
    { key: 'date', label: '作出行政处罚决定日期' },
    { key: 'op', label: '操作', render: () => <a style={{ color: '#2563EB', cursor: 'pointer' }}>查看详情</a> },
  ]

  const swCols: Column[] = [
    { key: 'idx', label: '序号', width: '60px', render: (row: Row) => row.id },
    { key: 'name', label: '软件名称', render: (row: Row) => <b>{String(row.name)}</b> },
    { key: 'version', label: '版本号' },
    { key: 'source', label: '版本来源' },
    { key: 'violation', label: '违规内容', render: (row: Row) => <span style={{ color: '#64748B' }}>{String(row.violation)}</span> },
    { key: 'from', label: '数据来源' },
    { key: 'confirmDate', label: '认定日期' },
    { key: 'publishDate', label: '发布日期' },
    { key: 'deadline', label: '整改期限' },
    { key: 'op', label: '操作', render: () => <a style={{ color: '#2563EB', cursor: 'pointer' }}>详情</a> },
  ]

  return (
    <EpPage
      title="企业档案 · 经营风险"
      subtitle="北京抖音信息服务有限公司 · 行政处罚 1 条"
      crumb="企业档案 / 经营风险"
      actions={<EpBtn variant="primary">下载数据</EpBtn>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
        <EpStat label="行政处罚" value="1" accent="#DC2626" sub="历史行政处罚 12" />
        <EpStat label="软件违规" value="6" accent="#DC2626" sub="应用隐私/安全" />
        <EpStat label="经营风险总览" value="19" sub="行政处罚 + 软件违规" />
      </div>

      <EpCard
        title="经营风险明细"
        actions={
          <div style={{ display: 'flex', gap: 6 }}>
            {tabs.map((t) => (
              <EpBtn key={t} size="sm" variant={tab === t ? 'primary' : 'default'} onClick={() => setTab(t)}>
                {t}
              </EpBtn>
            ))}
          </div>
        }
        className="mb-4"
      >
        {tab === '行政处罚' && (
          <DataTable columns={punishCols} rows={data.punishes as unknown as Row[]} pager exportable exportName="行政处罚" empty="暂无数据" />
        )}
        {tab === '历史行政处罚' && (
          <DataTable columns={punishCols} rows={data.histPunishes as unknown as Row[]} pager exportable exportName="历史行政处罚" empty="暂无数据" />
        )}
        {tab === '软件违规' && (
          <DataTable columns={swCols} rows={data.softwares as unknown as Row[]} pager exportable exportName="软件违规" empty="暂无数据" />
        )}
      </EpCard>
    </EpPage>
  )
}
