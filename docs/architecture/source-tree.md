# AstroDating Source Tree Structure

**Version:** 1.0  
**Date:** October 22, 2025  
**Source:** Extracted from Architecture Document  

---

## Complete Project Structure

```plaintext
AstroDating/
├── .github/                          # GitHub configuration
│   └── workflows/
│       ├── ci.yml                    # CI pipeline (ESLint, tests)
│       └── deploy.yml                # Deployment pipeline
│
├── backend/                          # Express.js API
│   ├── src/
│   │   ├── server.js                 # Entry point, Express app setup
│   │   │
│   │   ├── config/                   # Configuration files
│   │   │   ├── db.js                 # MongoDB connection & indexes
│   │   │   ├── cloudinary.js         # Cloudinary SDK config
│   │   │   └── compatibilityMatrix.js # Static astrology matrices
│   │   │
│   │   ├── models/                   # Mongoose schemas
│   │   │   ├── User.js               # User model with virtuals & hooks
│   │   │   ├── UserCompatibility.js  # Compatibility cache model
│   │   │   ├── Conversation.js       # Chat conversation model
│   │   │   ├── Message.js            # Chat message model
│   │   │   ├── Report.js             # User report model
│   │   │   └── ProfileView.js        # Analytics model
│   │   │
│   │   ├── routes/                   # Route definitions
│   │   │   ├── index.js              # Route aggregator
│   │   │   ├── authRoutes.js         # /api/auth/* routes
│   │   │   ├── userRoutes.js         # /api/users/* routes
│   │   │   ├── browseRoutes.js       # /api/browse routes
│   │   │   ├── chatRoutes.js         # /api/conversations/* routes
│   │   │   ├── uploadRoutes.js       # /api/upload/* routes
│   │   │   └── analyticsRoutes.js    # /api/analytics/* routes
│   │   │
│   │   ├── controllers/              # Request handlers
│   │   │   ├── authController.js     # Signup, login, verify email
│   │   │   ├── userController.js     # Profile CRUD, hotlist
│   │   │   ├── browseController.js   # Browse profiles, compatibility
│   │   │   ├── chatController.js     # Conversations, messages
│   │   │   ├── uploadController.js   # Image upload to Cloudinary
│   │   │   └── analyticsController.js # Profile view tracking
│   │   │
│   │   ├── services/                 # Business logic layer
│   │   │   ├── astrologyService.js   # Sign derivation, compatibility calc
│   │   │   ├── emailService.js       # Email sending (Nodemailer)
│   │   │   └── imageService.js       # Image processing utilities
│   │   │
│   │   ├── middleware/               # Express middleware
│   │   │   ├── auth.js               # JWT verification
│   │   │   ├── validation.js         # Input validation (express-validator)
│   │   │   ├── rateLimiter.js        # Rate limiting (auth endpoints)
│   │   │   ├── checkBrowseLimit.js   # Browse limit enforcement
│   │   │   ├── errorHandler.js       # Global error handler
│   │   │   └── cors.js               # CORS configuration
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │   ├── logger.js             # Winston logger configuration
│   │   │   ├── errorHandler.js       # Error formatting utilities
│   │   │   └── dateUtils.js          # Date calculation helpers
│   │   │
│   │   └── jobs/                     # Scheduled batch jobs
│   │       └── calculateCompatibilities.js # Nightly compatibility calc
│   │
│   ├── tests/                        # Backend tests
│   │   ├── unit/
│   │   │   ├── services/
│   │   │   │   └── astrologyService.test.js
│   │   │   ├── models/
│   │   │   │   └── User.test.js
│   │   │   └── utils/
│   │   │       └── dateUtils.test.js
│   │   ├── integration/
│   │   │   ├── auth.test.js          # Auth flow tests
│   │   │   ├── browse.test.js        # Browse API tests
│   │   │   └── chat.test.js          # Chat API tests
│   │   ├── fixtures/                 # Test data
│   │   │   ├── users.json
│   │   │   └── compatibility.json
│   │   └── setup.js                  # Test configuration
│   │
│   ├── templates/                    # Email templates
│   │   └── emails/
│   │       └── verification.html
│   │
│   ├── logs/                         # Log files (gitignored)
│   │   ├── error.log
│   │   └── combined.log
│   │
│   ├── .env.example                  # Environment variables template
│   ├── .env                          # Actual env vars (gitignored)
│   ├── .eslintrc.js                  # ESLint config
│   ├── .prettierrc                   # Prettier config
│   ├── jest.config.js                # Jest configuration
│   ├── package.json                  # Backend dependencies
│   └── README.md                     # Backend documentation
│
├── mobile/                           # React Native (Expo)
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   │   ├── common/               # Base components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Loading.tsx
│   │   │   │   └── ErrorMessage.tsx
│   │   │   ├── profile/              # Profile components
│   │   │   │   ├── CompatibilityBadge.tsx
│   │   │   │   ├── CompatibilityBreakdown.tsx
│   │   │   │   ├── ProfileCard.tsx
│   │   │   │   ├── PhotoCarousel.tsx
│   │   │   │   └── AstroSignDisplay.tsx
│   │   │   ├── chat/                 # Chat components
│   │   │   │   ├── MessageBubble.tsx
│   │   │   │   ├── ConversationItem.tsx
│   │   │   │   └── MessageInput.tsx
│   │   │   └── swipe/                # Swipe/browse components
│   │   │       ├── SwipeableCardDeck.tsx
│   │   │       └── SwipeActions.tsx
│   │   │
│   │   ├── screens/                  # Screen components
│   │   │   ├── auth/
│   │   │   │   ├── WelcomeScreen.tsx
│   │   │   │   ├── SignupScreen.tsx
│   │   │   │   └── LoginScreen.tsx
│   │   │   ├── profile/
│   │   │   │   ├── ProfileCreationScreen.tsx
│   │   │   │   ├── ProfileEditScreen.tsx
│   │   │   │   └── MyAccountScreen.tsx
│   │   │   ├── browse/
│   │   │   │   ├── ExploreScreen.tsx
│   │   │   │   ├── ProfileDetailScreen.tsx
│   │   │   │   └── HotlistScreen.tsx
│   │   │   ├── chat/
│   │   │   │   ├── ChatListScreen.tsx
│   │   │   │   └── ChatDetailScreen.tsx
│   │   │   └── LoadingScreen.tsx
│   │   │
│   │   ├── navigation/               # Navigation configuration
│   │   │   ├── AppNavigator.tsx      # Root navigator
│   │   │   ├── AuthStack.tsx         # Auth screens stack
│   │   │   ├── MainStack.tsx         # Main app (tabs + modals)
│   │   │   └── types.ts              # Navigation type definitions
│   │   │
│   │   ├── services/                 # API service layer
│   │   │   ├── api.ts                # Axios instance + interceptors
│   │   │   ├── authService.ts        # Auth API calls
│   │   │   ├── userService.ts        # User profile API calls
│   │   │   ├── browseService.ts      # Browse/hotlist API calls
│   │   │   ├── chatService.ts        # Chat API calls
│   │   │   └── uploadService.ts      # Image upload API calls
│   │   │
│   │   ├── contexts/                 # React Context providers
│   │   │   ├── AuthContext.tsx       # Auth state management
│   │   │   └── ThemeContext.tsx      # Theme/styling state
│   │   │
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useAuth.ts            # Auth context hook
│   │   │   ├── useApi.ts             # API request hook
│   │   │   └── usePoll.ts            # Polling hook (chat)
│   │   │
│   │   ├── types/                    # TypeScript type definitions
│   │   │   ├── index.ts              # Shared types
│   │   │   ├── user.ts               # User-related types
│   │   │   ├── compatibility.ts      # Compatibility types
│   │   │   ├── message.ts            # Message/chat types
│   │   │   └── navigation.ts         # Navigation types
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │   ├── validation.ts         # Form validation
│   │   │   ├── dateUtils.ts          # Date formatting
│   │   │   ├── errorHandler.ts       # Error formatting
│   │   │   └── analytics.ts          # Analytics helpers
│   │   │
│   │   ├── constants/                # Constants
│   │   │   ├── api.ts                # API URLs, endpoints
│   │   │   ├── theme.ts              # Colors, spacing, fonts
│   │   │   └── astrology.ts          # Astrology sign constants
│   │   │
│   │   ├── assets/                   # Static assets
│   │   │   ├── images/
│   │   │   ├── icons/
│   │   │   └── fonts/
│   │   │
│   │   └── App.tsx                   # Root component
│   │
│   ├── tests/                        # Mobile tests
│   │   ├── components/
│   │   │   └── CompatibilityBadge.test.tsx
│   │   ├── screens/
│   │   │   └── ExploreScreen.test.tsx
│   │   └── services/
│   │       └── authService.test.ts
│   │
│   ├── __mocks__/                    # Jest mocks
│   │   ├── axios.ts
│   │   └── expo-secure-store.ts
│   │
│   ├── .expo/                        # Expo config (gitignored)
│   ├── .expo-shared/
│   ├── assets/                       # App assets (icon, splash)
│   │   ├── icon.png
│   │   ├── splash.png
│   │   └── adaptive-icon.png
│   │
│   ├── app.json                      # Expo app configuration
│   ├── app.config.js                 # Dynamic Expo config
│   ├── eas.json                      # EAS Build configuration
│   ├── babel.config.js               # Babel configuration
│   ├── tsconfig.json                 # TypeScript config
│   ├── jest.config.js                # Jest configuration
│   ├── .eslintrc.js                  # ESLint config
│   ├── .prettierrc                   # Prettier config
│   ├── package.json                  # Mobile dependencies
│   └── README.md                     # Mobile documentation
│
├── docs/                             # Project documentation
│   ├── brief.md                      # Project brief
│   ├── prd.md                        # Product requirements document
│   ├── architecture.md               # Architecture document (main)
│   ├── architecture/                 # Sharded architecture files
│   │   ├── coding-standards.md       # This file's sibling
│   │   ├── tech-stack.md             # This file's sibling
│   │   └── source-tree.md            # This document
│   ├── stories/                      # User stories (generated from PRD)
│   │   ├── epic-1-story-1.md
│   │   ├── epic-1-story-2.md
│   │   └── ...
│   └── api-examples.md               # API usage examples
│
├── scripts/                          # Build and utility scripts
│   ├── seed-database.js              # Seed dev database with test data
│   ├── reset-browse-counters.js     # Manual browse counter reset
│   └── generate-compatibility.js    # Manual compatibility calculation
│
├── .gitignore                        # Git ignore rules
├── .eslintrc.js                      # Root ESLint config (shared)
├── .prettierrc                       # Root Prettier config (shared)
├── package.json                      # Root package.json (workspaces)
├── package-lock.json                 # NPM lockfile
├── README.md                         # Project README
└── LICENSE                           # License file
```

