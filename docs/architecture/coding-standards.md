# AstroDating Coding Standards

**Version:** 1.0  
**Date:** October 22, 2025  
**Source:** Extracted from Architecture Document  

---

## Critical Fullstack Rules

These are MINIMAL but CRITICAL coding standards specific to AstroDating. These rules prevent common mistakes and ensure consistency across the fullstack application.

### 1. Type Sharing - Always define types in shared location and import

❌ **BAD:** Duplicate type definitions in backend and mobile  
✅ **GOOD:** Define types in backend models, export, import in mobile services

**Rationale:** Prevents API contract drift; changes to User model automatically propagate to mobile

```typescript
// backend/models/User.js - Export TypeScript types
/**
 * @typedef {Object} UserProfile
 * @property {string} _id
 * @property {string} email
 * @property {string} firstName
 */

// mobile/src/types/user.ts - Import from backend
export interface UserProfile {
  _id: string;
  email: string;
  firstName: string;
  // ... matches backend exactly
}
```

---

### 2. API Calls - Never make direct HTTP calls; always use service layer

❌ **BAD:** `axios.get('/api/users/me')` in component  
✅ **GOOD:** `userService.getCurrentUser()` in component

**Rationale:** Centralized error handling, mocking for tests, consistent token injection

```typescript
// ❌ BAD - Direct API call in component
const ExploreScreen = () => {
  const fetchProfiles = async () => {
    const response = await axios.get('/api/browse'); // Direct call
    setProfiles(response.data.profiles);
  };
};

// ✅ GOOD - Service layer abstraction
const ExploreScreen = () => {
  const fetchProfiles = async () => {
    const data = await browseService.getBrowseProfiles(); // Service method
    setProfiles(data.profiles);
  };
};
```

---

### 3. Environment Variables - Access only through config objects, never process.env directly

❌ **BAD:** `const apiUrl = process.env.API_URL` scattered throughout code  
✅ **GOOD:** `import { API_URL } from '../constants/api'`

**Rationale:** Single source of truth; easy to change; type-safe in TypeScript

```javascript
// backend/src/config/index.js - Centralized config
module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  }
};

// Usage in code
const config = require('../config');
console.log(`Server running on port ${config.port}`);
```

---

### 4. Error Handling - All API routes must use standard error handler

❌ **BAD:** `res.status(500).json({ error: 'Something went wrong' })`  
✅ **GOOD:** `next(error)` and let error middleware handle formatting

**Rationale:** Consistent error format for mobile app parsing

```javascript
// ❌ BAD - Inconsistent error handling
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed' }); // Inconsistent format
  }
};

// ✅ GOOD - Use middleware
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    res.json(user);
  } catch (error) {
    next(error); // Error middleware formats consistently
  }
};
```

---

### 5. State Updates - Never mutate state directly; use proper state management patterns

❌ **BAD:** `user.firstName = 'John'; setUser(user)`  
✅ **GOOD:** `setUser({ ...user, firstName: 'John' })`

**Rationale:** React doesn't detect mutations; causes subtle bugs

```typescript
// ❌ BAD - Direct mutation
const updateName = (newName: string) => {
  user.firstName = newName; // Mutates object
  setUser(user); // React won't re-render
};

// ✅ GOOD - Immutable update
const updateName = (newName: string) => {
  setUser({ ...user, firstName: newName }); // New object
};
```

---

### 6. Async Operations - Always handle loading states and errors

❌ **BAD:** API call without loading indicator or error handling  
✅ **GOOD:** Show loading spinner, handle errors with user-friendly messages

**Rationale:** Better UX; users understand what's happening

```typescript
// ❌ BAD - No loading state
const fetchData = async () => {
  const data = await apiCall(); // User sees nothing while loading
  setData(data);
};

// ✅ GOOD - Loading and error states
const fetchData = async () => {
  setLoading(true);
  setError(null);
  try {
    const data = await apiCall();
    setData(data);
  } catch (err) {
    setError('Failed to load. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

---

### 7. Database Queries - Never write raw queries in controllers; use model methods

❌ **BAD:** `db.collection('users').find({ ... })` in controller  
✅ **GOOD:** `User.findBrowseableProfiles(currentUser)` in controller

**Rationale:** Reusable queries, easier testing, encapsulated logic

```javascript
// ❌ BAD - Raw query in controller
exports.browse = async (req, res) => {
  const profiles = await User.find({
    gender: req.user.seeking,
    is_verified: true,
    // ... complex query logic in controller
  });
  res.json(profiles);
};

