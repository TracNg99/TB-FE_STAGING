'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, TextInput, Textarea } from '@mantine/core';
import { InputWrapper } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import ImageUploader from '@/components/image-uploader/image-picker';
import { useCreateExperienceMutation } from '@/store/redux/slices/business/experience';
import { useCreateExperienceDetailsMutation } from '@/store/redux/slices/business/experience';
import {
  useCreateMediaAssetMutation,
  useUploadImageCloudRunMutation,
} from '@/store/redux/slices/storage/upload';

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
// const videoMimeTypes = ['video/mp4', 'video/webm', 'video/ogg'];

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
  .optional();

const iconicPhotosSchema = z
  .array(
    z.union([
      z.instanceof(File).refine((file) => imageMimeTypes.includes(file.type), {
        message: 'Each image must be a valid image file (jpeg, png, webp)',
      }),
      z.object({
        image: z.string(),
        name: z.string(),
      }),
    ]),
  )
  .optional();

const experienceSchema = z.object({
  experience_title: z.string().nonempty('Experience title is required'),
  description: z.string().nonempty('Description is required'),
  thumbnail_description: z
    .string()
    .nonempty('Thumbnail description is required'),

  // banner_video: z
  //   .any()
  //   .optional()
  //   .refine(
  //     (file) => file instanceof File && videoMimeTypes.includes(file.type),
  //     'Banner video must be a valid video file (mp4, webm, ogg)',
  //   ),

  thumbnail_image: thumbnailImageSchema,

  address: z.string().optional(),
  primary_keyword: z.string().optional(),
  url_slug: z.string().optional(),
  iconic_photos: iconicPhotosSchema,
  // .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase and kebab-case'),
});

type ExperienceSchema = z.infer<typeof experienceSchema>;

