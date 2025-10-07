import { useState } from 'react';

export function useImageModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openModal = (imageIndex: number) => {
    setCurrentImageIndex(imageIndex);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return {
    isModalOpen,
    currentImageIndex,
    openModal,
    closeModal,
    setCurrentImageIndex
  };
}