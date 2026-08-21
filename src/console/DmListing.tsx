import React, { useState } from 'react';
import { Tabs, Input, Button, Select, Table, Space, Dropdown, Menu } from 'antd';
import type { TableProps, TabsProps } from 'antd';

// ============ 类型定义 ============
interface TableRecord {
  id: string;
  publishDate: string;
  companyName: string;
  currentStatus: string;
  belongField: string;
  targetMarket: string;
  sponsorOrg: string;
}

interface FilterConfig {
  marketOptions: string[];
  statusOptions: string[];
}

// ============ Mock数据 ============
const mockIpoList: TableRecord[] = [
  {
    id: '1',
    publishDate: '2026-06-11',
    companyName: '天津富士达自行车工业股份有限公司',
    currentStatus: '收到注册申请材料',
    belongField: '-',
    targetMarket: '上海证券交易所',
    sponsorOrg: '中泰证券股份有限公司',
  },
  {
    id: '2',
    publishDate: '2026-05-21',
    companyName: '江苏展芯半导体技术股份有限公司',
    currentStatus: '收到注册申请材料',
    belongField: '-',
    targetMarket: '深圳证券交易所(创业板)',
    sponsorOrg: '华泰联合证券有限责任公司',
  },
  {
    id: '3',
    publishDate: '2026-05-14',
    companyName: '深圳嘉立创科技集团股份有限公司',
    currentStatus: '收到注册申请材料',
    belongField: '-',
    targetMarket: '深圳证券交易所',
    sponsorOrg: '国泰海通证券股份有限公司',
  },
  {
    id: '4',
    publishDate: '2026-05-07',
    companyName: '華潤新能源控股有限公司',
    currentStatus: '收到注册申请材料',
    belongField: '-',
    targetMarket: '深圳证券交易所',
    sponsorOrg: '中国国际金融股份有限公司',
  },
];

const mockSciBoardList: TableRecord[] = [
  {
    id: '1',
    publishDate: '2026-08-19',
    companyName: '广东钶锐锶数控技术股份有限公司',
    currentStatus: '提交注册',
    belongField: '通用设备制造业',
    targetMarket: '上海证券交易所（科创板）',
    sponsorOrg: '国泰海通证券股份有限公司',
  },
  {
    id: '2',
    publishDate: '2026-08-13',
    companyName: '加特兰微电子科技（上海）股份有限公司',
    currentStatus: '已受理',
    belongField: '计算机、通信和其他电子设备制造业',
    targetMarket: '上海证券交易所（科创板）',
    sponsorOrg: '中国国际金融股份有限公司',
  },
  {
    id: '3',
    publishDate: '2026-08-12',
    companyName: '西安新通药物研究股份有限公司',
    currentStatus: '已问询',
    belongField: '医药制造业',
    targetMarket: '上海证券交易所（科创板）',
    sponsorOrg: '中信证券股份有限公司',
  },
  {
    id: '4',
    publishDate: '2026-08-10',
    companyName: '山西阳光焦化集团股份有限公司',
    currentStatus: '终止',
    belongField: '石油、煤炭及其他燃料加工业',
    targetMarket: '上海证券交易所（科创板）',
    sponsorOrg: '中信证券股份有限公司',
  },
];

// 双Tab筛选配置，严格对齐截图
const tabFilterMap: Record<string, FilterConfig> = {
  ipo: {
    marketOptions: ['全部', '深圳证券交易所(创业板)', '上海证券交易所', '深圳证券交易所', '全国股份转让系统'],
    statusOptions: ['全部', '已通过发审会', '进一步问询', '预披露更新', '收到注册申请材料', '反馈意见回复审查', '已反馈', '中止审查', '已受理', '落实反馈'],
  },
  sciBoard: {
    marketOptions: ['上海证券交易所（科创板）'],
    statusOptions: ['全部', '已受理', '已问询', '上市委会议通过', '上市委会议未通过', '提交注册', '注册生效', '不予注册', '已发行', '中止', '终止'],
  },
};

