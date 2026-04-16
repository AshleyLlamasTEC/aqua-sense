/**
 * Navbar superior.
 *
 * Fix: Menu.Item de Ark UI requiere la prop `value` (string único).
 * Sin ella Ark lanza un warning en consola y el menú puede
 * comportarse de forma inesperada.
 */
import React from 'react';
import { Menu } from '@ark-ui/react';
import { useTheme } from '../../hooks/useTheme';
import Button from '../ui/Button';
import { route } from 'ziggy-js';

const SunIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Espacio izquierdo — breadcrumbs o título de página */}
          <div className="flex-1" />

          {/* Acciones derecha */}
          <div className="flex items-center gap-2">

            {/* Toggle de tema */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </Button>

            {/* Menú de usuario — value es obligatorio en Ark UI */}
            <Menu.Root>
              <Menu.Trigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <UserIcon />
                  <span className="hidden sm:inline text-sm">Usuario</span>
                </Button>
              </Menu.Trigger>

              <Menu.Positioner>
                <Menu.Content
                  className="
                    bg-white dark:bg-gray-800
                    rounded-lg shadow-lg
                    border border-gray-200 dark:border-gray-700
                    py-1 min-w-[180px]
                    z-50
                  "
                >
                  <Menu.Item
                    value="profile"
                    className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none"
                  >
                    Perfil
                  </Menu.Item>

                  <Menu.Item
                    value="settings"
                    className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none"
                  >
                    Configuración
                  </Menu.Item>

                  <Menu.Separator className="my-1 border-t border-gray-200 dark:border-gray-700" />

                  <Menu.Item
                    value="logout"
                    className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none"
                  >
                    Cerrar sesión
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Menu.Root>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
