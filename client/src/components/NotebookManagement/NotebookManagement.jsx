import React, { useState } from 'react';
import { Table, Input, Button, Space, Message, Tag } from '@arco-design/web-react';
import { IconSearch, IconDelete, IconEdit, IconEye } from '@arco-design/web-react/icon';

const NotebookManagement = () => {
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [notebooks, setNotebooks] = useState([
    {
      id: 1,
      title: '示例笔记本1',
      user_id: 1,
      source_count: 5,
      created_at: '2023-01-01',
      role: '所有者',
      slug: 'notebook-1'
    },
    {
      id: 2,
      title: '示例笔记本2',
      user_id: 2,
      source_count: 3,
      created_at: '2023-01-02',
      role: '编辑者',
      slug: 'notebook-2'
    },
  ]);

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: '用户ID',
      dataIndex: 'user_id',
    },
    {
      title: '来源数量',
      dataIndex: 'source_count',
      render: (count) => (
        <Tag color="blue">{count} 个来源</Tag>
      ),
      sorter: (a, b) => a.source_count - b.source_count,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: '角色',
      dataIndex: 'role',
      filters: [
        { text: '所有者', value: '所有者' },
        { text: '编辑者', value: '编辑者' },
        { text: '查看者', value: '查看者' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<IconEye />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          <Button
            type="text"
            icon={<IconEdit />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="text"
            status="danger"
            icon={<IconDelete />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleSearch = () => {
    const filteredNotebooks = notebooks.filter(notebook =>
      notebook.title.toLowerCase().includes(searchText.toLowerCase()) ||
      notebook.user_id.toString().includes(searchText.toLowerCase())
    );
    setNotebooks(filteredNotebooks);
  };

  const handleView = (record) => {
    Message.info(`查看笔记本: ${record.title}`);
  };

  const handleEdit = (record) => {
    Message.info(`编辑笔记本: ${record.title}`);
  };

  const handleDelete = (record) => {
    Message.info(`删除笔记本: ${record.title}`);
  };

  return (
    <div className="notebook-management-container">
      <div className="notebook-management-header">
        <Space>
          <Input
            allowClear
            placeholder="搜索笔记本标题或用户ID"
            value={searchText}
            onChange={setSearchText}
            style={{ width: 300 }}
          />
          <Button type="primary" icon={<IconSearch />} onClick={handleSearch}>
            搜索
          </Button>
        </Space>
      </div>

      <Table
        loading={loading}
        columns={columns}
        data={notebooks}
        rowKey="id"
        border={false}
        pagination={{
          total: notebooks.length,
          pageSize: 10,
          showTotal: true,
        }}
      />
    </div>
  );
};

export default NotebookManagement;