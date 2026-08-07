# -*- coding: utf-8 -*-
# 生成 50 条真实金融风控监控任务（贷中监控场景），输出 TS 数组字面量
scenes = [
    # (name, crowd, gran, period, metrics, enabled, desc)
    ("信用卡逾期率日扫", "存量信用卡客户", "day", {"hours":["00"]}, ["m_overdue_rate","m_alert_cnt"], True, "每日 00:00 扫描存量信用卡客群逾期率，超阈值触发预警"),
    ("信用卡逾期率日扫·新增", "新增信用卡客户", "day", {"hours":["00"]}, ["m_overdue_rate"], True, "关注新发卡 90 天内的逾期苗头"),
    ("消费贷逾期率监控", "消费贷在贷客户", "day", {"hours":["01"]}, ["m_overdue_rate","m_loan_balance"], True, "消费贷资产质量日监控"),
    ("经营贷逾期率周报", "经营贷在贷客户", "week", {"days":["mon","wed","fri"],"hours":["09"]}, ["m_overdue_rate"], True, "经营贷逾期率周度趋势，周五 09:00 复核"),
    ("全量在贷余额日扫", "全量在贷客户", "day", {"hours":["02"]}, ["m_loan_balance"], True, "每日 02:00 全量在贷余额快照"),
    ("高额度客户额度使用率", "授信额度≥50万客户", "week", {"days":["mon"],"hours":["10"]}, ["m_credit_usage"], True, "高敞口客户额度使用率周监控，接近上限提前预警"),
    ("行为分骤降预警", "行为分≥70的存量客户", "day", {"hours":["08"]}, ["m_behavior_score"], True, "客户行为分单日骤降触发关注"),
    ("行为分持续走低监控", "全量活跃客户", "week", {"days":["tue","thu"],"hours":["09"]}, ["m_behavior_score","m_alert_cnt"], False, "行为分连续两周走低的客户名单"),
    ("异常登录事件监控", "全部登录用户", "hour", {"days":["mon","tue","wed","thu","fri","sat","sun"],"hours":["00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23"]}, ["m_ip","m_startup_dur"], True, "按小时扫描异常登录（IP/启动时长异常）"),
    ("大额交易实时监控", "单笔≥10万交易客户", "minute", {}, ["m_alert_cnt"], True, "大额交易分钟级实时预警"),
    ("高频交易实时拦截", "高频交易客户", "realtime", {}, ["m_alert_cnt"], True, "同设备 1 分钟内多笔交易的实时拦截"),
    ("多头借贷风险监控", "近30天申贷≥3次的客户", "day", {"hours":["03"]}, ["m_behavior_score","m_alert_cnt"], True, "多头借贷线索日汇总"),
    ("反欺诈命中监控", "命中欺诈规则库客户", "hour", {"days":["mon","tue","wed","thu","fri","sat","sun"],"hours":["00","04","08","12","16","20"]}, ["m_ip","m_country"], True, "按小时统计欺诈命中，异常 IP/国家组合高亮"),
    ("催收处置率监控", "红灯预警客户", "week", {"days":["mon"],"hours":["09"]}, ["m_dispose_rate"], True, "催收处置率周达标率监控"),
    ("催收回款率监控", "委外催收客户", "month", {"hours":["01"]}, ["m_dispose_rate"], False, "月度回款率环比监控"),
    ("新客进件通过率监控", "新客进件", "day", {"hours":["09"]}, ["m_alert_cnt","m_behavior_score"], True, "新客进件通过率与风险分分布日看"),
    ("老客流失预警", "活跃30天以上客户", "week", {"days":["fri"],"hours":["18"]}, ["m_behavior_score"], True, "活跃度骤降的老客流失预警"),
    ("授信额度回收监控", "逾期30天+客户", "month", {"hours":["02"]}, ["m_credit_usage","m_loan_balance"], True, "逾期客户授信额度回收执行月度核对"),
    ("直播间转化事件监控", "直播间访客（用户ID）", "hour", {"days":["mon","tue","wed","thu","fri","sat","sun"],"hours":["00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23"]}, ["m_web_stay_7d","m_live_buy_peruser","m_custom_idx2"], True, "直播间停留/点击购买/转化率事件监控（对齐 event/pinlv 文档）"),
    ("提现失败率监控", "提现用户", "day", {"hours":["04"]}, ["m_alert_cnt"], True, "提现失败率超阈值预警"),
    ("还款渠道成功率监控", "全量还款用户", "day", {"hours":["20"]}, ["m_alert_cnt"], True, "主流还款渠道成功率日监控"),
    ("授信审批时长监控", "审批中进件", "day", {"hours":["10"]}, ["m_alert_cnt"], True, "审批时效 SLA 监控"),
    ("睡眠户激活监控", "睡眠账户（30天无交易）", "week", {"days":["wed"],"hours":["11"]}, ["m_behavior_score"], False, "睡眠户激活活动效果监控"),
    ("分期购物风险监控", "分期购物客户", "day", {"hours":["00"]}, ["m_loan_balance","m_overdue_rate"], True, "分期资产组合风险监控"),
    ("现金贷贷后监控", "现金贷在贷客户", "day", {"hours":["01"]}, ["m_overdue_rate","m_credit_usage"], True, "现金贷贷后逾期与额度使用联动监控"),
    ("抵押贷抵押物监控", "抵押贷客户", "month", {"hours":["03"]}, ["m_loan_balance"], True, "抵押贷余额月度复核"),
    ("车贷 GPS 脱机监控", "车贷客户", "day", {"hours":["06"]}, ["m_alert_cnt"], True, "车辆 GPS 长时间脱机预警"),
    ("供应链融资回款监控", "供应链融资客户", "week", {"days":["mon"],"hours":["08"]}, ["m_loan_balance","m_overdue_rate"], True, "核心企业上下游回款周监控"),
    ("小微商户经营监控", "小微经营贷客户", "week", {"days":["thu"],"hours":["14"]}, ["m_behavior_score"], True, "小微商户经营活跃度监控"),
    ("代发工资客群监控", "代发工资客户", "day", {"hours":["07"]}, ["m_alert_cnt","m_behavior_score"], True, "代发客群批量行为异常监控"),
    ("学生客群授信监控", "学生分期客户", "week", {"days":["sat"],"hours":["12"]}, ["m_credit_usage"], False, "学生客群授信额度使用周监控"),
    ("跨境客群交易监控", "跨境交易客户", "hour", {"days":["mon","tue","wed","thu","fri","sat","sun"],"hours":["00","06","12","18"]}, ["m_country","m_ip"], True, "跨境大额交易按时段监控"),
    ("黑产设备聚集监控", "风控黑名单设备", "hour", {"days":["mon","tue","wed","thu","fri","sat","sun"],"hours":["00","02","04","06","08","10","12","14","16","18","20","22"]}, ["m_ip"], True, "黑产设备/IP 聚集度按小时监控"),
    ("睡眠卡批量激活监控", "睡眠信用卡", "day", {"hours":["12"]}, ["m_alert_cnt"], True, "批量激活刷卡异常检测"),
    ("额度外溢监控", "额度使用率>95%客户", "day", {"hours":["16"]}, ["m_credit_usage"], True, "额度使用率逼近上限的客户名单"),
    ("二次授信复审监控", "提额申请客户", "day", {"hours":["11"]}, ["m_behavior_score","m_credit_usage"], True, "提额复审通过率与风险监控"),
    ("逾期客户还款行为", "逾期3天以内客户", "day", {"hours":["21"]}, ["m_dispose_rate"], True, "M1 客户还款行为跟踪"),
    ("催收工单响应监控", "催收工单", "day", {"hours":["09"]}, ["m_dispose_rate"], True, "催收工单 2 小时响应率监控"),
    ("关联企业风险传导", "集团关联客户", "week", {"days":["tue"],"hours":["10"]}, ["m_overdue_rate","m_loan_balance"], True, "关联企业风险传导周监控"),
    ("担保圈风险监控", "互保客户", "month", {"hours":["04"]}, ["m_loan_balance"], True, "担保圈集中度月度监控"),
    ("存量授信压缩监控", "压缩授信名单客户", "week", {"days":["fri"],"hours":["15"]}, ["m_credit_usage"], True, "授信压缩执行进度监控"),
    ("新增不良贷款监控", "新增不良客户", "day", {"hours":["05"]}, ["m_overdue_rate"], True, "每日新增不良贷款明细监控"),
    ("核销客户回收监控", "核销客户", "month", {"hours":["02"]}, ["m_dispose_rate"], False, "核销客户回收率月度评估"),
    ("反洗钱可疑交易", "可疑交易名单", "realtime", {}, ["m_alert_cnt","m_country"], True, "可疑跨境资金流动实时预警"),
    ("批量开户风险监控", "新开户客户", "day", {"hours":["10"]}, ["m_ip"], True, "同 IP 批量开户风险检测"),
    ("营销活动套利监控", "参与营销活动客户", "hour", {"days":["mon","tue","wed","thu","fri","sat","sun"],"hours":["09","10","11","12","13","14","15","16","17","18","19","20","21"]}, ["m_live_buy_peruser","m_custom_idx2"], True, "直播/活动优惠套利行为监控"),
    ("客诉集中度监控", "投诉客户", "day", {"hours":["19"]}, ["m_alert_cnt"], False, "投诉集中度日监控"),
    ("客服工单滞留监控", "客服工单", "day", {"hours":["22"]}, ["m_dispose_rate"], True, "工单滞留超 24 小时预警"),
    ("信用卡套现风险监控", "信用卡套现嫌疑客户", "day", {"hours":["14"]}, ["m_alert_cnt","m_behavior_score"], True, "信用卡疑似套现交易日监控"),
    ("节假日逾期脉冲监控", "节假日大额消费客户", "week", {"days":["mon"],"hours":["00"]}, ["m_overdue_rate","m_credit_usage"], True, "节假日消费脉冲后的逾期抬头监控"),
]
assert len(scenes) == 50, len(scenes)

