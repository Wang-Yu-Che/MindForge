import React from 'react';
import { Input, Button, Checkbox, Link, Message, Modal } from '@arco-design/web-react';
import { IconUser, IconLock } from '@arco-design/web-react/icon';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = React.useState('admin');
  const [password, setPassword] = React.useState('');

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
        localStorage.setItem('email',username)
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
          <Link style={{ float: 'right' }} onClick={() => {
            Modal.confirm({
              title: '找回密码',
              content: (
                <div>
                  <p>请输入密保问题答案:</p>
                  <Input placeholder="密保问题答案" style={{ marginBottom: 16 }} />
                  <p>请输入新密码:</p>
                  <Input.Password placeholder="新密码" />
                </div>
              ),
              onOk: async () => {
                const answer = document.querySelector('.arco-modal-content input').value;
                if (answer === 'ZZULIMindForge') {
                  try {
                    const response = await fetch('http://localhost:3002/api/admin/reset-password', {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                      },
                      body: JSON.stringify({
                        userName: username,
                        newPassword: document.querySelectorAll('.arco-modal-content input')[1].value || '123456'
                      })
                    });
                    if (response.ok) {
                      Message.success('密码已重置');
                    } else {
                      Message.error('密码重置失败');
                    }
                  } catch (error) {
                    console.error('密码重置错误:', error);
                    Message.error('密码重置过程中发生错误');
                  }
                } else {
                  Message.error('密保问题答案错误');
                }
              }
            });
          }}>忘记密码</Link>
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
