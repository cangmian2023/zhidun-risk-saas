// 尽调中心 · 受益所有人识别详情（jd-beneficiary-result）
// 数据：本地样例 jdBeneficiaryResult.json（橘 Sam）
import { useState } from 'react'
import type { CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { EpPage, EpBtn, useSample, Sam } from '../../epCommon'
import { usePageNav } from '../../../pageNav'

type StdRow1 = { id: number; name: string; benefitType: string; position: string; holdType: string; ratio: string; path: string; date: string }
type StdRow3 = { id: number; name: string; benefitType: string; position: string; holdType: string; ratio: string; date: string; reason: string }
type MgrRow = { id: number; name: string; position: string; date: string }
type EvidenceRow = { id: number; name: string; status: string; applicant: string; applyTime: string; doneTime: string; action: string }
type EvidenceModal = { title: string; columns: string[]; rows: EvidenceRow[] }
type Data = {
  source: string
  pageTitle: string
  crumb: string
  company: {
    name: string
    policyTag: string
    infoLabel: string
    infoValue: string
    statusLabel: string
    statusValue: string
    creditLabel: string
    creditValue: string
    capitalLabel: string
    capitalValue: string
    buttons: string[]
  }
  resultTitle: string
  standard1: { title: string; columns: string[]; rows: StdRow1[] }
  standard3: { title: string; columns: string[]; rows: StdRow3[] }
  manager: { title: string; desc: string; expand: string; columns: string[]; rows: MgrRow[] }
  evidenceModal: EvidenceModal
  industry: {
    title: string
    buttons: string[]
    left: [string, string][]
    right: [string, string][]
  }
}

const seed: Data = {
  source: 'jdBeneficiaryResult',
  pageTitle: '受益所有人',
  crumb: '受益所有人 / 识别详情',
  company: {
    name: '上海合合信息科技股份有限公司',
    policyTag: '政策法规指引',
    infoLabel: '主体类型',
    infoValue: '公司',
    statusLabel: '识别状态',
    statusValue: '正常识别',
    creditLabel: '统一社会信用代码',
    creditValue: '91310110791485269J',
    capitalLabel: '注册资本',
    capitalValue: '19,600万人民币',
    buttons: ['股权穿透', '佐证材料', '下载报告'],
  },
  resultTitle: '受益所有人识别结果',
  standard1: {
    title: '标准一：25%以上股权',
    columns: ['序号', '受益所有人', '受益类型', '任职类型', '持股类型', '持股比例', '持股路径', '受益所有权形成日期'],
    rows: [
      {
        id: 1,
        name: '镇立新',
        benefitType: '直接或间接持股≥25%，单独或者联合实际控制',
        position: '董事长,非独立董事,法定代表人,总经理',
        holdType: '直接持股、间接持股',
        ratio: '25.3545%',
        path: '镇立新持股24.19%',
        date: '2006-08-08',
      },
    ],
  },
  standard3: {
    title: '标准三：控制/影响自然人',
    columns: ['序号', '受益所有人', '受益类型', '任职类型', '持股类型', '持股比例', '受益所有权形成日期', '判定原因'],
    rows: [
      {
        id: 1,
        name: '镇立新',
        benefitType: '直接或间接持股≥25%，单独或者联合实际控制',
        position: '董事长,非独立董事,法定代表人,总经理',
        holdType: '直接持股、间接持股',
        ratio: '25.3545%',
        date: '2006-08-08',
        reason: '直接或间接拥有超过25%公司股权、股份或者合伙权益的自然人',
      },
    ],
  },
  manager: {
    title: '日常经营管理人员',
    desc: '根据法规要求，已识别标准一至标准三的受益所有人信息，仍需继续展示',
    expand: '【日常经营管理人员】可展开查看',
    columns: ['序号', '姓名', '职务', '任职起始日期'],
    rows: [
      { id: 1, name: '镇立新', position: '董事长、总经理、法定代表人', date: '2006-08-08' },
      { id: 2, name: '王辉', position: '董事、副总经理', date: '2015-06-01' },
      { id: 3, name: '江泊', position: '财务负责人', date: '2018-09-10' },
    ],
  },
  evidenceModal: {
    title: '佐证材料',
    columns: ['序号', '文件名', '状态', '申请人', '申请时间', '完成时间', '操作'],
    rows: [
      { id: 1, name: '企业工商信用公示-上海合合信息科技股份有限公司', status: '已完成', applicant: '19156027703', applyTime: '2026-08-20 00:01:37', doneTime: '2026-08-20 00:01:40', action: '查看' },
      { id: 2, name: '企业征信-表决权图谱-上海合合信息科技股份有限公司', status: '已完成', applicant: '19156027703', applyTime: '2026-08-20 00:01:37', doneTime: '2026-08-20 00:01:41', action: '查看' },
      { id: 3, name: '企业征信-股权穿透图谱-上海合合信息科技股份有限公司', status: '已完成', applicant: '19156027703', applyTime: '2026-08-20 00:01:37', doneTime: '2026-08-20 00:01:42', action: '查看' },
    ],
  },
  industry: {
    title: '工商信息',
    buttons: ['企业简况', '企业工商网快照', '下载数据'],
    left: [
      ['统一社会信用代码', '91310110791485269J'],
      ['法定代表人', '镇立新'],
      ['组织机构代码', '79148526-9'],
      ['企业类型', '股份有限公司(上市、自然人投资或控股)'],
      ['人员规模', '100-499人'],
      ['所属地区', '上海市 浦东新区'],
      ['国标行业', '软件和信息技术服务业'],
      ['行业代码', 'I65'],
      ['注册地址', '上海市静安区万荣路1256、1258号1105-1128室'],
      ['通信地址', '上海市浦东新区环科路555弄2号'],
      [
        '经营范围',
        '许可项目：货物进出口；技术进出口；第二类增值电信业务。（依法须经批准的项目，经相关部门批准后方可开展经营活动，具体经营项目以相关部门批准文件或许可证件为准）一般项目：技术服务、技术开发、技术咨询、技术交流、技术转让、技术推广；软件开发；软件销售；信息技术咨询服务；信息咨询服务（不含许可类信息咨询服务）；社会经济咨询服务；企业管理咨询；数据处理服务；计算机软硬件及辅助设备零售；计算机软硬件及辅助设备批发；广告发布；广告设计、代理；广告制作。（除依法须经批准的项目外，凭营业执照依法自主开展经营活动）',
      ],
    ],
    right: [
      ['企业曾用名', '上海合合信息科技发展有限公司'],
      ['登记状态', '存续'],
      ['成立日期', '2006-08-08'],
      ['注册资本', '19,600万人民币'],
      ['实缴资本', '-'],
      ['工商注册号', '310000001187364'],
      ['营业期限', '2006-08-08 至 无固定期限'],
      ['参保人数', '2025年报391人'],
      ['登记机关', '上海市市场监督管理局'],
      ['纳税人识别号', '91310110791485269J'],
      ['纳税人资质', '一般纳税人'],
      ['核准日期', '2024-04-02'],
      ['进出口企业代码', '3100221925'],
      ['英文名称', 'IntSig Information Co.,Ltd.'],
      ['注册地址经纬度', '31.2297, 121.4655'],
    ],
  },
}

const TH: CSSProperties = {
  padding: '9px 12px',
  textAlign: 'left',
  fontWeight: 600,
  color: '#475569',
  borderBottom: '1px solid #EFF1F7',
  whiteSpace: 'nowrap',
  background: '#FAFAFA',
  fontSize: 12.5,
}
const TD: CSSProperties = { padding: '9px 12px', color: '#334155', fontSize: 12.5, lineHeight: 1.6 }

const KEY_MAP: Record<string, string> = {
  序号: 'id',
  受益所有人: 'name',
  姓名: 'name',
  受益类型: 'benefitType',
  任职类型: 'position',
  职务: 'position',
  持股类型: 'holdType',
  持股比例: 'ratio',
  持股路径: 'path',
  受益所有权形成日期: 'date',
  任职起始日期: 'date',
  判定原因: 'reason',
}

function StdTable({ columns, rows }: { columns: string[]; rows: Record<string, unknown>[] }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={c} style={{ ...TH, width: i === 2 ? 260 : undefined }}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} style={{ background: idx % 2 === 1 ? '#FAFAFA' : '#fff' }}>
              {columns.map((c) => {
                const key = KEY_MAP[c] ?? c
                const v = r[key]
                const isName = key === 'name'
                return (
                  <td key={c} style={TD}>
                    {isName ? (
                      <span style={{ color: '#1677ff', fontWeight: 600, cursor: 'pointer' }}>{String(v ?? '')}</span>
                    ) : (
                      String(v ?? '')
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EvidenceModal({ data, open, onClose }: { data: EvidenceModal; open: boolean; onClose: () => void }) {
  if (!open) return null
  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15,23,42,0.45)',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 880,
          maxWidth: '92vw',
          maxHeight: '82vh',
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* 弹窗头部 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '1px solid #F0F0F0',
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 600, color: '#0F172A' }}>{data.title}</span>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#94A3B8',
              fontSize: 18,
              lineHeight: 1,
              cursor: 'pointer',
              padding: 4,
            }}
          >
            ×
          </button>
        </div>

        {/* 表格 */}
        <div style={{ padding: '16px 20px 20px', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#FAFAFA' }}>
                {data.columns.map((c, i) => (
                  <th
                    key={c}
                    style={{
                      padding: '10px 12px',
                      textAlign: i === 0 ? 'center' : 'left',
                      fontWeight: 600,
                      color: '#475569',
                      borderBottom: '1px solid #EFF1F7',
                      whiteSpace: 'nowrap',
                      width: i === 0 ? 60 : i === 1 ? undefined : 150,
                    }}
                  >
                    {c}
                    {(c === '申请时间' || c === '完成时间') && (
                      <span style={{ color: '#94A3B8', fontSize: 10, marginLeft: 3, display: 'inline-block' }}>
                        <svg width="10" height="14" viewBox="0 0 10 14" style={{ verticalAlign: -3 }}>
                          <path d="M5 0 L9 4 L1 4 Z" fill="#94A3B8" />
                          <path d="M5 14 L9 10 L1 10 Z" fill="#CBD5E1" />
                        </svg>
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r, idx) => (
                <tr key={r.id} style={{ background: idx % 2 === 1 ? '#FAFAFA' : '#fff' }}>
                  <td style={{ padding: '10px 12px', color: '#64748B', textAlign: 'center' }}>{r.id}</td>
                  <td style={{ padding: '10px 12px', color: '#1677ff', cursor: 'pointer' }}>{r.name}</td>
                  <td style={{ padding: '10px 12px' }}>
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
                      {r.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#334155' }}>{r.applicant}</td>
                  <td style={{ padding: '10px 12px', color: '#334155', whiteSpace: 'nowrap' }}>{r.applyTime}</td>
                  <td style={{ padding: '10px 12px', color: '#334155', whiteSpace: 'nowrap' }}>{r.doneTime}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <a style={{ color: '#1677ff', cursor: 'pointer', whiteSpace: 'nowrap' }}>{r.action}</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function JdBeneficiaryResult({ params }: { params: URLSearchParams }) {
  const [data] = useSample<Data>('jdBeneficiaryResult.json', seed)
  const { back } = usePageNav()
  const [mgrOpen, setMgrOpen] = useState(false)
  const [evidenceOpen, setEvidenceOpen] = useState(false)
  const co = data.company
  const ind = data.industry

  return (
    <EpPage
      title={data.pageTitle}
      crumb={data.crumb}
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <EpBtn ghost onClick={() => back('/console/ep/jd-beneficiary')}>返回</EpBtn>
          <Sam value={data.source} />
        </div>
      }
    >
      {/* 企业头部摘要 */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E8E8E8', padding: '18px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>{co.name}</span>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  color: '#1677ff',
                  fontSize: 11,
                }}
              >
                {co.policyTag}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 28px', marginTop: 12, fontSize: 13 }}>
              <span>
                <span style={{ color: '#94A3B8' }}>{co.infoLabel}：</span>
                <span style={{ color: '#334155' }}>{co.infoValue}</span>
              </span>
              <span>
                <span style={{ color: '#94A3B8' }}>{co.statusLabel}：</span>
                <span style={{ color: '#16A34A' }}>{co.statusValue}</span>
              </span>
              <span>
                <span style={{ color: '#94A3B8' }}>{co.creditLabel}：</span>
                <span style={{ color: '#334155' }}>{co.creditValue}</span>
              </span>
              <span>
                <span style={{ color: '#94A3B8' }}>{co.capitalLabel}：</span>
                <span style={{ color: '#334155' }}>{co.capitalValue}</span>
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            {co.buttons.map((b, i) => (
              <button
                key={b}
                onClick={() => (b === '佐证材料' ? setEvidenceOpen(true) : undefined)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: i === 2 ? 'none' : '1px solid #D9D9D9',
                  background: i === 2 ? '#2563EB' : '#fff',
                  color: i === 2 ? '#fff' : '#333',
                  fontWeight: i === 2 ? 600 : 400,
                  fontSize: 12.5,
                  cursor: 'pointer',
                }}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 受益所有人识别结果 */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E8E8E8', padding: '18px 22px', marginTop: 14 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', marginBottom: 12 }}>{data.resultTitle}</div>

        {/* 标准一 */}
        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#334155', marginBottom: 8 }}>{data.standard1.title}</div>
        <StdTable columns={data.standard1.columns} rows={data.standard1.rows as unknown as Record<string, unknown>[]} />

        {/* 标准三 */}
        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#334155', margin: '18px 0 8px' }}>{data.standard3.title}</div>
        <StdTable columns={data.standard3.columns} rows={data.standard3.rows as unknown as Record<string, unknown>[]} />

        {/* 日常经营管理人员 */}
        <div
          style={{
            marginTop: 16,
            padding: '12px 14px',
            borderRadius: 8,
            background: '#F8FAFC',
            border: '1px solid #EFF1F7',
          }}
        >
          <div style={{ fontSize: 13, color: '#334155' }}>
            {data.manager.desc}，
            <a onClick={() => setMgrOpen((v) => !v)} style={{ color: '#1677ff', cursor: 'pointer' }}>
              {data.manager.expand}
            </a>
          </div>
          {mgrOpen && (
            <div style={{ marginTop: 12 }}>
              <StdTable columns={data.manager.columns} rows={data.manager.rows as unknown as Record<string, unknown>[]} />
            </div>
          )}
        </div>
      </div>

      {/* 工商信息板块 */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E8E8E8', padding: '18px 22px', marginTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>{ind.title}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {ind.buttons.map((b) => (
              <button
                key={b}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: '1px solid #D9D9D9',
                  background: '#fff',
                  color: '#333',
                  fontSize: 12.5,
                  cursor: 'pointer',
                }}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 28px' }}>
          {[ind.left, ind.right].map((col, ci) => (
            <div key={ci} style={{ display: 'flex', flexDirection: 'column' }}>
              {col.map(([label, value]) => (
                <div key={label} style={{ display: 'flex', borderBottom: '1px solid #F5F5F5' }}>
                  <div
                    style={{
                      width: 128,
                      flexShrink: 0,
                      padding: '9px 10px',
                      background: '#FAFAFA',
                      fontSize: 12.5,
                      color: '#64748B',
                      borderRight: '1px solid #F0F0F0',
                      boxSizing: 'border-box',
                    }}
                  >
                    {label}
                  </div>
                  <div style={{ flex: 1, padding: '9px 12px', fontSize: 12.5, color: '#334155', lineHeight: 1.7, wordBreak: 'break-word' }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 佐证材料弹窗 */}
      <EvidenceModal data={data.evidenceModal} open={evidenceOpen} onClose={() => setEvidenceOpen(false)} />
    </EpPage>
  )
}
