'use client';

import { notifications } from '@mantine/notifications';
import {
  IconChevronRight,
  IconCopy,
  IconInfoCircle,
  IconQrcode,
} from '@tabler/icons-react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import BuddyAI from '@/components/chatbot/buddy-ui-ai';
import FeatureCarousel from '@/components/feature-carousel';
import IconFeatureCamera from '@/components/icons/icon-feature-camera';
import QRModal from '@/components/qr-code/qr-modal';
import { useGetActivitiesInExperiencePublicQuery } from '@/store/redux/slices/user/activity';
import { useGetExperiencePublicQuery } from '@/store/redux/slices/user/experience';

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

  // Dummy follow-up questions (replace with real data/component if available)
  const followUpQuestions = [
    {
      label: 'Can I ride the Vespa myself on the Saigon After Dark Tour?',
      content:
        'Yes, you can ride the Vespa yourself if you have a valid license and meet safety requirements.',
    },
    {
      label:
        'What safety measures are in place if I want to drive the Vespa solo?',
      content:
        'We provide helmets, safety briefings, and a guide will accompany you at all times.',
    },
  ];

  if (isLoading || isLoadingActivities)
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

  const handleFollowUpClick = (question: string) => {
    localStorage.setItem('chat-input', question);
    router.push(`/?experienceId=${experienceId}`);
  };

  return (
    <div className="w-full px-4 py-3 bg-gray-50 min-h-screen relative">
      {/* Floating T icon */}
      <div className="absolute left-1/2 -top-8 transform -translate-x-1/2 z-10">
        <div className="bg-gray-200 rounded-full w-12 h-12 flex items-center justify-center shadow-md border-2 border-white">
          <span className="text-xl font-bold text-gray-700">T</span>
        </div>
      </div>

      {/* Title and QR icon */}
      <div className="flex justify-between items-center gap-3 mb-2 mt-4">
        <h1 className="text-[32px] font-semibold text-gray-900 leading-tight">
          {experience.name}
        </h1>
        <div className="flex items-center gap-2">
          <button
            className="ml-2 p-1 rounded text-gray-700 hover:text-orange-500 transition focus:outline-none"
            onClick={() => setQrOpen(true)}
            title="Show QR code"
          >
            <IconQrcode className="w-8 h-8" />
          </button>
          <button
            className="ml-1 p-1 rounded transition-colors hover:text-orange-500 focus:outline-none"
            onClick={handleCopy}
            title="Copy link to clipboard"
          >
            <IconCopy className="w-8 h-8 " />
          </button>
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
      <p className="text-base md:text-lg leading-relaxed mb-6 text-gray-600">
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
          <IconFeatureCamera className="w-6 h-6 text-[#F59E42]" />
          <span>Activities You&apos;ll Experience</span>
        </div>
        <div className="mt-4 relative w-full">
          <FeatureCarousel
            items={activities}
            renderItem={(activity) => (
              <div className="min-w-[240px] max-w-[260px] h-80 border border-gray-200 rounded-xl bg-white overflow-hidden flex-shrink-0 flex flex-col justify-between p-0">
                <img
                  src={activity.primary_photo || ''}
                  alt={activity.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div className="font-bold text-gray-800 text-base mb-1">
                    {activity.title}
                  </div>
                  <div className="text-xs text-gray-400 line-clamp-2">
                    {activity.description_thumbnail}
                  </div>
                </div>
              </div>
            )}
            className=""
            slideSize={{ base: 100, sm: 50, md: 33.33 }}
            slideGap={2}
            paginationType="none"
          />
        </div>
      </section>
      {/* Follow-up Questions */}
      <section className="mt-10">
        <div className={SECTION_TITLE_CLASS}>
          <img src="/assets/idea.svg" alt="Idea" className="w-6 h-6" />
          <span>Follow-up Questions</span>
        </div>
        <div className="flex flex-col divide-y divide-gray-200 bg-transparent">
          {followUpQuestions.map((q, idx) => (
            <button
              key={idx}
              className="flex items-center justify-between py-4 px-0 text-[18px] text-gray-800 hover:text-orange-500 transition font-medium text-left bg-transparent"
              style={{ outline: 'none', border: 'none' }}
              onClick={() => handleFollowUpClick(q.label)}
            >
              <span>{q.label}</span>
              <IconChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </div>
      </section>
      {/* Chatbot (optional, can be moved to sticky bar if needed) */}
      <div className="mt-10">
        <BuddyAI context={{ experience_id: experienceId as string }} />
      </div>
      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg flex items-center justify-center gap-4 py-3 z-50 md:static md:shadow-none md:border-0 md:py-0 mt-10">
        <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-full shadow transition-all">
          <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
            <path
              d="M2 10a8 8 0 1116 0A8 8 0 012 10zm8-4a1 1 0 100 2 1 1 0 000-2zm1 7H9v-1h1V9H9V8h2v4z"
              fill="#fff"
            />
          </svg>
          Ask to edit
        </button>
        {/* Add more action icons/buttons as needed */}
      </div>
    </div>
  );
};

export default ExperienceDetailPage;
