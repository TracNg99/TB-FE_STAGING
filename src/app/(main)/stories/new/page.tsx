'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { InputWrapper, Progress, Select, Textarea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconSparkles } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { ImageUploadIcon } from '@/assets/image-upload-icon';
import StoryLoadingIcon from '@/assets/story-loading-icon';
import AiButton from '@/components/ai-button';
import VoiceToTextButton from '@/components/audio-handler/voice-to-text';
import ImageUploader from '@/components/image-uploader/image-picker';
import Section from '@/components/layouts/section';
import { useUploadImageCloudRunMutation } from '@/store/redux/slices/storage/upload';
import { useGetAllExperiencesQuery } from '@/store/redux/slices/user/experience';

const RandomLoading = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;

    // Increase progress at random interval between 0.5s and 1.5s with a max at 95%
    const increaseProgress = () => {
      const randomInterval = Math.floor(Math.random() * 1000) + 500;
      timeout = setTimeout(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearTimeout(timeout!);
            timeout = null;
            return 95;
          }
          return Math.min(95, prev + Math.floor(Math.random() * 10) + 5);
        });
        increaseProgress();
      }, randomInterval);
    };

    increaseProgress();

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, []);

  return (
    <Section className="flex flex-col items-center sm:max-w-5xl mx-auto px-4 pt-20">
      <StoryLoadingIcon />
      <p className="text-base-black font-semibold text-display-md mt-20">
        Generating your beautiful travel story...
      </p>
      <Progress className="mt-12 h-4 w-full" value={progress} />
    </Section>
  );
};

const storySchema = z.object({
  experience: z.string().nonempty('Select an experience'),
  notes: z.string().optional(),
  media: z
    .array(
      z.union([
        z.instanceof(Blob),
        z.object({ image: z.string(), name: z.string() }),
      ]),
    )
    .min(1, 'Must upload at least 1 photo'),
});

type StorySchema = z.infer<typeof storySchema>;

type MediaItem =
  | string
  | {
      readonly size?: number;
      readonly type?: string;
      [key: string]: any;
    }
  | undefined;

