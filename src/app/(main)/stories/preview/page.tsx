'use client';

import { notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';

import StoryDetailUI from '@/components/story/preview-ui';
import {
  StoryReqProps,
  StoryStreamRes,
  useStreamStoryMutation,
  useUpdateStoryMutation,
} from '@/store/redux/slices/user/story';

const StoryDetailPage = () => {
  const [storyObj, setStoryObj] = useState<
    {
      id: string;
      name: string;
      title: string;
      story: string;
    }[]
  >([]);
  const [userInputFields, setUserInputFields] = useState({
    experience: '',
    notes: '',
  });
  const [media, setMedia] = useState<string[]>([]);
  const [streamStory] = useStreamStoryMutation();
  const [updateStory] = useUpdateStoryMutation();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userInputObj = localStorage.getItem('userInputFields');
      if (userInputObj) {
        const parsedUserInputObj = JSON.parse(userInputObj);
        const { media, ...rest } = parsedUserInputObj;
        setUserInputFields(rest);
        setMedia(media);
      }
    }
  }, []);

  const handleStoryChunk = (chunk: StoryStreamRes) => {
    if (chunk.event === 'error') {
      notifications.show({
        title: 'Streaming Error',
        message:
          (chunk.data as { error?: string }).error ||
          'An error occurred during streaming.',
        color: 'red',
      });
      // setIsConfirmClicked(false);
      return;
    }

    if (chunk.event === 'done') {
      notifications.show({
        title: 'Streaming Complete',
        message: 'Story generation finished!',
        color: 'green',
      });
      // setIsConfirmClicked(false);
      return;
    }

    if (
      chunk.data &&
      typeof chunk.data === 'object' &&
      !('error' in chunk.data) &&
      !('message' in chunk.data)
    ) {
      const storyData = chunk.data as StoryReqProps; // Type assertion
      setMedia(storyData.media ?? []);

      setStoryObj((prevStoryObj) => {
        return [
          ...prevStoryObj,
          {
            title: storyData.seo_title_tag || '',
            story:
              storyData.story_content +
                `\n\n${storyData.hashtags?.join(' ')}` || '',
            id: storyData.id || '',
            name: chunk.channel_type || '',
          },
        ];
      });

      localStorage.removeItem('userInputFields');
    }
  };

  const handleGenerate = async (channel?: string, id?: string) => {
    const formData = new FormData();
    formData.append('experience_id', userInputFields.experience);
    formData.append('reporter_id', localStorage.getItem('reporterId') || '');
    formData.append('notes', userInputFields.notes);
    if (channel && id) {
      setStoryObj((prevStoryObj) => {
        const updatedStoryObj = prevStoryObj.map((story) => {
          if (story.name === channel) {
            return null;
          }
          return story;
        });
        return updatedStoryObj.filter((story) => story !== null);
      });
      formData.append('channel_type_list', channel);
      formData.append('story_id', id);
    }
    media.forEach((item) => {
      formData.append('media', item);
    });
    try {
      await streamStory({
        formData,
        onChunk: handleStoryChunk,
      }).unwrap();
    } catch (error) {
      console.error(error);
      notifications.show({
        title: 'Error: Story generation failure',
        message: 'Fail to generate story! Please try again!',
        color: 'red',
      });
    }
  };

  useEffect(() => {
    if (userInputFields.experience !== '' && media.length > 0) {
      handleGenerate();
    }
  }, [userInputFields]);

  const handleUpdate = async (data: {
    id: string;
    title?: string;
    story?: string;
    status: string;
    hashtags?: string[];
  }) => {
    if (!data.id) {
      return;
    }
    try {
      const result = await updateStory({
        storyId: data.id,
        payload: {
          seo_title_tag: data.title,
          story_content: data.story,
          status: data.status,
          hashtags: data.hashtags,
        },
      }).unwrap();

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
    } catch (error) {
      console.error(error);
      notifications.show({
        title: 'Error: Story update failure',
        message: 'Fail to update your story! Please try again!',
        color: 'red',
      });
    }
  };

  const handleChanges = async (data: {
    id: string;
    name: string;
    title: string;
    story: string;
  }) => {
    setStoryObj((prevStoryObj) => {
      return prevStoryObj.map((story) => {
        if (story.id === data.id && story.name === data.name) {
          return {
            ...story,
            title: data.title,
            story: data.story,
          };
        }
        return story;
      });
    });
  };

  return (
    <StoryDetailUI
      channels={storyObj}
      photos={media.filter((item) => item !== undefined) as string[]}
      onUpdate={(data) => handleUpdate(data)}
      onRegenerate={(channel, id) => handleGenerate(channel, id)}
      onChange={(data) => handleChanges(data)}
    />
  );
};

export default StoryDetailPage;
