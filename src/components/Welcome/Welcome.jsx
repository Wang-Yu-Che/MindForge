import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineCloudUpload, AiOutlineTeam, AiOutlineSafety } from 'react-icons/ai';
import './Welcome.css';

const Welcome = () => {
  const navigate = useNavigate();

  const handleDemoClick = () => {
    // 导航到示例笔记本页面
    navigate('/demo-notebook');
  };

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1 className="welcome-title">欢迎来到 MindForge</h1>

        <div className="welcome-card">
          <div className="welcome-header-content">
            <p className="welcome-subtitle">创建你的第一个笔记本</p>
            <p className="welcome-description">MindForge 是一款人工智能研究和写作助手，可以与您上传的资料完美配合</p>
          </div>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">
                <AiOutlineCloudUpload />
              </div>
              <h3 className="feature-title">上传你的文档</h3>
              <p className="feature-description">MindForge 将自动评估和理解您的文档内容并生成笔记</p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <AiOutlineTeam />
              </div>
              <h3 className="feature-title">协同合作</h3>
              <p className="feature-description">你可以与团队成员共享笔记本，实现高效协作</p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <AiOutlineSafety />
              </div>
              <h3 className="feature-title">安全可靠</h3>
              <p className="feature-description">所有数据都经过加密存储，确保你的信息安全</p>
            </div>
          </div>
          <div className="welcome-actions">
          <button className="create-button">创建</button>
          <span onClick={handleDemoClick} className="demo-link">尝试示例笔记本</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;