// 数据源详情（底层模块 · 样例域）— 数据源由用户创建/连接/读取后保存到本地，全部为样例JSON 橘；连接信息来自 conn
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Panel, DataTable, Button, InfoCell, DetailHeader } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { Sam } from './SourceTag';
import { useMidDataSources, useMidMetrics } from './midStore';
import type { MidConnConfig } from './midData';
import { ConfigDetailPage, SRC_TYPE_LABEL } from './ConfigTemplate';
import { PageShell } from './PageShell';

const CONN_SQL: { key: keyof MidConnConfig; label: string; mask?: boolean }[] = [
  { key: 'dbType', label: '数据库类型' },
  { key: 'host', label: '主机 (IP)' },
  { key: 'port', label: '端口' },
  { key: 'database', label: '库名' },
  { key: 'username', label: '用户名' },
  { key: 'password', label: '密码', mask: true },
  { key: 'connStr', label: '连接串' },
  { key: 'query', label: '查询 SQL' },
];

export default function MidDataSourceDetail() {
  const [params] = useSearchParams();
  const id = params.get('id') ?? '';
  const sources = useMidDataSources();
  const metrics = useMidMetrics();
  const nav = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const ds = sources.find((s) => s.id === id);

  if (!ds) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
        <PageShell header={<DetailHeader title="数据源详情" crumb="零售信贷风控 / 管理中心 / 数据源管理" backLabel="返回列表" backTo="/console/cm/mid-data-source" />} />
        <div className="mt-6 rounded-xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-400">未找到该数据源（{id}）。</div>
      </div>
    );
  }

  const usedBy = metrics.filter((m) => m.dataSourceId === ds.id);
  const previewCols: Column[] = (ds.fields.length ? ds.fields : [{ key: '_', label: '_', kind: 'dim' as const, type: 'string' as const }]).map((f) => ({
    key: f.key, label: f.label, tag: { kind: 'sample' as const, value: `${ds.id}.${f.key}` },
  }));
  const previewRows: Row[] = (ds.rows ?? []).slice(0, 50).map((r, i) => ({ id: String(i), ...r } as unknown as Row));

  const connFields = CONN_SQL;

  return (
    <ConfigDetailPage title={ds.name} crumbParts={['数据源管理']}
      subtitle={ds.desc}
      backLabel="返回列表" backTo="/console/cm/mid-data-source"
      actions={<>
        <Sam label="详情数据" value="midDataSources.json" />
        <Button size="sm" onClick={() => nav('/console/cm/mid-data-source?edit=' + ds.id)}>编辑</Button>
      </>}
      infoCells={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <InfoCell label="类型" value={SRC_TYPE_LABEL[ds.type] ?? '数据库'} tag={<Sam value="midDataSources.json.type" />} />
        <InfoCell label="状态" value={ds.status ?? 'connected'} tag={<Sam value="midDataSources.json.status" />} />
        <InfoCell label="字段数" value={String(ds.fields.length)} tag={<Sam value="midDataSources.json.fields" />} />
        <InfoCell label="样例行" value={String(ds.rows?.length ?? 0)} tag={<Sam value={`${ds.id}.rows`} />} />
        <InfoCell label="更新时间" value={ds.updatedAt ?? '-'} tag={<Sam value="midDataSources.json.updatedAt" />} />
      </div>
      }>

      <Panel title="连接信息" desc={<span>数据源连接配置（保存到本地 <Sam value="midDataSources.json.conn" />）</span>}
        actions={connFields.some((f) => f.mask) ? (
          <Button size="sm" variant="secondary" onClick={() => setShowPwd((p) => !p)}>{showPwd ? '隐藏密码' : '显示密码'}</Button>
        ) : undefined}>
        {ds.conn ? (
          <div className="divide-y divide-slate-100">
            {connFields.map((f) => {
              const raw = String(ds.conn?.[f.key] ?? '-');
              return (
                <div key={f.key} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-slate-500">{f.label}</span>
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-slate-700">{f.mask && !showPwd ? '••••••••' : raw}</span>
                    <Sam value={'midDataSources.json.conn.' + f.key} />
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg bg-slate-50 px-3 py-6 text-center text-sm text-slate-400">未配置连接信息</div>
        )}
      </Panel>

      <Panel title="字段清单" desc={<span>连接后读取到的字段，保存到本地（<Sam value="midDataSources.json.fields" />）</span>}>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-medium text-slate-500">
                <th className="px-3 py-2.5">字段 key</th>
                <th className="px-3 py-2.5">标签</th>
                <th className="px-3 py-2.5">维度/度量</th>
                <th className="px-3 py-2.5">类型</th>
                <th className="px-3 py-2.5">单位</th>
              </tr>
            </thead>
            <tbody>
              {ds.fields.map((f) => (
                <tr key={f.key} className="border-b border-slate-100">
                  <td className="px-3 py-2.5 font-mono text-slate-700">{f.key} <Sam value={'midDataSources.json.fields.' + f.key} /></td>
                  <td className="px-3 py-2.5 text-slate-700">{f.label}</td>
                  <td className="px-3 py-2.5 text-slate-600">{f.kind === 'measure' ? '度量' : '维度'}</td>
                  <td className="px-3 py-2.5 text-slate-600">{f.type}</td>
                  <td className="px-3 py-2.5 text-slate-600">{f.unit ?? '-'}</td>
                </tr>
              ))}
              {ds.fields.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-400">暂无字段</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="数据预览" desc="样例数据（本地 JSON）" actions={<Sam value={`${ds.id} · ${ds.rows?.length ?? 0} 行`} />}>
        {previewCols.length && previewCols[0].key !== '_'
          ? <DataTable columns={previewCols} rows={previewRows} />
          : <div className="rounded-lg bg-slate-50 px-3 py-6 text-center text-sm text-slate-400">暂无字段，无法预览</div>}
      </Panel>

      <Panel title="被指标库引用" desc={<span>以下指标基于此数据源（引用关系记录于样例数据 <Sam value="midDataSources.json.usedBy" />，指标库引用后更新）</span>}>
        {usedBy.length ? (
          <div className="flex flex-wrap gap-2">
            {usedBy.map((m) => (
              <Button key={m.id} size="sm" variant="ghost" onClick={() => nav('/console/cm/mid-metric-detail?id=' + m.id)}>{m.name}</Button>
            ))}
          </div>
        ) : <div className="rounded-lg bg-slate-50 px-3 py-6 text-center text-sm text-slate-400">暂无指标引用</div>}
      </Panel>
    </ConfigDetailPage>
  );
}
