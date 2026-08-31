// 管理中心 · 统一预警配置（覆盖 企业风控 / 评分产品 / 零售信贷 / 数字营销）
// 企业风控与评分产品的预警规则在此统一启停 / 删除；零售信贷规则在「监控任务」按任务配置；数字营销规划中。
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { Panel, DataTable, Button } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { PageShell } from './PageShell';
import { useEnterpriseData, updateEnterpriseData } from './enterpriseData';
import { useScore, updateScore } from './scoreData';

type Tab = 'ep' | 'sc' | 'cr' | 'dm';

export default function CmAlertConfig() {
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>('ep');
  const ent = useEnterpriseData();
  const score = useScore();

  const epToggle = (id: string) => updateEnterpriseData((d) => ({ ...d, alertRules: d.alertRules.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r) }));
  const epDel = (id: string) => updateEnterpriseData((d) => ({ ...d, alertRules: d.alertRules.filter((r) => r.id !== id) }));
  const scToggle = (id: string) => updateScore((d) => ({ ...d, alertRules: d.alertRules.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r) }));
  const scDel = (id: string) => updateScore((d) => ({ ...d, alertRules: d.alertRules.filter((r) => r.id !== id) }));

  const tabs: { k: Tab; label: string }[] = [
    { k: 'ep', label: '企业风控' },
    { k: 'sc', label: '评分产品' },
    { k: 'cr', label: '零售信贷风控' },
    { k: 'dm', label: '数字营销' },
  ];

  const epCols: Column[] = [
    { key: 'name', label: '规则名称', width: '200px' },
    { key: 'category', label: '类别', type: 'badge', badgeKind: 'blue', width: '120px' },
    { key: 'condition', label: '触发条件', width: '300px' },
    { key: 'level', label: '等级', type: 'badge', badgeKind: 'red', width: '90px' },
    { key: 'action', label: '处置动作', width: '180px' },
    { key: 'enabled', label: '状态', type: 'badge', badgeKind: 'gray', width: '90px' },
  ];
  const epRows: Row[] = ent.alertRules.map((r) => ({
    id: r.id, name: r.name, category: r.category, condition: r.condition,
    level: { v: r.level, kind: r.level === '高' ? 'red' : r.level === '中' ? 'amber' : 'blue' },
    action: r.action, enabled: { v: r.enabled ? '启用' : '停用', kind: r.enabled ? 'green' : 'gray' },
  }));
  const scCols: Column[] = [
    { key: 'name', label: '规则名称', width: '200px' },
    { key: 'cond', label: '触发条件', width: '300px' },
    { key: 'threshold', label: '阈值', width: '100px' },
    { key: 'level', label: '等级', type: 'badge', badgeKind: 'violet', width: '120px' },
    { key: 'enabled', label: '状态', type: 'badge', badgeKind: 'gray', width: '90px' },
  ];
  const scRows: Row[] = score.alertRules.map((r) => ({
    id: r.id, name: r.name, cond: r.cond, threshold: String(r.threshold),
    level: { v: r.level, kind: 'violet' }, enabled: { v: r.enabled ? '启用' : '停用', kind: r.enabled ? 'green' : 'gray' },
  }));

  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="统一预警配置" crumb="管理中心 / 预警配置"
        subtitle="跨子系统统一配置预警规则：企业风控 / 评分产品 / 零售信贷 / 数字营销"
        actions={<></>} />
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #E2E8F0', marginBottom: 16 }}>
        {tabs.map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)}
            style={{ padding: '8px 18px', fontSize: 13, border: 'none', background: 'none', cursor: 'pointer', color: tab === t.k ? '#0EA5E9' : '#64748B', fontWeight: tab === t.k ? 700 : 400, borderBottom: tab === t.k ? '2px solid #0EA5E9' : '2px solid transparent', marginBottom: -1 }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'ep' && (
        <Panel title="企业风控预警规则" desc={<span>司法涉诉 / 经营异常 / 舆情负面 / 财务恶化 / 关联风险 · </span>}>
          <DataTable columns={epCols} rows={epRows} empty="暂无规则" pager defaultPageSize={10} exportable exportName="企业风控预警规则"
            actions={(r) => {
              const rule = ent.alertRules.find((x) => x.id === String(r.id));
              if (!rule) return null;
              return (<div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => epToggle(rule.id)} style={btnStyle}>{rule.enabled ? '停用' : '启用'}</button>
                <button onClick={() => epDel(rule.id)} style={{ ...btnStyle, color: '#DC2626' }}>删除</button>
              </div>);
            }} />
        </Panel>
      )}
      {tab === 'sc' && (
        <Panel title="评分产品预警规则" desc={<span>智察分 / 智信分 / 智融分 命中阈值预警 · </span>}>
          <DataTable columns={scCols} rows={scRows} empty="暂无规则" pager defaultPageSize={10} exportable exportName="评分产品预警规则"
            actions={(r) => {
              const rule = score.alertRules.find((x) => x.id === String(r.id));
              if (!rule) return null;
              return (<div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => scToggle(rule.id)} style={btnStyle}>{rule.enabled ? '停用' : '启用'}</button>
                <button onClick={() => scDel(rule.id)} style={{ ...btnStyle, color: '#DC2626' }}>删除</button>
              </div>);
            }} />
        </Panel>
      )}
      {tab === 'cr' && (
        <Panel title="零售信贷风控预警规则">
          <p style={{ fontSize: 13, color: '#475569', marginBottom: 12 }}>零售信贷的预警规则在「监控任务」中按任务配置（指标 + 条件 + 阈值 + 等级），由管理中心统一维护，不在本页重复建设。</p>
          <Button size="sm" variant="primary" onClick={() => nav('/console/cm/mid-strategy')}>前往监控任务配置 →</Button>
        </Panel>
      )}
      {tab === 'dm' && (
        <Panel title="数字营销预警规则">
          <div style={{ padding: 24, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>数字营销预警能力规划中（响应分阈值预警 / 转化异常预警待接入）。</div>
        </Panel>
      )}
    </div>
  );
}

const btnStyle: CSSProperties = { padding: '3px 12px', borderRadius: 6, border: '1px solid #CBD5E1', background: '#fff', color: '#334155', fontSize: 12, cursor: 'pointer' };
