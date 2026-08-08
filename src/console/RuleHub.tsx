/* 管理中心 · 规则合集（需求：规则集合成一个页面）
 * 五类规则统一入口：核验规则集 / 反欺诈规则库 / 黑名单管理 / 团伙库管理 / 评分场景规则
 * 架构：列表 → 详情（右侧抽屉），与其他配置页一致；功能/数据分离——数据读 ruleHub.json（样例橘 Sam）。
 */
import { useState } from 'react';
import { Panel, DataTable, Button, Badge, Drawer, DetailHeader } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { Sam } from './SourceTag';
import { PageShell } from './PageShell';
import { useRuleHub, updateRuleHub } from './ruleHubData';

const TABS = [
  { key: 'verifySets', label: '核验规则集' },
  { key: 'fraudRules', label: '反欺诈规则库' },
  { key: 'blacklist', label: '黑名单管理' },
  { key: 'gangs', label: '团伙库管理' },
  { key: 'sceneRules', label: '评分场景规则' },
] as const;

const statusKind: Record<string, 'gray' | 'blue' | 'amber' | 'green' | 'violet' | 'red'> = {
  草稿: 'amber', 已生效: 'green', 已下线: 'gray', 启用: 'green', 停用: 'gray',
};
const levelKind: Record<string, 'red' | 'amber' | 'green'> = { 高: 'red', 中: 'amber', 低: 'green' };

