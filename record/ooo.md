# 前置自检说明（严格对照你定下的全部标准逐项自查）
✅ 无隐藏节点、无隐性规则、无预留空编号混淆视线，所有参与运算逻辑全部显性列出
✅ 严格分层数据源：原始进件字段 / 外部服务衍生标签，边界清晰
✅ 清晰区分串行主线、并行监控支线；明确哪些影响分数、哪些仅做监控告警
✅ 规则连续编号，不存在断号歧义；计算公式、判定条件完整
✅ 每个节点：ID、名称、算法、输入/输出、参数齐全，支持单节点调试审计
✅ 概念不混淆：模型基础欺诈分、主线规则修正、并行监控预警相互隔离
✅ JSON结构适配模型管理系统，可以直接导入编排画布
✅ 业务定义完全匹配【智察分】需求：贷前申请欺诈评分，分值区间0~100，分数越高欺诈风险越大；面向银行、保险、消金、互金，排除小额短期现金贷；支持欺诈预测 + 自动化高频监控

> 智察分核心定义重申：
> 分值区间：0～100分；分数越高，申请欺诈风险越高
> 定位：贷前审核欺诈风险评估；适用机构：银行、保险、消费金融、互联网金融；客群排除：小额短期现金贷客群

# 智察分风控流水线 JSON配置文档
流水线名称：智察分贷前欺诈评估流水线V1.0
```json
{
  "pipeline_meta": {
    "pipeline_id": "fraud_zhicha_score_v1_0",
    "pipeline_name": "智察分贷前欺诈评估流水线V1.0",
    "version": "1.0",
    "business_position": "贷前申请欺诈风险评估产品【智察分】，适用银行、保险、消费金融、互联网金融；不适用于小额短期现金贷客群；分值0~100，分值越高申请欺诈风险越高",
    "core_capability": [
      "1. 个人申请欺诈风险概率预测，输出智察分",
      "2. 自动化实时计算，支撑高频线上监控、异常识别、模型迭代调优"
    ],
    "description": "全链路透明可审计；无隐藏节点、无隐性判断分支；所有运算规则完整枚举；严格区分原始采集数据与外部系统衍生特征；主线负责欺诈打分与风险修正；并行支线负责独立监控告警，监控逻辑不干预分数结果",
    "execute_sequence": [
      "node_identity_query",
      "node_feature_engineering",
      "node_fraud_base_model",
      "node_fraud_rule_adjust",
      "node_risk_summary_tag"
    ],
    "parallel_node_list": [
      {
        "node_id": "node_auto_monitor_alert",
        "depend_node": "node_feature_engineering",
        "remark": "自动化监控支线，与欺诈基础模型并行执行；仅输出监控告警标签，不参与智察分计算、不阻塞主线流程"
      }
    ]
  },
  "data_source_def": {
    "source_original_fields": [
      "customer_name",
      "id_card",
      "mobile",
      "mobile_register_date",
      "apply_province",
      "apply_city",
      "contact_person_mobile",
      "apply_device_id",
      "apply_ip_address",
      "apply_time",
      "occupation_type",
      "apply_loan_amount"
    ],
    "external_calc_fields_remark": "如下标签不由前端进件采集，由独立外部服务实时运算产出：device_multi_apply_tag、ip_risk_tag、black_contact_tag；在node_identity_query节点完成调用"
  },
  "node_list": [
    {
      "node_id": "node_identity_query",
      "node_name": "外部风险标签查询节点",
      "algorithm_type": "external_api_call",
      "input_fields": ["id_card", "mobile", "apply_device_id", "apply_ip_address"],
      "output_fields": ["device_multi_apply_tag", "ip_risk_tag", "black_contact_tag"],
      "params": {
        "tag_value_map": {
          "0": "无风险",
          "1": "存在风险"
        },
        "call_timeout_ms": 800
      }
    },
    {
      "node_id": "node_feature_engineering",
      "node_name": "特征工程节点",
      "algorithm_type": "feature_transform",
      "input_fields": [
        "customer_name",
        "id_card",
        "mobile",
        "mobile_register_date",
        "apply_province",
        "apply_city",
        "contact_person_mobile",
        "apply_device_id",
        "apply_ip_address",
        "apply_time",
        "occupation_type",
        "apply_loan_amount",
        "device_multi_apply_tag",
        "ip_risk_tag",
        "black_contact_tag"
      ],
      "output_fields": [
        "mobile_register_months",
        "device_multi_apply_tag",
        "ip_risk_tag",
        "black_contact_tag",
        "is_cross_city_apply"
      ],
      "derive_formula": {
        "mobile_register_months": "当前年月 - mobile_register_date，单位：月",
        "is_cross_city_apply": "申请城市 != 身份证户籍归属城市 标记1，否则0"
      },
      "fill_strategy": "分类特征填充默认无风险标签；数值特征中位数填充，空值不允许直接流入模型"
    },
    {
      "node_id": "node_fraud_base_model",
      "node_name": "欺诈基础预测模型（智察分基础分）",
      "algorithm_type": "classification_fraud_score",
      "input_fields": [
        "mobile_register_months",
        "device_multi_apply_tag",
        "ip_risk_tag",
        "black_contact_tag",
        "is_cross_city_apply"
      ],
      "output_fields": ["base_zhicha_score"],
      "model_params": {
        "score_range_min": 0,
        "score_range_max": 100,
        "score_explain": "base_zhicha_score：模型原始欺诈预测分，0最低风险，100最高欺诈风险"
      }
    },
    {
      "node_id": "node_fraud_rule_adjust",
      "node_name": "主线欺诈风险规则修正引擎",
      "algorithm_type": "score_adjust_rule",
      "input_fields": [
        "base_zhicha_score",
        "device_multi_apply_tag",
        "ip_risk_tag",
        "black_contact_tag",
        "mobile_register_months"
      ],
      "output_fields": ["adjust_total", "final_zhicha_score", "hit_rule_count"],
      "compute_logic": "所有规则独立判定，满足条件执行分值上调；final_zhicha_score = min(base_zhicha_score + adjust_total,100)，分数上限100，不得溢出",
      "rule_list": [
        {
          "rule_id": "Rule-001",
          "condition": "device_multi_apply_tag == 1",
          "score_adjust": 12,
          "desc": "同一设备短期内多次申请，上调欺诈分数12分"
        },
        {
          "rule_id": "Rule-002",
          "condition": "ip_risk_tag == 1",
          "score_adjust": 10,
          "desc": "申请IP存在风险画像，上调欺诈分数10分"
        },
        {
          "rule_id": "Rule-003",
          "condition": "black_contact_tag == 1",
          "score_adjust": 15,
          "desc": "紧急联系人命中风险名单，上调欺诈分数15分"
        },
        {
          "rule_id": "Rule-004",
          "condition": "mobile_register_months < 3",
          "score_adjust": 8,
          "desc": "手机号入网不足3个月，上调欺诈分数8分"
        }
      ]
    },
    {
      "node_id": "node_risk_summary_tag",
      "node_name": "主线风险标签汇总节点",
      "algorithm_type": "condition_judge",
      "input_fields": ["hit_rule_count", "final_zhicha_score"],
      "output_fields": ["main_risk_tag"],
      "judge_logic": "hit_rule_count >=3 → main_risk_tag='主线高欺诈风险标签';其余情况main_risk_tag=''"
    },
    {
      "node_id": "node_auto_monitor_alert",
      "node_name": "自动化监控支线引擎【并行节点】",
      "algorithm_type": "monitor_alert_rule",
      "input_fields": [
        "is_cross_city_apply",
        "mobile_register_months",
        "apply_loan_amount"
      ],
      "output_fields": ["monitor_alert_list"],
      "remark": "独立监控链路，仅用于异常监控、模型调优分析；不修改智察分，不阻塞主线审批流程",
      "rule_list": [
        {
          "rule_id": "Monitor-001",
          "level": "M1重点监控",
          "condition": "is_cross_city_apply == 1 && mobile_register_months < 6",
          "desc": "异地申请+新手机号，纳入重点监控"
        },
        {
          "rule_id": "Monitor-002",
          "level": "M2常规监控",
          "condition": "apply_loan_amount > 20000 && mobile_register_months < 4",
          "desc": "大额申请配合新手机号，纳入常规监控"
        }
      ]
    }
  ],
  "final_output_mapping": {
    "final_zhicha_score": "node_fraud_rule_adjust.final_zhicha_score",
    "base_zhicha_score": "node_fraud_base_model.base_zhicha_score",
    "main_risk_tag": "node_risk_summary_tag.main_risk_tag",
    "monitor_alert_list": "node_auto_monitor_alert.monitor_alert_list"
  },
  "system_audit_remark": {
    "1": "全部节点、全部生效规则完整枚举；无后台隐性判断逻辑；不存在预留空编号规则混入正式配置",
    "2": "外部风险标签（设备多端申请标记、IP风险标记、黑名单联系人标记）由独立接口节点获取，不属于进件原始采集字段，数据流边界清晰",
    "3": "主线规则负责分数修正；并行监控支线仅产生告警，严格隔离，不干预智察分结果",
    "4": "分数上限约束100分，保证满足智察分0~100分值区间规范",
    "5": "客群约束：本流水线禁止接入小额短期现金贷客群，上层业务网关做客群路由拦截"
  }
}
```

## 配套落地校验提示（方便你后续上线验收）
1. 导入模型管理系统后，画布连线严格按照 `execute_sequence` 主线顺序搭建；`node_auto_monitor_alert` 绑定特征工程输出作为上游并行任务；
2. 可以构造多条测试样本，逐节点打印中间值：base_zhicha_score → adjust_total → final_zhicha_score，验证分值累加逻辑、上限封顶逻辑；
3. 分别构造命中多条主线规则、触发监控告警的样本，验证：监控告警产生时，主线分数不受任何影响；
4. 所有规则编号连续；不存在只定义等级但是隐藏规则的情况；未来新增策略直接追加规则对象，不采用预留空ID方案。

如果你需要，我可以紧接着输出**标准化测试样本JSON（输入+预期各个节点输出值）**，作为这套智察分流水线的回归测试用例。