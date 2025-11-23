# GEMODIDA - Development Guidelines & Patterns

## Code Quality Standards

### TypeScript & Type Safety
- **Strict Mode**: Always enabled in tsconfig.json
- **Type Annotations**: Explicit types for function parameters and return values
- **Interfaces**: Define interfaces for component props and data structures
- **Generics**: Use generics for reusable components and utilities
- **No `any` Type**: Avoid `any` type; use `unknown` with type guards when necessary

Example from codebase:
```typescript
interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'user_action' | 'navigation' | 'api';
  message: string;
  source: string;
  details?: any;
}
```

### Component Structure
- **Use 'use client' Directive**: Client components must have `'use client'` at the top
- **Functional Components**: Always use functional components with hooks
- **Props Interface**: Define explicit interface for component props
- **Destructuring**: Destructure props in function signature
- **Default Values**: Use default parameters for optional props

Example pattern:
```typescript
'use client';

interface ComponentProps {
  id?: number;
  onSuccess?: () => void;
  defaultValues?: Partial<FormValues>;
}

export function MyComponent({ id, onSuccess, defaultValues }: ComponentProps) {
  // Component logic
}
```

### Naming Conventions
- **Components**: PascalCase (e.g., `AuthForm`, `KeywordForm`)
- **Functions**: camelCase (e.g., `handleSubmit`, `checkEmailExists`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `LOG_LIMIT`, `TOAST_REMOVE_DELAY`)
- **Interfaces**: PascalCase with `Props` suffix for component props (e.g., `KeywordFormProps`)
- **Files**: Match component name (e.g., `AuthForm.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useKeywords`, `useAuth`)

### Code Organization
- **Imports First**: All imports at the top of file
- **Type Definitions**: Interfaces and types after imports
- **Component Declaration**: Main component export
- **Helper Functions**: Internal functions below component
- **Exports**: Named exports for components and utilities

## Semantic Patterns & Architectural Approaches

### 1. Custom Hooks Pattern
Used extensively for data fetching and state management.

**Pattern**: Encapsulate business logic in custom hooks
```typescript
// useKeywords.ts
export function useKeywords() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  
  const addKeyword = async (palabra: string, descripcion?: string) => {
    // Implementation
  };
  
  const updateKeyword = async (id: number, data: Partial<Keyword>) => {
    // Implementation
  };
  
  return { keywords, addKeyword, updateKeyword };
}
```

**Usage**: Components consume hooks for data operations
```typescript
const { keywords, addKeyword, updateKeyword } = useKeywords();
```

**Frequency**: Used in 100% of data-driven components

### 2. Form Validation Pattern
Uses React Hook Form + Zod for type-safe validation.

**Pattern**: Define schema first, then form
```typescript
const keywordSchema = z.object({
  palabra: z.string().min(2, 'Mensaje de error'),
  descripcion: z.string().optional(),
});

type KeywordFormValues = z.infer<typeof keywordSchema>;

const { register, handleSubmit, formState: { errors } } = useForm<KeywordFormValues>({
  resolver: zodResolver(keywordSchema),
  defaultValues: { palabra: '', descripcion: '' },
});
```

**Benefits**: Type-safe, automatic validation, error messages
**Frequency**: Used in all form components

### 3. Supabase Integration Pattern
Consistent pattern for database operations.

**Pattern**: Use singleton client instance
```typescript
import { getSupabaseClient } from '@/lib/supabase/singleton';

const supabaseRef = useRef(getSupabaseClient());

// Use in operations
const { data, error } = await supabaseRef.current
  .from('table_name')
  .select('*')
  .eq('column', value);
```

**Key Points**:
- Use `useRef` to maintain single instance
- Always check for errors
- Handle edge cases (e.g., `maybeSingle()` for optional results)
- Use RPC functions for complex operations

**Frequency**: Used in all data-fetching hooks

### 4. Error Handling Pattern
Multi-level error handling with user feedback.

**Pattern**: Try-catch with specific error messages
```typescript
try {
  // Operation
} catch (error: any) {
  const message = error.error_description || error.message;
  showToast({
    title: 'Error',
    description: message,
    variant: 'destructive',
  });
} finally {
  setLoading(false);
}
```

