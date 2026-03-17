/**
 * Componente Footer simple para el dashboard.
 */

import React from 'react';
import { APP_NAME } from '../../constants/navigation';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-4 px-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500 dark:text-gray-400">
        <div>
          © {currentYear} {APP_NAME}. Todos los derechos reservados.
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
            Términos
          </a>
          <a href="#" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
            Privacidad
          </a>
          <a href="#" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
            Soporte
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
