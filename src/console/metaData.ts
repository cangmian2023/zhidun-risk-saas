// 元数据管理 · 类型定义与样例种子数据
// 数据 100% 来自 sensors/ 目录下的静态页面（神策元数据管理）逐行提取，未做臆造。
// 归属：橘 Sam（样例JSON，使用域作者维护），落盘于 src/console/meta*.json

/* ========== 1. 元事件 ========== */
export interface MetaEvent {
  id: string;
  name: string; // 事件名
  displayName: string; // 事件显示名
  hasData: string; // 上报数据
  visible: string; // 显示状态
  receive: string; // 是否接收
  days30: string; // 过去30天入库
  platform: string; // 应埋点平台
  tags: string; // 标签
  mutable: string; // 是否为可变事件
  screenshot: string; // 事件截图
  updatedAt: string; // 上次修改时间
  creator: string; // 创建人
  trigger: string; // 触发时机
  remark: string; // 备注
}
export const SEED_META_EVENTS: MetaEvent[] = [
  { id: 'me_appdeeplinklaunch', name: '$AppDeeplinkLaunch', displayName: '深度链接唤醒 App', hasData: '有数据', visible: '可见', receive: '允许', days30: '-', platform: '-', tags: '111', mutable: '否', screenshot: '-', updatedAt: '2026-04-07 10:27:15', creator: '系统创建', trigger: 'ABC', remark: '-' },
  { id: 'me_apppageleave', name: '$AppPageLeave', displayName: 'App 页面离开', hasData: '有数据', visible: '可见', receive: '停止', days30: '-', platform: '-', tags: '111', mutable: '否', screenshot: '-', updatedAt: '2025-12-31 11:13:15', creator: '系统创建', trigger: '-', remark: '-' },
  { id: 'me_plansmsarrived', name: '$PlanSMSArrived', displayName: '短信已送达', hasData: '有数据', visible: '可见', receive: '停止', days30: '-', platform: '-', tags: '-', mutable: '否', screenshot: '-', updatedAt: '2026-07-15 14:04:54', creator: '系统创建', trigger: '发送触发', remark: '短信已送达配置测试' },
  { id: 'me_planaudienceenter', name: '$PlanAudienceEnter', displayName: '受众用户进入', hasData: '有数据', visible: '可见', receive: '允许', days30: '-', platform: '-', tags: '福利11', mutable: '否', screenshot: '-', updatedAt: '2025-12-31 11:13:15', creator: '系统创建', trigger: '-', remark: '-' },
  { id: 'me_planaudiencemarked', name: '$PlanAudienceMarked', displayName: '受众标记', hasData: '有数据', visible: '可见', receive: '允许', days30: '-', platform: '-', tags: '-', mutable: '否', screenshot: '-', updatedAt: '2025-12-31 11:13:15', creator: '系统创建', trigger: '-', remark: '-' },
  { id: 'me_journeyexit', name: '$JourneyExit', displayName: '旅程退出', hasData: '有数据', visible: '可见', receive: '允许', days30: '-', platform: '-', tags: '-', mutable: '否', screenshot: '-', updatedAt: '2025-12-31 11:13:15', creator: '系统创建', trigger: '-', remark: '-' },
  { id: 'me_journeycomponententer', name: '$JourneyComponentEnter', displayName: '旅程组件进入', hasData: '有数据', visible: '可见', receive: '允许', days30: '-', platform: '-', tags: '-', mutable: '否', screenshot: '-', updatedAt: '2025-12-31 11:13:15', creator: '系统创建', trigger: '-', remark: '-' },
  { id: 'me_planedmclick', name: '$PlanEDMClick', displayName: '邮件点击', hasData: '有数据', visible: '可见', receive: '允许', days30: '-', platform: '-', tags: '-', mutable: '否', screenshot: '-', updatedAt: '2025-12-31 11:13:15', creator: '系统创建', trigger: '-', remark: '-' },
  { id: 'me_planedmshow', name: '$PlanEDMShow', displayName: '邮件打开', hasData: '有数据', visible: '可见', receive: '允许', days30: '-', platform: '-', tags: '-', mutable: '否', screenshot: '-', updatedAt: '2025-12-31 11:13:15', creator: '系统创建', trigger: '-', remark: '-' },
  { id: 'me_planmsgwouldnotsend', name: '$PlanMsgWouldNotSend', displayName: '消息未发送', hasData: '有数据', visible: '可见', receive: '允许', days30: '-', platform: '-', tags: '-', mutable: '否', screenshot: '-', updatedAt: '2025-12-31 11:13:15', creator: '系统创建', trigger: '-', remark: '-' },
  { id: 'me_usenewfeature_ab', name: 'UseNewFeature_AB', displayName: '使用新功能_AB', hasData: '有数据', visible: '可见', receive: '停止', days30: '-', platform: '-', tags: '-', mutable: '否', screenshot: '-', updatedAt: '2025-12-31 11:13:15', creator: '系统创建', trigger: '-', remark: '-' },
  { id: 'me_appinstall', name: '$AppInstall', displayName: 'App 安装后首次启动', hasData: '有数据', visible: '可见', receive: '允许', days30: '60', platform: '-', tags: '-', mutable: '否', screenshot: '-', updatedAt: '2025-12-31 11:13:15', creator: '系统创建', trigger: '-', remark: '-' },
  { id: 'me_activitypageview_ab', name: 'ActivityPageView_AB', displayName: '活动页面浏览_AB', hasData: '有数据', visible: '可见', receive: '允许', days30: '-', platform: '-', tags: '-', mutable: '否', screenshot: '-', updatedAt: '2025-12-31 11:13:15', creator: '系统创建', trigger: '-', remark: '-' },
  { id: 'me_joinactivity_ab', name: 'JoinActivity_AB', displayName: '参与活动_AB', hasData: '有数据', visible: '可见', receive: '允许', days30: '-', platform: '-', tags: '-', mutable: '否', screenshot: '-', updatedAt: '2025-12-31 11:13:15', creator: '系统创建', trigger: '-', remark: '-' },
  { id: 'me_homepageclick_ab', name: 'HomePageClick_AB', displayName: '官网元素点击_AB', hasData: '有数据', visible: '可见', receive: '允许', days30: '-', platform: '-', tags: '-', mutable: '否', screenshot: '-', updatedAt: '2026-04-20 17:20:47', creator: '系统创建', trigger: '-', remark: '-' },
  { id: 'me_homepageview_ab', name: 'HomePageView_AB', displayName: '官网页面浏览_AB', hasData: '有数据', visible: '可见', receive: '允许', days30: '-', platform: '-', tags: '-', mutable: '否', screenshot: '-', updatedAt: '2026-02-02 14:08:26', creator: '系统创建', trigger: '123', remark: '-' },
  { id: 'me_payorder_ab', name: 'PayOrder_AB', displayName: '完成订单交易_AB', hasData: '有数据', visible: '可见', receive: '允许', days30: '-', platform: '-', tags: '-', mutable: '否', screenshot: '-', updatedAt: '2025-12-31 11:13:15', creator: '系统创建', trigger: '-', remark: '-' },
  { id: 'me_payorderdetails_ab', name: 'PayOrderDetails_AB', displayName: '支付成功_AB', hasData: '有数据', visible: '可见', receive: '允许', days30: '-', platform: '-', tags: '-', mutable: '否', screenshot: '-', updatedAt: '2025-12-31 11:13:15', creator: '系统创建', trigger: '-', remark: '-' },
  { id: 'me_checkout_ab', name: 'CheckOut_AB', displayName: '确认订单信息_AB', hasData: '有数据', visible: '可见', receive: '允许', days30: '-', platform: '-', tags: '-', mutable: '否', screenshot: '-', updatedAt: '2025-12-31 11:13:15', creator: '系统创建', trigger: '-', remark: '-' },
  { id: 'me_addtobag_ab', name: 'AddToBag_AB', displayName: '加入购物车_AB', hasData: '有数据', visible: '可见', receive: '允许', days30: '-', platform: '-', tags: '-', mutable: '否', screenshot: '-', updatedAt: '2025-12-31 11:13:15', creator: '系统创建', trigger: '-', remark: '-' },
];

