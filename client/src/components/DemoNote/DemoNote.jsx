import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import {
  Layout,
  Button,
  Input,
  Typography,
  Spin,
  Avatar,
  Message,
  Modal,
  Upload,
  Progress
} from '@arco-design/web-react';
import {
  IconPlus,
  IconArrowLeft,
  IconArrowRight,
  IconSend
} from '@arco-design/web-react/icon';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './DemoNote.css';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

const DemoNotebook = () => {
  const { state } = useLocation();
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
  const [uploadModalVisible, setUploadModalVisible] = useState(state?.showUploadModal || false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [sources, setSources] = useState([]);

  const fetchSources = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/sources?folderName=${encodeURIComponent(state?.libraryName || 'default')}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSources(data.map(source => ({
          icon: '📄',
          label: source.file_name,
          url: source.file_url
        })));
      }
    } catch (error) {
      console.error('获取源文件列表失败:', error);
      Message.error('获取源文件列表失败');
    }
  }, [state?.libraryName]);

  useEffect(() => {
    if (state?.showUploadModal) {
      setUploadModalVisible(true);
    }
    fetchSources();
  }, [state?.showUploadModal, fetchSources]);

  const handleUpload = async (file) => {
    if (!file) {
      const container = document.createElement('div');
      const root = createRoot(container);
      root.render(<Message type="error">请选择要上传的文件</Message>);
      document.body.appendChild(container);
      setTimeout(() => {
        root.unmount();
        document.body.removeChild(container);
      }, 3000);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', localStorage.getItem('userId'));
    formData.append('libraryName', state?.libraryName || 'default');
    formData.append('fileName', encodeURIComponent(file.name));

    try {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.open('POST', 'http://localhost:3001/api/sources/upload');
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
      xhr.send(formData);

      const response = await new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({
              ok: true,
              json: () => Promise.resolve(JSON.parse(xhr.responseText))
            });
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Network error'));
      });

      const result = await response.json();
      if (result.fileUrl) {
        const container = document.createElement('div');
        const root = createRoot(container);
        root.render(<Message type="success">文件上传成功</Message>);
        document.body.appendChild(container);
        setTimeout(() => {
          root.unmount();
          document.body.removeChild(container);
        }, 3000);
        setUploadModalVisible(false);
        await fetchSources();
      } else {
        throw new Error('文件上传成功但未返回文件URL');
      }
    } catch (error) {
      console.error('文件上传失败:', error);
      const container = document.createElement('div');
      const root = createRoot(container);
      root.render(<Message type="error">{error.message || '文件上传失败，请稍后重试'}</Message>);
      document.body.appendChild(container);
      setTimeout(() => {
        root.unmount();
        document.body.removeChild(container);
      }, 3000);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const toggleLeftPanel = () => setLeftCollapsed(!leftCollapsed);
  const toggleRightPanel = () => setRightCollapsed(!rightCollapsed);
  const [showEditor, setShowEditor] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

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
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
      {/* 左侧面板 */}
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
            onClick={() => setUploadModalVisible(true)}
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
                  <Button
                    type="primary"
                    style={{ marginTop: 16 }}
                    onClick={() => setUploadModalVisible(true)}
                  >
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

      {/* 中间聊天内容 */}
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

          <Modal
            title="上传源"
            visible={uploadModalVisible}
            onOk={() => setUploadModalVisible(false)}
            onCancel={() => setUploadModalVisible(false)}
            footer={null}
          >
            <Upload
              drag
              accept=".txt,.pdf,.doc,.docx"
              showUploadList={false}
              customRequest={({ file }) => handleUpload(file)}
            >
              <div style={{
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%'
              }}>
                <div style={{ marginBottom: 16 }}>
                  <IconPlus style={{ fontSize: 24, color: 'var(--color-text-3)' }} />
                </div>
                <div style={{ color: 'var(--color-text-2)' }}>点击或拖拽文件到此处上传</div>
                <div style={{ color: 'var(--color-text-3)', fontSize: 12, marginTop: 8 }}>
                  支持 .txt, .pdf, .doc, .docx 格式
                </div>
              </div>
            </Upload>
            {uploading && (
              <div style={{ marginTop: 16 }}>
                <Progress percent={uploadProgress} />
              </div>
            )}
          </Modal>
        </div>
      </Content>

      {/* 右侧面板 */}
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
            <div className="sider-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ flex: 1 }}>笔记</Text>
              <div>
                {showEditor ? (
                  <Button type="text" size="mini" shape="fill" className="icon-button" onClick={() => setShowEditor(false)}>返回</Button>
                ) : !rightCollapsed ? null : (
                  <Button
                    icon={<IconPlus />}
                    type="text" size="mini" shape="fill"
                    className="icon-button"
                  />
                )}
              </div>
            </div>
            {!showEditor && (
              <div className="note-buttons">
                <Button type="outline" style={{ gridColumn: 'span 2' }} onClick={() => setShowEditor(!showEditor)}>添加注释</Button>
                <Button type="outline">学习指南</Button>
                <Button type="outline">简报文件</Button>
                <Button type="outline">常问问题</Button>
                <Button type="outline">时间线</Button>
              </div>
            )}
            {showEditor ? (
              <div>
                <Input
                  placeholder="注释标题"
                  value={title}
                  onChange={setTitle}
                  allowClear
                  className="sider-search"
                />
                <div style={{ marginTop: 0 }}>
                  <div style={{ flex: 1, minHeight: 0, marginBottom: 24 }}>
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    style={{ height: 295 }}
                  />
                </div>
                  <div style={{ 
                    marginTop: 110,
                    display: 'flex', 
                    gap: 8,
                    paddingBottom: 16,
                    justifyContent: 'flex-end'
                  }}>
                    <Button type="outline">转换成源</Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="note-list">
                {notes.map((note, idx) => (
                  <div key={idx} className="note-item">
                    <div className="note-title">{note.icon} {note.title}</div>
                    <div className="note-text">{note.content}</div>
                  </div>
                ))}
              </div>
            )}
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