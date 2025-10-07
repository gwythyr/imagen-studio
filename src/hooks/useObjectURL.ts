import { useEffect, useState, useRef } from 'react';

export function useObjectURL(data: Uint8Array | null, mimeType?: string): string | null {
  const [url, setUrl] = useState<string | null>(null);
  const currentUrlRef = useRef<string | null>(null);

  useEffect(() => {
    console.log('🔗 useObjectURL effect:', {
      data: data ? `Uint8Array(${data.length})` : 'null',
      mimeType
    });

    if (!data) {
      console.log('🔗 useObjectURL: No data, setting url to null');
      if (currentUrlRef.current) {
        URL.revokeObjectURL(currentUrlRef.current);
        currentUrlRef.current = null;
      }
      setUrl(null);
      return;
    }

    try {
      const blob = new Blob([data], mimeType ? { type: mimeType } : undefined);
      console.log('🔗 useObjectURL: Blob created:', { size: blob.size, type: blob.type });

      const objectUrl = URL.createObjectURL(blob);
      console.log('🔗 useObjectURL: Object URL created:', objectUrl);

      // Revoke old URL before setting new one
      if (currentUrlRef.current) {
        URL.revokeObjectURL(currentUrlRef.current);
      }

      currentUrlRef.current = objectUrl;
      setUrl(objectUrl);

      return () => {
        console.log('🔗 useObjectURL: Cleanup - revoking object URL:', objectUrl);
        if (currentUrlRef.current === objectUrl) {
          URL.revokeObjectURL(objectUrl);
          currentUrlRef.current = null;
        }
      };
    } catch (error) {
      console.error('🔗 useObjectURL: Error creating object URL:', error);
      setUrl(null);
    }
  }, [data, mimeType]);

  console.log('🔗 useObjectURL returning:', url);
  return url;
}