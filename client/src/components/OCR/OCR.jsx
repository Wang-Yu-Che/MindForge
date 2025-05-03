import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import { Upload, Button, Typography, Card, Space, Message } from '@arco-design/web-react';
import { IconUpload, IconPlayArrow } from '@arco-design/web-react/icon';

const OcrComponent = ({ onTextExtracted = () => {} }) => {
  const [image, setImage] = useState(null);  // 存储上传的图片
  const [text, setText] = useState('');  // 存储识别到的文本
  const [isProcessing, setIsProcessing] = useState(false);  // 识别过程中状态
  const [error, setError] = useState(null);  // 错误状态

  // 处理图片上传
  // eslint-disable-next-line
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));  // 更新图片的 URL
    }
  };

  // 执行 OCR 识别
  const handleOcr = () => {
    if (!image) return;

    setIsProcessing(true);
    setError(null);  // 重置错误信息

    Tesseract.recognize(
      image,
      'chi_sim',  // 使用简体中文识别
      {
        logger: (m) => console.log(m),  // 可选：输出 OCR 过程的日志
      }
    ).then(({ data: { text } }) => {
      setText(text);  // 更新识别后的文本
      setIsProcessing(false);
      if (typeof onTextExtracted === 'function') {
      onTextExtracted(text);  // 回调父组件传递识别结果
    }
    }).catch((err) => {
      console.error(err);
      setError('OCR 识别失败，请重试。');
      setIsProcessing(false);
    });
  };

  return (
    <Card title="OCR 中文文字识别" style={{ width: 500, height: 700, minHeight: 500, margin: '0 auto', overflow: 'auto' }}>
      <Space direction="vertical" size="large" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Upload
          accept="image/*"
          showUploadList={false}
          customRequest={({ file }) => {
            setImage(URL.createObjectURL(file));
          }}
        >
          <Button type="outline" icon={<IconUpload />}>
            上传图片
          </Button>
        </Upload>

        {image && (
          <div style={{ textAlign: 'center' }}>
            <img 
              src={image} 
              alt="Uploaded" 
              style={{ width: 450, height: 200, borderRadius: 4 }} 
            />
          </div>
        )}

        <Button 
          type="primary" 
          onClick={handleOcr} 
          loading={isProcessing}
          icon={<IconPlayArrow />}
          disabled={!image}
        >
          {isProcessing ? '识别中...' : '开始识别'}
        </Button>

        {error && Message.error(error)}

        {text && (
          <Card title="识别结果" hoverable>
            <Typography.Text style={{ maxWidth: 400, height: 300, borderRadius: 4 }}>{text}</Typography.Text>
          </Card>
        )}
      </Space>
    </Card>
  );
};

export default OcrComponent;
