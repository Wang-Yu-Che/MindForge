import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        {/* 左侧Logo */}
        <div className="header-left">
          <Link to="/" className="logo">
            <img src="/logo.svg" alt="MindForge" />
            <span>MindForge</span>
          </Link>
        </div>
        
        {/* 右侧导航 */}
        <div className="header-right">
          <nav className="nav-links">
            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} end>概览</NavLink>
            <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''}>登录</NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;