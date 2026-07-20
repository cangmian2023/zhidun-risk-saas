# 金融风控 SaaS · 产品设计文档目录

> 本目录收录「金融风控平台」SaaS 产品的所有功能/交互设计文档。
> 代码工程在上级目录 `SaaS/`（Vite 原型，项目名 `zhidun-risk-saas`）。
ces
---

## 一、文档结构

按层级分为「平台级」与「零售信贷风控子系统级」两组。

### 1. 平台级（跨子系统公共）

| 文档 | 内容 |
|---|---|
| `金融风控系统权威产品梳理.md` | 行业权威风控产品调研基准（腾讯天御 / 蚂蚁 / 同盾等），用于选型与对标 |
| `金融风控SaaS产品功能结构设计.md` | 业务子系统菜单 / 页面 / 功能树（零售信贷风控 + 评分产品） |
| `金融风控SaaS基础用户功能设计.md` | 平台基础用户功能：个人中心 / 消息通知 / 工单与支持 / API 文档 / 帮助中心 / 企业设置 |

### 2. 零售信贷风控子系统

| 文档 | 内容 | 状态 |
|---|---|---|
| `申贷审核功能详细设计.md` | 申贷审核列表筛选 / 审核状态 / 详情页（决策结论·申请信息·信息核验·风险评分·命中规则·设备环境·下一步操作） | 已定稿 |
| `申贷审核状态机与复核记录设计.md` | 决策结果 vs 审核状态 关系、状态机、下一步操作矩阵、复合详情页、多轮复核时间线 | **草稿，待修改** |
| `信息核验功能详细设计.md` | 信息核验详情页（5 组核验条目）、自动为主人工兜底流程、角色权限 | 已定稿 |
| `风险评分与命中规则详情设计.md` | 风险评分计算口径（方向一致性 / 预警阈值 / 扣分制 vs 累加制 / 风险指数累加公式 / 综合分变换公式） | 已定稿（§2.4 旧数字待与 §2.7 统一） |
| `申贷审核报告-风险评分与命中规则展示规范与样例数据.md` | 报告前端实现参考：评分卡式三列（用户情况 / 得分 / 标准）+ 3 套完整 JSON 样例 | 已定稿 |

### 3. 文档依赖关系

```
产品功能结构设计 ──┬─ 申贷审核功能详细设计 ──┬─ 申贷审核状态机与复核记录设计（草稿）
                  │                         ├─ 信息核验功能详细设计
                  │                         └─ 风险评分与命中规则详情设计
                  │                               └─ 申贷审核报告-风险评分与命中规则展示规范与样例数据
                  └─ 基础用户功能设计
```

---

## 二、下一步：同步申贷审核页面的卡片信息

**目标**：依据本目录的设计文档，将「申贷审核详情页」的卡片（区块）信息同步为**按能力来源切分**的结构，并与左侧一级菜单保持一致。

### 1. 当前问题

- 信息核验是一级菜单，但详情页无聚合区块，其产出散落在「基础信息」+「证件与材料」中；
- 「设备与环境」实为欺诈识别能力，却未归入对应区；
- 卡片切分视角（数据类型）与能力来源视角不一致，复核员难以定位。

### 2. 参考结构（推荐落位）

> 详情页改为「能力来源视角」：每个能力区与一级菜单对齐，区内再按数据类型组织。

<div align="center">

<svg viewBox="0 0 680 680" width="100%" xmlns="http://www.w3.org/2000/svg">
<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </marker>
</defs>
<title>信息核验在申贷审核详情页的落位对比</title>
<desc>现状按数据类型切区块导致信息核验产出散落；推荐按能力来源对齐，设信息核验区与一级菜单一致</desc>

<text x="40" y="38" font-size="14" font-weight="500" fill="#2C2C2A">信息核验 在申贷审核详情页的落位</text>
<text x="40" y="58" font-size="12.5" font-weight="400" fill="#5F5E5A">结论：信息核验(能力) ≠ 证件与材料(数据)；后者只是其子集</text>

