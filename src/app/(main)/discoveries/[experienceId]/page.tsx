'use client';

import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconInfoCircle, IconQrcode } from '@tabler/icons-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PiShareFat } from 'react-icons/pi';

import TTSButton from '@/components/audio-handler/tts-button';
import FollowUpQuestions from '@/components/chatbot/follow-up-questions';
import StickyChatbox from '@/components/chatbot/sticky-chatbox';
import IconFeatureCamera from '@/components/icons/icon-feature-camera';
import Section from '@/components/layouts/section';
import IconicPhotoModal from '@/components/modals/IconicPhotoModal';
import WelcomeModal from '@/components/modals/WelcomeModal';
import ActivityModal from '@/components/modals/activity';
import NewCarousel from '@/components/new-carousel';
import QRModal from '@/components/qr-code/qr-modal';
import { useGetActivitiesInExperiencePublicQuery } from '@/store/redux/slices/user/activity';
import type { Activity } from '@/store/redux/slices/user/experience';
import {
  useGetExperiencePublicQuery,
  useGetIconicPhotosPublicQuery,
} from '@/store/redux/slices/user/experience';

const SECTION_TITLE_CLASS =
  'text-[#222] text-[20px] font-semibold flex items-center gap-2 mb-4';

const ExperienceDetailPage = () => {
  const { experienceId } = useParams();
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const {
    data: experience,
    isLoading,
    error,
  } = useGetExperiencePublicQuery({
    id: experienceId as string,
  });

  // QR Modal state
  const [qrOpen, setQrOpen] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [language, setLanguage] = useState('');

  const searchParams = useSearchParams();
  const isFromQRScan = searchParams.get('fromQR') === 'true';

  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);

  useEffect(() => {
    const languageState = sessionStorage.getItem('language');
    if (languageState) {
      setLanguage(languageState);
    }
  }, []);

  useEffect(() => {
    const jwt = localStorage.getItem('jwt');
    if (isFromQRScan && (!jwt || jwt === '' || jwt === null)) {
      setIsWelcomeModalOpen(true);
    }
  }, [isFromQRScan]);

  useEffect(() => {
    if (experience && experienceId && isFromQRScan) {
      sessionStorage.setItem('experience_id', (experienceId as string) || '');
      sessionStorage.setItem('company_id', experience.owned_by || '');
    }
  }, [experience, experienceId, isFromQRScan]);

  const handleContinue = ({
    email,
    language,
  }: {
    email: string;
    language: string;
  }) => {
    sessionStorage.setItem('email', email);
    sessionStorage.setItem('language', language);
    setLanguage(language);
    setIsWelcomeModalOpen(false);
  };

  // Fetch activities for this experience
  const { data: activities = [], isLoading: isLoadingActivities } =
    useGetActivitiesInExperiencePublicQuery({
      experience_id: experienceId as string,
    });

  // Fetch iconic photos for this experience
  const { data: iconicPhotos = [], isLoading: isLoadingIconicPhotos } =
    useGetIconicPhotosPublicQuery({ id: experienceId as string });

  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null,
  );
  const [_chatSuggestions, setChatSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (experience && experience.default_questions) {
      setFollowUpQuestions(experience.default_questions);
      setChatSuggestions(experience.default_questions);
    }
  }, [experience]);

  if (isLoading || isLoadingActivities || isLoadingIconicPhotos)
    return <div className="flex justify-center py-20">Loading...</div>;
  if (error || !experience)
    return (
      <div className="text-red-500 text-center py-20">
        Experience not found.
      </div>
    );

  // Share button logic
  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    notifications.show({
      message: 'Link copied to clipboard!',
      color: 'green',
    });
  };

  // Chat handler - navigate to homepage with experience context
  const handleChatSend = (
    text: string,
    _images: Array<{ image: string | null; name: string | null }> = [],
  ) => {
    sessionStorage.setItem('chat-input', text);
    router.push(`/?experienceId=${experienceId}`);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col gap-6 pb-8 py-6 md:py-8 flex-1">
        {/* Welcome Modal */}
        <WelcomeModal
          isOpen={isWelcomeModalOpen}
          onContinue={handleContinue}
          experienceId={experienceId as string}
        />
        {/* Title and QR icon */}
        <div className="mb-2">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-3">
            <h1 className="text-[32px] font-semibold text-gray-900 leading-tight">
              {experience.name}
            </h1>
            <div className="flex gap-2 md:ml-2 md:items-center">
              <button
                className="rounded text-gray-700 hover:text-orange-500 transition focus:outline-none"
                onClick={() => setQrOpen(true)}
                title="Show QR code"
              >
                <IconQrcode className="w-8 h-8" />
              </button>
              <button
                className="rounded transition-colors hover:text-orange-500 focus:outline-none"
                onClick={handleCopy}
                title="Copy link to clipboard"
              >
                <PiShareFat size={20} />
              </button>
              <TTSButton
                contentId={experienceId as string}
                language={language}
                buttonClassName="rounded-lg cursor-pointer flex items-center justify-center"
              />
            </div>
          </div>
          <QRModal
            open={qrOpen}
            onClose={() => setQrOpen(false)}
            contentId={experienceId as string}
            displayText={experience.name}
          />
        </div>
        {/* Divider */}
        <hr className="border-black" />
        {/* Short Description */}
        <p className="text-base leading-relaxed text-black text-[16px]">
          {experience.thumbnail_description || experience.description}
        </p>
        {/* Image */}
        <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden shadow-md">
          <img
            src={experience.primary_photo || ''}
            alt={experience.name || ''}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        {/* About Section */}
        <Section>
          <div className={SECTION_TITLE_CLASS}>
            <IconInfoCircle className="w-6 h-6 text-[#8338EC]" stroke={2} />
            <span>About</span>
          </div>
          <div className="text-base font-normal text-gray-800">
            {experience.description && (
              <div
                dangerouslySetInnerHTML={{
                  __html: experience.description.replace(/\n/g, '<br />'),
                }}
              />
            )}
          </div>
        </Section>
        {/* Activities You'll Experience */}
        <Section className="gap">
          <div className={SECTION_TITLE_CLASS}>
            <img src="/assets/idea.svg" alt="Idea" className="w-6 h-6" />
            <span>{`Activities You'll Experience`}</span>
          </div>
          <div className="relative w-full">
            <NewCarousel
              items={[...activities].sort(
                (a, b) => a.order_of_appearance - b.order_of_appearance,
              )}
              renderItem={(activity) => (
                <div
                  className="min-w-[240px] max-w-[260px] h-full border border-gray-200 rounded-md bg-white overflow-hidden flex-shrink-0 flex flex-col justify-between p-0 cursor-pointer"
                  onClick={() => setSelectedActivity(activity)}
                >
                  <img
                    src={
                      activity.primary_photo ||
                      '/placeholder.svg?height=192&width=260'
                    }
                    alt={activity.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-3 flex-1 flex flex-col ">
                    <div className="font-bold text-gray-800 text-base mb-1 truncate whitespace-nowrap overflow-hidden">
                      {activity.title}
                    </div>
                    <div className="text-base text-gray-800 line-clamp-3">
                      {activity.description_thumbnail}
                    </div>
                  </div>
                </div>
              )}
              className=""
              enableInfiniteLoop={false}
              slideGap={16}
            />
            {selectedActivity && (
              <ActivityModal
                isOpen={!!selectedActivity}
                onClose={() => setSelectedActivity(null)}
                activity={{
                  id: selectedActivity.id,
                  photos: selectedActivity.photos,
                  title: selectedActivity.title,
                  description: selectedActivity.description,
                  description_thumbnail: selectedActivity.description_thumbnail,
                  imageUrl: selectedActivity.primary_photo,
                  location: selectedActivity.address || '',
                  address: selectedActivity.address || '',
                  hours: selectedActivity.hours || '',
                }}
                experience_name={experience.name}
                language={language}
              />
            )}
          </div>
        </Section>
        {/* Iconic Photos */}
        <Section>
          <div className={SECTION_TITLE_CLASS}>
            <IconFeatureCamera className="w-6 h-6 text-[#8338EC]" />
            <span>Iconic Photos</span>
          </div>
          <div className="relative w-full">
            <NewCarousel
              items={iconicPhotos}
              renderItem={(photo, idx) => (
                <div
                  key={photo.id}
                  className="h-full flex items-center justify-center rounded-md border border-gray-200 bg-white flex-shrink-0 cursor-pointer overflow-hidden"
                  onClick={() => setSelectedPhotoIndex(idx)}
                >
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="w-auto h-80 md:h-96 object-cover rounded-md"
                  />
                </div>
              )}
              className=""
              enableInfiniteLoop={false}
              slideGap={16}
            />
          </div>
          {/* Iconic Photo Modal */}
          <IconicPhotoModal
            photos={iconicPhotos}
            selectedIndex={selectedPhotoIndex}
            onClose={() => setSelectedPhotoIndex(null)}
            onNavigate={(newIndex) => setSelectedPhotoIndex(newIndex)}
          />
        </Section>
        {/* Follow-up Questions */}
        <FollowUpQuestions
          questions={followUpQuestions}
          experienceId={experienceId as string}
        />
      </div>
      {/* Chatbot */}
      <StickyChatbox
        className="bg-gray-50"
        isHome={false}
        isMobile={isMobile}
        hasMessages={false}
        initialSuggestions={[]}
        onSend={handleChatSend}
      />
    </div>
  );
};

export default ExperienceDetailPage;