export default function RuleHub() {
  const d = useRuleHub();
  const [tab, setTab] = useState<string>('verifySets');
  const [detail, setDetail] = useState<{ type: string; id: string } | null>(null);

  const findDetail = () => {
    if (!detail) return null;
    const arr = (d as any)[detail.type] ?? [];
    return arr.find((x: any) => x.id === detail.id) ?? null;
  };
  const det = findDetail();
  const toggleStatus = (type: string, id: string) => {
    updateRuleHub((dd) => {
      const arr = [...((dd as any)[type] ?? [])];
      const i = arr.findIndex((x: any) => x.id === id);
      if (i < 0) return dd;
      const cur = arr[i];
      const nextStatus = cur.status === '启用' || cur.status === '已生效' ? (cur.status === '启用' ? '停用' : '已下线') : (cur.status === '停用' ? '启用' : '已生效');
      arr[i] = { ...cur, status: nextStatus };
      return { ...dd, [type]: arr };
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 lg:px-8">
      <PageShell title="规则合集" crumb="零售信贷风控 / 管理中心 / 规则合集"
        subtitle="核验规则、反欺诈规则、黑名单、团伙库、评分场景规则统一管理 · 数据保存到本地样例 JSON"
        actions={<Sam value="ruleHub.json" />} />

      {/* 分类页签 */}
      <div className="flex gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button key={t.key} type="button" onClick={() => { setTab(t.key); setDetail(null); }}
            className={`px-4 py-2 text-sm font-medium ${tab === t.key ? 'border-b-2 border-brand-600 text-brand-600' : 'border-b-2 border-transparent text-slate-500 hover:text-slate-700'}`}>
            {t.label} <span className="text-xs opacity-60">({((d as any)[t.key] ?? []).length})</span>
          </button>
        ))}
      </div>

      {tab === 'verifySets' && <VerifySetsTab onView={(id) => setDetail({ type: 'verifySets', id })} />}
      {tab === 'fraudRules' && <FraudRulesTab onView={(id) => setDetail({ type: 'fraudRules', id })} onToggle={(id) => toggleStatus('fraudRules', id)} />}
      {tab === 'blacklist' && <BlacklistTab onView={(id) => setDetail({ type: 'blacklist', id })} onToggle={(id) => toggleStatus('blacklist', id)} />}
      {tab === 'gangs' && <GangsTab onView={(id) => setDetail({ type: 'gangs', id })} onToggle={(id) => toggleStatus('gangs', id)} />}
      {tab === 'sceneRules' && <SceneRulesTab onView={(id) => setDetail({ type: 'sceneRules', id })} onToggle={(id) => toggleStatus('sceneRules', id)} />}

      {/* 详情抽屉 */}
      <Drawer open={det != null} onClose={() => setDetail(null)} title={det?.name ?? '详情'} width={480}>
        {det && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Badge kind={statusKind[det.status] ?? 'gray'}>{det.status}</Badge>
              <Badge kind="slate">{det.id}</Badge>
              <span style={{ fontSize: 12, color: '#94A3B8', marginLeft: 'auto' }}>{det.owner} · {det.updatedAt}</span>
            </div>
            {det.version && <Field k="版本" v={det.version} />}
            {det.scope && <Field k="适用范围" v={Array.isArray(det.scope) ? det.scope.join('、') : det.scope} />}
            {det.type && <Field k="名单类型" v={det.type} />}
            {det.value && <Field k="名单值" v={det.value} />}
            {det.reason && <Field k="加入原因" v={det.reason} />}
            {det.weight != null && <Field k="权重" v={`${det.weight}%`} />}
            {det.hitCond && <Field k="命中条件" v={det.hitCond} />}
            {det.suggest && <Field k="处置建议" v={det.suggest} />}
            {det.riskLevel && <Field k="风险等级" v={<Badge kind={levelKind[det.riskLevel]}>{det.riskLevel}</Badge>} />}
            {det.members != null && <Field k="团伙成员" v={`${det.members} 人 · 设备 ${det.devices} 台`} />}
            {det.feature && <Field k="团伙特征" v={det.feature} />}
            {det.scene && <Field k="业务场景" v={det.scene} />}
            {det.cond && <Field k="触发条件" v={det.cond} />}
            {det.action && <Field k="执行动作" v={det.action} />}
            {det.desc && <Field k="说明" v={det.desc} />}
            {det.ruleCount != null && <Field k="规则数" v={String(det.ruleCount)} />}
            {det.items && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 6 }}>规则项</div>
                {det.items.map((it: any, i: number) => (
                  <div key={i} style={{ fontSize: 12, color: '#475569', padding: '6px 0', borderBottom: '1px solid #F1F5F9' }}>
                    <b>{it.name}</b>：{it.cond} → <span style={{ color: '#2563EB' }}>{it.action}</span>
                  </div>
                ))}
              </div>
            )}
            <Button size="sm" variant={det.status === '启用' || det.status === '已生效' ? 'secondary' : 'primary'} onClick={() => toggleStatus(detail!.type, det.id)}>
              {(det.status === '启用' || det.status === '已生效') ? '停用' : '启用'}
            </Button>
          </div>
        )}
      </Drawer>
    </div>
  );
}

function Field({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, borderBottom: '1px dashed #F1F5F9', paddingBottom: 6, fontSize: 13 }}>
      <span style={{ color: '#94A3B8', whiteSpace: 'nowrap' }}>{k}</span>
      <span style={{ color: '#334155', fontWeight: 500, textAlign: 'right' }}>{v}</span>
    </div>
  );
}

function useTabRows(type: keyof ReturnType<typeof useRuleHub>) {
  const d = useRuleHub();
  return (d[type] as any[]) ?? [];
}

