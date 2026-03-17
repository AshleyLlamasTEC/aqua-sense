/**
 * Sidebar lateral con scroll independiente y grupos de navegación.
 * Utiliza el hook useSidebar para su estado colapsable.
 */

import React from 'react';
import { NAVIGATION_ITEMS } from '../../constants/navigation';
import SidebarItem from './SidebarItem';
import { useSidebar } from '../../hooks/useSidebar';
import { Link, usePage } from '@inertiajs/react';
import { ark } from '@ark-ui/react';

// Icono placeholder para el logo/cierre
const CollapseIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>;

const Sidebar = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { url } = usePage(); // Obtener la URL actual para marcar el item activo

  // Función para determinar si un item o su hijo está activo
  const isItemActive = (itemPath) => {
    if (itemPath === '/dashboard') return url === '/dashboard';
    return url.startsWith(itemPath);
  };

  return (
    <aside
      className={`
        fixed top-0 left-0 z-40 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Logo y botón colapsar */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
        {!isCollapsed ? (
          <Link href="/" className="text-xl font-bold text-gray-800 dark:text-white truncate">
            MiApp
          </Link>
        ) : (
          <span className="mx-auto text-xl font-bold text-gray-800 dark:text-white">M</span>
        )}
        <ark.button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
          aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          <CollapseIcon />
        </ark.button>
      </div>

      {/* Área de navegación con scroll */}
      <nav className="h-[calc(100vh-4rem)] overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        <ul className="space-y-1">
          {NAVIGATION_ITEMS.map((item) => (
            <li key={item.path}>
              <SidebarItem
                icon={item.icon}
                label={item.label}
                href={item.path}
                active={isItemActive(item.path)}
                isCollapsed={isCollapsed}
              />
              {/* Aquí se podría añadir lógica para submenús si item.children existe */}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
