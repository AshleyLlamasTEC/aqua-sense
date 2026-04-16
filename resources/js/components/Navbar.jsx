import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
  DropletIcon,
  Login01Icon,
  UserAdd01Icon,
  Menu01Icon,
  Cancel01Icon
} from 'hugeicons-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { url } = usePage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', route: 'home' },
    { name: 'Nosotros', route: 'about' },
    { name: 'Contacto', route: 'contact' },
  ];

  const isActive = (path) => url === path;

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <img src="/images/logo.png" alt="Logo" className='w-16'/>
            <span className={`text-xl font-bold transition-colors duration-300 ${
              isScrolled ? 'text-gray-800' : 'text-white'
            }`}>
              AquaSense
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.route ? route(link.route) : '#'}
                className={`relative px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? isScrolled ? 'text-cyan-600' : 'text-cyan-300'
                    : isScrolled
                      ? 'text-gray-700 hover:text-cyan-600'
                      : 'text-gray-200 hover:text-white'
                }`}
              >
                {link.name}
                {isActive(link.href) && (
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 rounded-full animate-fade-in ${
                    isScrolled ? 'bg-cyan-600' : 'bg-cyan-300'
                  }`} />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link href="/login">
              <button className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                isScrolled
                  ? 'text-gray-700 hover:text-cyan-600'
                  : 'text-white hover:text-cyan-200'
              }`}>
                <Login01Icon className="w-4 h-4" />
                <span>Iniciar Sesión</span>
              </button>
            </Link>
            <Link href="/register">
              <button className={`px-6 py-2 rounded-full flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 shadow-md ${
                isScrolled
                  ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                  : 'bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30'
              }`}>
                <UserAdd01Icon className="w-4 h-4" />
                <span>Registrarse</span>
              </button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors duration-200 ${
              isScrolled
                ? 'text-gray-700 hover:bg-gray-100'
                : 'text-white hover:bg-white/10'
            }`}
          >
            {isMobileMenuOpen ? <Cancel01Icon className="w-6 h-6" /> : <Menu01Icon className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 animate-slide-down">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`block px-4 py-3 text-base font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-cyan-600 bg-cyan-50'
                    : isScrolled
                      ? 'text-gray-700 hover:text-cyan-600 hover:bg-gray-50'
                      : 'text-white hover:text-cyan-200 hover:bg-white/10'
                } rounded-lg`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="mt-4 space-y-3 px-4">
              <Link href="/login" className="block w-full">
                <button className={`w-full px-4 py-2 rounded-lg transition-all duration-200 ${
                  isScrolled
                    ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    : 'border border-white/30 text-white hover:bg-white/10'
                }`}>
                  Iniciar Sesión
                </button>
              </Link>
              <Link href="/register" className="block w-full">
                <button className={`w-full px-4 py-2 rounded-lg transition-all duration-200 ${
                  isScrolled
                    ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                    : 'bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white'
                }`}>
                  Registrarse
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
