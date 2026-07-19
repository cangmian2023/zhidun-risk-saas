import { useState } from 'react'
import type { ModuleSpec } from '../console/menus'
import { Panel, KV, Grid, CodeBlock, Timeline, Steps, Toggle, Tabs, Tag } from './widgets'
import { SelectField } from '../components/ui'

/* ===================== 工单与支持 ===================== */

const ticketNew: ModuleSpec = {
  title: '提交工单',
  crumb: '工单与支持 / 提交工单',
  subtitle: '选择问题类型并提交，工单号将通过短信 / 企微通知。',
  custom: (
    <Panel title="工单表单">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <div className="mb-1.5 text-sm text-slate-600">工单类型</div>
          <SelectField
            label="工单类型"
            defaultValue="产品使用问题"
            options={[
              { value: '产品使用问题', label: '产品使用问题' },
              { value: '数据问题', label: '数据问题' },
              { value: '账户权限问题', label: '账户权限问题' },
              { value: '商务与账单问题', label: '商务与账单问题' },
              { value: '安全与合规问题', label: '安全与合规问题' },
            ]}
          />
        </div>
        <div>
          <div className="mb-1.5 text-sm text-slate-600">优先级</div>
          <SelectField
            label="优先级"
            defaultValue="中"
            options={[
              { value: '中', label: '中' },
              { value: '低', label: '低' },
              { value: '高', label: '高' },
              { value: '紧急', label: '紧急' },
            ]}
          />
        </div>
        <label className="block sm:col-span-2">
          <span className="text-sm text-slate-600">标题</span>
          <input className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-ink-900" placeholder="一句话描述问题" />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm text-slate-600">问题描述</span>
          <textarea rows={4} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-ink-900" placeholder="请附上复现步骤、接口请求 ID 或报错截图（敏感数据将自动脱敏）" />
        </label>
        <label className="block">
          <span className="text-sm text-slate-600">关联业务 / 进件编号</span>
          <input className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-ink-900" placeholder="如 AP-7782 或接口请求 ID" />
        </label>
        <label className="block">
          <span className="text-sm text-slate-600">附件</span>
          <div className="mt-1.5 flex h-[42px] items-center rounded-lg border border-dashed border-slate-300 px-3 text-xs text-slate-400">
            点击上传截图 / 日志 / 报文（敏感字段自动脱敏）
          </div>
        </label>
      </div>
      <div className="mt-5 flex gap-3">
        <button className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-700">提交工单</button>
        <button className="rounded-lg border border-slate-200 px-5 py-2 text-sm text-slate-600 hover:bg-slate-50">存草稿</button>
      </div>
    </Panel>
  ),
}

type Ticket = { id: string; type: string; title: string; status: string; pri: string; created: string; updated: string }
const tickets: Ticket[] = [
  { id: 'T-20931', type: '数据问题', title: '智信分批量接口部分返回超时', status: '已完结', pri: '高', created: '2026-07-14', updated: '2026-07-18' },
  { id: 'T-20945', type: '产品使用', title: '决策流发布后规则未生效', status: '处理中', pri: '紧急', created: '2026-07-17', updated: '2026-07-19' },
  { id: 'T-20950', type: '账户权限', title: '分析师无法查看企业设置菜单', status: '待处理', pri: '中', created: '2026-07-18', updated: '2026-07-18' },
  { id: 'T-20952', type: '商务账单', title: '本月 API 调用量预警确认', status: '待处理', pri: '低', created: '2026-07-19', updated: '2026-07-19' },
]

