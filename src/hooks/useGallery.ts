import { useState, useEffect } from 'react';
import { db } from '../lib/database';
import type { ImageRecord } from '../types/chat';

export function useGallery() {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const loadImages = async () => {
      try {
        setLoading(true);
        setError(null);

        await db.initialize();
        const allImages = await db.getAllImages();
        
        setImages(allImages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load images');
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, []);

  const openModal = (imageIndex: number) => {
    setCurrentImageIndex(imageIndex);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const goToNext = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  return {
    images,
    loading,
    error,
    isModalOpen,
    currentImageIndex,
    openModal,
    closeModal,
    goToNext,
    goToPrevious
  };
}