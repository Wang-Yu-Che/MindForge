import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import './Header.css';
import Feedback from '../Feedback/Feedback';

const Header = () => {
  const location = useLocation();
  const isWelcomePage = !['/', '/login'].includes(location.pathname);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
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
    setIsFeedbackOpen(true);
    setIsSettingsOpen(false);
  };

  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const avatarRef = useRef(null);

  const handleThemeSettings = () => {
    setIsThemeMenuOpen(!isThemeMenuOpen);
  };

  const handleThemeChange = (theme) => {
    // 处理主题切换的逻辑
    console.log('切换主题：', theme);
    setIsThemeMenuOpen(false);
  };

  const handleAvatarClick = () => {
    setIsAvatarMenuOpen(!isAvatarMenuOpen);
  };

  const handleChangeAvatar = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const formData = new FormData();
        formData.append('avatar', file);
        formData.append('userId', localStorage.getItem('userId'));
        
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3001/api/user/avatar', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('上传头像失败');
        }
        
        const data = await response.json();
        // 更新本地头像显示
        const avatarImg = document.querySelector('.user-avatar img');
        if (avatarImg) {
          avatarImg.src = data.avatarUrl;
        }
      };
      input.click();
    } catch (error) {
      console.error('头像上传错误:', error);
      alert('头像上传失败，请重试');
    } finally {
      setIsAvatarMenuOpen(false);
    }
  };

  const handleLogout = () => {
    // 清除localStorage中的token和其他用户数据
    localStorage.clear();
    // 重定向到登录页面
    window.location.href = '/';
    setIsAvatarMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (avatarRef.current && !avatarRef.current.contains(event.target)) {
        setIsAvatarMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="header">
      <div className="header-container">
        {/* 左侧Logo */}
        <div className="header-left">
          <Link to="/welcome" className="logo">
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
                <div ref={avatarRef} style={{ position: 'relative' }}>
                  <div className="user-avatar" onClick={handleAvatarClick}>
                    <img src="/default-avatar.svg" alt="用户头像" />
                  </div>
                  <div className={`settings-menu ${isAvatarMenuOpen ? 'active' : ''}`}>
                    <div className="settings-menu-item" onClick={handleChangeAvatar}>
                      <i className="fas fa-user-edit"></i>
                      更换头像
                    </div>
                    <div className="settings-menu-item" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt"></i>
                      退出登录
                    </div>
                  </div>
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
      {isFeedbackOpen && (
        <Feedback
          isOpen={isFeedbackOpen}
          onClose={() => setIsFeedbackOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;