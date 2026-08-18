// 档案页 Shadow DOM 注入公共逻辑
// 壳（概要）与内容分离：概要随页滚走、主 Tab 工具条由原生 React 渲染（吸顶 + 悬停链接面板）

function findMainTabs(root: ParentNode): HTMLElement | null {
  // 主 Tab 工具条：包含档案 tab 标题（基本信息/企业图谱）的 ent-nav-tabs-wrapper
  const list = root.querySelectorAll('.ent-nav-tabs-wrapper');
  for (let i = 0; i < list.length; i++) {
    const txt = (list[i].textContent || '');
    if (txt.includes('基本信息') && txt.includes('企业图谱')) return list[i] as HTMLElement;
  }
  return null;
}

// 概要：ent-basic 的 ent-header（企业概要，所有 tab 共用，随页滚走）
export function extractHeader(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  const hdr = tmp.querySelector('.ent-header');
  return hdr ? (hdr as HTMLElement).outerHTML : '';
}

// 内容区：去掉概要 + 主 Tab 工具条（主 Tab 由原生 React 渲染）
// 返回 html 原文表示「未切出内容」的兜底（extractContent 找不到导航结构时）
export function extractContent(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;

  // 1) 有主 Tab 工具条 + 主内容容器的页：工具条之后 = 内容区（概要在其之前，一并剔除）
  const tabs = findMainTabs(tmp);
  const main = tmp.querySelector('.company-layout-main') as HTMLElement | null;
  if (tabs && main) {
    let box: HTMLElement = tabs as HTMLElement;
    while (box.parentElement && box.parentElement !== main) box = box.parentElement;
    const content = document.createElement('div');
    let n: ChildNode | null = box.nextSibling;
    while (n) {
      const nx = n.nextSibling;
      content.appendChild(n);
      n = nx;
    }
    return content.innerHTML || html;
  }

  // 2) 图谱页 / 历史信息（无主 Tab 工具条）：
  //    优先取 company-layout-main 全量（内含 #navigator 主题条 + 全部图表/表格/svg），
  //    避免「只截取 navigator 后续兄弟」或「只返回 nav+chart 片段」而漏掉 nav 之前/容器之外的内容。
  const nav = tmp.querySelector('#navigator');
  const mainEl = tmp.querySelector('.company-layout-main') as HTMLElement | null;
  if (nav && mainEl) {
    return mainEl.innerHTML || html;
  }
  if (nav) {
    const chart = tmp.querySelector(
      '.new-chart-content, #chartLayoutContainer, .chart-layout__container, .chart-layout-container, #structure-container, #structureChart, #chartSVg'
    );
    if (chart) return (nav as HTMLElement).outerHTML + (chart as HTMLElement).outerHTML;
    const content = document.createElement('div');
    content.appendChild(nav);
    let n: ChildNode | null = nav.nextSibling;
    while (n) {
      const nx = n.nextSibling;
      content.appendChild(n);
      n = nx;
    }
    return content.innerHTML || html;
  }

  // 3) 个人档案：主导航条 #peolpe-navigator（去掉导航条，保留概要 + 内容）
  const pnav = tmp.querySelector('#peolpe-navigator');
  if (pnav) {
    const content = document.createElement('div');
    const parent = pnav.parentElement || tmp;
    let n: ChildNode | null = parent.firstChild;
    while (n) {
      const nx = n.nextSibling;
      if (n !== pnav) content.appendChild(n);
      n = nx;
    }
    return content.innerHTML || html;
  }

  return html;
}

