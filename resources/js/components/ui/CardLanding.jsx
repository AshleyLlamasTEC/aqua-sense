import React from 'react';

export const Card = ({ children, className = '', hover = true }) => {
  return (
    <div
      className={`
        bg-white/80 backdrop-blur-sm rounded-2xl p-6
        border border-[#50C878]/10
        shadow-lg shadow-[#004F59]/5
        ${hover ? 'hover:shadow-xl hover:shadow-[#004F59]/10 hover:-translate-y-1 hover:border-[#50C878]/30' : ''}
        transition-all duration-300
        ${className}
      `}
    >
      {children}
    </div>
  );
};
