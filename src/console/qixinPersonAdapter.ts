// 把 qixin 人员尽调（个人档案）快照 HTML 解析成结构化模型。
// 目的：用我们自己的组件框架（components/ui）渲染，保证视觉统一，
// 同时结构 / 内容 / 字段 100% 来自源，绝不编造。
//
// 解析在浏览器端用 DOMParser 完成（loadQixinPage 已剥离 script，安全）。

export interface ParsedTable {
  headers: string[];
  rows: string[][];
}

export interface PersonChip {
  label: string;
  count?: string;
}

export interface PersonSection {
  title: string;
  chips: PersonChip[];
  tables: ParsedTable[];
  text?: string; // 无表格/芯片时的纯文本正文（概览、说明等）
}

export interface PersonRiskItem {
  name: string;
  count: string;
}

export interface PersonRiskGroup {
  name: string;
  total: string;
  items: PersonRiskItem[];
}

export interface PersonRisk {
  label: string;
  groups: PersonRiskGroup[];
}

export interface PersonSummary {
  name: string;
  avatarUrl?: string;
  tags: { text: string; kind: 'risk' | 'top' | 'gray' }[];
  intro: string;
  risk?: PersonRisk;
}

function txt(el: Element | null | undefined): string {
  return (el?.textContent || '').replace(/\s+/g, ' ').trim();
}

/** 聚合可见文本：跳过 display:none 隐藏子树（el-table 筛选/滑块浮层）及 popover/dropdown/filter 类，
 *  避免把「取消 | 确定」「>= %」等浮层文字当成表头/单元格内容。 */
function cleanText(el: Element | null | undefined): string {
  if (!el) return '';
  let out = '';
  el.childNodes.forEach((n) => {
    if (n.nodeType === 3) {
      out += n.textContent || '';
    } else if (n.nodeType === 1) {
      const style = (n.getAttribute && n.getAttribute('style')) || '';
      if (/display\s*:\s*none/i.test(style)) return;
      if (/(popover|dropdown-menu|el-table__column-filter|filter-icon|caret)/.test(n.className || '')) return;
      out += cleanText(n as Element);
    }
  });
  return out.replace(/\s+/g, ' ').trim();
}

function parseTable(el: Element): ParsedTable {
  const isEl = el.classList.contains('el-table');
  // el-table 会把固定列再渲染一份（.el-table__fixed*），需限定在主区域，避免表头/列重复
  const headerScope = isEl ? el.querySelector('.el-table__header-wrapper') || el : el;
  const bodyScope = isEl ? el.querySelector('.el-table__body-wrapper') || el : el;

  const headers = Array.from(headerScope.querySelectorAll('thead th')).map((th) => cleanText(th));
  const rows: string[][] = [];
  bodyScope.querySelectorAll('tr.el-table__row, tbody tr').forEach((tr) => {
    const cells = Array.from(tr.querySelectorAll('td')).map((td) => cleanText(td));
    // 跳过 el-table 的「暂无数据」占位行 / 空行
    if (cells.length && !(cells.length === 1 && /暂无/.test(cells[0]))) {
      rows.push(cells);
    }
  });
  return { headers, rows };
}

/** 取某个 title-container 所属的区块正文（.section-body）。
 *  结构：section.section.bg-white > div.section-top > .company-section-title-container（标题）
 *        同级 div.section-body（正文：表格/芯片）。标题容器被包在 section-top 内，
 *        因此其同级兄弟不是正文；需向上找到 section 包裹层再取其 .section-body。 */
function sectionBodyElements(c: Element): Element[] {
  let el: Element | null = c;
  let wrapper: Element | null = null;
  while (el) {
    if (el.tagName === 'SECTION') {
      wrapper = el;
      break;
    }
    el = el.parentElement;
  }
  if (!wrapper) wrapper = c.closest('.section, .bg-white');
  if (!wrapper) return [];

  const direct = Array.from(wrapper.querySelectorAll(':scope > .section-body'));
  if (direct.length) return direct;
  const any = wrapper.querySelector('.section-body');
  return any ? [any] : [];
}

