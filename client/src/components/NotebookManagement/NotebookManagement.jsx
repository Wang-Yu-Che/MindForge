import React, { useState } from 'react';
import { Table, Input, Button, Space, Message, Tag, Modal } from '@arco-design/web-react';
import { IconSearch, IconDelete, IconEdit, IconEye } from '@arco-design/web-react/icon';

const NotebookManagement = () => {
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [notebooks, setNotebooks] = useState([]);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [currentNotebook, setCurrentNotebook] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const fetchNotebooks = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3002/api/admin/notebooks?page=${page}&pageSize=${pageSize}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('获取笔记本列表失败');
      const data = await response.json();
      setNotebooks(data.data);
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

  const handleSearch = async () => {
    if (!searchText) {
      return fetchNotebooks(pagination.current, pagination.pageSize);
    }
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3002/api/admin/notebooks-id/${searchText}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('搜索笔记本失败');
      const data = await response.json();
      setNotebooks(data);
      setPagination({
        current: 1,
        pageSize: 10,
        total: data.data?.length || 0
      });
    } catch (error) {
      Message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (record) => {
    try {
      const response = await fetch(`http://localhost:3002/api/admin/user-sources?userId=${record.user_id}&folderName=${record.title}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('获取来源详细信息失败');
      const sources = await response.json();
      
      setCurrentNotebook({
        ...record,
        sources: sources
      });
      setViewModalVisible(true);
    } catch (error) {
      Message.error(error.message);
    }
  };

  const handleEdit = (record) => {
    Modal.confirm({
      title: '编辑笔记本标题',
      content: (
        <Input 
          defaultValue={record.title} 
          onChange={(value) => setCurrentNotebook({...record, title: value})}
        />
      ),
      onOk: async () => {
        try {
          const response = await fetch(`http://localhost:3002/api/notebooks/${record.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              title: currentNotebook.title
            })
          });
          
          if (!response.ok) throw new Error('更新笔记本标题失败');
          
          Message.success('笔记本标题更新成功');
          fetchNotebooks(pagination.current, pagination.pageSize);
        } catch (error) {
          Message.error(error.message);
        }
      }
    });
  };

  const handleDelete = async (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除笔记本"${record.title}"吗?`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await fetch(`http://localhost:3002/api/notebooks/${record.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (!response.ok) throw new Error('删除笔记本失败');
          
          Message.success('笔记本删除成功');
          fetchNotebooks(pagination.current, pagination.pageSize);
        } catch (error) {
          Message.error(error.message);
        }
      }
    });
  };

  React.useEffect(() => {
    fetchNotebooks();
  }, []);

  return (
    <div className="notebook-management-container">
      <Modal
        title="笔记本详情"
        visible={viewModalVisible}
        onOk={() => setViewModalVisible(false)}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
      >
        {currentNotebook && (
          <div>
            <p><strong>标题:</strong> {currentNotebook.title}</p>
            <p><strong>用户ID:</strong> {currentNotebook.user_id}</p>
            <p><strong>来源数量:</strong> {currentNotebook.source_count}</p>
            <p><strong>创建时间:</strong> {currentNotebook.created_at}</p>
            <p><strong>角色:</strong> {currentNotebook.role}</p>
            <p><strong>关联slug:</strong> {currentNotebook.slug}</p>
            <p><strong>来源详细:</strong></p>
            <ul>
              {currentNotebook.sources?.map(source => (
                <li key={source.id}>
                  <a href={source.file_url} target="_blank" rel="noopener noreferrer">
                    {source.file_name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal>
      <div className="notebook-management-header">
        <Space>
          <Input
            allowClear
            placeholder="搜索用户ID"
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
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showTotal: true,
          onChange: (page, pageSize) => {
            fetchNotebooks(page, pageSize);
          }
        }}
      />
    </div>
  );
};

export default NotebookManagement;