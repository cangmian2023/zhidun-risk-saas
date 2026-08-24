import { ModalShell, MODAL_CSS, RadarSVG } from './modalCommon'

/* ============================================================
 * 科创分详情（原 record/功能分解/科创分.html 1:1 转写）
 * ============================================================ */
const CSS = MODAL_CSS + `
.rule-box{background-color:#fffbeb;border:1px solid #fef08a}
`

const ROWS = [
  { name: '有效专利数', own: '78', sub: '78' },
  { name: '有效发明专利数', own: '77', sub: '77' },
  { name: '有效发明授权数', own: '77', sub: '77' },
  { name: '有效外观设计数', own: '1', sub: '1' },
  { name: '软件著作权数', own: '74', sub: '156' },
]

export default function KechuangScoreModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalShell title="科创分详情" onClose={onClose}>
      <style>{CSS}</style>
      <div className="bg-white text-gray-800 font-sans" style={{ fontSize: 14 }}>
        <div className="w-full max-w-full border border-gray-200 rounded shadow-sm bg-white">
          {/* 头部 */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold">广州博鳌纵横网络科技有限公司 科创分详情</h1>
            <button className="text-gray-400 text-xl" onClick={onClose}>
              ×
            </button>
          </div>

          {/* 主体内容：雷达图 + 表格 */}
          <div className="p-6 flex gap-10 items-start">
            {/* 五维雷达图 */}
            <div className="w-[420px] h-[420px]">
              <RadarSVG
                labels={['技术创新', '研发实力', '科创资质', '企业成长性', '行业潜力']}
                data={[90, 85, 40, 30, 45]}
                size={420}
                color="#4f86f7"
                fill="rgba(79, 134, 247, 0.35)"
                gridColor="rgba(180, 205, 255, 0.4)"
                labelFontSize={14}
              />
            </div>
            {/* 知识产权表格 */}
            <div className="flex-1">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left text-base font-medium">知识产权指标</th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-base font-medium">该企业获得数</th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-base font-medium">含子公司获得数</th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((r) => (
                    <tr key={r.name}>
                      <td className="border border-gray-300 px-4 py-3 text-base">{r.name}</td>
                      <td className="border border-gray-300 px-4 py-3 text-base">{r.own}</td>
                      <td className="border border-gray-300 px-4 py-3 text-base">{r.sub}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 底部科创评分规则 */}
          <div className="m-6 p-5 rule-box rounded">
            <div className="font-semibold mb-2 text-lg">科创分评分规则：</div>
            <div className="text-base leading-relaxed">
              科创企业评分，是从企业技术创新、科创资质、研发实力、企业成长性以及行业潜力5个大类（20+个细分维度）维度综合评价企业的科技创新能力以及发展潜力。辅助金融机构、政府/产业园等多种业务应用场景决策。
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  )
}
