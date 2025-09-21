# Quiz Management API Contract

**Base URL**: `https://localhost:7009/api`  
**Authentication**: Bearer Token required for all endpoints  
**Content-Type**: `application/json`

## Endpoints

### POST /quiz/generate
Generates an AI-powered quiz based on user prompt.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```typescript
interface QuizGenerationRequest {
  prompt: string;                      // User's creative prompt (e.g., "90s rock bands")
  questionCount: number;               // Number of questions (5-20)
  format: "MultipleChoice";           // Question format (extensible)
  difficulty: "Easy" | "Medium" | "Hard"; // Desired difficulty level
  includeAudio: boolean;              // Include Spotify track previews
}
```

**Response (201):**
```typescript
interface QuizGenerationResponse {
  id: string;                    // Unique quiz identifier
  title: string;                 // AI-generated quiz title
  description: string;           // Brief description of content
  questionCount: number;         // Number of generated questions
  difficulty: "Easy" | "Medium" | "Hard"; // Quiz difficulty level
  estimatedDuration: number;     // Estimated completion time (seconds)
  createdAt: string;            // Creation timestamp (ISO 8601)
  questions: Array<{
    id: string;                        // Unique question ID
    text: string;                      // Question text
    type: "MultipleChoice";           // Question type
    options: string[];                 // Answer choices array
    correctAnswer: string;             // Correct answer
    spotifyTrack?: {
      id: string;                      // Spotify track ID
      name: string;                    // Track name
      artist: string;                  // Artist name
      album?: string;                  // Album name
      previewUrl?: string;             // 30-second preview URL
      durationMs: number;              // Track duration
      imageUrl?: string;               // Album artwork
    };
  }>;
}
```

**Error Responses:**
- `400 Bad Request`: Invalid prompt or parameters
- `401 Unauthorized`: Invalid or expired access token
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: AI generation service error

---

### GET /quiz/{id}
Retrieves a specific quiz by ID.

**Headers:**
```
Authorization: Bearer <access_token> (optional for public quizzes)
```

**Parameters:**
- `id` (path): Quiz unique identifier

**Response (200):**
```typescript
interface QuizDetailsResponse {
  id: string;                    // Quiz identifier
  title: string;                 // Quiz title
  description: string;           // Quiz description
  questionCount: number;         // Number of questions
  difficulty: "Easy" | "Medium" | "Hard"; // Difficulty level
  createdBy: string;            // Creator user ID
  isPublic: boolean;            // Public visibility status
  tags: string[];               // Category tags
  createdAt: string;            // Creation timestamp
  estimatedDuration: number;     // Estimated duration (seconds)
  // Note: Full questions only included when starting a session
}
```

**Error Responses:**
- `404 Not Found`: Quiz does not exist or is private
- `401 Unauthorized`: Private quiz requires authentication
- `500 Internal Server Error`: Quiz retrieval error

---

### POST /quiz/{id}/start-session
Starts a new quiz session for gameplay.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Parameters:**
- `id` (path): Quiz unique identifier

**Request:**
```typescript
interface StartSessionRequest {
  deviceId?: string;             // Optional Spotify device for playback
}
```

**Response (201):**
```typescript
interface StartSessionResponse {
  sessionId: string;             // Unique session identifier
  quizId: string;                // Reference to quiz
  currentQuestionIndex: number;  // Starting question (0)
  score: number;                 // Initial score (0)
  startedAt: string;            // Session start timestamp
  isActive: boolean;            // Session active status (true)
  timeLimit?: number;           // Time limit per question (seconds)
  quiz: QuizGenerationResponse; // Full quiz with questions
}
```

**Error Responses:**
- `400 Bad Request`: Invalid device ID or quiz not playable
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Quiz not found
- `409 Conflict`: User already has active session for this quiz
- `500 Internal Server Error`: Session creation error

---

### GET /quiz/my-quizzes
Retrieves user's quiz history with pagination.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)
- `status` (optional): Filter by completion status ("completed" | "active" | "all")

