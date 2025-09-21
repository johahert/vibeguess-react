# Tasks: VibeGuess Frontend Application

**Input**: Design documents from `/specs/001-frontend-application/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory ✅
   → Extract: TypeScript 5.x, React 19, Vite 5.x, TailwindCSS 4.x, ShadCN/UI stack
2. Load optional design documents ✅:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category ✅:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, components, pages
   → Integration: Spotify SDK, state management, routing
   → Polish: unit tests, performance, accessibility, docs
4. Apply task rules ✅:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...) ✅
6. Generate dependency graph ✅
7. Create parallel execution examples ✅
8. Validate task completeness ✅
9. Return: SUCCESS (tasks ready for execution) ✅
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Frontend SPA**: `src/`, `tests/`, `public/`, `config/` at repository root
- Paths assume repository root structure as defined in plan.md

## Phase 3.1: Project Setup & Configuration
- [ ] T001 Initialize Vite + React 19 + TypeScript project with `npm create vite@latest vibeguess-frontend --template react-ts`
- [ ] T002 [P] Install core dependencies: React 19, TypeScript 5.x, Vite 5.x
- [ ] T003 [P] Install TailwindCSS 4.x with new CSS engine configuration
- [ ] T004 [P] Initialize ShadCN/UI with `npx shadcn-ui@latest init` and configure theme
- [ ] T005 [P] Install state management: TanStack Query v5, Zustand, React Router v6
- [ ] T006 [P] Configure development tools: ESLint, Prettier, Husky pre-commit hooks
- [ ] T007 [P] Set up testing infrastructure: Vitest, React Testing Library, Playwright, MSW
- [ ] T008 Create project structure: src/{components,pages,hooks,services,stores,types,utils,lib}/
- [ ] T009 [P] Configure Vite build optimization and environment variables
- [ ] T010 [P] Set up TailwindCSS 4 with custom theme for VibeGuess branding

## Phase 3.2: TypeScript Types & Interfaces (TDD Foundation)
- [ ] T011 [P] Create User and UserSettings interfaces in src/types/user.ts
- [ ] T012 [P] Create Quiz and Question interfaces in src/types/quiz.ts  
- [ ] T013 [P] Create QuizSession and QuizAnswer interfaces in src/types/session.ts
- [ ] T014 [P] Create SpotifyDevice and PlaybackState interfaces in src/types/spotify.ts
- [ ] T015 [P] Create AuthTokens and AuthState interfaces in src/types/auth.ts
- [ ] T016 [P] Create API response wrappers in src/types/api.ts
- [ ] T017 [P] Create client-side state interfaces in src/types/app.ts
- [ ] T018 Create comprehensive type index file src/types/index.ts

## Phase 3.3: API Contract Tests (TDD - MUST COMPLETE BEFORE IMPLEMENTATION)
**CRITICAL: These tests MUST be written and MUST FAIL before ANY service implementation**

### Authentication API Tests
- [ ] T019 [P] Contract test POST /auth/spotify/login in tests/contract/auth-login.test.ts
- [ ] T020 [P] Contract test POST /auth/spotify/callback in tests/contract/auth-callback.test.ts  
- [ ] T021 [P] Contract test POST /auth/refresh in tests/contract/auth-refresh.test.ts
- [ ] T022 [P] Contract test GET /auth/me in tests/contract/auth-profile.test.ts

### Quiz Management API Tests
- [ ] T023 [P] Contract test POST /quiz/generate in tests/contract/quiz-generate.test.ts
- [ ] T024 [P] Contract test GET /quiz/{id} in tests/contract/quiz-get.test.ts
- [ ] T025 [P] Contract test POST /quiz/{id}/start-session in tests/contract/quiz-session.test.ts
- [ ] T026 [P] Contract test GET /quiz/my-quizzes in tests/contract/quiz-history.test.ts

### Spotify Playback API Tests  
- [ ] T027 [P] Contract test GET /playback/devices in tests/contract/playback-devices.test.ts
- [ ] T028 [P] Contract test POST /playback/play in tests/contract/playback-play.test.ts
- [ ] T029 [P] Contract test GET /playback/status in tests/contract/playback-status.test.ts

### MSW Mock Setup
- [ ] T030 [P] Configure MSW handlers for all API endpoints in tests/mocks/handlers.ts
- [ ] T031 [P] Create MSW server setup for tests in tests/mocks/server.ts

## Phase 3.4: Integration Tests (End-to-End User Journeys)
- [ ] T032 [P] E2E test: Complete OAuth authentication flow in tests/e2e/auth-flow.spec.ts
- [ ] T033 [P] E2E test: Quiz creation and customization in tests/e2e/quiz-creation.spec.ts  
- [ ] T034 [P] E2E test: Quiz taking with scoring in tests/e2e/quiz-taking.spec.ts
- [ ] T035 [P] E2E test: Spotify device selection and playback in tests/e2e/spotify-integration.spec.ts
- [ ] T036 [P] Integration test: Token refresh and error recovery in tests/integration/auth-recovery.test.ts
- [ ] T037 [P] Integration test: Quiz history and performance tracking in tests/integration/quiz-history.test.ts

## Phase 3.5: Core Service Implementation (Make Tests Pass)

### Authentication Service
- [ ] T038 AuthService implementation in src/services/auth.service.ts
- [ ] T039 [P] OAuth PKCE flow utilities in src/utils/oauth.ts
- [ ] T040 [P] Secure token storage manager in src/utils/token-storage.ts

### Quiz Management Service  
- [ ] T041 [P] QuizService implementation in src/services/quiz.service.ts
- [ ] T042 [P] Quiz session management in src/services/session.service.ts

### Spotify Integration Service
- [ ] T043 [P] SpotifyService for API calls in src/services/spotify.service.ts
- [ ] T044 Spotify Web Playback SDK wrapper in src/lib/spotify-sdk.ts
- [ ] T045 [P] Playback state manager in src/services/playback.service.ts

### HTTP Client & Error Handling
- [ ] T046 HTTP client with interceptors in src/lib/http-client.ts
- [ ] T047 [P] API error handling utilities in src/utils/error-handling.ts
- [ ] T048 [P] Retry logic with exponential backoff in src/utils/retry.ts

## Phase 3.6: State Management (Zustand + TanStack Query)

### Global State Stores
- [ ] T049 [P] Auth store with Zustand in src/stores/auth.store.ts
- [ ] T050 [P] App state store (theme, notifications) in src/stores/app.store.ts  
- [ ] T051 [P] Playback state store in src/stores/playback.store.ts

### TanStack Query Setup
- [ ] T052 Query client configuration in src/lib/query-client.ts
- [ ] T053 [P] Auth query hooks in src/hooks/useAuth.ts
- [ ] T054 [P] Quiz query hooks in src/hooks/useQuiz.ts
- [ ] T055 [P] Spotify query hooks in src/hooks/useSpotify.ts

## Phase 3.7: Custom React Hooks
- [ ] T056 [P] useLocalStorage hook in src/hooks/useLocalStorage.ts
- [ ] T057 [P] useDebounce hook for search in src/hooks/useDebounce.ts
- [ ] T058 [P] useOnlineStatus hook in src/hooks/useOnlineStatus.ts  
- [ ] T059 [P] useKeyboardShortcuts hook in src/hooks/useKeyboardShortcuts.ts
- [ ] T060 [P] useAudioPreview hook in src/hooks/useAudioPreview.ts

## Phase 3.8: UI Components (ShadCN + Custom)

### Base ShadCN Components Installation
- [ ] T061 [P] Install Button, Input, Card components with `npx shadcn-ui@latest add button input card`
- [ ] T062 [P] Install Dialog, Toast, Select components with `npx shadcn-ui@latest add dialog toast select`  
- [ ] T063 [P] Install Progress, Badge, Skeleton components with `npx shadcn-ui@latest add progress badge skeleton`

### Authentication Components
- [ ] T064 [P] LoginButton component in src/components/auth/LoginButton.tsx
- [ ] T065 [P] UserProfile dropdown in src/components/auth/UserProfile.tsx
- [ ] T066 [P] AuthGuard wrapper component in src/components/auth/AuthGuard.tsx

### Quiz Components  
- [ ] T067 [P] QuizCreationForm component in src/components/quiz/QuizCreationForm.tsx
- [ ] T068 [P] QuestionDisplay component in src/components/quiz/QuestionDisplay.tsx
- [ ] T069 [P] QuizResults component in src/components/quiz/QuizResults.tsx
- [ ] T070 [P] QuizCard for quiz library in src/components/quiz/QuizCard.tsx
- [ ] T071 QuizSession controller component in src/components/quiz/QuizSession.tsx

### Playback Components
- [ ] T072 [P] DeviceSelector component in src/components/playback/DeviceSelector.tsx  
- [ ] T073 [P] PlaybackControls component in src/components/playback/PlaybackControls.tsx
- [ ] T074 [P] AudioPreview component in src/components/playback/AudioPreview.tsx
- [ ] T075 [P] VolumeControl component in src/components/playback/VolumeControl.tsx

### Layout Components
- [ ] T076 [P] Header with navigation in src/components/layout/Header.tsx
- [ ] T077 [P] Sidebar navigation in src/components/layout/Sidebar.tsx  
- [ ] T078 [P] Footer component in src/components/layout/Footer.tsx
- [ ] T079 MainLayout wrapper in src/components/layout/MainLayout.tsx

### Utility Components
- [ ] T080 [P] LoadingSpinner with Suspense in src/components/ui/LoadingSpinner.tsx
- [ ] T081 [P] ErrorBoundary component in src/components/ui/ErrorBoundary.tsx
- [ ] T082 [P] NotificationToast manager in src/components/ui/NotificationToast.tsx

## Phase 3.9: Page Components & Routing

### Page Components
- [ ] T083 [P] HomePage with dashboard in src/pages/HomePage.tsx
- [ ] T084 [P] LoginPage component in src/pages/LoginPage.tsx  
- [ ] T085 [P] CallbackPage for OAuth in src/pages/CallbackPage.tsx
- [ ] T086 [P] QuizCreationPage in src/pages/QuizCreationPage.tsx
- [ ] T087 [P] QuizLibraryPage in src/pages/QuizLibraryPage.tsx
- [ ] T088 [P] QuizPlayPage in src/pages/QuizPlayPage.tsx  
- [ ] T089 [P] SettingsPage component in src/pages/SettingsPage.tsx
- [ ] T090 [P] NotFoundPage component in src/pages/NotFoundPage.tsx

### React Router Setup
- [ ] T091 Router configuration with React Router v6 in src/App.tsx
- [ ] T092 [P] Route guards for protected pages in src/utils/route-guards.ts
- [ ] T093 [P] Navigation utilities and hooks in src/hooks/useNavigation.ts

## Phase 3.10: Integration & State Wiring
- [ ] T094 Connect authentication flow to auth store and services
- [ ] T095 Integrate quiz creation with quiz service and TanStack Query
- [ ] T096 Wire up Spotify playback with device selection and controls
- [ ] T097 Connect quiz session management with real-time state updates
- [ ] T098 Integrate error handling and toast notifications across app
- [ ] T099 Set up offline quiz caching with Service Worker
- [ ] T100 Configure analytics and user feedback collection

## Phase 3.11: Performance & Accessibility Polish

### Code Splitting & Lazy Loading
- [ ] T101 [P] Implement route-based code splitting with React.lazy  
- [ ] T102 [P] Add component-level lazy loading for heavy features
- [ ] T103 [P] Configure Vite bundle analysis and optimization

### Accessibility (WCAG 2.1 AA Compliance)
- [ ] T104 [P] Add ARIA labels and roles to all interactive components
- [ ] T105 [P] Implement keyboard navigation for quiz interactions
- [ ] T106 [P] Add focus management for modal dialogs and overlays
- [ ] T107 [P] Configure screen reader support for dynamic content
- [ ] T108 [P] Test color contrast and provide high contrast theme option

### Performance Optimization  
- [ ] T109 [P] Implement TanStack Query caching strategies
- [ ] T110 [P] Add image optimization and lazy loading
- [ ] T111 [P] Configure Service Worker for offline functionality
- [ ] T112 [P] Add performance monitoring with web-vitals library
- [ ] T113 [P] Optimize TailwindCSS bundle with purging and JIT

## Phase 3.12: Testing & Quality Assurance

### Component Unit Tests
- [ ] T114 [P] Unit tests for authentication components in tests/unit/auth/
- [ ] T115 [P] Unit tests for quiz components in tests/unit/quiz/  
- [ ] T116 [P] Unit tests for playback components in tests/unit/playback/
- [ ] T117 [P] Unit tests for utility functions in tests/unit/utils/

### Integration Testing
- [ ] T118 [P] Service integration tests with MSW in tests/integration/services/
- [ ] T119 [P] State management integration tests in tests/integration/stores/
- [ ] T120 [P] Hook integration tests in tests/integration/hooks/

### Accessibility Testing
- [ ] T121 [P] Automated accessibility tests with axe-core
- [ ] T122 [P] Keyboard navigation E2E tests
- [ ] T123 [P] Screen reader compatibility tests

## Phase 3.13: Documentation & Developer Experience
- [ ] T124 [P] Update README.md with setup instructions
- [ ] T125 [P] Create component documentation with Storybook (optional)
- [ ] T126 [P] Add code comments for complex authentication logic
- [ ] T127 [P] Create deployment guide and environment setup
- [ ] T128 [P] Generate API documentation for services

## Phase 3.14: Final Integration & Validation
- [ ] T129 Run complete test suite and ensure 90%+ coverage
- [ ] T130 Execute quickstart.md validation scenarios
- [ ] T131 Performance audit with Lighthouse (target: 90+ score)
- [ ] T132 Accessibility audit with axe DevTools
- [ ] T133 Cross-browser compatibility testing
- [ ] T134 Mobile responsiveness validation
- [ ] T135 Security audit for token handling and XSS prevention

## Dependencies & Execution Order

### Critical Dependencies
```
Setup (T001-T010) → Types (T011-T018) → Contract Tests (T019-T031)
Contract Tests → Integration Tests (T032-T037)  
Contract Tests → Service Implementation (T038-T048)
Types + Services → State Management (T049-T055)
State Management → Hooks (T056-T060)
Types + Hooks → Components (T061-T082)
Components → Pages (T083-T090)
Pages → Routing (T091-T093)
All Core → Integration (T094-T100)
Integration → Polish (T101-T113)
Polish → Testing (T114-T123)
Testing → Documentation (T124-T128)
Documentation → Final Validation (T129-T135)
```

### Parallel Execution Groups
```bash
# Group 1: Setup & Configuration (can run together)
Tasks T002, T003, T004, T005, T006, T007, T009, T010

