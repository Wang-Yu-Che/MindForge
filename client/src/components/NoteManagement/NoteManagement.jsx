import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Message, Tag, Modal } from '@arco-design/web-react';
import { IconSearch, IconDelete, IconEdit, IconEye } from '@arco-design/web-react/icon';

const NoteManagement = () => {
  useEffect(() => {
    fetchNotes();
  }, []);

  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [notes, setNotes] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [currentNotebook, setCurrentNotebook] = useState(null);

  const fetchNotes = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3002/api/admin/notes?page=${page}&pageSize=${pageSize}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('获取笔记列表失败');
      const data = await response.json();
      setNotes(data.data);
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
      dataIndex: 'user_id',
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
      title: '状态',
      dataIndex: 'status',
      render: (status, record) => (
        <Tag color={record.content === '生成中' ? 'gray' : 'green'}>
          {record.content === '生成中' ? '草稿' : '已发布'}
        </Tag>
      ),
      filters: [
        { text: '已发布', value: '已发布' },
        { text: '草稿', value: '草稿' },
      ],
      onFilter: (value, record) => (value === '已发布' ? record.content !== '生成中' : record.content === '生成中'),
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
      return fetchNotes(pagination.current, pagination.pageSize);
    }
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3002/api/admin/notes-id/${searchText}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('搜索笔记失败');
      const data = await response.json();
      setNotes(data);
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
        title: '笔记详情',
        content: (
          <div>
            <p><strong>作者:</strong> {record.user_id}</p>
            <p><strong>标题:</strong> {record.title}</p>
            <p><strong>内容:</strong> {record.content.replace(/<[^>]*>/g, '')}</p>
            <p><strong>创建时间:</strong> {record.created_at}</p>
             </div>
        )
      });
    } catch (error) {
      Message.error(error.message);
    }
  };

  const handleEdit = (record) => {
    setCurrentNotebook(record);
    Modal.confirm({
      title: '编辑笔记',
      content: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input 
            defaultValue={record.title} 
            onChange={(value) => setCurrentNotebook({...record, title: value})}
            style={{ width: '100%' }}
          />
          <Input.TextArea 
            defaultValue={record.content} 
            onChange={(value) => setCurrentNotebook({...record, content: value})}
            style={{ width: '100%' }}
            autoSize={{ minRows: 4, maxRows: 8 }}
          />
        </Space>
      ),
      onOk: async () => {
        try {
          const response = await fetch(`http://localhost:3002/api/notes/${record.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              title: currentNotebook.title,
              content: currentNotebook.content
            })
          });
          
          if (!response.ok) throw new Error('更新笔记失败');
          
          Message.success('笔记更新成功');
          fetchNotes(pagination.current, pagination.pageSize);
        } catch (error) {
          Message.error(error.message);
        }
      }
    });
  };

  const handleDelete = async (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除笔记"${record.title}"吗?`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await fetch(`http://localhost:3002/api/notes/${record.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (!response.ok) throw new Error('删除笔记失败');
          
          Message.success('笔记删除成功');
          fetchNotes(pagination.current, pagination.pageSize);
        } catch (error) {
          Message.error(error.message);
        }
      }
    });
  };

  return (
    <div className="note-management-container">
      <div className="note-management-header" style={{ marginBottom: 16 }}>
        <Space>
          <Input
            allowClear
            placeholder="搜索作者ID"
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