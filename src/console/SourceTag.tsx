// 数据来源标签（贷中监控全页面统一使用）
// 蓝=配置JSON（管理中心的配置）｜ 橘=样例JSON（本地样例数据）｜ 灰=实时计算（聚合/公式）
import type { ReactNode } from 'react';

const tagS: React.CSSProperties = {
  display: 'inline-block',
  fontSize: 9,
  fontFamily: 'monospace',
  padding: '0 3px',
  borderRadius: 2,
  marginLeft: 3,
  verticalAlign: 'middle',
  lineHeight: '14px',
  fontWeight: 400,
  whiteSpace: 'nowrap',
};

export type SourceKind = 'cfg' | 'sample' | 'calc';

const KIND_META: Record<SourceKind, { label: string; bg: string; fg: string; bd: string }> = {
  cfg: { label: '配置JSON', bg: '#DBEAFE', fg: '#1D4ED8', bd: '#93C5FD' },
  sample: { label: '样例JSON', bg: '#FFF7ED', fg: '#C2410C', bd: '#FDBA74' },
  calc: { label: '实时计算', bg: '#F3F4F6', fg: '#6B7280', bd: '#D1D5DB' },
};

export function SourceTag({ kind, label, value }: { kind: SourceKind; label?: string; value?: ReactNode }) {
  const m = KIND_META[kind];
  return (
    <span
      style={{
        ...tagS,
        background: m.bg,
        color: m.fg,
        border: `1px solid ${m.bd}`,
      }}
      title={`数据来源：${m.label}${label ? ` · ${label}` : ''}`}
    >
      {m.label}{label ? `·${label}` : ''}{value !== undefined ? `:${value}` : ''}
    </span>
  );
}

// 便捷别名（与报告模块 Tpl/Dat/Cal 语义一致）
export const Cfg = (props: { label?: string; value?: ReactNode }) => <SourceTag kind="cfg" {...props} />;
export const Sam = (props: { label?: string; value?: ReactNode }) => <SourceTag kind="sample" {...props} />;
export const Cal = (props: { label?: string; value?: ReactNode }) => <SourceTag kind="calc" {...props} />;

// 保存状态提示条
export function MidSaveToast({ status }: { status: 'idle' | 'saving' | 'saved' | 'error' }) {
  if (status === 'idle' || status === 'saving') return null;
  const isErr = status === 'error';
  return (
    <div
      style={{
        position: 'fixed',
        right: 24,
        top: 72,
        zIndex: 999,
        padding: '6px 12px',
        borderRadius: 6,
        fontSize: 12,
        background: isErr ? '#FEF2F2' : '#F0FDF4',
        color: isErr ? '#B91C1C' : '#15803D',
        border: `1px solid ${isErr ? '#FCA5A5' : '#86EFAC'}`,
        boxShadow: '0 2px 8px rgba(0,0,0,.08)',
      }}
    >
      {isErr ? '保存失败，请检查 JSON 文件写入' : '已保存到本地 JSON'}
    </div>
  );
}
