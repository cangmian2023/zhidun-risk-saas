// 可复用页面骨架（贷中监控及之后所有新建页面的统一外壳）
// 落地规则：④复用优先
// 用法：页面保留自己的外层容器 <div style={{padding:24,maxWidth}}>，
//       把 <PageHeader .../> 换成 <PageShell .../> 即可自动带上统一页面头。
import type { ReactNode } from 'react';
import { PageHeader } from '../components/ui';

export function PageShell({
  title,
  subtitle,
  crumb,
  crumbNodes,
  actions,
  header,
  onBack,
}: {
  title?: string;
  subtitle?: string;
  crumb?: string;
  crumbNodes?: ReactNode;
  actions?: ReactNode;
  header?: ReactNode;
  onBack?: () => void;
  legend?: boolean; // 历史来源标签图例开关（来源标签体系已移除，保留 prop 以兼容既有页面传参）
}) {
  return (
    <>
      {header ?? <PageHeader title={title ?? ''} subtitle={subtitle} crumb={crumb} crumbNodes={crumbNodes} actions={actions} onBack={onBack} />}
    </>
  );
}
