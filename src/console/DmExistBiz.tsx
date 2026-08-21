import React, { useState, useRef, useEffect } from 'react';

/* ===================== 筛选项配置（每个都是多选下拉） ===================== */
const FILTER_CONFIG: { key: string; label: string; options: string[] }[] = [
  { key: 'owner', label: '部门人员', options: ['张三', '李四', '王五', '赵六', '孙七', '周八'] },
  { key: 'tag', label: '客商标签', options: ['高价值', '潜力客户', '流失预警', '已成交', '待跟进', '战略客户'] },
  { key: 'group', label: '客商分组', options: ['战略客户', '重要客户', '一般客户', '长尾客户', '新客'] },
  { key: 'scope', label: '客商数据范围', options: ['全行', '本部门', '仅自己', '下属机构'] },
  { key: 'remark', label: '有无备注', options: ['有', '无'] },
  { key: 'addTime', label: '添加时间', options: ['最近7天', '最近30天', '最近3个月', '本年', '更早'] },
  { key: 'contractStart', label: '合同开始时间', options: ['最近7天', '最近30天', '最近3个月', '本年', '更早'] },
  { key: 'contractEnd', label: '合同到期时间', options: ['最近7天', '最近30天', '最近3个月', '本年', '更早'] },
  { key: 'payDate', label: '付款日期', options: ['最近7天', '最近30天', '最近3个月', '本年', '更早'] },
];

/* ===================== 时间范围匹配（相对“今天”2026-08-20） ===================== */
const NOW = new Date(2026, 7, 20);
function daysAgo(d: Date) {
  return Math.floor((NOW.getTime() - d.getTime()) / 86400000);
}
function inRange(dateStr: string, label: string) {
  const d = new Date(dateStr);
  const da = daysAgo(d);
  switch (label) {
    case '最近7天': return da >= 0 && da <= 7;
    case '最近30天': return da >= 0 && da <= 30;
    case '最近3个月': return da >= 0 && da <= 90;
    case '本年': return d.getFullYear() === 2026;
    case '更早': return d.getFullYear() < 2026;
    default: return false;
  }
}

/* ===================== 表格表头 ===================== */
const tableColumns = ['企业名称', '产业环节', '所在园区', '最新商机', '最新风险', '操作'];

/* ===================== 表格数据（样例，含各筛选项字段） ===================== */
type BizRow = {
  id: string;
  name: string;
  industry: string;
  park: string;
  newBusiness: string;
  risk: string;
  owners: string[];
  tags: string[];
  group: string;
  scope: string;
  remark: '有' | '无';
  addTime: string;
  contractStart: string;
  contractEnd: string;
  payDate: string;
};

