/**
 * Componente Widget para mostrar un dato o métrica específica.
 * Es la unidad más pequeña dentro de un panel.
 */

import React from 'react';
import Card from '../Card';

/**
 * Widget simple para mostrar información clave.
 * @param {Object} props
 * @param {string} props.title - Título del widget
 * @param {React.ReactNode} props.icon - Icono del widget
 * @param {React.ReactNode} props.value - Valor principal a mostrar
 * @param {string} props.trend - Tendencia (ej. '+12%')
 * @param {boolean} props.trendUp - Indica si la tendencia es positiva
 * @param {React.ReactNode} props.children - Contenido personalizado (si no se usa value/trend)
 * @param {string} props.className - Clases CSS adicionales
 */
const Widget = ({ title, icon, value, trend, trendUp = true, children, className = '' }) => {
  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start justify-between">
        {/* Título e Icono */}
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
            {icon && <span className="text-gray-400">{icon}</span>}
            <span>{title}</span>
          </div>

          {/* Valor y Tendencia */}
          {value && (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">
                {value}
              </span>
              {trend && (
                <span className={`text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                  {trend}
                </span>
              )}
            </div>
          )}

          {/* Contenido personalizado (reemplaza value/trend) */}
          {children}
        </div>
      </div>
    </Card>
  );
};

export default Widget;
