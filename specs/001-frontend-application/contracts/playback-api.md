# Spotify Playback API Contract

**Base URL**: `https://localhost:7009/api`  
**Authentication**: Bearer Token required (Spotify Premium for device control)  
**Content-Type**: `application/json`

## Endpoints

### GET /playback/devices
Retrieves available Spotify playback devices for the authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```typescript
interface PlaybackDevicesResponse {
  devices: Array<{
    id: string;                  // Spotify device ID
    name: string;                // Human-readable device name
    type: DeviceType;           // Device category
    isActive: boolean;          // Currently active for playback
    isPrivateSession: boolean;  // Private listening mode
    isRestricted: boolean;      // Has playback restrictions
    volumePercent: number;      // Current volume (0-100)
    supportsVolume: boolean;    // Device supports volume control
  }>;
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
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired access token
- `403 Forbidden`: User lacks Spotify Premium (for device control)
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Spotify API error

---

### POST /playback/play
Starts or resumes playback on specified device.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```typescript
interface PlaybackPlayRequest {
  trackId?: string;              // Spotify track URI (optional - resume if not provided)
  deviceId: string;              // Target device ID
  positionMs?: number;           // Start position in milliseconds (default: 0)
  volume?: number;               // Playback volume 0-100 (optional)
}
```

**Response (200):**
```typescript
interface PlaybackControlResponse {
  success: boolean;              // Operation success status
  message: string;               // Human-readable result message
  playbackState?: {
    isPlaying: boolean;          // Current playback state
    trackId?: string;            // Current track ID
    positionMs: number;          // Current position
    device: {
      id: string;                // Active device ID
      name: string;              // Active device name
    };
  };
}
```

**Error Responses:**
- `400 Bad Request`: Invalid track ID or device ID
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Premium required or device restricted
- `404 Not Found`: Track or device not found
- `500 Internal Server Error`: Playback control error

---

### POST /playback/pause
Pauses playback on specified device.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```typescript
interface PlaybackPauseRequest {
  deviceId: string;              // Target device ID
}
```

**Response (200):**
```typescript
interface PlaybackControlResponse {
  success: boolean;              // Operation success status
  message: string;               // Result message
  playbackState?: {
    isPlaying: false;            // Paused state
    positionMs: number;          // Position when paused
    device: {
      id: string;                // Device ID
      name: string;              // Device name
    };
  };
}
```

**Error Responses:**
- `400 Bad Request`: Invalid device ID or no active playback
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Premium required
- `500 Internal Server Error`: Pause operation error

---

### GET /playback/status
Gets current playback status across all user devices.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```typescript
interface PlaybackStatusResponse {
  isPlaying: boolean;            // Global playback state
  trackId?: string;              // Current track Spotify ID
  trackName?: string;            // Current track name
  artistName?: string;           // Primary artist name
  albumName?: string;            // Album name
  progressMs: number;            // Current playback position
  durationMs: number;            // Total track duration
  device?: {
    id: string;                  // Active device ID
    name: string;                // Active device name
    type: DeviceType;           // Device type
    volumePercent: number;      // Current volume
  };
  shuffleState: boolean;         // Shuffle enabled
  repeatState: "off" | "context" | "track"; // Repeat mode
  timestamp: string;             // Status timestamp (ISO 8601)
}
```

**Response (204):** No active playback session

**Error Responses:**
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Status retrieval error

---

### POST /playback/seek
Seeks to specific position in current track.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```typescript
interface PlaybackSeekRequest {
  positionMs: number;            // Target position in milliseconds
  deviceId?: string;             // Optional target device
}
```

**Response (200):**
```typescript
interface PlaybackControlResponse {
  success: boolean;              // Seek operation success
  message: string;               // Result message
  playbackState?: {
    positionMs: number;          // New playback position
    isPlaying: boolean;          // Playback state after seek
  };
}
```

**Error Responses:**
- `400 Bad Request`: Invalid position or no active track
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Premium required
- `500 Internal Server Error`: Seek operation error

---

### POST /playback/volume
Sets playback volume on specified device.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```typescript
interface PlaybackVolumeRequest {
  volumePercent: number;         // Volume level 0-100
  deviceId: string;              // Target device ID
}
```

**Response (200):**
```typescript
interface PlaybackControlResponse {
  success: boolean;              // Volume change success
  message: string;               // Result message
  volumePercent?: number;        // New volume level
}
```

**Error Responses:**
- `400 Bad Request`: Invalid volume level or device doesn't support volume
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Premium required or device restricted
- `500 Internal Server Error`: Volume control error

## TypeScript Service Interface

```typescript
interface SpotifyPlaybackService {
  // Device Management
  getDevices(): Promise<PlaybackDevicesResponse>;
  selectDevice(deviceId: string): Promise<void>;
  
