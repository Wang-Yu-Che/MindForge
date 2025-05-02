import React, { useState,useEffect } from 'react';
import { Table, Input, Button, Space, Message, Tag, Modal, Image } from '@arco-design/web-react';
import { IconSearch, IconDelete, IconEye } from '@arco-design/web-react/icon';

const FeedbackManagement = () => {
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
// eslint-disable-next-line
  const fetchFeedbacks = async (page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3002/api/admin/feedbacks?page=${page}&pageSize=${pageSize}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch feedbacks');
      }
      
      const data = await response.json();
      setFeedbacks(data.data || []);
      setPagination({
        ...pagination,
        total: data.total || 0
      });
    } catch (error) {
      setError(error.message);
      Message.error('获取反馈数据失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchFeedbacks();
    // eslint-disable-next-line
  }, []);

  const columns = [
    {
      title: '用户ID',
      dataIndex: 'user_id',
      sorter: (a, b) => a.user_id - b.user_id,
    },
    {
      title: '反馈内容',
      dataIndex: 'content',
      render: (content) => (
        <div style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {content}
        </div>
      ),
    },
    {
      title: '截图',
      dataIndex: 'screenshot_url',
      render: (url) => (
        url ? <Tag color="blue">有截图</Tag> : <Tag color="gray">无截图</Tag>
      ),
    },
    {
      title: '邮件更新',
      dataIndex: 'email_updates',
      render: (emailUpdates) => (
        <Tag color={emailUpdates ? 'green' : 'gray'}>
          {emailUpdates ? '是' : '否'}
        </Tag>
      ),
      filters: [
        { text: '是', value: true },
        { text: '否', value: false },
      ],
      onFilter: (value, record) => Boolean(record.email_updates) === Boolean(value),
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
    try {
      if (!searchText.trim()) {
        return fetchFeedbacks();
      }
      setLoading(true);
      const response = await fetch(`http://localhost:3002/api/admin/feedbacks/${encodeURIComponent(searchText)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setFeedbacks(data || []);
      setPagination({
        current: 1,
        pageSize: 10,
        total: data.data?.length || 0
      });
    } catch (error) {
      Message.error('搜索反馈失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (record) => {
    setCurrentFeedback({
      ...record,
      screenshotUrl: record.screenshot_url
    });
    setViewModalVisible(true);
  };

  const handleDelete = async (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除反馈ID为${record.id}的记录吗?`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await fetch(`http://localhost:3002/api/admin/feedbacks/${record.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (response.ok) {
            Message.success('删除反馈成功');
            fetchFeedbacks(); // 刷新列表
          } else {
            const errorData = await response.json();
            Message.error(`删除失败: ${errorData.error}`);
          }
        } catch (error) {
          Message.error(`删除反馈失败: ${error.message}`);
        }
      }
    });
  };

  return (
    <div className="feedback-management-container">
      <div className="feedback-management-header" style={{ marginBottom: 16 }}>
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
        data={feedbacks}
        rowKey="id"
        border={false}
        pagination={{
          total: pagination.total,
          pageSize: pagination.pageSize,
          showTotal: true,
          current: pagination.current,
          onChange: (page, pageSize) => fetchFeedbacks(page, pageSize)
        }}
      />

      <Modal
        visible={viewModalVisible}
        onOk={() => setViewModalVisible(false)}
        onCancel={() => setViewModalVisible(false)}
        title="反馈详情"
        style={{ width: 600 }}
      >
        {currentFeedback && (
          <div>
            <p><strong>用户ID：</strong>{currentFeedback.user_id}</p>
            <p style={{ wordBreak: 'break-all' }}><strong>反馈内容：</strong>
              <div style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentFeedback.content}
              </div>
            </p>
            <p><strong>邮件更新：</strong>
              <Tag color={currentFeedback.email_updates ? 'green' : 'gray'}>
                {currentFeedback.email_updates ? '是' : '否'}
              </Tag>
            </p>
            <p><strong>创建时间：</strong>{currentFeedback.created_at}</p>
            {currentFeedback.screenshotUrl && (
              <div style={{ maxWidth: '100%', height: 200,overflow: 'hidden' }}>
                <p><strong>截图：</strong></p>
                <Image
                  src={currentFeedback.screenshotUrl}
                  alt="反馈截图"
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FeedbackManagement;