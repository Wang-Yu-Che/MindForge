import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@arco-design/web-react';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除相关错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = '请输入邮箱';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }
    if (!formData.password) {
      newErrors.password = '请输入密码';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码长度至少为6位';
    }
    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // 清除旧的token
        localStorage.removeItem('token');
        localStorage.removeItem('userId');

        const headers = {
          'Content-Type': 'application/json'
        };
        
        // 只有在已有token时才添加Authorization头
        const token = localStorage.getItem('token');
        if (token) {
          headers['Authorization'] = 'Bearer ' + token;
        }
        
        const response = await fetch('http://localhost:3001/api/auth', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            action: isLogin ? 'login' : 'register'
          })
        });

        const data = await response.json();
        if (!response.ok) {
          if (data.error) {
            setErrors({ submit: data.error });
          } else {
            throw new Error(data.message || '请求失败');
          }
          return;
        }

        // 存储新token到localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        
        // 查询用户笔记本数量
        try {
          const notebooksResponse = await fetch(`http://localhost:3001/api/notebooks?userId=${data.userId}`, {
            headers: {
              'Authorization': `Bearer ${data.token}`
            }
          });
          
          if (!notebooksResponse.ok) {
            throw new Error('获取笔记本数据失败');
          }
          
          const notebooks = await notebooksResponse.json();
          
          // 根据笔记本数量决定跳转路径
          if (notebooks.length > 0) {
            navigate('/note-book-list');
          } else {
            navigate('/welcome');
          }
        } catch (err) {
          console.error('查询笔记本错误:', err);
          // 默认跳转到欢迎页面
          navigate('/welcome');
        }
      } catch (err) {
        setErrors({ submit: err.message });
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{isLogin ? '登录' : '注册'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="邮箱"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="密码"
              value={formData.password}
              onChange={handleInputChange}
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>
          {!isLogin && (
            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="确认密码"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>
          )}
          {errors.submit && (
            <div className="form-group">
              <span className="error-message">{errors.submit}</span>
            </div>
          )}
          <Button type="primary" htmlType="submit" className="submit-button">
            {isLogin ? '登录' : '注册'}
          </Button>
        </form>
        <p className="switch-form">
          {isLogin ? '还没有账号？' : '已有账号？'}
          <button
            className="switch-button"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? '立即注册' : '立即登录'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;