import re, html, sys

def clean(s):
    s = re.sub(r'<[^>]+>', ' ', s)
    s = html.unescape(s)
    s = re.sub(r'[ \t\u00a0]+', ' ', s)
    s = re.sub(r'\n\s*\n+', '\n', s)
    return s.strip()

def dump(fn, out):
    data = open(fn, encoding='utf-8').read()
    with open(out, 'w', encoding='utf-8') as f:
        f.write(f'===== {fn} (len={len(data)}) =====\n\n')
        # split into sections by form-item labels
        # find all label texts
        for kw in ['监控粒度', '监控时段', '预警规则', '自定义规则', '规则', '阈值', '触发', '通知', '告警']:
            for m in re.finditer(kw, data):
                i = m.start()
                chunk = data[max(0, i-100): i+1200]
                f.write(f'\n----- context around [{kw}] @ {i} -----\n')
                f.write(clean(chunk)[:1200] + '\n')

if __name__ == '__main__':
    dump('record/temp/pinlv', 'record/temp/_pinlv_clean.txt')
    dump('record/temp/event', 'record/temp/_event_clean.txt')
    print('done')
