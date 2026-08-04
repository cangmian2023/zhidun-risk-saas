// ① 数据源管理（管理中心 · 贷中监控配置）
// 流程：创建（确定类型）→ 按类型配置连接 → 字段管理 → 样例数据
// 标签：连接/字段配置=蓝(配置JSON) ｜ 样例数据=橘(样例JSON) ｜ 测试结果=灰(实时)
import { useState } from 'react';
import { PageHeader, Panel, Button, DataTable, Modal } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { useMidDataSources, updateDataSources, midNewId, useMidSaveStatus } from './midStore';
import { MidSaveToast, Cfg, Sam, Cal } from './SourceTag';
import type { MidDataSource, MidField, FieldType, DataSourceType, MidConnConfig } from './midData';

const TYPE_META: Record<DataSourceType, string> = { sample: '本地样例', api: 'API 接口', sql: '数据库' };
const TYPE_COLOR: Record<DataSourceType, string> = { sample: '#0F766E', api: '#7C3AED', sql: '#D97706' };

const fieldCols: Column[] = [
  { key: 'key', label: '字段Key' },
  { key: 'label', label: '字段名' },
  { key: 'kind', label: '类型', type: 'badge' },
  { key: 'type', label: '数据类型' },
  { key: 'unit', label: '单位' },
];

function emptyField(): MidField { return { key: '', label: '', kind: 'dim', type: 'string' }; }

