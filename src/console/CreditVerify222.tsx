/* 信用风控（方案222）列表页 —— 通用组件薄包装（模板驱动 + 本地 JSON） */
import { ReportModuleList, CREDIT_MODULE } from './ReportModule'

export default function CreditVerify222() {
  return <ReportModuleList cfg={CREDIT_MODULE} />
}