// ✅ GOOD - Model method
exports.browse = async (req, res) => {
  const profiles = await User.findBrowseableProfiles(req.user);
  res.json(profiles);
};
```

---

### 8. Passwords - Never log, never return in API responses

❌ **BAD:** `console.log(user)` when user has password field  
✅ **GOOD:** Exclude password with `select: false` in schema

**Rationale:** Security; passwords must never be exposed

```javascript
// ✅ GOOD - Password excluded by default
const userSchema = new mongoose.Schema({
  email: String,
  password: {
    type: String,
    select: false // Never returned in queries by default
  }
});

// When password needed (login), explicitly request it
const user = await User.findOne({ email }).select('+password');
```

---

### 9. Validation - Server-side validation is mandatory; client-side is optional

❌ **BAD:** Only validate on mobile app (can be bypassed)  
✅ **GOOD:** Validate on both client (UX) and server (security)

**Rationale:** Client validation can be bypassed; server is source of truth

---

### 10. Token Storage - Never store JWT in AsyncStorage; always use SecureStore

❌ **BAD:** `AsyncStorage.setItem('token', jwt)` (unencrypted)  
✅ **GOOD:** `SecureStore.setItemAsync('authToken', jwt)` (encrypted)

**Rationale:** AsyncStorage is unencrypted; JWT must be secure

---

## Naming Conventions

| Element | Frontend (Mobile) | Backend (API) | Example |
|---------|------------------|---------------|---------|
| **Components** | PascalCase | - | `ProfileCard.tsx`, `CompatibilityBadge.tsx` |
| **Screens** | PascalCase + "Screen" | - | `ExploreScreen.tsx`, `ChatDetailScreen.tsx` |
| **Hooks** | camelCase with 'use' | - | `useAuth.ts`, `useApi.ts`, `usePoll.ts` |
| **Services** | camelCase + "Service" | camelCase + "Service" | `authService.ts`, `astrologyService.js` |
| **Utilities** | camelCase | camelCase | `validation.ts`, `dateUtils.js` |
| **Constants** | SCREAMING_SNAKE_CASE | SCREAMING_SNAKE_CASE | `MAX_PHOTOS`, `API_TIMEOUT` |
| **API Routes** | - | kebab-case | `/api/user-profile`, `/api/browse` |
| **Database Collections** | - | PascalCase | `User`, `UserCompatibility`, `Message` |
| **Database Fields** | - | camelCase (Mongoose) | `isVerified`, `createdAt`, `firstName` |
| **Environment Variables** | SCREAMING_SNAKE_CASE | SCREAMING_SNAKE_CASE | `API_URL`, `JWT_SECRET` |
| **Event Handlers** | handleEventName | - | `handleSubmit`, `handleSwipeRight` |
| **Boolean Variables** | is/has/can prefix | is/has/can prefix | `isLoading`, `hasProfile`, `canBrowse` |
| **Async Functions** | async prefix or suffix | async prefix or suffix | `fetchProfiles`, `loginAsync` |

---

## Code Organization Patterns

### File Structure Rules

1. **One component per file** (mobile)
   - Component and its styles in same file
   - Test file in `__tests__/` subdirectory

2. **One model per file** (backend)
   - Model definition, methods, and exports in single file
   - Test file in `tests/unit/models/`

3. **Group by feature, not by type** (mobile)
   - ✅ GOOD: `components/profile/CompatibilityBadge.tsx`
   - ❌ BAD: `components/CompatibilityBadge.tsx` (flat structure)

4. **Controllers are thin** (backend)
   - Validate input → call service → return response
   - No business logic in controllers
   - Complex logic goes in services

---

## Common Pitfalls to Avoid

### Backend Pitfalls

**1. N+1 Query Problem**

```javascript
// ❌ BAD - N+1 queries
const conversations = await Conversation.find({ participants: userId });
for (let conv of conversations) {
  conv.otherUser = await User.findById(conv.participants[1]); // N queries
}

// ✅ GOOD - Single query with population
const conversations = await Conversation.find({ participants: userId })
  .populate('participants', 'firstName age photos');
```

**2. Not using lean() for read-only queries**

```javascript
// ❌ BAD - Returns Mongoose documents (heavy)
const users = await User.find({ gender: 'male' });

// ✅ GOOD - Returns plain objects (fast)
const users = await User.find({ gender: 'male' }).lean();
```

**3. Forgetting to await async operations**

```javascript
// ❌ BAD - Doesn't wait for save
user.profilesBrowsedToday += 1;
user.save(); // Not awaited!
res.json({ success: true }); // Responds before save completes

// ✅ GOOD - Waits for save
user.profilesBrowsedToday += 1;
await user.save();
res.json({ success: true });
```

**4. Blocking the event loop with synchronous operations**

```javascript
// ❌ BAD - Blocks event loop
const hash = bcrypt.hashSync(password, 12);

