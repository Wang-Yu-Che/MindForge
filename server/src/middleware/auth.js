import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config.js';

// 白名单路由列表
const whiteList = ['/', '/api/auth/login', '/api/auth/register', '/api/auth', '/public', '/favicon.ico', '/manifest.json', '/logo.svg', '/logo192.png', '/logo512.png', '/robots.txt'];

// 验证JWT token的中间件
const authMiddleware = (req, res, next) => {
  // 检查请求路径是否在白名单中
  if (whiteList.includes(req.path)) {
    return next();
  }

  // 获取请求头中的token
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: '未提供认证token' });
  }

  const token = authHeader.split(' ')[1]; // Bearer token格式
  if (!token) {
    return res.status(401).json({ error: '无效的token格式' });
  }

  try {
    // 验证token
    const decoded = jwt.verify(token, jwtConfig.secretKey);
    
    // 确保userId是数字类型
    const userId = decoded.userId?.userId || decoded.userId;
    if (isNaN(userId)) {
      throw new Error('无效的用户ID格式');
    }
    decoded.userId = Number(userId);
    req.user = decoded; // 将解码后的用户信息添加到请求对象中
    next();
  } catch (err) {
    return res.status(401).json({ error: 'token已过期或无效' });
  }
};

export default authMiddleware;