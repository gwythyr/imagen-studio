import React from 'react';

interface UseImageNavigationProps {
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  totalImages: number;
}

export function useImageNavigation({ currentIndex, setCurrentIndex, totalImages }: UseImageNavigationProps) {
  const goToNext = () => {
    if (currentIndex < totalImages - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const canNavigateNext = currentIndex < totalImages - 1;
  const canNavigatePrevious = currentIndex > 0;

  return {
    goToNext,
    goToPrevious,
    canNavigateNext,
    canNavigatePrevious
  };
}