// ✅ GOOD - Non-blocking
const hash = await bcrypt.hash(password, 12);
```

---

### Frontend (Mobile) Pitfalls

**1. Not cleaning up effects**

```typescript
// ❌ BAD - Polling continues after unmount
useEffect(() => {
  const interval = setInterval(pollMessages, 10000);
  // No cleanup!
}, []);

// ✅ GOOD - Cleanup on unmount
useEffect(() => {
  const interval = setInterval(pollMessages, 10000);
  return () => clearInterval(interval); // Cleanup
}, []);
```

**2. Infinite re-render loops**

```typescript
// ❌ BAD - Missing dependency causes stale closure
useEffect(() => {
  fetchData(userId); // userId from props/state
}, []); // Empty deps - won't update when userId changes

// ✅ GOOD - Correct dependencies
useEffect(() => {
  fetchData(userId);
}, [userId]); // Re-runs when userId changes
```

**3. Not memoizing expensive computations**

```typescript
// ❌ BAD - Recalculates on every render
const ExploreScreen = ({ profiles }) => {
  const sortedProfiles = profiles.sort((a, b) => 
    b.compatibility.totalScore - a.compatibility.totalScore
  ); // Runs every render!
};

// ✅ GOOD - Memoized
const ExploreScreen = ({ profiles }) => {
  const sortedProfiles = useMemo(() => 
    profiles.sort((a, b) => 
      b.compatibility.totalScore - a.compatibility.totalScore
    ),
    [profiles] // Only recalculates when profiles change
  );
};
```

**4. Large images without optimization**

```typescript
// ❌ BAD - Loading full-res images
<Image source={{ uri: profile.photos[0] }} />

// ✅ GOOD - Cloudinary transformation for thumbnail
<Image source={{ 
  uri: `${profile.photos[0]}?w=400&h=400&c_fill&f_auto&q_auto`
}} />
```

---

## TypeScript/JavaScript Specific

### TypeScript (Mobile)

**1. Always define prop interfaces**

```typescript
// ❌ BAD - No type safety
const ProfileCard = (props) => { ... }

// ✅ GOOD - Explicit interface
interface ProfileCardProps {
  profile: UserProfile;
  onPress: () => void;
}
const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onPress }) => { ... }
```

**2. Use enums for fixed sets of values**

```typescript
// ✅ GOOD - Type-safe enums
enum CompatibilityScore {
  NO_MATCH = 0,
  LOW_MATCH = 1,
  COMPATIBLE = 2,
  PERFECT_MATCH = 3
}
```

**3. Avoid `any` type**

```typescript
// ❌ BAD - Loses type safety
const fetchData = async (): Promise<any> => { ... }

// ✅ GOOD - Explicit return type
const fetchData = async (): Promise<BrowseResponse> => { ... }
```

---

### JavaScript (Backend)

**1. Use async/await over promises**

```javascript
// ❌ BAD - Promise chains
User.findById(id)
  .then(user => UserCompatibility.find({ userA: user._id }))
  .then(compatibilities => res.json(compatibilities))
  .catch(err => next(err));

// ✅ GOOD - Async/await
try {
  const user = await User.findById(id);
  const compatibilities = await UserCompatibility.find({ userA: user._id });
  res.json(compatibilities);
} catch (err) {
  next(err);
}
```

**2. Use destructuring for cleaner code**

```javascript
// ❌ BAD
const email = req.body.email;
const password = req.body.password;

// ✅ GOOD
const { email, password } = req.body;
```

**3. Use template literals for strings**

```javascript
// ❌ BAD
const message = 'Welcome ' + user.firstName + '!';

// ✅ GOOD
const message = `Welcome ${user.firstName}!`;
```

---

## Comments and Documentation

### When to Comment

✅ **DO comment:** Complex business logic, non-obvious decisions, "why" not "what"  
❌ **DON'T comment:** Obvious code, redundant descriptions

```javascript
// ❌ BAD - Obvious comment
// Increment the counter
counter++;

// ✅ GOOD - Explains "why"
// Reset browse counter at midnight UTC to enforce daily limit
if (user.lastBrowseResetDate < startOfToday) {
  user.profilesBrowsedToday = 0;
}

// ✅ GOOD - Documents non-obvious behavior
/**
 * Compatibility calculation uses 2-of-3 rule:
 * Users must match in at least 2 of 3 astrology systems
 * to unlock chat functionality. This balances accessibility
 * with meaningful compatibility.
 */
