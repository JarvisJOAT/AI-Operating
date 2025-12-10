# Gasweb.info Development Guide

This guide covers development practices, code organization, and workflows for contributing to Gasweb.info.

## Development Workflow

### Getting Started

```bash
# Navigate to the project
cd AI-Operating/gasweb-site

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
# http://localhost:5173
```

### Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm test` | Run tests (when configured) |

## Code Organization

### Directory Structure Conventions

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Generic, highly reusable
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── layout/          # Layout components
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── features/        # Feature-specific components
│       ├── courses/
│       ├── payments/
│       └── landing/
│
├── pages/               # Page-level components (routes)
│   ├── Home.tsx
│   ├── Services.tsx
│   └── admin/           # Admin pages
│
├── hooks/               # Custom React hooks
│   ├── useAuth.ts
│   ├── useCourses.ts
│   └── usePayment.ts
│
├── lib/                 # Utilities and services
│   ├── supabase.ts      # Supabase client
│   ├── stripe.ts        # Stripe integration
│   └── utils.ts         # Helper functions
│
├── types/               # TypeScript definitions
│   └── index.ts
│
└── contexts/            # React contexts
    └── AuthContext.tsx
```

### File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `ServiceCard.tsx` |
| Hooks | camelCase with `use` prefix | `useCourses.ts` |
| Utilities | camelCase | `formatPrice.ts` |
| Types | PascalCase | `types/Course.ts` |
| Constants | UPPER_SNAKE_CASE | `constants/API_ROUTES.ts` |

## Component Development

### Component Template

```tsx
// components/features/courses/CourseCard.tsx
import React from 'react';
import { Course } from '@/types';

interface CourseCardProps {
  course: Course;
  onEnroll?: (courseId: string) => void;
  variant?: 'default' | 'compact';
  className?: string;
}

/**
 * CourseCard displays a single course with its details.
 * 
 * @example
 * <CourseCard 
 *   course={course} 
 *   onEnroll={handleEnroll} 
 *   variant="compact" 
 * />
 */
export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onEnroll,
  variant = 'default',
  className = '',
}) => {
  const handleClick = () => {
    onEnroll?.(course.id);
  };

  return (
    <div 
      className={`
        rounded-lg shadow-md overflow-hidden
        ${variant === 'compact' ? 'p-4' : 'p-6'}
        ${className}
      `}
    >
      {course.thumbnail_url && (
        <img 
          src={course.thumbnail_url} 
          alt={course.title}
          className="w-full h-48 object-cover"
        />
      )}
      <h3 className="text-xl font-semibold mt-4">{course.title}</h3>
      <p className="text-gray-600 mt-2">{course.description}</p>
      {onEnroll && (
        <button 
          onClick={handleClick}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Enroll Now
        </button>
      )}
    </div>
  );
};

export default CourseCard;
```

### Component Best Practices

1. **Single Responsibility**: Each component should do one thing well
2. **Props Interface**: Always define TypeScript interfaces for props
3. **Default Props**: Use default parameter values instead of defaultProps
4. **Memoization**: Use `React.memo` for expensive renders
5. **Event Handlers**: Prefix with `handle` (e.g., `handleClick`)

## Custom Hooks

### Hook Template

```typescript
// hooks/useCourses.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Course } from '@/types';

interface UseCoursesOptions {
  category?: string;
  limit?: number;
  published?: boolean;
}

interface UseCoursesReturn {
  courses: Course[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching and managing courses data.
 * 
 * @example
 * const { courses, loading, error } = useCourses({ category: 'ai' });
 */
export const useCourses = (options: UseCoursesOptions = {}): UseCoursesReturn => {
  const { category, limit = 10, published = true } = options;
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('courses')
        .select('*')
        .eq('is_published', published)
        .limit(limit);
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setCourses(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  }, [category, limit, published]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, loading, error, refetch: fetchCourses };
};
```

## Styling Guidelines

### Tailwind CSS Usage

```tsx
// ✅ Good: Consistent, readable class organization
<div className="
  flex flex-col items-center justify-center
  p-4 md:p-6 lg:p-8
  bg-white dark:bg-gray-800
  rounded-lg shadow-md
  hover:shadow-lg transition-shadow
">

// ❌ Avoid: Random class order, hard to read
<div className="shadow-md flex bg-white p-4 md:p-6 hover:shadow-lg rounded-lg lg:p-8 items-center justify-center flex-col">
```

### Class Organization Order

1. Layout (flex, grid, position)
2. Sizing (width, height, padding, margin)
3. Typography (font, text)
4. Colors (bg, text colors)
5. Borders (rounded, border)
6. Effects (shadow, opacity)
7. States (hover, focus, active)
8. Transitions

### Custom CSS (when needed)

```css
/* index.css */
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded-lg 
           hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 
           transition-colors duration-200;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md p-6 
           dark:bg-gray-800 dark:text-white;
  }
}
```

## State Management Patterns

### Local State

```tsx
// Simple component state
const [isOpen, setIsOpen] = useState(false);

