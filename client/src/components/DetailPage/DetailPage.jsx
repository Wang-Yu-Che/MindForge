import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Typography, Divider, Button, Input, Message, Comment, Space, Checkbox } from '@arco-design/web-react';
import { IconThumbUp } from '@arco-design/web-react/icon';
import './DetailPage.css';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

export default function PostDetailPage() {
  const { id } = useParams();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [anonymous, setAnonymous] = useState(false);
  const [post, setPost] = useState(null);
  const [hasLiked, setHasLiked] = useState(false);
  
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`http://localhost:3002/api/posts/${id}` ,{
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
        });
        const postData = await response.json();
        setPost(postData);
        
        // 获取帖子评论
        const commentsResponse = await fetch(`http://localhost:3002/api/posts/comments/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
        });
        const commentsData = await commentsResponse.json();
        setComments(commentsData);
      } catch (error) {
        console.error('获取帖子详情或评论失败:', error);
      }
    };
    
    fetchPost();
  }, [id]);
  
  if (!post) return <div>加载中...</div>;

  const handleLike = async () => {
    if (hasLiked) {
      Message.warning('您已经点过赞了');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3002/api/posts/like/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        Message.success('点赞成功');
        setPost({...post, like_count: post.like_count + 1});
        setHasLiked(true);
      }
    } catch (error) {
      console.error('点赞失败:', error);
      Message.error('点赞失败');
    }
  };

  const handleCommentSubmit = async () => {
    if (!comment.trim()) {
      Message.warning('请输入评论内容');
      return;
    }

    try {
      const response = await fetch('http://localhost:3002/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          post_id: id,
          content: comment,
          is_anonymous: anonymous,
          user_email: localStorage.getItem('email')
        })
      });

      if (!response.ok) {
        throw new Error('评论提交失败');
      }

      await response.json();
      setComment('');
      Message.success('评论提交成功');
      setComments([{ 
        content: comment, 
        is_anonymous: anonymous ? 1 : 0, 
        user_email: localStorage.getItem('email'),
        created_at: new Date().toISOString()
      }, ...comments]);
    } catch (error) {
      console.error('评论提交失败:', error);
      Message.error('评论提交失败');
    }
  };

  return (
    <div className="post-container">
      <Card className="post-card">
        <Title heading={4}>{post.title}</Title>
        <img src={post.image_url || '/forum-image.png'} alt="post" className="post-image" />
        <Paragraph>{post.content}</Paragraph>
        <Divider />
        <div className="post-actions">
          <Button
            icon={<IconThumbUp />}
            type="outline"
            onClick={handleLike}
            disabled={hasLiked}
          >
            点赞 ({post.like_count})
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
              author={c.is_anonymous === 1 ? '匿名用户' : c.user_email}
              avatar={<img src="/default-avatar.svg" alt="用户头像"/>}
              content={c.content}
              datetime={c.created_at}
            />
          ))}
        </Space>
      </Card>
    </div>
  );
}
