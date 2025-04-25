import React, { useState, useRef, useEffect } from 'react';
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

const DemoNote = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [leftCollapsed, setLeftCollapsed] = useState(window.innerWidth <= 768);
  const [rightCollapsed, setRightCollapsed] = useState(window.innerWidth <= 768);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '你好！这是演示模式，所有数据都是模拟的。',
      timestamp: new Date().toLocaleTimeString()
    },
    {
      role: 'user',
      content: '这是一个演示消息',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [sources, setSources] = useState([
    { icon: '📄', label: '演示文档1.pdf', url: '#' },
    { icon: '📄', label: '演示文档2.docx', url: '#' }
  ]);
  const [notes, setNotes] = useState([
    { id: 1, title: '演示笔记1', content: '这是第一个演示笔记', icon: '📝' },
    { id: 2, title: '演示笔记2', content: '这是第二个演示笔记', icon: '📝' }
  ]);
  const [showEditor, setShowEditor] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isReadOnly, setIsReadOnly] = useState(false);

  const toggleLeftPanel = () => setLeftCollapsed(!leftCollapsed);
  const toggleRightPanel = () => setRightCollapsed(!rightCollapsed);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '这是模拟的AI回复',
        timestamp: new Date().toLocaleTimeString()
      }]);
      setIsLoading(false);
    }, 1000);
  };

  const handleUpload = (file) => {
    setUploading(true);
    setUploadProgress(0);
    let hasShownMessage = false;

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setUploadModalVisible(false);
          if (!hasShownMessage) {
            Message.success('演示上传完成');
            hasShownMessage = true;
            setSources(prev => [...prev, { 
              icon: '📄', 
              label: file.name, 
              url: '#' 
            }]);
          }
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Layout className="demo-notebook-layout">
      {isMobile && (
        <>
          <Button 
            className="mobile-toggle-btn left"
            shape="circle"
            size="mini"
            onClick={() => setLeftCollapsed(!leftCollapsed)}
          >
            {leftCollapsed ? <IconArrowRight /> : <IconArrowLeft />}
          </Button>
          <Button 
            className="mobile-toggle-btn right"
            shape="circle"
            size="mini"
            onClick={() => setRightCollapsed(!rightCollapsed)}
          >
            {rightCollapsed ? <IconArrowRight /> : <IconArrowLeft />}
          </Button>
        </>
      )}
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
          {sources.map((item, idx) =>
            leftCollapsed ? (
              <div key={idx} className="source-icon">{item.icon}</div>
            ) : (
              <div key={idx} className="source-item">
                {item.icon} {item.label}
              </div>
            )
          )}
        </div>

        <Button
          icon={leftCollapsed ? <IconArrowRight /> : <IconArrowLeft />}
          onClick={toggleLeftPanel}
          size="mini"
          shape="circle"
          className="demo-collapse-btn left"
        />
      </Sider>

      {/* 中间聊天内容 */}
      <Content className="content-panel">
        <div className="chat-area">
          <Title heading={5} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            👋 演示模式
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
              placeholder="输入演示消息..."
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
                  <Button type="text" size="mini" shape="fill" className="icon-button" onClick={() => {
                    if (!isReadOnly && title && content) {
                      const newNote = {
                        id: notes.length + 1,
                        title: title,
                        content: content,
                        icon: '📝'
                      };
                      setNotes([...notes, newNote]);
                    }
                    setShowEditor(false);
                    setTitle('');
                    setContent('');
                  }}>{isReadOnly ? '返回' : '保存'}</Button>
                ) : null}
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
              </div>
            )}
            {showEditor ? (
              <div className="note-editor">
                <Input
                  value={title}
                  onChange={setTitle}
                  placeholder="标题"
                  disabled={isReadOnly}
                />
                <ReactQuill
                  value={content}
                  onChange={setContent}
                  readOnly={isReadOnly}
                  modules={{
                    toolbar: !isReadOnly
                  }}
                />
              </div>
            ) : (
              <div className="note-list">
                {notes.map(note => (
                  <div key={note.id} className="note-item" onClick={() => {
                    setShowEditor(true);
                    setIsReadOnly(true);
                    setTitle(note.title);
                    setContent(note.content);
                  }}>
                    <div className="note-icon">{note.icon}</div>
                    <div className="note-title">{note.title}</div>
                    <div className="note-content"> {note.content.replace(/<[^>]*>/g, '')}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="note-icons">
            {notes.map(note => (
              <div key={note.id} className="note-icon">{note.icon}</div>
            ))}
          </div>
        )}
        <Button
          icon={rightCollapsed ? <IconArrowRight /> : <IconArrowLeft />}
          onClick={toggleRightPanel}
          size="mini"
          shape="circle"
          className="demo-collapse-btn right"
        />
      </Sider>
    </Layout>
  );
};

export default DemoNote;