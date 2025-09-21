# OAuth-First Implementation Tasks
**Priority**: Start with authentication foundation before any other features

## 🎯 **Immediate Implementation Path** 
*Complete these in order - each builds on the previous*

### **Sprint 1: Project Foundation** (Days 1-2)
```bash
# Can be done in parallel after T001
[P] = Parallel execution possible
```

#### Setup Tasks (Sequential then Parallel)
- [ ] **T001** Initialize Vite + React 19 project: `npm create vite@latest vibeguess-frontend --template react-ts`
- [ ] **T002** [P] Install React 19: `npm install react@^19.0.0 react-dom@^19.0.0`
- [ ] **T003** [P] Install TailwindCSS 4: `npm install -D tailwindcss@next @tailwindcss/vite@next`
- [ ] **T004** [P] Setup ShadCN/UI: `npx shadcn-ui@latest init`
- [ ] **T005** [P] Install state management: `npm install @tanstack/react-query zustand`
- [ ] **T006** [P] Install router: `npm install react-router-dom@^6.0.0`
- [ ] **T007** [P] Install testing: `npm install -D vitest @testing-library/react @testing-library/jest-dom playwright msw`
- [ ] **T008** Create folder structure: `mkdir -p src/{components/{auth,ui,layout},pages,services,stores,types,utils,hooks}`
- [ ] **T009** [P] Configure Vite: Add environment variables and proxy settings
- [ ] **T010** [P] Configure TailwindCSS 4: Update config for new CSS engine

**Validation**: `npm run dev` works, hot reload active, folder structure created

---

### **Sprint 2: Authentication Types & Contracts** (Day 3)

#### TypeScript Foundation  
- [ ] **T015-Auth** Create auth types in `src/types/auth.ts`:
  ```typescript
  interface AuthTokens {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: 'Bearer';
    scope: string;
  }
  
  interface AuthState {
    isAuthenticated: boolean;
    user: SpotifyUser | null;
    tokens: AuthTokens | null;
    isLoading: boolean;
    error: string | null;
  }
  
  interface SpotifyUser {
    id: string;
    display_name: string;
    email: string;
    images: Array<{url: string; height: number; width: number}>;
    product: 'free' | 'premium';
    country: string;
  }
  ```

#### Contract Tests (TDD - MUST FAIL FIRST)
- [ ] **T019-Login** Create login contract test `tests/contract/auth-login.test.ts`:
  ```typescript
  describe('POST /auth/spotify/login', () => {
    it('should return authorization URL with PKCE params', async () => {
      const response = await authService.initiateLogin();
      expect(response.authorization_url).toContain('spotify.com/authorize');
      expect(response.authorization_url).toContain('code_challenge');
      expect(response.state).toHaveLength(32);
    });
  });
  ```

- [ ] **T020-Callback** Create callback contract test `tests/contract/auth-callback.test.ts`:
  ```typescript
  describe('POST /auth/spotify/callback', () => {
    it('should exchange auth code for access tokens', async () => {
      const tokens = await authService.handleCallback('test_code', 'test_state');
      expect(tokens.access_token).toBeDefined();
      expect(tokens.refresh_token).toBeDefined();
      expect(tokens.expires_in).toBeGreaterThan(0);
    });
  });
  ```

**Validation**: Tests exist and FAIL (proves they test real behavior)

---

### **Sprint 3: Login Page Implementation** (Day 4)

#### Core Authentication Service
- [ ] **T038-AuthService** Create `src/services/auth.service.ts`:
  ```typescript
  class AuthService {
    private baseURL = import.meta.env.VITE_API_BASE_URL;
    
    async initiateSpotifyLogin(): Promise<{authorization_url: string; state: string}> {
      // Generate PKCE code challenge
      // Call API to get Spotify authorization URL
      // Return URL and state for redirect
    }
    
    async handleCallback(code: string, state: string): Promise<AuthTokens> {
      // Exchange authorization code for tokens
      // Store tokens securely
      // Return tokens
    }
    
    async refreshToken(): Promise<AuthTokens> {
      // Refresh expired access token
    }
    
    logout(): void {
      // Clear stored tokens
      // Reset auth state
    }
  }
  ```

