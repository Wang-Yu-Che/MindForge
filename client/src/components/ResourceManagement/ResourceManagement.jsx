import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Message, Tag } from '@arco-design/web-react';
import { IconSearch, IconDelete, IconDownload } from '@arco-design/web-react/icon';

const ResourceManagement = () => {
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const fetchResources = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3002/api/admin/sources?page=${page}&pageSize=${pageSize}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('获取资源列表失败');
      const data = await response.json();
      setResources(data.data);
      setPagination({
        current: data.page,
        pageSize: data.pageSize,
        total: data.total
      });
    } catch (error) {
      Message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const columns = [
    {
      title: '资源名称',
      dataIndex: 'file_name',
      sorter: (a, b) => a.file_name.localeCompare(b.file_name),
    },
    {
      title: '类型',
      dataIndex: 'type',
      render: (_, record) => {
        const fileName = record.file_name;
        const fileExt = fileName.includes('.') ? fileName.split('.').pop().toUpperCase() : '注释类型';
        return <Tag color="blue">{fileExt}</Tag>;
      },
      filters: resources.reduce((acc, resource) => {
        const fileName = resource.file_name;
        const fileExt = fileName.includes('.') ? fileName.split('.').pop().toUpperCase() : '注释类型';
        if (!acc.some(item => item.value === fileExt)) {
          acc.push({ text: fileExt, value: fileExt });
        }
        return acc;
      }, []),
      onFilter: (value, record) => record.type === value,
    },
    {
      title: '上传者',
      dataIndex: 'user_id',
      sorter: (a, b) => a.user_id.localeCompare(b.user_id),
    },
    {
      title: '知识库名',
      dataIndex: 'folder_name',
      sorter: (a, b) => a.folder_name.localeCompare(b.folder_name),
    },
    {
      title: '上传时间',
      dataIndex: 'created_at',
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
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

  const handleSearch = async () => {
    if (!searchText) {
      return fetchResources(pagination.current, pagination.pageSize);
    }
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3002/api/admin/sources-name/${searchText}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('搜索资源失败');
      const data = await response.json();
      setResources(data.data);
      setPagination({
        current: 1,
        pageSize: 1,
        total: data.data?.length || 0
      });
    } catch (error) {
      Message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (record) => {
    if (record.file_url && (record.file_url.startsWith('http://') || record.file_url.startsWith('https://'))) {
      window.open(record.file_url, '_blank');
    } else {
      Message.error(record.file_url ? '这不是有效的文件资源链接' : '资源链接无效');
    }
  };

  const handleDelete = async (record) => {
    try {
      const response = await fetch(`http://localhost:3002/api/admin/sources/${record.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      if (!response.ok) {
        throw new Error('删除资源失败');
      }
  
      Message.success('资源删除成功');
      fetchResources(pagination.current, pagination.pageSize);
    } catch (error) {
      Message.error(error.message);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Input
            allowClear
            placeholder="搜索资源名称"
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
        data={resources}
        rowKey="id"
        border={false}
        pagination={{
          total: pagination.total,
          pageSize: pagination.pageSize,
          showTotal: true,
          current: pagination.current,
          onChange: (page, pageSize) => fetchResources(page, pageSize)
        }}
      />
    </div>
  );
};

export default ResourceManagement;