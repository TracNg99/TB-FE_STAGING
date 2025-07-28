'use client';

import { Avatar, Popover, UnstyledButton } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { HiExternalLink } from 'react-icons/hi';
import { PiShareFat } from 'react-icons/pi';

import { ImageUploadIcon } from '@/assets/image-upload-icon';
import { TypingText } from '@/components/animate-ui/text/typing';
import FollowUpQuestions from '@/components/chatbot/follow-up-questions';
import StickyChatbox from '@/components/chatbot/sticky-chatbox';
import ImageUploader from '@/components/image-uploader/image-picker';
import PageWrapper from '@/components/layouts/PageWrapper';
import IconicPhotoModal from '@/components/modals/IconicPhotoModal';
import NewCarousel from '@/components/new-carousel';
import { useAuth } from '@/contexts/auth-provider';
import { useUploadImageCloudRunMutation } from '@/store/redux/slices/storage/upload';
import {
  StoryProps,
  useDeleteStoryMutation,
  useUpdateStoryMutation,
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
        <UnstyledButton className="p-2">
          <span className="text-2xl">⋮</span>
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
  firstAccess: boolean;
}

export default function StoryClient({ story, firstAccess }: StoryClientProps) {
  // Memoize derived values

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
  const storyTitle = useMemo(
    () => seo_title_tag || experiences?.name || 'Travel Story',
    [story],
  );
  const storyContent = useMemo(
    () => story_content || 'No content available',
    [story],
  );
  const storyAuthor = useMemo(
    () =>
      userprofiles?.firstname && userprofiles?.lastname
        ? `${userprofiles.firstname} ${userprofiles.lastname}`
        : userprofiles?.email || 'Unknown Author',
    [story],
  );
  const userImageSrc = userprofiles?.media_assets?.url;

  const storyDate = useMemo(
    () =>
      created_at ? new Date(created_at).toLocaleDateString() : 'Unknown Date',
    [story],
  );
  const storyExperience = useMemo(
    () => experiences?.name || 'Unknown Experience',
    [story],
  );
  const images = useMemo(
    () => media_assets?.map((item) => item.url).filter(Boolean) || [],
    [story],
  );

  // Convert images to IconicPhoto format for the modal
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

  const router = useRouter();
  const { user } = useAuth();
  const [deleteStory, { isLoading: isDeleting }] = useDeleteStoryMutation();
  const [updateStory, { isLoading: isUpdating }] = useUpdateStoryMutation();
  const [uploadImageCloudRun] = useUploadImageCloudRunMutation();

  // Check if current user is the story owner
  const isStoryOwner = useMemo(() => {
    return user?.userid === storyUserId;
  }, [user?.userid, storyUserId]);

  // Check if story is archived
  const isArchived = storyStatus === 'ARCHIVED';

  // Memoize editImages initialization
  const initialEditImages = useMemo(
    () =>
      story?.media_assets?.map((item) => ({
        image: item.url ?? null,
        name: item.url ? (item.url.split('/').pop() ?? null) : null,
      })) ?? [],
    [story],
  );

  const [editMode, setEditMode] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [title, setTitle] = useState(storyTitle);
  const [body, setBody] = useState(storyContent);
  const [editImages, setEditImages] = useState(initialEditImages);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null,
  );
  const [original, setOriginal] = useState({
    title: storyTitle,
    body: storyContent,
    images: initialEditImages,
  });

  // Memoize callbacks
  // const handleRemoveImage = useCallback((idx: number) => {
  //   setEditImages((prev) => prev.filter((_, i) => i !== idx));
  // }, []);

  // Move renderItem useCallback to top level
  const renderCarouselItem = useCallback(
    (photo: string, index: number) => (
      <div
        key={photo}
        className="h-full flex items-center justify-center rounded-md border border-gray-200 bg-white flex-shrink-0 cursor-pointer overflow-hidden"
        onClick={() => setSelectedPhotoIndex(index)}
      >
        <img
          src={photo}
          alt={photo}
          className="w-auto h-80 md:h-96 object-cover rounded-md"
        />
      </div>
    ),
    [],
  );

  const isMobile =
    typeof window !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent);
  const handleChatSend = useCallback(
    (
      text: string,
      _images: Array<{ image: string | null; name: string | null }> = [],
    ) => {
      localStorage.setItem('chat-input', text);
      router.push(`/?experienceId=${experience_id}`);
    },
    [router, experience_id],
  );
  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    notifications.show({
      title: 'Link copied!',
      message: 'Story link has been copied to clipboard',
      color: 'green',
    });
  }, []);

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
      router.push('/stories');
    } catch (error) {
      console.error('Error deleting story:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete story. Please try again.',
        color: 'red',
      });
    }
  }, [deleteStory, storyId, router, isStoryOwner, isArchived]);

  // Add save changes handler
  const handleSaveChanges = useCallback(async () => {
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
        message: 'You can only edit your own stories',
        color: 'red',
      });
      return;
    }

    if (isArchived) {
      notifications.show({
        title: 'Error',
        message: 'Cannot edit archived stories',
        color: 'red',
      });
      return;
    }

    try {
      // Upload new images if any
      const mediaUrls: string[] = [];

      for (const imageItem of editImages) {
        if (imageItem.image && !imageItem.image.startsWith('http')) {
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
          } catch (error) {
            console.error('Error uploading image:', error);
            notifications.show({
              title: 'Error uploading image',
              message: 'Failed to upload one or more images.',
              color: 'red',
            });
            return;
          }
        } else if (imageItem.image) {
          // This is an existing image URL
          mediaUrls.push(imageItem.image);
        }
      }

      // Prepare update payload
      const updatePayload = {
        seo_title_tag: title,
        story_content: body,
        media: mediaUrls,
      };

      await updateStory({ storyId, payload: updatePayload }).unwrap();

      notifications.show({
        title: 'Success',
        message: 'Story updated successfully',
        color: 'green',
      });

      setEditMode(false);
      setOriginal({ title, body, images: editImages });
    } catch (error) {
      console.error('Error updating story:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update story. Please try again.',
        color: 'red',
      });
    }
  }, [
    updateStory,
    uploadImageCloudRun,
    storyId,
    title,
    body,
    editImages,
    isStoryOwner,
    isArchived,
  ]);

  return (
    <PageWrapper>
      <div className="w-full flex flex-col gap-2 pt-4 pb-24 md:pb-4">
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
              <a
                href="/stories"
                className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                📚 Browse Other Stories
              </a>
              <div className="text-sm text-gray-500">
                <p>Or</p>
                <a
                  href="/stories/new"
                  className="text-orange-500 hover:text-orange-600 underline font-medium"
                >
                  ✍️ Create Your Own Adventure
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Normal Story Content (only show if not archived for guests) */}
        {(!isArchived || isStoryOwner) && (
          <>
            {/* Title and Share */}
            <div className="mb-2">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-3">
                {editMode ? (
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border-b-2 w-full flex-1 text-[32px] font-semibold text-gray-900 leading-tight"
                  />
                ) : (
                  <h1 className="text-[32px] font-semibold text-gray-900 leading-tight">
                    {title}
                  </h1>
                )}
                <div className="flex gap-2 justify-end md:ml-2 md:align-middle">
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
            </div>
            {/* Author and Date Info */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Avatar
                  src={userImageSrc}
                  size="lg"
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
            </div>{' '}
            {/* Photo Grid or Carousel */}
            {editMode ? (
              <div className="mb-4">
                <ImageUploader
                  onImageUpload={(files) =>
                    setEditImages(
                      files.map((f) => ({
                        image: f.image || '',
                        name: f.name,
                      })),
                    )
                  }
                  allowMultiple={true}
                  isStandalone={true}
                  className="mt-2"
                >
                  <ImageUploadIcon
                    className="size-50 text-white color-orange-500"
                    size={100}
                  />
                </ImageUploader>
              </div>
            ) : (
              images.length > 0 && (
                <div className="relative w-full rounded-lg ">
                  <NewCarousel
                    items={images}
                    enableInfiniteLoop={false}
                    slideGap={16}
                    renderItem={renderCarouselItem}
                  />
                </div>
              )
            )}
            {/* Story Content */}
            <section>
              <div className="text-base font-normal text-gray-800">
                {editMode ? (
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full border rounded p-2 min-h-[200px]"
                  />
                ) : firstAccess ? (
                  <TypingText text={body} duration={5} />
                ) : (
                  body.split('\n').map((para, idx) => (
                    <p key={idx} className="mb-2 whitespace-pre-line">
                      {para}
                    </p>
                  ))
                )}
              </div>
            </section>
            {/* Edit Mode Buttons */}
            {editMode && (
              <div className="flex gap-2 mt-2">
                <button
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors disabled:opacity-50"
                  onClick={handleSaveChanges}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Saving...' : 'Save'}
                </button>
                <button
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
                  onClick={() => {
                    setEditMode(false);
                    setTitle(original.title);
                    setBody(original.body);
                    setEditImages(original.images);
                  }}
                  disabled={isUpdating}
                >
                  Cancel
                </button>
              </div>
            )}
            {/* Follow-up Questions */}
            <FollowUpQuestions
              questions={follow_up_questions || []}
              experienceId={experience_id}
              disabled={editMode}
            />
            {/* Sticky Chatbox at the bottom */}
            {!editMode && (
              <StickyChatbox
                isHome={false}
                isMobile={isMobile}
                hasMessages={false}
                initialSuggestions={[]}
                onSend={handleChatSend}
                disabled={editMode}
              />
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
    </PageWrapper>
  );
}
