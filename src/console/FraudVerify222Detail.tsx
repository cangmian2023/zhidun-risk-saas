/* 欺诈识别（方案222）报告详情页 —— 通用组件薄包装（模板驱动 + 本地 JSON） */
import { ReportModuleDetail } from './ReportModuleDetail'
import { FRAUD_MODULE } from './ReportModule'

export default function FraudVerify222Detail() {
  return <ReportModuleDetail cfg={FRAUD_MODULE} />
}