lines = []
for i, (name, crowd, gran, period, metrics, enabled, desc) in enumerate(scenes, 1):
    tid = "t_event" if "直播间转化" in name else f"t{i:03d}"
    if gran == "realtime" or gran == "minute" or not period:
        p = "{}"
    else:
        parts = []
        if "days" in period:
            ds = ", ".join(f"'{d}'" for d in period["days"])
            parts.append(f"days: [{ds}]")
        if period.get("hours"):
            hs = ", ".join(f"'{h}'" for h in period["hours"])
            parts.append(f"hours: [{hs}]")
        p = "{ " + ", ".join(parts) + " }"
    ms = ", ".join(f"'{m}'" for m in metrics)
    lines.append(
        "    { id: '" + tid + "', name: '" + name + "', crowd: '" + crowd + "',\n"
        + "      granularity: '" + gran + "', period: " + p + ",\n"
        + "      metricIds: [" + ms + "], output: 'web', enabled: " + str(enabled).lower() + ",\n"
        + "      desc: '" + desc + "' },"
    )

out = "\n".join(lines)
with open('/tmp/tasks50.txt', 'w', encoding='utf-8') as f:
    f.write(out)
print(f"generated {len(scenes)} tasks -> /tmp/tasks50.txt ({len(out)} chars)")
print(out.split('\n')[0])