function TicketList() {
  const [tab, setTab] = useState<string>('all')
  const list = tab === 'all' ? tickets : tickets.filter((t) => t.status === tab)
  const statusKind: Record<string, string> = { 已完结: 'green', 处理中: 'brand', 待处理: 'amber', 已关闭: 'gray' }
  const priKind: Record<string, string> = { 紧急: 'red', 高: 'amber', 中: 'gray', 低: 'gray' }
  return (
    <div className="space-y-4">
      <Tabs
        tabs={[
          { key: 'all', label: '全部' },
          { key: '待处理', label: '待处理' },
          { key: '处理中', label: '处理中' },
          { key: '已完结', label: '已完结' },
        ]}
        active={tab}
        onChange={setTab}
      />
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-400">
            <tr>
              <th className="px-5 py-3 text-left font-medium">工单号</th>
              <th className="px-5 py-3 text-left font-medium">类型</th>
              <th className="px-5 py-3 text-left font-medium">标题</th>
              <th className="px-5 py-3 text-right font-medium">优先级</th>
              <th className="px-5 py-3 text-right font-medium">状态</th>
              <th className="px-5 py-3 text-right font-medium">最近更新</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-5 py-3 font-mono text-ink-900">{t.id}</td>
                <td className="px-5 py-3 text-slate-600">{t.type}</td>
                <td className="px-5 py-3 text-slate-600">{t.title}</td>
                <td className="px-5 py-3 text-right"><Tag kind={priKind[t.pri]}>{t.pri}</Tag></td>
                <td className="px-5 py-3 text-right"><Tag kind={statusKind[t.status]}>{t.status}</Tag></td>
                <td className="px-5 py-3 text-right text-slate-400">{t.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const ticketList: ModuleSpec = {
  title: '我的工单',
  crumb: '工单与支持 / 我的工单',
  subtitle: '按状态筛选，支持催单、补充与关闭。',
  custom: <TicketList />,
}

const ticketDetail: ModuleSpec = {
  title: '工单详情',
  crumb: '工单与支持 / 工单详情',
  subtitle: 'T-20945 · 紧急 · 处理中',
  custom: (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Panel title="处理进度">
          <Timeline
            items={[
              { time: '2026-07-17 14:02', title: '已受理', desc: '客服分配至风控支持组' },
              { time: '2026-07-17 15:20', title: '诊断中', desc: '复现决策流发布流程，定位缓存未刷新' },
              { time: '2026-07-18 10:11', title: '处理中', desc: '已发布热修复，等待客户确认' },
              { time: '2026-07-19 09:30', title: '等待客户确认', desc: '请验证规则是否生效' },
            ]}
          />
        </Panel>
        <Panel title="沟通记录">
          <div className="space-y-3">
            <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">客户：发布后规则没生效，麻烦尽快看下。</div>
            <div className="rounded-xl bg-brand-50 p-3 text-sm text-brand-800">客服：已定位为缓存刷新延迟，热修复已推送，请重新发布一次决策流验证。</div>
          </div>
          <div className="mt-4 flex gap-2">
            <input className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="补充说明…" />
            <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700">发送</button>
          </div>
        </Panel>
      </div>
      <div className="space-y-6">
        <Panel title="基本信息">
          <Grid cols={2}>
            <KV label="工单号" value="T-20945" />
            <KV label="状态" value={<Tag kind="brand">处理中</Tag>} />
            <KV label="类型" value="产品使用问题" span />
            <KV label="优先级" value={<Tag kind="red">紧急</Tag>} />
            <KV label="提交时间" value="2026-07-17 14:02" />
          </Grid>
        </Panel>
        <Panel title="满意度">
          <p className="text-sm text-slate-400">工单完结后可进行五星评价。</p>
        </Panel>
      </div>
    </div>
  ),
}

const ticketFaq: ModuleSpec = {
  title: '常见问题',
  crumb: '工单与支持 / 常见问题',
  subtitle: '自助排查高频问题，未解决可一键转工单。',
  custom: (
    <div className="space-y-3">
      {[
        { q: '无法登录控制台？', a: '请确认账号未被禁用，或通过「个人中心-安全设置」重置密码；企业微信/飞书 SSO 需先由管理员绑定。' },
        { q: '接口返回 40002 签名无效？', a: '检查 HMAC-SHA256 签名的时间戳与参数排序，确保使用最新 AppSecret，且服务器时间误差 < 5 分钟。' },
        { q: '决策报告为何缺少某项评分？', a: '可能该进件未命中对应评分产品调用条件，或接口权限未开通，请在「API 文档-应用管理」确认权限范围。' },
        { q: '如何查看调用账单？', a: '前往「企业设置-计费与套餐」查看 API 调用次数与套餐余量。' },
      ].map((f, i) => (
        <Panel key={i} title={f.q}>
          <p className="text-sm leading-relaxed text-slate-600">{f.a}</p>
        </Panel>
      ))}
    </div>
  ),
}

/* ===================== API 文档 ===================== */

const apiStart: ModuleSpec = {
  title: '快速入门',
  crumb: 'API 文档 / 快速入门',
  subtitle: '从注册企业到调通第一个接口的接入流程。',
  custom: (
    <div className="space-y-6">
      <Panel title="接入流程">
        <Steps items={['注册企业账号', '创建应用', '获取 AK/SK', '鉴权获取 Token', '调通第一个接口']} />
      </Panel>
      <Panel title="示例代码（Python）" subtitle="沙箱环境 base_url=https://sandbox.risk-cloud.example.com">
        <CodeBlock
          code={`import requests
app_key = "AK2026****************"
app_secret = "************************"
# 1) 获取 AccessToken
r = requests.post(f"{base_url}/oauth/token", json={
    "appKey": app_key, "appSecret": app_secret})
token = r.json()["data"]["accessToken"]
# 2) 调用智信分评分
r = requests.post(f"{base_url}/v1/scoring/zhixin/query",
    headers={"Authorization": f"Bearer {token}"},
    json={"name":"张*","idNo":"3201**********1234","mobile":"138****5678"})
print(r.json())`}
        />
      </Panel>
    </div>
  ),
}

const apiApps: ModuleSpec = {
  title: '应用管理',
  crumb: 'API 文档 / 应用管理',
  subtitle: '管理调用方应用、密钥与接口权限范围。',
  custom: (
    <div className="space-y-6">
      <Panel title="应用列表">
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left font-medium">应用名称</th>
                <th className="px-4 py-3 text-left font-medium">AppKey</th>
                <th className="px-4 py-3 text-left font-medium">状态</th>
                <th className="px-4 py-3 text-right font-medium">接口权限</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr><td className="px-4 py-3 text-ink-900">生产环境-核心信贷</td><td className="px-4 py-3 font-mono text-slate-500">AK2026…c81f</td><td className="px-4 py-3"><Tag kind="green">启用</Tag></td><td className="px-4 py-3 text-right text-slate-500">贷前+评分</td></tr>
              <tr><td className="px-4 py-3 text-ink-900">沙箱-联调测试</td><td className="px-4 py-3 font-mono text-slate-500">AK2026…7a02</td><td className="px-4 py-3"><Tag kind="green">启用</Tag></td><td className="px-4 py-3 text-right text-slate-500">全部（沙箱）</td></tr>
              <tr><td className="px-4 py-3 text-ink-900">渠道合作方-A</td><td className="px-4 py-3 font-mono text-slate-500">AK2026…b319</td><td className="px-4 py-3"><Tag kind="gray">已禁用</Tag></td><td className="px-4 py-3 text-right text-slate-500">仅贷前核验</td></tr>
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="创建应用">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label className="block"><span className="text-sm text-slate-600">应用名称</span><input className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="如 生产环境-核心信贷" /></label>
          <label className="block"><span className="text-sm text-slate-600">业务场景</span><input className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="如 消费分期贷前审核" /></label>
          <label className="block sm:col-span-2"><span className="text-sm text-slate-600">回调地址（Callback URL）</span><input className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="https://your-domain.example.com/callback" /></label>
        </div>
        <button className="mt-4 rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-700">创建并生成 AK/SK</button>
      </Panel>
    </div>
  ),
}

const apiAuth: ModuleSpec = {
  title: '鉴权说明',
  crumb: 'API 文档 / 鉴权说明',
  subtitle: 'AccessToken 与 Signature 双机制，HMAC-SHA256 防重放。',
  custom: (
    <div className="space-y-6">
      <Panel title="AccessToken 机制">
        <p className="mb-3 text-sm text-slate-600">通过 AppKey/AppSecret 换取，有效期 2 小时，建议服务端缓存并自动刷新。</p>
        <CodeBlock code={`POST /oauth/token
Content-Type: application/json
{ "appKey": "AK...", "appSecret": "SK..." }
→ { "accessToken": "eyJ...", "expiresIn": 7200 }`} />
      </Panel>
      <Panel title="Signature 签名机制（HMAC-SHA256）">
        <ol className="list-decimal space-y-1.5 pl-5 text-sm text-slate-600">
          <li>对所有业务参数按 key 升序排序并拼接。</li>
          <li>拼接待签名串 = 排序串 + 时间戳 + nonce。</li>
          <li>使用 AppSecret 进行 HMAC-SHA256 得到 signature。</li>
          <li>请求头携带 Authorization、X-Timestamp、X-Nonce、X-Signature。</li>
        </ol>
      </Panel>
      <Panel title="常见错误码">
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Tag kind="red">40001 参数错误</Tag>
          <Tag kind="red">40002 签名无效</Tag>
          <Tag kind="amber">40003 权限不足</Tag>
          <Tag kind="amber">40004 调用频次超限</Tag>
        </div>
      </Panel>
    </div>
  ),
}

const apiCatalog: ModuleSpec = {
  title: '接口目录',
  crumb: 'API 文档 / 接口目录',
  subtitle: '按业务子系统分类的接口清单（示例为 v1）。',
  columns: [
    { key: 'method', label: '方法', width: '90px' },
    { key: 'path', label: '路径' },
    { key: 'desc', label: '功能简述' },
    { key: 'perm', label: '权限要求', align: 'right' },
  ],
  rows: [
    { id: 'i1', method: { v: 'POST', kind: 'green' }, path: '/v1/credit/pre-application', desc: '零售信贷贷前进件风险评估', perm: '贷前审核' },
    { id: 'i2', method: { v: 'POST', kind: 'green' }, path: '/v1/scoring/zhixin/query', desc: '智信分评分查询', perm: '评分产品' },
    { id: 'i3', method: { v: 'POST', kind: 'green' }, path: '/v1/monitor/mid-alert', desc: '贷中红黄灯预警查询', perm: '贷中监控' },
    { id: 'i4', method: { v: 'GET', kind: 'gray' }, path: '/v1/scoring/models', desc: '评分模型列表', perm: '模型管理' },
  ],
}

const apiDetail: ModuleSpec = {
  title: '接口详情',
  crumb: 'API 文档 / 接口详情',
  subtitle: '智信分评分查询 · POST /v1/scoring/zhixin/query',
  custom: (
    <div className="space-y-6">
      <Panel title="请求参数">
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-400"><tr><th className="px-4 py-3 text-left font-medium">字段</th><th className="px-4 py-3 text-left font-medium">类型</th><th className="px-4 py-3 text-left font-medium">说明</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              <tr><td className="px-4 py-3 font-mono text-ink-900">name</td><td className="px-4 py-3 text-slate-500">string</td><td className="px-4 py-3 text-slate-600">姓名（脱敏）</td></tr>
              <tr><td className="px-4 py-3 font-mono text-ink-900">idNo</td><td className="px-4 py-3 text-slate-500">string</td><td className="px-4 py-3 text-slate-600">身份证号（加密传输）</td></tr>
              <tr><td className="px-4 py-3 font-mono text-ink-900">mobile</td><td className="px-4 py-3 text-slate-500">string</td><td className="px-4 py-3 text-slate-600">手机号</td></tr>
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="请求 / 响应示例">
        <CodeBlock code={`// 请求
{ "name":"张*", "idNo":"3201**********1234", "mobile":"138****5678" }
// 响应
{ "code":0, "data": { "score": 712, "riskLevel": "低",
  "factors": [{"name":"历史逾期","contribution":-18}] } }`} />
      </Panel>
    </div>
  ),
}

const apiLogs: ModuleSpec = {
  title: '调用日志',
  crumb: 'API 文档 / 调用日志',
  subtitle: '按应用、接口、状态码筛选，错误日志高亮。',
  columns: [
    { key: 'reqId', label: '请求 ID', width: '150px' },
    { key: 'time', label: '时间', align: 'right' },
    { key: 'api', label: '接口' },
    { key: 'cost', label: '耗时', align: 'right' },
    { key: 'code', label: '状态码', align: 'right' },
  ],
  rows: [
    { id: 'l1', reqId: 'req_8f21a', time: '09:12:01', api: '/v1/scoring/zhixin/query', cost: '86ms', code: { v: '200', kind: 'green' } },
    { id: 'l2', reqId: 'req_8f21b', time: '09:11:58', api: '/v1/credit/pre-application', cost: '142ms', code: { v: '200', kind: 'green' } },
    { id: 'l3', reqId: 'req_8f21c', time: '09:10:33', api: '/v1/scoring/zhixin/query', cost: '53ms', code: { v: '40003', kind: 'red' } },
    { id: 'l4', reqId: 'req_8f21d', time: '09:09:12', api: '/v1/credit/pre-application', cost: '201ms', code: { v: '40004', kind: 'amber' } },
  ],
  note: '调用量统计：近 24h 共 1,284,902 次，成功率 99.82%。',
}

const apiWebhook: ModuleSpec = {
  title: 'Webhook 配置',
  crumb: 'API 文档 / Webhook 配置',
  subtitle: '订阅事件并接收推送，支持验签与失败重试。',
  custom: (
    <div className="space-y-6">
      <Panel title="事件订阅">
        <div className="divide-y divide-slate-100">
          <Toggle label="贷前决策结果" desc="进件审核完成后推送" on />
          <Toggle label="贷中红黄灯预警" desc="预警触发实时推送" on />
          <Toggle label="评分结果" desc="批量 / 单笔评分完成推送" on={false} />
          <Toggle label="模型监控告警" desc="PSI/CSI 偏移告警" on />
        </div>
      </Panel>
      <Panel title="推送地址与验签">
        <Grid cols={2}>
          <KV label="推送 URL" value="https://your-domain.example.com/hook" span />
          <KV label="验签密钥" value="whk_****************" />
          <KV label="重试策略" value="失败 3 次 / 指数退避" />
        </Grid>
      </Panel>
    </div>
  ),
}

export const specsB: Record<string, ModuleSpec> = {
  'ticket:new': ticketNew,
  'ticket:list': ticketList,
  'ticket:detail': ticketDetail,
  'ticket:faq': ticketFaq,
  'apidoc:start': apiStart,
  'apidoc:apps': apiApps,
  'apidoc:auth': apiAuth,
  'apidoc:catalog': apiCatalog,
  'apidoc:detail': apiDetail,
  'apidoc:logs': apiLogs,
  'apidoc:webhook': apiWebhook,
}
