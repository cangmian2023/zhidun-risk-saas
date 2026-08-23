import { useEffect, useRef, useState } from 'react';
import { PageShell } from './PageShell';
import { Sam } from './SourceTag';

/* 地图拓客 · 按截图 1:1 手写 React 复刻
 * 左侧：Tab 条 + 搜索面板；右侧：大地图区 + 右上角结果浮层
 * 点「点击查看」→ 右侧抽屉：企业搜索结果弹窗（1:1 复刻 功能分解/地图拓客搜索详情弹窗）
 * 地图区当前为占位底图（网格），需接入高德 JS API Key 后替换为真地图
 * 抽屉内容为企业搜索结果样例（Sam 样例数据），不再依赖 record/qixin 原始 HTML 快照
 */

const RANGE_OPTIONS = ['1km', '3km', '5km', '10km'];
const HISTORY = ['上海合合信息科技股份有限公司'];

interface SampleRow {
  name: string;
  legal: string;
  found: string;
  industry: string;
  capital: string;
  status: 'alive' | 'cancel';
  statusText: string;
  icon?: { cls: string; text: string };
  foundTag?: boolean;
  tilde?: boolean;
}

// 企业搜索结果样例（Sam 样例数据）· 1:1 提取自 功能分解/地图拓客搜索详情弹窗
const SAMPLE_ROWS: SampleRow[] = [
  { name: '数宣数据技术（上海）有限公司', legal: '贺平', found: '2016-09-14', industry: '专业技术服务业', capital: '57.0175 万人民币', status: 'cancel', statusText: '注销', icon: { cls: 'icon-hei', text: '数' } },
  { name: '上海尚恩华科网络科技股份有限公司', legal: '黄正', found: '2000-07-19', industry: '软件和信息技术服务业', capital: '2,500 万人民币', status: 'cancel', statusText: '注销', icon: { cls: 'icon-shang', text: '上' } },
  { name: '上海找齐科技有限公司', legal: '张栋', found: '2020-08-11', industry: '软件和信息技术服务业', capital: '153.85 万人民币', status: 'cancel', statusText: '注销', foundTag: true },
  { name: '上海驰久信息科技发展有限公司', legal: '黄小娟', found: '2011-11-17', industry: '科技推广和应用服务业', capital: '10 万人民币', status: 'alive', statusText: '存续（在营、开业、在册）', icon: { cls: 'icon-shang', text: '上' } },
  { name: '上海坤元数智技术有限公司', legal: '王玉森', found: '2002-10-17', industry: '软件和信息技术服务业', capital: '3,000 万人民币', status: 'alive', statusText: '存续（在营、开业、在册）', tilde: true },
  { name: '上海复交智连科技有限公司', legal: '缪增誉', found: '2018-08-01', industry: '软件和信息技术服务业', capital: '1,250 万人民币', status: 'alive', statusText: '存续（在营、开业、在册）', icon: { cls: 'icon-shang', text: '上' } },
  { name: '越橘信息科技（上海）有限公司', legal: '任海莉', found: '2020-12-02', industry: '科技推广和应用服务业', capital: '100 万人民币', status: 'cancel', statusText: '注销', icon: { cls: 'icon-red', text: '越' } },
  { name: '上海悟瑜企业管理咨询合伙企业（有限合伙）', legal: '许正', found: '2015-12-14', industry: '商务服务业', capital: '22.9039 万人民币', status: 'cancel', statusText: '注销', icon: { cls: 'icon-shang', text: '上' } },
  { name: '上海数臻信息科技有限公司', legal: '宣晓华', found: '2016-12-09', industry: '专业技术服务业', capital: '100 万人民币', status: 'cancel', statusText: '注销', icon: { cls: 'icon-shang', text: '上' } },
  { name: '上海百纯金融信息服务有限公司', legal: '宣晓华', found: '2014-06-30', industry: '商务服务业', capital: '100 万人民币', status: 'cancel', statusText: '注销', icon: { cls: 'icon-shang', text: '上' } },
];

/* ============ 筛选下拉（带标签 · 与区域商机一致样式） ============ */
type FilterControl =
  | { control: 'select'; options: readonly string[] }
  | { control: 'number'; placeholder?: string; unit?: string }
  | { control: 'date'; placeholder?: string }
