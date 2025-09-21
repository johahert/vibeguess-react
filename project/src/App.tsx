function App() {
  return (
    <div className="min-h-screen bg-vibeguess-background text-vibeguess-text">
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-vibeguess-primary to-vibeguess-accent bg-clip-text text-transparent">
          VibeGuess
        </h1>
        <p className="text-xl mb-8 text-vibeguess-text-muted">
          Create music quizzes from your Spotify playlists
        </p>
        <div className="bg-vibeguess-surface rounded-lg p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Setup Complete! 🎉</h2>
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2">
              <span className="text-vibeguess-primary">✓</span>
              <span>React 19.1.1</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-vibeguess-primary">✓</span>
              <span>TypeScript 5.8.3</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-vibeguess-primary">✓</span>
              <span>Vite 7.1.6</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-vibeguess-primary">✓</span>
              <span>TailwindCSS</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-vibeguess-primary">✓</span>
              <span>ShadCN/UI Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-vibeguess-primary">✓</span>
              <span>TanStack Query & Zustand</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-vibeguess-primary">✓</span>
              <span>Testing (Vitest, Playwright, MSW)</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-vibeguess-text-muted mt-8">
          Ready for OAuth implementation and feature development 🚀
        </p>
      </div>
    </div>
  )
}

export default App
