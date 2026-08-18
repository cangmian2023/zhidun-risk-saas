# -*- coding: utf-8 -*-
"""生成 record/qixin 快照 → React 静态内容模块（HTML + CSS）
用法: python scripts/gen_qixin_pages.py   （Windows: C:/Users/admin/.workbuddy/binaries/python/envs/default/Scripts/python.exe）
输出: src/console/qixinData/<id>.ts (每页 export const html / css 字符串)
=====================================================================
转换管线（html + 无后缀 → 系统页面）：
  1) HTML 主源 = 同名无后缀文件（功能区 DOM 原样，不含原站外壳）
  2) 无后缀缺失 → 从 .html 用 BeautifulSoup 提取 #content（容错 div 不配对）
  3) CSS = .html 引用的全部样式（link + 内联 style，来自 _files 目录）：
     @import 递归内联（index.xxx-partial1-6.css 等）、url() 相对路径重写为 /qixin-raw/<filesDir>/、
     协议相对 // 补 https:、站内绝对路径补 https://b.qixin.com
  4) 链接重写 LINK_MAP：原站档案 path（/ent/company/info 等 16 个）→ 站内 hash（#basic 等）；
     未知 path（/home 等）→ https://b.qixin.com/... + target=_blank
  5) 主 Tab 条吸顶：.ent-nav-tabs-wrapper / #peolpe-navigator 注入 position:sticky
  6) 图谱导航修复 GRAPH_NAV_PATCH：dump 把导航树展开成 1129px 高盖住图 →
     限高一行 52px + 隐藏子导航树（.nav-detail/.sub-nav-dropdown 等）
  7) 页面结构重排 normalize_archive：
     - 图谱页（GRAPH_SLIM_PAGES：8 主题 + 集团查看图谱）= 只保留 导航条 + 图区
     - 历史信息 = 标准概要（ent-basic 420px）+ 导航 + 内容
  8) 概要缺失页（MISSING_HEADER）前置 ent-basic 的 ent-header（同企业概要相同）
  9) 无 _files 的页 → css 回退同子系统「基本信息」页（如 person-risk 借 person-basic）
=====================================================================
新增/替换源文件后：重跑本脚本即可全部重新生成。
"""
import os, re, sys, urllib.parse
from bs4 import BeautifulSoup

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QX = os.path.join(ROOT, 'record', 'qixin')
OUT = os.path.join(ROOT, 'src', 'console', 'qixinData')
B_QIXIN = 'https://b.qixin.com'

