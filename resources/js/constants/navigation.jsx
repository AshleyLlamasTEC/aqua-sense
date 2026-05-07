/**
 * Archivo de constantes para la navegación principal de la aplicación.
 * Centraliza las rutas y la estructura del menú para facilitar su mantenimiento.
 */

// Importación dinámica de iconos de HugeIcons (asumiendo que se usan como componentes)
// En un proyecto real, importarías los iconos específicos, ej:
// import { Home03Icon, DashboardSquare02Icon, FishFoodIcon, ... } from 'hugeicons/react';

// Placeholder para iconos
import {
    DashboardSquare02Icon,
    FishFoodIcon,
    SoilTemperatureGlobalIcon,
    CubeIcon
 } from 'hugeicons-react';

/**
 * Define la estructura de la navegación principal del sidebar.
 * Cada item puede tener un label, una ruta, un icono y opcionalmente hijos (submenús).
 */
export const NAVIGATION_ITEMS = [
    {
        label: "Dashboard",
        route: "admin.home",
        icon: DashboardSquare02Icon,
    },
    {
        label: 'Acuarios',
        route: "admin.aquariums.index",
        icon: FishFoodIcon,
    },
    // {
    //     label: "Sensores",
    //     // route: 'admin.sensors',
    //     route: "admin.home",
    //     icon: SoilTemperatureGlobalIcon,
    // },
    // {
    //     label: "Configuración",
    //     // route: 'admin.settings',
    //     route: "admin.home",
    //     icon: DashboardSquare02Icon,
    //     children: [
    //         // Ejemplo de submenú
    //         {
    //             label: "Perfil",
    //             // route: "admin.settings.profile"
    //             route: "admin.home",
    //         },
    //         {
    //             label: "Preferencias",
    //             // route: "admin.settings.preferences"
    //             route: "admin.home",
    //         },
    //     ],
    // },
];

/**
 * Constantes para acciones comunes o rutas específicas.
 */
export const APP_NAME = "Mi Dashboard";
export const HOME_ROUTE = "admin.home";
