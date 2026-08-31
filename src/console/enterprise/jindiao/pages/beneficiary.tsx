// 尽调中心 · 受益所有人（jd-beneficiary）· 检索识别 + 识别记录
// 数据：本地样例 jdBeneficiary.json（橘 Sam）
import { useState } from 'react';
import { EpPage, useSample } from '../../epCommon';
import { usePageNav } from '../../../pageNav';

type RowItem = { id: number; company: string; method: string; person: string; time: string }
type Data = {
  source: string
  pageTitle: string
  search: { placeholder: string; btn: string; samplePrefix: string; sample: string }
  filters: { namePlaceholder: string; personPlaceholder: string }
  columns: string[]
  rows: RowItem[]
  actions: string[]
}

const seed: Data = {
  source: 'jdBeneficiary',
  pageTitle: '受益所有人',
  search: {
    placeholder: '请输入企业名称/统一社会信用代码',
    btn: '识别',
    samplePrefix: '一键试用',
    sample: '上海合合信息科技股份有限公司',
  },
  filters: { namePlaceholder: '企业名称', personPlaceholder: '请选择识别人' },
  columns: ['序号', '识别企业', '识别方式', '识别人', '识别时间', '操作'],
  rows: [
    { id: 1, company: '上海合合信息科技股份有限公司', method: '正常识别', person: '19156027703', time: '2026-08-20 00:01:37' },
    { id: 2, company: '上海合合信息科技股份有限公司', method: '正常识别', person: '19156027703', time: '2026-08-19 15:04:04' },
  ],
  actions: ['详情', '下载报告', '佐证材料', '重新识别'],
}

export default function JdBeneficiary({ params }: { params: URLSearchParams }) {
  const [data] = useSample<Data>('jdBeneficiary.json', seed)
  const { goDetail } = usePageNav()
  const [kw, setKw] = useState('')
  const [nameKw, setNameKw] = useState('')

  const goResult = () => goDetail('/console/ep/jd-beneficiary-result')
  const trySample = () => {
    setKw(data.search.sample)
    goResult()
  }

  return (
    <EpPage title={data.pageTitle} >
      {/* 顶部检索区 */}
      <div
        style={{
          background: '#fff',
          borderRadius: 10,
          border: '1px solid #E8E8E8',
          padding: '28px 24px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div style={{ width: 640, maxWidth: '100%' }}>
          <div style={{ display: 'flex' }}>
            <input
              value={kw}
              onChange={(e) => setKw(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && goResult()}
              placeholder={data.search.placeholder}
              style={{
                flex: 1,
                padding: '11px 16px',
                borderRadius: '8px 0 0 8px',
                border: '1px solid #E2E8F0',
                borderRight: 'none',
                background: '#F5F7FA',
                fontSize: 14,
                color: '#334155',
                outline: 'none',
              }}
            />
            <button
              onClick={goResult}
              style={{
                padding: '0 28px',
                borderRadius: '0 8px 8px 0',
                border: 'none',
                background: '#2563EB',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {data.search.btn}
            </button>
          </div>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span style={{ color: '#94A3B8' }}>{data.search.samplePrefix}：</span>
            <a onClick={trySample} style={{ color: '#1677ff', cursor: 'pointer' }}>
              {data.search.sample}
            </a>
          </div>
        </div>
      </div>

      {/* 记录筛选 */}
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <input
          value={nameKw}
          onChange={(e) => setNameKw(e.target.value)}
          placeholder={data.filters.namePlaceholder}
          style={{
            width: 220,
            padding: '7px 12px',
            borderRadius: 6,
            border: '1px solid #D9D9D9',
            fontSize: 13,
            outline: 'none',
            background: '#fff',
          }}
        />
        <select
          style={{
            padding: '7px 12px',
            borderRadius: 6,
            border: '1px solid #D9D9D9',
            fontSize: 13,
            color: '#64748B',
            outline: 'none',
            background: '#fff',
          }}
        >
          <option value="">{data.filters.personPlaceholder}</option>
          <option>19156027703</option>
        </select>
      </div>

      {/* 识别记录表格 */}
      <div
        style={{
          marginTop: 12,
          background: '#fff',
          borderRadius: 10,
          border: '1px solid #E8E8E8',
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#FAFAFA' }}>
              {data.columns.map((c, i) => (
                <th
                  key={c}
                  style={{
                    padding: '10px 14px',
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
            {data.rows.map((r, idx) => (
              <tr key={r.id} style={{ background: idx % 2 === 1 ? '#FAFAFA' : '#fff' }}>
                <td style={{ padding: '10px 14px', color: '#64748B' }}>{r.id}</td>
                <td style={{ padding: '10px 14px', color: '#1677ff', cursor: 'pointer' }}>{r.company}</td>
                <td style={{ padding: '10px 14px', color: '#334155' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '1px 8px',
                      borderRadius: 4,
                      background: '#EFF6FF',
                      color: '#1677ff',
                      fontSize: 12,
                    }}
                  >
                    {r.method}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', color: '#334155' }}>{r.person}</td>
                <td style={{ padding: '10px 14px', color: '#334155', whiteSpace: 'nowrap' }}>{r.time}</td>
                <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  {data.actions.map((a, ai) => (
                    <span key={a}>
                      {ai > 0 && <span style={{ margin: '0 6px', color: '#E2E8F0' }}>|</span>}
                      <a
                        onClick={() => (a === '详情' ? goResult() : undefined)}
                        style={{ color: '#1677ff', cursor: 'pointer' }}
                      >
                        {a}
                      </a>
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </EpPage>
  )
}
