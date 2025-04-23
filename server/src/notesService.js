import mysql from 'mysql2/promise';
import { dbConfig as dbConfigFromFile } from './config.js';

const dbConfig = dbConfigFromFile;

// 创建笔记
const createNote = async (userId, title, content, folderName) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const query = `
      INSERT INTO notes (user_id, title, content, folder_name, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;
    
    const [result] = await connection.execute(query, [userId, title, content, folderName]);
    await connection.end();
    return result.insertId;
  } catch (error) {
    console.error('创建笔记失败:', error);
    throw error;
  }
};

// 获取用户的所有笔记
const getNotes = async (userId, folderName) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    let query = 'SELECT * FROM notes WHERE user_id = ?';
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
    console.error('获取用户笔记失败:', error);
    throw error;
  }
};

// 更新笔记
const updateNote = async (noteId, title, content) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const query = 'UPDATE notes SET title = ?, content = ? WHERE id = ?';
    
    const [result] = await connection.execute(query, [title, content, noteId]);
    await connection.end();
    
    if (result.affectedRows === 0) {
      throw new Error('笔记不存在');
    }
    
    return true;
  } catch (error) {
    console.error('更新笔记失败:', error);
    throw error;
  }
};

// 删除笔记
const deleteNote = async (noteId) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const query = 'DELETE FROM notes WHERE id = ?';
    
    const [result] = await connection.execute(query, [noteId]);
    await connection.end();
    
    if (result.affectedRows === 0) {
      throw new Error('笔记不存在');
    }
    
    return true;
  } catch (error) {
    console.error('删除笔记失败:', error);
    throw error;
  }
};

export { createNote, getNotes, updateNote, deleteNote };