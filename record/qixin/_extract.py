import sys, re, json, html
from html.parser import HTMLParser

class Extractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = ''
        self.tabs = []
        self.headings = []
        self.tables = []          # list of {cols:[], rows:[[],...]}
        self.cur_table = None
        self.cur_row = None
        self.in_header = False
        self.cell_buf = []
        self.in_cell = False
        self.depth_table = 0
        self.skip = False
        self.script_depth = 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        cls = a.get('class', '') or ''
        if tag == 'script' or tag == 'style':
            self.script_depth += 1
            return
        if self.script_depth:
            return
        if 'pageTitle' in cls and not self.title:
            self._cap = 'title'
        if tag == 'table':
            self.depth_table += 1
            if self.depth_table == 1:
                self.cur_table = {'cols': [], 'rows': []}
        if tag in ('th', 'td') and self.cur_table is not None:
            self.in_cell = True
            self.cell_buf = []
        if tag == 'thead':
            self.in_header = True
        if tag in ('tr',):
            if self.cur_table is not None and self.depth_table == 1:
                self.cur_row = []
        # tab items
        if 'el-tabs__item' in cls and 'el-tabs__item' in cls:
            self._cap = 'tab'

    def handle_endtag(self, tag):
        if tag in ('script', 'style'):
            self.script_depth = max(0, self.script_depth - 1)
            return
        if self.script_depth:
            return
        if tag == 'table':
            if self.depth_table == 1 and self.cur_table is not None:
                # clean empty trailing
                self.cur_table['rows'] = [r for r in self.cur_table['rows'] if any(str(c).strip() for c in r)]
                if self.cur_table['cols'] or self.cur_table['rows']:
                    self.tables.append(self.cur_table)
                self.cur_table = None
            self.depth_table = max(0, self.depth_table - 1)
        if tag in ('th', 'td') and self.cur_table is not None and self.in_cell:
            val = re.sub(r'\s+', ' ', ''.join(self.cell_buf)).strip()
            if self.in_header:
                self.cur_table['cols'].append(val)
            elif self.cur_row is not None:
                self.cur_row.append(val)
            self.in_cell = False
            self.cell_buf = []
        if tag == 'tr' and self.cur_table is not None and self.depth_table == 1:
            if self.cur_row is not None:
                self.cur_table['rows'].append(self.cur_row)
            self.cur_row = None
            self.in_header = False
        if tag in ('div', 'span', 'h1', 'h2', 'h3', 'p', 'section') and getattr(self, '_cap', None):
            buf = re.sub(r'\s+', ' ', ''.join(self.cell_buf)).strip()
            if self._cap == 'title' and buf and not self.title:
                self.title = buf
            if self._cap == 'tab' and buf and buf not in self.tabs:
                self.tabs.append(buf)
            self.cell_buf = []
            self._cap = None

    def handle_data(self, data):
        if self.script_depth:
            return
        t = data.strip()
        if not t:
            return
        cap = getattr(self, '_cap', None)
        if cap in ('title', 'tab'):
            self.cell_buf.append(t)
        else:
            if not hasattr(self, 'texts'):
                self.texts = []
            if t not in self.texts:
                self.texts.append(t)


def main():
    path = sys.argv[1]
    maxrows = int(sys.argv[2]) if len(sys.argv) > 2 else 60
    maxcols = int(sys.argv[3]) if len(sys.argv) > 3 else 14
    raw = open(path, encoding='utf-8', errors='ignore').read()
    # crude heading capture via regex (class names containing title/heading)
    heads = re.findall(r'class="[^"]*(?:panel-title|section-title|card-title|title|headerTitle|module-title)[^"]*"[^>]*>(.*?)</', raw, re.S)
    heads = [re.sub(r'<[^>]+>', '', h) for h in heads]
    heads = [re.sub(r'\s+', ' ', h).strip() for h in heads if h.strip()]
    p = Extractor()
    p.feed(raw)
    out = {
        'title': p.title,
        'tabs': p.tabs[:40],
        'headings': heads[:40],
        'texts': getattr(p, 'texts', [])[:200],
        'tables': [],
    }
    for t in p.tables[:6]:
        cols = t['cols'][:maxcols]
        rows = [r[:maxcols] for r in t['rows'][:maxrows]]
        out['tables'].append({'cols': cols, 'rows': rows, 'nrows_total': len(t['rows'])})
    print(json.dumps(out, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
