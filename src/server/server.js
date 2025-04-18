import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { registerUser, loginUser } from './authService.js';
import jwt from 'jsonwebtoken';
import { jwtConfig } from './config.js';
import authMiddleware from './middleware/auth.js';

const app = express();
app.use(cors());
app.use(express.json());

// 应用认证中间件到所有API路由
// 应用认证中间件到所有路由，除了白名单路径
app.use(authMiddleware);

// 存储对话历史
const conversations = new Map();

app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationId, history } = req.body;
    console.log('Received message:', message);
    console.log('Conversation ID:', conversationId);

    // 构建系统提示词
    const systemPrompt = "你是一个有帮助的AI助手。请用简洁、专业的方式回答问题。";

    // 构建完整的对话提示
    let fullPrompt = systemPrompt + "\n\n";

    // 添加对话历史
    if (history && history.length > 0) {
      history.forEach(msg => {
        fullPrompt += `${msg.role === 'user' ? '用户' : 'AI助手'}: ${msg.content}\n`;
      });
    }

    // 添加当前问题
    fullPrompt += `用户: ${message}\nAI助手:`;

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2:latest',
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 2000,
          context_window: 4096,
          repeat_penalty: 1.1
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Ollama response:', data);

    // 保存对话历史
    if (!conversations.has(conversationId)) {
      conversations.set(conversationId, []);
    }
    const currentHistory = conversations.get(conversationId);
    currentHistory.push(
      { role: 'user', content: message },
      { role: 'assistant', content: data.response }
    );

    // 限制历史记录长度
    if (currentHistory.length > 20) {
      currentHistory.splice(0, 2);
    }

    if (data && typeof data.response === 'string') {
      res.json({ response: data.response });
    } else {
      console.error('Unexpected response format:', data);
      res.json({ 
        response: '抱歉，AI 响应格式不正确。这是原始响应：' + JSON.stringify(data) 
      });
    }

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: error.stack
    });
  }
});

// 认证路由
app.post('/api/auth', async (req, res) => {
  try {
    const { email, password, action } = req.body;
    
    if (action === 'register') {
      const userId = await registerUser(email, password);
      const token = jwt.sign({ userId }, jwtConfig.secretKey, { expiresIn: jwtConfig.expiresIn });
      res.json({ token, userId });
    } else if (action === 'login') {
      const { userId, token } = await loginUser(email, password);
      res.json({ token, userId });
    } else {
      throw new Error('无效的操作类型');
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 启动服务器
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

// 清理过期的对话历史
setInterval(() => {
  const oneHourAgo = Date.now() - 3600000;
  for (const [id] of conversations) {
    if (parseInt(id) < oneHourAgo) {
      conversations.delete(id);
    }
  }
}, 3600000);

