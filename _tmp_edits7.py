import re

# ===================== ReportTemplate.tsx =====================
p1 = r"D:/yuexin/project/risk/saas/src/console/ReportTemplate.tsx"
L1 = open(p1, encoding='utf-8').read().split('\n')

# #3 inpSm minWidth 90 -> 0 (stops control overflow into neighbour columns)
assert any('minWidth: 90' in x for x in L1), "minWidth 90 not found"
L1 = [x.replace('minWidth: 90', 'minWidth: 0') for x in L1]

# #1 data source: 提示标签 column (bare <col/>) -> fixed width 120 (was auto/too wide)
assert L1[509].strip() == '<col />', f"ds col bare mismatch: {L1[509]!r}"
L1[509] = L1[509].replace('<col />', "<col style={{ width: 120 }} />")

# #1 data source header rename
assert '提示标签（显示名）' in L1[525], f"ds header mismatch: {L1[525]!r}"
L1[525] = L1[525].replace('提示标签（显示名）', '提示标签')

# #1 API: 显示名 column width 120 -> 100 (shorten)
assert "<col style={{ width: 120 }} />" in L1[575], f"api col mismatch: {L1[575]!r}"
L1[575] = L1[575].replace("<col style={{ width: 120 }} />", "<col style={{ width: 100 }} />")

# #1 API header rename
assert '显示名（标签）' in L1[591], f"api header mismatch: {L1[591]!r}"
L1[591] = L1[591].replace('显示名（标签）', '提示标签')

# #3 sticky 字段名/显示名 cells: clip overflow so they don't paint over neighbours
L1 = [x.replace("color: '#374151', position: 'sticky'",
                "color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', position: 'sticky'")
      for x in L1]

# #2 remove 说明 column (col + thead + tbody) in all three tables
for i in sorted([513, 529, 550, 583, 599, 622, 646, 660, 679], reverse=True):
    assert L1[i].strip() != '', f"delete empty line {i+1}: {L1[i]!r}"
    L1.pop(i)

# #4 strip tooltip title="..." inside the three table bodies
for (a, b) in [(538, 560), (604, 628), (670, 689)]:
    for j in range(a, b + 1):
        L1[j] = re.sub(r'title="[^"]*"', '', L1[j])

# #4 helper texts: fix stale 提示标签 / 说明 references
repl = [
    ("；「提示标签」是前端显示名（如 姓名），显示方式/脱敏规则/说明也可在卡片上直接配。",
     "；「提示标签」是前端显示名；显示方式/脱敏规则在卡片上直接配。"),
    ("字段 key / 显示名 / 类型 / 显示方式均在卡片上配置",
     "字段 key / 提示标签 / 类型 / 显示方式均在卡片上配置"),
    ("字段的「启用 / 提示标签（显示名）/ 显示方式 / 脱敏规则 / 说明」均在卡片上直接配置",
     "字段的「启用 / 提示标签 / 显示方式 / 脱敏规则」均在卡片上直接配置"),
    ("（显示名 / 类型 / 显示方式 / 条件 / 分值 / 豁免）",
     "（提示标签 / 类型 / 显示方式 / 条件 / 分值 / 豁免）"),
]
for old, new in repl:
    c = sum(1 for x in L1 if old in x)
    assert c == 1, f"helper replace count={c}: {old[:24]}"
    L1 = [x.replace(old, new) for x in L1]

open(p1, 'w', encoding='utf-8').write('\n'.join(L1))
print("ReportTemplate.tsx OK")

# ===================== reportTemplateData.ts =====================
p2 = r"D:/yuexin/project/risk/saas/src/console/reportTemplateData.ts"
s2 = open(p2, encoding='utf-8').read()

# #5/#6 SECTION_SOURCE: drop risk_factors / score_trend / risk_radar (keep credit_suggestion)
s2 = re.sub(r"\s*risk_factors: 'api',\s*score_trend: 'api',\s*risk_radar: 'api',",
            "\n      credit_suggestion: 'api',", s2, count=1)

# #7 insert type-inference helpers before the 脱敏规则 comment
INF = '''/* 字段名/说明 → 推断接口字段类型（让「类型」列与实际数据相符，避免全为 string） */
export function inferFieldType(name: string, desc: string): ApiFieldType {
  const t = `${name} ${desc}`
  if (/图片|影像|照片|证照|头像|面|活体/i.test(t)) return 'image'
  if (/视频|录像|mp4/i.test(t)) return 'video'
  if (/文件|附件|pdf|文档|合同/i.test(t)) return 'file'
  if (/时间|日期|date|出生|到期|创建|更新|申请时间/i.test(t)) return 'date'
  if (/是否|通过|拒绝|命中|成功|失败|一致|异常|校验|核验|有|无|bool/i.test(t)) return 'boolean'
  if (/年龄|岁|月收入|收入|额度|金额|分数|分|利率|期数|笔数|次数|数量|余额|负债|比例|评分|分值/i.test(t)) return 'number'
  if (/状态|等级|类型|渠道|来源|原因|行业|职业|婚姻|学历|性别|证件|关系|标签/i.test(t)) return 'enum'
  if (/维度|明细|列表|结构|json|详情|记录|图谱|项/i.test(t)) return 'json'
  return 'string'
}
/* 字段名 → 推断数据库列类型（让数据源「类型」列与实际库表相符，避免全为 varchar） */
export function inferDbType(name: string): string {
  if (/金额|收入|额度|利率|余额|负债|比例/.test(name)) return 'decimal(18,2)'
  if (/年龄|岁|月收入|笔数|次数|数量|期数|分|分数|评分|分值/i.test(name)) return 'int'
  if (/时间|日期|date|出生|到期|创建|更新|申请时间/i.test(name)) return 'datetime'
  if (/是否|通过|命中|校验|核验|一致|异常|有|无/i.test(name)) return 'tinyint'
  return 'varchar(64)'
}
'''
assert "/* 脱敏规则：决定该字段在报告里以何种方式脱敏 */" in s2, "mask comment not found"
s2 = s2.replace("/* 脱敏规则：决定该字段在报告里以何种方式脱敏 */", INF + "/* 脱敏规则：决定该字段在报告里以何种方式脱敏 */", 1)

# #7 use inference instead of hard-coded 'varchar' / 'string'
assert "type: 'varchar'" in s2, "varchar literal not found"
s2 = s2.replace("type: 'varchar'", "type: inferDbType(f.name)", 1)
assert "type: 'string'" in s2, "string literal not found"
s2 = s2.replace("type: 'string'", "type: inferFieldType(f.name, f.desc)", 1)

# #5/#6 delete the three chart sections from SECTION_CATALOG.credit (risk_factors / score_trend / risk_radar)
# locate by id lines, remove the enclosing object blocks
def remove_section(block_id):
    global s2
    m = re.search(r"\n\s*\{\n\s*id: '%s',.*?\n\s*\}," % re.escape(block_id), s2, re.S)
    assert m, f"section {block_id} not found"
    s2 = s2[:m.start()] + s2[m.end():]

remove_section('risk_factors')
remove_section('score_trend')
remove_section('risk_radar')

# #5/#6 remove orphan preview-sample keys for those sections
s2 = [x for x in s2.split('\n') if not (
    x.strip().startswith('risk_factors:') or
    x.strip().startswith('score_trend:') or
    x.strip().startswith('risk_radar:')
)]
s2 = '\n'.join(s2)

open(p2, 'w', encoding='utf-8').write(s2)
print("reportTemplateData.ts OK")
