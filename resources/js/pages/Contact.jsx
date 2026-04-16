import React, { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Link } from '@inertiajs/react';
import {
  Mail01Icon,
  SmartPhone01Icon,
  Location01Icon,
  Clock01Icon,
  MailSend01Icon,
  Facebook02Icon,
  TwitterIcon,
  InstagramIcon,
  Linkedin02Icon,
  CheckmarkCircle01Icon
} from 'hugeicons-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica de envío
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 5000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: Mail01Icon,
      title: "Email",
      details: "info@aquasense.com",
      action: "mailto:info@aquasense.com",
      color: "from-cyan-500 to-blue-500"
    },
    {
      icon: SmartPhone01Icon,
      title: "Teléfono",
      details: "+1 (234) 567-8900",
      action: "tel:+12345678900",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: Location01Icon,
      title: "Oficina Central",
      details: "Silicon Valley, CA, Estados Unidos",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Clock01Icon,
      title: "Horario de Atención",
      details: "Lun - Vie: 9:00 - 18:00 (PST)",
      color: "from-orange-500 to-red-500"
    }
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
              <Mail01Icon className="w-4 h-4 text-cyan-300" />
              <span className="text-cyan-200 text-sm font-semibold">Contáctanos</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
              ¿Tienes alguna <span className="text-cyan-300">pregunta?</span>
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Estamos aquí para ayudarte. Cuéntanos en qué podemos ayudarte y te
              responderemos lo antes posible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className={`w-14 h-14 bg-gradient-to-r ${info.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{info.title}</h3>
                  {info.action ? (
                    <a href={info.action} className="text-gray-600 hover:text-cyan-600 transition-colors">
                      {info.details}
                    </a>
                  ) : (
                    <p className="text-gray-600">{info.details}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form and Map */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Formulario */}
            <div className="animate-fade-up">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-xl border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Envíanos un Mensaje</h2>
                <p className="text-gray-600 mb-6">Completa el formulario y te contactaremos pronto</p>

                {isSubmitted && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl animate-fade-in">
                    <div className="flex items-center space-x-2 text-green-700">
                      <CheckmarkCircle01Icon className="w-5 h-5" />
                      <span>¡Mensaje enviado con éxito! Te responderemos pronto.</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Asunto *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                      placeholder="¿En qué podemos ayudarte?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mensaje *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="5"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all resize-none"
                      placeholder="Escribe tu mensaje aquí..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                  >
                    <MailSend01Icon className="w-5 h-5" />
                    <span>Enviar Mensaje</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Mapa y Redes Sociales */}
            <div className="space-y-8 animate-fade-up animation-delay-200">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-xl border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Ubicación</h3>
                <div className="aspect-video rounded-xl overflow-hidden shadow-lg mb-4">
                  <iframe
                    title="AquaSense Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d253682.16328769424!2d-122.06201465861931!3d37.40222506478587!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fb68ad0cfc739%3A0x7f9b3a5c8b5b9f9e!2sSilicon%20Valley%2C%20CA%2C%20USA!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    className="w-full h-full"
                  ></iframe>
                </div>
                <p className="text-gray-600 text-sm text-center">
                  Silicon Valley, California, Estados Unidos
                </p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-xl border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Síguenos en Redes Sociales</h3>
                <p className="text-gray-600 mb-4">
                  Mantente conectado con nosotros para novedades, tips y comunidad
                </p>
                <div className="flex justify-center space-x-4">
                  <a href="#" className="p-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl hover:scale-110 transition-all duration-300">
                    <Facebook02Icon className="w-6 h-6 text-white" />
                  </a>
                  <a href="#" className="p-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl hover:scale-110 transition-all duration-300">
                    <TwitterIcon className="w-6 h-6 text-white" />
                  </a>
                  <a href="#" className="p-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl hover:scale-110 transition-all duration-300">
                    <InstagramIcon className="w-6 h-6 text-white" />
                  </a>
                  <a href="#" className="p-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl hover:scale-110 transition-all duration-300">
                    <Linkedin02Icon className="w-6 h-6 text-white" />
                  </a>
                </div>
              </div>

              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail01Icon className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">¿Prefieres escribirnos?</p>
                    <p className="font-semibold text-gray-800">soporte@aquasense.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            Preguntas <span className="text-cyan-600">Frecuentes</span>
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            ¿Tienes dudas? Revisa nuestras preguntas frecuentes o contáctanos directamente
          </p>
          <Link href="/faq">
            <button className="border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-50 px-8 py-3 rounded-full font-semibold transition-all duration-300">
              Ver FAQ
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

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
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

        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
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

export default Contact;
