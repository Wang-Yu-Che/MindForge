import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Hero from './components/App/Hero/Hero';
import Login from './components/Login/Login';
import AdminLogin from './components/AdminLogin/Login';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import UserManagement from './components/UserManagement/UserManagement';
import NoteManagement from './components/NoteManagement/NoteManagement';
import ResourceManagement from './components/ResourceManagement/ResourceManagement';

import Welcome from './components/Welcome/Welcome';
import UploadFeature from './components/App/Features/UploadFeature';
import GuideFeature from './components/App/Features/GuideFeature';
import AnswerFeature from './components/App/Features/AnswerFeature';
import ConversationFeature from './components/App/Features/ConversationFeature';
import Features from './components/App/Features/Features';
import Notebook from './components/Note/Note'
import DemoNotebook from './components/DemoNote/DemoNote';
import NoteBookList from './components/NoteBookList/NotebookList';
import ForumPage from './components/ForumPage/ForumPage';
import DetailPage from './components/DetailPage/DetailPage';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import { ThemeProvider } from './contexts/ThemeContext';
import NotFound from './components/NotFound/NotFound';
import './App.css';
import './styles/theme.css';

function App() {
  return (
    <ThemeProvider>
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
          <Route path="/admin/login" element={<AdminLogin />} />
        
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/notes" element={<NoteManagement />} />
          <Route path="/admin/resources" element={<ResourceManagement />} />
          <Route path="/admin/dashboard/*" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
          <Route path="/welcome" element={<PrivateRoute><Welcome /></PrivateRoute>} />
          <Route path="/notebook" element={<PrivateRoute><Notebook /></PrivateRoute>} />
          <Route path="/demo-notebook" element={<PrivateRoute><DemoNotebook /></PrivateRoute>} />
          <Route path="/note-book-list" element={<PrivateRoute><NoteBookList /></PrivateRoute>} />
          <Route path="/forum" element={<PrivateRoute><ForumPage /></PrivateRoute>} />
          <Route path="/detail/:id" element={<PrivateRoute><DetailPage /></PrivateRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;