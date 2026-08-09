# 需求17 · 六大能力 Gap 的可实现性分析与优化方案

> 延续需求13评审。本文针对 6 个未充分满足的需求，逐条回答两个问题：
> **① 是否可以通过修改现有功能实现？**（给出代码落点与改造深度）
> **② 每个需求提 3-5 个优化方案**（均复用已完成的框架与本地样例 JSON）。
>
> 项目铁律：所有数据来自本地样例 JSON，改造 = 扩展样例字段 + 复用既有组件（图表 / DataTable / 关系图谱 / 流程编辑器 / 看板配置）。
> 结论先行：**6 项全部可改现有功能实现**；其中"策略实验室/A-B"需新增一个轻量模块（仍基于本地 JSON + 现有 FlowCanvasEditor 底座），改造深度最高，其余均可在既有页面内扩展。

---

## 总览

| # | Gap | 是否可改现有功能 | 改造深度 | 主复用落点 |
|---|---|---|---|---|
| 1 | 跨行业联防联控（实时多头/共债网络） | ✅ 可 | 中 | `MidCustDetail` 关系图谱、`ruleHubData`、`preApp` |
| 2 | 设备指纹 / 动态欺诈模型 | ✅ 可 | 中 | `MidCustDetail.env`、`MidAlertDetail` 设备表、`ruleHubData` |
| 3 | 周期性监测引擎（运行态闭环） | ✅ 可 | 中 | `MidMonitorConfig`、`dashboardData` 任务运行态字段 |
| 4 | 策略实验室 / A-B / 冠军挑战者 | 🟡 部分（需新增轻量模块） | 高 | `FlowCanvasEditor`、`ModulePage`、`scoringData` |
| 5 | 模型可解释性（waterfall / 归因） | ✅ 可 | 低 | `ScoreModule`/`ScoreQueryPage` 因子贡献、`charts.tsx` |
| 6 | 分群运营深化（促活/提额/二次经营链路） | ✅ 可 | 中 | `midData` 运营任务、`bizFlows` 促活流程、`DataTable` |

---

## 1. 跨行业联防联控：缺真实多头/共债实时网络视图

**现状（代码落点）**
- `preApp.ts:724` 联防联控仅为布尔值：`jointHit ? '命中联防联控名单' : '未命中联防联控名单'`。
- `reportTemplateData.ts` R5 联防联控规则、`blacklist_hit` 黑名单命中段（仍是单条记录）。
- `ruleHubData.ts` 黑名单为静态样例（手机号/设备指纹/身份证/银行卡），无机构维度。
- `data.ts:115` 共债预警模型 V1.0（类型"关系网络"，状态"训练"中）。
- `VerifyRuleEditor.tsx:187` 已定义数据源 `ds-network / 跨行业联防联控交叉核验` —— 接入位已预留。
- `dashboardData.ts:149` `dashboard_monitor_tasks` 含 `scan_customers / trigger_alerts`（多头监测任务运行数据已在）。

**① 是否可改现有功能实现：✅ 可。** 关系图谱组件（`MidCustDetail` 的 `withCustGraph`）、规则中心的名单、`preApp` 的联防联控位均可复用；缺的"网络视图"本质是关系图谱的一个新主题 + 名单节点的机构维度，无需新建引擎。

**② 优化方案（5 个）**
1. **复用关系图谱加"名单网络"主题**：节点 = 客户 + 关联机构 + 名单库，边 = 多头/共债；高频共债机构聚类高亮（复用 `withCustGraph` 的 `ring`/网络主题机制）。
2. **规则中心新增"跨机构名单网络"标签页**：机构 × 名单类型矩阵，展示命中数/命中率（复用 `ruleHubData` 黑名单结构扩 `org` 字段）。
3. **单客详情加"多头共债"子板块**：近 30 天申贷机构数（已存在于 `withCustGraph` 的 `queries`）、共债机构、同设备申请 —— 全部复用 `midData` 已有字段。
4. **进件页联防联控升级为明细卡**：从布尔升级为"命中机构清单 + 共债链条"展示（改 `preApp.ts:724` 区块）。
5. **监控大盘加"共债网络 TOP"排行**：复用 `dashboardData` 的 `MT` 任务 `scan_customers / trigger_alerts`。

---

## 2. 设备指纹 / 动态欺诈模型：缺设备维度与动态模型命中展示

**现状（代码落点）**
- `preApp.ts:419-423` `deviceRisk` 仅是一段文字列表（群控/异地 IP 等）。
- `scoreReport.ts:69/105/176` 设备指纹一致性为评分项（一致=0~10 分），无独立设备视图。
- `MidCustDetail.tsx` `withCustGraph` 已含 `env`（设备环境）字段；`midData.ts:842-843` 已有 `m_device_cnt / m_device_risk` 指标。
- `MidAlertDetail.tsx:259` 已有"设备ID/IMEI/登录时间/IP/命中标记"表格 —— 但只嵌在预警明细里，未成独立维度。
- `ruleHubData.ts:51` FR-002 设备环境风险（模拟器/虚拟机命中）；黑名单含 `type:'设备指纹'`。