PAGES = [
    # —— 企业档案 ——
    dict(id='ent-basic',            src='企业档案 - 基本信息',                            html='企业档案 - 基本信息.html'),
    dict(id='ent-graph',            src='企业档案 - 企业图谱',                            html='企业档案 - 企业图谱.html'),
    dict(id='ent-graph-stock',      src='企业档案 - 企业图谱 - 股权结构',                html='企业档案 - 企业图谱 - 股权结构.html'),
    dict(id='ent-graph-penetrate',  src='企业档案 - 企业图谱- 股权穿透',                  html='企业档案 - 企业图谱- 股权穿透.html'),
    dict(id='ent-graph-relation',   src='企业档案 - 企业图谱 - 企业关系',                html='企业档案 - 企业图谱 - 企业关系.html'),
    dict(id='ent-graph-chain',      src='企业档案 - 企业图谱 - 企业链图',                html='企业档案 - 企业图谱 - 企业链图.html'),
    dict(id='ent-graph-related',    src='企业档案 - 企业图谱 - 关联方认定',              html='企业档案 - 企业图谱 - 关联方认定.html'),
    dict(id='ent-graph-beneficiary10', src='企业档案 - 企业图谱 -十大受益人',            html='企业档案 - 企业图谱 - 十大受益人.html'),
    dict(id='ent-graph-controller', src='企业档案 - 企业图谱 - 控制人关系',              html='企业档案 - 企业图谱 - 控制人关系.html'),
    dict(id='ent-graph-beneficiary', src='企业档案 - 企业图谱 -  受益所有人',            html='企业档案 - 企业图谱 - 受益所有人.html'),
    dict(id='ent-history',          src='企业档案 - 历史信息',                            html='企业档案 - 历史信息.html', css_from='企业档案 - 基本信息.html'),
    dict(id='ent-lawsuit',          src='企业档案 - 司法风险',                            html='企业档案 - 司法风险.html'),
    dict(id='ent-ip',               src=None,                                             html='企业档案 - 知识产权.html'),
    dict(id='ent-operate',          src='企业档案 - 经营信息',                            html='企业档案 - 经营信息.html'),
    dict(id='ent-operate-risk',     src='企业档案 - 经营风险',                            html='企业档案 - 经营风险.html'),
    dict(id='ent-news',             src='企业档案 - 新闻舆情',                            html='企业档案 - 新闻舆情.html'),
    dict(id='ent-property',         src='企业档案 - 财产信息 也是 风控子系统的 财产线索', html='企业档案 - 财产信息 也是 风控子系统的 财产线索.html'),
    dict(id='ent-group',            src='企业档案 - 集团信息',                            html='企业档案 - 集团信息.html'),
    dict(id='ent-group-graph',      src='企业档案 - 集团信息 - 查看图谱',                html='企业档案 - 集团信息 - 查看图谱.html', css_from='企业档案 - 企业图谱 - 企业关系.html'),
    # —— 个人档案 ——
    dict(id='person-basic',         src='尽调 - 人员尽调 - 人员详情 - 基本信息',          html='尽调 - 人员尽调 - 人员详情 - 基本信息.html'),
    dict(id='person-risk',          src='尽调 - 人员尽调 - 人员详情 - 风险信息',          html=None, css_from='尽调 - 人员尽调 - 人员详情 - 基本信息.html'),
    dict(id='person-history',       src='尽调 - 人员尽调 - 人员详情 - 历史信息',          html='尽调 - 人员尽调 - 人员详情 - 历史信息.html'),
    dict(id='person-related-risk',  src='尽调 - 人员尽调 - 人员详情 - 关联企业风险',      html='尽调 - 人员尽调 - 人员详情 - 关联企业风险.html'),
    dict(id='person-graph',         src='尽调 - 人员尽调 - 人员详情 - 个人图谱',          html='尽调 - 人员尽调 - 人员详情 - 个人图谱.html'),
    dict(id='person-patent',        src='尽调 - 人员尽调 - 人员详情 - 专利信息',          html='尽调 - 人员尽调 - 人员详情 - 专利信息.html'),
]

CSS_FALLBACK = {
    'ent': '企业档案 - 基本信息.html',
    'person': '尽调 - 人员尽调 - 人员详情 - 基本信息.html',
}

# 图谱页（8 主题 + 集团查看图谱）：瘦身只保留 导航条 + 图区
GRAPH_SLIM_PAGES = {
    'ent-graph', 'ent-graph-stock', 'ent-graph-penetrate', 'ent-graph-relation',
    'ent-graph-related', 'ent-graph-beneficiary10', 'ent-graph-controller',
    'ent-graph-beneficiary', 'ent-group-graph',
}


def normalize_archive(html, mode, basic_header=''):
    """bs4 重排页面结构（div 不配对时 ent-header 吞内容 → 概要 1768px 错乱）
    mode='graph'：只保留 导航条(navigator) + 图区(chart 容器) —— 图谱页
    mode='full' ：标准概要(ent-basic 420px 版) + 导航条 + 导航后内容 —— 历史信息等
    """
    soup = BeautifulSoup(html, 'html.parser')
    hdr = soup.select_one('.ent-header')
    nav = soup.find(id='navigator')
    if nav is None:
        return html
    parts = []
    if mode == 'full':
        # 概要统一用 ent-basic 标准版（420px；本页 ent-header 58KB 含集团/股东/财产等区块，1768px 太杂）
        parts.append(basic_header)
    parts.append(str(nav))
    if mode == 'graph':
        # 图区容器（兼容多种类名）
        chart = (
            soup.select_one('.new-chart-content')
            or soup.find(id='chartLayoutContainer')
            or soup.select_one('.chart-layout__container')
            or soup.select_one('.chart-layout-container')
            or soup.find(id='structure-container')
            or soup.find(id='structureChart')
            or soup.find(id='chartSVg')
        )
        if chart is not None:
            parts.append(str(chart))
    else:
        rest = ''.join(str(s) for s in nav.next_siblings)
        parts.append(rest)
    out = ''.join(parts)
    return out if out.strip() else html


