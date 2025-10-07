import React from 'react';
import { useImageData } from '../hooks/useImageData';
import { useImageModal } from '../hooks/useImageModal';
import { useImageNavigation } from '../hooks/useImageNavigation';
import { useObjectURL } from '../hooks/useObjectURL';
import { ImageModal } from './ImageModal';
import type { ImageRecord } from '../types/chat';

const GalleryImage = ({
  image,
  index,
  onImageClick
}: {
  image: ImageRecord;
  index: number;
  onImageClick: (index: number) => void;
}) => {
  const imageUrl = useObjectURL(image.data, image.mimeType);
  
  const handleClick = () => {
    onImageClick(index);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'scale(1.02)';
    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
  };

  if (!imageUrl) return null;

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'relative',
        cursor: 'pointer',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={imageUrl}
        alt={image.filename || `Image ${index + 1}`}
        style={{
          width: '100%',
          height: '200px',
          objectFit: 'cover',
          display: 'block'
        }}
      />
      
      {/* Image info overlay */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
        color: 'white',
        padding: '8px',
        fontSize: '12px'
      }}>
        <div style={{ fontWeight: '500' }}>
          {image.filename || `Image ${index + 1}`}
        </div>
        <div style={{ opacity: 0.8 }}>
          {new Date(image.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

const Gallery = () => {
  const { images, loading, error, imageCount } = useImageData();
  const { isModalOpen, currentImageIndex, openModal, closeModal, setCurrentImageIndex } = useImageModal();
  const { goToNext, goToPrevious } = useImageNavigation({
    currentIndex: currentImageIndex,
    setCurrentIndex: setCurrentImageIndex,
    totalImages: imageCount
  });

  const handleImageClick = (index: number) => {
    openModal(index);
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px'
  };

  const headerStyle = {
    marginBottom: '20px',
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const countBadgeStyle = {
    fontSize: '14px',
    fontWeight: 'normal',
    color: '#666',
    backgroundColor: '#f0f0f0',
    padding: '4px 8px',
    borderRadius: '12px'
  };

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Gallery</h2>
        <div style={gridStyle}>
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              style={{
                width: '100%',
                height: '200px',
                backgroundColor: '#f0f0f0',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse 1.5s ease-in-out infinite alternate'
              }}
            >
              Loading...
            </div>
          ))}
        </div>
        <style>
          {`
            @keyframes pulse {
              0% { opacity: 0.6; }
              100% { opacity: 1; }
            }
          `}
        </style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Gallery</h2>
        <div style={{
          padding: '20px',
          backgroundColor: '#fee',
          borderRadius: '8px',
          color: '#c33',
          textAlign: 'center'
        }}>
          Error loading images: {error}
        </div>
      </div>
    );
  }

  if (imageCount === 0) {
    return (
      <div style={{ padding: '20px' }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Gallery</h2>
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#666',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          border: '2px dashed #ddd'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>No images yet</h3>
          <p style={{ margin: 0 }}>Upload some images in your chat to see them here</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={headerStyle}>
        📷 Gallery
        <span style={countBadgeStyle}>
          {imageCount} image{imageCount !== 1 ? 's' : ''}
        </span>
      </h2>
      
      <div style={gridStyle}>
        {images.map((image: ImageRecord, index: number) => (
          <GalleryImage
            key={image.id}
            image={image}
            index={index}
            onImageClick={handleImageClick}
          />
        ))}
      </div>

      {/* Image Modal */}
      {isModalOpen && (
        <ImageModal
          images={images}
          currentIndex={currentImageIndex}
          onNext={goToNext}
          onPrevious={goToPrevious}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default Gallery;
export { Gallery };