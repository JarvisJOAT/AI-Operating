/**
 * Contact Page Component
 * 
 * Consultation booking page with contact form, 
 * calendar booking option, and contact information.
 * 
 * @module pages/Contact
 */

import { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Calendar,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';

/**
 * Contact form data type
 */
interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  message: string;
}

/**
 * Service options for the form
 */
const serviceOptions = [
  'Email Automation',
  'Data Entry Automation',
  'AI Chatbot Development',
  'Customer Service Automation',
  'N8N Workflow Design',
  'Custom AI Solutions',
  'Training & Education',
  'General Inquiry',
];

/**
 * Contact Page Component
 * 
 * @returns {JSX.Element} The contact page
 */
export default function Contact(): JSX.Element {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after showing success
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        service: '',
        message: '',
      });
      setIsSubmitted(false);
    }, 5000);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-b from-slate-50 to-white">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium mb-6">
              <Calendar className="w-4 h-4" />
              <span>Free Consultation</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-900 mb-6">
              Let's Transform Your Business
            </h1>
            
            <p className="text-lg text-slate-600">
              Schedule a free consultation to discuss how AI automation can streamline 
              your operations and boost your efficiency. No commitment required.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-heading font-bold text-slate-900 mb-6">
                Request a Consultation
              </h2>
              
              {isSubmitted ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center animate-fade-in">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    Thank You!
                  </h3>
                  <p className="text-slate-600">
                    Your request has been received. We'll get back to you within 24 hours 
                    to schedule your free consultation.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Your Company Inc."
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="service" className="block text-sm font-medium text-slate-700 mb-2">
                      Service of Interest *
                    </label>
                    <select
                      id="service"
                      name="service"
                      required
                      value={formData.service}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="">Select a service...</option>
                      {serviceOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                      Tell Us About Your Needs *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className="input-field resize-none"
                      placeholder="Describe your current challenges and what you'd like to achieve with AI automation..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full md:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Request Consultation
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
            
            {/* Contact Info & Calendar */}
            <div>
              {/* Direct Contact */}
              <div className="bg-slate-50 rounded-2xl p-8 mb-8">
                <h3 className="text-xl font-semibold text-slate-900 mb-6">
                  Contact Information
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Email</p>
                      <a href="mailto:contact@gasweb.info" className="text-slate-600 hover:text-primary-600 transition-colors">
                        contact@gasweb.info
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Phone</p>
                      <a href="tel:+1234567890" className="text-slate-600 hover:text-primary-600 transition-colors">
                        (123) 456-7890
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Location</p>
                      <p className="text-slate-600">
                        United States<br />
                        Available Worldwide
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Business Hours</p>
                      <p className="text-slate-600">
                        Monday - Friday: 9am - 6pm EST<br />
                        Response within 24 hours
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Calendar Booking */}
              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-white rounded-xl shadow flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">
                      Schedule a Call
                    </h3>
                    <p className="text-slate-600">
                      Book a 30-minute consultation directly on our calendar
                    </p>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 text-center">
                  <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">
                    Calendar booking widget coming soon.
                    Use the form to request a consultation.
                  </p>
                  <button className="btn-secondary text-sm" disabled>
                    Calendar Coming Soon
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="section-padding bg-slate-50">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-heading font-bold text-slate-900 mb-4">
              What to Expect
            </h2>
            <p className="text-lg text-slate-600">
              Our free consultation process is designed to understand your unique needs 
              and provide actionable recommendations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '1',
                title: 'Discovery Call',
                description: 'We discuss your current challenges, goals, and how AI automation can help.',
              },
              {
                step: '2',
                title: 'Custom Proposal',
                description: 'You receive a tailored plan with specific solutions and expected outcomes.',
              },
              {
                step: '3',
                title: 'Implementation',
                description: 'Once approved, we begin building and deploying your automation solutions.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-heading font-bold text-slate-900 mb-8 text-center">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              {[
                {
                  question: 'Is the consultation really free?',
                  answer: 'Yes! Our initial consultation is completely free with no obligation. We believe in building trust first.',
                },
                {
                  question: 'Do I need technical knowledge?',
                  answer: 'Not at all. We handle all the technical aspects. You just need to tell us about your business challenges.',
                },
                {
                  question: 'How long does implementation take?',
                  answer: 'It depends on the complexity, but most automations are deployed within 2-4 weeks.',
                },
                {
                  question: 'What ongoing support do you provide?',
                  answer: 'We offer comprehensive training and ongoing support to ensure your success with our solutions.',
                },
              ].map((faq, index) => (
                <div key={index} className="bg-slate-50 rounded-xl p-6">
                  <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <ArrowRight className="w-5 h-5 text-primary-600" />
                    {faq.question}
                  </h3>
                  <p className="text-slate-600 pl-7">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