#### OAuth Utilities  
- [ ] **T039-OAuth** Create `src/utils/oauth.ts`:
  ```typescript
  export function generateCodeChallenge(): {codeVerifier: string; codeChallenge: string} {
    // Generate PKCE code verifier and challenge
  }
  
  export function generateState(): string {
    // Generate cryptographically secure state parameter
  }
  
  export function buildSpotifyAuthURL(params: AuthURLParams): string {
    // Build Spotify authorization URL with all required params
  }
  ```

#### Login Page Component
- [ ] **T084-LoginPage** Create `src/pages/LoginPage.tsx`:
  ```typescript
  export default function LoginPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    
    const handleLogin = async () => {
      setIsLoading(true);
      try {
        const {authorization_url} = await authService.initiateSpotifyLogin();
        window.location.href = authorization_url;
      } catch (error) {
        // Handle error
      }
    };
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-600">
        <Card className="w-full max-w-md p-8">
          <h1>Welcome to VibeGuess</h1>
          <p>Create music quizzes from your Spotify playlists</p>
          <LoginButton onClick={handleLogin} loading={isLoading} />
        </Card>
      </div>
    );
  }
  ```

#### Login Button Component
- [ ] **T064-LoginButton** Create `src/components/auth/LoginButton.tsx`:
  ```typescript
  interface LoginButtonProps {
    onClick: () => void;
    loading?: boolean;
  }
  
  export default function LoginButton({onClick, loading}: LoginButtonProps) {
    return (
      <Button 
        onClick={onClick} 
        disabled={loading}
        className="w-full bg-spotify-green hover:bg-spotify-green-dark"
      >
        {loading ? <Spinner /> : <SpotifyIcon />}
        Connect with Spotify
      </Button>
    );
  }
  ```

**Validation**: Login page loads, button click redirects to Spotify

---

### **Sprint 4: OAuth Callback & State Management** (Day 5)

#### Callback Page Implementation  
- [ ] **T085-CallbackPage** Create `src/pages/CallbackPage.tsx`:
  ```typescript
  export default function CallbackPage() {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    
    useEffect(() => {
      const handleCallback = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        
        if (error) {
          setStatus('error');
          return;
        }
        
        try {
          await authService.handleCallback(code!, state!);
          setStatus('success');
          navigate('/dashboard');
        } catch (err) {
          setStatus('error');
        }
      };
      
      handleCallback();
    }, []);
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        {status === 'loading' && <LoadingSpinner text="Completing login..." />}
        {status === 'success' && <SuccessMessage />}
        {status === 'error' && <ErrorMessage />}
      </div>
    );
  }
  ```

#### Auth Store with Zustand
- [ ] **T049-AuthStore** Create `src/stores/auth.store.ts`:
  ```typescript
  interface AuthStore {
    isAuthenticated: boolean;
    user: SpotifyUser | null;
    tokens: AuthTokens | null;
    isLoading: boolean;
    error: string | null;
    
    setTokens: (tokens: AuthTokens) => void;
    setUser: (user: SpotifyUser) => void;
    logout: () => void;
    clearError: () => void;
  }
  
  export const useAuthStore = create<AuthStore>((set) => ({
    // Implementation with Zustand
  }));
  ```

#### Auth Hook with TanStack Query
- [ ] **T053-UseAuth** Create `src/hooks/useAuth.ts`:
  ```typescript
  export function useAuth() {
    const authStore = useAuthStore();
    
    const loginMutation = useMutation({
      mutationFn: authService.initiateSpotifyLogin,
      onSuccess: (data) => {
        window.location.href = data.authorization_url;
      },
    });
    
    const userQuery = useQuery({
      queryKey: ['auth', 'user'],
      queryFn: () => authService.getCurrentUser(),
      enabled: authStore.isAuthenticated,
    });
    
    return {
      ...authStore,
      login: loginMutation.mutate,
      isLoginLoading: loginMutation.isPending,
      user: userQuery.data,
    };
  }
  ```

**Validation**: Complete OAuth flow works - login → Spotify → callback → authenticated state

---

### **Sprint 5: Navigation & Protected Routes** (Day 6-7)

#### Router Configuration
- [ ] **T091-Router** Update `src/App.tsx`:
  ```typescript
  function App() {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/callback" element={<CallbackPage />} />
            <Route path="/" element={
              <AuthGuard>
                <MainLayout>
                  <Routes>
                    <Route path="/dashboard" element={<HomePage />} />
                    <Route path="/quiz/create" element={<QuizCreationPage />} />
                    <Route path="/quiz/library" element={<QuizLibraryPage />} />
                    {/* Other protected routes */}
                  </Routes>
                </MainLayout>
              </AuthGuard>
            } />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    );
  }
  ```

