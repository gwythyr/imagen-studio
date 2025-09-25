import { useState, useEffect } from 'react';
import { SessionService, type SessionWithStats } from '../lib/sessions';

interface SessionsListProps {
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
}

export function SessionsList({ onSessionSelect, onNewSession }: SessionsListProps) {
  const [sessions, setSessions] = useState<SessionWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const sessionService = new SessionService();
    await sessionService.initialize();
    const sessionsWithStats = await sessionService.getSessionsWithStats();
    setSessions(sessionsWithStats);
    setLoading(false);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatDateTime = (timestamp: number | null) => {
    if (!timestamp) return 'No messages';
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return <div>Loading sessions...</div>;
  }

  return (
    <div style={{ padding: '20px 20px 20px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
        <h1>Chat Sessions</h1>
        <button
          onClick={onNewSession}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          +
        </button>
      </div>

      {sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          No sessions yet. Click + to create your first session.
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'var(--bg-primary)', paddingRight: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)' }}>Title</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)' }}>Created</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)' }}>Last Message</th>
              <th style={{ padding: '12px 30px 12px 12px', textAlign: 'right', fontWeight: '600', color: 'var(--text-primary)' }}>Messages</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(session => (
              <tr
                key={session.id}
                onClick={() => onSessionSelect(session.id)}
                style={{
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border-color)',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--hover-bg)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <td style={{ padding: '12px', fontWeight: '500', color: 'var(--text-primary)' }}>
                  {session.title || '???'}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                  {formatDate(session.createdAt)}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                  {formatDateTime(session.stats.lastMessageTimestamp)}
                </td>
                <td style={{ padding: '12px 30px 12px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                  {session.stats.messageCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
