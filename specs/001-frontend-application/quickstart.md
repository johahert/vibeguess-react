# VibeGuess Frontend Quickstart Guide

**Purpose**: End-to-end validation of all core user journeys  
**Audience**: Developers, QA testers, stakeholders  
**Prerequisites**: API server running, valid Spotify Developer credentials

## 🚀 Complete User Journey Test

### Setup Requirements
1. **API Server**: VibeGuess API running at `https://localhost:7009`
2. **Spotify Setup**: Valid Spotify account (Premium recommended for full testing)
3. **Browser**: Modern browser with JavaScript enabled (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ for React 19 support)
4. **Network**: Stable internet connection for Spotify integration
5. **Node.js**: Version 18+ required for React 19 and TailwindCSS 4

### Test Data Preparation
```bash
# Environment variables needed
VITE_API_BASE_URL=https://localhost:7009/api
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_REDIRECT_URI=http://localhost:5173/callback
VITE_ENVIRONMENT=development

# React 19 specific settings
VITE_REACT_VERSION=19
VITE_ENABLE_CONCURRENT_FEATURES=true
```

---

## 📋 Test Scenarios

### Scenario 1: New User Authentication (5 minutes)

**Objective**: Verify complete Spotify OAuth flow and user profile setup

**Steps**:
1. **Navigate to Application**
   ```
   → Open: http://localhost:5173
   → Expect: Landing page with "Connect with Spotify" button
   → Verify: Page loads within 3 seconds
   ```

2. **Initiate Spotify Login**
   ```
   → Click: "Connect with Spotify" button
   → Expect: Redirect to Spotify authorization page
   → Verify: URL contains spotify.com and correct client_id
   ```

3. **Complete Spotify Authorization**
   ```
   → Action: Login with Spotify credentials (if not already logged in)
   → Action: Click "Agree" to authorize VibeGuess
   → Expect: Redirect back to VibeGuess application
   → Verify: User lands on dashboard/home page
   ```

4. **Verify User Profile**
   ```
   → Expect: User name displayed in navigation
   → Expect: Profile image loaded (if available)
   → Action: Click profile menu
   → Verify: User settings accessible
   → Verify: Spotify Premium status shown correctly
   ```

**Success Criteria**:
- [ ] OAuth flow completes without errors
- [ ] User profile data loaded correctly
- [ ] Premium/Free status detected accurately
- [ ] Navigation shows authenticated state

---

### Scenario 2: Quiz Generation and Customization (7 minutes)

**Objective**: Test AI quiz generation with various parameters

**Steps**:
1. **Access Quiz Creation**
   ```
   → Action: Click "Create Quiz" or similar CTA
   → Expect: Quiz creation form displayed
   → Verify: Form includes prompt field and options
   ```

2. **Generate Simple Quiz**
   ```
   → Input: "90s rock bands" in prompt field
   → Select: 5 questions, Easy difficulty
   → Enable: Audio previews
   → Action: Click "Generate Quiz"
   → Expect: Loading indicator shown
   → Verify: Quiz generated within 10 seconds
   ```

3. **Review Generated Quiz**
   ```
   → Expect: Quiz title and description shown
   → Expect: 5 questions with multiple choice options
   → Verify: Each question has 4 answer options
   → Verify: Audio preview controls present (if tracks available)
   ```

4. **Test Complex Quiz Generation**
   ```
   → Input: "Obscure jazz musicians from the 1960s bebop era"
   → Select: 10 questions, Hard difficulty
   → Action: Generate quiz
   → Verify: Complex prompt handled appropriately
   → Verify: Quiz content matches difficulty level
   ```

**Success Criteria**:
- [ ] Quiz generates successfully for various prompts
- [ ] Question count and difficulty respected
- [ ] Audio previews work when available
- [ ] Loading states provide good UX

---

### Scenario 3: Quiz Taking Experience (10 minutes)

**Objective**: Complete full quiz gameplay with scoring

**Steps**:
1. **Start Quiz Session**
   ```
   → Action: Click "Start Quiz" or "Play Now"
   → Expect: Quiz session initialization
   → Verify: First question displayed
   → Verify: Score shows 0/[total questions]
   ```

2. **Answer Questions**
   ```
   → Action: Select answer for first question
   → Action: Play audio preview (if available)
   → Action: Submit answer
   → Expect: Immediate feedback (correct/incorrect)
   → Expect: Score updates in real-time
   → Verify: Progress indicator shows advancement
   ```

3. **Navigate Through Quiz**
   ```
   → Repeat for each question in quiz
   → Verify: Cannot go back to previous questions
   → Verify: Audio controls work consistently
   → Action: Complete all questions
   ```

4. **Review Results**
   ```
   → Expect: Final score displayed as X/Total
   → Expect: Percentage score calculated
   → Expect: Time taken shown
   → Verify: Correct answers highlighted in review
   → Action: Save results (if option available)
   ```

**Success Criteria**:
- [ ] Quiz session flows smoothly without interruption
- [ ] Scoring calculations accurate
- [ ] Audio playback works properly
- [ ] Results summary comprehensive and accurate

---

### Scenario 4: Spotify Device Integration (8 minutes)

**Objective**: Test Spotify Premium device control features

**Prerequisites**: Spotify Premium account, available Spotify device

**Steps**:
1. **Access Device Selection**
   ```
   → Action: Navigate to playback settings or device selector
   → Expect: List of available Spotify devices
   → Verify: Device names and types shown correctly
   ```

2. **Select Playback Device**
   ```
   → Action: Choose active Spotify device
   → Expect: Device marked as selected
   → Verify: Connection status indicator
   ```

