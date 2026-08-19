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

export type PersonNavSection = { title: string; count: string; disabled: boolean };
export type PersonNavTab = { label: string; count: string; sections: PersonNavSection[] };

// 从 #peolpe-navigator 提取完整的主 tab + 分区列表（含空数据 disabled 项）
// 顺序与源站导航一致：基本信息/风险信息/专利信息/关联企业风险/个人图谱/历史信息
export function extractPersonNav(html: string): PersonNavTab[] {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  const nav = tmp.querySelector('#peolpe-navigator');
  if (!nav) return [];

  const result: PersonNavTab[] = [];

  // 主导航项（顶部 6 个 tab）
  const mainLinks = Array.from(nav.querySelectorAll('.navigation > li > a'));
  mainLinks.forEach((a) => {
    const label = (a.textContent || '').trim().split('\n')[0].trim();
    const countEl = a.querySelector('.small, .risk');
    const count = (countEl?.textContent || '').trim();
    result.push({ label, count, sections: [] });
  });

  // 每个 sub-navigation small 是一个主 tab 的分区列表
  const groups = Array.from(nav.querySelectorAll('.sub-navigation.small'));
  groups.forEach((g, gi) => {
    const items = Array.from(g.querySelectorAll('.navigation-item'));
    const secs: PersonNavSection[] = items.map((it) => {
      const title = (it.textContent || '').trim().split('\n')[0].trim();
      const tip = it.querySelector('.item-tip');
      const count = (tip?.textContent || '').trim();
      const disabled = it.classList.contains('disabled');
      return { title, count, disabled };
    });
    if (result[gi]) result[gi].sections = secs;
  });

  return result;
}

/* 个人档案视觉统一层：把人员尽调模块的视觉皮肤对齐到企业档案（同一 qixin 设计令牌）。
 * 原则：只改样式，不动 DOM 结构 / 内容 / 功能。
 * 目标令牌（取自企业档案真实渲染值）：
 *   页面底色 = 框架浅灰(bg-slate-50 #f8fafc)，卡片=无边框白卡 + 4px 圆角 + 12px 间距，
 *   标题 #00000a / 14px / 600，次要 #76788b，链接·激活蓝 #1a53ff，
 *   风险红 #f5573e，表头底 #f4f5fc / 文本 #393a51。
 * 2026-08-19：去掉 :host 白底（让框架浅灰透出）+ 去掉所有 1px 灰边框（对齐企业无边框卡片）。
 */
