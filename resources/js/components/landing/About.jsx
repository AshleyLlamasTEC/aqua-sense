import React, { useEffect, useRef, useState } from 'react';
import {
  Leaf01Icon,
  AiInnovation01Icon,
  Target01Icon,
//   DropletOffIcon
} from 'hugeicons-react';

const About = () => {
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

  return (
    <section ref={sectionRef} className="py-24 bg-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#50C878] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#004F59] rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="inline-flex items-center px-4 py-2 bg-[#50C878]/10 rounded-full mb-6">
              {/* <DropletOffIcon className="w-4 h-4 text-[#50C878] mr-2" /> */}
              <span className="text-sm font-medium text-[#004F59]">
                Sobre AquaSense
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-[#004F59] mb-6">
              Innovación y pasión por el{' '}
              <span className="text-[#50C878]">acuarismo</span>
            </h2>

            <p className="text-lg text-[#004F59]/70 mb-8 leading-relaxed">
              AquaSense nace de la fusión entre tecnología IoT y la pasión por los ecosistemas acuáticos.
              Desarrollamos soluciones inteligentes que permiten a los acuaristas monitorear y mantener
              sus acuarios con precisión profesional.
            </p>

            <div className="space-y-6">
              {[
                {
                  icon: Target01Icon,
                  title: 'Nuestra Misión',
                  description: 'Democratizar el acceso a tecnología de monitoreo profesional para todos los amantes de los acuarios.'
                },
                {
                  icon: AiInnovation01Icon,
                  title: 'Tecnología Avanzada',
                  description: 'Utilizamos sensores ESP32 de última generación y algoritmos inteligentes para garantizar precisión y confiabilidad.'
                },
                {
                  icon: Leaf01Icon,
                  title: 'Compromiso Ambiental',
                  description: 'Promovemos prácticas sostenibles que respetan y protegen la vida acuática.'
                }
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-gradient-to-br from-[#50C878]/10 to-[#004F59]/10 rounded-xl">
                      <item.icon className="w-6 h-6 text-[#50C878]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#004F59] mb-1">{item.title}</h3>
                    <p className="text-[#004F59]/60">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Element */}
          <div className={`transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-[#50C878]/20 to-[#004F59]/20 rounded-3xl backdrop-blur-sm border border-white/50 p-8">
                <div className="w-full h-full bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    {/* <DropletOffIcon className="w-24 h-24 text-[#50C878] mx-auto mb-4" /> */}
                    <p className="text-2xl font-bold text-[#004F59]">+1000</p>
                    <p className="text-[#004F59]/70">Acuarios Conectados</p>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#50C878]/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#004F59]/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
