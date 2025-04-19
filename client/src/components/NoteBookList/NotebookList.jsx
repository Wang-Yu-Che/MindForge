import './NotebookList.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Dropdown,
  Menu,
  Message,
  Space,
  Typography,
  Select,
  Card
} from '@arco-design/web-react';
import {
  IconPlus,
  IconMore,
  IconDelete,
  IconEdit,
  IconList,
  IconApps
} from '@arco-design/web-react/icon';

const { Title } = Typography;

const NoteBookList = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('table'); // table 或 card

  const handleCreateClick = () => {
    navigate('/demo-notebook', { state: { showUploadModal: true } });
  };

  const data = [
    {
      key: '1',
      title: '无标题笔记本',
      source: '0 个来源',
      date: '2025年4月17日',
      role: '所有者',
    },
    {
      key: '2',
      title: '无标题笔记本',
      source: '0 个来源',
      date: '2025年4月17日',
      role: '所有者',
    },
    {
      key: '3',
      title: '无标题笔记本',
      source: '0 个来源',
      date: '2025年4月17日',
      role: '所有者',
    },
    {
        key: '4',
        title: '无标题笔记本',
        source: '0 个来源',
        date: '2025年4月17日',
        role: '所有者',
      },
      {
        key: '5',
        title: '无标题笔记本',
        source: '0 个来源',
        date: '2025年4月17日',
        role: '所有者',
      },
      {
        key: '6',
        title: '无标题笔记本',
        source: '0 个来源',
        date: '2025年4月17日',
        role: '所有者',
      },
      {
        key: '7',
        title: '无标题笔记本',
        source: '0 个来源',
        date: '2025年4月17日',
        role: '所有者',
      },
  ];

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      render: (col) => (
        <Space>
          <IconApps style={{ color: '#6E6E6E' }} />
          <span>{col}</span>
        </Space>
      ),
    },
    { title: '来源', dataIndex: 'source' },
    { title: '创建', dataIndex: 'date' },
    { title: '角色', dataIndex: 'role' },
    {
      title: '',
      dataIndex: 'operations',
      render: (_, record) => (
        <Dropdown
          droplist={
            <Menu>
              <Menu.Item key="edit" onClick={() => Message.info(`编辑：${record.title}`)}>
                <IconEdit /> 编辑标题
              </Menu.Item>
              <Menu.Item key="delete" onClick={() => Message.info(`删除：${record.title}`)}>
                <IconDelete /> 删除
              </Menu.Item>
            </Menu>
          }
          trigger="click"
        >
          <Button type="text" icon={<IconMore />} />
        </Dropdown>
      ),
    },
  ];

  const renderCardList = () => (
    <div className="notebook-card-list">
      {data.map((item) => (
        <Card key={item.key} className="notebook-card" hoverable>
          <div className="notebook-card-header">
            <img
              src="https://www.gstatic.com/lamda/images/ic_notebook_color_48dp.png"
              alt="icon"
              className="notebook-icon"
            />
            <Dropdown
              trigger="click"
              droplist={
                <Menu>
                  <Menu.Item key="edit" onClick={() => Message.info(`编辑：${item.title}`)}>
                    <IconEdit /> 编辑标题
                  </Menu.Item>
                  <Menu.Item key="delete" onClick={() => Message.info(`删除：${item.title}`)}>
                    <IconDelete /> 删除
                  </Menu.Item>
                </Menu>
              }
            >
              <Button type="text" icon={<IconMore />} />
            </Dropdown>
          </div>
          <div className="notebook-card-title">{item.title}</div>
          <div className="notebook-card-sub">
            {item.date} · {item.source}
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="notebook-list-layout">
      <div className="notebook-list-container">
        <Title heading={3}>
          <span style={{ color: '#4285F4' }}>欢迎来到 </span>
          <span style={{ color: '#34A853' }}>MindForge</span>
        </Title>

        <Title heading={5}>我的笔记本</Title>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 16,
          marginTop: 24
        }}>
          <Button icon={<IconPlus />} type="primary" shape="round" onClick={handleCreateClick}>
            创建新的
          </Button>

          <Space>
            <Button
              type={viewMode === 'card' ? 'primary' : 'outline'}
              icon={<IconApps />}
              onClick={() => setViewMode('card')}
            />
            <Button
              type={viewMode === 'table' ? 'primary' : 'outline'}
              icon={<IconList />}
              onClick={() => setViewMode('table')}
            />
            <Select defaultValue="最近的" style={{ width: 100 }}>
              <Select.Option value="recent">最近的</Select.Option>
              <Select.Option value="title">标题</Select.Option>
            </Select>
          </Space>
        </div>

        {viewMode === 'table' ? (
          <Table columns={columns} data={data} pagination={false} />
        ) : (
          renderCardList()
        )}
      </div>
    </div>
  );
};

export default NoteBookList;
