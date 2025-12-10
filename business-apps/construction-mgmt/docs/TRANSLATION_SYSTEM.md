# Construction Management Translation System

Comprehensive guide for the real-time translation system enabling multilingual team communication.

## Overview

The translation system provides:
- **Real-time message translation** - Instant translation of chat messages
- **Automatic language detection** - Identifies source language
- **User language preferences** - Each user sees messages in their language
- **Translation caching** - Reduces API costs and latency
- **Multi-provider support** - Google Cloud Translation or DeepL

## How It Works

### Message Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Message Translation Flow                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User A (Spanish)                      User B (English)         │
│       │                                       │                  │
│       ▼                                       │                  │
│  "Necesitamos más                             │                  │
│   materiales"                                 │                  │
│       │                                       │                  │
│       ▼                                       │                  │
│  ┌─────────────────┐                         │                  │
│  │  Store Message  │                         │                  │
│  │  (Original: ES) │                         │                  │
│  └────────┬────────┘                         │                  │
│           │                                  │                  │
│           ▼                                  │                  │
│  ┌─────────────────┐    ┌──────────────┐    │                  │
│  │ Detect Language │───▶│  Cache Check │    │                  │
│  └─────────────────┘    └──────┬───────┘    │                  │
│                                │             │                  │
│              ┌─────────────────┴─────────────┐                  │
│              │                               │                  │
│       (Cache HIT)                     (Cache MISS)              │
│              │                               │                  │
│              ▼                               ▼                  │
│       Return cached              ┌─────────────────┐            │
│       translation                │ Translation API │            │
│              │                   │ (Google/DeepL)  │            │
│              │                   └────────┬────────┘            │
│              │                            │                     │
│              │                            ▼                     │
│              │                   ┌─────────────────┐            │
│              │                   │ Cache Translation│            │
│              │                   └────────┬────────┘            │
│              │                            │                     │
│              └────────────┬───────────────┘                     │
│                           │                                     │
│                           ▼                                     │
│  User A sees:        "Necesitamos más materiales"               │
│  User B sees:        "We need more materials"                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Configuration

### Translation Service Settings

```typescript
// src/config/translation.ts

export const translationConfig = {
  // Primary service
  service: process.env.TRANSLATION_SERVICE || 'google', // 'google' | 'deepl'
  
  // Fallback service if primary fails
  fallbackService: 'deepl',
  
  // Default language for new users
  defaultLanguage: 'en',
  
  // Auto-detect source language
  autoDetect: true,
  
  // Cache settings
  cache: {
    enabled: true,
    ttl: 86400, // 24 hours in seconds
    maxSize: 10000, // Maximum cached translations
  },
  
  // Rate limiting
  rateLimit: {
    requestsPerMinute: 100,
    charactersPerDay: 500000,
  },
};
```

### User Language Preferences

```typescript
// Set user's preferred language
const setUserLanguage = async (userId: string, language: string) => {
  await supabase
    .from('user_profiles')
    .update({ preferred_language: language })
    .eq('id', userId);
};

// Get user's preferred language
const getUserLanguage = async (userId: string): Promise<string> => {
  const { data } = await supabase
    .from('user_profiles')
    .select('preferred_language')
    .eq('id', userId)
    .single();
  
  return data?.preferred_language || 'en';
};
```

## Language Detection

### Automatic Detection

```typescript
import { detectLanguage } from './services/translation';

const result = await detectLanguage('Hola, ¿cómo estás?');
// { language: 'es', confidence: 0.98 }

const result2 = await detectLanguage('Hello, how are you?');
// { language: 'en', confidence: 0.99 }
```

### Mixed Language Handling

When text contains multiple languages:

```typescript
const mixedText = 'The proyecto needs más materiales';
const result = await detectLanguage(mixedText);
// Returns dominant language: { language: 'en', confidence: 0.65 }
```

## Translation Functions

### Basic Translation

```typescript
import { translateText } from './services/translation';

// Simple translation
const translated = await translateText('Hello world', 'es');
// "Hola mundo"

// With source language specified
const translated2 = await translateText('Hello', 'es', 'en');
// "Hola"
```

### Batch Translation

For multiple messages:

