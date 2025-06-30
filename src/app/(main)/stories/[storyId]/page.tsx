'use client';

import { Avatar, Button, Divider, Skeleton, Textarea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconClipboard, IconMapPin, IconUpload } from '@tabler/icons-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import FeatureCarousel from '@/components/feature-carousel';
import Section from '@/components/layouts/section';
// import ShareButton from '@/components/sharing/share-button';
import {
  useGetStoryQuery,
  useUpdateStoryMutation,
} from '@/store/redux/slices/user/story';
import { Story } from '@/types/story';

const storyRes = {
  id: '1',
  title: 'My Story',
  by: {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'a@a.example.com',
    avatarUrl: '',
    rank: 'Saigon Foodie Experience',
  },
  createdAt: '2021-01-01T00:00:00.000Z',
  location: 'Ho Chi Minh City, Vietnam',
  photos: Array.from({ length: 3 }).map(
    (_, index) => `https://picsum.photos/1600/90${index}`,
  ),
  story:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec purus ut nunc ultricies aliquam. Nullam nec purus ut nunc ultricies aliquam. Nullam nec purus ut nunc ultricies aliquam.',
} satisfies Story;

const StoryMetadataLoading = () => (
  <div className="mt-8 flex flex-col md:flex-row gap-10 justify-between">
    {/* Left: Avatar and user info */}
    <div className="flex items-center gap-2 text-base-black font-medium text-sm lg:text-base leading-none">
      <Skeleton height={40} width={40} circle className="size-10" />
      <div>
        <Skeleton height={20} width={120} radius="sm" className="mb-2" />
        <Skeleton height={16} width={80} radius="sm" />
      </div>
    </div>
    {/* Right: Location and date */}
    <div className="flex gap-[18px] text-md lg:text-lg text-base-black/90 items-center h-max">
      <div className="flex items-center gap-1">
        <Skeleton height={24} width={24} circle />
        <Skeleton height={18} width={70} radius="sm" />
      </div>
      <Divider orientation="vertical" />
      <Skeleton height={18} width={120} radius="sm" />
    </div>
  </div>
);

const GalleryLoading = () => (
  <div className="mt-12 overflow-hidden">
    <Skeleton height={400} width="100%" />
  </div>
);

