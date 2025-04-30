import OSS from 'ali-oss';
import { v4 as uuidv4 } from 'uuid';
import mysql from 'mysql2/promise';
import { dbConfig as dbConfigFromFile } from './config.js';

const dbConfig = dbConfigFromFile;

import { ossConfig } from './config.js';

const ossClient = new OSS(ossConfig);

const uploadToOSS = async (base64Image, type = 'feedback', folderName,fileName = '') => {
 try {
  const buffer = Buffer.from(base64Image.split(',')[1], 'base64');
  let filename;
  if (type === 'avatar') {
   filename = `avatar/${uuidv4()}.png`;
  } else if (type === 'sources' && folderName) {
   filename = `sources/${folderName}/${fileName}`;
  } else {
   filename = `feedback/screenshots/${uuidv4()}.png`;
  }
  
  const result = await ossClient.put(filename, buffer);
  return result.url;
 } catch (error) {
  console.error('OSS上传失败:', error);
  throw error;
 }
};

const saveFeedback = async (feedbackData) => {
 try {
  const { feedback, screenshotUrl, emailUpdates, userId } = feedbackData;
  
  const connection = await mysql.createConnection(dbConfig);
  const query = `
   INSERT INTO feedback (user_id, content, screenshot_url, email_updates, created_at)
   VALUES (?, ?, ?, ?, NOW())
  `;
  
  await connection.execute(query, [userId, feedback, screenshotUrl, emailUpdates]);
  await connection.end();
  return true;
 } catch (error) {
  console.error('保存反馈失败:', error);
  throw error;
 }
};


const getAllFeedbacks = async (page = 1, pageSize = 10) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const offset = (page - 1) * pageSize;
    
    const [rows] = await connection.query(
      'SELECT * FROM feedback ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [pageSize, offset]
    );
    
    const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM feedback');
    await connection.end();
    
    return {
      data: rows,
      total: countResult[0].total,
      page,
      pageSize
    };
  } catch (error) {
    console.error('获取所有反馈失败:', error);
    throw error;
  }
};

const getFeedbackById = async (user_id) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const query = 'SELECT * FROM feedback WHERE user_id = ?';
    const [rows] = await connection.execute(query, [user_id]);
    await connection.end();
    
    if (rows.length === 0) {
      throw new Error('反馈不存在');
    }
    
    return rows;
  } catch (error) {
    console.error('获取反馈失败:', error);
    throw error;
  }
};


const deleteFeedback = async (feedbackId) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const query = 'DELETE FROM feedback WHERE id = ?';
    
    const [result] = await connection.execute(query, [feedbackId]);
    await connection.end();
    
    if (result.affectedRows === 0) {
      throw new Error('反馈不存在');
    }
    
    return true;
  } catch (error) {
    console.error('删除反馈失败:', error);
    throw error;
  }
};

export { uploadToOSS, saveFeedback, getAllFeedbacks, getFeedbackById, deleteFeedback };