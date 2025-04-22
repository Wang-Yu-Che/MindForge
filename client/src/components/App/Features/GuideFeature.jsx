import React from 'react';
import FeatureSection from '../FeatureSection/FeatureSection';

const GuideFeature = () => (
  <FeatureSection
    icon="📚"
    title="即时查阅的笔记指南"
    description="让您的研究内容随时可查，智能整理成易于理解的格式。"
    reverse
  >
    <div className="guide-preview" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <img 
        src="/a9a30680-ae5a-46f7-af31-36d6912b705c.png" 
        alt="笔记指南预览"
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
      />
    </div>
  </FeatureSection>
);

export default GuideFeature;