// 风控中心 · 风险地图（fk-map）· 1:1 复刻「风控 - 风险地图」
// SVG 简易中国地图 + 热力点；时间维度切换 今日/最近7天/最近30天；风险预警分布 / 监控企业分布
// 数据：本地样例 fkMap.json（橘 Sam）
import { useState } from 'react'
import { EpPage, EpCard, EpStat, useSample, Sam } from '../epCommon'
import type { Row, Column } from '../../../../components/ui'

type MapData = typeof seed

const seed = {
  monitorCount: 16,
  globalWarningTotal: 248,
  updateTime: '2026-08-17 15:40',
  mapViewBox: { w: 1000, h: 760 },
  cities: [
    { name: '北京', x: 720, y: 250, level: 'high', enterprise: '抖音有限公司', count: 4 },
    { name: '上海', x: 805, y: 375, level: 'high', enterprise: '上海寻梦信息技术有限公司', count: 3 },
    { name: '深圳', x: 720, y: 510, level: 'mid', enterprise: '深圳市腾讯计算机系统有限公司', count: 2 },
    { name: '广州', x: 700, y: 525, level: 'mid', enterprise: '广州唯品会电子商务有限公司', count: 1 },
    { name: '成都', x: 520, y: 405, level: 'mid', enterprise: '成都某科技有限公司', count: 1 },
    { name: '西安', x: 600, y: 330, level: 'low', enterprise: '西安迈科金属国际集团', count: 1 },
    { name: '武汉', x: 700, y: 395, level: 'mid', enterprise: '武汉斗鱼鱼乐网络科技', count: 1 },
    { name: '杭州', x: 792, y: 392, level: 'high', enterprise: '阿里巴巴(中国)有限公司', count: 2 },
    { name: '沈阳', x: 828, y: 210, level: 'low', enterprise: '沈阳机床(集团)有限责任公司', count: 1 },
    { name: '乌鲁木齐', x: 250, y: 240, level: 'low', enterprise: '新疆大全新能源股份有限公司', count: 1 },
    { name: '拉萨', x: 340, y: 430, level: 'low', enterprise: '西藏天路股份有限公司', count: 1 },
    { name: '昆明', x: 520, y: 505, level: 'low', enterprise: '云南白药集团股份有限公司', count: 1 },
    { name: '重庆', x: 580, y: 425, level: 'mid', enterprise: '重庆小康工业集团', count: 1 },
    { name: '郑州', x: 700, y: 345, level: 'mid', enterprise: '郑州宇通客车股份有限公司', count: 1 },
    { name: '南京', x: 778, y: 360, level: 'low', enterprise: '苏宁易购集团股份有限公司', count: 1 },
    { name: '长沙', x: 700, y: 445, level: 'low', enterprise: '三一集团有限公司', count: 1 },
  ],
  timeDist: {
    today: { label: '今日', warningTotal: 28, points: [
      { name: '北京', x: 720, y: 250, level: 'high', count: 2 },
      { name: '上海', x: 805, y: 375, level: 'high', count: 1 },
      { name: '杭州', x: 792, y: 392, level: 'mid', count: 1 },
      { name: '深圳', x: 720, y: 510, level: 'mid', count: 1 },
      { name: '广州', x: 700, y: 525, level: 'low', count: 1 },
      { name: '武汉', x: 700, y: 395, level: 'low', count: 1 },
    ] },
    '7d': { label: '最近7天', warningTotal: 142, points: [
      { name: '北京', x: 720, y: 250, level: 'high', count: 9 },
      { name: '上海', x: 805, y: 375, level: 'high', count: 7 },
      { name: '杭州', x: 792, y: 392, level: 'high', count: 5 },
      { name: '深圳', x: 720, y: 510, level: 'mid', count: 4 },
      { name: '广州', x: 700, y: 525, level: 'mid', count: 3 },
      { name: '成都', x: 520, y: 405, level: 'mid', count: 2 },
      { name: '武汉', x: 700, y: 395, level: 'mid', count: 2 },
      { name: '重庆', x: 580, y: 425, level: 'low', count: 2 },
      { name: '郑州', x: 700, y: 345, level: 'low', count: 1 },
      { name: '南京', x: 778, y: 360, level: 'low', count: 1 },
    ] },
    '30d': { label: '最近30天', warningTotal: 248, points: [
      { name: '北京', x: 720, y: 250, level: 'high', count: 18 },
      { name: '上海', x: 805, y: 375, level: 'high', count: 14 },
      { name: '杭州', x: 792, y: 392, level: 'high', count: 11 },
      { name: '深圳', x: 720, y: 510, level: 'mid', count: 9 },
      { name: '广州', x: 700, y: 525, level: 'mid', count: 7 },
      { name: '成都', x: 520, y: 405, level: 'mid', count: 5 },
      { name: '武汉', x: 700, y: 395, level: 'mid', count: 5 },
      { name: '重庆', x: 580, y: 425, level: 'mid', count: 4 },
      { name: '西安', x: 600, y: 330, level: 'low', count: 3 },
      { name: '郑州', x: 700, y: 345, level: 'low', count: 3 },
      { name: '南京', x: 778, y: 360, level: 'low', count: 2 },
      { name: '沈阳', x: 828, y: 210, level: 'low', count: 2 },
      { name: '长沙', x: 700, y: 445, level: 'low', count: 2 },
      { name: '昆明', x: 520, y: 505, level: 'low', count: 1 },
      { name: '乌鲁木齐', x: 250, y: 240, level: 'low', count: 1 },
      { name: '拉萨', x: 340, y: 430, level: 'low', count: 1 },
    ] },
  },
  levelMeta: {
    high: { color: '#DC2626', label: '高风险' },
    mid: { color: '#F59E0B', label: '中风险' },
    low: { color: '#10B981', label: '低风险' },
    micro: { color: '#94A3B8', label: '轻微风险' },
  },
}

