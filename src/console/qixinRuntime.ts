// 运行时加载 record/qixin 原始快照，实时处理后在 React 中 1:1 渲染
const QIXIN_RAW = '/qixin-raw';
const B_QIXIN = 'https://b.qixin.com';

export type QixinPage = { html: string; css: string };

/** 加载单个页面：无后缀文件=HTML主源，.html=CSS来源 */
export async function loadQixinPage(srcName: string, htmlName: string, patch?: string): Promise<QixinPage> {
  // 1. 加载无后缀文件（HTML 内容主源）
  const htmlUrl = `${QIXIN_RAW}/${encodeURIComponent(srcName)}`;
  let html = await fetchText(htmlUrl);

  // 2. 加载 .html 文件提取 CSS
  const pageUrl = `${QIXIN_RAW}/${encodeURIComponent(htmlName)}`;
  const pageHtml = await fetchText(pageUrl);
  const css = await extractCss(pageHtml, pageUrl);

  // 3. 剥离 script（防止 Vue 挂载清空 SSR 内容）
  html = html.replace(/<script\b[\s\S]*?<\/script>/gi, '');

  // 4. 链接重写：原站路径 → 本地 hash / 外部完整 URL
  html = rewriteLinks(html);

  // 5. 可选样式补丁
  const patchedCss = css + '\n' + (patch || '');

  return { html, css: patchedCss };
}

/** 仅从 .html 加载（无同名无后缀文件时）：提取 body 内容作为 HTML，同时提取 CSS */
export async function loadQixinPageFromHtml(htmlName: string, patch?: string): Promise<QixinPage> {
  const pageUrl = `${QIXIN_RAW}/${encodeURIComponent(htmlName)}`;
  const pageHtml = await fetchText(pageUrl);

  // 提取 body 内容
  let html = extractBody(pageHtml);

  // 提取 CSS
  const css = await extractCss(pageHtml, pageUrl);

  // 剥离 script
  html = html.replace(/<script\b[\s\S]*?<\/script>/gi, '');

  // 链接重写
  html = rewriteLinks(html);

  const patchedCss = css + '\n' + (patch || '');
  return { html, css: patchedCss };
}

function extractBody(html: string): string {
  // 优先提取 #content 内容区（去掉 header/sidebar 等外壳）
  const contentMatch = html.match(/<div[^>]*\bid=["']content["'][^>]*>([\s\S]*)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/body>/i);
  if (contentMatch) {
    // 递归找到最外层 #content 的闭合
    const startIdx = html.indexOf('id="content"');
    if (startIdx > 0) {
      const tagStart = html.lastIndexOf('<div', startIdx);
      let depth = 0;
      let i = tagStart;
      let inString = false;
      let stringChar = '';
      while (i < html.length) {
        const ch = html[i];
        if (inString) {
          if (ch === stringChar && html[i - 1] !== '\\') inString = false;
        } else if (ch === '"' || ch === "'") {
          inString = true;
          stringChar = ch;
        } else if (html.substring(i, i + 4) === '<div') {
          depth++;
          i += 3;
        } else if (html.substring(i, i + 6) === '</div>') {
          depth--;
          if (depth === 0) {
            return html.substring(tagStart, i + 6);
          }
          i += 5;
        }
        i++;
      }
    }
  }
  // 回退：提取整个 body
  const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return m ? m[1].trim() : html;
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

/** 从 .html 文件中提取全部 CSS（link + style，递归内联 @import，重写 url） */
async function extractCss(pageHtml: string, pageUrl: string): Promise<string> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(pageHtml, 'text/html');

  let css = '';

  // 内联 <link rel="stylesheet">
  const links = doc.querySelectorAll('link[rel="stylesheet"]');
  for (const link of Array.from(links)) {
    const href = link.getAttribute('href');
    if (!href) continue;
    const cssUrl = resolveUrl(href, pageUrl);
    try {
      let text = await fetchText(cssUrl);
      text = await inlineImports(text, cssUrl);
      text = rewriteUrls(text, cssUrl);
      css += text + '\n';
    } catch {
      /* skip broken css */
    }
  }

  // 收集 <style>
  doc.querySelectorAll('style').forEach((s) => {
    css += s.textContent + '\n';
  });

  return css;
}

async function inlineImports(css: string, baseUrl: string): Promise<string> {
  const re = /@import\s+(?:url\()?["']([^"']+)["'](?:\))?\s*;?/g;
  let result = css;
  let m: RegExpExecArray | null;
  while ((m = re.exec(result)) !== null) {
    const url = resolveUrl(m[1], baseUrl);
    try {
      const text = await fetchText(url);
      result = result.replace(m[0], text);
    } catch {
      result = result.replace(m[0], '');
    }
  }
  return result;
}

function rewriteUrls(css: string, baseUrl: string): string {
  return css.replace(/url\(["']?([^"')]+)["']?\)/g, (match, p1) => {
    if (/^(data:|https?:|\/\/)/.test(p1)) return match;
    return `url("${resolveUrl(p1, baseUrl)}")`;
  });
}

function resolveUrl(path: string, base: string): string {
  if (/^(https?:|\/\/|data:)/.test(path)) return path;
  return new URL(path, base.startsWith('http') ? base : window.location.origin + base).href;
}

/** 重写 HTML 中的链接：原站档案路径 → 本地 hash；未知路径 → 外部完整 URL + target="_blank" */
function rewriteLinks(html: string): string {
  // 个人档案路径
  html = html.replace(
    /href=["'](\/name\/(info|lawsuit|history|risk|chart|patent))(\?[^"']*)?["']/g,
    (_m, _p1, p2) => {
      const map: Record<string, string> = {
        info: '#basic',
        lawsuit: '#risk',
        history: '#history',
        risk: '#related-risk',
        chart: '#graph',
        patent: '#patent',
      };
      return `href="${map[p2] || _p1}"`;
    }
  );

  // 企业档案路径
  const entMap: Record<string, string> = {
    '/ent/company/info': '#basic',
    '/company/info': '#basic',
    '/company/charts/network-left-right': '#graph',
    '/company/charts/owner': '#graph-controller',
    '/company/charts/beneficiary': '#graph-beneficiary',
    '/company/history': '#history',
    '/company/lawsuit': '#lawsuit',
    '/company/ability': '#ip',
    '/company/operation': '#operate',
    '/company/risk': '#operate-risk',
    '/company/news': '#news',
  };

  html = html.replace(
    /href=["'](\/(?:ent\/)?company\/[^"']+)["']/g,
    (m, p1) => {
      const clean = p1.split('?')[0];
      if (entMap[clean]) return `href="${entMap[clean]}"`;
      return `href="${B_QIXIN}${p1}" target="_blank"`;
    }
  );

  // 其它站点绝对路径
  html = html.replace(
    /href=["'](\/(?!\/)[^"']+)["']/g,
    (m, p1) => `href="${B_QIXIN}${p1}" target="_blank"`
  );

  return html;
}
