/**
 * Sistema centralizado de z-index
 *
 * Jerarquía:
 * - Tooltip: 60 (más alto, debe estar sobre todo)
 * - Navbar: 50 (siempre visible)
 * - Sidebar: 40
 * - Overlay: 30
 * - Dropdown: 20
 * - Content: 10
 */

export const Z_INDEX = {
  TOOLTIP: 60,     // Tooltips de Ark UI
  NAVBAR: 50,      // Barra de navegación superior
  SIDEBAR: 40,     // Sidebar lateral
  OVERLAY: 30,     // Overlay oscuro para mobile
  DROPDOWN: 20,    // Menús desplegables
  CONTENT: 10,     // Contenido principal
};

// Clases de Tailwind para usar directamente
export const zIndexClasses = {
  tooltip: 'z-[60]',  // Usando valor arbitrario para z-60
  navbar: 'z-50',
  sidebar: 'z-40',
  overlay: 'z-30',
  dropdown: 'z-20',
  content: 'z-10',
};
