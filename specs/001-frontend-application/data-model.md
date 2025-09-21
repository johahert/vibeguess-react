# Data Model: VibeGuess Frontend Application

**Date**: 2025-09-21  
**Phase**: 1 - Data Models and Entities  
**Input**: Feature specification and API reference documentation

## Core Entities

### User Entity
```typescript
interface User {
  id: string;                    // Spotify user ID
  displayName: string;           // User's display name from Spotify
  email: string;                 // User's email address
  country: string;               // User's country code (e.g., "US")
  hasSpotifyPremium: boolean;    // Premium status affects playback capabilities
  profileImageUrl?: string;      // Optional profile image from Spotify
  createdAt: string;            // ISO timestamp of account creation
  lastLoginAt: string;          // ISO timestamp of last login
}

interface UserSettings {
  preferredLanguage: string;           // Default: "en"
  enableAudioPreview: boolean;         // Default: true
  defaultQuestionCount: number;        // Default: 10, range: 5-20
  defaultDifficulty: Difficulty;       // Default: "Medium"
  rememberDeviceSelection: boolean;    // Default: false
}

type Difficulty = "Easy" | "Medium" | "Hard";
```

### Quiz Entity
```typescript
interface Quiz {
  id: string;                    // Unique quiz identifier
  title: string;                 // AI-generated or user-provided title
  description: string;           // Brief description of quiz content
  questionCount: number;         // Number of questions in quiz
  difficulty: Difficulty;        // Quiz difficulty level
  estimatedDuration: number;     // Estimated completion time in seconds
  createdBy: string;            // User ID who created the quiz
  isPublic: boolean;            // Whether quiz can be shared/discovered
  tags: string[];               // Category tags for discovery
  createdAt: string;            // ISO timestamp of creation
  questions: Question[];         // Array of quiz questions
}

interface QuizGenerationRequest {
  prompt: string;                      // User's creative prompt
  questionCount: number;               // Desired number of questions
  format: "MultipleChoice";           // Question format (extensible)
  difficulty: Difficulty;              // Desired difficulty level  
  includeAudio: boolean;              // Whether to include audio previews
}
```

### Question Entity
```typescript
interface Question {
  id: string;                    // Unique question identifier
  text: string;                  // The question text
  type: "MultipleChoice";        // Question type (extensible)
  options: string[];             // Array of answer choices
  correctAnswer: string;         // The correct answer
  spotifyTrack?: SpotifyTrack;   // Associated Spotify track (optional)
  explanation?: string;          // Optional explanation for answer
}

interface SpotifyTrack {
  id: string;                    // Spotify track ID
  name: string;                  // Track name
  artist: string;                // Primary artist name
  album?: string;                // Album name
  previewUrl?: string;           // 30-second preview URL (may be null)
  durationMs: number;            // Track duration in milliseconds
  imageUrl?: string;             // Album artwork URL
}
```

### QuizSession Entity
```typescript
interface QuizSession {
  sessionId: string;             // Unique session identifier
  quizId: string;                // Reference to quiz being taken
  userId: string;                // User taking the quiz
  currentQuestionIndex: number;  // Current question position (0-based)
  score: number;                 // Current score
  startedAt: string;             // ISO timestamp when session began
  completedAt?: string;          // ISO timestamp when completed (if finished)
  isActive: boolean;             // Whether session is currently active
  answers: QuizAnswer[];         // Array of user answers
  timeSpent: number;             // Total time spent in milliseconds
}

interface QuizAnswer {
  questionId: string;            // Reference to question
  selectedAnswer: string;        // User's selected answer
  isCorrect: boolean;            // Whether answer was correct
  timeToAnswer: number;          // Time taken to answer in milliseconds
  answeredAt: string;            // ISO timestamp of answer
}

interface QuizResult {
  sessionId: string;             // Reference to completed session
  quizId: string;                // Reference to quiz
  totalQuestions: number;        // Total questions in quiz
  correctAnswers: number;        // Number of correct answers
  score: number;                 // Final score (same as correctAnswers)
  percentage: number;            // Score as percentage
  timeSpent: number;             // Total time in milliseconds
  completedAt: string;           // Completion timestamp
  answers: QuizAnswer[];         // All answers with details
}
```

### Spotify Playback Entities
```typescript
interface SpotifyDevice {
  id: string;                    // Spotify device ID
  name: string;                  // Human-readable device name
  type: DeviceType;              // Device type category
  isActive: boolean;             // Currently active device
  isPrivateSession: boolean;     // Private listening session
  isRestricted: boolean;         // Device has restrictions
  volumePercent: number;         // Current volume (0-100)
}

type DeviceType = 
  | "Computer" 
  | "Smartphone" 
  | "Speaker" 
  | "TV" 
  | "AVR" 
  | "STB" 
  | "AudioDongle" 
  | "GameConsole" 
  | "CastVideo" 
  | "CastAudio" 
  | "Automobile" 
  | "Unknown";

interface PlaybackState {
  isPlaying: boolean;            // Currently playing state
  trackId?: string;              // Current Spotify track ID
  trackName?: string;            // Current track name
  artistName?: string;           // Current artist name
  albumName?: string;            // Current album name
  progressMs: number;            // Current playback position
  durationMs: number;            // Track duration
  device?: SpotifyDevice;        // Active playback device
  volume: number;                // Current volume (0-100)
  shuffleState: boolean;         // Shuffle enabled
  repeatState: RepeatMode;       // Repeat mode
}

type RepeatMode = "off" | "context" | "track";

interface PlaybackCommand {
  action: "play" | "pause" | "next" | "previous" | "seek";
  trackId?: string;              // For play commands
  deviceId?: string;             // Target device
  positionMs?: number;           // For seek commands
}
```

