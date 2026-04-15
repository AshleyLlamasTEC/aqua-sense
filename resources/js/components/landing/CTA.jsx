import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/ButtonLanding';
import { RocketIcon, Shield01Icon, Clock01Icon } from 'hugeicons-react';

const CTA = () => {
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
    <section ref={sectionRef} className="py-24 bg-gradient-to-br from-[#004F59] to-[#006D7A] relative overflow-hidden">
      {/* Animated Wave Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 Q40 15 30 25 Q20 35 30 45 Q40 55 30 65' stroke='white' fill='none' stroke-width='2'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
          animation: 'wave 20s linear infinite'
        }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Comienza a monitorear tu acuario hoy mismo
          </h2>

          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Únete a miles de acuaristas que ya confían en AquaSense para mantener sus ecosistemas acuáticos saludables y equilibrados.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              variant="primary"
              size="lg"
              className="!bg-white !text-[#004F59] hover:!bg-white/90 shadow-xl shadow-black/20"
            >
              <RocketIcon className="w-5 h-5 inline-block mr-2" />
              Registrarse Gratis
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="!border-white !text-white hover:!bg-white/10"
            >
              Contactar Ventas
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Shield01Icon, text: 'Datos seguros y encriptados' },
              { icon: Clock01Icon, text: 'Configuración en 5 minutos' },
              { icon: RocketIcon, text: 'Soporte técnico 24/7' }
            ].map((indicator, index) => (
              <div
                key={index}
                className="flex items-center justify-center space-x-2 text-white/90"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <indicator.icon className="w-5 h-5" />
                <span className="text-sm">{indicator.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes wave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-60px); }
        }
      `}</style>
    </section>
  );
};

export default CTA;