#### Auth Guard Component
- [ ] **T066-AuthGuard** Create `src/components/auth/AuthGuard.tsx`:
  ```typescript
  interface AuthGuardProps {
    children: React.ReactNode;
  }
  
  export default function AuthGuard({children}: AuthGuardProps) {
    const {isAuthenticated, isLoading} = useAuth();
    
    if (isLoading) {
      return <LoadingSpinner />;
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    
    return <>{children}</>;
  }
  ```

#### Basic Dashboard
- [ ] **T083-HomePage** Create `src/pages/HomePage.tsx`:
  ```typescript
  export default function HomePage() {
    const {user} = useAuth();
    
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">
          Welcome back, {user?.display_name}!
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickStatsCard />
          <CreateQuizCard />
          <RecentQuizzesCard />
        </div>
      </div>
    );
  }
  ```

**Validation**: Protected routes work, unauthenticated users redirect to login

---

### **Sprint 6: E2E Testing & Polish** (Day 8)

#### End-to-End Auth Flow Test
- [ ] **T032-E2E** Create `tests/e2e/auth-flow.spec.ts`:
  ```typescript
  test('complete OAuth authentication flow', async ({page}) => {
    // Visit login page
    await page.goto('/login');
    
    // Click login button
    await page.click('[data-testid="login-button"]');
    
    // Should redirect to Spotify (or mock)
    await expect(page).toHaveURL(/spotify\.com\/authorize/);
    
    // Mock successful callback
    await page.goto('/callback?code=test_code&state=test_state');
    
    // Should end up on dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Welcome back');
  });
  ```

#### Token Storage Security
- [ ] **T040-TokenStorage** Create `src/utils/token-storage.ts`:
  ```typescript
  class SecureTokenStorage {
    private encryptionKey = import.meta.env.VITE_ENCRYPTION_KEY;
    
    setTokens(tokens: AuthTokens): void {
      const encrypted = this.encrypt(JSON.stringify(tokens));
      localStorage.setItem('auth_tokens', encrypted);
    }
    
    getTokens(): AuthTokens | null {
      const encrypted = localStorage.getItem('auth_tokens');
      if (!encrypted) return null;
      
      try {
        const decrypted = this.decrypt(encrypted);
        return JSON.parse(decrypted);
      } catch {
        return null;
      }
    }
    
    clearTokens(): void {
      localStorage.removeItem('auth_tokens');
    }
    
    private encrypt(text: string): string {
      // Implement encryption
    }
    
    private decrypt(encrypted: string): string {
      // Implement decryption  
    }
  }
  ```

**Validation**: All auth tests pass, tokens stored securely, refresh page maintains login

---

## 🏆 **Success Criteria for OAuth Foundation**

### **Technical Validation**
- [ ] All contract tests pass (previously failing)
- [ ] E2E auth flow completes successfully  
- [ ] Page refresh maintains authenticated state
- [ ] Token refresh works automatically
- [ ] Logout clears all stored data
- [ ] Error handling for OAuth failures

### **User Experience Validation**
- [ ] Login page loads in <2s
- [ ] OAuth redirect feels instant
- [ ] Loading states prevent user confusion
- [ ] Error messages are helpful and actionable
- [ ] Mobile responsive design works

### **Security Validation** 
- [ ] Tokens encrypted in localStorage
- [ ] PKCE flow implemented correctly
- [ ] State parameter prevents CSRF attacks
- [ ] No sensitive data in URL after callback
- [ ] Automatic token cleanup on logout

## 🚀 **Next Steps After OAuth Complete**

Once authentication is rock-solid, you can tackle other pages in this order:

1. **Dashboard/Home Page**: Central navigation hub
2. **Quiz Creation Page**: AI-powered quiz generation  
3. **Quiz Library Page**: Manage created quizzes
4. **Quiz Playing Page**: Interactive quiz experience
5. **Settings Page**: Account and preferences management

Each page follows the same TDD pattern: Contract tests → Implementation → E2E validation.

**Ready to start with T001 (project setup)?** I can guide you through each step and help debug any issues that come up.