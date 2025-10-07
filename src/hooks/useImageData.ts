import { useState, useEffect } from 'react';
import { db } from '../lib/database';
import type { ImageRecord } from '../types/chat';

export function useImageData() {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      setError(null);

      await db.initialize();
      const allImages = await db.getAllImages();
      
      setImages(allImages);
      setLoading(false);
    };

    loadImages().catch(err => {
      setError(err instanceof Error ? err.message : 'Failed to load images');
      setLoading(false);
    });
  }, []);

  const imageCount = images.length;

  return {
    images,
    loading,
    error,
    imageCount
  };
}