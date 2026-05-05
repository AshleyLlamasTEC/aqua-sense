// resources/js/Components/Sidebar/Sidebar.jsx
import { useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import { useSidebarStore } from "../navigation/stores/useSidebarStore";
import { useIsMobile } from "../navigation/hooks/useMediaQuery";
import SidebarItem from "./SidebarItem";
import { NAVIGATION_ITEMS } from "@/constants/navigation";
import {
    DashboardSquare02Icon,
    FishFoodIcon,
    SoilTemperatureGlobalIcon,
    Settings01Icon,
} from "hugeicons-react";
import clsx from "clsx";

// Mapa de iconos (mejor que placeholder)
const ICON_MAP = {
    dashboard: DashboardSquare02Icon,
    aquarium: FishFoodIcon,
    sensor: SoilTemperatureGlobalIcon,
    settings: Settings01Icon,
};

const Sidebar = () => {
    const { url } = usePage();
    const isMobile = useIsMobile();

    // Zustand store
    const {
        isCollapsed,
        isMobileOpen,
        toggleCollapsed,
        closeMobile,
        toggleMobile,
    } = useSidebarStore();

    // Bloquear scroll cuando sidebar mobile está abierto
    useEffect(() => {
        if (isMobile && isMobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isMobile, isMobileOpen]);

    // Determinar visibilidad y ancho
    const isVisible = isMobile ? isMobileOpen : true;
    const width = isCollapsed && !isMobile ? "w-20" : "w-64";

    // En móvil, si no está visible, no renderizar nada
    if (!isVisible) return null;

    return (
        <>
            {/* Overlay móvil */}
            {isMobile && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
                    onClick={closeMobile}
                />
            )}

            {/* Sidebar */}
            <aside
                className={clsx(
                    "fixed top-0 left-0 h-screen z-40",
                    "bg-white/70 backdrop-blur-xl",
                    "border-r border-gray-200/60",
                    "shadow-xl transition-all duration-300 ease-out",
                    width,
                    isMobile && "transform",
                    isMobile && !isMobileOpen && "-translate-x-full",
                )}
            >
                {/* Header */}
                <div className="flex items-center h-16 px-4 border-b border-gray-200/60">
                    {(!isCollapsed || isMobile) && (
                        <Link href="/" className="flex items-center space-x-2">
                            <img
                                src="/images/logo.png"
                                alt="AquaSenseIoT"
                                className="h-8 w-auto"
                            />
                            <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                AquaSenseIoT
                            </span>
                        </Link>
                    )}

                    {/* Botón colapsar (solo desktop) */}
                    {!isMobile && (
                        <button
                            onClick={toggleCollapsed}
                            className={clsx(
                                "p-2 ml-auto rounded-lg transition-colors",
                                "hover:bg-gray-100",
                                "text-gray-500",
                            )}
                            aria-label={isCollapsed ? "Expandir" : "Colapsar"}
                        >
                            <svg
                                className={clsx(
                                    "w-5 h-5 transition-transform duration-200",
                                    isCollapsed && "rotate-180",
                                )}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 19l-7-7 7-7"
                                />
                            </svg>
                        </button>
                    )}

                    {/* Botón cerrar (solo mobile) */}
                    {isMobile && (
                        <button
                            onClick={closeMobile}
                            className="p-2 ml-auto rounded-lg hover:bg-gray-100"
                            aria-label="Cerrar menú"
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
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Navegación */}
                <nav className="h-[calc(100vh-4rem)] overflow-y-auto py-4 px-3">
                    <ul className="space-y-1">
                        {NAVIGATION_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const isActive =
                                item.route === "/"
                                    ? url === "/"
                                    : route().current(item.route);

                            return (
                                <li key={item.route}>
                                    <SidebarItem
                                        icon={Icon}
                                        label={item.label}
                                        href={route(item.route)}
                                        active={isActive}
                                        collapsed={isCollapsed && !isMobile}
                                        badge={item.badge}
                                    />
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
