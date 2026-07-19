import { useState } from 'react'
import type { ModuleSpec } from '../console/menus'
import { Panel, KV, Grid, Toggle, Tabs, Tag } from './widgets'

/* ===================== 个人中心 ===================== */

const profileAccount: ModuleSpec = {
  title: '账户资料',
  crumb: '个人中心 / 账户资料',
  subtitle: '维护个人身份信息与第三方账号绑定，金融场景要求手机号与邮箱双绑。',
  custom: (
    <div className="space-y-6">
      <Panel title="基础资料" subtitle="姓名、账号与联系方式（均已脱敏）">
        <Grid cols={2}>
          <KV label="用户名" value="admin" />
          <KV label="昵称" value="张明（风控管理员）" />
          <KV label="真实姓名" value="张明" />
          <KV label="手机号" value="138****5678（已验证）" />
          <KV label="邮箱" value="zhang.ming@consumer-fin.example.com" span />
          <KV label="所属企业" value="某消费金融有限公司" />
          <KV label="部门 / 岗位" value="风险管理部 / 风控策略经理" />
          <KV label="工号" value="RC-20486" />
          <KV label="角色" value={<Tag kind="brand">风控管理员</Tag>} />
        </Grid>
      </Panel>

      <Panel title="第三方账号绑定" subtitle="用于消息推送、SSO 登录与组织架构同步">
        <div className="divide-y divide-slate-100">
          <Toggle label="企业微信" desc="已绑定（zhangming@corp）· 接收预警与工单通知" on />
          <Toggle label="钉钉" desc="未绑定 · 点击绑定后可同步组织架构" on={false} />
          <Toggle label="飞书" desc="已绑定 · 用于 SSO 单点登录" on />
        </div>
      </Panel>

      <Panel title="账户注销" subtitle="注销需企业管理员审批，避免数据归属风险">
        <p className="text-sm text-slate-500">
          注销后将解除当前账号与企业数据的关联。如有进行中的策略发布或工单，请先完成交接。
        </p>
        <button className="mt-3 rounded-lg border border-rose-200 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50">
          申请注销账户
        </button>
      </Panel>
    </div>
  ),
}

