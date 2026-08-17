import { useState } from 'react'
import { PageShell } from './PageShell'
import { Panel } from '../components/ui'
import { Sam } from './SourceTag'

const DIMS = ['企业', '人员', '商机', '风险', '舆情', '研报', '我的模板', '精选模板']

const PROVINCES = [
  '北京市', '天津市', '河北省', '山西省', '内蒙古自治区', '辽宁省', '吉林省', '黑龙江省',
  '上海市', '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省', '河南省',
  '湖北省', '湖南省', '广东省', '广西壮族自治区', '海南省', '重庆市', '四川省', '贵州省',
  '云南省', '西藏自治区', '陕西省', '甘肃省', '青海省', '宁夏回族自治区', '新疆维吾尔自治区',
]

const INDUSTRIES = [
  '农、林、牧、渔业', '采矿业', '制造业', '电力、热力、燃气及水生产和供应业', '建筑业',
  '批发和零售业', '交通运输、仓储和邮政业', '住宿和餐饮业', '信息传输、软件和信息技术服务业',
  '金融业', '房地产业', '租赁和商务服务业', '科学研究和技术服务业', '水利、环境和公共设施管理业',
  '居民服务、修理和其他服务业', '教育', '卫生和社会工作', '文化、体育和娱乐业',
  '公共管理、社会保障和社会组织', '国际组织',
]

const ZONE_TYPES_LEVEL = ['国家级', '省级', '市级', '其他']
const ZONE_TYPES = [
  '高新技术产业开发区', '新区', '边境/跨境经济合作区', '产业园', '经济技术开发区',
  '海关特殊监管区域', '工业园区', '其他类型开发区', '工业示范基地', '经济开发区',
  '工业集中区', '自由贸易试验区',
]

const OTHER_STATUS = [
  '规模以上企业', '手机号码（有）', '座机号码（有）', '空号过滤（正常号码）', '邮箱地址（有）',
  '企业地址（有）', '疑代记账地址（是）', '企业网址（有）',
]

const FOUND_YEARS = ['3个月以内', '半年以内', '1年以内', '1年以上', '1-5年', '5-10年', '10年以上', '自定义']

const OP_STATUS = [
  '存续', '迁出', '注销', '吊销', '撤销', '设立中', '清算中', '停业', '歇业', '责令关闭',
  '已取缔非法社会组织', '涉嫌非法社会组织',
]

const REG_CAPITAL = [
  '100万以内', '100-200万', '200-500万', '500-1000万', '1000-5000万', '5000万以上',
  '1-5亿', '5-10亿', '10亿以上',
]

const SCALE = [
  '微型企业', '小型企业', '疑似小微企业', '中型企业', '大型企业', '规模以上企业',
  '规模以上工业', '资质内建筑企业', '限额以上批发和零售业', '限额以上住宿和餐饮业',
  '房地产开发经营业', '规模以上服务业',
]

const TEMPLATES = ['新注册企业', '专精特新', '小微企业', '中小微企业', '中标政府采购项目']

function FilterGroup({ label, options }: { label: string; options: string[] }) {
  return (
    <div className="mb-4">
      <div className="mb-2 text-xs font-medium text-slate-500">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button key={o} className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 transition hover:border-brand-300">
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function DmFullSearch() {
  const [dim, setDim] = useState(DIMS[0])
  return (
    <div style={{ padding: 24, maxWidth: 1360, margin: '0 auto' }}>
      <PageShell
        title="全维搜索"
        crumb="数字营销 / 潜客挖掘"
        subtitle="企业 / 人员 / 商标 / 专利 / 舆情等全维度一站式检索，支持组合筛选与导出"
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {DIMS.map((d) => (
          <button
            key={d}
            onClick={() => setDim(d)}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${
              dim === d ? 'bg-brand-600 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:border-brand-300'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {dim === '企业' && (
        <div className="space-y-4">
          {/* 检索栏 */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center gap-2">
              <input
                className="min-w-[260px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-300"
                placeholder="企业名称 / 曾用名 / 股东 / 法人代表 / 高管 / 经营范围 / 联系方式 / 网址 / 产品 / 商标 / 专利"
              />
              <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white">查询</button>
              <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:border-brand-300">找名单</button>
              <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:border-brand-300">批量搜索</button>
              <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:border-brand-300">高级搜索</button>
            </div>
            <div className="mt-2 text-xs text-slate-400">搜索词：比亚迪 · 企业名称匹配 汽车工业有限公司 / 汽车有限公司 / 半导体股份有限公司 / 深圳市锂电池有限公司</div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
            {/* 基础筛选 */}
            <Panel title="基础筛选" className="h-fit">
              <FilterGroup label="省份地区" options={PROVINCES} />
              <FilterGroup label="所属行业" options={INDUSTRIES} />
              <FilterGroup label="所在园区" options={['全部园区', '国家级园区', '省级园区']} />
              <FilterGroup label="特色区域类型 · 等级" options={ZONE_TYPES_LEVEL} />
              <FilterGroup label="特色区域类型" options={ZONE_TYPES} />
              <FilterGroup label="其他状态" options={OTHER_STATUS} />
              <FilterGroup label="成立年限" options={FOUND_YEARS} />
              <FilterGroup label="经营状态" options={OP_STATUS} />
              <FilterGroup label="注册资本" options={REG_CAPITAL} />
              <FilterGroup label="企业规模" options={SCALE} />
              <FilterGroup
                label="资质标签"
                options={[
                  '专精特新', '专精特新小巨人', '高新企业', '独角兽企业', '科技型中小企业',
                  '制造业单项冠军', '隐形冠军', '雏鹰企业', '瞪羚企业', '牛羚企业', '绿色企业',
                ]}
              />
            </Panel>

            {/* 结果区 */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
                <span className="rounded-md bg-brand-50 px-2 py-1 text-brand-700">已筛选 1 项</span>
                <button className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:border-brand-300">存为模板</button>
                <button className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:border-brand-300">清空</button>
                <span className="ml-auto text-xs text-slate-400"><Sam label="样例" value="1" /></span>
              </div>

              <Panel title="常用模板" actions={<span className="text-xs text-slate-400">点击套用筛选条件</span>}>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATES.map((t) => (
                    <button key={t} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 hover:border-brand-300">
                      {t}
                    </button>
                  ))}
                </div>
                <div className="mt-4 rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
                  请输入筛选条件后点击「查询」查看结果
                  <div className="mt-1 text-xs text-slate-300">暂不支持选择最近 15 天内的日期，如需查看请前往 新增企业</div>
                </div>
              </Panel>
            </div>
          </div>
        </div>
      )}

      {dim !== '企业' && (
        <Panel title={`${dim}检索`} desc={<Sam label="样例维度" value="0" />}>
          <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
            <p className="text-sm font-medium text-slate-600">「{dim}」维度检索</p>
            <p className="mt-1 text-xs text-slate-400">该维度示例数据正在补充，当前框架已就绪（人员 / 商机 / 风险 / 舆情 / 研报 等维度统一在此切换）</p>
          </div>
        </Panel>
      )}
    </div>
  )
}
