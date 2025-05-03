import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem('token');
  const isAdmin = !localStorage.getItem('email').includes('@');
  
  // 如果没有token，重定向到登录页面
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 如果需要管理员权限但当前用户不是管理员
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // 如果有token且满足权限要求，渲染子组件
  return children;
};

export default PrivateRoute;