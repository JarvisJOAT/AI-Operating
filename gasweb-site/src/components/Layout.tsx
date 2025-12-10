/**
 * Layout Component
 * 
 * Main layout wrapper that includes the navigation header and footer.
 * All main pages are rendered through this layout via React Router's Outlet.
 * 
 * @module components/Layout
 */

import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Zap, 
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  ChevronUp
} from 'lucide-react';

/**
 * Navigation link data
 */
const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Services', path: '/services' },
  { name: 'Education', path: '/education' },
  { name: 'Case Studies', path: '/case-studies' },
  { name: 'Contact', path: '/contact' },
];

/**
 * Social media links
 */
const socialLinks = [
  { name: 'LinkedIn', icon: Linkedin, href: '#' },
  { name: 'Twitter', icon: Twitter, href: '#' },
  { name: 'Instagram', icon: Instagram, href: '#' },
  { name: 'YouTube', icon: Youtube, href: '#' },
];

/**
 * Layout Component
 * 
 * Provides consistent navigation and footer across all pages.
 * 
 * @returns {JSX.Element} Layout wrapper with header, main content, and footer
 */
export default function Layout(): JSX.Element {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const location = useLocation();

  // Handle scroll events for header styling and back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header / Navigation */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-soft' 
            : 'bg-transparent'
        }`}
      >
        <nav className="section-container">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-2 text-2xl font-bold"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className={`font-heading ${isScrolled ? 'text-slate-900' : 'text-slate-900'}`}>
                GasWeb
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-medium transition-colors duration-200 ${
                    location.pathname === link.path
                      ? 'text-primary-600'
                      : 'text-slate-600 hover:text-primary-600'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link to="/contact" className="btn-primary">
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-slate-600 hover:text-primary-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 shadow-lg animate-fade-in">
            <div className="section-container py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block py-3 font-medium transition-colors duration-200 ${
                    location.pathname === link.path
                      ? 'text-primary-600'
                      : 'text-slate-600 hover:text-primary-600'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link to="/contact" className="btn-primary w-full mt-4 text-center">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-16 md:pt-20">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="section-container section-padding">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <Link to="/" className="flex items-center gap-2 text-2xl font-bold mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="font-heading">GasWeb</span>
              </Link>
              <p className="text-slate-400 mb-6">
                Empowering small businesses with AI automation solutions. 
                Learn, implement, and transform your operations.
              </p>
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors duration-200"
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-3">
                {navLinks.map((link) => (
                  <li key={link.path}>
                    <Link 
                      to={link.path}
                      className="text-slate-400 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Services</h4>
              <ul className="space-y-3 text-slate-400">
                <li><Link to="/services" className="hover:text-white transition-colors">Email Automation</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Chatbot Development</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Data Entry Automation</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">N8N Workflows</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Custom AI Solutions</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-slate-400">
                  <Mail className="w-5 h-5 text-primary-400" />
                  <a href="mailto:contact@gasweb.info" className="hover:text-white transition-colors">
                    contact@gasweb.info
                  </a>
                </li>
                <li className="flex items-center gap-3 text-slate-400">
                  <Phone className="w-5 h-5 text-primary-400" />
                  <a href="tel:+1234567890" className="hover:text-white transition-colors">
                    (123) 456-7890
                  </a>
                </li>
                <li className="flex items-start gap-3 text-slate-400">
                  <MapPin className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                  <span>
                    United States<br />
                    Available Worldwide
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} GasWeb. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-slate-400">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-12 h-12 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all duration-200 flex items-center justify-center animate-fade-in z-40"
          aria-label="Back to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}

