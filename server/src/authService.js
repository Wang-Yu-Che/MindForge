import mysql from 'mysql2/promise';
import redis from 'redis';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { jwtConfig, dbConfig as dbConfigFromFile } from './config.js';

// 使用配置文件中的数据库配置
const dbConfig = dbConfigFromFile;

// Redis客户端
const redisClient = redis.createClient();
redisClient.on('error', (err) => console.log('Redis Client Error', err));

// 连接Redis
(async () => {
  await redisClient.connect();
})();

// 用户注册
const registerUser = async (email, password) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
    
    if (rows.length > 0) {
      throw new Error('邮箱已被注册');
    }
    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const [result] = await connection.execute(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, hashedPassword]
    );
    
    // 生成JWT token
    const token = jwt.sign({ userId: result.insertId }, jwtConfig.secretKey, { expiresIn: jwtConfig.expiresIn });
    
    // 存储token到Redis
    await redisClient.set(`token:${result.insertId}`, token, {
      EX: 3600 // 1小时过期
    });
    
    await connection.end();
    return { userId: result.insertId, token };
  } catch (err) {
    throw err;
  }
};

// 更新用户头像URL
const updateUserAvatar = async (userId, avatarUrl) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
  
    const [result] = await connection.execute(
      'UPDATE users SET avatar_url = ? WHERE id = ?',
      [avatarUrl, userId]
    );
  
    if (result.affectedRows === 0) {
      console.error(`用户ID ${userId} 不存在或更新失败`);
      throw new Error('用户不存在或更新失败');
    }
    
    await connection.end();
    return { success: true };
  } catch (err) {
    console.error('更新头像时发生错误:', err);
    throw err;
  }
};



// 用户登录
const loginUser = async (email, password) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
    
    if (rows.length === 0) {
      throw new Error('用户不存在');
    }
    
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      throw new Error('密码错误');
    }
    
    // 删除旧token
    await redisClient.del(`token:${user.id}`);
    
    // 生成新JWT token
    const token = jwt.sign({ userId: user.id }, jwtConfig.secretKey, { expiresIn: jwtConfig.expiresIn });
    
    // 存储新token到Redis
    await redisClient.set(`token:${user.id}`, token, {
      EX: 3600 // 1小时过期
    });
    
    await connection.end();
    return { userId: user.id, token };
  } catch (err) {
    throw err;
  }
};

// 测试数据库连接
const testDatabaseConnection = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT 1');
    await connection.end();
    console.log('MySQL连接测试成功');
    return true;
  } catch (err) {
    console.error('MySQL连接测试失败:', err);
    return false;
  }
};

// 测试Redis连接
const testRedisConnection = async () => {
  try {
    await redisClient.set('test', 'connection');
    const value = await redisClient.get('test');
    console.log('Redis连接测试成功');
    return value === 'connection';
  } catch (err) {
    console.error('Redis连接测试失败:', err);
    return false;
  }
};

// 获取用户头像URL
const getUserAvatar = async (userId) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT avatar_url FROM users WHERE id = ?', [userId]);
    
    if (rows.length === 0) {
      throw new Error('用户不存在');
    }
    
    await connection.end();
    return rows[0].avatar_url;
  } catch (err) {
    console.error('获取用户头像失败:', err);
    throw err;
  }
};

// 修改用户密码
const changePassword = async (userId, oldPassword, newPassword) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT password_hash FROM users WHERE id = ?', [userId]);
    
    if (rows.length === 0) {
      throw new Error('用户不存在');
    }
    
    const user = rows[0];
    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    
    if (!isMatch) {
      throw new Error('旧密码错误');
    }
    
    const saltRounds = 10;
    const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    const [result] = await connection.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newHashedPassword, userId]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('更新密码失败');
    }
    
    await connection.end();
    return { success: true };
  } catch (err) {
    console.error('修改密码时发生错误:', err);
    throw err;
  }
};


// 更新用户邮箱
const updateUserEmail = async (userId, newEmail) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      throw new Error('邮箱格式不正确');
    }
    
    // 检查邮箱是否已被注册
    const [existing] = await connection.execute('SELECT id FROM users WHERE email = ? AND id != ?', [newEmail, userId]);
    if (existing.length > 0) {
      throw new Error('邮箱已被其他用户注册');
    }
    
    // 更新邮箱
    const [result] = await connection.execute(
      'UPDATE users SET email = ? WHERE id = ?',
      [newEmail, userId]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('用户不存在或更新失败');
    }
    
    await connection.end();
    return { success: true };
  } catch (err) {
    console.error('更新邮箱时发生错误:', err);
    throw err;
  }
};

// 分页查询用户
const getUsersByPage = async (page = 1, pageSize = 10) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const offset = (page - 1) * pageSize;
    
    // 明确转换为数字并校验
let numericPageSize = Number(pageSize);
let numericOffset = Number(offset);

// 如果转换失败（是 NaN），则使用默认值
if (isNaN(numericPageSize)) {
  numericPageSize = 10;
}
if (isNaN(numericOffset)) {
  numericOffset = 0;
}
    
    const [rows] = await connection.query(
      'SELECT id, email, avatar_url, created_at as createdAt FROM users ORDER BY id DESC LIMIT ? OFFSET ?',
      [numericPageSize, numericOffset]
    );
    
    const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM users');
    await connection.end();
    
    return {
      data: rows,
      total: countResult[0].total,
      page,
      pageSize
    };
  } catch (err) {
    console.error('分页查询用户失败:', err);
    throw err;
  }
};

// 删除用户
const deleteUser = async (userId) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();
    
    // 先删除用户的所有笔记
    await connection.execute('DELETE FROM notes WHERE user_id = ?', [userId]);
    
    // 删除用户的所有源文件
    await connection.execute('DELETE FROM sources WHERE user_id = ?', [userId]);
    
    // 删除用户的所有笔记本
    await connection.execute('DELETE FROM notebooks WHERE user_id = ?', [userId]);
    
    // 最后删除用户
    const [result] = await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
    
    if (result.affectedRows === 0) {
      throw new Error('用户不存在');
    }
    
    await connection.commit();
    await connection.end();
    
    // 删除Redis中的token
    await redisClient.del(`token:${userId}`);
    
    return { success: true };
  } catch (err) {
    if (connection) {
      await connection.rollback();
      await connection.end();
    }
    console.error('删除用户失败:', err);
    throw err;
  }
};

// 查询单个用户
const getUserById = async (email) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT id, email, avatar_url FROM users WHERE email = ?',
      [email]
    );
    
    if (rows.length === 0) {
      throw new Error('用户不存在');
    }
    
    await connection.end();
    return rows[0];
  } catch (err) {
    console.error('查询用户失败:', err);
    throw err;
  }
};

//

// 管理员重置用户密码
const updatePassword = async (userName, newPassword) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT id FROM users WHERE email = ?', [userName]);
    
    if (rows.length === 0) {
      throw new Error('用户不存在');
    }
    
    const saltRounds = 10;
    const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    const [result] = await connection.execute(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [newHashedPassword, userName]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('更新密码失败');
    }
    
    await connection.end();
    return { success: true };
  } catch (err) {
    console.error('重置密码时发生错误:', err);
    throw err;
  }
};

export { registerUser, loginUser, updateUserAvatar, getUserAvatar, changePassword, getUsersByPage, deleteUser, getUserById, updateUserEmail, updatePassword };