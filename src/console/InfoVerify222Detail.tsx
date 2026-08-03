/* 信息核验（方案222）报告详情页 —— 通用组件薄包装（模板驱动 + 本地 JSON） */
import { ReportModuleDetail } from './ReportModuleDetail'
import { INFO_MODULE } from './ReportModule'

export default function InfoVerify222Detail() {
  return <ReportModuleDetail cfg={INFO_MODULE} />
}
