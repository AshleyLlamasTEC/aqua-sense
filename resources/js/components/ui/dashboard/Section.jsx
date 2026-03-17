/**
 * Componente Section para agrupar paneles y widgets en una página.
 * Proporciona un título y acciones a nivel de sección.
 */

import React from 'react';

/**
 * Sección del dashboard que contiene un título, acciones y contenido.
 * @param {Object} props
 * @param {string} props.title - Título de la sección
 * @param {string} props.description - Descripción opcional de la sección
 * @param {React.ReactNode} props.actions - Botones o elementos de acción (derecha)
 * @param {React.ReactNode} props.children - Contenido de la sección (paneles, widgets)
 * @param {string} props.className - Clases CSS adicionales
 */
const Section = ({ title, description, actions, children, className = '' }) => {
  return (
    <section className={`mb-8 ${className}`}>
      {/* Cabecera de la sección */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Contenido de la sección */}
      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
};

export default Section;
