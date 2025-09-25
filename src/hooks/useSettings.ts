import { useState, useEffect, useCallback } from 'react';
import { ChatDatabase } from '../lib/database';

export function useSettings() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadApiKey = useCallback(async () => {
    setLoading(true);
    const db = new ChatDatabase();
    await db.initialize();
    const key = await db.getGeminiApiKey();
    setApiKey(key);
    setLoading(false);
  }, []);

  const saveApiKey = useCallback(async (key: string) => {
    const db = new ChatDatabase();
    await db.initialize();
    await db.setGeminiApiKey(key);
    setApiKey(key);
  }, []);

  useEffect(() => {
    loadApiKey();
  }, [loadApiKey]);

  return { apiKey, loading, saveApiKey };
}