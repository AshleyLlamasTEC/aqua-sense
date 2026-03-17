// resources/js/components/navigation/SidebarItem.jsx
/**
 * Componente para un item individual del sidebar.
 * Soporta iconos, etiquetas y estados activo/colapsado.
 */

import React from 'react';
import { Link } from '@inertiajs/react';
import { ark } from '@ark-ui/react';

/**
 * Item del sidebar, puede ser un enlace o un botón (para submenús).
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Componente del icono
 * @param {string} props.label - Texto del item
 * @param {string} props.href - Ruta de navegación (si es un enlace)
 * @param {boolean} props.active - Indica si la ruta actual coincide
 * @param {boolean} props.isCollapsed - Indica si el sidebar está colapsado
 * @param {function} props.onClick - Función al hacer click (para items sin href o submenús)
 */
const SidebarItem = ({ icon: Icon, label, href, active = false, isCollapsed = false, onClick }) => {
  const baseClasses = 'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out';
  const stateClasses = active
    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200';

  const content = (
    <>
      {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
      {!isCollapsed && <span className="truncate">{label}</span>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`${baseClasses} ${stateClasses}`}>
        {content}
      </Link>
    );
  }

  return (
    <ark.button onClick={onClick} className={`w-full ${baseClasses} ${stateClasses}`}>
      {content}
    </ark.button>
  );
};

export default SidebarItem;
