interface LayoutProps {
  children: React.ReactNode;
  currentView: 'sessions' | 'settings';
  onViewChange: (view: 'sessions' | 'settings') => void;
}

export function Layout({ children, currentView, onViewChange }: LayoutProps) {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        width: '250px',
        backgroundColor: '#f8f9fa',
        borderRight: '1px solid #dee2e6',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 0'
      }}>
        <div style={{
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '30px',
          paddingLeft: '20px',
          color: '#333'
        }}>
          Imagen Studio
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column' }}>
          <button
            onClick={() => onViewChange('sessions')}
            style={{
              padding: '12px 20px',
              border: 'none',
              backgroundColor: currentView === 'sessions' ? '#e3f2fd' : 'transparent',
              color: currentView === 'sessions' ? '#1976d2' : '#666',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: currentView === 'sessions' ? '600' : '400',
              transition: 'all 0.2s ease',
              borderLeft: currentView === 'sessions' ? '3px solid #1976d2' : '3px solid transparent'
            }}
            onMouseEnter={e => {
              if (currentView !== 'sessions') {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
              }
            }}
            onMouseLeave={e => {
              if (currentView !== 'sessions') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            Sessions
          </button>

          <button
            onClick={() => onViewChange('settings')}
            style={{
              padding: '12px 20px',
              border: 'none',
              backgroundColor: currentView === 'settings' ? '#e3f2fd' : 'transparent',
              color: currentView === 'settings' ? '#1976d2' : '#666',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: currentView === 'settings' ? '600' : '400',
              transition: 'all 0.2s ease',
              borderLeft: currentView === 'settings' ? '3px solid #1976d2' : '3px solid transparent'
            }}
            onMouseEnter={e => {
              if (currentView !== 'settings') {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
              }
            }}
            onMouseLeave={e => {
              if (currentView !== 'settings') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            Settings
          </button>
        </nav>
      </div>

      <div style={{
        flex: 1,
        overflow: 'auto',
        backgroundColor: '#ffffff'
      }}>
        {children}
      </div>
    </div>
  );
}