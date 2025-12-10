/**
 * Education Page Component
 * 
 * Course catalog with flexible pricing (free, one-time, subscription),
 * filtering capabilities, and course previews.
 * 
 * @module pages/Education
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Play,
  Clock,
  BookOpen,
  Users,
  Star,
  Filter,
  Grid,
  List,
  Search,
  ChevronRight,
  Lock,
  Download,
  Video,
  FileText,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

/**
 * Course type definition
 */
interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  priceType: 'free' | 'one_time' | 'subscription';
  price?: number;
  image: string;
  duration: string;
  lessons: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  students: number;
  contentTypes: ('video' | 'pdf' | 'interactive')[];
  preview: boolean;
  featured?: boolean;
}

/**
 * Sample course data
 */
const courses: Course[] = [
  {
    id: '1',
    title: 'Introduction to AI Automation',
    description: 'Learn the fundamentals of AI automation and how it can transform your business operations.',
    category: 'Fundamentals',
    priceType: 'free',
    image: '/courses/ai-intro.jpg',
    duration: '2 hours',
    lessons: 8,
    level: 'Beginner',
    rating: 4.9,
    students: 1250,
    contentTypes: ['video', 'pdf'],
    preview: true,
    featured: true,
  },
  {
    id: '2',
    title: 'Email Automation Mastery',
    description: 'Master email automation from basic sequences to advanced drip campaigns.',
    category: 'Email Automation',
    priceType: 'free',
    image: '/courses/email-automation.jpg',
    duration: '3 hours',
    lessons: 12,
    level: 'Beginner',
    rating: 4.8,
    students: 890,
    contentTypes: ['video', 'pdf', 'interactive'],
    preview: true,
  },
  {
    id: '3',
    title: 'Building AI Chatbots',
    description: 'Create intelligent chatbots that engage customers and generate leads 24/7.',
    category: 'Chatbots',
    priceType: 'one_time',
    price: 49,
    image: '/courses/chatbots.jpg',
    duration: '5 hours',
    lessons: 20,
    level: 'Intermediate',
    rating: 4.9,
    students: 560,
    contentTypes: ['video', 'pdf', 'interactive'],
    preview: true,
  },
  {
    id: '4',
    title: 'N8N Workflow Automation',
    description: 'Connect your apps and automate workflows without coding using N8N.',
    category: 'N8N Workflows',
    priceType: 'one_time',
    price: 79,
    image: '/courses/n8n.jpg',
    duration: '8 hours',
    lessons: 30,
    level: 'Intermediate',
    rating: 4.7,
    students: 420,
    contentTypes: ['video', 'pdf'],
    preview: true,
    featured: true,
  },
  {
    id: '5',
    title: 'Advanced AI Integration',
    description: 'Learn to integrate multiple AI services into cohesive automation systems.',
    category: 'Advanced',
    priceType: 'subscription',
    price: 19,
    image: '/courses/advanced-ai.jpg',
    duration: '12 hours',
    lessons: 45,
    level: 'Advanced',
    rating: 4.8,
    students: 280,
    contentTypes: ['video', 'pdf', 'interactive'],
    preview: false,
  },
  {
    id: '6',
    title: 'Data Entry Automation Guide',
    description: 'Eliminate manual data entry with smart automation techniques.',
    category: 'Data Automation',
    priceType: 'free',
    image: '/courses/data-entry.jpg',
    duration: '1.5 hours',
    lessons: 6,
    level: 'Beginner',
    rating: 4.6,
    students: 720,
    contentTypes: ['video', 'pdf'],
    preview: true,
  },
];

/**
 * Course categories
 */
const categories = [
  'All',
  'Fundamentals',
  'Email Automation',
  'Chatbots',
  'N8N Workflows',
  'Data Automation',
  'Advanced',
];

/**
 * Pricing filters
 */
const pricingFilters = [
  { label: 'All', value: 'all' },
  { label: 'Free', value: 'free' },
  { label: 'One-Time', value: 'one_time' },
  { label: 'Subscription', value: 'subscription' },
];

/**
 * Get price badge component
 */
function PriceBadge({ priceType, price }: { priceType: string; price?: number }) {
  if (priceType === 'free') {
    return (
      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
        Free
      </span>
    );
  }
  if (priceType === 'one_time') {
    return (
      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
        ${price}
      </span>
    );
  }
  return (
    <span className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm font-medium">
      ${price}/mo
    </span>
  );
}

/**
 * Course card component
 */
