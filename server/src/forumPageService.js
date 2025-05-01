import mysql from 'mysql2/promise';
import { dbConfig as dbConfigFromFile } from './config.js';

const dbConfig = dbConfigFromFile;

// 创建帖子
const createPost = async (title, content, image_url, created_by) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const query = `
      INSERT INTO forum_posts (title, content, image_url, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;
    
    const [result] = await connection.execute(query, [title, content, image_url, created_by]);
    await connection.end();
    return result.insertId;
  } catch (error) {
    console.error('创建帖子失败:', error);
    throw error;
  }
};

// 获取所有帖子
const getPosts = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const query = 'SELECT * FROM forum_posts ORDER BY created_at DESC';
    
    const [rows] = await connection.execute(query);
    await connection.end();
    return rows;
  } catch (error) {
    console.error('获取帖子失败:', error);
    throw error;
  }
};

// 更新帖子
const updatePost = async (id, title, content, image_url) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const query = 'UPDATE forum_posts SET title = ?, content = ?, image_url = ?, updated_at = NOW() WHERE id = ?';
    
    const [result] = await connection.execute(query, [title, content, image_url, id]);
    await connection.end();
    
    if (result.affectedRows === 0) {
      throw new Error('帖子不存在');
    }
    
    return true;
  } catch (error) {
    console.error('更新帖子失败:', error);
    throw error;
  }
};

// 删除帖子
const deletePost = async (id) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const query = 'DELETE FROM forum_posts WHERE id = ?';
    
    const [result] = await connection.execute(query, [id]);
    await connection.end();
    
    if (result.affectedRows === 0) {
      throw new Error('帖子不存在');
    }
    
    return true;
  } catch (error) {
    console.error('删除帖子失败:', error);
    throw error;
  }
};

// 分页查询帖子
const getPostsByPage = async (page = 1, pageSize = 10) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const offset = (page - 1) * pageSize;
    
    const [rows] = await connection.query(
      'SELECT * FROM forum_posts ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [pageSize, offset]
    );
    
    const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM forum_posts');
    await connection.end();
    
    return {
      data: rows,
      total: countResult[0].total,
      page,
      pageSize
    };
  } catch (error) {
    console.error('分页查询帖子失败:', error);
    throw error;
  }
};

// 根据邮箱搜索帖子
const searchPostsByEmail = async (email, page = 1, pageSize = 10) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const offset = (page - 1) * pageSize;
    
    const [rows] = await connection.query(
      'SELECT * FROM forum_posts WHERE created_by LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [`%${email}%`, pageSize, offset]
    );
    
    const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM forum_posts WHERE created_by LIKE ?', [`%${email}%`]);
    await connection.end();
    
    return {
      data: rows,
      total: countResult[0].total,
      page,
      pageSize
    };
  } catch (error) {
    console.error('搜索帖子失败:', error);
    throw error;
  }
};

export { createPost, getPosts, updatePost, deletePost, getPostsByPage, searchPostsByEmail };