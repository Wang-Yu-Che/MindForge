import React, { useState } from 'react';
import { Table, Input, Button, Space, Message, Tag } from '@arco-design/web-react';
import { IconSearch, IconDelete, IconEdit, IconDownload } from '@arco-design/web-react/icon';

const ResourceManagement = () => {
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [resources, setResources] = useState([
    {
      id: 1,
      name: '示例资源1.pdf',
      type: 'PDF',
      size: '2.5MB',
      uploadedBy: '测试用户1',
      uploadedAt: '2023-01-01',
    },
    {
      id: 2,
      name: '示例资源2.docx',
      type: 'Word',
      size: '1.8MB',
      uploadedBy: '测试用户2',
      uploadedAt: '2023-01-02',
    },
  ]);

  const columns = [
    {
      title: '资源名称',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: '类型',
      dataIndex: 'type',
      render: (type) => (
        <Tag color="blue">{type}</Tag>
      ),
      filters: [
        { text: 'PDF', value: 'PDF' },
        { text: 'Word', value: 'Word' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: '大小',
      dataIndex: 'size',
    },
    {
      title: '上传者',
      dataIndex: 'uploadedBy',
    },
    {
      title: '上传时间',
      dataIndex: 'uploadedAt',
      sorter: (a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt),
    },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<IconDownload />}
            onClick={() => handleDownload(record)}
          >
            下载
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
    const filteredResources = resources.filter(resource =>
      resource.name.toLowerCase().includes(searchText.toLowerCase()) ||
      resource.uploadedBy.toLowerCase().includes(searchText.toLowerCase())
    );
    setResources(filteredResources);
  };

  const handleDownload = (record) => {
    Message.info(`下载资源: ${record.name}`);
  };

  const handleEdit = (record) => {
    Message.info(`编辑资源: ${record.name}`);
  };

  const handleDelete = (record) => {
    Message.info(`删除资源: ${record.name}`);
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Input
            allowClear
            placeholder="搜索资源名称或上传者"
            value={searchText}
            onChange={setSearchText}
            style={{ width: 300 }}
          />
          <Button type="primary" icon={<IconSearch />} onClick={handleSearch}>
            搜索
          </Button>
          <Button type="primary">
            上传资源
          </Button>
        </Space>
      </div>

      <Table
        loading={loading}
        columns={columns}
        data={resources}
        rowKey="id"
        border={false}
        pagination={{
          total: resources.length,
          pageSize: 10,
          showTotal: true,
        }}
      />
    </div>
  );
};

export default ResourceManagement;