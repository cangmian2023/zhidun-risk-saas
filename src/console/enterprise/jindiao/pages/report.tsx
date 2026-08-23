import { useState } from 'react'
import { EpPage, EpCard, EpBtn, useSample, Sam } from '../../epCommon'
import { usePageNav } from '../../../pageNav'
import { useNavigate } from 'react-router-dom'
import { Modal } from '../../../../components/ui'

const SEED = {
  score: 85,
  rating: '中风险',
  basic: {
    企业名称: '抖音有限公司',
    统一社会信用代码: '91110108MA01C5P06L',
    法定代表人: '张利东',
    类型: '有限责任公司(法人独资)',
    成立日期: '2018-06-11',
    注册资本: '1000万人民币',
    经营状态: '存续',
    登记机关: '北京市海淀区市场监督管理局',
    注册地址: '北京市海淀区北三环西路甲18号院4号楼2层202',
    经营范围: '技术开发、技术咨询、技术服务；设计、制作、代理、发布广告；从事互联网文化活动；演出经纪；文艺表演；出版物零售；广播电视节目制作；互联网信息服务。',
  },
  changes: [
    { 序号: '1', 变更日期: '2021-03-15', 变更事项: '法定代表人', 变更前: '张一鸣', 变更后: '张利东', 登记机关: '北京市海淀区市场监督管理局' },
    { 序号: '2', 变更日期: '2020-08-22', 变更事项: '注册资本', 变更前: '100万人民币', 变更后: '1000万人民币', 登记机关: '北京市海淀区市场监督管理局' },
    { 序号: '3', 变更日期: '2019-11-05', 变更事项: '经营范围', 变更前: '技术开发；设计、制作、代理、发布广告', 变更后: '技术开发、技术咨询、技术服务；从事互联网文化活动；演出经纪', 登记机关: '北京市海淀区市场监督管理局' },
  ],
  penalties: [
    { 序号: '1', 处罚日期: '2022-05-18', 处罚事由: '发布违法广告', 处罚结果: '罚款人民币20万元', 处罚机关: '北京市海淀区市场监督管理局', 处罚文号: '京海市监处罚〔2022〕1234号' },
    { 序号: '2', 处罚日期: '2021-09-30', 处罚事由: '未依法办理变更登记', 处罚结果: '警告', 处罚机关: '北京市海淀区市场监督管理局', 处罚文号: '京海市监处罚〔2021〕0876号' },
  ],
  lawsuits: [
    { 序号: '1', 案号: '(2023)京0108民初12345号', 案件名称: '劳动争议', 案件类型: '民事案件', 立案日期: '2023-02-10', 审理法院: '北京市海淀区人民法院', 标的额: '12.5万元', 案件状态: '已结案', 当事人地位: '被告' },
    { 序号: '2', 案号: '(2022)京0108民初9876号', 案件名称: '著作权侵权纠纷', 案件类型: '民事案件', 立案日期: '2022-07-21', 审理法院: '北京市海淀区人民法院', 标的额: '80万元', 案件状态: '已结案', 当事人地位: '原告' },
    { 序号: '3', 案号: '(2023)京01民终4567号', 案件名称: '合同纠纷', 案件类型: '民事案件', 立案日期: '2023-01-15', 审理法院: '北京市第一中级人民法院', 标的额: '350万元', 案件状态: '审理中', 当事人地位: '被上诉人' },
  ],
  patents: [
    { 序号: '1', 标题: '一种视频内容推荐方法及装置', 申请号: 'CN202110123456.7', 申请日: '2021-01-20', 公开日: '2022-07-22', 状态: '授权', 类型: '发明专利', 权人: '抖音有限公司' },
    { 序号: '2', 标题: '短视频特效渲染系统', 申请号: 'CN202010987654.3', 申请日: '2020-09-11', 公开日: '2021-03-15', 状态: '授权', 类型: '发明专利', 权人: '抖音有限公司' },
    { 序号: '3', 标题: '直播互动方法及终端', 申请号: 'CN202210111222.5', 申请日: '2022-02-08', 公开日: '2023-05-30', 状态: '审中', 类型: '发明专利', 权人: '抖音有限公司' },
  ],
  software: [
    { 序号: '1', 软件名称: '抖音短视频软件', 登记号: '2021SR0345678', 版本: 'V8.2.0', 登记日期: '2021-04-12', 权利人: '抖音有限公司' },
    { 序号: '2', 软件名称: '剪映视频编辑软件', 登记号: '2020SR0987654', 版本: 'V4.0.1', 登记日期: '2020-11-03', 权利人: '抖音有限公司' },
  ],
  news: [
    { 序号: '1', 日期: '2023-06-01', 标题: '抖音有限公司入选年度最具创新力企业榜单', 来源: '经济日报', 情感: '正面', 摘要: '抖音有限公司凭借在短视频与人工智能领域的持续投入，入选本年度最具创新力企业。' },
    { 序号: '2', 日期: '2023-03-15', 标题: '抖音因数据合规问题被约谈', 来源: '人民日报', 情感: '负面', 摘要: '监管部门就用户数据合规问题对抖音有限公司进行约谈，要求限期整改。' },
    { 序号: '3', 日期: '2022-12-20', 标题: '抖音上线助农直播专区', 来源: '新华网', 情感: '正面', 摘要: '抖音有限公司联合多地政府推出助农直播专区，助力农产品上行。' },
  ],
  relations: [
    { 序号: '1', 关联企业: '北京字节跳动科技有限公司', 关系: '控股股东', 持股比例: '100%', 注册资本: '10000万人民币', 法定代表人: '张利东' },
    { 序号: '2', 关联企业: '抖音视界（上海）有限公司', 关系: '全资子公司', 持股比例: '100%', 注册资本: '5000万人民币', 法定代表人: '李英' },
    { 序号: '3', 关联企业: '字跳智创（北京）科技有限公司', 关系: '参股公司', 持股比例: '35%', 注册资本: '2000万人民币', 法定代表人: '王迪' },
  ],
  employees: [
    { 序号: '1', 姓名: '张利东', 职务: '法定代表人 / 董事长', 任职日期: '2021-03-15', 持股比例: '-' },
    { 序号: '2', 姓名: '李英', 职务: '董事 / 总经理', 任职日期: '2021-03-15', 持股比例: '-' },
    { 序号: '3', 姓名: '王迪', 职务: '监事', 任职日期: '2021-03-15', 持股比例: '-' },
  ],
  finance: {
    近一年营业收入: '320亿元',
    净利润: '75亿元',
    资产总额: '560亿元',
    负债总额: '180亿元',
    纳税总额: '28亿元',
    社保参保人数: '12450人',
  },
  risks: [
    { 序号: '1', 风险类别: '司法风险', 风险描述: '存在劳动争议及合同纠纷案件', 风险等级: '中', 建议: '关注用工合规与合同管理' },
    { 序号: '2', 风险类别: '监管风险', 风险描述: '数据合规被约谈并限期整改', 风险等级: '高', 建议: '建立数据合规专项治理机制' },
    { 序号: '3', 风险类别: '经营风险', 风险描述: '行业竞争加剧，用户增长放缓', 风险等级: '中', 建议: '拓展新业务曲线，强化内容生态' },
  ],
}

