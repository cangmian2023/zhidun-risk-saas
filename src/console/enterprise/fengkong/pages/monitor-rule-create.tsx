// 企业风控 · 创建监控规则（fk-monitor-rule-create）· 复用 RuleForm 组件
import { RuleForm } from '../components/RuleForm'

export default function FkMonitorRuleCreate(_: { params?: URLSearchParams }) {
  return <RuleForm mode="create" backTo="/console/ep/fk-monitor-manage" />
}
