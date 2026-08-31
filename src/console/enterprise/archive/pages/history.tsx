// 企业档案 · 历史信息（arc-history）· 1:1 复刻「企业档案 - 历史信息」
// 数据：本地样例 arcHistory.json（橘 Sam）
import { useState } from 'react';
import { EpPage, EpCard, EpStat, EpTag, EpBtn, DataTable, useSample } from '../../epCommon';
import type { Row, Column } from '../../../../components/ui';

const seed = {
  histShareholders: [
    { id: 1, name: '叶薇薇', type: '-', ratio: '-', subRatio: '11.86万人民币', paidRatio: '-', firstDate: '2012-06-11', exitDate: '2017-04-25' },
    { id: 2, name: '张一鸣', type: '历史股权出质', ratio: '-', subRatio: '988.14万人民币', paidRatio: '-', firstDate: '-', exitDate: '-' },
    { id: 3, name: '王振东', type: '-', ratio: '-', subRatio: '4.5万人民币', paidRatio: '-', firstDate: '2015-01-30', exitDate: '-' },
    { id: 4, name: '肖金梅', type: '-', ratio: '-', subRatio: '0.1万人民币', paidRatio: '-', firstDate: '-', exitDate: '-' },
    { id: 5, name: '王琼', type: '-', ratio: '-', subRatio: '20万人民币', paidRatio: '-', firstDate: '-', exitDate: '-' },
  ],
  histInvests: [
    { id: 1, name: '北京微梦创科网络技术有限公司', status: '存续', legal: '曹增辉', capital: '1000万人民币', amount: '-', ratio: '-', date: '2010-04-19', exitDate: '2018-06-30', industry: '信息传输、软件和信息技术服务业', area: '北京市海淀区' },
    { id: 2, name: '上海合合信息科技股份有限公司', status: '存续', legal: '镇立新', capital: '9000万人民币', amount: '-', ratio: '-', date: '2006-08-03', exitDate: '-', industry: '科学研究和技术服务业', area: '上海市徐汇区' },
    { id: 3, name: '天津银联网络技术有限公司', status: '注销', legal: '王振东', capital: '500万人民币', amount: '-', ratio: '-', date: '2014-02-21', exitDate: '2020-09-15', industry: '租赁和商务服务业', area: '天津市滨海新区' },
  ],
  histPersons: [
    { id: 1, name: '张一鸣', position: '创始人 / 原法定代表人', inDate: '2012-03-09', outDate: '2022-05-07', intro: '公司创始人，曾任法定代表人、执行董事。' },
    { id: 2, name: '梁汝波', position: '原董事', inDate: '2016-08-01', outDate: '2021-05-20', intro: '曾任公司董事。' },
    { id: 3, name: '周晶晶', position: '原监事', inDate: '2015-03-12', outDate: '2019-11-08', intro: '曾任公司监事。' },
  ],
  histChanges: [
    { id: 1, date: '2013-10-18', item: '住所', before: '北京市海淀区中关村东路18号1号楼c805室', after: '北京市海淀区知春路甲48号2号楼10A室' },
    { id: 2, date: '2014-07-02', item: '注册资本', before: '金额：100 单位：万元 币种：人民币', after: '金额：1000 单位：万元 币种：人民币' },
    { id: 3, date: '2016-12-01', item: '名称', before: '北京字节跳动科技有限公司', after: '北京字节跳动网络技术有限公司' },
  ],
  investAreaStat: [
    { id: 1, name: '北京', count: 9 },
    { id: 2, name: '上海', count: 3 },
    { id: 3, name: '浙江', count: 3 },
    { id: 4, name: '福建', count: 3 },
    { id: 5, name: '天津', count: 2 },
  ],
  investIndustryStat: [
    { id: 1, name: '科学研究和技术服务业', count: 16 },
    { id: 2, name: '信息传输、软件和信息技术服务业', count: 9 },
    { id: 3, name: '租赁和商务服务业', count: 3 },
    { id: 4, name: '文化、体育和娱乐业', count: 1 },
  ],
}

