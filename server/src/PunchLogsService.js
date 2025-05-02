import mysql from 'mysql2/promise';
import { dbConfig } from './config.js';

export const handlePunch = async (userId) => {
  if (!userId) {
    throw new Error('未授权');
  }

  const today = new Date().toISOString().slice(0, 10); // 获取当前日期，格式为 YYYY-MM-DD

  try {
    const connection = await mysql.createConnection(dbConfig);

    // 检查是否已打卡
    const [rows] = await connection.execute(
      'SELECT id FROM punch_logs WHERE user_id = ? AND punch_date = ?',
      [userId, today]
    );

    if (rows.length > 0) {
      await connection.end();
      return { success: true };
    }

    // 插入打卡记录
    await connection.execute(
      'INSERT INTO punch_logs (user_id, punch_date) VALUES (?, ?)',
      [userId, today]
    );

    await connection.end();
  } catch (error) {
    console.error('打卡失败:', error);
    return error;
  }
};

export const getPunchRecords = async (userId) => {
     try {
      const connection = await mysql.createConnection(dbConfig);
  
      const [rows] = await connection.execute(
        'SELECT punch_date FROM punch_logs WHERE user_id = ? ORDER BY punch_date ASC',
        [userId]
      );
  
      await connection.end();
  
      const dates = rows.map(row => row.punch_date.toISOString());
      
      return ( dates)
    } catch (error) {
      console.error('获取打卡记录失败:', error);
      return error;
    }
  };