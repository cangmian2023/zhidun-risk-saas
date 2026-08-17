// 风控中心 · 员工列表（fk-employee）· 1:1 复刻「风控 - 员工列表」
// 数据：本地样例 fkEmployee.json（橘 Sam）
import { useState } from 'react'
import { EpPage, EpCard, EpTag, EpBtn, EpDrawer, DataTable, useSample, Sam } from '../epCommon'
import type { Row } from '../../../../components/ui'

type Emp = { id: string; name: string; no: string; tag: string; phone: string; related: number }
type Tag = string

const seed = {
  tags: ['销售部', '市场部', '采购部', '合规部', '员工亲属'] as Tag[],
  employees: [
    { id: '1', name: '刘延峰', no: '00001', tag: '销售部', phone: '138****1234', related: 3 },
    { id: '2', name: '王敏', no: '00002', tag: '市场部', phone: '139****5678', related: 1 },
    { id: '3', name: '李强', no: '00003', tag: '采购部', phone: '137****0000', related: 5 },
    { id: '4', name: '赵蕾', no: '00004', tag: '合规部', phone: '—', related: 0 },
    { id: '5', name: '陈昊', no: '00005', tag: '员工亲属', phone: '135****8888', related: 2 },
  ] as Emp[],
}

const TAG_OPTS = ['销售部', '市场部', '采购部', '合规部', '员工亲属', '不限']

