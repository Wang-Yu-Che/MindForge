import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Message, Modal, Upload, Image } from '@arco-design/web-react';
import { IconSearch, IconDelete, IconEdit, IconEye, IconPlus } from '@arco-design/web-react/icon';

const ForumPageManagement = () => {
  useEffect(() => {
    fetchPosts();
  }, []);

  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [currentPost, setCurrentPost] = useState(null);

  const fetchPosts = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3002/api/admin/posts-page?page=${page}&pageSize=${pageSize}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('获取帖子列表失败');
      const data = await response.json();
      setPosts(data.data);
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
      title: '作者',
      dataIndex: 'created_by',
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
      title: '点赞数',
      dataIndex: 'like_count',
      sorter: (a, b) => a.like_count - b.like_count,
    },
    {
      title: '评论数',
      dataIndex: 'comment_count',
      sorter: (a, b) => a.comment_count - b.comment_count,
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
      return fetchPosts(pagination.current, pagination.pageSize);
    }
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3002/api/admin/posts-email/${searchText}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('搜索帖子失败');
      const data = await response.json();
      setPosts(data.data);
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
      
      Modal.info({
        title: '帖子详情',
        content: (
          <div>
            <p><strong>作者:</strong> {record.created_by}</p>
            <p><strong>标题:</strong> {record.title}</p>
            <p style={{ wordBreak: 'break-all' }}><strong>内容:</strong> {record.content.replace(/<[^>]*>/g, '')}</p>
            <p><strong>点赞数:</strong> {record.like_count}</p>
            <p><strong>评论数:</strong> {record.comment_count}</p>
            <p><strong>创建时间:</strong> {record.created_at}</p>
            {record.image_url && <Image src={record.image_url} width={200} height={120} alt="封面" style={{ objectFit: 'cover' }} />}
          </div>
        )
      });
    } catch (error) {
      Message.error(error.message);
    }
  };

  const handleEdit = (record) => {
    setCurrentPost({...record});
    Modal.confirm({
      title: '编辑帖子',
      content: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input 
            defaultValue={record.title} 
            onChange={(value) => setCurrentPost(prev => ({...prev, title: value}))}
            style={{ width: '100%' }}
          />
          <Input.TextArea 
            defaultValue={record.content} 
            onChange={(value) => setCurrentPost(prev => ({...prev, content: value}))}
            style={{ width: '100%' }}
            autoSize={{ minRows: 4, maxRows: 8 }}
          />
          <Upload
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                    listType="picture-card"
                    maxCount={1}
                    customRequest={async ({ file, onSuccess, onError }) => {
                      try {
                        const formData = new FormData();
                        formData.append('photo', file);
                        
                        const token = localStorage.getItem('token');
                        const response = await fetch('http://localhost:3002/api/upload-to-oss', {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${token}`
                          },
                          body: formData
                        });
                        
                        if (!response.ok) throw new Error('上传封面失败');
                        
                        const data = await response.json();
                        setCurrentPost(prev => ({
                          ...prev,
                          image_url: data.avatarUrl
                        }));
                        onSuccess(data);
                      } catch (error) {
                        console.error('上传封面错误:', error);
                        onError(error);
                        Message.error('上传封面失败，请重试');
                      }
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <IconPlus />
                    <div style={{ marginTop: 8 }}>上传新的封面</div>
                    </div>
                  </Upload>
        </Space>
      ),
      onOk: async () => {
        try {
          const response = await fetch(`http://localhost:3002/api/admin/posts/${record.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              title: currentPost.title,
              content: currentPost.content,
              image_url: currentPost.image_url
            })
          });
          
          if (!response.ok) throw new Error('更新帖子失败');
          
          Message.success('帖子更新成功');
          fetchPosts(pagination.current, pagination.pageSize);
        } catch (error) {
          Message.error(error.message);
        }
      }
    });
  };

  const handleDelete = async (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除帖子"${record.title}"吗?`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await fetch(`http://localhost:3002/api/admin/posts/${record.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (!response.ok) throw new Error('删除帖子失败');
          
          Message.success('帖子删除成功');
          fetchPosts(pagination.current, pagination.pageSize);
        } catch (error) {
          Message.error(error.message);
        }
      }
    });
  };

  return (
    <div className="forum-management-container">
      <div className="forum-management-header" style={{ marginBottom: 16 }}>
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
          <Button type="primary" onClick={() => {
            setCurrentPost({ title: '', content: '', image_url: '' });
            Modal.confirm({
              title: '创建新帖子',
              content: (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Input 
                    placeholder="输入标题" 
                    onChange={(value) => setCurrentPost(prev => ({...prev, title: value}))}
                  />
                  <Input.TextArea 
                    placeholder="输入内容" 
                    onChange={(value) => setCurrentPost(prev => ({...prev, content: value}))}
                    autoSize={{ minRows: 4, maxRows: 8 }}
                  />
                  <Upload
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                    listType="picture-card"
                    maxCount={1}
                    customRequest={async ({ file, onSuccess, onError }) => {
                      try {
                        const formData = new FormData();
                        formData.append('photo', file);
                        
                        const token = localStorage.getItem('token');
                        const response = await fetch('http://localhost:3002/api/upload-to-oss', {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${token}`
                          },
                          body: formData
                        });
                        
                        if (!response.ok) throw new Error('上传封面失败');
                        
                        const data = await response.json();
                        setCurrentPost(prev => ({
                          ...prev,
                          image_url: data.avatarUrl
                        }));
                        onSuccess(data);
                      } catch (error) {
                        console.error('上传封面错误:', error);
                        onError(error);
                        Message.error('上传封面失败，请重试');
                      }
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <IconPlus />
                    <div style={{ marginTop: 8 }}>上传封面</div>
                    </div>
                  </Upload>
                </Space>
              ),
              onOk: async () => {
                try {
                  const response = await fetch('http://localhost:3002/api/admin/posts', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                      title: currentPost.title,
                      content: currentPost.content,
                      image_url: currentPost.image_url,
                      created_by: localStorage.getItem('email')
                    })
                  });
                  
                  if (!response.ok) throw new Error('创建帖子失败');
                  
                  Message.success('帖子创建成功');
                  fetchPosts(pagination.current, pagination.pageSize);
                } catch (error) {
                  Message.error(error.message);
                }
              }
            });
          }}>添加帖子</Button>
        </Space>
      </div>
      

      <Table
        loading={loading}
        columns={columns}
        data={posts}
        rowKey="id"
        border={false}
        pagination={{
          total: posts.length,
          pageSize: 10,
          showTotal: true,
        }}
      />
    </div>
  );
};

export default ForumPageManagement;