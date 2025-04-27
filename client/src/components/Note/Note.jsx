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
  Progress,
  List,
  Dropdown,
  Menu
} from '@arco-design/web-react';
import {
  IconPlus,
  IconArrowLeft,
  IconArrowRight,
  IconSend,
  IconMore
} from '@arco-design/web-react/icon';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './Note.css';

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
  const [uploadModalVisible, setUploadModalVisible] = useState(state?.showUploadModal || false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [sources, setSources] = useState([]);

  const fetchSources = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/sources?folderName=${encodeURIComponent(state?.libraryName || 'default')}&slug=${state?.slug || ''}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSources(data.map(source => ({
          icon: '📄',
          label: source.file_name,
          url: source.file_url,
          location:source.location
        })));
      }
    } catch (error) {
      console.error('获取源文件列表失败:', error);
      Message.error('获取源文件列表失败');
    }
  }, [state?.libraryName, state?.slug]);

  const fetchNotes = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/notes?folderName=${encodeURIComponent(state?.libraryName || 'default')}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setNotes(data.map(note => ({
          id: note.id,
          title: note.title,
          content: note.content,
          icon: '📝'
        })));
      }
    } catch (error) {
      console.error('获取笔记列表失败:', error);
      Message.error('获取笔记列表失败');
    }
  }, [state?.libraryName]);

  useEffect(() => {
    if (state?.showUploadModal) {
      setUploadModalVisible(true);
    }
    fetchSources();
    fetchNotes();
  }, [state?.showUploadModal, fetchSources, fetchNotes]);

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
  const [isReadOnly, setIsReadOnly] = useState(false);

  const [notes, setNotes] = useState([]);

  const handleListResize = useCallback(() => {
    let rafId;
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      rafId = null;
    };
    
    if (!rafId) {
      rafId = requestAnimationFrame(scrollToBottom);
    }
    
    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(handleListResize);
    const messageContainer = document.querySelector('.message-container');
    
    if (messageContainer) {
      resizeObserver.observe(messageContainer);
    }

    return () => {
      if (messageContainer) {
        resizeObserver.unobserve(messageContainer);
      }
      resizeObserver.disconnect();
    };
  }, [handleListResize]);
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    if (!state?.slug) {
      Message.error('工作区slug是必需的');
      return;
    }

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
          conversationId: localStorage.getItem('userId'),
          slug: state?.slug,
          mode: 'chat',
          attachments: []
        }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.textResponse,
        timestamp: new Date().toLocaleTimeString(),
        metrics: data.metrics,
        sources: data.sources
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

  // 获取聊天历史
  const fetchChatHistory = useCallback(async () => {
    if (!state?.slug) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/chat/${state.slug}/history?limit=100&orderBy=asc&apiSessionId=${localStorage.getItem('userId')}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      const formattedMessages = data.history.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.sentAt * 1000).toLocaleTimeString(),
        metrics: msg.metrics,
        sources: msg.sources
      }));

      setMessages([{
        role: 'assistant',
        content: '你好！我是MindForge助手，有什么可以帮你的吗？',
        timestamp: new Date().toLocaleTimeString()
      }, ...formattedMessages]);
    } catch (error) {
      console.error('获取聊天历史失败:', error);
      Message.error('获取聊天历史失败');
    }
  }, [state?.slug]);

  useEffect(() => {
    fetchChatHistory();
    
    const handleBackButton = () => {
      window.history.pushState(null, '', '/note-book-list');
      window.location.reload();
    };
    
    window.addEventListener('popstate', handleBackButton);
    
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [fetchChatHistory]);

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
          <Title heading={5} style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>👋 MindForge 聊天</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                size="mini"
                onClick={async () => {
                  try {
                    const exportData = {
                      version: '1.0',
                      timestamp: new Date().toISOString(),
                      messages,
                      sources,
                      notes,
                      libraryName: state?.libraryName || 'default',
                      slug: state?.slug
                    };
                    
                    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `mindforge-notebook-${new Date().toISOString().split('T')[0]}.json`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    
                    Message.success('导出成功');
                  } catch (error) {
                    console.error('导出失败:', error);
                    Message.error('导出失败');
                  }
                }}
              >
                导出
              </Button>
              <Button
                size="mini"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.json';
                  input.onchange = async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    
                    try {
                      const reader = new FileReader();
                      reader.onload = async (e) => {
                        try {
                          const importData = JSON.parse(e.target.result);
                        
                          // 验证导入数据的格式
                          if (!importData.version || !importData.timestamp) {
                            throw new Error('无效的导入文件格式');
                          }

                          // 验证必要字段
                          if (!Array.isArray(importData.messages) || !Array.isArray(importData.sources) || !Array.isArray(importData.notes)) {
                            throw new Error('导入数据格式错误：缺少必要字段');
                          }

                          // 验证消息格式
                          for (const msg of importData.messages) {
                            if (!msg.role || !msg.content || !msg.timestamp) {
                              throw new Error('导入数据格式错误：消息格式无效');
                            }
                          }

                          // 验证来源格式
                          for (const source of importData.sources) {
                            if (!source.icon || !source.label || !source.url) {
                              throw new Error('导入数据格式错误：来源格式无效');
                            }
                          }

                          // 验证笔记格式
                          for (const note of importData.notes) {
                            if (!note.id || !note.title || !note.content || !note.icon) {
                              throw new Error('导入数据格式错误：笔记格式无效');
                            }
                          }

                          try {
                            const token = localStorage.getItem('token');
                            const response = await fetch('http://localhost:3001/api/notes/import', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify({
                                libraryName: state?.libraryName || 'default',
                                slug: state?.slug,
                                notes: importData.notes || [],
                                messages: importData.messages || [],
                                sources: importData.sources || []
                              })
                            });

                            if (!response.ok) {
                              throw new Error('导入数据保存失败');
                            }

                            const result = await response.json();
                            setMessages(result.messages || []);
                            setSources(result.sources || []);
                            setNotes(result.notes || []);
                            
                            Message.success('导入成功并保存到数据库');
                          } catch (error) {
                            console.error('保存导入数据失败:', error);
                            Message.error('导入数据保存失败');
                          }
                        } catch (error) {
                          console.error('解析导入文件失败:', error);
                          Message.error('导入失败：无效的文件格式');
                        }
                      };
                      reader.readAsText(file);
                    } catch (error) {
                      console.error('导入失败:', error);
                      Message.error('导入失败');
                    }
                  };
                  input.click();
                }}
              >
                导入
              </Button>
            </div>
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
                  <Button type="text" size="mini" shape="fill" className="icon-button" onClick={async () => {
                    if (isReadOnly) {
                      setShowEditor(false);
                      await fetchNotes();
                      return;
                    }
                    if (!title.trim() && !content.trim()) {
                      setShowEditor(false);
                      await fetchNotes();
                      return;
                    }
                    setShowEditor(false);
                    try {
                      const response = await fetch('http://localhost:3001/api/notes', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        },
                        body: JSON.stringify({
                          title,
                          content,
                          folderName: state?.libraryName || 'default'
                        })
                      });
                      if (response.ok) {
                        Message.success('笔记保存成功');
                        await fetchNotes();
                      } else {
                        throw new Error('保存失败');
                      }
                    } catch (error) {
                      console.error('保存笔记失败:', error);
                      Message.error('保存笔记失败');
                    }
                  }}>{isReadOnly ? '返回' : '保存'}</Button>
                ) : !rightCollapsed ? null : (
                  <Button
                    icon={<IconPlus />}
                    size="mini"
                    shape="fill"
                    type="text"
                    className="icon-button"
                    onClick={() => {
                      setRightCollapsed(false);
                      setShowEditor(true);
                      setIsReadOnly(false);
                      setTitle('');
                      setContent('');
                    }}
                  />
                )}
              </div>
            </div>
            {!showEditor && (
              <div className="note-buttons">
                <Button type="outline" style={{ gridColumn: 'span 2' }} onClick={() => {
                  setShowEditor(!showEditor);
                  setIsReadOnly(false);
                  setTitle('');
                  setContent('');
                }}>添加注释</Button>
                <Button type="outline" onClick={async () => {
                  setShowEditor(true);
                  setIsReadOnly(true);
                  setTitle('学习指南');
                  setContent('加载中...');
                  try {
                    const response = await fetch('http://localhost:3001/api/chat/simple', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                      },
                      body: JSON.stringify({
                        message: '请给我对所有资源文档包括注释内容的学习指南',
                        slug: state?.slug || 'default',
                        mode: 'chat',
                        title: '学习指南'
                      })
                    });
                    
                    if (!response.ok) {
                      throw new Error(`API响应状态: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    Message.success('学习指南生成成功');
                    setMessages(prev => [...prev, {
                      role: 'assistant',
                      content: data.textResponse,
                      timestamp: new Date().toLocaleTimeString()
                    }]);
                    setContent(data.textResponse);
                    await fetchNotes();
                  } catch (error) {
                    console.error('生成学习指南失败:', error);
                    Message.error('生成学习指南失败');
                    setShowEditor(false);
                  }
                }}>学习指南</Button>
                <Button type="outline" onClick={async () => {
                  setShowEditor(true);
                  setIsReadOnly(true);
                  setTitle('文件内容总结');
                  setContent('加载中...');
                  try {
                    const response = await fetch('http://localhost:3001/api/chat/simple', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                      },
                      body: JSON.stringify({
                        message: '请将每个文件文档的内容总结更改下',
                        slug: state?.slug || 'default',
                        mode: 'chat',
                        title: '简报文件'
                      })
                    });
                    
                    if (!response.ok) {
                      throw new Error(`API响应状态: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    Message.success('文件内容总结修改请求已发送');
                    setMessages(prev => [...prev, {
                      role: 'assistant',
                      content: data.textResponse,
                      timestamp: new Date().toLocaleTimeString()
                    }]);
                    setContent(data.textResponse);
                    await fetchNotes();
                  } catch (error) {
                    console.error('修改文件内容总结失败:', error);
                    Message.error('修改文件内容总结失败');
                    setShowEditor(false);
                  }
                }}>简报文件</Button>
                <Button type="outline" onClick={async () => {
                  setShowEditor(true);
                  setIsReadOnly(true);
                  setTitle('常问问题');
                  setContent('加载中...');
                  try {
                    const response = await fetch('http://localhost:3001/api/chat/simple', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                      },
                      body: JSON.stringify({
                        message: '请针对每个文件文档给我生成他们对内容可能会问的问题',
                        slug: state?.slug || 'default',
                        mode: 'chat',
                        title: '常问问题'
                      })
                    });
                    
                    if (!response.ok) {
                      throw new Error(`API响应状态: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    Message.success('问题生成成功');
                    setMessages(prev => [...prev, {
                      role: 'assistant',
                      content: data.textResponse,
                      timestamp: new Date().toLocaleTimeString()
                    }]);
                    setContent(data.textResponse);
                    await fetchNotes();
                  } catch (error) {
                    console.error('生成问题失败:', error);
                    Message.error('生成问题失败');
                    setShowEditor(false);
                  }
                }}>常问问题</Button>
                <Button type="outline" onClick={async () => {
                  setShowEditor(true);
                  setIsReadOnly(true);
                  setTitle('时间线');
                  setContent('加载中...');
                  try {
                    const response = await fetch('http://localhost:3001/api/chat/simple', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                      },
                      body: JSON.stringify({
                        message: '对从聊天开始的所有对话以及文档上传，注释添加总结成时间线 详细展示给我',
                        slug: state?.slug || 'default',
                        mode: 'chat',
                        title: '时间线'
                      })
                    });
                    
                    if (!response.ok) {
                      throw new Error(`API响应状态: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    Message.success('时间线生成成功');
                    setMessages(prev => [...prev, {
                      role: 'assistant',
                      content: data.textResponse,
                      timestamp: new Date().toLocaleTimeString()
                    }]);
                    setContent(data.textResponse);
                    await fetchNotes();
                  } catch (error) {
                    console.error('生成时间线失败:', error);
                    Message.error('生成时间线失败');
                    setShowEditor(false);
                  }
                }}>时间线</Button>
              </div>
            )}
            {showEditor ? (
              <div>
                <Input
                  placeholder="注释标题"
                  value={title}
                  onChange={setTitle}
                  allowClear
                  readOnly={isReadOnly}
                  className="sider-search"
                />
                <div style={{ marginTop: 0 }}>
                  <div style={{ flex: 1, minHeight: 0, marginBottom: 24 }}>
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    readOnly={isReadOnly}
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
                    <Button type="outline" onClick={async () => {
                      try {
                        const response = await fetch('http://localhost:3001/api/sources/convert', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                          },
                          body: JSON.stringify({
                            fileName: title,
                            fileContent: content,
                            userId: localStorage.getItem('userId'),
                            libraryName: state?.libraryName || 'default'
                          })
                        });
                        if (response.ok) {
                          Message.success('转换成功');
                          await fetchSources();
                        } else {
                          throw new Error('转换失败');
                        }
                      } catch (error) {
                        console.error('转换失败:', error);
                        Message.error('转换失败');
                      }
                    }}>转换成源</Button>
                  </div>
                </div>
              </div>
            ) : (
              <List className="note-list">
                {notes.map((note, idx) => (
                  <List.Item 
                    key={idx} 
                    className="note-item"
                  >
                    <div className="note-title" onClick={() => {
                      setTitle(note.title);
                      setContent(note.content);
                      setShowEditor(true);
                      setIsReadOnly(true);
                    }}>
                      <Typography.Title heading={6} style={{ margin: 0 }}>
                        {note.icon} {note.title}
                      </Typography.Title>
                    </div>
                    <Typography.Text type="secondary" className="note-text">
                      {note.content.replace(/<[^>]*>/g, '')}
                    </Typography.Text>
                    <Dropdown
                      droplist={
                        <Menu>
                          <Menu.Item key="edit" onClick={() => {
                            Modal.confirm({
                              title: '编辑标题',
                              content: (
                                <Input 
                                  defaultValue={note.title}
                                  onChange={(value) => setTitle(value)}
                                />
                              ),
                              onOk: async () => {
                                try {
                                  const response = await fetch(`http://localhost:3001/api/notes/${note.id}`, {
                                    method: 'PUT',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                    },
                                    body: JSON.stringify({
                                      title: title || note.title,
                                      content: note.content
                                    })
                                  });
                                  if (response.ok) {
                                    Message.success('标题更新成功');
                                    await fetchNotes();
                                  } else {
                                    throw new Error('更新失败');
                                  }
                                } catch (error) {
                                  console.error('更新标题失败:', error);
                                  Message.error('更新标题失败');
                                }
                              }
                            });
                          }}>编辑标题</Menu.Item>
                          <Menu.Item key="delete" onClick={async () => {
                            try {
                              const response = await fetch(`http://localhost:3001/api/notes/${note.id}`, {
                                method: 'DELETE',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                },
                              });
                              if (response.ok) {
                                Message.success('删除成功');
                                await fetchNotes();
                              } else {
                                throw new Error('删除失败');
                              }
                            } catch (error) {
                              console.error('删除笔记失败:', error);
                              Message.error('删除笔记失败');
                            }
                          }}>删除</Menu.Item>
                        </Menu>
                      }
                      trigger="click"
                      position="br"
                      getPopupContainer={(triggerNode) => triggerNode.parentNode}
                    >
                      <Button type="text" icon={<IconMore />} />
                    </Dropdown>
                  </List.Item>
                ))}
              </List>
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
                onClick={() => {
                  setRightCollapsed(false);
                  setShowEditor(true);
                  setIsReadOnly(false);
                  setTitle('');
                  setContent('');
                }}
              />
            </div>
            <div className="source-list">
              {notes.map((note, idx) =>
                <div key={idx} className="source-icon" onClick={() => {
                  setRightCollapsed(false);
                  setShowEditor(true);
                  setIsReadOnly(true);
                  setTitle(note.title);
                  setContent(note.content);
                }}>{note.icon}</div>
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