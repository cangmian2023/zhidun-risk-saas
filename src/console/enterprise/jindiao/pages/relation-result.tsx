// 尽调中心 · 关系尽调 · 关联方识别结果页（jd-relation-result）
// 数据：本地样例 jdRelationResult.json（橘 Sam）
import { useState, useRef } from 'react'
import { EpPage, EpBtn, useSample, Sam } from '../../epCommon'
import { usePageNav } from '../../../pageNav'
import { Modal } from '../../../../components/ui'

type NavItem = { key: string; label: string; count: number }
type SectionRow = { id: number; name: string; relation: string; path: string }
type Section = { key: string; title: string; count: number; columns: string[]; rows: SectionRow[] }
type Data = {
  source: string
  pageTitle: string
  targetLabel: string
  targetValue: string
  resultSummary: string
  count: number
  toolbar: { upload: string; searchPlaceholder: string; report: string; download: string }
  nav: NavItem[]
  sections: Section[]
  pathModal: { title: string; columns: string[]; content: string }
  empty: string
}

const seed: Data = {
  source: 'jdRelationResult',
  pageTitle: '关联方识别',
  targetLabel: '识别目标',
  targetValue: '乐视网信息技术（北京）股份有限公司',
  resultSummary: '关系结果识别完成，共找到 {count} 个关联方',
  count: 2986,
  toolbar: {
    upload: '上传名单，排查是否命中关联方',
    searchPlaceholder: '在当前结果中查找企业',
    report: '生成报送文件',
    download: '下载报告',
  },
  nav: [
    { key: 'dgd-8', label: '董监高', count: 8 },
    { key: 'dgd-invest', label: '董监高对外投资', count: 225 },
    { key: 'dgd-control', label: '董监高实控企业', count: 52 },
    { key: 'h-13', label: '股东', count: 13 },
    { key: 'h-invest', label: '直接股东对外投资', count: 2597 },
    { key: 'h-control', label: '直接股东实控企业', count: 526 },
    { key: 'h-dgd', label: '直接股东董监高', count: 31 },
    { key: 'i-490', label: '对外投资', count: 490 },
  ],
  sections: [
    {
      key: 'dgd-8',
      title: '董监高',
      count: 8,
      columns: ['序号', '姓名', '职位', '关联路径'],
      rows: [
        { id: 1, name: '魏波', relation: '监事、监事会主席', path: '详情' },
        { id: 2, name: '张巍', relation: '监事、职工代表监事', path: '详情' },
        { id: 3, name: '李利婷', relation: '董事', path: '详情' },
        { id: 4, name: '高昊', relation: '董事', path: '详情' },
        { id: 5, name: '刘延峰', relation: '法定代表人、董事长', path: '详情' },
        { id: 6, name: '杨涛', relation: '监事会主席', path: '详情' },
        { id: 7, name: '鲁浩', relation: '董事', path: '详情' },
        { id: 8, name: '崔留磊', relation: '董事', path: '详情' },
      ],
    },
    {
      key: 'dgd-invest',
      title: '董监高对外投资',
      count: 225,
      columns: ['序号', '姓名', '对外投资企业', '关联路径'],
      rows: [
        { id: 1, name: '刘延峰', relation: '北京锦绣大地电子商务有限公司 法人', path: '详情' },
        { id: 2, name: '杨涛', relation: '北京宏力时代科技有限公司 监事', path: '详情' },
        { id: 3, name: '张巍', relation: '天津智融投资合伙企业 股东', path: '详情' },
        { id: 4, name: '高昊', relation: '乐视互联科技发展（北京）有限公司 董事', path: '详情' },
        { id: 5, name: '鲁浩', relation: '乐视云计算有限公司 监事', path: '详情' },
        { id: 6, name: '崔留磊', relation: '乐视体育文化产业发展（北京）有限公司 董事', path: '详情' },
        { id: 7, name: '李利婷', relation: '乐视移动智能信息技术（北京）有限公司 董事', path: '详情' },
        { id: 8, name: '魏波', relation: '乐视网（天津）信息技术有限公司 监事', path: '详情' },
      ],
    },
    {
      key: 'dgd-control',
      title: '董监高实控企业',
      count: 52,
      columns: ['序号', '姓名', '实控企业', '关联路径'],
      rows: [
        { id: 1, name: '刘延峰', relation: '北京锦绣大地电子商务有限公司 实控人', path: '详情' },
        { id: 2, name: '贾跃亭', relation: '乐视控股（北京）有限公司 实控人', path: '详情' },
        { id: 3, name: '贾跃民', relation: '乐视网信息技术(北京)股份有限公司 实控人', path: '详情' },
        { id: 4, name: '张巍', relation: '天津智融投资合伙企业 实控人', path: '详情' },
        { id: 5, name: '杨涛', relation: '北京宏力时代科技有限公司 实控人', path: '详情' },
      ],
    },
    {
      key: 'h-13',
      title: '股东',
      count: 13,
      columns: ['序号', '股东名称', '持股比例', '关联路径'],
      rows: [
        { id: 1, name: '贾跃亭', relation: '持股 23.07%', path: '详情' },
        { id: 2, name: '贾跃民', relation: '持股 1.26%', path: '详情' },
        { id: 3, name: '刘弘', relation: '持股 3.07%', path: '详情' },
        { id: 4, name: '吴孟', relation: '持股 2.06%', path: '详情' },
        { id: 5, name: '曹彬', relation: '持股 0.61%', path: '详情' },
        { id: 6, name: '乐视控股（北京）有限公司', relation: '持股 5.39%', path: '详情' },
        { id: 7, name: '中央汇金投资有限责任公司', relation: '持股 1.80%', path: '详情' },
        { id: 8, name: '中国人民财产保险股份有限公司', relation: '持股 1.25%', path: '详情' },
        { id: 9, name: '中信证券-中信银行-中信证券理财优选', relation: '持股 0.98%', path: '详情' },
        { id: 10, name: '中国建设银行-汇添富环保行业股票', relation: '持股 0.87%', path: '详情' },
        { id: 11, name: '中国农业银行-中邮核心成长混合', relation: '持股 0.76%', path: '详情' },
        { id: 12, name: '中国工商银行-嘉实策略增长混合', relation: '持股 0.65%', path: '详情' },
        { id: 13, name: '全国社保基金一零八组合', relation: '持股 0.54%', path: '详情' },
      ],
    },
    {
      key: 'h-invest',
      title: '直接股东对外投资',
      count: 2597,
      columns: ['序号', '股东名称', '对外投资企业', '关联路径'],
      rows: [
        { id: 1, name: '贾跃亭', relation: '乐视控股（北京）有限公司 股东', path: '详情' },
        { id: 2, name: '乐视控股（北京）有限公司', relation: '乐视致新电子科技（天津）有限公司 股东', path: '详情' },
        { id: 3, name: '乐视控股（北京）有限公司', relation: '乐视影业（北京）有限公司 股东', path: '详情' },
        { id: 4, name: '刘弘', relation: '乐视互娱（天津）科技有限公司 股东', path: '详情' },
        { id: 5, name: '吴孟', relation: '乐视网（天津）信息技术有限公司 股东', path: '详情' },
        { id: 6, name: '中央汇金投资有限责任公司', relation: '多家上市公司 股东', path: '详情' },
        { id: 7, name: '贾跃民', relation: '乐视网信息技术(北京)股份有限公司 股东', path: '详情' },
        { id: 8, name: '曹彬', relation: '乐视金融 股东', path: '详情' },
      ],
    },
    {
      key: 'h-control',
      title: '直接股东实控企业',
      count: 526,
      columns: ['序号', '股东名称', '实控企业', '关联路径'],
      rows: [
        { id: 1, name: '贾跃亭', relation: '乐视控股（北京）有限公司 实控人', path: '详情' },
        { id: 2, name: '乐视控股（北京）有限公司', relation: '乐视致新电子科技（天津）有限公司 实控人', path: '详情' },
        { id: 3, name: '贾跃民', relation: '乐视网信息技术(北京)股份有限公司 实控人', path: '详情' },
        { id: 4, name: '刘弘', relation: '乐视互娱（天津）科技有限公司 实控人', path: '详情' },
        { id: 5, name: '吴孟', relation: '乐视网（天津）信息技术有限公司 实控人', path: '详情' },
      ],
    },
    {
      key: 'h-dgd',
      title: '直接股东董监高',
      count: 31,
      columns: ['序号', '股东名称', '任职企业/职位', '关联路径'],
      rows: [
        { id: 1, name: '贾跃亭', relation: '乐视控股（北京）有限公司 法定代表人', path: '详情' },
        { id: 2, name: '刘弘', relation: '乐视网信息技术(北京)股份有限公司 副董事长', path: '详情' },
        { id: 3, name: '吴孟', relation: '乐视网信息技术(北京)股份有限公司 高管', path: '详情' },
        { id: 4, name: '贾跃民', relation: '乐视网信息技术(北京)股份有限公司 高管', path: '详情' },
        { id: 5, name: '张榕', relation: '乐视网信息技术(北京)股份有限公司 高管', path: '详情' },
      ],
    },
    {
      key: 'i-490',
      title: '对外投资',
      count: 490,
      columns: ['序号', '被投资企业', '持股比例', '关联路径'],
      rows: [
        { id: 1, name: '乐视致新电子科技（天津）有限公司', relation: '持股 41.98%', path: '详情' },
        { id: 2, name: '乐视影业（北京）有限公司', relation: '持股 21.80%', path: '详情' },
        { id: 3, name: '乐视移动智能信息技术（北京）有限公司', relation: '持股 27.50%', path: '详情' },
        { id: 4, name: '乐视云计算有限公司', relation: '持股 50.00%', path: '详情' },
        { id: 5, name: '乐视体育文化产业发展（北京）有限公司', relation: '持股 17.57%', path: '详情' },
        { id: 6, name: '新乐视智家电子科技（天津）有限公司', relation: '持股 34.94%', path: '详情' },
        { id: 7, name: '乐视互娱（天津）科技有限公司', relation: '持股 100.00%', path: '详情' },
        { id: 8, name: '乐视网（天津）信息技术有限公司', relation: '持股 100.00%', path: '详情' },
      ],
    },
  ],
  pathModal: {
    title: '持股详情',
    columns: ['序号', '关联路径'],
    content:
      '乐视网信息技术(北京)股份有限公司工商股东 -9.90%-> 北青传媒股份有限公司 工商股东 -100.00%-> 北青网络文化传播有限公司工商股东 -11.62%-> 北京润信鼎泰投资中心(有限合伙) 工商股东 -3.26% -> 连云港大吉塑业有限公司工商股东 -100.00%-> 连云港益云金属工业有限公司',
  },
  empty: '该分类暂无明细数据',
}

