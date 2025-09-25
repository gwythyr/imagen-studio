import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/database';

export function useSettings() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadApiKey = useCallback(async () => {
    setLoading(true);
    await db.initialize();
    const key = await db.getGeminiApiKey();
    setApiKey(key);
    setLoading(false);
  }, []);

  const saveApiKey = useCallback(async (key: string) => {
    await db.initialize();
    await db.setGeminiApiKey(key);
    setApiKey(key);
  }, []);

  useEffect(() => {
    loadApiKey();
  }, [loadApiKey]);

  return { apiKey, loading, saveApiKey };
}