// 简易中国地图轮廓（stylized，用于定位热力点；非地理精确）
const CHINA_PATH =
  'M 250 250 C 230 200 300 170 380 175 C 470 150 560 140 660 150 C 740 150 800 150 845 165 ' +
  'C 860 200 850 240 825 255 C 835 290 820 300 805 320 C 810 350 806 365 800 380 ' +
  'C 770 430 745 480 720 515 C 705 540 690 555 675 560 C 620 555 560 545 520 540 ' +
  'C 450 510 400 480 360 460 C 320 430 290 390 265 350 C 240 320 225 285 235 260 Z'

function Filter({ placeholder }: { placeholder: string }) {
  return (
    <select
      defaultValue=""
      style={{ padding: '7px 10px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13, color: '#64748B', minWidth: 110 }}
    >
      <option value="">{placeholder}</option>
      <option>请选择</option>
    </select>
  )
}

export default function FkMap({ params }: { params: URLSearchParams }) {
  const [data] = useSample<MapData>('fkMap.json', seed)
  const [range, setRange] = useState<'today' | '7d' | '30d'>('30d')
  const [dist, setDist] = useState<'warning' | 'monitor'>('warning')

  const timePts = data.timeDist[range].points
  const points = dist === 'monitor' ? data.cities : timePts
  const warnTotal = dist === 'monitor' ? data.globalWarningTotal : data.timeDist[range].warningTotal

  // 各风险等级汇总
  const sum = (lv: string) => points.filter((p) => p.level === lv).reduce((s, p) => s + p.count, 0)
  const counts = {
    high: sum('high'), mid: sum('mid'), low: sum('low'), micro: sum('micro'),
  }

  return (
    <EpPage
      title="风险地图"
      subtitle="风控中心风险地理分布"
      crumb="风控中心 / 风险地图"
      actions={<Sam value="fkMap.json" />}
    >
      {/* 筛选 */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
        <Filter placeholder="风险类型" />
        <Filter placeholder="风险等级" />
        <Filter placeholder="负责人/部门" />
        <Filter placeholder="标签" />
        <div style={{ flex: 1 }} />
        {/* 时间维度切换 */}
        <span style={{ fontSize: 12, color: '#94A3B8' }}>截止{data.updateTime}，</span>
        {([['today', '今日'], ['7d', '最近7天'], ['30d', '最近30天']] as const).map(([k, lbl]) => (
          <button
            key={k}
            onClick={() => setRange(k)}
            style={{
              padding: '5px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
              border: '1px solid ' + (range === k ? '#2563EB' : '#CBD5E1'),
              background: range === k ? '#EFF6FF' : '#fff', color: range === k ? '#2563EB' : '#475569',
            }}
          >
            {lbl}
          </button>
        ))}
      </div>

      {/* 分布切换 Tabs */}
      <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid #E2E8F0', marginBottom: 14 }}>
        {([['warning', '风险预警分布'], ['monitor', '监控企业分布']] as const).map(([k, lbl]) => (
          <button
            key={k}
            onClick={() => setDist(k)}
            style={{
              padding: '9px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
              fontSize: 14, fontWeight: dist === k ? 600 : 400,
              color: dist === k ? '#2563EB' : '#64748B',
              borderBottom: dist === k ? '2px solid #2563EB' : '2px solid transparent', marginBottom: -1,
            }}
          >
            {lbl}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>
        {/* 地图 */}
        <EpCard pad={false}>
          <div style={{ position: 'relative' }}>
            <svg viewBox="0 0 1000 760" style={{ width: '100%', height: 'auto', display: 'block', background: '#F8FAFC', borderRadius: 16 }}>
              {/* 经纬网格 */}
              {Array.from({ length: 9 }).map((_, i) => (
                <line key={'v' + i} x1={(i + 1) * 100} y1={0} x2={(i + 1) * 100} y2={760} stroke="#EEF2F7" strokeWidth={1} />
              ))}
              {Array.from({ length: 7 }).map((_, i) => (
                <line key={'h' + i} x1={0} y1={(i + 1) * 100} x2={1000} y2={(i + 1) * 100} stroke="#EEF2F7" strokeWidth={1} />
              ))}
              {/* 中国轮廓 */}
              <path d={CHINA_PATH} fill="#E2E8F0" stroke="#CBD5E1" strokeWidth={1.5} />
              {/* 海南岛 */}
              <circle cx={675} cy={592} r={10} fill="#E2E8F0" stroke="#CBD5E1" strokeWidth={1.5} />
              {/* 台湾岛 */}
              <circle cx={845} cy={470} r={8} fill="#E2E8F0" stroke="#CBD5E1" strokeWidth={1.5} />

              {/* 热力点 */}
              {points.map((p, i) => {
                const c = data.levelMeta[p.level as keyof typeof data.levelMeta].color
                const r = 6 + Math.min(14, p.count * 1.6)
                return (
                  <g key={p.name + i}>
                    <circle cx={p.x} cy={p.y} r={r + 6} fill={c} opacity={0.12} />
                    <circle cx={p.x} cy={p.y} r={r} fill={c} opacity={0.55} stroke={c} strokeWidth={1.5}>
                      <title>{`${p.name}${p.enterprise ? '（' + p.enterprise + '）' : ''}：${p.count} 条${dist === 'monitor' ? '企业' : '风险预警'}`}</title>
                    </circle>
                    <text x={p.x} y={p.y - r - 8} textAnchor="middle" fontSize={12} fill="#334155" fontWeight={600}>{p.name}</text>
                  </g>
                )
              })}

              {/* 示例：暴雨标注（快照含「暴雨」） */}
              {dist === 'warning' && (
                <g>
                  <circle cx={700} cy={525} r={5} fill="#0EA5E9" />
                  <text x={712} y={528} fontSize={12} fill="#0EA5E9" fontWeight={600}>暴雨</text>
                </g>
              )}
            </svg>
            {/* 图例 */}
            <div style={{ position: 'absolute', left: 14, bottom: 14, background: 'rgba(255,255,255,.92)', borderRadius: 10, padding: '8px 12px', fontSize: 12, boxShadow: '0 2px 8px rgba(0,0,0,.08)' }}>
              <div style={{ fontWeight: 600, marginBottom: 4, color: '#475569' }}>风险等级</div>
              {(['high', 'mid', 'low', 'micro'] as const).map((lv) => (
                <div key={lv} style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '2px 0' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: data.levelMeta[lv].color }} />
                  <span style={{ color: '#64748B' }}>{data.levelMeta[lv].label}</span>
                  <b style={{ marginLeft: 4, color: '#334155' }}>{counts[lv]}</b>
                </div>
              ))}
            </div>
            <div style={{ position: 'absolute', right: 12, bottom: 10, fontSize: 10, color: '#94A3B8' }}>© 2026 AutoNavi · GS(2023)4677号</div>
          </div>
        </EpCard>

        {/* 侧栏统计 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <EpStat label="当前全球风险预警共计" value={<span style={{ color: '#DC2626' }}>{warnTotal}</span>} sub={`条（${data.timeDist[range].label}）`} accent="#DC2626" />
          <EpStat label="监控企业" value={data.monitorCount} sub="家" accent="#2563EB" />
          <EpCard title="分布概览" desc="按风险等级">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(['high', 'mid', 'low', 'micro'] as const).map((lv) => (
                <div key={lv} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: data.levelMeta[lv].color }} />
                  <span style={{ fontSize: 13, color: '#64748B' }}>{data.levelMeta[lv].label}</span>
                  <div style={{ flex: 1, height: 8, background: '#F1F5F9', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, (counts[lv] / Math.max(1, warnTotal)) * 100)}%`, height: '100%', background: data.levelMeta[lv].color }} />
                  </div>
                  <b style={{ fontSize: 13, color: '#334155' }}>{counts[lv]}</b>
                </div>
              ))}
            </div>
          </EpCard>
          <EpCard title="企业数量" desc="地图标注企业">
            <div style={{ fontSize: 28, fontWeight: 700, color: '#2563EB' }}>{data.cities.length}<span style={{ fontSize: 14, color: '#94A3B8' }}> 家</span></div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>企业数量: {data.monitorCount}家</div>
          </EpCard>
        </div>
      </div>
    </EpPage>
  )
}
