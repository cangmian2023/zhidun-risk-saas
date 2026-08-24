import { useState } from 'react'
import { ModalShell, MODAL_CSS } from './modalCommon'

/* ============================================================
 * 司法风险详情（原 record/功能分解/司法风险.html 1:1 转写）
 * ============================================================ */
const CSS = MODAL_CSS + `
.info-card{background-color:#f8fafc;border:1px solid #e2e8f0}
.tab-active{border-bottom:2px solid #f59e0b;color:#1f2937;font-weight:500}
.tab-normal{color:#6b7280}
`

const TABS = ['商业纠纷', '遵纪守法', '权益规范', '劳务管理']

const SUB_ROWS = [
  { identity: '原告', count: '1', rank: '1%', amount: '38万元', amountRank: '67%' },
  { identity: '被告', count: '62', rank: '100%', amount: '1.68亿元', amountRank: '100%' },
]

export default function JudicialRiskModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState(0)
  return (
    <ModalShell title="司法风险详情" onClose={onClose}>
      <style>{CSS}</style>
      <div className="bg-white text-gray-800 font-sans" style={{ fontSize: 14 }}>
        <div className="w-full max-w-full border border-gray-200 rounded shadow-sm bg-white">
          {/* 头部 */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold">司法风险详情</h1>
            <button className="text-gray-400 text-xl" onClick={onClose}>
              ×
            </button>
          </div>

          {/* 说明文字 */}
          <div className="px-4 py-3 text-sm text-gray-600">
            以下数据取用裁判文书中：文书类型为判决书、案件身份为原告和被告的案件。
          </div>

          {/* 涉诉概览 */}
          <div className="p-4 border-b border-gray-200">
            <div className="font-medium mb-3">涉诉概览</div>
            <div className="grid grid-cols-3 gap-4">
              <div className="info-card p-3 text-center">
                <div className="text-sm text-gray-500">涉诉案件数量</div>
                <div className="text-2xl font-bold mt-1">212</div>
              </div>
              <div className="info-card p-3 text-center">
                <div className="text-sm text-gray-500">涉诉数量行业排名</div>
                <div className="text-2xl font-bold mt-1">92%</div>
              </div>
              <div className="info-card p-3 text-center">
                <div className="text-sm text-gray-500">涉诉总金额</div>
                <div className="text-2xl font-bold mt-1">14.81亿元</div>
              </div>
            </div>
          </div>

          {/* 涉案数量 */}
          <div className="p-4 border-b border-gray-200">
            <div className="font-medium mb-3">涉案数量</div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">涉诉身份</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">案件数量（件）</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">行业排名</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">行业平均值</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">行业中位数</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-sm">原告</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">7</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">10%</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">2.04</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">1</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-sm">被告</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">205</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">95%</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">2.44</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">1</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 涉案金额 */}
          <div className="p-4 border-b border-gray-200">
            <div className="font-medium mb-3">涉案金额</div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">涉诉身份</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">案件总金额</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">行业排名</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">行业平均值</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">行业中位数</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-sm">原告</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">75.24万元</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">72%</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">174.28万元</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">14.82万元</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-sm">被告</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">14.81亿元</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">100%</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">3457.65万元</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">17.31万元</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 涉案细分 */}
          <div className="p-4">
            <div className="font-medium mb-3">涉案细分</div>
            {/* Tab栏 */}
            <div className="flex border-b border-gray-200 mb-4">
              {TABS.map((t, i) => (
                <div
                  key={t}
                  className={`px-4 py-2 cursor-pointer ${i === tab ? 'tab-active' : 'tab-normal'}`}
                  onClick={() => setTab(i)}
                >
                  {t}
                </div>
              ))}
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">涉诉身份</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">案件数量（件）</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">案件数量行业排名</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">涉案总金额</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">涉案金额行业排名</th>
                </tr>
              </thead>
              <tbody>
                {SUB_ROWS.map((r) => (
                  <tr key={r.identity}>
                    <td className="border border-gray-300 px-3 py-2 text-sm">{r.identity}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">{r.count}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">{r.rank}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">{r.amount}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">{r.amountRank}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ModalShell>
  )
}