**Toast System**: Custom toast component for notifications
```typescript
const showToast = (toast: Omit<ToastType, 'id'>) => {
  const id = Math.random().toString(36).substr(2, 9);
  setToasts((prev) => [...prev, { ...toast, id }]);
};
```

### 5. State Management Pattern
Combination of useState and useRef for performance.

**Pattern**: Use refs for internal state, useState for UI updates
```typescript
const logsRef = useRef<LogEntry[]>([]);
const [logs, setLogs] = useState<LogEntry[]>([]);

// Update ref immediately
logsRef.current.push(logEntry);

// Sync to state periodically
useEffect(() => {
  const interval = setInterval(() => {
    setLogs([...logsRef.current]);
  }, 500);
  return () => clearInterval(interval);
}, []);
```

**Benefits**: Prevents unnecessary re-renders, maintains performance

### 6. Async Validation Pattern
Real-time validation with debouncing.

**Pattern**: Check availability on blur
```typescript
const checkEmailExists = async () => {
  if (!email.trim()) return;
  setCheckingEmail(true);
  try {
    const { data } = await supabaseRef.current
      .from('usuarios')
      .select('correo')
      .eq('correo', email.trim().toLowerCase())
      .maybeSingle();
    setEmailExists(!!data);
  } finally {
    setCheckingEmail(false);
  }
};

// In input
<Input
  onBlur={checkEmailExists}
  // ...
/>
```

### 7. Monitoring & Logging Pattern
Lightweight diagnostic system for debugging.

**Pattern**: Event-based logging with memory limits
```typescript
const addLog = (level: LogLevel, message: string, source: string, details?: any) => {
  const logEntry: LogEntry = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    level,
    message,
    source,
    details: sanitizeDetails(details),
  };
  
  logsRef.current.push(logEntry);
  if (logsRef.current.length > LOG_LIMIT) {
    logsRef.current = logsRef.current.slice(-LOG_LIMIT);
  }
};
```

**Key Features**:
- Memory-efficient (limited storage)
- Categorized logging (info, warn, error, user_action, api, navigation)
- Sanitized details to prevent memory leaks
- Export capability for debugging

### 8. Cleanup Pattern
Proper resource cleanup in useEffect.

**Pattern**: Store cleanup functions and execute on unmount
```typescript
const cleanupFunctions = useRef<(() => void)[]>([]);

useEffect(() => {
  // Setup
  const handler = () => { /* ... */ };
  window.addEventListener('event', handler);
  
  // Store cleanup
  cleanupFunctions.current.push(() => {
    window.removeEventListener('event', handler);
  });
  
  // Execute cleanup on unmount
  return () => {
    cleanupFunctions.current.forEach(fn => {
      try { fn(); } catch (e) { /* ignore */ }
    });
  };
}, []);
```

### 9. Conditional Rendering Pattern
Safe conditional rendering with proper typing.

**Pattern**: Use ternary operators and logical AND
```typescript
{isVisible && (
  <div className="...">
    {logs.length === 0 ? (
      <p>No logs</p>
    ) : (
      <div>{/* render logs */}</div>
    )}
  </div>
)}
```

### 10. API Route Pattern
Modular API endpoints with error handling.

**Pattern**: Organize by feature
```
/api/
├── scraping/
│   ├── simulate/route.ts
│   └── status/route.ts
├── reports/
│   └── generate/route.ts
└── notifications/
    └── send/route.ts
```

## Textual Standards

### Documentation
- **Comments**: Explain "why", not "what"
- **JSDoc**: Use for public functions and components
- **Inline Comments**: Minimal; code should be self-documenting
- **Spanish Comments**: Used in diagnostic and utility code
- **English Comments**: Used in core business logic

### Commit Messages
- **Format**: `[Type] Description`
- **Types**: feat, fix, refactor, docs, test, chore
- **Example**: `[feat] Add keyword validation with Zod`

### File Organization
- **One Component Per File**: Each component in its own file
- **Index Files**: Use for barrel exports
- **Utility Files**: Group related utilities together

## Practices Followed Throughout Codebase

### 1. Security
- **Input Validation**: All user inputs validated with Zod
- **Email Validation**: Regex pattern for email format
- **Password Requirements**: Minimum 6 characters enforced
- **RLS Policies**: Row-level security in database
- **Service Role Key**: Used only on server-side