const RegisterPage = () => {
  // const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  // const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const form = useForm<ExperienceSchema>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      experience_title: '',
      description: '',
      thumbnail_description: '',
      // banner_video: undefined,
      thumbnail_image: undefined,
      address: '',
      primary_keyword: '',
      url_slug: '',
      iconic_photos: undefined,
    },
    mode: 'onTouched',
  });
  const router = useRouter();
  const [uploadImageCloudRun] = useUploadImageCloudRunMutation();
  const [createMediaAsset] = useCreateMediaAssetMutation();
  const [createExperience] = useCreateExperienceMutation();
  const [createExperienceDetails] = useCreateExperienceDetailsMutation();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: ExperienceSchema) => {
    console.log('🚨 FORM SUBMISSION TRIGGERED!');
    console.log('Submitting', data);
    try {
      setIsSubmitting(true);

      let thumbnailUrl = '';
      let image_id = '';
      console.log(data.iconic_photos);

      // Handle thumbnail image upload using the new pattern
      if (data.thumbnail_image && !(data.thumbnail_image instanceof File)) {
        try {
          const payload = {
            media: {
              mimeType: 'image/jpeg',
              body: data.thumbnail_image.image,
            },
            bucket_name: 'destination',
          };
          const { url } = await uploadImageCloudRun(payload).unwrap();
          thumbnailUrl = url;
        } catch (error) {
          console.error('Error uploading thumbnail image:', error);
          notifications.show({
            title: 'Error uploading thumbnail image',
            message: 'Failed to upload thumbnail image.',
            color: 'red',
          });
          setIsSubmitting(false);
          return;
        }

        if (!thumbnailUrl) {
          console.error('Error uploading thumbnail image');
          setIsSubmitting(false);
          return;
        }

        const mediaAssetResponse = await createMediaAsset({
          signedUrl: thumbnailUrl,
          mimeType: 'image',
          usage: 'thumbnail',
        }).unwrap();

        if (!mediaAssetResponse) {
          console.error('Error creating media asset');
          setIsSubmitting(false);
          return;
        }

        image_id = mediaAssetResponse.data.id || '';
      }

      const iconicPhotoUrls: string[] = [];
      const iconicPhotoIds: string[] = [];

      // Handle iconic photos upload using the new pattern
      if (Array.isArray(data.iconic_photos) && data.iconic_photos.length > 0) {
        const uploadedUrls = (
          await Promise.all(
            data.iconic_photos.map(async (photo) => {
              if (!photo || photo instanceof File) {
                return null;
              }

              try {
                const payload = {
                  media: {
                    mimeType: 'image/jpeg',
                    body: photo.image,
                  },
                  bucket_name: 'destination',
                };
                const { url } = await uploadImageCloudRun(payload).unwrap();
                return url;
              } catch (error) {
                console.error('Error uploading iconic photo:', error);
                notifications.show({
                  title: 'Error uploading image',
                  message: 'Failed to upload one or more iconic photos.',
                  color: 'red',
                });
                return null;
              }
            }),
          )
        ).filter((url) => url !== null) as string[];

        if (uploadedUrls.length === 0 && data.iconic_photos.length > 0) {
          notifications.show({
            title: 'Error uploading images',
            message: 'Failed to upload iconic photos.',
            color: 'red',
          });
          setIsSubmitting(false);
          return;
        }

        // Create media assets for uploaded URLs
        for (const imageUrl of uploadedUrls) {
          const mediaAssetResponse = await createMediaAsset({
            signedUrl: imageUrl,
            mimeType: 'image',
            usage: 'iconic_photo',
          }).unwrap();

          const imageId = mediaAssetResponse.data.id;
          if (imageId && imageUrl) {
            iconicPhotoUrls.push(imageUrl);
            iconicPhotoIds.push(imageId);
          }
        }
      }

      const { data: newExperienceData, error: experienceError } =
        await createExperience({
          name: data.experience_title,
          description: data.description,
          address: data.address || '',
          primary_keyword: data.primary_keyword || '',
          url_slug:
            data.url_slug ||
            data.experience_title.toLowerCase().replace(/\s+/g, '-'),
          thumbnail_description: data.thumbnail_description || '',
          primary_photo: thumbnailUrl,
          primary_photo_id: image_id,
        });

      if (experienceError) {
        console.error('Error creating experience:', experienceError);
        setIsSubmitting(false);
        return;
      }

      const experienceId = newExperienceData?.data.id;

      if (experienceId) {
        for (const photoId of iconicPhotoIds) {
          await createExperienceDetails({
            experience_id: newExperienceData?.data.id,
            type: 'iconic_photos',
            name: 'placeholder name',
            text: 'placeholder text',
            media_id: photoId,
          });
        }
      }

      await router.replace(
        `/experiences/${newExperienceData?.data.id}/business/edit`,
      );
      setIsSubmitting(false);
      return;
    } catch (error) {
      console.error('Full Error in onSubmit:', error);
    }
  };

  return (
    <>
      <div className="w-full flex justify-center mt-4">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">
            Welcome to Experience Creator
          </h1>
        </header>
      </div>
      <div className="w-full flex justify-center mt-4">
        <form
          className="w-full max-w-full sm:max-w-[90%] md:max-w-[80%] lg:max-w-[70%] xl:max-w-[60%] flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <TextInput
            {...form.register('experience_title')}
            label="Experience Title"
            placeholder="The Ultimate Street Food Tour"
            error={form.formState.errors.experience_title?.message}
          />

          <Textarea
            {...form.register('description')}
            label="Description"
            placeholder="Describe the experience in detail..."
            error={form.formState.errors.description?.message}
            autosize
            minRows={5}
            maxRows={10}
          />

          <Textarea
            {...form.register('thumbnail_description')}
            label="Thumbnail Description"
            placeholder="Short and punchy summary for the thumbnail"
            error={form.formState.errors.thumbnail_description?.message}
          />

          {/* <FileButton
            onChange={(file) => {
              form.setValue('banner_video', file);

              if (file) {
                const videoURL = URL.createObjectURL(file);
                setVideoPreview(videoURL);
              } else {
                setVideoPreview(null);
              }
            }}
            accept="video/mp4,video/webm,video/ogg"
          >
            {(props) => (
              <Button variant="light" {...props}>
                Upload Banner Video
              </Button>
            )}
          </FileButton>

          {typeof form.formState.errors.banner_video?.message === 'string' && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.banner_video.message}
            </p>
          )}

          {videoPreview && (
            <video
              src={videoPreview}
              controls
              className="mt-2 w-60 max-w-full rounded border"
            />
          )} */}
          <InputWrapper
            label="Thumbnail Image"
            error={form.formState.errors.thumbnail_image?.message}
          >
            <ImageUploader
              onImageUpload={(fileArray) => {
                console.log('🔍 Thumbnail upload triggered:', fileArray);
                const file = fileArray[0];
                console.log(fileArray);
                if (file && file.image && file.name) {
                  console.log('🔍 Setting thumbnail_image value');
                  form.setValue('thumbnail_image', {
                    image: file.image!,
                    name: file.name!,
                  });
                } else {
                  console.log('🔍 Clearing thumbnail_image value');
                  form.setValue('thumbnail_image', undefined);
                }
              }}
              allowMultiple={false}
              withResize={true}
              isStandalone={true}
              className="p-4 border-2 border-dashed rounded-lg" // Add visible styling
            />
          </InputWrapper>

          <TextInput
            {...form.register('url_slug')}
            label="URL Slug"
            placeholder="the-ultimate-street-food-tour"
            error={form.formState.errors.url_slug?.message}
          />

          <InputWrapper
            label="Iconic Photos"
            error={form.formState.errors.iconic_photos?.message}
          >
            <ImageUploader
              onImageUpload={(fileArray) => {
                console.log('🔍 Iconic photos upload triggered:', fileArray);
                if (fileArray && fileArray.length > 0) {
                  const images = fileArray
                    .filter((file) => file && file.image && file.name)
                    .map((file) => ({
                      image: file.image!,
                      name: file.name!,
                    }));

                  console.log('🔍 Setting iconic_photos value:', images);
                  form.setValue('iconic_photos', images);
                } else {
                  console.log('🔍 Clearing iconic_photos value');
                  form.setValue('iconic_photos', []);
                }
              }}
              allowMultiple={true}
              // withResize={true}
              isStandalone={true}
              className="p-4 border-2 border-dashed rounded-lg"
            />
          </InputWrapper>

          <Button
            type="submit"
            disabled={!form.formState.isValid}
            loading={isSubmitting}
          >
            Register
          </Button>

          {/* <Controller
                    control={form.control}
                    name="thumbnail_media"
                    render={({ field }) => (
                      <InputWrapper>
                        <ImageUploader
                          onImageUpload={(files) => {
                            field.onChange(files.map((item) => item.image));
                          }}
                          allowMultiple={true}
                          withResize={true}
                          isStandalone={true}
                        />
                      </InputWrapper>
                    )}
                  /> */}
        </form>
      </div>
    </>
  );
};

export default RegisterPage;