// 更多筛选下拉菜单
const moreFilterMenu = (
  <Menu>
    <Menu.Item key="region">地区</Menu.Item>
    <Menu.Item key="publishDate">披露日期</Menu.Item>
  </Menu>
);

const IpoBoardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ipo' | 'sciBoard'>('ipo');
  const [searchText, setSearchText] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('全部');
  const [selectedStatus, setSelectedStatus] = useState('全部');

  // 获取当前Tab筛选配置和表格数据
  const currentFilter = tabFilterMap[activeTab];
  const tableData = activeTab === 'ipo' ? mockIpoList : mockSciBoardList;

  // 表格列定义
  const tableColumns: TableProps<TableRecord>['columns'] = [
    { title: '披露日期', dataIndex: 'publishDate', key: 'publishDate' },
    { title: '企业名称', dataIndex: 'companyName', key: 'companyName' },
    { title: '当前状态', dataIndex: 'currentStatus', key: 'currentStatus' },
    { title: '所属领域', dataIndex: 'belongField', key: 'belongField' },
    { title: '拟发行市场', dataIndex: 'targetMarket', key: 'targetMarket' },
    { title: '保荐机构', dataIndex: 'sponsorOrg', key: 'sponsorOrg' },
  ];

  const tabItems: TabsProps['items'] = [
    { key: 'ipo', label: 'IPO' },
    { key: 'sciBoard', label: '科创板' },
  ];

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: '100vh' }}>
      <Tabs
        activeKey={activeTab}
        items={tabItems}
        onChange={(key) => {
          setActiveTab(key as 'ipo' | 'sciBoard');
          // 切换Tab重置筛选条件
          setSelectedMarket('全部');
          setSelectedStatus('全部');
          setSearchText('');
        }}
      />

      {/* 搜索区域 */}
      <div style={{ marginBottom: 16 }}>
        <Space size="middle" align="middle">
          <span>高级搜索</span>
          <Input
            placeholder="请输入企业名称"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 320 }}
          />
          <Button type="primary">搜索</Button>
        </Space>
      </div>

      {/* 发行市场筛选 */}
      <div style={{ marginBottom: 16 }}>
        <Space size="middle" align="middle">
          <span>发行市场</span>
          {currentFilter.marketOptions.map((item) => (
            <Button
              key={item}
              type={selectedMarket === item ? 'primary' : 'default'}
              onClick={() => setSelectedMarket(item)}
            >
              {item}
            </Button>
          ))}
        </Space>
      </div>

      {/* 最新状态筛选 */}
      <div style={{ marginBottom: 16 }}>
        <Space size="middle" align="middle">
          <span>最新状态</span>
          {currentFilter.statusOptions.map((item) => (
            <Button
              key={item}
              type={selectedStatus === item ? 'primary' : 'default'}
              onClick={() => setSelectedStatus(item)}
            >
              {item}
            </Button>
          ))}
          <Dropdown overlay={moreFilterMenu} trigger={['click']}>
            <Button type="link">更多 ∨</Button>
          </Dropdown>
        </Space>
      </div>

      {/* 更多筛选行 */}
      <div style={{ marginBottom: 16 }}>
        <Space size="middle" align="middle">
          <span>更多筛选</span>
          <Dropdown overlay={moreFilterMenu} trigger={['click']}>
            <Button type="link">地区 ∨</Button>
          </Dropdown>
          <Dropdown overlay={moreFilterMenu} trigger={['click']}>
            <Button type="link">披露日期 ∨</Button>
          </Dropdown>
        </Space>
      </div>

      {/* 表格 */}
      <Table<TableRecord>
        rowKey="id"
        columns={tableColumns}
        dataSource={tableData}
        pagination={{ showSizeChanger: true }}
      />
    </div>
  );
};

export default IpoBoardPage;