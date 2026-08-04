/* 进件审核（方案222）列表页 —— 通用组件薄包装（模板驱动 + 本地 JSON） */
import { ReportModuleList, DECISION_MODULE } from './ReportModule'

export default function DecisionVerify222() {
  return <ReportModuleList cfg={DECISION_MODULE} />
}
