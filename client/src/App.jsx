import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import GlobalNews from './pages/GlobalNews';
import Discover from './pages/Discover';
import Categories from './pages/Categories';
import Search from './pages/Search';
import PersonalizedFeed from './pages/PersonalizedFeed';
import ArticleDetails from './pages/ArticleDetails';
import Saved from './pages/Saved';
import History from './pages/History';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="global" element={<GlobalNews />} />
          <Route path="discover" element={<Discover />} />
          <Route path="for-you" element={<PersonalizedFeed />} />
          <Route path="category/:slug" element={<Categories />} />
          <Route path="search" element={<Search />} />
          <Route path="article/:id" element={<ArticleDetails />} />
          <Route path="saved" element={<Saved />} />
          <Route path="history" element={<History />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