**Response (200):**
```typescript
interface UserQuizzesResponse {
  quizzes: Array<{
    id: string;                  // Quiz ID
    title: string;               // Quiz title
    completedAt?: string;        // Completion timestamp (if completed)
    score?: number;              // Final score (if completed)
    totalQuestions: number;      // Total question count
    difficulty: "Easy" | "Medium" | "Hard"; // Difficulty level
    sessionId?: string;          // Session ID (if active)
    isActive: boolean;          // Whether session is active
    createdAt: string;          // Quiz creation timestamp
  }>;
  pagination: {
    page: number;                // Current page
    limit: number;               // Items per page
    total: number;               // Total items
    totalPages: number;          // Total pages
    hasNext: boolean;           // Has next page
    hasPrevious: boolean;       // Has previous page
  };
}
```

**Error Responses:**
- `401 Unauthorized`: Authentication required
- `400 Bad Request`: Invalid pagination parameters
- `500 Internal Server Error`: Quiz history retrieval error

---

### POST /quiz/{sessionId}/answer
Submits an answer for the current question in an active session.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Parameters:**
- `sessionId` (path): Active session identifier

**Request:**
```typescript
interface SubmitAnswerRequest {
  questionId: string;            // Current question ID
  selectedAnswer: string;        // User's selected answer
  timeToAnswer: number;          // Time taken to answer (milliseconds)
}
```

**Response (200):**
```typescript
interface SubmitAnswerResponse {
  isCorrect: boolean;            // Whether answer was correct
  correctAnswer: string;         // The correct answer
  explanation?: string;          // Optional explanation
  currentScore: number;          // Updated session score
  nextQuestionIndex?: number;    // Next question index (if not finished)
  isSessionComplete: boolean;    // Whether quiz is finished
  sessionResult?: {
    finalScore: number;          // Final score
    totalQuestions: number;      // Total questions
    percentage: number;          // Score percentage
    completedAt: string;        // Completion timestamp
  };
}
```

**Error Responses:**
- `400 Bad Request`: Invalid question ID or session not active
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Session not found
- `409 Conflict`: Question already answered
- `500 Internal Server Error`: Answer processing error

## TypeScript Service Interface

```typescript
interface QuizService {
  // Quiz Generation
  generateQuiz(params: QuizGenerationRequest): Promise<QuizGenerationResponse>;
  
  // Quiz Retrieval
  getQuiz(id: string): Promise<QuizDetailsResponse>;
  getUserQuizzes(params?: {
    page?: number;
    limit?: number;
    status?: "completed" | "active" | "all";
  }): Promise<UserQuizzesResponse>;
  
  // Session Management
  startSession(quizId: string, deviceId?: string): Promise<StartSessionResponse>;
  submitAnswer(sessionId: string, answer: SubmitAnswerRequest): Promise<SubmitAnswerResponse>;
  getSessionStatus(sessionId: string): Promise<QuizSessionStatus>;
  
  // Utilities
  validateQuizParams(params: QuizGenerationRequest): ValidationResult;
  estimateQuizDuration(questionCount: number, difficulty: string): number;
}

interface QuizSessionStatus {
  sessionId: string;
  isActive: boolean;
  currentQuestionIndex: number;
  score: number;
  questionsRemaining: number;
  timeElapsed: number;
}
```

## Caching Strategy

### Client-Side Caching
- **Quiz Details**: Cache for 1 hour, invalidate on updates
- **User Quiz History**: Cache for 5 minutes, background refresh
- **Active Sessions**: No caching, always fetch fresh data
- **Generated Quizzes**: Cache indefinitely until user clears

### Cache Keys
```typescript
const CACHE_KEYS = {
  QUIZ_DETAILS: (id: string) => `quiz:${id}`,
  USER_QUIZZES: (userId: string, page: number) => `user-quizzes:${userId}:${page}`,
  QUIZ_SESSION: (sessionId: string) => `session:${sessionId}`,
} as const;
```

## Error Handling Patterns

### Retry Logic
- **Quiz Generation**: Retry up to 3 times with exponential backoff
- **Session Operations**: Single retry after token refresh
- **Answer Submission**: No automatic retry (user must re-submit)

### Offline Support
- Cache completed quizzes for offline review
- Queue answer submissions when offline
- Sync queued data when connection restored

---

*This contract covers all quiz-related operations with comprehensive error handling and performance considerations.*