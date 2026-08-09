// 企业档案子系统 · 数据层（与 dunData / collectionData 同构）
// 样例数据存本地 qiyeData.json（橘 Sam，用户运行时创建/编辑落本地）；实时统计 灰 Cal。
// 持久化复用 /api/load-mid /api/save-mid 端点；首启动 SEED 自动落盘。
// 模型参考：企查查（Qichacha）企业档案页 —— 工商信息 / 股东 / 主要人员 / 对外投资 /
//           变更记录 / 分支机构 / 司法案件 / 裁判文书 / 商标 / 专利 / 经营风险 / 经营信息 等。

export interface QiyeShareholder {
  name: string;
  ratio: number; // 持股比例 %
  amount: number; // 认缴出资额（万元）
  type: string; // 股东类型：自然人 / 企业法人
}
export interface QiyePerson {
  name: string;
  position: string; // 职务
}
export interface QiyeInvest {
  name: string; // 被投资企业
  ratio: number; // 持股比例 %
  legal: string; // 法定代表人
  status: string; // 经营状态
}
export interface QiyeBranch {
  name: string; // 分支机构
  addr: string; // 注册地址
}
export interface QiyeChange {
  date: string; // 变更日期
  item: string; // 变更项目
  before: string; // 变更前
  after: string; // 变更后
}
export interface QiyeLegalCase {
  id: string;
  title: string; // 案件名称
  type: string; // 案件类型
  date: string; // 日期
  role: string; // 身份：原告 / 被告 / 被执行人
  amount?: number; // 标的金额（万元）
  status: string; // 审理/执行状态
}
export interface QiyeIP {
  id: string;
  name: string; // 商标 / 专利名
  type: string; // 商标 / 发明专利 / 实用新型 / 著作权
  no: string; // 注册号
  date: string; // 申请/注册日
  status: string; // 状态
}
export interface QiyeCountItem {
  name: string; // 子项名称
  count: number; // 数量（0 表示未公示/无）
  danger?: boolean; // 风险类（红）
}
export interface QiyeProfile {
  keyNo: string; // 企业唯一标识
  name: string;
  status: '存续' | '在业' | '吊销' | '注销' | '迁出';
  tags: string[]; // 标签：专精特新 / 曾用名 等
  industry: string; // 行业
  creditCode: string; // 统一社会信用代码
  regNo: string; // 注册号
  legalPerson: string; // 法定代表人
  regCapital: number; // 注册资本（万元）
  paidCapital: number; // 实缴资本（万元）
  regDate: string; // 成立日期
  regAddr: string; // 注册地址
  bizScope: string; // 经营范围
  email: string;
  website: string;
  phone?: string;
  employees: number; // 参保人数
  followed: boolean; // 是否已关注
  kcScore: number; // 科创分
  // 基本信息
  shareholders: QiyeShareholder[];
  persons: QiyePerson[];
  invests: QiyeInvest[];
  branches: QiyeBranch[];
  changes: QiyeChange[];
  // 法律诉讼
  legalCases: QiyeLegalCase[];
  // 知识产权
  ips: QiyeIP[];
  // 子项计数（经营风险 / 经营信息 / 企业发展 / 知识产权 网格）
  riskCounts: QiyeCountItem[];
  bizCounts: QiyeCountItem[];
  devCounts: QiyeCountItem[];
  ipCounts: QiyeCountItem[];
  newsCount: number; // 新闻舆情
}

export interface QiyeData {
  enterprises: QiyeProfile[];
}

