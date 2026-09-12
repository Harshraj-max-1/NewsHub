import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import Footer from './Footer';
import { useAuthStore } from '../../store/authStore';
import { useBookmarkStore } from '../../store/bookmarkStore';

export default function MainLayout() {
  const { fetchProfile, isAuthenticated } = useAuthStore();
  const { fetchBookmarkIds } = useBookmarkStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      fetchBookmarkIds();
    }
  }, [isAuthenticated, fetchProfile, fetchBookmarkIds]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9] dark:bg-[#121212] text-[#171717] dark:text-[#F5F5F4] transition-colors duration-200">
      <Navbar />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <MobileNav />
      <Footer />
    </div>
  );
}
