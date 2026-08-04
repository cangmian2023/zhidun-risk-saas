// 数据源详情（管理中心 · 配置域）— 读 midDataSources.json 蓝；样例行 橘；字段口径 灰
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Panel, DataTable, Button } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { Cfg, Sam, Cal } from './SourceTag';
import { PageShell } from './PageShell';
import { useMidDataSources, useMidMetrics } from './midStore';
import type { DataSourceType } from './midData';

const TYPE_LABEL: Record<DataSourceType, string> = { sample: '本地样例', api: 'API', sql: '数据库' };

export default function MidDataSourceDetail() {
  const [params] = useSearchParams();
  const id = params.get('id') ?? '';
  const sources = useMidDataSources();
  const metrics = useMidMetrics();
  const nav = useNavigate();
  const ds = sources.find((s) => s.id === id);

  if (!ds) {
    return (
      <div style={{ padding: 24 }}>
        <PageShell title="数据源详情" crumb="管理中心 / 贷中监控配置 / 数据源" actions={<Button size="sm" variant="secondary" onClick={() => nav(-1)}>返回</Button>} />
        <div style={{ padding: 24, color: '#94A3B8', fontSize: 13 }}>未找到该数据源（{id}）。</div>
      </div>
    );
  }

  const usedBy = metrics.filter((m) => m.dataSourceId === ds.id);
  const previewCols: Column[] = (ds.fields.length ? ds.fields : [{ key: '_', label: '_', kind: 'dim' as const, type: 'string' as const }]).map((f) => ({ key: f.key, label: f.label }));
  const previewRows: Row[] = (ds.rows ?? []).slice(0, 20).map((r, i) => ({ id: String(i), ...r } as unknown as Row));

  return (
    <div style={{ padding: 24, maxWidth: 1180 }}>
      <PageShell title={ds.name} crumb="管理中心 / 贷中监控配置 / 数据源"
        subtitle={ds.desc}
        actions={<>
          <Cfg label="配置JSON" value="midDataSources.json" />
          <Button size="sm" onClick={() => nav('/console/cm:mid-data-source?edit=' + ds.id)}>编辑</Button>
          <Button size="sm" variant="secondary" onClick={() => nav(-1)}>返回</Button>
        </>} />

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 13, color: '#475569', marginBottom: 16 }}>
        <span>类型：{TYPE_LABEL[ds.type]}</span>
        <span>状态：{ds.status ?? 'connected'}</span>
        <span>字段数：{ds.fields.length}</span>
        <span>样例行：{ds.rows?.length ?? 0}</span>
        <span>更新时间：{ds.updatedAt ?? '-'}</span>
      </div>

      <Panel title="字段清单" desc="统一字段口径，供指标库引用" actions={<Cal label="字段口径" />}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead><tr style={{ color: '#64748B', textAlign: 'left' }}>
            <th style={{ padding: '6px 8px', borderBottom: '1px solid #E2E8F0' }}>字段 key</th>
            <th style={{ padding: '6px 8px', borderBottom: '1px solid #E2E8F0' }}>标签</th>
            <th style={{ padding: '6px 8px', borderBottom: '1px solid #E2E8F0' }}>维度/度量</th>
            <th style={{ padding: '6px 8px', borderBottom: '1px solid #E2E8F0' }}>类型</th>
            <th style={{ padding: '6px 8px', borderBottom: '1px solid #E2E8F0' }}>单位</th>
          </tr></thead>
          <tbody>
            {ds.fields.map((f) => (
              <tr key={f.key}>
                <td style={{ padding: '4px 8px', borderBottom: '1px solid #F1F5F9', fontFamily: 'monospace' }}>{f.key}</td>
                <td style={{ padding: '4px 8px', borderBottom: '1px solid #F1F5F9' }}>{f.label}</td>
                <td style={{ padding: '4px 8px', borderBottom: '1px solid #F1F5F9' }}>{f.kind === 'measure' ? '度量' : '维度'}</td>
                <td style={{ padding: '4px 8px', borderBottom: '1px solid #F1F5F9' }}>{f.type}</td>
                <td style={{ padding: '4px 8px', borderBottom: '1px solid #F1F5F9' }}>{f.unit ?? '-'}</td>
              </tr>
            ))}
            {ds.fields.length === 0 && <tr><td colSpan={5} style={{ padding: 12, color: '#94A3B8' }}>暂无字段</td></tr>}
          </tbody>
        </table>
      </Panel>

      <Panel title="数据预览" desc="样例数据（本地 JSON）" actions={<Sam label="样例数据" value={`${ds.rows?.length ?? 0} 行`} />}>
        {previewCols.length && previewCols[0].key !== '_'
          ? <DataTable columns={previewCols} rows={previewRows} />
          : <div style={{ padding: 12, color: '#94A3B8' }}>暂无字段，无法预览</div>}
      </Panel>

      <Panel title="被指标库引用" desc={<span><Cfg label="读指标库" value="midMetrics.json" /> 以下指标基于此数据源</span>}>
        {usedBy.length ? (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {usedBy.map((m) => (
              <Button key={m.id} size="sm" variant="ghost" onClick={() => nav('/console/cm:mid-metric-detail?id=' + m.id)}>{m.name}</Button>
            ))}
          </div>
        ) : <div style={{ padding: 12, color: '#94A3B8' }}>暂无指标引用</div>}
      </Panel>
    </div>
  );
}
