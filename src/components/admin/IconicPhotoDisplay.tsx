import React from 'react';

interface IconicPhotoDisplayProps {
  photos: string[]; // Array of photo URLs
  onDelete?: (index: number) => void; // Callback for delete action
}

const IconicPhotoDisplay: React.FC<IconicPhotoDisplayProps> = ({
  photos,
  onDelete,
}) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {photos.map((photo, index) => (
          <div key={index} className="relative group">
            {/* Photo label */}
            <div className="text-sm font-medium text-gray-700 mb-1">
              Photo #{index + 1}
            </div>

            {/* Photo container with fixed dimensions */}
            <div className="relative w-full h-56 overflow-hidden rounded-lg bg-gray-200">
              {' '}
              {/* Added 'relative' here */}
              {/* Delete button - moved inside photo container */}
              <button
                type="button"
                onClick={() => onDelete && onDelete(index)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete photo"
              >
                <img
                  src="/assets/delete.svg"
                  alt="Delete"
                  className="w-4 h-4"
                />
              </button>
              <img
                src={photo}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
                style={{ width: '457.5px', height: '225px' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IconicPhotoDisplay;
