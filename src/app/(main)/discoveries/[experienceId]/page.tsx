'use client';

import { useParams } from 'next/navigation';

import BuddyAI from '@/components/chatbot/buddy-ui-ai';
import IconInfo from '@/components/icons/icon-info';
import Section from '@/components/layouts/section';
import SectionHeader from '@/components/section-header';
import ShareButton from '@/components/sharing/share-button';
import { useGetExperiencePublicQuery } from '@/store/redux/slices/user/experience';

const ExperienceDetailPage = () => {
  const { experienceId } = useParams();
  const {
    data: experience,
    isLoading,
    error,
  } = useGetExperiencePublicQuery({ id: experienceId as string });

  if (isLoading)
    return <div className="flex justify-center py-20">Loading...</div>;
  if (error || !experience)
    return (
      <div className="text-red-500 text-center py-20">
        Experience not found.
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Title */}
      <h1 className="text-3xl font-bold mb-6" style={{ color: '#333333' }}>
        {experience.name}
      </h1>

      {/* Divider */}
      <hr className="border-gray-200 mb-6" />

      {/* Share Button */}
      <div className="flex justify-start mb-6">
        <ShareButton
          className="bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
          shareContents={{
            title: experience.name || '',
            text:
              experience.thumbnail_description || experience.description || '',
            files: [],
          }}
        />
      </div>

      {/* Short Description */}
      <p
        className="text-base leading-relaxed mb-8"
        style={{ color: '#8D8D8D' }}
      >
        {experience.thumbnail_description || experience.description}
      </p>

      {/* Image */}
      <div className="relative w-full aspect-[16/9] mb-8 rounded-xl overflow-hidden">
        <img
          src={experience.primary_photo || ''}
          alt={experience.name || ''}
          className="w-full h-full object-cover"
        />
      </div>

      {/* About Section */}
      {experience.description && (
        <Section className="mt-8">
          <SectionHeader
            title="About"
            icon={<IconInfo className="size-4 lg:size-10 shrink-0" />}
            subtitle=""
          />
          <div className="mt-6">
            <div
              className="text-base leading-relaxed"
              style={{ color: '#8D8D8D' }}
              dangerouslySetInnerHTML={{
                __html: experience.description.replace(/\n/g, '<br />'),
              }}
            />
          </div>
        </Section>
      )}
      {/* Chatbot */}

      <BuddyAI context={{ experience_id: experienceId as string }} />
    </div>
  );
};

export default ExperienceDetailPage;