export default function History({ params }: { params: URLSearchParams }) {
  const [data] = useSample('arcHistory.json', seed)
  const [shTab, setShTab] = useState('历史公示股东')
  const shTabs = ['历史公示股东', '历史工商股东']

  const shCols: Column[] = [
    { key: 'idx', label: '序号', width: '60px', render: (row: Row) => row.id },
    { key: 'name', label: '股东名称', render: (row: Row) => <b>{String(row.name)}</b> },
    { key: 'type', label: '股东类型', render: (row: Row) => <EpTag>{String(row.type)}</EpTag> },
    { key: 'ratio', label: '持股比例' },
    { key: 'subRatio', label: '认缴出资' },
    { key: 'paidRatio', label: '实缴出资' },
    { key: 'firstDate', label: '首次持股日期', width: '120px' },
    { key: 'exitDate', label: '股东退出时间', width: '120px' },
  ]

  const investCols: Column[] = [
    { key: 'idx', label: '序号', width: '60px', render: (row: Row) => row.id },
    { key: 'name', label: '被投资企业名称', render: (row: Row) => <b>{String(row.name)}</b> },
    { key: 'status', label: '状态', render: (row: Row) => <EpTag color={row.status === '注销' ? '#B91C1C' : '#15803D'} bg={row.status === '注销' ? '#FEF2F2' : '#F0FDF4'}>{String(row.status)}</EpTag> },
    { key: 'legal', label: '法定代表人' },
    { key: 'capital', label: '注册资本' },
    { key: 'amount', label: '认缴出资额/持股数' },
    { key: 'ratio', label: '投资比例' },
    { key: 'date', label: '成立日期' },
    { key: 'exitDate', label: '投资退出日期' },
    { key: 'industry', label: '行业' },
    { key: 'area', label: '地区' },
  ]

  const personCols: Column[] = [
    { key: 'idx', label: '序号', width: '60px', render: (row: Row) => row.id },
    { key: 'name', label: '姓名', render: (row: Row) => <b>{String(row.name)}</b> },
    { key: 'position', label: '职位' },
    { key: 'inDate', label: '任职日期' },
    { key: 'outDate', label: '卸任日期' },
    { key: 'intro', label: '个人简介' },
  ]

  const changeCols: Column[] = [
    { key: 'idx', label: '序号', width: '60px', render: (row: Row) => row.id },
    { key: 'date', label: '变更日期', width: '110px' },
    { key: 'item', label: '变更事项', width: '150px' },
    { key: 'before', label: '变更前' },
    { key: 'after', label: '变更后' },
    { key: 'op', label: '展开', width: '70px', render: () => <a style={{ color: '#2563EB', cursor: 'pointer' }}>展开</a> },
  ]

  const statCols: Column[] = [
    { key: 'idx', label: '序号', width: '60px', render: (row: Row) => row.id },
    { key: 'name', label: '名称' },
    { key: 'count', label: '数量', render: (row: Row) => <b style={{ color: '#DC2626' }}>{String(row.count)}</b> },
  ]

  return (
    <EpPage
      title="企业档案 · 历史信息"
      subtitle="北京抖音信息服务有限公司 · 历史快照"
      crumb="企业档案 / 历史信息"
      actions={<EpBtn variant="primary">下载数据</EpBtn>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
        <EpStat label="历史股东" value={data.histShareholders.length} sub="历史公示 / 工商" />
        <EpStat label="对外投资" value="29" sub="存续(27) 注销(2)" />
        <EpStat label="历史主要人员" value={data.histPersons.length} sub="任职/卸任" />
        <EpStat label="历史变更记录" value="11" sub="共 11 条" />
      </div>

      {/* 历史股东（多 Tab） */}
      <EpCard
        title="历史股东信息"
        desc="共 5 条"
        actions={
          <div style={{ display: 'flex', gap: 6 }}>
            {shTabs.map((t) => (
              <EpBtn key={t} size="sm" variant={shTab === t ? 'primary' : 'default'} onClick={() => setShTab(t)}>
                {t}
              </EpBtn>
            ))}
          </div>
        }
        className="mb-4"
      >
        {shTab === '历史公示股东' ? (
          <DataTable columns={shCols} rows={data.histShareholders as unknown as Row[]} pager exportable exportName="历史股东" empty="暂无数据" />
        ) : (
          <div style={{ padding: '24px 0', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>共 4 条历史工商股东（演示占位）</div>
        )}
      </EpCard>

      {/* 历史对外投资 */}
      <EpCard title="历史对外投资" desc="对外投资 29 条 · 存续(27) 注销(2)" className="mb-4">
        <DataTable columns={investCols} rows={data.histInvests as unknown as Row[]} pager exportable exportName="历史对外投资" empty="暂无数据" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
          <div>
            <div className="text-[13px] font-semibold text-slate-700" style={{ marginBottom: 8 }}>按地区分布</div>
            <DataTable columns={statCols} rows={data.investAreaStat as unknown as Row[]} />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-slate-700" style={{ marginBottom: 8 }}>按行业分布</div>
            <DataTable columns={statCols} rows={data.investIndustryStat as unknown as Row[]} />
          </div>
        </div>
      </EpCard>

      {/* 历史主要人员 */}
      <EpCard title="历史主要人员" desc="共 3 条" className="mb-4">
        <DataTable columns={personCols} rows={data.histPersons as unknown as Row[]} empty="暂无数据" />
      </EpCard>

      {/* 历史变更记录 */}
      <EpCard title="历史变更记录"  className="mb-4">
        <DataTable columns={changeCols} rows={data.histChanges as unknown as Row[]} pager exportable exportName="历史变更记录" empty="暂无数据" />
      </EpCard>
    </EpPage>
  )
}
