'use client';

import { Avatar, Popover, UnstyledButton } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconChevronLeft } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { HiExternalLink } from 'react-icons/hi';
import { PiShareFat } from 'react-icons/pi';

import { ImageUploadIcon } from '@/assets/image-upload-icon';
import { TypingText } from '@/components/animate-ui/text/typing';
import FollowUpQuestions from '@/components/chatbot/follow-up-questions';
import StickyChatbox from '@/components/chatbot/sticky-chatbox';
import ImageUploader from '@/components/image-uploader/image-picker';
import Section from '@/components/layouts/section';
import IconicPhotoModal from '@/components/modals/IconicPhotoModal';
import NewCarousel from '@/components/new-carousel';
import { useAuth } from '@/contexts/auth-provider';
import { useUploadImageCloudRunMutation } from '@/store/redux/slices/storage/upload';
import {
  StoryProps,
  useDeleteStoryMutation,
  // useUpdateStoryMutation,
  useEditStoryMutation,
} from '@/store/redux/slices/user/story';

const EditDeleteMenu = ({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) => {
  return (
    <Popover position="bottom-end" withArrow>
      <Popover.Target>
        <UnstyledButton className="p-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
          <span className="text-xl">⋯</span>
        </UnstyledButton>
      </Popover.Target>
      <Popover.Dropdown className="w-32">
        <button
          onClick={onEdit}
          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
        >
          Delete
        </button>
      </Popover.Dropdown>
    </Popover>
  );
};

interface StoryClientProps {
  story: StoryProps;
  firstAccess?: boolean;
}

export default function StoryClient({ story, firstAccess }: StoryClientProps) {
  // Hooks
  const router = useRouter();
  const { user } = useAuth();
  const [deleteStory, { isLoading: isDeleting }] = useDeleteStoryMutation();
  const [editStory, { isLoading: isEditing }] = useEditStoryMutation();
  const [uploadImageCloudRun] = useUploadImageCloudRunMutation();

  // Story data extraction
  const {
    experience_id,
    seo_title_tag,
    story_content,
    userprofiles,
    created_at,
    experiences,
    follow_up_questions,
    media_assets,
    id: storyId,
    user_id: storyUserId,
    status: storyStatus,
  } = story;

  // Computed values
  const storyTitle = useMemo(
    () => seo_title_tag || experiences?.name || 'Travel Story',
    [seo_title_tag, experiences?.name],
  );
  const storyContent = useMemo(
    () => story_content || 'No content available',
    [story_content],
  );
  const storyAuthor = useMemo(
    () =>
      userprofiles?.firstname && userprofiles?.lastname
        ? `${userprofiles.firstname} ${userprofiles.lastname}`
        : userprofiles?.email || 'Unknown Author',
    [userprofiles],
  );
  const userImageSrc = userprofiles?.media_assets?.url;
  const storyDate = useMemo(
    () =>
      created_at
        ? new Date(created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'Unknown Date',
    [created_at],
  );
  const storyExperience = useMemo(
    () => experiences?.name || 'Unknown Experience',
    [experiences?.name],
  );
  const images = useMemo(
    () => media_assets?.map((item) => item.url).filter(Boolean) || [],
    [media_assets],
  );

  const handleImageLoad = useCallback((_imageUrl: string) => {
    // Image loaded successfully - could be used for analytics or debugging
    // console.log('Image loaded:', imageUrl);
  }, []);

  const handleImageError = useCallback((_imageUrl: string) => {
    // Handle image load error - could be used for analytics or debugging
    // console.log('Image failed to load:', imageUrl);
  }, []);
  const iconicPhotos = useMemo(
    () =>
      images.map((url, index) => ({
        id: `story-photo-${index}`,
        url,
        name: `Story photo ${index + 1}`,
        text: `Story photo ${index + 1}`,
      })),
    [images],
  );

  // Memoize editImages initialization
  const initialEditImages = useMemo(
    () =>
      story?.media_assets?.map((item) => ({
        image: item.url ?? null,
        name: item.url ? (item.url.split('/').pop() ?? null) : null,
        isExisting: true,
      })) ?? [],
    [story?.media_assets],
  );

  // State management
  const [editMode, setEditMode] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [title, setTitle] = useState(storyTitle);
  const [body, setBody] = useState(storyContent);
  const [editImages, setEditImages] = useState(initialEditImages);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [original, setOriginal] = useState({
    title: storyTitle,
    body: storyContent,
    images: initialEditImages,
  });

  // Reset saving state when edit mode changes
  useEffect(() => {
    if (!editMode) {
      setIsSaving(false);
    }
  }, [editMode]);

  // Use useMemo to check for first access (don't cleanup immediately)
  const isFirstAccess = useMemo(() => {
    if (typeof window !== 'undefined') {
      const sessionKey = `story-${story.id}-first-access`;
      const hasFirstAccess = sessionStorage.getItem(sessionKey) === 'true';
      if (hasFirstAccess) {
        // Don't remove session storage here - will be cleaned up when animation completes
        return true;
      }
      return false;
    }

    return {
      isFirstAccess: firstAccess || false,
      showTypingAnimation: firstAccess || false,
    };
  }, [story.id, story.created_at, firstAccess]);

  // Computed flags
  const isStoryOwner = useMemo(() => {
    return user?.userid === storyUserId;
  }, [user?.userid, storyUserId]);
  const isArchived = storyStatus === 'ARCHIVED';
  const isMobile = useMemo(
    () =>
      typeof window !== 'undefined' &&
      /Mobi|Android/i.test(navigator.userAgent),
    [],
  );

  // Callbacks
  const renderCarouselItem = useCallback(
    (photo: string, index: number) => (
      <motion.div
        key={photo}
        layout // This enables smooth layout transitions when items are added/removed
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.3,
          ease: 'easeInOut',
          layout: { duration: 0.4, ease: 'easeInOut' }, // Smooth position swapping
        }}
        className="h-full flex items-center justify-center rounded-md border border-gray-200 bg-white flex-shrink-0 cursor-pointer overflow-hidden relative"
        onClick={() => setSelectedPhotoIndex(index)}
      >
        {/* Loading skeleton - shown while image is loading */}
        <div className="absolute inset-0 w-[320px] bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full animate-pulse"></div>
            <div className="flex flex-col gap-2 items-center">
              <div className="h-3 bg-gray-300 rounded w-24 animate-pulse"></div>
              <div className="h-3 bg-gray-300 rounded w-20 animate-pulse"></div>
            </div>
          </div>
        </div>

        <img
          src={photo}
          alt={photo}
          className="w-auto h-80 md:h-96 object-cover rounded-md relative z-10"
          onLoad={(e) => {
            // Image loaded successfully - hide skeleton and show image
            e.currentTarget.style.opacity = '1';
            e.currentTarget.previousElementSibling?.classList.add('hidden');
            handleImageLoad(photo);
          }}
          onError={(e) => {
            // Handle image load error - show error fallback
            e.currentTarget.style.display = 'none';
            e.currentTarget.previousElementSibling?.classList.add('hidden');
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
            handleImageError(photo);
          }}
          style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
        />

        {/* Fallback for failed images */}
        <div className="hidden w-auto h-80 md:h-96 bg-gray-100 items-center justify-center rounded-md">
          <div className="text-gray-400 text-sm text-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-2 animate-pulse"></div>
            Image unavailable
          </div>
        </div>
      </motion.div>
    ),
    [handleImageLoad, handleImageError],
  );

  const handleChatSend = useCallback(
    (
      text: string,
      _images: Array<{ image: string | null; name: string | null }> = [],
    ) => {
      localStorage.setItem('chat-input', text);
      router.replace(`/?experienceId=${experience_id}`);
    },
    [router, experience_id],
  );
  const handleShare = useCallback(() => {
    // Check if native share API is available (mobile devices)
    if (navigator.share && isMobile) {
      navigator
        .share({
          title: storyTitle,
          text: `Check out this travel story: ${storyTitle}`,
          url: window.location.href,
        })
        .catch((error) => {
          console.log('Error sharing:', error);
          // Fallback to clipboard copy
          navigator.clipboard.writeText(window.location.href);
          if (!isMobile) {
            notifications.show({
              title: 'Link copied!',
              message: 'Story link has been copied to clipboard',
              color: 'green',
            });
          }
        });
    } else {
      // Desktop: copy to clipboard and show notification
      navigator.clipboard.writeText(window.location.href);
      if (!isMobile) {
        notifications.show({
          title: 'Link copied!',
          message: 'Story link has been copied to clipboard',
          color: 'green',
        });
      }
    }
  }, [storyTitle, isMobile]);

  // Add delete handler
  const handleDelete = useCallback(async () => {
    if (!storyId) {
      notifications.show({
        title: 'Error',
        message: 'Story ID not found',
        color: 'red',
      });
      return;
    }

    if (!isStoryOwner) {
      notifications.show({
        title: 'Error',
        message: 'You can only delete your own stories',
        color: 'red',
      });
      return;
    }

    try {
      await deleteStory({ storyId }).unwrap();
      notifications.show({
        title: 'Success',
        message: isArchived
          ? 'Archived story deleted successfully'
          : 'Story deleted successfully',
        color: 'green',
      });
      // Navigate back to stories list
      router.replace('/stories');
    } catch (_error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete story. Please try again.',
        color: 'red',
      });
    }
  }, [deleteStory, storyId, router, isStoryOwner, isArchived]);

  // Add save changes handler
  const handleSaveChanges = useCallback(async () => {
    // Set saving state immediately
    setIsSaving(true);

    if (!storyId) {
      notifications.show({
        title: 'Error',
        message: 'Story ID not found',
        color: 'red',
      });
      setIsSaving(false);
      return;
    }

    if (!isStoryOwner) {
      notifications.show({
        title: 'Error',
        message: 'You can only edit your own stories',
        color: 'red',
      });
      setIsSaving(false);
      return;
    }

    if (isArchived) {
      notifications.show({
        title: 'Error',
        message: 'Cannot edit archived stories',
        color: 'red',
      });
      setIsSaving(false);
      return;
    }

    // Check if any changes were made
    const hasTitleChanged = title !== original.title;
    const hasBodyChanged = body !== original.body;

    // Check if images have changed by comparing the current editImages with original images
    const hasImagesChanged =
      JSON.stringify(editImages) !== JSON.stringify(original.images);

    // If no changes were made, show a notification and return early
    if (!hasTitleChanged && !hasBodyChanged && !hasImagesChanged) {
      notifications.show({
        title: 'No Changes',
        message: 'No changes were made to save.',
        color: 'blue',
      });
      setIsSaving(false);
      return;
    }

    try {
      // Prepare update payload with only changed fields
      const updatePayload: any = {};

      // Only include title if it changed
      if (hasTitleChanged) {
        updatePayload.seo_title_tag = title;
      }

      // Only include body if it changed
      if (hasBodyChanged) {
        updatePayload.story_content = body;
      }

      // Only handle images if they changed
      if (hasImagesChanged) {
        const mediaUrls: string[] = [];

        for (const imageItem of editImages) {
          if (imageItem.image) {
            if (imageItem.isExisting) {
              // This is an existing image URL - preserve it
              mediaUrls.push(imageItem.image);
            } else {
              // This is a new image that needs to be uploaded
              try {
                const payload = {
                  media: {
                    mimeType: 'image/jpeg',
                    body: imageItem.image,
                  },
                  bucket_name: 'story',
                };
                const { url } = await uploadImageCloudRun(payload).unwrap();
                mediaUrls.push(url);
              } catch (_error) {
                notifications.show({
                  title: 'Error uploading image',
                  message: 'Failed to upload one or more images.',
                  color: 'red',
                });
                return;
              }
            }
          }
        }
        updatePayload.media_assets = mediaUrls;
      }

      updatePayload.story_id = storyId;

      await editStory(updatePayload).unwrap();

      notifications.show({
        title: 'Success',
        message: 'Story updated successfully',
        color: 'green',
      });

      setOriginal({ title, body, images: editImages });
      setEditMode(false);

      // Refresh the page to show updated server-side data
      router.refresh();
    } catch (_error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update story. Please try again.',
        color: 'red',
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    // updateStory,
    editStory,
    uploadImageCloudRun,
    storyId,
    title,
    body,
    editImages,
    original,
    isStoryOwner,
    isArchived,
    setIsSaving,
    setEditMode,
    setOriginal,
    router,
    notifications,
  ]);

  return (
    <>
      <div className="h-full w-full flex flex-col gap-4 py-6 md-py-8">
        {/* Archived Badge */}
        {isArchived && isStoryOwner && (
          <div className="mb-4">
            <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-base font-semibold">
              <span className="mr-3 text-lg">📁</span>
              Archived
            </div>
          </div>
        )}

        {/* Playful Archived Message for Guests */}
        {isArchived && !isStoryOwner && (
          <div className="max-w-2xl mx-auto p-8 text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">🗑️</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Oops! This story went on vacation! 🏖️
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Looks like this travel tale has been archived and is taking a
                well-deserved break. The author decided to put it in the digital
                attic for now.
              </p>
              <div className="bg-gradient-to-r from-orange-100 to-yellow-100 p-6 rounded-lg border-2 border-dashed border-orange-300">
                <p className="text-orange-800 font-medium mb-2">
                  💡 What happened here?
                </p>
                <p className="text-orange-700 text-sm">
                  {`The story owner has archived this content. It's like putting a
                  book back on the shelf - it's still there, just not on display
                  for everyone to see!`}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Navigating to /stories');
                  setTimeout(() => {
                    router.replace('/stories');
                  }, 0);
                }}
                className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                📚 Browse Other Stories
              </button>
              <div className="text-sm text-gray-500">
                <p>Or</p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Navigating to /stories/new');
                    setTimeout(() => {
                      router.replace('/stories/new');
                    }, 0);
                  }}
                  className="text-orange-500 hover:text-orange-600 underline font-medium"
                >
                  ✍️ Create Your Own Adventure
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Normal Story Content (only show if not archived for guests) */}
        {(!isArchived || isStoryOwner) && (
          <>
            {/* Title and Share Section */}
            <section>
              {/* Mobile: Back and action buttons on one row above title */}
              <div className="flex gap-2 items-center justify-between md:hidden">
                {isStoryOwner ? (
                  <button
                    type="button"
                    onClick={() => router.replace('/stories')}
                    className="flex items-center gap-2 py-2 text-gray-800"
                  >
                    <IconChevronLeft className="size-5" />
                    <span className="text-base">My Stories</span>
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex gap-3">
                  {isStoryOwner && !editMode && (
                    <EditDeleteMenu
                      onEdit={() => {
                        if (isArchived) {
                          notifications.show({
                            title: 'Cannot Edit',
                            message: 'Archived stories cannot be edited',
                            color: 'yellow',
                          });
                          return;
                        }
                        setEditMode(true);
                        setOriginal({ title, body, images: editImages });
                      }}
                      onDelete={() => {
                        if (isArchived) {
                          notifications.show({
                            title: 'Cannot Delete',
                            message: 'Archived stories cannot be deleted',
                            color: 'yellow',
                          });
                          return;
                        }
                        setShowDelete(true);
                      }}
                    />
                  )}

                  {!editMode && (
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer"
                    >
                      <PiShareFat size={20} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-3">
                {editMode ? (
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border-b-2 w-full flex-1 text-[32px] font-semibold text-gray-900 leading-tight mt-2 md:mt-0"
                  />
                ) : (
                  <h1 className="text-[32px] font-semibold text-gray-900 leading-tight">
                    {title}
                  </h1>
                )}
                <div className="hidden md:flex gap-2 justify-end md:ml-2 md:align-middle">
                  {isStoryOwner && !editMode && (
                    <EditDeleteMenu
                      onEdit={() => {
                        if (isArchived) {
                          notifications.show({
                            title: 'Cannot Edit',
                            message: 'Archived stories cannot be edited',
                            color: 'yellow',
                          });
                          return;
                        }
                        setEditMode(true);
                        setOriginal({ title, body, images: editImages });
                      }}
                      onDelete={() => {
                        if (isArchived) {
                          notifications.show({
                            title: 'Cannot Delete',
                            message: 'Archived stories cannot be deleted',
                            color: 'yellow',
                          });
                          return;
                        }
                        setShowDelete(true);
                      }}
                    />
                  )}

                  {!editMode && (
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer"
                    >
                      <PiShareFat size={20} />
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Author and Date Info Section */}
            <Section>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Avatar
                    src={userImageSrc}
                    size="md"
                    radius="xl"
                    color="orange"
                    name={storyAuthor}
                    alt={`${storyAuthor}'s avatar`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-600 mb-1">
                    <span className="font-medium text-gray-900">
                      {storyAuthor}
                    </span>
                    <span className="mx-2">•</span>
                    <span>{storyDate}</span>
                  </div>
                  <div className="text-sm">
                    {editMode ? (
                      <span className="text-blue-400 cursor-not-allowed">
                        {storyExperience}
                      </span>
                    ) : (
                      <a
                        href={`/discoveries/${experience_id}`}
                        className="text-gray-500 hover:text-blue-800 hover:underline flex items-center gap-1 transition-colors duration-200"
                      >
                        {storyExperience}
                        <HiExternalLink size={14} className="inline" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Section>

            {/* Photo Grid or Carousel Section */}
            <Section>
              {editMode ? (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Story Images:
                  </h4>
                  <ImageUploader
                    onImageUpload={(files) => {
                      // Handle both adding new images and removing existing ones
                      setEditImages((prev) => {
                        // If files array is smaller than prev, it means images were removed
                        if (files.length < prev.length) {
                          // Find which images were removed by comparing names
                          const remainingNames = files
                            .map((f) => f.name)
                            .filter(Boolean);
                          return prev.filter((img) => {
                            // Keep existing images that are still in the files array
                            if (img.isExisting) {
                              return (
                                img.name && remainingNames.includes(img.name)
                              );
                            }
                            // Keep new images that are still in the files array
                            return (
                              img.name && remainingNames.includes(img.name)
                            );
                          });
                        } else {
                          // Adding new images - apply deduplication
                          const existingNames = prev
                            .map((img) => img.name)
                            .filter(Boolean);

                          // Filter out files that already exist based on name
                          const newFiles = files.filter((file) => {
                            if (!file.name) return true; // Allow files without names
                            return !existingNames.includes(file.name);
                          });

                          // Add only new, non-duplicate files
                          return [
                            ...prev,
                            ...newFiles.map((f) => ({
                              image: f.image || '',
                              name: f.name,
                              isExisting: false, // Mark new images
                            })),
                          ];
                        }
                      });
                    }}
                    allowMultiple={true}
                    isStandalone={true}
                    className="mt-2"
                    // Pass existing images to show them in the uploader
                    fetchImages={editImages.map((img) => ({
                      image: img.image || '',
                      name: img.name || '',
                      isExisting: img.isExisting,
                    }))}
                  >
                    <ImageUploadIcon
                      className="size-50 text-white color-orange-500"
                      size={100}
                    />
                  </ImageUploader>
                </div>
              ) : images.length > 0 ? (
                <div className="relative w-full rounded-lg">
                  <NewCarousel
                    items={images}
                    enableInfiniteLoop={false}
                    slideGap={16}
                    renderItem={renderCarouselItem}
                  />
                </div>
              ) : (
                <div className="relative w-full rounded-lg overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse"></div>
                        <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Section>

            {/* Story Content Section */}
            <Section>
              <div className="text-base font-normal text-gray-800 pb-4">
                {editMode ? (
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full border rounded p-2 min-h-[200px]"
                  />
                ) : isFirstAccess &&
                  storyContent &&
                  storyContent.length > 0 &&
                  !isArchived ? (
                  <div className="space-y-2">
                    <TypingText
                      text={body}
                      duration={5}
                      onComplete={() => {
                        // Clean up session storage when typing animation is fully displayed and finished
                        if (typeof window !== 'undefined') {
                          const sessionKey = `story-${story.id}-first-access`;
                          sessionStorage.removeItem(sessionKey);
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div>
                    <p className="whitespace-pre-line">{body}</p>
                  </div>
                )}
              </div>
            </Section>

            {/* Edit Mode Buttons Section */}
            {editMode && (
              <Section>
                <div className="flex gap-2 mt-2">
                  <button
                    className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors disabled:opacity-50"
                    onClick={handleSaveChanges}
                    disabled={isEditing || isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
                    onClick={() => {
                      setEditMode(false);
                      setTitle(original.title);
                      setBody(original.body);
                      setEditImages(original.images);
                      setIsSaving(false);
                    }}
                    disabled={isEditing || isSaving}
                  >
                    Cancel
                  </button>
                </div>
              </Section>
            )}

            {/* Follow-up Questions Section */}
            {!editMode && (
              <Section>
                <FollowUpQuestions
                  questions={follow_up_questions || []}
                  experienceId={experience_id}
                  disabled={editMode}
                />
              </Section>
            )}

            {/* Photo Modal */}
            {iconicPhotos.length > 0 && (
              <IconicPhotoModal
                photos={iconicPhotos}
                selectedIndex={selectedPhotoIndex}
                onClose={() => setSelectedPhotoIndex(null)}
                onNavigate={(newIndex) => setSelectedPhotoIndex(newIndex)}
              />
            )}
          </>
        )}

        {/* Delete Modal */}
        {showDelete && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-80">
              <p className="text-lg font-semibold mb-4">
                {isArchived
                  ? 'Are you sure you want to permanently delete this archived story?'
                  : 'Are you sure you want to delete this story?'}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                {isArchived
                  ? 'This archived story will be permanently deleted and cannot be recovered.'
                  : 'This action cannot be undone.'}
              </p>
              <div className="flex gap-2 mt-4">
                <button
                  className="flex-1 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                  onClick={() => setShowDelete(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Sticky Chatbox at the bottom */}
      {!editMode && (
        <StickyChatbox
          className="bg-gray-50"
          isHome={false}
          isMobile={isMobile}
          hasMessages={false}
          initialSuggestions={[]}
          onSend={handleChatSend}
          disabled={editMode}
        />
      )}
    </>
  );
}