const tableData: BizRow[] = [
  { id: '1', name: '抖音有限公司', industry: '短视频(上游)、网络直播… (11)', park: '中关村科技园区海淀园', newBusiness: '2025-11-20发生新获融资', risk: '2026-08-17新增开庭公告',
    owners: ['张三'], tags: ['战略客户', '高价值'], group: '战略客户', scope: '全行', remark: '有', addTime: '2026-08-18', contractStart: '2025-01-10', contractEnd: '2026-12-31', payDate: '2026-08-15' },
  { id: '2', name: '抖音视界有限公司', industry: '宠物食品(下游)、宠物… (76)', park: '中关村科技园区石景山园', newBusiness: '2026-05-22发生新增中标', risk: '2026-08-19新增法院公告',
    owners: ['李四', '王五'], tags: ['潜力客户'], group: '重要客户', scope: '本部门', remark: '有', addTime: '2026-05-22', contractStart: '2024-06-01', contractEnd: '2027-05-31', payDate: '2026-08-19' },
  { id: '3', name: '北京字节跳动科技有限公司', industry: '互联网(上游)、广告营销… (42)', park: '中关村科技园区海淀园', newBusiness: '2026-03-10发生股权变更', risk: '2026-07-02新增裁判文书',
    owners: ['赵六'], tags: ['已成交', '高价值'], group: '战略客户', scope: '全行', remark: '无', addTime: '2026-03-15', contractStart: '2023-03-01', contractEnd: '2026-02-28', payDate: '2025-12-20' },
  { id: '4', name: '美团科技有限公司', industry: '生活服务(中游)、本地生活… (58)', park: '望京科技园', newBusiness: '2025-11-18发生新获融资', risk: '2026-06-11新增开庭公告',
    owners: ['孙七'], tags: ['待跟进'], group: '一般客户', scope: '仅自己', remark: '有', addTime: '2025-11-20', contractStart: '2022-11-01', contractEnd: '2026-10-31', payDate: '2025-11-10' },
  { id: '5', name: '小米科技有限责任公司', industry: '智能硬件(上游)、IoT… (33)', park: '小米科技园', newBusiness: '2026-08-01发生新增中标', risk: '2026-08-03新增法院公告',
    owners: ['周八', '张三'], tags: ['潜力客户', '战略客户'], group: '重要客户', scope: '下属机构', remark: '无', addTime: '2026-08-01', contractStart: '2025-08-01', contractEnd: '2026-09-30', payDate: '2026-08-05' },
  { id: '6', name: '比亚迪股份有限公司', industry: '新能源汽车(中游)、电池… (91)', park: '坪山新能源汽车产业园', newBusiness: '2026-07-22发生新获融资', risk: '2026-07-25新增裁判文书',
    owners: ['李四'], tags: ['高价值', '已成交'], group: '战略客户', scope: '全行', remark: '有', addTime: '2026-07-25', contractStart: '2024-01-15', contractEnd: '2027-01-14', payDate: '2026-07-30' },
  { id: '7', name: '京东集团股份有限公司', industry: '电商(中游)、物流… (120)', park: '亦庄经开区', newBusiness: '2026-06-08发生新增中标', risk: '2026-06-09新增开庭公告',
    owners: ['王五'], tags: ['流失预警'], group: '一般客户', scope: '本部门', remark: '有', addTime: '2026-06-10', contractStart: '2023-09-01', contractEnd: '2026-08-31', payDate: '2026-06-15' },
  { id: '8', name: '华为技术有限公司', industry: '通信设备(上游)、ICT… (205)', park: '华为坂田基地', newBusiness: '2026-02-15发生股权变更', risk: '2026-02-18新增法院公告',
    owners: ['赵六', '孙七'], tags: ['战略客户', '高价值'], group: '战略客户', scope: '全行', remark: '无', addTime: '2026-02-18', contractStart: '2021-02-01', contractEnd: '2026-12-31', payDate: '2026-02-20' },
  { id: '9', name: '宁德时代新能源科技股份有限公司', industry: '动力电池(中游)、储能… (67)', park: '宁德锂电新能源产业园', newBusiness: '2025-12-03发生新获融资', risk: '2025-12-08新增裁判文书',
    owners: ['周八'], tags: ['潜力客户'], group: '重要客户', scope: '仅自己', remark: '有', addTime: '2025-12-05', contractStart: '2024-12-01', contractEnd: '2027-11-30', payDate: '2025-12-10' },
];

/* ===================== 多选下拉组件 ===================== */
function MultiSelect({ label, options, selected, onChange }: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const toggle = (opt: string) => onChange(selected.includes(opt) ? selected.filter((v) => v !== opt) : [...selected, opt]);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 4, fontSize: 16, color: selected.length ? '#2563eb' : '#374151',
          background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 2px',
        }}
      >
        <span>{label}</span>
        {selected.length > 0 && (
          <span style={{ background: '#eff6ff', color: '#2563eb', borderRadius: 10, fontSize: 12, padding: '0 6px', lineHeight: '18px' }}>{selected.length}</span>
        )}
        <span style={{ fontSize: 12 }}>∨</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: 4, minWidth: 160, zIndex: 50, maxHeight: 260, overflowY: 'auto' }}>
          {options.map((opt) => (
            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 14, borderRadius: 6 }} onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
              <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} />
              <span style={{ color: '#374151' }}>{opt}</span>
            </label>
          ))}
          {options.length === 0 && <div style={{ padding: 10, color: '#999', fontSize: 13 }}>暂无选项</div>}
        </div>
      )}
    </div>
  );
}

