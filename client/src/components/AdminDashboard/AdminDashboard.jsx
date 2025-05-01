import React, { useState, useEffect } from 'react';
import UserManagement from '../UserManagement/UserManagement';
import NoteManagement from '../NoteManagement/NoteManagement';
import NoteBookManagement from '../NotebookManagement/NotebookManagement';
import ResourceManagement from '../ResourceManagement/ResourceManagement';
import FeedbackManagement from '../FeedbackManagement/FeedbackManagement';
import CementManagement from '../CementManagement/CementManagement';
import CommentManagement from '../CommentManagement/CommentManagement';
import ForumPageManagement from '../ForumPageManagement/ForumPageManagement';
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
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

const { Row } = Grid;
const { Title, Text } = Typography;
const { Sider, Header, Content } = Layout;

const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [statistics, setStatistics] = useState({
    users: 0,
    notes: 0,
    resources: 0
  });
  const [chartData, setChartData] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [fileDistribution, setFileDistribution] = useState([]);
  const [feedbackPref, setFeedbackPref] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch(`http://localhost:3002/api/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) throw new Error('获取统计数据失败');
        const data = await response.json();

        setStatistics({
          users: data.totalCounts.userCount,
          notes: data.totalCounts.noteCount,
          resources: data.totalCounts.fileCount
        });

        const dateMap = {};
        const process = (key) => {
          data.dailyStats[key].forEach(item => {
            const date = new Date(item.date).toISOString().slice(0, 10);
            if (!dateMap[date]) dateMap[date] = { date };
            dateMap[date][key] = item.count;
          });
        };
        ['users', 'notes', 'files', 'feedback'].forEach(process);

        setChartData(Object.values(dateMap).sort((a, b) => new Date(a.date) - new Date(b.date)));
        setTopUsers(data.topUsersByNotes);
        setFileDistribution(data.fileLocationDistribution);
        setFeedbackPref(data.feedbackEmailUpdates);
      } catch (error) {
        console.error('获取统计数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const menuItems = [
    { key: 'dashboard', icon: <IconUser />, label: '页首' },
    { key: 'users', icon: <IconUser />, label: '用户管理' },
    { key: 'notebooks', icon: <IconUser />, label: '知识库管理' },
    { key: 'notes', icon: <IconApps />, label: '笔记管理' },
    { key: 'resources', icon: <IconFile />, label: '资源管理' },
    { key: 'feedback', icon: <IconFile />, label: '用户反馈' },
    { key: 'cement', icon: <IconFile />, label: '公告管理' },
    { key: 'comment', icon: <IconFile />, label: '评论管理' },
    { key: 'forum', icon: <IconFile />, label: '帖子管理' }
  ];

  const COLORS = ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f'];

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider breakpoint="lg" collapsible>
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
            <>
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

              <Card style={{ marginBottom: 20 }}>
                <Title heading={6}>每日新增趋势</Title>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" name="新增用户" stroke="#4e79a7" />
                    <Line type="monotone" dataKey="notes" name="新增笔记" stroke="#f28e2b" />
                    <Line type="monotone" dataKey="files" name="新增资源" stroke="#e15759" />
                    <Line type="monotone" dataKey="feedback" name="新增反馈" stroke="#59a14f" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card style={{ marginBottom: 20 }}>
                <Title heading={6}>Top 用户笔记数</Title>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topUsers}>
                    <XAxis dataKey="email" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="noteCount" fill="#4e79a7" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Row gutter={16}>
                <Grid.Col span={12}>
                  <Card>
                    <Title heading={6}>文件位置分布</Title>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={fileDistribution}
                          dataKey="count"
                          nameKey="location"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {fileDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                </Grid.Col>

                <Grid.Col span={12}>
                  <Card>
                    <Title heading={6}>用户反馈邮件订阅偏好</Title>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={feedbackPref.map(i => ({
                            name: i.email_updates ? '愿意接收' : '不愿接收',
                            value: i.count
                          }))}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {feedbackPref.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                </Grid.Col>
              </Row>
            </>
          )}

          {currentView === 'users' && <UserManagement />}
          {currentView === 'notes' && <NoteManagement />}
          {currentView === 'notebooks' && <NoteBookManagement />}
          {currentView === 'resources' && <ResourceManagement />}
          {currentView === 'feedback' && <FeedbackManagement />}
          {currentView === 'cement' && <CementManagement />}
          {currentView === 'comment' && <CommentManagement />}
          {currentView === 'forum' && <ForumPageManagement />}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
