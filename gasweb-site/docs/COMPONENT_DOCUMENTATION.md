# Gasweb.info Component Documentation

This document provides detailed documentation for all reusable components in Gasweb.info.

## Table of Contents

1. [Layout Components](#layout-components)
2. [Common Components](#common-components)
3. [Course Components](#course-components)
4. [Payment Components](#payment-components)
5. [Landing Page Components](#landing-page-components)
6. [Form Components](#form-components)
7. [Feedback Components](#feedback-components)

---

## Layout Components

### Layout

Main layout wrapper that includes the navigation header and footer.

**Location:** `src/components/Layout.tsx`

**Usage:**
```tsx
import Layout from '@/components/Layout';

// Used in App.tsx routing
<Route path="/" element={<Layout />}>
  <Route index element={<Home />} />
  {/* ... other routes */}
</Route>
```

**Structure:**
- Header with navigation
- Main content area (`<Outlet />`)
- Footer with links

---

### Navbar

Navigation bar component with responsive mobile menu.

**Location:** `src/components/layout/Navbar.tsx`

**Props:**
```typescript
interface NavbarProps {
  transparent?: boolean;  // Use transparent background
  className?: string;     // Additional CSS classes
}
```

**Usage:**
```tsx
<Navbar transparent={isHomePage} />
```

**Features:**
- Responsive design (mobile hamburger menu)
- Active link highlighting
- User menu dropdown (when authenticated)
- Scroll-aware styling

---

### Footer

Site footer with links, social media, and copyright.

**Location:** `src/components/layout/Footer.tsx`

**Props:**
```typescript
interface FooterProps {
  className?: string;
}
```

**Usage:**
```tsx
<Footer />
```

---

## Common Components

### Button

Versatile button component with multiple variants.

**Location:** `src/components/common/Button.tsx`

**Props:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
}
```

**Usage:**
```tsx
import { Button } from '@/components/common/Button';

// Primary button
<Button variant="primary" size="md">
  Get Started
</Button>

// With icon
<Button variant="secondary" icon={<ArrowRight />} iconPosition="right">
  Learn More
</Button>

// Loading state
<Button variant="primary" loading>
  Processing...
</Button>

// Full width
<Button variant="primary" fullWidth>
  Submit
</Button>
```

**Variants:**
| Variant | Description |
|---------|-------------|
| `primary` | Blue background, white text |
| `secondary` | Gray background, dark text |
| `outline` | Transparent with border |
| `ghost` | Transparent, no border |
| `danger` | Red background for destructive actions |

---

### Card

Container component for content cards.

**Location:** `src/components/common/Card.tsx`

**Props:**
```typescript
interface CardProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}
```

**Usage:**
```tsx
import { Card } from '@/components/common/Card';

<Card padding="lg" shadow="md" hover>
  <h3>Card Title</h3>
  <p>Card content goes here...</p>
</Card>

// Clickable card
<Card onClick={() => navigate('/course/1')} hover>
  <CoursePreview />
</Card>
```

---

### Modal

Accessible modal dialog component.

**Location:** `src/components/common/Modal.tsx`

**Props:**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  children: React.ReactNode;
}
```

**Usage:**
```tsx
import { Modal } from '@/components/common/Modal';

const [isOpen, setIsOpen] = useState(false);

<Modal 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="md"
>
  <p>Are you sure you want to proceed?</p>
  <div className="flex gap-4 mt-4">
    <Button onClick={() => setIsOpen(false)}>Cancel</Button>
    <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
  </div>
</Modal>
```

**Accessibility:**
- Focus trap within modal
- Escape key closes modal
- Body scroll locked when open
- ARIA attributes included

---

### Badge

Small label component for status or categories.

**Location:** `src/components/common/Badge.tsx`

**Props:**
```typescript
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}
```

**Usage:**
```tsx
import { Badge } from '@/components/common/Badge';

<Badge variant="success">Published</Badge>
<Badge variant="warning">Draft</Badge>
<Badge variant="info" size="sm">New</Badge>
```

---

### Avatar

User avatar component with fallback.

**Location:** `src/components/common/Avatar.tsx`

**Props:**
```typescript
interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;  // Initials or icon
}
```

**Usage:**
```tsx
import { Avatar } from '@/components/common/Avatar';

// With image
<Avatar 
  src="https://example.com/avatar.jpg" 
  alt="John Doe" 
  size="md" 
/>

// With fallback initials
<Avatar 
  alt="John Doe" 
  fallback="JD" 
  size="lg" 
/>
```

---

## Course Components

### CourseCard

Card component for displaying course preview.

**Location:** `src/components/features/courses/CourseCard.tsx`

**Props:**
```typescript
interface CourseCardProps {
  course: Course;
  variant?: 'default' | 'compact' | 'horizontal';
  onEnroll?: (courseId: string) => void;
  showPrice?: boolean;
  className?: string;
}
```

**Usage:**
```tsx
import { CourseCard } from '@/components/features/courses/CourseCard';

// Default card
<CourseCard 
  course={course} 
  onEnroll={handleEnroll} 
/>

// Compact variant (for grids)
<CourseCard 
  course={course} 
  variant="compact" 
/>

// Horizontal (for lists)
<CourseCard 
  course={course} 
  variant="horizontal" 
/>
```

**Course Type:**
```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  price?: number;
  pricing_model: 'free' | 'one_time' | 'subscription';
  is_published: boolean;
}
```

---

### CourseGrid

Grid layout for displaying multiple courses.

**Location:** `src/components/features/courses/CourseGrid.tsx`

**Props:**
```typescript
interface CourseGridProps {
  courses: Course[];
  loading?: boolean;
  emptyMessage?: string;
  onCourseClick?: (courseId: string) => void;
  columns?: 2 | 3 | 4;
}
```

**Usage:**
```tsx
import { CourseGrid } from '@/components/features/courses/CourseGrid';

<CourseGrid 
  courses={courses} 
  loading={isLoading}
  emptyMessage="No courses found"
  onCourseClick={(id) => navigate(`/education/${id}`)}
  columns={3}
/>
```

---

### CourseFilters

Filter controls for course catalog.

**Location:** `src/components/features/courses/CourseFilters.tsx`

**Props:**
```typescript
interface CourseFiltersProps {
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  pricingFilter: 'all' | 'free' | 'paid';
  onPricingChange: (pricing: 'all' | 'free' | 'paid') => void;
  sortBy: 'newest' | 'popular' | 'price-low' | 'price-high';
  onSortChange: (sort: string) => void;
}
```

**Usage:**
```tsx
import { CourseFilters } from '@/components/features/courses/CourseFilters';

<CourseFilters
  categories={['AI', 'Automation', 'Marketing']}
  selectedCategory={category}
  onCategoryChange={setCategory}
  pricingFilter={pricing}
  onPricingChange={setPricing}
  sortBy={sort}
  onSortChange={setSort}
/>
```

---

### ContentViewer

Component for displaying course content (video, text, PDF).

**Location:** `src/components/features/courses/ContentViewer.tsx`

**Props:**
```typescript
interface ContentViewerProps {
  content: CourseContent;
  onComplete?: () => void;
}

interface CourseContent {
  id: string;
  title: string;
  content_type: 'video' | 'text' | 'pdf' | 'quiz';
  content_url?: string;
  text_content?: string;
}
```

**Usage:**
```tsx
import { ContentViewer } from '@/components/features/courses/ContentViewer';

<ContentViewer 
  content={currentContent}
  onComplete={handleContentComplete}
/>
```

---

## Payment Components

### PaymentModal

Modal for handling course purchases.

**Location:** `src/components/features/payments/PaymentModal.tsx`

**Props:**
```typescript
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  onSuccess: () => void;
}
```

**Usage:**
```tsx
import { PaymentModal } from '@/components/features/payments/PaymentModal';

<PaymentModal
  isOpen={showPayment}
  onClose={() => setShowPayment(false)}
  course={selectedCourse}
  onSuccess={handlePurchaseSuccess}
/>
```

---

### PricingBadge

Displays course pricing information.

**Location:** `src/components/features/payments/PricingBadge.tsx`

**Props:**
```typescript
interface PricingBadgeProps {
  price?: number;
  pricingModel: 'free' | 'one_time' | 'subscription';
  size?: 'sm' | 'md' | 'lg';
}
```

**Usage:**
```tsx
import { PricingBadge } from '@/components/features/payments/PricingBadge';

// Free course
<PricingBadge pricingModel="free" />

// One-time purchase
<PricingBadge price={99.99} pricingModel="one_time" size="lg" />

// Subscription
<PricingBadge price={19.99} pricingModel="subscription" />
```

**Display:**
- Free: "Free"
- One-time: "$99.99"
- Subscription: "$19.99/mo"

---

## Landing Page Components

### LinkButton

Styled button for landing page links.

**Location:** `src/components/features/landing/LinkButton.tsx`

**Props:**
```typescript
interface LinkButtonProps {
  title: string;
  url: string;
  icon?: string;
  theme?: LandingPageTheme;
}
```

**Usage:**
```tsx
import { LinkButton } from '@/components/features/landing/LinkButton';

<LinkButton
  title="Instagram"
  url="https://instagram.com/..."
  icon="/icons/instagram.svg"
/>
```

---

### VideoEmbed

YouTube video embed component.

**Location:** `src/components/features/landing/VideoEmbed.tsx`

**Props:**
```typescript
interface VideoEmbedProps {
  url: string;
  title?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1';
}
```

**Usage:**
```tsx
import { VideoEmbed } from '@/components/features/landing/VideoEmbed';

<VideoEmbed
  url="https://www.youtube.com/embed/VIDEO_ID"
  title="Introduction Video"
  aspectRatio="16:9"
/>
```

---

### ProfileHeader

Header section for landing page with avatar and bio.

**Location:** `src/components/features/landing/ProfileHeader.tsx`

**Props:**
```typescript
interface ProfileHeaderProps {
  title: string;
  description?: string;
  logoUrl?: string;
  theme?: LandingPageTheme;
}
```

**Usage:**
```tsx
import { ProfileHeader } from '@/components/features/landing/ProfileHeader';

<ProfileHeader
  title="Gasweb"
  description="AI Automation for Small Business"
  logoUrl="/logo.png"
/>
```

---

## Form Components

### Input

Text input component with label and validation.

**Location:** `src/components/common/Input.tsx`

**Props:**
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
```

**Usage:**
```tsx
import { Input } from '@/components/common/Input';

<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  placeholder="you@example.com"
/>

// With icon
<Input
  label="Search"
  leftIcon={<SearchIcon />}
  placeholder="Search courses..."
/>
```

---

### TextArea

Multi-line text input component.

**Location:** `src/components/common/TextArea.tsx`

**Props:**
```typescript
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  maxLength?: number;
  showCount?: boolean;
}
```

**Usage:**
```tsx
import { TextArea } from '@/components/common/TextArea';

<TextArea
  label="Description"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  rows={4}
  maxLength={500}
  showCount
/>
```

---

### Select

Dropdown select component.

**Location:** `src/components/common/Select.tsx`

**Props:**
```typescript
interface SelectProps {
  label?: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}
```

**Usage:**
```tsx
import { Select } from '@/components/common/Select';

<Select
  label="Category"
  options={[
    { value: 'ai', label: 'AI & Machine Learning' },
    { value: 'automation', label: 'Automation' },
    { value: 'marketing', label: 'Marketing' },
  ]}
  value={category}
  onChange={setCategory}
  placeholder="Select a category"
/>
```

---

## Feedback Components

### Toast

Toast notification component.

**Location:** `src/components/common/Toast.tsx`

**Usage via Hook:**
```tsx
import { useToast } from '@/hooks/useToast';

const { toast } = useToast();

// Success toast
toast.success('Course enrolled successfully!');

// Error toast
toast.error('Payment failed. Please try again.');

// Info toast
toast.info('New content available!');

// Warning toast
toast.warning('Your session will expire soon.');
```

---

### LoadingSpinner

Loading indicator component.

**Location:** `src/components/common/LoadingSpinner.tsx`

**Props:**
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}
```

**Usage:**
```tsx
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// In button
<Button disabled={loading}>
  {loading ? <LoadingSpinner size="sm" color="white" /> : 'Submit'}
</Button>

// Full page loader
<div className="flex justify-center items-center min-h-screen">
  <LoadingSpinner size="lg" />
</div>
```

---

### EmptyState

Component for empty/no-data states.

**Location:** `src/components/common/EmptyState.tsx`

**Props:**
```typescript
interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

**Usage:**
```tsx
import { EmptyState } from '@/components/common/EmptyState';

<EmptyState
  title="No courses found"
  description="Try adjusting your filters or search terms."
  icon={<BookIcon />}
  action={{
    label: 'Clear Filters',
    onClick: clearFilters,
  }}
/>
```

---

### ErrorMessage

Error display component.

**Location:** `src/components/common/ErrorMessage.tsx`

**Props:**
```typescript
interface ErrorMessageProps {
  title?: string;
  message: string;
  retry?: () => void;
}
```

**Usage:**
```tsx
import { ErrorMessage } from '@/components/common/ErrorMessage';

{error && (
  <ErrorMessage
    title="Failed to load courses"
    message={error.message}
    retry={refetch}
  />
)}
```

---

## Component Best Practices

### Composition Pattern

```tsx
// Prefer composition over complex props
<Card>
  <Card.Header>
    <Card.Title>Course Title</Card.Title>
  </Card.Header>
  <Card.Body>
    <p>Course description...</p>
  </Card.Body>
  <Card.Footer>
    <Button>Enroll</Button>
  </Card.Footer>
</Card>
```

### Controlled vs Uncontrolled

```tsx
// Controlled - parent manages state
<Input value={value} onChange={(e) => setValue(e.target.value)} />

// Uncontrolled - component manages own state
<Input defaultValue="Initial" ref={inputRef} />
```

### Accessibility

All components should:
- Include proper ARIA attributes
- Support keyboard navigation
- Have sufficient color contrast
- Provide visible focus indicators

---

For component development guidelines, see [DEVELOPMENT.md](./DEVELOPMENT.md).

