import { useMemo, useState } from 'react';
import { useScore, updateScore, type CrowdGroup } from './scoreData';
import { useMidCustomers } from './midStore';
import { PageShell } from './PageShell';
import { DetailHeader, Panel, DataTable, Button, Badge } from '../components/ui';
import { Sam } from './SourceTag';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CrowdDrawer } from './CrowdDrawer';
import { crowdMembers } from './crowdRule';

// 客户风险等级 → 徽标样式（客户主档为「高风险/中风险/低风险」）
function riskKindOf(level?: string): 'red' | 'amber' | 'green' {
  const l = (level ?? '').replace('风险', '')
  if (l === '高') return 'red'
  if (l === '中') return 'amber'
  return 'green'
}

function tagFrom(level?: string): string {
  const l = (level ?? '').replace('风险', '')
  if (l === '高') return '高风险';
  if (l === '中') return '关注';
  return '正常';
}

export default function ScoreCustomerListPage() {
  const data = useScore();
  const customers = useMidCustomers();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const groupId = params.get('group');
  const [q, setQ] = useState('');

  const group: CrowdGroup | undefined = groupId ? (data.crowds ?? []).find((c) => c.id === groupId) : undefined;

  // 编辑分组抽屉（3.3：客户列表页也可编辑）
  const [drawerOpen, setDrawerOpen] = useState(false);
  const saveGroup = (g: CrowdGroup) => {
    updateScore((d) => ({
      ...d,
      crowds: d.crowds.some((x) => x.id === g.id) ? d.crowds.map((x) => (x.id === g.id ? g : x)) : [...d.crowds, g],
    }));
  };

  // 成员 = 规则实时求值（与分组卡片同源）；无分组参数时展示全部
  const members = useMemo(
    () => (group ? crowdMembers(group, customers) : customers),
    [group, customers],
  );

  const openDetail = (custId: string) => nav('/console/cr/mid-cust-score?cust=' + custId + '&prod=zhixin&back=' + encodeURIComponent('/console/sc/customer-list' + (groupId ? '?group=' + groupId : '')));

  const rows = useMemo(() => {
    const ql = (q ?? '').trim().toLowerCase();
    return members
      .filter((c) => {
        if (!ql) return true;
        const name = (c?.name ?? '').toLowerCase();
        const id = (c?.custId ?? '').toLowerCase();
        return name.includes(ql) || id.includes(ql);
      })
      .map((c) => {
        const level = c?.riskLevel ?? '—';
        const score = c?.scores?.zhixin?.score ?? '—';
        return {
          id: c?.custId ?? '',
          custId: c?.custId ?? '—',
          name: c?.name ?? '—',
          product: c?.product ?? '—',
          riskLevel: { v: level.replace('风险', ''), kind: riskKindOf(level) },
          score: typeof score === 'number' ? String(score) : '—',
          tag: { v: tagFrom(level), kind: riskKindOf(level) },
          action: (
            <Button size="sm" variant="ghost" onClick={() => openDetail(c?.custId ?? '')}>
              查看
            </Button>
          ),
        };
      });
  }, [members, q]);

  const columns = [
    { key: 'custId', label: '客户号' },
    { key: 'name', label: '姓名' },
    { key: 'product', label: '产品' },
    { key: 'riskLevel', label: '风险等级' },
    { key: 'score', label: '智信分' },
    { key: 'tag', label: '标签' },
    { key: 'action', label: '操作' },
  ];

  return (
    <>
      <PageShell
        header={
          <DetailHeader
            title={group ? group.name : '客户列表'}
            crumb="评分产品 / 客户洞察 / 客户列表"
            subtitle={group ? `分组规则：${group.rule} · 成员 ${members.length} 人（规则实时计算）` : '全部客户'}
            backLabel="← 返回客户分组"
            onBack={() => nav('/console/sc/crowd-groups')}
            actions={
              <>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="搜索客户号/姓名"
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-ink-900 outline-none focus:border-brand-600"
                />
                {group && (
                  <Button size="sm" variant="secondary" onClick={() => setDrawerOpen(true)}>
                    编辑分组
                  </Button>
                )}
              </>
            }
          />
        }
      />
      <div className="space-y-4">
        <Sam value="midCustomers.json" />
        <Panel>
          <DataTable
            columns={columns}
            rows={rows}
            clickableKey="custId"
            onCellClick={(r: any) => openDetail(String(r.custId))}
            defaultPageSize={15}
            empty="暂无客户"
          />
        </Panel>
      </div>

      {/* 编辑分组抽屉（与分组卡片页同款） */}
      <CrowdDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editing={group ?? null}
        customers={customers}
        onSave={saveGroup}
      />
    </>
  );
}
