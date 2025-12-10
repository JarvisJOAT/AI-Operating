/**
 * Home Page Component
 * 
 * Lead generation focused landing page targeting small business owners.
 * Includes hero section, value propositions, services overview, 
 * education preview, testimonials placeholder, and CTAs.
 * 
 * @module pages/Home
 */

import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  Mail,
  Database,
  MessageSquare,
  Workflow,
  Sparkles,
  CheckCircle2,
  Clock,
  TrendingUp,
  Shield,
  Star,
  Play,
  Users,
  Zap,
} from 'lucide-react';

/**
 * Service card data for the services overview section
 */
const services = [
  {
    icon: Mail,
    title: 'Email Automation',
    description: 'Automate your email workflows, follow-ups, and campaigns to save hours every week.',
    link: '/services#email',
  },
  {
    icon: Database,
    title: 'Data Entry Automation',
    description: 'Eliminate manual data entry with smart automation that reduces errors by 95%.',
    link: '/services#data',
  },
  {
    icon: MessageSquare,
    title: 'AI Chatbots',
    description: 'Deploy intelligent chatbots that handle customer inquiries 24/7.',
    link: '/services#chatbots',
  },
  {
    icon: Bot,
    title: 'Customer Service Bots',
    description: 'Provide instant support with AI-powered customer service automation.',
    link: '/services#support',
  },
  {
    icon: Workflow,
    title: 'N8N Workflows',
    description: 'Connect your apps and automate complex workflows without code.',
    link: '/services#n8n',
  },
  {
    icon: Sparkles,
    title: 'Custom AI Solutions',
    description: 'Tailored AI implementations designed for your unique business needs.',
    link: '/services#custom',
  },
];

/**
 * Benefits data for value proposition section
 */
const benefits = [
  {
    icon: Clock,
    title: 'Save 20+ Hours Weekly',
    description: 'Automate repetitive tasks and focus on what matters most.',
  },
  {
    icon: TrendingUp,
    title: 'Boost Efficiency by 300%',
    description: 'Streamline operations with intelligent automation workflows.',
  },
  {
    icon: Shield,
    title: 'Reduce Errors by 95%',
    description: 'AI-powered accuracy eliminates costly manual mistakes.',
  },
];

/**
 * Testimonial placeholder data
 */
const testimonials = [
  {
    name: 'Your Success Story',
    company: 'Your Company',
    role: 'Business Owner',
    content: 'Share how AI automation transformed your business operations.',
    rating: 5,
    placeholder: true,
  },
  {
    name: 'Coming Soon',
    company: 'Featured Client',
    role: 'CEO',
    content: 'We\'re collecting success stories from our clients.',
    rating: 5,
    placeholder: true,
  },
  {
    name: 'Be Featured',
    company: 'Your Business',
    role: 'Founder',
    content: 'Contact us to share your automation success story.',
    rating: 5,
    placeholder: true,
  },
];

/**
 * Home Page Component
 * 
 * @returns {JSX.Element} The home page
 */
