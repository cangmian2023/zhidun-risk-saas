// 元数据管理 ① 元事件 —— 列表 + 点击事件名弹出「事件详情」抽屉
// 列与数据取自 sensors/1.元事件 元数据管理.html
import { useState } from 'react';
import type { Column, Row } from '../components/ui';
import { Button } from '../components/ui';
import { Sam } from './SourceTag';
import { MetaListPage, MetaField, MetaSection, MiniTable, metaBadge } from './MetaListPage';
import { useMetaEvents, useMetaEventProps } from './metaStore';
import type { MetaEvent } from './metaData';
import { OPT_VISIBLE, OPT_RECEIVE, OPT_MUTABLE, OPT_PLATFORM } from './metaData';

const J = 'metaEvents.json';

export default function MetaEventConfig() {
  const events = useMetaEvents();
  const eventProps = useMetaEventProps();
  const [cur, setCur] = useState<MetaEvent | null>(null);

  const columns: Column[] = [
    { key: 'name', label: '事件名', tag: { kind: 'sample', value: `${J}.name` } },
    { key: 'displayName', label: '事件显示名', tag: { kind: 'sample', value: `${J}.displayName` } },
    { key: 'hasData', label: '上报数据', type: 'badge', tag: { kind: 'sample', value: `${J}.hasData` } },
    { key: 'visible', label: '显示状态', type: 'badge', tag: { kind: 'sample', value: `${J}.visible` } },
    { key: 'receive', label: '是否接收', type: 'badge', tag: { kind: 'sample', value: `${J}.receive` } },
    { key: 'days30', label: '过去30天入库', align: 'right', tag: { kind: 'sample', value: `${J}.days30` } },
    { key: 'platform', label: '应埋点平台', tag: { kind: 'sample', value: `${J}.platform` } },
    { key: 'tags', label: '标签', tag: { kind: 'sample', value: `${J}.tags` } },
    { key: 'mutable', label: '是否为可变事件', tag: { kind: 'sample', value: `${J}.mutable` } },
    { key: 'updatedAt', label: '上次修改时间', type: 'datetime', tag: { kind: 'sample', value: `${J}.updatedAt` } },
    { key: 'creator', label: '创建人', tag: { kind: 'sample', value: `${J}.creator` } },
  ];

  const rows: Row[] = events.map((e) => ({
    id: e.id,
    name: e.name,
    displayName: e.displayName,
    hasData: metaBadge(e.hasData),
    visible: metaBadge(e.visible),
    receive: metaBadge(e.receive),
    days30: e.days30,
    platform: e.platform,
    tags: e.tags,
    mutable: e.mutable,
    updatedAt: e.updatedAt,
    creator: e.creator,
  })) as unknown as Row[];

  // 抽屉内「该事件的属性明细」：取事件属性表前若干条作为关联样例
  const related = eventProps.slice(0, 6);

  return (
    <MetaListPage
      title="元事件"
      crumbPath="元事件"
      subtitle="管理已采集事件的元定义：显示名、显示状态、是否接收、埋点平台与触发时机"
      jsonFile={J}
      headerActions={<Button size="sm" variant="secondary">下载数据采集需求文档</Button>}
      filters={[
        { key: 'visible', label: '显示状态', options: OPT_VISIBLE, defaultValue: '可见' },
        { key: 'receive', label: '是否接收', options: OPT_RECEIVE },
        { key: 'platform', label: '应埋点平台', options: OPT_PLATFORM },
        { key: 'mutable', label: '是否为可变事件', options: OPT_MUTABLE },
      ]}
      searchPlaceholder="搜索事件名、显示名"
      searchKeys={['name', 'displayName']}
      panelTitle="元事件列表"
      panelDesc="点击「事件名」查看事件详情"
      columns={columns}
      rows={rows}
      clickableKey="name"
      onRowClick={(r) => setCur(events.find((e) => e.id === r.id) ?? null)}
      drawerOpen={!!cur}
      drawerTitle={cur ? `事件详情 · ${cur.displayName}` : '事件详情'}
      drawerWidth="max-w-2xl"
      onCloseDrawer={() => setCur(null)}
    >
      {cur && (
        <>
          <MetaSection title="基本信息">
            <MetaField label="事件名" value={<code className="font-mono text-brand-700">{cur.name}</code>} tag={<Sam value={`${J}.name`} />} />
            <MetaField label="事件显示名" value={cur.displayName} />
            <MetaField label="上报数据" value={cur.hasData} />
            <MetaField label="显示状态" value={cur.visible} />
            <MetaField label="是否接收" value={cur.receive} />
            <MetaField label="过去 30 天入库" value={cur.days30} />
            <MetaField label="应埋点平台" value={cur.platform} />
            <MetaField label="标签" value={cur.tags} />
            <MetaField label="是否为可变事件" value={cur.mutable} />
            <MetaField label="事件截图" value={cur.screenshot} />
          </MetaSection>

          <MetaSection title="业务说明">
            <MetaField label="触发时机" value={cur.trigger} />
            <MetaField label="备注" value={cur.remark} />
          </MetaSection>

          <MetaSection title="维护信息">
            <MetaField label="上次修改时间" value={cur.updatedAt} />
            <MetaField label="创建人" value={cur.creator} />
          </MetaSection>

          <MetaSection title="该事件的属性明细" desc="事件上报时携带的属性字段">
            <MiniTable
              head={['属性名', '属性显示名', '数据类型', '显示状态']}
              rows={related.map((p) => [
                <code key="n" className="font-mono text-xs">{p.name}</code>,
                p.displayName,
                p.dataType,
                p.visible,
              ])}
            />
          </MetaSection>
        </>
      )}
    </MetaListPage>
  );
}