<rect x="40" y="74" width="600" height="38" rx="8" fill="#FCEBEB" stroke="#E24B4A" stroke-width="0.5"/>
<text x="52" y="97" font-size="12" font-weight="400" fill="#791F1F">问题：信息核验是一级菜单，详情页却无聚合区块，产出散落在「基础信息」+「证件与材料」</text>

<text x="40" y="138" font-size="13" font-weight="500" fill="#2C2C2A">现状（按数据类型切区块）</text>
<text x="360" y="138" font-size="13" font-weight="500" fill="#042C53">推荐（按能力来源切，与菜单一致）</text>

<rect x="40" y="150" width="300" height="44" rx="8" fill="#F1EFE8" stroke="#888780" stroke-width="0.5"/>
<text x="52" y="170" font-size="13" font-weight="500" fill="#2C2C2A">基础信息</text>
<text x="52" y="186" font-size="11.5" font-weight="400" fill="#5F5E5A">含信息核验(格式/真实性/矛盾)+表单</text>

<rect x="40" y="202" width="300" height="44" rx="8" fill="#F1EFE8" stroke="#888780" stroke-width="0.5"/>
<text x="52" y="222" font-size="13" font-weight="500" fill="#2C2C2A">证件与材料</text>
<text x="52" y="238" font-size="11.5" font-weight="400" fill="#5F5E5A">信息核验·子集：OCR/人脸/活体</text>

<rect x="40" y="254" width="300" height="44" rx="8" fill="#F1EFE8" stroke="#888780" stroke-width="0.5"/>
<text x="52" y="274" font-size="13" font-weight="500" fill="#2C2C2A">设备与环境</text>
<text x="52" y="290" font-size="11.5" font-weight="400" fill="#5F5E5A">欺诈识别（非信息核验）</text>

<rect x="40" y="306" width="300" height="44" rx="8" fill="#F1EFE8" stroke="#888780" stroke-width="0.5"/>
<text x="52" y="326" font-size="13" font-weight="500" fill="#2C2C2A">风险评分</text>
<text x="52" y="342" font-size="11.5" font-weight="400" fill="#5F5E5A">决策引擎产物</text>

<rect x="40" y="358" width="300" height="44" rx="8" fill="#F1EFE8" stroke="#888780" stroke-width="0.5"/>
<text x="52" y="378" font-size="13" font-weight="500" fill="#2C2C2A">命中规则与模型</text>
<text x="52" y="394" font-size="11.5" font-weight="400" fill="#5F5E5A">决策引擎产物</text>

<text x="52" y="424" font-size="11.5" font-weight="400" fill="#A32D2D">注：信用风控 / 欺诈识别在现状中未单列</text>

<rect x="360" y="150" width="280" height="36" rx="8" fill="#F1EFE8" stroke="#888780" stroke-width="0.5"/>
<text x="372" y="172" font-size="12" font-weight="400" fill="#2C2C2A">决策结论 / 说明 / 下一步操作</text>

<rect x="360" y="192" width="280" height="32" rx="8" fill="#F1EFE8" stroke="#888780" stroke-width="0.5"/>
<text x="372" y="212" font-size="12" font-weight="400" fill="#5F5E5A">申请信息（纯表单展示，不挂能力）</text>

<rect x="360" y="232" width="280" height="196" rx="12" fill="#E6F1FB" stroke="#378ADD" stroke-width="1"/>
<text x="372" y="252" font-size="12.5" font-weight="500" fill="#042C53">信息核验区（与一级菜单对齐）</text>

<rect x="372" y="262" width="256" height="34" rx="6" fill="#B5D4F4" stroke="#378ADD" stroke-width="0.5"/>
<text x="380" y="283" font-size="11.5" font-weight="400" fill="#042C53">基本信息核验（原基础信息核验部分）</text>

<rect x="372" y="302" width="256" height="34" rx="6" fill="#B5D4F4" stroke="#378ADD" stroke-width="0.5"/>
<text x="380" y="323" font-size="11.5" font-weight="400" fill="#042C53">证件核验：原图 + 真伪 + OCR</text>