/* ========== 2 & 3. 事件属性 / 用户属性（同构） ========== */
export interface MetaProp {
  id: string;
  name: string; // 属性名
  displayName: string; // 属性显示名
  dataType: string; // 数据类型
  hasData: string; // 上报数据
  preset: string; // 预置
  dict: string; // 字典
  visible: string; // 显示状态
  unit: string; // 单位/格式
  sample: string; // 属性值示例或说明
}
export const SEED_EVENT_PROPS: MetaProp[] = [
  { id: 'ep_data_ingestion_job_id', name: '$data_ingestion_job_id', displayName: '数据接入任务 ID', dataType: 'STRING', hasData: '有', preset: '是', dict: '无', visible: '可见', unit: '-', sample: '-' },
  { id: 'ep_sat_has_installed_app', name: '$sat_has_installed_app', displayName: '互动事件是否为激活事件触发', dataType: 'BOOL', hasData: '有', preset: '是', dict: '无', visible: '可见', unit: '-', sample: '-' },
  { id: 'ep_latest_sf_source', name: '$latest_sf_source', displayName: '最近一次智能运营来源', dataType: 'STRING', hasData: '有', preset: '是', dict: '无', visible: '可见', unit: '-', sample: '-' },
  { id: 'ep_mp_channel_qrcode_id', name: '$mp_channel_qrcode_id', displayName: '微信服务号渠道二维码 ID', dataType: 'STRING', hasData: '有', preset: '是', dict: '有', visible: '可见', unit: '-', sample: '-' },
  { id: 'ep_sf_qrcode_channel_id', name: '$sf_qrcode_channel_id', displayName: '公众号二维码渠道 ID', dataType: 'STRING', hasData: '有', preset: '是', dict: '无', visible: '可见', unit: '-', sample: '-' },
  { id: 'ep_sf_mark_tag_name', name: '$sf_mark_tag_name', displayName: '标记受众名称', dataType: 'STRING', hasData: '有', preset: '是', dict: '无', visible: '可见', unit: '-', sample: '-' },
  { id: 'ep_sf_mark_action_type', name: '$sf_mark_action_type', displayName: '标记操作类型', dataType: 'STRING', hasData: '有', preset: '是', dict: '无', visible: '可见', unit: '-', sample: '-' },
  { id: 'ep_sf_msg_recipient', name: '$sf_msg_recipient', displayName: '收件人', dataType: 'STRING', hasData: '有', preset: '是', dict: '无', visible: '可见', unit: '-', sample: '-' },
  { id: 'ep_sf_template_id', name: '$sf_template_id', displayName: '通道模板 ID', dataType: 'STRING', hasData: '有', preset: '是', dict: '无', visible: '可见', unit: '-', sample: '-' },
  { id: 'ep_sf_event_receive_time', name: '$sf_event_receive_time', displayName: '回执事件上报时间', dataType: 'DATETIME', hasData: '有', preset: '是', dict: '不支持', visible: '可见', unit: '-', sample: '-' },
  { id: 'ep_sf_send_time', name: '$sf_send_time', displayName: '消息发送时间', dataType: 'DATETIME', hasData: '有', preset: '是', dict: '不支持', visible: '可见', unit: '-', sample: '-' },
  { id: 'ep_sf_enter_strategy_unit_time', name: '$sf_enter_strategy_unit_time', displayName: '进入画布节点时间', dataType: 'DATETIME', hasData: '有', preset: '是', dict: '不支持', visible: '可见', unit: '-', sample: '-' },
  { id: 'ep_sf_from_component_id', name: '$sf_from_component_id', displayName: '上一个画布组件 ID', dataType: 'STRING', hasData: '有', preset: '是', dict: '无', visible: '可见', unit: '-', sample: '-' },
  { id: 'ep_sf_project_id', name: '$sf_project_id', displayName: '智能运营项目 ID', dataType: 'NUMBER', hasData: '有', preset: '是', dict: '无', visible: '可见', unit: '-', sample: '-' },
  { id: 'ep_sf_component_id', name: '$sf_component_id', displayName: '画布组件 ID', dataType: 'STRING', hasData: '有', preset: '是', dict: '无', visible: '可见', unit: '-', sample: '-' },
  { id: 'ep_sf_plan_version', name: '$sf_plan_version', displayName: '计划画布版本', dataType: 'STRING', hasData: '有', preset: '是', dict: '无', visible: '可见', unit: '-', sample: '-' },
  { id: 'ep_sf_not_send_reason', name: '$sf_not_send_reason', displayName: '消息未发送原因', dataType: 'STRING', hasData: '有', preset: '是', dict: '无', visible: '可见', unit: '-', sample: '-' },
  { id: 'ep_sf_conversion_attribution', name: '$sf_conversion_attribution', displayName: '目标转化归因类型', dataType: 'STRING', hasData: '有', preset: '是', dict: '无', visible: '可见', unit: '-', sample: '-' },
  { id: 'ep_sf_send_fail_code', name: '$sf_send_fail_code', displayName: '通道发送失败错误码', dataType: 'STRING', hasData: '有', preset: '是', dict: '无', visible: '可见', unit: '-', sample: '-' },
  { id: 'ep_sf_send_id', name: '$sf_send_id', displayName: '发送ID', dataType: 'STRING', hasData: '有', preset: '是', dict: '无', visible: '可见', unit: '-', sample: '-' },
];
export const SEED_USER_PROPS: MetaProp[] = [
  { id: 'up_ios_install_source', name: '$ios_install_source', displayName: 'App 安装渠道', dataType: 'STRING', hasData: '有', preset: '是', dict: '无', visible: '可见', unit: '-', sample: '-' },
  { id: 'up_first_channel_name', name: '$first_channel_name', displayName: '首次渠道名称', dataType: 'STRING', hasData: '有', preset: '是', dict: '无', visible: '可见', unit: '-', sample: '-' },
  { id: 'up_first_channel_utm_campaign', name: '$first_channel_utm_campaign', displayName: '首次广告系列名称（SAT）', dataType: 'STRING', hasData: '有', preset: '是', dict: '无', visible: '可见', unit: '-', sample: '-' },
  { id: 'up_first_channel_campaign_name', name: '$first_channel_campaign_name', displayName: '首次渠道广告计划名称', dataType: 'STRING', hasData: '有', preset: '是', dict: '无', visible: '可见', unit: '-', sample: '-' },
  { id: 'up_first_channel_click_id', name: '$first_channel_click_id', displayName: '首次渠道监测点击 ID', dataType: 'STRING', hasData: '有', preset: '是', dict: '无', visible: '可见', unit: '-', sample: '-' },
  { id: 'up_first_channel_ad_name', name: '$first_channel_ad_name', displayName: '首次渠道广告创意标题', dataType: 'STRING', hasData: '有', preset: '是', dict: '无', visible: '可见', unit: '-', sample: '-' },
  { id: 'up_first_channel_utm_source', name: '$first_channel_utm_source', displayName: '首次广告系列来源（SAT）', dataType: 'STRING', hasData: '有', preset: '是', dict: '无', visible: '可见', unit: '-', sample: '-' },
  { id: 'up_first_channel_utm_term', name: '$first_channel_utm_term', displayName: '首次广告系列字词（SAT）', dataType: 'STRING', hasData: '有', preset: '是', dict: '无', visible: '可见', unit: '-', sample: '-' },
  { id: 'up_first_channel_adgroup_name', name: '$first_channel_adgroup_name', displayName: '首次渠道广告组名称', dataType: 'STRING', hasData: '有', preset: '是', dict: '无', visible: '可见', unit: '-', sample: '-' },
  { id: 'up_first_channel_keyword', name: '$first_channel_keyword', displayName: '首次渠道关键词', dataType: 'STRING', hasData: '有', preset: '是', dict: '无', visible: '可见', unit: '-', sample: '-' },
  { id: 'up_first_channel_utm_medium', name: '$first_channel_utm_medium', displayName: '首次广告系列媒介（SAT）', dataType: 'STRING', hasData: '有', preset: '是', dict: '无', visible: '可见', unit: '-', sample: '-' },
  { id: 'up_first_channel_utm_content', name: '$first_channel_utm_content', displayName: '首次广告系列内容（SAT）', dataType: 'STRING', hasData: '有', preset: '是', dict: '无', visible: '可见', unit: '-', sample: '-' },
  { id: 'up_first_channel_account_name', name: '$first_channel_account_name', displayName: '首次渠道广告主账户名称', dataType: 'STRING', hasData: '有', preset: '是', dict: '无', visible: '可见', unit: '-', sample: '-' },
  { id: 'up_first_channel_keyword_id', name: '$first_channel_keyword_id', displayName: '首次渠道关键词 ID', dataType: 'STRING', hasData: '有', preset: '是', dict: '无', visible: '可见', unit: '-', sample: '-' },
  { id: 'up_career', name: 'career', displayName: '1 career', dataType: 'STRING', hasData: '有', preset: '否', dict: '无', visible: '可见', unit: '-', sample: '-' },
  { id: 'up_user_age', name: 'user_age', displayName: 'user_age', dataType: 'NUMBER', hasData: '有', preset: '否', dict: '无', visible: '可见', unit: '-', sample: '-' },
  { id: 'up_mp_wx11b1025339395a22_openid', name: '$mp_wx11b1025339395a22_openid', displayName: '大西华 用户 openid', dataType: 'STRING', hasData: '有', preset: '是', dict: '无', visible: '可见', unit: '-', sample: '-' },
  { id: 'up_signup_time', name: '$signup_time', displayName: '注册时间 (1)', dataType: 'DATETIME', hasData: '有', preset: '是', dict: '不支持', visible: '可见', unit: '-', sample: '-' },
  { id: 'up_province', name: '$province', displayName: '省份 (1)', dataType: 'STRING', hasData: '有', preset: '是', dict: '无', visible: '可见', unit: '-', sample: '-' },
  { id: 'up_city', name: '$city', displayName: '城市 (1)', dataType: 'STRING', hasData: '有', preset: '是', dict: '无', visible: '可见', unit: '-', sample: '-' },
];

