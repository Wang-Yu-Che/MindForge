import React, { useState, useRef, useEffect } from 'react';
import './Feedback.css';

const Feedback = ({ isOpen, onClose }) => {
  const [feedback, setFeedback] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const feedbackRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (feedbackRef.current && !feedbackRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3002/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          feedback,
          screenshot,
          emailUpdates
        })
      });
      
      if (!response.ok) {
        throw new Error('提交反馈失败');
      }
      
      onClose();
    } catch (error) {
      console.error('提交反馈失败:', error);
      alert('提交反馈失败，请稍后重试');
    }
  };

  const handleScreenshotCapture = async () => {
    try {
      setIsVisible(false);
      const stream = await navigator.mediaDevices.getDisplayMedia({ preferCurrentTab: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      
      // 限制最大宽度为1200px
      const maxWidth = 1200;
      const scaleFactor = video.videoWidth > maxWidth ? maxWidth / video.videoWidth : 1;
      canvas.width = video.videoWidth * scaleFactor;
      canvas.height = video.videoHeight * scaleFactor;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 压缩截图
      const quality = 0.7; // 设置压缩质量
      const screenshotUrl = canvas.toDataURL('image/jpeg', quality);
      setScreenshot(screenshotUrl);

      stream.getTracks().forEach(track => track.stop());
      setIsVisible(true);
    } catch (error) {
      console.error('截图失败:', error);
      setIsVisible(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="feedback-overlay">
      <div className="feedback-container" ref={feedbackRef} style={{ display: isVisible ? 'flex' : 'none' }}>
        <div className="feedback-header">
          <h2>发送反馈给我们</h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="feedback-content">
            <div className="feedback-section">
              <label>描述您的反馈</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="请告诉我们您想反馈的内容..."
                required
              />
              <p className="feedback-hint">请勿包含任何敏感信息</p>
            </div>
            
            <div className="screenshot-section">
              <p>截图将帮助我们更好地理解您的反馈（可选）</p>
              <button
                type="button"
                className="capture-button"
                onClick={handleScreenshotCapture}
              >
                <i className="fas fa-camera"></i>
                捕获截图
              </button>
              {screenshot && (
                <div className="screenshot-preview">
                  <img src={screenshot} alt="Screenshot preview" />
                </div>
              )}
            </div>

            <div className="feedback-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={emailUpdates}
                  onChange={(e) => setEmailUpdates(e.target.checked)}
                />
                我们可能会通过电子邮件向您询问更多信息或更新
              </label>
            </div>
          </div>

          <div className="feedback-footer">
            <button type="submit" className="send-button">
              发送
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Feedback;