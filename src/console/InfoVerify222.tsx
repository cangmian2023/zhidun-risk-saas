/* 信息核验（方案222）列表页 —— 通用组件薄包装（模板驱动 + 本地 JSON） */
import { ReportModuleList, INFO_MODULE } from './ReportModule'

export default function InfoVerify222() {
  return <ReportModuleList cfg={INFO_MODULE} />
}
