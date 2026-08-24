import { FaIcon, ModalShell, MODAL_CSS } from './modalCommon'

/* ============================================================
 * 空壳指数详情（原 record/功能分解/空壳指数.html 1:1 转写）
 * ============================================================ */
const CSS = MODAL_CSS + `
.risk-bar{height:6px;border-radius:3px;background:linear-gradient(90deg,#22c55e 0%,#a855f7 50%,#ef4444 100%)}
.tip-box{background-color:#fef9c3;border:1px solid #facc15}
`

const ROWS = [
  { name: '经营异常', desc: '有0条经营异常未移出，疑似无真实经营场所或无实际经营' },
  { name: '治理结构异常', desc: '企业治理结构与0家主体相似' },
  { name: '税务违法违规', desc: '存在0起违反票据管理规定案件' },
  { name: '相关诉讼违法记录', desc: '存在0起洗钱/诈骗/逃税等违法案件' },
  { name: '严重违法失信', desc: '被列入严重违法失信名单，且尚未移出' },
  { name: '联系方式异常', desc: '企业的联系方式疑似与0家主体重复' },
  { name: '注册地址异常', desc: '疑似使用托管、代办地址注册' },
  { name: '法定代表人异常', desc: '法定代表人疑似同时担任0家主体法人' },
  { name: '高危变更', desc: '短期内连续发生0起重大变更' },
  { name: '关联企业异常', desc: '企业注册信息与0家主体相似' },
  { name: '一址多企', desc: '企业的注册地址疑似与0家主体重复' },
]

export default function ShellCompanyModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalShell title="空壳指数详情" onClose={onClose}>
      <style>{CSS}</style>
      <div className="bg-white text-gray-800 font-sans" style={{ fontSize: 14 }}>
        <div className="w-full max-w-full border border-gray-200 rounded shadow-sm bg-white">
          {/* 头部 */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">
                空壳指数 <FaIcon name="question-circle" className="text-gray-400 text-sm" />
              </span>
            </div>
            <button className="text-gray-400 text-xl" onClick={onClose}>
              ×
            </button>
          </div>

          {/* 风险条区域 */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative mb-6">
              <div className="absolute left-0 top-[-30px] bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                L1 低风险
              </div>
              <div className="risk-bar w-full"></div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>风险较小</span>
                <span>风险较大</span>
              </div>
            </div>
            <div className="flex justify-center">
              <button className="text-blue-500 text-sm flex items-center gap-1">
                查看说明 <FaIcon name="caret-down" />
              </button>
            </div>
          </div>

          {/* 异常提示 */}
          <div className="px-4 py-3 text-sm border-b border-gray-200">
            发现 0 个项目异常，共计 0 条异常详情
          </div>

          {/* 扫描结果表格 */}
          <div className="p-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">空壳扫描风险</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">扫描结果</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">空壳特征</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r.name}>
                    <td className="border border-gray-300 px-3 py-2 text-sm">{r.name}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-green-600 font-medium">不存在</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">{r.desc}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-blue-500">查看详情</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 底部评分规则提示框 */}
          <div className="m-4 p-3 tip-box rounded text-sm">
            <div className="font-medium mb-1">空壳指数评分规则：</div>
            <div>
              空壳指数是从企业经营场所、资产形态、企业人员、经营活动、经营资质、风险信息等维度，扫描空壳特征，用于供应链管理、信贷风控、经济犯罪侦查或者税务稽查等应用场景。指数范围0-100，分值越大，主体是空壳的概率越高。
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  )
}