const NewStoryPage = () => {
  const router = useRouter();
  const [experiences, setExperiences] = useState<string[]>([]);
  const [isConfirmClicked, setIsConfirmClicked] = useState<boolean>(false);
  const [texts, setTexts] = useState<string>('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isMediaCleared, setIsMediaCleared] = useState<boolean>(false);

  const [uploadImageCloudRun] = useUploadImageCloudRunMutation();

  const { data: experiencesData } = useGetAllExperiencesQuery();

  useEffect(() => {
    if (experiencesData) {
      const mappedExperiencesInfo = experiencesData.map((item) => item.name);
      setExperiences(mappedExperiencesInfo);
    }
  }, [experiencesData]);

  const handleInputsUpload = async (userInputs: StorySchema) => {
    if (userInputs.experience === 'No experience selected') {
      notifications.show({
        title: 'Warning: No experience was selected',
        message: 'Please choose an experience for your story!',
        color: 'yellow',
      });
      return;
    }

    if (
      userInputs.media.length === 0 ||
      userInputs.media.some((item) => item === undefined)
    ) {
      notifications.show({
        title: 'Warning: No media was uploaded',
        message: 'Please upload at least one photo!',
        color: 'yellow',
      });
      return;
    }

    setIsConfirmClicked(true);

    const matchExperienceId = localStorage.getItem('matchExperienceId') || '';
    const reporterId = localStorage.getItem('reporterId') || '';

    const matchedExperience = experiencesData?.find(
      (item) => item.name === userInputs.experience,
    );

    if (
      matchExperienceId &&
      matchExperienceId !== '' &&
      matchedExperience?.id !== matchExperienceId
    ) {
      notifications.show({
        title: 'Warning: Experience not matched',
        message: `You are sharing story for a different Experience! 
        Please select the Experience again!`,
        color: 'yellow',
      });
      setIsConfirmClicked(false);
      return;
    }

    const mediaUrls = (
      await Promise.all(
        userInputs.media.map(async (item) => {
          if (typeof item === 'string') {
            return item; // Already a URL
          }

          try {
            const payload = {
              media: {
                mimeType: 'image/jpeg',
                body: (item as { image: string; name: string }).image,
              },
              bucket_name: 'story', // Replace with your bucket name
            };
            const { url } = await uploadImageCloudRun(payload).unwrap();
            return url; // Assuming the API returns the URL
          } catch (error) {
            console.error('Error uploading image:', error);
            notifications.show({
              title: 'Error uploading image',
              message: 'Failed to upload one or more images.',
              color: 'red',
            });
            setIsConfirmClicked(false);
            return null;
          }
        }),
      )
    ).filter((url) => url !== null) as string[];

    if (mediaUrls.length === 0) {
      notifications.show({
        title: 'Error uploading image',
        message: 'Failed to upload one or more images.',
        color: 'red',
      });
      setIsConfirmClicked(false);
      return;
    }

    const userInputObj = {
      experience: matchedExperience?.id || matchExperienceId,
      reporter_id: reporterId,
      notes: userInputs.notes || '',
      // channel_type_list: 'instagram', // Example channel types
      media: mediaUrls,
    };

    localStorage.setItem('userInputFields', JSON.stringify(userInputObj));

    setIsConfirmClicked(false);

    form.reset();

    router.push(`/stories/preview`);
  };

  const form = useForm<StorySchema>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      experience: 'No experience selected',
      media: [],
      notes: '',
    },
    mode: 'onTouched',
  });

  useEffect(() => {
    const subscription = form.watch((value) => {
      setTexts(value?.notes ?? '');
    });

    return () => subscription.unsubscribe();
  }, [texts, form.watch('notes')]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value && value.media && value.media.length > 0) {
        setMedia(value.media);
      }
    });

    return () => subscription.unsubscribe();
  }, [form.watch('media')]);

  const handleTranscription = (transcript: string) => {
    form.setValue('notes', transcript);
  };

  if (isConfirmClicked) {
    return <RandomLoading />;
  }

  return (
    <form
      className="pt-15 lg:pt-32"
      onSubmit={form.handleSubmit(handleInputsUpload)}
    >
      <Section className="flex flex-col gap-x-8 gap-y-4 lg:gap-y-16 max-w-5xl mx-auto px-4">
        <Controller
          control={form.control}
          name="experience"
          render={({ field: { onChange, value } }) => (
            <Select
              allowDeselect={false}
              className="mb-4 lg:mb-0"
              id="experience"
              placeholder="Select an Experience you have tried"
              classNames={{
                input: 'h-14',
              }}
              error={form.formState.errors.experience?.message}
              data={experiences}
              onChange={onChange}
              value={value as any}
              searchable
            />
          )}
        />
        <label htmlFor="media">Pick your photos ({media.length} / 10)</label>
        <Controller
          control={form.control}
          name="media"
          render={({ field }) => (
            <InputWrapper error={form.formState.errors.media?.message}>
              <ImageUploader
                onImageUpload={(files) => {
                  field.onChange(files.map((item) => item));
                }}
                allowMultiple={true}
                // withResize={true}
                isStandalone={true}
                // asBlob={true}
                isCleared={isMediaCleared}
                setIsCleared={setIsMediaCleared}
              >
                <ImageUploadIcon
                  className="size-50 text-white color-orange-500"
                  size={100}
                />
              </ImageUploader>
            </InputWrapper>
          )}
        />
        {media.length > 0 && (
          <>
            <div className="relative mb-4 lg:mb-0">
              <Textarea
                id="story"
                placeholder="Anything to add?"
                resize="vertical"
                classNames={{
                  input: 'pb-20 pt-4',
                }}
                error={form.formState.errors.notes?.message}
                {...form.register('notes')}
              />
              <VoiceToTextButton
                language="en-US"
                existingTexts={texts}
                onUnsupportDetected={() => {
                  notifications.show({
                    title: 'Error: Browser not supported',
                    message: 'This browser does not support speech recognition',
                    color: 'red',
                  });
                }}
                onTranscribe={(e) => handleTranscription(e)}
              />
            </div>
            <div className="lg:col-span-2 flex justify-center">
              <AiButton
                additionalClassName="lg:w-96 h-16 disabled:opacity-50 text-white bg-orange-500 hover:bg-orange-600 cursor-pointer text-white"
                type="submit"
                displayText="Generate your AI-assisted story"
                disabled={form.formState.isSubmitting}
                onClick={() => {
                  handleInputsUpload(form.getValues());
                }}
                altIcon={<IconSparkles size={24} />}
                asFloating={false}
              />
            </div>
          </>
        )}
      </Section>
    </form>
  );
};

export default NewStoryPage;
