import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    DashboardIcon,
    DropletIcon,
    UserIcon,
    LogoutIcon,
    MenuIcon,
    CloseIcon
} from '@hugeicons/react';

export default function AuthenticatedLayout({ header, children }) {

    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (

        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-white">

            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    <div className="flex h-16 justify-between">

                        {/* Logo + navegación */}
                        <div className="flex">

                            <div className="flex shrink-0 items-center">

                                <Link
                                    href="/"
                                    className="flex items-center space-x-2"
                                >

                                    <ApplicationLogo className="block h-8 w-auto" />

                                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                        AquaSense
                                    </span>

                                </Link>

                            </div>


                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex sm:items-center">

                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                    className="text-gray-700 hover:text-blue-600 transition-colors"
                                >

                                    <div className="flex items-center space-x-1">
                                        <DashboardIcon className="h-4 w-4" />
                                        <span>Panel</span>
                                    </div>

                                </NavLink>


                                <NavLink
                                    href={route('water-quality')}
                                    active={route().current('water-quality')}
                                    className="text-gray-700 hover:text-blue-600 transition-colors"
                                >

                                    <div className="flex items-center space-x-1">
                                        <DropletIcon className="h-4 w-4" />
                                        <span>Calidad del agua</span>
                                    </div>

                                </NavLink>

                            </div>

                        </div>



                        {/* Usuario desktop */}
                        <div className="hidden sm:flex sm:items-center sm:space-x-4">

                            <Dropdown>

                                <Dropdown.Trigger>

                                    <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors focus:outline-none">

                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">

                                            {user.name.charAt(0).toUpperCase()}

                                        </div>

                                        <span className="text-sm font-medium">
                                            {user.name}
                                        </span>


                                        <svg
                                            className="h-4 w-4"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>

                                    </button>

                                </Dropdown.Trigger>


                                <Dropdown.Content className="mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100">

                                    <Dropdown.Link
                                        href={route('profile.edit')}
                                        className="flex items-center space-x-2 px-4 py-2 hover:bg-blue-50"
                                    >

                                        <UserIcon className="h-4 w-4" />

                                        <span>
                                            Mi perfil
                                        </span>

                                    </Dropdown.Link>



                                    <Dropdown.Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="flex items-center space-x-2 px-4 py-2 hover:bg-blue-50 text-red-600"
                                    >

                                        <LogoutIcon className="h-4 w-4" />

                                        <span>
                                            Cerrar sesión
                                        </span>

                                    </Dropdown.Link>

                                </Dropdown.Content>

                            </Dropdown>

                        </div>



                        {/* Botón móvil */}
                        <div className="-me-2 flex items-center sm:hidden">

                            <button
                                onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                            >

                                {
                                    showingNavigationDropdown
                                        ? <CloseIcon className="h-6 w-6" />
                                        : <MenuIcon className="h-6 w-6" />
                                }

                            </button>

                        </div>

                    </div>

                </div>



                {/* Menú móvil */}
                <div className={`${showingNavigationDropdown ? 'block' : 'hidden'} sm:hidden`}>

                    <div className="pt-2 pb-3 space-y-1">

                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Panel
                        </ResponsiveNavLink>


                        <ResponsiveNavLink
                            href={route('water-quality')}
                            active={route().current('water-quality')}
                        >
                            Calidad del agua
                        </ResponsiveNavLink>

                    </div>



                    <div className="pt-4 pb-1 border-t border-gray-200">

                        <div className="px-4">

                            <div className="font-medium text-gray-800">
                                {user.name}
                            </div>

                            <div className="text-sm text-gray-500">
                                {user.email}
                            </div>

                        </div>



                        <div className="mt-3 space-y-1">

                            <ResponsiveNavLink href={route('profile.edit')}>
                                Mi perfil
                            </ResponsiveNavLink>


                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Cerrar sesión
                            </ResponsiveNavLink>

                        </div>

                    </div>

                </div>

            </nav>



            {header && (

                <header className="bg-white/50 backdrop-blur-sm shadow-sm">

                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>

                </header>

            )}



            <main className="py-8">

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {children}
                </div>

            </main>

        </div>

    );
}
