// ① 数据源管理（管理中心 · 配置域）— 配置JSON 蓝；样例数据行 橘
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Panel, DataTable, Modal, Button } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { Cfg, Sam, Cal } from './SourceTag';
import { PageShell } from './PageShell';
import { useMidDataSources, updateDataSources, midNewId } from './midStore';
import type { MidDataSource, MidField, DataSourceType } from './midData';

const TYPE_LABEL: Record<DataSourceType, string> = { sample: '本地样例', api: 'API', sql: '数据库' };
const inp: React.CSSProperties = { padding: '6px 8px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, width: '100%', background: '#fff' };
const lbl: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#475569', minWidth: 180 };
const th: React.CSSProperties = { padding: '6px 8px', borderBottom: '1px solid #E2E8F0', fontWeight: 500, textAlign: 'left' };
const td: React.CSSProperties = { padding: '4px 8px', borderBottom: '1px solid #F1F5F9' };
const inpSm: React.CSSProperties = { padding: '4px 6px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, width: '100%', background: '#fff' };

export default function MidDataSourceConfig() {
  const sources = useMidDataSources();
  const [editing, setEditing] = useState<MidDataSource | null>(null);
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const [params] = useSearchParams();
  const openedRef = useRef<string | null>(null);
  useEffect(() => {
    const eid = params.get('edit');
    if (eid && openedRef.current !== eid) {
      const s = sources.find((x) => x.id === eid);
      if (s) { openedRef.current = eid; setEditing(JSON.parse(JSON.stringify(s))); setOpen(true); }
    }
  }, [params, sources]);

  const openAdd = () => {
    setEditing({ id: midNewId('ds'), name: '', type: 'sample', desc: '', fields: [], rows: [], status: 'connected', updatedAt: new Date().toISOString().slice(0, 10) });
    setOpen(true);
  };
  const save = () => {
    if (!editing) return;
    const next = { ...editing, updatedAt: new Date().toISOString().slice(0, 10) };
    updateDataSources((list) => {
      const i = list.findIndex((x) => x.id === next.id);
      return i < 0 ? [...list, next] : list.map((x) => (x.id === next.id ? next : x));
    });
    setOpen(false); setEditing(null);
  };
  const remove = (id: string) => updateDataSources((list) => list.filter((x) => x.id !== id));

  const cols: Column[] = [
    { key: 'name', label: '名称' },
    { key: 'typeLabel', label: '类型' },
    { key: 'status', label: '状态', type: 'badge' },
    { key: 'fieldCnt', label: '字段数' },
    { key: 'rowCnt', label: '样例行' },
    { key: 'updatedAt', label: '更新时间' },
  ];
  const rows: Row[] = sources.map((s) => ({
    id: s.id, name: s.name, typeLabel: TYPE_LABEL[s.type],
    status: s.status ?? 'connected', fieldCnt: String(s.fields.length),
    rowCnt: String(s.rows?.length ?? 0), updatedAt: s.updatedAt ?? '',
  } as unknown as Row));

  return (
    <div style={{ padding: 24, maxWidth: 1180 }}>
      <PageShell title="数据源管理" crumb="零售信贷风控 / 管理中心 / 贷中监控配置"
        subtitle="对接多种数据源，为指标库提供字段与样例数据"
        actions={<><Cfg label="配置JSON" value="midDataSources.json" /><Button size="sm" onClick={openAdd}>新建数据源</Button></>} />
      <Panel title="数据源列表" desc="配置即落盘；字段口径统一后供指标库引用"
        actions={<Sam label="样例数据" value={`${sources.reduce((a, s) => a + (s.rows?.length || 0), 0)} 行`} />}>
        <DataTable columns={cols} rows={rows} clickableKey="name"
          onCellClick={(r) => nav('/console/cm:mid-data-source-detail?id=' + String(r.id))} />
      </Panel>

      <Modal open={open} onClose={() => setOpen(false)}
        title={editing && sources.find((s) => s.id === editing.id) ? '编辑数据源' : '新建数据源'} width="max-w-3xl"
        footer={<><Button onClick={save}>保存</Button><Button variant="secondary" onClick={() => setOpen(false)}>取消</Button></>}>
        {editing && <Editor value={editing} onChange={setEditing} onRemove={() => { if (editing) { remove(editing.id); setOpen(false); setEditing(null); } }} />}
      </Modal>
    </div>
  );
}

function Editor({ value, onChange, onRemove }: { value: MidDataSource; onChange: (v: MidDataSource) => void; onRemove: () => void }) {
  const set = (p: Partial<MidDataSource>) => onChange({ ...value, ...p });
  const setField = (i: number, p: Partial<MidField>) => set({ fields: value.fields.map((f, idx) => idx === i ? { ...f, ...p } : f) });
  const addField = () => set({ fields: [...value.fields, { key: '', label: '', kind: 'dim', type: 'string' }] });
  const removeField = (i: number) => set({ fields: value.fields.filter((_, idx) => idx !== i) });
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <label style={lbl}>名称<input style={inp} value={value.name} onChange={(e) => set({ name: e.target.value })} /></label>
        <label style={lbl}>类型
          <select style={inp} value={value.type} onChange={(e) => set({ type: e.target.value as DataSourceType })}>
            <option value="sample">本地样例</option><option value="api">API</option><option value="sql">数据库</option>
          </select>
        </label>
        <label style={lbl}>描述<input style={inp} value={value.desc ?? ''} onChange={(e) => set({ desc: e.target.value })} /></label>
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>字段清单 <Cal label="字段口径" /></span>
          <Button size="sm" variant="secondary" onClick={addField}>添加字段</Button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead><tr style={{ color: '#64748B' }}>
            <th style={th}>字段key</th><th style={th}>标签</th><th style={th}>维度/度量</th><th style={th}>类型</th><th style={th}>单位</th><th style={th}></th>
          </tr></thead>
          <tbody>
            {value.fields.map((f, i) => (
              <tr key={i}>
                <td style={td}><input style={inpSm} value={f.key} onChange={(e) => setField(i, { key: e.target.value })} /></td>
                <td style={td}><input style={inpSm} value={f.label} onChange={(e) => setField(i, { label: e.target.value })} /></td>
                <td style={td}><select style={inpSm} value={f.kind} onChange={(e) => setField(i, { kind: e.target.value as MidField['kind'] })}>
                  <option value="dim">维度</option><option value="measure">度量</option></select></td>
                <td style={td}><select style={inpSm} value={f.type} onChange={(e) => setField(i, { type: e.target.value as MidField['type'] })}>
                  <option value="string">string</option><option value="number">number</option><option value="date">date</option></select></td>
                <td style={td}><input style={inpSm} value={f.unit ?? ''} onChange={(e) => setField(i, { unit: e.target.value })} /></td>
                <td style={td}><Button size="sm" variant="ghost" onClick={() => removeField(i)}>删</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>数据预览 <Sam label="样例数据" value={`${value.rows.length} 行`} /></div>
        <div style={{ maxHeight: 180, overflow: 'auto', border: '1px solid #E2E8F0', borderRadius: 8 }}>
          <DataTable columns={(value.fields.length ? value.fields : [{ key: '_', label: '_', kind: 'dim' as const, type: 'string' as const }]).map((f) => ({ key: f.key, label: f.label }))}
            rows={value.rows.slice(0, 10).map((r, i) => ({ id: String(i), ...r } as unknown as Row))} />
        </div>
      </div>
      {value.id && <Button variant="ghost" size="sm" onClick={onRemove}>删除该数据源</Button>}
    </div>
  );
}
