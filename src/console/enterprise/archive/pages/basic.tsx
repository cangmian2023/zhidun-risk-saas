// 企业档案 · 基本信息（arc-basic）· 1:1 复刻「企业档案 - 基本信息」
// 数据：本地样例 arcBasic.json（橘 Sam）
import { useState } from 'react'
import { EpPage, EpCard, EpStat, EpTag, EpBtn, DataTable, useSample, Sam } from '../epCommon'
import type { Row, Column } from '../../../../components/ui'

const seed = {
  reg: {
    name: '北京抖音信息服务有限公司',
    formerName: '北京字节跳动科技有限公司(- 至 2022-05-07)',
    taxNo: '911101085923662400',
    qixinScore: '681',
    group: '抖音集团',
    invoiceTitle: '抖音集团',
    typeTags: ['民营企业', '规模以上企业(官方)', '规模以上服务业(官方)', '大型企业(挖掘)'],
    addr: '北京市海淀区知春路甲48号2号楼10A室',
    estDate: '2012-03-09',
    regStatus: '存续（在营、开业、在册）',
    regCapital: '10000万人民币',
    legal: '张利东',
    scope: '技术开发、技术推广、技术转让、技术咨询、技术服务；计算机系统服务；数据处理；基础软件服务、应用软件服务；设计、制作、代理、发布广告；广播电视节目制作；从事互联网文化活动；人力资源服务；出版物零售；演出经纪等。',
  },
  shareholders: [
    { id: 1, name: '抖音有限公司', type: '大股东', ratio: '99.00%', subRatio: '19,800万人民币', paidRatio: '99%' },
    { id: 2, name: '网投中文（北京）科技有限公司', type: '国有企业', ratio: '1.00%', subRatio: '200万人民币', paidRatio: '1%' },
  ],
  indirectSh: [
    { id: 1, name: '厦门星辰启点科技有限公司', type: '企业法人', level: '2层', ratio: '97.82586%', path: '北京抖音信息服务有限公司' },
    { id: 2, name: '银平', type: '实际控制人', ratio: '48.91293%', path: '受益所有人' },
    { id: 3, name: '李英', type: '自然人', ratio: '48.91293%', path: '北京抖音信息服务有限公司' },
    { id: 4, name: '张利东', type: '自然人', ratio: '1.17414%', path: '北京抖音信息服务有限公司' },
    { id: 5, name: '中国互联网投资基金管理有限公司', type: '私募基金管理人', ratio: '1.186%', path: '北京抖音信息服务有限公司' },
  ],
  persons: [
    { id: 1, name: '张利东', position: '董事长', ratio: '1.1741%', benefit: '48.9129%', intro: '法定代表人、董事长，负责公司整体战略。' },
    { id: 2, name: '张辅评', position: '董事', ratio: '-', benefit: '-', intro: '公司董事。' },
    { id: 3, name: '吴述纲', position: '董事', ratio: '-', benefit: '-', intro: '公司董事。' },
    { id: 4, name: '夏绪宏', position: '监事', ratio: '-', benefit: '-', intro: '公司监事。' },
    { id: 5, name: '李雪', position: '经理,财务负责人', ratio: '-', benefit: '-', intro: '日常经营管理人员。' },
    { id: 6, name: '李英', position: '受益所有人', ratio: '48.9129%', benefit: '48.9129%', intro: '标准三：控制/影响自然人。' },
  ],
  invests: [
    { id: 1, name: '北京春田知韵科技有限公司', status: '存续', legal: '郭昶', capital: '100万元人民币', amount: '100.00%', ratio: '100.00%', date: '2023-07-26', industry: '其他科技推广服务业', area: '北京市西城区' },
    { id: 2, name: '上海沸寂科技有限公司', status: '存续', legal: '刘安琦', capital: '1000万元人民币', amount: '100.00%', ratio: '100.00%', date: '2022-01-14', industry: '科技推广和应用服务业', area: '上海市杨浦区' },
    { id: 3, name: '北京笔墨留香科技有限公司', status: '存续', legal: '莫少君', capital: '100万元人民币', amount: '100.00%', ratio: '100.00%', date: '2021-07-01', industry: '其他科技推广服务业', area: '北京市门头沟区' },
    { id: 4, name: '北京互动极致科技有限公司', status: '存续', legal: '张欣娅', capital: '500万元人民币', amount: '100.00%', ratio: '100.00%', date: '2019-08-09', industry: '其他科技推广服务业', area: '北京市海淀区' },
    { id: 5, name: '北京阅读无限文化传媒有限公司', status: '存续', legal: '谢思鹏', capital: '100万元人民币', amount: '100.00%', ratio: '100.00%', date: '2018-10-31', industry: '其他文化艺术业', area: '北京市朝阳区' },
  ],
  changes: [
    { id: 1, date: '2022-08-08', item: '股东改变姓名或名称', before: '字节跳动有限公司', after: '【名称变更】抖音有限公司' },
    { id: 2, date: '2022-05-07', item: '经营范围', before: '技术开发、技术推广、技术转让、技术咨询、技术服务、技术培训；计算机系统服务；数据处理；基础软件服务、应用软件服务；设计、制作、代理、发布广告；呼叫中心；广播电视节目制作；从事互联网文化活动；人力资源服务；出版物零售；第二类增值电信业务中的信息服务业务(仅限互联网信息服务)(有效期至2024-03-27)；演出经纪。', after: '市场主体依法自主选择经营项目，开展经营活动；广播电视节目制作、从事互联网文化活动、人力资源服务、出版物零售、演出经纪以及依法须经批准的项目，经相关部门批准后依批准的内容开展经营活动；不得从事国家和本市产业政策禁止和限制类项目的经营活动。' },
    { id: 3, date: '2022-05-07', item: '住所', before: '北京市海淀区知春路甲48号2号楼10A室', after: '北京市海淀区北三环西路23号院1号楼2层222' },
  ],
  parks: [
    { id: 1, name: '中关村国家自主创新示范区', level: '国家级', basis: '规模以上服务业(官方)', addr: '北京市海淀区', op: '查看' },
  ],
  beneficiaries: [
    { id: 1, name: '李英', benefitType: '标准二：25%以上表决权、收益权', roleType: '直接持股比例', holdType: '总持股比例', direct: '48.9129%', total: '48.9129%', vote: '50%', date: '2022-08-08', reason: '直接持股且为日常经营管理人员' },
    { id: 2, name: '吴述纲', benefitType: '标准三：控制/影响自然人', roleType: '董事', holdType: '-', direct: '-', total: '-', vote: '-', date: '-', reason: '担任公司董事' },
    { id: 3, name: '张利东', benefitType: '标准三：控制/影响自然人', roleType: '董事长', holdType: '直接持股比例', direct: '1.1741%', total: '1.1741%', vote: '1.1741%', date: '-', reason: '担任公司董事长' },
    { id: 4, name: '张辅评', benefitType: '标准三：控制/影响自然人', roleType: '董事', holdType: '-', direct: '-', total: '-', vote: '-', date: '-', reason: '担任公司董事' },
    { id: 5, name: '李雪', benefitType: '标准三：控制/影响自然人', roleType: '财务负责人', holdType: '-', direct: '-', total: '-', vote: '-', date: '-', reason: '日常经营管理财务人员' },
  ],
}

