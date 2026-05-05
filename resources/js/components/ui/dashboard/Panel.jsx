/**
 * Componente Panel para contener widgets relacionados.
 * Extiende la tarjeta base con una cabecera opcional.
 */

import React from 'react';
import Card from '../Card';

/**
 * Panel con cabecera, ideal para agrupar widgets.
 * @param {Object} props
 * @param {string} props.title - Título del panel
 * @param {React.ReactNode} props.actions - Acciones en la cabecera
 * @param {React.ReactNode} props.children - Contenido del panel (normalmente widgets)
 * @param {string} props.className - Clases CSS adicionales para el contenido
 * @param {boolean} props.noCardPadding - Hereda la propiedad noPadding de Card
 */
const Panel = ({ title, actions, children, className = '', noCardPadding = false }) => {
  return (
    <Card noPadding={noCardPadding}>
      {/* Cabecera del panel (si hay título o acciones) */}
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 border-b border-gray-200">
          {title && (
            <h3 className="text-lg font-medium text-gray-900">
              {title}
            </h3>
          )}
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Contenido del panel */}
      <div className={`${noCardPadding ? '' : 'p-5'} ${className}`}>
        {children}
      </div>
    </Card>
  );
};

export default Panel;
