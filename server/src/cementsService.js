import mysql from 'mysql2/promise';
import { dbConfig as dbConfigFromFile } from './config.js';

const dbConfig = dbConfigFromFile;

// 创建公告
const createAnnouncement = async (title, content) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const query = `
      INSERT INTO announcements (title, content, created_at)
      VALUES (?, ?, NOW())
    `;
    
    const [result] = await connection.execute(query, [title, content]);
    await connection.end();
    return result.insertId;
  } catch (error) {
    console.error('创建公告失败:', error);
    throw error;
  }
};

// 获取所有公告
const getAnnouncements = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const query = 'SELECT * FROM announcements ORDER BY created_at DESC';
    
    const [rows] = await connection.execute(query);
    await connection.end();
    return rows;
  } catch (error) {
    console.error('获取公告失败:', error);
    throw error;
  }
};

// 更新公告
const updateAnnouncement = async (id, title, content) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const query = 'UPDATE announcements SET title = ?, content = ? WHERE id = ?';
    
    const [result] = await connection.execute(query, [title, content, id]);
    await connection.end();
    
    if (result.affectedRows === 0) {
      throw new Error('公告不存在');
    }
    
    return true;
  } catch (error) {
    console.error('更新公告失败:', error);
    throw error;
  }
};

// 删除公告
const deleteAnnouncement = async (id) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const query = 'DELETE FROM announcements WHERE id = ?';
    
    const [result] = await connection.execute(query, [id]);
    await connection.end();
    
    if (result.affectedRows === 0) {
      throw new Error('公告不存在');
    }
    
    return true;
  } catch (error) {
    console.error('删除公告失败:', error);
    throw error;
  }
};

// 分页查询公告
const getAnnouncementsByPage = async (page = 1, pageSize = 10) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const offset = (page - 1) * pageSize;
    
    const [rows] = await connection.query(
      'SELECT * FROM announcements ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [pageSize, offset]
    );
    
    const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM announcements');
    await connection.end();
    
    return {
      data: rows,
      total: countResult[0].total,
      page,
      pageSize
    };
  } catch (error) {
    console.error('分页查询公告失败:', error);
    throw error;
  }
};

// 根据标题搜索公告
const searchAnnouncementsByTitle = async (keyword, page = 1, pageSize = 10) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const offset = (page - 1) * pageSize;
    
    const [rows] = await connection.query(
      'SELECT * FROM announcements WHERE title LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [`%${keyword}%`, pageSize, offset]
    );
    
    const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM announcements WHERE title LIKE ?', [`%${keyword}%`]);
    await connection.end();
    
    return {
      data: rows,
      total: countResult[0].total,
      page,
      pageSize
    };
  } catch (error) {
    console.error('搜索公告失败:', error);
    throw error;
  }
};

export { createAnnouncement, getAnnouncements, updateAnnouncement, deleteAnnouncement, getAnnouncementsByPage, searchAnnouncementsByTitle };