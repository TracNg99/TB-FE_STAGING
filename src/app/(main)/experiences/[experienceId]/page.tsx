'use client';

import { Avatar, Button, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconCheck,
  IconChevronsDown,
  IconCircle,
  IconClock,
  IconMapPin,
  IconQrcode,
  IconX,
} from '@tabler/icons-react';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import BuddyAI from '@/components/chatbot/buddy-ui-ai';
import FeatureCarousel from '@/components/feature-carousel';
import IconFeatureCamera from '@/components/icons/icon-feature-camera';
import IconFeatureLocation from '@/components/icons/icon-feature-location';
import IconInfo from '@/components/icons/icon-info';
import Section from '@/components/layouts/section';
import WelcomeModal from '@/components/modals/WelcomeModal';
import ActivityModal from '@/components/modals/activity';
import { LoginModal } from '@/components/modals/login';
import QRModal from '@/components/qr-code/qr-modal';
import SectionHeader from '@/components/section-header';
import {
  ExperienceDetailHeaderSkeleton,
  ExperienceDetailSkeleton,
} from '@/components/skeletons/ExpDetailsSkeleton';
import { useAuth } from '@/contexts/auth-provider';
import { useGetActivitiesInExperiencePublicQuery } from '@/store/redux/slices/user/activity';
import {
  useCreateExperienceVisitsByUserIdMutation,
  useGetExperienceDetailsPublicQuery,
  useGetExperiencePublicQuery,
  useGetExperienceVisitsByUserIdQuery,
  useGetIconicPhotosPublicQuery,
} from '@/store/redux/slices/user/experience';
import { useGetAllPublishedStoryQuery } from '@/store/redux/slices/user/story';
import {
  ExperienceDetail,
  ExperienceDetailHeaderProps,
  ExperienceIconicPhotosProps,
  IconicPhoto,
  PhotosFromTravelersProps,
} from '@/types/experience';
import { cn } from '@/utils/class';

const notesIconsPairs = {
  dos: IconCheck,
  "don'ts": IconX,
  best_time: IconClock,
};

const ExperienceDetailHeader = ({
  imageUrl,
  name,
  thumbnail_description,
  checked,
  onCheckIn,
}: ExperienceDetailHeaderProps) => {
  const [modalOpened, setModalOpened] = useState(false);
  const params = useParams<{ experienceId: string }>();
  const experienceId = params!.experienceId;

  const { search } = window.location;
  const isFromQRScan = new URLSearchParams(search).get('fromQR') === 'true';

  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(isFromQRScan);

  const handleContinue = () => {
    setIsWelcomeModalOpen(false);
  };

  return (
    <>
      <div className="relative w-full aspect-[4/3] lg:aspect-video max-h-[800px]">
        <Image
          fill
          src={imageUrl}
          alt={name}
          className="object-center object-cover"
        />
      </div>
      <Section className="flex flex-col lg:flex-row relative -mt-24 px-0 lg:px-4">
        {/* Welcome Modal */}
        <WelcomeModal isOpen={isWelcomeModalOpen} onContinue={handleContinue} />
        <div className="px-4 py-8 lg:py-14 lg:px-0 bg-white rounded-tr-xl lg:flex-2/3 relative">
          <div className="absolute bg-white top-0 right-full w-lvw h-full" />
          <div className="flex items-center gap-4">
            <h2 className="text-base-black text-display-sm lg:text-display-lg font-semibold">
              {name}
            </h2>
            <button
              onClick={() => setModalOpened(true)}
              className="group relative p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              aria-label="Show QR code"
            >
              <IconQrcode
                className="text-display-sm lg:text-display-lg text-base-black"
                style={{ fontSize: '1em' }}
              />
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Show QR Code
              </span>
            </button>
          </div>
          <p className="border-l-[12px] border-orange-500 pl-8 mt-10 text-md lg:text-display-xs text-base-black/90">
            {thumbnail_description}
          </p>
        </div>
        <QRModal
          open={modalOpened}
          onClose={() => setModalOpened(false)}
          contentId={experienceId}
          displayText={name}
        />
        <div className="mt-20 bg-orange-50 py-8 px-16 lg:flex-1/3 h-max rounded-bl-xl relative">
          <div className="absolute bg-orange-50 top-0 left-full w-lvw h-full" />
          <Button
            variant="outline"
            className={`bg-white border-base-black/50 h-12 lg:h-[72px] w-full ${checked ? 'text-orange-600' : 'text-base-black/75'}`}
            leftSection={
              <div className="relative">
                <IconCircle color="#444444" />
                {checked && (
                  <IconCheck
                    color="#fb5607"
                    className="absolute top-2/5 left-1/2 -translate-x-1/2 -translate-y-1/2" // Centering with translate
                    style={{ zIndex: 1 }}
                    size={30}
                  />
                )}
              </div>
            }
            onClick={onCheckIn}
            // disabled={checked}
            // style={{fontPalette: checked? "#fb5607" : "#333333"}}
          >
            I did it
          </Button>
        </div>
      </Section>
    </>
  );
};