---

## Directory Purpose Guide

### Backend Directories

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `backend/src/config/` | Configuration files and static data | `db.js`, `cloudinary.js`, `compatibilityMatrix.js` |
| `backend/src/models/` | Mongoose schemas (data layer) | `User.js`, `UserCompatibility.js`, `Message.js` |
| `backend/src/routes/` | Express route definitions | `authRoutes.js`, `userRoutes.js`, `browseRoutes.js` |
| `backend/src/controllers/` | Request handlers (thin layer) | `authController.js`, `browseController.js` |
| `backend/src/services/` | Business logic (core domain logic) | `astrologyService.js`, `emailService.js` |
| `backend/src/middleware/` | Express middleware | `auth.js`, `validation.js`, `rateLimiter.js` |
| `backend/src/utils/` | Utility functions | `logger.js`, `dateUtils.js`, `errorHandler.js` |
| `backend/src/jobs/` | Scheduled batch jobs | `calculateCompatibilities.js` |
| `backend/tests/unit/` | Unit tests | `astrologyService.test.js` |
| `backend/tests/integration/` | API integration tests | `auth.test.js`, `browse.test.js` |
| `backend/templates/` | Email HTML templates | `emails/verification.html` |

---

### Mobile Directories

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `mobile/src/components/common/` | Reusable base UI components | `Button.tsx`, `Input.tsx`, `Card.tsx` |
| `mobile/src/components/profile/` | Profile-specific components | `CompatibilityBadge.tsx`, `ProfileCard.tsx` |
| `mobile/src/components/chat/` | Chat-specific components | `MessageBubble.tsx`, `ConversationItem.tsx` |
| `mobile/src/components/swipe/` | Swipe/browse components | `SwipeableCardDeck.tsx` |
| `mobile/src/screens/auth/` | Authentication screens | `WelcomeScreen.tsx`, `SignupScreen.tsx` |
| `mobile/src/screens/profile/` | Profile management screens | `MyAccountScreen.tsx`, `ProfileEditScreen.tsx` |
| `mobile/src/screens/browse/` | Browse/discovery screens | `ExploreScreen.tsx`, `ProfileDetailScreen.tsx` |
| `mobile/src/screens/chat/` | Chat screens | `ChatListScreen.tsx`, `ChatDetailScreen.tsx` |
| `mobile/src/navigation/` | Navigation configuration | `AppNavigator.tsx`, `AuthStack.tsx`, `MainStack.tsx` |
| `mobile/src/services/` | API service layer | `api.ts`, `authService.ts`, `browseService.ts` |
| `mobile/src/contexts/` | React Context providers | `AuthContext.tsx`, `ThemeContext.tsx` |
| `mobile/src/hooks/` | Custom React hooks | `useAuth.ts`, `useApi.ts`, `usePoll.ts` |
| `mobile/src/types/` | TypeScript type definitions | `user.ts`, `compatibility.ts`, `message.ts` |
| `mobile/src/utils/` | Utility functions | `validation.ts`, `dateUtils.ts`, `errorHandler.ts` |
| `mobile/src/constants/` | Constants and config | `api.ts`, `theme.ts`, `astrology.ts` |
| `mobile/src/assets/` | Static assets | Images, icons, fonts |
| `mobile/tests/` | Mobile tests | Component, screen, service tests |

