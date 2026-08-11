import { useMemo, useState } from 'react';
import { useScore } from './scoreData';
import { useMidCustomers } from './midStore';
import { PageShell } from './PageShell';
import { Panel, DataTable, Button, Badge } from '../components/ui';
import { Sam } from './SourceTag';
import { useNavigate, useSearchParams } from 'react-router-dom';

// 客户数据 riskLevel 为「高风险/中风险/低风险」，分组 riskLevel 为「高/中/低」，归一化后比对
function normRisk(level?: string): '高' | '中' | '低' {
  const l = (level ?? '').replace('风险', '')
  if (l === '高') return '高'
  if (l === '中') return '中'
  return '低'
}
function riskKind(level?: string): 'red' | 'amber' | 'green' {
  const n = normRisk(level)
  if (n === '高') return 'red'
  if (n === '中') return 'amber'
  return 'green'
}

function tagFrom(level?: string): string {
  if (level === '高') return '高风险';
  if (level === '中') return '关注';
  return '正常';
}

export default function ScoreCustomerListPage() {
  const data = useScore();
  const customers = useMidCustomers();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const groupId = params.get('group');
  const [q, setQ] = useState('');

  const group = groupId ? (data.crowds ?? []).find((c) => c.id === groupId) : undefined;
  const groupRisk = group?.riskLevel;
  const groupName = group?.name;

  const openDetail = (custId: string) => nav('/console/cr/mid-cust-score?cust=' + custId + '&prod=zhixin');

  const rows = useMemo(() => {
    const ql = (q ?? '').trim().toLowerCase();
    return (customers ?? [])
      .filter((c) => {
        const level = normRisk(c?.riskLevel);
        if (groupRisk && level !== groupRisk) return false;
        if (ql) {
          const name = (c?.name ?? '').toLowerCase();
          const id = (c?.custId ?? '').toLowerCase();
          if (!name.includes(ql) && !id.includes(ql)) return false;
        }
        return true;
      })
      .map((c) => {
        const level = c?.riskLevel ?? '—';
        const score = (c as any)?.scores?.score ?? '—';
        const tag = tagFrom(level);
        return {
          id: c?.custId ?? '',
          custId: c?.custId ?? '—',
          name: c?.name ?? '—',
          product: c?.product ?? '—',
          riskLevel: { v: level, kind: riskKind(level) },
          score: typeof score === 'number' || typeof score === 'string' ? String(score) : '—',
          tag: { v: tag, kind: riskKind(level) },
          action: (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => nav('/console/cr/mid-cust-score?cust=' + (c?.custId ?? '') + '&prod=zhixin')}
            >
              查看
            </Button>
          ),
        };
      });
  }, [customers, groupRisk, q]);

  const columns = [
    { key: 'custId', label: '客户号' },
    { key: 'name', label: '姓名' },
    { key: 'product', label: '产品' },
    { key: 'riskLevel', label: '风险等级' },
    { key: 'score', label: '评分' },
    { key: 'tag', label: '标签' },
    { key: 'action', label: '操作' },
  ];

  return (
    <>
      <PageShell
        title="客户列表"
        crumb="评分产品 / 客户洞察"
        actions={
          <>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索客户号/姓名"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-ink-900 outline-none focus:border-brand-600"
            />
            {groupName && <Badge kind="blue">{groupName}</Badge>}
          </>
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
    </>
  );
}
