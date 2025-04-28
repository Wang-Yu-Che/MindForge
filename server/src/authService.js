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

export { registerUser, loginUser, updateUserAvatar, getUserAvatar };