/* ========== 4. 维度表 ========== */
export interface DimField { name: string; dataType: string }
export interface MetaDimTable {
  id: string;
  name: string;        // 维度表名
  displayName: string; // 显示名
  fields: DimField[];  // 表字段
  updatedAt: string;
}
export const SEED_DIM_TABLES: MetaDimTable[] = [
  { id: 'dt_items', name: 'items', displayName: 'items', fields: [{ name: '$is_valid', dataType: 'BOOL' }, { name: '$receive_time', dataType: 'NUMBER' }, { name: '$update_time', dataType: 'NUMBER' }], updatedAt: '2026-06-24 18:35' },
];

/* ========== 5. 物品属性 ========== */
export interface MetaItemProp {
  id: string;
  name: string; // 属性名
  displayName: string; // 属性显示名
  itemType: string; // 物品类型
  dataType: string; // 数据类型
  unit: string; // 单位/格式
  visible: string; // 显示状态
  preset: string; // 预置
}
export const SEED_ITEM_PROPS: MetaItemProp[] = [
  { id: 'ip_is_valid', name: '$is_valid', displayName: '是否封禁', itemType: '-', dataType: 'BOOL', unit: '-', visible: '可见', preset: '是' },
];

/* ========== 6. 虚拟属性 ========== */
export interface MetaVirtualProp {
  id: string;
  name: string; // 属性名
  displayName: string; // 属性显示名
  category: string; // 属性分类
  dataType: string; // 数据类型
  dict: string; // 字典
  requirement: string; // 可用此属性的事件要求
  createdAt: string; // 创建时间
  createWay: string; // 创建方式
  sql: string; // SQL 表达式
}
export const SEED_VIRTUAL_PROPS: MetaVirtualProp[] = [
  { id: 'vp_cceshi', name: 'cceshi', displayName: '123', category: '事件属性', dataType: 'STRING', dict: '无', requirement: '涵盖 SQL 表达式涉及的所有属性的事件，方可使用此虚拟属性', createdAt: '2026-07-31 14:58:16', createWay: '使用 SQL 确定虚拟属性的值', sql: '-' },
  { id: 'vp_a0731', name: 'a0731', displayName: 'a0731', category: '事件属性', dataType: 'STRING', dict: '无', requirement: '涵盖至少一个 SQL 表达式中涉及的属性的事件，方可使用此虚拟属性', createdAt: '2026-07-31 10:28:43', createWay: '使用 SQL 确定虚拟属性的值', sql: '-' },
  { id: 'vp_day_of_hour', name: 'day_of_hour', displayName: 'day_of_hour', category: '事件属性', dataType: 'NUMBER', dict: '无', requirement: '涵盖至少一个 SQL 表达式中涉及的属性的事件，方可使用此虚拟属性', createdAt: '2026-07-10 22:00:45', createWay: '使用 SQL 确定虚拟属性的值', sql: 'extract(hour from events.time)' },
  { id: 'vp_t0302', name: 't0302', displayName: 't0302', category: '事件属性', dataType: 'STRING', dict: '无', requirement: '涵盖 SQL 表达式涉及的所有属性的事件，方可使用此虚拟属性', createdAt: '2026-03-02 17:38:49', createWay: '使用 SQL 确定虚拟属性的值', sql: '-' },
  { id: 'vp_ttime', name: 'ttime', displayName: 'ttime', category: '事件属性', dataType: 'DATETIME', dict: '不支持', requirement: '涵盖 SQL 表达式涉及的所有属性的事件，方可使用此虚拟属性', createdAt: '2026-02-27 17:57:14', createWay: '使用 SQL 确定虚拟属性的值', sql: '-' },
  { id: 'vp_sd__sat_channel_csite', name: 'sd__sat_channel_csite', displayName: 'sd__sat_channel_csite', category: '事件属性', dataType: 'STRING', dict: '无', requirement: '涵盖至少一个 SQL 表达式中涉及的属性的事件，方可使用此虚拟属性', createdAt: '2026-01-16 03:08:29', createWay: '使用 SQL 确定虚拟属性的值', sql: '-' },
  { id: 'vp_sd_sat_channel_csite', name: 'sd_sat_channel_csite', displayName: '营销投放位置', category: '事件属性', dataType: 'STRING', dict: '无', requirement: '涵盖至少一个 SQL 表达式中涉及的属性的事件，方可使用此虚拟属性', createdAt: '2026-01-16 03:01:07', createWay: '使用 SQL 确定虚拟属性的值', sql: '-' },
  { id: 'vp_scenariostore_source_118_1765777747', name: 'scenariostore_source_118_1765777747', displayName: 'ScenarioStore_流量来源_118_1765777747', category: '事件属性', dataType: 'STRING', dict: '无', requirement: '涵盖 SQL 表达式涉及的所有属性的事件，方可使用此虚拟属性', createdAt: '2025-12-15 13:49:08', createWay: '使用 SQL 确定虚拟属性的值', sql: '-' },
  { id: 'vp_scenariostore_source_117_1765777731', name: 'scenariostore_source_117_1765777731', displayName: 'ScenarioStore_流量来源_117_1765777731', category: '事件属性', dataType: 'STRING', dict: '无', requirement: '涵盖 SQL 表达式涉及的所有属性的事件，方可使用此虚拟属性', createdAt: '2025-12-15 13:48:52', createWay: '使用 SQL 确定虚拟属性的值', sql: '-' },
  { id: 'vp_scenariostore_source_116_1765777723', name: 'scenariostore_source_116_1765777723', displayName: 'ScenarioStore_流量来源_116_1765777723', category: '事件属性', dataType: 'STRING', dict: '无', requirement: '涵盖 SQL 表达式涉及的所有属性的事件，方可使用此虚拟属性', createdAt: '2025-12-15 13:48:44', createWay: '使用 SQL 确定虚拟属性的值', sql: '-' },
  { id: 'vp_receive_time_test', name: 'receive_time_test', displayName: '$receive_time转日期', category: '事件属性', dataType: 'DATETIME', dict: '不支持', requirement: '涵盖至少一个 SQL 表达式中涉及的属性的事件，方可使用此虚拟属性', createdAt: '2025-11-10 15:05:49', createWay: '使用 SQL 确定虚拟属性的值', sql: '-' },
  { id: 'vp_browsingtime_test', name: 'BrowsingTime_test', displayName: 'BrowsingTime转日期', category: '事件属性', dataType: 'DATETIME', dict: '不支持', requirement: '涵盖至少一个 SQL 表达式中涉及的属性的事件，方可使用此虚拟属性', createdAt: '2025-11-10 15:00:36', createWay: '使用 SQL 确定虚拟属性的值', sql: '-' },
  { id: 'vp_xn_url', name: 'xn_url', displayName: 'xn_url', category: '事件属性', dataType: 'STRING', dict: '无', requirement: '涵盖 SQL 表达式涉及的所有属性的事件，方可使用此虚拟属性', createdAt: '2025-10-17 14:44:58', createWay: '使用 SQL 确定虚拟属性的值', sql: '-' },
  { id: 'vp_aaax', name: 'aaax', displayName: 'aaax', category: '事件属性', dataType: 'STRING', dict: '无', requirement: '涵盖 SQL 表达式涉及的所有属性的事件，方可使用此虚拟属性', createdAt: '2025-10-16 16:00:06', createWay: '使用 SQL 确定虚拟属性的值', sql: '-' },
  { id: 'vp_ceshi2', name: 'ceshi2', displayName: '1ceshi', category: '用户属性', dataType: 'BOOL', dict: '无', requirement: '所有事件均可使用此用户虚拟属性进行分析与查询', createdAt: '2025-10-11 11:52:54', createWay: '使用 SQL 确定虚拟属性的值', sql: '-' },
  { id: 'vp_distincttid', name: 'distincttid', displayName: 'distincttid', category: '事件属性', dataType: 'STRING', dict: '无', requirement: '涵盖至少一个 SQL 表达式中涉及的属性的事件，方可使用此虚拟属性', createdAt: '2025-09-03 17:41:58', createWay: '使用 SQL 确定虚拟属性的值', sql: '-' },
  { id: 'vp_xn_lib', name: 'xn_lib', displayName: 'xn_lib', category: '事件属性', dataType: 'STRING', dict: '无', requirement: '涵盖 SQL 表达式涉及的所有属性的事件，方可使用此虚拟属性', createdAt: '2025-08-13 15:39:34', createWay: '使用 SQL 确定虚拟属性的值', sql: '-' },
  { id: 'vp_scenariostore_source_108_1749175700', name: 'scenariostore_source_108_1749175700', displayName: 'ScenarioStore_流量来源_108_1749175700', category: '事件属性', dataType: 'STRING', dict: '无', requirement: '涵盖 SQL 表达式涉及的所有属性的事件，方可使用此虚拟属性', createdAt: '2025-06-06 10:08:21', createWay: '使用 SQL 确定虚拟属性的值', sql: '-' },
  { id: 'vp_ce', name: 'ce', displayName: 'ce', category: '事件属性', dataType: 'STRING', dict: '无', requirement: '涵盖至少一个 SQL 表达式中涉及的属性的事件，方可使用此虚拟属性', createdAt: '2025-06-05 16:51:35', createWay: '使用 SQL 确定虚拟属性的值', sql: '-' },
  { id: 'vp_sec1', name: 'sec1', displayName: 'sec1', category: '用户属性', dataType: 'STRING', dict: '无', requirement: '所有事件均可使用此用户虚拟属性进行分析与查询', createdAt: '2025-06-05 16:17:40', createWay: '使用 SQL 确定虚拟属性的值', sql: '-' },
];

