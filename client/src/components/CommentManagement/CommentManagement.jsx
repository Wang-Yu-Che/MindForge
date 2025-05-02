import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Message, Tag, Modal } from '@arco-design/web-react';
import { IconSearch, IconDelete, IconEdit, IconEye } from '@arco-design/web-react/icon';

const CommentManagement = () => {
  useEffect(() => {
    fetchComments();
  }, []);

  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [comments, setComments] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [currentComment, setCurrentComment] = useState(null);

  const fetchComments = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3002/api/admin/comments?page=${page}&pageSize=${pageSize}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('获取评论列表失败');
      const data = await response.json();
      setComments(data.data);
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
      title: '用户邮箱',
      dataIndex: 'user_email',
    },
    {
      title: '是否匿名',
      dataIndex: 'is_anonymous',
      render: (isAnonymous) => (
        <Tag color={isAnonymous ? 'gray' : 'green'}>
          {isAnonymous ? '匿名' : '实名'}
        </Tag>
      ),
    },
    {
      title: '评论内容',
      dataIndex: 'content',
      render: (content) => (
        <span title={content}>
          {content.length > 20 ? `${content.substring(0, 20)}...` : content}
        </span>
      ),
    },
    {
      title: '评论时间',
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
      return fetchComments(pagination.current);
    }
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3002/api/admin/comments-email/${searchText}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('搜索评论失败');
      const data = await response.json();
      setComments(data.data);
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
        title: '评论详情',
        content: (
          <div>
            <p><strong>帖子ID:</strong> {record.post_id}</p>
            <p style={{ wordBreak: 'break-all' }}><strong>内容:</strong> {record.content}</p>
            <p><strong>是否匿名:</strong> {record.is_anonymous ? '是' : '否'}</p>
            <p><strong>用户邮箱:</strong> {record.user_email || '匿名用户'}</p>
            <p><strong>评论时间:</strong> {record.created_at}</p>
          </div>
        )
      });
    } catch (error) {
      Message.error(error.message);
    }
  };

  const handleEdit = (record) => {
    setCurrentComment(record);
    Modal.confirm({
      title: '编辑评论',
      content: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input.TextArea 
            defaultValue={record?.content || ''} 
            onChange={(value) => setCurrentComment({...record, content: value})}
            style={{ width: '100%' }}
            autoSize={{ minRows: 4, maxRows: 8 }}
          />
        </Space>
      ),
      onOk: async () => {
        try {
          if (!currentComment?.content) {
            Message.error('评论内容不能为空');
            return;
          }
          const response = await fetch(`http://localhost:3002/api/admin/comments/${record.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              content: currentComment?.content || ''
            })
          });
          
          if (!response.ok) throw new Error('更新评论失败');
          
          Message.success('评论更新成功');
          fetchComments(pagination.current, pagination.pageSize);
        } catch (error) {
          Message.error(error.message);
        }
      }
    });
  };

  const handleDelete = async (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除这条评论吗?`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await fetch(`http://localhost:3002/api/admin/comments/${record.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (!response.ok) throw new Error('删除评论失败');
          
          Message.success('评论删除成功');
          fetchComments(pagination.current, pagination.pageSize);
        } catch (error) {
          Message.error(error.message);
        }
      }
    });
  };

  return (
    <div className="comment-management-container">
      <div className="comment-management-header" style={{ marginBottom: 16 }}>
        <Space>
          <Input
            allowClear
            placeholder="搜索用户邮箱"
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
        data={comments}
        rowKey="id"
        border={false}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showTotal: true,
          onChange: (page, pageSize) => fetchComments(page, pageSize)
        }}
      />
    </div>
  );
};

export default CommentManagement;