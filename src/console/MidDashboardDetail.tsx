// 监控页面配置详情（管理中心 · 配置域）— 读 midDashboards.json 蓝；组件引用指标库 蓝；实时渲染 灰
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Panel, Button, Badge, InfoCell } from '../components/ui';
import { Cfg } from './SourceTag';
import { PageShell } from './PageShell';
import { useMidDashboards, useMidMetrics, useMidDataSources } from './midStore';
import { ConfigDetailPage, crumb, WTYPE_LABEL } from './ConfigTemplate';

export default function MidDashboardDetail() {
  const [params] = useSearchParams();
  const id = params.get('id') ?? '';
  const dashboards = useMidDashboards();
  const metrics = useMidMetrics();
  const sources = useMidDataSources();
  const nav = useNavigate();
  const d = dashboards.find((x) => x.id === id);

  if (!d) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
        <PageShell title="页面配置详情" crumb={crumb('页面配置')} actions={<Button size="sm" variant="secondary" onClick={() => nav(-1)}>返回</Button>} />
        <div className="mt-6 rounded-xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-400">未找到该页面（{id}）。</div>
      </div>
    );
  }

  const metricName = (mid: string) => metrics.find((m) => m.id === mid)?.name ?? mid;
  const srcName = (sid: string) => sources.find((s) => s.id === sid)?.name ?? sid;

  return (
    <ConfigDetailPage
      title={d.name}
      crumbParts={['页面配置']}
      subtitle={d.desc}
      actions={<>
        <Cfg value="midMetrics.json" />
        <Cfg value="midDashboards.json" />
        <Button size="sm" onClick={() => nav('/console/cm/mid-dashboard-config?edit=' + d.id)}>编辑</Button>
        <Button size="sm" variant="secondary" onClick={() => nav(-1)}>返回</Button>
      </>}
      infoCells={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <InfoCell label="分组" value={d.group} tag={<Cfg value="midDashboards.json.group" />} />
          <InfoCell label="路由 key" value={<code className="font-mono text-xs">{d.key}</code>} tag={<Cfg value="midDashboards.json.key" />} />
          <InfoCell label="排序" value={String(d.order)} tag={<Cfg value="midDashboards.json.order" />} />
          <InfoCell label="状态" value={<Badge kind={d.enabled ? 'green' : 'red'}>{d.enabled ? '启用' : '停用'}</Badge>} tag={<Cfg value="midDashboards.json.enabled" />} />
        </div>
      }
    >
      <Panel title="可视化组件" desc={<span><Cfg value="midDashboards.json.widgets" /> 共 {d.widgets.length} 个组件，保存后由监控看板按配置渲染</span>}>
        {d.widgets.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {d.widgets.map((w) => (
              <div key={w.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
                <div className="mb-2 flex items-center gap-2">
                  <Badge kind="blue">{WTYPE_LABEL[w.type]}</Badge>
                  <strong className="text-sm font-semibold text-ink-900">{w.title}</strong>
                  <span className="text-[11px] text-slate-400">{w.span === 2 ? '跨 2 列' : '1 列'}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600">
                  <span>数据集：{srcName(w.datasetId)} <Cfg value="midDashboards.json.widgets.datasetId" /></span>
                  <span>指标：{metricName(w.metricId)} <Cfg value="midMetrics.json" /></span>
                  {w.dimensions && w.dimensions.length > 0 && <span>维度：{w.dimensions.join('、')} <Cfg value="midDashboards.json.widgets.dimensions" /></span>}
                  {w.drill && w.drill.type !== 'none' && <span className="text-brand-600">支持下钻：{w.drill.title} <Cfg value="midDashboards.json.widgets.drill" /></span>}
                </div>
                <div className="mt-2">
                  <Button size="sm" variant="ghost" onClick={() => nav('/console/cm/mid-metric-detail?id=' + w.metricId)}>查看指标 →</Button>
                </div>
              </div>
            ))}
          </div>
        ) : <div className="rounded-lg bg-slate-50 px-3 py-6 text-center text-sm text-slate-400">暂无组件</div>}
      </Panel>

      <Panel title="实时渲染" desc="前往监控看板查看该页面按配置实时渲染的效果">
        <Button size="sm" onClick={() => nav('/console/' + d.key.replace(':', '/'))}>前往「{d.name}」监控看板 →</Button>
      </Panel>
    </ConfigDetailPage>
  );
}
