import mysql from 'mysql2/promise';
import { dbConfig as dbConfigFromFile, anythingllmConfig } from './config.js';

const dbConfig = dbConfigFromFile;

// 创建笔记本
const createNotebook = async (userId, title) => {
     // 调用工作区API创建对应工作区
     const workspaceResponse = await fetch(`http://localhost:${anythingllmConfig.port}/api/v1/workspace/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anythingllmConfig.apiKey}`
      },
      body: JSON.stringify({
        name: title,
        similarityThreshold: 0.7,
        openAiTemp: 0.3,
        openAiHistory: 20,
        openAiPrompt: "",
        queryRefusalResponse: "",
        chatMode: "chat",
        topN: 4
      })
    });
    
    const responseData = await workspaceResponse.json();
    
    if (!workspaceResponse.ok) {
      throw new Error('创建工作区失败');
    }
  try {
    const connection = await mysql.createConnection(dbConfig);
    const query = `
      INSERT INTO notebooks (user_id, title, slug, created_at)
      VALUES (?, ?, ?, NOW())
    `;
    
    const [result] = await connection.execute(query, [userId, title, responseData.workspace.slug]);
    await connection.end();
    return {
      insertId: result.insertId,
      slug: responseData.workspace.slug
    };
  } catch (error) {
    console.error('创建笔记本失败:', error);
    throw error;
  }
};

// 获取用户的所有笔记本
const getUserNotebooks = async (userId) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const query = 'SELECT * FROM notebooks WHERE user_id = ? ORDER BY created_at DESC';
    
    const [rows] = await connection.execute(query, [userId]);
    await connection.end();
    return rows;
  } catch (error) {
    console.error('获取用户笔记本失败:', error);
    throw error;
  }
};

// 更新笔记本标题
const updateNotebookTitle = async (notebookId, title) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();

    // 先获取原标题和slug
    const [notebook] = await connection.execute('SELECT title, slug FROM notebooks WHERE id = ?', [notebookId]);
    if (notebook.length === 0) {
      throw new Error('笔记本不存在');
    }

    const oldTitle = notebook[0].title;
    const slug = notebook[0].slug;

    // 调用API更新工作区名称
    const response = await fetch(`http://localhost:${anythingllmConfig.port}/api/v1/workspace/${slug}/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anythingllmConfig.apiKey}`
      },
      body: JSON.stringify({
        name: title
      })
    });

    if (!response.ok) {
      throw new Error('更新工作区失败');
    }
    
    const responseData = await response.json();
    const newSlug = responseData.workspace.slug;

    // 更新笔记本标题和slug
    await connection.execute('UPDATE notebooks SET title = ?, slug = ? WHERE id = ?', [title, newSlug, notebookId]);
    
    // 更新sources表中的folder_name
    await connection.execute('UPDATE sources SET folder_name = ? WHERE folder_name = ?', [title, oldTitle]);

    await connection.commit();
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('更新笔记本标题失败:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// 删除笔记本
const deleteNotebook = async (notebookId) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();
    
    // 查询笔记本信息
    const [notebook] = await connection.execute('SELECT title, slug FROM notebooks WHERE id = ?', [notebookId]);
    
    if (notebook.length === 0) {
      throw new Error('笔记本不存在');
    }
    
    // 调用API删除工作区
    const response = await fetch(`http://localhost:${anythingllmConfig.port}/api/v1/workspace/${notebook[0].slug}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${anythingllmConfig.apiKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error('删除工作区失败');
    }
    
    // 删除笔记本记录
    await connection.execute('DELETE FROM notebooks WHERE id = ?', [notebookId]);
    
    // 删除关联的sources记录
    await connection.execute('DELETE FROM sources WHERE folder_name = ?', [notebook[0].title]);
    // 删除关联的notes记录
    await connection.execute('DELETE FROM notes WHERE folder_name = ?', [notebook[0].title]);
    await connection.commit();
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('删除笔记本失败:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

//

// 分页查询所有笔记本
const getNotebooksByPage = async (page = 1, pageSize = 10) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const offset = (page - 1) * pageSize;
    
    const [rows] = await connection.query(
      'SELECT * FROM notebooks ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [pageSize, offset]
    );
    
    const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM notebooks');
    await connection.end();
    
    return {
      data: rows,
      total: countResult[0].total,
      page,
      pageSize
    };
  } catch (error) {
    console.error('分页查询笔记本失败:', error);
    throw error;
  }
};

export { createNotebook, getUserNotebooks, updateNotebookTitle, deleteNotebook, getNotebooksByPage };