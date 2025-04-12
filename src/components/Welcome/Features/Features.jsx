import React from 'react';
import './Features.css';

const Features = () => {
  return (
    <section className="features">
      <div className="features-container">
        <div className="feature-grid">
          <div className="feature-item">
            <div className="feature-icon">🔍</div>
            <h3>智能分析</h3>
            <p>快速理解和提取文档中的关键信息，帮助您更高效地获取知识</p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">💡</div>
            <h3>深度洞察</h3>
            <p>通过AI技术，挖掘内容之间的关联，形成知识网络</p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">🔄</div>
            <h3>实时互动</h3>
            <p>与AI助手进行自然对话，获得即时的解答和建议</p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">🛡️</div>
            <h3>安全可靠</h3>
            <p>基于本地部署的Ollama模型，确保数据安全和隐私保护</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features; 