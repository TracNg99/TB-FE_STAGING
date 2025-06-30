'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Select, TextInput, Textarea } from '@mantine/core';
import { InputWrapper } from '@mantine/core';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import ImageUploader from '@/components/image-uploader/image-picker';
import { useCreateActivityMutation } from '@/store/redux/slices/business/activity';
import { useGetAllExperiencesBusinessQuery } from '@/store/redux/slices/business/experience';
import {
  useCreateMediaAssetMutation,
  useUploadImageMutation,
} from '@/store/redux/slices/storage/upload';
import { Experience } from '@/types/experience';

// Create a simplified version with only id and name
type SimpleExperience = Pick<Experience, 'id' | 'name'>;

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

const thumbnailImageSchema = z
  .union([
    z.instanceof(File).refine((file) => imageMimeTypes.includes(file.type), {
      message: 'Thumbnail image must be a valid image file (jpeg, png, webp)',
    }),
    z.object({
      image: z.string(),
      name: z.string(),
    }),
  ])
  .superRefine((val, ctx) => {
    if (!val) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Photo is required',
      });
    }
  });

const activitySchema = z.object({
  experience_id: z.string().nonempty('Experience selection is required'),
  activity_title: z.string().nonempty('Activity title is required'),
  description: z.string().nonempty('Description is required'),
  description_thumbnail: z
    .string()
    .nonempty('Thumbnail description is required'),

  thumbnail_image: thumbnailImageSchema,
  address: z.string().optional(),
  hours: z.string().optional(),
  primary_keyword: z.string().optional(),
  url_slug: z.string().optional(),
  // .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase and kebab-case'),
});

type ActivitySchema = z.infer<typeof activitySchema>;

const RegisterPage = () => {
  // State for experiences list
  const [experiences, setExperiences] = useState<SimpleExperience[]>([]);
  // State for loading experiences
  // const [loadingExperiences, setLoadingExperiences] = useState(false);

  const { data: allExperiences } = useGetAllExperiencesBusinessQuery();
  const [uploadImage] = useUploadImageMutation();
  const [createMediaAsset] = useCreateMediaAssetMutation();
  const [createActivity] = useCreateActivityMutation();

  // This would be set from your configuration or props
  // Replace this with your actual default experience ID when available
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultExperienceId = searchParams.get('experienceId') || '';

  const form = useForm<ActivitySchema>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      experience_id: defaultExperienceId,
      activity_title: '',
      description: '',
      description_thumbnail: '',
      thumbnail_image: undefined,
      address: '',
      hours: '',
      primary_keyword: '',
      url_slug: '',
    },
    mode: 'onTouched',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const onSubmit = async (data: ActivitySchema) => {
    console.log('🚨 FORM SUBMISSION TRIGGERED', data);
    try {
      setIsSubmitting(true);

      let thumbnailUrl = '';
      let image_id = '';
      if (data.thumbnail_image && !(data.thumbnail_image instanceof File)) {
        const thumbnailResponse = await uploadImage({
          imageBase64: data.thumbnail_image.image,
          title: 'ExperienceThumbnail',
          bucket: 'destination',
        }).unwrap();
        thumbnailUrl = thumbnailResponse.signedUrl || '';
        const mediaAssetResponse = await createMediaAsset({
          signedUrl: thumbnailUrl,
          mimeType: 'image',
          usage: 'thumbnail',
        }).unwrap();
        image_id = mediaAssetResponse.data.id || '';
      }

      const { data: newActivityData } = await createActivity({
        experience_id: data.experience_id,
        title: data.activity_title,
        address: data.address || '',
        primary_keyword: data.primary_keyword || '',
        url_slug:
          data.url_slug ||
          data.activity_title.toLowerCase().replace(/\s+/g, '-'),
        description: data.description || '',
        description_thumbnail: data.description_thumbnail || '',
        primary_photo: thumbnailUrl,
        primary_photo_id: image_id,
      });

      console.log('New Activity', newActivityData);

      await router.replace(`/experiences/${data.experience_id}/business/edit`);
      setIsSubmitting(false);
      return;
    } catch (error) {
      console.error('Full Error in onSubmit:', error);
    }
  };

  // Fetch experiences from API
  useEffect(() => {
    const fetchExperiences = async () => {
      // setLoadingExperiences(true);
      try {
        if (allExperiences) {
          setExperiences(
            allExperiences.map((item) => ({
              id: item.id,
              name: item.name,
            })),
          );
        }
      } catch (error) {
        console.error('Failed to fetch experiences:', error);
      }
      // finally {
      //   setLoadingExperiences(false);
      // }
    };
    fetchExperiences();
  }, [allExperiences]);

  // Format experiences for Select component
  const experienceOptions = experiences.map((exp) => ({
    value: exp.id,
    label: exp.name,
  }));

  return (
    <>
      <div className="w-full flex justify-center mt-4">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">
            Welcome to Activity Creator
          </h1>
        </header>
      </div>
      <div className="w-full flex justify-center mt-4">
        <form
          className="w-full max-w-full sm:max-w-[90%] md:max-w-[80%] lg:max-w-[70%] xl:max-w-[60%] flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <Select
            label="Select Experience"
            placeholder="Select an experience"
            data={experienceOptions}
            value={form.watch('experience_id')}
            onChange={(value) => form.setValue('experience_id', value || '')}
            error={form.formState.errors.experience_id?.message}
            maxDropdownHeight={250} // Makes it scrollable after 250px height
            searchable
            nothingFoundMessage="No experiences found"
            // loading={loadingExperiences}
            required
          />

          <TextInput
            {...form.register('activity_title')}
            label="Activity Title"
            placeholder="The Ultimate Street Food Tour"
            error={form.formState.errors.activity_title?.message}
          />

          <Textarea
            {...form.register('description')}
            label="Description"
            placeholder="Describe the activity in detail..."
            error={form.formState.errors.description?.message}
            autosize
            minRows={5}
            maxRows={10}
          />

          <Textarea
            {...form.register('description_thumbnail')}
            label="Thumbnail Description"
            placeholder="Short and punchy summary for the thumbnail"
            error={form.formState.errors.description_thumbnail?.message}
          />
          <InputWrapper
            label="Thumbnail Image"
            error={form.formState.errors.thumbnail_image?.message}
          >
            <ImageUploader
              onImageUpload={(fileArray) => {
                const file = fileArray[0];
                if (file && file.image && file.name) {
                  form.setValue('thumbnail_image', {
                    image: file.image!, // non-null assertion
                    name: file.name!,
                  });
                } else {
                  form.setValue('thumbnail_image', {
                    image: '', // or some default image data
                    name: '', // or some default name
                  });
                }
              }}
              isStandalone={true}
              allowMultiple={false}
              // withResize={true}
            />
          </InputWrapper>

          <TextInput
            {...form.register('address')}
            label="Address"
            placeholder="123 Walking Street, Bangkok"
            error={form.formState.errors.address?.message}
          />

          <TextInput
            {...form.register('hours')}
            label="Hours"
            placeholder="6:30 AM - 10:00 PM"
            error={form.formState.errors.hours?.message}
          />

          <TextInput
            {...form.register('url_slug')}
            label="URL Slug"
            placeholder="the-ultimate-street-food-tour"
            error={form.formState.errors.url_slug?.message}
          />

          <Button
            type="submit"
            disabled={!form.formState.isValid}
            loading={isSubmitting}
          >
            Register
          </Button>
        </form>
      </div>
    </>
  );
};

export default RegisterPage;
