'use client';

import { Box, Card, Loader, Textarea } from '@mantine/core';
//Avatar, Divider
import { useMediaQuery } from '@mantine/hooks';
import { IconCheck, IconChevronLeft } from '@tabler/icons-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import FeatureCarousel from '@/components/feature-carousel';
import Section from '@/components/layouts/section';
import {
  // StoryMetadataLoading,
  GalleryLoading,
} from '@/components/story/story-loading';

// IconMapPin

import ChannelIconButton from './channel-icon-button';

interface StoryDetailProps {
  photos: string[];
  channels: {
    id: string;
    name: string;
    title: string;
    story: string;
  }[];
  onUpdate: ({
    id,
    status,
    title,
    story,
    hashtags,
  }: {
    id: string;
    status: string;
    title?: string;
    story?: string;
    hashtags?: string[];
  }) => void;
  onRegenerate: (channel: string, id: string) => void;
  onChange: ({
    id,
    name,
    title,
    story,
  }: {
    id: string;
    name: string;
    title: string;
    story: string;
  }) => void;
}

const StoryDetailUI: React.FC<StoryDetailProps> = ({
  photos,
  channels,
  onUpdate,
  onRegenerate,
  onChange,
}) => {
  const [chosenChannel, setChosenChannel] = useState<string>('instagram');
  const [chosenChannelData, setChosenChannelData] = useState<{
    id: string;
    title: string;
    story: string;
    isReady: boolean;
  }>({
    id: '',
    title: '',
    story: '',
    isReady: false,
  });
  const [allChannels, setAllChannels] = useState<any[]>([]);
  // const [story, setStory] = useState<string>('');
  // const mediaBlob = useRef<File[]>([]);
  const [hashtags, setHashTags] = useState<string[]>([]);
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [isCopied, setIsCopied] = useState(false);
  const channelIcons = (size: number) => {
    return [
      {
        name: 'instagram',
        icon: (
          <Image
            src="/assets/insta_logo.svg"
            alt="Instagram"
            width={size}
            height={size}
          />
        ),
      },
      {
        name: 'facebook',
        icon: (
          <Image
            src="/assets/facebook_logo.svg"
            alt="Facebook"
            width={size}
            height={size}
          />
        ),
      },
      {
        name: 'linkedin',
        icon: (
          <Image
            src="/assets/linkedin_logo.svg"
            alt="LinkedIn"
            width={size}
            height={size}
          />
        ),
      },
      {
        name: 'tiktok',
        icon: (
          <Image
            src="/assets/tiktok_logo.svg"
            alt="TikTok"
            width={size}
            height={size}
          />
        ),
      },
      {
        name: 'travel_buddy',
        icon: (
          <Image
            src="/assets/travelbuddy_logo_icon.svg"
            alt="Travel Buddy"
            width={size}
            height={size}
          />
        ),
      },
    ];
  };

  useEffect(() => {
    const matchedChannel = channels.find(
      (channel) => channel.name === chosenChannel,
    );
    if (matchedChannel) {
      setChosenChannelData({
        id: matchedChannel.id,
        title: matchedChannel.title,
        story: matchedChannel.story,
        isReady: true,
      });
    } else {
      setChosenChannelData({
        id: '',
        title: '',
        story: '',
        isReady: false,
      });
    }
  }, [chosenChannel, channels]);

  useEffect(() => {
    const completeChannels = channelIcons(isMobile ? 32 : 40).map((item) => {
      const matchedChannel = channels.find(
        (channel) => channel.name === item.name,
      );
      if (matchedChannel) {
        return {
          ...item,
          isReady: true,
        };
      } else {
        return {
          ...item,
          isReady: false,
        };
      }
    });
    setAllChannels(completeChannels);
  }, [channels, isMobile]);

  useEffect(() => {
    if (
      chosenChannelData.story &&
      chosenChannelData.story.match(/\n#\w+/)!.length > 0
    ) {
      const hashtagsString = chosenChannelData.story
        .split(/(.*?)(?=\n#)/)
        ?.filter((tag) => tag.trim() !== '')?.[1]
        ?.trim();
      console.log(hashtagsString);
      const hashtagsArray = hashtagsString
        ?.split(' ')
        ?.map((tag) => tag?.trim());
      console.log(hashtagsArray);
      setHashTags(hashtagsArray);
    }
  }, [chosenChannelData.story]);

  const handlePusblish = async () => {
    onUpdate({
      id: chosenChannelData.id,
      status: 'PUBLISHED',
      title: chosenChannelData.title,
      story: chosenChannelData.story,
      hashtags,
    });
  };

  const handleShare = () => {
    if (navigator.clipboard && typeof window !== 'undefined') {
      navigator.clipboard.writeText(`/stories/${chosenChannelData.id}`);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 3000);
    }
  };

  const handleEditStory = (story: string) => {
    setChosenChannelData({
      ...chosenChannelData,
      story,
    });
    onChange({
      id: chosenChannelData.id,
      name: chosenChannel,
      title: chosenChannelData.title,
      story,
    });
  };

  const handleEditTitle = (title: string) => {
    setChosenChannelData({
      ...chosenChannelData,
      title,
    });
    onChange?.({
      id: chosenChannelData.id,
      name: chosenChannel,
      title,
      story: chosenChannelData.story,
    });
  };

  const utilButtons = [
    {
      name: 'Regenerate',
      icon: (
        <Image
          src="/assets/circular-arrows.svg"
          alt=""
          width={24}
          height={24}
        />
      ),
      onClick: onRegenerate,
    },
    {
      name: 'Share',
      icon: (
        <Image
          src="/assets/solar_copy-bold.svg"
          alt=""
          width={24}
          height={24}
        />
      ),
      onClick: handleShare,
    },
    {
      name: 'Publish',
      icon: (
        <Image
          src="/assets/majesticons_share.svg"
          alt=""
          width={24}
          height={24}
        />
      ),
      onClick: handlePusblish,
    },
  ];

  return (
    <Section className="flex flex-col pt-12 sm:max-w-5xl items-center">
      <a
        href="/stories/new"
        className={`
          flex flex-row gap-2 
          self-start 
          mb-10 
          font-medium ${isMobile ? 'text-sm' : 'text-base'}`}
      >
        <IconChevronLeft /> Share your travel story
      </a>
      <div className={`flex flex-row ${isMobile ? 'gap-2' : 'gap-4'}`}>
        {allChannels.map((channel) => (
          <ChannelIconButton
            key={channel.name}
            icon={channel.icon}
            isClicked={chosenChannel === channel.name}
            isMobile={isMobile}
            isReady={channel.isReady}
            onClick={() => setChosenChannel(channel.name)}
          />
        ))}
      </div>
      {/* <div className="mt-8 flex flex-col md:flex-row gap-10 justify-between">
        {isFetching ? (
          <StoryMetadataLoading />
        ) : (
          <>
            <div className="flex items-center gap-2 text-base-black font-medium text-sm lg:text-base leading-none">
              <Avatar
                src={storyObj.by.avatarUrl}
                alt={`${storyObj.by.firstName} ${storyObj.by.lastName}`}
                className="size-10"
              >
                {storyObj.by.firstName[0].toUpperCase()}
                {storyObj.by.lastName[0].toUpperCase()}
              </Avatar>
              <div>
                <p className="text-base-black text-lg font-semibold">
                  {storyObj.by.firstName} {storyObj.by.lastName[0]}.
                </p>
                <p className="text-base-black/75 text-md">{by.rank}</p>
              </div>
            </div>
            <div className="flex gap-[18px] text-md lg:text-lg text-base-black/90 items-start h-max">
              <div className="flex items-center gap-1">
                <IconMapPin className="size-6 shrink-0" />
                {location}
              </div>
              <Divider orientation="vertical" />
              <time dateTime={storyObj.createdAt}>
                {new Date(storyObj.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
          </>
        )}
      </div> */}

      {chosenChannelData.isReady && (
        <div className="flex mt-16 gap-6 justify-end">
          {utilButtons.map((item) => (
            <button
              key={item.name}
              className={`
            flex items-center justify-center align-center
            gap-2 rounded-full
            ${isMobile ? 'w-[48px] h-[48px]' : 'w-[64px] h-[64px]'}
            bg-orange-50 border-2 border-orange-500 cursor-pointer`}
              onClick={() => item.onClick(chosenChannel, chosenChannelData.id)}
            >
              {item.name === 'Share' ? (
                isCopied ? (
                  <IconCheck size={24} color="green" />
                ) : (
                  item.icon
                )
              ) : (
                item.icon
              )}
            </button>
          ))}
        </div>
      )}

      {chosenChannel === 'travel_buddy' && chosenChannelData.story && (
        <Textarea
          className=""
          classNames={{
            input:
              'text-display-sm font-bold text-base-black mt-5 p-4 pb-12 w-full',
          }}
          // defaultValue={title}
          value={chosenChannelData.title}
          onChange={(e) => handleEditTitle(e.target.value)}
          disabled={!chosenChannelData.isReady}
        />
      )}

      {!chosenChannelData.isReady ? (
        <Box
          className={`
            mt-12 
            flex flex-col items-center justify-center 
            h-full w-full 
            border-2 border-gray-300
            rounded-xl
            p-3
            gap-2
        `}
        >
          <span
            className={`
            flex flex-wrap 
            text-orange-500 
            text-[${isMobile ? '16px' : '24px'}]
            mr-2
          `}
          >
            Your AI-assisted story is on the way...
          </span>
          <Loader color="orange" type={'oval'} />
        </Box>
      ) : (
        <Textarea
          className="mt-12 w-full"
          classNames={{
            input: 'pb-12 min-h-[50lvh] w-full',
          }}
          resize="vertical"
          value={chosenChannelData.story}
          onChange={(e) => handleEditStory(e.target.value)}
          disabled={!chosenChannelData.isReady}
        />
      )}

      {photos.length === 0 ? (
        <GalleryLoading />
      ) : (
        <FeatureCarousel
          className="overflow-hidden mt-5"
          items={photos}
          renderItem={(photo, index) => (
            <Card className="flex flex-col gap-4 lg:gap-8">
              <div className="relative rounded-xl aspect-video">
                <Image
                  width={isMobile ? 500 : 1000}
                  height={isMobile ? 500 : 1000}
                  src={photo}
                  alt={`photo-${index}`}
                  className="rounded-2xl object-center object-cover"
                />
              </div>
            </Card>
          )}
          classNames={{
            controls: 'justify-center',
          }}
          slideSize={{
            sm: 100,
            md: 100,
            base: 100,
          }}
          slideGap={32}
          paginationType="dots"
        />
      )}
    </Section>
  );
};

export default StoryDetailUI;
