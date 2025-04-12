import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineCloudUpload, AiOutlineTeam, AiOutlineSafety } from 'react-icons/ai';
import { Layout, Grid, Typography, Button, Space } from '@arco-design/web-react';
import '@arco-design/web-react/dist/css/arco.css';
import './Welcome.css';

const Welcome = () => {
  const navigate = useNavigate();

  const handleDemoClick = () => {
    navigate('/demo-notebook');
  };

  return (
    <Layout className="welcome-container">
      <Layout.Content className="welcome-content">
        <Typography.Title heading={1} className="welcome-title">欢迎来到 MindForge</Typography.Title>

        <div className="welcome-card">
          <Space direction="vertical" size={12}>
            <Typography.Title heading={3} style={{ margin: 0 }}>创建你的第一个笔记本</Typography.Title>
            <Typography.Text type="secondary">MindForge 是一款人工智能研究和写作助手，可以与您上传的资料完美配合</Typography.Text>
          </Space>

          <Grid.Row className="features-grid" gutter={24}>
            <Grid.Col span={8}>
              <Space direction="vertical" className="feature-item" align="center">
                <div className="feature-icon"><AiOutlineCloudUpload size={32} /></div>
                <Typography.Title heading={5}>上传你的文档</Typography.Title>
                <Typography.Text type="secondary" align="center">MindForge 将自动评估和理解您的文档内容并生成笔记</Typography.Text>
              </Space>
            </Grid.Col>
            <Grid.Col span={8}>
              <Space direction="vertical" className="feature-item" align="center">
                <div className="feature-icon"><AiOutlineTeam size={32} /></div>
                <Typography.Title heading={5}>协同合作</Typography.Title>
                <Typography.Text type="secondary" align="center">你可以与团队成员共享笔记本，实现高效协作</Typography.Text>
              </Space>
            </Grid.Col>
            <Grid.Col span={8}>
              <Space direction="vertical" className="feature-item" align="center">
                <div className="feature-icon"><AiOutlineSafety size={32} /></div>
                <Typography.Title heading={5}>安全可靠</Typography.Title>
                <Typography.Text type="secondary" align="center">所有数据都经过加密存储，确保你的信息安全</Typography.Text>
              </Space>
            </Grid.Col>
          </Grid.Row>

          <Space direction="vertical" size={8} className="welcome-actions">
            <Button type="primary" size="large">创建</Button>
            <Button type="text" onClick={handleDemoClick}>尝试示例笔记本</Button>
          </Space>
        </div>
      </Layout.Content>
    </Layout>
  );
};

export default Welcome;
