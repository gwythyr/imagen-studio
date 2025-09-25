import { useState } from 'react';
import { Layout } from './components/Layout';
import { SessionsList } from './components/SessionsList';
import { Settings } from './components/Settings';
import { Chat } from './components/Chat';
import { useSession } from './hooks/useSession';

function App() {
  const [currentView, setCurrentView] = useState<'sessions' | 'settings'>('sessions');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

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

export default App;
