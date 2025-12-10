# Gasweb.info Architecture Documentation

## Overview

Gasweb.info is a modern web application built with React, TypeScript, and Vite, designed to showcase AI automation services for small businesses and provide an educational platform.

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend Framework** | React 18 | Component-based UI |
| **Language** | TypeScript 5 | Type safety |
| **Build Tool** | Vite 5 | Fast development & bundling |
| **Styling** | Tailwind CSS 3 | Utility-first styling |
| **Routing** | React Router DOM 6 | Client-side routing |
| **Backend** | Supabase | Database, Auth, Real-time |
| **Payments** | Stripe, PayPal, Crypto | Payment processing |

## Project Structure

```
gasweb-site/
├── public/                    # Static assets
│   ├── favicon.svg           # Site favicon
│   └── images/               # Static images
│
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── Layout.tsx        # Main layout wrapper
│   │   ├── Navbar.tsx        # Navigation component
│   │   ├── Footer.tsx        # Footer component
│   │   ├── ServiceCard.tsx   # Service display card
│   │   ├── CourseCard.tsx    # Course display card
│   │   ├── PaymentModal.tsx  # Payment processing modal
│   │   └── ...
│   │
│   ├── pages/                # Page components
│   │   ├── Home.tsx          # Landing page
│   │   ├── Services.tsx      # Services showcase
│   │   ├── Education.tsx     # Course catalog
│   │   ├── CaseStudies.tsx   # Case studies
│   │   ├── Contact.tsx       # Contact form
│   │   ├── LandingPage.tsx   # Dynamic link page
│   │   ├── NotFound.tsx      # 404 page
│   │   └── admin/
│   │       └── LandingPageAdmin.tsx
│   │
│   ├── lib/                  # Utilities & services
│   │   ├── supabase.ts       # Supabase client
│   │   ├── database.types.ts # TypeScript types
│   │   ├── stripe.ts         # Stripe integration
│   │   ├── paypal.ts         # PayPal integration
│   │   └── crypto.ts         # Crypto payments
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts        # Authentication hook
│   │   ├── useCourses.ts     # Course data hook
│   │   └── usePayment.ts     # Payment processing hook
│   │
│   ├── contexts/             # React contexts
│   │   └── AuthContext.tsx   # Auth state management
│   │
│   ├── types/                # TypeScript definitions
│   │   └── index.ts          # Shared types
│   │
│   ├── App.tsx               # Root component
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles
│
├── docs/                     # Documentation
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── .env.example
```

## Component Architecture

### Component Hierarchy

```
App
├── Router
│   ├── Layout
│   │   ├── Navbar
│   │   │   ├── Logo
│   │   │   ├── NavLinks
│   │   │   └── MobileMenu
│   │   ├── <Outlet /> (Page Content)
│   │   │   ├── Home
│   │   │   │   ├── HeroSection
│   │   │   │   ├── ServicesOverview
│   │   │   │   ├── EducationPreview
│   │   │   │   └── CTASection
│   │   │   ├── Services
│   │   │   │   ├── ServiceCard[]
│   │   │   │   └── ConsultationWidget
│   │   │   ├── Education
│   │   │   │   ├── CourseFilters
│   │   │   │   ├── CourseGrid
│   │   │   │   │   └── CourseCard[]
│   │   │   │   └── PaymentModal
│   │   │   ├── CaseStudies
│   │   │   │   └── CaseStudyCard[]
│   │   │   └── Contact
│   │   │       └── ContactForm
│   │   └── Footer
│   │
│   └── LandingPage (standalone)
│       ├── ProfileSection
│       ├── LinkList
│       └── VideoSection
```

### Component Design Patterns

#### 1. Container/Presentational Pattern
```typescript
// Container (handles logic)
const CourseListContainer: React.FC = () => {
  const { courses, loading, error } = useCourses();
  return <CourseList courses={courses} loading={loading} error={error} />;
};

// Presentational (handles display)
const CourseList: React.FC<CourseListProps> = ({ courses, loading, error }) => {
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  return <div className="grid">{courses.map(c => <CourseCard key={c.id} course={c} />)}</div>;
};
```

#### 2. Compound Component Pattern
```typescript
// Used for complex components like PaymentModal
<PaymentModal>
  <PaymentModal.Header title="Complete Purchase" />
  <PaymentModal.Body>
    <PaymentModal.MethodSelector methods={['stripe', 'paypal', 'crypto']} />
    <PaymentModal.Summary course={selectedCourse} />
  </PaymentModal.Body>
  <PaymentModal.Footer>
    <PaymentModal.SubmitButton />
  </PaymentModal.Footer>
</PaymentModal>
```

## State Management

### Local State
- Component-level state using `useState`
- Form state management with controlled components

### Global State
- **Authentication State**: Managed via `AuthContext`
- **User Preferences**: Stored in local storage, synced with Supabase

### Data Fetching State
- Server state managed via custom hooks
- Supabase real-time subscriptions for live data

### State Flow Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Supabase DB   │────▶│  Custom Hooks   │────▶│   Components    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         ▲                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         └──────────────│   AuthContext   │◀─────────────┘
                        └─────────────────┘
