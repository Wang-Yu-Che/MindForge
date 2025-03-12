import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const isWelcomePage = location.pathname === '/welcome';
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSettingsClick = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const handleFeedback = () => {
    // 处理发送反馈的逻辑
    console.log('发送反馈');
  };

  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const handleThemeSettings = () => {
    setIsThemeMenuOpen(!isThemeMenuOpen);
  };

  const handleThemeChange = (theme) => {
    // 处理主题切换的逻辑
    console.log('切换主题：', theme);
    setIsThemeMenuOpen(false);
  };

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
            {isWelcomePage ? (
              <>
                <div ref={settingsRef} style={{ position: 'relative' }}>
                  <button className="settings-button" onClick={handleSettingsClick}>
                    <i className="fas fa-cog"></i>
                    设置
                  </button>
                  <div className={`settings-menu ${isSettingsOpen ? 'active' : ''}`}>
                    <div className="settings-menu-item" onClick={handleFeedback}>
                      <i className="fas fa-comment-dots"></i>
                      发送反馈
                    </div>
                    <div 
                      className="settings-menu-item has-submenu" 
                      onClick={handleThemeSettings}
                      onMouseEnter={() => setIsThemeMenuOpen(true)}
                      onMouseLeave={() => setIsThemeMenuOpen(false)}
                    >
                      <i className="fas fa-palette"></i>
                      主题设置
                      <i className="fas fa-chevron-right submenu-arrow"></i>
                      <div className={`submenu ${isThemeMenuOpen ? 'active' : ''}`}>
                        <div className="settings-menu-item" onClick={() => handleThemeChange('light')}>
                          <i className="fas fa-sun"></i>
                          灯光模式
                        </div>
                        <div className="settings-menu-item" onClick={() => handleThemeChange('dark')}>
                          <i className="fas fa-moon"></i>
                          暗黑模式
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="user-avatar">
                  <img src="/default-avatar.png" alt="用户头像" />
                </div>
              </>
            ) : (
              <>
                <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} end>概览</NavLink>
                <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''}>登录</NavLink>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;