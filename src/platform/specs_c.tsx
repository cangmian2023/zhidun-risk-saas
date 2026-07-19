import { useState } from 'react'
import type { ModuleSpec } from '../console/menus'
import { Panel, KV, Grid, Steps, Toggle, Tabs, Tag } from './widgets'

/* ===================== 帮助中心 ===================== */

const helpGuide: ModuleSpec = {
  title: '新手指南',
  crumb: '帮助中心 / 新手指南',
  subtitle: '首次使用流程与关键术语。',
  custom: (
    <div className="space-y-6">
      <Panel title="首次使用流程">
        <Steps items={['开通企业账号', '配置角色权限', '接入 API', '配置业务策略', '查看监控']} />
      </Panel>
      <Panel title="关键术语">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            ['进件', '一笔借贷申请及其附属材料'],
            ['决策流', '由规则、评分、名单编排的自动化审批链路'],
            ['评分卡', '将特征映射为分数的模型文件'],
            ['PSI', '群体稳定性指标，衡量特征分布漂移'],
            ['CSI', '特征稳定性指数'],
            ['红黄灯', '贷中风险综合预警等级'],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl border border-slate-100 px-4 py-3">
              <p className="text-sm font-medium text-ink-900">{t}</p>
              <p className="mt-1 text-xs text-slate-500">{d}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  ),
}

const helpManual: ModuleSpec = {
  title: '产品手册',
  crumb: '帮助中心 / 产品手册',
  subtitle: '按业务子系统分册，支持 PDF 下载与在线检索。',
  columns: [
    { key: 'sub', label: '子系统' },
    { key: 'name', label: '手册章节' },
    { key: 'pages', label: '页数', align: 'right' },
    { key: 'op', label: '操作', align: 'right' },
  ],
  rows: [
    { id: 'm1', sub: '零售信贷风控', name: '贷前审核 · 策略配置示例', pages: 42, op: '在线阅读 / PDF' },
    { id: 'm2', sub: '零售信贷风控', name: '贷中监控 · 监测任务配置', pages: 36, op: '在线阅读 / PDF' },
    { id: 'm3', sub: '评分产品', name: '智信分 · 评分卡说明', pages: 28, op: '在线阅读 / PDF' },
    { id: 'm4', sub: '企业风控', name: '（规划中）', pages: 0, op: '敬请期待' },
  ],
}

const helpTutorial: ModuleSpec = {
  title: '快速操作教程',
  crumb: '帮助中心 / 快速操作教程',
  subtitle: '图文步骤，支持一键跳转对应功能页面。',
  columns: [
    { key: 'title', label: '教程' },
    { key: 'step', label: '步骤数', align: 'right' },
    { key: 'time', label: '预计耗时', align: 'right' },
    { key: 'op', label: '操作', align: 'right' },
  ],
  rows: [
    { id: 't1', title: '如何配置一条反欺诈规则', step: 6, time: '5 分钟', op: '开始' },
    { id: 't2', title: '如何查看决策报告', step: 4, time: '3 分钟', op: '开始' },
    { id: 't3', title: '如何创建贷中监测任务', step: 7, time: '8 分钟', op: '开始' },
  ],
}

