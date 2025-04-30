import React from 'react';
import { Input, Button, Checkbox, Link, Message } from '@arco-design/web-react';
import { IconUser, IconLock } from '@arco-design/web-react/icon';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = React.useState('admin');
  const [password, setPassword] = React.useState('123456');

  const handleLogin = () => {
    fetch('http://localhost:3002/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: username,
        password: password,
        action: 'login'
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        Message.success('登录成功');
        navigate('/admin/dashboard');
      } else {
        Message.error(data.error || '登录失败');
      }
    })
    .catch(error => {
      console.error('登录错误:', error);
      Message.error('登录过程中发生错误');
    });
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="carousel">
          <img src="/logo.svg" alt="MindForge Logo" />
          <h2>欢迎来到MindForge管理端</h2>
          <p>管理用户信息</p>
        </div>
      </div>

      <div className="login-right">
        <h2>登录 </h2>
        <p className="desc">登录</p>
        <Input
          prefix={<IconUser />}
          placeholder="用户名"
          value={username}
          onChange={(value) => setUsername(value)}
          style={{ marginBottom: 16 }}
        />
        <Input.Password
          prefix={<IconLock />}
          placeholder="密码"
          value={password}
          onChange={(value) => setPassword(value)}
          style={{ marginBottom: 16 }}
        />
        <div className="login-options">
          <Checkbox>记住密码</Checkbox>
          <Link style={{ float: 'right' }}>忘记密码</Link>
        </div>
        <Button type="primary" long style={{ marginTop: 16 }} onClick={handleLogin}>
          登录
        </Button>
        <div className="register-link">
          <Link onClick={() => {
            fetch('http://localhost:3002/api/auth', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                email: 'admin',
                password: '123456',
                action: 'register'
              })
            })
            .then(response => response.json())
            .then(data => {
              if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.userId);
                alert('注册成功');
              } else {
                alert(data.error || '注册失败');
              }
            })
            .catch(error => {
              console.error('注册错误:', error);
              alert('注册过程中发生错误');
            });
          }}>注册账号</Link>
        </div>
        <div className="footer">MindForge</div>
      </div>
    </div>
  );
};

export default Login;
