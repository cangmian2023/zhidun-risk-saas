// 元数据管理 ⑧ 可视化全埋点事件 —— 列表 + 点击显示名弹出「埋点详情」抽屉
// 列与数据取自 sensors/8.可视化全埋点事件.html
import { useState } from 'react';
import type { Column, Row } from '../components/ui';
import { MetaListPage, MetaField, MetaSection, metaBadge } from './MetaListPage';
import { useMetaAutoTrackEvents } from './metaStore';
import type { MetaAutoTrackEvent } from './metaData';
import { OPT_VISIBLE, OPT_PLATFORM, OPT_AT_EVENT_TYPE } from './metaData';

const J = 'metaAutoTrackEvents.json';

export default function MetaAutoTrackConfig() {
  const events = useMetaAutoTrackEvents();
  const [cur, setCur] = useState<MetaAutoTrackEvent | null>(null);

  const columns: Column[] = [
    { key: 'displayName', label: '显示名' },
    { key: 'platform', label: '平台', type: 'badge', badgeKind: 'blue' },
    { key: 'eventType', label: '事件类型' },
    { key: 'visible', label: '显示状态', type: 'badge' },
    { key: 'match30', label: '过去 30 天匹配事件数', align: 'right' },
    { key: 'lastVersion', label: '最后修改版本' },
    { key: 'lastUpdater', label: '最后更新人' },
    { key: 'updatedAt', label: '更新时间', type: 'datetime' },
    { key: 'createdAt', label: '创建时间', type: 'datetime' },
  ];

  const rows: Row[] = events.map((e) => ({
    id: e.id,
    displayName: e.displayName,
    platform: e.platform,
    eventType: e.eventType,
    visible: metaBadge(e.visible),
    match30: e.match30,
    lastVersion: e.lastVersion,
    lastUpdater: e.lastUpdater,
    updatedAt: e.updatedAt,
    createdAt: e.createdAt,
  })) as unknown as Row[];

  return (
    <MetaListPage
      title="可视化全埋点事件"
      crumbPath="可视化全埋点事件"
      subtitle="通过可视化圈选生成的埋点事件，管理其匹配规则、生效版本与显示状态"
      jsonFile={J}
      filters={[
        { key: 'platform', label: '平台', options: OPT_PLATFORM },
        { key: 'eventType', label: '事件类型', options: OPT_AT_EVENT_TYPE },
        { key: 'visible', label: '显示状态', options: OPT_VISIBLE, defaultValue: '可见' },
      ]}
      searchPlaceholder="搜索显示名"
      searchKeys={['displayName']}
      panelTitle="可视化全埋点事件列表"
      panelDesc="点击「显示名」查看埋点详情"
      columns={columns}
      rows={rows}
      clickableKey="displayName"
      onRowClick={(r) => setCur(events.find((e) => e.id === r.id) ?? null)}
      drawerOpen={!!cur}
      drawerTitle="埋点详情"
      drawerWidth="max-w-2xl"
      onCloseDrawer={() => setCur(null)}
    >
      {cur && (
        <>
          <MetaSection title="埋点信息">
            <MetaField label="显示名" value={cur.displayName}  />
            <MetaField label="平台" value={cur.platform} />
            <MetaField label="事件类型" value={cur.eventType} />
            <MetaField label="显示状态" value={cur.visible} />
            <MetaField label="过去 30 天匹配事件数" value={cur.match30} />
            <MetaField label="最后修改版本" value={cur.lastVersion} />
          </MetaSection>

          <MetaSection title="维护信息">
            <MetaField label="最后更新人" value={cur.lastUpdater} />
            <MetaField label="更新时间" value={cur.updatedAt} />
            <MetaField label="创建人" value={cur.creator} />
            <MetaField label="创建时间" value={cur.createdAt} />
          </MetaSection>
        </>
      )}
    </MetaListPage>
  );
}