/* ---- 核验规则集 ---- */
function VerifySetsTab({ onView }: { onView: (id: string) => void }) {
  const rows = useTabRows('verifySets');
  const cols: Column[] = [
    { key: 'name', label: '规则集名称', type: 'text', width: '200px' },
    { key: 'version', label: '版本', type: 'text', width: '80px' },
    { key: 'scope', label: '适用范围', type: 'text', width: '140px' },
    { key: 'ruleCount', label: '规则数', type: 'text', width: '80px' },
    { key: 'status', label: '状态', type: 'badge', badgeKind: 'gray', width: '90px' },
    { key: 'owner', label: '负责人', type: 'text', width: '110px' },
  ];
  const rows2: Row[] = rows.map((r) => ({
    id: r.id, name: r.name, version: r.version, scope: Array.isArray(r.scope) ? r.scope.join('、') : r.scope,
    ruleCount: String(r.ruleCount), status: { v: r.status, kind: statusKind[r.status] ?? 'gray' }, owner: r.owner,
  }));
  return (
    <Panel title="核验规则集" desc={<span>信息核验规则集合 <Sam value="ruleHub.json.verifySets" /></span>}
      actions={<Button size="sm">＋ 新建规则集</Button>}>
      <DataTable columns={cols} rows={rows2} empty="暂无规则集" clickableKey="name"
        onCellClick={(r) => onView(String(r.id))} actions={(r) => <Button size="sm" variant="ghost" onClick={() => onView(String(r.id))}>查看</Button>} pager defaultPageSize={10} />
    </Panel>
  );
}

/* ---- 反欺诈规则库 ---- */
function FraudRulesTab({ onView, onToggle }: { onView: (id: string) => void; onToggle: (id: string) => void }) {
  const rows = useTabRows('fraudRules');
  const cols: Column[] = [
    { key: 'name', label: '规则名称', type: 'text', width: '180px' },
    { key: 'hitCond', label: '命中条件', type: 'text', width: '240px' },
    { key: 'weight', label: '权重', type: 'text', width: '70px' },
    { key: 'riskLevel', label: '风险等级', type: 'badge', badgeKind: 'red', width: '90px' },
    { key: 'status', label: '状态', type: 'badge', badgeKind: 'gray', width: '80px' },
  ];
  const rows2: Row[] = rows.map((r) => ({
    id: r.id, name: r.name, hitCond: r.hitCond, weight: `${r.weight}%`,
    riskLevel: { v: r.riskLevel, kind: levelKind[r.riskLevel] ?? 'amber' }, status: { v: r.status, kind: statusKind[r.status] ?? 'gray' },
  }));
  return (
    <Panel title="反欺诈规则库" desc={<span>欺诈规则与权重配置 <Sam value="ruleHub.json.fraudRules" /></span>}
      actions={<Button size="sm">＋ 新建规则</Button>}>
      <DataTable columns={cols} rows={rows2} empty="暂无规则" clickableKey="name"
        onCellClick={(r) => onView(String(r.id))}
        actions={(r) => <><Button size="sm" variant="ghost" onClick={() => onView(String(r.id))}>查看</Button><Button size="sm" variant="secondary" onClick={() => onToggle(String(r.id))}>{(rows.find((x: any) => x.id === r.id)?.status ?? '') === '启用' ? '停用' : '启用'}</Button></>} pager defaultPageSize={10} />
    </Panel>
  );
}

/* ---- 黑名单管理 ---- */
function BlacklistTab({ onView, onToggle }: { onView: (id: string) => void; onToggle: (id: string) => void }) {
  const rows = useTabRows('blacklist');
  const cols: Column[] = [
    { key: 'type', label: '名单类型', type: 'text', width: '110px' },
    { key: 'value', label: '名单值', type: 'text', width: '180px' },
    { key: 'reason', label: '加入原因', type: 'text', width: '220px' },
    { key: 'status', label: '状态', type: 'badge', badgeKind: 'gray', width: '80px' },
  ];
  const rows2: Row[] = rows.map((r) => ({
    id: r.id, type: r.type, value: r.value, reason: r.reason, status: { v: r.status, kind: statusKind[r.status] ?? 'gray' },
  }));
  return (
    <Panel title="黑名单管理" desc={<span>手机号/设备/身份证/银行卡黑名单 <Sam value="ruleHub.json.blacklist" /></span>}
      actions={<Button size="sm">＋ 加入黑名单</Button>}>
      <DataTable columns={cols} rows={rows2} empty="暂无黑名单" clickableKey="value"
        onCellClick={(r) => onView(String(r.id))}
        actions={(r) => <><Button size="sm" variant="ghost" onClick={() => onView(String(r.id))}>查看</Button><Button size="sm" variant="secondary" onClick={() => onToggle(String(r.id))}>{(rows.find((x: any) => x.id === r.id)?.status ?? '') === '启用' ? '停用' : '启用'}</Button></>} pager defaultPageSize={10} />
    </Panel>
  );
}

