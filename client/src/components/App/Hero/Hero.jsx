import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/welcome');
    }
  }, [navigate]);

  return (
    <div className="hero">
      <div className="hero-content">
        <h1 className="hero-title">
          <div className="gradient-text">巧思胜</div>
          <span className="black">苦干</span>
        </h1>
        <p className="hero-subtitle">
          基于 Ollama 打造的一款出色的工具，可助您理解您最为关心的信息
        </p>
        <button className="try-button" onClick={() => navigate('/login')}>
          试用 MindForge
        </button>
      </div>
    </div>
  );
};

export default Hero;