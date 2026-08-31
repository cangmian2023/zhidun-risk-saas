// 元数据管理 ⑤ 物品属性 —— 列表 + 点击属性名弹出「物品属性详情」抽屉
// 列与数据取自 sensors/5.物品属性.html
import { useState } from 'react';
import type { Column, Row } from '../components/ui';
import { MetaListPage, MetaField, MetaSection, metaBadge } from './MetaListPage';
import { useMetaItemProps } from './metaStore';
import type { MetaItemProp } from './metaData';
import { OPT_VISIBLE, OPT_DATA_TYPE } from './metaData';

const J = 'metaItemProps.json';

export default function MetaItemPropConfig() {
  const props = useMetaItemProps();
  const [cur, setCur] = useState<MetaItemProp | null>(null);

  const columns: Column[] = [
    { key: 'name', label: '属性名' },
    { key: 'displayName', label: '属性显示名' },
    { key: 'itemType', label: '物品类型' },
    { key: 'dataType', label: '数据类型', type: 'badge', badgeKind: 'blue' },
    { key: 'unit', label: '单位/格式' },
    { key: 'visible', label: '显示状态', type: 'badge' },
    { key: 'preset', label: '预置' },
  ];

  const rows: Row[] = props.map((p) => ({
    id: p.id,
    name: p.name,
    displayName: p.displayName,
    itemType: p.itemType,
    dataType: p.dataType,
    unit: p.unit,
    visible: metaBadge(p.visible),
    preset: p.preset,
  })) as unknown as Row[];

  return (
    <MetaListPage
      title="物品属性"
      crumbPath="物品属性"
      subtitle="管理物品维度的属性字段：物品类型、数据类型与显示状态"
      jsonFile={J}
      filters={[
        { key: 'visible', label: '显示状态', options: OPT_VISIBLE, defaultValue: '可见' },
        { key: 'dataType', label: '数据类型', options: OPT_DATA_TYPE },
      ]}
      searchPlaceholder="属性名/显示名/物品类型"
      searchKeys={['name', 'displayName', 'itemType']}
      panelTitle="物品属性列表"
      panelDesc="点击「属性名」查看物品属性详情"
      columns={columns}
      rows={rows}
      clickableKey="name"
      onRowClick={(r) => setCur(props.find((p) => p.id === r.id) ?? null)}
      drawerOpen={!!cur}
      drawerTitle="物品属性详情"
      drawerWidth="max-w-xl"
      onCloseDrawer={() => setCur(null)}
    >
      {cur && (
        <MetaSection title="属性信息">
          <MetaField label="属性显示名" value={cur.displayName}  />
          <MetaField label="属性名" value={<code className="font-mono text-brand-700">{cur.name}</code>} />
          <MetaField label="物品类型" value={cur.itemType} />
          <MetaField label="数据类型" value={cur.dataType} />
          <MetaField label="单位/格式" value={cur.unit} />
          <MetaField label="显示状态" value={cur.visible} />
          <MetaField label="预置属性" value={cur.preset} />
        </MetaSection>
      )}
    </MetaListPage>
  );
}