/* ========== 7. 虚拟事件 ========== */
export interface VirtualEventPart { event: string; condition: string }
export interface MetaVirtualEvent {
  id: string;
  name: string; // 虚拟事件名
  displayName: string; // 虚拟事件显示名
  tags: string; // 标签
  screenshot: string; // 事件截图
  remark: string; // 备注
  creator: string; // 创建人
  createdAt: string; // 创建时间
  updatedAt: string; // 更新时间
  parts: VirtualEventPart[]; // 虚拟事件的组成
}
export const SEED_VIRTUAL_EVENTS: MetaVirtualEvent[] = [
  { id: 've_yc_xiaoma', name: 'yc_xiaoma', displayName: '小马测试', tags: '-', screenshot: '-', remark: '-', creator: '15894211454', createdAt: '2026-06-12 11:56:10', updatedAt: '2026-06-12 18:42:36', parts: [{ event: '$启动APP', condition: '-' }] },
  { id: 've_ffff', name: 'ffff', displayName: 'web和app新用户日活', tags: '-', screenshot: '-', remark: '-', creator: '15894211454', createdAt: '2026-06-12 11:56:10', updatedAt: '2026-06-12 18:42:36', parts: [{ event: '$启动APP', condition: '-' }, { event: 'Web 浏览页面', condition: '-' }] },
  { id: 've_yw_test1', name: 'yw_test1', displayName: 'web端和app端的新日活', tags: '-', screenshot: '-', remark: '-', creator: '15894211454', createdAt: '2026-06-12 11:56:10', updatedAt: '2026-06-12 18:42:36', parts: [{ event: 'Web 浏览页面', condition: '是否首日访问 为真' }, { event: '$启动APP', condition: '是否首日访问 为真' }] },
  { id: 've_xunishux', name: 'xunishux', displayName: '虚拟属性测试', tags: '-', screenshot: '-', remark: '-', creator: '15894211454', createdAt: '2026-06-12 11:56:10', updatedAt: '2026-06-12 18:42:36', parts: [{ event: '$启动APP', condition: '-' }, { event: '点击注册按钮', condition: '-' }] },
  { id: 've_adb', name: 'adb', displayName: '23211', tags: '-', screenshot: '-', remark: '-', creator: '15894211454', createdAt: '2026-06-12 11:56:10', updatedAt: '2026-06-12 18:42:36', parts: [{ event: '$启动APP', condition: '-' }] },
  { id: 've_ddsds', name: 'ddsds', displayName: 'a s d', tags: '-', screenshot: '-', remark: '-', creator: '15894211454', createdAt: '2026-06-12 11:56:10', updatedAt: '2026-06-12 18:42:36', parts: [{ event: '$启动APP', condition: '-' }] },
  { id: 've_f23', name: 'f23', displayName: 'sa d f', tags: '-', screenshot: '-', remark: '-', creator: '15894211454', createdAt: '2026-06-12 11:56:10', updatedAt: '2026-06-12 18:42:36', parts: [{ event: '$启动APP', condition: '-' }] },
  { id: 've_fds', name: 'fds', displayName: 'dsfgf', tags: '-', screenshot: '-', remark: '-', creator: '15894211454', createdAt: '2026-06-12 11:56:10', updatedAt: '2026-06-12 18:42:36', parts: [{ event: '$启动APP', condition: '-' }] },
  { id: 've_dfgdf', name: 'dfgdf', displayName: 'dsfg', tags: '-', screenshot: '-', remark: '-', creator: '15894211454', createdAt: '2026-06-12 11:56:10', updatedAt: '2026-06-12 18:42:36', parts: [{ event: '$启动APP', condition: '-' }] },
  { id: 've_dsfg', name: 'dsfg', displayName: 'dg', tags: '-', screenshot: '-', remark: '-', creator: '15894211454', createdAt: '2026-06-12 11:56:10', updatedAt: '2026-06-12 18:42:36', parts: [{ event: '$启动APP', condition: '-' }] },
  { id: 've_sdgf', name: 'sdgf', displayName: 'dfsg', tags: '-', screenshot: '-', remark: '-', creator: '15894211454', createdAt: '2026-06-12 11:56:10', updatedAt: '2026-06-12 18:42:36', parts: [{ event: '$启动APP', condition: '-' }] },
  { id: 've_dfg', name: 'dfg', displayName: 'sdfg', tags: '-', screenshot: '-', remark: '-', creator: '15894211454', createdAt: '2026-06-12 11:56:10', updatedAt: '2026-06-12 18:42:36', parts: [{ event: '$启动APP', condition: '-' }] },
  { id: 've_dfsg', name: 'dfsg', displayName: 'fsdg', tags: '-', screenshot: '-', remark: '-', creator: '15894211454', createdAt: '2026-06-12 11:56:10', updatedAt: '2026-06-12 18:42:36', parts: [{ event: '$启动APP', condition: '-' }] },
  { id: 've_ds', name: 'ds', displayName: 'ad', tags: '-', screenshot: '-', remark: '-', creator: '15894211454', createdAt: '2026-06-12 11:56:10', updatedAt: '2026-06-12 18:42:36', parts: [{ event: '$启动APP', condition: '-' }] },
  { id: 've_fd', name: 'fd', displayName: 'ds', tags: '-', screenshot: '-', remark: '-', creator: '15894211454', createdAt: '2026-06-12 11:56:10', updatedAt: '2026-06-12 18:42:36', parts: [{ event: '$启动APP', condition: '-' }] },
  { id: 've_sss', name: 'sss', displayName: 'ss', tags: '-', screenshot: '-', remark: '-', creator: '15894211454', createdAt: '2026-06-12 11:56:10', updatedAt: '2026-06-12 18:42:36', parts: [{ event: '$启动APP', condition: '-' }] },
  { id: 've_d', name: 'd', displayName: 'd', tags: '-', screenshot: '-', remark: '-', creator: '15894211454', createdAt: '2026-06-12 11:56:10', updatedAt: '2026-06-12 18:42:36', parts: [{ event: '$启动APP', condition: '-' }] },
  { id: 've_s', name: 's', displayName: 's', tags: '-', screenshot: '-', remark: '-', creator: '15894211454', createdAt: '2026-06-12 11:56:10', updatedAt: '2026-06-12 18:42:36', parts: [{ event: '$启动APP', condition: '-' }] },
  { id: 've_ww', name: 'ww', displayName: 'ww', tags: '-', screenshot: '-', remark: '-', creator: '15894211454', createdAt: '2026-06-12 11:56:10', updatedAt: '2026-06-12 18:42:36', parts: [{ event: '$启动APP', condition: '-' }] },
  { id: 've_we', name: 'we', displayName: 'ew', tags: '-', screenshot: '-', remark: '-', creator: '15894211454', createdAt: '2026-06-12 11:56:10', updatedAt: '2026-06-12 18:42:36', parts: [{ event: '$启动APP', condition: '-' }] },
];