export default function MidDataSourceConfig() {
  const list = useMidDataSources();
  const saveStatus = useMidSaveStatus();
  const [activeId, setActiveId] = useState<string | null>(list[0]?.id ?? null);
  const [showNew, setShowNew] = useState(false);
  const [newType, setNewType] = useState<DataSourceType>('sample');
  const [newName, setNewName] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);   // 灰：实时测试结果

  const active = list.find((d) => d.id === activeId) ?? null;

  const save = (next: MidDataSource) => {
    updateDataSources((l) => l.map((d) => (d.id === next.id ? next : d)));
  };
  const patchConn = (p: Partial<MidConnConfig>) => {
    if (!active) return;
    save({ ...active, conn: { ...(active.conn ?? {}), ...p } });
  };

  const listCols: Column[] = [
    { key: 'name', label: '数据源名称' },
    { key: 'type', label: '类型', type: 'badge' },
    { key: 'status', label: '状态', type: 'badge' },
    { key: 'fields', label: '字段数' },
  ];
  const listRows = list.map((d) => ({
    id: d.id, name: d.name, type: TYPE_META[d.type],
    status: d.status === 'connected' ? '已连接' : d.status === 'failed' ? '连接失败' : '未测试',
    fields: d.fields.length,
  }));

  const previewCols: Column[] = active ? active.fields.map((f) => ({ key: f.key, label: f.label })) : [];
  const previewRows: Row[] = active ? active.rows.slice(0, 8).map((r, i) => ({ id: `row_${i}`, ...r }) as unknown as Row) : [];

  const patchField = (i: number, p: Partial<MidField>) => {
    if (!active) return;
    const fields = active.fields.map((f, idx) => (idx === i ? { ...f, ...p } : f));
    save({ ...active, fields });
  };

  const runTest = () => {
    if (!active) return;
    const ok = Math.random() > 0.3;
    save({ ...active, status: ok ? 'connected' : 'failed', updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ') });
    setTestResult(ok ? '连接成功（模拟）· 字段已同步' : '连接失败（模拟）· 请检查连接配置');
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200 }}>
      <PageHeader
        title="数据源管理"
        crumb="管理中心 / 贷中监控配置 / 数据源管理"
        subtitle="创建数据源（确定类型）→ 按类型配置连接 → 字段管理 → 样例数据"
        actions={<Button onClick={() => { setNewName(''); setNewType('sample'); setShowNew(true); }}>新建数据源</Button>}
      />
      <MidSaveToast status={saveStatus} />

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, marginTop: 16 }}>
        <Panel title="数据源列表" desc={<span>点击选中进行编辑 <Cfg label="数据源配置" /></span>}>
          <DataTable columns={listCols} rows={listRows} clickableKey="id" onCellClick={(r) => setActiveId(r.id as string)} />
        </Panel>

        <Panel
          title={active ? active.name : '请选择数据源'}
          desc={active ? (
            <span>
              <span style={{ color: TYPE_COLOR[active.type], fontWeight: 500 }}>{TYPE_META[active.type]}</span>
              {active.type === 'sample' ? ' · 样例数据本地 JSON' : ' · 前置连接配置'}
              {active.status === 'connected' ? ' · 已连接' : active.status === 'failed' ? ' · 连接失败' : ''}
            </span>
          ) : undefined}
          actions={active ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => {
                if (confirm(`确认删除数据源 ${active.name}？`)) updateDataSources((l) => l.filter((d) => d.id !== active.id));
              }}>删除</Button>
              {active.type !== 'sample' && <Button size="sm" onClick={runTest}>测试连接</Button>}
            </>
          ) : undefined}
        >
          {active ? (
            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'grid', gap: 6 }}>
                <label style={{ fontSize: 12, color: '#64748B' }}>名称 <Cfg /></label>
                <input value={active.name} onChange={(e) => save({ ...active, name: e.target.value })} style={inp} />
              </div>
              <div style={{ display: 'grid', gap: 6 }}>
                <label style={{ fontSize: 12, color: '#64748B' }}>类型（创建时确定，不可更改） <Cfg /></label>
                <div style={{ padding: '7px 12px', borderRadius: 6, background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: 13, color: '#334155', fontWeight: 500 }}>
                  {TYPE_META[active.type]}
                </div>
              </div>
              <div style={{ display: 'grid', gap: 6 }}>
                <label style={{ fontSize: 12, color: '#64748B' }}>说明 <Cfg /></label>
                <input value={active.desc ?? ''} onChange={(e) => save({ ...active, desc: e.target.value })} style={inp} />
              </div>

              {/* 前置连接配置（仅 api / sql） */}
              {active.type !== 'sample' && (
                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
                    前置连接配置 <Cfg label="连接配置" />
                  </div>
                  {active.type === 'api' ? (
                    <div style={{ display: 'grid', gap: 8 }}>
                      <div><label style={lb}>接口地址</label><input style={inp} value={active.conn?.connStr ?? ''} onChange={(e) => patchConn({ connStr: e.target.value })} placeholder="https://api.example.com/risk/monitor" /></div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div><label style={lb}>请求方式</label>
                          <select style={sel} value={active.conn?.method ?? 'POST'} onChange={(e) => patchConn({ method: e.target.value as 'GET' | 'POST' })}>
                            <option value="POST">POST</option><option value="GET">GET</option>
                          </select>
                        </div>
                        <div><label style={lb}>鉴权方式</label>
                          <select style={sel} value={active.conn?.authType ?? 'none'} onChange={(e) => patchConn({ authType: e.target.value as MidConnConfig['authType'] })}>
                            <option value="none">无</option><option value="bearer">Bearer Token</option><option value="apikey">API Key</option><option value="basic">账号密码</option>
                          </select>
                        </div>
                      </div>
                      {(active.conn?.authType === 'basic' || active.conn?.authType === 'apikey') && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <div><label style={lb}>账号</label><input style={inp} value={active.conn?.account ?? ''} onChange={(e) => patchConn({ account: e.target.value })} /></div>
                          <div><label style={lb}>密码 / Token</label><input type="password" style={inp} value={active.conn?.password ?? ''} onChange={(e) => patchConn({ password: e.target.value })} /></div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: 8 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8 }}>
                        <div><label style={lb}>数据库类型</label>
                          <select style={sel} value={active.conn?.dbType ?? 'mysql'} onChange={(e) => patchConn({ dbType: e.target.value })}>
                            <option value="mysql">MySQL</option><option value="oracle">Oracle</option><option value="postgres">PostgreSQL</option>
                          </select>
                        </div>
                        <div><label style={lb}>连接串</label><input style={inp} value={active.conn?.connStr ?? ''} onChange={(e) => patchConn({ connStr: e.target.value })} placeholder="jdbc:mysql://host:3306/risk" /></div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div><label style={lb}>账号</label><input style={inp} value={active.conn?.account ?? ''} onChange={(e) => patchConn({ account: e.target.value })} /></div>
                        <div><label style={lb}>密码</label><input type="password" style={inp} value={active.conn?.password ?? ''} onChange={(e) => patchConn({ password: e.target.value })} /></div>
                      </div>
                      <div><label style={lb}>查询语句</label><textarea style={{ ...inp, minHeight: 60, fontFamily: 'monospace' }} value={active.conn?.query ?? ''} onChange={(e) => patchConn({ query: e.target.value })} placeholder="SELECT cust_id, loan_balance, overdue_amt FROM loan_account WHERE status='active'" /></div>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                    <Button size="sm" onClick={runTest}>测试连接</Button>
                    {testResult && <span style={{ fontSize: 12 }}><Cal label="测试结果" value={testResult} /></span>}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 12, color: '#94A3B8' }}>
                    字段管理：可手动维护字段清单；Demo 中「同步字段」由样例数据模拟（{active.type === 'api' ? '接口返回字段' : '查询结果字段'}）。
                  </div>
                </div>
              )}

              {/* 字段管理 */}
              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>字段管理 <Cfg label="字段配置" /></span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button size="sm" variant="secondary" onClick={() => {
                      const f = emptyField();
                      save({ ...active, fields: [...active.fields, { ...f, key: `field_${active.fields.length + 1}` }] });
                    }}>添加字段</Button>
                    {active.type !== 'sample' && (
                      <Button size="sm" onClick={() => {
                        const synced = Math.random() > 0.3;
                        save({ ...active, status: synced ? 'connected' : 'failed' });
                        alert(synced ? '字段同步成功（模拟）：拉取到接口/查询结果字段' : '字段同步失败（模拟）');
                      }}>同步字段</Button>
                    )}
                  </div>
                </div>
                <DataTable
                  columns={fieldCols}
                  rows={active.fields.map((f) => ({ id: f.key, key: f.key, label: f.label, kind: f.kind === 'measure' ? '度量' : '维度', type: f.type, unit: f.unit ?? '' }))}
                  clickableKey="key"
                  onCellClick={(r) => {
                    const i = active.fields.findIndex((f) => f.key === r.key);
                    if (i < 0) return;
                    patchField(i, { kind: active.fields[i].kind === 'measure' ? 'dim' : 'measure' });
                  }}
                />
                <div style={{ marginTop: 8, fontSize: 12, color: '#94A3B8' }}>点击字段行切换 维度/度量；字段名/数据类型/单位在下方编辑：</div>
                <div style={{ display: 'grid', gap: 6, marginTop: 6 }}>
                  {active.fields.map((f, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input value={f.key} readOnly style={{ ...inp, width: 140, background: '#F8FAFC' }} />
                      <input value={f.label} placeholder="字段名" onChange={(e) => patchField(i, { label: e.target.value })} style={{ ...inp, flex: 1 }} />
                      <select value={f.type} onChange={(e) => patchField(i, { type: e.target.value as FieldType })} style={sel}>
                        <option value="string">string</option><option value="number">number</option><option value="date">date</option>
                      </select>
                      <input value={f.unit ?? ''} placeholder="单位" onChange={(e) => patchField(i, { unit: e.target.value })} style={{ ...inp, width: 80 }} />
                      <Button variant="ghost" size="sm" onClick={() => save({ ...active, fields: active.fields.filter((_, idx) => idx !== i) })}>删</Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 样例数据 */}
              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 12 }}>
                <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 500 }}>
                  样例数据预览（前 8 行） <Sam label="本地样例 JSON" />
                </div>
                <DataTable columns={previewCols} rows={previewRows} />
                <div style={{ marginTop: 6, fontSize: 12, color: '#94A3B8' }}>
                  {active.type === 'sample'
                    ? '本地样例类型：样例数据行直接保存在 midDataSources.json（橘色来源）。'
                    : `${TYPE_META[active.type]} 类型：样例数据由「同步字段/测试连接」模拟生成，供演示渲染。`}
                </div>
              </div>
            </div>
          ) : <div style={{ color: '#94A3B8', padding: 24, textAlign: 'center' }}>左侧选择数据源开始编辑</div>}
        </Panel>
      </div>

      <Modal
        open={showNew}
        onClose={() => setShowNew(false)}
        title="新建数据源"
        footer={<>
          <Button variant="secondary" onClick={() => setShowNew(false)}>取消</Button>
          <Button onClick={() => {
            if (!newName.trim()) { alert('请填写数据源名称'); return; }
            const ds: MidDataSource = {
              id: midNewId('ds'), name: newName, type: newType,
              conn: newType === 'sql' ? { dbType: 'mysql', connStr: '', query: '' } : { method: 'POST', authType: 'none' },
              fields: [{ key: 'cust_id', label: '客户ID', kind: 'dim', type: 'string' }],
              rows: [], status: 'connected',
            };
            updateDataSources((l) => [...l, ds]);
            setActiveId(ds.id);
            setShowNew(false);
          }}>创建</Button>
        </>}
      >
        <div style={{ display: 'grid', gap: 10 }}>
          <div>
            <label style={lb}>数据源名称</label>
            <input style={inp} value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="如：核心系统-贷款台账" />
          </div>
          <div>
            <label style={lb}>数据源类型（创建后不可更改）</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {(['sample', 'api', 'sql'] as DataSourceType[]).map((t) => (
                <button key={t} onClick={() => setNewType(t)} style={{
                  padding: '10px 6px', borderRadius: 8, fontSize: 13, cursor: 'pointer', textAlign: 'center',
                  border: newType === t ? '1px solid #2563EB' : '1px solid #E2E8F0',
                  background: newType === t ? '#EFF6FF' : '#fff', color: newType === t ? '#1D4ED8' : '#475569',
                }}>
                  {TYPE_META[t]}
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                    {t === 'sample' ? '内置样例数据' : t === 'api' ? '接口对接' : '数据库对接'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

const lb: React.CSSProperties = { display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4 };
const inp: React.CSSProperties = {
  padding: '7px 10px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 13,
  outline: 'none', color: '#0F172A', background: '#fff', width: '100%', boxSizing: 'border-box',
};
const sel: React.CSSProperties = {
  padding: '6px 8px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 13, background: '#fff', color: '#0F172A', width: '100%',
};
