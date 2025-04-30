import mysql from 'mysql2/promise';
import { dbConfig as dbConfigFromFile } from './config.js';

const dbConfig = dbConfigFromFile;
const getAllStats = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    // 所有查询
    const queries = {
      totalCounts: `
        SELECT 
          (SELECT COUNT(*) FROM users) AS userCount,
          (SELECT COUNT(*) FROM notes) AS noteCount,
          (SELECT COUNT(*) FROM notebooks) AS notebookCount,
          (SELECT COUNT(*) FROM sources) AS fileCount,
          (SELECT COUNT(*) FROM feedback) AS feedbackCount
      `,
      dailyUsers: `
        SELECT DATE(created_at) AS date, COUNT(*) AS count
        FROM users
        WHERE created_at >= CURDATE() - INTERVAL 6 DAY
        GROUP BY DATE(created_at)
        ORDER BY date
      `,
      dailyNotes: `
        SELECT DATE(created_at) AS date, COUNT(*) AS count
        FROM notes
        WHERE created_at >= CURDATE() - INTERVAL 6 DAY
        GROUP BY DATE(created_at)
        ORDER BY date
      `,
      dailyFiles: `
        SELECT DATE(created_at) AS date, COUNT(*) AS count
        FROM sources
        WHERE created_at >= CURDATE() - INTERVAL 6 DAY
        GROUP BY DATE(created_at)
        ORDER BY date
      `,
      dailyFeedback: `
        SELECT DATE(created_at) AS date, COUNT(*) AS count
        FROM feedback
        WHERE created_at >= CURDATE() - INTERVAL 6 DAY
        GROUP BY DATE(created_at)
        ORDER BY date
      `,
      topUsersByNotes: `
        SELECT u.id, u.email, COUNT(n.id) AS noteCount
        FROM users u
        JOIN notes n ON u.id = n.user_id
        GROUP BY u.id
        ORDER BY noteCount DESC
        LIMIT 10
      `,
      fileLocations: `
        SELECT location, COUNT(*) AS count
        FROM sources
        GROUP BY location
      `,
      emailUpdateStats: `
        SELECT email_updates, COUNT(*) AS count
        FROM feedback
        GROUP BY email_updates
      `
    };

    // 并发执行所有查询
    const [
      [totalCountsRes],
      [dailyUsersRes],
      [dailyNotesRes],
      [dailyFilesRes],
      [dailyFeedbackRes],
      [topUsersRes],
      [fileLocationRes],
      [emailUpdatesRes]
    ] = await Promise.all([
      connection.query(queries.totalCounts),
      connection.query(queries.dailyUsers),
      connection.query(queries.dailyNotes),
      connection.query(queries.dailyFiles),
      connection.query(queries.dailyFeedback),
      connection.query(queries.topUsersByNotes),
      connection.query(queries.fileLocations),
      connection.query(queries.emailUpdateStats)
    ]);

    await connection.end();

    return {
      totalCounts: totalCountsRes[0],
      dailyStats: {
        users: dailyUsersRes,
        notes: dailyNotesRes,
        files: dailyFilesRes,
        feedback: dailyFeedbackRes
      },
      topUsersByNotes: topUsersRes,
      fileLocationDistribution: fileLocationRes,
      feedbackEmailUpdates: emailUpdatesRes
    };
  } catch (error) {
    console.error('获取统计数据失败:', error);
    throw error;
  }
};

export { getAllStats };
