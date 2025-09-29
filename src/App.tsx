import { useState, useEffect } from 'react';
import * as Sentry from "@sentry/react";
import { Layout } from './components/Layout';
import { SessionsList } from './components/SessionsList';
import { Settings } from './components/Settings';
import { Chat } from './components/Chat';
import { useSession } from './hooks/useSession';
import { db } from './lib/database';

function App() {
  const [currentView, setCurrentView] = useState<'sessions' | 'settings'>('sessions');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Initialize database early in app lifecycle
  useEffect(() => {
    const initDatabase = async () => {
      try {
        await db.initialize();
        const dbInfo = await db.getDatabaseInfo();
        if (dbInfo.isOpfs) {
          console.log('✓ Database using OPFS - data will persist across page reloads');
        } else {
          console.warn('⚠️ Database using memory storage - data will be lost on page reload!');
        }
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    initDatabase();
  }, []);

  const { session, loading: sessionLoading } = useSession(currentSessionId);

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const handleNewSession = () => {
    setCurrentSessionId('temp');
  };

  const renderContent = () => {
    if (currentView === 'settings') {
      return <Settings />;
    }

    if (currentView === 'sessions') {
      if (currentSessionId) {
        if (currentSessionId === 'temp') {
          const tempSession = {
            id: 'temp',
            title: null,
            createdAt: Date.now(),
            updatedAt: Date.now()
          };

          return (
            <div style={{ position: 'relative', height: '100vh' }}>
              <button
                onClick={() => setCurrentSessionId(null)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  left: '20px',
                  zIndex: 20,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#666',
                  backdropFilter: 'blur(4px)'
                }}
              >
                ← Back to Sessions
              </button>
              <Chat
                session={tempSession}
                onSessionCreated={setCurrentSessionId}
              />
            </div>
          );
        }

        if (sessionLoading) {
          return (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
              fontSize: '16px',
              color: '#666'
            }}>
              Loading...
            </div>
          );
        }

        if (!session) {
          return (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
              fontSize: '16px',
              color: '#666'
            }}>
              Session not found
            </div>
          );
        }

        return (
          <div style={{ position: 'relative', height: '100vh' }}>
            <button
              onClick={() => setCurrentSessionId(null)}
              style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                zIndex: 20,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#666',
                backdropFilter: 'blur(4px)'
              }}
            >
              ← Back to Sessions
            </button>
            <Chat session={session} />
          </div>
        );
      }

      return (
        <SessionsList
          onSessionSelect={handleSessionSelect}
          onNewSession={handleNewSession}
        />
      );
    }

    return null;
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderContent()}
    </Layout>
  );
}

const ErrorFallback = ({ resetError }: { resetError: () => void }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    padding: '20px',
    textAlign: 'center'
  }}>
    <h2 style={{ color: '#e74c3c', marginBottom: '16px' }}>Something went wrong</h2>
    <p style={{ color: '#666', marginBottom: '20px' }}>
      An error occurred. Our team has been notified.
    </p>
    <button
      onClick={resetError}
      style={{
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Try again
    </button>
  </div>
);

const AppWithErrorBoundary = Sentry.withErrorBoundary(App, {
  fallback: ErrorFallback
});

export default AppWithErrorBoundary;
