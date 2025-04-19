import React from 'react';
import FeatureSection from '../FeatureSection/FeatureSection';

const AnswerFeature = () => (
  <FeatureSection
    icon="💡"
    title="游走求索，不止于答"
    description="您可以放心地使用 MindForge 的所有资源。每个答案都来自于您上传的资料，并且会清晰地标明引用来源。"
  >
    <div className="answer-preview">
      {/* 这里添加问答界面预览 */}
    </div>
  </FeatureSection>
);

export default AnswerFeature;