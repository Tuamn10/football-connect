import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import PostsPage from './pages/PostsPage';
import FieldsPage from './pages/FieldsPage';
import ReportsPage from './pages/ReportsPage';
import ReviewsPage from './pages/ReviewsPage';
import NotFoundPage from './pages/NotFoundPage';

import './styles/admin.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/posts" element={<PostsPage />} />
              <Route path="/fields" element={<FieldsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
            </Route>
          </Route>
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