export default function Home(): JSX.Element {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-hero-pattern opacity-50" />
        
        <div className="relative section-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center py-16 md:py-24 lg:py-32">
            {/* Hero Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium mb-6 animate-fade-in">
                <Sparkles className="w-4 h-4" />
                <span>AI Automation for Small Business</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-slate-900 mb-6 animate-slide-up text-balance">
                Transform Your Business with{' '}
                <span className="gradient-text">AI Automation</span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 mb-8 animate-slide-up animation-delay-100 text-balance">
                Stop wasting time on repetitive tasks. Learn AI workflows, implement 
                powerful automation, and watch your small business thrive with 
                cutting-edge technology.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up animation-delay-200">
                <Link to="/contact" className="btn-accent">
                  Schedule Free Consultation
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link to="/services" className="btn-secondary">
                  Explore Services
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-12 flex flex-col sm:flex-row gap-6 items-center justify-center lg:justify-start text-slate-600 animate-slide-up animation-delay-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Free Initial Consultation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-sm">No Technical Knowledge Required</span>
                </div>
              </div>
            </div>
            
            {/* Hero Visual */}
            <div className="relative animate-slide-in-right">
              <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-6 md:p-8">
                {/* Placeholder for hero illustration/image */}
                <div className="aspect-video bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float">
                      <Zap className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-slate-600 font-medium">AI-Powered Automation</p>
                    <p className="text-slate-400 text-sm mt-1">Your business, supercharged</p>
                  </div>
                </div>
                
                {/* Floating cards */}
                <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 animate-float">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Efficiency</p>
                      <p className="text-sm font-semibold text-green-600">+300%</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3 animate-float animation-delay-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Time Saved</p>
                      <p className="text-sm font-semibold text-primary-600">20+ hrs/week</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Background decoration */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-primary-200/30 to-secondary-200/30 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-4">
              Why AI Automation for Small Business?
            </h2>
            <p className="text-lg text-slate-600">
              Join thousands of small business owners who've transformed their operations 
              with intelligent automation solutions.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={benefit.title}
                className="card p-8 text-center group hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-slate-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview Section */}
      <section className="section-padding bg-slate-50">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-4">
              Our AI Automation Services
            </h2>
            <p className="text-lg text-slate-600">
              Comprehensive automation solutions tailored for small businesses. 
              No technical expertise required.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Link 
                key={service.title}
                to={service.link}
                className="card p-6 group hover:-translate-y-1"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-slate-600 text-sm mb-4">
                  {service.description}
                </p>
                <span className="inline-flex items-center text-primary-600 text-sm font-medium group-hover:gap-2 transition-all">
                  Learn more
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/services" className="btn-primary">
              View All Services
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Education Preview Section */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-50 text-secondary-700 rounded-full text-sm font-medium mb-6">
                <Play className="w-4 h-4" />
                <span>Learn AI Automation</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-4">
                Free Educational Resources
              </h2>
              
              <p className="text-lg text-slate-600 mb-6">
                Empower yourself with our comprehensive courses, tutorials, and guides. 
                Learn AI automation at your own pace - from basics to advanced implementations.
              </p>
              
              <ul className="space-y-4 mb-8">
                {[
                  'Free beginner-friendly tutorials',
                  'Step-by-step video courses',
                  'Downloadable guides and templates',
                  'Community support and Q&A',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-slate-600">{item}</span>
                  </li>
                ))}
              </ul>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/education" className="btn-primary">
                  Browse Free Courses
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link to="/education#premium" className="btn-secondary">
                  View Premium Content
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-secondary-100 to-primary-100 rounded-3xl p-8 aspect-square flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6">
                    <Play className="w-12 h-12 text-primary-600 ml-1" />
                  </div>
                  <p className="text-xl font-semibold text-slate-900 mb-2">Video Tutorials</p>
                  <p className="text-slate-600">Learn by watching</p>
                </div>
              </div>
              
              {/* Course preview cards */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 max-w-[200px]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Email Automation</p>
                    <p className="text-xs text-slate-500">Free Course</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 max-w-[200px]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5 text-secondary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Build Chatbots</p>
                    <p className="text-xs text-slate-500">Premium</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials / Case Studies Placeholder */}
      <section className="section-padding bg-slate-900 text-white">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-slate-300">
              See how businesses like yours have transformed with AI automation. 
              Your success story could be featured here!
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className={`bg-slate-800 rounded-2xl p-6 border ${
                  testimonial.placeholder 
                    ? 'border-dashed border-slate-600' 
                    : 'border-slate-700'
                }`}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${
                        testimonial.placeholder 
                          ? 'text-slate-600' 
                          : 'text-yellow-400 fill-yellow-400'
                      }`} 
                    />
                  ))}
                </div>
                
                <p className={`mb-6 ${testimonial.placeholder ? 'text-slate-500 italic' : 'text-slate-300'}`}>
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    testimonial.placeholder 
                      ? 'bg-slate-700' 
                      : 'bg-gradient-to-br from-primary-500 to-secondary-500'
                  }`}>
                    <Users className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <p className={`font-medium ${testimonial.placeholder ? 'text-slate-500' : 'text-white'}`}>
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-slate-400">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/case-studies" className="btn-secondary bg-transparent border-white text-white hover:bg-white hover:text-slate-900">
              View All Case Studies
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="section-padding bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="section-container text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-6">
            Ready to Automate Your Business?
          </h2>
          <p className="text-lg md:text-xl text-primary-100 max-w-2xl mx-auto mb-8">
            Schedule a free consultation and discover how AI automation can 
            transform your small business operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/contact" 
              className="btn-primary bg-white text-primary-700 hover:bg-slate-100"
            >
              Schedule Free Consultation
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link 
              to="/services" 
              className="btn-secondary bg-transparent border-white text-white hover:bg-white/10"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

