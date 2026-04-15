import React, { useEffect, useRef, useState } from 'react';
import { Card } from '../ui/CardLanding';
import {
  Activity01Icon,
  AlertCircleIcon,
  ChartLineData01Icon,
  ChipIcon,
  TemperatureIcon,
  SmartWatch01Icon,
  TestTubeIcon
} from 'hugeicons-react';

const Features = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const features = [
    {
      icon: Activity01Icon,
      title: 'Monitoreo en Tiempo Real',
      description: 'Visualiza temperatura, pH, TDS y niveles de oxígeno actualizados cada segundo.',
      color: 'from-[#50C878] to-[#3DAF6B]'
    },
    {
      icon: AlertCircleIcon,
      title: 'Alertas Inteligentes',
      description: 'Recibe notificaciones instantáneas cuando los parámetros salgan de los rangos óptimos.',
      color: 'from-[#FF6B6B] to-[#EE5A24]'
    },
    {
      icon: ChartLineData01Icon,
      title: 'Datos Históricos',
      description: 'Analiza tendencias con gráficos detallados y exporta reportes en cualquier momento.',
      color: 'from-[#4A90E2] to-[#357ABD]'
    },
    {
      icon: ChipIcon,
      title: 'Integración ESP32',
      description: 'Compatible con sensores ESP32. Configuración plug-and-play en minutos.',
      color: 'from-[#004F59] to-[#006D7A]'
    }
  ];

  return (
    <section ref={sectionRef} className="py-24 bg-gradient-to-b from-white to-[#E8F4F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl md:text-5xl font-bold text-[#004F59] mb-4">
            Características Principales
          </h2>
          <p className="text-xl text-[#004F59]/70 max-w-2xl mx-auto">
            Todo lo que necesitas para mantener tu ecosistema acuático en perfectas condiciones
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`transition-all duration-700 ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Card className="h-full group">
                <div className="relative">
                  {/* Icon Container */}
                  <div className={`
                    w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color}
                    flex items-center justify-center mb-4
                    group-hover:scale-110 transition-transform duration-300
                    shadow-lg
                  `}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Glow Effect */}
                  <div className="absolute -top-2 -left-2 w-20 h-20 bg-[#50C878]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <h3 className="text-xl font-semibold text-[#004F59] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[#004F59]/70">
                  {feature.description}
                </p>
              </Card>
            </div>
          ))}
        </div>

        {/* Additional Parameters */}
        <div className={`mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-700 delay-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          {[
            { icon: TemperatureIcon, label: 'Temperatura', range: '20-30°C' },
            { icon: TestTubeIcon, label: 'pH', range: '6.5-8.5' },
            { icon: SmartWatch01Icon, label: 'TDS', range: '100-500 ppm' },
            { icon: Activity01Icon, label: 'Oxígeno', range: '5-8 mg/L' }
          ].map((param, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-[#50C878]/10"
            >
              <param.icon className="w-5 h-5 text-[#50C878]" />
              <div>
                <p className="text-sm font-medium text-[#004F59]">{param.label}</p>
                <p className="text-xs text-[#004F59]/60">{param.range}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
