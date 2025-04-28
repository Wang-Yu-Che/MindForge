import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Result } from '@arco-design/web-react';
const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div style={{ marginTop: '64px' }}>
    <Result
      status="404"
      title="404"
      subTitle="抱歉，您访问的页面不存在"
      extra={
        <Button type="primary" onClick={() => {
          const token = localStorage.getItem('token');
          navigate(token ? '/welcome' : '/');
        }}>
          返回首页
        </Button>
      }
    />
    </div>
  );
};

export default NotFound;