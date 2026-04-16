import React from 'react';
import { Link } from '@inertiajs/react';
import { FishFoodIcon, WaveIcon, TemperatureIcon } from 'hugeicons-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source src="/videos/aquarium2.mp4" type="video/mp4" />
          Tu navegador no soporta videos HTML5.
        </video>

        {/* Overlay para mejorar la legibilidad del texto */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        {/* Efectos decorativos adicionales */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse animation-delay-1000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <div className="animate-fade-up">
          <div className="flex justify-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center">
              <FishFoodIcon className="w-6 h-6 text-white" />
            </div>
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center">
              <WaveIcon className="w-6 h-6 text-white" />
            </div>
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center">
              <TemperatureIcon className="w-6 h-6 text-white" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white">
            Monitorea tu acuario
            <br />
            en tiempo real
          </h1>

          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-10">
            AquaSense transforma tu acuario en un ecosistema inteligente. Monitorea temperatura,
            pH, TDS y más con nuestra plataforma IoT. Perfecto para entusiastas de acuarios
            que buscan precisión y tranquilidad.
          </p>

          <Link href="/register">
            <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl">
              Comenzar Ahora
            </button>
          </Link>

          <div className="mt-12 flex justify-center space-x-8 text-sm text-white/80">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Monitoreo en tiempo real</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span>Alertas inteligentes</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span>Datos históricos</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
