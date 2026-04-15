// resources/js/layouts/DashboardLayout.jsx
/**
 * Layout principal del dashboard.
 *
 * Patrón: Provider + Consumer separados en el mismo archivo.
 * - DashboardLayout  → provee el contexto (SidebarProvider)
 * - DashboardContent → consume el contexto (useSidebar)
 *
 * Esto garantiza que Sidebar y el área de contenido compartan
 * el mismo estado isCollapsed, resolviendo el bug de expansión.
 */
import React from 'react';
import { Head } from '@inertiajs/react';
import Sidebar from '../components/navigation/Sidebar';
import Navbar from '../components/navigation/Navbar';
import Footer from '../components/navigation/Footer';
import { SidebarProvider, useSidebar } from '../context/SidebarContext';

const DashboardContent = ({ children, title }) => {
  const { isCollapsed } = useSidebar();

  return (
    <>
      <Head title={title} />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

        {/* Sidebar fijo — su ancho lo controla su propio estado */}
        <Sidebar />

        {/*
          Área de contenido principal.
          ml-20 (sidebar colapsado = 5rem) / ml-64 (expandido = 16rem)
          La transición coincide con la del sidebar para que
          el movimiento se vea sincronizado.
        */}
        <div
          className={`
            flex flex-col min-h-screen
            transition-[margin-left] duration-300 ease-in-out
            ${isCollapsed ? 'ml-20' : 'ml-64'}
          `}
        >
          <Navbar />

          <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </main>

          <Footer />
        </div>

      </div>
    </>
  );
};

/**
 * @param {Object}           props
 * @param {React.ReactNode}  props.children  - Contenido de la página
 * @param {string}           [props.title]   - Título para <head>
 */
const DashboardLayout = ({ children, title = 'Dashboard' }) => (
  <SidebarProvider>
    <DashboardContent title={title}>
      {children}
    </DashboardContent>
  </SidebarProvider>
);

export default DashboardLayout;
