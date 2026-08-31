// 元数据管理 ③ 用户属性 —— 列表 + 点击属性名弹出「用户属性详情」抽屉
// 列、筛选取自 sensors/3.用户属性.html 及其详情页
import { useState } from 'react';
import type { Column, Row } from '../components/ui';
import { MetaListPage, MetaField, MetaSection, metaBadge } from './MetaListPage';
import { useMetaUserProps } from './metaStore';
import type { MetaProp } from './metaData';
import { OPT_VISIBLE, OPT_HAS_DATA, OPT_DATA_TYPE } from './metaData';

const J = 'metaUserProps.json';

export default function MetaUserPropConfig() {
  const props = useMetaUserProps();
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
      title="用户属性"
      crumbPath="用户属性"
      subtitle="管理用户维度的属性字段：数据类型、字典、显示状态与取值说明"
      jsonFile={J}
      filters={[
        { key: 'visible', label: '显示状态', options: OPT_VISIBLE, defaultValue: '可见' },
        { key: 'hasData', label: '上报数据', options: OPT_HAS_DATA },
        { key: 'dataType', label: '数据类型', options: OPT_DATA_TYPE },
      ]}
      searchPlaceholder="属性名、属性显示名"
      searchKeys={['name', 'displayName']}
      panelTitle="用户属性列表"
      panelDesc="点击「属性名」查看用户属性详情"
      columns={columns}
      rows={rows}
      clickableKey="name"
      onRowClick={(r) => setCur(props.find((p) => p.id === r.id) ?? null)}
      drawerOpen={!!cur}
      drawerTitle="用户属性详情"
      drawerWidth="max-w-xl"
      onCloseDrawer={() => setCur(null)}
    >
      {cur && (
        <MetaSection title="属性信息">
          <MetaField label="属性显示名" value={cur.displayName}  />
          <MetaField label="属性名" value={<code className="font-mono text-brand-700">{cur.name}</code>} />
          <MetaField label="显示状态" value={cur.visible === '可见' ? '显示' : cur.visible} />
          <MetaField label="数据类型" value={cur.dataType} />
          <MetaField label="单位/格式" value={cur.unit} />
          <MetaField label="字典" value={cur.dict} />
          <MetaField label="预置属性" value={cur.preset} />
          <MetaField label="上报数据" value={cur.hasData} />
          <MetaField label="属性值示例或说明" value={cur.sample} />
        </MetaSection>
      )}
    </MetaListPage>
  );
}
