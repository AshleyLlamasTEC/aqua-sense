/**
 * Punto de entrada principal de la aplicación React con Inertia.
 * Configura el proveedor de Inertia y cualquier contexto global (como el de tema).
 */

import React from 'react';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

// Importar estilos globales de Tailwind
import '../css/app.css';

createInertiaApp({
  id: 'app',
  resolve: name => {
    // Resolución de páginas desde la carpeta pages
    const pages = import.meta.glob('./pages/**/*.jsx', { eager: true });
    return pages[`./pages/${name}.jsx`];
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <React.StrictMode>
          <App {...props} />
      </React.StrictMode>
    );
  },
  progress: {
    // Configuración de la barra de progreso de Inertia
    delay: 250,
    color: '#3b82f6',
    includeCSS: true,
    showSpinner: true,
  },
});
