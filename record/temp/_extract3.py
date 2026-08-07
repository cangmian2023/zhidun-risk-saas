import re, html

def clean(s):
    s = re.sub(r'<[^>]+>', ' ', s)
    s = html.unescape(s)
    s = re.sub(r'[ \t\u00a0]+', ' ', s)
    s = re.sub(r'\n\s*\n+', '\n', s)
    return s.strip()

data = open('record/temp/pinlv', encoding='utf-8').read()
i = data.find('3.预警规则')
tail = data[i:]
c = clean(tail)
# print from after the time-slot block
# find index of '完 成' last occurrence then continue
print('TAIL LEN:', len(c))
print(c[6000:16000])
