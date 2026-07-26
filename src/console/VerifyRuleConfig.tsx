// 信息核验 — 核验规则配置 · 详情/编辑页（独立页面包装器）
// 核心编辑内容在 VerifyRuleEditor.tsx，本文件仅提供页面外壳（DetailHeader + 路由解析）。
import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DetailHeader, Button } from '../components/ui'
import VerifyRuleEditor from './VerifyRuleEditor'
import { seedRows } from './VerifyRuleList'

export default function VerifyRuleConfig() {
  const nav = useNavigate()
  const [sp] = useSearchParams()
  const isNew = sp.get('id') === 'new'
  const id = sp.get('id') ?? ''

  const row = useMemo(() => seedRows.find((r) => r.id === id), [id])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <DetailHeader
        crumb="零售信贷风控 / 贷前审核 / 规则配置"
        title={isNew ? '新建规则集' : (row?.name ?? '规则配置')}
        subtitle={isNew ? '配置多源并行核验单项报告中 5 项数据源的核验规则' : `${row?.name ?? ''} · ${row?.status ?? ''}`}
        backLabel="← 返回列表"
        onBack={() => nav('/console/cr/pre-verify-config')}
        actions={(
          <div className="flex items-center gap-2">
            <Button variant="primary">保存</Button>
            {row?.status === '草稿' && <Button variant="secondary">生效</Button>}
            {row?.status === '已生效' && <Button variant="ghost">下线</Button>}
          </div>
        )}
      />

      <div className="mx-auto max-w-[1500px] space-y-5 px-4 pb-10">
        <VerifyRuleEditor
          isNew={isNew}
          initialName={row?.name}
          initialStatus={row?.status}
        />
      </div>
    </div>
  )
}
