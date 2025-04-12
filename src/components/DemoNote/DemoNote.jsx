import React, { useState } from 'react';
import {
  Layout,
  Button,
  Input,
  Typography,
  Divider,
} from '@arco-design/web-react';
import {
  IconPlus,
  IconArrowLeft,
  IconArrowRight,
} from '@arco-design/web-react/icon';
import './DemoNote.css';

const { Sider, Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const DemoNotebook = () => {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  const toggleLeftPanel = () => setLeftCollapsed(!leftCollapsed);
  const toggleRightPanel = () => setRightCollapsed(!rightCollapsed);

  const sources = [
    { icon: '📘', label: 'NotebookLM 入门' },
    { icon: '📄', label: 'NotebookLM 功能' },
    { icon: '📘', label: 'NotebookLM 词汇表' },
    { icon: '📘', label: 'NotebookLM 故障排除' },
    { icon: '📘', label: '使用 NotebookLM 作为帮助中心或共享知识库' },
    { icon: '📘', label: '使用 NotebookLM 进行研究' },
    { icon: '📘', label: '使用 NotebookLM 记录会议' },
  ];

  const notes = [
    {
      icon: '🟠',
      title: '关于此笔记本',
      content: '这款笔记本旨在帮助您了解 NotebookLM 的功能。',
    },
    {
      icon: '🟠',
      title: '我为什么不能写笔记？',
      content: '这是一个只读的演示笔记本，用于体验基本功能。',
    },
  ];

  return (
    <Layout className="demo-notebook-layout">
      {/* 左侧面板 */}
      <Sider
        width={260}
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
            shape="circle"
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
          className="collapse-btn left"
        />
      </Sider>

      {/* 中间内容 */}
      <Content className="content-panel">
        <div className="chat-area">
          <Title heading={5} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            👋 NotebookLM 简介
          </Title>
          <Paragraph className="chat-intro">
            <Text bold>NotebookLM</Text> 是一款人工智能工具，旨在帮助用户理解和处理他们上传的文档及其他数字内容。
          </Paragraph>
          <div className="chat-buttons">
            <Button type="outline">保存到笔记</Button>
            <Button type="outline">添加注释</Button>
            <Button type="outline">音频概述</Button>
            <Button type="outline">思维导图</Button>
          </div>
          <Divider />
          <Input.TextArea
            placeholder="NotebookLM 如何处理上传的信息源进行交互？"
            allowClear
            autoSize
            className="chat-input"
          />
        </div>
      </Content>

      {/* 右侧面板 */}
      <Sider
        width={320}
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
          <div className="note-icons">
            <Button icon={<IconPlus />} size="mini" shape="circle" type="text" />
            {notes.map((note, idx) => (
              <div key={idx} className="note-icon">{note.icon}</div>
            ))}
          </div>
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
