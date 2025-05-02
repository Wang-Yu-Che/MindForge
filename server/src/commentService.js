import mysql from 'mysql2/promise';
import { dbConfig as dbConfigFromFile } from './config.js';

const dbConfig = dbConfigFromFile;

// 创建评论
const createComment = async (post_id, content, is_anonymous = false, user_email = null) => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const query = `
      INSERT INTO forum_comments (post_id, content, is_anonymous, user_email, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;

    //
    
    const [result] = await connection.execute(query, [post_id, content, is_anonymous, user_email]);
    
    // 更新帖子评论数
    await connection.execute('UPDATE forum_posts SET comment_count = comment_count + 1 WHERE id = ?', [post_id]);
    
    await connection.end();
    return result.insertId;
  } catch (error) {
    console.error('创建评论失败:', error);
    throw error;
  }
};

// 获取所有评论
const getComments = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const query = 'SELECT * FROM forum_comments ORDER BY created_at DESC';
    
    const [rows] = await connection.execute(query);
    await connection.end();
    return rows;
  } catch (error) {
    console.error('获取评论失败:', error);
    throw error;
  }
};

// 更新评论
const updateComment = async (id, content) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const query = 'UPDATE forum_comments SET content = ? WHERE id = ?';
    
    const [result] = await connection.execute(query, [content, id]);
    await connection.end();
    
    if (result.affectedRows === 0) {
      throw new Error('评论不存在');
    }
    
    return true;
  } catch (error) {
    console.error('更新评论失败:', error);
    throw error;
  }
};

// 删除评论
const deleteComment = async (id) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const query = 'DELETE FROM forum_comments WHERE id = ?';
    
    const [result] = await connection.execute(query, [id]);
    await connection.end();
    
    if (result.affectedRows === 0) {
      throw new Error('评论不存在');
    }
    
    return true;
  } catch (error) {
    console.error('删除评论失败:', error);
    throw error;
  }
};

// 分页查询评论
const getCommentsByPage = async (page = 1, pageSize = 10) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const offset = (page - 1) * pageSize;
    
    const [rows] = await connection.query(
      'SELECT * FROM forum_comments ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [pageSize, offset]
    );
    
    const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM forum_comments');
    await connection.end();
    
    return {
      data: rows,
      total: countResult[0].total,
      page,
      pageSize
    };
  } catch (error) {
    console.error('分页查询评论失败:', error);
    throw error;
  }
};

// 根据邮箱搜索评论
const searchCommentsByEmail = async (email, page = 1, pageSize = 10) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const offset = (page - 1) * pageSize;
    
    const [rows] = await connection.query(
      'SELECT * FROM forum_comments WHERE user_email LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [`%${email}%`, pageSize, offset]
    );
    
    const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM forum_comments WHERE user_email LIKE ?', [`%${email}%`]);
    await connection.end();
    
    return {
      data: rows,
      total: countResult[0].total,
      page,
      pageSize
    };
  } catch (error) {
    console.error('搜索评论失败:', error);
    throw error;
  }
};

// 根据帖子ID获取评论
const getCommentsByPostId = async (postId) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const query = 'SELECT * FROM forum_comments WHERE post_id = ? ORDER BY created_at DESC';
    
    const [rows] = await connection.execute(query, [postId]);
    await connection.end();
    return rows;
  } catch (error) {
    console.error('根据帖子ID获取评论失败:', error);
    throw error;
  }
};

export { createComment, getComments, updateComment, deleteComment, getCommentsByPage, searchCommentsByEmail, getCommentsByPostId };