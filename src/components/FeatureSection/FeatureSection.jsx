import React from 'react';
import './FeatureSection.css';

const FeatureSection = ({ icon, title, description, children, reverse }) => {
  return (
    <section className={`feature-section ${reverse ? 'reverse' : ''}`}>
      <div className="feature-container">
        <div className="feature-content">
          <div className="feature-icon">{icon}</div>
          <h2>{title}</h2>
          <p className="feature-description">{description}</p>
        </div>
        <div className="feature-preview">
          {children}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection; 