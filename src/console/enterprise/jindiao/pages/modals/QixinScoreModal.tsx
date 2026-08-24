import { FaIcon, ModalShell, MODAL_CSS, RadarSVG, TrendLineSVG } from './modalCommon'

/* ============================================================
 * 启信分详情（原 record/功能分解/企业指数 .html 1:1 转写）
 * ============================================================ */
const CSS = MODAL_CSS + `
.score-circle{width:56px;height:56px;border-radius:50%;background:conic-gradient(#ef4444 0% 36.2%, #e5e7eb 36.2% 100%);display:flex;align-items:center;justify-content:center;position:relative}
.risk-tooltip{position:absolute;margin-left:65%;margin-top:-36px;background:#1f2937;color:#fff;font-size:12px;padding:4px 8px;border-radius:4px;white-space:nowrap}
.risk-arrow{position:absolute;margin-left:65%;margin-top:-8px;width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid #1f2937}
`

export default function QixinScoreModal({ onClose }: { onClose: () => void }) {
  const rows = [
    { dim: '成长性', score: 30 },
    { dim: '知识产权', score: 95 },
    { dim: '企业规模', score: 95 },
    { dim: '经营质量', score: 95 },
    { dim: '资本背景', score: 90 },
  ]
  return (
    <ModalShell title="启信分详情" onClose={onClose}>
      <style>{CSS}</style>
      <div className="bg-white text-gray-800 font-sans" style={{ fontSize: 14 }}>
        <div className="w-full border border-gray-200 rounded shadow-sm bg-white">
          {/* 头部 */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="score-circle">
                <div className="w-12 h-12 bg-white rounded-full flex flex-col items-center justify-center">
                  <span className="text-red-500 text-xl font-bold">36.2</span>
                  <span className="text-xs text-gray-500">分</span>
                </div>
              </div>
              <div>
                <div className="text-lg font-semibold">启信分</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-red-500 font-bold text-lg">362.00</span>
                  <span className="text-gray-500 text-sm">总分（450分）</span>
                  <FaIcon name="info-circle" className="text-gray-400 text-sm" />
                </div>
              </div>
            </div>
            <span className="text-gray-400 text-2xl cursor-pointer hover:text-gray-600" onClick={onClose}>
              ×
            </span>
          </div>

          {/* 工商信息风险条 */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-1 font-medium text-gray-700 text-sm">
                工商信息
                <FaIcon name="question-circle" className="text-gray-400 text-sm" />
              </div>
              <span className="text-blue-500 text-sm cursor-pointer hover:underline">查看样本企业</span>
            </div>
            <div className="relative h-4 w-full rounded overflow-hidden flex">
              <div className="w-[8%] bg-green-400"></div>
              <div className="w-[8%] bg-green-400"></div>
              <div className="w-[8%] bg-green-400"></div>
              <div className="w-[8%] bg-yellow-300"></div>
              <div className="w-[8%] bg-yellow-300"></div>
              <div className="w-[8%] bg-orange-400"></div>
              <div className="w-[8%] bg-orange-400"></div>
              <div className="w-[8%] bg-red-500"></div>
              <div className="w-[8%] bg-red-500"></div>
              <div className="w-[8%] bg-red-700"></div>
              <div className="w-[8%] bg-red-700"></div>
              <div className="w-[8%] bg-red-700"></div>
              <div className="risk-tooltip">低风险</div>
              <div className="risk-arrow"></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>低风险（0-450）</span>
              <span>高风险（1350-1800）</span>
            </div>
          </div>

          {/* 历史趋势 */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-1 font-medium text-sm text-gray-700">
                启信分历史趋势（近7个周期）
                <FaIcon name="question-circle" className="text-gray-400 text-sm" />
              </span>
              <div className="flex gap-3">
                <span className="border border-gray-300 rounded px-2 py-1 text-sm">2024-08-20 至 2024-11-18</span>
                <span className="flex items-center border border-gray-300 rounded px-2 py-1 text-sm gap-2 cursor-pointer">
                  近7个周期
                  <FaIcon name="caret-down" className="text-gray-500 text-xs" />
                </span>
              </div>
            </div>
            <div className="h-[240px] relative">
              <TrendLineSVG
                labels={['2024-08-20', '2024-09-03', '2024-09-17', '2024-10-01', '2024-10-15', '2024-10-29', '2024-11-18']}
                data={[362, 362, 362, 362, 362, 362, 362]}
              />
            </div>
          </div>

          {/* 多维评分 */}
          <div className="p-4 flex gap-6">
            <div className="w-[240px]">
              <div className="font-medium text-sm mb-3 text-gray-700">启信分多维度评分</div>
              <RadarSVG labels={['成长性', '知识产权', '企业规模', '经营质量', '资本背景']} data={[30, 95, 95, 95, 90]} />
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">维度</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">分数</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">评级</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.dim} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-sm">{r.dim}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">{r.score}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-green-600">低风险</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  )
}
