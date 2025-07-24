'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Group,
  InputWrapper,
  Select,
  type SelectProps,
  Textarea,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconSparkles } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { ImageUploadIcon } from '@/assets/image-upload-icon';
import AiButton from '@/components/ai-button';
import VoiceToTextButton from '@/components/audio-handler/voice-to-text';
import ImageUploader from '@/components/image-uploader/image-picker';
import Section from '@/components/layouts/section';
import StoryCreationLoading from '@/components/loading/StoryCreationLoading';
import { useUploadImageCloudRunMutation } from '@/store/redux/slices/storage/upload';
import { useGetAllExperiencesQuery } from '@/store/redux/slices/user/experience';
import { useUploadStoryAgentMutation } from '@/store/redux/slices/user/storyAgent';

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

const NewStoryPage = () => {
  const router = useRouter();
  const [experiences, setExperiences] = useState<string[]>([]);
  const [isConfirmClicked, setIsConfirmClicked] = useState<boolean>(false);
  const [isMediaCleared, setIsMediaCleared] = useState<boolean>(false);
  const [uploadStory, { isLoading: isUploading }] =
    useUploadStoryAgentMutation();

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
        message: `You are sharing story for a different Experience! \n        Please select the Experience again!`,
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
              bucket_name: 'story',
            };
            const { url } = await uploadImageCloudRun(payload).unwrap();
            return url;
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

    // Use RTK Query mutation to upload story
    try {
      const payload = {
        experience_id: matchedExperience?.id || matchExperienceId,
        // reporter_id: reporterId,
        notes: userInputs.notes || '',
        media: mediaUrls,
        // channel_type_list: 'travel_buddy',
      };
      const result = await uploadStory({ payload }).unwrap();
      if (result?.data?.id) {
        router.push(`/stories/${result.data.id}?first=true`);
      } else {
        setIsConfirmClicked(false);
        notifications.show({
          title: 'Error: No story ID',
          message: 'Could not get story ID from response.',
          color: 'red',
        });
      }
    } catch (error) {
      setIsConfirmClicked(false);
      notifications.show({
        title: 'Error: Story creation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        color: 'red',
      });
    }
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

  const handleTranscription = (transcript: string) => {
    form.setValue('notes', transcript);
  };

  const watchedMedia = form.watch('media');
  const watchedNotes = form.watch('notes');

  if (isUploading || isConfirmClicked) {
    return (
      <StoryCreationLoading message="Your AI-assisted story is on the way..." />
    );
  }

  const renderSelectOption: SelectProps['renderOption'] = ({
    option,
    checked,
  }) => (
    <Group
      className={`flex items-center px-3 py-2 cursor-pointer w-full truncate ${checked ? 'bg-orange-500 text-white' : 'bg-white text-black'} hover:bg-orange-100`}
      style={{ minHeight: 40 }}
    >
      {option.label}
    </Group>
  );

  return (
    <form className="pt-8" onSubmit={form.handleSubmit(handleInputsUpload)}>
      <Section className="flex flex-col gap-x-8 gap-y-4 lg:gap-y-8 max-w-5xl mx-auto px-4 mb-8">
        <p className="text-base-black font-semibold text-display-sm">
          Share your travel story
        </p>
        <Controller
          control={form.control}
          name="experience"
          render={({ field: { onChange, value } }) => (
            <Select
              allowDeselect={false}
              className="mb-4 lg:mb-0 pointer-events-auto"
              comboboxProps={{
                transitionProps: { transition: 'pop', duration: 200 },
              }}
              id="experience"
              placeholder="Select an Experience you have tried"
              classNames={{
                input: 'h-10 cursor-pointer',
                options: 'p-0',
                option: 'w-full p-0',
                dropdown:
                  'p-0 rounded-tl-none rounded-tr-none overflow-hidden border-1 -translate-y-2',
              }}
              renderOption={renderSelectOption}
              error={form.formState.errors.experience?.message}
              data={experiences}
              onChange={onChange}
              value={value as any}
              searchable
            />
          )}
        />
        <div>
          <label htmlFor="media" className="font-medium">
            Pick your photos ({watchedMedia.length} / 10)
          </label>
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
        </div>
        {watchedMedia.length > 0 && (
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
                existingTexts={watchedNotes ?? ''}
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
