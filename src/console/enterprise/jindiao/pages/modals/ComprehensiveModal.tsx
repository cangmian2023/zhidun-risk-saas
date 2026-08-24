import { useState } from 'react'
import { FaIcon, ModalShell, MODAL_CSS } from './modalCommon'

/* ============================================================
 * 综合得分详情 —— 企业详情 - 存客商机 & 风险动态
 * （原 record/功能分解/综合得分.HTML 1:1 转写）
 * ============================================================ */
const CSS = MODAL_CSS + `
.text-primary{color:#165DFF}.bg-primary{background-color:#165DFF}
.border-borderLine{border-color:#e5e6eb}.bg-grayBg{background-color:#f7f8fa}
.tab-header{display:inline-block;padding:8px 16px;font-size:14px;cursor:pointer;border-bottom:2px solid transparent}
.tab-header-active{border-color:#165DFF;color:#165DFF;font-weight:500}
.card-wrap{border:1px solid #e5e6eb;border-radius:4px;background:#fff}
.btn-default{display:inline-flex;align-items:center;gap:4px;border:1px solid #e5e6eb;border-radius:4px;padding:4px 12px;font-size:12px;background:#fff;cursor:pointer;color:inherit}
.btn-yellow{display:inline-flex;align-items:center;gap:4px;background:#FFC53D;color:#000;border-radius:4px;padding:4px 12px;font-size:12px;border:none;cursor:pointer}
.table-cell-xs{padding:8px;font-size:12px;border:1px solid #e5e6eb}
.badge-green{display:inline-block;padding:2px 6px;border-radius:4px;font-size:12px;background:#E6FFEA;color:#00B42A}
.badge-blue{display:inline-block;padding:2px 6px;border-radius:4px;font-size:12px;background:#E8F3FF;color:#165DFF}
.badge-warn{display:inline-block;padding:2px 6px;border-radius:4px;font-size:12px;background:#FFECE5;color:#F53F3F}
.star-fill{color:#FFAA00}
.star-empty{color:#DCDFE6}
`

function Stars({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) =>
        i < count ? (
          <i key={i} className="fa fa-star star-fill" />
        ) : (
          <i key={i} className="fa fa-star star-empty" />
        )
      )}
    </>
  )
}

