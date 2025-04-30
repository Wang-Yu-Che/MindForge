import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import UserManagement from '../UserManagement/UserManagement';
import NoteManagement from '../NoteManagement/NoteManagement';
import NoteBookManagement from '../NotebookManagement/NotebookManagement';
import ResourceManagement from '../ResourceManagement/ResourceManagement';
import FeedbackManagement from '../FeedbackManagement/FeedbackManagement';
import {
  Layout,
  Menu,
  Breadcrumb,
  Grid,
  Card,
  Typography,
  Spin
} from '@arco-design/web-react';
import {
  IconUser,
  IconApps,
  IconFile
} from '@arco-design/web-react/icon';
const { Row } = Grid;
const { Title, Text } = Typography;
const { Sider, Header, Content } = Layout;

const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const location = useLocation();
  const [statistics, setStatistics] = useState({
    users: 0,
    notes: 0,
    resources: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟从API获取统计数据
    const fetchStatistics = () => {
      // 这里应该替换为实际的API调用
      setTimeout(() => {
        setStatistics({
          users: 128,
          notes: 356,
          resources: 89
        });
        setLoading(false);
      }, 1000);
    };

    fetchStatistics();
  }, []);

  const menuItems = [
    {
      key: 'dashboard',
      icon: <IconUser />,
      label: '页首'
    },
    {
      key: 'users',
      icon: <IconUser />,
      label: '用户管理'
    },
    {
        key: 'notebooks',
        icon: <IconUser />,
        label: '知识库管理'
      },
    {
      key: 'notes',
      icon: <IconApps />,
      label: '笔记管理'
    },
    {
      key: 'resources',
      icon: <IconFile />,
      label: '资源管理'
    },
    {
      key: 'feedback',
      icon: <IconFile />,
      label: '用户反馈'
    }
  ];

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider breakpoint="lg" collapsible style={{ paddingTop: 64 }}>
        <div style={{ padding: 20, fontSize: 20, color: '#fff' }}>管理后台</div>
        <Menu
          selectedKeys={[currentView]}
          onClickMenuItem={(key) => setCurrentView(key)}
          style={{ height: 'calc(100% - 64px)', borderRight: 0 }}
        >
          {menuItems.map(item => (
            <Menu.Item key={item.key} icon={item.icon}>
              {item.label}
            </Menu.Item>
          ))}
        </Menu>
      </Sider>

      <Layout>
        <Header style={{
          background: '#fff',
          padding: '0 20px',
          fontSize: 16,
          fontWeight: 500,
          position: 'fixed',
          width: '100%',
          zIndex: 100,
          height: 64
        }}>
          管理后台系统
        </Header>

        <Content style={{ margin: '84px 20px 20px', background: '#fff', padding: 20 }}>
          <Breadcrumb style={{ marginBottom: 20 }}>
            <Breadcrumb.Item>管理后台</Breadcrumb.Item>
            <Breadcrumb.Item>
              {menuItems.find(item => item.key === currentView)?.label || '首页'}
            </Breadcrumb.Item>
          </Breadcrumb>
          {currentView === 'dashboard' && (
              <Row gutter={16} style={{ marginBottom: 20 }}>
                <Grid.Col span={8}>
                  <Card>
                    <Spin loading={loading}>
                      <Title heading={6} style={{ marginBottom: 8 }}>用户总数</Title>
                      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{statistics.users}</Text>
                    </Spin>
                  </Card>
                </Grid.Col>
                <Grid.Col span={8}>
                  <Card>
                    <Spin loading={loading}>
                      <Title heading={6} style={{ marginBottom: 8 }}>笔记总数</Title>
                      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{statistics.notes}</Text>
                    </Spin>
                  </Card>
                </Grid.Col>
                <Grid.Col span={8}>
                  <Card>
                    <Spin loading={loading}>
                      <Title heading={6} style={{ marginBottom: 8 }}>资源总数</Title>
                      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{statistics.resources}</Text>
                    </Spin>
                  </Card>
                </Grid.Col>
              </Row>
            )}
            {currentView === 'users' && <UserManagement />}
            {currentView === 'notes' && <NoteManagement />}
            {currentView === 'notebooks' && <NoteBookManagement />}
            {currentView === 'resources' && <ResourceManagement />}
            {currentView === 'feedback' && <FeedbackManagement />}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
