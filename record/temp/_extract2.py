import re, html

def clean(s):
    s = re.sub(r'<[^>]+>', ' ', s)
    s = html.unescape(s)
    s = re.sub(r'[ \t\u00a0]+', ' ', s)
    s = re.sub(r'\n\s*\n+', '\n', s)
    return s.strip()

data = open('record/temp/pinlv', encoding='utf-8').read()

# granularity candidate options
print('===== 监控粒度 候选词 =====')
for kw in ['按分钟','按小时','按天','按自然日','按周','按工作日','按日','按月','实时','每']:
    n = len(re.findall(re.escape(kw), data))
    if n: print(f'  {kw}: {n}')

# tail after 预警规则
i = data.find('3.预警规则')
tail = data[i:]
print('\n===== 预警规则段(clean, 前6000字) =====')
print(clean(tail)[:6000])
