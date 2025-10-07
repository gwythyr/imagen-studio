import React from 'react';

interface ImageModalControlsProps {
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onDownload: () => void;
  canNavigateNext: boolean;
  canNavigatePrevious: boolean;
}

export const ImageModalControls = ({
  onClose,
  onNext,
  onPrevious,
  onDownload,
  canNavigateNext,
  canNavigatePrevious
}: ImageModalControlsProps) => {
  const buttonStyle = {
    border: 'none',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1001
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  };

  return (
    <>
      {/* Previous navigation button */}
      {canNavigatePrevious && onPrevious && (
        <button
          onClick={onPrevious}
          style={{
            ...buttonStyle,
            position: 'absolute',
            left: '-60px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '50px',
            height: '50px',
            borderRadius: '25px',
            fontSize: '24px'
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          ◀
        </button>
      )}

      {/* Next navigation button */}
      {canNavigateNext && onNext && (
        <button
          onClick={onNext}
          style={{
            ...buttonStyle,
            position: 'absolute',
            right: '-60px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '50px',
            height: '50px',
            borderRadius: '25px',
            fontSize: '24px'
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          ▶
        </button>
      )}

      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          ...buttonStyle,
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '40px',
          height: '40px',
          borderRadius: '20px',
          fontSize: '20px',
          fontWeight: '600'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        ×
      </button>

      {/* Download button */}
      <button
        onClick={onDownload}
        style={{
          ...buttonStyle,
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          width: '50px',
          height: '50px',
          borderRadius: '25px',
          fontSize: '20px'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        ⬇️
      </button>
    </>
  );
};