const isMatch = totalScore >= 2;
```

---

### JSDoc for Public APIs

```javascript
/**
 * Calculate compatibility score between two users
 * @param {Object} userASigns - { westernSign, chineseSign, vedicSign }
 * @param {Object} userBSigns - { westernSign, chineseSign, vedicSign }
 * @returns {{totalScore: number, westernCompatible: boolean, chineseCompatible: boolean, vedicCompatible: boolean, isMatch: boolean}}
 */
function calculateCompatibility(userASigns, userBSigns) { 
  // ... implementation
}
```

---

## Error Response Format

All API errors must follow this standard format:

```typescript
interface ApiError {
  error: {
    code: string;           // Machine-readable error code
    message: string;        // User-friendly message
    details?: Record<string, any>; // Additional context
    timestamp: string;      // ISO 8601 timestamp
    requestId?: string;     // For debugging (Phase 2)
  };
}
```

**Error Codes:**
- Authentication: `INVALID_CREDENTIALS`, `EMAIL_NOT_VERIFIED`, `NO_TOKEN`, `INVALID_TOKEN`, `TOKEN_EXPIRED`
- Validation: `VALIDATION_ERROR`
- Authorization: `INSUFFICIENT_COMPATIBILITY`, `FORBIDDEN`
- Resource: `NOT_FOUND`, `ALREADY_EXISTS`
- Rate Limiting: `RATE_LIMIT_EXCEEDED`, `BROWSE_LIMIT_EXCEEDED`
- Server: `INTERNAL_ERROR`, `DATABASE_ERROR`, `EXTERNAL_SERVICE_ERROR`

---

## Security Rules (Critical)

### Never Do This:

1. ❌ Log passwords (plaintext or hashed)
2. ❌ Return passwords in API responses
3. ❌ Store JWT in AsyncStorage (use SecureStore)
4. ❌ Commit .env files to Git
5. ❌ Use synchronous bcrypt (hashSync) - blocks event loop
6. ❌ Skip server-side validation (trusting client is insecure)
7. ❌ Hardcode API keys or secrets in code
8. ❌ Expose database errors to users (log them, show generic message)
9. ❌ Use weak passwords (enforce 8+ chars, letter + number)
10. ❌ Allow unlimited API requests (implement rate limiting)

### Always Do This:

1. ✅ Hash passwords with bcryptjs (12 salt rounds minimum)
2. ✅ Use HTTPS/TLS for all API communication
3. ✅ Validate all user input on server
4. ✅ Use parameterized queries (Mongoose does this automatically)
5. ✅ Implement rate limiting on auth endpoints
6. ✅ Store tokens securely (SecureStore on mobile)
7. ✅ Use environment variables for secrets
8. ✅ Sanitize user-generated content before display
9. ✅ Implement proper error handling with try/catch
10. ✅ Log errors with context (userId, endpoint, timestamp)

---

## Testing Standards

### Coverage Requirements

- **Backend:** 80% minimum overall, 100% for Astrology Service
- **Mobile:** 70% minimum overall
- **Critical Paths:** 100% coverage for authentication, compatibility calculation, chat initiation

### Test Organization

**Backend:**
```
backend/tests/
├── unit/
│   ├── services/
│   ├── models/
│   └── utils/
├── integration/
│   ├── auth.test.js
│   ├── browse.test.js
│   └── chat.test.js
└── fixtures/
```

**Mobile:**
```
mobile/src/
├── components/
│   └── __tests__/
├── services/
│   └── __tests__/
└── hooks/
    └── __tests__/
```

### What to Test

**Always test:**
- Core business logic (Astrology Service calculations)
- Authentication flows
- API endpoint contracts
- Component rendering with various props
- Error handling paths

**Don't over-test:**
- Third-party library internals
- Simple getters/setters
- Trivial utility functions

---

## Performance Standards

### Backend Performance

- API p95 latency < 2 seconds
- Database queries < 500ms (p95)
- Use indexes for all queries
- Use `.lean()` for read-only queries
- Avoid N+1 queries (use population)

### Mobile Performance

- App launch < 3 seconds
- Screen transitions smooth (60 FPS)
- FlatList optimization (windowSize, removeClippedSubviews)
- Image caching enabled
- Memoize expensive computations

---

## Code Review Checklist

Before submitting code:

- [ ] All tests pass (`npm run test:all`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Prettier formatted (`npm run format`)
- [ ] No console.log statements in production code
- [ ] Error handling implemented (try/catch, loading states)
- [ ] TypeScript types defined (no `any`)
- [ ] API calls use service layer (not direct axios)
- [ ] Environment variables accessed via config
- [ ] Sensitive data not logged or exposed
- [ ] Code follows naming conventions

---

**Document Status:** ✅ Complete  
**Last Updated:** October 22, 2025  
**Owner:** Architect (Winston)

