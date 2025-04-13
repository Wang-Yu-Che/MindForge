import React, { useState, useEffect, useRef } from 'react';
import {
  Layout,
  Button,
  Input,
  Typography,
  Spin,
  Avatar
} from '@arco-design/web-react';
import {
  IconPlus,
  IconArrowLeft,
  IconArrowRight,
  IconSend
} from '@arco-design/web-react/icon';
import './DemoNote.css';
import { Message } from '@arco-design/web-react';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

const DemoNotebook = () => {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: '你好！我是MindForge助手，有什么可以帮你的吗？',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [conversationId] = useState(Date.now().toString());
  const [uploadModalVisible, setUploadModalVisible] = useState(false);

  const toggleLeftPanel = () => setLeftCollapsed(!leftCollapsed);
  const toggleRightPanel = () => setRightCollapsed(!rightCollapsed);

  const sources = [
    { icon: '📘', label: 'MindForge 入门' },
    { icon: '📄', label: 'MindForge 功能' },
    { icon: '📘', label: 'MindForge 词汇表' },
    { icon: '📘', label: 'MindForge 故障排除' },
    { icon: '📘', label: '使用 MindForge 作为帮助中心或共享知识库' },
    { icon: '📘', label: '使用 MindForge 进行研究' },
    { icon: '📘', label: '使用 MindForge 记录会议' },
  ];

  const notes = [
    {
      icon: '🟠',
      title: '关于此笔记本',
      content: '这款笔记本旨在帮助您了解 MindForge 的功能。',
    },
    {
      icon: '🟠',
      title: '我为什么不能写笔记？',
      content: '这是一个只读的演示笔记本，用于体验基本功能。',
    },
  ];

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage = { 
      role: 'user', 
      content: inputValue,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          conversationId: conversationId,
          history: messages.filter(msg => msg.role !== 'system')
        }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (error) {
      console.error('Error:', error);
      Message.error('发送消息失败');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '抱歉，发生了一些错误，请稍后再试。',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Layout className="demo-notebook-layout">
      {/* 左侧面板 - 保持不变 */}
      <Sider
        width={320}
        collapsedWidth={60} 
        collapsed={leftCollapsed}
        collapsible
        trigger={null}
        className="sider-panel"
      >
        <div className="sider-header">
          {!leftCollapsed && <Text className="section-title">来源</Text>}
          <Button
            icon={<IconPlus />}
            size="mini"
            shape="fill"
            type="text"
            className="icon-button"
          >
            {!leftCollapsed && '添加'}
          </Button>
        </div>

        {!leftCollapsed && (
          <Input.Search
            placeholder="搜索来源"
            allowClear
            className="sider-search"
          />
        )}

        <div className="source-list">
          {sources.length === 0 ? (
            <div className="empty-source" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              textAlign: 'center',
              color: 'var(--color-text-3)'
            }}>
              {leftCollapsed ? (
                <IconPlus style={{ fontSize: 24 }} />
              ) : (
                <>
                  <IconPlus style={{ fontSize: 32, marginBottom: 16 }} />
                  <Typography.Text>添加源以开始</Typography.Text>
                  <Button type="primary" style={{ marginTop: 16 }} onClick={() => setUploadModalVisible(true)}>
                    上传源
                  </Button>
                </>
              )}
            </div>
          ) : (
            sources.map((item, idx) =>
              leftCollapsed ? (
                <div key={idx} className="source-icon">{item.icon}</div>
              ) : (
                <div key={idx} className="source-item">
                  {item.icon} {item.label}
                </div>
              )
            )
          )}
        </div>

        <Button
          icon={leftCollapsed ? <IconArrowRight /> : <IconArrowLeft />}
          onClick={toggleLeftPanel}
          size="mini"
          shape="circle"
          className="collapse-btn left"
        />
      </Sider>

      {/* 中间内容 - 更新为聊天界面 */}
      <Content className="content-panel">
        <div className="chat-area">
          <Title heading={5} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            👋 MindForge 聊天
          </Title>
          
          <div className="message-container">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="message-header">
                  <Avatar size={24}>
                    {msg.role === 'user' ? '你' : 'AI'}
                  </Avatar>
                  <span className="message-time">{msg.timestamp}</span>
                </div>
                <div className="message-content">{msg.content}</div>
              </div>
            ))}
            {isLoading && (
              <div className="message assistant">
                <Spin loading={true} size={12} />
                <span style={{ marginLeft: 8 }}>思考中...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            <Input.TextArea
              value={inputValue}
              onChange={setInputValue}
              placeholder="输入您的问题..."
              allowClear
              autoSize={{ minRows: 1, maxRows: 4 }}
              className="chat-input"
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button 
              type="primary" 
              shape="circle"
              icon={<IconSend />}
              onClick={handleSendMessage}
              loading={isLoading}
              disabled={!inputValue.trim()}
              className="send-button"
            />
          </div>
        </div>
      </Content>

      {/* 右侧面板 - 保持不变 */}
      <Sider
        width={320}
        collapsedWidth={60} 
        collapsed={rightCollapsed}
        collapsible
        trigger={null}
        className="right-panel"
      >
        {!rightCollapsed ? (
          <>
            <Title heading={6}>笔记</Title>
            <div className="note-buttons">
              <Button type="outline" style={{ gridColumn: 'span 2' }}>添加注释</Button>
              <Button type="outline">学习指南</Button>
              <Button type="outline">简报文件</Button>
              <Button type="outline">常问问题</Button>
              <Button type="outline">时间线</Button>
            </div>
            <div className="note-list">
              {notes.map((note, idx) => (
                <div key={idx} className="note-item">
                  <div className="note-title">{note.icon} {note.title}</div>
                  <div className="note-text">{note.content}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="sider-header">
              <Button
                icon={<IconPlus />}
                size="mini"
                shape="fill"
                type="text"
                className="icon-button"
              />
            </div>
            <div className="source-list">
              {notes.map((note, idx) =>
                <div key={idx} className="source-icon">{note.icon}</div>
              )}
            </div>
          </>
        )}

        <Button
          icon={rightCollapsed ? <IconArrowLeft /> : <IconArrowRight />}
          onClick={toggleRightPanel}
          size="mini"
          shape="circle"
          className="collapse-btn right"
        />
      </Sider>
    </Layout>
  );
};

export default DemoNotebook;