// Form state
const [formData, setFormData] = useState({
  name: '',
  email: '',
  message: '',
});

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData(prev => ({
    ...prev,
    [e.target.name]: e.target.value,
  }));
};
```

### Context State

```tsx
// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

## API Integration Patterns

### Supabase Queries

```typescript
// lib/api/courses.ts
import { supabase } from '../supabase';
import { Course, CourseContent } from '@/types';

export const coursesApi = {
  // Fetch all published courses
  async getAll(): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Fetch single course with content
  async getById(id: string): Promise<Course & { content: CourseContent[] }> {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        content:course_content(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Enroll user in course
  async enroll(courseId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('course_enrollments')
      .insert({ course_id: courseId, user_id: userId });
    
    if (error) throw error;
  },
};
```

### Error Handling

```typescript
// lib/utils/error.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Usage in component
try {
  await coursesApi.enroll(courseId, userId);
} catch (error) {
  const message = handleApiError(error);
  toast.error(message);
}
```

## Testing

### Component Testing

```typescript
// __tests__/components/CourseCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CourseCard } from '@/components/features/courses/CourseCard';

const mockCourse = {
  id: '1',
  title: 'Test Course',
  description: 'A test course description',
  price: 99.99,
  thumbnail_url: 'https://example.com/image.jpg',
};

describe('CourseCard', () => {
  it('renders course information correctly', () => {
    render(<CourseCard course={mockCourse} />);
    
    expect(screen.getByText('Test Course')).toBeInTheDocument();
    expect(screen.getByText('A test course description')).toBeInTheDocument();
  });

  it('calls onEnroll when button is clicked', () => {
    const handleEnroll = jest.fn();
    render(<CourseCard course={mockCourse} onEnroll={handleEnroll} />);
    
    fireEvent.click(screen.getByText('Enroll Now'));
    expect(handleEnroll).toHaveBeenCalledWith('1');
  });
});
```

### Hook Testing

```typescript
// __tests__/hooks/useCourses.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useCourses } from '@/hooks/useCourses';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue({
      data: [{ id: '1', title: 'Test Course' }],
      error: null,
    }),
  },
}));

describe('useCourses', () => {
  it('fetches courses on mount', async () => {
    const { result } = renderHook(() => useCourses());
    
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.courses).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });
});
```

## Performance Optimization

### React Optimization

```tsx
// Memoize expensive components
const CourseList = React.memo(({ courses, onSelect }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {courses.map(course => (
        <CourseCard 
          key={course.id} 
          course={course} 
          onEnroll={onSelect}
        />
      ))}
    </div>
  );
});

// Memoize callbacks
const handleEnroll = useCallback((courseId: string) => {
  navigate(`/courses/${courseId}/enroll`);
}, [navigate]);

// Memoize expensive calculations
const filteredCourses = useMemo(() => {
  return courses.filter(c => c.category === selectedCategory);
}, [courses, selectedCategory]);
```

### Code Splitting

```tsx
// Lazy load pages
const Education = React.lazy(() => import('./pages/Education'));
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));

// Use with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/education" element={<Education />} />
    <Route path="/admin" element={<AdminDashboard />} />
  </Routes>
</Suspense>
```

## Git Workflow

### Branch Naming

```
feature/add-payment-modal
bugfix/fix-course-loading
hotfix/security-patch
refactor/optimize-api-calls
docs/update-readme
```

### Commit Messages

```
feat: add payment modal component
fix: resolve course loading spinner issue
docs: update API documentation
refactor: optimize database queries
test: add unit tests for CourseCard
chore: update dependencies
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-reviewed code
- [ ] Added necessary documentation
- [ ] No new warnings
```

## Debugging

### Browser DevTools

```typescript
// Add debug logging in development
if (import.meta.env.DEV) {
  console.log('Debug:', { courses, loading, error });
}
```

### React DevTools

- Install React DevTools browser extension
- Use Components tab to inspect component tree
- Use Profiler to identify performance issues

### Network Debugging

- Use Network tab to inspect API calls
- Check request/response payloads
- Verify headers and authentication

---

## Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)

