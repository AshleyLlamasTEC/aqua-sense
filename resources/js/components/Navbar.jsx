import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
  Login01Icon,
  UserAdd01Icon,
  Home01Icon,
  Menu01Icon,
  Cancel01Icon
} from 'hugeicons-react';

const Navbar = () => {

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { auth, url } = usePage().props;


  useEffect(() => {

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);

  }, []);


  const navLinks = [
    { name: 'Inicio', route: 'admin.home' },
    { name: 'Nosotros', route: 'about' },
    { name: 'Contacto', route: 'contact' },
  ];


  const isActive = (path) => url === path;


  return (

    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled
        ? 'bg-white/95 backdrop-blur-md shadow-lg'
        : 'bg-transparent'
    }`}>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex justify-between items-center h-16 md:h-20">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 group"
          >

            <img
              src="/images/logo.png"
              alt="Logo"
              className="w-16"
            />

            <span className={`text-xl font-bold transition-colors duration-300 ${
              isScrolled
                ? 'text-gray-800'
                : 'text-white'
            }`}>
              AquaSenseIoT
            </span>

          </Link>



          {/* Navegación */}
          <div className="hidden md:flex items-center space-x-8">

            {navLinks.map((link) => (

              <Link
                key={link.name}
                href={route(link.route)}
                className={`relative px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isScrolled
                    ? 'text-gray-700 hover:text-cyan-600'
                    : 'text-gray-200 hover:text-white'
                }`}
              >

                {link.name}

              </Link>

            ))}

          </div>



          {/* Botones desktop */}
          <div className="hidden md:flex items-center space-x-3">

            {auth?.user ? (

              <Link href={route('admin.home')}>

                <button className={`px-6 py-2 rounded-full flex items-center space-x-2 transition-all duration-300 ${
                  isScrolled
                    ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                    : 'bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30'
                }`}>

                  <Home01Icon className="w-4 h-4" />

                  <span>
                    Ir al panel
                  </span>

                </button>

              </Link>

            ) : (

              <>

                <Link href={route('login')}>

                  <button className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isScrolled
                      ? 'text-gray-700 hover:text-cyan-600'
                      : 'text-white hover:text-cyan-200'
                  }`}>

                    <Login01Icon className="w-4 h-4" />

                    <span>
                      Iniciar sesión
                    </span>

                  </button>

                </Link>



                <Link href={route('register')}>

                  <button className={`px-6 py-2 rounded-full flex items-center space-x-2 transition-all duration-300 ${
                    isScrolled
                      ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                      : 'bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30'
                  }`}>

                    <UserAdd01Icon className="w-4 h-4" />

                    <span>
                      Registrarse
                    </span>

                  </button>

                </Link>

              </>

            )}

          </div>

        </div>

      </div>

    </nav>

  );
};

export default Navbar;
