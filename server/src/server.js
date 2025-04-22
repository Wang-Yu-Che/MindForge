import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { registerUser, loginUser, updateUserAvatar } from './authService.js';
import jwt from 'jsonwebtoken';
import { jwtConfig } from './config.js';
import authMiddleware from './middleware/auth.js';
import { uploadToOSS, saveFeedback } from './feedbackService.js';
import { uploadSourceFile, getUserSources } from './sourceService.js';
import { createNotebook, getUserNotebooks as getNotebooks, updateNotebookTitle as updateNotebook, deleteNotebook } from './notebookService.js';
import fileUpload from 'express-fileupload';

const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload());

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

// 增加请求体大小限制
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

// 反馈路由
app.post('/api/feedback', async (req, res) => {
  try {
    const { feedback, screenshot, emailUpdates } = req.body;
    const userId = req.user.userId;
    
    let screenshotUrl = null;
    if (screenshot) {
      screenshotUrl = await uploadToOSS(screenshot);
    }
    
    await saveFeedback({ feedback, screenshotUrl, emailUpdates, userId });
    
    res.json({ success: true });
  } catch (error) {
    console.error('保存反馈失败:', error);
    res.status(500).json({ error: '保存反馈失败' });
  }
});

// 源文件上传路由
app.post('/api/sources/upload', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: '请上传文件' });
    }
    
    const file = req.files.file;
    const userId = req.user.userId;
    const rawFileName = req.body.fileName ? decodeURIComponent(req.body.fileName) : file.name;

    
    // 将文件转换为base64格式
    const base64File = `data:${file.mimetype};base64,${file.data.toString('base64')}`;
    
    // 上传文件并保存信息
    const result = await uploadSourceFile(base64File, rawFileName, userId,req.body.libraryName,rawFileName);
    
    res.json(result);
  } catch (error) {
    console.error('源文件上传失败:', error);
    res.status(500).json({ 
      error: '源文件上传失败',
      message: error.message
    });
  }
});

// 获取用户的源文件列表
app.get('/api/sources', async (req, res) => {
  try {
    const userId = req.user.userId;
    const folderName = req.query.folderName;
    const sources = await getUserSources(userId, folderName);
    res.json(sources);
  } catch (error) {
    console.error('获取源文件列表失败:', error);
    res.status(500).json({ error: '获取源文件列表失败' });
  }
});

// 笔记本相关路由
app.post('/api/notebooks', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title } = req.body;
    const result = await createNotebook(userId, title);
    res.json(result);
  } catch (error) {
    console.error('创建笔记本失败:', error);
    res.status(500).json({ error: '创建笔记本失败' });
  }
});

app.get('/api/notebooks', async (req, res) => {
  try {
    const userId = req.user.userId;
    const notebooks = await getNotebooks(userId);
    res.json(notebooks);
  } catch (error) {
    console.error('获取笔记本列表失败:', error);
    res.status(500).json({ error: '获取笔记本列表失败' });
  }
});

app.put('/api/notebooks/:id', async (req, res) => {
  try {
    const userId = req.user.userId;
    const notebookId = req.params.id;
    const { title } = req.body;
    const result = await updateNotebook(notebookId, title);
    res.json(result);
  } catch (error) {
    console.error('更新笔记本失败:', error);
    res.status(500).json({ error: '更新笔记本失败' });
  }
});

app.delete('/api/notebooks/:id', async (req, res) => {
  try {
    const userId = req.user.userId;
    const notebookId = req.params.id;
    await deleteNotebook(notebookId);
    res.json({ success: true });
  } catch (error) {
    console.error('删除笔记本失败:', error);
    res.status(500).json({ error: '删除笔记本失败' });
  }
});

// 头像上传路由
app.post('/api/user/avatar', async (req, res) => {
  try {
    if (!req.files || !req.files.avatar) {
      return res.status(400).json({ error: '请上传头像文件' });
    }
    
    const avatar = req.files.avatar;
    
    // 从认证信息中获取用户ID并验证
    if (!req.user || !req.user.userId) {
      console.error('未获取到用户ID:', req.user);
      return res.status(401).json({ error: '用户认证信息无效' });
    }
    const userId = req.user.userId;
    
    // 将头像文件转换为base64格式
    const base64Image = `data:${avatar.mimetype};base64,${avatar.data.toString('base64')}`;
    
    // 使用OSS上传头像
    const avatarUrl = await uploadToOSS(base64Image, 'avatar');

    // 更新用户头像URL
    await updateUserAvatar(userId, avatarUrl);
    
    res.json({ avatarUrl });
  } catch (error) {
    console.error('头像上传失败:', error);
    res.status(500).json({ 
      error: '头像上传失败',
      message: error.message,
      details: error.stack 
    });
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

