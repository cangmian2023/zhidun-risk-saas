import { FaIcon, ModalShell, MODAL_CSS } from './modalCommon'

/* ============================================================
 * 合同违约详情（原 record/功能分解/合同违约指数.html 1:1 转写）
 * ============================================================ */
const CSS = MODAL_CSS + `
.header-card{background-color:#f8fafc;border:1px solid #e2e8f0}
`

const DETAILS = [
  {
    date: '2023-02-24',
    plaintiff: '清墅高科工程技术（北京）有限公司',
    cause: '服务合同纠纷',
    title: '清墅高科工程技术（北京）有限公司与北京博鳌纵横网络科技有限公司等服务合同纠纷一审民事判决书',
    content:
      '一、于本判决生效后七日内，北京博鳌纵横网络科技有限公司与广州博鳌纵横网络科技有限公司退还清墅高科工程技术（北京）有限公司服务费88025.95元并按同期全国银行间同业拆借中心公布的贷款市场报价利率计算支付自2021年9月24日起至实际付清时止的利息。案件受理费2000元，由北京博鳌纵横网络科技有限公司负担，于本判决生效后七日内交纳。如不服本判决，可在判决书送达之日起十五日内向本院递交上诉状，并按对方当事人的人数提出副本，上诉于北京市第一中级人民法院。',
  },
  {
    date: '2023-02-02',
    plaintiff: '广东天睿商务信息咨询有限公司',
    cause: '服务合同纠纷',
    title: '广东天睿商务信息咨询有限公司、广州博鳌纵横网络科技有限公司服务合同纠纷民事一审民事判决书',
    content:
      '一、被告广州博鳌纵横网络科技有限公司于本判决生效之日起七日内向原告广东天睿商务信息咨询有限公司支付合同款项308076.39元及逾期付款利息（以155000元为基数，自2020年11月9日起；以153076.39元为基数，自2020年12月5日起，均按同期全国银行间同业拆借中心公布的一年期贷款市场报价利率计算至实际清偿日止）；二、驳回原告广东天睿商务信息咨询有限公司的其他诉讼请求。如果未按本判决指定的期间履行给付金钱义务，应当按照《中华人民共和国民事诉讼法》第二百六十条之规定，加倍支付迟延履行期间的债务利息。案件受理费4123元，由被告广州博鳌纵横网络科技有限公司负担。上述案件受理费，原告已预缴，本院予以退回，被告应在本判决生效之日起七日内向本院缴纳。如不服本判决，可在判决书送达之日起十五日内，向本院递交上诉状，并按对方当事人的人数提出副本，上诉于广东省广州市中级人民法院。依照《中华人民共和国民事诉讼法》第四十一条第二款规定，符合条件的二审案件，经双方当事人同意，可以由审判员一人独任审理。提起上诉的一方当事人如不同意适用独任制，请于上诉状中明确提出，未提出的，视为同意；被上诉人如不同意适用独任制，请于上诉答辩期间内书面向本院提出，未提出的，视为同意。',
  },
  {
    date: '2023-01-13',
    plaintiff: '广州市诺雅舟动漫科技有限公司',
    cause: '服务合同纠纷',
    title: '广州市诺雅舟动漫科技有限公司、广州博鳌纵横网络科技有限公司服务合同纠纷民事一审民事判决书',
    content:
      '一、被告广州博鳌纵横网络科技有限公司于本判决生效之日起十日内向原告广州市诺雅舟动漫科技有限公司返还服务费79999元及利息[自2022年11月2日起至付清之日止，按同期一年期贷款市场报价利率（LPR）计付]；二、驳回原告广州市诺雅舟动漫科技有限公司的其他诉讼请求。如不服本判决，可在判决书送达之日起十五日内，向本院递状，应当依照《中华人民共和国民事诉讼法》第二百六十条之规定，加倍支付迟延履行期间的债务利息。案件受理费1800元，由被告广州博鳌纵横网络科技有限公司负担。如不服本判决，可在判决书送达之日起十五日内，向本院递',
  },
]

export default function ContractDefaultModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalShell title="合同违约详情" onClose={onClose}>
      <style>{CSS}</style>
      <div className="bg-white text-gray-800 font-sans" style={{ fontSize: 14 }}>
        <div className="w-full max-w-full border border-gray-200 rounded shadow-sm bg-white">
          {/* 头部标题 */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold">合同违约详情</h1>
            <button className="text-gray-400 text-xl" onClick={onClose}>
              ×
            </button>
          </div>

          {/* 违约指数区域 */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-medium">违约指数</span>
              <FaIcon name="question-circle" className="text-gray-400 text-sm" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="header-card p-3 text-center">
                <div className="text-sm text-gray-500">合同违约指数</div>
                <div className="text-2xl font-bold mt-1">55分</div>
              </div>
              <div className="header-card p-3 text-center">
                <div className="text-sm text-gray-500">违约等级</div>
                <div className="text-2xl font-bold text-red-500 mt-1">L6</div>
              </div>
              <div className="header-card p-3 text-center">
                <div className="text-sm text-gray-500">合同违约风险</div>
                <div className="text-2xl font-bold text-red-500 mt-1">高</div>
              </div>
            </div>
          </div>

          {/* 违约统计 */}
          <div className="p-4 border-b border-gray-200">
            <div className="font-medium mb-3">违约统计</div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">违约次数</th>
                  <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">被执行次数</th>
                  <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">违约金额</th>
                  <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">违约金额行业排名</th>
                  <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">违约金额行业平均数</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-center text-sm">59</td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-sm">264</td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-sm">1.68亿元</td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-sm">100%</td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-sm">303.07万元</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 违约详情表格 */}
          <div className="p-4">
            <div className="font-medium mb-3">违约详情</div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium w-[120px]">判决日期</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium w-[180px]">原告</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium w-[100px]">案由</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">判决详情</th>
                </tr>
              </thead>
              <tbody>
                {DETAILS.map((d) => (
                  <tr key={d.date}>
                    <td className="border border-gray-300 px-3 py-2 text-sm align-top">{d.date}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm align-top">{d.plaintiff}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm align-top">{d.cause}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm align-top">
                      <span className="text-blue-600">{d.title}</span>
                      <br />
                      {d.content}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 分页与底部操作 */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                共 59 条 &nbsp;&nbsp; 5条/页 <FaIcon name="caret-down" className="text-gray-400" />
              </div>
              <div className="flex items-center gap-2">
                <button className="px-2 py-1 border border-gray-300 rounded text-sm">&lt;</button>
                <button className="px-2 py-1 bg-blue-500 text-white rounded text-sm">1</button>
                <button className="px-2 py-1 border border-gray-300 rounded text-sm">2</button>
                <button className="px-2 py-1 border border-gray-300 rounded text-sm">3</button>
                <button className="px-2 py-1 border border-gray-300 rounded text-sm">4</button>
                <span>…</span>
                <button className="px-2 py-1 border border-gray-300 rounded text-sm">12</button>
                <button className="px-2 py-1 border border-gray-300 rounded text-sm">&gt;</button>
                <span className="text-sm">
                  前往 <input type="text" className="w-8 border border-gray-300 rounded px-1 text-center" /> 页
                </span>
              </div>
              <button className="bg-yellow-400 px-4 py-2 rounded text-sm font-medium">下载</button>
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  )
}