  // Playback Control
  play(params: {
    trackId?: string;
    deviceId: string;
    positionMs?: number;
    volume?: number;
  }): Promise<PlaybackControlResponse>;
  
  pause(deviceId: string): Promise<PlaybackControlResponse>;
  resume(deviceId: string): Promise<PlaybackControlResponse>;
  
  // Playback Information
  getPlaybackStatus(): Promise<PlaybackStatusResponse>;
  seek(positionMs: number, deviceId?: string): Promise<PlaybackControlResponse>;
  setVolume(volumePercent: number, deviceId: string): Promise<PlaybackControlResponse>;
  
  // Utilities
  isUserPremium(): Promise<boolean>;
  formatTrackDuration(durationMs: number): string;
  formatPlaybackPosition(positionMs: number, durationMs: number): string;
}
```

## Client-Side Playback Management

### Web Playback SDK Integration
```typescript
interface WebPlaybackSDKManager {
  // SDK Lifecycle
  initialize(accessToken: string): Promise<void>;
  connect(): Promise<string>; // Returns device ID
  disconnect(): Promise<void>;
  
  // Event Handlers
  onReady(callback: (device: { device_id: string }) => void): void;
  onStateChanged(callback: (state: Spotify.PlaybackState) => void): void;
  onPlayerError(callback: (error: Spotify.Error) => void): void;
  
  // Playback Control (for Web Player)
  togglePlay(): Promise<void>;
  previousTrack(): Promise<void>;
  nextTrack(): Promise<void>;
  seek(positionMs: number): Promise<void>;
  setVolume(volume: number): Promise<void>;
  
  // State Management
  getCurrentState(): Promise<Spotify.PlaybackState | null>;
  getVolume(): Promise<number>;
}
```

### Playback State Management
```typescript
interface PlaybackStateManager {
  // Global State
  currentTrack?: SpotifyTrack;
  isPlaying: boolean;
  position: number;
  duration: number;
  volume: number;
  activeDevice?: SpotifyDevice;
  
  // State Updates
  updateFromSpotifyState(state: Spotify.PlaybackState): void;
  updateFromAPIResponse(response: PlaybackStatusResponse): void;
  
  // Event Emitters
  onTrackChange(callback: (track: SpotifyTrack) => void): void;
  onPlayStateChange(callback: (isPlaying: boolean) => void): void;
  onPositionChange(callback: (position: number) => void): void;
}
```

## Error Handling and Fallbacks

### Premium vs Free User Handling
```typescript
interface PlaybackCapabilities {
  canControlDevices: boolean;     // Premium only
  canPlayFullTracks: boolean;     // Premium only
  canSeek: boolean;              // Premium only
  canControlVolume: boolean;     // Premium + device support
  maxPreviewDuration: number;    // 30s for Free users
}

interface PlaybackFallbacks {
  // For Free Users
  playPreview(trackId: string): Promise<void>;
  showUpgradePrompt(): void;
  
  // For Premium Users Without Devices
  showDeviceSetupInstructions(): void;
  launchSpotifyApp(): void;
  
  // General Fallbacks
  handlePlaybackError(error: PlaybackError): void;
  retryWithExponentialBackoff<T>(operation: () => Promise<T>): Promise<T>;
}
```

### Offline Support
```typescript
interface OfflinePlayback {
  // Cache Management
  cacheTrackPreview(trackId: string, previewUrl: string): Promise<void>;
  getCachedPreview(trackId: string): Promise<Blob | null>;
  clearPreviewCache(): Promise<void>;
  
  // Offline State
  isOffline: boolean;
  showOfflineMessage(): void;
  queuePlaybackAction(action: PlaybackAction): void;
  syncQueuedActions(): Promise<void>;
}
```

## Performance Considerations

### Rate Limiting
- Device polling: Maximum once per 5 seconds
- Playback status: Maximum once per second during active playback
- Volume changes: Debounce to prevent spam (500ms)
- Seek operations: Throttle to 2 per second maximum

### Caching Strategy
- Device list: Cache for 30 seconds, refresh on user action
- Playback status: No caching for real-time updates
- Track metadata: Cache for 1 hour per track
- User capabilities: Cache for session duration

### Battery Optimization
- Reduce polling frequency when app backgrounded
- Pause real-time updates when not actively playing
- Use efficient event listeners instead of polling where possible

---

*This contract provides comprehensive Spotify integration with proper error handling for both Premium and Free users.*