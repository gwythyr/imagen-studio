import { type Message, type ChatSession } from '../types/chat';

interface ChatProps {
  session: ChatSession;
  messages: Message[];
}

export function Chat({ session, messages }: ChatProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#ffffff'
    }}>
      <div style={{
        padding: '60px 20px 20px 20px',
        borderBottom: '1px solid #dee2e6',
        backgroundColor: '#f8f9fa'
      }}>
        <h1 style={{
          margin: '0 0 8px 0',
          fontSize: '24px',
          fontWeight: '600',
          color: session.title ? '#333' : '#999'
        }}>
          {session.title ?? 'Untitled Chat'}
        </h1>
        <div style={{
          fontSize: '14px',
          color: '#666'
        }}>
          Created {formatDate(session.createdAt)}
        </div>
      </div>

      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
              gap: '12px'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '16px',
              backgroundColor: message.role === 'user' ? '#1976d2' : '#e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '600',
              color: message.role === 'user' ? '#ffffff' : '#666',
              flexShrink: 0
            }}>
              {message.role === 'user' ? 'U' : 'AI'}
            </div>

            <div style={{
              maxWidth: '70%',
              backgroundColor: message.role === 'user' ? '#1976d2' : '#f5f5f5',
              color: message.role === 'user' ? '#ffffff' : '#333',
              padding: '12px 16px',
              borderRadius: '18px',
              borderTopLeftRadius: message.role === 'user' ? '18px' : '4px',
              borderTopRightRadius: message.role === 'user' ? '4px' : '18px',
              wordWrap: 'break-word',
              fontSize: '14px',
              lineHeight: '1.4'
            }}>
              {message.content || '[Image/Audio message]'}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        padding: '20px',
        borderTop: '1px solid #dee2e6',
        backgroundColor: '#ffffff'
      }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end'
        }}>
          <input
            type="text"
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #dee2e6',
              borderRadius: '24px',
              fontSize: '14px',
              outline: 'none',
              resize: 'none',
              fontFamily: 'inherit'
            }}
            onFocus={e => {
              e.target.style.borderColor = '#1976d2';
            }}
            onBlur={e => {
              e.target.style.borderColor = '#dee2e6';
            }}
          />

          <button
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '24px',
              border: 'none',
              backgroundColor: '#1976d2',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#1565c0';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#1976d2';
            }}
          >
            🎤
          </button>
        </div>
      </div>
    </div>
  );
}
