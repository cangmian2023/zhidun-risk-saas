// 企业风控 · 添加监控 弹窗（风险预警页 与 监控列表页 共用同一实例）
// 受控组件：open / onClose；内部维护 上传Tab 与 Excel 步骤
// 数据：fkRisk.json 的 excelVerify（橘 Sam）
import { useEffect, useState } from 'react'
import { EpDrawer, EpBtn, DataTable, useSample } from '../../epCommon'
import fkRiskSeed from '../../../fkRisk.json'

const tab = (on: boolean): React.CSSProperties => ({
  cursor: 'pointer',
  padding: '6px 14px',
  fontSize: 13,
  borderBottom: `2px solid ${on ? '#2563EB' : 'transparent'}`,
  color: on ? '#2563EB' : '#64748B',
  fontWeight: on ? 600 : 400,
})
const lk: React.CSSProperties = { color: '#2563EB', cursor: 'pointer' }
const inp: React.CSSProperties = { padding: '7px 12px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13, outline: 'none', width: '100%' }

function SortIcon() {
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', lineHeight: 0.6 }}>
      <svg width="8" height="5" viewBox="0 0 24 24" fill="#94A3B8"><path d="M12 4l8 8H4z" /></svg>
      <svg width="8" height="5" viewBox="0 0 24 24" fill="#94A3B8"><path d="M12 20l-8-8h16z" /></svg>
    </span>
  )
}
function FilterIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  )
}