---

## File Naming Conventions

### Backend

- **Models:** PascalCase, singular - `User.js`, `Message.js`, `UserCompatibility.js`
- **Controllers:** camelCase + "Controller" - `authController.js`, `browseController.js`
- **Services:** camelCase + "Service" - `astrologyService.js`, `emailService.js`
- **Routes:** camelCase + "Routes" - `authRoutes.js`, `userRoutes.js`
- **Middleware:** camelCase - `auth.js`, `rateLimiter.js`, `checkBrowseLimit.js`
- **Utilities:** camelCase - `logger.js`, `dateUtils.js`, `errorHandler.js`
- **Tests:** Match source file + ".test" - `astrologyService.test.js`

### Mobile

- **Components:** PascalCase - `CompatibilityBadge.tsx`, `ProfileCard.tsx`, `Button.tsx`
- **Screens:** PascalCase + "Screen" - `ExploreScreen.tsx`, `LoginScreen.tsx`
- **Hooks:** camelCase with "use" prefix - `useAuth.ts`, `useApi.ts`, `usePoll.ts`
- **Services:** camelCase + "Service" - `authService.ts`, `browseService.ts`
- **Contexts:** PascalCase + "Context" - `AuthContext.tsx`, `ThemeContext.tsx`
- **Types:** camelCase - `user.ts`, `compatibility.ts`, `message.ts`
- **Utilities:** camelCase - `validation.ts`, `dateUtils.ts`, `errorHandler.ts`
- **Constants:** camelCase file, SCREAMING_SNAKE_CASE exports - `api.ts` exports `API_URL`
- **Tests:** Match source file + ".test" - `CompatibilityBadge.test.tsx`

