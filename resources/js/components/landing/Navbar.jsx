import React, { useState, useEffect } from 'react';
import { SmartWatch01Icon, Home03Icon, InformationCircleIcon, Mail01Icon } from 'hugeicons-react';
import { Button } from '../ui/ButtonLanding';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', icon: Home03Icon, href: '/' },
    { name: 'Nosotros', icon: InformationCircleIcon, href: '/about' },
    { name: 'Contacto', icon: Mail01Icon, href: '/contact' }
  ];

  return (
    <nav
      className={`
        fixed top-0 w-full z-50 transition-all duration-300
        ${scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-lg shadow-[#004F59]/5 py-3'
          : 'bg-transparent py-5'
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <SmartWatch01Icon
                className="w-8 h-8 text-[#50C878] transition-all duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-[#50C878]/20 blur-xl rounded-full group-hover:bg-[#50C878]/30 transition-all duration-300"></div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#004F59] to-[#006D7A] bg-clip-text text-transparent">
              AquaSense
            </span>
          </a>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="flex items-center space-x-1 text-[#004F59]/70 hover:text-[#004F59] transition-colors duration-200"
              >
                <link.icon className="w-4 h-4" />
                <span className="font-medium">{link.name}</span>
              </a>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm">
              Iniciar Sesión
            </Button>
            <Button variant="primary" size="sm">
              Registrarse
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
