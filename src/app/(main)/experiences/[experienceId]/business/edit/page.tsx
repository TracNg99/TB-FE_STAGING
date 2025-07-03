'use client';

// clone from (main)/experiences/[experienceId]/page.tsx, will need to merge the two files
import { Avatar, Button, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconCheck,
  IconChevronsDown,
  IconClock,
  IconMapPin,
  IconX,
} from '@tabler/icons-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import FeatureCarousel from '@/components/feature-carousel';
import IconFeatureCamera from '@/components/icons/icon-feature-camera';
import IconFeatureLocation from '@/components/icons/icon-feature-location';
import IconInfo from '@/components/icons/icon-info';
import Section from '@/components/layouts/section';
import EditableActivityModal from '@/components/modals/editable-activity';
import SectionHeader from '@/components/section-header';
import {
  ExperienceDetailHeaderSkeleton,
  ExperienceDetailSkeleton,
} from '@/components/skeletons/ExpDetailsSkeleton';
import EditableDescription from '@/components/typography/editable-description';
import EditableTitleDesc from '@/components/typography/editable-title-description';
import { useAuth } from '@/contexts/auth-provider';
import { Activity } from '@/store/redux/slices/business/activity';
import {
  useUpdateExperienceDetailsMutation,
  useUpdateExperienceMutation,
} from '@/store/redux/slices/business/experience';
import { useGetActivitiesInExperiencePublicQuery } from '@/store/redux/slices/user/activity';
import {
  useCreateExperienceVisitsByUserIdMutation,
  useGetExperienceDetailsPublicQuery,
  useGetExperienceQuery,
  useGetExperienceVisitsByUserIdQuery,
  useGetIconicPhotosPublicQuery,
} from '@/store/redux/slices/user/experience';
import { useGetAllPublishedStoryQuery } from '@/store/redux/slices/user/story';
import {
  ExperienceDetailHeaderProps,
  ExperienceIconicPhotosProps,
  PhotosFromTravelersProps,
} from '@/types/experience';
import { ExperienceDetail, IconicPhoto } from '@/types/experience';
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
  status,
}: ExperienceDetailHeaderProps) => {
  const params = useParams<{ experienceId: string }>();
  const experienceId = params!.experienceId;

  const [buttonStat, setButtonStat] = useState<string>(status);
  useEffect(() => {
    setButtonStat(status);
  }, [status]);
  const handleStatusToggle = async () => {
    const newStatus = buttonStat === 'active' ? 'inactive' : 'active';
    try {
      await updateExperience({
        id: String(experienceId),
        data: { status: newStatus },
      });
      setButtonStat(newStatus); // Optimistic update
    } catch (error) {
      // Revert if API fails
      setButtonStat(buttonStat === 'active' ? 'active' : 'inactive');
      notifications.show({
        title: 'Error: upload visit failure',
        message: String(error) || '',
        color: 'red',
      });
    }
  };

  const [updateExperience, { isLoading: updateExperienceIsLoading }] =
    useUpdateExperienceMutation();

  return (
    <>
      <div className="relative w-full aspect-[4/3] lg:aspect-video max-h-[800px]">
        {imageUrl ? (
          <Image fill src={imageUrl} alt={name} className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-200" /> // Fallback UI
        )}
      </div>
      <Section className="flex flex-col lg:flex-row relative -mt-24 px-0 lg:px-4">
        <EditableTitleDesc
          title={name}
          description={thumbnail_description}
          editable={true}
          experienceId={experienceId}
        />

        <div className="mt-20 bg-orange-50 py-8 px-16 lg:flex-1/3 h-max rounded-bl-xl relative">
          <div className="absolute bg-orange-50 top-0 left-full w-lvw h-full" />
          <Button
            variant="filled"
            className={`h-12 lg:h-[72px] w-full ${
              buttonStat === 'active'
                ? 'bg-gray-400 hover:bg-gray-500 text-white' // Archived state
                : 'bg-green-500 hover:bg-green-600 text-white' // Activate state
            }`}
            onClick={handleStatusToggle}
          >
            {updateExperienceIsLoading
              ? 'Processing...'
              : buttonStat === 'active'
                ? 'Archive this experience'
                : 'Activate this experience'}
          </Button>
        </div>
      </Section>
    </>
  );
};

