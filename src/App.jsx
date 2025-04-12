import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Hero from './components/App/Hero/Hero';
import Login from './components/Login/Login';
import Welcome from './components/Welcome/Welcome';
import UploadFeature from './components/App/Features/UploadFeature';
import GuideFeature from './components/App/Features/GuideFeature';
import AnswerFeature from './components/App/Features/AnswerFeature';
import ConversationFeature from './components/App/Features/ConversationFeature';
import Features from './components/App/Features/Features';
import DemoNotebook from './components/DemoNote/DemoNote'
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <Features />
              <UploadFeature />
              <GuideFeature />
              <AnswerFeature />
              <ConversationFeature />
            </>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/demo-notebook" element={<DemoNotebook />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;