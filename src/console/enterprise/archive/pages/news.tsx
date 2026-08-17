// 企业档案 · 新闻舆情（arc-news）· 1:1 复刻「企业档案 - 新闻舆情」
// 数据：本地样例 arcNews.json（橘 Sam）
import { useState } from 'react'
import { EpPage, EpCard, EpTag, EpBtn, useSample, Sam } from '../../epCommon'
import type { Row } from '../../../../components/ui'

const seed = {
  total: 901597,
  news: [
    { id: 1, title: '从猜你喜欢到算你懂我—AIGC如何让服装品牌精准抓住每一个顾客', sentiment: '中立', topic: '科技', level: 'A级', media: '新浪财经', date: '2026-08-17 13:43' },
    { id: 2, title: '中产男人疯狂买单？抖音头部男装品牌“秦磊男装”爆火出圈，曾单月爆卖8000万', sentiment: '中立', topic: '时尚', level: 'B级', media: '36氪', date: '2026-08-17 13:29' },
    { id: 3, title: '阿里甩卖游戏帝国，一切只为AGI？', sentiment: '中立', topic: '游戏', level: 'C级', media: '网易', date: '2026-08-17 13:25' },
    { id: 4, title: '绿色算力（人工智能）大会即将于呼和浩特举办 一批百亿级项目将集中签约', sentiment: '积极', topic: '科技', level: 'A级', media: '新华社', date: '2026-08-17 13:10' },
    { id: 5, title: '某短视频平台因青少年模式落实不到位被监管部门约谈', sentiment: '消极', topic: '监管', level: 'A级', media: '国家市场监管报', date: '2026-08-16 18:02' },
    { id: 6, title: '抖音集团发布2026年第二季度社会责任报告，披露内容治理成效', sentiment: '积极', topic: '资质成果', level: 'B级', media: '中国经济网', date: '2026-08-16 10:30' },
  ],
  relatedCompanies: [
    { id: 1, name: '北京抖音信息服务有限公司', count: 305791, rate: '59.81%' },
    { id: 2, name: '北京京东世纪贸易有限公司', count: 6665, rate: '1.3%' },
    { id: 3, name: '深圳市腾讯计算机系统有限公司', count: 5465, rate: '1.07%' },
  ],
  relatedOrgs: [
    { id: 1, name: '清华大学', count: 1149, rate: '6.58%' },
    { id: 2, name: '北京大学', count: 616, rate: '3.53%' },
    { id: 3, name: '上海证券交易所（中国证券博物馆）', count: 553, rate: '3.16%' },
  ],
  relatedPersons: [
    { id: 1, name: '于抖音', count: 1603, rate: '1.58%' },
    { id: 2, name: '抖音', count: 868, rate: '0.86%' },
    { id: 3, name: '特朗普', count: 811, rate: '0.8%' },
  ],
}

const sentimentColor: Record<string, { c: string; b: string }> = {
  消极: { c: '#B91C1C', b: '#FEF2F2' },
  中立: { c: '#64748B', b: '#F1F5F9' },
  积极: { c: '#15803D', b: '#F0FDF4' },
}

export default function News({ params }: { params: URLSearchParams }) {
  const [data] = useSample('arcNews.json', seed)
  const [kw, setKw] = useState('')
  const rows = data.news.filter((n) => !kw || n.title.includes(kw) || n.media.includes(kw))

  const relCol = (label: string, list: { id: number; name: string; count: number; rate: string }[]) => (
    <EpCard title={label} className="mb-4">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {list.map((x) => (
          <div key={x.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: '#0F172A' }}>{x.name}</span>
            <span style={{ color: '#64748B' }}>
              ({x.count}) <b style={{ color: '#DC2626' }}>{x.rate}</b>
            </span>
          </div>
        ))}
      </div>
    </EpCard>
  )

  return (
    <EpPage
      title="企业档案 · 新闻舆情"
      subtitle={`共找到 ${data.total.toLocaleString()} 条结果`}
      crumb="企业档案 / 新闻舆情"
      actions={<EpBtn variant="primary">下载前2000条</EpBtn>}
    >
      {/* 筛选区 */}
      <EpCard className="mb-4">
        <div className="text-[13px] font-semibold text-slate-700" style={{ marginBottom: 8 }}>条件筛选</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <select style={{ padding: '7px 10px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13 }}>
            <option>舆情分类：全部</option>
            <option>员工</option>
            <option>经营</option>
            <option>资本市场</option>
            <option>监管</option>
            <option>违法违规</option>
            <option>产品</option>
            <option>其他</option>
          </select>
          <select style={{ padding: '7px 10px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13 }}>
            <option>情感属性：全部</option>
            <option>消极</option>
            <option>中立</option>
            <option>积极</option>
          </select>
          <select style={{ padding: '7px 10px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13 }}>
            <option>主题分类：全部</option>
            <option>财经</option>
            <option>科技</option>
            <option>游戏</option>
            <option>时尚</option>
            <option>房产</option>
          </select>
          <select style={{ padding: '7px 10px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13 }}>
            <option>媒体等级：全部</option>
            <option>A级</option>
            <option>B级</option>
            <option>C级</option>
            <option>D级</option>
          </select>
          <input
            value={kw}
            onChange={(e) => setKw(e.target.value)}
            placeholder="搜索标题 / 媒体"
            style={{ flex: 1, minWidth: 200, padding: '7px 10px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13 }}
          />
          <EpBtn variant="primary" size="sm">找到 {data.total.toLocaleString()} 条结果</EpBtn>
          <EpBtn variant="ghost" size="sm">合并相似</EpBtn>
        </div>
      </EpCard>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>
        {/* 舆情列表 */}
        <EpCard title="舆情动态" desc={<Sam value="arcNews.json" />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {rows.map((n) => {
              const sc = sentimentColor[n.sentiment] ?? sentimentColor['中立']
              return (
                <div key={n.id} style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', lineHeight: 1.5 }}>{n.title}</div>
                  <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', fontSize: 12, color: '#64748B' }}>
                    <EpTag color={sc.c} bg={sc.b}>{n.sentiment}</EpTag>
                    <EpTag>{n.topic}</EpTag>
                    <EpTag color="#2563EB" bg="#EFF6FF">{n.level}</EpTag>
                    <span>#其他新闻</span>
                    <span>{n.media}</span>
                    <span>{n.date}</span>
                  </div>
                </div>
              )
            })}
            {rows.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: '#94A3B8' }}>暂无匹配舆情</div>}
          </div>
        </EpCard>

        {/* 侧栏：相关企业 / 组织 / 人员 */}
        <div>
          <EpCard title="相关企业 Top10" className="mb-4">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.relatedCompanies.map((x) => (
                <div key={x.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#0F172A' }}>{x.name}</span>
                  <span style={{ color: '#64748B' }}>({x.count.toLocaleString()}) <b style={{ color: '#DC2626' }}>{x.rate}</b></span>
                </div>
              ))}
            </div>
          </EpCard>
          {relCol('相关组织', data.relatedOrgs)}
          {relCol('相关人员', data.relatedPersons)}
        </div>
      </div>
    </EpPage>
  )
}