export function AddMonitorDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [data] = useSample('fkRisk.json', fkRiskSeed)
  const [addTab, setAddTab] = useState('输入粘贴上传')
  const [excelStep, setExcelStep] = useState(1)

  // 每次关闭后复位，保证再次打开时从头开始
  useEffect(() => {
    if (!open) {
      setAddTab('输入粘贴上传')
      setExcelStep(1)
    }
  }, [open])

  const close = () => {
    onClose()
  }

  return (
    <EpDrawer open={open} onClose={close} title="添加监控" width={640}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {['输入粘贴上传', 'Excel上传', '客户列表导入'].map((t) => (
          <span key={t} onClick={() => setAddTab(t)} style={tab(addTab === t)}>{t}</span>
        ))}
      </div>
      <div style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>
        剩余额度 <b style={{ color: '#0F172A' }}>18</b>
        <a style={{ ...lk, marginLeft: 10 }}>添加境外企业</a>
      </div>
      {addTab === '输入粘贴上传' && (
        <>
          <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>
            1、企业信息可手动输入添加，也可直接复制粘贴，如：乐视网信息技术（北京）股份有限公司
          </div>
          <textarea placeholder="请输入企业名称或选择分组" style={{ ...inp, height: 150, resize: 'vertical' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: '#94A3B8' }}>
            <span>0 / 540</span>
            <span style={{ display: 'inline-flex', gap: 10 }}>
              <a style={lk}>清空</a>
              <a style={lk}>立即匹配</a>
            </span>
          </div>
          <div style={{ marginTop: 12, border: '1px solid #F1F5F9', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 13, color: '#0F172A' }}>已选目标 <b>0</b> <span style={{ color: '#94A3B8' }}>/18</span>
              <a style={{ ...lk, marginLeft: 10, fontSize: 12 }}>下载名单</a>
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: '#94A3B8' }}>您添加的企业将展示在这里</div>
          </div>
        </>
      )}
      {addTab === 'Excel上传' && (
        <div>
          {/* 步骤条 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginBottom: 14 }}>
            {[
              { n: 1, label: '上传名单' },
              { n: 2, label: '数据校验' },
              { n: 3, label: '信息校验' },
              { n: 4, label: '上传完成' },
            ].map((s, i, arr) => {
              const done = excelStep > s.n
              const active = excelStep === s.n
              return (
                <span key={s.n} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: active ? '#2563EB' : done ? '#0F172A' : '#94A3B8' }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: '50%', fontSize: 11,
                      background: active ? '#2563EB' : done ? '#DBEAFE' : '#F1F5F9',
                      color: active ? '#fff' : done ? '#2563EB' : '#94A3B8',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}>{done ? '✓' : s.n}</span>
                    {s.label}
                  </span>
                  {i < arr.length - 1 && <span style={{ color: '#CBD5E1' }}>&gt;</span>}
                </span>
              )
            })}
          </div>

          {excelStep === 1 && (
            <>
              <div style={{ border: '1px dashed #CBD5E1', borderRadius: 12, padding: 30, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
                将Excel文件拖拽至框内上传
                <div style={{ fontSize: 12, marginTop: 6 }}>可添加 18 个目标 · 仅支持 Excel 格式文件(xls, xlsx)</div>
                <div style={{ marginTop: 10, display: 'inline-flex', gap: 10 }}>
                  <EpBtn variant="primary" size="sm">点击上传</EpBtn>
                  <EpBtn variant="default" size="sm">下载样例文件</EpBtn>
                </div>
                <div style={{ marginTop: 10, fontSize: 12 }}>上传中 0% · 预计剩余时长 - 秒</div>
              </div>
              <div style={{ marginTop: 12, textAlign: 'right' }}>
                <EpBtn variant="primary" size="sm" onClick={() => setExcelStep(2)}>下一步</EpBtn>
              </div>
            </>
          )}

          {excelStep === 2 && (
            <>
              <div style={{ border: '1px dashed #CBD5E1', borderRadius: 12, padding: 40, textAlign: 'center', color: '#64748B', fontSize: 13 }}>
                数据校验中...
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 6 }}>系统正在校验企业名称与统一社会信用代码</div>
              </div>
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                <EpBtn variant="default" size="sm" onClick={() => setExcelStep(1)}>返回上一步</EpBtn>
                <EpBtn variant="primary" size="sm" onClick={() => setExcelStep(3)}>下一步</EpBtn>
              </div>
            </>
          )}

          {excelStep === 3 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#0F172A' }}>
                  <b style={{ color: '#2563EB' }}>{data.excelVerify?.matched ?? 0}</b> 个企业匹配成功，
                  负责人/部门失败 <b style={{ color: '#DC2626' }}>{data.excelVerify?.ownerFail ?? 0}</b> 条，
                  分组失败 <b style={{ color: '#DC2626' }}>{data.excelVerify?.groupFail ?? 0}</b> 条
                </span>
                <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 8 }}>
                  <EpBtn variant="default" size="sm">下载失败名单</EpBtn>
                  <EpBtn variant="default" size="sm">变更负责人</EpBtn>
                  <EpBtn variant="default" size="sm">设置标签</EpBtn>
                  <EpBtn variant="default" size="sm">变更分组</EpBtn>
                </span>
              </div>
              <div style={{ border: '1px solid #E2E8F0', borderRadius: 10, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC' }}>
                      <th style={{ padding: '10px 8px', borderBottom: '1px solid #E2E8F0', width: 36, textAlign: 'center' }}>
                        <input type="checkbox" />
                      </th>
                      <th style={{ padding: '10px 8px', borderBottom: '1px solid #E2E8F0', textAlign: 'center', width: 50 }}>序号</th>
                      <th style={{ padding: '10px 8px', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>企业名称</th>
                      <th style={{ padding: '10px 8px', borderBottom: '1px solid #E2E8F0', textAlign: 'left', width: 90 }}>企业编号</th>
                      <th style={{ padding: '10px 8px', borderBottom: '1px solid #E2E8F0', textAlign: 'left', width: 90 }}>企业简称</th>
                      <th style={{ padding: '10px 8px', borderBottom: '1px solid #E2E8F0', textAlign: 'left', width: 90 }}>联系邮箱</th>
                      <th style={{ padding: '10px 8px', borderBottom: '1px solid #E2E8F0', textAlign: 'left', width: 100 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>负责人 <SortIcon /></span>
                      </th>
                      <th style={{ padding: '10px 8px', borderBottom: '1px solid #E2E8F0', textAlign: 'left', width: 100 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>标签 <FilterIcon /></span>
                      </th>
                      <th style={{ padding: '10px 8px', borderBottom: '1px solid #E2E8F0', textAlign: 'left', width: 100 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>分组 <FilterIcon /></span>
                      </th>
                      <th style={{ padding: '10px 8px', borderBottom: '1px solid #E2E8F0', textAlign: 'left', width: 80 }}>监控规则</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.excelVerify?.rows ?? []).map((r) => (
                      <tr key={r.id}>
                        <td style={{ padding: '10px 8px', borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}><input type="checkbox" /></td>
                        <td style={{ padding: '10px 8px', borderBottom: '1px solid #F1F5F9', textAlign: 'center', color: '#475569' }}>{r.no}</td>
                        <td style={{ padding: '10px 8px', borderBottom: '1px solid #F1F5F9' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 20, height: 20, borderRadius: 4, background: r.logoColor, color: '#fff', fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{r.logo}</span>
                            <span style={{ color: '#0F172A' }}>{r.name}</span>
                          </span>
                        </td>
                        <td style={{ padding: '10px 8px', borderBottom: '1px solid #F1F5F9', color: '#475569' }}>{r.code}</td>
                        <td style={{ padding: '10px 8px', borderBottom: '1px solid #F1F5F9', color: '#475569' }}>{r.shortName}</td>
                        <td style={{ padding: '10px 8px', borderBottom: '1px solid #F1F5F9', color: '#475569' }}>{r.email}</td>
                        <td style={{ padding: '10px 8px', borderBottom: '1px solid #F1F5F9', color: r.ownerFail ? '#DC2626' : '#475569' }}>{r.owner}</td>
                        <td style={{ padding: '10px 8px', borderBottom: '1px solid #F1F5F9', color: '#475569' }}>{r.tags}</td>
                        <td style={{ padding: '10px 8px', borderBottom: '1px solid #F1F5F9', color: r.groupFail ? '#DC2626' : '#475569' }}>{r.group}</td>
                        <td style={{ padding: '10px 8px', borderBottom: '1px solid #F1F5F9', color: '#475569' }}>{r.rule}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                <EpBtn variant="default" size="sm" onClick={() => setExcelStep(2)}>返回上一步</EpBtn>
                <EpBtn variant="primary" size="sm" onClick={() => setExcelStep(4)}>下一步</EpBtn>
              </div>
            </>
          )}

          {excelStep === 4 && (
            <>
              <div style={{ border: '1px dashed #BBF7D0', borderRadius: 12, padding: 40, textAlign: 'center', color: '#15803D', fontSize: 14, background: '#F0FDF4' }}>
                上传完成
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 6 }}>企业名单已成功导入监控列表</div>
              </div>
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                <EpBtn variant="default" size="sm" onClick={() => setExcelStep(3)}>返回上一步</EpBtn>
                <EpBtn variant="primary" size="sm" onClick={close}>完成</EpBtn>
              </div>
            </>
          )}
        </div>
      )}
      {addTab === '客户列表导入' && (
        <div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            <input placeholder="输入企业关键字" style={{ ...inp, width: 200 }} />
            <select style={{ ...inp, width: 140 }}><option>部门人员</option><option>19156027703</option></select>
            <select style={{ ...inp, width: 140 }}>
              <option>客商标签</option>
              {['开户', '存款', '贷款', '战略客户', '睡眠户', '招采贷', '科技贷'].map((t) => <option key={t}>{t}</option>)}
            </select>
            <select style={{ ...inp, width: 140 }}>
              <option>客商分组</option>
              {['未分组', '长时间未联系', '重点维护'].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <DataTable
            columns={[
              { key: 'name', label: '选择本页' },
              { key: 'group', label: '分组' },
              { key: 'tag', label: '标签' },
              { key: 'owner', label: '负责人' },
              { key: 'time', label: '添加时间' },
            ]}
            rows={[
              { id: 'i1', name: '抖音有限公司', group: '未分组', tag: '开户', owner: '19156027703', time: '2026-08-17' },
              { id: 'i2', name: '深圳书读科技有限公司', group: '重点维护', tag: '贷款', owner: '19156027703', time: '2026-08-17' },
            ]}
            selectable
          />
          <div style={{ marginTop: 8, fontSize: 12, color: '#94A3B8' }}>共 2 条结果</div>
        </div>
      )}
      {addTab !== 'Excel上传' && (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
          <EpBtn variant="default" onClick={close}>取消</EpBtn>
          <EpBtn variant="primary" onClick={close}>确定</EpBtn>
        </div>
      )}
    </EpDrawer>
  )
}