// 图谱导航补丁：
//  - dump 把完整导航树展开成 1129px 高盖住图，且 8 个图谱主题(.menu-container)被压在 #navigator 内部；
//  - 放开 #navigator 高度，隐藏与顶部原生 Tab 条重复的「主维度导航」(ul.navigation / mainNav)，只保留图谱分析主题条；
//  - #navigator 吸顶在 52px（原生 Tab 工具条之下），避免重叠。
export const ARCHIVE_PATCH = `
#navigator-mat{display:none!important}
#navigator{position:sticky!important;top:52px!important;z-index:40!important;height:auto!important;max-height:none!important;overflow:visible!important;background:#fff;border-bottom:1px solid #edf0f5;box-shadow:0 1px 4px rgba(0,0,0,.05);padding:0!important}
/* 与顶部原生 Tab 条重复的主维度导航：隐藏 */
#navigator .mainNav,#navigator ul.navigation,#navigator .roll-btn,#navigator .nav-detail,#navigator .sub-navigation,#navigator .sub-nav-dropdown,#navigator .sub-nav-dropdown-hide,#navigator .nav-div{display:none!important}
/* 右侧竖向导航（带「企业图谱」标题 + 重复 8 主题）：隐藏，避免与下方横向主题条重复 */
.vertical-sub-nav-wrap{display:none!important}
/* 图谱分析主题按钮（企业链图/股权穿透/…）：横向胶囊，置于图控件上方 */
#navigator .menu-container{display:flex!important;align-items:center;gap:10px;flex-wrap:wrap;padding:12px 20px!important;background:#fff}
#navigator .menu-item{display:inline-flex!important;align-items:center;padding:6px 16px;border-radius:16px;border:1px solid #e6eaf2;background:#fff;color:#4a5160;font-size:13px;white-space:nowrap;cursor:pointer;margin:3px 0;transition:all .15s}
#navigator .menu-item:hover{border-color:#2b6de5;background:#f3f7ff;color:#2b6de5}
#navigator .menu-item.active{background:#2b6de5;border-color:#2b6de5;color:#fff;font-weight:600;box-shadow:0 2px 8px rgba(43,109,229,.25)}
.chart-layout-container,.new-chart-content{min-height:480px;padding:10px}
`;

// 兜底（extractContent 未切出内容，整页注入）：隐藏页面自带的概要 + 主 Tab 工具条，避免与壳重复
export const FALLBACK_HIDE = `
.ent-header,.ent-nav-tabs-wrapper{display:none!important}
`;

// ===== 个人档案专用提取 =====
// 概要卡：#peolpe-basic-info（人员卡片，所有 tab 共用，随页滚走）。无表格，纯概要。
export function extractPersonHeader(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  const basic = tmp.querySelector('#peolpe-basic-info');
  if (basic) {
    const clone = basic.cloneNode(true) as HTMLElement;
    const innerNav = clone.querySelector('#peolpe-navigator');
    if (innerNav) innerNav.remove();
    return clone.outerHTML;
  }
  // 兜底：取 #content 中 #peolpe-navigator 之前的内容
  const content = tmp.querySelector('#content');
  const nav = content?.querySelector('#peolpe-navigator');
  if (content && nav) {
    const clone = content.cloneNode(true) as HTMLElement;
    const n = clone.querySelector('#peolpe-navigator');
    let m: ChildNode | null = n;
    while (m) { const nx = m.nextSibling; m.remove(); m = nx; }
    return clone.innerHTML;
  }
  return (content as HTMLElement)?.innerHTML || '';
}

// 内容区：去掉概要卡(#peolpe-basic-info) + 主导航条(#peolpe-navigator)，保留导航之后的真实内容（表格/图谱）
export function extractPersonContent(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  const content = tmp.querySelector('#content');
  if (!content) return html;
  const clone = content.cloneNode(true) as HTMLElement;
  const basic = clone.querySelector('#peolpe-basic-info');
  if (basic) basic.remove();
  const nav = clone.querySelector('#peolpe-navigator');
  if (nav) nav.remove();
  return clone.innerHTML || html;
}

/* 个人档案视觉统一层：把人员尽调模块的视觉皮肤对齐到企业档案（同一 qixin 设计令牌）。
 * 原则：只改样式，不动 DOM 结构 / 内容 / 功能。
 * 目标令牌（取自企业档案真实渲染值）：
 *   标题 #00000a / 14px / 700，次要 #76788b，链接·激活蓝 #1a53ff，
 *   风险红 #f5573e，边框 #eaedf4，表头底 #f4f5fc / 文本 #393a51，卡片圆角 4px。
 */