BASIC_HEADER_CACHE = None
def get_basic_header():
    """ent-basic 的 ent-header（标准概要，420px 版，同企业所有页共用）"""
    global BASIC_HEADER_CACHE
    if BASIC_HEADER_CACHE is None:
        soup = BeautifulSoup(read(os.path.join(QX, '企业档案 - 基本信息')), 'html.parser')
        h = soup.select_one('.ent-header')
        BASIC_HEADER_CACHE = str(h) if h is not None else ''
    return BASIC_HEADER_CACHE


def read(p):
    with open(p, encoding='utf-8', errors='ignore') as f:
        return f.read()


def extract_from_html(html_path):
    """bs4 提取功能区容器（容错不配对 DOM）"""
    h = read(html_path)
    soup = BeautifulSoup(h, 'html.parser')
    for cid in ('content', 'company-detail', 'ent-detail', 'peolpe-detail'):
        el = soup.find(id=cid)
        if el is not None:
            return str(el)
    return None


def collect_styles(html_path):
    """按出现顺序收集样式（link stylesheet + 内联 style）"""
    h = read(html_path)
    out = []
    for m in re.finditer(r'<link\b[^>]*>', h, re.I):
        w = m.group(0)
        if not re.search(r'\brel=["\']?stylesheet', w, re.I):
            continue
        hm = re.search(r'href=["\']([^"\']+)["\']', w, re.I)
        if hm:
            out.append(('file', hm.group(1)))
    for m in re.finditer(r'<style\b[^>]*>(.*?)</style>', h, re.I | re.S):
        out.append(('inline', m.group(1)))
    return out


def inline_imports(css, base_dir, seen):
    def repl(m):
        ref = (m.group(1) or m.group(2) or '').strip().strip('"\'')
        if not ref:
            return ''
        target = os.path.normpath(os.path.join(base_dir, ref))
        if target in seen or not os.path.exists(target):
            return ''
        seen.add(target)
        t = read(target)
        return inline_imports(t, os.path.dirname(target), seen)

    return re.sub(r'@import\s+(?:url\(\s*["\']?([^"\'()]+)["\']?\s*\)|["\']([^"\']+)["\'])\s*;',
                  repl, css, flags=re.I)


def rewrite_urls(css, files_dir):
    qx_prefix = '/qixin-raw/' + urllib.parse.quote(files_dir)

    def repl(m):
        q = m.group(1)
        u = (m.group(2) or '').strip()
        if not u or u.startswith('data:') or u.startswith('http:') or u.startswith('https:'):
            return m.group(0)
        if u.startswith('//'):
            return f'url({q}https:{u}{q})'
        if u.startswith('/'):
            return f'url({q}{B_QIXIN}{u}{q})'
        clean = u[2:] if u.startswith('./') else u
        resolved = os.path.normpath(clean).replace('\\', '/')
        return f'url({q}{qx_prefix}/{resolved}{q})'

    return re.sub(r'url\(\s*(["\']?)([^"\'()]*)\1\s*\)', repl, css, flags=re.I)


# 内容区站内导航链接 → 本地复刻页（hash 直达）；未知 path 保留原站新窗口
# 文件夹文件名即链接路径：企业档案 /company|/ent/company/xxx，个人档案 /name/xxx
LINK_MAP = {
    # 企业档案
    '/ent/company/info': '#basic', '/company/info': '#basic',
    '/company/charts/network-left-right': '#graph', '/company/charts/owner': '#graph-controller',
    '/company/charts/beneficiary': '#graph-beneficiary',
    '/company/history': '#history',
    '/ent/company/lawsuit': '#lawsuit', '/company/lawsuit': '#lawsuit',
    '/ent/company/ability': '#ip', '/company/ability': '#ip',
    '/ent/company/operation': '#operate', '/company/operation': '#operate',
    '/ent/company/risk': '#operate-risk', '/company/risk': '#operate-risk',
    '/ent/company/news': '#news', '/company/news': '#news',
    # 个人档案
    '/name/info': '#basic',
    '/name/lawsuit': '#risk',
    '/name/history': '#history',
    '/name/risk': '#related-risk',
    '/name/chart': '#graph',
    '/name/patent': '#patent',
}


