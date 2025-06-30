'use client';

import { Button, FileInput, TextInput, Textarea } from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { Activity } from '@/store/redux/slices/business/activity';
import { useUpdateActivityMutation } from '@/store/redux/slices/business/activity';

type EditableActivityModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: Activity) => void;
  activity: Activity;
  experience_name: string;
};

const EditableActivityModal = ({
  isOpen,
  onClose,
  onSave,
  activity: initialActivity,
  experience_name,
}: EditableActivityModalProps) => {
  const [activity, setActivity] = useState<Activity>({
    id: initialActivity?.id || '',
    experience_id: initialActivity?.experience_id || '',
    title: initialActivity?.title || '',
    primary_photo: initialActivity?.primary_photo || '',
    description: initialActivity?.description || '',
    description_thumbnail: initialActivity?.description_thumbnail || '',
    address: initialActivity?.address || '',
    hours: initialActivity?.hours || '',
  });
  const [currentImage, setCurrentImage] = useState(
    initialActivity.primary_photo || '',
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [updateActivity, { isLoading }] = useUpdateActivityMutation();

  useEffect(() => {
    if (initialActivity) {
      setActivity({
        id: initialActivity.id || '',
        experience_id: initialActivity.experience_id || '',
        title: initialActivity.title || '',
        primary_photo: initialActivity.primary_photo || '',
        description: initialActivity.description || '',
        description_thumbnail: initialActivity.description_thumbnail || '',
        address: initialActivity.address || '',
        hours: initialActivity.hours || '',
        // Add other fields as needed
      });
      setCurrentImage(initialActivity.primary_photo || '');
    }
    setImagePreview(null);
  }, [initialActivity]);

  const handleChange = (field: keyof Activity, value: string) => {
    setActivity((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        // Update the activity with the new image data
        setActivity((prev) => ({
          ...prev,
          primary_photo: result,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSave = async () => {
    try {
      const updatedData = {
        title: activity.title,
        description: activity.description,
        description_thumbnail: activity.description_thumbnail,
        primary_photo: imagePreview || activity.primary_photo,
        address: activity.address,
        hours: activity.hours,
        // Add other fields that should be updated
      };
      // Call the update mutation with the correct format
      const result = await updateActivity({
        id: activity.id,
        data: updatedData,
      }).unwrap();

      // Call the onSave callback with the response data
      onSave(result.data);
      onClose();
    } catch (error) {
      console.error('Failed to update activity:', error);
      // You might want to add error handling here (e.g., show a toast notification)
    }
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

  if (!isOpen) return null;

  // Sample slides for the carousel
  const slides = [
    {
      src: currentImage,
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
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      {/* Semi-transparent overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal container */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
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
              src={imagePreview || currentImage || slides[0].src}
              alt={activity.title}
              fill
              className="object-cover"
              priority
            />

            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />

            {/* Image Upload */}
            <div className="absolute top-4 right-4 z-10">
              <FileInput
                accept="image/*"
                onChange={handleImageChange}
                leftSection={<IconUpload size={16} />}
                placeholder="Change image"
                className="bg-white/80 backdrop-blur-sm rounded-lg"
                size="sm"
              />
            </div>

            {/* Header Content */}
            <div className="absolute bottom-5 left-5 right-5 text-white z-10">
              <div className="inline-block bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-2">
                {experience_name}
              </div>
              <TextInput
                value={activity.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="mb-2 bg-transparent border-0 p-0 text-3xl font-bold text-white placeholder-white/80"
                placeholder="Activity Title"
                styles={{
                  input: {
                    color: 'white',
                    fontSize: '1.875rem',
                    fontWeight: 'bold',
                    padding: 0,
                    backgroundColor: 'transparent',
                    border: 'none',
                    boxShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  },
                }}
              />
              <Textarea
                value={activity.description_thumbnail}
                onChange={(e) =>
                  handleChange('description_thumbnail', e.target.value)
                }
                className="text-base opacity-90 leading-relaxed bg-transparent border-0 p-0 resize-none"
                placeholder="Add a short description..."
                autosize
                minRows={1}
                maxRows={2}
                styles={{
                  input: {
                    color: 'white',
                    backgroundColor: 'transparent',
                    border: 'none',
                    padding: 0,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  },
                }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* About Section */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-gray-800">About</h2>
              <Textarea
                value={activity.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full"
                placeholder="Add a detailed description..."
                autosize
                minRows={3}
                maxRows={8}
              />
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
                    <TextInput
                      value={activity.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      placeholder="Enter location"
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="flex items-start text-base">
                  <span className="w-6 mr-4 text-gray-600 mt-0.5">🕐</span>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 mb-1">
                      Opening Hours
                    </div>
                    <TextInput
                      value={activity.hours || ''}
                      onChange={(e) => handleChange('hours', e.target.value)}
                      placeholder="e.g., 9:00 AM - 10:00 PM"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <div className="relative group inline-block">
                <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                  Feature coming soon
                </div>
                <Button disabled variant="outline" color="gray">
                  Delete
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                  color="gray"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  loading={isLoading}
                  disabled={isLoading}
                  color="blue"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditableActivityModal;
