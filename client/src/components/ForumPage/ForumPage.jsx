import React, { useState, useEffect } from 'react';
import { Carousel, Card, Typography, Divider, Grid, Modal, Button,Form,Input,Message,Upload } from '@arco-design/web-react';
import './ForumPage.css';
import axios from 'axios';
import {IconPlus} from '@arco-design/web-react/icon';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;
const Row = Grid.Row;
const Col = Grid.Col;

export default function ForumPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [announcements, setAnnouncements] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [visible, setVisible] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(false);

  const fetchData = async () => {
    try {
      const [announcementsRes, postsRes] = await Promise.all([
        axios.get('http://localhost:3002/api/announcements', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        axios.get('http://localhost:3002/api/admin/posts', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);
      setAnnouncements(announcementsRes.data);
      setPosts(postsRes.data);
    } catch (error) {
      console.error('获取数据失败:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    try {
      const values = form.getFieldsValue();
      const url = 'http://localhost:3002/api/admin/posts';
      const method = 'POST';

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

      if (!response.ok) throw new Error('创建帖子失败');

      Message.success('帖子创建成功');
      setVisible(false);
      fetchData();
    } catch (error) {
      Message.error(error.message);
    }
  };

  return (
    <div className="ccf-container">
      <div className="ccf-carousel-section">
        <Carousel autoPlay showArrow="hover" indicatorType="line">
          <img src="/2f47b5a6-8917-4ee3-b486-2a6b5858b9d7.png" alt="slide1" className="carousel-img" />
          <img src="/a9a30680-ae5a-46f7-af31-36d6912b705c.png" alt="slide2" className="carousel-img" />
        </Carousel>
        <div className="ccf-signup-box">
          <Title heading={5}>公告栏</Title>
          <div className="announcement-container">
            {announcements.map(announcement => (
              <div 
                key={announcement.id}
                className="announcement-item"
                onClick={() => {
                  setSelectedAnnouncement(announcement);
                  setAnnouncementVisible(true);
                }}
              >
                {announcement.title}
              </div>
            ))}
          </div>
          <Modal
            style={{ wordBreak: 'break-all' }}
            title={selectedAnnouncement?.title}
            visible={visible}
            onOk={() => setVisible(false)}
            onCancel={() => setVisible(false)}
            footer={null}
          >
            <div style={{ padding: '20px' }}>
              {selectedAnnouncement?.content}
            </div>
          </Modal>
          </div>
      </div>

      <Divider />

      <div className="ccf-news-section">
        <Title heading={5}>📰 帖子墙</Title>
        <Row gutter={20}>
          {posts.map(post => (
            <Col span={12} key={post.id}>
              <Card hoverable onClick={() => navigate(`/detail/${post.id}`)} style={{ marginBottom: '20px' }}>
                {post.image_url && <img src={post.image_url} alt={post.title} className="news-img" />}
                <Title heading={6}>{post.title}</Title>
                <Paragraph>
                  {post.content.substring(0, 50)}...
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
        <Row style={{ display: 'flex', justifyContent: 'center' }}>
        <Button type="primary" onClick={() => { setVisible(true);form.resetFields();}}>😊我也来一条😊</Button>
        </Row>

      <Modal
        style={{ wordBreak: 'break-all' }}
        title={selectedAnnouncement?.title}
        visible={announcementVisible}
        onOk={() => setAnnouncementVisible(false)}
        onCancel={() => setAnnouncementVisible(false)}
        footer={null}
      >
        <div style={{ padding: '20px' }}>
          {selectedAnnouncement?.content}
        </div>
      </Modal>

      <Modal
        title="创建新帖子"
        visible={visible}
        onOk={handleSubmit}
        onCancel={() => {
          setVisible(false);
        }}
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

                  Message.loading({ content: '上传中...', duration: 0 });
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
                  Message.clear();
                  Message.success('上传成功');
                  onSuccess(data);
                } catch (error) {
                  console.error('上传错误:', error);
                  Message.clear();
                  Message.error('上传封面失败，请重试');
                  onError(error);
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
    </div>
  );
}