/* ---------- Tab1 存客商机 ---------- */
function CustomerTab() {
  return (
    <div>
      {/* 顶部营销统计卡片 */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        <div className="card-wrap p-3">
          <div className="text-xs text-gray-500">商机营销</div>
          <div className="text-xl font-bold text-primary mt-1">2 <span className="text-xs font-normal text-gray-500">条</span></div>
        </div>
        <div className="card-wrap p-3">
          <div className="text-xs text-gray-500">关联营销</div>
          <div className="text-xl font-bold text-primary mt-1">611 <span className="text-xs font-normal text-gray-500">条</span></div>
        </div>
        <div className="card-wrap p-3">
          <div className="text-xs text-gray-500">集团营销</div>
          <div className="text-xl font-bold text-primary mt-1">249 <span className="text-xs font-normal text-gray-500">条</span></div>
        </div>
        <div className="card-wrap p-3">
          <div className="flex justify-between">
            <div className="text-xs text-gray-500">相似营销</div>
            <div className="text-xs text-gray-400">同类企业</div>
          </div>
          <div className="text-xl font-bold text-primary mt-1">11 <span className="text-xs font-normal text-gray-500">条</span></div>
        </div>
        <div className="card-wrap p-3">
          <div className="flex justify-between">
            <div className="text-xs text-gray-500">位置营销</div>
            <div className="text-xs text-gray-400">附近企业</div>
          </div>
          <div className="text-xl font-bold text-primary mt-1">20353 <span className="text-xs font-normal text-gray-500">条</span></div>
        </div>
      </div>

      {/* 商机营销 */}
      <div className="card-wrap mb-4">
        <div className="p-3 flex justify-between items-center border-b border-borderLine">
          <div className="font-medium">商机营销 <span className="text-xs font-normal text-gray-500">找到 2 条结果</span></div>
          <a href="#" className="text-primary text-xs">全部存客商机 &gt;</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-grayBg">
                <th className="table-cell-xs text-left">商机类型</th>
                <th className="table-cell-xs text-left">商机价值</th>
                <th className="table-cell-xs text-left">商机内容</th>
                <th className="table-cell-xs text-center">操作 <span className="text-gray-400">AI</span></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="table-cell-xs">新获科创类资质...</td>
                <td className="table-cell-xs"><Stars count={1} /></td>
                <td className="table-cell-xs">2026-07-17，抖音有限公司新获科创类资质认定，认定类型为【独角兽企业】，认定级别: -- <span className="text-primary">授信</span></td>
                <td className="table-cell-xs text-center"><a href="#" className="text-primary">公司商机2</a> &nbsp; <a href="#" className="text-primary">AI 触达</a></td>
              </tr>
              <tr>
                <td className="table-cell-xs">新获融资</td>
                <td className="table-cell-xs"><Stars count={5} /></td>
                <td className="table-cell-xs">2025-11-20发生了一笔股权融资,轮次为股权转让;金额: 500000000,币种: 美元;投资方: 今日资本 <span className="text-primary">存款 授信</span></td>
                <td className="table-cell-xs text-center"><a href="#" className="text-primary">公司商机2</a> &nbsp; <a href="#" className="text-primary">AI 触达</a></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 关联营销 */}
      <div className="card-wrap mb-4">
        <div className="p-3 font-medium border-b border-borderLine">关联营销 <span className="text-xs font-normal text-gray-500">找到 611 条结果</span></div>
        <div className="px-3 py-2 flex gap-2 border-b border-borderLine overflow-x-auto">
          <span className="badge-blue whitespace-nowrap">全部611</span>
          <span className="btn-default whitespace-nowrap">董监高法3</span>
          <span className="btn-default whitespace-nowrap">个人股东0</span>
          <span className="btn-default whitespace-nowrap">法人股东1</span>
          <span className="btn-default whitespace-nowrap">投资企业16</span>
          <span className="btn-default whitespace-nowrap">供应链企业589</span>
          <span className="btn-default whitespace-nowrap">担保企业0</span>
          <span className="btn-default whitespace-nowrap">共同知识产权2</span>
        </div>

        {/* 董监高法 */}
        <div className="p-3 border-b border-borderLine">
          <div className="text-xs font-medium mb-2">董监高法 3</div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-grayBg">
                  <th className="table-cell-xs text-left">姓名</th>
                  <th className="table-cell-xs text-left">当前任职</th>
                  <th className="table-cell-xs text-center">持股比例</th>
                  <th className="table-cell-xs text-center">关联企业</th>
                  <th className="table-cell-xs text-left">关联企业最新商机</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="table-cell-xs">银平</td>
                  <td className="table-cell-xs">法定代表人、董事、经理</td>
                  <td className="table-cell-xs text-center">-</td>
                  <td className="table-cell-xs text-center">8</td>
                  <td className="table-cell-xs"><a href="#" className="text-primary">"银平" 任职 "法定代表人、经理" 的企业 "北京抖音信息服务有限公司"，于2026-06-15发生购买技术</a></td>
                </tr>
                <tr>
                  <td className="table-cell-xs">李雪</td>
                  <td className="table-cell-xs">财务负责人</td>
                  <td className="table-cell-xs text-center">-</td>
                  <td className="table-cell-xs text-center">23</td>
                  <td className="table-cell-xs"><a href="#" className="text-primary">"李雪" 任职 "财务负责人" 的企业 "北京抖音信息服务有限公司"，于2026-06-15发生购买技术</a></td>
                </tr>
                <tr>
                  <td className="table-cell-xs">夏绪宏</td>
                  <td className="table-cell-xs">监事</td>
                  <td className="table-cell-xs text-center">-</td>
                  <td className="table-cell-xs text-center">104</td>
                  <td className="table-cell-xs"><a href="#" className="text-primary">"夏绪宏" 任职 "监事" 的企业 "北京抖音信息服务有限公司"，于2026-06-15发生购买技术</a></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 法人股东 */}
        <div className="p-3 border-b border-borderLine">
          <div className="text-xs font-medium mb-2">法人股东 1</div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-grayBg">
                  <th className="table-cell-xs text-left">股东名称</th>
                  <th className="table-cell-xs text-center">持股比例</th>
                  <th className="table-cell-xs text-center">成立日期</th>
                  <th className="table-cell-xs text-center">注册资本</th>
                  <th className="table-cell-xs text-center">所在区域</th>
                  <th className="table-cell-xs text-left">最新商机</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="table-cell-xs">厦门星辰启点科技有限公司</td>
                  <td className="table-cell-xs text-center">98.814%</td>
                  <td className="table-cell-xs text-center">2022-12-30</td>
                  <td className="table-cell-xs text-center">100万元人民币</td>
                  <td className="table-cell-xs text-center">福建厦门市思明区</td>
                  <td className="table-cell-xs">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 投资企业 */}
        <div className="p-3 border-b border-borderLine">
          <div className="text-xs font-medium mb-2">投资企业 16</div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-grayBg">
                  <th className="table-cell-xs text-left">企业名称</th>
                  <th className="table-cell-xs text-center">投资比例</th>
                  <th className="table-cell-xs text-center">成立日期</th>
                  <th className="table-cell-xs text-center">注册资本</th>
                  <th className="table-cell-xs text-center">所在区域</th>
                  <th className="table-cell-xs text-left">最新商机</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="table-cell-xs">小荷智慧（上海）科技有限公司</td>
                  <td className="table-cell-xs text-center">100.00%</td>
                  <td className="table-cell-xs text-center">2025-08-14</td>
                  <td className="table-cell-xs text-center">10万元人民币</td>
                  <td className="table-cell-xs text-center">上海市浦东新区</td>
                  <td className="table-cell-xs"><a href="#" className="text-primary">2026-06-04发生新增投资收购并购</a></td>
                </tr>
                <tr>
                  <td className="table-cell-xs">上海格物致品网络科技有限公司</td>
                  <td className="table-cell-xs text-center">100.00%</td>
                  <td className="table-cell-xs text-center">2021-03-31</td>
                  <td className="table-cell-xs text-center">1000万元人民币</td>
                  <td className="table-cell-xs text-center">上海市杨浦区</td>
                  <td className="table-cell-xs"><a href="#" className="text-primary">2026-08-17发生新增中标</a></td>
                </tr>
                <tr>
                  <td className="table-cell-xs">小荷健康科技（北京）有限公司</td>
                  <td className="table-cell-xs text-center">100.00%</td>
                  <td className="table-cell-xs text-center">2020-09-23</td>
                  <td className="table-cell-xs text-center">100万元人民币</td>
                  <td className="table-cell-xs text-center">北京市海淀区</td>
                  <td className="table-cell-xs">-</td>
                </tr>
                <tr>
                  <td className="table-cell-xs">北京春日方舟科技有限公司</td>
                  <td className="table-cell-xs text-center">100.00%</td>
                  <td className="table-cell-xs text-center">2020-03-26</td>
                  <td className="table-cell-xs text-center">100万元人民币</td>
                  <td className="table-cell-xs text-center">北京市海淀区</td>
                  <td className="table-cell-xs">-</td>
                </tr>
                <tr>
                  <td className="table-cell-xs">天津基石科技有限公司</td>
                  <td className="table-cell-xs text-center">100.00%</td>
                  <td className="table-cell-xs text-center">2018-11-20</td>
                  <td className="table-cell-xs text-center">1000万元人民币</td>
                  <td className="table-cell-xs text-center">天津市滨海新区</td>
                  <td className="table-cell-xs">-</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex justify-end items-center mt-2 gap-2 text-xs">
            <span className="text-gray-500">共 16 条 &nbsp; 5条/页</span>
            <button className="btn-default">&lt;</button>
            <button className="btn-yellow">1</button>
            <button className="btn-default">2</button>
            <button className="btn-default">3</button>
            <button className="btn-default">4</button>
            <button className="btn-default">&gt;</button>
            <span>前往 <input className="w-8 border border-borderLine rounded text-center h-6 mx-1" value="1" /> 页</span>
          </div>
        </div>

        {/* 供应链企业 */}
        <div className="p-3 border-b border-borderLine">
          <div className="text-xs font-medium mb-2">供应链企业 589</div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-grayBg">
                  <th className="table-cell-xs text-left">企业名称</th>
                  <th className="table-cell-xs text-center">类型</th>
                  <th className="table-cell-xs text-center">成立日期</th>
                  <th className="table-cell-xs text-center">注册资本</th>
                  <th className="table-cell-xs text-center">所在区域</th>
                  <th className="table-cell-xs text-left">最新商机</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="table-cell-xs">中国农业银行股份有限公司</td>
                  <td className="table-cell-xs text-center">采购方</td>
                  <td className="table-cell-xs text-center">1986-12-18</td>
                  <td className="table-cell-xs text-center">34998303.3873万元人民币</td>
                  <td className="table-cell-xs text-center">北京市东城区</td>
                  <td className="table-cell-xs"><a href="#" className="text-primary">2026-08-21发生债券发行披露</a></td>
                </tr>
                <tr>
                  <td className="table-cell-xs">智者同行品牌管理顾问（北京）股份有限公司</td>
                  <td className="table-cell-xs text-center">采购方</td>
                  <td className="table-cell-xs text-center">2011-08-08</td>
                  <td className="table-cell-xs text-center">3610万元人民币</td>
                  <td className="table-cell-xs text-center">北京市朝阳区</td>
                  <td className="table-cell-xs"><a href="#" className="text-primary">2026-07-11发生新增中标</a></td>
                </tr>
                <tr>
                  <td className="table-cell-xs">海南华磊建筑设计咨询有限公司</td>
                  <td className="table-cell-xs text-center">供应商</td>
                  <td className="table-cell-xs text-center">1995-06-19</td>
                  <td className="table-cell-xs text-center">1000万元人民币</td>
                  <td className="table-cell-xs text-center">海南海口市美兰区</td>
                  <td className="table-cell-xs"><a href="#" className="text-primary">2026-06-09发生新增中标</a></td>
                </tr>
                <tr>
                  <td className="table-cell-xs">福建广电网络集团股份有限公司</td>
                  <td className="table-cell-xs text-center">采购方</td>
                  <td className="table-cell-xs text-center">2011-12-28</td>
                  <td className="table-cell-xs text-center">39100万元人民币</td>
                  <td className="table-cell-xs text-center">福建福州市鼓楼区</td>
                  <td className="table-cell-xs"><a href="#" className="text-primary">2026-08-18发生新增供应商/项目</a></td>
                </tr>
                <tr>
                  <td className="table-cell-xs">厦门创匠信息科技股份有限公司</td>
                  <td className="table-cell-xs text-center">采购方</td>
                  <td className="table-cell-xs text-center">2016-02-19</td>
                  <td className="table-cell-xs text-center">1646.3412万元人民币</td>
                  <td className="table-cell-xs text-center">福建厦门市集美区</td>
                  <td className="table-cell-xs"><a href="#" className="text-primary">2026-04-24发生投资项目（公告）</a></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex justify-end items-center mt-2 gap-2 text-xs">
            <span className="text-gray-500">共 589 条 &nbsp; 5条/页</span>
            <button className="btn-default">&lt;</button>
            <button className="btn-yellow">1</button>
            <button className="btn-default">2</button>
            <button className="btn-default">3</button>
            <button className="btn-default">4</button>
            <span>…</span>
            <button className="btn-default">118</button>
            <button className="btn-default">&gt;</button>
            <span>前往 <input className="w-8 border border-borderLine rounded text-center h-6 mx-1" value="1" /> 页</span>
          </div>
        </div>

        {/* 共同知识产权 */}
        <div className="p-3">
          <div className="text-xs font-medium mb-2">共同知识产权 2</div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-grayBg">
                  <th className="table-cell-xs text-left">企业名称</th>
                  <th className="table-cell-xs text-center">类型</th>
                  <th className="table-cell-xs text-center">成立日期</th>
                  <th className="table-cell-xs text-center">注册资本</th>
                  <th className="table-cell-xs text-center">所在区域</th>
                  <th className="table-cell-xs text-left">最新商机</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="table-cell-xs">字节跳动（香港）有限公司</td>
                  <td className="table-cell-xs text-center">共同专利权人</td>
                  <td className="table-cell-xs text-center">-</td>
                  <td className="table-cell-xs text-center">-</td>
                  <td className="table-cell-xs text-center">-</td>
                  <td className="table-cell-xs">-</td>
                </tr>
                <tr>
                  <td className="table-cell-xs">抖音视界有限公司</td>
                  <td className="table-cell-xs text-center">共同申请人</td>
                  <td className="table-cell-xs text-center">2012-07-25</td>
                  <td className="table-cell-xs text-center">30000万美元</td>
                  <td className="table-cell-xs text-center">北京市石景山区</td>
                  <td className="table-cell-xs"><a href="#" className="text-primary">2026-05-22发生新增中标</a></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 集团营销 */}
      <div className="card-wrap mb-4">
        <div className="p-3 font-medium border-b border-borderLine">集团营销 <span className="text-xs font-normal text-gray-500">找到 249 条结果</span></div>
        <div className="px-3 py-2 border-b border-borderLine flex justify-between items-center">
          <div className="text-xs">所在集团: 抖音集团 &nbsp; 集团成员数: 330 &nbsp; 集团主体企业: 抖音有限公司</div>
          <a href="#" className="text-primary text-xs">北京全部民营集团 &gt;</a>
        </div>
        <div className="px-3 py-2 flex gap-2 border-b border-borderLine overflow-x-auto">
          <span className="btn-default whitespace-nowrap">企业筛选</span>
          <span className="btn-default whitespace-nowrap">集团筛选</span>
          <span className="btn-default whitespace-nowrap">经营状态</span>
          <span className="btn-default whitespace-nowrap">所在行业</span>
          <span className="btn-default whitespace-nowrap">总部地区</span>
          <span className="btn-default whitespace-nowrap">成员地区</span>
          <span className="btn-default whitespace-nowrap">注册资本</span>
          <span className="btn-default whitespace-nowrap">成立时间</span>
          <span className="badge-blue whitespace-nowrap">集团内级别</span>
          <span className="btn-default whitespace-nowrap">控股等级</span>
        </div>
        <div className="px-3 py-2 text-xs text-gray-500 border-b border-borderLine">已选 <a href="#" className="text-primary float-right">清空</a></div>
        <div className="p-3 border-b border-borderLine">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-grayBg">
                  <th className="table-cell-xs text-center w-8"><input type="checkbox" /></th>
                  <th className="table-cell-xs text-left">公司名称</th>
                  <th className="table-cell-xs text-center">经营状态</th>
                  <th className="table-cell-xs text-center">注册资本</th>
                  <th className="table-cell-xs text-center">成立时间</th>
                  <th className="table-cell-xs text-center">成员级别(实控人)</th>
                  <th className="table-cell-xs text-left">行业</th>
                  <th className="table-cell-xs text-center">地区</th>
                  <th className="table-cell-xs text-center">实控人控股比例</th>
                  <th className="table-cell-xs text-center">营业收入</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="table-cell-xs text-center"><input type="checkbox" /></td>
                  <td className="table-cell-xs">北京飞书科技有限公司</td>
                  <td className="table-cell-xs text-center"><span className="badge-green">存续</span></td>
                  <td className="table-cell-xs text-center">307,000万元人民币</td>
                  <td className="table-cell-xs text-center">2016-06-12</td>
                  <td className="table-cell-xs text-center">4级</td>
                  <td className="table-cell-xs">科技推广和应用服务业</td>
                  <td className="table-cell-xs text-center">北京海淀</td>
                  <td className="table-cell-xs text-center">49.41%</td>
                  <td className="table-cell-xs text-center">-</td>
                </tr>
                <tr>
                  <td className="table-cell-xs text-center"><input type="checkbox" /></td>
                  <td className="table-cell-xs">北京光惟之外科技有限公司</td>
                  <td className="table-cell-xs text-center"><span className="badge-green">存续</span></td>
                  <td className="table-cell-xs text-center">220,000万元人民币</td>
                  <td className="table-cell-xs text-center">2018-06-28</td>
                  <td className="table-cell-xs text-center">3级</td>
                  <td className="table-cell-xs">科技推广和应用服务业</td>
                  <td className="table-cell-xs text-center">北京海淀</td>
                  <td className="table-cell-xs text-center">49.41%</td>
                  <td className="table-cell-xs text-center">-</td>
                </tr>
                <tr>
                  <td className="table-cell-xs text-center"><input type="checkbox" /></td>
                  <td className="table-cell-xs">北京今日头条科技有限公司</td>
                  <td className="table-cell-xs text-center"><span className="badge-green">存续</span></td>
                  <td className="table-cell-xs text-center">151,000万元人民币</td>
                  <td className="table-cell-xs text-center">2016-03-16</td>
                  <td className="table-cell-xs text-center">4级</td>
                  <td className="table-cell-xs">科技推广和应用服务业</td>
                  <td className="table-cell-xs text-center">北京海淀</td>
                  <td className="table-cell-xs text-center">49.41%</td>
                  <td className="table-cell-xs text-center">-</td>
                </tr>
                <tr>
                  <td className="table-cell-xs text-center"><input type="checkbox" /></td>
                  <td className="table-cell-xs">北京火山引擎科技有限公司</td>
                  <td className="table-cell-xs text-center"><span className="badge-green">存续</span></td>
                  <td className="table-cell-xs text-center">100,000万元人民币</td>
                  <td className="table-cell-xs text-center">2020-05-11</td>
                  <td className="table-cell-xs text-center">4级</td>
                  <td className="table-cell-xs">科技推广和应用服务业</td>
                  <td className="table-cell-xs text-center">北京海淀</td>
                  <td className="table-cell-xs text-center">49.41%</td>
                  <td className="table-cell-xs text-center">-</td>
                </tr>
                <tr>
                  <td className="table-cell-xs text-center"><input type="checkbox" /></td>
                  <td className="table-cell-xs">深圳面包星辰科技有限公司</td>
                  <td className="table-cell-xs text-center"><span className="badge-green">存续</span></td>
                  <td className="table-cell-xs text-center">85,100万元人民币</td>
                  <td className="table-cell-xs text-center">2006-08-25</td>
                  <td className="table-cell-xs text-center">5级</td>
                  <td className="table-cell-xs">商务服务业</td>
                  <td className="table-cell-xs text-center">广东深圳南山</td>
                  <td className="table-cell-xs text-center">49.41%</td>
                  <td className="table-cell-xs text-center">84.03亿</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex justify-end items-center mt-2 gap-2 text-xs">
            <span className="text-gray-500">共 330 条 &nbsp; 5条/页</span>
            <button className="btn-default">&lt;</button>
            <button className="btn-yellow">1</button>
            <button className="btn-default">2</button>
            <button className="btn-default">3</button>
            <button className="btn-default">4</button>
            <span>…</span>
            <button className="btn-default">66</button>
            <button className="btn-default">&gt;</button>
            <span>前往 <input className="w-8 border border-borderLine rounded text-center h-6 mx-1" value="1" /> 页</span>
          </div>
        </div>

        {/* 集团营销商机列表 */}
        <div className="p-3">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-grayBg">
                  <th className="table-cell-xs text-center w-8"><input type="checkbox" /></th>
                  <th className="table-cell-xs text-left">企业名称</th>
                  <th className="table-cell-xs text-center">发生日期</th>
                  <th className="table-cell-xs text-center">商机类型</th>
                  <th className="table-cell-xs text-center">商机价值</th>
                  <th className="table-cell-xs text-left">商机内容</th>
                  <th className="table-cell-xs text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['北京火山引擎科技有限公司', '2026-08-19', 'AI智能研发助手项目采购（AI…', 106],
                  ['北京飞书科技有限公司', '2026-08-19', '2026年南网数字运营软件科技…', 60],
                  ['北京飞书科技有限公司', '2026-08-17', '青岛银行智能协同办公软件用…', 60],
                  ['上海格物致品网络科技有限公司', '2026-08-17', '抖音电商AI广告爆改大赛项目…', 6],
                  ['北京火山引擎科技有限公司', '2026-08-17', '2026年奥迪市场部—经销商直…', 106],
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="table-cell-xs text-center"><input type="checkbox" /></td>
                    <td className="table-cell-xs text-primary">{row[0]}</td>
                    <td className="table-cell-xs text-center">{row[1]}</td>
                    <td className="table-cell-xs text-center"><span className="badge-warn">新增中标</span></td>
                    <td className="table-cell-xs text-center"><Stars count={5} /></td>
                    <td className="table-cell-xs">2026-08-19中标了【{row[2]}<span className="text-primary">存款 授信</span></td>
                    <td className="table-cell-xs text-center"><a href="#" className="text-primary">公司商机 {row[3]}</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end items-center mt-2 gap-2 text-xs">
            <span className="text-gray-500">共 249 条 &nbsp; 5条/页</span>
            <button className="btn-default">&lt;</button>
            <button className="btn-yellow">1</button>
            <button className="btn-default">2</button>
            <button className="btn-default">3</button>
            <button className="btn-default">4</button>
            <span>…</span>
            <button className="btn-default">50</button>
            <button className="btn-default">&gt;</button>
            <span>前往 <input className="w-8 border border-borderLine rounded text-center h-6 mx-1" value="1" /> 页</span>
          </div>
        </div>
      </div>

      {/* 相似营销 */}
      <div className="card-wrap mb-4">
        <div className="p-3 font-medium border-b border-borderLine">相似营销 <span className="text-xs font-normal text-gray-500">找到 11 条结果</span></div>
        <div className="p-3 border-b border-borderLine">
          <div className="text-xs font-medium mb-2">资质认定 4</div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-grayBg">
                  <th className="table-cell-xs text-left">认证时间</th>
                  <th className="table-cell-xs text-left">资质类型</th>
                  <th className="table-cell-xs text-left">资质详情</th>
                  <th className="table-cell-xs text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="table-cell-xs">2026-07-17</td>
                  <td className="table-cell-xs">独角兽企业</td>
                  <td className="table-cell-xs">长城战略咨询重磅发布《GEI中国独角兽企业研究报告2026》！（含完整榜单）</td>
                  <td className="table-cell-xs text-center"><a href="#" className="text-primary">查看详情</a></td>
                </tr>
                <tr>
                  <td className="table-cell-xs">2025-07-18</td>
                  <td className="table-cell-xs">独角兽企业</td>
                  <td className="table-cell-xs">中国独角兽企业372家，总估值超1.2万亿美元——长城战略咨询发布《GEI中国独角兽企业研究报告2025》</td>
                  <td className="table-cell-xs text-center"><a href="#" className="text-primary">查看详情</a></td>
                </tr>
                <tr>
                  <td className="table-cell-xs">2024-06-17</td>
                  <td className="table-cell-xs">独角兽企业</td>
                  <td className="table-cell-xs">2023年度中国独角兽企业榜单</td>
                  <td className="table-cell-xs text-center"><a href="#" className="text-primary">查看详情</a></td>
                </tr>
                <tr>
                  <td className="table-cell-xs">2023-07-07</td>
                  <td className="table-cell-xs">独角兽企业</td>
                  <td className="table-cell-xs">2022年度中国独角兽企业</td>
                  <td className="table-cell-xs text-center"><a href="#" className="text-primary">查看详情</a></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="p-3">
          <div className="text-xs font-medium mb-2">上榜榜单 7</div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-grayBg">
                  <th className="table-cell-xs text-left">公布日期</th>
                  <th className="table-cell-xs text-left">认定单位</th>
                  <th className="table-cell-xs text-left">榜单详情</th>
                  <th className="table-cell-xs text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="table-cell-xs">2025-11-25</td>
                  <td className="table-cell-xs">广东中策知识产权研究院</td>
                  <td className="table-cell-xs">2025年度中国企业专利创新百强榜</td>
                  <td className="table-cell-xs text-center"><a href="#" className="text-primary">查看详情</a></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 位置营销 */}
      <div className="card-wrap">
        <div className="p-3 font-medium border-b border-borderLine">位置营销 <span className="text-xs font-normal text-gray-500">找到 20353 条结果</span></div>
        <div className="px-3 py-2 flex justify-between items-center border-b border-borderLine">
          <div className="text-xs">所在位置: 北京市海淀区北三环西路甲23号院1号楼3层327 &nbsp; 周边范围：1km</div>
          <a href="#" className="text-primary text-xs">查看完整周边企业 &gt;</a>
        </div>
        <div className="px-3 py-2 flex justify-between items-center border-b border-borderLine">
          <div><span className="font-medium text-xs">找到 20353 条相关结果</span> <a href="#" className="text-primary text-xs">最近中心距离</a></div>
          <div className="flex gap-2">
            <button className="btn-default">+ 关注</button>
            <button className="btn-default"><FaIcon name="download" /> 导出</button>
          </div>
        </div>
        <div className="p-3">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-grayBg">
                  <th className="table-cell-xs text-center w-8"><input type="checkbox" /></th>
                  <th className="table-cell-xs text-left">企业名称</th>
                  <th className="table-cell-xs text-left">法定代表人</th>
                  <th className="table-cell-xs text-center">成立时间</th>
                  <th className="table-cell-xs text-left">所在行业</th>
                  <th className="table-cell-xs text-center">注册资本</th>
                  <th className="table-cell-xs text-center">经营状态</th>
                  <th className="table-cell-xs text-center">启信分</th>
                  <th className="table-cell-xs text-center">企业规模</th>
                  <th className="table-cell-xs text-center">资质标签</th>
                  <th className="table-cell-xs text-center">企业类型</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['北京抖音信息服务有限公司', '银平', '2012-03-09', '互联网和相关服务', '20000 万人民币', '681', '大型企业、规模以上企业、规模以上服务业企业', '高新企业、科技型企业', '其他有限责任'],
                  ['抖音有限公司', '银平', '2016-05-04', '科技推广和应用服务业', '10000 万人民币', '650', '大型企业', '科技型企业', '其他有限责任'],
                  ['今日头条有限公司', '郝霞', '2016-08-24', '科技推广和应用服务业', '10000 万人民币', '658', '大型企业、规模以上企业、规模以上服务业企业', '-', '有限责任公司(资)'],
                  ['北京闪星科技有限公司', '胡帅', '2014-12-09', '科技推广和应用服务业', '1000 万人民币', '627', '小微企业', '-', '有限责任公司(资)'],
                  ['北京今日头条科技有限公司', '黄煜', '2016-03-16', '科技推广和应用服务业', '151000 万人民币', '639', '中型企业、规模以上企业、规模以上服务业企业', '-', '有限责任公司(资)'],
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="table-cell-xs text-center"><input type="checkbox" /></td>
                    <td className="table-cell-xs">{row[0]}</td>
                    <td className="table-cell-xs">{row[1]}</td>
                    <td className="table-cell-xs text-center">{row[2]}</td>
                    <td className="table-cell-xs">{row[3]}</td>
                    <td className="table-cell-xs text-center">{row[4]}</td>
                    <td className="table-cell-xs text-center">存续（在营、开业、在册）</td>
                    <td className="table-cell-xs text-center">{row[5]}</td>
                    <td className="table-cell-xs text-center">{row[6]}</td>
                    <td className="table-cell-xs text-center">{row[7]}</td>
                    <td className="table-cell-xs text-center">{row[8]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end items-center mt-2 gap-2 text-xs">
            <span className="text-gray-500">共 20353 条 &nbsp; 5条/页</span>
            <button className="btn-default">&lt;</button>
            <button className="btn-yellow">1</button>
            <button className="btn-default">2</button>
            <button className="btn-default">3</button>
            <button className="btn-default">4</button>
            <span>…</span>
            <button className="btn-default">4071</button>
            <button className="btn-default">&gt;</button>
            <span>前往 <input className="w-8 border border-borderLine rounded text-center h-6 mx-1" value="1" /> 页</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Tab2 风险动态 ---------- */
function RiskTab() {
  const rows = [
    ['2026-08-17', '开庭公告', '身份: 其他 相关企业/人: 案由: 产品责任纠纷 开庭日期: 2026-08-17 是否历史: 否', '非劳务纠纷'],
    ['2026-08-17', '开庭公告', '身份: 被告 相关企业/人: 案由: 买卖合同纠纷 开庭日期: 2026-08-21 是否历史: 否', '非劳务纠纷'],
    ['2026-08-17', '开庭公告', '身份: 被告 相关企业/人: 案由: 买卖合同纠纷 开庭日期: 2026-09-09 是否历史: 否', '非劳务纠纷'],
    ['2026-08-17', '开庭公告', '身份: 被告 相关企业/人: 案由: 产品责任纠纷 开庭日期: 2026-09-15 是否历史: 否', '非劳务纠纷'],
    ['2026-08-17', '开庭公告', '身份: 被告 相关企业/人: 案由: 产品责任纠纷 开庭日期: 2026-09-20 是否历史: 否', '非劳务纠纷'],
    ['2026-08-17', '开庭公告', '身份: 被告 相关企业/人: 案由: 产品责任纠纷 开庭日期: 2026-09-21 是否历史: 否', '非劳务纠纷'],
    ['2026-08-17', '开庭公告', '身份: 被告 相关企业/人: 案由: 买卖合同纠纷 开庭日期: 2026-09-08 是否历史: 否', '非劳务纠纷'],
    ['2026-08-13', '开庭公告', '身份: 其他 相关企业/人: 案由: 其他案由 开庭日期: 2026-08-13 是否历史: 否', '非劳务纠纷'],
    ['2026-08-11', '法院公告', '当事人: 涿州众投钱庄商贸馆 公告类型: 起诉状副本、上诉状副本 发布日期: 2026-08-11 是...', ''],
    ['2026-07-28', '法院公告', '当事人: 石狮市郑侠服装商行 公告类型: 起诉状副本及开庭传票 发布日期: 2026-07-28 是否...', ''],
  ]
  return (
    <div className="card-wrap">
      <div className="px-3 py-2 flex gap-3 border-b border-borderLine overflow-x-auto">
        <span className="btn-default whitespace-nowrap">风险筛选</span>
        <span className="btn-default whitespace-nowrap">部门人员</span>
        <span className="btn-default whitespace-nowrap">选择标签</span>
        <span className="btn-default whitespace-nowrap">企业分组</span>
        <span className="btn-default whitespace-nowrap">风险等级</span>
        <span className="btn-default whitespace-nowrap">风险维度</span>
        <span className="btn-default whitespace-nowrap">阅读状态</span>
        <span className="btn-default whitespace-nowrap">拜访记录</span>
        <button className="btn-default ml-auto">设置风险等级</button>
      </div>
      <div className="px-3 py-2 flex justify-between items-center border-b border-borderLine text-xs">
        <div>当前共计 <span className="font-medium">95</span> 条动态 &nbsp; 警告 0 &nbsp; <span className="badge-blue">关注 95</span> &nbsp; 提示 0 &nbsp; 不启用 0</div>
        <div className="flex items-center gap-2">
          <span>视图: <FaIcon name="th-large" /> <FaIcon name="list" /></span>
          <input className="border border-borderLine rounded px-2 py-1 w-40 text-xs" value="抖音有限公司" />
        </div>
      </div>
      <div className="p-3">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-grayBg">
                <th className="table-cell-xs text-left">发生时间</th>
                <th className="table-cell-xs text-center">风险等级</th>
                <th className="table-cell-xs text-left">企业名称</th>
                <th className="table-cell-xs text-center">标签</th>
                <th className="table-cell-xs text-center">风险类型</th>
                <th className="table-cell-xs text-left">内容概览</th>
                <th className="table-cell-xs text-center">客户归属</th>
                <th className="table-cell-xs text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td className="table-cell-xs">{row[0]}</td>
                  <td className="table-cell-xs text-center"><span className="badge-blue">关注</span></td>
                  <td className="table-cell-xs">抖音有限公司</td>
                  <td className="table-cell-xs text-center">-</td>
                  <td className="table-cell-xs text-center">{row[1]}</td>
                  <td className="table-cell-xs">{row[2]} {row[3] && <span className="badge-warn">{row[3]}</span>}</td>
                  <td className="table-cell-xs text-center">广州粤信科技有限公司 191560</td>
                  <td className="table-cell-xs text-center"><a href="#" className="text-primary">跟踪记录</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function ComprehensiveModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState(0)
  return (
    <ModalShell title="企业详情 - 存客商机 & 风险动态" onClose={onClose}>
      <style>{CSS}</style>
      <div className="bg-white text-sm font-sans" style={{ fontSize: 14 }}>
        <div className="p-4">
          {/* 头部企业信息 */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary text-white flex items-center justify-center rounded">抖</div>
              <div>
                <span className="font-medium text-base">抖音有限公司</span>
                <span className="badge-green ml-1">存续（在营、开业、在册）</span>
                <div className="text-xs text-gray-500 mt-1">法人：银平 他有 4 家企业 &gt; &nbsp;注册资本：10000万元人民币 &nbsp;成立时间：2016-05-04</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-default">查看工商详情</button>
              <button className="btn-yellow">下载商机/风险信息</button>
            </div>
          </div>

          {/* Tab 切换 */}
          <div className="flex border-b border-borderLine mb-4">
            <div className={`tab-header ${tab === 0 ? 'tab-header-active' : ''}`} onClick={() => setTab(0)}>存客商机</div>
            <div className={`tab-header ${tab === 1 ? 'tab-header-active' : ''}`} onClick={() => setTab(1)}>风险动态</div>
          </div>

          {tab === 0 ? <CustomerTab /> : <RiskTab />}
        </div>
      </div>
    </ModalShell>
  )
}
