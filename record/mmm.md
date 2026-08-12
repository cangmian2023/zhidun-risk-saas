# 交付说明
1. 整体身份：风控建模资深专家视角，链路100%透明、无隐性逻辑、无预留空ID混淆视听；**所有参与运算规则完整枚举，不存在“后台悄悄执行的逻辑”**。
2. 输出两份核心内容：
    - ① 流水线业务文字定义（给产品/评审阅读）
    - ② 标准JSON配置文件（可直接导入【模型管理系统】完成可视化编排、节点配置、输入输出绑定）
3. 修正历史所有瑕疵：
    - 删除大量“预留空ID”造成的歧义；生效规则全部连续编号，未启用规则不在配置内出现；
    - 清晰区分：原始数据源、独立图谱计算节点、特征工程、主线串行链路、支线并行预警链路；
    - 严格区分【主线衍生预警】和【Alert支线独立预警】，边界永不混淆；
    - 所有指标计算公式、阈值、扣分值完整写入配置；
    - 明确每个节点：输入字段、输出字段、算法类型、执行顺序、上下游依赖。

## 全局基础信息
流水线名称：**智信分授信风控流水线V1.0**
调度模式：
- 串行主线：顺序执行
- Alert预警引擎：**与【逻辑回归评分卡】并行启动**（同源读取特征工程输出，互不阻塞、互不影响）
> 拓扑执行顺序严格时序：
> 1. 上游拉取【客户进件征信原始数据】
> 2. 提取身份证+手机号 → 提交【关联图谱计算节点】
> 3. 等待图谱标签返回 → 【特征工程节点】汇聚所有数据、计算衍生指标
> 4. 特征工程输出标准化特征集，同时分发两路：
>    - 路径A（主线串行）：Block拦截 → 逻辑回归智信分模型 → Rule扣分规则引擎 → 主线衍生预警判定
>    - 路径B（并行支线）：Alert独立预警引擎（同步执行，不等待主线结果）

# 一、流水线业务文档（配套JSON使用）
## 节点清单（全部运行节点，无隐藏）
1. 节点ID：`node_graph_calc`｜节点名称：关联图谱计算节点
    算法：图连通子图社群挖掘算法
    输入：身份证号,手机号码
    输出：团伙欺诈关联标记（0=否，1=是）

2. 节点ID：`node_feature_eng`｜节点名称：特征工程
    输入：全部进件原始字段 + 团伙欺诈关联标记
    执行内容：缺失值填充、单位归一化、衍生指标计算
    衍生指标清单（全部写出）
    ```
    util_ratio = 信用卡已使用额度 / 信用卡总授信额度
    dir_ratio  = 定向用途贷款余额 / 全部信贷总余额
    dti_ratio  = 每月信贷月供合计 / 月均税后收入
    mobile_age = 当前月份 - 手机号入网月份（单位：月）
    query_6m   = 近6个月硬查询次数（直接透传原始值）
    ```
    输出：标准化特征数据集

3. 节点ID：`node_block_filter`｜节点名称：Block前置强拦截引擎
    规则列表（仅1条生效）
    Block-001：是否失信被执行人 = 是 → 流水线终止，拒绝授信
    输出：放行 / 拦截终止

4. 节点ID：`node_lr_score`｜节点名称：逻辑回归智信分模型
    算法：逻辑回归信用评分卡
    基础参数：BaseScore=600，Odds₀=1:19，PDO=50
    输入：标准化信贷特征
    输出：base_score（初始智信分）

5. 节点ID：`node_rule_deduct`｜节点名称：主线Rule扣分规则引擎
    生效规则共4条，连续编号，全部参与运算（逐条判断、扣分累加）
    Rule-001：dir_ratio > 70%  → 扣50分
    Rule-002：dti_ratio > 80%  → 扣50分
    Rule-003：query_6m > 15   → 扣50分
    Rule-004：util_ratio > 70% → 扣50分
    输出：total_deduct（总扣分值）、final_score = base_score - total_deduct

6. 节点ID：`node_main_warn`｜节点名称：主线衍生预警判定
    判定逻辑：命中主线Rule规则数量 ≥3 → 输出【主线衍生-二级高风险预警】，否则无预警
    输出：main_alert_tag

