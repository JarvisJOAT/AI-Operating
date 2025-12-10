/**
 * Main Application Component
 * 
 * This is the root component that sets up routing and global providers.
 * All pages are rendered through React Router.
 * 
 * @module App
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layout components
import Layout from './components/Layout';

// Page components
import Home from './pages/Home';
import Services from './pages/Services';
import Education from './pages/Education';
import CaseStudies from './pages/CaseStudies';
import LandingPage from './pages/LandingPage';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

/**
 * App Component
 * 
 * Sets up the application routing structure.
 * All routes are wrapped in the Layout component for consistent navigation.
 * 
 * @returns {JSX.Element} The root application component
 * 
 * @example
 * // The app is mounted in main.tsx:
 * createRoot(rootElement).render(<App />);
 */
function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main layout wrapper */}
        <Route path="/" element={<Layout />}>
          {/* Home page - Lead generation focused */}
          <Route index element={<Home />} />
          
          {/* Services page - AI automation offerings */}
          <Route path="services" element={<Services />} />
          
          {/* Education page - Courses and tutorials */}
          <Route path="education" element={<Education />} />
          
          {/* Case Studies page - Success stories */}
          <Route path="case-studies" element={<CaseStudies />} />
          
          {/* Contact page - Consultation booking */}
          <Route path="contact" element={<Contact />} />
        </Route>
        
        {/* Landing page - Linktr.ee style (standalone, no nav) */}
        <Route path="/links" element={<LandingPage />} />
        <Route path="/hub" element={<LandingPage />} />
        
        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

