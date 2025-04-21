import mysql from 'mysql2/promise';
import { dbConfig as dbConfigFromFile } from './config.js';
import { uploadToOSS } from './feedbackService.js';

const dbConfig = dbConfigFromFile;

// 保存源文件信息到数据库
const saveSourceFile = async (sourceData) => {
  try {
    const { fileName, fileUrl, userId, folderName } = sourceData;
    
    // 确保文件名使用UTF-8编码
    const encodedFileName = decodeURIComponent(fileName); // 解码客户端编码的文件名
    const encodedFolderName = folderName ? decodeURIComponent(folderName) : ''; // 解码客户端编码的文件夹名
    
    const connection = await mysql.createConnection(dbConfig);
    const query = `
      INSERT INTO sources (user_id, file_name, file_url, folder_name, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;
    
    const [result] = await connection.execute(query, [userId, encodedFileName, fileUrl, encodedFolderName]);
    await connection.end();
    return result.insertId;
  } catch (error) {
    console.error('保存源文件信息失败:', error);
    throw error;
  }
};

// 获取用户的所有源文件
const getUserSources = async (userId, folderName) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    let query = 'SELECT * FROM sources WHERE user_id = ?';
    const params = [userId];
    console.log(folderName)
    
    if (folderName) {
      query += ' AND folder_name = ?';
      params.push(folderName);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [rows] = await connection.execute(query, params);
    await connection.end();
    return rows;
  } catch (error) {
    console.error('获取用户源文件失败:', error);
    throw error;
  }
};

// 上传源文件到OSS并保存信息
const uploadSourceFile = async (base64File, fileName, userId, folderName) => {
  try {
    // 上传文件到OSS的sources目录下对应的文件夹
    const fileUrl = await uploadToOSS(base64File, 'sources', folderName,fileName);
    
    // 保存文件信息到数据库
    const sourceId = await saveSourceFile({
      fileName,
      fileUrl,
      userId,
      folderName // 使用传入的文件夹名
    });
    
    return {
      sourceId,
      fileUrl
    };
  } catch (error) {
    console.error('上传源文件失败:', error);
    throw error;
  }
};

export { uploadSourceFile, getUserSources };