7. 节点ID：`node_alert_parallel`｜节点名称：支线Alert独立预警引擎【并行节点】
    > 和node_lr_score同时执行，不依赖主线结果，**不修改智信分数**
    生效规则共2条：
    Alert-L1-001：团伙欺诈关联标记=1 → 一级紧急预警
    Alert-L3-001：mobile_age < 6 → 三级关注预警
    > 预警等级框架存在L2、L4，但当前版本无生效规则，不写入配置，避免混淆；后续新增再添加。
    输出：parallel_alert_list（多条预警可并存）

## 最终汇聚输出字段（整条流水线对外结果）
- final_score：最终智信分
- main_alert_tag：主线衍生预警
- parallel_alert_list：支线并行预警数组
- pipeline_result：审批结论（自动通行/人工复核/直接拒绝）

# 二、模型管理系统可直接导入 JSON 配置
```json
{
  "pipeline_meta": {
    "pipeline_id": "credit_zxscore_v1_0",
    "pipeline_name": "智信分授信风控流水线V1.0",
    "version": "1.0",
    "description": "完整授信风控链路；包含图谱计算、特征工程、逻辑回归评分卡、主线扣分规则、并行支线预警；无隐藏节点、无隐性逻辑，所有运算规则完整枚举",
    "create_expert": "风控建模首席专家",
    "execute_sequence": [
      "node_graph_calc",
      "node_feature_eng",
      "node_block_filter",
      "node_lr_score",
      "node_rule_deduct",
      "node_main_warn"
    ],
    "parallel_node_list": [
      {
        "node_id": "node_alert_parallel",
        "depend_node": "node_feature_eng",
        "remark": "与node_lr_score并行调度，不阻塞主线，预警不参与分数计算"
      }
    ]
  },
  "data_source_def": {
    "source_original_fields": [
      "customer_name",
      "id_card",
      "mobile",
      "mobile_register_date",
      "overdue_24m_cnt",
      "credit_total_limit",
      "credit_used_amount",
      "target_loan_balance",
      "total_credit_balance",
      "month_income_after_tax",
      "month_total_payment",
      "query_hard_6m",
      "is_dishonest"
    ],
    "remark": "以上为进件&征信原始采集字段；团伙欺诈标记由图谱节点实时计算产出，不在原始数据源内"
  },
  "node_list": [
    {
      "node_id": "node_graph_calc",
      "node_name": "关联图谱计算节点",
      "algorithm_type": "graph_mining",
      "input_fields": ["id_card", "mobile"],
      "output_fields": ["group_fraud_tag"],
      "params": {
        "algorithm": "连通子图社群发现",
        "tag_value_map": {
          "0": "否",
          "1": "是"
        }
      }
    },
    {
      "node_id": "node_feature_eng",
      "node_name": "特征工程节点",
      "algorithm_type": "feature_transform",
      "input_fields": [
        "customer_name",
        "id_card",
        "mobile",
        "mobile_register_date",
        "overdue_24m_cnt",
        "credit_total_limit",
        "credit_used_amount",
        "target_loan_balance",
        "total_credit_balance",
        "month_income_after_tax",
        "month_total_payment",
        "query_hard_6m",
        "is_dishonest",
        "group_fraud_tag"
      ],
      "output_fields": [
        "util_ratio",
        "dir_ratio",
        "dti_ratio",
        "mobile_age",
        "query_6m",
        "overdue_24m_cnt",
        "is_dishonest",
        "group_fraud_tag"
      ],
      "derive_formula": {
        "util_ratio": "credit_used_amount / credit_total_limit",
        "dir_ratio": "target_loan_balance / total_credit_balance",
        "dti_ratio": "month_total_payment / month_income_after_tax",
        "mobile_age": "当前年月 - mobile_register_date，单位：月",
        "query_6m": "query_hard_6m"
      },
      "fill_strategy": "数值特征中位数填充，分类特征默认值填充"
    },
    {
      "node_id": "node_block_filter",
      "node_name": "Block前置强拦截引擎",
      "algorithm_type": "rule_filter",
      "input_fields": ["is_dishonest"],
      "output_fields": ["block_result"],
      "rule_list": [
        {
          "rule_id": "Block-001",
          "condition": "is_dishonest == 是",
          "action": "terminate",
          "action_desc": "流水线终止，直接拒绝授信"
        }
      ]
    },
    {
      "node_id": "node_lr_score",
      "node_name": "逻辑回归智信分模型",
      "algorithm_type": "logistic_regression_scorecard",
      "input_fields": [
        "util_ratio",
        "dir_ratio",
        "dti_ratio",
        "mobile_age",
        "query_6m",
        "overdue_24m_cnt"
      ],
      "output_fields": ["base_score"],
      "model_params": {
        "base_score": 600,
        "odds_zero": "1:19",
        "pdo": 50
      }
    },
    {
      "node_id": "node_rule_deduct",
      "node_name": "主线Rule扣分规则引擎",
      "algorithm_type": "rule_calculate",
      "input_fields": ["base_score", "util_ratio", "dir_ratio", "dti_ratio", "query_6m"],
      "output_fields": ["total_deduct", "final_score", "hit_rule_cnt"],
      "rule_list": [
        {
          "rule_id": "Rule-001",
          "condition": "dir_ratio > 0.70",
          "deduct_score": 50
        },
        {
          "rule_id": "Rule-002",
          "condition": "dti_ratio > 0.80",
          "deduct_score": 50
        },
        {
          "rule_id": "Rule-003",
          "condition": "query_6m > 15",
          "deduct_score": 50
        },
        {
          "rule_id": "Rule-004",
          "condition": "util_ratio > 0.70",
          "deduct_score": 50
        }
      ],
      "compute_logic": "所有规则独立判定，扣分值累加；final_score = base_score - total_deduct"
    },
    {
      "node_id": "node_main_warn",
      "node_name": "主线衍生预警判定",
      "algorithm_type": "condition_judge",
      "input_fields": ["hit_rule_cnt"],
      "output_fields": ["main_alert_tag"],
      "judge_logic": "hit_rule_cnt >= 3 → main_alert_tag='主线衍生-二级高风险预警';否则main_alert_tag=''"
    },
    {
      "node_id": "node_alert_parallel",
      "node_name": "支线Alert独立预警引擎【并行节点】",
      "algorithm_type": "parallel_alert_rule",
      "input_fields": ["group_fraud_tag", "mobile_age"],
      "output_fields": ["parallel_alert_list"],
      "remark": "并行执行，不参与分数运算，不阻塞主线",
      "rule_list": [
        {
          "rule_id": "Alert-L1-001",
          "level": "L1",
          "level_name": "一级紧急预警",
          "condition": "group_fraud_tag == 1"
        },
        {
          "rule_id": "Alert-L3-001",
          "level": "L3",
          "level_name": "三级关注预警",
          "condition": "mobile_age < 6"
        }
      ]
    }
  ],
  "final_output_mapping": {
    "final_score": "node_rule_deduct.final_score",
    "main_alert_tag": "node_main_warn.main_alert_tag",
    "parallel_alert_list": "node_alert_parallel.parallel_alert_list",
    "block_result": "node_block_filter.block_result"
  },
  "risk_remark": "1. 预警等级L2、L4框架预留，当前版本无生效规则，未写入配置；2. 所有规则逐条枚举，不存在后台隐性运算逻辑；3. 团伙欺诈标签依赖独立图谱节点计算，不属于原始进件字段；4. 支线预警仅风险提示，不对智信分产生任何修改"
}
```

# 三、系统配置落地建议（专家提示）
1. 在模型管理系统画布上：
   - 按 `execute_sequence` 拖拽主线节点顺序连线；
   - 将 `node_alert_parallel` 设置并行任务，上游绑定特征工程输出；
2. 字段绑定严格按照JSON内 `input_fields/output_fields` 配置，不要手动新增未定义特征；
3. 测试校验手段：使用前面张三、李四、王五、赵六、孙七5条样本逐条灌入流水线，核对每一个节点输出，用来验收系统配置是否和设计完全一致；
4. 后续迭代规范：新增规则必须在JSON内显式添加，不允许数据库后台偷偷追加规则。

如果你需要，我下一步可以输出【5条测试样本标准输入JSON + 预期各节点输出结果】，作为你的回归测试用例，上线之后直接自动化校验整条流水线。