**① 是否可改现有功能实现：✅ 可。** `env`、设备表、设备指标均已存在，仅缺"设备维度"的聚合展示层与动态模型命中列表，加一个板块/标签页即可，不新建数据层。

**② 优化方案（5 个）**
1. **单客详情新增"设备与欺诈维度"板块**：设备ID/机型/系统/环境风险分/群控模拟器标记（复用 `env` + `MidAlertDetail:259` 设备表）。
2. **进件页设备区块升级为"设备风险画像"**：指纹一致性 + 环境分 + 动态模型命中（分数条 + 命中规则列表）。
3. **规则中心加"设备风险"规则组**：复用 FR-002，新增动态模型命中明细（模型名/命中分/触发特征）。
4. **关系图谱加"设备"节点类型**：已支持 `device`（见 `midData.ts:1507` `channel:'设备指纹库'`），把同设备多账号关系可视化。
5. **监控大盘加"高危设备/模拟器"实时看板**：复用 `m_device_risk / m_emu_cnt / m_root_cnt` 指标 + `midDashboardSeed` 设备指纹风险看板。

---

## 3. 周期性监测引擎：缺"扫描引擎运行态 + 命中即告警"闭环

**现状（代码落点）**
- `midData.ts:945-1141` t001~t050 监测任务仅有配置字段（`crowd / scene / flowKey / flowState`），**无运行时态**。
- `MidMonitorConfig.tsx` 配置页支持 `granularity / period / metricIds / output / enabled`，但**无 lastRun/nextRun/hitCount 展示**。
- `dashboardData.ts:149` `dashboard_monitor_tasks` 已有 `last_run / trigger_alerts / success_rate / duration_sec / scan_customers` —— **运行态数据已存在，只是未作为"引擎运行态"呈现**。

**① 是否可改现有功能实现：✅ 可。** 运行态数据已在 `dashboardData`；给 `midStrategy.json` 任务补 `lastRun/nextRun/hitCount` 字段，在 `MidMonitorConfig` 加一个"运行态"tab 即可，逻辑全复用既有 DataTable + 状态机。

**② 优化方案（5 个）**
1. **MidMonitorConfig 加"运行态"tab**：每任务展示 上次扫描 / 下次扫描（由 `period+granularity` 推算）/ 命中数 / 成功率 / 耗时（复用 `dashboardData` 字段）。
2. **命中即告警闭环**：任务命中 → 自动生成预警（复用 `midAlerts` 的 `alert_type` 映射）+ 工单（复用 `midData` 处置策略 d9~d12 的 `提额/促活/预催`）。
3. **监控大盘加"引擎运行态势"卡**：运行中任务数 / 今日扫描客户数 / 今日命中（复用 `dashboardData` MT 任务）。
4. **任务配置页加"试运行"按钮**：模拟一次扫描，展示命中预览（复用 `evalMetricFormula` 计算引擎）。
5. **实时任务流式命中 feed**：对"共债预警实时碰撞"类实时任务，加流式命中流（复用 `MidAlertWorkbench` 的实时任务视图）。

---

## 4. 策略实验室 / A-B / 冠军挑战者：缺策略版本管理与效果对比

**现状（代码落点）**
- `specsCr.ts:409/427` 仅**规格/展示性描述**了"冠军挑战者 / A-B Test / 模型版本管理"，**无实际功能**。
- `FlowCanvasEditor.tsx` 决策流可视化编辑已存在（可作策略编辑底座）。
- `data.ts:115` 共债模型 V1.0、`ModulePage.tsx` 模型列表、`scoringData.ts:125` `T-1 设备环境分切点回退` 建议 —— 均为单点，无版本/对比。
- 全代码无 `version / champion / challenger / A-B` 实际实现。

**① 是否可改现有功能实现：🟡 部分可。** 决策流编辑（`FlowCanvasEditor`）、模型列表（`ModulePage`）是现成底座，**版本管理 / A-B 对比需新增一个轻量模块**，但仍完全基于本地 JSON + 复用既有组件，不引入新框架。改造深度最高。

**② 优化方案（5 个）**
1. **决策流版本管理**：`bizFlows.json` 每个 flow 加 `versions[]`（快照 + 生效标记），`FlowCanvasEditor` 加版本切换/对比（复用现有节点结构，diff 高亮改动节点）。
2. **策略实验室页（新增轻量模块）**：同场景两策略（冠军/挑战者）并行跑样例客群，输出命中率/误杀率/收益对比表（复用 `DataTable` + `scoringData` 场景定义）。
3. **模型版本管理**：复用 `ModulePage` 模型列表，加 `version / PSI / 回退`（复用 `specsSc.ts:272` PSI 阈值思路）。
4. **离线回测**：选历史样例客群跑策略，输出 lift / KS（复用 `scoreReport` 结构）。
5. **灰度发布**：策略按流量比例（如 10%）灰度，实时监控对比（复用 `dashboardData` 状态字段）。

