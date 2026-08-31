// 元数据管理 ⑦ 虚拟事件 —— 列表 + 点击虚拟事件名弹出「事件详情」抽屉
// 列、抽屉字段与「虚拟事件的组成」取自 sensors/7.虚拟事件.html 及其详情页
import { useState } from 'react';
import type { Column, Row } from '../components/ui';
import { Button } from '../components/ui';
import { MetaListPage, MetaField, MetaSection } from './MetaListPage';
import { useMetaVirtualEvents } from './metaStore';
import type { MetaVirtualEvent } from './metaData';

const J = 'metaVirtualEvents.json';

export default function MetaVirtualEventConfig() {
  const events = useMetaVirtualEvents();
  const [cur, setCur] = useState<MetaVirtualEvent | null>(null);

  const columns: Column[] = [
    { key: 'name', label: '虚拟事件名' },
    { key: 'displayName', label: '虚拟事件显示名' },
    { key: 'tags', label: '标签' },
    { key: 'screenshot', label: '事件截图' },
    { key: 'included', label: '包含事件' },
    { key: 'remark', label: '备注' },
  ];

  const rows: Row[] = events.map((e) => ({
    id: e.id,
    name: e.name,
    displayName: e.displayName,
    tags: e.tags,
    screenshot: e.screenshot,
    included: e.parts.map((x) => x.event).join('，'),
    remark: e.remark,
  })) as unknown as Row[];

  return (
    <MetaListPage
      title="虚拟事件"
      crumbPath="虚拟事件"
      subtitle="组合多个事件与筛选条件形成的复合事件，方便灵活使用各种分析模型"
      jsonFile={J}
      headerActions={<Button size="sm">创建虚拟事件</Button>}
      searchPlaceholder="搜索事件名、显示名"
      searchKeys={['name', 'displayName']}
      panelTitle="虚拟事件列表"
      panelDesc="点击「虚拟事件名」查看事件详情"
      columns={columns}
      rows={rows}
      clickableKey="name"
      onRowClick={(r) => setCur(events.find((e) => e.id === r.id) ?? null)}
      drawerOpen={!!cur}
      drawerTitle="事件详情"
      drawerWidth="max-w-2xl"
      onCloseDrawer={() => setCur(null)}
    >
      {cur && (
        <>
          <p className="rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3 text-xs leading-relaxed text-brand-800">
            💡 虚拟事件可以组合多个事件和筛选条件，以方便您灵活的使用各种分析模型
          </p>

          <MetaSection title="基本信息">
            <MetaField label="虚拟事件显示名" value={cur.displayName}  />
            <MetaField label="虚拟事件名" value={<code className="font-mono text-brand-700">{cur.name}</code>} />
            <MetaField label="创建人" value={cur.creator} />
            <MetaField label="创建时间" value={cur.createdAt} />
            <MetaField label="更新时间" value={cur.updatedAt} />
            <MetaField label="标签" value={cur.tags} />
            <MetaField label="事件截图" value={cur.screenshot} />
            <MetaField label="备注" value={cur.remark} />
          </MetaSection>

          <MetaSection title="虚拟事件的组成" desc="当以下事件中任意一个被触发时，视作该虚拟事件被触发">
            <div className="space-y-2">
              {cur.parts.map((part, i) => (
                <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                  <div className="text-sm font-medium text-ink-900">{part.event}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    筛选条件：{part.condition === '-' ? '无' : part.condition}
                  </div>
                </div>
              ))}
            </div>
          </MetaSection>
        </>
      )}
    </MetaListPage>
  );
}
