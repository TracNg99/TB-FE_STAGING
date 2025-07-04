'use client';

import { notifications } from '@mantine/notifications';
import {
  IconChevronRight,
  IconCopy,
  IconInfoCircle,
  IconQrcode,
} from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import BuddyAI from '@/components/chatbot/buddy-ui-ai';
import IconFeatureCamera from '@/components/icons/icon-feature-camera';
import IconicPhotoModal from '@/components/modals/IconicPhotoModal';
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
const SECTION_CONTENT_CLASS = 'text-[20px] font-normal text-gray-800';

const ExperienceDetailPage = () => {
  const { experienceId } = useParams();
  const router = useRouter();
  const {
    data: experience,
    isLoading,
    error,
  } = useGetExperiencePublicQuery({ id: experienceId as string });

  // QR Modal state
  const [qrOpen, setQrOpen] = useState(false);

  // Fetch activities for this experience
  const { data: activities = [], isLoading: isLoadingActivities } =
    useGetActivitiesInExperiencePublicQuery({
      experience_id: experienceId as string,
    });

  // Fetch iconic photos for this experience
  const { data: iconicPhotos = [], isLoading: isLoadingIconicPhotos } =
    useGetIconicPhotosPublicQuery({ id: experienceId as string });

  // Dummy follow-up questions (replace with real data/component if available)
  // let followUpQuestions = [
  //   {
  //     label: 'Can I ride the Vespa myself on the Saigon After Dark Tour?',
  //     content:
  //       'Yes, you can ride the Vespa yourself if you have a valid license and meet safety requirements.',
  //   },
  //   {
  //     label:
  //       'What safety measures are in place if I want to drive the Vespa solo?',
  //     content:
  //       'We provide helmets, safety briefings, and a guide will accompany you at all times.',
  //   },
  // ];

  const followUpQuestionsCommon = [
    'Can I ride the Vespa myself on the Saigon After Dark Tour?',
    'What safety measures are in place if I want to drive the Vespa solo?',
  ];

  let allFollowUpQuestions: string[] = [];
  if (experience && experience.default_questions) {
    allFollowUpQuestions = followUpQuestionsCommon.concat(
      experience.default_questions,
    );
  } else {
    allFollowUpQuestions = [...followUpQuestionsCommon];
  }
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null,
  );

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

  // Follow-up question click handler (if needed)
  const handleFollowUpClick = (question: string) => {
    localStorage.setItem('chat-input', question);
    router.push(`/?experienceId=${experienceId}`);
  };

  return (
    <div className="w-full px-2 md:px-4 py-3 bg-gray-50 min-h-screen relative">
      {/* Floating T icon */}
      <div className="absolute left-1/2 -top-8 transform -translate-x-1/2 z-10">
        <div className="bg-gray-200 rounded-full w-12 h-12 flex items-center justify-center shadow-md border-2 border-white">
          <span className="text-xl font-bold text-gray-700">T</span>
        </div>
      </div>

      {/* Title and QR icon */}
      <div className="mb-2 mt-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-3">
          <h1 className="text-[32px] font-semibold text-gray-900 leading-tight">
            {experience.name}
          </h1>
          {/* Mobile: buttons below title, Desktop: inline */}
          <div className="flex gap-2 md:ml-2 md:items-center">
            <button
              className="p-1 rounded text-gray-700 hover:text-orange-500 transition focus:outline-none"
              onClick={() => setQrOpen(true)}
              title="Show QR code"
            >
              <IconQrcode className="w-8 h-8" />
            </button>
            <button
              className="p-1 rounded transition-colors hover:text-orange-500 focus:outline-none"
              onClick={handleCopy}
              title="Copy link to clipboard"
            >
              <IconCopy className="w-8 h-8 " />
            </button>
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
      <hr className="border-black mb-4" />
      {/* Short Description */}
      <p className="text-base md:text-lg leading-relaxed mb-6 text-black">
        {experience.thumbnail_description || experience.description}
      </p>
      {/* Image */}
      <div className="relative w-full aspect-[16/9] mb-6 rounded-lg overflow-hidden shadow-md">
        <img
          src={experience.primary_photo || ''}
          alt={experience.name || ''}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      {/* About Section */}
      <section className="mt-8">
        <div className={SECTION_TITLE_CLASS}>
          <IconInfoCircle className="w-6 h-6 text-[#8338EC]" stroke={2} />
          <span>About</span>
        </div>
        <div className={SECTION_CONTENT_CLASS}>
          {experience.description && (
            <div
              dangerouslySetInnerHTML={{
                __html: experience.description.replace(/\n/g, '<br />'),
              }}
            />
          )}
        </div>
      </section>
      {/* Activities You'll Experience */}
      <section className="mt-10">
        <div className={SECTION_TITLE_CLASS}>
          <img src="/assets/idea.svg" alt="Idea" className="w-6 h-6" />
          <span>{`Activities You'll Experience`}</span>
        </div>
        <div className="mt-4 relative w-full">
          <NewCarousel
            items={activities}
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
                  <div className="text-xs text-gray-800 line-clamp-2">
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
                title: selectedActivity.title,
                description: selectedActivity.description,
                description_thumbnail: selectedActivity.description_thumbnail,
                imageUrl: selectedActivity.primary_photo,
                location: selectedActivity.address || '',
                address: selectedActivity.address || '',
                hours: selectedActivity.hours || '',
              }}
              experience_name={experience.name}
            />
          )}
        </div>
      </section>
      {/* Iconic Photos */}
      <section className="mt-10">
        <div className={SECTION_TITLE_CLASS}>
          <IconFeatureCamera className="w-6 h-6 text-[#8338EC]" />
          <span>Iconic Photos</span>
        </div>
        <div className="mt-4 relative w-full">
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
      </section>
      {/* Iconic Photo Modal */}
      <IconicPhotoModal
        photos={iconicPhotos}
        selectedIndex={selectedPhotoIndex}
        onClose={() => setSelectedPhotoIndex(null)}
        onNavigate={(newIndex) => setSelectedPhotoIndex(newIndex)}
      />
      {/* Follow-up Questions */}
      <section className="mt-10">
        <div className={SECTION_TITLE_CLASS}>
          <img src="/assets/idea.svg" alt="Idea" className="w-6 h-6" />
          <span>Follow-up Questions</span>
        </div>
        <div className="flex flex-col divide-y divide-gray-200 bg-transparent">
          {allFollowUpQuestions.map((q, idx) => (
            <button
              key={idx}
              className="flex items-center justify-between py-4 px-0 text-[18px] text-gray-800 hover:text-orange-500 transition font-medium text-left bg-transparent"
              style={{ outline: 'none', border: 'none' }}
              onClick={() => handleFollowUpClick(q)}
            >
              <span>{q}</span>
              <IconChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </div>
      </section>
      {/* Chatbot (optional, can be moved to sticky bar if needed) */}
      <div className="mt-10">
        <BuddyAI context={{ experience_id: experienceId as string }} />
      </div>
    </div>
  );
};

export default ExperienceDetailPage;