/* ========== 8. 可视化全埋点事件 ========== */
export interface MetaAutoTrackEvent {
  id: string;
  displayName: string; // 显示名
  platform: string; // 平台
  eventType: string; // 事件类型
  visible: string; // 显示状态
  match30: string; // 过去 30 天匹配事件数
  lastVersion: string; // 最后修改版本
  lastUpdater: string; // 最后更新人
  updatedAt: string; // 更新时间
  creator: string; // 创建人
  createdAt: string; // 创建时间
}
export const SEED_AUTO_TRACK_EVENTS: MetaAutoTrackEvent[] = [
  { id: 'at_web', displayName: '点击_神策数据｜大数据分析与营_公司介绍_Web', platform: 'Web', eventType: '点击事件', visible: '可见', match30: '-', lastVersion: '-', lastUpdater: '官网demo责任人', updatedAt: '2026-06-24 18:35', creator: '-', createdAt: '2023-04-28 14:54' },
  { id: 'at_web', displayName: '浏览_神策数据｜大数据分析与营_Web', platform: 'Web', eventType: '浏览事件', visible: '可见', match30: '-', lastVersion: '-', lastUpdater: '官网demo责任人', updatedAt: '2026-06-24 18:35', creator: '-', createdAt: '2023-04-28 11:57' },
];

