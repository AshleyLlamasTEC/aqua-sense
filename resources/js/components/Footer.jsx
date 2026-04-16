import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import {
    DropletIcon,
    Facebook02Icon,
    TwitterIcon,
    InstagramIcon,
    GithubIcon,
    Mail01Icon,
    TelephoneIcon,
    Location01Icon,
    SentIcon,
} from "hugeicons-react";

const Footer = () => {
    const [email, setEmail] = useState("");
    const [isSubscribed, setIsSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) {
            // Aquí iría la lógica de suscripción
            setIsSubscribed(true);
            setEmail("");
            setTimeout(() => setIsSubscribed(false), 3000);
        }
    };

    return (
        <footer className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-cyan-900 text-gray-300 overflow-hidden">
            {/* Elementos decorativos de fondo */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Sección principal del footer */}
                <div className="py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Columna 1 - Información de la empresa */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="flex items-center space-x-3 group">
                            <img
                                src="/images/logo.png"
                                alt="Logo"
                                className="w-16"
                            />
                            <div>
                                <span className="text-xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                                    AquaSense
                                </span>
                                <p className="text-xs text-cyan-300">
                                    Smart Aquarium Monitoring
                                </p>
                            </div>
                        </div>

                        <p className="text-gray-400 leading-relaxed">
                            Monitoreo inteligente para acuarios modernos. Mantén
                            a tus amigos acuáticos saludables y felices con
                            tecnología de vanguardia.
                        </p>

                        {/* Redes sociales */}
                        <div className="space-y-3">
                            <p className="text-sm font-semibold text-white">
                                Síguenos
                            </p>
                            <div className="flex space-x-3">
                                <a
                                    href="#"
                                    className="p-2 bg-gray-800 hover:bg-cyan-600 rounded-lg transition-all duration-300 transform hover:scale-110 group"
                                >
                                    <Facebook02Icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                                </a>
                                <a
                                    href="#"
                                    className="p-2 bg-gray-800 hover:bg-cyan-600 rounded-lg transition-all duration-300 transform hover:scale-110 group"
                                >
                                    <TwitterIcon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                                </a>
                                <a
                                    href="#"
                                    className="p-2 bg-gray-800 hover:bg-cyan-600 rounded-lg transition-all duration-300 transform hover:scale-110 group"
                                >
                                    <InstagramIcon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                                </a>
                                <a
                                    href="#"
                                    className="p-2 bg-gray-800 hover:bg-cyan-600 rounded-lg transition-all duration-300 transform hover:scale-110 group"
                                >
                                    <GithubIcon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Columna 2 - Enlaces rápidos */}
                    <div className="lg:col-span-2">
                        <h3 className="text-white font-semibold mb-4 relative inline-block">
                            Producto
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500 to-transparent rounded-full"></div>
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    href="/features"
                                    className="text-gray-400 hover:text-cyan-400 transition-colors duration-200 flex items-center space-x-2 group"
                                >
                                    <span className="w-1 h-1 bg-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    <span>Características</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/pricing"
                                    className="text-gray-400 hover:text-cyan-400 transition-colors duration-200 flex items-center space-x-2 group"
                                >
                                    <span className="w-1 h-1 bg-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    <span>Precios</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/demo"
                                    className="text-gray-400 hover:text-cyan-400 transition-colors duration-200 flex items-center space-x-2 group"
                                >
                                    <span className="w-1 h-1 bg-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    <span>Demo</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/download"
                                    className="text-gray-400 hover:text-cyan-400 transition-colors duration-200 flex items-center space-x-2 group"
                                >
                                    <span className="w-1 h-1 bg-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    <span>App Móvil</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Columna 3 - Compañía */}
                    <div className="lg:col-span-2">
                        <h3 className="text-white font-semibold mb-4 relative inline-block">
                            Compañía
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500 to-transparent rounded-full"></div>
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    href="/about"
                                    className="text-gray-400 hover:text-cyan-400 transition-colors duration-200 flex items-center space-x-2 group"
                                >
                                    <span className="w-1 h-1 bg-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    <span>Nosotros</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/blog"
                                    className="text-gray-400 hover:text-cyan-400 transition-colors duration-200 flex items-center space-x-2 group"
                                >
                                    <span className="w-1 h-1 bg-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    <span>Blog</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    className="text-gray-400 hover:text-cyan-400 transition-colors duration-200 flex items-center space-x-2 group"
                                >
                                    <span className="w-1 h-1 bg-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    <span>Contacto</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Columna 4 - Contacto y Newsletter */}
                    <div className="lg:col-span-4">
                        <h3 className="text-white font-semibold mb-4 relative inline-block">
                            Suscríbete
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500 to-transparent rounded-full"></div>
                        </h3>

                        <p className="text-gray-400 text-sm mb-4">
                            Recibe las últimas novedades y actualizaciones
                            directamente en tu correo.
                        </p>

                        <form onSubmit={handleSubscribe} className="mb-6">
                            <div className="flex flex-col sm:flex-row gap-2">
                                <div className="flex-1 relative">
                                    <Mail01Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="tu@email.com"
                                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 text-white placeholder-gray-500"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                                >
                                    <SentIcon className="w-4 h-4" />
                                    <span>Suscribir</span>
                                </button>
                            </div>
                        </form>

                        {isSubscribed && (
                            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm animate-fade-in">
                                ¡Gracias por suscribirte! Pronto recibirás
                                nuestras novedades.
                            </div>
                        )}

                        {/* Información de contacto */}
                        <div className="space-y-3 pt-4 border-t border-gray-800">
                            <div className="flex items-center space-x-3 text-gray-400 hover:text-cyan-400 transition-colors">
                                <Mail01Icon className="w-4 h-4" />
                                <a
                                    href="mailto:info@aquasense.com"
                                    className="text-sm"
                                >
                                    info@aquasense.com
                                </a>
                            </div>
                            <div className="flex items-center space-x-3 text-gray-400 hover:text-cyan-400 transition-colors">
                                <TelephoneIcon className="w-4 h-4" />
                                <a href="tel:+1234567890" className="text-sm">
                                    +1 (234) 567-890
                                </a>
                            </div>
                            <div className="flex items-center space-x-3 text-gray-400">
                                <Location01Icon className="w-4 h-4" />
                                <span className="text-sm">
                                    Silicon Valley, CA
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección inferior */}
                <div className="border-t border-gray-800 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-center md:text-left">
                        <p className="text-sm text-gray-500">
                            &copy; 2024 AquaSense. Todos los derechos
                            reservados.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6">
                        <Link
                            href="/privacy"
                            className="text-sm text-gray-500 hover:text-cyan-400 transition-colors"
                        >
                            Privacidad
                        </Link>
                        <Link
                            href="/terms"
                            className="text-sm text-gray-500 hover:text-cyan-400 transition-colors"
                        >
                            Términos de Servicio
                        </Link>
                        <Link
                            href="/cookies"
                            className="text-sm text-gray-500 hover:text-cyan-400 transition-colors"
                        >
                            Cookies
                        </Link>
                        <Link
                            href="/sitemap"
                            className="text-sm text-gray-500 hover:text-cyan-400 transition-colors"
                        >
                            Mapa del Sitio
                        </Link>
                    </div>

                    {/* Selector de idioma (opcional) */}
                    <div className="flex items-center space-x-2">
                        <button className="px-3 py-1 bg-gray-800 rounded-lg text-sm text-gray-400 hover:text-cyan-400 transition-colors">
                            🇪🇸 Español
                        </button>
                        <button className="px-3 py-1 bg-gray-800 rounded-lg text-sm text-gray-400 hover:text-cyan-400 transition-colors">
                            🇺🇸 English
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
