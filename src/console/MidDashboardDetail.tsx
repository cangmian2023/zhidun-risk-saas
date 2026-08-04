// 监控页面配置详情（管理中心 · 配置域）— 读 midDashboards.json 橘；组件引用指标库 蓝；实时渲染 灰
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Panel, Button, Badge } from '../components/ui';
import { Cfg, Sam, Cal } from './SourceTag';
import { PageShell } from './PageShell';
import { useMidDashboards, useMidMetrics, useMidDataSources } from './midStore';
import type { WidgetType } from './midData';

const WTYPE_LABEL: Record<WidgetType, string> = { metric: '指标卡', line: '折线', bar: '柱状', donut: '环形', table: '明细表' };

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
      <div style={{ padding: 24 }}>
        <PageShell title="页面配置详情" crumb="管理中心 / 贷中监控配置 / 监控页面配置" actions={<Button size="sm" variant="secondary" onClick={() => nav(-1)}>返回</Button>} />
        <div style={{ padding: 24, color: '#94A3B8', fontSize: 13 }}>未找到该页面（{id}）。</div>
      </div>
    );
  }

  const metricName = (mid: string) => metrics.find((m) => m.id === mid)?.name ?? mid;
  const srcName = (sid: string) => sources.find((s) => s.id === sid)?.name ?? sid;

  return (
    <div style={{ padding: 24, maxWidth: 1180 }}>
      <PageShell title={d.name} crumb="管理中心 / 贷中监控配置 / 监控页面配置"
        subtitle={d.desc}
        actions={<>
          <Cfg label="读指标库" value="midMetrics.json" />
          <Sam label="页面配置JSON" value="midDashboards.json" />
          <Button size="sm" onClick={() => nav('/console/cm:mid-dashboard-config?edit=' + d.id)}>编辑</Button>
          <Button size="sm" variant="secondary" onClick={() => nav(-1)}>返回</Button>
        </>} />

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 13, color: '#475569', marginBottom: 16 }}>
        <span>分组：{d.group}</span>
        <span>路由 key：<code>{d.key}</code></span>
        <span>排序：{d.order}</span>
        <span>状态：{d.enabled ? '启用' : '停用'}</span>
      </div>

      <Panel title="可视化组件" desc={<span><Cal label="实时计算" /> 共 {d.widgets.length} 个组件，保存后由监控看板按配置渲染</span>}>
        {d.widgets.length ? (
          <div style={{ display: 'grid', gap: 10 }}>
            {d.widgets.map((w) => (
              <div key={w.id} style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: 10, background: '#FAFAFB' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Badge kind="blue">{WTYPE_LABEL[w.type]}</Badge>
                  <strong style={{ fontSize: 13 }}>{w.title}</strong>
                  <span style={{ fontSize: 11, color: '#94A3B8' }}>{w.span === 2 ? '跨 2 列' : '1 列'}</span>
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: '#475569' }}>
                  <span>数据集：{srcName(w.datasetId)}</span>
                  <span>指标：{metricName(w.metricId)}</span>
                  {w.dimensions && w.dimensions.length > 0 && <span>维度：{w.dimensions.join('、')}</span>}
                  {w.drill && w.drill.type !== 'none' && <span style={{ color: '#1D4ED8' }}>支持下钻：{w.drill.title}</span>}
                </div>
                <div style={{ marginTop: 6 }}>
                  <Button size="sm" variant="ghost" onClick={() => nav('/console/cm:mid-metric-detail?id=' + w.metricId)}>查看指标 →</Button>
                </div>
              </div>
            ))}
          </div>
        ) : <div style={{ color: '#94A3B8', padding: 12 }}>暂无组件</div>}
      </Panel>

      <Panel title="实时渲染" desc="前往监控看板查看该页面按配置实时渲染的效果">
        <Button size="sm" onClick={() => nav('/console/' + d.key)}>前往「{d.name}」监控看板 →</Button>
      </Panel>
    </div>
  );
}