const REVIEW_OPTS = ['直接通过', '低风险', '中风险', '高风险', '不通过']

function block(t: string, c: React.ReactNode) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', padding: '8px 12px', background: '#f1f5f9', borderRadius: 8, marginBottom: 10 }}>{t}</div>
      {c}
    </div>
  )
}
function kv(k: string, v: React.ReactNode) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '6px 12px', borderBottom: '1px dashed #eef2f7' }}>
      <span style={{ width: 150, color: '#64748b', flexShrink: 0 }}>{k}</span>
      <span style={{ color: '#0f172a' }}>{v}</span>
    </div>
  )
}

export default function JdReport() {
  const d = useSample('jdReport.json', SEED)
  const nav = usePageNav()
  const rnav = useNavigate()
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewOpinion, setReviewOpinion] = useState('直接通过')
  const [reviewText, setReviewText] = useState('')
  const legalPerson = d.basic.法定代表人

  return (
    <EpPage title="企业尽调报告" right={
      <EpBtn onClick={() => setReviewOpen(true)}>人工复核</EpBtn>
    }>
      <Sam value="企业尽调报告样例" />

      {/* 概览 */}
      <EpCard>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: '#2563eb' }}>{d.score}</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>企业得分</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#d97706' }}>{d.rating}</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>风险等级</div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>{d.basic.企业名称}</div>
        </div>
      </EpCard>

      {/* 基本信息 */}
      <EpCard title="基本信息">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 24 }}>
          {kv('企业名称', d.basic.企业名称)}
          {kv('统一社会信用代码', d.basic.统一社会信用代码)}
          {kv('法定代表人', <span style={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => rnav('/console/dm/person-archive-basic?name=' + encodeURIComponent(legalPerson))}>{legalPerson}</span>)}
          {kv('类型', d.basic.类型)}
          {kv('成立日期', d.basic.成立日期)}
          {kv('注册资本', d.basic.注册资本)}
          {kv('经营状态', d.basic.经营状态)}
          {kv('登记机关', d.basic.登记机关)}
          {kv('注册地址', d.basic.注册地址)}
        </div>
        <div style={{ padding: '6px 12px' }}>
          <span style={{ color: '#64748b' }}>经营范围：</span>
          <span style={{ color: '#0f172a' }}>{d.basic.经营范围}</span>
        </div>
      </EpCard>

      {/* 工商变更 */}
      <EpCard title="工商变更记录">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#475569' }}>
              <th style={th}>序号</th><th style={th}>变更日期</th><th style={th}>变更事项</th><th style={th}>变更前</th><th style={th}>变更后</th><th style={th}>登记机关</th>
            </tr>
          </thead>
          <tbody>
            {d.changes.map(r => (
              <tr key={r.序号} style={{ borderTop: '1px solid #eef2f7' }}>
                <td style={td}>{r.序号}</td><td style={td}>{r.变更日期}</td><td style={td}>{r.变更事项}</td><td style={td}>{r.变更前}</td><td style={td}>{r.变更后}</td><td style={td}>{r.登记机关}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </EpCard>

      {/* 行政处罚 */}
      <EpCard title="行政处罚记录">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#475569' }}>
              <th style={th}>序号</th><th style={th}>处罚日期</th><th style={th}>处罚事由</th><th style={th}>处罚结果</th><th style={th}>处罚机关</th><th style={th}>处罚文号</th>
            </tr>
          </thead>
          <tbody>
            {d.penalties.map(r => (
              <tr key={r.序号} style={{ borderTop: '1px solid #eef2f7' }}>
                <td style={td}>{r.序号}</td><td style={td}>{r.处罚日期}</td><td style={td}>{r.处罚事由}</td><td style={td}>{r.处罚结果}</td><td style={td}>{r.处罚机关}</td><td style={td}>{r.处罚文号}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </EpCard>

      {/* 司法诉讼 */}
      <EpCard title="司法诉讼记录">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#475569' }}>
              <th style={th}>序号</th><th style={th}>案号</th><th style={th}>案件名称</th><th style={th}>类型</th><th style={th}>立案日期</th><th style={th}>审理法院</th><th style={th}>标的额</th><th style={th}>状态</th><th style={th}>地位</th>
            </tr>
          </thead>
          <tbody>
            {d.lawsuits.map(r => (
              <tr key={r.序号} style={{ borderTop: '1px solid #eef2f7' }}>
                <td style={td}>{r.序号}</td><td style={td}>{r.案号}</td><td style={td}>{r.案件名称}</td><td style={td}>{r.案件类型}</td><td style={td}>{r.立案日期}</td><td style={td}>{r.审理法院}</td><td style={td}>{r.标的额}</td><td style={td}>{r.案件状态}</td><td style={td}>{r.当事人地位}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </EpCard>

      {/* 知识产权 */}
      <EpCard title="知识产权">
        {block('专利', (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#475569' }}>
                <th style={th}>序号</th><th style={th}>标题</th><th style={th}>申请号</th><th style={th}>申请日</th><th style={th}>公开日</th><th style={th}>状态</th><th style={th}>类型</th><th style={th}>权利人</th>
              </tr>
            </thead>
            <tbody>
              {d.patents.map(r => (
                <tr key={r.序号} style={{ borderTop: '1px solid #eef2f7' }}>
                  <td style={td}>{r.序号}</td><td style={td}>{r.标题}</td><td style={td}>{r.申请号}</td><td style={td}>{r.申请日}</td><td style={td}>{r.公开日}</td><td style={td}>{r.状态}</td><td style={td}>{r.类型}</td><td style={td}>{r.权人}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
        {block('软件著作权', (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#475569' }}>
                <th style={th}>序号</th><th style={th}>软件名称</th><th style={th}>登记号</th><th style={th}>版本</th><th style={th}>登记日期</th><th style={th}>权利人</th>
              </tr>
            </thead>
            <tbody>
              {d.software.map(r => (
                <tr key={r.序号} style={{ borderTop: '1px solid #eef2f7' }}>
                  <td style={td}>{r.序号}</td><td style={td}>{r.软件名称}</td><td style={td}>{r.登记号}</td><td style={td}>{r.版本}</td><td style={td}>{r.登记日期}</td><td style={td}>{r.权利人}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </EpCard>

      {/* 新闻舆情 */}
      <EpCard title="新闻舆情">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#475569' }}>
              <th style={th}>序号</th><th style={th}>日期</th><th style={th}>标题</th><th style={th}>来源</th><th style={th}>情感</th><th style={th}>摘要</th>
            </tr>
          </thead>
          <tbody>
            {d.news.map(r => (
              <tr key={r.序号} style={{ borderTop: '1px solid #eef2f7' }}>
                <td style={td}>{r.序号}</td><td style={td}>{r.日期}</td><td style={td}>{r.标题}</td><td style={td}>{r.来源}</td><td style={td}>{r.情感}</td><td style={td}>{r.摘要}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </EpCard>

      {/* 关联企业 */}
      <EpCard title="关联企业">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#475569' }}>
              <th style={th}>序号</th><th style={th}>关联企业</th><th style={th}>关系</th><th style={th}>持股比例</th><th style={th}>注册资本</th><th style={th}>法定代表人</th>
            </tr>
          </thead>
          <tbody>
            {d.relations.map(r => (
              <tr key={r.序号} style={{ borderTop: '1px solid #eef2f7' }}>
                <td style={td}>{r.序号}</td><td style={td}>{r.关联企业}</td><td style={td}>{r.关系}</td><td style={td}>{r.持股比例}</td><td style={td}>{r.注册资本}</td><td style={td}>{r.法定代表人}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </EpCard>

      {/* 主要人员 */}
      <EpCard title="主要人员">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#475569' }}>
              <th style={th}>序号</th><th style={th}>姓名</th><th style={th}>职务</th><th style={th}>任职日期</th><th style={th}>持股比例</th>
            </tr>
          </thead>
          <tbody>
            {d.employees.map(r => (
              <tr key={r.序号} style={{ borderTop: '1px solid #eef2f7' }}>
                <td style={td}>{r.序号}</td><td style={td}>{r.姓名}</td><td style={td}>{r.职务}</td><td style={td}>{r.任职日期}</td><td style={td}>{r.持股比例}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </EpCard>

      {/* 财务概要 */}
      <EpCard title="财务概要">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 24 }}>
          {kv('近一年营业收入', d.finance.近一年营业收入)}
          {kv('净利润', d.finance.净利润)}
          {kv('资产总额', d.finance.资产总额)}
          {kv('负债总额', d.finance.负债总额)}
          {kv('纳税总额', d.finance.纳税总额)}
          {kv('社保参保人数', d.finance.社保参保人数)}
        </div>
      </EpCard>

      {/* 风险提示 */}
      <EpCard title="风险提示">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#475569' }}>
              <th style={th}>序号</th><th style={th}>风险类别</th><th style={th}>风险描述</th><th style={th}>风险等级</th><th style={th}>建议</th>
            </tr>
          </thead>
          <tbody>
            {d.risks.map(r => (
              <tr key={r.序号} style={{ borderTop: '1px solid #eef2f7' }}>
                <td style={td}>{r.序号}</td><td style={td}>{r.风险类别}</td><td style={td}>{r.风险描述}</td><td style={td}>{r.风险等级}</td><td style={td}>{r.建议}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </EpCard>

      {/* 人工复核弹窗 */}
      <Modal open={reviewOpen} onClose={() => setReviewOpen(false)} title="人工复核" footer={
        <>
          <EpBtn ghost onClick={() => setReviewOpen(false)}>取消</EpBtn>
          <EpBtn onClick={() => setReviewOpen(false)}>提交复核</EpBtn>
        </>
      }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 90, color: '#64748b' }}>公司得分</span>
            <input value={`${d.score}分`} disabled readOnly style={{ flex: 1, padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#f8fafc', color: '#94a3b8' }} />
            <span style={{ color: '#64748b', fontSize: 13 }}>自动审核：不通过</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 90, color: '#64748b' }}>复核意见</span>
            <select value={reviewOpinion} onChange={e => setReviewOpinion(e.target.value)} style={{ flex: 1, padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 8 }}>
              {REVIEW_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ color: '#64748b' }}>输入复核意见</span>
            <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} rows={4} placeholder="请输入复核意见" style={{ padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 8, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ color: '#64748b' }}>上传附件</span>
            <input type="file" multiple style={{ fontSize: 13 }} />
          </div>
        </div>
      </Modal>
    </EpPage>
  )
}

const th: React.CSSProperties = { textAlign: 'left', padding: '8px 10px', fontWeight: 600, whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '8px 10px', color: '#334155', verticalAlign: 'top' }