export default function JdRelationResult({ params }: { params: URLSearchParams }) {
  const [data] = useSample<Data>('jdRelationResult.json', seed)
  const { back } = usePageNav()
  const [kw, setKw] = useState('')
  const [pathOpen, setPathOpen] = useState(false)
  const refs = useRef<Record<string, HTMLDivElement | null>>({})

  const scrollTo = (key: string) => {
    const el = refs.current[key]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <EpPage
      title={data.pageTitle}
      crumb="关联方识别 / 识别结果"
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <EpBtn ghost onClick={() => back('/console/ep/jd-relation')}>返回</EpBtn>
          <Sam value={data.source} />
        </div>
      }
    >
      {/* 识别目标栏 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: '#64748B', flexShrink: 0 }}>{data.targetLabel}</span>
        <input
          value={data.targetValue}
          readOnly
          style={{
            width: 360,
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid #D9D9D9',
            fontSize: 13,
            color: '#1F2329',
            background: '#fff',
            outline: 'none',
          }}
        />
      </div>

      {/* 结果操作栏 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: '#1F2329' }}>
          {data.resultSummary.replace('{count}', String(data.count))}
        </span>
        <button
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid #1677ff',
            background: '#fff',
            color: '#1677ff',
            fontSize: 12.5,
            cursor: 'pointer',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {data.toolbar.upload}
        </button>
        <div style={{ position: 'relative' }}>
          <input
            value={kw}
            onChange={(e) => setKw(e.target.value)}
            placeholder={data.toolbar.searchPlaceholder}
            style={{
              width: 220,
              padding: '6px 10px 6px 28px',
              borderRadius: 6,
              border: '1px solid #D9D9D9',
              fontSize: 12.5,
              outline: 'none',
              color: '#1F2329',
            }}
          />
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#BFBFBF"
            strokeWidth="2.4"
            strokeLinecap="round"
            style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }}
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.5" y2="16.5" />
          </svg>
        </div>
        <button
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid #D9D9D9',
            background: '#fff',
            color: '#333',
            fontSize: 12.5,
            cursor: 'pointer',
          }}
        >
          {data.toolbar.report}
        </button>
        <button
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '6px 16px',
            borderRadius: 6,
            border: 'none',
            background: '#2563EB',
            color: '#fff',
            fontSize: 12.5,
            fontWeight: 600,
            cursor: 'pointer',
            marginLeft: 'auto',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {data.toolbar.download}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* 左侧章节导航（点击滚动定位） */}
        <div
          style={{
            width: 220,
            flexShrink: 0,
            background: '#fff',
            borderRadius: 10,
            border: '1px solid #E8E8E8',
            padding: '10px 8px',
            position: 'sticky',
            top: 16,
          }}
        >
          {data.nav.map((n) => (
            <div
              key={n.key}
              onClick={() => scrollTo(n.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13.5,
                color: '#334155',
                fontWeight: 600,
              }}
            >
              {n.label}
              <span style={{ color: '#94A3B8', fontWeight: 400, marginLeft: 'auto' }}>{n.count}</span>
            </div>
          ))}
        </div>

        {/* 右侧章节内容（每个章节带表格） */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {data.sections.map((s) => (
            <div
              key={s.key}
              ref={(el) => {
                refs.current[s.key] = el
              }}
              style={{ background: '#fff', borderRadius: 10, border: '1px solid #E8E8E8', padding: '16px 18px' }}
            >
              <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', marginBottom: 12 }}>
                {s.title} <span style={{ color: '#94A3B8', fontWeight: 400 }}>{s.count}</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#FAFAFA' }}>
                      {s.columns.map((c) => (
                        <th
                          key={c}
                          style={{
                            padding: '9px 12px',
                            textAlign: 'left',
                            fontWeight: 600,
                            color: '#475569',
                            borderBottom: '1px solid #EFF1F7',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.rows.map((r, idx) => (
                      <tr key={r.id} style={{ background: idx % 2 === 1 ? '#FAFAFA' : '#fff' }}>
                        <td style={{ padding: '9px 12px', color: '#64748B' }}>{r.id}</td>
                        <td style={{ padding: '9px 12px', color: '#1677ff', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>{r.name}</td>
                        <td style={{ padding: '9px 12px', color: '#334155' }}>{r.relation}</td>
                        <td style={{ padding: '9px 12px' }}>
                          <a onClick={() => setPathOpen(true)} style={{ color: '#1677ff', cursor: 'pointer', whiteSpace: 'nowrap' }}>{r.path}</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={pathOpen} onClose={() => setPathOpen(false)} title={data.pathModal.title} width={720} footer={<EpBtn onClick={() => setPathOpen(false)}>关闭</EpBtn>}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#FAFAFA' }}>
              {data.pathModal.columns.map((c) => (
                <th key={c} style={{ padding: '9px 12px', textAlign: 'left', fontWeight: 600, color: '#475569', borderBottom: '1px solid #EFF1F7', whiteSpace: 'nowrap' }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '10px 12px', color: '#64748B' }}>1</td>
              <td style={{ padding: '10px 12px', color: '#334155', lineHeight: 1.7 }}>{data.pathModal.content}</td>
            </tr>
          </tbody>
        </table>
      </Modal>
    </EpPage>
  )
}