# Group 2: Type Definitions (independent files)
Tasks T011, T012, T013, T014, T015, T016, T017

# Group 3: Contract Tests (independent test files)  
Tasks T019-T031 (all contract tests and MSW setup)

# Group 4: Integration Tests (different test files)
Tasks T032-T037 (E2E and integration tests)

# Group 5: Service Implementation (different service files)
Tasks T039, T040, T041, T042, T043, T045, T047, T048

# Group 6: State & Hooks (independent files)
Tasks T049, T050, T051, T053, T054, T055, T056-T060

# Group 7: UI Components (independent component files)
Tasks T061-T082 (most component implementations)

# Group 8: Page Components (independent pages)  
Tasks T083-T090, T092, T093

# Group 9: Polish Tasks (independent optimizations)
Tasks T101-T103, T104-T108, T109-T113, T114-T123, T124-T128
```

## Validation Checklist
*GATE: Checked before marking tasks complete*

### TDD Compliance
- [ ] All API endpoints have contract tests that fail initially  
- [ ] All user journeys have E2E tests before implementation
- [ ] Components have unit tests covering interactions
- [ ] Services have integration tests with mocked APIs

### Constitutional Compliance  
- [ ] Code quality: TypeScript strict, ESLint passing, complexity < 10
- [ ] UX excellence: WCAG 2.1 AA compliance, responsive design
- [ ] Performance: <3s load times, Lighthouse 90+, optimized bundles
- [ ] User feedback: Analytics integrated, error reporting configured

### Technical Requirements
- [ ] React 19 features utilized (Suspense, concurrent rendering)
- [ ] TailwindCSS 4 benefits leveraged (container queries, CSS engine)
- [ ] Spotify integration working for Premium and Free users  
- [ ] Offline functionality with Service Worker caching
- [ ] Security: Secure token storage, XSS prevention, CSRF protection

---

**Estimated Timeline**: 4-6 weeks for complete implementation  
**Team Size**: 2-3 frontend developers  
**Prerequisites**: API server running, Spotify Developer credentials configured

*This task list follows TDD principles and constitutional compliance for the VibeGuess frontend application using React 19, TailwindCSS 4, and modern development practices.*