```typescript
import { translateBatch } from './services/translation';

const messages = [
  'Hello team',
  'Meeting at 3pm',
  'Bring the blueprints',
];

const translated = await translateBatch(messages, 'es');
// ["Hola equipo", "Reunión a las 3pm", "Trae los planos"]
```

### Message Translation with Context

```typescript
interface TranslatedMessage {
  id: string;
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  timestamp: Date;
}

const translateMessage = async (
  message: Message,
  targetLanguage: string
): Promise<TranslatedMessage> => {
  // Check cache first
  const cached = await getFromCache(message.id, targetLanguage);
  if (cached) return cached;
  
  // Detect source language
  const { language: sourceLanguage } = await detectLanguage(message.text);
  
  // Skip if already in target language
  if (sourceLanguage === targetLanguage) {
    return {
      id: message.id,
      originalText: message.text,
      translatedText: message.text,
      sourceLanguage,
      targetLanguage,
      timestamp: new Date(),
    };
  }
  
  // Translate
  const translatedText = await translateText(
    message.text,
    targetLanguage,
    sourceLanguage
  );
  
  // Cache result
  await cacheTranslation(message.id, targetLanguage, translatedText);
  
  return {
    id: message.id,
    originalText: message.text,
    translatedText,
    sourceLanguage,
    targetLanguage,
    timestamp: new Date(),
  };
};
```

## Caching System

### Cache Structure

```typescript
// Database table: message_translations
interface CachedTranslation {
  id: string;
  message_id: string;
  original_text: string;
  translated_text: string;
  source_language: string;
  target_language: string;
  created_at: Date;
  accessed_at: Date;
}
```

### Cache Operations

```typescript
// Check cache
const getFromCache = async (
  messageId: string,
  targetLanguage: string
): Promise<string | null> => {
  const { data } = await supabase
    .from('message_translations')
    .select('translated_text')
    .eq('message_id', messageId)
    .eq('target_language', targetLanguage)
    .single();
  
  if (data) {
    // Update accessed_at for LRU tracking
    await supabase
      .from('message_translations')
      .update({ accessed_at: new Date().toISOString() })
      .eq('message_id', messageId)
      .eq('target_language', targetLanguage);
    
    return data.translated_text;
  }
  
  return null;
};

// Save to cache
const cacheTranslation = async (
  messageId: string,
  targetLanguage: string,
  translatedText: string,
  sourceLanguage: string
): Promise<void> => {
  await supabase
    .from('message_translations')
    .upsert({
      message_id: messageId,
      target_language: targetLanguage,
      translated_text: translatedText,
      source_language: sourceLanguage,
      accessed_at: new Date().toISOString(),
    });
};
```

### Cache Invalidation

```typescript
// Clear specific translation
const invalidateTranslation = async (messageId: string): Promise<void> => {
  await supabase
    .from('message_translations')
    .delete()
    .eq('message_id', messageId);
};

// Clear old cache entries (run periodically)
const cleanupCache = async (): Promise<void> => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 7); // 7 days
  
  await supabase
    .from('message_translations')
    .delete()
    .lt('accessed_at', cutoffDate.toISOString());
};
```

## Real-Time Translation

### WebSocket Integration