function CourseCard({ course, viewMode }: { course: Course; viewMode: 'grid' | 'list' }) {
  const isGrid = viewMode === 'grid';
  
  return (
    <div className={`card group ${isGrid ? '' : 'flex gap-6'}`}>
      {/* Image */}
      <div className={`relative overflow-hidden ${isGrid ? 'aspect-video' : 'w-64 flex-shrink-0'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center">
          <Play className="w-12 h-12 text-white opacity-80" />
        </div>
        {course.featured && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-accent-500 text-white text-xs font-medium rounded-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Featured
            </span>
          </div>
        )}
        {course.preview && (
          <button className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Play className="w-6 h-6 text-primary-600 ml-1" />
            </div>
          </button>
        )}
      </div>
      
      {/* Content */}
      <div className={`${isGrid ? 'p-5' : 'p-5 flex-grow'}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-slate-500 uppercase font-medium">{course.category}</span>
          <span className="text-slate-300">•</span>
          <span className="text-xs text-slate-500">{course.level}</span>
        </div>
        
        <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">
          {course.title}
        </h3>
        
        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
          {course.description}
        </p>
        
        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{course.lessons} lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{course.students}</span>
          </div>
        </div>
        
        {/* Content Types */}
        <div className="flex items-center gap-2 mb-4">
          {course.contentTypes.includes('video') && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-xs text-slate-600">
              <Video className="w-3 h-3" />
              Video
            </span>
          )}
          {course.contentTypes.includes('pdf') && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-xs text-slate-600">
              <FileText className="w-3 h-3" />
              PDF
            </span>
          )}
          {course.contentTypes.includes('interactive') && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-xs text-slate-600">
              <Download className="w-3 h-3" />
              Interactive
            </span>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium">{course.rating}</span>
            </div>
            <PriceBadge priceType={course.priceType} price={course.price} />
          </div>
          
          <button className="text-primary-600 font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all">
            {course.priceType === 'free' ? 'Start Learning' : 'Enroll Now'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Education Page Component
 * 
 * @returns {JSX.Element} The education page
 */
export default function Education(): JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPricing, setSelectedPricing] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter courses
  const filteredCourses = courses.filter((course) => {
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesPricing = selectedPricing === 'all' || course.priceType === selectedPricing;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesPricing && matchesSearch;
  });

  return (
    <>
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-b from-slate-50 to-white">
        <div className="section-container">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-50 text-secondary-700 rounded-full text-sm font-medium mb-6">
              <Play className="w-4 h-4" />
              <span>Learn AI Automation</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-slate-900 mb-6">
              Master AI Automation{' '}
              <span className="gradient-text">at Your Own Pace</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-8">
              Free tutorials, premium courses, and comprehensive guides to help you 
              implement AI automation in your business. No technical background required.
            </p>
            
            <div className="flex flex-wrap gap-6 justify-center text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Free Courses Available</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>No Account Required for Free Content</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Lifetime Access to Purchases</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white border-b border-slate-100 sticky top-16 md:top-20 z-30">
        <div className="section-container">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-slate-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field py-2 min-w-[150px]"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Pricing Filter */}
              <div className="flex gap-2">
                {pricingFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setSelectedPricing(filter.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedPricing === filter.value
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              
              {/* View Toggle */}
              <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
                  aria-label="Grid view"
                >
                  <Grid className="w-5 h-5 text-slate-600" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
                  aria-label="List view"
                >
                  <List className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Grid */}
      <section className="section-padding bg-white" id="premium">
        <div className="section-container">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No courses found</h3>
              <p className="text-slate-600">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-slate-600">
                Showing {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
              </div>
              
              <div className={
                viewMode === 'grid'
                  ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-6'
              }>
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} viewMode={viewMode} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Pricing Note Section */}
      <section className="py-12 bg-slate-50 border-y border-slate-100">
        <div className="section-container">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Free Courses</h3>
              <p className="text-sm text-slate-600">
                Start learning immediately with no account required. Track progress by creating a free account.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">One-Time Purchase</h3>
              <p className="text-sm text-slate-600">
                Buy once, own forever. Get lifetime access to course content and future updates.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-secondary-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Subscription</h3>
              <p className="text-sm text-slate-600">
                Access premium content and new releases. Cancel anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-secondary-600 to-primary-600 text-white">
        <div className="section-container text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
            Need Personalized Training?
          </h2>
          <p className="text-lg text-primary-100 max-w-2xl mx-auto mb-8">
            We offer custom training sessions tailored to your business needs. 
            Get hands-on guidance from our automation experts.
          </p>
          <Link 
            to="/contact" 
            className="btn-primary bg-white text-primary-700 hover:bg-slate-100"
          >
            Request Custom Training
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </>
  );
}

