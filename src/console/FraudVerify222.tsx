/* 欺诈识别（方案222）列表页 —— 通用组件薄包装（模板驱动 + 本地 JSON） */
import { ReportModuleList, FRAUD_MODULE } from './ReportModule'

export default function FraudVerify222() {
  return <ReportModuleList cfg={FRAUD_MODULE} />
}