---

## Component Organization Patterns

### Mobile Components (Feature-Based)

**Pattern:** Group components by feature/domain, not by type

```
✅ GOOD - Feature-based:
components/
├── profile/
│   ├── CompatibilityBadge.tsx
│   ├── ProfileCard.tsx
│   └── PhotoCarousel.tsx
├── chat/
│   ├── MessageBubble.tsx
│   └── ConversationItem.tsx
└── common/
    ├── Button.tsx
    └── Input.tsx

❌ BAD - Type-based (flat):
components/
├── CompatibilityBadge.tsx
├── ProfileCard.tsx
├── PhotoCarousel.tsx
├── MessageBubble.tsx
├── ConversationItem.tsx
├── Button.tsx
└── Input.tsx
```

---

### Backend Services (Layered)

**Pattern:** Request → Route → Controller → Service → Model → Database

```
Request Flow Example (Browse Profiles):

1. Mobile: GET /api/browse
2. Route: browseRoutes.js → browseController.getBrowseProfiles
3. Controller: Validates input, calls service
4. Service: Implements business logic, calls model
5. Model: Executes database query
6. Database: Returns data
7. Response: Flows back through layers
```

**File Placement:**
- Routes define endpoints: `/api/browse` → `browseRoutes.js`
- Controllers handle HTTP: `browseController.getBrowseProfiles(req, res, next)`
- Services contain logic: `UserService.fetchBrowseProfiles(currentUser, page)`
- Models access data: `User.find({ ... }).lean()`

