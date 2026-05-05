/**
 * Componente Card para contener información de forma consistente.
 * Sigue el diseño limpio y minimalista.
 */

import React from 'react';

/**
 * Tarjeta con bordes suaves y sombra ligera.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido de la tarjeta
 * @param {string} props.className - Clases CSS adicionales
 * @param {boolean} props.noPadding - Si es true, elimina el padding interno
 */
const Card = ({ children, className = '', noPadding = false }) => {
  const baseClasses = 'bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden';
  const paddingClasses = noPadding ? '' : 'p-5';

  return (
    <div className={`${baseClasses} ${paddingClasses} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
