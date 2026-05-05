import { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useSidebarStore } from '../navigation/stores/useSidebarStore';
import { useIsMobile } from '../navigation/hooks/useMediaQuery';

const Navbar = () => {

  const isMobile = useIsMobile();

  const { toggleMobile } = useSidebarStore();

  const { auth } = usePage().props;

  const user = auth.user;

  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef();


  useEffect(() => {

    const handleClickOutside = (event) => {

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }

    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };

  }, []);


  return (

    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-200/60">

      <div className="px-4 lg:px-6">

        <div className="flex items-center justify-between h-16">


          {/* Izquierda */}
          <div className="flex items-center gap-3">

            {isMobile && (

              <button
                onClick={toggleMobile}
                className="p-2 rounded-lg hover:bg-gray-100"
                aria-label="Abrir menú"
              >

                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />

                </svg>

              </button>

            )}

            <h1 className="text-lg font-semibold">
                AquaSenseIoT
            </h1>

          </div>



          {/* Derecha */}
          <div
            className="relative"
            ref={dropdownRef}
          >

            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition"
            >

              {user.name.charAt(0).toUpperCase()}

            </button>



            {showDropdown && (

              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">

                {/* Info usuario */}
                <div className="px-4 py-3 border-b bg-gray-50">

                  <p className="text-sm font-medium text-gray-900">
                    {user.name}
                  </p>

                  <p className="text-xs text-gray-500 truncate">
                    {user.email}
                  </p>

                </div>



                {/* Perfil */}
                <Link
                  href={route('profile.edit')}
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Mi perfil
                </Link>



                {/* Logout */}
                <Link
                  href={route('logout')}
                  method="post"
                  as="button"
                  className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                >
                  Cerrar sesión
                </Link>

              </div>

            )}

          </div>

        </div>

      </div>

    </header>

  );

};

export default Navbar;