export const PERSON_UNIFY = `
/* 基础排版 */
:host,#peolpe-basic-info,.page-content,#content{background:#fff;color:#393a51;font-size:14px}
*{font-family:"PingFangSC-Medium","PingFang SC","Microsoft YaHei",-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif!important;line-height:1.6}
a{color:#1a53ff!important}
a:hover{color:#0d2eb7!important}

/* 概要卡：白卡 + 边框 + 圆角 + 阴影，对齐企业 ent-header */
#peolpe-basic-info .people-introduce{border:1px solid #eaedf4!important;border-radius:4px!important;box-shadow:0 1px 4px rgba(0,0,0,.04)!important;padding:0!important;background:#fff!important}
#peolpe-basic-info .people-introduce>div{padding:20px 24px!important}
#peolpe-basic-info .people-introduce>div .image-name{border:1px solid #eaedf4!important;border-radius:4px!important;overflow:hidden}
#peolpe-basic-info .rs-name{font-size:18px!important;font-weight:600!important;color:#00000a!important;min-width:auto!important}
#peolpe-basic-info .isIgnored{font-size:14px!important;color:#393a51!important;max-height:none!important;width:100%!important}
#peolpe-basic-info .name-detail-tags{margin-left:0!important}

/* 标签（风险/关联）对齐企业色板 */
.name-detail-tag{height:24px!important;line-height:24px!important;padding:0 8px!important;border-radius:4px!important;font-size:12px!important;margin-left:0!important;margin-right:6px!important}
.name-detail-tag .triangle{display:none!important}
.name-detail-tag.risk{background:#fdecea!important;color:#f5573e!important}
.name-detail-tag.top{background:#e8f0ff!important;color:#1a53ff!important}
/* 启信风险块 */
.qinxin-risk-tag{background:#fff4eb!important;border:1px solid #ffd9c7!important;border-radius:4px!important;height:auto!important;min-height:52px!important}
.qinxin-risk-tag .qinxin-word{color:#f5573e!important;font-size:16px!important}
.qinxin-risk-tag .all-tags .title{color:#00000a!important}
.qinxin-risk-tag .all-tags .total{color:#f5573e!important}

/* 内容区块：白卡 + 边框 + 标题，对齐企业 ent-section */
.section.bg-white{border:1px solid #eaedf4!important;border-radius:4px!important;background:#fff!important}
.section+.section{margin-top:12px!important}
.section-top{padding:12px 16px 8px!important}
.company-section-title,.company-section-title strong{color:#00000a!important;font-size:14px!important;font-weight:700!important}
.section-sub-title{color:#76788b!important;font-size:14px!important}
.section-body{padding:0 16px 16px!important}
.section-title{border-left:6px solid #1a53ff!important;font-weight:700!important;padding-left:8px!important;color:#00000a!important}

/* 子导航标签（qxb-multilevel）：激活色对齐企业蓝，去掉黄色下划线 */
.qxb-multilevel .el-tabs .el-tabs__item{color:#393a51!important;font-size:14px!important}
.qxb-multilevel .el-tabs .el-tabs__item.is-active{border-bottom:2px solid #1a53ff!important;color:#00000a!important}
.qxb-multilevel__menus .menus__item{background:#f4f5fc!important;border-radius:4px!important;font-size:14px!important;color:#393a51!important;padding:4px 8px!important}
.qxb-multilevel__menus .menus__item:hover{background:#e8f0ff!important;color:#1a53ff!important}

/* 通用表格（个人模块自研表格 / 任意 table）对齐企业 el-table */
table{border-collapse:collapse!important;width:100%!important;font-size:14px!important}
th,td{border:1px solid #eaedf4!important;padding:8px 12px!important;text-align:left!important;color:#393a51!important}
thead th,tr th{background:#f4f5fc!important;color:#393a51!important;font-weight:600!important;font-size:13px!important}
tbody tr:hover{background:#fafbff!important}

/* 个别页若仍用 el-table，强制企业表头/行样式 */
.el-table th.el-table__cell{background:#f4f5fc!important;color:#393a51!important;font-weight:600!important;font-size:13px!important}
.el-table .cell{font-size:14px!important}
.el-table__row:hover>td.el-table__cell{background:#fafbff!important}

/* el-tabs 通用激活色对齐企业 */
.el-tabs__item.is-active{color:#00000a!important}
.el-tabs__item:not(.is-disabled):hover{color:#1a53ff!important}
.el-tabs__active-bar{background-color:#1a53ff!important}
`;
