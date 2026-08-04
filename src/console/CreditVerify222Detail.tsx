/* 信用风控（方案222）报告详情页 —— 通用组件薄包装（模板驱动 + 本地 JSON） */
import { ReportModuleDetail } from './ReportModuleDetail'
import { CREDIT_MODULE } from './ReportModule'

export default function CreditVerify222Detail() {
  return <ReportModuleDetail cfg={CREDIT_MODULE} />
}