---

## Where to Add New Code

### Adding a New API Endpoint

1. **Route:** Add to appropriate routes file (e.g., `browseRoutes.js`)
2. **Controller:** Create handler in controller (e.g., `browseController.getFiltered`)
3. **Service:** Add business logic in service if complex (e.g., `UserService.filterByPreferences`)
4. **Model:** Add model method if new query pattern (e.g., `User.findByPreferences()`)
5. **Test:** Add integration test in `tests/integration/`

### Adding a New Screen (Mobile)

1. **Screen File:** Create in `screens/` subdirectory (e.g., `screens/settings/SettingsScreen.tsx`)
2. **Navigation:** Add route to MainStack or AuthStack (`navigation/MainStack.tsx`)
3. **Components:** Create reusable components in `components/` if needed
4. **Service:** Add API calls to appropriate service (e.g., `userService.updateSettings()`)
5. **Types:** Add TypeScript types in `types/` (e.g., `types/settings.ts`)
6. **Test:** Add test in `tests/screens/`

### Adding a New Reusable Component (Mobile)

1. **Component File:** Create in `components/` subdirectory by feature
2. **Props Interface:** Define TypeScript interface
3. **Styles:** Include StyleSheet in same file
4. **Export:** Export from `components/index.ts` for easy imports
5. **Test:** Add test in `__tests__/` subdirectory
6. **Storybook:** Phase 2 - add story for component library

### Adding a New Service (Backend)

1. **Service File:** Create in `services/` (e.g., `services/notificationService.js`)
2. **Export Functions:** Export pure functions or class methods
3. **Dependencies:** Import only models and utilities (no controllers)
4. **Test:** Add unit tests in `tests/unit/services/`
5. **Documentation:** JSDoc comments for public methods

---

## Test File Organization

### Backend Test Structure

```
backend/tests/
├── unit/                    # Fast, isolated tests
│   ├── services/            # Service logic tests
│   ├── models/              # Model method tests
│   └── utils/               # Utility function tests
├── integration/             # API endpoint tests
│   ├── auth.test.js         # Auth flow
│   ├── browse.test.js       # Browse API
│   └── chat.test.js         # Chat API
├── fixtures/                # Test data
│   ├── users.json
│   └── compatibility.json
└── setup.js                 # Test environment setup
```

### Mobile Test Structure