/* ========== 关联事件明细（详情抽屉「关联此属性的事件明细」） ========== */
export interface RelatedEvent { displayName: string; name: string; visible: string }
// 来自「事件属性详情」抽屉
export const SEED_RELATED_EVENT_PROP: RelatedEvent[] = [
  { displayName: 'Push点击1', name: 'PushClick', visible: '可见' },
];
// 来自「虚拟属性详情」抽屉
export const SEED_RELATED_VIRTUAL_PROP: RelatedEvent[] = [
  { displayName: 'App 元素点击', name: '$AppClick', visible: '可见' },
  { displayName: '$退出APP', name: '$AppEnd', visible: '可见' },
  { displayName: '$启动APP', name: '$AppStart', visible: '可见' },
  { displayName: 'App 浏览页面', name: '$AppViewScreen', visible: '可见' },
  { displayName: '小程序进入后台', name: '$MPHide', visible: '可见' },
  { displayName: '小程序首次启动', name: '$MPLaunch', visible: '可见' },
  { displayName: '小程序分享', name: '$MPShare', visible: '可见' },
  { displayName: '小程序启动', name: '$MPShow', visible: '可见' },
  { displayName: '小程序页面浏览', name: '$MPViewScreen', visible: '可见' },
  { displayName: '推送转化', name: '$PlanConverted', visible: '可见' },
];

/* ========== 筛选下拉选项（取自静态页筛选栏） ========== */
export const OPT_VISIBLE = ['全部', '可见', '隐藏'];
export const OPT_HAS_DATA = ['全部', '有', '无'];
export const OPT_DATA_TYPE = ['全部', 'STRING', 'NUMBER', 'BOOL', 'DATETIME', 'LIST'];
export const OPT_RECEIVE = ['全部', '允许', '停止'];
export const OPT_MUTABLE = ['全部', '是', '否'];
export const OPT_PROP_CATEGORY = ['全部', '事件属性', '用户属性'];
export const OPT_PLATFORM = ['全部', 'Web', 'App', '小程序'];
export const OPT_AT_EVENT_TYPE = ['全部', '点击事件', '浏览事件'];
