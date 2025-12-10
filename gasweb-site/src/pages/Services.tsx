/**
 * Services Page Component
 * 
 * Detailed AI automation service descriptions with process flow,
 * consultation booking, and service showcase.
 * 
 * @module pages/Services
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
  Phone,
  Calendar,
  FileText,
  Settings,
  Zap,
  Users,
  Target,
  Lightbulb,
} from 'lucide-react';

/**
 * Detailed service data
 */
const services = [
  {
    id: 'email',
    icon: Mail,
    title: 'Email Automation',
    tagline: 'Never miss a follow-up again',
    description: 'Transform your email marketing and communication with intelligent automation that sends the right message at the right time.',
    features: [
      'Automated drip campaigns',
      'Smart follow-up sequences',
      'Lead nurturing workflows',
      'Personalized email triggers',
      'A/B testing automation',
      'Analytics and reporting',
    ],
    useCases: [
      'Welcome new subscribers automatically',
      'Re-engage inactive customers',
      'Send order confirmations and updates',
      'Schedule appointment reminders',
    ],
    beforeAfter: {
      before: '10+ hours/week on manual emails',
      after: 'Fully automated, 24/7 engagement',
    },
  },
  {
    id: 'data',
    icon: Database,
    title: 'Data Entry Automation',
    tagline: 'Eliminate manual data entry forever',
    description: 'Say goodbye to tedious data entry. Our AI-powered solutions extract, process, and organize your data automatically.',
    features: [
      'Document data extraction',
      'Form processing automation',
      'Database synchronization',
      'Data validation and cleaning',
      'Multi-system integration',
      'Real-time updates',
    ],
    useCases: [
      'Invoice data extraction',
      'Customer form processing',
      'Inventory management updates',
      'CRM data enrichment',
    ],
    beforeAfter: {
      before: '95% error rate in manual entry',
      after: '99.9% accuracy with AI automation',
    },
  },
  {
    id: 'chatbots',
    icon: MessageSquare,
    title: 'AI Chatbots',
    tagline: 'Customer support that never sleeps',
    description: 'Deploy intelligent chatbots that understand natural language and provide instant, helpful responses to your customers.',
    features: [
      'Natural language processing',
      'Multi-platform deployment',
      'Custom conversation flows',
      'Lead qualification',
      'Appointment scheduling',
      'FAQ automation',
    ],
    useCases: [
      'Website customer support',
      'Social media engagement',
      'Lead generation',
      'Product recommendations',
    ],
    beforeAfter: {
      before: 'Limited support hours, delayed responses',
      after: '24/7 instant support, happier customers',
    },
  },
  {
    id: 'support',
    icon: Bot,
    title: 'Customer Service Automation',
    tagline: 'Scale support without scaling costs',
    description: 'Automate your customer service operations with AI that handles inquiries, processes requests, and escalates when needed.',
    features: [
      'Ticket auto-routing',
      'Response suggestions',
      'Sentiment analysis',
      'Automated escalation',
      'Knowledge base integration',
      'Multi-channel support',
    ],
    useCases: [
      'Handle common inquiries automatically',
      'Route complex issues to the right team',
      'Track customer satisfaction',
      'Reduce response times dramatically',
    ],
    beforeAfter: {
      before: 'Hours of wait time, frustrated customers',
      after: 'Instant resolution, 95% satisfaction',
    },
  },
  {
    id: 'n8n',
    icon: Workflow,
    title: 'N8N Workflow Automation',
    tagline: 'Connect everything, automate anything',
    description: 'Build powerful workflow automations that connect your apps and services, eliminating manual tasks and data silos.',
    features: [
      '500+ app integrations',
      'Visual workflow builder',
      'Conditional logic',
      'Scheduled triggers',
      'Error handling',
      'Webhook automation',
    ],
    useCases: [
      'Sync data between systems',
      'Automate repetitive processes',
      'Create notification workflows',
      'Build custom integrations',
    ],
    beforeAfter: {
      before: 'Disconnected systems, manual transfers',
      after: 'Seamless integration, zero manual work',
    },
  },
  {
    id: 'custom',
    icon: Sparkles,
    title: 'Custom AI Solutions',
    tagline: 'Tailored automation for your unique needs',
    description: 'When off-the-shelf solutions don\'t fit, we build custom AI implementations designed specifically for your business processes.',
    features: [
      'Custom AI model training',
      'Bespoke automation workflows',
      'Industry-specific solutions',
      'Integration with legacy systems',
      'Scalable architecture',
      'Ongoing optimization',
    ],
    useCases: [
      'Industry-specific automation',
      'Complex multi-system workflows',
      'Unique business processes',
      'Enterprise integrations',
    ],
    beforeAfter: {
      before: 'Generic tools that don\'t fit',
      after: 'Perfect fit for your business',
    },
  },
];

