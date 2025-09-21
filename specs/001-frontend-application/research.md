# Research Phase: VibeGuess Frontend Technical Decisions

**Date**: 2025-09-21  
**Phase**: 0 - Technology Research  
**Input**: Technical context requirements from plan.md

## Research Tasks Completed

### 1. Vite + React + TypeScript Project Setup (2025 Best Practices)

**Decision**: Vite 5.x + React 19 + TypeScript 5.x with strict configuration
**Rationale**: 
- Vite provides fastest development experience with HMR and ESM-native builds
- TypeScript strict mode catches errors early and improves maintainability
- React 19 includes enhanced concurrent features, automatic batching improvements, and better Suspense integration for real-time quiz interactions
- React 19's new compiler optimizations reduce bundle size and improve performance
- Industry cutting-edge for modern React applications in 2025

**Alternatives Considered**:
- React 18: Stable but lacks React 19's performance improvements and new features
- Create React App: Deprecated and slower build times
- Next.js: Overkill for SPA, adds SSR complexity not needed
- Webpack: More complex configuration, slower than Vite

**Implementation Notes**:
- Use `npm create vite@latest` with React-TS template and React 19
- Enable strict TypeScript mode and all recommended rules
- Configure path aliases for clean imports
- Leverage React 19's enhanced Suspense for quiz loading states

### 2. ShadCN/UI Integration with TailwindCSS 4 and Accessibility

**Decision**: ShadCN/UI v0.8+ with Radix UI primitives and TailwindCSS v4.x
**Rationale**:
- ShadCN provides copy-paste components with full accessibility built-in
- Radix UI primitives handle complex accessibility patterns (focus management, ARIA)
- TailwindCSS 4 introduces native CSS engine, 10x faster builds, and improved IntelliSense
- TailwindCSS 4's new Oxide engine provides better tree-shaking and smaller bundles
- Components are customizable and meet WCAG 2.1 AA requirements out of box
- TailwindCSS 4's enhanced container queries perfect for responsive quiz layouts

**Alternatives Considered**:
- TailwindCSS 3.x: Stable but lacks v4's performance improvements and new features
- Material-UI: Too opinionated, harder to customize
- Ant Design: Heavy bundle size, Chinese design language
- Chakra UI: Good but ShadCN has better TypeScript integration

**Implementation Notes**:
- Initialize with `npx shadcn-ui@latest init` and configure for TailwindCSS 4
- Custom color palette for VibeGuess branding using new CSS-first approach
- Dark/light mode support with next-themes
- Leverage TailwindCSS 4's native container queries for responsive quiz interfaces
- Use new @starting-style for smooth animations in quiz transitions

### 3. Spotify Web Playback SDK Integration in React

**Decision**: Spotify Web Playback SDK with React context wrapper
**Rationale**:
- Official SDK provides best integration with Spotify's playback controls
- React context allows sharing playback state across components
- Handles Premium/Free user differences automatically
- Supports real-time playback synchronization

**Alternatives Considered**:
- Spotify Web API only: Limited to 30s previews, no full playback
- Third-party wrappers: Less reliable, potential security risks
- IFrame player: Limited control, poor UX integration

**Implementation Notes**:
- Load SDK dynamically to avoid blocking initial page load
- Create PlaybackProvider context for global state management
- Handle authentication token refresh for API calls
- Graceful degradation for users without Premium

### 4. TanStack Query for Authentication and Real-time Data

**Decision**: TanStack Query v5 (React Query) with Zustand for client state
**Rationale**:
- Excellent caching and synchronization for API calls
- Built-in retry logic and error handling
- Optimistic updates for better perceived performance
- Separation of server state (TanStack Query) and client state (Zustand)

**Alternatives Considered**:
- SWR: Good but less features than TanStack Query
- Redux Toolkit Query: More complex setup, heavier bundle
- Plain fetch with useState: Too much boilerplate, no caching

**Implementation Notes**:
- Configure query client with appropriate stale times
- Use mutations for quiz creation and session management
- Background refetching for real-time data updates
- Error boundaries for query failures

### 5. Secure Token Storage and OAuth PKCE Flow

**Decision**: Memory + HttpOnly cookies hybrid approach with automatic refresh
**Rationale**:
- Access tokens in memory prevent XSS attacks
- Refresh tokens in HttpOnly cookies prevent CSRF while allowing rotation
- PKCE flow provides security without client secrets
- Automatic token refresh maintains seamless user experience

**Alternatives Considered**:
- localStorage only: Vulnerable to XSS attacks
- sessionStorage only: Lost on tab close, poor UX
- All HttpOnly cookies: Complex CSRF protection needed

**Implementation Notes**:
- Implement token refresh interceptor for API calls
- Clear memory tokens on page unload/refresh
- Secure cookie flags: HttpOnly, Secure, SameSite=Strict
- Handle edge cases: expired refresh tokens, network failures

