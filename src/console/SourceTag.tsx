// 保存状态提示条（样例数据落盘后的轻提示）
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
