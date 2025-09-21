# Page-by-Page Implementation Plan
**Focus**: OAuth-First Development Strategy

## 🔐 **Phase 1: Authentication Foundation** 
*Start here - enables all other features*

### **Step 1.1: Login Page Implementation**
**Files to Create**:
```
src/pages/LoginPage.tsx
src/components/auth/LoginButton.tsx
src/services/auth.service.ts
src/types/auth.ts
tests/contract/auth-login.test.ts
```

**Task Sequence**:
1. **T015** → Create auth types (`AuthState`, `AuthTokens`)
2. **T019** → Write contract test for `POST /auth/spotify/login` (MUST FAIL)
3. **T084** → Create `LoginPage.tsx` with ShadCN Button
4. **T064** → Create `LoginButton.tsx` component
5. **T038** → Implement `AuthService.initiateSpotifyLogin()`
6. **T091** → Add login route to React Router

**Login Page Features**:
- Clean, branded design with Spotify green CTA
- OAuth explanation for users ("Connect your Spotify to create quizzes")
- Loading states and error handling
- Responsive design (mobile-first)

**Validation**: Click login → redirects to Spotify → shows loading state

---

### **Step 1.2: OAuth Callback Page**
**Files to Create**:
```
src/pages/CallbackPage.tsx
src/utils/oauth.ts
tests/contract/auth-callback.test.ts
tests/e2e/auth-flow.spec.ts
```

**Task Sequence**:
1. **T020** → Contract test for `POST /auth/spotify/callback`
2. **T085** → Create `CallbackPage.tsx`
3. **T039** → Implement OAuth PKCE utilities
4. **T032** → E2E test for complete auth flow
5. Test the complete flow: Login → Spotify → Callback → Authenticated

**Callback Page Features**:
- Extracts `code` and `state` from URL params
- Exchanges authorization code for access/refresh tokens
- Handles OAuth errors (user declined, invalid state)
- Redirects to dashboard on success

**Validation**: Complete OAuth flow stores tokens and redirects

---

### **Step 1.3: Authentication State Management**
**Files to Create**:
```
src/stores/auth.store.ts
src/hooks/useAuth.ts
src/components/auth/AuthGuard.tsx
src/utils/token-storage.ts
```

**Task Sequence**:
1. **T049** → Create Zustand auth store
2. **T053** → Create `useAuth` hook with TanStack Query
3. **T040** → Secure token storage (localStorage with encryption)
4. **T066** → AuthGuard for protected routes
5. **T021** → Automatic token refresh logic

**Auth State Features**:
- Persistent login (remember tokens)
- Automatic token refresh before expiry
- Global loading states
- Logout functionality

**Validation**: Refresh page → stays logged in, token expires → auto-refreshes

---

### **Step 1.4: User Profile & Navigation**
**Files to Create**:
```
src/components/auth/UserProfile.tsx
src/components/layout/Header.tsx
src/pages/HomePage.tsx
```

**Task Sequence**:
1. **T022** → Contract test for `GET /auth/me`
2. **T065** → UserProfile dropdown component
3. **T076** → Header with user profile
4. **T083** → Basic HomePage (dashboard)

**Profile Features**:
- User avatar, name, Spotify plan (Free/Premium)
- Logout button
- Account settings link
- Premium upgrade prompt for Free users

**Validation**: Login → see user profile in header

---

## 🎵 **Phase 2: Core App Foundation**
*After authentication works completely*

### **Step 2.1: Dashboard/Home Page**
**Focus**: Central hub with navigation to all features

**Home Page Features**:
- Quick stats: "You've created X quizzes"
- Recent quiz history
- "Create New Quiz" prominent CTA
- Spotify playback status indicator
- Settings and help links

### **Step 2.2: Quiz Creation Page**
**Focus**: AI-powered quiz generation

**Creation Flow**:
1. Music selection (playlist, artists, genre)
2. Quiz customization (difficulty, length, question types)
3. AI generation with progress indicator
4. Preview generated quiz
5. Save and share

### **Step 2.3: Quiz Library Page**  
**Focus**: Browse and manage created quizzes

**Library Features**:
- Grid/list view of user's quizzes
- Search and filter (by genre, difficulty, date)
- Quiz statistics (plays, average score)
- Share quiz functionality
- Delete/edit quiz options

### **Step 2.4: Quiz Playing Page**
**Focus**: Interactive quiz experience with music

**Playing Features**:
- Question display with music preview/playback
- Answer selection with instant feedback
- Progress indicator
- Score tracking
- Results page with detailed breakdown

### **Step 2.5: Settings Page**
**Focus**: User preferences and Spotify management

**Settings Features**:
- Spotify account management
- Default quiz preferences
- Playback settings (device selection)
- Privacy settings
- Account deletion

---

## 🚀 **Recommended Implementation Order**

### **Week 1: Authentication Foundation**
```
Days 1-2: Project setup + Login Page (T001-T010, T015, T019, T084, T064)
Days 3-4: OAuth Callback + E2E tests (T020, T085, T039, T032)
Day 5: Auth state + token management (T049, T053, T040, T021)
```

### **Week 2: Core Pages Foundation** 
```
Days 1-2: Home/Dashboard page + navigation (T083, T076, T022)
Days 3-5: Quiz creation basics (form, API integration)
```

### **Week 3: Quiz Features**
```
Days 1-3: Quiz library and management
Days 4-5: Quiz playing experience (basic version)
```

### **Week 4: Spotify Integration & Polish**
```
Days 1-2: Spotify Web Playback SDK integration
Days 3-4: Advanced playback features
Day 5: Settings page and account management
```

## 🎯 **OAuth-First Task Priorities**

**Immediate Tasks (Week 1)**:
1. **T001-T004**: Project setup with React 19 + TailwindCSS 4
2. **T015**: Auth TypeScript types
3. **T019**: Auth login contract test (must fail initially)
4. **T084**: LoginPage component
5. **T064**: LoginButton component  
6. **T038**: AuthService implementation
7. **T020**: OAuth callback contract test
8. **T085**: CallbackPage component
9. **T032**: Complete E2E auth flow test

**Success Criteria**: User can log in with Spotify, get redirected back, and stay authenticated on page refresh.

This approach ensures you have a working authentication system before building any other features, and each page is fully functional before moving to the next one.

Would you like me to dive deeper into any specific page implementation or start with the detailed tasks for the Login Page?