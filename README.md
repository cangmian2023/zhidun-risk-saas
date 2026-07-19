# zhidun-risk-saas

同盾风格 **贷前风控 SaaS 产品原型**（设计文档 + Vite 前端）。

> 本仓库是「金融风控平台」中的一个产品：以零售信贷「申贷审核」为主线的贷前风控 SaaS，覆盖申贷审核、信息核验、风险评分与命中规则等模块的产品设计与可运行前端原型。

## 目录结构

```
SaaS/
├── README.md            # 本文件（仓库首页）
├── doc/                 # 产品设计文档（详见 doc/README.md）
│   └── README.md        # 文档结构 + 下一步同步申贷审核卡片
├── src/                 # Vite + React + TypeScript 前端原型
├── index.html
├── package.json         # name: zhidun-risk-saas
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── postcss.config.js
```

## 设计文档索引

完整文档结构与依赖关系见 **[`doc/README.md`](doc/README.md)**。

| 分组 | 文档 |
|---|---|
| 平台级 | [金融风控系统权威产品梳理](doc/金融风控系统权威产品梳理.md) · [SaaS 产品功能结构设计](doc/金融风控SaaS产品功能结构设计.md) · [基础用户功能设计](doc/金融风控SaaS基础用户功能设计.md) |
| 零售信贷风控 | [申贷审核功能详细设计](doc/申贷审核功能详细设计.md) · [申贷审核状态机与复核记录设计](doc/申贷审核状态机与复核记录设计.md)（草稿）· [信息核验功能详细设计](doc/信息核验功能详细设计.md) · [风险评分与命中规则详情设计](doc/风险评分与命中规则详情设计.md) · [申贷审核报告-风险评分与命中规则展示规范与样例数据](doc/申贷审核报告-风险评分与命中规则展示规范与样例数据.md) |

## 本地运行

```bash
npm install
npm run dev      # Vite 开发服务器
```

## 说明

- 前端为产品原型（`zhidun-risk-saas`），用于演示申贷审核、信息核验、风险评分等页面的交互与展示规范。
- 设计文档中的评分公式、阈值、状态机为产品口径，引擎实现以 `doc/风险评分与命中规则详情设计.md` §2.7 为准。