/* ---- 团伙库管理 ---- */
function GangsTab({ onView, onToggle }: { onView: (id: string) => void; onToggle: (id: string) => void }) {
  const rows = useTabRows('gangs');
  const cols: Column[] = [
    { key: 'name', label: '团伙名称', type: 'text', width: '180px' },
    { key: 'members', label: '成员数', type: 'text', width: '90px' },
    { key: 'feature', label: '团伙特征', type: 'text', width: '260px' },
    { key: 'status', label: '状态', type: 'badge', badgeKind: 'gray', width: '80px' },
  ];
  const rows2: Row[] = rows.map((r) => ({
    id: r.id, name: r.name, members: `${r.members} 人`, feature: r.feature, status: { v: r.status, kind: statusKind[r.status] ?? 'gray' },
  }));
  return (
    <Panel title="团伙库管理" desc={<span>已知欺诈团伙与成员特征 <Sam value="ruleHub.json.gangs" /></span>}
      actions={<Button size="sm">＋ 新建团伙</Button>}>
      <DataTable columns={cols} rows={rows2} empty="暂无团伙" clickableKey="name"
        onCellClick={(r) => onView(String(r.id))}
        actions={(r) => <><Button size="sm" variant="ghost" onClick={() => onView(String(r.id))}>查看</Button><Button size="sm" variant="secondary" onClick={() => onToggle(String(r.id))}>{(rows.find((x: any) => x.id === r.id)?.status ?? '') === '启用' ? '停用' : '启用'}</Button></>} pager defaultPageSize={10} />
    </Panel>
  );
}

/* ---- 评分场景规则 ---- */
function SceneRulesTab({ onView, onToggle }: { onView: (id: string) => void; onToggle: (id: string) => void }) {
  const rows = useTabRows('sceneRules');
  const sceneKind: Record<string, 'red' | 'amber' | 'violet'> = { 违约风险: 'red', 授信转化: 'amber', 借贷兴趣: 'violet' };
  const cols: Column[] = [
    { key: 'name', label: '规则名称', type: 'text', width: '160px' },
    { key: 'scene', label: '场景', type: 'badge', badgeKind: 'gray', width: '100px' },
    { key: 'cond', label: '触发条件', type: 'text', width: '260px' },
    { key: 'action', label: '执行动作', type: 'text', width: '150px' },
    { key: 'status', label: '状态', type: 'badge', badgeKind: 'gray', width: '80px' },
  ];
  const rows2: Row[] = rows.map((r) => ({
    id: r.id, name: r.name, scene: { v: r.scene, kind: sceneKind[r.scene] ?? 'gray' },
    cond: r.cond, action: r.action, status: { v: r.status, kind: statusKind[r.status] ?? 'gray' },
  }));
  return (
    <Panel title="评分场景规则" desc={<span>智融分三场景规则（违约拦截/提额候选/高兴趣触达）<Sam value="ruleHub.json.sceneRules" /></span>}
      actions={<Button size="sm">＋ 新建场景规则</Button>}>
      <DataTable columns={cols} rows={rows2} empty="暂无场景规则" clickableKey="name"
        onCellClick={(r) => onView(String(r.id))}
        actions={(r) => <><Button size="sm" variant="ghost" onClick={() => onView(String(r.id))}>查看</Button><Button size="sm" variant="secondary" onClick={() => onToggle(String(r.id))}>{(rows.find((x: any) => x.id === r.id)?.status ?? '') === '启用' ? '停用' : '启用'}</Button></>} pager defaultPageSize={10} />
    </Panel>
  );
}
