import type { ModuleSpec } from '../console/menus'

export interface PMenuItem { label: string; key: string }
export interface PMenuGroup { group: string; items: PMenuItem[] }

export const platformModules: { key: string; name: string; desc: string }[] = [
  { key: 'profile', name: '个人中心', desc: '账户资料、安全设置、登录设备管理' },
  { key: 'notify', name: '消息通知', desc: '消息中心、预警消息、系统公告、偏好设置' },
  { key: 'ticket', name: '工单与支持', desc: '提交工单、我的工单、常见问题' },
  { key: 'apidoc', name: 'API 文档', desc: '快速入门、应用管理、鉴权、接口目录' },
  { key: 'help', name: '帮助中心', desc: '新手指南、产品手册、FAQ、最佳实践' },
  { key: 'ent', name: '企业设置', desc: '企业信息、组织、角色权限、计费' },
]

export const platformMenus: Record<string, PMenuGroup[]> = {
  profile: [
    { group: '个人中心', items: [
      { label: '账户资料', key: 'profile:account' },
      { label: '安全设置', key: 'profile:security' },
      { label: '登录设备管理', key: 'profile:devices' },
    ] },
  ],
  notify: [
    { group: '消息通知', items: [
      { label: '消息中心', key: 'notify:center' },
      { label: '预警消息', key: 'notify:alert' },
      { label: '系统公告', key: 'notify:announce' },
      { label: '通知偏好设置', key: 'notify:pref' },
    ] },
  ],
  ticket: [
    { group: '工单与支持', items: [
      { label: '提交工单', key: 'ticket:new' },
      { label: '我的工单', key: 'ticket:list' },
      { label: '工单详情', key: 'ticket:detail' },
      { label: '常见问题', key: 'ticket:faq' },
    ] },
  ],
  apidoc: [
    { group: 'API 文档', items: [
      { label: '快速入门', key: 'apidoc:start' },
      { label: '应用管理', key: 'apidoc:apps' },
      { label: '鉴权说明', key: 'apidoc:auth' },
      { label: '接口目录', key: 'apidoc:catalog' },
      { label: '接口详情', key: 'apidoc:detail' },
      { label: '调用日志', key: 'apidoc:logs' },
      { label: 'Webhook 配置', key: 'apidoc:webhook' },
    ] },
  ],
  help: [
    { group: '帮助中心', items: [
      { label: '新手指南', key: 'help:guide' },
      { label: '产品手册', key: 'help:manual' },
      { label: '快速操作教程', key: 'help:tutorial' },
      { label: '常见问题 FAQ', key: 'help:faq' },
      { label: '最佳实践', key: 'help:best' },
      { label: '版本更新日志', key: 'help:changelog' },
      { label: '视频学习中心', key: 'help:video' },
    ] },
  ],
  ent: [
    { group: '企业设置', items: [
      { label: '企业信息', key: 'ent:info' },
      { label: '组织架构', key: 'ent:org' },
      { label: '角色与权限', key: 'ent:role' },
      { label: '渠道与产品', key: 'ent:channel' },
      { label: '审计日志', key: 'ent:audit' },
      { label: '安全策略', key: 'ent:security' },
      { label: '计费与套餐', key: 'ent:billing' },
    ] },
  ],
}

export type PlatformSpecs = Record<string, ModuleSpec>
