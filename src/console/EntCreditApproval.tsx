/* 企业风控 · 企业信贷审批（四页薄包装）
 * 复用报告模块通用组件（ReportModuleList / ReportModuleDetail），
 * 数据与零售信贷贷前四页同源（同一打包 JSON 作 SEED），但各自独立持久化文件。
 */
import { ReportModuleList, ReportModuleDetail, ENT_INFO_MODULE, ENT_CREDIT_MODULE, ENT_FRAUD_MODULE, ENT_DECISION_MODULE } from './ReportModule'

export function EntPreVerify() { return <ReportModuleList cfg={ENT_INFO_MODULE} /> }
export function EntPreVerifyDetail() { return <ReportModuleDetail cfg={ENT_INFO_MODULE} /> }

export function EntCreditKimi() { return <ReportModuleList cfg={ENT_CREDIT_MODULE} /> }
export function EntCreditKimiDetail() { return <ReportModuleDetail cfg={ENT_CREDIT_MODULE} /> }

export function EntPreFraud() { return <ReportModuleList cfg={ENT_FRAUD_MODULE} /> }
export function EntPreFraudDetail() { return <ReportModuleDetail cfg={ENT_FRAUD_MODULE} /> }

export function EntPreReport() { return <ReportModuleList cfg={ENT_DECISION_MODULE} /> }
export function EntPreReportDetail() { return <ReportModuleDetail cfg={ENT_DECISION_MODULE} /> }
