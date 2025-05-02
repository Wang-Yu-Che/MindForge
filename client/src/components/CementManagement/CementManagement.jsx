import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Message, Modal } from '@arco-design/web-react';
import { IconSearch, IconDelete, IconEdit, IconEye } from '@arco-design/web-react/icon';

const CementManagement = () => {
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchAnnouncements = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3002/api/admin/announcements?page=${page}&pageSize=${pageSize}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('获取公告列表失败');
      const data = await response.json();
      setAnnouncements(data.data);
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
      title: '内容',
      dataIndex: 'content',
      render: (content) => {
        const cleanContent = content.replace(/<[^>]*>/g, '');
        return (
          <span title={cleanContent}>
            {cleanContent.length > 20 ? `${cleanContent.substring(0, 20)}...` : cleanContent}
          </span>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
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
      return fetchAnnouncements(pagination.current, pagination.pageSize);
    }
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3002/api/admin/announcements-title/${searchText}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('搜索公告失败');
      const data = await response.json();
      setAnnouncements(data.data);
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

  const handleView = async (record) => {
    try {
      
      Modal.info({
        title: '公告详情',
        content: (
          <div>
            <p><strong>标题:</strong> {record.title}</p>
            <p style={{ wordBreak: 'break-all' }}><strong>内容:</strong> {record.content.replace(/<[^>]*>/g, '')}</p>
            <p><strong>创建时间:</strong> {record.created_at}</p>
          </div>
        )
      });
    } catch (error) {
      Message.error(error.message);
    }
  };

  const handleEdit = (record) => {
    setIsEditing(true);
    setCurrentAnnouncement(record);
    Modal.confirm({
      title: '编辑公告',
      content: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input 
            defaultValue={record?.title || ''} 
            onChange={(value) => setCurrentAnnouncement({...record, title: value})}
            style={{ width: '100%' }}
          />
          <Input.TextArea 
            defaultValue={record?.content || ''} 
            onChange={(value) => setCurrentAnnouncement({...record, content: value})}
            style={{ width: '100%' }}
            autoSize={{ minRows: 4, maxRows: 8 }}
          />
        </Space>
      ),
      onOk: async () => {
        try {
          const response = await fetch(`http://localhost:3002/api/admin/announcements/${record.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              title: currentAnnouncement.title,
              content: currentAnnouncement.content
            })
          });
          
          if (!response.ok) throw new Error('更新公告失败');
          
          Message.success('公告更新成功');
          fetchAnnouncements(pagination.current, pagination.pageSize);
        } catch (error) {
          Message.error(error.message);
        }
      },
      onCancel: () => setCurrentAnnouncement(null)
    });
  };

  const handleDelete = async (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除公告"${record.title}"吗?`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await fetch(`http://localhost:3002/api/announcements/${record.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (!response.ok) throw new Error('删除公告失败');
          
          Message.success('公告删除成功');
          fetchAnnouncements(pagination.current, pagination.pageSize);
        } catch (error) {
          Message.error(error.message);
        }
      }
    });
  };

  return (
    <div className="cement-management-container">
      <div className="cement-management-header" style={{ marginBottom: 16 }}>
        <Space>
          <Input
            allowClear
            placeholder="搜索标题"
            value={searchText}
            onChange={setSearchText}
            style={{ width: 300 }}
          />
          <Button type="primary" icon={<IconSearch />} onClick={handleSearch}>
            搜索
          </Button>
          <Button type="primary" onClick={() => {
            setIsEditing(false);
            setCurrentAnnouncement({ title: '', content: '' });
          }}>添加公告</Button>
          
          <Modal
            title="创建公告"
            visible={!!currentAnnouncement && !isEditing}
            onOk={async () => {
              try {
                const response = await fetch('http://localhost:3002/api/admin/announcements', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  },
                  body: JSON.stringify({
                    title: currentAnnouncement.title,
                    content: currentAnnouncement.content
                  })
                });
                
                if (!response.ok) throw new Error('创建公告失败');
                
                Message.success('公告创建成功');
                setCurrentAnnouncement(null);
                fetchAnnouncements(pagination.current, pagination.pageSize);
              } catch (error) {
                Message.error(error.message);
              }
            }}
            onCancel={() => setCurrentAnnouncement(null)}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input 
                placeholder="标题"
                value={currentAnnouncement?.title || ''}
                onChange={(value) => setCurrentAnnouncement({...currentAnnouncement, title: value})}
              />
              <Input.TextArea 
                placeholder="内容"
                value={currentAnnouncement?.content || ''}
                onChange={(value) => setCurrentAnnouncement({...currentAnnouncement, content: value})}
                autoSize={{ minRows: 4, maxRows: 8 }}
              />
            </Space>
          </Modal>
       
        </Space>
      </div>
      

      <Table
        loading={loading}
        columns={columns}
        data={announcements}
        rowKey="id"
        border={false}
        pagination={{
          total: pagination.total,
          pageSize: pagination.pageSize,
          showTotal: true,
          current: pagination.current,
          onChange: (page, pageSize) => fetchAnnouncements(page, pageSize)
        }}
      />
    </div>
  );
};

export default CementManagement;