async function createFolder(folderName) {
    const response = await fetch('http://localhost:53065/api/v1/document/create-folder', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'P9HQK1G-FXN4S04-KTBETQT-FSAVNAQ' // 如果需要 API Key，请加上
      },
      body: JSON.stringify({ name: folderName })
    });
  
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`创建失败: ${error}`);
    }
  
    const result = await response.json();
    return result;
  }
  