const EditableTornPaper = ({
  title,
  content,
  className,
  isEditing,
  onTitleChange,
  onConfirm,
  onClick,
}: IconicPhoto & {
  className?: string;
  isEditing: boolean;
  onTitleChange: (newTitle: string) => void;
  onConfirm: () => void;
  onClick: () => void;
}) => {
  return (
    <div
      className={cn('flex relative max-w-[320px]', className)}
      onClick={onClick}
    >
      <div className="w-8 paper-torn bg-white -mr-6" />
      <img
        className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 size-[68px] lg:size-[92px]"
        src="/assets/pin.png"
      />
      <div className="bg-white p-6 shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] flex flex-col gap-4 flex-1 rounded-r-xl">
        {isEditing ? (
          <>
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="text-md lg:text-lg font-semibold text-base-black border-b border-base-black/25 pb-4 bg-gray-100 p-2 rounded"
              autoFocus
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onConfirm();
              }}
              className="bg-blue-500 text-white py-1 px-3 rounded text-sm self-end"
            >
              CONFIRM
            </button>
          </>
        ) : (
          <h4 className="text-md lg:text-lg font-semibold text-base-black border-b border-base-black/25 pb-4 cursor-pointer">
            {title}
          </h4>
        )}
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

const EditableSlantedImage = ({
  imageUrl,
  caption,
  index,
  isEditing,
  onTitleChange,
  onCaptionChange,
  onConfirm,
  onClick,
  ...props
}: IconicPhoto & {
  index: number;
  isEditing: boolean;
  onTitleChange: (newTitle: string) => void;
  onCaptionChange: (newCaption: string) => void;
  onConfirm: () => void;
  onClick: () => void;
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
        onClick={onClick}
      >
        <div className="relative w-full aspect-video">
          <Image
            fill
            src={imageUrl}
            alt={caption}
            className="object-center object-cover"
          />
        </div>
        {isEditing ? (
          <>
            <input
              type="text"
              value={caption}
              onChange={(e) => onCaptionChange(e.target.value)}
              className="mt-2.5 block w-full text-left text-sm lg:text-md text-base-black bg-gray-100 p-2 rounded"
              autoFocus
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onConfirm();
              }}
              className="bg-blue-500 text-white py-1 px-3 rounded text-sm mt-2 self-end"
            >
              CONFIRM
            </button>
          </>
        ) : (
          <Text className="mt-2.5 block text-left text-sm lg:text-md text-base-black cursor-pointer">
            {caption}
          </Text>
        )}
      </div>
      <EditableTornPaper
        {...props}
        caption={caption}
        imageUrl={imageUrl}
        isEditing={isEditing}
        onTitleChange={(newTitle) => onTitleChange(newTitle)}
        onConfirm={onConfirm}
        onClick={onClick}
        className={cn('lg:absolute w-full', {
          'lg:bottom-1/2 lg:translate-y-1/2 lg:left-2/3': index % 2 === 0,
          'lg:bottom-1/2 lg:right-2/3': index % 2 === 1,
        })}
      />
    </div>
  );
};

