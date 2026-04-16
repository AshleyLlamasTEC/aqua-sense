import React from 'react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-emerald-50">
      <Navbar />
      <main className="overflow-hidden">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
