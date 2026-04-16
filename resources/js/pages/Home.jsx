import React from 'react';
import MainLayout from '@/Layouts/MainLayout';
import Hero from '@/Components/Hero';
import FeatureCard from '@/Components/FeatureCard';
import { Activity01Icon, Notification01Icon, ChartIcon, CpuIcon, ArrowRight02Icon } from 'hugeicons-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

const Home = () => {
  const features = [
    {
      icon: Activity01Icon,
      title: "Monitoreo en Tiempo Real",
      description: "Observa los parámetros de tu acuario actualizándose al instante con nuestros sensores ESP32. Temperatura, pH, TDS y más al alcance de tus dedos.",
      gradient: "from-cyan-500 to-blue-500"
    },
    {
      icon: Notification01Icon,
      title: "Alertas Inteligentes",
      description: "Recibe notificaciones instantáneas cuando los parámetros salen de rango. Personaliza los umbrales y recibe alertas por email, SMS o push.",
      gradient: "from-cyan-600 to-teal-500"
    },
    {
      icon: ChartIcon,
      title: "Datos Históricos",
      description: "Sigue tendencias y patrones con hermosos gráficos. Exporta datos y obtén información sobre la salud de tu acuario a lo largo del tiempo.",
      gradient: "from-cyan-500 to-blue-600"
    },
    {
      icon: CpuIcon,
      title: "Integración con ESP32",
      description: "Conexión perfecta con dispositivos ESP32. Proceso de configuración sencillo y transmisión de datos confiable con nuestro protocolo optimizado.",
      gradient: "from-cyan-700 to-purple-600"
    }
  ];

  return (
    <MainLayout>
      <Hero />

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-up">
            <div className="inline-block mb-4">
              <div className="w-20 h-1 bg-cyan-600 rounded-full mx-auto"></div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              Características Poderosas para
              <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent"> la Excelencia de tu Acuario</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Todo lo que necesitas para mantener el entorno acuático perfecto
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Preview Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900 via-cyan-800 to-blue-900 opacity-95"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514709870904-0c3f3b9d658a?ixlib=rb-4.0.3')] bg-cover bg-center mix-blend-overlay opacity-20"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-up">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 w-auto">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-cyan-200 text-sm font-semibold">Innovación Acuática</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                El Futuro del Cuidado de Acuarios
              </h2>

              <p className="text-white/90 text-lg leading-relaxed">
                Fundado por entusiastas de acuarios e innovadores tecnológicos, AquaSense combina
                tecnología IoT de vanguardia con un profundo conocimiento de los ecosistemas acuáticos.
                Nuestra misión es hacer que el monitoreo de acuarios de nivel profesional sea accesible
                para todos.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/about">
                  <button className="group inline-flex items-center px-6 py-3 bg-white text-cyan-700 hover:bg-cyan-50 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                    Conoce Más Sobre Nosotros
                    <ArrowRight02Icon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>

                <Link href={route('aquariumDemo')}>
                  <button className="inline-flex items-center px-6 py-3 border-2 border-white/30 text-white hover:bg-white/10 rounded-full font-semibold transition-all duration-300">
                    Ver Demo
                  </button>
                </Link>
              </div>
            </div>

            <div className="hidden lg:block relative animate-fade-up animation-delay-200">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent"></div>
                <div className="h-96 w-full bg-[url('https://images.unsplash.com/photo-1514709870904-0c3f3b9d658a?ixlib=rb-4.0.3')] bg-cover bg-center rounded-2xl" />
                <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-md rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white text-sm">Sistema Activo • 2,345+ Acuarios Conectados</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-white to-blue-50"></div>

        {/* Elementos decorativos */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-12 border border-cyan-100">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full mb-6 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 animate-fade-up">
              ¿Listo para Transformar tu <span className="text-cyan-600">Experiencia con Acuarios</span>?
            </h2>

            <p className="text-xl text-gray-600 mb-8 animate-fade-up animation-delay-200">
              Únete a miles de entusiastas de acuarios que confían en AquaSense para sus ecosistemas acuáticos
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up animation-delay-400">
              <Link href="/register">
                <button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl w-full sm:w-auto">
                  Comienza tu Prueba Gratis
                </button>
              </Link>

              <Link href="/contact">
                <button className="border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-50 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 w-full sm:w-auto">
                  Contactar Ventas
                </button>
              </Link>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-6 text-sm text-gray-500 animate-fade-up animation-delay-600">
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>No requiere tarjeta de crédito</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Prueba gratuita de 14 días</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Cancela cuando quieras</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de estadísticas (opcional) */}
      <section className="py-16 bg-gradient-to-r from-cyan-900 to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-white">10K+</div>
              <div className="text-cyan-200">Acuarios Monitoreados</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-white">99.9%</div>
              <div className="text-cyan-200">Tiempo de Actividad</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-white">24/7</div>
              <div className="text-cyan-200">Soporte Técnico</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-white">5★</div>
              <div className="text-cyan-200">Calificación Promedio</div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Home;