const profileSecurity: ModuleSpec = {
  title: '安全设置',
  crumb: '个人中心 / 安全设置',
  subtitle: '登录密码、多因素认证与风控场景增强。',
  custom: (
    <div className="space-y-6">
      <Panel title="登录密码" right={<button className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm text-white hover:bg-brand-700">修改密码</button>}>
        <Grid cols={2}>
          <KV label="最近修改时间" value="2026-05-20" />
          <KV label="密码策略" value={<Tag kind="green">符合强密码策略</Tag>} />
          <KV label="有效期" value="90 天（剩余 31 天）" span />
        </Grid>
      </Panel>

      <Panel title="多因素认证（MFA）">
        <div className="divide-y divide-slate-100">
          <Toggle label="短信验证码" desc="登录与敏感操作二次验证" on />
          <Toggle label="邮箱验证码" desc="未开启" on={false} />
          <Toggle label="TOTP 动态口令" desc="已绑定 authenticator 应用" on />
          <Toggle label="硬件 Key（FIDO2）" desc="未绑定" on={false} />
        </div>
      </Panel>

      <Panel title="风控场景增强">
        <div className="divide-y divide-slate-100">
          <Toggle label="异地登录拦截" desc="非常用地点登录需二次验证" on />
          <Toggle label="频繁登录锁定" desc="10 分钟内失败 5 次锁定 30 分钟" on />
          <Toggle label="登录异常提醒" desc="新设备 / 非常用 IP 登录推送通知" on />
          <Toggle label="API Key 管理入口" desc="跳转至 API 文档 > 应用管理" on />
        </div>
      </Panel>
    </div>
  ),
}

const profileDevices: ModuleSpec = {
  title: '登录设备管理',
  crumb: '个人中心 / 登录设备管理',
  subtitle: '查看已登录设备，支持单点踢出与全部下线，可疑设备将被标记。',
  columns: [
    { key: 'device', label: '设备 / 浏览器' },
    { key: 'time', label: '登录时间', align: 'right' },
    { key: 'ip', label: 'IP', align: 'right' },
    { key: 'loc', label: '地点', align: 'right' },
    { key: 'status', label: '状态', align: 'right' },
  ],
  rows: [
    { id: 'd1', device: 'Chrome · macOS', time: '2026-07-19 09:12', ip: '120.85.*.*', loc: '上海', status: { v: '当前设备', kind: 'brand' } },
    { id: 'd2', device: 'Safari · iPhone', time: '2026-07-18 21:40', ip: '117.36.*.*', loc: '杭州', status: { v: '已信任', kind: 'green' } },
    { id: 'd3', device: '企业微信内置浏览器', time: '2026-07-15 14:03', ip: '36.110.*.*', loc: '北京', status: { v: '已下线', kind: 'gray' } },
    { id: 'd4', device: '未知 Android 设备', time: '2026-07-12 03:21', ip: '45.13.*.*', loc: '境外', status: { v: '可疑·已拦截', kind: 'red' } },
  ],
  note: '登录轨迹支持查询最近 90 天；可疑设备已自动拦截并告警至安全运营。',
}

/* ===================== 消息通知 ===================== */

type Msg = { id: string; time: string; type: string; title: string; sub?: string; read: boolean }
const messages: Msg[] = [
  { id: 'm1', time: '2026-07-19 08:30', type: '预警', title: '贷中监控红灯预警：客户 张*', sub: '零售信贷风控 · 建议预催/降额', read: false },
  { id: 'm2', time: '2026-07-19 07:55', type: '预警', title: '智信分模型 PSI 偏移超阈值', sub: '评分产品 · 监控中心', read: false },
  { id: 'm3', time: '2026-07-18 18:02', type: '系统', title: '决策流「现金贷贷前 v2」发布成功', sub: '零售信贷风控 · 策略中心', read: true },
  { id: 'm4', time: '2026-07-18 10:15', type: '工单', title: '工单 T-20931 已完结', sub: '工单与支持', read: true },
  { id: 'm5', time: '2026-07-17 16:40', type: '审批', title: '成员「李雷」角色调整待你审批', sub: '企业设置 · 角色与权限', read: false },
  { id: 'm6', time: '2026-07-16 09:00', type: '运营', title: '7 月风控运营月报已生成', sub: '统计报表', read: true },
]

function MsgCenter() {
  const [tab, setTab] = useState<string>('all')
  const list = tab === 'all' ? messages : messages.filter((m) => m.type === tab)
  return (
    <div className="space-y-4">
      <Tabs
        tabs={[
          { key: 'all', label: '全部' },
          { key: '预警', label: '预警' },
          { key: '系统', label: '系统' },
          { key: '工单', label: '工单' },
          { key: '审批', label: '审批' },
          { key: '运营', label: '运营' },
        ]}
        active={tab}
        onChange={setTab}
      />
      <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
        {list.map((m) => (
          <button key={m.id} className="flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-slate-50">
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${m.read ? 'bg-slate-200' : 'bg-brand-500'}`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Tag kind={m.type === '预警' ? 'red' : m.type === '审批' ? 'amber' : 'gray'}>{m.type}</Tag>
                <p className={`truncate text-sm ${m.read ? 'text-slate-600' : 'font-medium text-ink-900'}`}>{m.title}</p>
              </div>
              {m.sub && <p className="mt-1 truncate text-xs text-slate-400">{m.sub}</p>}
            </div>
            <span className="shrink-0 text-xs text-slate-400">{m.time.slice(5, 16)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

const notifyCenter: ModuleSpec = {
  title: '消息中心',
  crumb: '消息通知 / 消息中心',
  subtitle: '全部消息按时间倒序，支持分类筛选、已读/删除，点击可跳转对应业务页面。',
  custom: <MsgCenter />,
}

const notifyAlert: ModuleSpec = {
  title: '预警消息',
  crumb: '消息通知 / 预警消息',
  subtitle: '来自贷中监控红黄灯与评分模型稳定性偏移的预警推送。',
  columns: [
    { key: 'time', label: '时间', align: 'right' },
    { key: 'src', label: '来源子系统' },
    { key: 'obj', label: '风险对象' },
    { key: 'level', label: '等级', align: 'right' },
    { key: 'status', label: '状态', align: 'right' },
    { key: 'op', label: '快捷处置', align: 'right' },
  ],
  rows: [
    { id: 'a1', time: '2026-07-19 08:30', src: '零售信贷风控', obj: '张*（3201**********1234）', level: { v: '红', kind: 'red' }, status: { v: '待处理', kind: 'amber' }, op: '查看 / 转人工' },
    { id: 'a2', time: '2026-07-19 07:55', src: '评分产品', obj: '智信分模型 PSI 偏移', level: { v: '黄', kind: 'amber' }, status: { v: '已处理', kind: 'green' }, op: '查看' },
    { id: 'a3', time: '2026-07-18 22:11', src: '零售信贷风控', obj: '李*（贷款申请 #AP-7782）', level: { v: '黄', kind: 'amber' }, status: { v: '待处理', kind: 'amber' }, op: '查看 / 转人工' },
  ],
}

const notifyAnnounce: ModuleSpec = {
  title: '系统公告',
  crumb: '消息通知 / 系统公告',
  subtitle: '平台级与租户级公告，已读确认用于审计留痕。',
  columns: [
    { key: 'time', label: '发布时间', align: 'right' },
    { key: 'title', label: '标题' },
    { key: 'scope', label: '范围', align: 'right' },
    { key: 'read', label: '阅读状态', align: 'right' },
  ],
  rows: [
    { id: 'n1', time: '2026-07-18', title: '关于贷中监控红黄灯策略升级的通知', scope: { v: '全平台', kind: 'gray' }, read: { v: '已读', kind: 'green' } },
    { id: 'n2', time: '2026-07-10', title: 'v2.3.0 版本发布说明（决策流编排优化）', scope: { v: '全平台', kind: 'gray' }, read: { v: '未读', kind: 'amber' } },
    { id: 'n3', time: '2026-07-02', title: '《数据安全与个人信息保护合规政策》更新', scope: { v: '本企业', kind: 'brand' }, read: { v: '已读', kind: 'green' } },
  ],
}

const notifyPref: ModuleSpec = {
  title: '通知偏好设置',
  crumb: '消息通知 / 通知偏好设置',
  subtitle: '按消息类型配置接收渠道，支持免打扰时段与保留策略。',
  custom: (
    <div className="space-y-6">
      <Panel title="消息渠道">
        <div className="divide-y divide-slate-100">
          <Toggle label="站内信" desc="所有消息类型默认开启" on />
          <Toggle label="邮件" desc="预警、工单、系统公告" on />
          <Toggle label="短信" desc="仅紧急预警与工单状态变更" on />
          <Toggle label="企微 / 钉钉 / 飞书机器人" desc="预警优先推送" on />
        </div>
      </Panel>
      <Panel title="其他策略">
        <div className="divide-y divide-slate-100">
          <Toggle label="免打扰时段" desc="22:00 - 08:00 仅保留站内信" on />
          <Toggle label="消息保留策略" desc="站内信保留 180 天" on />
        </div>
      </Panel>
    </div>
  ),
}

export const specsA: Record<string, ModuleSpec> = {
  'profile:account': profileAccount,
  'profile:security': profileSecurity,
  'profile:devices': profileDevices,
  'notify:center': notifyCenter,
  'notify:alert': notifyAlert,
  'notify:announce': notifyAnnounce,
  'notify:pref': notifyPref,
}
