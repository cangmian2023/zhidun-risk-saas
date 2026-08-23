import { useSearchParams } from 'react-router-dom';
import { PageShell } from './PageShell';
import { usePageNav } from './pageNav';

/* 投资机构详情（pevc-org-detail）
 * 需求文档 record/功能分解/功能分解/pevc - 投资机构详情.html 待补充，
 * 当前为占位页：展示传入机构名 + 待 1:1 复刻提示，提供返回按钮。
 */
export default function DmPevcOrgDetail() {
  const [params] = useSearchParams();
  const orgName = params.get('name') || '未知投资机构';
  const { back } = usePageNav();

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: '#fff', overflow: 'auto' }}>
      <PageShell title="投资机构详情" subtitle={orgName} crumb="数字营销 / 投融资 / 投资机构详情" />
      <div style={{ padding: '24px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={() => back('/console/dm/pevc')}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            返回
          </button>
        </div>

        <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: 8 }}>{orgName}</div>

        <div
          style={{
            marginTop: 24,
            padding: '32px',
            border: '1px dashed #d1d5db',
            borderRadius: '8px',
            backgroundColor: '#f9fafb',
            color: '#6b7280',
            fontSize: '15px',
            lineHeight: 1.8,
          }}
        >
          投资机构详情内容将按 pevc - 投资机构详情.html 1:1 复刻（需求文档待补充）
        </div>
      </div>
    </div>
  );
}