const helpFaq: ModuleSpec = {
  title: '常见问题 FAQ',
  crumb: '帮助中心 / 常见问题',
  subtitle: '按分类检索，未解决可一键转工单。',
  custom: (
    <div className="space-y-3">
      {[
        { q: '账户类：忘记密码如何找回？', a: '在登录页点击「忘记密码」，通过已绑定的手机号或邮箱验证后重置；企业管理员也可在「企业设置-成员管理」强制重置。' },
        { q: 'API 类：Token 过期频繁？', a: 'AccessToken 有效期 2 小时，建议服务端统一缓存并在过期前 5 分钟静默刷新，避免每次请求都换取。' },
        { q: '数据类：身份证/手机号为何是脱敏的？', a: '金融风控合规要求对敏感字段默认脱敏展示，导出与接口返回可按权限解密，操作全程留痕。' },
        { q: '策略类：决策流发布后规则未生效？', a: '多为缓存刷新延迟或发布未选「全量生效」，请参考工单 T-20945 的处理记录重发验证。' },
        { q: '安全合规：如何开启异地登录拦截？', a: '在「个人中心-安全设置」或「企业设置-安全策略」开启异地登录拦截与频繁登录锁定。' },
      ].map((f, i) => (
        <Panel key={i} title={f.q}>
          <p className="text-sm leading-relaxed text-slate-600">{f.a}</p>
        </Panel>
      ))}
    </div>
  ),
}

const helpBest: ModuleSpec = {
  title: '最佳实践',
  crumb: '帮助中心 / 最佳实践',
  subtitle: '行业案例与策略模板参考。',
  columns: [
    { key: 'cat', label: '行业' },
    { key: 'title', label: '实践主题' },
    { key: 'tag', label: '标签', align: 'right' },
  ],
  rows: [
    { id: 'b1', cat: '消费信贷', title: '反欺诈规则集（设备指纹+共债）', tag: { v: '策略模板', kind: 'brand' } },
    { id: 'b2', cat: '供应链金融', title: '企业信用评分阈值建议', tag: { v: '评分', kind: 'cyan' } },
    { id: 'b3', cat: '小微企业贷', title: '贷中预警分级处置 SOP', tag: { v: '贷中', kind: 'amber' } },
  ],
}

const helpChangelog: ModuleSpec = {
  title: '版本更新日志',
  crumb: '帮助中心 / 版本更新日志',
  subtitle: '版本号、发布时间与更新类型。',
  columns: [
    { key: 'ver', label: '版本', width: '110px' },
    { key: 'date', label: '时间', align: 'right', width: '120px' },
    { key: 'type', label: '类型', align: 'right', width: '110px' },
    { key: 'desc', label: '说明' },
  ],
  rows: [
    { id: 'v1', ver: 'v2.3.0', date: '2026-07-10', type: { v: '新增', kind: 'green' }, desc: '决策流编排支持并行分支与灰度发布' },
    { id: 'v2', ver: 'v2.2.1', date: '2026-06-21', type: { v: '优化', kind: 'brand' }, desc: '评分查询 P95 时延下降 28%' },
    { id: 'v3', ver: 'v2.2.0', date: '2026-05-30', type: { v: '新增', kind: 'green' }, desc: '贷中监控新增红黄灯信号明细还原' },
    { id: 'v4', ver: 'v2.1.2', date: '2026-05-08', type: { v: '修复', kind: 'amber' }, desc: '修复批量评分部分批次回调丢失' },
  ],
}

const helpVideo: ModuleSpec = {
  title: '视频学习中心',
  crumb: '帮助中心 / 视频学习中心',
  subtitle: '入门、进阶与行业案例课程。',
  custom: (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[
        ['入门', '10 分钟看懂信贷风控 SaaS', '12:30'],
        ['入门', '从 0 接入第一个 API', '08:45'],
        ['进阶', '决策流编排实战', '24:10'],
        ['进阶', '评分卡与特征工程', '31:22'],
        ['行业', '消费金融反欺诈体系', '18:05'],
        ['行业', '小微企业贷中监控', '15:50'],
      ].map(([cat, title, dur], i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="relative grid h-28 place-items-center bg-gradient-to-br from-brand-500 to-brand-700">
            <svg viewBox="0 0 24 24" className="h-10 w-10 text-white/90" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            <span className="absolute right-2 top-2 rounded bg-black/40 px-1.5 py-0.5 text-[11px] text-white">{dur}</span>
          </div>
          <div className="p-4">
            <Tag kind="gray">{cat}</Tag>
            <p className="mt-2 text-sm font-medium text-ink-900">{title}</p>
          </div>
        </div>
      ))}
    </div>
  ),
}

