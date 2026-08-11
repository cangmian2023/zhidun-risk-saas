const SEED_CUST = {
  customers: [
    {
      custId: "CUST-100237",
      name: "\u5F20\u660E\u8FDC",
      maskedId: "3301**********1234",
      status: "\u6B63\u5E38",
      tags: ["\u4F18\u8D28\u5BA2\u6237", "\u989D\u5EA6\u5185\u7528\u4FE1"],
      avatarText: "\u5F20",
      gender: "\u7537",
      age: 34,
      channel: "APP \u81EA\u4E3B\u8FDB\u4EF6",
      region: "\u6D59\u6C5F\u7701\u676D\u5DDE\u5E02",
      occupation: "\u8F6F\u4EF6\u5DE5\u7A0B\u5E08",
      employer: "\u676D\u5DDE\u4E91\u7B97\u79D1\u6280\u6709\u9650\u516C\u53F8",
      income: 28e3,
      incomeProof: "\u793E\u4FDD + \u4E2A\u7A0E app \u622A\u5C4F",
      education: "\u672C\u79D1",
      marital: "\u5DF2\u5A5A",
      phone: "138****6621",
      phones: [
        { number: "138****6621", verified: true },
        { number: "139****8800", verified: true }
      ],
      email: "mingyuan.z@cloudcalc.com",
      addresses: [
        { type: "\u6237\u7C4D\u5730\u5740", value: "\u6D59\u6C5F\u7701\u676D\u5DDE\u5E02\u897F\u6E56\u533A\u6587\u4E09\u8DEF 100 \u53F7" },
        { type: "\u5C45\u4F4F\u5730\u5740", value: "\u6D59\u6C5F\u7701\u676D\u5DDE\u5E02\u4F59\u676D\u533A\u672A\u6765\u79D1\u6280\u57CE 8 \u680B 1502" },
        { type: "\u516C\u53F8\u5730\u5740", value: "\u6D59\u6C5F\u7701\u676D\u5DDE\u5E02\u6EE8\u6C5F\u533A\u7F51\u5546\u8DEF 599 \u53F7" }
      ],
      creditLimit: 2e5,
      usedLimit: 86e3,
      availLimit: 114e3,
      annualRate: 11.8,
      totalDebt: 86e3,
      monthlyPay: 2680,
      overdueDays: 0,
      overdueAmt: 0,
      loans: [
        { id: "LN-88231", product: "\u968F\u501F\u968F\u8FD8\xB7\u6D88\u8D39\u8D37", principal: 1e5, balance: 56e3, rate: 11.8, term: 36, monthly: 0, status: "\u6B63\u5E38" },
        { id: "LN-90115", product: "\u73B0\u91D1\u5206\u671F\xB7\u6559\u80B2", principal: 5e4, balance: 3e4, rate: 12.6, term: 24, monthly: 2680, status: "\u6B63\u5E38" }
      ],
      behavior: [
        { name: "\u7528\u4FE1\u7B14\u6570", count: 42, category: "\u7528\u4FE1", desc: "\u7D2F\u8BA1\u501F\u6B3E\u652F\u7528\u6B21\u6570" },
        { name: "\u63D0\u524D\u8FD8\u6B3E", count: 3, category: "\u8FD8\u6B3E", desc: "\u63D0\u524D\u7ED3\u6E05\u7B14\u6570" },
        { name: "\u6B63\u5E38\u8FD8\u6B3E", count: 39, category: "\u8FD8\u6B3E", desc: "\u6309\u671F\u8FD8\u6B3E\u7B14\u6570" },
        { name: "\u903E\u671F\u8FD8\u6B3E", count: 0, danger: true, category: "\u8FD8\u6B3E", desc: "\u53D1\u751F\u903E\u671F\u7684\u7B14\u6570" },
        { name: "\u673A\u6784\u67E5\u8BE2", count: 6, category: "\u67E5\u8BE2", desc: "\u8FD1 90 \u5929\u673A\u6784\u5F81\u4FE1\u67E5\u8BE2\u6B21\u6570" },
        { name: "\u591A\u5934\u501F\u8D37", count: 1, danger: true, category: "\u67E5\u8BE2", desc: "\u540C\u65F6\u5728\u8D37\u673A\u6784\u6570" },
        { name: "\u591C\u95F4\u7528\u4FE1", count: 8, category: "\u7528\u4FE1", desc: "23:00-05:00 \u7528\u4FE1\u7B14\u6570" },
        { name: "\u989D\u5EA6\u4F7F\u7528\u7387", count: 43, category: "\u7528\u4FE1", desc: "\u5DF2\u7528 / \u6388\u4FE1\uFF08%\uFF09" }
      ],
      alerts: [
        { id: "AL-2026-0312", rule: "\u989D\u5EA6\u4F7F\u7528\u7387\u8D85 40% \u6301\u7EED 60 \u5929", level: "\u84DD", date: "2026-07-28", desc: "\u5BA2\u6237\u989D\u5EA6\u4F7F\u7528\u7387\u957F\u671F\u504F\u9AD8\uFF0C\u5173\u6CE8\u518D\u878D\u8D44\u503E\u5411", status: "\u5DF2\u95ED\u73AF" },
        { id: "AL-2026-0288", rule: "\u8FD1 90 \u5929\u673A\u6784\u67E5\u8BE2 \u2265 5", level: "\u9EC4", date: "2026-06-15", desc: "\u67E5\u8BE2\u6B21\u6570\u504F\u591A\uFF0C\u5B58\u5728\u591A\u5934\u7533\u8BF7\u8FF9\u8C61", status: "\u5904\u7F6E\u4E2D" }
      ],
      contacts: [
        { id: "CT-01", name: "\u674E\u82B8", relation: "\u914D\u5076", phone: "139****2048", coDebt: true },
        { id: "CT-02", name: "\u5F20\u5EFA\u56FD", relation: "\u7D27\u6025\u8054\u7CFB\u4EBA", phone: "137****7711" },
        { id: "CT-03", name: "\u5173\u8054\u8D26\u6237\xB7\u5FAE\u4FE1", relation: "\u5173\u8054\u8D26\u6237", phone: "wxid_****m9k2" }
      ],
      scores: {
        zhiCha: {
          name: "\u667A\u5BDF\uFF08\u53CD\u6B3A\u8BC8\uFF09",
          score: 892,
          level: "\u4F18",
          factors: [
            { name: "\u8BBE\u5907\u73AF\u5883", impact: "\u6B63\u9762", detail: "\u5E38\u7528\u8BBE\u5907\u4E00\u81F4\uFF0C\u65E0\u6A21\u62DF\u5668" },
            { name: "\u7533\u8BF7\u884C\u4E3A", impact: "\u6B63\u9762", detail: "\u65E0\u5F02\u5E38\u9AD8\u9891\u7533\u8BF7" },
            { name: "\u9ED1\u7070\u540D\u5355", impact: "\u6B63\u9762", detail: "\u65E0\u547D\u4E2D" }
          ]
        },
        zhiXin: {
          name: "\u667A\u4FE1\uFF08\u4FE1\u7528\uFF09",
          score: 768,
          level: "\u826F",
          factors: [
            { name: "\u5386\u53F2\u8FD8\u6B3E", impact: "\u6B63\u9762", detail: "\u5386\u53F2 39 \u6B21\u6B63\u5E38\u8FD8\u6B3E" },
            { name: "\u8D1F\u503A\u6BD4", impact: "\u4E2D\u6027", detail: "DTI \u5904\u4E8E\u4E2D\u7B49\u6C34\u5E73" },
            { name: "\u67E5\u8BE2\u5BC6\u5EA6", impact: "\u8D1F\u9762", detail: "\u8FD1 90 \u5929\u67E5\u8BE2 6 \u6B21\u504F\u591A" }
          ]
        },
        zhiRong: {
          name: "\u667A\u878D\uFF08\u7EFC\u5408\uFF09",
          score: 815,
          level: "\u826F",
          factors: [
            { name: "\u6536\u5165\u7A33\u5B9A\u6027", impact: "\u6B63\u9762", detail: "\u5728\u804C\u7A33\u5B9A\uFF0C\u793E\u4FDD\u8FDE\u7EED" },
            { name: "\u989D\u5EA6\u4F7F\u7528\u7387", impact: "\u8D1F\u9762", detail: "\u4F7F\u7528\u7387 43% \u957F\u671F\u504F\u9AD8" },
            { name: "\u7EFC\u5408\u7A33\u5B9A\u6027", impact: "\u6B63\u9762", detail: "\u65E0\u903E\u671F\u8BB0\u5F55" }
          ]
        },
        limitSuggest: { suggested: 2e5, current: 2e5, note: "\u7EF4\u6301\u5F53\u524D\u6388\u4FE1\uFF0C\u5173\u6CE8\u989D\u5EA6\u4F7F\u7528\u7387\u8D8B\u52BF" }
      },
      credit: {
        header: { reportNo: "PBOC-2026-0812-0007", queryTime: "2026-08-12 09:30:15", queriedBy: "\u5F20\u4F1F", idNo: "3301**********1234" },
        recentQueries: [
          { org: "\u672C\u884C", date: "2026-07-12", type: "\u8D37\u540E\u7BA1\u7406" },
          { org: "\u62DB\u5546\u94F6\u884C", date: "2026-06-15", type: "\u4FE1\u7528\u5361\u5BA1\u6279" },
          { org: "\u8682\u8681\u6D88\u91D1", date: "2026-05-20", type: "\u8D37\u6B3E\u5BA1\u6279" }
        ],
        selfQueries: [
          { date: "2026-07-01", type: "\u672C\u4EBA\u67E5\u8BE2\uFF08\u81EA\u52A9\u67E5\u8BE2\u673A\uFF09" }
        ],
        accounts: [
          { type: "\u4F4F\u623F\u8D37\u6B3E", bank: "\u5DE5\u5546\u94F6\u884C", openDate: "2019-03-12", dueDate: "2049-03-11", creditLimit: 18e5, balance: 12e5, currency: "\u4EBA\u6C11\u5E01", guarantee: "\u62B5\u62BC", overdueMonths: 0, overdueAmt: 0, status: "\u6B63\u5E38" },
          { type: "\u4FE1\u7528\u5361", bank: "\u62DB\u5546\u94F6\u884C", openDate: "2021-06-01", dueDate: "--", creditLimit: 5e4, balance: 18e3, currency: "\u4EBA\u6C11\u5E01", guarantee: "\u4FE1\u7528", overdueMonths: 0, overdueAmt: 0, status: "\u6B63\u5E38" },
          { type: "\u6D88\u8D39\u8D37", bank: "\u672C\u884C", openDate: "2024-11-08", dueDate: "2027-11-07", creditLimit: 2e5, balance: 86e3, currency: "\u4EBA\u6C11\u5E01", guarantee: "\u4FE1\u7528", overdueMonths: 0, overdueAmt: 0, status: "\u6B63\u5E38" }
        ],
        agreements: [
          { id: "AG-ICBC-001", org: "\u5DE5\u5546\u94F6\u884C", limit: 18e5, currency: "\u4EBA\u6C11\u5E01", shareAccounts: 1, effectiveDate: "2019-03-12", expireDate: "2049-03-11", status: "\u6B63\u5E38" },
          { id: "AG-CMB-002", org: "\u62DB\u5546\u94F6\u884C", limit: 5e4, currency: "\u4EBA\u6C11\u5E01", shareAccounts: 1, effectiveDate: "2021-06-01", expireDate: "\u957F\u671F", status: "\u6B63\u5E38" },
          { id: "AG-BANK-003", org: "\u672C\u884C", limit: 2e5, currency: "\u4EBA\u6C11\u5E01", shareAccounts: 1, effectiveDate: "2024-11-08", expireDate: "2027-11-07", status: "\u6B63\u5E38" }
        ],
        summary: { creditCards: 1, loans: 2, overdueAccounts: 0, overdue90Plus: 0, guaranteeCount: 0, relatedRepay: 0 },
        summaryAmount: { firstBizYear: 2019, openCreditLimit: 203e4, usedBalance: 1298e3, maxMonthlyOverdue: 0, longestOverdueMonths: 0 },
        relatedRepayList: [],
        publicRecords: [],
        overdue: { count: 0, amount: 0 },
        guarantee: [],
        annotations: []
      },
      device: {
        device: "iPhone 15 Pro",
        model: "iPhone15,3",
        os: "iOS 17.4",
        envRiskScore: 8,
        simulator: false,
        sameDeviceAccounts: [],
        loginRegion: "\u6D59\u6C5F\u7701\u676D\u5DDE\u5E02",
        lastLogin: "2026-08-09 21:34"
      },
      externalChecks: [
        { source: "\u516C\u5B89", item: "\u8BC1\u4EF6\u6838\u9A8C", result: "\u8BC1\u4EF6\u53F7\u4E0E\u59D3\u540D\u4E00\u81F4", status: "\u4E00\u81F4", field: "maskedId", verifyOrg: "\u516C\u5B89\u90E8\u516C\u6C11\u8EAB\u4EFD\u4FE1\u606F\u5E93", verifyTime: "2026-08-09 10:02", cost: 0 },
        { source: "\u8FD0\u8425\u5546", item: "\u624B\u673A\u53F7\u5B9E\u540D", result: "\u5B9E\u540D\u8BA4\u8BC1\u4E00\u81F4", status: "\u4E00\u81F4", field: "phone", verifyOrg: "\u4E2D\u56FD\u79FB\u52A8\u5B9E\u540D\u5E93", verifyTime: "2026-08-09 10:03", cost: 0.2 },
        { source: "\u90AE\u7BB1\u670D\u52A1", item: "\u90AE\u7BB1\u6709\u6548\u6027", result: "\u53EF\u9001\u8FBE\u3001\u65E0\u9000\u4FE1", status: "\u4E00\u81F4", field: "email", verifyOrg: "\u90AE\u7BB1\u670D\u52A1\u5546", verifyTime: "2026-08-09 10:03", cost: 0 },
        { source: "\u5DE5\u5546", item: "\u540D\u4E0B\u4F01\u4E1A", result: "\u65E0\u5173\u8054\u4F01\u4E1A", status: "\u4E00\u81F4", verifyOrg: "\u56FD\u5BB6\u4F01\u4E1A\u4FE1\u7528\u4FE1\u606F\u516C\u793A\u7CFB\u7EDF", verifyTime: "2026-08-09 10:05", cost: 0.5 },
        { source: "\u53F8\u6CD5", item: "\u6D89\u8BC9\u67E5\u8BE2", result: "\u65E0\u672A\u7ED3\u6848\u4EF6", status: "\u4E00\u81F4", verifyOrg: "\u4E2D\u56FD\u6267\u884C\u4FE1\u606F\u516C\u5F00\u7F51", verifyTime: "2026-08-09 10:06", cost: 0.5 },
        { source: "\u7A0E\u52A1", item: "\u4E2A\u7A0E\u7F34\u7EB3", result: "\u8FDE\u7EED\u7F34\u7EB3 36 \u4E2A\u6708", status: "\u4E00\u81F4", field: "income", verifyOrg: "\u81EA\u7136\u4EBA\u7535\u5B50\u7A0E\u52A1\u5C40", verifyTime: "2026-08-09 10:07", cost: 0.3 },
        { source: "\u793E\u4FDD\u516C\u79EF\u91D1", item: "\u793E\u4FDD\u72B6\u6001", result: "\u5728\u7F34\u3001\u57FA\u6570\u6B63\u5E38", status: "\u4E00\u81F4", field: "income", verifyOrg: "\u4EBA\u793E / \u516C\u79EF\u91D1\u4E2D\u5FC3", verifyTime: "2026-08-09 10:08", cost: 0.3 }
      ],
      collateralBiz: { collateral: [], business: [] },
      relationGraph: {
        nodes: [
          { id: "self", name: "\u5F20\u660E\u8FDC", type: "self", rel: "\u672C\u4EBA" },
          // 家族
          { id: "spouse", name: "\u674E\u82B8", type: "person", rel: "\u914D\u5076", risk: "\u6B63\u5E38", phone: "139****2048", detail: "\u5171\u540C\u5C45\u4F4F \xB7 \u7D27\u6025\u8054\u7CFB\u4EBA \xB7 \u8FDE\u5E26\u62C5\u4FDD" },
          { id: "father", name: "\u5F20\u5EFA\u56FD", type: "person", rel: "\u7236\u4EB2", phone: "137****7711", detail: "\u9000\u4F11 \xB7 \u7D27\u6025\u8054\u7CFB\u4EBA" },
          { id: "mother", name: "\u738B\u79C0\u82F1", type: "person", rel: "\u6BCD\u4EB2", detail: "\u9000\u4F11" },
          { id: "brother", name: "\u5F20\u660E\u6770", type: "person", rel: "\u5F1F\u5F1F", risk: "\u5173\u6CE8", detail: "\u81EA\u7531\u804C\u4E1A \xB7 \u8FD1\u671F\u67E5\u8BE2\u504F\u591A" },
          { id: "father_in_law", name: "\u674E\u56FD\u5F3A", type: "person", rel: "\u5CB3\u7236", detail: "\u5F02\u5730" },
          // 社交
          { id: "colleague", name: "\u8D75\u78CA", type: "person", rel: "\u540C\u4E8B", detail: "\u540C\u90E8\u95E8" },
          { id: "friend1", name: "\u738B\u6D9B", type: "person", rel: "\u670B\u53CB", risk: "\u5173\u6CE8", detail: "\u6709\u5171\u503A\u4EA4\u96C6" },
          { id: "friend2", name: "\u9648\u9759", type: "person", rel: "\u540C\u5B66", detail: "\u5F02\u5730" },
          { id: "ec", name: "\u5218\u6885", type: "person", rel: "\u7D27\u6025\u8054\u7CFB\u4EBA", phone: "135****6620", detail: "\u4EB2\u5C5E\u4E4B\u5916\u5907\u7528\u8054\u7CFB\u4EBA" },
          // 账户
          { id: "acc_bank", name: "\u672C\u884C\u50A8\u84C4\u5361", type: "account", rel: "\u7ED3\u7B97\u8D26\u6237", detail: "6217****8821" },
          { id: "acc_wx", name: "\u5FAE\u4FE1\u652F\u4ED8", type: "account", rel: "\u5173\u8054\u8D26\u6237", detail: "wxid_****m9k2" },
          { id: "acc_zfb", name: "\u652F\u4ED8\u5B9D", type: "account", rel: "\u5173\u8054\u8D26\u6237", detail: "2088****3391" },
          { id: "acc_other", name: "\u62DB\u884C\u501F\u8BB0\u5361", type: "account", rel: "\u4ED6\u884C\u8D26\u6237", detail: "6225****1109" },
          // 经营 / 企业
          { id: "emp", name: "\u676D\u5DDE\u4E91\u7B97\u79D1\u6280", type: "company", rel: "\u4EFB\u804C\u5355\u4F4D", detail: "\u8F6F\u4EF6\u5DE5\u7A0B\u5E08 \xB7 \u5DE5\u8D44\u53D1\u653E\u65B9" },
          { id: "biz", name: "\u660E\u8FDC\u7F51\u7EDC\u5DE5\u4F5C\u5BA4", type: "company", rel: "\u7ECF\u8425\u4E3B\u4F53", detail: "\u4E2A\u4F53\u5DE5\u5546\u6237 \xB7 \u672C\u4EBA\u7ECF\u8425" },
          { id: "supplier", name: "\u665F\u8FBE\u4F9B\u5E94\u94FE", type: "company", rel: "\u5408\u4F5C\u65B9", risk: "\u5173\u6CE8", detail: "\u7ECF\u8425\u5F80\u6765" },
          // 共债
          { id: "co1", name: "\u5468\u654F", type: "person", rel: "\u5171\u503A\u5173\u8054", risk: "\u9AD8\u5371", openAlerts: 2, detail: "\u540C\u5171\u503A\u5708" },
          { id: "co2", name: "\u5218\u6D0B", type: "person", rel: "\u5171\u503A\u5173\u8054", risk: "\u9AD8\u5371", openAlerts: 1, detail: "\u540C\u5171\u503A\u5708" },
          { id: "co3", name: "\u6797\u6653", type: "person", rel: "\u540C\u8BBE\u5907\u8D26\u53F7", risk: "\u9AD8\u5371", openAlerts: 1, detail: "\u5171\u4EAB\u8BBE\u5907" },
          { id: "org_a", name: "\u82B1\u5457", type: "org", rel: "\u5171\u503A\u673A\u6784", detail: "\u6D88\u8D39\u4FE1\u8D37" },
          { id: "org_b", name: "\u501F\u5457", type: "org", rel: "\u5171\u503A\u673A\u6784", detail: "\u6D88\u8D39\u4FE1\u8D37" },
          { id: "org_c", name: "\u67D0\u6D88\u8D39\u91D1\u878D", type: "org", rel: "\u5171\u503A\u673A\u6784", risk: "\u5173\u6CE8", detail: "\u6301\u724C\u673A\u6784" },
          // 担保
          { id: "guar_biz", name: "\u660E\u8FDC\u5DE5\u4F5C\u5BA4\u62C5\u4FDD", type: "company", rel: "\u62C5\u4FDD\u4E3B\u4F53", detail: "\u7ECF\u8425\u5B9E\u4F53\u62C5\u4FDD" },
          // 设备
          { id: "dev1", name: "iPhone 14", type: "device", rel: "\u5E38\u7528\u8BBE\u5907", detail: "\u5E38\u7528\u767B\u5F55" },
          { id: "dev2", name: "\u5171\u4EAB\u8BBE\u5907\xB7OPPO", type: "device", rel: "\u5171\u4EAB\u8BBE\u5907", risk: "\u9AD8\u5371", detail: "\u591A\u4EBA\u5171\u7528" }
        ],
        edges: [
          // 家族
          { source: "self", target: "spouse", rel: "\u914D\u5076", theme: "\u5BB6\u65CF" },
          { source: "self", target: "father", rel: "\u7236\u5B50", theme: "\u5BB6\u65CF" },
          { source: "self", target: "mother", rel: "\u6BCD\u5B50", theme: "\u5BB6\u65CF" },
          { source: "self", target: "brother", rel: "\u5144\u5F1F", theme: "\u5BB6\u65CF" },
          { source: "spouse", target: "father_in_law", rel: "\u7FC1\u5A7F", theme: "\u5BB6\u65CF" },
          // 社交
          { source: "self", target: "colleague", rel: "\u540C\u4E8B", theme: "\u793E\u4EA4" },
          { source: "self", target: "friend1", rel: "\u670B\u53CB", theme: "\u793E\u4EA4" },
          { source: "self", target: "friend2", rel: "\u540C\u5B66", theme: "\u793E\u4EA4" },
          { source: "self", target: "ec", rel: "\u7D27\u6025\u8054\u7CFB\u4EBA", theme: "\u793E\u4EA4" },
          { source: "friend1", target: "co2", rel: "\u793E\u4EA4\u4EA4\u96C6", theme: "\u793E\u4EA4" },
          // 资金
          { source: "self", target: "acc_bank", rel: "\u672C\u884C\u8D26\u6237", theme: "\u8D44\u91D1" },
          { source: "self", target: "acc_wx", rel: "\u5FAE\u4FE1", theme: "\u8D44\u91D1" },
          { source: "self", target: "acc_zfb", rel: "\u652F\u4ED8\u5B9D", theme: "\u8D44\u91D1" },
          { source: "self", target: "acc_other", rel: "\u4ED6\u884C\u8D26\u6237", theme: "\u8D44\u91D1" },
          { source: "emp", target: "self", rel: "\u5DE5\u8D44\u5165\u8D26", theme: "\u8D44\u91D1" },
          { source: "self", target: "biz", rel: "\u7ECF\u8425\u6536\u6B3E", theme: "\u8D44\u91D1" },
          // 经营
          { source: "self", target: "emp", rel: "\u4EFB\u804C", theme: "\u7ECF\u8425" },
          { source: "self", target: "biz", rel: "\u7ECF\u8425", theme: "\u7ECF\u8425" },
          { source: "biz", target: "supplier", rel: "\u4F9B\u5E94\u94FE", theme: "\u7ECF\u8425" },
          { source: "emp", target: "biz", rel: "\u5173\u8054", theme: "\u7ECF\u8425" },
          // 共债
          { source: "self", target: "co1", rel: "\u5171\u503A", theme: "\u5171\u503A", danger: true },
          { source: "self", target: "co2", rel: "\u5171\u503A", theme: "\u5171\u503A", danger: true },
          { source: "self", target: "co3", rel: "\u5171\u503A/\u540C\u8BBE\u5907", theme: "\u5171\u503A", danger: true },
          { source: "self", target: "org_a", rel: "\u5171\u503A\u673A\u6784", theme: "\u5171\u503A", danger: true },
          { source: "self", target: "org_b", rel: "\u5171\u503A\u673A\u6784", theme: "\u5171\u503A", danger: true },
          { source: "self", target: "org_c", rel: "\u5171\u503A\u673A\u6784", theme: "\u5171\u503A", danger: true },
          { source: "co1", target: "co2", rel: "\u5171\u503A\u94FE\u6761", theme: "\u5171\u503A", danger: true },
          { source: "co1", target: "co3", rel: "\u540C\u8BBE\u5907", theme: "\u5171\u503A", danger: true },
          { source: "org_a", target: "org_b", rel: "\u591A\u5934", theme: "\u5171\u503A", danger: true },
          // 担保
          { source: "self", target: "spouse", rel: "\u62C5\u4FDD\uFF08\u914D\u5076\uFF09", theme: "\u62C5\u4FDD" },
          { source: "self", target: "guar_biz", rel: "\u62C5\u4FDD\uFF08\u7ECF\u8425\u5B9E\u4F53\uFF09", theme: "\u62C5\u4FDD" },
          { source: "guar_biz", target: "org_a", rel: "\u62C5\u4FDD\u4EE3\u507F", theme: "\u62C5\u4FDD" },
          // 设备
          { source: "self", target: "dev1", rel: "\u5E38\u7528\u8BBE\u5907", theme: "\u8BBE\u5907" },
          { source: "self", target: "dev2", rel: "\u5171\u4EAB\u8BBE\u5907", theme: "\u8BBE\u5907", danger: true },
          { source: "co3", target: "dev2", rel: "\u540C\u8BBE\u5907", theme: "\u8BBE\u5907", danger: true }
        ],
        themes: ["\u7EFC\u5408", "\u5BB6\u65CF", "\u793E\u4EA4", "\u8D44\u91D1", "\u7ECF\u8425", "\u5171\u503A", "\u62C5\u4FDD", "\u8BBE\u5907"],
        collectedAt: "2026-08-10 02:15\uFF08T+1 \u6279\u8DD1\uFF09",
        source: "\u5173\u7CFB\u6316\u6398\u5F15\u64CE \xB7 \u878D\u5408\u7533\u8BF7 / \u8BBE\u5907 / \u5F81\u4FE1 / \u5171\u503A"
      },
      coDebt: {
        applications30d: 1,
        orgs: [{ org: "\u672C\u884C", product: "\u6D88\u8D39\u8D37", balance: 86e3, status: "\u5728\u8D37" }],
        chain: ["\u672C\u884C\u6D88\u8D39\u8D37 \u2192 \u672C\u884C\u6559\u80B2\u5206\u671F\uFF08\u540C\u4E00\u5BA2\u6237\uFF09"]
      },
      collections: [],
      postRisk: {
        fundFlow: [
          { date: "2026-08-05", direction: "\u51FA", counterparty: "\u676D\u5DDE\u4E91\u7B97\u79D1\u6280", amount: 28e3, flag: "\u5DE5\u8D44\u5165\u8D26" },
          { date: "2026-08-06", direction: "\u51FA", counterparty: "\u623F\u8D37\u6263\u6B3E", amount: 6800, flag: "\u6B63\u5E38\u8FD8\u6B3E" }
        ],
        blacklist: [{ list: "\u672C\u884C\u9ED1\u540D\u5355", hit: "\u672A\u547D\u4E2D", status: "\u6B63\u5E38" }]
      },
      disposeLog: [
        { time: "2026-07-28 10:12", kind: "op", title: "\u989D\u5EA6\u4F7F\u7528\u7387\u9884\u8B66\u95ED\u73AF", sub: "\u7CFB\u7EDF\u81EA\u52A8\u590D\u6838\u540E\u5173\u95ED" },
        { time: "2026-06-15 14:30", kind: "task", title: "\u67E5\u8BE2\u504F\u591A\u6838\u67E5", sub: "\u5DF2\u6838\u67E5\u4E3A\u6B63\u5E38\u4FE1\u8D37\u9700\u6C42", status: "\u5DF2\u95ED\u73AF" }
      ],
      followed: false
    },
    {
      custId: "CUST-100891",
      name: "\u9648\u6653\u6960",
      maskedId: "4401**********5566",
      status: "\u903E\u671F",
      tags: ["\u5171\u503A\u5ACC\u7591", "\u8D37\u4E2D\u9884\u8B66"],
      avatarText: "\u9648",
      gender: "\u5973",
      age: 29,
      channel: "\u5408\u4F5C\u6E20\u9053\xB7H5",
      region: "\u5E7F\u4E1C\u7701\u6DF1\u5733\u5E02",
      occupation: "\u81EA\u7531\u804C\u4E1A",
      employer: "\u4E2A\u4F53\u7ECF\u8425\uFF08\u7535\u5546\uFF09",
      income: 15e3,
      incomeProof: "\u6D41\u6C34 + \u7ECF\u8425\u8BC1\u660E",
      education: "\u5927\u4E13",
      marital: "\u672A\u5A5A",
      phone: "159****3380",
      phones: [
        { number: "159****3380", verified: true },
        { number: "158****7712", verified: false }
      ],
      email: "chen.xn@shop.com",
      addresses: [
        { type: "\u6237\u7C4D\u5730\u5740", value: "\u5E7F\u4E1C\u7701\u6DF1\u5733\u5E02\u798F\u7530\u533A\u534E\u5F3A\u5317\u8DEF 12 \u53F7" },
        { type: "\u5C45\u4F4F\u5730\u5740", value: "\u5E7F\u4E1C\u7701\u6DF1\u5733\u5E02\u9F99\u534E\u533A\u6C11\u6CBB\u8857\u9053 33 \u680B" },
        { type: "\u516C\u53F8\u5730\u5740", value: "\u5E7F\u4E1C\u7701\u6DF1\u5733\u5E02\u9F99\u5C97\u533A\u534E\u5357\u57CE\u7535\u5546\u5927\u53A6 5F" }
      ],
      creditLimit: 12e4,
      usedLimit: 118e3,
      availLimit: 2e3,
      annualRate: 15.4,
      totalDebt: 118e3,
      monthlyPay: 6120,
      overdueDays: 23,
      overdueAmt: 6120,
      loans: [
        { id: "LN-77320", product: "\u5927\u989D\u5206\u671F\xB7\u7ECF\u8425", principal: 8e4, balance: 71e3, rate: 15.4, term: 24, monthly: 4120, status: "\u903E\u671F", dueDays: 23 },
        { id: "LN-79002", product: "\u968F\u501F\u968F\u8FD8\xB7\u6D88\u8D39\u8D37", principal: 6e4, balance: 47e3, rate: 16.8, term: 12, monthly: 2e3, status: "\u903E\u671F", dueDays: 11 }
      ],
      behavior: [
        { name: "\u7528\u4FE1\u7B14\u6570", count: 71, category: "\u7528\u4FE1", desc: "\u7D2F\u8BA1\u501F\u6B3E\u652F\u7528\u6B21\u6570" },
        { name: "\u63D0\u524D\u8FD8\u6B3E", count: 0, category: "\u8FD8\u6B3E", desc: "\u63D0\u524D\u7ED3\u6E05\u7B14\u6570" },
        { name: "\u6B63\u5E38\u8FD8\u6B3E", count: 14, category: "\u8FD8\u6B3E", desc: "\u6309\u671F\u8FD8\u6B3E\u7B14\u6570" },
        { name: "\u903E\u671F\u8FD8\u6B3E", count: 9, danger: true, category: "\u8FD8\u6B3E", desc: "\u53D1\u751F\u903E\u671F\u7684\u7B14\u6570" },
        { name: "\u673A\u6784\u67E5\u8BE2", count: 19, category: "\u67E5\u8BE2", desc: "\u8FD1 90 \u5929\u673A\u6784\u5F81\u4FE1\u67E5\u8BE2\u6B21\u6570" },
        { name: "\u591A\u5934\u501F\u8D37", count: 6, danger: true, category: "\u67E5\u8BE2", desc: "\u540C\u65F6\u5728\u8D37\u673A\u6784\u6570" },
        { name: "\u591C\u95F4\u7528\u4FE1", count: 33, danger: true, category: "\u7528\u4FE1", desc: "23:00-05:00 \u7528\u4FE1\u7B14\u6570" },
        { name: "\u989D\u5EA6\u4F7F\u7528\u7387", count: 98, danger: true, category: "\u7528\u4FE1", desc: "\u5DF2\u7528 / \u6388\u4FE1\uFF08%\uFF09" }
      ],
      alerts: [
        { id: "AL-2026-0401", rule: "\u8FDE\u7EED\u903E\u671F \u2265 20 \u5929", level: "\u7EA2", date: "2026-08-02", desc: "\u4E3B\u501F\u4EA7\u54C1\u903E\u671F\u8D85 20 \u5929\uFF0C\u89E6\u53D1\u7EA2\u706F\u9884\u8B66", status: "\u5F85\u5904\u7F6E" },
        { id: "AL-2026-0388", rule: "\u591A\u5934\u501F\u8D37 \u2265 5 \u5BB6\u673A\u6784", level: "\u7EA2", date: "2026-07-22", desc: "\u8DE8\u673A\u6784\u501F\u8D37\u96C6\u4E2D\uFF0C\u5171\u503A\u98CE\u9669\u9AD8", status: "\u5904\u7F6E\u4E2D" },
        { id: "AL-2026-0355", rule: "\u989D\u5EA6\u4F7F\u7528\u7387 \u2265 95%", level: "\u9EC4", date: "2026-07-05", desc: "\u989D\u5EA6\u8FD1\u4E4E\u7528\u6EE1\uFF0C\u518D\u878D\u8D44\u7A7A\u95F4\u6781\u4F4E", status: "\u5DF2\u95ED\u73AF" }
      ],
      contacts: [
        { id: "CT-01", name: "\u738B\u6D69", relation: "\u7D27\u6025\u8054\u7CFB\u4EBA", phone: "186****9920" },
        { id: "CT-02", name: "\u5173\u8054\u8D26\u6237\xB7\u652F\u4ED8\u5B9D", relation: "\u5173\u8054\u8D26\u6237", phone: "2088****3321" },
        { id: "CT-03", name: "\u5468\u654F", relation: "\u5171\u503A\u5173\u8054", phone: "150****6644", coDebt: true },
        { id: "CT-04", name: "\u5218\u6D0B", relation: "\u5171\u503A\u5173\u8054", phone: "133****1187", coDebt: true }
      ],
      scores: {
        zhiCha: {
          name: "\u667A\u5BDF\uFF08\u53CD\u6B3A\u8BC8\uFF09",
          score: 412,
          level: "\u5DEE",
          factors: [
            { name: "\u8BBE\u5907\u73AF\u5883", impact: "\u8D1F\u9762", detail: "\u68C0\u6D4B\u5230\u6A21\u62DF\u5668\u8FD0\u884C" },
            { name: "\u540C\u8BBE\u5907\u591A\u8D26\u53F7", impact: "\u8D1F\u9762", detail: "\u540C\u8BBE\u5907\u5173\u8054 3 \u4E2A\u501F\u8D37\u8D26\u53F7" },
            { name: "\u9ED1\u7070\u540D\u5355", impact: "\u8D1F\u9762", detail: "\u547D\u4E2D\u7070\u540D\u5355" }
          ]
        },
        zhiXin: {
          name: "\u667A\u4FE1\uFF08\u4FE1\u7528\uFF09",
          score: 388,
          level: "\u5DEE",
          factors: [
            { name: "\u5386\u53F2\u8FD8\u6B3E", impact: "\u8D1F\u9762", detail: "\u8FD1 6 \u6708\u903E\u671F 9 \u6B21" },
            { name: "\u8D1F\u503A\u6BD4", impact: "\u8D1F\u9762", detail: "DTI \u8D85 100%" },
            { name: "\u67E5\u8BE2\u5BC6\u5EA6", impact: "\u8D1F\u9762", detail: "\u8FD1 90 \u5929\u67E5\u8BE2 19 \u6B21" }
          ]
        },
        zhiRong: {
          name: "\u667A\u878D\uFF08\u7EFC\u5408\uFF09",
          score: 351,
          level: "\u5DEE",
          factors: [
            { name: "\u6536\u5165\u7A33\u5B9A\u6027", impact: "\u8D1F\u9762", detail: "\u81EA\u7531\u804C\u4E1A\u3001\u6D41\u6C34\u6CE2\u52A8\u5927" },
            { name: "\u989D\u5EA6\u4F7F\u7528\u7387", impact: "\u8D1F\u9762", detail: "\u4F7F\u7528\u7387 98%" },
            { name: "\u5171\u503A\u96C6\u4E2D", impact: "\u8D1F\u9762", detail: "\u8DE8 6 \u5BB6\u673A\u6784\u5171\u503A" }
          ]
        },
        limitSuggest: { suggested: 0, current: 12e4, note: "\u5EFA\u8BAE\u51BB\u7ED3\u65B0\u589E\u6388\u4FE1\uFF0C\u542F\u52A8\u8D37\u4E2D\u5904\u7F6E" }
      },
      credit: {
        header: { reportNo: "PBOC-2026-0812-0023", queryTime: "2026-08-12 14:05:40", queriedBy: "\u674E\u5F3A", idNo: "4401**********5678" },
        recentQueries: [
          { org: "\u672C\u884C", date: "2026-07-22", type: "\u8D37\u540E\u7BA1\u7406" },
          { org: "\u9A6C\u4E0A\u6D88\u91D1", date: "2026-07-18", type: "\u8D37\u6B3E\u5BA1\u6279" },
          { org: "360 \u501F\u6761", date: "2026-07-10", type: "\u8D37\u6B3E\u5BA1\u6279" },
          { org: "\u4EAC\u4E1C\u91D1\u6761", date: "2026-06-29", type: "\u8D37\u6B3E\u5BA1\u6279" },
          { org: "\u5FAE\u7C92\u8D37", date: "2026-06-21", type: "\u8D37\u6B3E\u5BA1\u6279" }
        ],
        selfQueries: [
          { date: "2026-06-10", type: "\u672C\u4EBA\u67E5\u8BE2\uFF08\u5546\u4E1A\u94F6\u884C\u7F51\u4E0A\u94F6\u884C\uFF09" }
        ],
        accounts: [
          { type: "\u6D88\u8D39\u8D37", bank: "\u672C\u884C", openDate: "2025-02-20", dueDate: "2027-02-19", creditLimit: 2e5, balance: 118e3, currency: "\u4EBA\u6C11\u5E01", guarantee: "\u4FE1\u7528", overdueMonths: 2, overdueAmt: 3900, status: "\u903E\u671F" },
          { type: "\u6D88\u8D39\u8D37", bank: "\u9A6C\u4E0A\u6D88\u91D1", openDate: "2025-05-11", dueDate: "2026-05-10", creditLimit: 6e4, balance: 42e3, currency: "\u4EBA\u6C11\u5E01", guarantee: "\u4FE1\u7528", overdueMonths: 1, overdueAmt: 2220, status: "\u903E\u671F" },
          { type: "\u73B0\u91D1\u8D37", bank: "360 \u501F\u6761", openDate: "2025-09-03", dueDate: "2026-09-02", creditLimit: 3e4, balance: 28e3, currency: "\u4EBA\u6C11\u5E01", guarantee: "\u4FE1\u7528", overdueMonths: 0, overdueAmt: 0, status: "\u6B63\u5E38" },
          { type: "\u4FE1\u7528\u5361", bank: "\u5E7F\u53D1\u94F6\u884C", openDate: "2023-08-15", dueDate: "--", creditLimit: 4e4, balance: 35e3, currency: "\u4EBA\u6C11\u5E01", guarantee: "\u4FE1\u7528", overdueMonths: 0, overdueAmt: 0, status: "\u5173\u6CE8" }
        ],
        agreements: [
          { id: "AG-BANK-101", org: "\u672C\u884C", limit: 2e5, currency: "\u4EBA\u6C11\u5E01", shareAccounts: 1, effectiveDate: "2025-02-20", expireDate: "2027-02-19", status: "\u6B63\u5E38" },
          { id: "AG-MASHANG-102", org: "\u9A6C\u4E0A\u6D88\u91D1", limit: 6e4, currency: "\u4EBA\u6C11\u5E01", shareAccounts: 1, effectiveDate: "2025-05-11", expireDate: "2026-05-10", status: "\u6B63\u5E38" },
          { id: "AG-360-103", org: "360 \u501F\u6761", limit: 3e4, currency: "\u4EBA\u6C11\u5E01", shareAccounts: 1, effectiveDate: "2025-09-03", expireDate: "2026-09-02", status: "\u6B63\u5E38" }
        ],
        summary: { creditCards: 1, loans: 3, overdueAccounts: 2, overdue90Plus: 0, guaranteeCount: 1, relatedRepay: 1 },
        summaryAmount: { firstBizYear: 2023, openCreditLimit: 33e4, usedBalance: 223e3, maxMonthlyOverdue: 3900, longestOverdueMonths: 2 },
        relatedRepayList: [
          { name: "\u738B\u82B3", relation: "\u914D\u5076", org: "\u672C\u884C", product: "\u6D88\u8D39\u8D37", amount: 118e3, status: "\u6B63\u5E38" }
        ],
        publicRecords: [
          { type: "\u5F3A\u5236\u6267\u884C", org: "\u676D\u5DDE\u5E02\u897F\u6E56\u533A\u4EBA\u6C11\u6CD5\u9662", date: "2026-05-12", content: "\u91D1\u878D\u501F\u6B3E\u5408\u540C\u7EA0\u7EB7\uFF0C\u6267\u884C\u6807\u7684 \xA538,000", status: "\u672A\u5C65\u884C" }
        ],
        overdue: { count: 2, amount: 6120 },
        guarantee: [{ name: "\u4E3A\u5468\u654F\u62C5\u4FDD", amount: 5e4, status: "\u5173\u6CE8" }],
        annotations: [
          { type: "\u5F02\u8BAE\u6807\u6CE8", content: "\u5BA2\u6237\u5BF9\u300C\u9A6C\u4E0A\u6D88\u91D1\u300D\u4E00\u7B14\u903E\u671F\u8BB0\u5F55\u63D0\u51FA\u5F02\u8BAE\uFF0C\u7ECF\u529E\u673A\u6784\u6838\u67E5\u4E2D", date: "2026-07-15" }
        ]
      },
      device: {
        device: "\u672A\u77E5 Android",
        model: "Pixel_Emulator",
        os: "Android 13 (\u6A21\u62DF\u5668)",
        envRiskScore: 86,
        simulator: true,
        sameDeviceAccounts: [
          { custId: "CUST-100891", name: "\u9648\u6653\u6960" },
          { custId: "CUST-100902", name: "\u6797\u6653" },
          { custId: "CUST-100915", name: "\u8D75\u857E" }
        ],
        loginRegion: "\u5E7F\u4E1C\u7701\u4E1C\u839E\u5E02",
        lastLogin: "2026-08-09 02:11"
      },
      externalChecks: [
        { source: "\u516C\u5B89", item: "\u8BC1\u4EF6\u6838\u9A8C", result: "\u8BC1\u4EF6\u53F7\u4E0E\u59D3\u540D\u4E00\u81F4", status: "\u4E00\u81F4", field: "maskedId", verifyOrg: "\u516C\u5B89\u90E8\u516C\u6C11\u8EAB\u4EFD\u4FE1\u606F\u5E93", verifyTime: "2026-08-09 09:58", cost: 0 },
        { source: "\u8FD0\u8425\u5546", item: "\u624B\u673A\u53F7\u5B9E\u540D", result: "\u5B9E\u540D\u8BA4\u8BC1\u4E00\u81F4", status: "\u4E00\u81F4", field: "phone", verifyOrg: "\u4E2D\u56FD\u79FB\u52A8\u5B9E\u540D\u5E93", verifyTime: "2026-08-09 09:59", cost: 0.2 },
        { source: "\u90AE\u7BB1\u670D\u52A1", item: "\u90AE\u7BB1\u6709\u6548\u6027", result: "\u9000\u4FE1\u3001\u7591\u4F3C\u5931\u6548", status: "\u5F02\u5E38", field: "email", verifyOrg: "\u90AE\u7BB1\u670D\u52A1\u5546", verifyTime: "2026-08-09 09:59", cost: 0 },
        { source: "\u5DE5\u5546", item: "\u540D\u4E0B\u4F01\u4E1A", result: "\u4E2A\u4F53\u6237\xB7\u7535\u5546\uFF08\u5B58\u7EED\uFF09", status: "\u4E00\u81F4", verifyOrg: "\u56FD\u5BB6\u4F01\u4E1A\u4FE1\u7528\u4FE1\u606F\u516C\u793A\u7CFB\u7EDF", verifyTime: "2026-08-09 10:01", cost: 0.5 },
        { source: "\u53F8\u6CD5", item: "\u6D89\u8BC9\u67E5\u8BE2", result: "\u6C11\u95F4\u501F\u8D37\u7EA0\u7EB7 1 \u8D77", status: "\u5F02\u5E38", verifyOrg: "\u4E2D\u56FD\u6267\u884C\u4FE1\u606F\u516C\u5F00\u7F51", verifyTime: "2026-08-09 10:02", cost: 0.5 },
        { source: "\u7A0E\u52A1", item: "\u4E2A\u7A0E\u7F34\u7EB3", result: "\u8FD1 6 \u6708\u65E0\u7533\u62A5", status: "\u5F02\u5E38", field: "income", verifyOrg: "\u81EA\u7136\u4EBA\u7535\u5B50\u7A0E\u52A1\u5C40", verifyTime: "2026-08-09 10:03", cost: 0.3 },
        { source: "\u793E\u4FDD\u516C\u79EF\u91D1", item: "\u793E\u4FDD\u72B6\u6001", result: "\u65AD\u7F34\u8D85 12 \u4E2A\u6708", status: "\u5F02\u5E38", field: "income", verifyOrg: "\u4EBA\u793E / \u516C\u79EF\u91D1\u4E2D\u5FC3", verifyTime: "2026-08-09 10:04", cost: 0.3 }
      ],
      collateralBiz: {
        collateral: [{ name: "\u7535\u5546\u5E97\u94FA\u7ECF\u8425\u6743", type: "\u7ECF\u8425\u6743\u8D28\u62BC", value: 6e4, status: "\u8BC4\u4F30\u4E2D", verifyOrg: "\u7ECF\u8425\u6743\u767B\u8BB0\u5E73\u53F0", verifyTime: "2026-08-09 11:20", verified: false }],
        business: [{ name: "\u6DF1\u5733\u5E02\u67D0\u7535\u5546\u5546\u884C", role: "\u7ECF\u8425\u8005", status: "\u5B58\u7EED", verifyOrg: "\u56FD\u5BB6\u4F01\u4E1A\u4FE1\u7528\u4FE1\u606F\u516C\u793A\u7CFB\u7EDF", verifyTime: "2026-08-09 10:01", verified: true }]
      },
      relationGraph: {
        nodes: [
          { id: "self", name: "\u9648\u6653\u6960", type: "self", rel: "\u672C\u4EBA", risk: "\u9AD8\u5371", openAlerts: 3 },
          { id: "zhou", name: "\u5468\u654F", type: "person", rel: "\u5171\u503A\u5173\u8054", risk: "\u9AD8\u5371", openAlerts: 2 },
          { id: "liu", name: "\u5218\u6D0B", type: "person", rel: "\u5171\u503A\u5173\u8054", risk: "\u9AD8\u5371", openAlerts: 1 },
          { id: "lin", name: "\u6797\u6653", type: "person", rel: "\u540C\u8BBE\u5907\u8D26\u53F7", risk: "\u9AD8\u5371", openAlerts: 1 },
          { id: "wang", name: "\u738B\u82B3", type: "person", rel: "\u4EB2\u5C5E" },
          { id: "shop", name: "\u6DF1\u5733\u67D0\u7535\u5546\u5546\u884C", type: "company", rel: "\u7ECF\u8425\u4E3B\u4F53", detail: "\u7ECF\u8425\u8005" },
          { id: "acc_wx", name: "\u5FAE\u4FE1\u652F\u4ED8", type: "account", rel: "\u5173\u8054\u8D26\u6237", detail: "wxid_****x3k" },
          { id: "acc_zfb", name: "\u652F\u4ED8\u5B9D", type: "account", rel: "\u5173\u8054\u8D26\u6237", detail: "2088****7712" },
          { id: "org_a", name: "\u82B1\u5457", type: "org", rel: "\u5171\u503A\u673A\u6784" },
          { id: "org_b", name: "\u501F\u5457", type: "org", rel: "\u5171\u503A\u673A\u6784" },
          { id: "org_c", name: "\u67D0\u6D88\u8D39\u91D1\u878D", type: "org", rel: "\u5171\u503A\u673A\u6784" },
          { id: "dev1", name: "\u5E38\u7528\u8BBE\u5907\xB7\u534E\u4E3A", type: "device", rel: "\u5E38\u7528\u8BBE\u5907" },
          { id: "dev2", name: "\u5171\u4EAB\u8BBE\u5907\xB7OPPO", type: "device", rel: "\u5171\u4EAB\u8BBE\u5907", risk: "\u9AD8\u5371" }
        ],
        edges: [
          { source: "self", target: "zhou", rel: "\u5171\u503A", theme: "\u5171\u503A", danger: true },
          { source: "self", target: "liu", rel: "\u5171\u503A", theme: "\u5171\u503A", danger: true },
          { source: "self", target: "lin", rel: "\u540C\u8BBE\u5907", theme: "\u5171\u503A", danger: true },
          { source: "self", target: "org_a", rel: "\u5171\u503A\u673A\u6784", theme: "\u5171\u503A", danger: true },
          { source: "self", target: "org_b", rel: "\u5171\u503A\u673A\u6784", theme: "\u5171\u503A", danger: true },
          { source: "self", target: "org_c", rel: "\u5171\u503A\u673A\u6784", theme: "\u5171\u503A", danger: true },
          { source: "zhou", target: "liu", rel: "\u5171\u503A\u94FE\u6761", theme: "\u5171\u503A", danger: true },
          { source: "zhou", target: "lin", rel: "\u540C\u8BBE\u5907", theme: "\u5171\u503A", danger: true },
          { source: "self", target: "shop", rel: "\u7ECF\u8425", theme: "\u7ECF\u8425" },
          { source: "self", target: "wang", rel: "\u4EB2\u5C5E", theme: "\u5BB6\u65CF" },
          { source: "self", target: "acc_wx", rel: "\u5FAE\u4FE1", theme: "\u8D44\u91D1" },
          { source: "self", target: "acc_zfb", rel: "\u652F\u4ED8\u5B9D", theme: "\u8D44\u91D1" },
          { source: "self", target: "dev1", rel: "\u5E38\u7528\u8BBE\u5907", theme: "\u8BBE\u5907" },
          { source: "self", target: "dev2", rel: "\u5171\u4EAB\u8BBE\u5907", theme: "\u8BBE\u5907", danger: true },
          { source: "lin", target: "dev2", rel: "\u540C\u8BBE\u5907", theme: "\u8BBE\u5907", danger: true }
        ],
        themes: ["\u7EFC\u5408", "\u5BB6\u65CF", "\u793E\u4EA4", "\u8D44\u91D1", "\u7ECF\u8425", "\u5171\u503A", "\u62C5\u4FDD", "\u8BBE\u5907"],
        collectedAt: "2026-08-10 02:15\uFF08T+1 \u6279\u8DD1\uFF09",
        source: "\u5173\u7CFB\u6316\u6398\u5F15\u64CE \xB7 \u878D\u5408\u7533\u8BF7 / \u8BBE\u5907 / \u5F81\u4FE1 / \u5171\u503A"
      },
      coDebt: {
        applications30d: 6,
        orgs: [
          { org: "\u672C\u884C", product: "\u7ECF\u8425\u8D37", balance: 71e3, status: "\u903E\u671F" },
          { org: "\u9A6C\u4E0A\u6D88\u91D1", product: "\u6D88\u8D39\u8D37", balance: 42e3, status: "\u903E\u671F" },
          { org: "360 \u501F\u6761", product: "\u73B0\u91D1\u8D37", balance: 28e3, status: "\u6B63\u5E38" },
          { org: "\u5FAE\u7C92\u8D37", product: "\u6D88\u8D39\u8D37", balance: 19e3, status: "\u5173\u6CE8" },
          { org: "\u4EAC\u4E1C\u91D1\u6761", product: "\u6D88\u8D39\u8D37", balance: 23e3, status: "\u6B63\u5E38" },
          { org: "\u5206\u671F\u4E50", product: "\u6D88\u8D39\u8D37", balance: 15e3, status: "\u903E\u671F" }
        ],
        chain: ["\u9648\u6653\u6960 \u2192 \u5468\u654F \u2192 \u5218\u6D0B\uFF08\u540C\u4E00\u8D44\u91D1\u4E2D\u4ECB\u5171\u503A\u94FE\u6761\uFF09", "\u9648\u6653\u6960 \u2194 \u6797\u6653\uFF08\u540C\u8BBE\u5907\u591A\u8D26\u53F7\uFF09"]
      },
      collections: [
        {
          id: "COL-2026-00771",
          stage: "M3+",
          product: "\u5927\u989D\u5206\u671F\xB7\u7ECF\u8425",
          status: "\u59D4\u5916",
          owner: "\u50AC\u6536\u5458\xB7\u5434\u654F",
          lastTouch: "2026-08-08",
          overdueAmt: 71e3,
          overdueDays: 23,
          dueDate: "2026-07-16",
          calls: 18,
          sms: 32,
          notes: [
            { time: "2026-08-08 10:02", who: "\u5434\u654F", what: "\u7B2C 3 \u6B21\u7535\u8BDD\uFF0C\u63A5\u901A\u540E\u627F\u8BFA\u672C\u5468\u8FD8\u6B3E 5000" },
            { time: "2026-08-05 19:30", who: "\u7CFB\u7EDF", what: "\u81EA\u52A8 SMS \u63D0\u9192\u5DF2\u53D1\u9001" },
            { time: "2026-08-01 09:15", who: "\u5434\u654F", what: "\u8054\u7CFB\u7D27\u6025\u8054\u7CFB\u4EBA\u738B\u6D69\uFF0C\u8F6C\u544A\u903E\u671F\u60C5\u51B5" }
          ]
        },
        {
          id: "COL-2026-00772",
          stage: "M2",
          product: "\u968F\u501F\u968F\u8FD8\xB7\u6D88\u8D39\u8D37",
          status: "\u627F\u8BFA\u8FD8\u6B3E",
          owner: "\u50AC\u6536\u5458\xB7\u5434\u654F",
          lastTouch: "2026-08-07",
          overdueAmt: 47e3,
          overdueDays: 11,
          dueDate: "2026-07-28",
          calls: 9,
          sms: 21,
          notes: [{ time: "2026-08-07 14:20", who: "\u5434\u654F", what: "\u5BA2\u6237\u8868\u793A\u8D44\u91D1\u5468\u8F6C\u4E2D\uFF0C\u627F\u8BFA 8 \u6708\u5E95\u524D\u7ED3\u6E05" }]
        }
      ],
      postRisk: {
        fundFlow: [
          { date: "2026-08-03", direction: "\u51FA", counterparty: "\u5468\u654F", amount: 12e3, flag: "\u7591\u4F3C\u8D44\u91D1\u56DE\u6D41" },
          { date: "2026-08-01", direction: "\u5165", counterparty: "\u672A\u77E5\u4E2A\u4EBA\u8D26\u6237", amount: 3e4, flag: "\u6765\u6E90\u4E0D\u660E" },
          { date: "2026-07-28", direction: "\u51FA", counterparty: "\u5206\u671F\u4E50", amount: 8e3, flag: "\u62C6\u501F\u8FD8\u6B3E" }
        ],
        blacklist: [
          { list: "\u672C\u884C\u9ED1\u540D\u5355", hit: "\u547D\u4E2D\uFF08\u8D37\u540E\uFF09", status: "\u9AD8\u98CE\u9669" },
          { list: "\u4E92\u91D1\u534F\u4F1A\u7070\u540D\u5355", hit: "\u547D\u4E2D", status: "\u5173\u6CE8" }
        ]
      },
      disposeLog: [
        { time: "2026-08-02 09:00", kind: "task", title: "\u8FDE\u7EED\u903E\u671F\u7EA2\u706F\u5904\u7F6E", sub: "\u6D3E\u53D1\u5904\u7F6E\u5DE5\u5355 D-2026-0401", status: "\u5F85\u5904\u7F6E" },
        { time: "2026-07-22 16:40", kind: "task", title: "\u591A\u5934\u5171\u503A\u6838\u67E5", sub: "\u6D3E\u53D1\u6838\u67E5\u5DE5\u5355 D-2026-0388", status: "\u5904\u7F6E\u4E2D" },
        { time: "2026-07-05 11:20", kind: "op", title: "\u989D\u5EA6\u4F7F\u7528\u7387\u9884\u8B66\u95ED\u73AF", sub: "\u7CFB\u7EDF\u81EA\u52A8\u590D\u6838\u540E\u5173\u95ED" }
      ],
      followed: false
    }
  ]
};
import { useSyncExternalStore } from "react";
let data = JSON.parse(JSON.stringify(SEED_CUST));
let version = 0;
const listeners = /* @__PURE__ */ new Set();
function emit() {
  version++;
  listeners.forEach((fn) => fn());
}
function useSnap(sel) {
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    () => version
  );
  return sel();
}
function useCustData() {
  return useSnap(() => data);
}
function toggleFollowCust(custId) {
  data = {
    ...data,
    customers: data.customers.map((c) => c.custId === custId ? { ...c, followed: !c.followed } : c)
  };
  emit();
}
export {
  SEED_CUST,
  toggleFollowCust,
  useCustData
};
