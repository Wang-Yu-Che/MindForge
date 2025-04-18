import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  // 如果没有token，重定向到登录页面
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 如果有token，渲染子组件
  return children;
};

export default PrivateRoute;