```

## Routing Architecture

### Route Configuration

```typescript
// App.tsx routing structure
<Routes>
  {/* Main site routes with Layout */}
  <Route path="/" element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="services" element={<Services />} />
    <Route path="education" element={<Education />} />
    <Route path="education/:courseId" element={<CourseDetail />} />
    <Route path="case-studies" element={<CaseStudies />} />
    <Route path="contact" element={<Contact />} />
    
    {/* Admin routes */}
    <Route path="admin/landing-page" element={<LandingPageAdmin />} />
  </Route>
  
  {/* Standalone landing page (no layout) */}
  <Route path="/l/:slug" element={<LandingPage />} />
  
  {/* 404 fallback */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

### Route Protection

```typescript
// Protected route wrapper for admin pages
const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};
```

## API Integration

### Supabase Client Configuration

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

### API Patterns

#### Data Fetching
```typescript
// hooks/useCourses.ts
export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      if (error) setError(error.message);
      else setCourses(data || []);
      setLoading(false);
    };
    
    fetchCourses();
  }, []);

  return { courses, loading, error };
};
```

#### Real-time Subscriptions
```typescript
// Real-time landing page analytics
useEffect(() => {
  const subscription = supabase
    .channel('landing_page_analytics')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'landing_page_analytics' },
      (payload) => {
        console.log('New analytics event:', payload);
        // Update local state
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
}, []);
```

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  organizations  │────▶│  landing_pages  │────▶│landing_page_links│
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │
         │                       ├──────────────▶┌─────────────────────┐
         │                       │               │landing_page_videos  │
         │                       │               └─────────────────────┘
         │                       │
         │                       └──────────────▶┌─────────────────────┐
         │                                       │landing_page_analytics│
         │                                       └─────────────────────┘
         │
         ├──────────────▶┌─────────────────┐     ┌─────────────────┐
         │               │     courses     │────▶│  course_content │
         │               └─────────────────┘     └─────────────────┘
         │                       │
         │                       ├──────────────▶┌───────────────────┐
         │                       │               │course_enrollments │
         │                       │               └───────────────────┘
         │                       │
         │                       └──────────────▶┌─────────────────┐
         │                                       │course_purchases │
         │                                       └─────────────────┘
         │
         └─────────────────────────────────────▶┌─────────────────┐
                                                │   auth.users    │
                                                └─────────────────┘
```

### Table Schemas

#### Landing Pages
```sql
CREATE TABLE landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  theme JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Courses
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  price DECIMAL(10, 2),
  pricing_model TEXT NOT NULL DEFAULT 'free', -- 'free', 'one_time', 'subscription'
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Security Architecture

### Row Level Security (RLS)

All tables implement RLS policies:

```sql
-- Public read access for published content
CREATE POLICY "Published courses are viewable by everyone" ON courses
  FOR SELECT USING (is_published = TRUE);

-- Organization-level access for management
CREATE POLICY "Organizations can manage their own courses" ON courses
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM organization_members 
      WHERE organization_id = courses.organization_id
    )
  );
```

### Authentication Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  User   │────▶│ Supabase│────▶│  Auth   │────▶│  JWT    │
│         │     │  Auth   │     │ Provider│     │ Token   │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
                                                     │
     ┌───────────────────────────────────────────────┘
     ▼
┌─────────┐     ┌─────────┐     ┌─────────┐
│  RLS    │────▶│ Filtered│────▶│  Client │
│ Policies│     │  Data   │     │         │
└─────────┘     └─────────┘     └─────────┘
```

## Payment Architecture

### Payment Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  User   │────▶│ Payment │────▶│ Payment │────▶│ Webhook │
│ Selects │     │  Modal  │     │ Provider│     │ Handler │
│ Course  │     │         │     │         │     │         │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
                                                     │
     ┌───────────────────────────────────────────────┘
     ▼
┌─────────┐     ┌─────────┐     ┌─────────┐
│ Course  │────▶│ Enroll  │────▶│ Access  │
│ Purchase│     │  User   │     │ Granted │
└─────────┘     └─────────┘     └─────────┘
```

### Supported Payment Methods

| Provider | Use Case | Configuration |
|----------|----------|---------------|
| Stripe | Card payments, subscriptions | `VITE_STRIPE_PUBLISHABLE_KEY` |
| PayPal | Alternative payments | `VITE_PAYPAL_CLIENT_ID` |
| Crypto | Bitcoin, Ethereum | Custom integration |

## Performance Optimizations

### Code Splitting
```typescript
// Lazy loading pages
const Education = React.lazy(() => import('./pages/Education'));
const CaseStudies = React.lazy(() => import('./pages/CaseStudies'));

// In routes
<Route path="education" element={
  <Suspense fallback={<LoadingSpinner />}>
    <Education />
  </Suspense>
} />
```

### Image Optimization
- Use WebP format with fallbacks
- Implement lazy loading for images
- Responsive image sizes

### Caching Strategy
- Service worker for static assets
- Supabase query caching
- React Query for server state caching

## Error Handling

### Error Boundary
```typescript
class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### API Error Handling
```typescript
try {
  const { data, error } = await supabase.from('courses').select('*');
  if (error) throw error;
  return data;
} catch (error) {
  console.error('API Error:', error);
  toast.error('Failed to load courses. Please try again.');
  return [];
}
```

## Testing Strategy

### Unit Tests
- Component rendering tests
- Hook behavior tests
- Utility function tests

### Integration Tests
- API integration tests
- Authentication flow tests
- Payment flow tests

### E2E Tests
- User journey tests
- Critical path testing
- Cross-browser testing

---

## Related Documentation

- [Setup Guide](./SETUP_GUIDE.md)
- [Development Guide](./DEVELOPMENT.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [API Documentation](./API_DOCUMENTATION.md)

