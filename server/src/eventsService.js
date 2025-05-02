import mysql from 'mysql2/promise';
import { dbConfig as dbConfigFromFile } from './config.js';

const dbConfig = dbConfigFromFile;

// 创建日程
const createEvent = async (user_id, date, schedule) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const query = `
      INSERT INTO events (user_id, date, schedule)
      VALUES (?, ?, ?)
    `;
    
    const [result] = await connection.execute(query, [user_id, date, schedule]);
    await connection.end();
    return result.insertId;
  } catch (error) {
    console.error('创建日程失败:', error);
    throw error;
  }
};

// 根据用户ID获取日程
const getEventsByUserId = async (user_id) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const query = 'SELECT * FROM events WHERE user_id = ? ORDER BY date DESC';
    
    const [rows] = await connection.execute(query, [user_id]);
    await connection.end();
    return rows;
  } catch (error) {
    console.error('根据用户ID获取日程失败:', error);
    throw error;
  }
};

// 删除日程
const deleteEvent = async (id) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const query = 'DELETE FROM events WHERE id = ?';
    
    const [result] = await connection.execute(query, [id]);
    await connection.end();
    
    if (result.affectedRows === 0) {
      throw new Error('日程不存在');
    }
    
    return true;
  } catch (error) {
    console.error('删除日程失败:', error);
    throw error;
  }
};

export { createEvent, getEventsByUserId, deleteEvent };