```
mobile/src/
├── components/
│   ├── profile/
│   │   ├── CompatibilityBadge.tsx
│   │   └── __tests__/
│   │       └── CompatibilityBadge.test.tsx
├── services/
│   ├── authService.ts
│   └── __tests__/
│       └── authService.test.ts
└── hooks/
    ├── useAuth.ts
    └── __tests__/
        └── useAuth.test.ts
```

---

## Import Path Standards

### Backend (JavaScript)

```javascript
// Relative imports for project files
const User = require('../models/User');
const { logger } = require('../utils/logger');
const config = require('../config');

// npm packages use package name
const express = require('express');
const mongoose = require('mongoose');
```

### Mobile (TypeScript)

```typescript
// Relative imports for project files
import { UserProfile } from '../types/user';
import { authService } from '../services/authService';
import { CompatibilityBadge } from '../components/profile/CompatibilityBadge';

// npm packages use package name
import React from 'react';
import { View, Text } from 'react-native';
import axios from 'axios';

// Optional: Configure path aliases in tsconfig.json
// "@components/*": ["src/components/*"]
// Then: import { CompatibilityBadge } from '@components/profile/CompatibilityBadge';
```

---

## Git Commit Standards

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Build process, dependencies

**Examples:**

```
feat(auth): Add email verification flow

Implemented email verification with JWT tokens.
Users must verify email before login is allowed.

Closes #12
```

```
fix(browse): Fix compatibility score calculation

Western sign lookup was case-sensitive, causing
matches to fail. Now using lowercase comparison.

Fixes #45
```

---

## Branch Strategy

**Main Branches:**
- `main` - Production-ready code, protected
- `develop` - Integration branch for features

**Feature Branches:**
- `feature/epic-1-story-1` - Feature branches from develop
- `bugfix/fix-login-error` - Bug fixes
- `hotfix/critical-security-patch` - Emergency fixes from main

**Workflow:**
1. Create feature branch from `develop`
2. Implement story, commit regularly
3. Open PR to `develop`
4. After review and tests pass, merge to `develop`
5. Periodically merge `develop` → `main` for production deploy

---

## Code Organization Best Practices

### Backend

1. **Keep controllers thin:** 10-30 lines max, just validate → call service → return
2. **Business logic in services:** Complex logic, calculations, orchestration
3. **Data access in models:** Queries, updates, relationships
4. **One concern per file:** `authController.js` only handles auth routes
5. **Shared utilities:** Common logic in `utils/` (dates, errors, validation)

### Mobile

1. **Screens are containers:** Fetch data, manage state, render components
2. **Components are presentational:** Receive props, render UI, emit events
3. **Services handle API:** No API calls in screens/components, use service layer
4. **Hooks for reusable logic:** Custom hooks for data fetching, polling, etc.
5. **Context for global state:** Auth, theme, minimal global state only

---

## File Size Guidelines

**Target File Sizes:**
- **Components:** 50-200 lines (if larger, split into sub-components)
- **Screens:** 100-300 lines (if larger, extract components)
- **Controllers:** 10-30 lines per method (thin)
- **Services:** 50-200 lines (focused single responsibility)
- **Models:** 100-300 lines (schema + methods)

**When to Split:**
- File >500 lines → Split by responsibility
- Component has multiple sub-features → Extract to separate components
- Service has multiple concerns → Split into separate services

---

## Import Organization

**Order:**
1. React/React Native imports
2. Third-party library imports (alphabetical)
3. Project imports (alphabetical)
4. Relative imports (parent directories first)
5. Styles import (last)

```typescript
// 1. React
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 2. Third-party (alphabetical)
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

// 3. Project imports (alphabetical)
import { authService } from '../../services/authService';
import { UserProfile } from '../../types/user';

// 4. Relative imports
import { Button } from '../common/Button';
import { Input } from '../common/Input';

// 5. Styles (if external file)
import styles from './ExploreScreen.styles';
```

---

**Document Status:** ✅ Complete  
**Last Updated:** October 22, 2025  
**Owner:** Architect (Winston)

