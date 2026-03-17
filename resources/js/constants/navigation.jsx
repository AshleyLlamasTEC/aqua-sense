/**
 * Archivo de constantes para la navegación principal de la aplicación.
 * Centraliza las rutas y la estructura del menú para facilitar su mantenimiento.
 */

// Importación dinámica de iconos de HugeIcons (asumiendo que se usan como componentes)
// En un proyecto real, importarías los iconos específicos, ej:
// import { HomeIcon, DashboardIcon, AquariumIcon, ... } from 'hugeicons/react';

// Placeholder para iconos
const IconPlaceholder = () => <span className="w-5 h-5 bg-gray-300 rounded inline-block"></span>;

/**
 * Define la estructura de la navegación principal del sidebar.
 * Cada item puede tener un label, una ruta, un icono y opcionalmente hijos (submenús).
 */
export const NAVIGATION_ITEMS = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: IconPlaceholder, // Reemplazar con HugeIcon: DashboardIcon
  },
  {
    label: 'Acuarios',
    path: '/aquariums',
    icon: IconPlaceholder, // Reemplazar con HugeIcon: AquariumIcon
  },
  {
    label: 'Sensores',
    path: '/sensors',
    icon: IconPlaceholder, // Reemplazar con HugeIcon: SensorIcon
  },
  {
    label: 'Configuración',
    path: '/settings',
    icon: IconPlaceholder, // Reemplazar con HugeIcon: SettingsIcon
    children: [ // Ejemplo de submenú
      { label: 'Perfil', path: '/settings/profile' },
      { label: 'Preferencias', path: '/settings/preferences' },
    ],
  },
];

/**
 * Constantes para acciones comunes o rutas específicas.
 */
export const APP_NAME = 'Mi Dashboard';
export const HOME_ROUTE = '/dashboard';
