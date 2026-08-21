import React, { useState } from 'react';

// 范围下拉选项
const scopeOptions = ['1km', '3km', '5km', '10km', '20km'];

// 可视区6组统计数据
const statList = [
  { num: '62万', label: '企业' },
  { num: '17万', label: '新商机' },
  { num: '0', label: '存客商机' },
  { num: '2518', label: '新增企业' },
  { num: '134', label: '园区' },
  { num: '49', label: '协会' },
];

// 点击统计卡片后加载的明细列表（公司名 / 地址）
const detailData: Record<string, { name: string; address: string }[]> = {
  企业: [
    { name: '广州粤信科技有限公司', address: '广州市天河区科韵路16号' },
    { name: '广州生物医药产业园', address: '广州市黄埔区科学城揽月路80号' },
    { name: '广州人工智能研究院', address: '广州市海珠区新港西路135号' },
    { name: '广州工业互联网中心', address: '广州市番禺区兴业大道西' },
  ],
  新商机: [
    { name: '广州智造电子有限公司', address: '广州市南沙区黄阁大道北' },
    { name: '广州云图数据科技', address: '广州市天河区软件路17号' },
    { name: '广州链通供应链', address: '广州市白云区太和镇' },
  ],
  存客商机: [],
  新增企业: [
    { name: '广州星航互动科技', address: '广州市天河区珠江新城华夏路' },
    { name: '广州绿源环保材料', address: '广州市花都区新华街' },
    { name: '广州康融医疗器械', address: '广州市黄埔区光谱中路' },
    { name: '广州数联网络技术', address: '广州市越秀区东风中路' },
  ],
  园区: [
    { name: '广州科学城', address: '广州市黄埔区科学城' },
    { name: '广州国际生物岛', address: '广州市海珠区官洲街道' },
    { name: '广州天河软件园', address: '广州市天河区高普路' },
  ],
  协会: [
    { name: '广州市软件行业协会', address: '广州市天河区天河北路' },
    { name: '广州电子商务协会', address: '广州市越秀区解放南路' },
  ],
};

export default function DmGridMarketing() {
  const [scope, setScope] = useState('5km');
  const [openStat, setOpenStat] = useState<string | null>(null);

  const list = openStat ? detailData[openStat] || [] : [];

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 左侧面板 */}
        <div style={{ width: '320px', borderRight: '1px solid #e5e7eb', padding: '16px', overflowY: 'auto' }}>
          {/* 公司名称 + 范围下拉 + 修改 一行 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', color: '#333', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              广州粤信科技有限公司
            </span>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              style={{ border: '1px solid #d1d5db', borderRadius: '4px', padding: '4px 8px', fontSize: '14px', color: '#333' }}
            >
              {scopeOptions.map((o) => (
                <option key={o} value={o}>范围: {o}</option>
              ))}
            </select>
            <span style={{ fontSize: '14px', color: '#0066cc', cursor: 'pointer', whiteSpace: 'nowrap' }}>修改</span>
          </div>

          {/* 6个统计卡片 3列2行，点击加载明细列表 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
            {statList.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setOpenStat(openStat === item.label ? null : item.label)}
                style={{
                  backgroundColor: openStat === item.label ? '#e6f0fa' : '#f9fafb',
                  border: openStat === item.label ? '1px solid #0066cc' : '1px solid transparent',
                  borderRadius: '4px',
                  padding: '8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#0066cc' }}>{item.num}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* 统计卡片明细列表：点击卡片后在左侧下方加载 */}
          {openStat && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', color: '#0066cc', fontWeight: 500, marginBottom: '8px' }}>
                {openStat}明细（{list.length}）
              </div>
              {list.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {list.map((c, i) => (
                    <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '8px' }}>
                      <div style={{ fontSize: '13px', color: '#333', fontWeight: 500 }}>{c.name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{c.address}</div>
                      <div style={{ marginTop: '6px', textAlign: 'right' }}>
                        <button
                          style={{ fontSize: '12px', color: '#0066cc', border: '1px solid #0066cc', borderRadius: '4px', padding: '2px 10px', background: '#fff', cursor: 'pointer' }}
                        >
                          查看商机
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', padding: '16px 0' }}>暂无数据</div>
              )}
            </div>
          )}
        </div>

        {/* 右侧地图区域：水印 + 彩色气泡占位 */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#eee' }}>
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundImage: `
                repeating-linear-gradient(45deg, rgba(100,149,237,0.08) 0, rgba(100,149,237,0.08) 120px, transparent 120px, transparent 240px),
                repeating-linear-gradient(-45deg, rgba(100,149,237,0.08) 0, rgba(100,149,237,0.08) 120px, transparent 120px, transparent 240px)
              `,
              position: 'relative',
            }}
          >
            <div style={{
              position: 'absolute', top: '12%', left: '42%',
              width: '120px', height: '120px', borderRadius: '50%',
              backgroundColor: '#f97316', opacity: 0.85,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 'bold', fontSize: '14px'
            }}>
              <div>2518</div>
              <div>新增企业</div>
            </div>
            <div style={{
              position: 'absolute', top: '32%', left: '22%',
              width: '100px', height: '100px', borderRadius: '50%',
              backgroundColor: '#f59e0b', opacity: 0.85,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 'bold', fontSize: '14px'
            }}>
              <div>134</div>
              <div>园区</div>
            </div>
            <div style={{
              position: 'absolute', top: '34%', left: '62%',
              width: '100px', height: '100px', borderRadius: '50%',
              backgroundColor: '#15803d', opacity: 0.85,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 'bold', fontSize: '14px'
            }}>
              <div>49</div>
              <div>协会</div>
            </div>
            <div style={{
              position: 'absolute', top: '62%', left: '28%',
              width: '140px', height: '140px', borderRadius: '50%',
              backgroundColor: '#0e7490', opacity: 0.85,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 'bold', fontSize: '14px'
            }}>
              <div>628555</div>
              <div>企业</div>
            </div>
            <div style={{
              position: 'absolute', top: '62%', left: '56%',
              width: '120px', height: '120px', borderRadius: '50%',
              backgroundColor: '#2563eb', opacity: 0.85,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 'bold', fontSize: '14px'
            }}>
              <div>177769</div>
              <div>新商机</div>
            </div>

            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(-15deg)',
              fontSize: '28px',
              color: 'rgba(80, 120, 200, 0.32)',
              fontWeight: 500,
              letterSpacing: '6px',
              userSelect: 'none',
            }}>
              区域地图 · 水印占位
            </div>
          </div>

          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '12px',
            cursor: 'pointer',
          }}>
            全屏
          </div>
        </div>
      </div>
    </div>
  );
}
