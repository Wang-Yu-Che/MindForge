import React from 'react';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import UploadFeature from './components/Features/UploadFeature';
import GuideFeature from './components/Features/GuideFeature';
import AnswerFeature from './components/Features/AnswerFeature';
import ConversationFeature from './components/Features/ConversationFeature';
import './App.css';

function App() {
  return (
    <div className="app">
      <Header />
      <Hero />
      <UploadFeature />
      <GuideFeature />
      <AnswerFeature />
      <ConversationFeature />
    </div>
  );
}

export default App; 