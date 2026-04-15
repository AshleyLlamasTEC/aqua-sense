import React, { useEffect, useState } from 'react';
import { Button } from '../ui/ButtonLanding';
import {
  CpuIcon,
  WaterEnergyIcon,
  Wifi01Icon,
  Chart01Icon
} from 'hugeicons-react';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px) translateX(0px); }
        25% { transform: translateY(-20px) translateX(10px); }
        50% { transform: translateY(-10px) translateX(-10px); }
        75% { transform: translateY(-30px) translateX(5px); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#E8F4F6] via-white to-[#D4EDF0]">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#50C878]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#004F59]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1000ms' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#50C878]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '500ms' }}></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#50C878]/30 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-[#50C878]/20 mb-8">
              <CpuIcon className="w-4 h-4 text-[#50C878] mr-2" />
              <span className="text-sm font-medium text-[#004F59]">
                Tecnología IoT para Acuarios
              </span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#004F59] to-[#006D7A] bg-clip-text text-transparent">
                Monitorea tu acuario
              </span>
              <br />
              <span className="text-[#50C878]">en tiempo real</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-[#004F59]/70 mb-10 max-w-2xl mx-auto">
              Sistema inteligente de monitoreo con sensores ESP32.
              Temperatura, pH, TDS y más, siempre bajo control desde cualquier lugar.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="shadow-lg shadow-[#004F59]/20">
                Comenzar Ahora
              </Button>
              <Button variant="outline" size="lg">
                Ver Demo
              </Button>
            </div>

            {/* Stats/Features Mini */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16">
              {[
                { icon: WaterEnergyIcon, label: 'Monitoreo 24/7', value: 'Tiempo Real' },
                { icon: Wifi01Icon, label: 'Conectividad', value: 'ESP32 IoT' },
                { icon: Chart01Icon, label: 'Históricos', value: '30+ días' }
              ].map((stat, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center space-x-3 p-4 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/50"
                >
                  <div className="p-2 bg-gradient-to-br from-[#50C878]/20 to-[#004F59]/20 rounded-xl">
                    <stat.icon className="w-6 h-6 text-[#004F59]" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-[#004F59]/60">{stat.label}</p>
                    <p className="font-semibold text-[#004F59]">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
