import { useObjectURL } from '../hooks/useObjectURL';
import type { ImageRecord } from '../types/chat';

interface ImageModalContentProps {
  imageData?: Uint8Array;
  images?: ImageRecord[];
  currentIndex: number;
}

export const ImageModalContent = ({
  imageData,
  images,
  currentIndex
}: ImageModalContentProps) => {
  console.log('🖼️ ImageModalContent render:', {
    imageData: imageData ? `Uint8Array(${imageData.length})` : 'null',
    images: images ? `Array(${images.length})` : 'null',
    currentIndex
  });

  const currentImageData = images && images.length > 0
    ? images[currentIndex]?.data
    : imageData;

  console.log('🖼️ Current image data:', {
    currentImageData: currentImageData ? `Uint8Array(${currentImageData.length})` : 'null',
    source: images && images.length > 0 ? 'images array' : 'imageData prop'
  });

  const currentMimeType = images && images.length > 0
    ? images[currentIndex]?.mimeType
    : undefined;

  console.log('🖼️ Mime type:', currentMimeType);

  const imageUrl = useObjectURL(currentImageData || null, currentMimeType);
  const isMultiImageMode = images && images.length > 1;

  console.log('🖼️ Object URL result:', { imageUrl, isMultiImageMode });

  if (!imageUrl) {
    console.log('🚫 ImageModalContent returning null - no imageUrl');
    return null;
  }

  console.log('✅ ImageModalContent rendering img tag');

  return (
    <>
      <img
        src={imageUrl}
        alt="Full size image"
        style={{
          width: 'auto',
          height: 'auto',
          maxWidth: '90vw',
          maxHeight: '90vh',
          objectFit: 'contain',
          borderRadius: '8px',
          display: 'block'
        }}
      />

      {/* Image counter for multi-image mode */}
      {isMultiImageMode && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            padding: '8px 12px',
            borderRadius: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </>
  );
};