/* ===================== 主页面 ===================== */
export default function CustomerList() {
  const [checkedList, setCheckedList] = useState<string[]>([]);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [keyword, setKeyword] = useState('');

  const handleCheckAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setCheckedList(filtered.map((item) => item.id));
    else setCheckedList([]);
  };
  const handleRowCheck = (id: string, checked: boolean) => {
    if (checked) setCheckedList([...checkedList, id]);
    else setCheckedList(checkedList.filter((v) => v !== id));
  };

  const setFilter = (key: string, v: string[]) => setFilters((f) => ({ ...f, [key]: v }));

  const matchRow = (row: BizRow) => {
    for (const cfg of FILTER_CONFIG) {
      const sel = filters[cfg.key];
      if (!sel || sel.length === 0) continue;
      let ok = false;
      if (cfg.key === 'owner') ok = row.owners.some((o) => sel.includes(o));
      else if (cfg.key === 'tag') ok = row.tags.some((t) => sel.includes(t));
      else if (cfg.key === 'group') ok = sel.includes(row.group);
      else if (cfg.key === 'scope') ok = sel.includes(row.scope);
      else if (cfg.key === 'remark') ok = sel.includes(row.remark);
      else if (cfg.key === 'addTime') ok = sel.some((s) => inRange(row.addTime, s));
      else if (cfg.key === 'contractStart') ok = sel.some((s) => inRange(row.contractStart, s));
      else if (cfg.key === 'contractEnd') ok = sel.some((s) => inRange(row.contractEnd, s));
      else if (cfg.key === 'payDate') ok = sel.some((s) => inRange(row.payDate, s));
      if (!ok) return false;
    }
    if (keyword && !row.name.includes(keyword.trim())) return false;
    return true;
  };

  const filtered = tableData.filter(matchRow);
  const hasFilter = Object.values(filters).some((v) => v.length > 0) || keyword.trim() !== '';

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: '#ffffff', overflow: 'auto' }}>
      {/* 顶部客商筛选栏 */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f2f5' }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <span style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>客商筛选</span>
          {FILTER_CONFIG.map((cfg) => (
            <MultiSelect
              key={cfg.key}
              label={cfg.label}
              options={cfg.options}
              selected={filters[cfg.key] ?? []}
              onChange={(v) => setFilter(cfg.key, v)}
            />
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            {hasFilter && (
              <button
                onClick={() => { setFilters({}); setKeyword(''); }}
                style={{ padding: '8px 14px', borderRadius: '20px', border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', fontSize: 14, cursor: 'pointer' }}
              >
                重置筛选
              </button>
            )}
            <button
              style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #dbeafe', backgroundColor: '#eff6ff', color: '#2563eb', fontSize: '14px', cursor: 'pointer' }}
            >
              高级筛选
            </button>
          </div>
        </div>
      </div>

      {/* 操作工具栏 */}
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid #f0f2f5', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '16px', color: '#4b5563' }}>找到 <span style={{ color: '#16a34a', fontWeight: 600 }}>{filtered.length}</span> 条结果</span>
        <div style={{ flex: 1 }}></div>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="输入企业关键字"
          style={{
            padding: '8px 12px 8px 32px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px',
            background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' fill=\'%239ca3af\' viewBox=\'0 0 16 16\'%3E%3Cpath d=\'M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z\'/%3E%3C/svg%3E") no-repeat left 10px center',
          }}
        />
        <button style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px' }}>设置标签</button>
        <button style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px' }}>变更负责人</button>
        <button style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px' }}>变更分组</button>
        <button style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px' }}>删除</button>
        <button style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px' }}>导出</button>
        <button style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px' }}>展示字段 (5/26)</button>
      </div>

      {/* 表格区域 */}
      <div style={{ padding: '0 20px' }}>
        <div className="overflow-x-auto"><table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th style={{ padding: '12px 8px', textAlign: 'left', border: '1px solid #e5e7eb', width: '40px' }}>
                <input type="checkbox" onChange={handleCheckAll} checked={checkedList.length === filtered.length && filtered.length > 0} />
              </th>
              {tableColumns.map((col) => (
                <th key={col} style={{ padding: '12px 8px', textAlign: 'left', border: '1px solid #e5e7eb', fontSize: '16px', color: '#1f2937' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb' }}>
                  <input type="checkbox" checked={checkedList.includes(row.id)} onChange={(e) => handleRowCheck(row.id, e.target.checked)} />
                </td>
                <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px' }}>{row.name}</td>
                <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px' }}>{row.industry}</td>
                <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px' }}>{row.park}</td>
                <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px' }}>{row.newBusiness}</td>
                <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px' }}>{row.risk}</td>
                <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px' }}>
                  <span style={{ marginRight: '12px', cursor: 'pointer' }}>🗂</span>
                  <span style={{ cursor: 'pointer' }}>🗑</span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={tableColumns.length + 1} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: 14, border: '1px solid #e5e7eb' }}>
                  没有符合筛选条件的客商，试试减少筛选条件
                </td>
              </tr>
            )}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
