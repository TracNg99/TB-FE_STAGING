'use client';

import { IconShare } from '@tabler/icons-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

import { TypingText } from '@/components/animate-ui/text/typing';
import FollowUpQuestions from '@/components/chatbot/follow-up-questions';
import StickyChatbox from '@/components/chatbot/sticky-chatbox';
import FeatureCarousel from '@/components/feature-carousel';
import ImageDisplayBaseGrid from '@/components/image-uploader/image-display-base-grid';
import PageWrapper from '@/components/layouts/PageWrapper';
import { StoryProps } from '@/store/redux/slices/user/story';

const ShareButton = () => {
  const isMobile =
    typeof window !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent);
  const handleShare = () => {
    if (isMobile && navigator.share) {
      navigator.share({ url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('URL copied to clipboard!');
    }
  };
  return (
    <button
      onClick={handleShare}
      className="ml-2 p-2 bg-orange-500 text-white rounded-full flex items-center justify-center"
      title="Share"
    >
      <IconShare size={20} />
    </button>
  );
};

const EditDeleteMenu = ({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block text-left">
      <button onClick={() => setOpen(!open)} className="p-2">
        ...
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-10">
          <button
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Edit
          </button>
          <button
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
          >
            Delete
          </button>
        </div>
      )}
    </div>
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
    destinations,
    follow_up_questions,
    hashtags,
    media_assets,
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
  const storyDate = useMemo(
    () =>
      created_at ? new Date(created_at).toLocaleDateString() : 'Unknown Date',
    [story],
  );
  const storyExperience = useMemo(
    () => experiences?.name || 'Unknown Experience',
    [story],
  );
  const storyDestination = useMemo(() => destinations?.name || '', [story]);
  const images = useMemo(
    () => media_assets?.map((item) => item.url).filter(Boolean) || [],
    [story],
  );

  const router = useRouter();
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
  const [original, setOriginal] = useState({
    title: storyTitle,
    body: storyContent,
    images: initialEditImages,
  });

  // Memoize callbacks
  const handleRemoveImage = useCallback((idx: number) => {
    setEditImages((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  // Move renderItem useCallback to top level
  const renderCarouselItem = useCallback(
    (photo: string) => (
      <div className="relative rounded-xl overflow-hidden aspect-video w-full">
        <Image src={photo} alt="Story photo" fill className="object-cover" />
      </div>
    ),
    [],
  );

  const isMobile =
    typeof window !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent);
  const handleChatSend = (
    text: string,
    _images: Array<{ image: string | null; name: string | null }> = [],
  ) => {
    localStorage.setItem('chat-input', text);
    router.push(`/?experienceId=${experience_id}`);
  };
  return (
    <PageWrapper>
      <div className="w-full flex flex-col gap-2">
        {/* Title and Share */}
        <div className="mb-2">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-3">
            <h1 className="text-[32px] font-semibold text-gray-900 leading-tight">
              {editMode ? (
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-b-2 w-full"
                />
              ) : (
                title
              )}
            </h1>
            <div className="flex gap-2 md:ml-2 md:items-center">
              <EditDeleteMenu
                onEdit={() => {
                  setEditMode(true);
                  setOriginal({ title, body, images: editImages });
                }}
                onDelete={() => setShowDelete(true)}
              />
              <ShareButton />
            </div>
          </div>
        </div>

        {/* Author and Date Info */}
        <div className="text-gray-500 text-sm">
          By {storyAuthor} | {storyDate} | Experience: {storyExperience}
          {storyDestination && ` | Destination: ${storyDestination}`}
        </div>

        {/* Divider */}
        <hr className="border-black" />

        {/* Hashtags display */}
        {hashtags && hashtags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Photo Grid or Carousel */}
      {editMode ? (
        <div className="mb-4">
          <ImageDisplayBaseGrid
            selectedImages={editImages}
            handleRemoveImage={handleRemoveImage}
          />
        </div>
      ) : (
        images.length > 0 && (
          <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden shadow-md">
            <FeatureCarousel
              className="overflow-hidden"
              items={images}
              renderItem={renderCarouselItem}
              classNames={{ controls: 'justify-center' }}
              slideGap={32}
              paginationType="dots"
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
            <TypingText
              text={body}
              duration={5} // Super fast typing - 5ms per character
            />
          ) : (
            <div className="whitespace-pre-line">{body}</div>
          )}
        </div>
      </section>

      {/* Edit Mode Buttons */}
      {editMode && (
        <div className="flex gap-2 mt-2">
          <button
            className="px-4 py-2 bg-orange-500 text-white rounded"
            onClick={() => {
              setEditMode(false); /* TODO: save changes */
            }}
          >
            Save
          </button>
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={() => {
              setEditMode(false);
              setTitle(original.title);
              setBody(original.body);
              setEditImages(original.images);
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Follow-up Questions */}
      <FollowUpQuestions
        questions={follow_up_questions || []}
        experienceId={experience_id}
        className="mt-8"
      />

      {/* Delete Modal */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <p className="text-lg font-semibold mb-4">
              Are you sure you want to delete this story?
            </p>
            <div className="flex gap-2 mt-4">
              <button
                className="flex-1 px-4 py-2 bg-gray-200 rounded"
                onClick={() => setShowDelete(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded"
                onClick={() => {
                  setShowDelete(false); /* TODO: handle delete */
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Sticky Chatbox at the bottom */}
      <StickyChatbox
        isHome={false}
        isMobile={isMobile}
        hasMessages={false}
        initialSuggestions={[]}
        onSend={handleChatSend}
      />
    </PageWrapper>
  );
}