### Authentication Entities
```typescript
interface AuthTokens {
  accessToken: string;           // Spotify access token (JWT)
  refreshToken: string;          // Refresh token for renewal
  expiresIn: number;             // Token expiration time in seconds
  tokenType: "Bearer";           // Token type
  scope?: string;                // Granted scopes
  expiresAt: number;             // Calculated expiration timestamp
}

interface AuthState {
  isAuthenticated: boolean;      // User authentication status
  user?: User;                   // Current user profile
  tokens?: AuthTokens;           // Current tokens (in memory only)
  lastTokenRefresh: number;      // Last refresh timestamp
  authError?: string;            // Authentication error message
}

interface OAuthFlow {
  authorizationUrl: string;      // Spotify authorization URL
  codeVerifier: string;          // PKCE code verifier
  state: string;                 // CSRF protection state
  redirectUri: string;           // Callback URL
}
```

### API Response Wrappers
```typescript
interface ApiResponse<T> {
  data?: T;                      // Response data if successful
  error?: ApiError;              // Error information if failed
  success: boolean;              // Request success status
  timestamp: string;             // Response timestamp
  correlationId?: string;        // Request tracking ID
}

interface ApiError {
  code: string;                  // Error code (e.g., "invalid_request")
  message: string;               // Human-readable error message
  details?: Record<string, unknown>; // Additional error context
}

interface PaginatedResponse<T> {
  items: T[];                    // Array of items
  pagination: {
    page: number;                // Current page number
    limit: number;               // Items per page
    total: number;               // Total items available
    totalPages: number;          // Total pages available
    hasNext: boolean;            // Whether next page exists
    hasPrevious: boolean;        // Whether previous page exists
  };
}
```

### Client-Side State Entities
```typescript
interface AppState {
  theme: "light" | "dark" | "system";     // UI theme preference
  sidebarCollapsed: boolean;               // Navigation state
  notifications: Notification[];           // In-app notifications
  isOnline: boolean;                      // Network connectivity status
  lastSyncAt?: string;                    // Last data synchronization
}

interface Notification {
  id: string;                    // Unique notification ID
  type: "success" | "error" | "warning" | "info";
  title: string;                 // Notification title
  message: string;               // Notification content
  timestamp: string;             // Creation timestamp
  read: boolean;                 // Read status
  persistent: boolean;           // Whether notification auto-dismisses
}

interface QuizCache {
  quizId: string;                // Cached quiz ID
  quiz: Quiz;                    // Full quiz data
  cachedAt: string;              // Cache timestamp
  expiresAt: string;             // Cache expiration
  version: number;               // Cache version for invalidation
}
```

## Entity Relationships

### Primary Relationships
- **User** (1) → **Quiz** (Many): Users can create multiple quizzes
- **Quiz** (1) → **Question** (Many): Each quiz contains multiple questions  
- **User** (1) → **QuizSession** (Many): Users can have multiple active/completed sessions
- **Quiz** (1) → **QuizSession** (Many): Quizzes can be taken multiple times
- **QuizSession** (1) → **QuizAnswer** (Many): Each session contains multiple answers
- **Question** (1) → **SpotifyTrack** (0..1): Questions may have associated tracks
- **User** (1) → **SpotifyDevice** (Many): Users may have multiple devices

### State Dependencies
- **AuthState** manages **User** and **AuthTokens** lifecycle
- **PlaybackState** requires valid **AuthTokens** and **SpotifyDevice**
- **QuizSession** requires authenticated **User** and valid **Quiz**
- **QuizCache** enables offline functionality for **Quiz** entities

## Validation Rules

### Business Rules
- Quiz question count must be between 5-20
- Quiz sessions expire after 24 hours of inactivity
- Only authenticated users can create quizzes
- Premium users can control device playback, Free users get previews only
- Quiz answers cannot be modified once submitted

### Data Integrity
- All timestamps must be valid ISO 8601 format
- Score calculations must match question count and correct answers
- Device selection requires active Spotify session
- Token refresh must occur before expiration (with 5-minute buffer)

### Performance Constraints
- Quiz cache maximum size: 50 quizzes per user
- API response timeout: 10 seconds
- Audio preview preloading: Maximum 3 concurrent streams
- Playback state updates: Maximum 1 per second

---

*Data models support all functional requirements and provide foundation for Phase 2 task generation.*