const TornPaper = ({
  title,
  content,
  className,
}: IconicPhoto & {
  className?: string;
}) => {
  return (
    <div className={cn('flex relative max-w-[320px]', className)}>
      <div className="w-8 paper-torn bg-white -mr-6" />
      <img
        className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 size-[68px] lg:size-[92px]"
        src="/assets/pin.png"
      />
      <div className="bg-white p-6 shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] flex flex-col gap-4 flex-1 rounded-r-xl">
        <h4 className="text-md lg:text-lg font-semibold text-base-black border-b border-base-black/25 pb-4">
          {title}
        </h4>
        {content.map(({ icon: Icon, text }, index) => (
          <div className="flex gap-2" key={index}>
            <Icon className="size-6" />
            <p className="text-sm lg:text-md text-base-black">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const SlantedImage = ({
  imageUrl,
  caption,
  index,
  ...props
}: IconicPhoto & {
  index: number;
}) => {
  return (
    <div
      className={cn(
        'relative w-full flex max-w-[1200px] mx-auto flex-col gap-6',
        index % 2 ? 'lg:flex-row-reverse' : 'lg:flex-row',
      )}
    >
      <div
        className={cn(
          'p-2 lg:p-4 bg-white shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] relative',
          {
            'lg:w-[80%] -rotate-3': index % 3 === 0,
            'lg:w-[60%] rotate-3': index % 3 === 1,
            'lg:w-[70%] rotate-2': index % 3 === 2,
          },
        )}
      >
        <div className="relative w-full aspect-video">
          <Image
            fill
            src={imageUrl}
            alt={caption}
            className="object-center object-cover"
          />
        </div>
        <Text className="mt-2.5 block text-left text-sm lg:text-md text-base-black">
          {caption}
        </Text>
      </div>
      <TornPaper
        {...props}
        caption={caption}
        imageUrl={imageUrl}
        className={cn('lg:absolute w-full', {
          'lg:bottom-1/2 lg:translate-y-1/2 lg:left-2/3': index % 2 === 0,
          'lg:bottom-1/2 lg:right-2/3': index % 2 === 1,
        })}
      />
    </div>
  );
};

const ExperienceIconicPhotos = ({
  iconicPhotos,
}: ExperienceIconicPhotosProps) => {
  const [showMore, setShowMore] = useState(false);

  return (
    <Section className="mt-20">
      <SectionHeader
        className="items-center"
        title="Iconic Photos"
        subtitle="How to Snap the Best Photos"
        icon={<IconFeatureCamera className="size-8 lg:size-10 shrink-0" />}
      />
      <div className="mt-10 lg:mt-12 border-t-4 border-orange-500 bg-orange-50 min-h-[700px] [background-size:_32px_32px] [background-image:linear-gradient(to_right,_var(--color-orange-100)_1px,_transparent_1px),linear-gradient(to_bottom,_var(--color-orange-100)_1px,_transparent_1px)] rounded-b-xl relative pt-10 px-4 pb-24">
        <ul className="grid gap-24 lg:gap-40">
          {iconicPhotos
            .slice(0, showMore ? iconicPhotos.length : 1)
            .map((photo, index) => (
              <li key={photo.id}>
                <SlantedImage {...photo} index={index} />
              </li>
            ))}
        </ul>
        <button
          className="absolute bottom-4 flex gap-2 items-center left-1/2 -translate-x-1/2 cursor-pointer"
          onClick={() => setShowMore((prev) => !prev)}
        >
          <IconChevronsDown
            className={cn('size-6 lg:size-8', showMore && 'rotate-180')}
          />
          <span className="text-base-black/90 font-semibold text-md lg:text-lg underline">
            Show {showMore ? 'Less' : 'More'}
          </span>
        </button>
      </div>
    </Section>
  );
};

const PhotosFromTravelers = ({ userPhotos }: PhotosFromTravelersProps) => {
  const isLg = useMediaQuery('(min-width: 1024px)');

  if (isLg) {
    return (
      <Section className="mt-20">
        <SectionHeader
          className="items-center"
          title="Photos from Travelers"
          icon={<IconFeatureCamera className="size-8 lg:size-10 shrink-0" />}
          // subtitle= "We are waiting for your beautiful stories"
        />
        <div className="mt-10 lg:mt-12 grid grid-cols-3 gap-4">
          {userPhotos.length < 1 ? (
            <div className="col-span-3 flex justify-center">
              <Text className="text-base-black/90 font-semibold text-center text-md lg:text-lg">
                We are waiting for your beautiful stories
              </Text>
            </div>
          ) : (
            userPhotos.map((photo, index) => (
              <div
                className={cn(
                  'w-full aspect-[20/9] relative h-full',
                  index % 4 === 0 || index % 4 === 3
                    ? 'col-span-2'
                    : 'col-span-1',
                )}
                key={photo.id}
              >
                <Image
                  fill
                  src={photo.imageUrl}
                  alt={photo.id}
                  className="rounded-2xl object-center object-cover"
                />
                <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-white/90 rounded-lg p-2 pr-4 text-base-black font-medium text-sm lg:text-base leading-none">
                  <Avatar
                    src={photo.by.avatarUrl}
                    alt={`${photo.by.firstName} ${photo.by.lastName}`}
                    className="size-10"
                  >
                    {photo.by.firstName?.[0].toUpperCase()}
                    {photo.by.lastName?.[0].toUpperCase()}
                  </Avatar>
                  <div>
                    <p className="text-base-black text-md font-semibold">
                      {photo.by.firstName} {photo.by.lastName?.[0]}.
                    </p>
                    <p className="text-base-black/75 text-sm">
                      {photo.by.rank}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Section>
    );
  }

  return (
    <Section className="mt-20">
      <SectionHeader
        title="Photos from Travelers"
        icon={<IconFeatureCamera className="size-8 lg:size-10 shrink-0" />}
      />
      <FeatureCarousel
        items={userPhotos}
        renderItem={(photo) => (
          <div className="w-full aspect-[4/3] relative">
            <Image
              fill
              src={photo.imageUrl}
              alt={photo.id}
              className="rounded-2xl object-center object-cover"
            />
            <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-white/90 rounded-lg p-2 pr-4 text-base-black font-medium text-sm lg:text-base leading-none">
              <Avatar
                src={photo.by.avatarUrl}
                alt={`${photo.by.firstName} ${photo.by.lastName}`}
                className="size-10"
              >
                {photo.by?.firstName?.[0].toUpperCase()}
                {photo.by?.lastName?.[0].toUpperCase()}
              </Avatar>
              <div>
                <p className="text-base-black text-md font-semibold">
                  {photo.by.firstName} {photo.by.lastName?.[0]}.
                </p>
                <p className="text-base-black/75 text-sm">{photo.by.rank}</p>
              </div>
            </div>
          </div>
        )}
        className="mt-10 lg:mt-12"
        classNames={{
          controls: 'hidden lg:flex',
        }}
        slideSize={{
          base: 100,
          sm: 50,
          md: 33.33,
        }}
        slideGap={32}
        paginationType="count"
      />
    </Section>
  );
};

const ExperienceDetailPage = () => {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user } = useAuth();
  const params = useParams<{ experienceId: string }>();
  const experienceId = params!.experienceId;
  const query = useSearchParams();
  const reporterId = query.get('reporterId');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (reporterId) {
        localStorage.setItem('reporterId', reporterId as string);
        localStorage.setItem('matchExperienceId', experienceId);
      }
    }
  }, []);

  const [checkIn, setCheckIn] = useState<boolean>(false);
  const [experience, setExperience] =
    useState<Partial<ExperienceDetail> | null>(null);
  const [activites, setActivities] = useState<
    {
      id: string;
      title: string;
      description: string;
      description_thumbnail: string;
      imageUrl: string;
      location: string;
      status: string;
      address: string;
      hours: string;
    }[]
  >([]);

  const { data: experienceData, isFetching: isFetchingExp } =
    useGetExperiencePublicQuery({
      id: experienceId,
    });

  const { data: detailData } = useGetExperienceDetailsPublicQuery({
    id: experienceId,
  });

  const { data: iconicPhotosData } = useGetIconicPhotosPublicQuery({
    id: experienceId,
  });

  const { data: activitiesData } = useGetActivitiesInExperiencePublicQuery({
    experience_id: experienceId,
  });

  const { data: storiesData } = useGetAllPublishedStoryQuery();

  const { data: visitData, refetch: refetchVisitData } =
    useGetExperienceVisitsByUserIdQuery(
      {
        id: experienceId,
      },
      { skip: !user },
    );

  const [recordVisit] = useCreateExperienceVisitsByUserIdMutation();

  useEffect(() => {
    if (visitData && visitData?.is_visited) {
      setCheckIn(true);
    } else {
      setCheckIn(false);
    }
  }, [visitData]);

  useEffect(() => {
    if (experienceData && detailData && iconicPhotosData && storiesData) {
      const matchedStories = storiesData.data?.filter(
        (story) => story.experience_id === experienceId,
      );
      const rankPH = ['Travel', 'Explorer'];
      setExperience({
        id: '1',
        name: experienceData.name,
        status: experienceData.status || 'inactive',
        description: experienceData.description || '',
        thumbnail_description: experienceData.thumbnail_description || '',
        location: experienceData.name,
        imageUrl: experienceData.primary_photo,

        iconicPhotos: iconicPhotosData.map((photo, index) => ({
          id: `${index}`,
          title: photo.name,
          content:
            photo.tips?.map((item, index) => ({
              icon: (notesIconsPairs as any)[item.type],
              text: item.text || `Content ${index + 1}`,
            })) || [],
          imageUrl: photo.url,
          caption: photo.text,
        })),
        userPhotos:
          matchedStories?.map((story, index) => ({
            id: `${index}`,
            imageUrl: story.media_assets?.[0]?.url || '',
            by: {
              email: 'testmail@email.com',
              id: `${index}`,
              firstName: story?.userprofiles?.firstname || 'John',
              lastName: story?.userprofiles?.lastname || 'Doe',
              avatarUrl: story?.userprofiles?.media_assets.url || '',
              rank: rankPH[Math.floor(Math.random() * rankPH.length)],
            },
          })) ?? [],
      });
    }
  }, [experienceData, detailData, iconicPhotosData, storiesData, experienceId]);

  useEffect(() => {
    if (activitiesData) {
      setActivities(
        activitiesData.map((item, index) => ({
          id: index.toString(),
          title: item.title,
          description: item.description,
          description_thumbnail: item.description_thumbnail,
          imageUrl: item.primary_photo,
          location: item.title,
          status: item.status,
          address: item.address,
          hours: item.hours,
        })),
      );
    }
  }, [activitiesData]);

  const handleCheckIn = async () => {
    if (user) {
      if (checkIn) {
        setCheckIn(false);
      } else {
        setCheckIn(true);
      }
      const { error } = await recordVisit({ id: experienceId });

      if (error) {
        notifications.show({
          title: 'Error: upload visit failure',
          message: 'Failed to upload check-in status! Please try again!',
          color: 'red',
        });
        if (checkIn) {
          setCheckIn(false);
        } else {
          setCheckIn(true);
        }
      } else if (!checkIn) {
        notifications.show({
          title: 'You are checked-in!',
          message:
            'Congrats! You have explored this experience. Would you like to tell a story about it?',
          color: 'red',
        });
      } else {
        notifications.show({
          title: 'You are no longer checked-in!',
          message: 'You have unchecked the visit button',
          color: 'red',
        });
      }
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = async () => {
    const result = await refetchVisitData();
    const visitDataNew = result.data?.is_visited;
    if (visitDataNew) {
      notifications.show({
        title: 'You already checked in before',
        message: 'You have already checked in this experience',
        color: 'red',
      });
      setShowLoginModal(false);
      setCheckIn(true);
    } else {
      const { error } = await recordVisit({ id: experienceId });
      if (error) {
        notifications.show({
          title: 'Error: upload visit failure',
          message: 'Failed to upload check-in status! Please try again!',
          color: 'red',
        });
      } else {
        notifications.show({
          title: 'You are checked-in!',
          message:
            'Congrats! You have explored this experience. Would you like to tell a story about it?',
          color: 'red',
        });
        setCheckIn(true);
      }
      setShowLoginModal(false);
    }
  };

  const handleActivityClick = (activity: any) => {
    setSelectedActivity(activity);
  };

  const handleCloseModal = () => {
    setSelectedActivity(null);
  };

  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);

  // Check if description is long enough to be clamped
  useEffect(() => {
    if (descriptionRef.current) {
      const isTextClamped =
        descriptionRef.current.scrollHeight >
        descriptionRef.current.clientHeight;
      setIsClamped(isTextClamped);
    }
  }, [experience?.description]);

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const descriptionClasses = `text-gray-600 leading-tight text-base lg:text-lg ${
    !showFullDescription ? 'line-clamp-10' : ''
  }`;

  return (
    <div>
      {isFetchingExp ? (
        <ExperienceDetailSkeleton />
      ) : (
        <div className="overflow-x-hidden">
          {experience ? (
            <ExperienceDetailHeader
              id={experience.id || ''}
              name={experience.name || ''}
              status={experience.status || ''}
              description={experience.description || ''}
              thumbnail_description={experience.thumbnail_description || ''}
              location={experience.location || ''}
              imageUrl={experience.imageUrl || ''}
              checked={checkIn}
              onCheckIn={handleCheckIn}
            />
          ) : (
            <ExperienceDetailHeaderSkeleton />
          )}
          {experience && experience.description && (
            <Section className="mt-16">
              <SectionHeader
                title="About"
                icon={<IconInfo className="size-8 lg:size-10 shrink-0" />}
                subtitle="Discover what makes this experience special"
              />
              <div className="mt-8">
                <div
                  ref={descriptionRef}
                  className={descriptionClasses}
                  dangerouslySetInnerHTML={{
                    __html: experience.description.replace(/\n/g, '<br />'),
                  }}
                />
                {isClamped && (
                  <button
                    onClick={toggleDescription}
                    className="text-orange-600 hover:text-orange-700 font-medium text-sm mt-2 focus:outline-none"
                  >
                    {showFullDescription ? 'See less' : 'See more'}
                  </button>
                )}
              </div>
            </Section>
          )}
          <Section className="mt-20">
            <SectionHeader
              title="Activities You'll Visit"
              icon={
                <IconFeatureLocation className="size-8 lg:size-10 shrink-0" />
              }
              subtitle="Get ready for laughter, discovery, and unforgettable moments"
            />
            <FeatureCarousel
              items={activites}
              renderItem={(activity) => (
                <div
                  className="flex flex-col gap-4 lg:gap-8 cursor-pointer"
                  onClick={() => handleActivityClick(activity)}
                >
                  <div className="w-full aspect-square relative">
                    <Image
                      fill
                      src={activity.imageUrl}
                      alt={activity.title}
                      className="rounded-2xl object-center object-cover"
                    />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-white/90 rounded-lg p-2 pr-4 text-base-black font-medium text-sm lg:text-base leading-none">
                      <IconMapPin className="size-6" />
                      {activity.location}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 lg:gap-4">
                    <h3 className="text-display-xs lg:text-display-sm font-semibold text-base-black">
                      {activity.title}
                    </h3>
                    <p className="text-sm lg:text-md text-base-black/90">
                      {activity.description_thumbnail}
                    </p>
                  </div>
                </div>
              )}
              className="mt-10 lg:mt-12"
              classNames={{
                controls: 'hidden lg:flex',
              }}
              slideSize={{
                base: 100,
                sm: 50,
                md: 33.33,
              }}
              slideGap={32}
              paginationType="count"
            />
          </Section>
          {selectedActivity && experience && (
            <ActivityModal
              isOpen={!!selectedActivity}
              onClose={handleCloseModal}
              activity={selectedActivity}
              experience_name={experience?.name || ''}
            />
          )}
          {experience ? (
            <ExperienceIconicPhotos
              iconicPhotos={experience?.iconicPhotos || []}
            />
          ) : (
            <div></div>
          )}
          {experience ? (
            <PhotosFromTravelers userPhotos={experience?.userPhotos || []} />
          ) : (
            <div></div>
          )}
          <LoginModal
            redirectUrl={`${experienceId}`}
            opened={showLoginModal}
            onClose={() => setShowLoginModal(false)}
            onSuccess={handleLoginSuccess}
          />
          <BuddyAI context={{ experience_id: experienceId }} />
        </div>
      )}
    </div>
  );
};

export default ExperienceDetailPage;