export function parsePersonSummary(html: string): PersonSummary | null {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const root = doc.querySelector('#peolpe-basic-info');
  if (!root) return null;

  const name = txt(root.querySelector('.rs-name'));

  // 头像：优先 img src，否则从 .logo 的 background-image 解析
  let avatarUrl: string | undefined;
  const logo = root.querySelector('.logo');
  if (logo) {
    const img = logo.querySelector('img');
    const src = img?.getAttribute('src');
    if (src) avatarUrl = src;
    else {
      const bg = logo.getAttribute('style') || '';
      const m = bg.match(/url\(["']?([^"')]+)["']?\)/);
      if (m) avatarUrl = m[1];
    }
  }

  // 标签
  const tags: PersonSummary['tags'] = [];
  root.querySelectorAll('.name-detail-tag').forEach((t) => {
    const text = txt(t);
    if (!text) return;
    const kind: 'risk' | 'top' | 'gray' = t.classList.contains('risk')
      ? 'risk'
      : t.classList.contains('top')
        ? 'top'
        : 'gray';
    tags.push({ text, kind });
  });

  const intro = txt(root.querySelector('#intro'));

  // 启信风险
  let risk: PersonRisk | undefined;
  const riskTag = root.querySelector('.qinxin-risk-tag');
  if (riskTag) {
    const all = riskTag.querySelector('.all-tags');
    if (all) {
      const spans = Array.from(all.querySelectorAll('span'));
      const groups: PersonRiskGroup[] = [];
      if (spans.length >= 2) {
        const gname = txt(spans[0]).replace(/:$/, '');
        const gtotal = txt(spans[1]);
        const items: PersonRiskItem[] = [];
        let k = 2;
        while (k + 1 < spans.length) {
          items.push({ name: txt(spans[k]), count: txt(spans[k + 1]) });
          k += 2;
        }
        groups.push({ name: gname, total: gtotal, items });
      }
      if (groups.length) {
        risk = { label: txt(riskTag.querySelector('.qinxin-word')) || '启信风险', groups };
      }
    }
  }

  return { name, avatarUrl, tags, intro, risk };
}

export function parsePersonSections(html: string): PersonSection[] {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const containers = Array.from(doc.querySelectorAll('.company-section-title-container'));
  const sections: PersonSection[] = [];

  for (const c of containers) {
    const titleEl = c.querySelector('.company-section-title strong') || c.querySelector('.company-section-title');
    const title = txt(titleEl);
    if (!title) continue;

    const bodyEls = sectionBodyElements(c);
    const chips: PersonChip[] = [];
    const tables: ParsedTable[] = [];
    let bodyText = '';

    for (const b of bodyEls) {
      bodyText += b.textContent || '';
      b.querySelectorAll('.qxb-multilevel__tab .el-tabs__item').forEach((it) => {
        const cnt = it.querySelector('span[style*="1A53FF"]');
        const count = cnt ? txt(cnt) : undefined;
        const label = txt(it).replace(count || '', '').trim();
        if (label) chips.push({ label, count });
      });
      // 逻辑表：每个 .el-table 视为一张表（表头+表体合并）；普通 <table> 单独处理，
      // 但排除嵌套在 .el-table 内部的子表（表头表/表体表/固定列副本），避免重复与错位。
      const candidates = Array.from(b.querySelectorAll('.el-table, table'));
      const logicalTables = candidates.filter((e) => {
        if (e.classList.contains('el-table')) return true;
        return !e.closest('.el-table');
      });
      logicalTables.forEach((t) => {
        const pt = parseTable(t);
        if (pt.headers.length || pt.rows.length) tables.push(pt);
      });
    }

    bodyText = bodyText.replace(/\s+/g, ' ').trim();
    const text = tables.length === 0 && chips.length === 0 && bodyText ? bodyText : undefined;

    if (tables.length || chips.length || text) sections.push({ title, chips, tables, text });
  }

  return sections;
}
