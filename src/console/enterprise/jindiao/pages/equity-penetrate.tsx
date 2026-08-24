// 尽调中心 · 股权穿透图谱（jd-equity-penetrate）
// 从「受益所有人识别详情页」的「股权穿透」按钮进入的二级页面；
// 顶部返回按钮回到详情页（ep:jd-beneficiary-result）；主体为股权穿透图谱。
// 图谱直接复用项目已有的 EntEquityGraph 组件（缩放/平移/筛选/节点详情）。
import { usePageNav } from '../../../pageNav'
import { EpPage, EpBtn } from '../../epCommon'
import EntEquityGraph from '../../../EntEquityGraph'

export default function JdEquityPenetrate({ params }: { params: URLSearchParams }) {
  const { back } = usePageNav()
  // 由详情页跳转时带入企业名（?name=），用于核心主体节点显示
  const companyName = params.get('name') || undefined
  return (
    <EpPage
      title="股权穿透"
      crumb="受益所有人 / 股权穿透"
      actions={
        <EpBtn variant="ghost" onClick={() => back('/console/ep/jd-beneficiary-result')}>返回</EpBtn>
      }
    >
      <EntEquityGraph companyName={companyName} />
    </EpPage>
  )
}
