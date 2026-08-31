// 尽调中心 · 报告中心（jd-report）· 获取尽调报告 / 报告记录
// 数据：本地样例 jdReport.json（橘 Sam）
import { useState } from 'react';
import { EpPage, useSample } from '../../epCommon';
import { usePageNav } from '../../../pageNav';

type ReportCard = { key: string; name: string; desc: string }
type Data = {
  source: string
  pageTitle: string
  tabs: { key: string; label: string }[]
  activeTab: string
  manage: string
  custom: { title: string; newCard: string }
  enterprise: { title: string; cards: ReportCard[]; buttons: { preview: string; download: string } }
  recordsPlaceholder: string
}

const seed: Data = {
  source: 'jdReport',
  pageTitle: '报告中心',
  tabs: [
    { key: 'get', label: '获取尽调报告' },
    { key: 'records', label: '报告记录' },
  ],
  activeTab: 'get',
  manage: '管理自定义报告',
  custom: { title: '自定义报告', newCard: '新增自定义报告' },
  enterprise: {
    title: '企业工商报告',
    cards: [
      { key: 'credit-plus', name: '企业增值信用报告', desc: '调查企业完整工商信息，挖掘隐藏关联关系，多维度扫描企业风险，深度评估企业经营状况' },
      { key: 'dgd', name: '董监高投资及任职报告', desc: '对企业法人、股东、高管人员进行全面调查，提供投资任职信息、风险信息、知识产权信息' },
      { key: 'credit-basic', name: '企业基础信用报告', desc: '查看企业基础工商信息，自身诉讼风险和经营信息' },
      { key: 'equity', name: '企业股权结构报告', desc: '多达10级穿透企业股东层级，梳理企业股东信息和股东风险，找出企业实际控制人' },
      { key: 'dd', name: '企业尽调报告', desc: '扫描企业风险信息，并定义风险高中低情况，评估企业整体风险信息' },
      { key: 'kyc', name: 'KYC报告', desc: '协助用户快速尽调企业主体、关联企业及关联人员的风险信息，并快速进行反洗钱排查' },
      { key: 'penetration', name: '股权穿透报告', desc: '实现股权无限穿透，助力投行完成监管新规要求' },
    ],
    buttons: { preview: '样本预览', download: '下载报告' },
  },
  recordsPlaceholder: '报告记录内容待补充',
}

function MenuIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1677ff" strokeWidth="2.2" strokeLinecap="round">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  )
}

function ReportCover({ name }: { name: string }) {
  return (
    <div
      style={{
        width: 92,
        flexShrink: 0,
        borderRadius: 8,
        background: 'linear-gradient(160deg, #1E3A8A 0%, #2563EB 60%, #3B82F6 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: '10px 4px',
        boxSizing: 'border-box',
      }}
    >
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity={0.95}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="14" y2="17" />
      </svg>
      <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 9.5, textAlign: 'center', lineHeight: 1.4 }}>{name.slice(0, 4)}</span>
    </div>
  )
}

export default function JdReport({ params }: { params: URLSearchParams }) {
  const [data] = useSample<Data>('jdReport.json', seed)
  const { goDetail } = usePageNav()
  const [tab, setTab] = useState(data.activeTab)
  const isGet = tab === 'get'

  return (
    <EpPage title={data.pageTitle} >
      {/* 顶部 Tab + 右上管理链接 */}
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #E2E8F0', marginBottom: 18 }}>
        {data.tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              position: 'relative',
              padding: '11px 22px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 15,
              color: tab === t.key ? '#0F172A' : '#64748B',
              fontWeight: tab === t.key ? 600 : 400,
            }}
          >
            {t.label}
            {tab === t.key && (
              <span style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, background: '#1677ff' }} />
            )}
          </button>
        ))}
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            color: '#64748B',
            cursor: 'pointer',
            padding: '8px 4px',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          {data.manage}
        </div>
      </div>

      {!isGet ? (
        <div
          style={{
            padding: 80,
            textAlign: 'center',
            color: '#94A3B8',
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
          }}
        >
          {data.recordsPlaceholder}
        </div>
      ) : (
        <>
          {/* 自定义报告板块 */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <MenuIcon />
              <span style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>{data.custom.title}</span>
            </div>
            <div
              onClick={() => goDetail('/console/ep/jd-report-custom')}
              style={{
                width: 240,
                height: 108,
                borderRadius: 10,
                background: '#f7f8fc',
                border: '1px dashed #C7D2FE',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1677ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="12" x2="12" y2="18" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              <span style={{ fontSize: 14, color: '#1677ff', fontWeight: 500 }}>{data.custom.newCard}</span>
            </div>
          </div>

          {/* 企业工商报告板块 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <MenuIcon />
              <span style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>{data.enterprise.title}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {data.enterprise.cards.map((c) => (
                <div
                  key={c.key}
                  style={{
                    display: 'flex',
                    gap: 14,
                    padding: 16,
                    borderRadius: 10,
                    border: '1px solid #E2E8F0',
                    background: '#fff',
                    minHeight: 148,
                  }}
                >
                  <ReportCover name={c.name} />
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>{c.name}</div>
                    <div style={{ marginTop: 6, fontSize: 12, color: '#94A3B8', lineHeight: 1.7, flex: 1 }}>{c.desc}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button
                        style={{
                          padding: '5px 14px',
                          borderRadius: 6,
                          border: '1px solid #CBD5E1',
                          background: '#fff',
                          color: '#334155',
                          fontSize: 12.5,
                          cursor: 'pointer',
                        }}
                      >
                        {data.enterprise.buttons.preview}
                      </button>
                      <button
                        style={{
                          padding: '5px 14px',
                          borderRadius: 6,
                          border: 'none',
                          background: '#1677ff',
                          color: '#fff',
                          fontSize: 12.5,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {data.enterprise.buttons.download}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </EpPage>
  )
}
