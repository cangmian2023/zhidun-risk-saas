// 风险内容 / AI 解读 共用最终版弹窗（风险预警页 & 风险详情页 共用）
// 两个入口：风险内容列点击 / 「解读」按钮，均弹出本组件
import { useState } from 'react'
import { EpCard, EpTag, EpBtn, EpDrawer } from '../../epCommon'

const LEVEL: Record<string, { c: string; b: string }> = {
  高风险: { c: '#B91C1C', b: '#FEE2E2' },
  中风险: { c: '#C2410C', b: '#FFEDD5' },
  低风险: { c: '#1D4ED8', b: '#EFF6FF' },
  轻微风险: { c: '#0F766E', b: '#CCFBF1' },
  日常资讯: { c: '#475569', b: '#F1F5F9' },
}

export type ReadLike = {
  think?: string
  items?: { k: string; v: string }[]
  footer?: string
  notice?: { type: string; caseNo: string; date: string; cause: string; parties: { role: string; name: string }[] }
}

export function RiskContentDrawer({ open, row, read, onClose, onCase, onCompanyRisk, title }: {
  open: boolean
  row: Record<string, any> | null
  read?: ReadLike
  onClose: () => void
  onCase?: () => void
  onCompanyRisk?: () => void
  title?: React.ReactNode
}) {
  const [aiExpand, setAiExpand] = useState(true)
  const dt: React.CSSProperties = { color: '#94A3B8', flexShrink: 0 }
  const lk: React.CSSProperties = { color: '#2563EB', cursor: 'pointer' }
  if (!row) return null
  const d = (row.detail ?? {}) as Record<string, any>
  const readItems = read?.items ?? []
  const notice = read?.notice
  return (
    <EpDrawer open={open} onClose={onClose} width={760} title={title ?? '风险详情'}>
      <div>
        {/* 顶部：类型标签 + 标题 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
          {d.tag && <EpTag color="#C2410C" bg="#FFEDD5">{d.tag}</EpTag>}
          <div style={{ flex: 1, minWidth: 280, fontSize: 16, fontWeight: 700, color: '#0F172A', lineHeight: 1.5 }}>{String(row.title ?? '')}</div>
        </div>
        {/* 操作按钮 */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {['标记动态', '收藏动态', '下载动态', '风险推送', '供应商'].map((b) => (
            <EpBtn key={b} variant="default" size="sm">{b}</EpBtn>
          ))}
          {onCompanyRisk && <EpBtn variant="default" size="sm" onClick={onCompanyRisk}>企业风险</EpBtn>}
          {onCase && row.caseLink && <EpBtn variant="primary" size="sm" onClick={onCase}>案件串联</EpBtn>}
        </div>
        {/* 中部：风险等级 / 评分 / 负责人 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 13, marginBottom: 12 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#94A3B8' }}>风险等级：</span>
            <EpTag color={LEVEL[String(row.level)]?.c} bg={LEVEL[String(row.level)]?.b}>{String(row.level ?? '-')}</EpTag>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#94A3B8' }}>风险评分：</span>
            <b style={{ color: '#0F172A' }}>{row.score != null ? `${row.score}分` : '-'}</b>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#94A3B8' }}>负责人：</span>
            <span style={{ color: '#0F172A' }}>{String(row.owner ?? '-')}</span>
          </span>
        </div>
        {/* 概览 */}
        <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.8, background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: 10, padding: '12px 14px', marginBottom: 14, whiteSpace: 'normal' }}>
          {d.overview ?? String(row.content ?? '')}
        </div>
        {/* 风险解读（AI 解读弹窗内容并入此处） */}
        <EpCard
          title={
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span>风险解读</span>
              <span style={{ padding: '1px 8px', borderRadius: 10, fontSize: 11, background: '#DCFCE7', color: '#166534' }}>已生成</span>
            </span>
          }
          desc={
            <span style={{ cursor: 'pointer', fontSize: 12, color: '#2563EB' }} onClick={() => setAiExpand((v) => !v)}>
              {aiExpand ? '收起' : '展开'}{read?.think ? ` · 深度思考 ${read.think}` : ''}
            </span>
          }
        >
          {aiExpand && (
            <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.9 }}>
              {readItems.length
                ? readItems.map((it, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8 }}>
                      <span style={{ color: '#94A3B8' }}>·</span>
                      <span><b style={{ color: '#0F172A' }}>{it.k}</b>：{it.v}</span>
                    </div>
                  ))
                : (d.aiReading?.items ?? ['正在为您解读']).map((it: string, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: 8 }}>
                      <span style={{ color: '#94A3B8' }}>·</span>
                      <span>{it}</span>
                    </div>
                  ))}
            </div>
          )}
          {read?.footer && <div style={{ marginTop: 10, fontSize: 12, color: '#94A3B8' }}>{read.footer}</div>}
        </EpCard>
        {/* 公告 */}
        {notice && (
          <EpCard title={notice.type} className="mt-3.5">
            <dl style={{ margin: 0, fontSize: 13, display: 'grid', gridTemplateColumns: '90px 1fr', rowGap: 8 }}>
              <dt style={dt}>案号</dt><dd style={{ margin: 0 }}>{notice.caseNo}</dd>
              <dt style={dt}>公告日期</dt><dd style={{ margin: 0 }}>{notice.date}</dd>
              <dt style={dt}>案由</dt><dd style={{ margin: 0 }}>{notice.cause}</dd>
              <dt style={dt}>当事人</dt>
              <dd style={{ margin: 0 }}>
                {notice.parties.map((p) => (
                  <div key={p.name}><EpTag color="#475569" bg="#F1F5F9">{p.role}</EpTag> <span style={{ marginLeft: 6 }}>{p.name}</span></div>
                ))}
              </dd>
            </dl>
          </EpCard>
        )}
        {/* 底部分栏：发生时间 / 风险类型 / 风险等级 / 影响范围 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, margin: '14px 0' }}>
          <div style={{ border: '1px solid #F1F5F9', borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ fontSize: 12, color: '#94A3B8' }}>发生时间</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginTop: 4 }}>{d.happenTime ?? String(row.happen ?? row.pushTime ?? '-')}</div>
          </div>
          <div style={{ border: '1px solid #F1F5F9', borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ fontSize: 12, color: '#94A3B8' }}>风险类型</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginTop: 4 }}>{d.riskType ?? String(row.type ?? '-')}</div>
          </div>
          <div style={{ border: '1px solid #F1F5F9', borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ fontSize: 12, color: '#94A3B8' }}>风险等级</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginTop: 4 }}>
              <EpTag color={LEVEL[String(row.level)]?.c} bg={LEVEL[String(row.level)]?.b}>{String(row.level ?? '-')}</EpTag>
            </div>
          </div>
          <div style={{ border: '1px solid #F1F5F9', borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ fontSize: 12, color: '#94A3B8' }}>影响范围</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginTop: 4 }}>{(d.affectRegions ?? []).join('、') || '-'}</div>
          </div>
        </div>
        {/* 正文区：详细原文 + 查看原文 */}
        <EpCard title={d.articleTitle ?? String(row.title ?? '')}>
          <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{d.article ?? String(row.content ?? '')}</div>
          <a style={{ ...lk, fontSize: 12, marginTop: 8, display: 'inline-block' }}>查看原文 &gt;</a>
        </EpCard>
      </div>
    </EpDrawer>
  )
}
