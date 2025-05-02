import React, { useState, useEffect } from 'react';
import {
  Table, Input, Button, Space, Message, Modal, Upload, Image, Form
} from '@arco-design/web-react';
import {
  IconSearch, IconDelete, IconEdit, IconEye, IconPlus
} from '@arco-design/web-react/icon';

const ForumPageManagement = () => {
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [form] = Form.useForm();
  const [modalMode, setModalMode] = useState('create'); // or 'edit'
  const [visible, setVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3002/api/admin/posts-page?page=${page}&pageSize=${pageSize}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('获取帖子列表失败');
      const data = await response.json();
      setPosts(data.data);
      setPagination({
        current: data.page,
        pageSize: data.pageSize,
        total: data.total,
      });
    } catch (error) {
      Message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchText) {
      return fetchPosts(pagination.current, pagination.pageSize);
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3002/api/admin/posts-email/${searchText}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('搜索帖子失败');
      const data = await response.json();
      setPosts(data.data);
      setPagination({
        current: 1,
        pageSize: 10,
        total: data.data?.length || 0,
      });
    } catch (error) {
      Message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (record) => {
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
      ),
    });
  };

  const showPostModal = (mode, record = null) => {
    setModalMode(mode);
    setEditingId(record?.id || null);
    if (mode === 'edit' && record) {
      form.setFieldsValue({
        title: record.title,
        content: record.content,
        image_url: record.image_url || '',
      });
    } else {
      form.resetFields();
    }
    setVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = form.getFieldsValue();
      const url = modalMode === 'edit'
        ? `http://localhost:3002/api/admin/posts/${editingId}`
        : 'http://localhost:3002/api/admin/posts';
      const method = modalMode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...values,
          created_by: localStorage.getItem('email'),
        }),
      });

      if (!response.ok) throw new Error(modalMode === 'edit' ? '更新帖子失败' : '创建帖子失败');

      Message.success(modalMode === 'edit' ? '帖子更新成功' : '帖子创建成功');
      setVisible(false);
      fetchPosts(pagination.current, pagination.pageSize);
    } catch (error) {
      Message.error(error.message);
    }
  };

  const handleDelete = (record) => {
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
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });

          if (!response.ok) throw new Error('删除帖子失败');

          Message.success('帖子删除成功');
          fetchPosts(pagination.current, pagination.pageSize);
        } catch (error) {
          Message.error(error.message);
        }
      },
    });
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
          <Button type="text" icon={<IconEye />} onClick={() => handleView(record)}>查看</Button>
          <Button type="text" icon={<IconEdit />} onClick={() => showPostModal('edit', record)}>编辑</Button>
          <Button type="text" status="danger" icon={<IconDelete />} onClick={() => handleDelete(record)}>删除</Button>
        </Space>
      ),
    },
  ];

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
          <Button type="primary" icon={<IconSearch />} onClick={handleSearch}>搜索</Button>
          <Button type="primary" onClick={() => showPostModal('create')}>添加帖子</Button>
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

      <Modal
        title={modalMode === 'edit' ? '编辑帖子' : '创建新帖子'}
        visible={visible}
        onOk={handleSubmit}
        onCancel={() => setVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="标题" field="title" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="输入标题" />
          </Form.Item>
          <Form.Item label="内容" field="content" rules={[{ required: true, message: '请输入内容' }]}>
            <Input.TextArea autoSize={{ minRows: 4, maxRows: 8 }} placeholder="输入内容" />
          </Form.Item>
          <Form.Item label="封面图" field="image_url">
            <Upload
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              listType="picture-card"
              maxCount={1}
              fileList={form.getFieldValue('image_url') ? [{ url: form.getFieldValue('image_url') }] : []}
              customRequest={async ({ file, onSuccess, onError }) => {
                try {
                  const formData = new FormData();
                  formData.append('photo', file);

                  const response = await fetch('http://localhost:3002/api/upload-to-oss', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: formData,
                  });

                  if (!response.ok) throw new Error('上传封面失败');

                  const data = await response.json();
                  form.setFieldValue('image_url', data.avatarUrl);
                  onSuccess(data);
                } catch (error) {
                  console.error('上传错误:', error);
                  onError(error);
                  Message.error('上传封面失败，请重试');
                }
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <IconPlus />
                <div style={{ marginTop: 8 }}>上传封面</div>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ForumPageManagement;
