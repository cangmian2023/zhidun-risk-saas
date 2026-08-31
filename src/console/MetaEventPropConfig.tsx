// 元数据管理 ② 事件属性 —— 列表 + 点击属性名弹出「事件属性详情」抽屉
// 列、筛选与抽屉字段取自 sensors/2.事件属性.html 及其详情页
import { useState } from 'react';
import type { Column, Row } from '../components/ui';
import { MetaListPage, MetaField, MetaSection, MiniTable, metaBadge } from './MetaListPage';
import { useMetaEventProps } from './metaStore';
import type { MetaProp } from './metaData';
import { OPT_VISIBLE, OPT_HAS_DATA, OPT_DATA_TYPE, SEED_RELATED_EVENT_PROP } from './metaData';

const J = 'metaEventProps.json';

export default function MetaEventPropConfig() {
  const props = useMetaEventProps();
  const [cur, setCur] = useState<MetaProp | null>(null);

  const columns: Column[] = [
    { key: 'name', label: '属性名' },
    { key: 'displayName', label: '属性显示名' },
    { key: 'dataType', label: '数据类型', type: 'badge', badgeKind: 'blue' },
    { key: 'hasData', label: '上报数据', type: 'badge' },
    { key: 'preset', label: '预置' },
    { key: 'dict', label: '字典' },
    { key: 'visible', label: '显示状态', type: 'badge' },
  ];

  const rows: Row[] = props.map((p) => ({
    id: p.id,
    name: p.name,
    displayName: p.displayName,
    dataType: p.dataType,
    hasData: metaBadge(p.hasData),
    preset: p.preset,
    dict: p.dict,
    visible: metaBadge(p.visible),
  })) as unknown as Row[];

  return (
    <MetaListPage
      title="事件属性"
      crumbPath="事件属性"
      subtitle="管理事件上报时携带的属性字段：数据类型、字典、显示状态与关联事件"
      jsonFile={J}
      filters={[
        { key: 'visible', label: '显示状态', options: OPT_VISIBLE, defaultValue: '可见' },
        { key: 'hasData', label: '上报数据', options: OPT_HAS_DATA },
        { key: 'dataType', label: '数据类型', options: OPT_DATA_TYPE },
      ]}
      searchPlaceholder="属性名、属性显示名"
      searchKeys={['name', 'displayName']}
      panelTitle="事件属性列表"
      panelDesc="点击「属性名」查看事件属性详情"
      columns={columns}
      rows={rows}
      clickableKey="name"
      onRowClick={(r) => setCur(props.find((p) => p.id === r.id) ?? null)}
      drawerOpen={!!cur}
      drawerTitle="事件属性详情"
      drawerWidth="max-w-2xl"
      onCloseDrawer={() => setCur(null)}
    >
      {cur && (
        <>
          <MetaSection title="属性信息">
            <MetaField label="属性显示名" value={cur.displayName}  />
            <MetaField label="属性名" value={<code className="font-mono text-brand-700">{cur.name}</code>} />
            <MetaField label="显示状态" value={cur.visible === '可见' ? '显示' : cur.visible} />
            <MetaField label="数据类型" value={cur.dataType} />
            <MetaField label="单位/格式" value={cur.unit} />
            <MetaField label="字典" value={cur.dict} />
            <MetaField label="属性值示例或说明" value={cur.sample} />
          </MetaSection>

          <MetaSection title="关联此属性的事件明细" desc="上报该属性的事件">
            <MiniTable
              head={['事件显示名', '事件名', '显示状态']}
              rows={SEED_RELATED_EVENT_PROP.map((e) => [
                e.displayName,
                <code key="n" className="font-mono text-xs">{e.name}</code>,
                e.visible,
              ])}
            />
          </MetaSection>
        </>
      )}
    </MetaListPage>
  );
}
