import { Modal } from '@mantine/core';
import React, { useEffect, useState } from 'react';

interface IconicPhoto {
  id: string;
  url: string;
  name: string;
  text: string;
}

interface IconicPhotoModalProps {
  photos: IconicPhoto[];
  selectedIndex: number | null;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}

const IconicPhotoModal: React.FC<IconicPhotoModalProps> = ({
  photos,
  selectedIndex,
  onClose,
  onNavigate,
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (selectedIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        onNavigate((selectedIndex - 1 + photos.length) % photos.length);
      } else if (e.key === 'ArrowRight') {
        onNavigate((selectedIndex + 1) % photos.length);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, photos.length, onNavigate, onClose]);

  const handleNavigate = (newIndex: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      onNavigate(newIndex);
      setIsTransitioning(false);
    }, 150);
  };

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (selectedIndex === null || !photos[selectedIndex]) return null;
  const photo = photos[selectedIndex];
  return (
    <Modal
      opened={selectedIndex !== null}
      onClose={onClose}
      centered
      size="95vw"
      withCloseButton={false}
      overlayProps={{ opacity: 0.8, blur: 8, color: '#000' }}
      shadow="none"
      classNames={{
        body: 'p-0 overflow-hidden shadow-none',
        content: 'overflow-hidden shadow-none',
        inner: 'overflow-hidden shadow-none',
      }}
      styles={{
        body: { background: 'transparent' },
        content: { background: 'transparent' },
        inner: { background: 'transparent' },
        root: { background: 'transparent' },
      }}
    >
      <div
        className="relative w-full h-[80vh] max-h-screen flex items-center justify-center cursor-pointer overflow-hidden"
        style={{ background: 'transparent' }}
        onClick={handleOutsideClick}
      >
        {/* Close Button - Fixed position */}
        <button
          onClick={onClose}
          className="absolute cursor-pointer top-2 right-2 z-30 w-10 h-10 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-full text-white transition-colors hover:bg-[#FF6F00] focus:outline-none"
          style={{ border: 'none' }}
          aria-label="Close modal"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path
              d="M6 6l12 12M6 18L18 6"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Image Container - Responsive fitting with controls inside */}
        <div
          className="relative w-full h-full flex items-center justify-center p-2 overflow-hidden"
          style={{ background: 'transparent' }}
        >
          <div
            className="relative max-w-full max-h-full"
            style={{ background: 'transparent' }}
          >
            <img
              src={photo.url}
              alt={photo.name}
              className={`
                                transition-opacity duration-150 ease-in-out
                                ${isTransitioning ? 'opacity-50' : 'opacity-100'}
                                rounded-lg
                                max-w-full max-h-full object-contain
                            `}
              style={{
                background: 'transparent',
                objectFit: 'contain',
                maxHeight: 'calc(80vh - 4rem)',
                maxWidth: 'calc(95vw - 4rem)',
              }}
            />

            {/* Photo Counter - Bottom inside image */}
            <div
              className={`
                            absolute bottom-2 left-1/2 transform -translate-x-1/2 
                            bg-black/70 text-white text-xs px-3 py-1 rounded-full z-30
                            transition-opacity duration-150 ease-in-out
                            ${isTransitioning ? 'opacity-50' : 'opacity-100'}
                        `}
              style={{ backdropFilter: 'blur(8px)' }}
            >
              {selectedIndex + 1} / {photos.length}
            </div>

            {/* Navigation Buttons - Aligned with image edges */}
            <button
              className={`
                                absolute left-1 top-1/2 -translate-y-1/2 
                                bg-black/70 rounded-full p-2 hover:bg-black/90 z-20 transition-all duration-150 ease-in-out
                                ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
                            `}
              style={{ backdropFilter: 'blur(8px)' }}
              onClick={(e) => {
                e.stopPropagation();
                handleNavigate(
                  (selectedIndex - 1 + photos.length) % photos.length,
                );
              }}
              disabled={photos.length <= 1 || isTransitioning}
              aria-label="Previous photo"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path
                  d="M15 19l-7-7 7-7"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              className={`
                                absolute right-1 top-1/2 -translate-y-1/2 
                                bg-black/70 rounded-full p-2 hover:bg-black/90 z-20 transition-all duration-150 ease-in-out
                                ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
                            `}
              style={{ backdropFilter: 'blur(8px)' }}
              onClick={(e) => {
                e.stopPropagation();
                handleNavigate((selectedIndex + 1) % photos.length);
              }}
              disabled={photos.length <= 1 || isTransitioning}
              aria-label="Next photo"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path
                  d="M9 5l7 7-7 7"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default IconicPhotoModal;
