/**
 * Design System Utilities for AquaSenseIoT IoT Dashboard
 * Centralized design tokens, glassmorphism, and status handling
 */

export const DESIGN_TOKENS = {
  transitions: {
    fast: '150ms',
    medium: '200ms',
    slow: '300ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px'
  },
  status: {
    healthy: {
      bg: 'bg-green-500/10',
      text: 'text-green-500',
      border: 'border-green-500/20',
      dot: 'bg-green-500',
      ring: 'ring-green-500/30'
    },
    warning: {
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-500',
      border: 'border-yellow-500/20',
      dot: 'bg-yellow-500',
      ring: 'ring-yellow-500/30'
    },
    danger: {
      bg: 'bg-red-500/10',
      text: 'text-red-500',
      border: 'border-red-500/20',
      dot: 'bg-red-500',
      ring: 'ring-red-500/30'
    }
  }
};

// Glassmorphism utility - consistent across all components
export const glassClasses = 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20 dark:border-gray-800';

// Status indicator classes
export const getStatusClasses = (status) => {
  if (!status) return '';
  const config = DESIGN_TOKENS.status[status];
  return config ? `${config.dot} ring-2 ${config.ring}` : 'bg-gray-400';
};

// Status text classes
export const getStatusTextClasses = (status) => {
  if (!status) return '';
  const config = DESIGN_TOKENS.status[status];
  return config ? config.text : '';
};

// Gradient for active states (only when meaningful)
export const activeGradient = 'bg-gradient-to-r from-blue-500/10 to-cyan-400/10';
export const activeIndicatorGradient = 'bg-gradient-to-b from-blue-500 to-cyan-400';
