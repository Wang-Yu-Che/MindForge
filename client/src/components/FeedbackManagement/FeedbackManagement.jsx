import React, { useState } from 'react';
import { Table, Input, Button, Space, Message, Tag, Modal, Image } from '@arco-design/web-react';
import { IconSearch, IconDelete, IconEdit, IconEye } from '@arco-design/web-react/icon';

const FeedbackManagement = () => {
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [feedbacks, setFeedbacks] = useState([
    {
      id: 1,
      userId: 101,
      content: '系统使用体验很好，但是希望能添加更多的功能。',
      screenshotUrl: 'https://example.com/screenshot1.jpg',
      emailUpdates: true,
      createdAt: '2023-01-01 10:30:00'
    },
    {
      id: 2,
      userId: 102,
      content: '遇到了一些操作上的问题，希望能得到解决。',
      screenshotUrl: null,
      emailUpdates: false,
      createdAt: '2023-01-02 15:45:00'
    },
  ]);

  const columns = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      sorter: (a, b) => a.userId - b.userId,
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
      dataIndex: 'screenshotUrl',
      render: (url) => (
        url ? <Tag color="blue">有截图</Tag> : <Tag color="gray">无截图</Tag>
      ),
    },
    {
      title: '邮件更新',
      dataIndex: 'emailUpdates',
      render: (emailUpdates) => (
        <Tag color={emailUpdates ? 'green' : 'gray'}>
          {emailUpdates ? '是' : '否'}
        </Tag>
      ),
      filters: [
        { text: '是', value: true },
        { text: '否', value: false },
      ],
      onFilter: (value, record) => record.emailUpdates === value,
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

  const handleSearch = () => {
    const filteredFeedbacks = feedbacks.filter(feedback =>
      feedback.content.toLowerCase().includes(searchText.toLowerCase()) ||
      feedback.userId.toString().includes(searchText)
    );
    setFeedbacks(filteredFeedbacks);
  };

  const handleView = (record) => {
    setCurrentFeedback(record);
    setViewModalVisible(true);
  };

  const handleDelete = (record) => {
    Message.info(`删除反馈: ${record.id}`);
  };

  return (
    <div className="feedback-management-container">
      <div className="feedback-management-header" style={{ marginBottom: 16 }}>
        <Space>
          <Input
            allowClear
            placeholder="搜索反馈内容或用户ID"
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
          total: feedbacks.length,
          pageSize: 10,
          showTotal: true,
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
            <p><strong>用户ID：</strong>{currentFeedback.userId}</p>
            <p><strong>反馈内容：</strong>{currentFeedback.content}</p>
            <p><strong>邮件更新：</strong>{currentFeedback.emailUpdates ? '是' : '否'}</p>
            <p><strong>创建时间：</strong>{currentFeedback.createdAt}</p>
            {currentFeedback.screenshotUrl && (
              <div>
                <p><strong>截图：</strong></p>
                <Image
                  src={currentFeedback.screenshotUrl}
                  alt="反馈截图"
                  style={{ maxWidth: '100%' }}
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