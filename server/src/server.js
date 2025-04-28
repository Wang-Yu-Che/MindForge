import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { registerUser, loginUser, updateUserAvatar } from './authService.js';
import jwt from 'jsonwebtoken';
import { jwtConfig, anythingllmConfig } from './config.js';
import authMiddleware from './middleware/auth.js';
import { uploadToOSS, saveFeedback } from './feedbackService.js';
import { uploadSourceFile, getUserSources,saveSourceFile } from './sourceService.js';
import { createNotebook, getUserNotebooks as getNotebooks, updateNotebookTitle as updateNotebook, deleteNotebook } from './notebookService.js';
import { createNote, getNotes, updateNote, deleteNote } from './notesService.js';
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

// 聊天路由
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationId, slug, mode = 'chat', attachments = [] } = req.body;
    if (!slug) {
      throw new Error('工作区slug是必需的');
    }

    const response = await fetch(`http://localhost:${anythingllmConfig.port}/api/v1/workspace/${slug}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anythingllmConfig.apiKey}`
      },
      body: JSON.stringify({
        message,
        mode,
        sessionId: conversationId,
        attachments,
        reset: false
      })
    });

    if (!response.ok) {
      throw new Error(`AnythingLLM API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('AnythingLLM API请求详情:', {
      url: response.url,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: data
    });
    console.log('AnythingLLM response:', {
      id: data.id,
      type: data.type,
      textResponse: data.textResponse,
      sources: data.sources,
      close: data.close,
      error: data.error
    });

    res.json(data);

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: error.stack
    });
  }
});

// 简化版聊天路由
app.post('/api/chat/simple', async (req, res) => {
  try {
    const { message, slug, mode = 'chat', title, content } = req.body;
    if (!slug) {
      throw new Error('工作区slug是必需的');
    }

    let processedMessage = message;
    if (title && content) {
      processedMessage = `我要对该知识库进行注释 注释标题为${title} 注释内容为${content}`;
    }

    const response = await fetch(`http://localhost:${anythingllmConfig.port}/api/v1/workspace/${slug}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anythingllmConfig.apiKey}`
      },
      body: JSON.stringify({
        message: processedMessage,
        mode,
        reset: false
      })
    });

    if (!response.ok) {
      throw new Error(`AnythingLLM API responded with status: ${response.status}`);
    }

    const data = await response.json();
      
    // 根据按钮类型创建笔记
    if (title && message) {
      await createNote(req.user.userId, title, data.textResponse, req.body.slug);
    }
  
    res.json({
      title: title,
      response: data.textResponse,
      ...data
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
});

// 获取工作区聊天历史
app.get('/api/chat/:slug/history', async (req, res) => {
  try {
    const { slug } = req.params;
    const { apiSessionId, limit = 100, orderBy = 'desc' } = req.query;

    const response = await fetch(`http://localhost:${anythingllmConfig.port}/api/v1/workspace/${slug}/chats?${new URLSearchParams({
      apiSessionId: apiSessionId || '',
      limit: limit.toString(),
      orderBy
    })}`, {
      headers: {
        'Authorization': `Bearer ${anythingllmConfig.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`AnythingLLM API responded with status: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('获取聊天历史失败:', error);
    res.status(500).json({ 
      error: '获取聊天历史失败',
      message: error.message
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

// 导入笔记本数据路由
app.post('/api/notes/import', async (req, res) => {
  try {
    const { libraryName, slug, notes, messages, sources } = req.body;
    const userId = req.user.userId;
    // 保存笔记
    for (const note of notes) {
      await createNote(userId, note.title, note.content, libraryName);
    }
    // 保存源文件
    for (const source of sources) {
      await saveSourceFile({
        fileName: source.label,
        fileUrl: source.url,
        userId,
        folderName: libraryName,
        location: source.location
      });
    }

    res.json({
      success: true,
      notes,
      messages,
      sources
    });
  } catch (error) {
    console.error('导入数据失败:', error);
    res.status(500).json({
      error: '导入数据失败',
      message: error.message
    });
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
    const slug = req.query.slug
    const sources = await getUserSources(userId, folderName);
    
    // 更新AnythingLLM的嵌入
    if (slug) {
      try {
        const requestUrl = `http://localhost:${anythingllmConfig.port}/api/v1/workspace/${slug}/update-embeddings`;
        const requestBody = {
          adds: sources.map(source => source.location)
        };
        
        /*console.log('AnythingLLM更新嵌入请求详情:', {
          url: requestUrl,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${anythingllmConfig.apiKey}`
          },
          body: requestBody
        });*/
        
        const response = await fetch(requestUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${anythingllmConfig.apiKey}`
          },
          body: JSON.stringify(requestBody)
        });
        
        const responseData = await response.json();
        
        /*console.log('AnythingLLM更新嵌入响应详情:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseData
        });*/
      
        if (!response.ok) {
          console.error('更新AnythingLLM嵌入失败:', await response.text());
        }
      } catch (error) {
        console.error('更新AnythingLLM嵌入时出错:', error);
      }
    }
    
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

// 更新笔记路由
app.put('/api/notes/:id', async (req, res) => {
  try {
    const noteId = req.params.id;
    const { title, content } = req.body;
    const result = await updateNote(noteId, title, content);
    res.json(result);
  } catch (error) {
    console.error('更新笔记失败:', error);
    res.status(500).json({ error: '更新笔记失败' });
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

// 笔记相关路由
app.post('/api/notes', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, content, folderName } = req.body;
    const noteId = await createNote(userId, title, content, folderName);
    // 调用简化版聊天路由
    await fetch('http://localhost:3002/api/chat/simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization
      },
      body: JSON.stringify({
        message: '',
        slug: folderName,
        title,
        content
      })
    });
    
    res.json({ noteId });
  } catch (error) {
    console.error('创建笔记失败:', error);
    res.status(500).json({ error: '创建笔记失败' });
  }
});

app.post('/api/sources/convert', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fileName, fileContent, libraryName } = req.body;
     
    const result = await saveSourceFile({
      fileName,
      fileUrl :fileContent,
      userId,
      folderName: libraryName // 使用传入的文件夹名
    });
    
    res.json(result);
  } catch (error) {
    console.error('转换源文件失败:', error);
    res.status(500).json({ 
      error: '转换源文件失败',
      message: error.message
    });
  }
});

app.get('/api/notes', async (req, res) => {
  try {
    const userId = req.user.userId;
    const folderName = req.query.folderName;
    const notes = await getNotes(userId, folderName);
    res.json(notes);
  } catch (error) {
    console.error('获取笔记列表失败:', error);
    res.status(500).json({ error: '获取笔记列表失败' });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    const noteId = req.params.id;
    await deleteNote(noteId);
    res.json({ success: true });
  } catch (error) {
    console.error('删除笔记失败:', error);
    res.status(500).json({ error: '删除笔记失败' });
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
const PORT = process.env.PORT || 3002;
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

