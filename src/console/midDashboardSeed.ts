// 自动生成：50 个零售信贷金融风控 SaaS 页面配置（看板）
// 由 record/temp/_gen_dash50.js 生成，引用 midDataSources.json + midMetrics.json
import type { MidDashboardPage } from './midData';

export const SEED_DASHBOARDS: MidDashboardPage[] = [
  {
    "id": "db-001",
    "key": "cr:mid-p1",
    "name": "客群画像总览",
    "group": "客群",
    "order": 0,
    "enabled": true,
    "desc": "客群画像总览实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "客群画像总览·risk_level分布",
        "datasetId": "ds_customer",
        "metricId": "m_cust_cnt",
        "dimensions": [
          "risk_level"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "本月新增客户数",
        "datasetId": "ds_customer",
        "metricId": "m_new_cust",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "客群画像总览明细",
        "datasetId": "ds_customer",
        "metricId": "m_cust_cnt",
        "dimensions": [
          "cust_id",
          "cust_name",
          "product",
          "risk_level",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-002",
    "key": "cr:mid-p2",
    "name": "新客获取分析",
    "group": "客群",
    "order": 1,
    "enabled": true,
    "desc": "新客获取分析实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "新客获取分析·risk_level分布",
        "datasetId": "ds_customer",
        "metricId": "m_cust_cnt",
        "dimensions": [
          "risk_level"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "本月新增客户数",
        "datasetId": "ds_customer",
        "metricId": "m_new_cust",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "新客获取分析明细",
        "datasetId": "ds_customer",
        "metricId": "m_cust_cnt",
        "dimensions": [
          "cust_id",
          "cust_name",
          "product",
          "risk_level",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-003",
    "key": "cr:mid-p3",
    "name": "活跃客群监控",
    "group": "客群",
    "order": 2,
    "enabled": true,
    "desc": "活跃客群监控实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "活跃客群监控·risk_level分布",
        "datasetId": "ds_customer",
        "metricId": "m_cust_cnt",
        "dimensions": [
          "risk_level"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "本月新增客户数",
        "datasetId": "ds_customer",
        "metricId": "m_new_cust",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "活跃客群监控明细",
        "datasetId": "ds_customer",
        "metricId": "m_cust_cnt",
        "dimensions": [
          "cust_id",
          "cust_name",
          "product",
          "risk_level",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-004",
    "key": "cr:mid-p4",
    "name": "客群分层看板",
    "group": "客群",
    "order": 3,
    "enabled": true,
    "desc": "客群分层看板实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "客群分层看板·risk_level分布",
        "datasetId": "ds_customer",
        "metricId": "m_cust_cnt",
        "dimensions": [
          "risk_level"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "本月新增客户数",
        "datasetId": "ds_customer",
        "metricId": "m_new_cust",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "客群分层看板明细",
        "datasetId": "ds_customer",
        "metricId": "m_cust_cnt",
        "dimensions": [
          "cust_id",
          "cust_name",
          "product",
          "risk_level",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-005",
    "key": "cr:mid-p5",
    "name": "高价值客群洞察",
    "group": "客群",
    "order": 4,
    "enabled": true,
    "desc": "高价值客群洞察实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "高价值客群洞察·risk_level分布",
        "datasetId": "ds_customer",
        "metricId": "m_cust_cnt",
        "dimensions": [
          "risk_level"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "本月新增客户数",
        "datasetId": "ds_customer",
        "metricId": "m_new_cust",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "高价值客群洞察明细",
        "datasetId": "ds_customer",
        "metricId": "m_cust_cnt",
        "dimensions": [
          "cust_id",
          "cust_name",
          "product",
          "risk_level",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-006",
    "key": "cr:mid-p6",
    "name": "风险总览驾驶舱",
    "group": "风险",
    "order": 5,
    "enabled": true,
    "desc": "风险总览驾驶舱实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "风险总览驾驶舱·scene分布",
        "datasetId": "ds_alert",
        "metricId": "m_loan_balance",
        "dimensions": [
          "scene"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "alert_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "逾期金额",
        "datasetId": "ds_alert",
        "metricId": "m_overdue_amt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "风险总览驾驶舱明细",
        "datasetId": "ds_alert",
        "metricId": "m_loan_balance",
        "dimensions": [
          "alert_id",
          "cust_id",
          "cust_name",
          "scene",
          "level"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-007",
    "key": "cr:mid-p7",
    "name": "信用风险评估",
    "group": "风险",
    "order": 6,
    "enabled": true,
    "desc": "信用风险评估实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "信用风险评估·product分布",
        "datasetId": "ds_loan",
        "metricId": "m_loan_balance",
        "dimensions": [
          "product"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "逾期金额",
        "datasetId": "ds_loan",
        "metricId": "m_overdue_amt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "信用风险评估明细",
        "datasetId": "ds_loan",
        "metricId": "m_loan_balance",
        "dimensions": [
          "cust_id",
          "product",
          "loan_balance",
          "overdue_amt",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-008",
    "key": "cr:mid-p8",
    "name": "风险等级分布",
    "group": "风险",
    "order": 7,
    "enabled": true,
    "desc": "风险等级分布实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "风险等级分布·scene分布",
        "datasetId": "ds_alert",
        "metricId": "m_loan_balance",
        "dimensions": [
          "scene"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "alert_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "逾期金额",
        "datasetId": "ds_alert",
        "metricId": "m_overdue_amt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "风险等级分布明细",
        "datasetId": "ds_alert",
        "metricId": "m_loan_balance",
        "dimensions": [
          "alert_id",
          "cust_id",
          "cust_name",
          "scene",
          "level"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-009",
    "key": "cr:mid-p9",
    "name": "风险趋势监控",
    "group": "风险",
    "order": 8,
    "enabled": true,
    "desc": "风险趋势监控实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "风险趋势监控·month分布",
        "datasetId": "ds_behavior",
        "metricId": "m_loan_balance",
        "dimensions": [
          "month"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "逾期金额",
        "datasetId": "ds_behavior",
        "metricId": "m_overdue_amt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "风险趋势监控明细",
        "datasetId": "ds_behavior",
        "metricId": "m_loan_balance",
        "dimensions": [
          "cust_id",
          "month",
          "score",
          "new_loans",
          "overdue_amt"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      },
      {
        "id": "w4",
        "type": "line",
        "title": "月度趋势",
        "datasetId": "ds_behavior",
        "metricId": "m_loan_balance",
        "dimensions": [
          "month"
        ],
        "span": 2
      }
    ]
  },
  {
    "id": "db-010",
    "key": "cr:mid-p10",
    "name": "风险敞口看板",
    "group": "风险",
    "order": 9,
    "enabled": true,
    "desc": "风险敞口看板实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "风险敞口看板·product分布",
        "datasetId": "ds_loan",
        "metricId": "m_loan_balance",
        "dimensions": [
          "product"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "逾期金额",
        "datasetId": "ds_loan",
        "metricId": "m_overdue_amt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "风险敞口看板明细",
        "datasetId": "ds_loan",
        "metricId": "m_loan_balance",
        "dimensions": [
          "cust_id",
          "product",
          "loan_balance",
          "overdue_amt",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-011",
    "key": "cr:mid-p11",
    "name": "贷后风险预警",
    "group": "风险",
    "order": 10,
    "enabled": true,
    "desc": "贷后风险预警实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "贷后风险预警·scene分布",
        "datasetId": "ds_alert",
        "metricId": "m_loan_balance",
        "dimensions": [
          "scene"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "alert_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "逾期金额",
        "datasetId": "ds_alert",
        "metricId": "m_overdue_amt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "贷后风险预警明细",
        "datasetId": "ds_alert",
        "metricId": "m_loan_balance",
        "dimensions": [
          "alert_id",
          "cust_id",
          "cust_name",
          "scene",
          "level"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-012",
    "key": "cr:mid-p12",
    "name": "红黄灯预警",
    "group": "预警",
    "order": 11,
    "enabled": true,
    "desc": "红黄灯预警实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "红黄灯预警·scene分布",
        "datasetId": "ds_alert",
        "metricId": "m_alert_cnt",
        "dimensions": [
          "scene"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "alert_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "红灯预警数",
        "datasetId": "ds_alert",
        "metricId": "m_red_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "红黄灯预警明细",
        "datasetId": "ds_alert",
        "metricId": "m_alert_cnt",
        "dimensions": [
          "alert_id",
          "cust_id",
          "cust_name",
          "scene",
          "level"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-013",
    "key": "cr:mid-p13",
    "name": "预警等级分布",
    "group": "预警",
    "order": 12,
    "enabled": true,
    "desc": "预警等级分布实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "预警等级分布·scene分布",
        "datasetId": "ds_alert",
        "metricId": "m_alert_cnt",
        "dimensions": [
          "scene"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "alert_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "红灯预警数",
        "datasetId": "ds_alert",
        "metricId": "m_red_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "预警等级分布明细",
        "datasetId": "ds_alert",
        "metricId": "m_alert_cnt",
        "dimensions": [
          "alert_id",
          "cust_id",
          "cust_name",
          "scene",
          "level"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-014",
    "key": "cr:mid-p14",
    "name": "预警处置时效",
    "group": "预警",
    "order": 13,
    "enabled": true,
    "desc": "预警处置时效实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "预警处置时效·scene分布",
        "datasetId": "ds_alert",
        "metricId": "m_alert_cnt",
        "dimensions": [
          "scene"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "alert_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "红灯预警数",
        "datasetId": "ds_alert",
        "metricId": "m_red_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "预警处置时效明细",
        "datasetId": "ds_alert",
        "metricId": "m_alert_cnt",
        "dimensions": [
          "alert_id",
          "cust_id",
          "cust_name",
          "scene",
          "level"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-015",
    "key": "cr:mid-p15",
    "name": "预警来源分析",
    "group": "预警",
    "order": 14,
    "enabled": true,
    "desc": "预警来源分析实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "预警来源分析·scene分布",
        "datasetId": "ds_alert",
        "metricId": "m_alert_cnt",
        "dimensions": [
          "scene"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "alert_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "红灯预警数",
        "datasetId": "ds_alert",
        "metricId": "m_red_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "预警来源分析明细",
        "datasetId": "ds_alert",
        "metricId": "m_alert_cnt",
        "dimensions": [
          "alert_id",
          "cust_id",
          "cust_name",
          "scene",
          "level"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-016",
    "key": "cr:mid-p16",
    "name": "处置闭环总览",
    "group": "处置",
    "order": 15,
    "enabled": true,
    "desc": "处置闭环总览实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "处置闭环总览·scene分布",
        "datasetId": "ds_alert",
        "metricId": "m_dispose_cnt",
        "dimensions": [
          "scene"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "alert_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "处置率",
        "datasetId": "ds_alert",
        "metricId": "m_dispose_rate",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "处置闭环总览明细",
        "datasetId": "ds_alert",
        "metricId": "m_dispose_cnt",
        "dimensions": [
          "alert_id",
          "cust_id",
          "cust_name",
          "scene",
          "level"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-017",
    "key": "cr:mid-p17",
    "name": "处置策略效果",
    "group": "处置",
    "order": 16,
    "enabled": true,
    "desc": "处置策略效果实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "处置策略效果·scene分布",
        "datasetId": "ds_alert",
        "metricId": "m_dispose_cnt",
        "dimensions": [
          "scene"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "alert_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "处置率",
        "datasetId": "ds_alert",
        "metricId": "m_dispose_rate",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "处置策略效果明细",
        "datasetId": "ds_alert",
        "metricId": "m_dispose_cnt",
        "dimensions": [
          "alert_id",
          "cust_id",
          "cust_name",
          "scene",
          "level"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-018",
    "key": "cr:mid-p18",
    "name": "自动处置监控",
    "group": "处置",
    "order": 17,
    "enabled": true,
    "desc": "自动处置监控实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "自动处置监控·scene分布",
        "datasetId": "ds_alert",
        "metricId": "m_dispose_cnt",
        "dimensions": [
          "scene"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "alert_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "处置率",
        "datasetId": "ds_alert",
        "metricId": "m_dispose_rate",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "自动处置监控明细",
        "datasetId": "ds_alert",
        "metricId": "m_dispose_cnt",
        "dimensions": [
          "alert_id",
          "cust_id",
          "cust_name",
          "scene",
          "level"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-019",
    "key": "cr:mid-p19",
    "name": "处置工单分析",
    "group": "处置",
    "order": 18,
    "enabled": true,
    "desc": "处置工单分析实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "处置工单分析·scene分布",
        "datasetId": "ds_alert",
        "metricId": "m_dispose_cnt",
        "dimensions": [
          "scene"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "alert_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "处置率",
        "datasetId": "ds_alert",
        "metricId": "m_dispose_rate",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "处置工单分析明细",
        "datasetId": "ds_alert",
        "metricId": "m_dispose_cnt",
        "dimensions": [
          "alert_id",
          "cust_id",
          "cust_name",
          "scene",
          "level"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-020",
    "key": "cr:mid-p20",
    "name": "授信审批监控",
    "group": "授信",
    "order": 19,
    "enabled": true,
    "desc": "授信审批监控实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "授信审批监控·product分布",
        "datasetId": "ds_loan",
        "metricId": "m_credit_remain",
        "dimensions": [
          "product"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "额度使用率>90%客户数",
        "datasetId": "ds_loan",
        "metricId": "m_util_high_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "授信审批监控明细",
        "datasetId": "ds_loan",
        "metricId": "m_credit_remain",
        "dimensions": [
          "cust_id",
          "product",
          "loan_balance",
          "overdue_amt",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-021",
    "key": "cr:mid-p21",
    "name": "授信额度使用",
    "group": "授信",
    "order": 20,
    "enabled": true,
    "desc": "授信额度使用实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "授信额度使用·product分布",
        "datasetId": "ds_loan",
        "metricId": "m_credit_remain",
        "dimensions": [
          "product"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "额度使用率>90%客户数",
        "datasetId": "ds_loan",
        "metricId": "m_util_high_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "授信额度使用明细",
        "datasetId": "ds_loan",
        "metricId": "m_credit_remain",
        "dimensions": [
          "cust_id",
          "product",
          "loan_balance",
          "overdue_amt",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-022",
    "key": "cr:mid-p22",
    "name": "授信政策效果",
    "group": "授信",
    "order": 21,
    "enabled": true,
    "desc": "授信政策效果实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "授信政策效果·product分布",
        "datasetId": "ds_loan",
        "metricId": "m_credit_remain",
        "dimensions": [
          "product"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "额度使用率>90%客户数",
        "datasetId": "ds_loan",
        "metricId": "m_util_high_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "授信政策效果明细",
        "datasetId": "ds_loan",
        "metricId": "m_credit_remain",
        "dimensions": [
          "cust_id",
          "product",
          "loan_balance",
          "overdue_amt",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-023",
    "key": "cr:mid-p23",
    "name": "授信通过率分析",
    "group": "授信",
    "order": 22,
    "enabled": true,
    "desc": "授信通过率分析实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "授信通过率分析·product分布",
        "datasetId": "ds_loan",
        "metricId": "m_credit_remain",
        "dimensions": [
          "product"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "额度使用率>90%客户数",
        "datasetId": "ds_loan",
        "metricId": "m_util_high_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "授信通过率分析明细",
        "datasetId": "ds_loan",
        "metricId": "m_credit_remain",
        "dimensions": [
          "cust_id",
          "product",
          "loan_balance",
          "overdue_amt",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-024",
    "key": "cr:mid-p24",
    "name": "授信客群分析",
    "group": "授信",
    "order": 23,
    "enabled": true,
    "desc": "授信客群分析实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "授信客群分析·risk_level分布",
        "datasetId": "ds_customer",
        "metricId": "m_credit_remain",
        "dimensions": [
          "risk_level"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "额度使用率>90%客户数",
        "datasetId": "ds_customer",
        "metricId": "m_util_high_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "授信客群分析明细",
        "datasetId": "ds_customer",
        "metricId": "m_credit_remain",
        "dimensions": [
          "cust_id",
          "cust_name",
          "product",
          "risk_level",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-025",
    "key": "cr:mid-p25",
    "name": "贷款业务总览",
    "group": "贷款",
    "order": 24,
    "enabled": true,
    "desc": "贷款业务总览实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "贷款业务总览·product分布",
        "datasetId": "ds_loan",
        "metricId": "m_loan_cnt",
        "dimensions": [
          "product"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "贷款发放总额",
        "datasetId": "ds_loan",
        "metricId": "m_loan_total",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "贷款业务总览明细",
        "datasetId": "ds_loan",
        "metricId": "m_loan_cnt",
        "dimensions": [
          "cust_id",
          "product",
          "loan_balance",
          "overdue_amt",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-026",
    "key": "cr:mid-p26",
    "name": "贷款余额监控",
    "group": "贷款",
    "order": 25,
    "enabled": true,
    "desc": "贷款余额监控实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "贷款余额监控·product分布",
        "datasetId": "ds_loan",
        "metricId": "m_loan_cnt",
        "dimensions": [
          "product"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "贷款发放总额",
        "datasetId": "ds_loan",
        "metricId": "m_loan_total",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "贷款余额监控明细",
        "datasetId": "ds_loan",
        "metricId": "m_loan_cnt",
        "dimensions": [
          "cust_id",
          "product",
          "loan_balance",
          "overdue_amt",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-027",
    "key": "cr:mid-p27",
    "name": "贷款逾期分析",
    "group": "贷款",
    "order": 26,
    "enabled": true,
    "desc": "贷款逾期分析实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "贷款逾期分析·product分布",
        "datasetId": "ds_loan",
        "metricId": "m_loan_cnt",
        "dimensions": [
          "product"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "贷款发放总额",
        "datasetId": "ds_loan",
        "metricId": "m_loan_total",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "贷款逾期分析明细",
        "datasetId": "ds_loan",
        "metricId": "m_loan_cnt",
        "dimensions": [
          "cust_id",
          "product",
          "loan_balance",
          "overdue_amt",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-028",
    "key": "cr:mid-p28",
    "name": "贷款质量看板",
    "group": "贷款",
    "order": 27,
    "enabled": true,
    "desc": "贷款质量看板实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "贷款质量看板·product分布",
        "datasetId": "ds_loan",
        "metricId": "m_loan_cnt",
        "dimensions": [
          "product"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "贷款发放总额",
        "datasetId": "ds_loan",
        "metricId": "m_loan_total",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "贷款质量看板明细",
        "datasetId": "ds_loan",
        "metricId": "m_loan_cnt",
        "dimensions": [
          "cust_id",
          "product",
          "loan_balance",
          "overdue_amt",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-029",
    "key": "cr:mid-p29",
    "name": "还款行为分析",
    "group": "贷款",
    "order": 28,
    "enabled": true,
    "desc": "还款行为分析实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "还款行为分析·month分布",
        "datasetId": "ds_behavior",
        "metricId": "m_loan_cnt",
        "dimensions": [
          "month"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "贷款发放总额",
        "datasetId": "ds_behavior",
        "metricId": "m_loan_total",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "还款行为分析明细",
        "datasetId": "ds_behavior",
        "metricId": "m_loan_cnt",
        "dimensions": [
          "cust_id",
          "month",
          "score",
          "new_loans",
          "overdue_amt"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      },
      {
        "id": "w4",
        "type": "line",
        "title": "月度趋势",
        "datasetId": "ds_behavior",
        "metricId": "m_loan_cnt",
        "dimensions": [
          "month"
        ],
        "span": 2
      }
    ]
  },
  {
    "id": "db-030",
    "key": "cr:mid-p30",
    "name": "贷款发放趋势",
    "group": "贷款",
    "order": 29,
    "enabled": true,
    "desc": "贷款发放趋势实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "贷款发放趋势·product分布",
        "datasetId": "ds_loan",
        "metricId": "m_loan_cnt",
        "dimensions": [
          "product"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "贷款发放总额",
        "datasetId": "ds_loan",
        "metricId": "m_loan_total",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "贷款发放趋势明细",
        "datasetId": "ds_loan",
        "metricId": "m_loan_cnt",
        "dimensions": [
          "cust_id",
          "product",
          "loan_balance",
          "overdue_amt",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-031",
    "key": "cr:mid-p31",
    "name": "客户行为分析",
    "group": "行为",
    "order": 30,
    "enabled": true,
    "desc": "客户行为分析实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "客户行为分析·month分布",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_amt",
        "dimensions": [
          "month"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "交易笔数",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "客户行为分析明细",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_amt",
        "dimensions": [
          "cust_id",
          "month",
          "score",
          "new_loans",
          "overdue_amt"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      },
      {
        "id": "w4",
        "type": "line",
        "title": "月度趋势",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_amt",
        "dimensions": [
          "month"
        ],
        "span": 2
      }
    ]
  },
  {
    "id": "db-032",
    "key": "cr:mid-p32",
    "name": "行为评分监控",
    "group": "行为",
    "order": 31,
    "enabled": true,
    "desc": "行为评分监控实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "行为评分监控·month分布",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_amt",
        "dimensions": [
          "month"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "交易笔数",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "行为评分监控明细",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_amt",
        "dimensions": [
          "cust_id",
          "month",
          "score",
          "new_loans",
          "overdue_amt"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      },
      {
        "id": "w4",
        "type": "line",
        "title": "月度趋势",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_amt",
        "dimensions": [
          "month"
        ],
        "span": 2
      }
    ]
  },
  {
    "id": "db-033",
    "key": "cr:mid-p33",
    "name": "行为趋势看板",
    "group": "行为",
    "order": 32,
    "enabled": true,
    "desc": "行为趋势看板实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "行为趋势看板·month分布",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_amt",
        "dimensions": [
          "month"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "交易笔数",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "行为趋势看板明细",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_amt",
        "dimensions": [
          "cust_id",
          "month",
          "score",
          "new_loans",
          "overdue_amt"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      },
      {
        "id": "w4",
        "type": "line",
        "title": "月度趋势",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_amt",
        "dimensions": [
          "month"
        ],
        "span": 2
      }
    ]
  },
  {
    "id": "db-034",
    "key": "cr:mid-p34",
    "name": "用信行为分析",
    "group": "行为",
    "order": 33,
    "enabled": true,
    "desc": "用信行为分析实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "用信行为分析·month分布",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_amt",
        "dimensions": [
          "month"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "交易笔数",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "用信行为分析明细",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_amt",
        "dimensions": [
          "cust_id",
          "month",
          "score",
          "new_loans",
          "overdue_amt"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      },
      {
        "id": "w4",
        "type": "line",
        "title": "月度趋势",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_amt",
        "dimensions": [
          "month"
        ],
        "span": 2
      }
    ]
  },
  {
    "id": "db-035",
    "key": "cr:mid-p35",
    "name": "沉睡客户预警",
    "group": "行为",
    "order": 34,
    "enabled": true,
    "desc": "沉睡客户预警实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "沉睡客户预警·month分布",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_amt",
        "dimensions": [
          "month"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "交易笔数",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "沉睡客户预警明细",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_amt",
        "dimensions": [
          "cust_id",
          "month",
          "score",
          "new_loans",
          "overdue_amt"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      },
      {
        "id": "w4",
        "type": "line",
        "title": "月度趋势",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_amt",
        "dimensions": [
          "month"
        ],
        "span": 2
      }
    ]
  },
  {
    "id": "db-036",
    "key": "cr:mid-p36",
    "name": "欺诈风险总览",
    "group": "欺诈",
    "order": 35,
    "enabled": true,
    "desc": "欺诈风险总览实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "metric",
        "title": "欺诈命中客户数",
        "datasetId": "ds_api_demo",
        "metricId": "m_fraud_hit_cust",
        "span": 1
      },
      {
        "id": "w2",
        "type": "table",
        "title": "欺诈风险总览明细",
        "datasetId": "ds_api_demo",
        "metricId": "m_fraud_hit",
        "dimensions": [
          "id_no",
          "score",
          "query_cnt"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      },
      {
        "id": "w3",
        "type": "metric",
        "title": "欺诈命中次数",
        "datasetId": "ds_api_demo",
        "metricId": "m_fraud_hit",
        "span": 1
      }
    ]
  },
  {
    "id": "db-037",
    "key": "cr:mid-p37",
    "name": "欺诈识别监控",
    "group": "欺诈",
    "order": 36,
    "enabled": true,
    "desc": "欺诈识别监控实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "metric",
        "title": "欺诈命中客户数",
        "datasetId": "ds_api_demo",
        "metricId": "m_fraud_hit_cust",
        "span": 1
      },
      {
        "id": "w2",
        "type": "table",
        "title": "欺诈识别监控明细",
        "datasetId": "ds_api_demo",
        "metricId": "m_fraud_hit",
        "dimensions": [
          "id_no",
          "score",
          "query_cnt"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      },
      {
        "id": "w3",
        "type": "metric",
        "title": "欺诈命中次数",
        "datasetId": "ds_api_demo",
        "metricId": "m_fraud_hit",
        "span": 1
      }
    ]
  },
  {
    "id": "db-038",
    "key": "cr:mid-p38",
    "name": "欺诈案件分析",
    "group": "欺诈",
    "order": 37,
    "enabled": true,
    "desc": "欺诈案件分析实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "metric",
        "title": "欺诈命中客户数",
        "datasetId": "ds_api_demo",
        "metricId": "m_fraud_hit_cust",
        "span": 1
      },
      {
        "id": "w2",
        "type": "table",
        "title": "欺诈案件分析明细",
        "datasetId": "ds_api_demo",
        "metricId": "m_fraud_hit",
        "dimensions": [
          "id_no",
          "score",
          "query_cnt"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      },
      {
        "id": "w3",
        "type": "metric",
        "title": "欺诈命中次数",
        "datasetId": "ds_api_demo",
        "metricId": "m_fraud_hit",
        "span": 1
      }
    ]
  },
  {
    "id": "db-039",
    "key": "cr:mid-p39",
    "name": "设备指纹风险",
    "group": "欺诈",
    "order": 38,
    "enabled": true,
    "desc": "设备指纹风险实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "metric",
        "title": "欺诈命中客户数",
        "datasetId": "ds_api_demo",
        "metricId": "m_fraud_hit_cust",
        "span": 1
      },
      {
        "id": "w2",
        "type": "table",
        "title": "设备指纹风险明细",
        "datasetId": "ds_api_demo",
        "metricId": "m_fraud_hit",
        "dimensions": [
          "id_no",
          "score",
          "query_cnt"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      },
      {
        "id": "w3",
        "type": "metric",
        "title": "欺诈命中次数",
        "datasetId": "ds_api_demo",
        "metricId": "m_fraud_hit",
        "span": 1
      }
    ]
  },
  {
    "id": "db-040",
    "key": "cr:mid-p40",
    "name": "异常行为预警",
    "group": "欺诈",
    "order": 39,
    "enabled": true,
    "desc": "异常行为预警实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "metric",
        "title": "欺诈命中客户数",
        "datasetId": "ds_api_demo",
        "metricId": "m_fraud_hit_cust",
        "span": 1
      },
      {
        "id": "w2",
        "type": "table",
        "title": "异常行为预警明细",
        "datasetId": "ds_api_demo",
        "metricId": "m_fraud_hit",
        "dimensions": [
          "id_no",
          "score",
          "query_cnt"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      },
      {
        "id": "w3",
        "type": "metric",
        "title": "欺诈命中次数",
        "datasetId": "ds_api_demo",
        "metricId": "m_fraud_hit",
        "span": 1
      }
    ]
  },
  {
    "id": "db-041",
    "key": "cr:mid-p41",
    "name": "营销活动效果",
    "group": "营销",
    "order": 40,
    "enabled": true,
    "desc": "营销活动效果实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "营销活动效果·risk_level分布",
        "datasetId": "ds_customer",
        "metricId": "m_promo_cnt",
        "dimensions": [
          "risk_level"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "提额邀请数",
        "datasetId": "ds_customer",
        "metricId": "m_invite_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "营销活动效果明细",
        "datasetId": "ds_customer",
        "metricId": "m_promo_cnt",
        "dimensions": [
          "cust_id",
          "cust_name",
          "product",
          "risk_level",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-042",
    "key": "cr:mid-p42",
    "name": "营销机会挖掘",
    "group": "营销",
    "order": 41,
    "enabled": true,
    "desc": "营销机会挖掘实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "营销机会挖掘·risk_level分布",
        "datasetId": "ds_customer",
        "metricId": "m_promo_cnt",
        "dimensions": [
          "risk_level"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "提额邀请数",
        "datasetId": "ds_customer",
        "metricId": "m_invite_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "营销机会挖掘明细",
        "datasetId": "ds_customer",
        "metricId": "m_promo_cnt",
        "dimensions": [
          "cust_id",
          "cust_name",
          "product",
          "risk_level",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-043",
    "key": "cr:mid-p43",
    "name": "营销响应分析",
    "group": "营销",
    "order": 42,
    "enabled": true,
    "desc": "营销响应分析实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "营销响应分析·risk_level分布",
        "datasetId": "ds_customer",
        "metricId": "m_promo_cnt",
        "dimensions": [
          "risk_level"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "提额邀请数",
        "datasetId": "ds_customer",
        "metricId": "m_invite_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "营销响应分析明细",
        "datasetId": "ds_customer",
        "metricId": "m_promo_cnt",
        "dimensions": [
          "cust_id",
          "cust_name",
          "product",
          "risk_level",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-044",
    "key": "cr:mid-p44",
    "name": "精准营销看板",
    "group": "营销",
    "order": 43,
    "enabled": true,
    "desc": "精准营销看板实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "精准营销看板·risk_level分布",
        "datasetId": "ds_customer",
        "metricId": "m_promo_cnt",
        "dimensions": [
          "risk_level"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "提额邀请数",
        "datasetId": "ds_customer",
        "metricId": "m_invite_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "精准营销看板明细",
        "datasetId": "ds_customer",
        "metricId": "m_promo_cnt",
        "dimensions": [
          "cust_id",
          "cust_name",
          "product",
          "risk_level",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-045",
    "key": "cr:mid-p45",
    "name": "客户生命周期",
    "group": "营销",
    "order": 44,
    "enabled": true,
    "desc": "客户生命周期实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "客户生命周期·risk_level分布",
        "datasetId": "ds_customer",
        "metricId": "m_promo_cnt",
        "dimensions": [
          "risk_level"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "提额邀请数",
        "datasetId": "ds_customer",
        "metricId": "m_invite_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "客户生命周期明细",
        "datasetId": "ds_customer",
        "metricId": "m_promo_cnt",
        "dimensions": [
          "cust_id",
          "cust_name",
          "product",
          "risk_level",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-046",
    "key": "cr:mid-p46",
    "name": "合规指标监控",
    "group": "合规",
    "order": 45,
    "enabled": true,
    "desc": "合规指标监控实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "metric",
        "title": "拨备覆盖率",
        "datasetId": "ds_sql_demo",
        "metricId": "m_provision",
        "span": 1
      },
      {
        "id": "w2",
        "type": "table",
        "title": "合规指标监控明细",
        "datasetId": "ds_sql_demo",
        "metricId": "m_car_ratio",
        "dimensions": [
          "cust_id",
          "loan_balance",
          "overdue_amt"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      },
      {
        "id": "w3",
        "type": "metric",
        "title": "资本充足率",
        "datasetId": "ds_sql_demo",
        "metricId": "m_car_ratio",
        "span": 1
      }
    ]
  },
  {
    "id": "db-047",
    "key": "cr:mid-p47",
    "name": "监管报送看板",
    "group": "合规",
    "order": 46,
    "enabled": true,
    "desc": "监管报送看板实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "metric",
        "title": "拨备覆盖率",
        "datasetId": "ds_sql_demo",
        "metricId": "m_provision",
        "span": 1
      },
      {
        "id": "w2",
        "type": "table",
        "title": "监管报送看板明细",
        "datasetId": "ds_sql_demo",
        "metricId": "m_car_ratio",
        "dimensions": [
          "cust_id",
          "loan_balance",
          "overdue_amt"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      },
      {
        "id": "w3",
        "type": "metric",
        "title": "资本充足率",
        "datasetId": "ds_sql_demo",
        "metricId": "m_car_ratio",
        "span": 1
      }
    ]
  },
  {
    "id": "db-048",
    "key": "cr:mid-p48",
    "name": "合规风险预警",
    "group": "合规",
    "order": 47,
    "enabled": true,
    "desc": "合规风险预警实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "metric",
        "title": "拨备覆盖率",
        "datasetId": "ds_sql_demo",
        "metricId": "m_provision",
        "span": 1
      },
      {
        "id": "w2",
        "type": "table",
        "title": "合规风险预警明细",
        "datasetId": "ds_sql_demo",
        "metricId": "m_car_ratio",
        "dimensions": [
          "cust_id",
          "loan_balance",
          "overdue_amt"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      },
      {
        "id": "w3",
        "type": "metric",
        "title": "资本充足率",
        "datasetId": "ds_sql_demo",
        "metricId": "m_car_ratio",
        "span": 1
      }
    ]
  },
  {
    "id": "db-049",
    "key": "cr:mid-p49",
    "name": "事件分析总览",
    "group": "事件分析",
    "order": 48,
    "enabled": true,
    "desc": "事件分析总览实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "事件分析总览·country分布",
        "datasetId": "ds_event",
        "metricId": "m_web_stay_7d",
        "dimensions": [
          "country"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "user_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "直播间-点击立即购买的人均次数",
        "datasetId": "ds_event",
        "metricId": "m_live_buy_peruser",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "事件分析总览明细",
        "datasetId": "ds_event",
        "metricId": "m_web_stay_7d",
        "dimensions": [
          "user_id",
          "ip",
          "startup_dur",
          "country",
          "web_stay_7d"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-050",
    "key": "cr:mid-p50",
    "name": "用户启动时长分析",
    "group": "事件分析",
    "order": 49,
    "enabled": true,
    "desc": "用户启动时长分析实时监控看板",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "用户启动时长分析·country分布",
        "datasetId": "ds_event",
        "metricId": "m_web_stay_7d",
        "dimensions": [
          "country"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "user_id",
          "title": "明细"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "直播间-点击立即购买的人均次数",
        "datasetId": "ds_event",
        "metricId": "m_live_buy_peruser",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "用户启动时长分析明细",
        "datasetId": "ds_event",
        "metricId": "m_web_stay_7d",
        "dimensions": [
          "user_id",
          "ip",
          "startup_dur",
          "country",
          "web_stay_7d"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  }
];
