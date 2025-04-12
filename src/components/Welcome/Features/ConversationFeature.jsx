import React from 'react';
import FeatureSection from '../FeatureSection/FeatureSection';

const ConversationFeature = () => (
  <FeatureSection
    icon="🗣️"
    title="随时随地的对话"
    description="只需点击一下，全部的资源内容立刻为您所用。让 AI 助手为您解答疑问。"
    reverse
  >
    <div className="conversation-preview">
      {/* 这里添加对话界面预览 */}
    </div>
  </FeatureSection>
);

export default ConversationFeature; 