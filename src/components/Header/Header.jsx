import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        {/* 左侧Logo */}
        <div className="header-left">
          <a href="/" className="logo">
            <img src="/logo.svg" alt="MindForge" />
            <span>MindForge</span>
          </a>
        </div>
        
        {/* 右侧导航 */}
        <div className="header-right">
          <nav className="nav-links">
            <a href="/overview">概览</a>
            <a href="/plus">登录</a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 