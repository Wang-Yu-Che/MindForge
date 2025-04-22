import React from 'react';
import FeatureSection from '../FeatureSection/FeatureSection';

const AnswerFeature = () => (
  <FeatureSection
    icon="💡"
    title="游走求索，不止于答"
    description="您可以放心地使用 MindForge 的所有资源。每个答案都来自于您上传的资料，并且会清晰地标明引用来源。"
  >
    <div className="answer-preview">
      <video width="100%" autoPlay muted loop>
        <source src="/videos/see_the_source_not_just_the_answer.mp4" type="video/mp4" />
        您的浏览器不支持视频播放。
      </video>
    </div>
  </FeatureSection>
);

export default AnswerFeature;