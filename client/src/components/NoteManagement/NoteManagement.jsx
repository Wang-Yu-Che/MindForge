import React, { useState } from 'react';
import { Table, Input, Button, Space, Message, Tag } from '@arco-design/web-react';
import { IconSearch, IconDelete, IconEdit, IconEye } from '@arco-design/web-react/icon';

const NoteManagement = () => {
  const [loading,] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: '示例笔记1',
      author: '测试用户1',
      status: '已发布',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-02',
    },
    {
      id: 2,
      title: '示例笔记2',
      author: '测试用户2',
      status: '草稿',
      createdAt: '2023-01-03',
      updatedAt: '2023-01-04',
    },
  ]);

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: '作者',
      dataIndex: 'author',
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={status === '已发布' ? 'green' : 'gray'}>{status}</Tag>
      ),
      filters: [
        { text: '已发布', value: '已发布' },
        { text: '草稿', value: '草稿' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
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
    const filteredNotes = notes.filter(note =>
      note.title.toLowerCase().includes(searchText.toLowerCase()) ||
      note.author.toLowerCase().includes(searchText.toLowerCase())
    );
    setNotes(filteredNotes);
  };

  const handleView = (record) => {
    Message.info(`查看笔记: ${record.title}`);
  };

  const handleEdit = (record) => {
    Message.info(`编辑笔记: ${record.title}`);
  };

  const handleDelete = (record) => {
    Message.info(`删除笔记: ${record.title}`);
  };

  return (
    <div className="note-management-container">
      <div className="note-management-header">
        <Space>
          <Input
            allowClear
            placeholder="搜索笔记标题或作者"
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
        data={notes}
        rowKey="id"
        border={false}
        pagination={{
          total: notes.length,
          pageSize: 10,
          showTotal: true,
        }}
      />
    </div>
  );
};

export default NoteManagement;