function FilterSelect({
  label,
  value,
  onChange,
  field,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  field: FilterControl
}) {
  return (
    <label className="inline-flex items-center gap-1 border border-gray-300 rounded px-2 py-1 text-xs bg-white hover:border-brand-500 cursor-pointer">
      <span className="text-gray-500">{label}</span>
      {field.control === 'select' ? (
        <select className="bg-transparent outline-none cursor-pointer text-slate-700" value={value} onChange={(e) => onChange(e.target.value)}>
          {field.options.map((o) => (<option key={o} value={o}>{o}</option>))}
        </select>
      ) : field.control === 'number' ? (
        <span className="inline-flex items-center gap-1">
          <input
            type="number"
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-16 bg-transparent outline-none text-slate-700"
          />
          {field.unit && <span className="text-gray-400">{field.unit}</span>}
        </span>
      ) : (
        <input type="date" placeholder={field.placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent outline-none text-slate-700" />
      )}
    </label>
  )
}

export default function DmMapProspect() {
  const [tab, setTab] = useState<'standard' | 'precise' | 'custom'>('standard');
  const [subTab, setSubTab] = useState<'around' | 'street'>('around');
  const [range, setRange] = useState('1km');
  const [keyword, setKeyword] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const mapWrapRef = useRef<HTMLDivElement>(null);
  const [mapH, setMapH] = useState(600);

  // 右侧抽屉（企业搜索结果弹窗）· 本地样例数据
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checked, setChecked] = useState<boolean[]>(() => SAMPLE_ROWS.map(() => false));
  const [page, setPage] = useState(1);
  // 地图拓客 · 搜索结果弹窗顶部筛选条件
  const MAP_FILTER_FIELDS = [
    { key: 'founded', label: '成立时间', control: 'date', placeholder: '选择年份' },
    { key: 'industry', label: '所在行业', control: 'select', options: ['不限', '建筑业', '批发和零售业', '科技推广和应用服务业', '制造业', '金融业', '房地产业', '信息传输、软件和信息技术服务业'] },
    { key: 'regCapital', label: '注册资本', control: 'number', placeholder: '输入金额', unit: '万元' },
    { key: 'status', label: '经营状态', control: 'select', options: ['不限', '存续（在营、开业、在册）', '存续', '吊销', '注销', '迁出'] },
    { key: 'qixin', label: '企业健康度', control: 'number', placeholder: '输入分数', unit: '分' },
    { key: 'scale', label: '企业规模', control: 'select', options: ['不限', '大型企业', '中型企业', '小微企业', '规模以上企业'] },
    { key: 'cert', label: '资质标签', control: 'select', options: ['不限', '高新技术企业', '科技型中小企业', '专精特新', '消防资质', '风景园林资质', 'ISO体系认证'] },
    { key: 'entType', label: '企业类型', control: 'select', options: ['不限', '有限责任公司', '股份有限公司', '国有企业', '合伙企业', '个体工商户'] },
    { key: 'listed', label: '上市信息', control: 'select', options: ['不限', '非上市', 'A股', '港股', '新三板', '创业板', '科创板'] },
    { key: 'insured', label: '参保人数', control: 'number', placeholder: '输入人数', unit: '人' },
    { key: 'mobile', label: '手机号码', control: 'select', options: ['不限', '有', '无'] },
    { key: 'phone', label: '座机号码', control: 'select', options: ['不限', '有', '无'] },
    { key: 'emptyFilter', label: '空号过滤', control: 'select', options: ['不限', '仅有效号码', '过滤空号'] },
    { key: 'importExport', label: '进出口信息', control: 'select', options: ['不限', '有进出口资质', '无进出口资质'] },
    { key: 'distance', label: '距离范围', control: 'number', placeholder: '输入半径', unit: 'km' },
  ] as const;
  const [mapFilters, setMapFilters] = useState<Record<string, string>>(
    Object.fromEntries(MAP_FILTER_FIELDS.map((f) => [f.key, f.control === 'select' ? (f.options?.[0] ?? '不限') : '']))
  );
  const setMapFilter = (k: string, v: string) => setMapFilters((s) => ({ ...s, [k]: v }));
  const resetMapFilters = () => setMapFilters(Object.fromEntries(MAP_FILTER_FIELDS.map((f) => [f.key, f.control === 'select' ? (f.options?.[0] ?? '不限') : ''])));
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (mapWrapRef.current) setMapH(mapWrapRef.current.clientHeight);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const toggleCheck = (i: number) => {
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  };

  const onSearch = () => {
    // TODO: 接入高德搜索 API
    console.log('search', { range, keyword, tab, subTab });
  };

  return (
    <>
      <PageShell title="地图拓客" subtitle="基于地图的地理化拓客：圈选区域、周边企业批量获取与画像" />
      <div className="mp-root" ref={mapWrapRef}>
        {/* 左侧面板 */}
        <aside className="mp-panel">
          {/* 顶部 Tab */}
          <div className="mp-top-tabs">
            {([
              { k: 'standard' as const, l: '标准模式' },
              { k: 'precise' as const, l: '精准搜索' },
              { k: 'custom' as const, l: '自定义区域模式' },
            ]).map((t) => (
              <button
                key={t.k}
                className={`mp-top-tab ${tab === t.k ? 'active' : ''}`}
                onClick={() => setTab(t.k)}
              >
                {t.l}
              </button>
            ))}
          </div>

          {/* 子 Tab */}
          <div className="mp-sub-tabs">
            <button
              className={`mp-sub-tab ${subTab === 'around' ? 'active' : ''}`}
              onClick={() => setSubTab('around')}
            >
              搜周边
            </button>
            <button
              className={`mp-sub-tab ${subTab === 'street' ? 'active' : ''}`}
              onClick={() => setSubTab('street')}
            >
              搜街道
            </button>
          </div>

          {/* 搜索区 */}
          <div className="mp-search-body">
            <div className="mp-row">
              <div className="mp-range">
                <label>范围：</label>
                <select value={range} onChange={(e) => setRange(e.target.value)}>
                  {RANGE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="mp-input-wrap">
                <input
                  type="text"
                  placeholder="上海合合信息科技股份有限公司"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onFocus={() => setShowHistory(true)}
                />
                {showHistory && HISTORY.length > 0 && (
                  <div className="mp-history">
                    {HISTORY.map((h) => (
                      <div
                        key={h}
                        className="mp-history-item"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setKeyword(h);
                          setShowHistory(false);
                        }}
                      >
                        {h}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mp-hint">
              历史搜索：
              <span
                className="mp-hint-link"
                onClick={() => {
                  setKeyword(HISTORY[0]);
                }}
              >
                {HISTORY[0]}
              </span>
            </div>

            <button className="mp-search-btn" onClick={onSearch}>
              <span className="mp-icon">🔍</span> 搜索
            </button>
          </div>
        </aside>

        {/* 右侧地图区 */}
        <div className="mp-map-area">
          {/* 占位底图：网格线，接入高德后替换为 <div id="amap-container" /> */}
          <div className="mp-map-placeholder" style={{ height: mapH }}>
            <div className="mp-map-grid" />
            <div className="mp-map-label">地图区域（接入高德 JS API Key 后显示真实瓦片）</div>
            {/* 地图中心标记 */}
            <div className="mp-map-pin">
              <div className="mp-pin-dot" />
              <div className="mp-pin-pulse" />
            </div>
            {/* 范围圈 */}
            <div className="mp-radius-ring" />
          </div>

          {/* 右上角结果浮层 */}
          <div className="mp-result-float">
            <div className="mp-result-text">
              当前位置下共找到<span className="mp-result-num">16885</span>家企业
            </div>
            <button className="mp-result-btn" onClick={() => setDrawerOpen(true)}>点击查看</button>
          </div>
        </div>
      </div>

      {/* 右侧抽屉：企业搜索结果弹窗（1:1 复刻 功能分解/地图拓客搜索详情弹窗） */}
      {drawerOpen && (
        <div className="mp-drawer-mask" onClick={() => setDrawerOpen(false)}>
          <div className="mp-drawer" onClick={(e) => e.stopPropagation()}>
            <button className="mp-drawer-close" onClick={() => setDrawerOpen(false)}>×</button>
            <div className="mp-drawer-body">
              <div className="sr-topbar">
                {(filtersExpanded ? MAP_FILTER_FIELDS : MAP_FILTER_FIELDS.slice(0, 8)).map((f) => (
                  <FilterSelect
                    key={f.key}
                    label={f.label}
                    value={mapFilters[f.key]}
                    onChange={(v) => setMapFilter(f.key, v)}
                    field={f}
                  />
                ))}
                {MAP_FILTER_FIELDS.length > 8 && (
                  <span
                    className="text-brand-600 cursor-pointer text-xs flex items-center gap-1 select-none"
                    onClick={() => setFiltersExpanded((v) => !v)}
                  >
                    {filtersExpanded ? '收起' : '展开更多'}
                    <i className={`fa fa-chevron-${filtersExpanded ? 'up' : 'down'}`} />
                  </span>
                )}
                <button className="sr-filter-reset" onClick={resetMapFilters}>清空筛选</button>
              </div>
              <div className="sr-selected">
                <span className="sr-selected-tag">上海</span>
                <span className="sr-selected-tag">上海合合信息科技股份有限公司</span>
                <span className="sr-selected-tag">范围：1km</span>
              </div>
              <div className="sr-toolbar">
                <span className="sr-count">找到 <b>16885</b> 条</span>
                <div className="sr-toolbar-right">
                  <span className="sr-sort">综合排序 ▾</span>
                  <span className="sr-btn sr-btn-yellow">营销</span>
                  <span className="sr-btn sr-btn-blue">关注</span>
                  <span className="sr-btn sr-btn-green">导出</span>
                </div>
              </div>
              <div className="sr-table">
                <div className="sr-tr sr-head">
                  <span className="sr-td sr-cb" />
                  <span className="sr-td sr-name">企业名称</span>
                  <span className="sr-td">法定代表人</span>
                  <span className="sr-td">成立时间</span>
                  <span className="sr-td">所在行业</span>
                  <span className="sr-td">注册资本</span>
                  <span className="sr-td">经营状态</span>
                </div>
                {SAMPLE_ROWS.map((row, i) => (
                  <div className="sr-tr" key={i}>
                    <span className="sr-td sr-cb">
                      <input type="checkbox" checked={checked[i]} onChange={() => toggleCheck(i)} />
                    </span>
                    <span className="sr-td sr-name">
                      <span className={`sr-logo ${row.icon ? row.icon.cls : ''}`}>
                        {row.icon ? row.icon.text : <span className="sr-logo-default">企</span>}
                      </span>
                      <span className="sr-name-text">
                        {row.name}
                        {row.foundTag && <span className="sr-found-tag">已找到</span>}
                        {row.tilde && <span className="sr-tilde"> ～ </span>}
                      </span>
                    </span>
                    <span className="sr-td">{row.legal}</span>
                    <span className="sr-td">{row.found}</span>
                    <span className="sr-td">{row.industry}</span>
                    <span className="sr-td">{row.capital}</span>
                    <span className={`sr-td ${row.status === 'alive' ? 'sr-status-alive' : 'sr-status-cancel'}`}>
                      {row.statusText}
                    </span>
                  </div>
                ))}
              </div>
              <div className="sr-pager">
                <span className="sr-pager-btn">‹</span>
                <span className="sr-pager-num active">1</span>
                <span className="sr-pager-num">2</span>
                <span className="sr-pager-num">3</span>
                <span className="sr-pager-num">4</span>
                <span className="sr-pager-ellipsis">...</span>
                <span className="sr-pager-num">1689</span>
                <span className="sr-pager-btn">›</span>
              </div>
              <div className="sr-source">
                <Sam /> 企业搜索结果样例（功能分解/地图拓客搜索详情弹窗 1:1 复刻）
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .mp-root {
          display: flex;
          width: 100%;
          height: calc(100vh - 56px);
          background: #f5f7fa;
          overflow: hidden;
        }
        .mp-panel {
          width: 340px;
          flex-shrink: 0;
          background: #fff;
          border-right: 1px solid #e4e7ed;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }
        .mp-top-tabs {
          display: flex;
          border-bottom: 1px solid #e4e7ed;
          background: #fff;
        }
        .mp-top-tab {
          flex: 1;
          padding: 14px 0;
          font-size: 14px;
          color: #606266;
          background: #fff;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: all .2s;
        }
        .mp-top-tab:hover { color: #409eff; }
        .mp-top-tab.active {
          color: #409eff;
          border-bottom-color: #409eff;
          font-weight: 600;
        }
        .mp-sub-tabs {
          display: flex;
          padding: 12px 16px 0;
          gap: 16px;
        }
        .mp-sub-tab {
          padding: 6px 0;
          font-size: 13px;
          color: #909399;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
        }
        .mp-sub-tab.active {
          color: #303133;
          border-bottom-color: #303133;
          font-weight: 600;
        }
        .mp-search-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .mp-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .mp-range {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #606266;
          white-space: nowrap;
        }
        .mp-range select {
          padding: 6px 8px;
          border: 1px solid #dcdfe6;
          border-radius: 4px;
          font-size: 13px;
          color: #606266;
          background: #fff;
          cursor: pointer;
        }
        .mp-input-wrap {
          flex: 1;
          position: relative;
        }
        .mp-input-wrap input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #dcdfe6;
          border-radius: 4px;
          font-size: 13px;
          color: #303133;
          outline: none;
          box-sizing: border-box;
        }
        .mp-input-wrap input:focus { border-color: #409eff; }
        .mp-history {
          position: absolute;
          top: 100%;
          left: 0; right: 0;
          background: #fff;
          border: 1px solid #e4e7ed;
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(0,0,0,.08);
          z-index: 100;
          margin-top: 4px;
          overflow: hidden;
        }
        .mp-history-item {
          padding: 8px 12px;
          font-size: 13px;
          color: #606266;
          cursor: pointer;
        }
        .mp-history-item:hover { background: #f5f7fa; color: #409eff; }
        .mp-hint {
          font-size: 12px;
          color: #909399;
        }
        .mp-hint-link {
          color: #409eff;
          cursor: pointer;
          text-decoration: none;
        }
        .mp-hint-link:hover { text-decoration: underline; }
        .mp-search-btn {
          width: 100%;
          padding: 12px 0;
          background: #ffc300;
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: background .2s;
        }
        .mp-search-btn:hover { background: #e6b000; }
        .mp-icon { font-size: 14px; }

        .mp-map-area {
          flex: 1;
          position: relative;
          overflow: hidden;
          background: #fcfcf7;
        }
        .mp-map-placeholder {
          width: 100%;
          position: relative;
          background: #f0f2f5;
          overflow: hidden;
        }
        .mp-map-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(200,200,200,.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200,200,200,.15) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .mp-map-label {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          color: #909399;
          font-size: 14px;
          background: rgba(255,255,255,.85);
          padding: 10px 18px;
          border-radius: 6px;
          border: 1px dashed #c0c4cc;
          pointer-events: none;
        }
        .mp-map-pin {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 20px; height: 20px;
        }
        .mp-pin-dot {
          width: 12px; height: 12px;
          background: #409eff;
          border-radius: 50%;
          border: 2px solid #fff;
          box-shadow: 0 2px 8px rgba(64,158,255,.5);
          position: absolute;
          top: 4px; left: 4px;
        }
        .mp-pin-pulse {
          width: 20px; height: 20px;
          border-radius: 50%;
          background: rgba(64,158,255,.25);
          position: absolute;
          animation: mpPulse 2s infinite;
        }
        @keyframes mpPulse {
          0% { transform: scale(1); opacity: .6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .mp-radius-ring {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 180px; height: 180px;
          border: 2px solid rgba(64,158,255,.35);
          border-radius: 50%;
          background: rgba(64,158,255,.06);
          pointer-events: none;
        }

        .mp-result-float {
          position: absolute;
          top: 16px; right: 16px;
          background: #fff;
          border-radius: 6px;
          box-shadow: 0 4px 16px rgba(0,0,0,.1);
          padding: 14px 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: center;
          min-width: 200px;
          z-index: 10;
        }
        .mp-result-text {
          font-size: 13px;
          color: #303133;
          white-space: nowrap;
        }
        .mp-result-num {
          color: #f56c6c;
          font-weight: 700;
          margin: 0 3px;
        }
        .mp-result-btn {
          padding: 7px 18px;
          background: #fff;
          color: #409eff;
          font-size: 13px;
          border: 1px solid #409eff;
          border-radius: 4px;
          cursor: pointer;
          transition: all .2s;
        }
        .mp-result-btn:hover {
          background: #409eff;
          color: #fff;
        }

        /* 右侧抽屉 */
        .mp-drawer-mask {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.25);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
          animation: mpMaskIn .2s ease;
        }
        @keyframes mpMaskIn { from { opacity: 0; } to { opacity: 1; } }
        .mp-drawer {
          position: relative;
          width: min(820px, 72vw);
          height: 100%;
          background: #fff;
          box-shadow: -4px 0 24px rgba(0,0,0,.15);
          overflow: hidden;
          animation: mpDrawerIn .28s cubic-bezier(.4,0,.2,1);
        }
        @keyframes mpDrawerIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .mp-drawer-close {
          position: absolute;
          top: 12px; right: 16px;
          width: 32px; height: 32px;
          border: none;
          background: rgba(0,0,0,.04);
          border-radius: 50%;
          font-size: 22px;
          line-height: 1;
          color: #606266;
          cursor: pointer;
          z-index: 10;
          transition: all .2s;
        }
        .mp-drawer-close:hover { background: rgba(0,0,0,.1); color: #303133; }
        .mp-drawer-body {
          width: 100%;
          height: 100%;
          overflow: auto;
        }
        .mp-drawer-loading {
          padding: 40px;
          text-align: center;
          color: #909399;
          font-size: 14px;
        }

        /* ===== 右侧抽屉：企业搜索结果（对齐 地图拓客搜索详情弹窗 设计稿） ===== */
        .sr-topbar {
          display: flex; align-items: center; flex-wrap: wrap; padding: 14px 20px;
          border-bottom: 1px solid #E5E6EB; background: #fff;
        }
        .sr-topbar-item {
          font-weight: 600; font-size: 16px; color: #1D2129; margin-right: 32px;
          white-space: nowrap; cursor: pointer; user-select: none;
        }
        .sr-topbar-item::after {
          content: ""; display: inline-block; width: 0; height: 0; margin-left: 6px;
          border-left: 4px solid transparent; border-right: 4px solid transparent;
          border-top: 5px solid #86909C; vertical-align: middle;
        }
        /* 顶部筛选控件（地图拓客搜索结果弹窗） */
        .sr-filter {
          display: flex; flex-direction: column; margin-right: 20px; margin-bottom: 8px;
        }
        .sr-filter-label {
          font-size: 13px; color: #4E5969; margin-bottom: 4px; white-space: nowrap;
        }
        .sr-filter select, .sr-filter input {
          height: 32px; border: 1px solid #D9D9D9; border-radius: 4px; padding: 0 8px;
          font-size: 14px; color: #1D2129; background: #fff; outline: none;
        }
        .sr-filter select { min-width: 130px; cursor: pointer; }
        .sr-filter select:focus, .sr-filter input:focus { border-color: #165DFF; }
        .sr-filter-num { display: flex; align-items: center; }
        .sr-filter-num input { width: 90px; }
        .sr-filter-unit { font-size: 12px; color: #86909C; margin-left: 4px; }
        .sr-filter-reset {
          align-self: flex-end; margin-left: 8px; margin-bottom: 8px; padding: 5px 14px;
          border: 1px solid #D9D9D9; border-radius: 4px; background: #fff; font-size: 13px;
          color: #4E5969; cursor: pointer; white-space: nowrap;
        }
        .sr-filter-reset:hover { border-color: #165DFF; color: #165DFF; }
        .sr-selected {
          display: flex; align-items: center; flex-wrap: wrap; padding: 14px 20px;
          border-bottom: 1px dashed #E5E6EB; background: #fff;
        }
        .sr-selected-tag {
          display: inline-flex; align-items: center; padding: 3px 12px; margin-right: 10px;
          background: #E8F3FF; color: #165DFF; font-size: 16px; border-radius: 4px;
          white-space: nowrap; line-height: 1.6;
        }
        .sr-toolbar { display: flex; align-items: center; padding: 16px 20px; background: #fff; }
        .sr-count { font-size: 16px; color: #1D2129; white-space: nowrap; }
        .sr-count b { color: #FF7D00; font-weight: 600; }
        .sr-toolbar-right { margin-left: auto; display: flex; align-items: center; gap: 16px; }
        .sr-sort {
          display: inline-flex; align-items: center; margin-left: 24px; font-size: 16px;
          color: #165DFF; cursor: pointer; white-space: nowrap; user-select: none;
        }
        .sr-sort::after {
          content: ""; display: inline-block; width: 0; height: 0; margin-left: 6px;
          border-left: 4px solid transparent; border-right: 4px solid transparent;
          border-top: 5px solid #165DFF; vertical-align: middle;
        }
        .sr-btn {
          display: inline-flex; align-items: center; justify-content: center; height: 36px;
          padding: 0 18px; border: 1px solid #C9CDD4; border-radius: 4px; background: #fff;
          color: #1D2129; font-size: 15px; cursor: pointer; white-space: nowrap;
        }
        .sr-btn:hover { border-color: #165DFF; color: #165DFF; }
        .sr-btn-yellow { background: #165DFF; border-color: #165DFF; color: #fff; }
        .sr-btn-blue { background: #165DFF; border-color: #165DFF; color: #fff; }
        .sr-btn-green { background: #00B42A; border-color: #00B42A; color: #fff; }
        .sr-table { width: 100%; overflow-x: auto; background: #fff; }
        .sr-tr {
          display: flex; align-items: center; border-bottom: 1px solid #F2F3F5;
          font-size: 14px; color: #1D2129;
        }
        .sr-tr:hover { background: #F7F8FA; }
        .sr-head { background: #F2F3F5; font-weight: 600; position: sticky; top: 0; z-index: 1; }
        .sr-td { padding: 14px 12px; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .sr-cb { flex: 0 0 44px; display: flex; align-items: center; }
        .sr-name { flex: 0 0 34%; display: flex; align-items: center; gap: 8px; min-width: 0; }
        .sr-logo {
          flex-shrink: 0; width: 22px; height: 22px; border-radius: 3px;
          display: inline-flex; align-items: center; justify-content: center; color: #fff;
          font-size: 12px; font-weight: 600; line-height: 1;
        }
        .sr-logo.icon-shang { background: #4080FF; }
        .sr-logo.icon-hei { background: #1D2129; }
        .sr-logo.icon-red { background: #F53F3F; }
        .sr-logo-default { background: #86909C; }
        .sr-found-tag {
          flex-shrink: 0; display: inline-flex; align-items: center; padding: 1px 6px;
          background: #165DFF; color: #fff; font-size: 12px; border-radius: 3px;
          line-height: 1.6; font-weight: 500;
        }
        .sr-tilde { flex-shrink: 0; color: #86909C; font-size: 14px; letter-spacing: -1px; }
        .sr-name-text {
          font-size: 15px; color: #1D2129; font-weight: 500; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis;
        }
        .sr-status-alive { color: #1D2129; }
        .sr-status-cancel { color: #86909C; }
        .sr-pager {
          display: flex; align-items: center; justify-content: center; flex-wrap: wrap;
          gap: 8px; padding: 20px 20px 24px; background: #fff; font-size: 14px; color: #4E5969;
        }
        .sr-pager-btn, .sr-pager-num {
          display: inline-flex; align-items: center; justify-content: center; min-width: 36px;
          height: 36px; padding: 0 10px; border: 1px solid #E5E6EB; border-radius: 4px;
          background: #fff; color: #4E5969; font-size: 14px; cursor: pointer;
        }
        .sr-pager-btn { font-size: 16px; }
        .sr-pager-num.active { background: #1f47f5; border-color: #1f47f5; color: #fff; font-weight: 600; }
        .sr-pager-ellipsis {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 36px; height: 36px; color: #86909C;
        }
        .sr-source {
          display: flex; align-items: center; gap: 6px; padding: 10px 20px;
          background: #fff; color: #86909C; font-size: 13px;
        }
      `}</style>
    </>
  );
}
