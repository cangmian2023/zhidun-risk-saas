// 可复用页面骨架（贷中监控及之后所有新建页面的统一外壳）
// 落地规则：③数据来源三色标签 + ④复用优先
// 用法：页面保留自己的外层容器 <div style={{padding:24,maxWidth}}>，
//       把 <PageHeader .../> 换成 <PageShell .../> 即可自动带上标签图例。
import type { ReactNode } from 'react';
import { PageHeader } from '../components/ui';
import { SourceTagLegend } from './SourceTag';

export function PageShell({
  title,
  subtitle,
  crumb,
  actions,
  header,
  legend = true,
  onBack,
}: {
  title?: string;
  subtitle?: string;
  crumb?: string;
  actions?: ReactNode;
  header?: ReactNode;
  legend?: boolean;
  onBack?: () => void;
}) {
  return (
    <>
      {header ?? <PageHeader title={title ?? ''} subtitle={subtitle} crumb={crumb} actions={actions} onBack={onBack} />}
      {legend && <SourceTagLegend />}
    </>
  );
}
