// resources/js/components/navigation/Sidebar.jsx
/**
 * Sidebar lateral con scroll independiente.
 *
 * Mejoras:
 * - Importa useSidebar desde hooks/ (re-exporta desde context),
 *   no directamente desde context/ — mantiene la convención.
 * - Agrega título/tooltip en modo colapsado para accesibilidad.
 * - Icono de colapso rota visualmente según el estado.
 */
import React from "react";
import { Link, usePage } from "@inertiajs/react";
import { ark } from "@ark-ui/react";
import { useSidebar } from "../../hooks/useSidebar";
import { NAVIGATION_ITEMS } from "../../constants/navigation";
import SidebarItem from "./SidebarItem";
import { route } from "ziggy-js";

const CollapseIcon = ({ flipped }) => (
    <svg
        className={`w-5 h-5 transition-transform duration-300 ${flipped ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
        />
    </svg>
);

const Sidebar = () => {
    const { isCollapsed, toggleSidebar } = useSidebar();
    const { url } = usePage();

    const isItemActive = (itemPath) => {
        if (itemPath === "/") return url === "/";
        return url.startsWith(itemPath);
    };

    return (
        <aside
            className={`
                fixed top-0 left-0 z-40 h-screen
                backdrop-blur-xl
                bg-white/80 dark:bg-gray-900/80
                border-r border-gray-200/60 dark:border-gray-800/60
                shadow-sm
                transition-all duration-300 ease-in-out
                ${isCollapsed ? "w-20" : "w-64"}
            `}
        >
            {/* Cabecera: logo + botón colapsar */}
            <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-800">
                <div
                    className={`flex-1 overflow-hidden transition-all duration-300 ${
                        isCollapsed ? "w-0 opacity-0" : "opacity-100"
                    }`}
                >
                    <Link
                        href="/"
                        className="flex flex-col items-center justify-center h-full text-gray-800 dark:text-white"
                    >
                        {/* Logo */}
                        <img
                            src="/images/logo.png"
                            alt="AquaSense Logo"
                            className="h-8 w-auto object-contain"
                        />

                        {/* Texto */}
                        <span className="text-xs font-semibold tracking-wide text-white dark:text-blue-400 leading-none">
                            AquaSense
                        </span>
                    </Link>
                </div>

                <ark.button
                    onClick={toggleSidebar}
                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
                    aria-label={
                        isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"
                    }
                >
                    <CollapseIcon flipped={isCollapsed} />
                </ark.button>
            </div>

            {/* Navegación con scroll independiente */}
            <nav
                className="h-[calc(100vh-4rem)] overflow-y-auto py-4 px-3
                scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600
                scrollbar-track-transparent"
            >
                <ul className="space-y-1">
                    {NAVIGATION_ITEMS.map((item) => {
                        if (!route().has(item.route)) return null;

                        return (
                            <li key={`${item.route}-${item.label}`}>
                                <SidebarItem
                                    icon={item.icon}
                                    label={item.label}
                                    href={route(item.route)}
                                    active={isItemActive(item.route)}
                                    isCollapsed={isCollapsed}
                                />
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
