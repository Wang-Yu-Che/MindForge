import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

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

// 清理过期的对话历史
setInterval(() => {
  const oneHourAgo = Date.now() - 3600000;
  for (const [id] of conversations) {
    if (parseInt(id) < oneHourAgo) {
      conversations.delete(id);
    }
  }
}, 3600000);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Connected to Ollama at http://localhost:11434/`);
}); 