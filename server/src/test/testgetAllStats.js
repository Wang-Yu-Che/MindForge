import getAllStats from '../getAllStats.js';
import mysql from 'mysql2/promise';
import { dbConfig } from '../config.js';

// 测试数据库连接
const testConnection = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.end();
    return true;
  } catch (err) {
    console.error('数据库连接测试失败:', err);
    return false;
  }
};

// 测试获取统计数据
const testGetAllStats = async () => {
  try {
    // 测试数据库连接
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('数据库连接失败');
    }

    // 获取统计数据
    const stats = await getAllStats();
    
    // 验证返回的数据结构
    if (!stats || typeof stats !== 'object') {
      throw new Error('返回的数据不是对象');
    }
    
    // 验证总数统计
    if (!stats.totalCounts || 
        typeof stats.totalCounts.userCount !== 'number' || 
        typeof stats.totalCounts.noteCount !== 'number' || 
        typeof stats.totalCounts.notebookCount !== 'number' || 
        typeof stats.totalCounts.fileCount !== 'number' || 
        typeof stats.totalCounts.feedbackCount !== 'number') {
      throw new Error('总数统计数据格式不正确');
    }
    
    // 验证每日统计数据
    if (!stats.dailyStats || 
        !Array.isArray(stats.dailyStats.users) || 
        !Array.isArray(stats.dailyStats.notes) || 
        !Array.isArray(stats.dailyStats.files) || 
        !Array.isArray(stats.dailyStats.feedback)) {
      throw new Error('每日统计数据格式不正确');
    }
    
    // 验证每日数据项结构
    const validateDailyItem = (item) => {
      if (!item.date || !item.count) {
        throw new Error('每日数据项缺少必要字段');
      }
      if (typeof item.count !== 'number') {
        throw new Error('count字段应为数字类型');
      }
    };
    
    stats.dailyStats.users.forEach(validateDailyItem);
    stats.dailyStats.notes.forEach(validateDailyItem);
    stats.dailyStats.files.forEach(validateDailyItem);
    stats.dailyStats.feedback.forEach(validateDailyItem);
    
    // 验证排名数据
    if (!stats.topUsersByNotes || !Array.isArray(stats.topUsersByNotes)) {
      throw new Error('用户排名数据格式不正确');
    }
    
    // 验证文件位置分布
    if (!stats.fileLocationDistribution || !Array.isArray(stats.fileLocationDistribution)) {
      throw new Error('文件位置分布数据格式不正确');
    }
    
    // 验证邮件更新统计
    if (!stats.feedbackEmailUpdates || !Array.isArray(stats.feedbackEmailUpdates)) {
      throw new Error('邮件更新统计数据格式不正确');
    }
    
    console.log('所有测试通过');
    console.log('完整统计数据:', JSON.stringify(stats, null, 2));
    return true;
  } catch (err) {
    console.error('测试失败:', err);
    throw err;
  }
};

// 运行测试
(async () => {
  try {
    await testGetAllStats();
    console.log('测试完成');
  } catch (err) {
    process.exit(1);
  }
})();