import React from 'react';
import {
  Mail01Icon,
  SmartPhone01Icon,
  Location01Icon,
  TwitterIcon,
  GithubIcon,
  Linkedin01Icon,
//   DropletOffIcon
} from 'hugeicons-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0A2E35] text-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              {/* <DropletOffIcon className="w-8 h-8 text-[#50C878]" /> */}
              <span className="text-2xl font-bold text-white">AquaSense</span>
            </div>
            <p className="text-sm text-white/60">
              Tecnología IoT para el monitoreo inteligente de acuarios.
              Cuidando tus ecosistemas acuáticos con precisión y pasión.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              {['Inicio', 'Características', 'Nosotros', 'Contacto'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm hover:text-[#50C878] transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-sm">
                <Mail01Icon className="w-4 h-4 text-[#50C878]" />
                <span>info@aquasense.com</span>
              </li>
              <li className="flex items-center space-x-2 text-sm">
                <SmartPhone01Icon className="w-4 h-4 text-[#50C878]" />
                <span>+34 900 123 456</span>
              </li>
              <li className="flex items-center space-x-2 text-sm">
                <Location01Icon className="w-4 h-4 text-[#50C878]" />
                <span>Madrid, España</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold text-white mb-4">Síguenos</h3>
            <div className="flex space-x-4">
              {[
                { icon: TwitterIcon, href: '#' },
                { icon: GithubIcon, href: '#' },
                { icon: Linkedin01Icon, href: '#' }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="p-2 bg-white/10 rounded-lg hover:bg-[#50C878]/20 hover:text-[#50C878] transition-all duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/10 text-center text-sm text-white/50">
          <p>© {currentYear} AquaSense. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
