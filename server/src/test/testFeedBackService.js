import fs from 'fs';
import path from 'path';
import { uploadToOSS, saveFeedback } from '../feedbackService.js';

const testFeedbackService = async () => {
  try {
    // 读取测试图片
    const imagePath = path.join(process.cwd(), '../client/public/logo192.png');
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;
    
    console.log('测试图片上传到OSS...');
    const screenshotUrl = await uploadToOSS(base64Image);
    console.log('图片上传成功:', screenshotUrl);
    
    console.log('测试保存反馈数据...');
    const feedbackData = {
      userId: 5, // 修改为数据库中存在的用户ID
      feedback: '这是一个测试反馈',
      screenshotUrl,
      emailUpdates: true
    };
    
    const saveResult = await saveFeedback(feedbackData);
    console.log('反馈保存结果:', saveResult);
    
    console.log('所有测试通过!');
  } catch (error) {
    console.error('测试失败:', error);
  }
};

testFeedbackService();