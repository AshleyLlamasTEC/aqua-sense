// resources/js/layouts/DashboardLayout.jsx
/**
 * Layout principal para las páginas del dashboard.
 * Incluye Sidebar, Navbar, área de contenido y Footer.
 * Gestiona el estado del sidebar (colapsado) mediante un hook.
 */

import React from 'react';
import { Head } from '@inertiajs/react';
import Sidebar from '../components/navigation/Sidebar';
import Navbar from '../components/navigation/Navbar';
import Footer from '../components/navigation/Footer';
import { useSidebar } from '../hooks/useSidebar';

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido de la página
 * @param {string} props.title - Título de la página (para el Head)
 */
const DashboardLayout = ({ children, title = 'Dashboard' }) => {
  const { isCollapsed } = useSidebar();

  return (
    <>
      <Head title={title} />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar />

        {/* Contenido principal, se desplaza según el estado del sidebar */}
        <div
          className={`
            transition-all duration-300 ease-in-out
            ${isCollapsed ? 'ml-20' : 'ml-64'}
          `}
        >
          <Navbar />

          {/* Área de contenido principal con padding */}
          <main className="min-h-[calc(100vh-4rem-64px)] py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </main>

          <Footer />
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
