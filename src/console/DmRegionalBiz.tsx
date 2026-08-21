import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';

// 行政区下拉选项，后续可扩展全国省份
const regionOptions = [
  { label: '北京市', value: 'beijing' },
];

export default function DmRegionalBiz() {
  // 选中行政区
  const [selectedRegion, setSelectedRegion] = useState<string>('beijing');

  // echarts dom ref
  const barRef = useRef<HTMLDivElement>(null);
  const horizontalBarRef = useRef<HTMLDivElement>(null);

  // 柱状图：商机最多地区
  useEffect(() => {
    let chartInstance: echarts.ECharts | null = null;

    if (barRef.current) {
      chartInstance = echarts.init(barRef.current);
      chartInstance.setOption({
        xAxis: {
          type: 'category',
          data: ['海淀区', '朝阳区', '丰台区', '大兴区', '通州区'],
        },
        yAxis: {
          type: 'value',
          max: 50000,
        },
        tooltip: { trigger: 'axis' },
        series: [
          {
            type: 'bar',
            data: [47124, 26010, 24548, 23616, 18694],
            itemStyle: { color: '#8b5cf6' },
          },
        ],
      });

      const handleResize = () => chartInstance?.resize();
      window.addEventListener('resize', handleResize);

      return () => {
        chartInstance?.dispose();
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  // 横向条形图：企业画像
  useEffect(() => {
    let chartInstance: echarts.ECharts | null = null;

    if (horizontalBarRef.current) {
      chartInstance = echarts.init(horizontalBarRef.current);
      chartInstance.setOption({
        tooltip: {},
        grid: { left: 80 },
        xAxis: { type: 'value' },
        yAxis: {
          type: 'category',
          data: ['民营', '小微企业', '科技企业', '国企', '事业单位', '上市公司'],
        },
        series: [
          {
            type: 'bar',
            data: [
              { value: 36, label: { formatter: '128,896家 36%' } },
              { value: 23, label: { formatter: '83,629家 23%' } },
              { value: 18, label: { formatter: '64,475家 18%' } },
              { value: 16, label: { formatter: '59,164家 16%' } },
              { value: 5, label: { formatter: '16,710家 5%' } },
              { value: 2, label: { formatter: '6,127家 2%' } },
            ],
            itemStyle: { color: '#6096ff' },
            label: { show: true, position: 'right' },
          },
        ],
      });

      const handleResize = () => chartInstance?.resize();
      window.addEventListener('resize', handleResize);

      return () => {
        chartInstance?.dispose();
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  return (
    <div className="p-4 font-sans text-[14px] text-[#333] bg-white">
      {/* ========== 顶部：行政区下拉 + 页面主标题【区域商机】 ========== */}
      <div className="flex items-center gap-3 mb-4">
        <select
          className="border border-gray-300 rounded px-2 py-1"
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
        >
          {regionOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <h2 className="text-lg font-semibold">区域商机</h2>
      </div>

      {/* 顶部文本摘要区域 */}
      <div className="mb-4">
        <p className="text-base">
          北京有商机的企业
          <span className="text-[#0066cc]">1,013,478</span>
          家；有效商机
          <span className="text-[#0066cc]">7,376,451</span>
          条
        </p>
        <p className="text-sm mt-1">北京有商机企业占本市全部在营企业的41.1%；商机数占全国商机数的3.2%</p>
        <div className="border-b border-dashed border-[#b8d8ff] my-2"></div>
        <p className="text-sm mt-2">
          • 全国近三年商机数：230,736,322；近一年商机数：118,709,353；其中大型企业135,648家、中型企业269,696家、小微企业26,925,206家、规模以上企业1,447,344家
        </p>
        <p className="text-sm mt-1">
          • 全国商机分布TOP10的地区：1 广东省 13.1%、2 山东省 7.2%、3 江苏省 6.3%、4 新疆维吾尔自治区 5.5%、5 浙江省 5.2%、6 湖北省 5.0%、7 湖南省 4.6%、8 四川省 4.4%、9 安徽省 3.8%、10 重庆市 3.6%
        </p>
        <p className="text-sm mt-1">• 全国有商机企业画像：入园区企业30.4%、上产业链企业38.6%、入选科创企业库企业4.6%</p>
      </div>

      {/* 筛选时间栏 */}
      <div className="flex justify-between items-center mb-3">
        <div></div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 cursor-pointer">今日</span>
          <span className="px-2 py-1 cursor-pointer">昨日</span>
          <span className="px-2 py-1 cursor-pointer">最近7天</span>
          <span className="px-2 py-1 cursor-pointer bg-[#e8f0fe] text-[#0066cc] font-medium">最近30天</span>
          <input type="text" placeholder="开始日期" className="border border-gray-300 px-2 py-1 rounded" />
          <span>-</span>
          <input type="text" placeholder="结束日期" className="border border-gray-300 px-2 py-1 rounded" />
        </div>
      </div>

      {/* 主体布局：左侧【北京地图占位控件】 + 右侧区域商机表格 */}
      <div className="grid grid-cols-12 gap-4">
        {/* 左侧地图占位容器，预留ref，后续接入GeoJSON直接复用 */}
        <div className="col-span-5">
          <div
            style={{
              width: '100%',
              height: '400px',
              border: '1px solid #eee',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
              fontSize: '16px',
              background: '#fafafa',
            }}
          >
            北京地图
          </div>
        </div>

        {/* 右侧区域商机统计表 */}
        <div className="col-span-7">
          <div className="font-medium mb-2">|区域商机统计</div>
          <div className="overflow-x-auto"><table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-200 bg-gray-50 px-2 py-1 text-center">北京</th>
                <th className="border border-gray-200 bg-gray-50 px-2 py-1 text-center">全部商机</th>
                <th className="border border-gray-200 bg-gray-50 px-2 py-1 text-center">国企</th>
                <th className="border border-gray-200 bg-gray-50 px-2 py-1 text-center">事业单位</th>
                <th className="border border-gray-200 bg-gray-50 px-2 py-1 text-center">民营</th>
                <th className="border border-gray-200 bg-gray-50 px-2 py-1 text-center">上市公司</th>
                <th className="border border-gray-200 bg-gray-50 px-2 py-1 text-center">科技企业</th>
                <th className="border border-gray-200 bg-gray-50 px-2 py-1 text-center">小微企业</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 px-2 py-1 text-center">海淀区</td>
                <td className="border border-gray-200 px-2 py-1 text-center">47,124条</td>
                <td className="border border-gray-200 px-2 py-1 text-center">13,639条</td>
                <td className="border border-gray-200 px-2 py-1 text-center">6,185条</td>
                <td className="border border-gray-200 px-2 py-1 text-center">24,355条</td>
                <td className="border border-gray-200 px-2 py-1 text-center">2,135条</td>
                <td className="border border-gray-200 px-2 py-1 text-center">21,983条</td>
                <td className="border border-gray-200 px-2 py-1 text-center">14,273条</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-2 py-1 text-center">朝阳区</td>
                <td className="border border-gray-200 px-2 py-1 text-center">26,010条</td>
                <td className="border border-gray-200 px-2 py-1 text-center">6,015条</td>
                <td className="border border-gray-200 px-2 py-1 text-center">2,770条</td>
                <td className="border border-gray-200 px-2 py-1 text-center">13,353条</td>
                <td className="border border-gray-200 px-2 py-1 text-center">563条</td>
                <td className="border border-gray-200 px-2 py-1 text-center">5,696条</td>
                <td className="border border-gray-200 px-2 py-1 text-center">9,880条</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-2 py-1 text-center">丰台区</td>
                <td className="border border-gray-200 px-2 py-1 text-center">24,548条</td>
                <td className="border border-gray-200 px-2 py-1 text-center">8,477条</td>
                <td className="border border-gray-200 px-2 py-1 text-center">588条</td>
                <td className="border border-gray-200 px-2 py-1 text-center">13,706条</td>
                <td className="border border-gray-200 px-2 py-1 text-center">990条</td>
                <td className="border border-gray-200 px-2 py-1 text-center">6,785条</td>
                <td className="border border-gray-200 px-2 py-1 text-center">8,896条</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-2 py-1 text-center">大兴区</td>
                <td className="border border-gray-200 px-2 py-1 text-center">23,616条</td>
                <td className="border border-gray-200 px-2 py-1 text-center">5,009条</td>
                <td className="border border-gray-200 px-2 py-1 text-center">506条</td>
                <td className="border border-gray-200 px-2 py-1 text-center">15,757条</td>
                <td className="border border-gray-200 px-2 py-1 text-center">158条</td>
                <td className="border border-gray-200 px-2 py-1 text-center">6,294条</td>
                <td className="border border-gray-200 px-2 py-1 text-center">8,020条</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-2 py-1 text-center">通州区</td>
                <td className="border border-gray-200 px-2 py-1 text-center">18,694条</td>
                <td className="border border-gray-200 px-2 py-1 text-center">1,852条</td>
                <td className="border border-gray-200 px-2 py-1 text-center">678条</td>
                <td className="border border-gray-200 px-2 py-1 text-center">13,301条</td>
                <td className="border border-gray-200 px-2 py-1 text-center">96条</td>
                <td className="border border-gray-200 px-2 py-1 text-center">2,990条</td>
                <td className="border border-gray-200 px-2 py-1 text-center">7,769条</td>
              </tr>
            </tbody>
          </table></div>
          {/* 分页 */}
          <div className="flex justify-end items-center mt-2 gap-1">
            <span className="text-sm">共 16 条</span>
            <button className="border border-gray-300 px-2 py-1">&lt;</button>
            <button className="border border-gray-300 bg-[#0066cc] text-white px-2 py-1">1</button>
            <button className="border border-gray-300 px-2 py-1">2</button>
            <button className="border border-gray-300 px-2 py-1">3</button>
            <button className="border border-gray-300 px-2 py-1">4</button>
            <button className="border border-gray-300 px-2 py-1">&gt;</button>
          </div>
        </div>
      </div>

      {/* 底部两行图表 */}
      <div className="grid grid-cols-12 gap-4 mt-4">
        <div className="col-span-6">
          <div className="font-medium mb-2">|商机最多的地区</div>
          <div ref={barRef} style={{ width: '100%', height: '300px' }}></div>
        </div>
        <div className="col-span-6">
          <div className="font-medium mb-2">|有商机的企业画像</div>
          <div ref={horizontalBarRef} style={{ width: '100%', height: '300px' }}></div>
        </div>
      </div>
    </div>
  );
}