export const PERSON_UNIFY = `
/* 基础排版：host 透明，让框架浅灰底(bg-slate-50)透出，与企业档案一致 */
:host,.page-content,#content{background:transparent!important;color:#393a51;font-size:14px}
#peolpe-basic-info{background:#fff!important}
*{font-family:"PingFangSC-Medium","PingFang SC","Microsoft YaHei",-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif!important;line-height:1.6}
a{color:#1a53ff!important}
a:hover{color:#0d2eb7!important}

/* 概要卡：无边框白卡（对齐企业 ent-header：8px 20px 内边距） */
#peolpe-basic-info .people-introduce{border:none!important;border-radius:0!important;box-shadow:none!important;padding:8px 20px!important;background:#fff!important}
#peolpe-basic-info .people-introduce>div{padding:0!important}
#peolpe-basic-info .people-introduce>div .image-name{border:none!important;border-radius:0!important;overflow:hidden}
#peolpe-basic-info .rs-name{font-size:20px!important;font-weight:600!important;color:#00000a!important;min-width:auto!important}
#peolpe-basic-info .isIgnored{font-size:14px!important;color:#393a51!important;max-height:none!important;width:100%!important}
#peolpe-basic-info .name-detail-tags{margin-left:0!important}

/* 概要卡：名字 + 标签 一行排列，对齐企业 ent-header 标题行 */
#peolpe-basic-info .rs-name{font-size:20px!important;font-weight:600!important;color:#00000a!important;min-width:auto!important;margin-right:12px!important}
#peolpe-basic-info .flex{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;align-items:center!important}
#peolpe-basic-info .name-detail-tags{display:inline-flex!important;flex-direction:row!important;flex-wrap:nowrap!important;white-space:nowrap!important;margin-left:0!important;margin-top:0!important}
.name-detail-tag{height:24px!important;line-height:24px!important;padding:0 10px!important;border-radius:4px!important;font-size:12px!important;margin-right:8px!important;flex-shrink:0!important}
.name-detail-tag .triangle{display:none!important}
.name-detail-tag.risk{background:#fdecea!important;color:#f5573e!important}
.name-detail-tag.top{background:#e8f0ff!important;color:#1a53ff!important}
/* 启信风险块：软色块去边框，对齐企业风险块 */
.qinxin-risk-tag{background:#fff4eb!important;border:none!important;border-radius:4px!important;height:auto!important;min-height:52px!important}
.qinxin-risk-tag .qinxin-word{color:#f5573e!important;font-size:16px!important}
.qinxin-risk-tag .all-tags .title{color:#00000a!important}
.qinxin-risk-tag .all-tags .total{color:#f5573e!important}

/* 内容区块：无边框白卡（对齐企业 ent-section.card：白底/无边框/8px 20px 内边距） */
.section.bg-white{border:none!important;border-radius:4px!important;background:#fff!important;padding:8px 20px!important;margin-bottom:12px!important}
.section+.section{margin-top:0!important}
.section-top{padding:12px 0 8px!important}
.company-section-title,.company-section-title strong{color:#00000a!important;font-size:14px!important;font-weight:600!important}
.section-sub-title{color:#76788b!important;font-size:14px!important}
.section-body{padding:0!important}
.section-title{border-left:none!important;font-weight:600!important;padding-left:0!important;color:#00000a!important}

/* 子导航标签（qxb-multilevel）：分段控制样式，一行排列，对齐企业风格 */
.qxb-multilevel{margin-bottom:12px!important}
.qxb-multilevel .el-tabs__header{margin-bottom:0!important}
.qxb-multilevel .el-tabs__nav-wrap{padding:0!important}
.qxb-multilevel .el-tabs__nav{display:inline-flex!important;flex-direction:row!important;flex-wrap:nowrap!important;align-items:center!important;height:32px!important;border:1px solid #e6eaf2!important;border-radius:6px!important;background:#f4f5fc!important;overflow:visible!important}
.qxb-multilevel .el-tabs__active-bar{display:none!important}
.qxb-multilevel .el-tabs .el-tabs__item{height:30px!important;line-height:30px!important;color:#4a5160!important;font-size:13px!important;padding:0 14px!important;margin:0!important;border:none!important;background:transparent!important;box-sizing:border-box!important;flex-shrink:0!important}
.qxb-multilevel .el-tabs .el-tabs__item.is-active{background:#fff!important;color:#1a53ff!important;font-weight:500!important;border:none!important;border-radius:5px!important;height:28px!important;line-height:28px!important;margin:1px!important;box-shadow:0 1px 3px rgba(0,0,0,.08)!important}
.qxb-multilevel .el-tabs .el-tabs__item:not(.is-disabled):hover{color:#1a53ff!important}
.qxb-multilevel__tab{border-bottom:none!important}
.qxb-multilevel__menus .menus__item{background:#f4f5fc!important;border-radius:4px!important;font-size:14px!important;color:#393a51!important;padding:4px 8px!important}
.qxb-multilevel__menus .menus__item:hover{background:#e8f0ff!important;color:#1a53ff!important}

/* 查看详情 等按钮：现代化风格（对齐企业按钮令牌） */
.el-button--text{color:#1a53ff!important;font-size:14px!important;padding:0!important;border:none!important;background:transparent!important;font-weight:500!important}
.el-button--text:hover{color:#0d2eb7!important}
.el-button--default,.el-button{border-radius:6px!important;padding:0 16px!important;height:32px!important;font-size:14px!important;border:1px solid #d9dde8!important;background:#fff!important;color:#393a51!important}
.el-button--default:hover,.el-button:hover{border-color:#1a53ff!important;color:#1a53ff!important}
.el-button--primary{border-radius:6px!important;padding:0 16px!important;height:32px!important;font-size:14px!important;background:#1a53ff!important;border:1px solid #1a53ff!important;color:#fff!important}
.el-button--primary:hover{background:#0d2eb7!important;border-color:#0d2eb7!important}

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

/* 按钮现代化（下载报告/导出等操作按钮） */
.opt .btn,button.el-button,.btn{border-radius:6px!important;font-size:13px!important;height:32px!important;line-height:30px!important;padding:0 14px!important;font-weight:500!important;transition:all .15s!important}
.btn-default,.el-button--default{border:1px solid #d9dde8!important;background:#fff!important;color:#393a51!important}
.btn-default:hover,.el-button--default:hover{border-color:#1a53ff!important;color:#1a53ff!important;background:#f3f7ff!important}
.btn-primary,.el-button--primary{background:#1a53ff!important;border:1px solid #1a53ff!important;color:#fff!important}
.btn-primary:hover,.el-button--primary:hover{background:#0d2eb7!important;border-color:#0d2eb7!important}

/* 输入框现代化 */
.el-input__inner,input[type=text],input[type=number],.el-input input{height:32px!important;border-radius:6px!important;border:1px solid #d9dde8!important;padding:0 10px!important;font-size:13px!important;transition:border-color .15s!important}
.el-input__inner:focus,input[type=text]:focus,input[type=number]:focus,.el-input input:focus{border-color:#1a53ff!important;outline:none!important;box-shadow:0 0 0 3px rgba(26,83,255,.1)!important}
.el-textarea__inner,textarea{border-radius:6px!important;border:1px solid #d9dde8!important;padding:8px 10px!important;font-size:13px!important;transition:border-color .15s!important}
.el-textarea__inner:focus,textarea:focus{border-color:#1a53ff!important;outline:none!important;box-shadow:0 0 0 3px rgba(26,83,255,.1)!important}

/* 分页条对齐 */
.el-pagination{display:flex!important;align-items:center!important;gap:6px!important;padding:12px 0!important}
.el-pagination .btn-prev,.el-pagination .btn-next,.el-pagination .el-pager li{height:30px!important;min-width:30px!important;line-height:28px!important;border-radius:6px!important;border:1px solid #e6eaf2!important;background:#fff!important;font-size:13px!important;color:#393a51!important;margin:0 3px!important}
.el-pagination .el-pager li.active{background:#1a53ff!important;border-color:#1a53ff!important;color:#fff!important}
.el-pagination .btn-prev:hover,.el-pagination .btn-next:hover,.el-pagination .el-pager li:hover{border-color:#1a53ff!important;color:#1a53ff!important}
`;
