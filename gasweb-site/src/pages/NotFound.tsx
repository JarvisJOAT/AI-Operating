/**
 * Not Found (404) Page Component
 * 
 * Displayed when a user navigates to a non-existent route.
 * 
 * @module pages/NotFound
 */

import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft, Zap } from 'lucide-react';

/**
 * Not Found Page Component
 * 
 * @returns {JSX.Element} The 404 page
 */
export default function NotFound(): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="font-heading text-slate-900">GasWeb</span>
          </Link>
        </div>

        {/* 404 Illustration */}
        <div className="relative mb-8">
          <div className="text-[10rem] font-bold text-slate-100 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-primary-600" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-slate-900 mb-4">
          Page Not Found
        </h1>
        
        <p className="text-slate-600 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn-primary">
            <Home className="w-5 h-5 mr-2" />
            Go to Home
          </Link>
          <button 
            onClick={() => window.history.back()} 
            className="btn-secondary"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-slate-100">
          <p className="text-sm text-slate-500 mb-4">Looking for something specific?</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/services" className="text-primary-600 hover:text-primary-700 hover:underline">
              Our Services
            </Link>
            <Link to="/education" className="text-primary-600 hover:text-primary-700 hover:underline">
              Free Courses
            </Link>
            <Link to="/contact" className="text-primary-600 hover:text-primary-700 hover:underline">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

