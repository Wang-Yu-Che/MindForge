import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Message, Modal, Form } from '@arco-design/web-react';
import { IconSearch, IconDelete, IconEdit } from '@arco-design/web-react/icon';
import './UserManagement.css';

const UserManagement = () => {
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [users, setUsers] = useState([]);
  const [visible, setVisible] = useState(false);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [, setCurrentRecord] = useState(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const fetchUsers = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3002/api/users?page=${page}&pageSize=${pageSize}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('获取用户列表失败');
      const data = await response.json();
      setUsers(data.data);
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
    fetchUsers();
  }, []);

  const handleSearch = async () => {
    try {
      if (!searchText) return fetchUsers();
      setLoading(true);

      const response = await fetch(`http://localhost:3002/api/users/${searchText}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('搜索用户失败');
      const user = await response.json();

      setUsers([user]);
      setPagination({ current: 1, pageSize: 1, total: 1 });
    } catch (error) {
      Message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setCurrentRecord(record);
    form.setFieldsValue({
      id: record.id,
      email: record.email
    });
    setEmailModalVisible(true);
  };

  const handleUpdateEmail = async () => {
    try {
      const values = await form.validate();
      setLoading(true);

      const response = await fetch(`http://localhost:3002/api/user/email`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: values.id,
          newEmail: values.email
        })
      });

      if (!response.ok) throw new Error('更新邮箱失败');
      const data = await response.json();

      if (data.success) {
        Message.success('邮箱更新成功');
        setEmailModalVisible(false);
        form.resetFields();
        fetchUsers(pagination.current, pagination.pageSize);
      }
    } catch (error) {
      Message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (record) => {
    try {
      const response = await fetch(`http://localhost:3002/api/users/${record.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('删除用户失败');
      const data = await response.json();

      if (data.success) {
        Message.success('用户删除成功');
        fetchUsers(pagination.current, pagination.pageSize);
      }
    } catch (error) {
      Message.error(error.message);
    }
  };

  const handleAddUser = async () => {
    try {
      const values = await form.validate();
      setLoading(true);

      const response = await fetch('http://localhost:3002/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          action: 'register',
          email: values.email,
          password: values.password
        })
      });

      if (!response.ok) throw new Error('添加用户失败');

      Message.success('用户添加成功');
      setVisible(false);
      form.resetFields();
      fetchUsers(pagination.current, pagination.pageSize);
    } catch (error) {
      Message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '用户名',
      dataIndex: 'email',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      filters: [
        { text: '普通用户', value: '普通用户' },
        { text: '管理员', value: '管理员' },
      ],
      onFilter: (value, record) => {
        if (value === '普通用户') return record.email.includes('@');
        if (value === '管理员') return !record.email.includes('@');
        return false;
      },
      render: (text, record) => record.email.includes('@') ? '普通用户' : '管理员'
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<IconEdit />} onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="text" status="danger" icon={<IconDelete />} onClick={() => handleDelete(record)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="user-management-container">
      <Modal
        title="编辑用户邮箱"
        visible={emailModalVisible}
        onOk={handleUpdateEmail}
        onCancel={() => setEmailModalVisible(false)}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="用户ID" field="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            label="邮箱"
            field="email"
            rules={[
              { required: true, message: '请输入邮箱地址' },
              { type: 'email', message: '请输入有效的邮箱格式' }
            ]}
          >
            <Input placeholder="请输入新邮箱地址" />
          </Form.Item>
        </Form>
      </Modal>

      <div className="user-management-header" style={{ marginBottom: 16 }}>
        <Space>
          <Input
            allowClear
            placeholder="搜索用户名或邮箱"
            value={searchText}
            onChange={setSearchText}
            style={{ width: 300 }}
          />
          <Button type="primary" icon={<IconSearch />} onClick={handleSearch}>搜索</Button>
          <Button type="primary" onClick={() => setVisible(true)}>添加用户</Button>
        </Space>
      </div>

      <Modal
        title="添加用户"
        visible={visible}
        onOk={handleAddUser}
        onCancel={() => {
          setVisible(false);
          form.resetFields();
        }}
        autoFocus={false}
        focusLock
      >
        <Form form={form}>
          <Form.Item
            label="邮箱"
            field="email"
            rules={[
              { required: true, message: '请输入邮箱地址' },
              { type: 'email', message: '邮箱格式不正确' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item
            label="密码"
            field="password"
            rules={[
              { required: true, message: '请输入密码' },
              { minLength: 6, message: '密码长度不能少于6位' }
            ]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
        </Form>
      </Modal>

      <Table
        loading={loading}
        columns={columns}
        data={users}
        rowKey="id"
        border={false}
        pagination={{
          ...pagination,
          showTotal: true,
          onChange: (current, pageSize) => fetchUsers(current, pageSize)
        }}
      />
    </div>
  );
};

export default UserManagement;
