import { useAuth } from '@/hooks/useAuth';

/**
 * Dashboard/Home page for authenticated users
 * Shows user profile and navigation to main features
 */
export default function HomePage() {
  const { user, logout, isLogoutLoading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-spotify-green/20 via-background to-spotify-green/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back{user?.display_name ? `, ${user.display_name}` : ''}!
            </h1>
            <p className="text-muted-foreground">
              Ready to create some amazing music quizzes?
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* User avatar */}
            {user?.images?.[0] && (
              <img
                src={user.images[0].url}
                alt={user.display_name || 'Profile'}
                className="w-10 h-10 rounded-full border-2 border-spotify-green"
              />
            )}
            
            {/* Logout button */}
            <button
              onClick={() => logout()}
              disabled={isLogoutLoading}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-50"
            >
              {isLogoutLoading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Quizzes Created"
            value="0"
            subtitle="Start creating your first quiz"
            icon="🎵"
          />
          <StatCard
            title="Games Played"
            value="0"
            subtitle="Challenge your music knowledge"
            icon="🎮"
          />
          <StatCard
            title="Spotify Playlists"
            value="Loading..."
            subtitle="Available for quiz creation"
            icon="📝"
          />
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ActionCard
            title="Create New Quiz"
            description="Turn your Spotify playlists into interactive music quizzes with AI-powered questions"
            buttonText="Get Started"
            icon="🚀"
            primary
            onClick={() => {
              // TODO: Navigate to quiz creation
              alert('Quiz creation coming soon!');
            }}
          />
          
          <ActionCard
            title="Browse Quiz Library"
            description="View and manage all your created quizzes. Share them with friends or play solo."
            buttonText="View Library"
            icon="📚"
            onClick={() => {
              // TODO: Navigate to quiz library
              alert('Quiz library coming soon!');
            }}
          />
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="text-4xl mb-2">🎯</div>
            <h3 className="font-semibold mb-2">No activity yet</h3>
            <p className="text-muted-foreground">
              Your quiz activity will appear here once you start creating and playing games.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Stat card component
 */
function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon 
}: { 
  title: string; 
  value: string; 
  subtitle: string; 
  icon: string; 
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-muted-foreground">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

/**
 * Action card component
 */
function ActionCard({ 
  title, 
  description, 
  buttonText, 
  icon, 
  primary = false,
  onClick 
}: { 
  title: string; 
  description: string; 
  buttonText: string; 
  icon: string; 
  primary?: boolean;
  onClick: () => void; 
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-start gap-4">
        <div className="text-3xl">{icon}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm mb-4">{description}</p>
          <button
            onClick={onClick}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm transition-colors
              ${primary 
                ? 'bg-spotify-green text-black hover:bg-spotify-green/90' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              }
            `}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}