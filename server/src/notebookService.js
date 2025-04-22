import mysql from 'mysql2/promise';
import { dbConfig as dbConfigFromFile } from './config.js';

const dbConfig = dbConfigFromFile;

// 创建笔记本
const createNotebook = async (userId, title) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const query = `
      INSERT INTO notebooks (user_id, title, created_at)
      VALUES (?, ?, NOW())
    `;
    
    const [result] = await connection.execute(query, [userId, title]);
    await connection.end();
    return result.insertId;
  } catch (error) {
    console.error('创建笔记本失败:', error);
    throw error;
  }
};

// 获取用户的所有笔记本
const getUserNotebooks = async (userId) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const query = 'SELECT * FROM notebooks WHERE user_id = ? ORDER BY created_at DESC';
    
    const [rows] = await connection.execute(query, [userId]);
    await connection.end();
    return rows;
  } catch (error) {
    console.error('获取用户笔记本失败:', error);
    throw error;
  }
};

// 更新笔记本标题
const updateNotebookTitle = async (notebookId, title) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();

    // 先获取原标题
    const [notebook] = await connection.execute('SELECT title FROM notebooks WHERE id = ?', [notebookId]);
    if (notebook.length === 0) {
      throw new Error('笔记本不存在');
    }
    const oldTitle = notebook[0].title;

    // 更新笔记本标题
    await connection.execute('UPDATE notebooks SET title = ? WHERE id = ?', [title, notebookId]);
    
    // 更新sources表中的folder_name
    await connection.execute('UPDATE sources SET folder_name = ? WHERE folder_name = ?', [title, oldTitle]);

    await connection.commit();
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('更新笔记本标题失败:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// 删除笔记本
const deleteNotebook = async (notebookId) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();
    
    // 先查询笔记本title
    const [notebook] = await connection.execute('SELECT title FROM notebooks WHERE id = ?', [notebookId]);
    
    // 删除笔记本记录
    await connection.execute('DELETE FROM notebooks WHERE id = ?', [notebookId]);
    
    // 删除关联的sources记录
    if (notebook.length > 0) {
      await connection.execute('DELETE FROM sources WHERE folder_name = ?', [notebook[0].title]);
    }
    
    await connection.commit();
    await connection.end();
  } catch (error) {
    await connection.rollback();
    console.error('删除笔记本失败:', error);
    throw error;
  }
};

export { createNotebook, getUserNotebooks, updateNotebookTitle, deleteNotebook };