/**
 * Process steps
 */
const processSteps = [
  {
    icon: Phone,
    title: 'Free Consultation',
    description: 'We start with a free discovery call to understand your business challenges and goals.',
  },
  {
    icon: Target,
    title: 'Analysis & Planning',
    description: 'Our team analyzes your processes and creates a custom automation strategy.',
  },
  {
    icon: Settings,
    title: 'Development',
    description: 'We build and configure your automation solutions with precision and care.',
  },
  {
    icon: Lightbulb,
    title: 'Implementation',
    description: 'Seamless deployment with thorough testing to ensure everything works perfectly.',
  },
  {
    icon: Users,
    title: 'Training & Support',
    description: 'Comprehensive training and ongoing support to ensure your success.',
  },
];

/**
 * Services Page Component
 * 
 * @returns {JSX.Element} The services page
 */
export default function Services(): JSX.Element {
  return (
    <>
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-b from-slate-50 to-white">
        <div className="section-container">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              <span>AI Automation Services</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-slate-900 mb-6">
              Transform Your Business with{' '}
              <span className="gradient-text">Intelligent Automation</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-8">
              From email automation to custom AI solutions, we help small businesses 
              streamline operations, reduce costs, and scale efficiently.
            </p>
            
            <Link to="/contact" className="btn-accent">
              Get Free Consultation
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding bg-white">
        <div className="section-container">
          {services.map((service, index) => (
            <div 
              key={service.id}
              id={service.id}
              className={`py-16 ${index > 0 ? 'border-t border-slate-100' : ''}`}
            >
              <div className={`grid lg:grid-cols-2 gap-12 items-start ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}>
                {/* Content */}
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-6">
                    <service.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <h2 className="text-3xl font-heading font-bold text-slate-900 mb-2">
                    {service.title}
                  </h2>
                  
                  <p className="text-lg text-primary-600 font-medium mb-4">
                    {service.tagline}
                  </p>
                  
                  <p className="text-slate-600 mb-8">
                    {service.description}
                  </p>
                  
                  {/* Features */}
                  <div className="mb-8">
                    <h3 className="font-semibold text-slate-900 mb-4">Key Features:</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {service.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-slate-600 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Link to="/contact" className="btn-primary">
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </div>
                
                {/* Visual / Use Cases */}
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <div className="bg-slate-50 rounded-2xl p-8">
                    {/* Use Cases */}
                    <h3 className="font-semibold text-slate-900 mb-4">
                      Common Use Cases:
                    </h3>
                    <ul className="space-y-3 mb-8">
                      {service.useCases.map((useCase) => (
                        <li key={useCase} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Zap className="w-3 h-3 text-primary-600" />
                          </div>
                          <span className="text-slate-600">{useCase}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {/* Before/After */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-red-50 rounded-xl p-4">
                        <p className="text-xs text-red-600 font-medium uppercase mb-2">Before</p>
                        <p className="text-sm text-slate-700">{service.beforeAfter.before}</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-4">
                        <p className="text-xs text-green-600 font-medium uppercase mb-2">After</p>
                        <p className="text-sm text-slate-700">{service.beforeAfter.after}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section className="section-padding bg-slate-50">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-4">
              How We Work
            </h2>
            <p className="text-lg text-slate-600">
              Our proven process ensures successful automation implementation 
              with minimal disruption to your business.
            </p>
          </div>
          
          <div className="relative">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200 -translate-y-1/2" />
            
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8">
              {processSteps.map((step, index) => (
                <div key={step.title} className="relative text-center">
                  <div className="relative z-10 w-16 h-16 bg-white border-4 border-primary-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-soft">
                    <step.icon className="w-7 h-7 text-primary-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold z-20">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="section-container text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-primary-100 max-w-2xl mx-auto mb-8">
            Schedule a free consultation and let's discuss how we can automate 
            your business processes and boost your efficiency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/contact" 
              className="btn-primary bg-white text-primary-700 hover:bg-slate-100"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Schedule Consultation
            </Link>
            <Link 
              to="/education" 
              className="btn-secondary bg-transparent border-white text-white hover:bg-white/10"
            >
              <FileText className="w-5 h-5 mr-2" />
              View Free Resources
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