def clean_html(html, files_dir):
    qx_prefix = '/qixin-raw/' + urllib.parse.quote(files_dir)
    h = html.replace('<!---->', '')
    h = re.sub(r'(src|href)=(["\'])//', r'\1=\2https://', h)
    pat = r'(src|href)=(["\'])\.?/?' + re.escape(files_dir) + r'/([^"\']*)'
    h = re.sub(pat, lambda m: f'{m.group(1)}={m.group(2)}{qx_prefix}/{m.group(3)}', h)
    h = re.sub(r'(src|href)=(["\'])\./([^"\']*)',
               lambda m: f'{m.group(1)}={m.group(2)}{qx_prefix}/{m.group(3)}', h)

    def repl_link(m):
        prefix, q, href, q2, tail = m.group(1), m.group(2), m.group(3), m.group(4), m.group(5)
        path = '/' + href.split('?')[0]
        if path in LINK_MAP:
            # 本地档案页：站内 hash 直达（无刷新）
            return f'{prefix}{q}{LINK_MAP[path]}{q2}{tail}'
        # 无本地复刻：原站新窗口（不死链）
        return f'{prefix}{q}{B_QIXIN}/{href}{q2} target="_blank"{tail}'

    h = re.sub(r'(<a\b[^>]*\bhref=)(["\'])/(?!qixin-raw)([^"\']*)(["\'])([^>]*>)', repl_link, h)
    h = re.sub(r'\s(zgclickable|zghook)="[^"]*"', '', h)
    return h


def find_main_tabs(soup):
    """主 Tab 工具条：包含档案 tab 标题文本（基本信息/企业图谱）的 ent-nav-tabs-wrapper"""
    for el in soup.select('.ent-nav-tabs-wrapper'):
        txt = el.get_text()
        if '基本信息' in txt or '企业图谱' in txt:
            return el
    return None


def extract_content(html):
    """提取内容区（去掉概要 + 主 Tab 工具条；壳由 shell.ts 统一提供）：
    - 有主 Tab 工具条的页：工具条之后 = 内容区
    - 图谱页/历史信息（无主 Tab 工具条）：navigator + 图区（图谱）/ navigator + 导航后内容（历史）
    """
    soup = BeautifulSoup(html, 'html.parser')
    tabs = find_main_tabs(soup)
    if tabs is not None:
        return ''.join(str(s) for s in tabs.next_siblings)
    nav = soup.find(id='navigator')
    if nav is not None:
        parts = [str(nav)]
        chart = (
            soup.select_one('.new-chart-content')
            or soup.find(id='chartLayoutContainer')
            or soup.select_one('.chart-layout__container')
            or soup.select_one('.chart-layout-container')
            or soup.find(id='structure-container')
            or soup.find(id='structureChart')
            or soup.find(id='chartSVg')
        )
        if chart is not None:
            parts.append(str(chart))
        else:
            parts.append(''.join(str(s) for s in nav.next_siblings))
        return ''.join(parts)
    return html


def extract_shell():
    """壳 = ent-basic 的概要(ent-header) + 主 Tab 工具条(ent-nav-tabs-wrapper，吸顶)"""
    soup = BeautifulSoup(read(os.path.join(QX, '企业档案 - 基本信息')), 'html.parser')
    hdr = soup.select_one('.ent-header')
    tabs = find_main_tabs(soup)
    parts = []
    if hdr is not None:
        parts.append(str(hdr))
    if tabs is not None:
        tabs['style'] = 'position:sticky;top:0;z-index:60;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.06)'
        parts.append(str(tabs))
    return ''.join(parts)


def esc_ts(s):
    return s.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')


# 图谱导航条样式源码缺失（navigation-item 等不在任何 _files css）+ dump 把完整导航树展开了（导航条高 1129px 盖住图）
# 补丁：导航条限高一行、隐藏子导航树、主题胶囊样式；应用到所有含 #navigator 的页（企业链图/图谱子页/历史信息）
GRAPH_NAV_PATCH = '''
/* ---- 图谱导航补丁（qixin 源码缺失 + dump 导航树展开修复） ---- */
#navigator-mat{height:0!important;display:none!important}
#navigator{position:sticky!important;top:0!important;z-index:50!important;max-height:52px!important;overflow:hidden!important;background:#fff;border-bottom:1px solid #edf0f5;box-shadow:0 1px 4px rgba(0,0,0,.05)}
.nav-div,.nav-container{display:flex!important;align-items:center;gap:4px;padding:7px 12px!important;overflow-x:auto!important;white-space:nowrap;background:#fff}
.nav-container::-webkit-scrollbar{height:3px}
.mainNav{display:flex!important;align-items:center;gap:4px}
.nav-detail,.sub-nav-dropdown,.sub-navigation,.sub-nav-dropdown-hide,.roll-btn{display:none!important}
.navigation-item-wrap{display:inline-flex!important}
.navigation-item{display:inline-flex;align-items:center;padding:4px 13px;border-radius:13px;background:#f3f5f9;color:#333;font-size:13px;white-space:nowrap;cursor:pointer;margin-right:6px}
.navigation-item.disabled{opacity:.4;cursor:not-allowed}
.navigation-item .item-tag{font-size:11px;color:#999;margin-left:4px}
.chart-layout-container,.new-chart-content{min-height:480px;padding:10px}
'''


