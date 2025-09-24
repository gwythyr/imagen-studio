import { useState } from 'react';
import { Layout } from './components/Layout';
import { SessionsList } from './components/SessionsList';
import { Settings } from './components/Settings';
import { SessionService } from './lib/sessions';

function App() {
  const [currentView, setCurrentView] = useState<'sessions' | 'settings'>('sessions');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const handleNewSession = async () => {
    const sessionService = new SessionService();
    await sessionService.initialize();
    const newSession = await sessionService.createSession();
    setCurrentSessionId(newSession.id);
  };

  const renderContent = () => {
    if (currentView === 'settings') {
      return <Settings />;
    }

    if (currentView === 'sessions') {
      if (currentSessionId) {
        return (
          <div style={{ padding: '20px' }}>
            <button
              onClick={() => setCurrentSessionId(null)}
              style={{
                marginBottom: '20px',
                backgroundColor: 'transparent',
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#666'
              }}
            >
              ← Back to Sessions
            </button>
            <div>
              Chat interface for session {currentSessionId} would go here
            </div>
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