export const SEED_QIYE: QiyeData = {
  enterprises: [
    {
      keyNo: '51f9f32bfadbcbbca4ab1e9e59efabe4',
      name: '永和食品（中国）股份有限公司',
      status: '存续',
      tags: ['专精特新中小企业', '曾用名：永和食品有限公司'],
      industry: '农副食品加工业',
      creditCode: '91310000MA1FL5X1X2',
      regNo: '310000000152345',
      legalPerson: '林建雄',
      regCapital: 68000,
      paidCapital: 51200,
      regDate: '2004-07-15',
      regAddr: '上海市静安区江场西路160号501-19室',
      bizScope: '食品生产，食品销售，食用农产品批发、零售，餐饮服务，货物或技术进出口（国家禁止或涉及行政审批的货物和技术进出口除外）。',
      email: 'zcb@yonho.com',
      website: 'www.yonho.com',
      phone: '021-5666****',
      employees: 2380,
      followed: false,
      kcScore: 824,
      shareholders: [
        { name: '林建雄', ratio: 38.6, amount: 26248, type: '自然人' },
        { name: '上海永和实业集团有限公司', ratio: 27.2, amount: 18496, type: '企业法人' },
        { name: '中国农垦产业发展基金（有限合伙）', ratio: 14.1, amount: 9588, type: '企业法人' },
        { name: '公众流通股', ratio: 20.1, amount: 13668, type: '其他' },
      ],
      persons: [
        { name: '林建雄', position: '董事长 / 法定代表人' },
        { name: '陈志明', position: '董事 / 总经理' },
        { name: '王惠芳', position: '董事 / 财务负责人' },
        { name: '李建国', position: '董事会秘书' },
        { name: '张敏', position: '监事会主席' },
        { name: '赵磊', position: '副总经理' },
        { name: '孙文', position: '副总经理' },
        { name: '周倩', position: '独立董事' },
      ],
      invests: [
        { name: '永和（上海）食品有限公司', ratio: 100, legal: '陈志明', status: '存续' },
        { name: '永和食品（沈阳）有限公司', ratio: 85, legal: '李建国', status: '存续' },
        { name: '永和（成都）餐饮管理有限公司', ratio: 70, legal: '赵磊', status: '存续' },
        { name: '上海永和豆浆餐饮管理有限公司', ratio: 90, legal: '孙文', status: '存续' },
        { name: '永和食品（武汉）有限公司', ratio: 60, legal: '陈志明', status: '在业' },
        { name: '永和（广州）供应链有限公司', ratio: 55, legal: '王惠芳', status: '存续' },
        { name: '永和食品研究院有限公司', ratio: 100, legal: '林建雄', status: '存续' },
        { name: '永和海外控股（香港）有限公司', ratio: 100, legal: '周倩', status: '注册地香港' },
      ],
      branches: [
        { name: '永和食品（中国）股份有限公司北京分公司', addr: '北京市朝阳区建国路88号' },
        { name: '永和食品（中国）股份有限公司广州分公司', addr: '广州市天河区天河路208号' },
        { name: '永和食品（中国）股份有限公司成都分公司', addr: '成都市武侯区人民南路四段' },
        { name: '永和食品（中国）股份有限公司深圳分公司', addr: '深圳市南山区科技园北区' },
        { name: '永和食品（中国）股份有限公司武汉分公司', addr: '武汉市江汉区解放大道' },
        { name: '永和食品（中国）股份有限公司南京分公司', addr: '南京市鼓楼区中山路' },
        { name: '永和食品（中国）股份有限公司杭州分公司', addr: '杭州市西湖区文三路' },
        { name: '永和食品（中国）股份有限公司西安分公司', addr: '西安市雁塔区高新区' },
        { name: '永和食品（中国）股份有限公司沈阳分公司', addr: '沈阳市和平区青年大街' },
      ],
      changes: [
        { date: '2026-08-02', item: '注册资本', before: '65000 万元', after: '68000 万元' },
        { date: '2025-11-18', item: '法定代表人', before: '林建雄', after: '林建雄' },
        { date: '2025-06-30', item: '经营范围', before: '食品生产、销售', after: '食品生产，食品销售，餐饮服务，货物进出口' },
        { date: '2024-09-12', item: '董事备案', before: '（8 人）', after: '（新增独立董事 周倩）' },
        { date: '2023-12-05', item: '注册资本', before: '60000 万元', after: '65000 万元' },
      ],
      legalCases: [
        { id: 'LA-2026-0312', title: '永和食品诉某经销商买卖合同纠纷', type: '买卖合同纠纷', date: '2026-03-12', role: '原告', amount: 386, status: '已判决' },
        { id: 'LA-2025-1882', title: '某供应商诉永和食品承揽合同纠纷', type: '承揽合同纠纷', date: '2025-11-20', role: '被告', amount: 142, status: '调解结案' },
        { id: 'LA-2025-0901', title: '永和食品诉员工竞业禁止纠纷', type: '劳动争议', date: '2025-07-08', role: '原告', status: '一审审理中' },
        { id: 'LA-2024-2230', title: '商标侵权纠纷', type: '知识产权纠纷', date: '2024-12-15', role: '原告', amount: 58, status: '已判决' },
      ],
      ips: [
        { id: 'IP-TM-001', name: '永和豆浆', type: '商标', no: '第 3002157 号', date: '2003-09-21', status: '有效' },
        { id: 'IP-TM-002', name: 'YONHO', type: '商标', no: '第 4883201 号', date: '2008-05-14', status: '有效' },
        { id: 'IP-PAT-001', name: '一种即食豆浆粉的制备方法', type: '发明专利', no: 'ZL202110234567.8', date: '2021-03-02', status: '有效' },
        { id: 'IP-PAT-002', name: '豆浆生产用高效磨浆设备', type: '实用新型', no: 'ZL202220998877.6', date: '2022-04-26', status: '有效' },
        { id: 'IP-CR-001', name: '永和食品会员小程序', type: '著作权', no: '软著登字第 8821534 号', date: '2023-08-10', status: '有效' },
      ],
      riskCounts: [
        { name: '行政处罚', count: 0 }, { name: '经营异常', count: 0 }, { name: '严重违法', count: 0 },
        { name: '环保处罚', count: 0 }, { name: '税务非正常户', count: 0 }, { name: '欠税公告', count: 0 },
        { name: '股权冻结', count: 0 }, { name: '动产抵押', count: 0 }, { name: '劳动仲裁', count: 1, danger: true },
        { name: '注销备案', count: 0 }, { name: '清算信息', count: 0 }, { name: '公示催告', count: 0 },
      ],
      bizCounts: [
        { name: '招投标', count: 1 }, { name: '资质证书', count: 8 }, { name: '信用评价', count: 2 },
        { name: '行政许可', count: 14 }, { name: '抽查检查', count: 1 }, { name: '经营商品', count: 954 },
        { name: '供应商', count: 3 }, { name: '客户', count: 1 }, { name: '纳税人状态', count: 1 },
        { name: '纳税人资质', count: 3 }, { name: '食品安全', count: 10 }, { name: '招聘', count: 542 },
      ],
      devCounts: [
        { name: '企业业务', count: 1 }, { name: '竞品信息', count: 7 }, { name: '上榜榜单', count: 12 },
        { name: '荣誉', count: 2 }, { name: '相关公告', count: 18 }, { name: '新闻舆情', count: 229 },
        { name: '融资信息', count: 0 }, { name: '科技成果', count: 0 }, { name: '企业公告', count: 0 },
      ],
      ipCounts: [
        { name: '商标信息', count: 497 }, { name: '商标文书', count: 1239 }, { name: '专利信息', count: 37 },
        { name: '作品著作权', count: 3 }, { name: '软件著作权', count: 0 }, { name: '网络服务备案', count: 3 },
        { name: '标准信息', count: 6 }, { name: '小程序', count: 1 }, { name: '微信公众号', count: 1 },
      ],
      newsCount: 229,
    },
    {
      keyNo: 'a83f21c9d2e0b74f5c6a1b3390ff77aa',
      name: '杭州云算科技有限公司',
      status: '存续',
      tags: ['高新技术企业', '科技型中小企业'],
      industry: '软件和信息技术服务业',
      creditCode: '91330100MA2H3K9P21',
      regNo: '330100000998877',
      legalPerson: '沈逸尘',
      regCapital: 5000,
      paidCapital: 3200,
      regDate: '2019-09-23',
      regAddr: '浙江省杭州市余杭区文一西路998号海创园5幢',
      bizScope: '技术服务、技术开发、技术咨询；计算机软硬件及辅助设备批发；人工智能应用软件开发；大数据服务。',
      email: 'contact@yun-suan.com',
      website: 'www.yun-suan.com',
      phone: '0571-8888****',
      employees: 412,
      followed: false,
      kcScore: 901,
      shareholders: [
        { name: '沈逸尘', ratio: 52.0, amount: 2600, type: '自然人' },
        { name: '杭州余杭产业投资基金', ratio: 23.5, amount: 1175, type: '企业法人' },
        { name: '某员工持股平台（有限合伙）', ratio: 24.5, amount: 1225, type: '其他' },
      ],
      persons: [
        { name: '沈逸尘', position: '董事长 / CEO' },
        { name: '韩雪', position: 'CTO' },
        { name: '罗成', position: 'CFO' },
        { name: '方圆', position: 'COO' },
      ],
      invests: [
        { name: '云算（上海）智能科技有限公司', ratio: 100, legal: '韩雪', status: '存续' },
        { name: '云算（深圳）数据有限公司', ratio: 80, legal: '罗成', status: '存续' },
      ],
      branches: [
        { name: '杭州云算科技有限公司北京分公司', addr: '北京市海淀区上地信息路' },
        { name: '杭州云算科技有限公司成都研发中心', addr: '成都市高新区天府软件园' },
      ],
      changes: [
        { date: '2025-04-10', item: '注册资本', before: '3000 万元', after: '5000 万元' },
        { date: '2024-02-18', item: '董事备案', before: '（3 人）', after: '（4 人，新增 COO）' },
      ],
      legalCases: [
        { id: 'LA-2025-7712', title: '某客户诉云算科技服务合同纠纷', type: '服务合同纠纷', date: '2025-05-09', role: '被告', amount: 96, status: '已判决' },
      ],
      ips: [
        { id: 'IP-PAT-101', name: '一种分布式流计算任务调度方法', type: '发明专利', no: 'ZL202210556677.9', date: '2022-07-19', status: '有效' },
        { id: 'IP-CR-101', name: '云算数据治理平台', type: '著作权', no: '软著登字第 7012345 号', date: '2022-11-02', status: '有效' },
      ],
      riskCounts: [
        { name: '行政处罚', count: 0 }, { name: '经营异常', count: 0 }, { name: '严重违法', count: 0 },
        { name: '劳动仲裁', count: 0 }, { name: '股权冻结', count: 0 }, { name: '动产抵押', count: 0 },
      ],
      bizCounts: [
        { name: '资质证书', count: 12 }, { name: '信用评价', count: 3 }, { name: '行政许可', count: 6 },
        { name: '招投标', count: 24 }, { name: '招聘', count: 168 }, { name: '供应商', count: 9 },
      ],
      devCounts: [
        { name: '企业业务', count: 2 }, { name: '竞品信息', count: 5 }, { name: '上榜榜单', count: 8 },
        { name: '荣誉', count: 6 }, { name: '新闻舆情', count: 76 }, { name: '融资信息', count: 2 },
      ],
      ipCounts: [
        { name: '商标信息', count: 28 }, { name: '专利信息', count: 19 }, { name: '软件著作权', count: 41 },
        { name: '作品著作权', count: 1 }, { name: '标准信息', count: 2 }, { name: '小程序', count: 2 },
      ],
      newsCount: 76,
    },
    {
      keyNo: 'c19b4e7a0d6532f8b2c4410e7aa99331',
      name: '深圳市锐进供应链有限公司',
      status: '在业',
      tags: ['A 级纳税人', '一般纳税人'],
      industry: '商务服务业',
      creditCode: '91440300MA5GK2Q880',
      regNo: '440300210776655',
      legalPerson: '黄锐锋',
      regCapital: 2000,
      paidCapital: 2000,
      regDate: '2021-01-08',
      regAddr: '广东省深圳市前海深港合作区前湾一路1号',
      bizScope: '供应链管理；国际货运代理；物流方案设计；国内贸易；经营进出口业务；仓储服务。',
      email: 'service@ruijin-scm.com',
      website: 'www.ruijin-scm.com',
      phone: '0755-2666****',
      employees: 156,
      followed: false,
      kcScore: 712,
      shareholders: [
        { name: '黄锐锋', ratio: 70.0, amount: 1400, type: '自然人' },
        { name: '深圳市前海启航投资合伙企业', ratio: 30.0, amount: 600, type: '企业法人' },
      ],
      persons: [
        { name: '黄锐锋', position: '董事长 / 总经理' },
        { name: '吴敏', position: '运营总监' },
        { name: '郑凯', position: '财务总监' },
      ],
      invests: [
        { name: '锐进（广州）仓储有限公司', ratio: 60, legal: '吴敏', status: '存续' },
      ],
      branches: [
        { name: '深圳市锐进供应链有限公司广州分公司', addr: '广州市南沙区港前大道' },
      ],
      changes: [
        { date: '2023-08-22', item: '经营范围', before: '供应链管理', after: '供应链管理；国际货运代理；仓储服务' },
      ],
      legalCases: [
        { id: 'LA-2024-5521', title: '锐进供应链诉某物流公司运输合同纠纷', type: '运输合同纠纷', date: '2024-10-30', role: '原告', amount: 73, status: '已判决' },
      ],
      ips: [
        { id: 'IP-TM-201', name: '锐进供应链 RUIJIN SCM', type: '商标', no: '第 5566890 号', date: '2021-06-11', status: '有效' },
      ],
      riskCounts: [
        { name: '行政处罚', count: 0 }, { name: '经营异常', count: 0 }, { name: '劳动仲裁', count: 0 },
        { name: '股权冻结', count: 0 }, { name: '动产抵押', count: 0 }, { name: '欠税公告', count: 0 },
      ],
      bizCounts: [
        { name: '资质证书', count: 4 }, { name: '行政许可', count: 9 }, { name: '招投标', count: 6 },
        { name: '招聘', count: 43 }, { name: '供应商', count: 21 }, { name: '客户', count: 14 },
      ],
      devCounts: [
        { name: '企业业务', count: 1 }, { name: '竞品信息', count: 3 }, { name: '荣誉', count: 1 },
        { name: '新闻舆情', count: 18 }, { name: '融资信息', count: 0 }, { name: '上榜榜单', count: 2 },
      ],
      ipCounts: [
        { name: '商标信息', count: 6 }, { name: '专利信息', count: 2 }, { name: '软件著作权', count: 3 },
        { name: '作品著作权', count: 0 }, { name: '标准信息', count: 0 }, { name: '小程序', count: 0 },
      ],
      newsCount: 18,
    },
  ],
}