const StoryDetailPage = () => {
  const pathParams = useParams();
  const storyId = pathParams?.['storyId'];
  const [storyObj, setStoryObj] = useState<Story>(storyRes);
  const [updateStory] = useUpdateStoryMutation();
  const { data: storyData, isFetching } = useGetStoryQuery(
    {
      storyId: storyId as string,
    },
    {
      skip: !storyId,
    },
  );
  const { by, location } = storyRes;
  const mediaBlob = useRef<File[]>([]);

  useEffect(() => {
    if (storyData && storyData.data) {
      const userProfile = storyData.data.userprofiles!;
      setStoryObj({
        id: storyData.data.id!,
        title: storyData.data.seo_title_tag ?? 'No SEO title available',
        by: {
          id: '1',
          firstName: userProfile?.firstname || by.firstName,
          lastName: userProfile?.lastname || by.lastName,
          email: userProfile?.email || by.email,
          avatarUrl: userProfile?.media_assets?.url || by.avatarUrl,
          rank: storyData?.data.experiences?.name || '',
        },
        createdAt: storyData.data.created_at ?? '',
        location: 'Ho Chi Minh City, Vietnam',
        photos: storyData.data.media_assets?.map((item) => item.url) || [''],
        story: `
          ${storyData.data.story_content}\n

          ${storyData.data.hashtags?.join(' ')}
        `,
      });
    }
  }, [storyData]);

  const convertUrlToBlob = async () => {
    if (!storyData?.data?.media_assets) return;
    const urls = storyData?.data?.media_assets?.map((item) => item.url);
    mediaBlob.current = await Promise.all(
      urls.map(async (url, index) => {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const blob = new File([arrayBuffer], `image${index}.jpeg`, {
          type: 'image/jpeg',
        });
        return blob;
      }),
    );
  };

  useEffect(() => {
    convertUrlToBlob();
  }, [storyData]);

  const handlePusblish = async () => {
    const result = await updateStory({
      storyId: storyId as string,
      payload: { status: 'PUBLISHED' },
    });

    if (result.error) {
      notifications.show({
        title: 'Error: Story update failure',
        message: 'Fail to update status of the story! Please try again!',
        color: 'red',
      });
    } else {
      notifications.show({
        title: 'Success: Publishing completed',
        message: 'Your story is now published!',
        color: 'green',
      });
    }
  };

  const handleSave = async () => {
    const result = await updateStory({
      storyId: storyId as string,
      payload: {
        seo_title_tag: storyObj.title,
        story_content: storyObj.story,
      },
    });

    if (result.error) {
      notifications.show({
        title: 'Error: Story update failure',
        message: 'Fail to update your story! Please try again!',
        color: 'red',
      });
    } else {
      notifications.show({
        title: 'Success: Update completed',
        message: 'Your latest updates are saved!',
        color: 'green',
      });
    }
  };

  return (
    <Section className="pt-20 sm:max-w-5xl">
      {/* <ShareButton
        className={`
          flex justify-self-end justify-center mb-5 
          bg-orange-400 hover:bg-orange-500 
          rounded-full shadow-lg gap-2
          transition text-white w-[40px] h-[40px]`}
        shareContents={{
          title: storyObj.title,
          text: storyObj.story,
          files: mediaBlob.current,
        }}
      /> */}
      {
        <Textarea
          className=""
          classNames={{
            input:
              'text-display-md font-bold text-base-black lg:text-display-lg p-4 pb-12 lg:p-6 lg:pb-[72px]',
          }}
          // defaultValue={title}
          value={isFetching ? '' : storyObj.title}
          onChange={(e) => setStoryObj({ ...storyObj, title: e.target.value })}
          disabled={isFetching}
        />
      }
      <div className="mt-8 flex flex-col md:flex-row gap-10 justify-between">
        {isFetching ? (
          <StoryMetadataLoading />
        ) : (
          <>
            <div className="flex items-center gap-2 text-base-black font-medium text-sm lg:text-base leading-none">
              <Avatar
                src={storyObj.by?.avatarUrl}
                alt={`${storyObj.by?.firstName} ${storyObj.by?.lastName}`}
                className="size-10"
              >
                {storyObj.by?.firstName?.[0].toUpperCase()}
                {storyObj.by?.lastName?.[0].toUpperCase()}
              </Avatar>
              <div>
                <p className="text-base-black text-lg font-semibold">
                  {storyObj.by?.firstName} {storyObj.by?.lastName?.[0]}
                </p>
                <p className="text-base-black/75 text-md">
                  {storyObj.by?.rank}
                </p>
              </div>
            </div>
            <div className="flex gap-[18px] text-md lg:text-lg text-base-black/90 items-start h-max">
              <div className="flex items-center gap-1">
                <IconMapPin className="size-6 shrink-0" />
                {location}
              </div>
              <Divider orientation="vertical" />
              <time dateTime={storyObj.createdAt}>
                {new Date(storyObj.createdAt || '').toLocaleDateString(
                  'en-US',
                  {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  },
                )}
              </time>
            </div>
          </>
        )}
      </div>
      {isFetching ? (
        <GalleryLoading />
      ) : (
        <FeatureCarousel
          className="overflow-hidden mt-12"
          items={storyObj.photos}
          renderItem={(photo) => (
            <div className="relative rounded-xl overflow-hidden aspect-video w-full">
              <Image src={photo} alt="" fill />
            </div>
          )}
          classNames={{
            controls: 'justify-center',
          }}
          slideGap={32}
          paginationType="dots"
        />
      )}
      {isFetching ? (
        <Skeleton className="mt-12" height="50lvh" />
      ) : (
        <Textarea
          className="mt-12"
          classNames={{
            input: 'pb-12 min-h-[50lvh]',
          }}
          resize="vertical"
          value={isFetching ? '' : storyObj.story}
          onChange={(e) => setStoryObj({ ...storyObj, story: e.target.value })}
          disabled={isFetching}
        />
      )}
      <div className="flex mt-16 gap-4 justify-end">
        <Button
          className="h-16"
          leftSection={<IconClipboard className="size-6" />}
          variant="outline"
          onClick={handleSave}
        >
          Save as Draft
        </Button>
        <Button
          className="h-16 lg:w-96"
          leftSection={<IconUpload className="size-6" />}
          onClick={handlePusblish}
        >
          Publish Now
        </Button>
      </div>
    </Section>
  );
};

export default StoryDetailPage;