const EditableExperienceIconicPhotos = ({
  iconicPhotos,
}: ExperienceIconicPhotosProps) => {
  const [showMore, setShowMore] = useState(false);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editedPhotos, setEditedPhotos] = useState<IconicPhoto[]>(iconicPhotos);
  const handleStartEditing = (photoId: string) => {
    setEditingPhotoId(photoId);
  };

  const handleTitleChange = (photoId: string, newTitle: string) => {
    setEditedPhotos((prev) =>
      prev.map((photo) =>
        photo.id === photoId ? { ...photo, title: newTitle } : photo,
      ),
    );
  };

  const handleCaptionChange = (photoId: string, newCaption: string) => {
    setEditedPhotos((prev) =>
      prev.map((photo) =>
        photo.id === photoId ? { ...photo, caption: newCaption } : photo,
      ),
    );
  };

  const [updateExperienceDetails] = useUpdateExperienceDetailsMutation();

  const handleConfirm = (photoId: string) => {
    // console.log("Updated photo:", editedPhotos.find(p => p.id === photoId));
    if (editedPhotos.find((p) => p.id === photoId)) {
      const newPhotoDetails = editedPhotos.find((p) => p.id === photoId);
      updateExperienceDetails({
        dd_id: newPhotoDetails!.id,
        data: {
          name: newPhotoDetails!.title,
          text: newPhotoDetails!.caption,
        },
      });
    }
    setEditingPhotoId(null);
  };

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
          {editedPhotos
            ?.slice(0, showMore ? editedPhotos.length : 1)
            .map((photo, index) => (
              <li key={photo.id}>
                <EditableSlantedImage
                  {...photo}
                  index={index}
                  isEditing={editingPhotoId === photo.id}
                  onTitleChange={(newTitle) =>
                    handleTitleChange(photo.id, newTitle)
                  }
                  onCaptionChange={(newCaption) =>
                    handleCaptionChange(photo.id, newCaption)
                  }
                  onConfirm={() => handleConfirm(photo.id)}
                  onClick={() => handleStartEditing(photo.id)}
                />
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
                {photo.by.firstName?.[0].toUpperCase()}
                {photo.by.lastName?.[0].toUpperCase()}
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
  const router = useRouter();
  const { user } = useAuth();
  const params = useParams<{ experienceId: string }>();
  const experienceId = params!.experienceId;
  const [checkIn, setCheckIn] = useState<boolean>(false);
  const [experience, setExperience] =
    useState<Partial<ExperienceDetail> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [activities, setActivities] = useState<
    {
      id: string;
      title: string;
      description: string;
      description_thumbnail: string;
      address: string;
      hours: string;
      primary_photo: string;
      location: string;
      status: string;
      experience_id: string;
    }[]
  >([]);

  const { data: experienceData } = useGetExperienceQuery({
    id: experienceId,
  });

  const { data: detailData } = useGetExperienceDetailsPublicQuery({
    id: experienceId,
  });

  const { data: iconicPhotosData } = useGetIconicPhotosPublicQuery({
    id: experienceId,
  });

  const { data: activitiesData, refetch: refetchActivities } =
    useGetActivitiesInExperiencePublicQuery(
      {
        experience_id: experienceId,
      },
      {
        refetchOnMountOrArgChange: true, // This ensures data is refetched when component mounts or experienceId changes
      },
    );

  useEffect(() => {
    // Refetch activities when component mounts
    const refetchData = async () => {
      try {
        await refetchActivities();
      } catch (error) {
        console.error('Error refetching activities:', error);
      }
    };

    refetchData();
  }, [experienceId, refetchActivities]);

  const { data: storiesData } = useGetAllPublishedStoryQuery();

  const { data: visitData } = useGetExperienceVisitsByUserIdQuery({
    id: experienceId,
  });

  const [recordVisit] = useCreateExperienceVisitsByUserIdMutation();

  useEffect(() => {
    if (visitData) {
      setCheckIn(true);
    }
  }, [visitData]);

  const handleActivityClick = (activity: Activity) => {
    setCurrentActivity(activity);
    setIsEditModalOpen(true);
  };

  const handleSaveActivity = async (updatedActivity: Activity) => {
    try {
      // Update your activities state
      setActivities((prevActivities) =>
        prevActivities.map((activity) =>
          activity.id === currentActivity?.id
            ? { ...activity, ...updatedActivity }
            : activity,
        ),
      );
      // Refetch activities to ensure we have the latest data from the server
      await refetchActivities().unwrap();

      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  };

  useEffect(() => {
    const fetchExperienceData = async () => {
      try {
        setIsLoading(true);

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
            iconicPhotos: iconicPhotosData.map((photo) => ({
              id: photo.id,
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
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperienceData();
  }, [experienceData, detailData, iconicPhotosData, storiesData, experienceId]);

  useEffect(() => {
    if (activitiesData) {
      setActivities(
        activitiesData.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          description_thumbnail: item.description_thumbnail,
          address: item.address,
          hours: item.hours,
          primary_photo: item.primary_photo,
          location: item.title,
          status: item.status,
          experience_id: item.experience_id,
        })),
      );
    }
  }, [activitiesData]);

  const handleCheckIn = async () => {
    if (user) {
      setCheckIn(true);
      const { error } = await recordVisit({ id: experienceId });

      if (error) {
        notifications.show({
          title: 'Error: upload visit failure',
          message: 'Failed to upload check-in status! Please try again!',
          color: 'red',
        });
        setCheckIn(false);
      } else {
        notifications.show({
          title: 'You are checked-in!',
          message:
            'Congrats! You have explored this experience. Would you like to tell a story about it?',
          color: 'red',
        });
        setCheckIn(false);
      }
    } else {
      notifications.show({
        title: 'Warning: Login-only feature',
        message:
          'Please login to check-in for this experience! Not a member? Join us!',
        color: 'yellow',
      });
    }
  };
  if (isLoading) {
    return <ExperienceDetailSkeleton />; // Create a skeleton component that matches your UI structure
  }

  return (
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
            <EditableDescription
              description={experience.description}
              editable={true}
              experienceId={experienceId}
              className="text-gray-700"
              onUpdate={async (newDescription) => {
                // Update the local state to reflect the change immediately
                setExperience((prev) =>
                  prev
                    ? {
                        ...prev,
                        description: newDescription,
                      }
                    : null,
                );
              }}
            />
          </div>
        </Section>
      )}
      <Section className="mt-20">
        <div className="flex items-start gap-10">
          <SectionHeader
            title="Activities You'll Visit"
            icon={
              <IconFeatureLocation className="size-8 lg:size-10 shrink-0" />
            }
            subtitle="Get ready for laughter, discovery, and unforgettable moments"
          />
          <button
            onClick={() => {
              router.replace(
                `/activities/business/create?experienceId=${experienceId}`,
              );
            }}
            className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded shadow hover:bg-gray-50 px-4 py-2"
            // Adjust the height as needed so it's slightly shorter than the SectionHeader
            style={{ height: '80%' }}
          >
            <span className="text-2xl font-bold">+</span>
            <span className="text-xs mt-1">Add an activity</span>
          </button>
        </div>
        {activities && activities.length > 0 ? (
          <FeatureCarousel
            items={[...activities]
              // Sort activities: active first, then inactive
              .sort((a, b) => {
                if (a.status === 'active' && b.status !== 'active') return -1;
                if (a.status !== 'active' && b.status === 'active') return 1;
                return 0;
              })}
            renderItem={(activity) => (
              <div
                className={`flex flex-col gap-4 lg:gap-8 ${
                  activity.status === 'inactive' ? 'opacity-60' : ''
                }`}
                onClick={() => handleActivityClick(activity)}
                style={{ cursor: 'pointer' }}
              >
                <div className="w-full aspect-square relative">
                  <Image
                    fill
                    src={activity.primary_photo}
                    alt={activity.title}
                    className={`rounded-2xl object-center object-cover ${
                      activity.status === 'inactive' ? 'grayscale-[20%]' : ''
                    }`}
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
        ) : (
          <div className="mt-10 lg:mt-12 text-center py-12 bg-gray-50 rounded-lg">
            <Text className="text-gray-500 text-lg">No activities found</Text>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                router.replace(
                  `/activities/business/create?experienceId=${experienceId}`,
                );
              }}
            >
              + Add Your First Activity
            </Button>
          </div>
        )}
      </Section>
      {experience ? (
        <EditableExperienceIconicPhotos
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
      {currentActivity && (
        <EditableActivityModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveActivity}
          activity={currentActivity}
          experience_name={experienceData?.name || 'Experience'}
        />
      )}
    </div>
  );
};

export default ExperienceDetailPage;
