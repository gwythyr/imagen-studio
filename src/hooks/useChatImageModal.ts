import { useState, useMemo, useEffect, useCallback } from 'react';
import { useImageNavigation } from './useImageNavigation';
import type { Message, ImageRecord } from '../types/chat';

export function useChatImageModal(messages: Message[]) {
  const imageRecords = useMemo<ImageRecord[]>(() => (
    messages.reduce<ImageRecord[]>((acc, message) => {
      const data = message.imageContent?.data ?? message.imageData;
      if (!data) {
        return acc;
      }

      acc.push({
        id: message.id,
        data,
        mimeType: message.imageContent?.mimeType ?? 'image/jpeg',
        filename: null,
        size: data.byteLength,
        createdAt: message.timestamp
      });

      return acc;
    }, [])
  ), [messages]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openModalForMessage = useCallback((messageId: string) => {
    const imageIndex = imageRecords.findIndex((image) => image.id === messageId);
    if (imageIndex === -1) {
      return;
    }

    setCurrentImageIndex(imageIndex);
    setIsModalOpen(true);
  }, [imageRecords]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    if (imageRecords.length === 0) {
      setIsModalOpen(false);
      return;
    }

    if (currentImageIndex >= imageRecords.length) {
      setCurrentImageIndex(imageRecords.length - 1);
    }
  }, [isModalOpen, imageRecords.length, currentImageIndex]);

  const { goToNext, goToPrevious } = useImageNavigation({
    currentIndex: currentImageIndex,
    setCurrentIndex: setCurrentImageIndex,
    totalImages: imageRecords.length
  });

  return {
    imageRecords,
    isModalOpen,
    currentImageIndex,
    openModalForMessage,
    closeModal,
    goToNext,
    goToPrevious
  };
}