export default function FkEmployee({ params }: { params: URLSearchParams }) {
  const [{ tags, employees }, save] = useSample('fkEmployee.json', seed)
  const [activeTag, setActiveTag] = useState('不限')
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ name: '', no: '', tag: '销售部', phone: '', related: '' as string })
  const [conds, setConds] = useState({ hold: '不限', phone: '不限', rel: '不限' })

  const rows = employees.filter((e) => activeTag === '不限' || e.tag === activeTag)

  const columns = [
    { key: 'name', label: '员工姓名' },
    { key: 'no', label: '员工编号' },
    { key: 'tag', label: '员工标签', render: (r: Row) => <EpTag>{String(r.tag)}</EpTag> },
    { key: 'phone', label: '联系电话' },
    { key: 'related', label: '关联企业', render: (r: Row) => `${r.related} 家` },
    {
      key: 'op',
      label: '操作',
      render: (r: Row) => (
        <span style={{ display: 'inline-flex', gap: 10 }}>
          <a style={{ color: '#2563EB', cursor: 'pointer' }}>查看</a>
          <a style={{ color: '#2563EB', cursor: 'pointer' }}>编辑</a>
          <a style={{ color: '#DC2626', cursor: 'pointer' }}>删除</a>
        </span>
      ),
    },
  ]

  const doAdd = () => {
    if (!form.name) return
    const next = [
      ...employees,
      {
        id: String(Date.now()),
        name: form.name,
        no: form.no || `0000${employees.length + 1}`,
        tag: form.tag,
        phone: form.phone || '—',
        related: Number(form.related || 0),
      },
    ]
    save({ tags, employees: next })
    setForm({ name: '', no: '', tag: '销售部', phone: '', related: '' })
    setAddOpen(false)
  }

  return (
    <EpPage
      title="员工列表"
      subtitle="维护员工信息，辅助合规管理"
      crumb="风控中心 / 员工列表"
      actions={
        <EpBtn variant="primary" onClick={() => setAddOpen(true)}>
          ＋ 添加员工
        </EpBtn>
      }
    >
      {/* 员工标签筛选 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: '#64748B' }}>员工标签</span>
        {TAG_OPTS.map((t) => (
          <span
            key={t}
            onClick={() => setActiveTag(t)}
            style={{
              cursor: 'pointer',
              padding: '4px 14px',
              borderRadius: 16,
              fontSize: 13,
              border: `1px solid ${activeTag === t ? '#2563EB' : '#E2E8F0'}`,
              background: activeTag === t ? '#EFF6FF' : '#fff',
              color: activeTag === t ? '#2563EB' : '#475569',
            }}
          >
            {t}
          </span>
        ))}
        <EpBtn variant="ghost" size="sm">
          新增标签
        </EpBtn>
        <EpBtn variant="ghost" size="sm">
          管理标签
        </EpBtn>
      </div>

      {/* 筛选条件 */}
      <EpCard title="筛选条件" pad={false}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '14px 18px', flexWrap: 'wrap', fontSize: 13 }}>
          <Cond label="持股 / 任职 / 控制企业" value={conds.hold} onChange={(v) => setConds({ ...conds, hold: v })} />
          <Cond label="联系电话" value={conds.phone} onChange={(v) => setConds({ ...conds, phone: v })} />
          <Cond label="电话关联企业" value={conds.rel} onChange={(v) => setConds({ ...conds, rel: v })} />
          <EpBtn variant="ghost" size="sm">
            更多
          </EpBtn>
        </div>
      </EpCard>

      {/* 引导卡 + 列表 */}
      <div style={{ marginTop: 16 }}>
        <div
          style={{
            background: 'linear-gradient(90deg,#EFF6FF,#F8FAFC)',
            border: '1px solid #DBEAFE',
            borderRadius: 16,
            padding: '18px 22px',
            marginBottom: 16,
          }}
        >
          <div style={{ fontWeight: 600, color: '#1E3A8A' }}>维护员工信息，辅助合规管理</div>
          <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 12, color: '#64748B', lineHeight: 1.9 }}>
            <li>可录入员工电话、关联企业等信息，最多 2000 名</li>
            <li>我们将基于电话、关联企业等，查找更多潜在关联公司</li>
            <li>员工相关信息同时可用于合作方利益排查</li>
          </ul>
          <div style={{ marginTop: 12 }}>
            <EpBtn variant="primary" size="sm" onClick={() => setAddOpen(true)}>
              添加员工
            </EpBtn>
          </div>
        </div>

        <EpCard title="员工信息" desc={<Sam value="fkEmployee.json" />}>
          <DataTable columns={columns} rows={rows as unknown as Row[]} pager empty="暂无员工，点击「添加员工」录入" />
        </EpCard>
      </div>

      {/* 添加员工抽屉 */}
      <EpDrawer open={addOpen} onClose={() => setAddOpen(false)} title="添加员工">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="员工姓名" required>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="请输入员工姓名" style={inp} />
          </Field>
          <Field label="员工编号">
            <input value={form.no} onChange={(e) => setForm({ ...form, no: e.target.value })} placeholder="请输入员工编号" style={inp} />
          </Field>
          <Field label="员工标签">
            <select value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} style={inp}>
              {tags.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="联系电话">
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="请输入联系电话" style={inp} />
          </Field>
          <Field label="关联企业数">
            <input
              value={form.related}
              onChange={(e) => setForm({ ...form, related: e.target.value })}
              placeholder="关联企业数量"
              style={inp}
            />
          </Field>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <EpBtn variant="default" onClick={() => setAddOpen(false)}>
              取 消
            </EpBtn>
            <EpBtn variant="primary" onClick={doAdd}>
              确 认
            </EpBtn>
          </div>
        </div>
      </EpDrawer>
    </EpPage>
  )
}

function Cond({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ color: '#475569' }}>{label}</span>
      {['不限', '有', '无'].map((o) => (
        <span
          key={o}
          onClick={() => onChange(o)}
          style={{
            cursor: 'pointer',
            padding: '2px 10px',
            borderRadius: 12,
            fontSize: 12,
            border: `1px solid ${value === o ? '#2563EB' : '#E2E8F0'}`,
            background: value === o ? '#EFF6FF' : '#fff',
            color: value === o ? '#2563EB' : '#64748B',
          }}
        >
          {o}
        </span>
      ))}
    </span>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: '#64748B', marginBottom: 6 }}>
        {label} {required && <span style={{ color: '#DC2626' }}>*</span>}
      </div>
      {children}
    </div>
  )
}

const inp: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #CBD5E1',
  borderRadius: 8,
  fontSize: 13,
  outline: 'none',
}
