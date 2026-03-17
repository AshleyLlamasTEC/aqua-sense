/**
 * Componente Container para centrar y limitar el ancho del contenido.
 */

import React from 'react';

/**
 * Contenedor con ancho máximo y padding.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido a centrar
 * @param {string} props.className - Clases CSS adicionales
 * @param {string} props.maxWidth - Clase de ancho máximo de Tailwind (ej. 'max-w-7xl')
 */
const Container = ({ children, className = '', maxWidth = 'max-w-7xl' }) => {
  return (
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${maxWidth} ${className}`}>
      {children}
    </div>
  );
};

export default Container;