### 2. Performance
- **Memory Management**: Logs limited to prevent memory leaks
- **Debouncing**: Async validation on blur, not on every keystroke
- **Lazy Loading**: Components loaded on demand
- **Memoization**: Use React.memo for expensive components
- **Circuit Breaker**: Implemented for API calls

### 3. Accessibility
- **ARIA Labels**: Used on interactive elements
- **Semantic HTML**: Proper heading hierarchy
- **Keyboard Navigation**: All interactive elements keyboard accessible
- **Color Contrast**: Maintained for readability
- **Form Labels**: Associated with inputs via htmlFor

### 4. Error Handling
- **User-Friendly Messages**: Errors translated to Spanish
- **Specific Error Types**: Different handling for different errors
- **Fallback Strategies**: Multiple approaches for critical operations
- **Logging**: All errors logged for debugging
- **Graceful Degradation**: App continues functioning on non-critical errors

### 5. Testing
- **Manual Testing Scripts**: Located in temp-tests/
- **Connection Tests**: Verify Supabase connectivity
- **Auth Tests**: Test authentication flows
- **Database Tests**: Verify schema and functions

## Common Code Idioms

### 1. Unique ID Generation
```typescript
const id = Math.random().toString(36).substr(2, 9);
```

### 2. Safe JSON Serialization
```typescript
try {
  const str = JSON.stringify(details);
  return str.length > LIMIT ? str.substring(0, LIMIT) + '...' : str;
} catch {
  return '[Unserializable]';
}
```

### 3. Element Description Extraction
```typescript
const getElementDescription = (element: HTMLElement): string => {
  if (element.tagName === 'BUTTON') return element.textContent?.trim() || 'Button';
  if (element.tagName === 'A') return element.textContent?.trim() || 'Link';
  return element.tagName;
};
```

### 4. Timestamp Formatting
```typescript
const timestamp = new Date()
  .toISOString()
  .replace(/:/g, '-')
  .replace(/\..+/, '')
  .replace('T', '-');
```

### 5. Ref-based State Sync
```typescript
const [state, setState] = useState(initialValue);
const stateRef = useRef(initialValue);

// Update ref immediately
stateRef.current = newValue;

// Sync to state periodically
useEffect(() => {
  const interval = setInterval(() => {
    setState(stateRef.current);
  }, 500);
  return () => clearInterval(interval);
}, []);
```

## Popular Annotations & Decorators

### TypeScript Annotations
- **Type Annotations**: `const value: string = 'text'`
- **Function Return Types**: `function getValue(): string { }`
- **Generic Types**: `const items: Array<Item> = []`
- **Union Types**: `type Status = 'pending' | 'success' | 'error'`
- **Optional Properties**: `interface Props { id?: number }`

### React Patterns
- **'use client'**: Marks client components
- **'use server'**: Marks server functions (not used in this codebase)
- **React.useId()**: Generate unique IDs for form elements
- **React.useRef()**: Maintain mutable references
- **React.useEffect()**: Side effects and cleanup

## Best Practices Summary

1. **Always validate user input** with Zod schemas
2. **Use custom hooks** for data fetching and state management
3. **Implement proper error handling** with user-friendly messages
4. **Clean up resources** in useEffect cleanup functions
5. **Use TypeScript strictly** for type safety
6. **Organize code by feature** not by type
7. **Keep components small** and focused
8. **Use composition** over inheritance
9. **Implement accessibility** from the start
10. **Test critical flows** manually before deployment

## Performance Optimization Checklist

- [ ] Limit state updates with refs when appropriate
- [ ] Use debouncing for async validation
- [ ] Implement memory limits for logs and caches
- [ ] Lazy load components and routes
- [ ] Optimize database queries with proper indexes
- [ ] Use RLS policies for data filtering
- [ ] Implement pagination for large datasets
- [ ] Cache frequently accessed data
- [ ] Monitor performance with diagnostic tools
- [ ] Profile components with React DevTools

## Security Checklist

- [ ] Validate all user inputs
- [ ] Use environment variables for secrets
- [ ] Implement RLS policies in database
- [ ] Use service role key only on server
- [ ] Sanitize user-generated content
- [ ] Implement rate limiting on API routes
- [ ] Use HTTPS in production
- [ ] Implement CSRF protection
- [ ] Validate email format strictly
- [ ] Enforce strong password requirements