<rect x="372" y="342" width="256" height="34" rx="6" fill="#B5D4F4" stroke="#378ADD" stroke-width="0.5"/>
<text x="380" y="363" font-size="11.5" font-weight="400" fill="#042C53">人脸活体核验</text>

<rect x="372" y="382" width="256" height="34" rx="6" fill="#B5D4F4" stroke="#378ADD" stroke-width="0.5"/>
<text x="380" y="403" font-size="11.5" font-weight="400" fill="#042C53">逻辑一致性核验</text>

<rect x="360" y="436" width="280" height="30" rx="8" fill="#E6F1FB" stroke="#378ADD" stroke-width="0.5"/>
<text x="372" y="456" font-size="11.5" font-weight="400" fill="#042C53">信用风控区（多头/共债/联防联控）</text>

<rect x="360" y="472" width="280" height="30" rx="8" fill="#E6F1FB" stroke="#378ADD" stroke-width="0.5"/>
<text x="372" y="492" font-size="11.5" font-weight="400" fill="#042C53">欺诈识别区（含原「设备与环境」）</text>

<rect x="360" y="508" width="280" height="34" rx="8" fill="#F1EFE8" stroke="#888780" stroke-width="0.5"/>
<text x="372" y="529" font-size="11.5" font-weight="400" fill="#5F5E5A">风险评分 / 命中规则与模型</text>

<rect x="40" y="600" width="600" height="60" rx="10" fill="#F1EFE8" stroke="#888780" stroke-width="0.5"/>
<text x="52" y="622" font-size="12.5" font-weight="500" fill="#2C2C2A">信息核验区统一行范式（与风险评分三列风格一致）</text>
<text x="52" y="644" font-size="12" font-weight="400" fill="#5F5E5A">核验项 ｜ 用户情况 ｜ 结果(通过/不通过/待人工) ｜ 评分标准</text>
</svg>

</div>

### 3. 需要同步的卡片清单

按推荐结构，申贷审核详情页的卡片应调整为（自上而下）：

1. **决策结论 / 决策说明 / 下一步操作** — 结论层
2. **申请信息** — 纯表单展示，不挂能力
3. **信息核验区**（与一级菜单「信息核验」对齐，只读展示，条目见 `信息核验功能详细设计.md` §5）
   - 基本信息核验（原「基础信息」中的格式/真实性/矛盾部分）
   - 证件核验（原「证件与材料」：原图 + 真伪 + OCR 字段 + 防伪）
   - 人脸活体核验
   - 逻辑一致性核验
   - 统一行范式：`核验项 ｜ 用户情况 ｜ 结果(通过/不通过/待人工) ｜ 评分标准`
4. **信用风控区**（多头 / 共债 / 联防联控）
5. **欺诈识别区**（含原「设备与环境」）
6. **风险评分 / 命中规则与模型**（评分卡式三列，见 `申贷审核报告-风险评分与命中规则展示规范与样例数据.md`）

### 4. 同步依据（要回写的源文档）

| 卡片 | 对齐文档与章节 |
|---|---|
| 信息核验区 | `信息核验功能详细设计.md` §5（5 组核验条目） |
| 风险评分 / 命中规则 | `申贷审核报告-风险评分与命中规则展示规范与样例数据.md`（三列 + 样例 JSON） |
| 状态 / 下一步操作 | `申贷审核状态机与复核记录设计.md`（状态机、下一步操作矩阵、复核时间线） |

---

## 三、待办（与 README 同步推进）

- [ ] 确认「能力来源视角」重组 §3.1 详情页（基础信息 / 证件与材料 / 设备与环境 → 信息核验区 / 信用风控区 / 欺诈识别区）
- [ ] 信息核验区子卡切法确认（基本信息 / 证件 / 人脸活体 / 逻辑一致性 4 张）
- [ ] `风险评分与命中规则详情设计.md` §2.4 旧数字（704）与 §2.7 公式口径统一
- [ ] `申贷审核状态机与复核记录设计.md` 草稿经用户修改后回写进 `申贷审核功能详细设计.md`
- [ ] 完成 GitHub 上传（独立仓库 + SSH，公钥已取，待用户注册到 GitHub 账号）
