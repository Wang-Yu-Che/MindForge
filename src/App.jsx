import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import Login from './components/Login/Login';
import Welcome from './components/Welcome/Welcome';
import UploadFeature from './components/Welcome/Features/UploadFeature';
import GuideFeature from './components/Welcome/Features/GuideFeature';
import AnswerFeature from './components/Welcome/Features/AnswerFeature';
import ConversationFeature from './components/Welcome/Features/ConversationFeature';
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
              <UploadFeature />
              <GuideFeature />
              <AnswerFeature />
              <ConversationFeature />
            </>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/welcome" element={<Welcome />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;