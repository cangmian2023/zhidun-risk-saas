import { useEffect, useRef, useState } from 'react';
import { PageShell } from './PageShell';
import { loadQixinPageFromHtml, QixinPage } from './qixinRuntime';

/* 地图拓客 · 按截图 1:1 手写 React 复刻
 * 左侧：Tab 条 + 搜索面板；右侧：大地图区 + 右上角结果浮层
 * 点「点击查看」→ 右侧抽屉：Shadow DOM 加载「营销 -  地图拓客 - 图上企业.html」（原站点击企业后的弹出结果）
 * 地图区当前为占位底图（网格），需接入高德 JS API Key 后替换为真地图
 */

const RANGE_OPTIONS = ['1km', '3km', '5km', '10km'];
const HISTORY = ['上海合合信息科技股份有限公司'];

// 右侧弹窗补丁：隐藏原完整页壳（顶部导航 + 左侧菜单），只留企业详情内容区
const DETAIL_PATCH = `
.header-wrapper{display:none !important;}
.menu-wrapper{display:none !important;}
.basic-layout{padding:0 !important;height:100% !important;}
.layout-main, .el-main, [class*="main"]{margin-left:0 !important;padding:0 !important;}
.qxb-container__header{display:none !important;}
`;

export default function DmMapProspect() {
  const [tab, setTab] = useState<'standard' | 'precise' | 'custom'>('standard');
  const [subTab, setSubTab] = useState<'around' | 'street'>('around');
  const [range, setRange] = useState('1km');
  const [keyword, setKeyword] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const mapWrapRef = useRef<HTMLDivElement>(null);
  const [mapH, setMapH] = useState(600);

  // 右侧抽屉（企业详情弹窗）
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detail, setDetail] = useState<QixinPage | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const detailHostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onResize = () => {
      if (mapWrapRef.current) setMapH(mapWrapRef.current.clientHeight);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const openDetail = () => {
    setDrawerOpen(true);
    if (!detail && !detailLoading) {
      setDetailLoading(true);
      loadQixinPageFromHtml('营销 -  地图拓客 - 图上企业.html', DETAIL_PATCH)
        .then((p) => setDetail(p))
        .catch((e) => console.error('loadQixinPageFromHtml error:', e))
        .finally(() => setDetailLoading(false));
    }
  };

  useEffect(() => {
    const el = detailHostRef.current;
    if (!el || !detail) return;
    const root = el.shadowRoot || el.attachShadow({ mode: 'open' });
    root.innerHTML = '';
    const style = document.createElement('style');
    style.textContent = detail.css;
    const body = document.createElement('div');
    body.style.height = '100%';
    body.innerHTML = detail.html;
    root.append(style, body);
  }, [detail]);

  const onSearch = () => {
    // TODO: 接入高德搜索 API
    console.log('search', { range, keyword, tab, subTab });
  };

  return (
    <>
      <PageShell title="地图拓客" subtitle="基于地图的地理化拓客：圈选区域、周边企业批量获取与画像" legend={false} />
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
            <button className="mp-result-btn" onClick={openDetail}>点击查看</button>
          </div>
        </div>
      </div>

      {/* 右侧抽屉：企业详情弹窗 */}
      {drawerOpen && (
        <div className="mp-drawer-mask" onClick={() => setDrawerOpen(false)}>
          <div className="mp-drawer" onClick={(e) => e.stopPropagation()}>
            <button className="mp-drawer-close" onClick={() => setDrawerOpen(false)}>×</button>
            <div className="mp-drawer-body" ref={detailHostRef}>
              {detailLoading && <div className="mp-drawer-loading">加载中…</div>}
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
      `}</style>
    </>
  );
}