### 6. Testing Strategy and Tools

**Decision**: Vitest + React Testing Library + Playwright + MSW
**Rationale**:
- Vitest: Faster than Jest, native ESM support, Vite integration
- RTL: Best practices for component testing, accessibility focused
- Playwright: Reliable E2E testing across browsers
- MSW: API mocking that works in both tests and development

**Alternatives Considered**:
- Jest: Slower, requires additional Vite configuration
- Cypress: Good but Playwright has better debugging tools
- Native fetch mocking: Too much boilerplate, less reliable

**Implementation Notes**:
- Configure Vitest with jsdom environment for React components
- MSW handlers mirror actual API responses from documentation
- Playwright tests cover complete user journeys
- Coverage reports with c8 integrated into Vitest

### 7. Performance Optimization Strategy

**Decision**: Code splitting + TanStack Query + Service Worker caching
**Rationale**:
- Route-based code splitting reduces initial bundle size
- Component-level lazy loading for heavy features (quiz editor)
- TanStack Query provides intelligent caching and background updates
- Service Worker enables offline quiz taking and background sync

**Alternatives Considered**:
- No optimization: Poor performance on slower devices
- Bundle splitting only: Misses runtime optimization opportunities
- Custom caching: More complex, error-prone than proven solutions

**Implementation Notes**:
- Use React.lazy for route and feature-based splitting
- Preload critical routes on user interaction
- Cache quiz data for offline functionality
- Monitor Core Web Vitals with web-vitals library

### 8. State Management Architecture

**Decision**: TanStack Query + Zustand + React Context (layered approach)
**Rationale**:
- TanStack Query: Server state, caching, synchronization
- Zustand: Global client state (user preferences, UI state)
- React Context: Feature-specific state (quiz session, playback)
- Minimal boilerplate, TypeScript-first, excellent DevTools

**Alternatives Considered**:
- Redux Toolkit: More complex, heavier learning curve
- Context only: Performance issues with frequent updates
- Jotai/Recoil: Good but less mature ecosystem

**Implementation Notes**:
- Separate stores by domain (auth, quiz, playback, settings)
- Use selectors to prevent unnecessary re-renders
- DevTools integration for debugging
- Persist user preferences with zustand/middleware/persist

## Technical Decisions Summary

| Category | Decision | Primary Benefit |
|----------|----------|----------------|
| **Build Tool** | Vite 5.x | Fastest dev experience, modern ESM |
| **Frontend** | React 19 + TypeScript 5.x | Latest concurrent features, compiler optimizations |
| **Styling** | TailwindCSS 4 + ShadCN/UI | Native CSS engine, 10x faster builds |
| **State Management** | TanStack Query + Zustand | Server/client separation, caching |
| **Authentication** | Memory + HttpOnly hybrid | Security + UX balance |
| **Testing** | Vitest + RTL + Playwright + MSW | Fast, reliable, comprehensive |
| **Performance** | Code splitting + SW caching | Fast loads, offline capability |
| **Spotify Integration** | Web Playbook SDK + Context | Official API, shared state |

## Risk Assessment and Mitigation

### High Priority Risks
1. **Spotify API Rate Limits**: Implement intelligent caching and request batching
2. **Token Security**: Use hybrid storage approach with automatic rotation
3. **Performance on Mobile**: Aggressive code splitting and lazy loading
4. **Accessibility Compliance**: Use ShadCN components with Radix primitives

### Medium Priority Risks
1. **Browser Compatibility**: Target modern browsers, graceful degradation
2. **Offline Functionality**: Service Worker with selective caching strategy
3. **Real-time Sync**: WebSocket fallback for polling if needed

## React 19 & TailwindCSS 4 Specific Benefits

### React 19 Enhancements for VibeGuess
- **Enhanced Concurrent Features**: Better handling of real-time quiz state updates
- **Improved Suspense**: Smoother loading states during quiz generation and playback
- **Automatic Batching**: Better performance when updating quiz scores and progress
- **Compiler Optimizations**: Reduced bundle size and faster quiz interactions
- **Better Error Boundaries**: Improved error handling for Spotify API failures

### TailwindCSS 4 Advantages
- **10x Faster Builds**: Faster development iteration for UI changes
- **Native Container Queries**: Perfect for responsive quiz question layouts
- **Smaller Bundles**: Better performance for mobile quiz takers
- **@starting-style**: Smooth animations for quiz transitions and feedback
- **Improved IntelliSense**: Better developer experience with autocomplete

## Next Steps for Phase 1
1. Create TypeScript interfaces for all entities and API responses
2. Generate API service contracts with error handling
3. Design component architecture with ShadCN integration leveraging React 19 features
4. Set up testing infrastructure with MSW mock handlers
5. Configure development environment with React 19 and TailwindCSS 4

---

*All technical unknowns resolved. Ready for Phase 1 design and contracts with cutting-edge React 19 and TailwindCSS 4.*