---

## 5. 模型可解释性：缺 waterfall、特征归因可视化

**现状（代码落点）**
- `ScoreModule.tsx:192/233` "风险因子明细"已含 `contribution`（贡献度）列表；`ScoreQueryPage.tsx:35/159` 同结构。
- `scoringData.ts:54` 设备环境风险 `contribution: 22`；`scoringData.ts:126` `T-2 新增特征贡献度`。
- `specsSc.ts:401` "拒绝客户命中因素归因" —— 仅规格。
- **已有因子贡献数值，但无 waterfall 图 / SHAP 式归因可视化。**

**① 是否可改现有功能实现：✅ 可（深度最低）。** 贡献度数据已齐备，只需在现有评分详情加一个 waterfall 图表（复用 `charts.tsx` 已有 `BarChart/LineChart` 能力），不新增数据层。

**② 优化方案（5 个）**
1. **评分详情加"特征贡献 waterfall"**：基线分 → 各因子加减 → 最终分（复用 `scoringData` contribution + `charts.tsx`）。
2. **拒绝归因卡**："为什么拒" Top 因子红字 + 贡献排序（复用 `ScoreModule` 规则命中明细）。
3. **单客详情"模型评分"板块加可解释**：智察/智信/智融三模型各因子贡献（复用 `withCustGraph` 的 `scores`）。
4. **评分查询页加"特征归因"tab**：因子明细 + 同分位客群对比。
5. **决策报告加"评分解释"段**：一句话结论 + "哪些因子把你推高/拉低"（复用 `ModulePage` 解释文本）。

---

## 6. 分群运营深化：促活/提额/二次经营周期性评估与名单跟踪链路偏弱

**现状（代码落点）**
- `midData.ts:1125-1141` t046~t050 存量运营任务（睡眠唤醒/提额机会/流失预警/老客促活/交叉销售），含 `flowKey/flowState`。
- `midData.ts:1174-1180` 处置策略 d9~d12 动作含 `提额/促活`，已接营销系统。
- `specsCr.ts:330-346` 客群分层（高价值-低风险等）+ action（提额/促活/二次营销）。
- `bizFlows.json:295-468` 客群运营流程、促活评估流程（含状态机 制定促活策略→促活跟进完成）。
- `scoringData.ts:177-215` 提额候选规则 + 场景；`ruleHubData.ts:67` SR-002 提额候选。
- `MidDashboardSeed.tsx:2221+` 提额邀请数图表。
- **数据 / 流程 / 规格齐全，但缺"周期性评估 + 名单跟踪链路"的专属视图**（名单从候选到落地的状态流转不可见）。

**① 是否可改现有功能实现：✅ 可。** 复用 `DataTable` + `bizFlows` 促活流程状态机 + `midData` 名单，加一个"运营名单跟踪"看板即可，全部基于本地 JSON。

**② 优化方案（5 个）**
1. **td5 存量客群运营加"运营名单跟踪"tab**：名单（客户 / 分层 / 动作提额促活 / 评估状态 / 最近评估日 / 下一评估日），复用 `DataTable` + `midData` 名单 + 处置策略。
2. **周期性评估闭环**：名单按周期（月/季）自动复评（复用 t046~t050 周期），状态 候选→评估中→已提额/已促活/已转化（复用 `bizFlows` 促活流程状态机）。
3. **促活/提额效果看板**：转化率 / 提额金额 / 留存（复用 `MidDashboardSeed` 提额邀请数 + `scoringData` 场景）。
4. **单客详情加"运营动作"时间线**：复用 `approvalRecords` 结构，展示该客户历次提额/促活动作与结果。
5. **首页加"运营机会"卡**：高价值-低风险 提额/促活 名单数（复用 `specsCr` 分层数据），一键直达名单跟踪。

---

## 落地建议（优先级）

- **P0（低成本高感知，建议先做）**：#5 模型可解释 waterfall（只加图）、#3 监测引擎运行态 tab（数据已有）、#1 联防联控名单网络主题（复用关系图谱）。
- **P1（中等改造）**：#2 设备维度板块、#6 运营名单跟踪 tab。
- **P2（需新增模块）**：#4 策略实验室 / A-B（唯一需要新建轻量页，但底座齐全）。

> 所有方案均**不新建数据通道**，仅扩展本地样例 JSON 字段 + 复用图表/DataTable/关系图谱/流程编辑器/看板配置等既有组件，符合项目"数据来自本地样例 JSON + 复用已完成框架"的架构铁律。
