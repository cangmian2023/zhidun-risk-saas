import { useState } from 'react'
import { Panel } from '../components/ui'
import { usePageNav } from './pageNav'

/* ============================================================
 * 企业PK / 企业对比 详情页
 * 1:1 复刻 record/功能分解/功能分解/科创金融 - 企业pk.html
 * 命名按全局规则：启信慧眼→企业征信，启信分→企业健康度
 * ============================================================ */

type Tag = { kind: 'green' | 'orange'; text: string }
type Val = string | { text: string; tag?: Tag; sub?: string; link?: string }
type Row = { label: string; vals: Val[] }
type Section = { key: string; name: string; rows: Row[]; hideSame?: boolean }

const SECTIONS: Section[] = [
  {
    key: 'gs',
    name: '工商信息',
    hideSame: true,
    rows: [
      { label: '成立日期', vals: ['1997-12-02', '2016-03-28', '-', '-'] },
      { label: '经营状态', vals: ['存续（在营、开业、在册）', '存续（在营、开业、在册）', '-', '-'] },
      { label: '注册资本', vals: ['5000 万人民币', '1820 万美元', '-', '-'] },
      { label: '实缴资本', vals: ['5000 万人民币', '1820 万美元', '-', '-'] },
      {
        label: '企业标签',
        vals: [
          '高新企业,新意科技集团,股权投资,A级纳税人,外资背景企业',
          '高新企业,爱康醫療國際集團,小微企业,A级纳税人,港澳台背景企业',
          '-',
          '-',
        ],
      },
      {
        label: '企业类型',
        vals: ['有限责任公司（外商投资、非独资）', '有限责任公司（港澳台法人独资）', '-', '-'],
      },
      { label: '所属行业', vals: ['其他软件开发', '医药及医疗器材批发', '-', '-'] },
      { label: '工商变更', vals: ['19', '8', '-', '-'] },
      {
        label: '法定代表人',
        vals: [
          { text: '邱一心', sub: '他有9家企业' },
          { text: '赖湧斌', sub: '他有2家企业' },
          '-',
          '-',
        ],
      },
      { label: '社保人数', vals: ['383', '209', '-', '-'] },
      {
        label: '企业地址',
        vals: [
          { text: '福州市鼓楼区六一北路558号金三桥大厦8层', link: '查看地图' },
          { text: '常州西太湖科技产业园长顺路506号', link: '查看地图' },
          '-',
          '-',
        ],
      },
      { label: '分支机构', vals: ['7', '-', '-', '-'] },
      { label: '参股控股', vals: ['-', '-', '-', '-'] },
      { label: '对外投资', vals: ['5', '2', '-', '-'] },
      { label: '主要人员', vals: ['7', '3', '-', '-'] },
    ],
  },
  {
    key: 'sl',
    name: '实力扫描',
    rows: [
      {
        label: '企业健康度',
        vals: [
          { text: '742', tag: { kind: 'green', text: '企业实力 优秀' } },
          { text: '712', tag: { kind: 'green', text: '企业实力 优秀' } },
          '-',
          '-',
        ],
      },
      { label: '司法风险', vals: ['-', '-', '-', '-'] },
      { label: '合同违约指数', vals: ['-', '-', '-', '-'] },
    ],
  },
  {
    key: 'sf',
    name: '司法风险',
    rows: [
      { label: '立案信息', vals: ['-', '-', '-', '-'] },
      { label: '开庭公告', vals: ['-', '-', '-', '-'] },
      { label: '裁判文书', vals: ['-', '-', '-', '-'] },
      { label: '被执行人', vals: ['-', '-', '-', '-'] },
      { label: '失信被执行人', vals: ['-', '-', '-', '-'] },
      { label: '股权冻结', vals: ['-', '-', '-', '-'] },
      { label: '限高消费', vals: ['-', '-', '-', '-'] },
      { label: '终本案件', vals: ['-', '-', '-', '-'] },
    ],
  },
  {
    key: 'yr',
    name: '经营风险',
    rows: [
      { label: '经营异常', vals: ['-', '-', '-', '-'] },
      { label: '严重违法失信', vals: ['-', '-', '-', '-'] },
      { label: '行政处罚', vals: ['-', '-', '-', '-'] },
      { label: '违法违规建设', vals: ['-', '-', '-', '-'] },
      { label: '环保处罚', vals: ['-', '-', '-', '-'] },
      { label: '股权出质', vals: ['-', '-', '-', '-'] },
      { label: '动产抵押', vals: ['-', '-', '-', '-'] },
      { label: '欠税信息', vals: ['-', '-', '-', '-'] },
      { label: '重大税收违法', vals: ['-', '-', '-', '-'] },
      { label: '土地质押', vals: ['-', '-', '-', '-'] },
    ],
  },
  {
    key: 'yj',
    name: '经营信息',
    rows: [
      { label: '企业年报', vals: ['13', '10', '-', '-'] },
      { label: '融资信息', vals: ['2', '-', '-', '-'] },
      { label: '供应商', vals: ['1', '29', '-', '-'] },
      { label: '客户', vals: ['30', '-', '-', '-'] },
      { label: '竞争对手', vals: ['29', '900', '-', '-'] },
      { label: '债券信息', vals: ['-', '-', '-', '-'] },
      {
        label: '空壳指数',
        vals: [
          { text: '', tag: { kind: 'orange', text: '低风险' } },
          { text: '', tag: { kind: 'orange', text: '低风险' } },
          '-',
          '-',
        ],
      },
      { label: '招投标', vals: ['518', '76', '-', '-'] },
      { label: '品牌产品', vals: ['1', '1', '-', '-'] },
      { label: '微信公众号', vals: ['1', '-', '-', '-'] },
    ],
  },
  {
    key: 'zz',
    name: '资质许可',
    rows: [
      { label: '资质证书', vals: ['5', '32', '-', '-'] },
      { label: '行政许可', vals: ['4', '13', '-', '-'] },
      {
        label: 'A级纳税人',
        vals: [
          { text: '是', link: '查看历史' },
          { text: '否', link: '查看历史' },
          '-',
          '-',
        ],
      },
      { label: '一般纳税人资格', vals: ['是', '是', '-', '-'] },
      { label: '小微企业', vals: ['否', '是', '-', '-'] },
      { label: '高新企业', vals: ['是', '是', '-', '-'] },
    ],
  },
  {
    key: 'ip',
    name: '知识产权',
    rows: [
      { label: '专利信息', vals: ['5', '149', '-', '-'] },
      { label: '商标信息', vals: ['23', '-', '-', '-'] },
      { label: '著作权信息', vals: ['-', '-', '-', '-'] },
      { label: '域名信息', vals: ['2', '1', '-', '-'] },
    ],
  },
  {
    key: 'xw',
    name: '新闻舆情',
    rows: [{ label: '舆情动态', vals: ['82', '45', '-', '-'] }],
  },
]

