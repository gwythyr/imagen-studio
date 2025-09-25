import { useState } from 'react';
import { useSettings } from '../hooks/useSettings';

export function Settings() {
  const { apiKey, loading, saveApiKey } = useSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setInputValue(apiKey || '');
  };

  const handleSave = async () => {
    if (!inputValue.trim()) return;
    setIsSaving(true);
    await saveApiKey(inputValue.trim());
    setIsEditing(false);
    setIsSaving(false);
  };

  const handleCancel = () => {
    setInputValue(apiKey || '');
    setIsEditing(false);
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.substring(0, 6) + '••••••••••••' + key.substring(key.length - 4);
  };

  if (loading) {
    return (
      <div style={{
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{
        fontSize: '24px',
        fontWeight: '600',
        marginBottom: '20px',
        color: '#333'
      }}>
        Settings
      </h1>

      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '600px'
      }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '8px'
          }}>
            Gemini API Key
          </label>

          {!apiKey && !isEditing ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                backgroundColor: '#f8f9fa',
                color: '#999',
                fontSize: '14px'
              }}>
                No API key set
              </div>
              <button
                onClick={handleEdit}
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#1976d2',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Add Key
              </button>
            </div>
          ) : isEditing ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter your Gemini API key"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  outline: 'none'
                }}
                autoFocus
              />
              <button
                onClick={handleSave}
                disabled={!inputValue.trim() || isSaving}
                style={{
                  padding: '12px 16px',
                  backgroundColor: inputValue.trim() && !isSaving ? '#28a745' : '#ccc',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: inputValue.trim() && !isSaving ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#6c757d',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                backgroundColor: '#f8f9fa',
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#333'
              }}>
                {maskApiKey(apiKey)}
              </div>
              <button
                onClick={handleEdit}
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px'
                }}
                title="Edit API key"
              >
                ✏️
              </button>
            </div>
          )}
        </div>

        <div style={{
          fontSize: '12px',
          color: '#666',
          lineHeight: '1.4'
        }}>
          Your API key is stored locally in your browser and never sent to any third-party servers.
          Get your API key from{' '}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#1976d2', textDecoration: 'none' }}
          >
            Google AI Studio
          </a>.
        </div>
      </div>
    </div>
  );
}