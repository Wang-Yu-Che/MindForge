import React from 'react';
import FeatureSection from '../FeatureSection/FeatureSection';

const UploadFeature = () => (
  <FeatureSection
    icon="📁"
    title="上传来源"
    description="上传 PDF 文档、网站、YouTube 视频、笔记文本。MindForge 会为每位用户定制专属的研究助理，并且主动为您提供深入的研究支持。"
  >
    <div className="upload-preview">
      {/* 这里添加上传界面预览 */}
    </div>
  </FeatureSection>
);

export default UploadFeature; 