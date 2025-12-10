/**
 * Case Studies Page Component
 * 
 * Placeholder page for success stories and testimonials.
 * Template structure ready for future content.
 * 
 * @module pages/CaseStudies
 */

import { Link } from 'react-router-dom';
import {
  ArrowRight,
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  Star,
  Building2,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';

/**
 * Case study placeholder data
 */
const caseStudyPlaceholders = [
  {
    id: '1',
    company: 'Your Company',
    industry: 'Your Industry',
    logo: null,
    challenge: 'Share the challenges your business faced before implementing AI automation.',
    solution: 'Describe the custom solution we created for your unique needs.',
    results: [
      { metric: 'Time Saved', value: 'XX%', icon: Clock },
      { metric: 'Cost Reduced', value: '$XXk', icon: DollarSign },
      { metric: 'Efficiency', value: '+XX%', icon: TrendingUp },
    ],
    testimonial: '"Your testimonial about how GasWeb transformed your business operations."',
    author: 'Your Name',
    role: 'CEO / Founder',
    placeholder: true,
  },
  {
    id: '2',
    company: 'Coming Soon',
    industry: 'E-commerce',
    logo: null,
    challenge: 'Managing thousands of customer inquiries and order updates manually.',
    solution: 'AI chatbot + email automation pipeline to handle customer communications.',
    results: [
      { metric: 'Response Time', value: '-95%', icon: Clock },
      { metric: 'Support Costs', value: '-60%', icon: DollarSign },
      { metric: 'Satisfaction', value: '+40%', icon: TrendingUp },
    ],
    testimonial: '"We\'re collecting success stories from our clients to share here."',
    author: 'Client Name',
    role: 'Operations Director',
    placeholder: true,
  },
  {
    id: '3',
    company: 'Be Featured',
    industry: 'Professional Services',
    logo: null,
    challenge: 'Drowning in repetitive data entry and manual processes.',
    solution: 'Custom N8N workflows connecting multiple business systems.',
    results: [
      { metric: 'Manual Work', value: '-80%', icon: Clock },
      { metric: 'Errors', value: '-95%', icon: TrendingUp },
      { metric: 'Productivity', value: '+200%', icon: Users },
    ],
    testimonial: '"Contact us to share your automation success story and get featured!"',
    author: 'Your Name',
    role: 'Business Owner',
    placeholder: true,
  },
];

/**
 * Metrics showcase data
 */
const globalMetrics = [
  { label: 'Average Time Saved', value: '20+', unit: 'hrs/week', icon: Clock },
  { label: 'Cost Reduction', value: '40', unit: '%', icon: DollarSign },
  { label: 'Efficiency Increase', value: '300', unit: '%', icon: TrendingUp },
  { label: 'Client Satisfaction', value: '98', unit: '%', icon: Star },
];

/**
 * Case Studies Page Component
 * 
 * @returns {JSX.Element} The case studies page
 */
export default function CaseStudies(): JSX.Element {
  return (
    <>
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-b from-slate-50 to-white">
        <div className="section-container">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-50 text-accent-700 rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4" />
              <span>Success Stories</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-slate-900 mb-6">
              Real Results from{' '}
              <span className="gradient-text">Real Businesses</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-8">
              Discover how small businesses like yours have transformed their operations 
              with AI automation. Your success story could be featured here!
            </p>
          </div>
        </div>
      </section>

      {/* Global Metrics */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {globalMetrics.map((metric) => (
              <div key={metric.label} className="text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <metric.icon className="w-7 h-7 text-primary-600" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
                  {metric.value}<span className="text-primary-600">{metric.unit}</span>
                </div>
                <p className="text-sm text-slate-600">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="section-padding bg-slate-50">
        <div className="section-container">
          <div className="space-y-12">
            {caseStudyPlaceholders.map((study, index) => (
              <div 
                key={study.id}
                className={`card overflow-visible ${study.placeholder ? 'border-dashed border-2 border-slate-300' : ''}`}
              >
                <div className="grid lg:grid-cols-2 gap-0">
                  {/* Left: Company Info & Challenge */}
                  <div className={`p-8 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                    <div className="flex items-start gap-4 mb-6">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                        study.placeholder ? 'bg-slate-100' : 'bg-gradient-to-br from-primary-500 to-secondary-500'
                      }`}>
                        <Building2 className={`w-8 h-8 ${study.placeholder ? 'text-slate-400' : 'text-white'}`} />
                      </div>
                      <div>
                        <h3 className={`text-xl font-semibold ${study.placeholder ? 'text-slate-500' : 'text-slate-900'}`}>
                          {study.company}
                        </h3>
                        <p className="text-slate-500">{study.industry}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2">The Challenge</h4>
                        <p className={`${study.placeholder ? 'text-slate-400 italic' : 'text-slate-600'}`}>
                          {study.challenge}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2">Our Solution</h4>
                        <p className={`${study.placeholder ? 'text-slate-400 italic' : 'text-slate-600'}`}>
                          {study.solution}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right: Results & Testimonial */}
                  <div className={`bg-slate-50 p-8 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase mb-6">Results</h4>
                    
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      {study.results.map((result) => (
                        <div key={result.metric} className="text-center">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                            study.placeholder ? 'bg-slate-200' : 'bg-green-100'
                          }`}>
                            <result.icon className={`w-6 h-6 ${study.placeholder ? 'text-slate-400' : 'text-green-600'}`} />
                          </div>
                          <p className={`text-2xl font-bold ${study.placeholder ? 'text-slate-400' : 'text-slate-900'}`}>
                            {result.value}
                          </p>
                          <p className="text-xs text-slate-500">{result.metric}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className={`relative p-6 rounded-xl ${study.placeholder ? 'bg-slate-100' : 'bg-white shadow-soft'}`}>
                      <MessageSquare className={`absolute -top-3 -left-3 w-8 h-8 ${
                        study.placeholder ? 'text-slate-300' : 'text-primary-500'
                      }`} />
                      <p className={`mb-4 ${study.placeholder ? 'text-slate-400 italic' : 'text-slate-600'}`}>
                        {study.testimonial}
                      </p>
                      <div>
                        <p className={`font-medium ${study.placeholder ? 'text-slate-500' : 'text-slate-900'}`}>
                          {study.author}
                        </p>
                        <p className="text-sm text-slate-500">{study.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Share Your Story CTA */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-10 h-10 text-accent-600" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-4">
              Share Your Success Story
            </h2>
            
            <p className="text-lg text-slate-600 mb-8">
              Have you transformed your business with our AI automation solutions? 
              We'd love to feature your story and inspire other small business owners.
            </p>
            
            <Link to="/contact" className="btn-accent">
              Submit Your Story
              <ChevronRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="section-container text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
            Ready to Write Your Success Story?
          </h2>
          <p className="text-lg text-primary-100 max-w-2xl mx-auto mb-8">
            Join the growing number of businesses transforming their operations 
            with AI automation. Your story starts with a free consultation.
          </p>
          <Link 
            to="/contact" 
            className="btn-primary bg-white text-primary-700 hover:bg-slate-100"
          >
            Schedule Free Consultation
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </>
  );
}