/* ===================== 企业设置 ===================== */

const entInfo: ModuleSpec = {
  title: '企业信息',
  crumb: '企业设置 / 企业信息',
  subtitle: '企业认证状态、租户信息与品牌自定义。',
  custom: (
    <div className="space-y-6">
      <Panel title="基本信息">
        <Grid cols={2}>
          <KV label="企业名称" value="某消费金融有限公司" />
          <KV label="统一社会信用代码" value="91310000********XD" />
          <KV label="行业类型" value="持牌消费金融" />
          <KV label="认证状态" value={<Tag kind="green">已认证</Tag>} />
          <KV label="租户 ID" value="TEN-88231" />
          <KV label="套餐版本" value="企业版 · 旗舰" />
          <KV label="到期时间" value="2027-03-31" />
          <KV label="管理员" value="张明 / 138****5678" />
        </Grid>
      </Panel>
      <Panel title="品牌自定义（可选）">
        <Grid cols={2}>
          <KV label="企业 Logo" value="已上传（48×48）" />
          <KV label="主题色" value={<span className="inline-block h-4 w-4 rounded bg-brand-600 align-middle" />} />
        </Grid>
      </Panel>
    </div>
  ),
}

function OrgPanel() {
  const [dept, setDept] = useState('risk')
  const depts = [
    { key: 'risk', name: '风险管理部', count: 12 },
    { key: 'ops', name: '运营部', count: 8 },
    { key: 'audit', name: '合规审计部', count: 4 },
  ]
  const members: Record<string, { name: string; account: string; role: string; status: string }[]> = {
    risk: [
      { name: '张明', account: 'admin', role: '风控管理员', status: '启用' },
      { name: '李雷', account: 'lilei', role: '风控分析师', status: '启用' },
      { name: '韩梅梅', account: 'hanmm', role: '风控分析师', status: '禁用' },
    ],
    ops: [
      { name: '王芳', account: 'wangf', role: '运营人员', status: '启用' },
    ],
    audit: [
      { name: '赵审计', account: 'zhaoa', role: '审计员', status: '启用' },
    ],
  }
  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <Panel title="部门（树形）" className="lg:col-span-1">
        <ul className="space-y-1 text-sm">
          {depts.map((d) => (
            <li key={d.key}>
              <button onClick={() => setDept(d.key)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left ${dept === d.key ? 'bg-brand-50 font-medium text-brand-700' : 'hover:bg-slate-50'}`}>
                <span>{d.name}</span>
                <span className="text-xs text-slate-400">{d.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel title="成员管理" subtitle="支持邀请、启用/禁用、重置密码与离职交接" className="lg:col-span-3">
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-400"><tr>
              <th className="px-4 py-3 text-left font-medium">姓名</th>
              <th className="px-4 py-3 text-left font-medium">账号</th>
              <th className="px-4 py-3 text-left font-medium">角色</th>
              <th className="px-4 py-3 text-right font-medium">状态</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {members[dept].map((m) => (
                <tr key={m.account} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-ink-900">{m.name}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{m.account}</td>
                  <td className="px-4 py-3 text-slate-600">{m.role}</td>
                  <td className="px-4 py-3 text-right"><Tag kind={m.status === '启用' ? 'green' : 'gray'}>{m.status}</Tag></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

const entOrg: ModuleSpec = {
  title: '组织架构',
  crumb: '企业设置 / 组织架构',
  subtitle: '部门与成员管理，支持离职交接与IM 组织架构同步。',
  custom: <OrgPanel />,
}

function RolePanel() {
  const [tab, setTab] = useState('roles')
  const perms = ['菜单可见', '查看', '创建', '编辑', '删除', '导出', '审批', '发布']
  const matrix: Record<string, boolean[]> = {
    '风控管理员': [true, true, true, true, true, true, true, true],
    '风控分析师': [true, true, true, true, false, true, false, false],
    '运营人员': [true, true, false, false, false, false, false, false],
    '审计员': [true, true, false, false, false, true, false, false],
    '普通用户': [true, true, false, false, false, false, false, false],
  }
  return (
    <div className="space-y-4">
      <Tabs tabs={[{ key: 'roles', label: '角色管理' }, { key: 'matrix', label: '权限矩阵' }]} active={tab} onChange={setTab} />
      {tab === 'roles' ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-400"><tr>
              <th className="px-5 py-3 text-left font-medium">预设角色</th>
              <th className="px-5 py-3 text-left font-medium">说明</th>
              <th className="px-5 py-3 text-right font-medium">成员数</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ['系统管理员', '租户最高权限，含企业设置', 1],
                ['风控管理员', '策略与模型配置、发布', 1],
                ['风控分析师', '规则查看与调参', 2],
                ['运营人员', '客群运营与报表', 1],
                ['审计员', '只读审计与日志', 1],
                ['普通用户', '基础查看权限', 6],
              ].map(([r, d, n]) => (
                <tr key={r as string} className="hover:bg-slate-50">
                  <td className="px-5 py-3 text-ink-900">{r}</td>
                  <td className="px-5 py-3 text-slate-600">{d}</td>
                  <td className="px-5 py-3 text-right text-slate-500">{n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-400"><tr>
              <th className="px-4 py-3 text-left font-medium">角色 \ 权限</th>
              {perms.map((p) => <th key={p} className="px-3 py-3 text-center font-medium">{p}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(matrix).map(([role, arr]) => (
                <tr key={role}>
                  <td className="px-4 py-3 text-ink-900">{role}</td>
                  {arr.map((v, i) => (
                    <td key={i} className="px-3 py-3 text-center">{v ? <span className="text-brand-600">●</span> : <span className="text-slate-300">○</span>}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-slate-400">数据权限：支持按「全部 / 本部门及子部门 / 本部门 / 本人 / 指定范围」隔离，敏感字段（身份证、手机号、银行卡）强制脱敏。</p>
    </div>
  )
}

const entRole: ModuleSpec = {
  title: '角色与权限',
  crumb: '企业设置 / 角色与权限',
  subtitle: 'RBAC 角色、操作权限与行级数据权限。',
  custom: <RolePanel />,
}

const entChannel: ModuleSpec = {
  title: '渠道与产品',
  crumb: '企业设置 / 渠道与产品',
  subtitle: '管理业务渠道、信贷产品与事件，密钥按渠道隔离。',
  columns: [
    { key: 'channel', label: '渠道' },
    { key: 'product', label: '关联产品' },
    { key: 'event', label: '事件' },
    { key: 'status', label: '状态', align: 'right' },
  ],
  rows: [
    { id: 'c1', channel: 'App（iOS/Android）', product: '现金贷 / 消费分期', event: '进件、放款、还款', status: { v: '启用', kind: 'green' } },
    { id: 'c2', channel: 'H5 / 小程序', product: '消费分期', event: '进件、还款', status: { v: '启用', kind: 'green' } },
    { id: 'c3', channel: '线下网点', product: '小微企业贷', event: '进件、放款', status: { v: '启用', kind: 'green' } },
    { id: 'c4', channel: '合作方 API', product: '联合贷', event: '进件（回流）', status: { v: '待审批', kind: 'amber' } },
  ],
}

const entAudit: ModuleSpec = {
  title: '审计日志',
  crumb: '企业设置 / 审计日志',
  subtitle: '操作、登录与数据访问日志，支持 180 天追溯。',
  columns: [
    { key: 'time', label: '时间', align: 'right', width: '150px' },
    { key: 'user', label: '操作人' },
    { key: 'action', label: '行为' },
    { key: 'result', label: '结果', align: 'right' },
  ],
  rows: [
    { id: 'a1', time: '2026-07-19 09:12', user: '张明', action: '发布决策流「现金贷贷前 v2」', result: { v: '成功', kind: 'green' } },
    { id: 'a2', time: '2026-07-19 08:55', user: '李雷', action: '导出命中规则统计', result: { v: '成功', kind: 'green' } },
    { id: 'a3', time: '2026-07-18 23:40', user: '未知', action: '异地登录（境外 IP）', result: { v: '已拦截', kind: 'red' } },
    { id: 'a4', time: '2026-07-18 21:10', user: '韩梅梅', action: '查看客户 张* 决策报告', result: { v: '成功', kind: 'green' } },
  ],
  note: '异常行为告警：批量导出、非工作时间登录、异常 IP 将触发安全运营通知。',
}

const entSecurity: ModuleSpec = {
  title: '安全策略',
  crumb: '企业设置 / 安全策略',
  subtitle: '密码、登录、会话与接口安全策略。',
  custom: (
    <div className="space-y-6">
      <Panel title="密码策略">
        <div className="divide-y divide-slate-100">
          <Toggle label="最小长度 12 位" desc="含大小写、数字与符号" on />
          <Toggle label="有效期 90 天" desc="到期强制修改" on />
          <Toggle label="历史密码限制" desc="不得与最近 5 次相同" on />
        </div>
      </Panel>
      <Panel title="登录与会话">
        <div className="divide-y divide-slate-100">
          <Toggle label="失败锁定" desc="10 分钟失败 5 次锁定 30 分钟" on />
          <Toggle label="异地登录拦截" desc="非常用地点需二次验证" on />
          <Toggle label="单点登录互踢" desc="新设备登录踢出旧设备" on />
          <Toggle label="最大在线时长" desc="8 小时强制重新鉴权" on />
        </div>
      </Panel>
      <Panel title="接口与数据安全">
        <div className="divide-y divide-slate-100">
          <Toggle label="API IP 白名单" desc="仅放行授信 IP" on />
          <Toggle label="签名算法强制" desc="HMAC-SHA256 防重放" on />
          <Toggle label="敏感字段脱敏" desc="身份证/手机号/银行卡默认脱敏" on />
          <Toggle label="下载审批" desc="批量导出需审批" on />
        </div>
      </Panel>
    </div>
  ),
}

const entBilling: ModuleSpec = {
  title: '计费与套餐',
  crumb: '企业设置 / 计费与套餐',
  subtitle: '资源用量、账单与套餐升级。',
  custom: (
    <div className="space-y-6">
      <Panel title="本月资源用量">
        <Grid cols={4}>
          <KV label="API 调用" value="1,284,902 / 2,000,000" />
          <KV label="数据存储" value="312 GB / 500 GB" />
          <KV label="模型训练" value="18 / 50 次" />
          <KV label="计算资源" value="76%" />
        </Grid>
      </Panel>
      <Panel title="套餐" right={<button className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm text-white hover:bg-brand-700">升级/续费</button>}>
        <Grid cols={2}>
          <KV label="当前版本" value="企业版 · 旗舰" />
          <KV label="到期时间" value="2027-03-31" />
          <KV label="用量预警" value={<Tag kind="amber">接近阈值（API 64%）</Tag>} span />
        </Grid>
      </Panel>
    </div>
  ),
}

export const specsC: Record<string, ModuleSpec> = {
  'help:guide': helpGuide,
  'help:manual': helpManual,
  'help:tutorial': helpTutorial,
  'help:faq': helpFaq,
  'help:best': helpBest,
  'help:changelog': helpChangelog,
  'help:video': helpVideo,
  'ent:info': entInfo,
  'ent:org': entOrg,
  'ent:role': entRole,
  'ent:channel': entChannel,
  'ent:audit': entAudit,
  'ent:security': entSecurity,
  'ent:billing': entBilling,
}
