// 元数据管理 ④ 维度表 —— 列表 + 点击表名弹出「维度表详情」抽屉（表字段明细）
// 表与字段取自 sensors/4.维度表.html（items 表：$is_valid / $receive_time / $update_time）
import { useState } from 'react';
import type { Column, Row } from '../components/ui';
import { MetaListPage, MetaField, MetaSection, MiniTable } from './MetaListPage';
import { useMetaDimTables } from './metaStore';
import type { MetaDimTable } from './metaData';

const J = 'metaDimTables.json';

export default function MetaDimTableConfig() {
  const tables = useMetaDimTables();
  const [cur, setCur] = useState<MetaDimTable | null>(null);

  const columns: Column[] = [
    { key: 'name', label: '维度表名' },
    { key: 'displayName', label: '显示名' },
    { key: 'fieldCount', label: '字段数', align: 'right' },
    { key: 'fieldList', label: '字段预览' },
    { key: 'updatedAt', label: '更新时间', type: 'datetime' },
  ];

  const rows: Row[] = tables.map((t) => ({
    id: t.id,
    name: t.name,
    displayName: t.displayName,
    fieldCount: t.fields.length,
    fieldList: t.fields.map((f) => f.name).join('、'),
    updatedAt: t.updatedAt,
  })) as unknown as Row[];

  return (
    <MetaListPage
      title="维度表"
      crumbPath="维度表"
      subtitle="管理用于关联分析的维度表及其字段结构"
      jsonFile={J}
      searchPlaceholder="搜索维度表名称"
      searchKeys={['name', 'displayName']}
      panelTitle="维度表列表"
      panelDesc="点击「维度表名」查看表字段明细"
      columns={columns}
      rows={rows}
      clickableKey="name"
      onRowClick={(r) => setCur(tables.find((t) => t.id === r.id) ?? null)}
      drawerOpen={!!cur}
      drawerTitle={cur ? `维度表详情 · ${cur.name}` : '维度表详情'}
      drawerWidth="max-w-xl"
      onCloseDrawer={() => setCur(null)}
    >
      {cur && (
        <>
          <MetaSection title="基本信息">
            <MetaField label="维度表名" value={<code className="font-mono text-brand-700">{cur.name}</code>}  />
            <MetaField label="显示名" value={cur.displayName} />
            <MetaField label="字段数" value={cur.fields.length} />
            <MetaField label="更新时间" value={cur.updatedAt} />
          </MetaSection>

          <MetaSection title="表字段" desc="维度表包含的属性字段与数据类型">
            <MiniTable
              head={['属性名', '数据类型', '操作']}
              rows={cur.fields.map((f) => [
                <code key="n" className="font-mono text-xs">{f.name}</code>,
                f.dataType,
                <button
                  key="op"
                  type="button"
                  onClick={() => void navigator.clipboard?.writeText(f.name)}
                  className="text-xs text-brand-600 hover:underline"
                >
                  复制
                </button>,
              ])}
            />
          </MetaSection>
        </>
      )}
    </MetaListPage>
  );
}
