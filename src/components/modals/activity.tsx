'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

type ActivityModalProps = {
  isOpen: boolean;
  onClose: () => void;
  activity: {
    title: string;
    description: string;
    description_thumbnail: string;
    imageUrl: string;
    location: string;
    address: string;
    hours: string;
  };
  experience_name: string;
};

const ActivityModal = ({
  isOpen,
  onClose,
  activity,
  experience_name,
}: ActivityModalProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);

  const slides = [
    {
      src:
        activity.imageUrl ||
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23667eea'/%3E%3Crect x='50' y='140' width='300' height='60' fill='%23333' opacity='0.7'/%3E%3Ccircle cx='200' cy='60' r='30' fill='%23FFD700' opacity='0.8'/%3E%3Ctext x='200' y='110' text-anchor='middle' fill='white' font-size='16' font-family='Arial'%3E{activity.title}%3C/text%3E%3C/svg%3E",
      alt: activity.title,
    },
    {
      src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23764ba2'/%3E%3Crect x='100' y='80' width='200' height='100' fill='%23444' opacity='0.8'/%3E%3Ccircle cx='150' cy='50' r='20' fill='%23FFD700'/%3E%3Ccircle cx='250' cy='60' r='15' fill='%23FFD700'/%3E%3Ctext x='200' y='110' text-anchor='middle' fill='white' font-size='16' font-family='Arial'%3EBar Interior%3C/text%3E%3C/svg%3E",
      alt: 'Bar Interior',
    },
    {
      src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23556270'/%3E%3Crect x='80' y='120' width='240' height='80' fill='%23333' opacity='0.6'/%3E%3Ccircle cx='160' cy='80' r='25' fill='%23FF6B35'/%3E%3Ccircle cx='240' cy='90' r='20' fill='%23FF6B35'/%3E%3Ctext x='200' y='110' text-anchor='middle' fill='white' font-size='16' font-family='Arial'%3ECocktails%3C/text%3E%3C/svg%3E",
      alt: 'Signature Cocktails',
    },
    {
      src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%234ECDC4'/%3E%3Crect x='0' y='150' width='400' height='50' fill='%23333' opacity='0.5'/%3E%3Ccircle cx='120' cy='70' r='30' fill='%23FFD700'/%3E%3Ccircle cx='280' cy='80' r='25' fill='%23FFD700'/%3E%3Ctext x='200' y='110' text-anchor='middle' fill='white' font-size='16' font-family='Arial'%3ESunset Views%3C/text%3E%3C/svg%3E",
      alt: 'Sunset Views',
    },
  ];

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Check if description is long enough to be clamped
  useEffect(() => {
    if (descriptionRef.current) {
      const isTextClamped =
        descriptionRef.current.scrollHeight >
        descriptionRef.current.clientHeight;
      setIsClamped(isTextClamped);
    }
  }, [activity.description]);

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const descriptionClasses = `leading-relaxed text-gray-600 text-base ${
    !showFullDescription ? 'line-clamp-6' : ''
  }`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      {/* Semi-transparent overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal container */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className="relative w-full max-w-3xl bg-white rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 z-20 w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white transition-colors"
            aria-label="Close modal"
          >
            &times;
          </button>

          {/* Header with image */}
          <div className="relative h-64 md:h-80">
            <Image
              src={activity.imageUrl || slides[0].src}
              alt={activity.title}
              fill
              className="object-cover"
              priority
            />

            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <button
                onClick={handleFavorite}
                className="w-10 h-10 bg-white/20 backdrop-blur-md border-none rounded-full text-white cursor-pointer flex items-center justify-center"
                style={{ color: isFavorited ? '#ff6b6b' : 'white' }}
              >
                {isFavorited ? '♥' : '♡'}
              </button>
            </div>

            {/* Header Content */}
            <div className="absolute bottom-5 left-5 right-5 text-white z-10">
              <div className="inline-block bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-2">
                {experience_name}
              </div>
              <h1
                className="text-3xl font-bold mb-2"
                style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
              >
                {activity.title}
              </h1>
              <p
                className="text-base opacity-90 leading-relaxed"
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
              >
                {activity.description_thumbnail}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* About Section */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-gray-800">About</h2>
              <div
                ref={descriptionRef}
                className={descriptionClasses}
                dangerouslySetInnerHTML={{
                  __html:
                    activity.description?.replace(/\n/g, '<br />') ||
                    'No description available.',
                }}
              />
              {isClamped && (
                <button
                  onClick={toggleDescription}
                  className="text-orange-600 hover:text-orange-700 font-medium text-sm mt-1 focus:outline-none"
                >
                  {showFullDescription ? 'See less' : 'See more'}
                </button>
              )}
            </div>

            {/* Highlights */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Highlights
              </h2>
              <div className="flex flex-wrap gap-2 mb-5">
                {[
                  '360° City Views',
                  'Signature Cocktails',
                  'Live DJ',
                  'Instagram Worthy',
                  'Romantic Atmosphere',
                ].map((tag, index) => (
                  <span
                    key={index}
                    className="bg-orange-600 text-white px-3 py-2 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Details</h2>
              <div className="bg-gray-50 rounded-xl p-5 mb-5">
                <div className="flex items-start mb-4 text-base">
                  <span className="w-6 mr-4 text-gray-600 mt-0.5">📍</span>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 mb-1">
                      Location
                    </div>
                    <div className="text-gray-600 leading-relaxed">
                      {activity.address}
                    </div>
                  </div>
                </div>
                <div className="flex items-start text-base">
                  <span className="w-6 mr-4 text-gray-600 mt-0.5">🕐</span>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 mb-1">Time</div>
                    <div className="text-gray-600 leading-relaxed">
                      {activity.hours}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Carousel */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                More Images
              </h2>
              <div className="relative mb-5">
                <div className="overflow-hidden rounded-xl">
                  <div
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {slides.map((slide, index) => (
                      <div key={index} className="min-w-full h-48">
                        <Image
                          src={slide.src}
                          alt={slide.alt}
                          fill
                          className="object-cover cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Carousel Navigation */}
                <div className="flex justify-center items-center mt-4 gap-4">
                  <button
                    onClick={handlePrevSlide}
                    disabled={currentSlide === 0}
                    className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 text-lg cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                  >
                    ‹
                  </button>

                  <div className="flex gap-2">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${
                          index === currentSlide
                            ? 'bg-orange-500'
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleNextSlide}
                    disabled={currentSlide === slides.length - 1}
                    className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 text-lg cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityModal;