export default function Basic({ params }: { params: URLSearchParams }) {
  const [data] = useSample('arcBasic.json', seed)
  const [shTab, setShTab] = useState('最新公示股东')
  const r = data.reg

  const shTabs = ['最新公示股东', '工商登记股东', '历史公示股东', '历史工商股东']
  const regCols: Column[] = [
    { key: 'k', label: '项目', width: '140px', render: (row: Row) => <span style={{ color: '#64748B' }}>{row.k}</span> },
    { key: 'v', label: '内容', render: (row: Row) => <span style={{ color: '#0F172A' }}>{row.v}</span> },
  ]
  const regRows: Row[] = [
    { id: 'name', k: '名称', v: r.name },
    { id: 'former', k: '曾用名', v: r.formerName },
    { id: 'tax', k: '税号', v: r.taxNo },
    { id: 'score', k: '启信分', v: r.qixinScore + '分' },
    { id: 'group', k: '集团', v: r.group },
    { id: 'invoice', k: '发票抬头', v: r.invoiceTitle },
    { id: 'status', k: '登记状态', v: r.regStatus },
    { id: 'capital', k: '注册资本', v: r.regCapital },
    { id: 'legal', k: '法定代表人', v: r.legal },
    { id: 'est', k: '成立日期', v: r.estDate },
    { id: 'addr', k: '企业地址', v: r.addr },
    { id: 'type', k: '企业类型', v: <span>{r.typeTags.map((t) => <span key={t} style={{ marginRight: 6 }}><EpTag>{t}</EpTag></span>)}</span> },
  ]

  const shCols: Column[] = [
    { key: 'idx', label: '序号', width: '60px', render: (row: Row) => row.id },
    { key: 'name', label: '股东名称', render: (row: Row) => <b>{String(row.name)}</b> },
    { key: 'type', label: '股东类型', render: (row: Row) => <EpTag>{String(row.type)}</EpTag> },
    { key: 'ratio', label: '持股比例', render: (row: Row) => <b style={{ color: '#DC2626' }}>{String(row.ratio)}</b> },
    { key: 'subRatio', label: '认缴出资' },
    { key: 'paidRatio', label: '实缴出资 / 最终受益股份', render: (row: Row) => String(row.paidRatio) },
  ]

  const indirectCols: Column[] = [
    { key: 'idx', label: '序号', width: '60px', render: (row: Row) => row.id },
    { key: 'name', label: '间接股东名称', render: (row: Row) => <b>{String(row.name)}</b> },
    { key: 'type', label: '股东类型', render: (row: Row) => <EpTag>{String(row.type)}</EpTag> },
    { key: 'level', label: '间接持股层级' },
    { key: 'ratio', label: '间接持股比例', render: (row: Row) => <b style={{ color: '#DC2626' }}>{String(row.ratio)}</b> },
    { key: 'path', label: '持股路径' },
  ]

  const personCols: Column[] = [
    { key: 'idx', label: '序号', width: '60px', render: (row: Row) => row.id },
    { key: 'name', label: '姓名', render: (row: Row) => <b>{String(row.name)}</b> },
    { key: 'position', label: '职位' },
    { key: 'ratio', label: '持股比例', render: (row: Row) => String(row.ratio) },
    { key: 'benefit', label: '最终受益股份', render: (row: Row) => String(row.benefit) },
    { key: 'intro', label: '个人简介' },
  ]

  const investCols: Column[] = [
    { key: 'idx', label: '序号', width: '60px', render: (row: Row) => row.id },
    { key: 'name', label: '被投资企业名称', render: (row: Row) => <b>{String(row.name)}</b> },
    { key: 'status', label: '状态', render: (row: Row) => <EpTag color="#15803D" bg="#F0FDF4">{String(row.status)}</EpTag> },
    { key: 'legal', label: '法定代表人' },
    { key: 'capital', label: '注册资本' },
    { key: 'amount', label: '认缴出资额/持股数' },
    { key: 'ratio', label: '投资比例', render: (row: Row) => <b style={{ color: '#DC2626' }}>{String(row.ratio)}</b> },
    { key: 'date', label: '成立日期' },
    { key: 'industry', label: '行业' },
    { key: 'area', label: '地区' },
  ]

  const changeCols: Column[] = [
    { key: 'idx', label: '序号', width: '60px', render: (row: Row) => row.id },
    { key: 'date', label: '变更日期', width: '110px' },
    { key: 'item', label: '变更事项', width: '150px' },
    { key: 'before', label: '变更前' },
    { key: 'after', label: '变更后' },
    { key: 'op', label: '展开', width: '70px', render: () => <a style={{ color: '#2563EB', cursor: 'pointer' }}>展开</a> },
  ]

  const parkCols: Column[] = [
    { key: 'idx', label: '序号', width: '60px', render: (row: Row) => row.id },
    { key: 'name', label: '园区名称' },
    { key: 'level', label: '园区等级' },
    { key: 'basis', label: '认定依据' },
    { key: 'addr', label: '企业地址' },
    { key: 'op', label: '操作', render: () => <a style={{ color: '#2563EB', cursor: 'pointer' }}>查看</a> },
  ]

  const benCols: Column[] = [
    { key: 'idx', label: '序号', width: '60px', render: (row: Row) => row.id },
    { key: 'name', label: '受益所有人', render: (row: Row) => <b>{String(row.name)}</b> },
    { key: 'benefitType', label: '受益类型' },
    { key: 'roleType', label: '任职类型' },
    { key: 'holdType', label: '持股类型' },
    { key: 'direct', label: '直接持股比例', render: (row: Row) => <b style={{ color: '#DC2626' }}>{String(row.direct)}</b> },
    { key: 'total', label: '总持股比例', render: (row: Row) => String(row.total) },
    { key: 'vote', label: '表决权比例', render: (row: Row) => String(row.vote) },
    { key: 'date', label: '受益所有权形成日期' },
    { key: 'reason', label: '判定原因' },
  ]

  return (
    <EpPage
      title="企业档案 · 基本信息"
      subtitle={`${r.name}（税号 ${r.taxNo}）`}
      crumb="企业档案 / 基本信息"
      actions={
        <>
          <EpBtn variant="default">下载报告</EpBtn>
          <EpBtn variant="default">添加至客户列表</EpBtn>
          <EpBtn variant="ghost">企业监控</EpBtn>
          <EpBtn variant="primary">开始营销</EpBtn>
        </>
      }
    >
      {/* 概览统计 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
        <EpStat label="启信分" value={r.qixinScore} accent="#2563EB" sub="数据来源：大数据分析引擎" />
        <EpStat label="登记状态" value={r.regStatus.replace('（在营、开业、在册）', '')} sub={r.regCapital} />
        <EpStat label="股东数" value={data.shareholders.length} sub={`间接股东 ${data.indirectSh.length}`} />
        <EpStat label="对外投资" value={data.invests.length} sub={`主要人员 ${data.persons.length}`} />
      </div>

      {/* 工商登记信息 */}
      <EpCard title="工商登记信息" desc={<Sam value="arcBasic.json" />} className="mb-4">
        <DataTable columns={regCols} rows={regRows} />
        <div style={{ marginTop: 12, fontSize: 12, color: '#64748B' }}>
          <b>经营范围：</b>{r.scope}
        </div>
      </EpCard>

      {/* 股东信息（多 Tab） */}
      <EpCard
        title="股东信息"
        desc="最新股比计算日期：2026-06-30"
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
        {shTab === '最新公示股东' || shTab === '工商登记股东' ? (
          <DataTable columns={shCols} rows={data.shareholders as unknown as Row[]} pager exportable exportName="股东信息" empty="暂无数据" />
        ) : (
          <div style={{ padding: '24px 0', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
            共 {shTab.includes('历史') ? '5' : '4'} 条历史记录（历史快照数据，演示用占位）
          </div>
        )}
        <div style={{ marginTop: 14 }}>
          <div className="text-[13px] font-semibold text-slate-700" style={{ marginBottom: 8 }}>间接股东</div>
          <DataTable columns={indirectCols} rows={data.indirectSh as unknown as Row[]} empty="暂无数据" />
        </div>
      </EpCard>

      {/* 主要人员 */}
      <EpCard title="主要人员" desc={`共 ${data.persons.length} 条`} className="mb-4">
        <DataTable columns={personCols} rows={data.persons as unknown as Row[]} empty="暂无数据" />
      </EpCard>

      {/* 对外投资 */}
      <EpCard title="对外投资" desc={`共 ${data.invests.length} 条`} className="mb-4">
        <DataTable columns={investCols} rows={data.invests as unknown as Row[]} pager exportable exportName="对外投资" empty="暂无数据" />
      </EpCard>

      {/* 变更记录 */}
      <EpCard title="变更记录" desc="历史变更记录 11 条" className="mb-4">
        <DataTable columns={changeCols} rows={data.changes as unknown as Row[]} pager exportable exportName="变更记录" empty="暂无数据" />
      </EpCard>

      {/* 园区企业 */}
      <EpCard title="园区企业" desc="当前有 1 家企业有该认定" className="mb-4">
        <DataTable columns={parkCols} rows={data.parks as unknown as Row[]} empty="暂无数据" />
      </EpCard>

      {/* 受益所有人 */}
      <EpCard
        title="受益所有人"
        desc="根据法规要求，已识别标准一至标准三的受益所有人信息，仍需继续展示"
        className="mb-4"
      >
        <DataTable columns={benCols} rows={data.beneficiaries as unknown as Row[]} empty="暂无数据" />
        <div style={{ marginTop: 10, fontSize: 12, color: '#94A3B8' }}>
          以上数据是基于公开数据进行的动态分析，仅供参考。查询时间：2026-08-17 13:55:46
        </div>
      </EpCard>
    </EpPage>
  )
}
