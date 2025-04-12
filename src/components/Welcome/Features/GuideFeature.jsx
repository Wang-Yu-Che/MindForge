import React from 'react';
import FeatureSection from '../FeatureSection/FeatureSection';

const GuideFeature = () => (
  <FeatureSection
    icon="📚"
    title="即时查阅的笔记指南"
    description="让您的研究内容随时可查，智能整理成易于理解的格式。"
    reverse
  >
    <div className="guide-preview">
      {/* 这里添加笔记指南预览 */}
    </div>
  </FeatureSection>
);

export default GuideFeature;