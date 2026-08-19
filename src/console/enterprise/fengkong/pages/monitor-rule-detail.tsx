// 企业风控 · 查看监控规则（fk-monitor-rule-detail）· 复用 RuleForm 组件（只读）
// 入口：监控规则页面操作列「查看」跳转，携带 ?id= 取对应规则名/说明
import manageSeed from '../../../fkMonManage.json'
import { RuleForm } from '../components/RuleForm'

export default function FkMonitorRuleDetail({ params }: { params: URLSearchParams }) {
  const id = params.get('id')
  const rule = (manageSeed.rules as Array<{ id: number; name: string; desc: string }>).find((r) => String(r.id) === id)
  return (
    <RuleForm
      mode="view"
      ruleName={rule?.name}
      ruleDesc={rule?.desc}
      backTo="/console/ep/fk-monitor-manage"
    />
  )
}