```typescript
// Subscribe to new messages
const subscribeToMessages = (projectId: string, userId: string) => {
  const userLanguage = await getUserLanguage(userId);
  
  const channel = supabase
    .channel(`project:${projectId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `project_id=eq.${projectId}`,
      },
      async (payload) => {
        const message = payload.new;
        
        // Translate if needed
        const translated = await translateMessage(message, userLanguage);
        
        // Emit translated message to client
        emitToUser(userId, 'new_message', translated);
      }
    )
    .subscribe();
  
  return channel;
};
```

### Frontend Display

```typescript
// React component
const MessageBubble: React.FC<{ message: TranslatedMessage }> = ({ message }) => {
  const [showOriginal, setShowOriginal] = useState(false);
  
  return (
    <div className="message-bubble">
      <p className="message-text">
        {showOriginal ? message.originalText : message.translatedText}
      </p>
      
      {message.sourceLanguage !== message.targetLanguage && (
        <button
          className="toggle-language"
          onClick={() => setShowOriginal(!showOriginal)}
        >
          {showOriginal ? 'Show translated' : 'Show original'}
          <span className="language-badge">
            {showOriginal ? message.sourceLanguage : message.targetLanguage}
          </span>
        </button>
      )}
    </div>
  );
};
```

## User Interface

### Language Selection

```typescript
// Language dropdown component
const LanguageSelector: React.FC = () => {
  const [language, setLanguage] = useState('en');
  const { updatePreference } = useUserPreferences();
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'tl', name: 'Tagalog', flag: '🇵🇭' },
  ];
  
  const handleChange = async (code: string) => {
    setLanguage(code);
    await updatePreference('language', code);
  };
  
  return (
    <select value={language} onChange={(e) => handleChange(e.target.value)}>
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.name}
        </option>
      ))}
    </select>
  );
};
```

### Message Display Toggle

```
┌──────────────────────────────────────────────┐
│  Carlos (ES → EN)                            │
│  ┌────────────────────────────────────────┐  │
│  │ We need more concrete for section B.  │  │
│  │ Can you order 20 more bags?            │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  [🇪🇸 View Original]                        │
│                                              │
│  ─────────────────────────────────────────  │
│                                              │
│  John (EN)                                   │
│  ┌────────────────────────────────────────┐  │
│  │ Got it, I'll order them now.           │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

## Best Practices

### 1. Construction-Specific Terminology

Create a glossary for accurate translation:

```typescript
const constructionGlossary = {
  'rebar': { es: 'varilla de refuerzo', pt: 'vergalhão' },
  'drywall': { es: 'tablaroca', pt: 'drywall' },
  'concrete': { es: 'concreto', pt: 'concreto' },
  'blueprints': { es: 'planos', pt: 'plantas' },
  'foreman': { es: 'capataz', pt: 'encarregado' },
};

// Apply glossary substitution before/after translation
const translateWithGlossary = async (
  text: string,
  targetLanguage: string
): Promise<string> => {
  // Replace terms with placeholders
  let processedText = text;
  const replacements: Map<string, string> = new Map();
  
  Object.entries(constructionGlossary).forEach(([term, translations]) => {
    const regex = new RegExp(term, 'gi');
    if (regex.test(processedText)) {
      const placeholder = `__TERM_${term.toUpperCase()}__`;
      processedText = processedText.replace(regex, placeholder);
      replacements.set(placeholder, translations[targetLanguage] || term);
    }
  });
  
  // Translate
  let translated = await translateText(processedText, targetLanguage);
  
  // Replace placeholders with correct terms
  replacements.forEach((replacement, placeholder) => {
    translated = translated.replace(placeholder, replacement);
  });
  
  return translated;
};
```

### 2. Handle Translation Failures

```typescript
const safeTranslate = async (
  text: string,
  targetLanguage: string
): Promise<{ text: string; isOriginal: boolean }> => {
  try {
    const translated = await translateText(text, targetLanguage);
    return { text: translated, isOriginal: false };
  } catch (error) {
    console.error('Translation failed:', error);
    // Return original text if translation fails
    return { text, isOriginal: true };
  }
};
```

### 3. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const translationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many translation requests. Please try again later.',
});

app.use('/api/translation', translationLimiter);
```

### 4. Monitor Usage

```typescript
// Track translation usage
const trackTranslation = async (
  userId: string,
  charactersTranslated: number
): Promise<void> => {
  await supabase.from('translation_usage').insert({
    user_id: userId,
    characters: charactersTranslated,
    timestamp: new Date().toISOString(),
  });
};

// Get daily usage
const getDailyUsage = async (): Promise<number> => {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('translation_usage')
    .select('characters')
    .gte('timestamp', `${today}T00:00:00`)
    .lt('timestamp', `${today}T23:59:59`);
  
  return data?.reduce((sum, row) => sum + row.characters, 0) || 0;
};
```

## Troubleshooting

### Common Issues

**"Translation returns original text"**
- Check API credentials
- Verify language codes
- Check API quotas

**"Slow translation response"**
- Enable caching
- Use batch translation for multiple messages
- Check network latency

**"Incorrect translations"**
- Use glossary for technical terms
- Provide more context
- Report to translation service

---

## Related Documentation

- [Setup Guide](./SETUP_GUIDE.md)
- [API Reference](./API_REFERENCE.md)
- [User Manual](./USER_MANUAL.md)

