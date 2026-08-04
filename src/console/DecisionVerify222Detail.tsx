/* 进件审核（方案222）报告详情页 —— 通用组件薄包装（模板驱动 + 本地 JSON） */
import { ReportModuleDetail } from './ReportModuleDetail'
import { DECISION_MODULE } from './ReportModule'

export default function DecisionVerify222Detail() {
  return <ReportModuleDetail cfg={DECISION_MODULE} />
}
