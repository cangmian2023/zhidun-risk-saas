// 元数据管理 ⑥ 虚拟属性 —— 列表 + 点击属性名弹出「虚拟属性详情」抽屉
// 列、抽屉字段与 SQL 表达式取自 sensors/6.虚拟属性 元数据管理.html 及其详情页
import { useState } from 'react';
import type { Column, Row } from '../components/ui';
import { MetaListPage, MetaField, MetaSection, MiniTable } from './MetaListPage';
import { useMetaVirtualProps } from './metaStore';
import type { MetaVirtualProp } from './metaData';
import { OPT_PROP_CATEGORY, OPT_DATA_TYPE, SEED_RELATED_VIRTUAL_PROP } from './metaData';

const J = 'metaVirtualProps.json';

export default function MetaVirtualPropConfig() {
  const props = useMetaVirtualProps();
  const [cur, setCur] = useState<MetaVirtualProp | null>(null);

  const columns: Column[] = [
    { key: 'name', label: '属性名' },
    { key: 'displayName', label: '属性显示名' },
    { key: 'category', label: '属性分类', type: 'badge', badgeKind: 'blue' },
    { key: 'dataType', label: '数据类型' },
    { key: 'dict', label: '字典' },
    { key: 'requirement', label: '可用此属性的事件要求' },
    { key: 'createdAt', label: '创建时间', type: 'datetime' },
  ];

  const rows: Row[] = props.map((p) => ({
    id: p.id,
    name: p.name,
    displayName: p.displayName,
    category: p.category,
    dataType: p.dataType,
    dict: p.dict,
    requirement: p.requirement,
    createdAt: p.createdAt,
  })) as unknown as Row[];

  return (
    <MetaListPage
      title="虚拟属性"
      crumbPath="虚拟属性"
      subtitle="基于 SQL 表达式派生的属性，不落库、查询时实时计算，可直接用于分析模型"
      jsonFile={J}
      filters={[
        { key: 'category', label: '属性分类', options: OPT_PROP_CATEGORY },
        { key: 'dataType', label: '数据类型', options: OPT_DATA_TYPE },
      ]}
      searchPlaceholder="属性名、属性显示名"
      searchKeys={['name', 'displayName']}
      panelTitle="虚拟属性列表"
      panelDesc="点击「属性名」查看虚拟属性详情"
      columns={columns}
      rows={rows}
      clickableKey="name"
      onRowClick={(r) => setCur(props.find((p) => p.id === r.id) ?? null)}
      drawerOpen={!!cur}
      drawerTitle="虚拟属性详情"
      drawerWidth="max-w-2xl"
      onCloseDrawer={() => setCur(null)}
    >
      {cur && (
        <>
          <MetaSection title="属性信息">
            <MetaField label="属性分类" value={cur.category}  />
            <MetaField label="创建方式" value={cur.createWay} />
            <MetaField label="属性显示名" value={cur.displayName} />
            <MetaField label="属性名" value={<code className="font-mono text-brand-700">{cur.name}</code>} />
            <MetaField label="数据类型" value={cur.dataType} />
            <MetaField label="字典" value={cur.dict} />
            <MetaField label="可用此属性的事件要求" value={cur.requirement} />
            <MetaField label="创建时间" value={cur.createdAt} />
          </MetaSection>

          <MetaSection title="SQL 表达式" desc="查询时按该表达式实时计算属性值">
            <pre className="overflow-x-auto rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 font-mono text-xs text-slate-700">
              {cur.sql}
            </pre>
          </MetaSection>

          <MetaSection title="关联此属性的事件明细" desc="满足事件要求、可使用该虚拟属性的事件">
            <MiniTable
              head={['事件显示名', '事件名', '显示状态']}
              rows={SEED_RELATED_VIRTUAL_PROP.map((e) => [
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
