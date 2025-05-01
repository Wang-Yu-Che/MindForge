import React, { useState } from 'react';
import { Card, Typography, Divider, Button, Avatar, Input, Message, Comment, Space, Checkbox } from '@arco-design/web-react';
import { IconThumbUp, IconUser } from '@arco-design/web-react/icon';
import './DetailPage.css';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

export default function PostDetailPage() {
  const [likes, setLikes] = useState(0);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [anonymous, setAnonymous] = useState(false);

  // 模拟当前登录用户
  const currentUserEmail = 'user@example.com';

  const handleLike = () => {
    setLikes((prev) => prev + 1);
  };

  const handleCommentSubmit = () => {
    if (!comment.trim()) {
      Message.warning('请输入评论内容');
      return;
    }

    const newComment = {
      content: comment,
      user: anonymous ? '匿名用户' : currentUserEmail,
      time: new Date().toLocaleString(),
    };

    setComments([newComment, ...comments]);
    setComment('');
  };

  return (
    <div className="post-container">
      <Card className="post-card">
        <Title heading={4}>产学研融合对话：抢创新之先，高智能之焰</Title>
        <img src="/forum-image.png" alt="post" className="post-image" />

        <Paragraph>
          科技是第一生产力，人才是第一资源，创新是第一动力。人工智能论坛...
        </Paragraph>

        <Paragraph>
          未来产业发展、学术研究、科技投融资的整合推动产研结合的创新机制问题展开对话...
        </Paragraph>

        <Divider />
        <div className="post-actions">
          <Button
            icon={<IconThumbUp />}
            type="outline"
            onClick={handleLike}
          >
            点赞 ({likes})
          </Button>
        </div>
      </Card>

      <Card className="comment-section" title="评论区">
        <TextArea
          value={comment}
          onChange={setComment}
          placeholder="文明上网,请分享您的独到见解。"
          autoSize={{ minRows: 3 }}
        />
        <div className="comment-controls" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button type="primary" onClick={handleCommentSubmit}>发表评论</Button>
          <Checkbox checked={anonymous} onChange={setAnonymous}>匿名评论</Checkbox>
          <Paragraph style={{margin: 0, textAlign: 'right', flex: 1 }} type="secondary">所有评论仅代表网友意见</Paragraph>
        </div>

        <Divider />

        {comments.length === 0 && <Paragraph type="secondary">暂无评论，快来抢沙发！</Paragraph>}

        <Space direction="vertical" style={{ width: '100%' }}>
          {comments.map((c, idx) => (
            <Comment
              key={idx}
              author={c.user}
              avatar={<Avatar icon={<IconUser />} />}
              content={c.content}
              datetime={c.time}
            />
          ))}
        </Space>
      </Card>
    </div>
  );
}