def build_page(p):
    sub = 'person' if p['id'].startswith('person') else 'ent'
    # ---- HTML ----
    html_text = None
    if p.get('src'):
        p0 = os.path.join(QX, p['src'])
        if os.path.exists(p0) and os.path.getsize(p0) > 0:
            html_text = read(p0)
    if html_text is None and p.get('html'):
        ph = os.path.join(QX, p['html'])
        if os.path.exists(ph):
            html_text = extract_from_html(ph)
    if html_text is None:
        raise RuntimeError(f'HTML 源缺失: {p["id"]}')

    # ---- CSS ----
    css_name = p.get('css_from') or p.get('html')
    files_dir = css_name.replace('.html', '') + '_files' if css_name else None
    files_dir_abs = os.path.join(QX, files_dir) if files_dir else None
    if not files_dir_abs or not os.path.isdir(files_dir_abs):
        css_name = CSS_FALLBACK[sub]
        files_dir = css_name.replace('.html', '') + '_files'
    styles_src = ''
    if css_name:
        ph = os.path.join(QX, css_name)
        if os.path.exists(ph):
            seen = set()
            chunks = []
            for kind, ref in collect_styles(ph):
                if kind == 'inline':
                    chunks.append(ref)
                    continue
                fp = os.path.join(QX, ref)
                if not os.path.exists(fp):
                    continue
                t = read(fp)
                t = inline_imports(t, os.path.dirname(fp), seen)
                t = rewrite_urls(t, os.path.basename(os.path.dirname(fp)))
                chunks.append(t)
            styles_src = '\n'.join(chunks)

    html_clean = clean_html(html_text, files_dir)
    # 给主 Tab 条加吸顶内联（原站用 JS 滚动监听，CSS 无 sticky；dump 出的 inline style 仅 top:42px 缺 position）
    # 用正则替换：每个 .ent-nav-tabs-wrapper 开标签和 #peolpe-navigator 开标签后注入 sticky
    import re as _re
    _sticky = ' style="position:sticky;top:0;z-index:60;background:#fff"'
    # 已有 style 属性的合并处理（极少见，简化覆盖到末尾内联）
    def _add_sticky(m):
        head = m.group(1)
        # 跳过已有 position:sticky 的（幂等）
        if 'position:sticky' in m.group(0):
            return m.group(0)
        return f'{head}{_sticky}'
    html_clean = _re.sub(r'(<div[^>]*class="ent-nav-tabs-wrapper"[^>]*?)(?=\s*>)', _add_sticky, html_clean)
    html_clean = _re.sub(r'(<div[^>]*id="peolpe-navigator"[^>]*?)(?=\s*>)', _add_sticky, html_clean)
    # 含 #navigator 的页（企业链图/图谱子页/历史信息）都追加导航条补丁
    if 'id="navigator"' in html_clean or 'id="navigator"' in html_text:
        styles_src += GRAPH_NAV_PATCH
    return p['id'], html_clean, styles_src


def main():
    os.makedirs(OUT, exist_ok=True)
    total_h = total_c = 0
    for p in PAGES:
        pid, html, css = build_page(p)
        total_h += len(html)
        total_c += len(css)
        ts = (f'// 自动生成 (python scripts/gen_qixin_pages.py)，源: record/qixin/。请勿手改。\n'
              f'// html={len(html)} chars, css={len(css)} chars\n'
              f'// prettier-ignore\nexport const html = `{esc_ts(html)}`\n'
              f'// prettier-ignore\nexport const css = `{esc_ts(css)}`\n')
        with open(os.path.join(OUT, f'{pid}.ts'), 'w', encoding='utf-8') as f:
            f.write(ts)
        print(f'OK {pid:<28} html={len(html)/1024:7.0f}KB css={len(css)/1024:6.0f}KB')
    print(f'\n共 {len(PAGES)} 页 | html {total_h/1048576:.1f}MB css {total_c/1048576:.1f}MB')


if __name__ == '__main__':
    main()