/* ---- 轻量 store（与 dunData 同构：useSyncExternalStore + 落盘） ---- */
import { useSyncExternalStore } from 'react';

const FILES = { qiye: 'qiyeData.json' };
let data: QiyeData = JSON.parse(JSON.stringify(SEED_QIYE));
let version = 0;
let saveStatus: 'ok' | 'error' | null = null;
const listeners = new Set<() => void>();
const statusListeners = new Set<() => void>();

function emit() { version++; listeners.forEach((fn) => fn()); }
function emitStatus() { statusListeners.forEach((fn) => fn()); }

async function loadOne(file: string): Promise<unknown> {
  try {
    const r = await fetch(`/api/load-mid?file=${encodeURIComponent(file)}`);
    if (r.ok) return await r.json();
    return null;
  } catch { return null; }
}
function saveOne(file: string, body: unknown) {
  fetch(`/api/save-mid?file=${encodeURIComponent(file)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((r) => { saveStatus = r.ok ? 'ok' : 'error'; emitStatus(); })
    .catch(() => { saveStatus = 'error'; emitStatus(); });
}

async function bootstrap() {
  const saved = await loadOne(FILES.qiye);
  if (saved && typeof saved === 'object' && Array.isArray((saved as QiyeData).enterprises)) {
    data = saved as QiyeData;
  } else {
    saveOne(FILES.qiye, data);
  }
  emit();
}
void bootstrap();

function useSnap<T>(sel: () => T): T {
  useSyncExternalStore(
    (l) => { listeners.add(l); return () => { listeners.delete(l); }; },
    () => version,
  );
  return sel();
}

export function useQiyeData(): QiyeData { return useSnap(() => data); }
export function useQiyeSaveStatus(): 'ok' | 'error' | null {
  useSyncExternalStore(
    (l) => { statusListeners.add(l); return () => { statusListeners.delete(l); }; },
    () => saveStatus,
  );
  return saveStatus;
}
export function updateQiyeData(fn: (d: QiyeData) => QiyeData) {
  data = fn(data);
  emit();
  saveOne(FILES.qiye, data);
}
export function qiyeNewId(p: string) { return `${p}-${Date.now().toString(36)}`; }
export function toggleFollow(keyNo: string) {
  updateQiyeData((d) => ({
    ...d,
    enterprises: d.enterprises.map((e) => (e.keyNo === keyNo ? { ...e, followed: !e.followed } : e)),
  }));
}