3. **Test Full Track Playback**
   ```
   → Action: Start quiz with device selected
   → Action: Play track for question
   → Expect: Full track plays on selected device
   → Verify: Playback controls responsive (play/pause)
   ```

4. **Test Playback Controls**
   ```
   → Action: Pause playback
   → Verify: Track pauses on device
   → Action: Resume playback
   → Verify: Track resumes from same position
   → Action: Adjust volume (if supported)
   → Verify: Volume changes on device
   ```

**Success Criteria** (Premium Users):
- [ ] Device list populated correctly
- [ ] Device selection works
- [ ] Full track playback on device
- [ ] Playback controls function properly

**Fallback Criteria** (Free Users):
- [ ] Premium upgrade message shown
- [ ] 30-second previews play in browser
- [ ] Graceful degradation of features

---

### Scenario 5: Quiz History and Performance (5 minutes)

**Objective**: Verify quiz history tracking and performance metrics

**Steps**:
1. **Access Quiz History**
   ```
   → Action: Navigate to "My Quizzes" or history section
   → Expect: List of completed quizzes
   → Verify: Quiz names, scores, and completion dates shown
   ```

2. **Review Performance Details**
   ```
   → Action: Click on completed quiz for details
   → Expect: Detailed results view
   → Verify: Question-by-question breakdown
   → Verify: Time taken per question (if available)
   ```

3. **Test Retaking Quiz**
   ```
   → Action: Click "Retake Quiz" or similar option
   → Expect: New quiz session starts
   → Verify: Previous answers not pre-filled
   → Verify: New session tracked separately
   ```

**Success Criteria**:
- [ ] Quiz history accurately maintained
- [ ] Performance metrics calculated correctly
- [ ] Retaking functionality works
- [ ] Data persistence across sessions

---

### Scenario 6: Error Handling and Edge Cases (6 minutes)

**Objective**: Validate graceful error handling and recovery

**Steps**:
1. **Test Network Interruption**
   ```
   → Action: Disconnect internet mid-quiz
   → Expect: Appropriate error message
   → Action: Reconnect internet
   → Verify: Quiz state preserved or recovered
   ```

2. **Test Invalid Quiz Prompts**
   ```
   → Input: Empty prompt or random characters
   → Action: Attempt quiz generation
   → Expect: Helpful error message
   → Verify: Form validation prevents submission
   ```

3. **Test Token Expiration**
   ```
   → Action: Wait for token expiration (or simulate)
   → Action: Attempt protected operation
   → Expect: Automatic token refresh or re-authentication
   → Verify: User experience minimally disrupted
   ```

4. **Test Spotify API Errors**
   ```
   → Action: Attempt playback without Premium (Free users)
   → Expect: Clear explanation and alternative options
   → Action: Try device control without devices
   → Expect: Helpful instructions for device setup
   ```

**Success Criteria**:
- [ ] Network errors handled gracefully
- [ ] Form validation prevents invalid submissions
- [ ] Authentication errors auto-resolved when possible
- [ ] Spotify limitations clearly communicated

---

## 🎯 Performance Validation

### Loading Performance
```bash
# Test with browser DevTools
→ Initial page load: < 3 seconds on 3G
→ Quiz generation: < 10 seconds
→ Question transitions: < 500ms
→ Audio preview loading: < 2 seconds
```

### Accessibility Testing
```bash
# Manual accessibility checks
→ Tab navigation works throughout app
→ Screen reader announces key information
→ Color contrast meets WCAG 2.1 AA standards
→ Audio controls keyboard accessible
```

### Mobile Responsiveness
```bash
# Test on various screen sizes
→ Portrait phone (375px): All features accessible
→ Landscape phone (667px): Layout adapts properly
→ Tablet (768px): Enhanced layout utilized
→ Desktop (1024px+): Full feature set available
```

---

## 📊 Success Metrics

### Functional Requirements Validation
- [ ] **FR-001**: Spotify OAuth authentication ✓
- [ ] **FR-003**: AI quiz generation ✓
- [ ] **FR-004**: Multiple choice quiz display ✓
- [ ] **FR-005**: Spotify playback control ✓
- [ ] **FR-006**: Real-time scoring ✓
- [ ] **FR-007**: Quiz history and performance ✓
- [ ] **FR-008**: Premium/Free user differentiation ✓
- [ ] **FR-015**: Responsive design validation ✓

### Performance Benchmarks
- [ ] Page load time < 3 seconds
- [ ] Quiz generation < 10 seconds
- [ ] UI interactions < 500ms
- [ ] Audio loading < 2 seconds
- [ ] 90+ Lighthouse performance score

### User Experience Quality
- [ ] No broken user flows
- [ ] Clear error messages and recovery paths
- [ ] Consistent UI/UX across features
- [ ] Accessibility requirements met
- [ ] Mobile experience equivalent to desktop

---

## 🚨 Known Issues and Workarounds

### Common Issues
1. **Spotify Login Popup Blocked**: Enable popups for localhost
2. **Device Not Showing**: Ensure Spotify app is open and active
3. **Audio Not Playing**: Check browser media permissions
4. **Quiz Generation Slow**: Complex prompts may take longer

### Browser-Specific Notes
- **Safari**: May require additional audio permissions
- **Firefox**: Web Playback SDK has limited support
- **Chrome**: Best compatibility with all features

### Debugging Steps
1. Check browser console for JavaScript errors
2. Verify API server is running and accessible
3. Confirm Spotify credentials are valid
4. Test network connectivity and firewall settings

---

*This quickstart guide validates all core functionality and serves as acceptance criteria for the VibeGuess frontend application.*