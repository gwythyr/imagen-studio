import React, { useEffect } from 'react';
import { ImageModalControls } from './ImageModalControls';
import { ImageModalContent } from './ImageModalContent';
import { useImageNavigation } from '../hooks/useImageNavigation';
import type { ImageRecord } from '../types/chat';

interface ImageModalProps {
  // Single image mode (backwards compatible)
  imageData?: Uint8Array;
  messageId?: string;
  
  // Multi-image mode
  images?: ImageRecord[];
  currentIndex?: number;
  onNext?: () => void;
  onPrevious?: () => void;
  
  // Common props
  onClose: () => void;
}

export const ImageModal = ({
  imageData,
  messageId,
  images,
  currentIndex = 0,
  onNext,
  onPrevious,
  onClose
}: ImageModalProps) => {
  console.log('🎭 ImageModal render:', {
    imageData: imageData ? `Uint8Array(${imageData.length})` : 'null',
    messageId,
    images: images ? `Array(${images.length})` : 'null',
    currentIndex
  });

  const currentImageData = images && images.length > 0
    ? images[currentIndex]?.data
    : imageData;
    
  const currentImageId = images && images.length > 0
    ? images[currentIndex]?.id
    : messageId;
    
  const isMultiImageMode = images && images.length > 1;

  console.log('🎭 ImageModal computed values:', {
    currentImageData: currentImageData ? `Uint8Array(${currentImageData.length})` : 'null',
    currentImageId,
    isMultiImageMode
  });
  
  const { canNavigateNext, canNavigatePrevious } = useImageNavigation({
    currentIndex,
    setCurrentIndex: () => {}, // Not used here as navigation is handled by parent
    totalImages: images?.length || 1
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft' && canNavigatePrevious && onPrevious) {
        onPrevious();
      } else if (event.key === 'ArrowRight' && canNavigateNext && onNext) {
        onNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canNavigatePrevious, canNavigateNext, onNext, onPrevious, onClose]);

  const handleDownloadImage = () => {
    if (!currentImageData) return;
    
    const blob = new Blob([currentImageData]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `image-${currentImageId || 'download'}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBackdropClick = () => {
    onClose();
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!currentImageData) {
    console.log('🚫 ImageModal returning null - no currentImageData');
    return null;
  }

  console.log('✅ ImageModal rendering modal');

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
      }}
      onClick={handleBackdropClick}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: 'calc(100vw - 80px)',
          maxHeight: 'calc(100vh - 80px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={handleContentClick}
      >
        <ImageModalContent
          imageData={!images ? imageData : undefined}
          images={images}
          currentIndex={currentIndex}
        />
        
        <ImageModalControls
          onClose={onClose}
          onNext={onNext}
          onPrevious={onPrevious}
          onDownload={handleDownloadImage}
          canNavigateNext={canNavigateNext}
          canNavigatePrevious={canNavigatePrevious}
        />
      </div>
    </div>
  );
};