function disp(v: Val): string {
  if (typeof v === 'string') return v
  return v.text || (v.tag ? v.tag.text : '')
}

function CellView({ v }: { v: Val }) {
  if (typeof v === 'string') {
    return <span className={v === '-' ? 'text-slate-300' : ''}>{v}</span>
  }
  const nodes: React.ReactNode[] = []
  if (v.text) nodes.push(<span key="t">{v.text}</span>)
  if (v.sub) nodes.push(<div key="s" className="mt-0.5 text-slate-400">{v.sub}</div>)
  if (v.tag) {
    const cls =
      v.tag.kind === 'green'
        ? 'text-[#009944] bg-[#e8f8ee]'
        : 'text-[#ff7d00] bg-[#fff3e8]'
    nodes.push(
      <span key="tag" className={`ml-1 inline-block rounded px-1 ${cls}`}>
        {v.tag.text}
      </span>,
    )
  }
  if (v.link) {
    nodes.push(
      <span key="l" className="ml-1 cursor-pointer text-[#165DFF]">
        {v.link}
      </span>,
    )
  }
  return <>{nodes}</>
}

export default function DmTechFinPk() {
  const { back } = usePageNav()
  const [active, setActive] = useState('gs')
  const [hideSame, setHideSame] = useState(false)

  const go = (key: string) => {
    setActive(key)
    document.getElementById(`pk-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="pk-compare min-h-screen bg-[#f5f6fe] text-[12px] text-[#333]">
      {/* 顶部企业标签栏 */}
      <div className="flex items-center gap-2 border-b border-[#e8e8f0] bg-white px-4 py-2">
        <button
          onClick={() => back()}
          className="mr-1 flex items-center gap-1 rounded border border-[#e2e8f0] px-2 py-1 text-xs text-slate-500 hover:bg-gray-50"
        >
          ← 返回
        </button>
        <div className="flex items-center gap-1 px-2 font-bold text-[#165DFF]">企业征信</div>
        <div className="flex items-center gap-1 rounded border border-[#e2e8f0] px-3 py-1 text-sm">
          福建新意科技有限公司 <span className="cursor-pointer text-slate-400">×</span>
        </div>
        <div className="flex items-center gap-1 rounded border border-[#c7d2fe] bg-[#edf2ff] px-3 py-1 text-sm">
          天衍医疗器材有限公司 <span className="cursor-pointer text-slate-400">×</span>
        </div>
        <div className="cursor-pointer rounded border border-[#e2e8f0] px-3 py-1 text-sm text-[#165DFF]">
          + 添加企业
        </div>
      </div>

      {/* 主体：左侧分类 + 右侧对比面板 */}
      <div className="flex gap-4 p-4">
        <div className="w-20 shrink-0 rounded-md bg-white py-2">
          {SECTIONS.map((s) => (
            <div
              key={s.key}
              onClick={() => go(s.key)}
              className={`cursor-pointer py-2 text-center text-sm ${
                active === s.key ? 'font-medium text-[#165DFF]' : 'text-slate-500'
              }`}
            >
              {s.name}
            </div>
          ))}
        </div>

        <div className="flex flex-1 flex-col gap-3">
          {SECTIONS.map((s) => {
            const rows = hideSame
              ? s.rows.filter((r) => {
                  const a = disp(r.vals[0])
                  const b = disp(r.vals[1])
                  return !(a === b && a !== '-')
                })
              : s.rows
            return (
              <Panel
                key={s.key}
                id={`pk-${s.key}`}
                title={s.name}
                className="scroll-mt-24"
                actions={
                  s.hideSame ? (
                    <label className="flex cursor-pointer items-center gap-1 text-xs font-normal text-slate-500">
                      隐藏相同数据
                      <input
                        type="checkbox"
                        checked={hideSame}
                        onChange={(e) => setHideSame(e.target.checked)}
                      />
                    </label>
                  ) : undefined
                }
              >
                <table>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.label}>
                        <td>{r.label}</td>
                        {r.vals.map((v, i) => (
                          <td key={i}>
                            <CellView v={v} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Panel>
            )
          })}
        </div>
      </div>
    </div>
  )
}
