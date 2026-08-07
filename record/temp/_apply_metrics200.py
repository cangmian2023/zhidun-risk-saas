# -*- coding: utf-8 -*-
# 把 176 个新指标插入 midData.ts 的 SEED_METRICS，并落盘 midMetrics.json（24+176=200）
import json, re, io

extra = open('d:/tmp/metrics_extra.ts.txt', encoding='utf-8').read().strip()

# 1) 更新 midData.ts
src = open('midData.ts', encoding='utf-8').read()
marker = "  { id: 'm_country', name: '国家（事件属性）', group: '事件属性', dataSourceId: 'ds_event', type: 'base', field: 'country', agg: 'count', precision: 0, enabled: true, vizType: 'hbar', vizSampleId: 'vs_channel_approval' },\n];"
if marker not in src:
    raise SystemExit('SEED_METRICS marker not found')
new_src = src.replace(marker, marker.replace('\n];', '\n' + extra + '\n];'), 1)
open('midData.ts', 'w', encoding='utf-8').write(new_src)
print('midData.ts updated, SEED_METRICS +176')

# 2) 更新 midMetrics.json（保留现有 24 个，追加新指标 JSON 对象）
import sys
sys.path.insert(0, 'd:/yuexin/project/risk/saas/record/temp')
# 直接从 extra TS 文本解析出 JSON 对象列表（字段 id/name/group/desc/dataSourceId/type/field/agg/unit/precision/enabled/vizType）
def parse_ts_entry(line):
    m = re.match(r"\{ id: '([^']+)', name: '([^']+)', group: '([^']+)', desc: '([^']*)', dataSourceId: '([^']+)', type: '([^']+)', field: '([^']+)', agg: '([^']+)', unit: '([^']*)', precision: ([0-9]+), enabled: (true|false)(, vizType: '([^']+)')? \}", line.strip().rstrip(','))
    if not m:
        raise SystemExit('parse fail: ' + line[:80])
    obj = {
        'id': m.group(1), 'name': m.group(2), 'group': m.group(3), 'desc': m.group(4),
        'dataSourceId': m.group(5), 'type': m.group(6), 'field': m.group(7),
        'agg': m.group(8), 'unit': m.group(9), 'precision': int(m.group(10)),
        'enabled': m.group(11) == 'true',
    }
    if m.group(13):
        obj['vizType'] = m.group(13)
    return obj

metrics = json.load(open('midMetrics.json', encoding='utf-8'))
have = {x['id'] for x in metrics}
added = 0
for line in extra.split('\n'):
    if not line.strip():
        continue
    obj = parse_ts_entry(line)
    if obj['id'] in have:
        continue
    metrics.append(obj)
    have.add(obj['id'])
    added += 1
with open('midMetrics.json', 'w', encoding='utf-8') as f:
    json.dump(metrics, f, ensure_ascii=False, indent=2)
print(f'midMetrics.json updated: {len(metrics)} metrics (+{added})')
