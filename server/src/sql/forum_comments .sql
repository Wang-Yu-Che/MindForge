CREATE TABLE forum_comments (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  post_id INT NOT NULL COMMENT '关联的帖子ID',
  content TEXT NOT NULL COMMENT '评论内容',
  is_anonymous BOOLEAN DEFAULT FALSE COMMENT '是否匿名',
  user_email VARCHAR(100) COMMENT '用户邮箱（如果非匿名）',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '评论时间',
  FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE
);
