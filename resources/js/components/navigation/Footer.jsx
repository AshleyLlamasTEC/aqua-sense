/**
 * Footer Component - Glass-styled with system status
 * Features: System health, quick stats, links, version
 * Responsive: Stacks on mobile, horizontal on desktop
 */

import React from 'react';
import { glassClasses, getStatusTextClasses } from './utils/design-system';
import { useSystemHealth } from './hooks/useSystemHealth';

const SystemStatus = () => {
  const { status, criticalIssues, lastUpdate } = useSystemHealth();
  const statusTextClass = getStatusTextClasses(status);

  const statusMessages = {
    healthy: 'Sistema Operativo',
    warning: 'Atención Requerida',
    danger: 'Sistema Crítico'
  };

  return (
    <div className="flex items-center space-x-3 group">
      <div className="relative">
        <div className={`w-2 h-2 ${status === 'healthy' ? 'bg-green-500' : status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'} rounded-full transition-all duration-200 group-hover:scale-110`} />
        {status !== 'healthy' && (
          <div className={`absolute inset-0 ${status === 'healthy' ? 'bg-green-500' : status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'} rounded-full animate-ping opacity-75`} />
        )}
      </div>

      <div className="flex flex-col items-start">
        <span className={`text-xs font-medium transition-colors duration-200 ${statusTextClass}`}>
          {statusMessages[status]}
        </span>
        <span className="text-[10px] text-gray-400">
          {lastUpdate.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

const QuickStats = () => {
  // Placeholder - would come from useAlerts() hook
  const alertsToday = 0;

  return (
    <div className="flex items-center space-x-4 text-xs">
      <div className="flex items-center space-x-1">
        <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-gray-500 hidden xs:inline">12/12 Activos</span>
        <span className="text-gray-500 xs:hidden">12/12</span>
      </div>

      {alertsToday > 0 && (
        <div className="flex items-center space-x-1">
          <svg className="w-3 h-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-yellow-600">
            {alertsToday} Hoy
          </span>
        </div>
      )}
    </div>
  );
};

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`
      py-3 sm:py-4 px-3 sm:px-6
      border-t border-gray-200/60
      ${glassClasses}
      transition-all duration-200
    `}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-sm">

        {/* Left - Copyright */}
        <div className="text-gray-500 text-center text-xs sm:text-sm order-2 sm:order-1">
          <span>© {currentYear} AquaSenseIoT.</span>
          <span className="hidden sm:inline"> Todos los derechos reservados.</span>
        </div>

        {/* Center - System Status & Stats */}
        <div className="flex flex-col xs:flex-row items-center gap-3 sm:gap-4 order-1 sm:order-2">
          <SystemStatus />
          <div className="hidden xs:block w-px h-4 bg-gray-300" />
          <QuickStats />
        </div>

        {/* Right - Links & Version */}
        <div className="flex items-center gap-3 sm:gap-4 order-3">
          <div className="flex gap-2 sm:gap-3">
            <a href="#" className="text-xs sm:text-sm text-gray-500 hover:text-blue-600 transition-all duration-200 hover:scale-105 active:scale-95">
              Soporte
            </a>
            <a href="#" className="hidden sm:inline text-sm text-gray-500 hover:text-blue-600 transition-all duration-200 hover:scale-105 active:scale-95">
              Privacidad
            </a>
            <a href="#" className="text-xs sm:text-sm text-gray-500 hover:text-blue-600 transition-all duration-200 hover:scale-105 active:scale-95">
              Términos
            </a>
          </div>

          <div className="w-px h-4 bg-gray-300 hidden xs:block" />

          <span className="text-xs text-gray-400 cursor-help">
            v2.0.0
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
