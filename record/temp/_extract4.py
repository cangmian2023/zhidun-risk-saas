import re, html

def clean(s):
    s = re.sub(r'<[^>]+>', ' ', s)
    s = html.unescape(s)
    s = re.sub(r'[ \t\u00a0]+', ' ', s)
    s = re.sub(r'\n\s*\n+', '\n', s)
    return s.strip()

data = open('record/temp/event', encoding='utf-8').read()

for kw in ['自定义', '条件', '大于', '触发', '预警']:
    for m in re.finditer(kw, data):
        i = m.start()
        chunk = data[max(0, i-300): i+900]
        print(f'\n----- [{kw}] @ {i} -----')
        print(clean(chunk)[:1100])
