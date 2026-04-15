import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-[#004F59] to-[#006D7A] text-white hover:shadow-lg hover:shadow-[#004F59]/20 hover:-translate-y-0.5',
    secondary: 'bg-white/10 backdrop-blur-sm text-[#004F59] border border-[#004F59]/20 hover:bg-white/20',
    outline: 'bg-transparent text-[#004F59] border-2 border-[#004F59]/30 hover:border-[#004F59] hover:bg-[#004F59]/5',
    ghost: 'bg-transparent text-[#004F59]/70 hover:text-[#004F59] hover:bg-[#004F59]/5'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <button
      className={`
        rounded-xl font-medium transition-all duration-300
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
