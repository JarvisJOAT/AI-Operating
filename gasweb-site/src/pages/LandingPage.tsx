/**
 * Landing Page Component
 * 
 * Linktr.ee-style hub page with links, videos, and social media.
 * Standalone page without main navigation.
 * 
 * @module pages/LandingPage
 */

import { useState } from 'react';
import {
  Zap,
  ExternalLink,
  Play,
  Globe,
  Mail,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Facebook,
  Github,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

/**
 * Link item type
 */
interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  type: 'website' | 'social' | 'custom';
  description?: string;
  featured?: boolean;
}

/**
 * Video item type
 */
interface VideoItem {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
}

/**
 * Sample links data
 */
const links: LinkItem[] = [
  {
    id: '1',
    title: 'GasWeb Website',
    url: '/',
    icon: Globe,
    type: 'website',
    description: 'Our main website - AI Automation for Small Business',
    featured: true,
  },
  {
    id: '2',
    title: 'Free AI Courses',
    url: '/education',
    icon: Play,
    type: 'website',
    description: 'Learn AI automation at your own pace',
  },
  {
    id: '3',
    title: 'Schedule Consultation',
    url: '/contact',
    icon: MessageCircle,
    type: 'website',
    description: 'Book a free consultation call',
    featured: true,
  },
  {
    id: '4',
    title: 'Our Services',
    url: '/services',
    icon: Zap,
    type: 'website',
    description: 'View our AI automation services',
  },
  {
    id: '5',
    title: 'Contact Us',
    url: 'mailto:contact@gasweb.info',
    icon: Mail,
    type: 'custom',
  },
];

/**
 * Social media links
 */
const socialLinks: LinkItem[] = [
  { id: 's1', title: 'Instagram', url: '#', icon: Instagram, type: 'social' },
  { id: 's2', title: 'Twitter', url: '#', icon: Twitter, type: 'social' },
  { id: 's3', title: 'LinkedIn', url: '#', icon: Linkedin, type: 'social' },
  { id: 's4', title: 'YouTube', url: '#', icon: Youtube, type: 'social' },
  { id: 's5', title: 'Facebook', url: '#', icon: Facebook, type: 'social' },
  { id: 's6', title: 'GitHub', url: '#', icon: Github, type: 'social' },
];

/**
 * Sample videos data
 */
const videos: VideoItem[] = [
  {
    id: 'v1',
    title: 'Introduction to GasWeb',
    url: 'https://www.youtube.com/watch?v=example1',
  },
  {
    id: 'v2',
    title: 'AI Automation Demo',
    url: 'https://www.youtube.com/watch?v=example2',
  },
];

/**
 * Landing Page Component
 * 
 * @returns {JSX.Element} The landing page hub
 */
export default function LandingPage(): JSX.Element {
  const [showVideos, setShowVideos] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%233b82f6%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />

      <div className="relative max-w-lg mx-auto px-4 py-12 md:py-20">
        {/* Profile Section */}
        <div className="text-center mb-10">
          {/* Logo */}
          <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-primary-500/30 ring-4 ring-white/10">
            <Zap className="w-12 h-12 text-white" />
          </div>
          
          {/* Name & Bio */}
          <h1 className="text-3xl font-heading font-bold text-white mb-2">
            GasWeb
          </h1>
          <p className="text-primary-200 mb-4">
            AI Automation for Small Business
          </p>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            Empowering small businesses with AI automation solutions. 
            Learn, implement, and transform your operations.
          </p>
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-3 mb-10">
          {socialLinks.map((social) => (
            <a
              key={social.id}
              href={social.url}
              className="w-10 h-10 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all duration-200"
              aria-label={social.title}
              target="_blank"
              rel="noopener noreferrer"
            >
              <social.icon className="w-5 h-5" />
            </a>
          ))}
        </div>

        {/* Main Links */}
        <div className="space-y-4 mb-10">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              className={`block w-full p-4 rounded-2xl transition-all duration-200 group ${
                link.featured
                  ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40'
                  : 'bg-white/10 backdrop-blur text-white hover:bg-white/20'
              }`}
              target={link.url.startsWith('http') ? '_blank' : undefined}
              rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  link.featured ? 'bg-white/20' : 'bg-white/10'
                }`}>
                  <link.icon className="w-5 h-5" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold">{link.title}</h3>
                  {link.description && (
                    <p className={`text-sm ${link.featured ? 'text-white/70' : 'text-slate-400'}`}>
                      {link.description}
                    </p>
                  )}
                </div>
                <ExternalLink className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          ))}
        </div>

        {/* Videos Section */}
        <div className="mb-10">
          <button
            onClick={() => setShowVideos(!showVideos)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl text-white hover:bg-white/10 transition-colors"
          >
            <span className="flex items-center gap-2 font-medium">
              <Play className="w-5 h-5 text-primary-400" />
              Videos & Demos
            </span>
            {showVideos ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
          
          {showVideos && (
            <div className="mt-4 space-y-4 animate-fade-in">
              {videos.map((video) => (
                <a
                  key={video.id}
                  href={video.url}
                  className="block bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-colors group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="aspect-video bg-gradient-to-br from-primary-900/50 to-secondary-900/50 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-white/30 transition-all duration-200">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="text-white font-medium">{video.title}</h4>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-slate-500 text-sm mb-4">
            © {new Date().getFullYear()} GasWeb. All rights reserved.
          </p>
          <div className="flex justify-center gap-4 text-xs text-slate-600">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <span>•</span>
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
            <span>•</span>
            <a href="/" className="hover:text-white transition-colors">Main Site</a>
          </div>
        </div>
      </div>
    </div>
  );
}

