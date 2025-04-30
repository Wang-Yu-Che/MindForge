import mysql from 'mysql2/promise';
import { dbConfig as dbConfigFromFile, anythingllmConfig } from './config.js';
import { uploadToOSS } from './feedbackService.js';

const dbConfig = dbConfigFromFile;

// 保存源文件信息到数据库
const saveSourceFile = async (sourceData) => {
  try {
    const { fileName, fileUrl, userId, folderName,location='' } = sourceData;
   
    // 确保文件名使用UTF-8编码
    const encodedFileName = decodeURIComponent(fileName); // 解码客户端编码的文件名
    const encodedFolderName = folderName ? decodeURIComponent(folderName) : ''; // 解码客户端编码的文件夹名
    
    const connection = await mysql.createConnection(dbConfig);
    const query = `
      INSERT INTO sources (user_id, file_name, file_url, folder_name, location, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    
    const [result] = await connection.execute(query, [userId, encodedFileName, fileUrl, encodedFolderName, location]);
    await connection.end();
    
    // 更新对应笔记本的source_count
    if (folderName) {
      const updateConnection = await mysql.createConnection(dbConfig);
      const updateQuery = 'UPDATE notebooks SET source_count = source_count + 1 WHERE title = ?';
      await updateConnection.execute(updateQuery, [folderName]);
      await updateConnection.end();
    }
    
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
    // 上传文件到AnythingLLM
    const formData = new FormData();
    const fileBuffer = Buffer.from(base64File.split(',')[1], 'base64');
    const blob = new Blob([fileBuffer], { type: 'application/octet-stream' });
    formData.append('file', blob, fileName);
    
    const response = await fetch(`http://localhost:${anythingllmConfig.port}/api/v1/document/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anythingllmConfig.apiKey}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('上传到AnythingLLM失败');
    }
    
    const responseData = await response.json();
    const location = responseData.documents[0].location;
    
    // 保存文件信息到数据库
    const sourceId = await saveSourceFile({
      fileName,
      fileUrl,
      userId,
      folderName,// 使用传入的文件夹名
      location 
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


//

// 分页查询所有源文件
const getSourcesByPage = async (page = 1, pageSize = 10) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const offset = (page - 1) * pageSize;
    
    const [rows] = await connection.query(
      'SELECT * FROM sources ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [pageSize, offset]
    );
    
    const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM sources');
    await connection.end();
    
    return {
      data: rows,
      total: countResult[0].total,
      page,
      pageSize
    };
  } catch (error) {
    console.error('分页查询源文件失败:', error);
    throw error;
  }
};

// 删除源文件
const deleteSource = async (sourceId) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 先获取源文件信息
    const [source] = await connection.execute('SELECT * FROM sources WHERE id = ?', [sourceId]);
    if (source.length === 0) {
      throw new Error('源文件不存在');
    }
    
    // 删除记录
    const [result] = await connection.execute('DELETE FROM sources WHERE id = ?', [sourceId]);
    await connection.end();
    
    if (result.affectedRows === 0) {
      throw new Error('删除源文件失败');
    }
    
    // 如果有关联的笔记本，更新source_count
    if (source[0].folder_name) {
      const updateConnection = await mysql.createConnection(dbConfig);
      await updateConnection.execute(
        'UPDATE notebooks SET source_count = source_count - 1 WHERE title = ?',
        [source[0].folder_name]
      );
      await updateConnection.end();
    }
    
    return true;
  } catch (error) {
    console.error('删除源文件失败:', error);
    throw error;
  }
};

// 更新源文件信息
const updateSource = async (sourceId, updateData) => {
  try {
    const { fileName, folderName } = updateData;
    const connection = await mysql.createConnection(dbConfig);
    
    // 获取原始数据
    const [source] = await connection.execute('SELECT * FROM sources WHERE id = ?', [sourceId]);
    if (source.length === 0) {
      throw new Error('源文件不存在');
    }
    
    // 更新数据
    const query = 'UPDATE sources SET file_name = ?, folder_name = ? WHERE id = ?';
    const [result] = await connection.execute(query, [fileName, folderName, sourceId]);
    await connection.end();
    
    if (result.affectedRows === 0) {
      throw new Error('更新源文件失败');
    }
    
    // 如果文件夹名变更，需要更新笔记本的source_count
    if (source[0].folder_name !== folderName) {
      const updateConnection = await mysql.createConnection(dbConfig);
      // 原笔记本source_count减1
      await updateConnection.execute(
        'UPDATE notebooks SET source_count = source_count - 1 WHERE title = ?',
        [source[0].folder_name]
      );
      // 新笔记本source_count加1
      await updateConnection.execute(
        'UPDATE notebooks SET source_count = source_count + 1 WHERE title = ?',
        [folderName]
      );
      await updateConnection.end();
    }
    
    return true;
  } catch (error) {
    console.error('更新源文件失败:', error);
    throw error;
  }
};

// 根据文件名模糊查询源文件
const searchSourcesByName = async (keyword, page = 1, pageSize = 10) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const offset = (page - 1) * pageSize;
    
    const [rows] = await connection.query(
      'SELECT * FROM sources WHERE file_name LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [`%${keyword}%`, pageSize, offset]
    );
    
    const [countResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM sources WHERE file_name LIKE ?',
      [`%${keyword}%`]
    );
    
    await connection.end();
    
    return {
      data: rows,
      total: countResult[0].total,
      page,
      pageSize
    };
  } catch (error) {
    console.error('模糊查询源文件失败:', error);
    throw error;
  }
};

export { uploadSourceFile, getUserSources, saveSourceFile, getSourcesByPage, deleteSource, updateSource, searchSourcesByName };