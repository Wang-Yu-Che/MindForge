const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/usr/share/nginx/html/'); // 这里是目标文件夹
    },
    filename: function (req, file, cb) {
      // 保存成原文件名，或者自定义
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
  const upload = multer({ storage: storage });
  
  // 允许跨域请求（可选）
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // 生产环境注意安全设置
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
  
  // 处理上传接口
  app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: '没有文件上传' });
    }
    res.json({
      message: '文件上传成功',
      filename: req.file.filename,
      path: req.file.path
    });
  });
  
  // 启动服务器
  app.listen(3000, () => {
    console.log('服务已启动，端口 3000');
  });
  