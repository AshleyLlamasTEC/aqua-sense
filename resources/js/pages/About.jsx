import React from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Link } from '@inertiajs/react';
import {
  FishFoodIcon,
  WaveIcon,
  CpuIcon,
  Shield01Icon,
  UserGroupIcon,
  RocketIcon,
  Award02Icon,
  UserIcon,
  EarthIcon,
  Target01Icon,
  EyeIcon,
  Mail01Icon,
  TwitterIcon,
  GithubIcon
} from 'hugeicons-react';

const About = () => {
  const values = [
    {
      icon: Target01Icon,
      title: "Innovación Continua",
      description: "Siempre estamos explorando nuevas tecnologías para mejorar la experiencia de monitoreo de acuarios."
    },
    {
      icon: Shield01Icon,
      title: "Calidad Garantizada",
      description: "Nuestros sensores y software pasan por rigurosas pruebas para asegurar precisión y confiabilidad."
    },
    {
      icon: UserIcon,
      title: "Enfoque en el Usuario",
      description: "Diseñamos pensando en los acuaristas, simplificando la tecnología compleja en experiencias intuitivas."
    },
    {
      icon: EarthIcon,
      title: "Sostenibilidad",
      description: "Promovemos prácticas responsables para el cuidado de ecosistemas acuáticos en todo el mundo."
    }
  ];

  const team = [
    {
      name: "Ashley",
      role: "Dev",
      bio: "Ingeniera en sistemas con pasión por la vida acuática",
      icon: UserGroupIcon
    },
    {
      name: "Rodolfo",
      role: "Administrador",
      bio: "Ingeniero en sistemas con experiencia en gestión de proyectos tecnológicos",
      icon: UserGroupIcon
    },
    {
      name: "Salvador",
      role: "CEO",
      bio: "Emprendedor con visión para transformar el cuidado de acuarios a través de la tecnología",
      icon: UserGroupIcon
    },
  ];

  const milestones = [
    { year: "2021", title: "Fundación", description: "AquaSense nace con la visión de revolucionar el monitoreo de acuarios" },
    { year: "2022", title: "Primer Prototipo", description: "Lanzamos nuestro primer prototipo funcional con ESP32" },
    { year: "2023", title: "Beta Público", description: "Más de 500 acuaristas se unen a nuestro programa beta" },
    { year: "2024", title: "Lanzamiento Oficial", description: "AquaSense llega al mercado con gran éxito" }
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-900 via-cyan-800 to-blue-900 pt-32 pb-20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514709870904-0c3f3b9d658a?ixlib=rb-4.0.3')] bg-cover bg-center mix-blend-overlay opacity-20"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <WaveIcon className="w-4 h-4 text-cyan-300" />
              <span className="text-cyan-200 text-sm font-semibold">Nuestra Historia</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
              Transformando el Cuidado
              <br />
              de <span className="text-cyan-300">Acuarios</span>
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              En AquaSense, combinamos tecnología de vanguardia con pasión por la vida acuática
              para crear soluciones inteligentes que facilitan el monitoreo y cuidado de tus acuarios.
            </p>
          </div>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 shadow-lg animate-fade-up">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl mb-6">
                <EyeIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Nuestra Misión</h3>
              <p className="text-gray-600 leading-relaxed">
                Democratizar el monitoreo de acuarios de nivel profesional, haciendo accesible
                la tecnología IoT para todos los entusiastas de la vida acuática, desde
                aficionados hasta expertos.
              </p>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 shadow-lg animate-fade-up animation-delay-200">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl mb-6">
                <RocketIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Nuestra Visión</h3>
              <p className="text-gray-600 leading-relaxed">
                Ser líderes mundiales en soluciones inteligentes para acuarios, creando un
                ecosistema conectado que permita a las personas mantener entornos acuáticos
                saludables de manera sencilla y efectiva.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              Nuestros <span className="text-cyan-600">Valores</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Los principios que guían nuestro trabajo y nuestra relación con la comunidad
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-cyan-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      {/* <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              Nuestra <span className="text-cyan-600">Trayectoria</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hitos que han marcado nuestro camino hacia la innovación
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-cyan-400 to-blue-600 h-full"></div>
            {milestones.map((milestone, index) => (
              <div key={index} className={`relative flex items-center mb-12 ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <span className="text-cyan-600 font-bold text-2xl">{milestone.year}</span>
                    <h3 className="text-xl font-semibold text-gray-800 mt-2">{milestone.title}</h3>
                    <p className="text-gray-600 mt-2">{milestone.description}</p>
                  </div>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-cyan-600 rounded-full border-4 border-white shadow"></div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Equipo */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              Conoce al <span className="text-cyan-600">Equipo</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Personas apasionadas por la tecnología y la vida acuática
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => {
              const Icon = member.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="w-24 h-24 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-12 h-12 text-cyan-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">{member.name}</h3>
                  <p className="text-cyan-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-cyan-900 to-blue-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 animate-fade-up">
            ¿Listo para unirte a la revolución?
          </h2>
          <p className="text-xl text-white/90 mb-8 animate-fade-up animation-delay-200">
          Únete a miles de acuaristas que ya confían en AquaSense
          </p>
          <Link href="/contact" className="animate-fade-up animation-delay-400 inline-block">
            <button className="bg-white text-cyan-600 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl">
              Contáctanos
            </button>
          </Link>
        </div>
      </section>

      <style jsx>{`
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-up {
          animation: fade-up 0.6s ease-out forwards;
          opacity: 0;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
        }
      `}</style>
    </MainLayout>
  );
};

export default About;
