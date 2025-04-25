import './NotebookList.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Dropdown,
  Menu,
  Message,
  Space,
  Typography,
  Select,
  Card,
  Modal,
  Input
} from '@arco-design/web-react';
import {
  IconPlus,
  IconMore,
  IconDelete,
  IconEdit,
  IconList,
  IconApps
} from '@arco-design/web-react/icon';

const { Title } = Typography;

const NoteBookList = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('table'); // table 或 card
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);

  const [visible, setVisible] = useState(false);
  const [libraryName, setLibraryName] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingNotebook, setEditingNotebook] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  const handleCreateClick = () => {
    setVisible(true);
  };

  const handleOk = async () => {
    if (!libraryName.trim()) {
      Message.error('请输入知识库名称');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/notebooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: libraryName.trim()
        }),
      });
      
      if (!response.ok) {
        throw new Error('创建笔记本失败');
      }
      
      const data = await response.json();
      navigate('/notebook', { state: { showUploadModal: true, libraryName: libraryName.trim(), slug: data.slug } });
      setVisible(false);
      setLibraryName('');
    } catch (error) {
      console.error('创建笔记本错误:', error);
      Message.error('创建笔记本失败，请重试');
    }
  };

  const handleCancel = () => {
    setVisible(false);
    setLibraryName('');
  };

  const fetchNotebooks = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/notebooks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('获取笔记本数据失败');
      }
      const notebooks = await response.json();
        // 检查是否为空
        if (notebooks.length === 0) {
          navigate('/welcome');
        }
      const formattedData = notebooks.map((item) => ({
        key: item.id.toString(),
        title: item.title || '无标题笔记本',
        source: item.source_count ? `${item.source_count} 个来源` : '0 个来源',
        date: new Date(item.created_at).toLocaleString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        role: item.role,
        slug: item.slug
      }));
      setData(formattedData);
    } catch (err) {
      setError(err.message);
      Message.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchNotebooks();
  }, [fetchNotebooks]);



  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      render: (col) => (
        <Space>
          <IconApps style={{ color: '#6E6E6E' }} />
          <span>{col}</span>
        </Space>
      ),
    },
    { title: '来源', dataIndex: 'source' },
    { title: '创建', dataIndex: 'date' },
    { title: '角色', dataIndex: 'role' },
    {
      title: '',
      dataIndex: 'operations',
      render: (_, record) => (
        <Dropdown
          droplist={
            <Menu>
              <Menu.Item key="edit" onClick={() => {
                  setEditingNotebook(record);
                  setNewTitle(record.title);
                  setEditModalVisible(true);
                }}>
                <IconEdit /> 编辑标题
              </Menu.Item>
              <Menu.Item key="delete" onClick={() => {
                  Modal.confirm({
                    title: '确认删除',
                    content: `确定要删除笔记本"${record.title}"吗？`,
                    okText: '确认',
                    cancelText: '取消',
                    onOk: async () => {
                      try {
                        const token = localStorage.getItem('token');
                        const response = await fetch(`http://localhost:3001/api/notebooks/${record.key}`, {
                          method: 'DELETE',
                          headers: {
                            'Authorization': `Bearer ${token}`
                          }
                        });
                        if (!response.ok) {
                          throw new Error('删除笔记本失败');
                        }
                        Message.success('删除成功');
                        // 刷新列表
                        fetchNotebooks();
                      } catch (err) {
                        Message.error(err.message);
                      }
                    }
                  });
                }}>
                <IconDelete /> 删除
              </Menu.Item>
            </Menu>
          }
          trigger="click"
        >
          <Button type="text" icon={<IconMore />} />
        </Dropdown>
      ),
    },
  ];

  const renderCardList = () => (
    <div className="notebook-card-list">
      {data.map((item) => (
        <Card key={item.key} className="notebook-card" hoverable>
          <div className="notebook-card-header">
          <span className="notebook-icon">📘</span>
            <Dropdown
              trigger="click"
              droplist={
                <Menu>
                  <Menu.Item key="edit" onClick={() => {
                    setEditingNotebook(item);
                    setNewTitle(item.title);
                    setEditModalVisible(true);
                  }}>
                    <IconEdit /> 编辑标题
                  </Menu.Item>
                  <Menu.Item key="delete" onClick={() => {
                      Modal.confirm({
                        title: '确认删除',
                        content: `确定要删除笔记本"${item.title}"吗？`,
                        okText: '确认',
                        cancelText: '取消',
                        onOk: async () => {
                          try {
                            const token = localStorage.getItem('token');
                            const response = await fetch(`http://localhost:3001/api/notebooks/${item.key}`, {
                              method: 'DELETE',
                              headers: {
                                'Authorization': `Bearer ${token}`
                              }
                            });
                            if (!response.ok) {
                              throw new Error('删除笔记本失败');
                            }
                            Message.success('删除成功');
                            // 刷新列表
                            fetchNotebooks();
                          } catch (err) {
                            Message.error(err.message);
                          }
                        }
                      });
                    }}>
                    <IconDelete /> 删除
                  </Menu.Item>
                </Menu>
              }
            >
              <Button type="text" icon={<IconMore />} />
            </Dropdown>
          </div>
          <div className="notebook-card-title">{item.title}</div>
          <div className="notebook-card-sub">
            {item.date} · {item.source}
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="notebook-list-layout">
      <div className="notebook-list-container">
        <Title heading={3}>
          <span style={{ color: '#4285F4' }}>欢迎来到 </span>
          <span style={{ color: '#34A853' }}>MindForge</span>
        </Title>

        <Title heading={5}>我的笔记本</Title>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 16,
          marginTop: 24
        }}>
          <Button icon={<IconPlus />} type="primary" shape="round" onClick={handleCreateClick}>
            创建新的
          </Button>
          <Modal
            title="创建新的知识库"
            visible={visible}
            onOk={handleOk}
            onCancel={handleCancel}
          >
            <Input
              placeholder="请输入知识库名称"
              value={libraryName}
              onChange={setLibraryName}
            />
          </Modal>

          <Space>
            <Button
              type={viewMode === 'card' ? 'primary' : 'outline'}
              icon={<IconApps />}
              onClick={() => setViewMode('card')}
            />
            <Button
              type={viewMode === 'table' ? 'primary' : 'outline'}
              icon={<IconList />}
              onClick={() => setViewMode('table')}
            />
            <Select defaultValue="最近的" style={{ width: 100 }} onChange={(value) => {
              const sortedData = [...data];
              if (value === 'recent') {
                sortedData.sort((a, b) => {
                  const dateA = new Date(a.key);
                  const dateB = new Date(b.key);
                  return dateB - dateA;
                });
              } else if (value === 'title') {
                sortedData.sort((a, b) => a.title.localeCompare(b.title));
              }
              setData(sortedData);
            }}>
              <Select.Option value="recent">最近的</Select.Option>
              <Select.Option value="title">标题</Select.Option>
            </Select>
          </Space>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>加载中...</div>
        ) : error ? (
          <Message type="error" content={error} />
        ) : viewMode === 'table' ? (
          <Table 
            columns={columns} 
            data={data} 
            pagination={false}
            onRow={(record) => ({
              onClick: (e) => {
                // 阻止事件冒泡，避免与菜单项点击冲突
                if (!e.target.closest('.arco-dropdown-menu, .arco-btn')) {
                  navigate('/notebook', { state: { libraryName: record.title, slug: record.slug } });
                }
              }
            })}
          />
        ) : (
          renderCardList()
        )}
      </div>

      {/* 编辑标题的Modal */}
      <Modal
        title="编辑笔记本标题"
        visible={editModalVisible}
        onOk={async () => {
          if (!newTitle.trim()) {
            Message.error('标题不能为空');
            return;
          }
          try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/api/notebooks/${editingNotebook.key}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                title: newTitle.trim()
              })
            });
            if (!response.ok) {
              throw new Error('更新笔记本标题失败');
            }
            Message.success('更新成功');
            // 更新列表数据
            const updatedData = data.map(item => {
              if (item.key === editingNotebook.key) {
                return { ...item, title: newTitle.trim() };
              }
              return item;
            });
            setData(updatedData);
            setEditModalVisible(false);
            // 刷新数据
            const fetchNotebooks = async () => {
              try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:3001/api/notebooks', {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
                if (!response.ok) {
                  throw new Error('获取笔记本数据失败');
                }
                const notebooks = await response.json();
                const formattedData = notebooks.map((item) => ({
                  key: item.id.toString(),
                  title: item.title || '无标题笔记本',
                  source: item.source_count ? `${item.source_count} 个来源` : '0 个来源',
                  date: new Date(item.created_at).toLocaleString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                  role: item.role,
                  slug: item.slug
                }));
                setData(formattedData);
                // 检查是否为空
                if (formattedData.length === 0) {
                  navigate('/welcome');
                }
              } catch (err) {
                setError(err.message);
                Message.error(err.message);
              }
            };
            fetchNotebooks();
          } catch (err) {
            Message.error(err.message);
          }
        }}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingNotebook(null);
          setNewTitle('');
        }}
      >
        <Input
          placeholder="请输入新的笔记本标题"
          value={newTitle}
          onChange={setNewTitle}
        />
      </Modal>
    </div>
  );
};

export default NoteBookList;
