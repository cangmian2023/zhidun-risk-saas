下面是按你三个问题合并成的**一张详细总表**（含子系统、页面、代码路径、具体位置、行号、现状）。所有内容均逐页核过代码，路径相对于项目根 `/Users/mandy/work/project/risk`。

| # | 子系统 | 类别 | 页面（大白话） | 代码文件（路径） | 具体位置 / 子页面 | 行号 | 现状 / 问题 |
|---|---|---|---|---|---|---|---|
| 1 | 数字营销 | 待建设整页 | 猎客信使·触达任务详情页 | `SaaS/src/console/menus.ts` + `SaaS/src/console/DmModule.tsx` | 路由 `dm:herald-task-detail` 未接入 DmModule | menus:395 / DmModule:135 | 点开回落「功能规划中」占位框 |
| 2 | 数字营销 | 待建设整页 | RTA 服务·RTA 请求详情页 | `SaaS/src/console/menus.ts` + `SaaS/src/console/DmModule.tsx` | 路由 `dm:rta-detail` 未接入 DmModule | menus:396 / DmModule:135 | 点开回落「功能规划中」占位框 |
| 3 | 数字营销 | 占位子模块 | 集团户（列表页） | `SaaS/src/console/DmGroupAccount.tsx` | 维度选项卡：关注 / 国企 / 民营 / 外资 / 机构 | — | 仅「央企」有数据，其余 5 个维度显示「内容待提供，后续补充」 |
| 4 | 数字营销 | 占位子模块 | 地图拓客 | `SaaS/src/console/DmMapProspect.tsx` | 地图区域 | 8 / 73 / 175 | 网格占位底图，待接高德 JS API 才能换真地图 + 地图搜索 |
| 5 | 数字营销 | 占位子模块 | 科创金融·科创企业详情页 | `SaaS/src/console/DmTechFinDetail.tsx` | 企业概览 Tab | 264 | 世界地图「专利布局热力图」占位；概览内多图表占位框 |
| 6 | 数字营销 | 占位子模块 | 科创金融·科创企业详情页 | `SaaS/src/console/DmTechFinDetail.tsx` | 6 个分析 Tab（科创能力/成果/科研团队/荣誉资质/资产/风险） | — | 各分析 Tab 内部还有若干子标签「内容待提供，后续补充」 |
| 7 | 数字营销 | 占位子模块 | 企业档案 / 数据复刻 | `SaaS/src/console/DmEntArchiveBasic.tsx` | 企业图谱可视化区 | 1112 | 「企业图谱可视化区域占位」 |
| 8 | 数字营销 | 占位子模块 | 企业档案 / 数据复刻 | `SaaS/src/console/DmEntArchiveBasic.tsx` | 统计概览模块 | 1113 | 「统计概览/分析类模块占位」 |
| 9 | 数字营销 | 占位子模块 | 企业档案 / 数据复刻 | `SaaS/src/console/DmEntArchiveBasic.tsx` | 经营信息 / 历史信息子模块 | — | 部分子模块写着「建设中」 |
| 10 | 数字营销 | 占位子模块 | 企业档案 / 数据复刻 | `SaaS/src/console/DmEntArchiveBasic.tsx` | 经营风险子 Tab | — | 未实现子 Tab 占位（保证标签数量一致） |
| 11 | 数字营销 | 占位子模块 | 企业档案 / 数据复刻 | `SaaS/src/console/DmEntArchiveBasic.tsx` | 企业关联图谱主题 | — | 4 个主题「图谱建设中，敬请期待」 |
| 12 | 数字营销 | 占位子模块 | 企业档案 / 数据复刻 | `SaaS/src/console/DmEntArchiveBasic.tsx` | 自定义页模块 | — | 「建设中，后续可添加」 |
| 13 | 数字营销 | 占位子模块 | 网格营销 | `SaaS/src/console/DmGridMarketing.tsx` | 右侧地图区域 | 125 / 200 | 水印占位（地图待接入） |
| 14 | 数字营销 | 占位子模块 | 金融法规 | `SaaS/src/console/DmFinLaw.tsx` | 整页 | — | 标注「内容待核对」，内容需确认 |
| 15 | 数字营销 | 占位子模块 | 数据魔方·债券 | `SaaS/src/console/DmBond.tsx` | 债券审批子面板 | 339 / 340 | 「企业债审批」「DCM 注册进程」面板占位 |
| 16 | 数字营销 | 占位跨模块 | 管理中心·统一预警配置 | `SaaS/src/console/CmAlertConfig.tsx` | 数字营销预警能力 | 106 | 标注「数字营销预警能力规划中（响应分阈值 / 转化异常预警待接入）」 |
| 17 | 企业风控 | 待建设整页 | 操作变更日志 | `SaaS/src/console/EnterprisePages.tsx` | 整页 | 655–658 | 「规划中，需求待定」占位 |
| 18 | 企业风控 | 占位子模块 | 企业关联图谱（详情页） | `SaaS/src/console/EntChainGraph.tsx` | 关系图谱主题 | 243 | 约 4 个主题「图谱建设中，敬请期待」 |
| 19 | 企业风控 | 占位子模块 | 经营风险（详情页） | `SaaS/src/console/EntOperatingRisk.tsx` | 二级 Tab | 256 | 未实现子 Tab 占位块 |
| 20 | 企业风控 | 占位子模块 | 法律风险（详情页） | `SaaS/src/console/EntLegalRisk.tsx` | 模块 | 192 | 未实现模块占位块 |
| 21 | 数字营销 | 死按钮/链接 | 企业档案 | `SaaS/src/console/DmEntArchiveBasic.tsx` | 表格内「详情 / 查看」 | 374(BlueLink) | `BlueLink` 是 `<a>` 无 onClick，点了没反应 |
| 22 | 数字营销 | 死按钮/链接 | 企业档案 | `SaaS/src/console/DmEntArchiveBasic.tsx` | 表格内「下载数据」 | 378(DownloadBtn) | 按钮无 onClick，点了没反应 |
| 23 | 数字营销 | 死按钮/链接 | 债券 | `SaaS/src/console/DmBond.tsx` | 表格内「查看」 | 91 / 332(LinkBlue) | `LinkBlue` 是 `<span>` 无 onClick，点了没反应 |
| 24 | 数字营销 | 死按钮/链接 | 线索详情（名单线索） | `SaaS/src/console/DmMarketListDetail.tsx` | 几十个筛选下拉 | 409–454 | 有选项但 `onChange={() => {}}`，选了不触发筛选 |
| 25 | 企业风控 | 死按钮/链接 | 账户年检（企业年报） | `SaaS/src/console/enterprise/fengkong/pages/account-yearly.tsx` | 查询区按钮 | 167 / 170 / 185 | 「+ 上传企业」「开始查询」「下载」onClick 均为空 |
| 26 | 企业风控 | 死按钮/链接 | 经营风险（详情页） | `SaaS/src/console/EntOperatingRisk.tsx` | 表格「详情」链接 | 197 / 245 | 2 处链接 onClick 均为空 |
| 27 | 企业风控 | 死按钮/链接 | 受益所有人（详情页） | `SaaS/src/console/EntBeneficialOwner.tsx` | 自然人姓名链接 | 135 | 链接 onClick 为空 |
| 28 | 数字营销 | 空下拉 | 企业档案 | `SaaS/src/console/DmEntArchiveBasic.tsx` | 约 20 个筛选 Select | 552 / 631 / 632 / 633 / 664 / 793 / 835–838 / 865–868 / 920 / 946 | 只有占位文字、展开后无真实选项（股东类型 / 登记状态 / 所属地区 / 所属行业 / 变更类型 / 主体类型 / 投资比例 / 间接持股比例 / 全部或部份关系 / 全国 等） |
| 29 | 数字营销 | 空下拉 | 金融法规 | `SaaS/src/console/DmFinLaw.tsx` | 颁布单位下拉 | 154 | 仅 1 个占位项「请输入颁布单位」 |
| 30 | 数字营销 | 空下拉 | 金融法规 | `SaaS/src/console/DmFinLaw.tsx` | 违规依据下拉 | 294 | 仅 1 个占位项「查询该法规作为违规依据的所有处罚案例」 |
| 31 | 数字营销 | 空下拉 | 全维搜索·高级搜索 | `SaaS/src/console/DmFullSearch.tsx` | 万亿 / 省市地区 / 所在行业 下拉 | 232 / 1036 / 1037 | 仅 1 个选项 |
| 32 | 企业风控 | 空下拉 | 账户年检（企业年报） | `SaaS/src/console/enterprise/fengkong/pages/account-yearly.tsx` | 目标客群下拉 | 164–166 | 仅当前客群名 1 个选项，不能切换其他人群 |

**统计**：数字营销 16 项（2 整页 + 11 子模块占位 + 3 死链接 + 4 空下拉，其中第 24 行单列）+ 企业风控 11 项（1 整页 + 3 子模块占位 + 3 死链接 + 1 空下拉），合计 **32 项**。

需要我直接动手修哪几项，告诉我编号或页面名就行（比如「先修 28 行企业档案那 20 个空下拉」或「修 25 行账户年检 3 个死按钮」）。