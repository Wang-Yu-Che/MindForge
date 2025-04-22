import React from 'react';
import FeatureSection from '../FeatureSection/FeatureSection';

const ConversationFeature = () => (
  <FeatureSection
    icon="🗣️"
    title="随时随地的对话"
    description="只需点击一下，全部的资源内容立刻为您所用。让 AI 助手为您解答疑问。"
    reverse
  >
    <div className="conversation-preview" style={{width: '100%', height: '100%'}}>
      <img src="/2f47b5a6-8917-4ee3-b486-2a6b5858b9d7.png" alt="对话界面预览" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px'}} />
    </div>
  </FeatureSection>
);

export default ConversationFeature;