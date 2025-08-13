import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Input,
  InputWrapper,
  Select,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Link, RichTextEditor } from '@mantine/tiptap';
import Underline from '@tiptap/extension-underline';
import { useEditor } from '@tiptap/react';
import { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import IconicPhotoDisplay from '@/components/admin/IconicPhotoDisplay';
import ImageUploader from '@/components/image-uploader/image-picker';
import {
  useCreateActivityMutation,
  useUpdateActivityMutation,
} from '@/store/redux/slices/business/activity';
import {
  useCreateExperienceDetailsMutation,
  useDeleteExperienceDetailsMutation,
  useUpdateExperienceMutation,
} from '@/store/redux/slices/business/experience';
import {
  useCreateMediaAssetMutation,
  useUploadImageCloudRunMutation,
} from '@/store/redux/slices/storage/upload';
import { useGetActivitiesInExperiencePublicQuery } from '@/store/redux/slices/user/activity';
import { Activity } from '@/store/redux/slices/user/experience';
import { useGetExperiencePublicQuery } from '@/store/redux/slices/user/experience';
import { useGetIconicPhotosPublicQuery } from '@/store/redux/slices/user/experience';
import { cn } from '@/utils/class';

import styles from './CreateCard.module.css';

interface EditExperienceCardProps {
  opened?: boolean;
  onClose: () => void;
  experience: any;
}

// Experience schema (Step 1)
const experienceSchema = z.object({
  experience_id: z.string(),
  experience_title: z.string().min(1, 'Experience title is required'),
  experience_description: z.string().min(1, 'Description is required'),
  experience_thumbnail_description: z
    .string()
    .min(1, 'Short description is required'),
  address: z.string().min(1, 'City is required'),
  experience_thumbnail_image: z.object({
    image: z.string(),
    name: z.string(),
  }),
  experience_thumbnail_url: z.string(),
  iconic_photos: z.array(
    z.object({
      image: z.string(),
      name: z.string(),
    }),
  ),
  new_iconic_photos: z.array(
    z.object({
      iconicPhotoUrl: z.string(),
      iconicPhotoId: z.string(),
    }),
  ),
});

// Activity schema (Step 2)
const activitySchema = z.object({
  activity_id: z.string(),
  activity_title: z.string().min(1, 'Activity title is required'),
  activity_thumbnail_description: z
    .string()
    .min(1, 'Short description is required'),
  activity_description: z.string().min(1, 'Description is required'),
  activity_thumbnail_image: z.object({
    image: z.string(),
    name: z.string(),
  }),
  activity_thumbnail_url: z.string(),
  activity_visiting_time: z.string().min(1, 'Visiting time is required'),
  activity_address: z.string().min(1, 'Address is required'),
  activity_iconic_photos: z.array(
    z.object({
      image: z.string(),
      name: z.string(),
    }),
  ),
  new_activity_iconic_photos: z.array(
    z.object({
      iconicPhotoUrl: z.string(),
      iconicPhotoId: z.string(),
    }),
  ),
  activity_highlights: z.array(z.string()),
});

type ExperienceFormData = z.infer<typeof experienceSchema>;
type ActivityFormData = z.infer<typeof activitySchema>;

const CITIES = ['Danang', 'Hanoi', 'Saigon', 'Mekong Delta', 'Phan Thiet'];

const EditExperienceCard: React.FC<EditExperienceCardProps> = ({
  // opened = false,
  onClose,
  experience,
}) => {
  const [currentStep, setCurrentStep] = useState<'experience' | 'activity'>(
    'experience',
  );
  const [createdExperienceId, setCreatedExperienceId] = useState<string | null>(
    null,
  );
  const [formKey, setFormKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activityAddState, setActivityAddState] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);

  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [currentStatus, setCurrentStatus] = useState<string>('');
  const [currentActivityStatus, setCurrentActivityStatus] =
    useState<string>('');

  const [uploadImageCloudRun] = useUploadImageCloudRunMutation();
  const [createMediaAsset] = useCreateMediaAssetMutation();
  const [updateExperience] = useUpdateExperienceMutation();
  const [createExperienceDetails] = useCreateExperienceDetailsMutation();
  const [createActivity] = useCreateActivityMutation();
  const [updateActivity] = useUpdateActivityMutation();
  const [deleteExperienceDetails] = useDeleteExperienceDetailsMutation();

  // Fetch activities for this experience
  const { data: experienceFull, refetch: refetchExperienceFull } =
    useGetExperiencePublicQuery({
      id: experience.id,
    });

  let { data: iconicPhotos = [] } = useGetIconicPhotosPublicQuery({
    id: experience.id,
  });
  const { refetch: refetchIconicPhotos } = useGetIconicPhotosPublicQuery({
    id: experience.id,
  });
  let iconicPhotoUrls = iconicPhotos.map((photo) => photo.url);

  // Experience form (Step 1)
  const experienceForm = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    mode: 'onChange',
    defaultValues: {
      experience_id: experienceFull?.id || '',
      experience_title: experience?.name || '',
      experience_description: experience?.description || '',
      experience_thumbnail_description: experience?.thumbnail_description || '',
      address: experienceFull?.address || '',
      experience_thumbnail_image: {
        image: experience?.primary_photo || '',
        name: '',
      },
      experience_thumbnail_url: experience?.primary_photo || '',
      iconic_photos:
        iconicPhotos.map((photo) => ({
          image: photo.url,
          name: photo.name,
        })) || [],
      new_iconic_photos: [],
    },
  });

  useEffect(() => {
    setCurrentAddress(experienceFull?.address || '');
    setCurrentStatus(experienceFull?.status || '');
    experienceForm.setValue('experience_id', experienceFull?.id || '');
    experienceForm.setValue('address', experienceFull?.address || '');
    experienceForm.setValue(
      'experience_thumbnail_url',
      experience?.primary_photo || '',
    );
  }, [experienceFull]);

  // Fetch activities for this experience
  const { data: activitiesCurrent = [], refetch: refetchActivities } =
    useGetActivitiesInExperiencePublicQuery({
      experience_id: experience.id,
    });

  useEffect(() => {
    if (activitiesCurrent && activitiesCurrent.length > 0) {
      setActivities(activitiesCurrent);
    }
  }, [activitiesCurrent]);

  // Activity form (Step 2)
  const activityForm = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    mode: 'onChange',
    defaultValues: {
      activity_id: '',
      activity_title: '',
      activity_thumbnail_description: '',
      activity_description: '',
      activity_thumbnail_image: {
        image: '',
        name: '',
      },
      activity_thumbnail_url: '',
      activity_visiting_time: '',
      activity_address: '',
      activity_iconic_photos: [],
      new_activity_iconic_photos: [
        {
          iconicPhotoUrl: '',
          iconicPhotoId: '',
        },
      ],
      activity_highlights: [],
    },
  });

  // Add this effect to reset the activity form when navigating to it
  // useEffect(() => {
  //   if (currentStep === 'activity') {
  //     activityForm.reset();
  //     setFormKey((prev) => prev + 1); // This will force a remount of the activity form
  //   }
  // }, [currentStep]);

  const experienceEditor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc pl-6',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal pl-6',
          },
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
      Underline,
    ],
    content: experienceForm.watch('experience_description') || '',
    onUpdate: ({ editor }: { editor: Editor }) => {
      experienceForm.setValue('experience_description', editor.getHTML(), {
        shouldValidate: true,
      });
    },
  });

  const activityEditor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc pl-6',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal pl-6',
          },
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
      Underline,
    ],
    content: activityForm.watch('activity_description') || '',
    onUpdate: ({ editor }: { editor: Editor }) => {
      activityForm.setValue('activity_description', editor.getHTML(), {
        shouldValidate: true,
      });
    },
  });

  // 1. Create a ref to store editor instances
  const [currentActivityId, setCurrentActivityId] = useState<string | null>(
    null,
  );
  const activityEditors = useRef<Record<string, Editor>>({});

  // 2. Function to get or create an editor for an activity
  const getActivityEditor = (activityId: string) => {
    if (!activityEditors.current[activityId]) {
      activityEditors.current[activityId] = new Editor({
        extensions: [
          StarterKit.configure({
            bulletList: {
              HTMLAttributes: {
                class: 'list-disc pl-6',
              },
            },
            orderedList: {
              HTMLAttributes: {
                class: 'list-decimal pl-6',
              },
            },
          }),
          Link.configure({
            openOnClick: false,
          }),
          Underline,
        ],
        content: activityForm.watch('activity_description') || '',
        onUpdate: ({ editor }: { editor: Editor }) => {
          activityForm.setValue('activity_description', editor.getHTML(), {
            shouldValidate: true,
          });
        },
      });
    }
    return activityEditors.current[activityId];
  };

  // 3. When adding a new activity
  const handleAddActivity = () => {
    activityForm.reset({
      activity_id: '',
      activity_title: '',
      activity_thumbnail_description: '',
      activity_description: '',
      activity_thumbnail_image: { image: '', name: '' },
      activity_thumbnail_url: '',
      activity_visiting_time: '',
      activity_address: '',
      activity_iconic_photos: [],
      activity_highlights: [],
    });
    const newActivityId = `activity-${Date.now()}`;
    setFormKey((prev) => prev + 1);
    setCurrentActivityId(newActivityId);
    // Create a new editor instance with empty content
    const newEditor = getActivityEditor(newActivityId);
    newEditor.commands.setContent(''); // Explicitly clear the editor content

    // Set the current step to activity
    setActivityAddState(true);
    setCurrentStep('activity');
  };

  const mapActivityToForm = (activity: Activity): ActivityFormData => {
    return {
      activity_id: activity.id,
      activity_title: activity.title || '',
      activity_thumbnail_description: activity.description_thumbnail || '',
      activity_description: activity.description || '',
      activity_thumbnail_image: {
        image: activity.primary_photo || '',
        name: activity.title || 'activity-image',
      },
      activity_thumbnail_url: activity.primary_photo || '',
      activity_visiting_time: activity.hours || '',
      activity_address: activity.address || '',
      activity_highlights: activity.highlights || [],
      activity_iconic_photos:
        (activity.photos || []).map((photo) => ({
          image: photo,
          name: activity.title || 'activity-image',
        })) || [],
      new_activity_iconic_photos: [],
    };
  };

  const handleEditActivity = (activity: Activity) => {
    try {
      console.log('Editing activity:', activity);
      const formData = mapActivityToForm(activity);
      console.log('Mapped form data:', formData);

      setActivityAddState(false);
      setCurrentActivityId(activity.id);

      // Reset the form with the activity data
      activityForm.reset(formData);

      // Navigate to the activity step first
      setCurrentStep('activity');

      // Use a timeout to ensure the editor is mounted
      setTimeout(() => {
        try {
          const editor = getActivityEditor(activity.id);
          if (editor && !editor.isDestroyed) {
            editor.commands.setContent(activity.description || '');
            activityForm.setValue(
              'activity_description',
              activity.description || '',
              {
                shouldValidate: true,
                shouldDirty: true,
              },
            );
          }
        } catch (error) {
          console.error('Error setting editor content:', error);
        }
      }, 100);
    } catch (error) {
      console.error('Error in handleEditActivity:', error);
      setCurrentStep('activity');
    }
  };

  const handleDeleteIconicPhoto = (index: number) => {
    // Get the ID before removing the item
    const deletedPhotoId = iconicPhotos[index]?.id;

    // Filter the arrays
    iconicPhotos = iconicPhotos.filter((_, i) => i !== index);
    iconicPhotoUrls = iconicPhotoUrls.filter((_, i) => i !== index);

    // Delete the experience details if we have a valid ID
    if (deletedPhotoId) {
      deleteExperienceDetails({ dd_id: deletedPhotoId });
    }
    refetchIconicPhotos();
  };

  const handleDeleteMorePhotos = (index: number) => {
    const updatedPhotos = [...activityForm.watch('activity_iconic_photos')];
    updatedPhotos.splice(index, 1);
    activityForm.setValue('activity_iconic_photos', updatedPhotos);
    if (currentActivityId) {
      updateActivity({
        id: currentActivityId,
        data: {
          photos: updatedPhotos,
        },
      });
    }
  };

  const TagsInput = ({
    value = [],
    onChange,
    maxTags = 10,
    label,
    error,
    classNames,
    ...props
  }: {
    value: string[];
    onChange: (value: string[]) => void;
    maxTags?: number;
    label?: string;
    error?: string;
    classNames?: {
      label?: string;
      input?: string;
      error?: string;
    };
    [key: string]: any;
  }) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: any) => {
      if (e.key === 'Enter' && inputValue.trim() && value.length < maxTags) {
        e.preventDefault();
        onChange([...value, inputValue.trim()]);
        setInputValue('');
      } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
        e.preventDefault();
        onChange(value.slice(0, -1));
      }
    };

    const removeTag = (indexToRemove: number) => {
      onChange(value.filter((_, index) => index !== indexToRemove));
    };

    return (
      <div className="space-y-2">
        <label className={classNames?.label || ''}>{label}</label>

        {/* Tags container */}
        <div className="flex flex-wrap gap-2 mb-2 mt-2">
          {value.map((tag, index) => (
            <div
              key={index}
              className="bg-orange-500 text-white text-sm font-medium px-4 py-2 mt-2 mb-2 rounded-full flex items-center hover:bg-orange-600 transition-colors"
            >
              {tag}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  removeTag(index);
                }}
                className="ml-2 text-white hover:text-gray-200 text-lg leading-none"
                aria-label="Remove tag"
              >
                &times;
              </button>
            </div>
          ))}
        </div>

        {/* Input field */}
        <TextInput
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            value.length < maxTags
              ? `Type and press Enter to add (${value.length}/${maxTags})`
              : 'Maximum tags reached'
          }
          disabled={value.length >= maxTags}
          classNames={{
            input: `${styles.inputField} mt-2`,
            error: 'text-red-500 text-xs mt-1',
          }}
          error={error}
          {...props}
        />

        {value.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            Press Enter to add, or click × to remove tags
          </p>
        )}
      </div>
    );
  };

  // Reset editor content when form changes
  useEffect(() => {
    if (activityEditor && activityForm) {
      const content = activityForm.getValues('activity_description') || '';
      if (activityEditor.getHTML() !== content) {
        activityEditor.commands.setContent(content);
      }
    }
  }, [activityForm, activityEditor]);

  // Step 1: Create placeholder experience (only on first activity)
  const createPlaceholderExperience = async (data: ExperienceFormData) => {
    if (!createdExperienceId) {
      // console.log('🎯 STEP 1: Creating placeholder experience...');
      console.log('📊 Experience data:', data);

      const mockExperienceId = `exp_${Date.now()}`;

      // console.log(
      //   '✅ Placeholder experience created with ID:',
      //   mockExperienceId,
      // );
      // console.log('🗄️ SQL would be:');
      // console.log(`INSERT INTO experiences (id, title, description, thumbnail_description, address, status)
      //                    VALUES ('${mockExperienceId}', '${data.experience_title}', '${data.experience_description}',
      //                           '${data.experience_thumbnail_description}', '${data.address}', 'draft')`);

      setCreatedExperienceId(mockExperienceId);
    }
    setCurrentStep('activity');
  };

  // Step 2: Add activity and return to experience
  const addActivityToExperience = async (data: ActivityFormData) => {
    console.log('🎯 STEP 2: Adding activity to experience...');
    console.log('📊 Activity data:', data);
    console.log('🔗 Experience ID:', createdExperienceId);

    const mockActivityId = `act_${Date.now()}`;
    const newActivity = {
      id: mockActivityId,
      experience_id: createdExperienceId,
      ...data,
    };

    console.log('✅ Activity created:', newActivity);
    // console.log('🗄️ SQL would be:');
    // console.log(`INSERT INTO activities (id, experience_id, title, description_thumbnail, description)
    //                  VALUES ('${mockActivityId}', '${createdExperienceId}', '${data.activity_title}',
    //                         '${data.activity_thumbnail_description}', '${data.activity_description}')`);

    // Reset the activity form state completely
    activityForm.reset({
      activity_title: '',
      activity_thumbnail_description: '',
      activity_description: '',
    });
    setCurrentStep('experience'); // Return to experience step
  };

  const uploadImageToSupabase = async (
    new_image: string,
  ): Promise<{ thumbnailUrl: string; image_id: string }> => {
    setIsSubmitting(true);
    let thumbnailUrl: string | null = null;
    try {
      const payload = {
        media: {
          mimeType: 'image/jpeg',
          body: new_image,
        },
        bucket_name: 'destination',
      };
      const { url } = await uploadImageCloudRun(payload).unwrap();
      thumbnailUrl = url;
    } catch (error) {
      console.error('Error uploading thumbnail image:', error);
    }

    if (!thumbnailUrl) {
      console.error('Error uploading thumbnail image');
      setIsSubmitting(false);
      return { thumbnailUrl: '', image_id: '' };
    }

    const mediaAssetResponse = await createMediaAsset({
      signedUrl: thumbnailUrl,
      mimeType: 'image',
      usage: 'thumbnail',
    }).unwrap();

    if (!mediaAssetResponse) {
      console.error('Error creating media asset');
      setIsSubmitting(false);
      return { thumbnailUrl, image_id: '' };
    }

    const image_id = mediaAssetResponse.data.id || '';
    setIsSubmitting(false);
    return { thumbnailUrl, image_id };
  };

  const uploadIconicPhotosToSupabase = async (
    new_images: string[],
  ): Promise<{ iconicPhotoUrl: string; iconicPhotoId: string }[]> => {
    setIsSubmitting(true);
    const result: { iconicPhotoUrl: string; iconicPhotoId: string }[] = [];
    const uploadedUrls = (
      await Promise.all(
        new_images.map(async (photo) => {
          try {
            const payload = {
              media: {
                mimeType: 'image/jpeg',
                body: photo,
              },
              bucket_name: 'destination',
            };
            const { url } = await uploadImageCloudRun(payload).unwrap();
            return url;
          } catch (error) {
            console.error('Error uploading iconic photo:', error);
            return null;
          }
        }),
      )
    ).filter((url) => url !== null) as string[];

    if (uploadedUrls.length === 0 && iconicPhotos.length > 0) {
      setIsSubmitting(false);
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
        result.push({ iconicPhotoUrl: imageUrl, iconicPhotoId: imageId });
      }
    }
    setIsSubmitting(false);
    return result;
  };

  // Publish final experience
  const publishExperience = async ({ status }: { status: string }) => {
    console.log('Before setIsSubmitting(true), isSubmitting:', isSubmitting);
    setIsSubmitting(true);
    console.log('After setIsSubmitting(true), isSubmitting:', isSubmitting); // This might still be false due to async nature

    try {
      // First validate the current experience form
      const isFormValid = await experienceForm.trigger();
      if (!isFormValid) {
        console.log('❌ Experience form has validation errors, cannot publish');
        console.log('Form errors:', experienceForm.formState.errors);
        console.log('Form values:', experienceForm.getValues());
        setIsSubmitting(false);
        notifications.show({
          title: 'Error',
          message: 'Experience form has validation errors, cannot publish',
          color: 'red',
          position: 'top-center',
        });
        return;
      }

      // Get the current form values (including any changes user made)
      const currentExperienceData = experienceForm.getValues();

      console.log('🚀 FINAL STEP: Publishing experience...');
      console.log('📊 Experience ID:', createdExperienceId);

      console.log('✅ Experience published with latest data!');
      console.log('📊 Final payload that would be sent to API:', {
        experience: {
          id: createdExperienceId,
          ...currentExperienceData,
          status: 'published',
        },
      });

      const { error: experienceError } = await updateExperience({
        id: currentExperienceData.experience_id!,
        data: {
          name: currentExperienceData.experience_title,
          description: currentExperienceData.experience_description,
          address: currentExperienceData.address || '',
          thumbnail_description:
            currentExperienceData.experience_thumbnail_description || '',
          primary_photo:
            currentExperienceData.experience_thumbnail_url ||
            currentExperienceData.experience_thumbnail_image.image ||
            '',
          status,
        },
      });

      const experienceId = currentExperienceData.experience_id;

      if (experienceId && currentExperienceData.new_iconic_photos.length > 0) {
        for (const photo of currentExperienceData.new_iconic_photos) {
          await createExperienceDetails({
            experience_id: experienceId,
            type: 'iconic_photos',
            name: 'placeholder name',
            text: 'placeholder text',
            media_id: photo.iconicPhotoId,
          }).unwrap();
        }
      }

      refetchExperienceFull();
      refetchIconicPhotos();

      if (experienceError) {
        console.error('Error creating experience:', experienceError);
        setIsSubmitting(false);
        notifications.show({
          title: 'Error',
          message: 'Experience form has validation errors, cannot publish',
          color: 'red',
          position: 'top-center',
        });
        return;
      }

      // Reset everything
      experienceForm.reset();
      activityForm.reset();
      setCreatedExperienceId(null);
      setCurrentStep('experience');
      onClose();
      setIsVisible(false);
    } catch (error) {
      console.error('Error publishing experience:', error);
      notifications.show({
        title: 'Error',
        message: 'Experience form has validation errors, cannot publish',
        color: 'red',
        position: 'top-center',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmActivity = async ({ status }: { status: string }) => {
    if (activityAddState) {
      const currentExperienceData = experienceForm.getValues();
      const activityData = activityForm.getValues();
      const newPhotos = activityData.new_activity_iconic_photos;
      await createActivity({
        experience_id: currentExperienceData.experience_id!,
        title: activityData.activity_title,
        address: activityData.activity_address || '',
        hours: activityData.activity_visiting_time || '',
        description: activityData.activity_description || '',
        description_thumbnail:
          activityData.activity_thumbnail_description || '',
        primary_photo:
          activityData.activity_thumbnail_url ||
          activityData.activity_thumbnail_image.image ||
          '',
        highlights: activityData.activity_highlights || [],
        photos: newPhotos?.map((photo) => photo.iconicPhotoUrl) || [],
      });
      activityForm.reset();
      refetchActivities();
      setCurrentStep('experience');
    } else {
      const activityData = activityForm.getValues();
      console.log(activityData);
      const activity_id = activityData.activity_id;
      const newPhotos = activityData.new_activity_iconic_photos;
      await updateActivity({
        id: activity_id,
        data: {
          title: activityData.activity_title,
          description: activityData.activity_description,
          description_thumbnail: activityData.activity_thumbnail_description,
          primary_photo:
            activityData.activity_thumbnail_url ||
            activityData.activity_thumbnail_image.image ||
            '',
          photos: [
            ...(activityData.activity_iconic_photos?.map(
              (photo) => photo.image,
            ) || []),
            ...(newPhotos?.map((photo) => photo.iconicPhotoUrl) || []),
          ],
          hours: activityData.activity_visiting_time,
          address: activityData.activity_address,
          highlights: activityData.activity_highlights || [],
          status,
        },
      });
      activityForm.reset();
      refetchActivities();
      setCurrentStep('experience');
    }
  };

  const handleCancel = () => {
    console.log('🚫 Cancel clicked');

    if (createdExperienceId) {
      console.log(
        '🗑️ Would delete placeholder experience:',
        createdExperienceId,
      );
      console.log('🗄️ SQL cleanup:');
      console.log(
        `DELETE FROM activities WHERE experience_id = '${createdExperienceId}'`,
      );
      console.log(
        `DELETE FROM experiences WHERE id = '${createdExperienceId}'`,
      );
    }

    // Reset everything
    experienceForm.reset();
    activityForm.reset();
    setCreatedExperienceId(null);
    setCurrentStep('experience');
    onClose();
    setIsVisible(false);
  };

  const goBackToExperience = () => {
    console.log('⬅️ Going back to experience form');
    setCurrentStep('experience');
  };

  // Experience form errors
  const expErrors = experienceForm.formState.errors;
  // const expIsValid = experienceForm.formState.isValid;

  // Activity form errors
  const actErrors = activityForm.formState.errors;

  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null; // Hide the component when closed

  return (
    <>
      {/* Overlay (non-blocking) */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40 pointer-events-none',
          // opened ? 'block' : 'hidden',
        )}
      />
      {/* Floating Card (scrolls with page) */}
      <div
        className={cn(
          'absolute top-5 left-0 right-0 mx-auto z-50 w-full max-w-4xl p-4',
          // opened ? 'block' : 'hidden',
        )}
      >
        <div className="bg-[#FCFCF9] rounded-lg shadow-xl p-6 w-full">
          {/* Header */}
          {currentStep === 'experience' ? (
            <div className="flex pb-6 items-start justify-between">
              <Title order={2} className={styles.formTitle}>
                Edit Experience
              </Title>
              <div className="flex gap-2">
                <Button
                  variant="filled"
                  color="gray"
                  onClick={handleCancel}
                  className={styles.buttonText}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  color="orange"
                  onClick={() => publishExperience({ status: 'deleted' })}
                  className={styles.buttonText}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Delete
                </Button>
                <Button
                  variant="outline"
                  color="orange"
                  onClick={() =>
                    publishExperience({
                      status:
                        currentStatus === 'active' ? 'inactive' : 'active',
                    })
                  }
                  className={styles.buttonText}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {currentStatus === 'active' ? 'Archive' : 'Activate'}
                </Button>
                <Button
                  color="orange"
                  onClick={() => publishExperience({ status: currentStatus })}
                  loading={isSubmitting}
                  className={styles.buttonText}
                  disabled={isSubmitting}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex pb-6 items-start justify-between">
              <Title order={2} className={styles.formTitle}>
                {activityAddState ? 'Add New Activity' : 'Edit Activity'}
              </Title>
              {activityAddState ? (
                <div className="flex gap-2">
                  <Button
                    variant="filled"
                    color="gray"
                    onClick={goBackToExperience}
                    className={styles.buttonText}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    color="orange"
                    // disabled={!actIsValid}
                    onClick={() => handleConfirmActivity({ status: 'active' })}
                    className={styles.buttonText}
                    disabled={isSubmitting}
                  >
                    Add to Experience
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="filled"
                    color="gray"
                    onClick={goBackToExperience}
                    className={styles.buttonText}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    color="orange"
                    onClick={() => handleConfirmActivity({ status: 'deleted' })}
                    className={styles.buttonText}
                    disabled={isSubmitting}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="outline"
                    color="orange"
                    onClick={() =>
                      handleConfirmActivity({
                        status:
                          currentActivityStatus === 'active'
                            ? 'inactive'
                            : 'active',
                      })
                    }
                    className={styles.buttonText}
                    disabled={isSubmitting}
                  >
                    {currentActivityStatus === 'active' ? 'Hide' : 'Show'}
                  </Button>
                  <Button
                    type="submit"
                    color="orange"
                    // disabled={!actIsValid}
                    onClick={() => handleConfirmActivity({ status: 'active' })}
                    className={styles.buttonText}
                    disabled={isSubmitting}
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          )}
          {currentStep === 'experience' ? (
            // STEP 1: Experience Form
            <form
              onSubmit={experienceForm.handleSubmit(
                createPlaceholderExperience,
              )}
            >
              {/* <div className="space-y-4"> */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <TextInput
                    label="Experience Title"
                    placeholder="Enter experience title"
                    required
                    {...experienceForm.register('experience_title')}
                    error={expErrors.experience_title?.message}
                    classNames={{
                      label: styles.formLabel,
                      input: styles.inputField,
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Select
                    label="City"
                    placeholder="Select a city"
                    required
                    data={CITIES}
                    value={currentAddress}
                    onChange={(value) => {
                      console.log('🏙️ City selected:', value);
                      setCurrentAddress(value || '');
                      experienceForm.setValue('address', value || '', {
                        shouldValidate: true,
                      });
                    }}
                    error={expErrors.address?.message}
                    classNames={{
                      label: styles.formLabel,
                      input: styles.inputField,
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Textarea
                    label="Short Description"
                    placeholder="Brief description for thumbnail"
                    required
                    minRows={4}
                    autosize
                    maxRows={7}
                    {...experienceForm.register(
                      'experience_thumbnail_description',
                    )}
                    error={expErrors.experience_thumbnail_description?.message}
                    classNames={{
                      label: styles.formLabel,
                      input: styles.inputField,
                    }}
                  />
                </div>
                <div className="space-y-3">
                  <InputWrapper
                    label="Thumbnail Image"
                    classNames={{
                      label: styles.formLabel,
                    }}
                    required
                  >
                    <div>
                      <ImageUploader
                        dropzoneClassName="h-[150px] flex flex-col items-center justify-center"
                        {...(experienceForm.watch(
                          'experience_thumbnail_image.image',
                        )
                          ? {
                              fetchImages: [
                                {
                                  image: experienceForm.watch(
                                    'experience_thumbnail_image.image',
                                  ),
                                  name:
                                    experienceForm.watch(
                                      'experience_thumbnail_image.name',
                                    ) || 'Thumbnail',
                                  isExisting: true,
                                },
                              ],
                            }
                          : {})}
                        onImageUpload={async (fileArray) => {
                          const file = fileArray[0];
                          if (file && file.image && file.name) {
                            experienceForm.setValue(
                              'experience_thumbnail_image',
                              {
                                image: file.image!,
                                name: file.name!,
                              },
                            );
                            const { thumbnailUrl } =
                              await uploadImageToSupabase(file.image);
                            experienceForm.setValue(
                              'experience_thumbnail_url',
                              thumbnailUrl,
                            );
                          } else {
                            experienceForm.setValue(
                              'experience_thumbnail_image',
                              {
                                image: '',
                                name: '',
                              },
                            );
                          }
                        }}
                        isStandalone={true}
                        allowMultiple={false}
                      />
                    </div>
                  </InputWrapper>
                  <Input
                    type="hidden"
                    {...experienceForm.register('experience_description')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="w-full h-px bg-black mt-4 mb-4"></div>
                <InputWrapper
                  label="About"
                  required
                  classNames={{
                    label: styles.formLabel,
                    error: 'text-red-500 text-xs mt-1',
                  }}
                >
                  <RichTextEditor
                    editor={experienceEditor}
                    variant="subtle"
                    classNames={{
                      content: 'min-h-[120px]',
                    }}
                  >
                    <RichTextEditor.Toolbar className={styles.toolbar}>
                      <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Bold />
                        <RichTextEditor.Italic />
                        <RichTextEditor.Underline />
                      </RichTextEditor.ControlsGroup>

                      <RichTextEditor.ControlsGroup>
                        <RichTextEditor.BulletList />
                        <RichTextEditor.OrderedList />
                      </RichTextEditor.ControlsGroup>

                      <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Link />
                        <RichTextEditor.Unlink />
                      </RichTextEditor.ControlsGroup>
                    </RichTextEditor.Toolbar>

                    <RichTextEditor.Content className={styles.editorContent} />
                  </RichTextEditor>
                </InputWrapper>

                {/* Current Activities Section */}
                <div className="w-full h-px bg-black mt-4 mb-4"></div>
                <div className="flex items-center justify-between">
                  <Text className={styles.formLabel}>
                    Activities ({activities.length})
                  </Text>
                </div>

                {/* Existing Activities */}
                {activitiesCurrent && activitiesCurrent.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {activitiesCurrent.map((activity) => (
                      <div
                        key={activity.id}
                        onClick={() => {
                          handleEditActivity(activity);
                          setCurrentStep('activity'); // Navigate to edit mode
                        }}
                        className="group relative rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="relative aspect-square">
                          <Image
                            src={activity.primary_photo}
                            alt={activity.title}
                            fill
                            className={`object-cover ${activity.status === 'inactive' ? 'opacity-50' : ''}`}
                          />
                          {/* Action Buttons */}
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              className="hover:bg-white transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditActivity(activity);
                                setCurrentActivityStatus(activity.status);
                                setCurrentStep('activity');
                              }}
                              title="Edit activity"
                            >
                              <img
                                src="/assets/edit.svg"
                                alt="Edit"
                                className="w-6 h-6"
                              />
                            </button>
                            <button
                              className="hover:bg-white transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Handle view photo
                                console.log(
                                  'Move activity around:',
                                  activity.primary_photo,
                                );
                              }}
                              title="Move activity around"
                            >
                              <img
                                src="/assets/drag_and_move.svg"
                                alt="Move activity around"
                                className="w-6 h-6"
                              />
                            </button>
                          </div>
                        </div>
                        <div className="p-2">
                          <h3
                            className="text-sm font-medium text-gray-900 line-clamp-2"
                            title={activity.title}
                          >
                            {activity.title}
                          </h3>
                          {activity.status === 'inactive' && (
                            <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded-full">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Activity Button */}
                <div className="flex flex-col items-center justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-orange-50 text-orange-500 mt-6"
                    // disabled={!expIsValid}
                    onClick={(e) => {
                      e.preventDefault(); // Prevent form submission
                      handleAddActivity(); // Create new activity
                      setCurrentStep('activity'); // Navigate to activity form
                    }}
                  >
                    Add an activity
                  </Button>
                </div>

                {/* Iconic Photos */}
                <div className="w-full h-px bg-black mt-4 mb-4"></div>
                <div className="space-y-3">
                  <InputWrapper
                    classNames={{
                      label: styles.formLabel,
                    }}
                  >
                    <IconicPhotoDisplay
                      photos={iconicPhotoUrls}
                      onDelete={(index) => handleDeleteIconicPhoto(index)}
                    />
                    <div className="mt-10">
                      <ImageUploader
                        dropzoneClassName="h-[200px] flex flex-col items-center justify-center"
                        onImageUpload={async (fileArray) => {
                          if (fileArray && fileArray.length > 0) {
                            const images = fileArray
                              .filter((file) => file && file.image && file.name)
                              .map((file) => file.image!);
                            const iconicPhotos =
                              await uploadIconicPhotosToSupabase(images);
                            experienceForm.setValue(
                              'new_iconic_photos',
                              iconicPhotos,
                            );
                          }
                        }}
                        isStandalone={true}
                        allowMultiple={true}
                        // withResize={true}
                      />
                    </div>
                  </InputWrapper>
                </div>
              </div>
            </form>
          ) : (
            // STEP 2: Activity Form (Clean, no current activities shown)
            <form
              key={`activity-form-${formKey}`}
              onSubmit={activityForm.handleSubmit(addActivityToExperience)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6 lg:col-span-1">
                  <div className="space-y-2">
                    <TextInput
                      label="Activity Title"
                      placeholder="Enter activity title"
                      required
                      {...activityForm.register('activity_title')}
                      error={actErrors.activity_title?.message}
                      classNames={{
                        label: styles.formLabel,
                        input: styles.inputField,
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Textarea
                      label="Short Description"
                      placeholder="Brief description for activity thumbnail"
                      required
                      autosize
                      minRows={4}
                      maxRows={5}
                      {...activityForm.register(
                        'activity_thumbnail_description',
                      )}
                      error={actErrors.activity_thumbnail_description?.message}
                      classNames={{
                        label: styles.formLabel,
                        input: styles.inputField,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <InputWrapper
                    label="Thumbnail Image"
                    classNames={{
                      label: styles.formLabel,
                    }}
                    required
                  >
                    <div>
                      <ImageUploader
                        dropzoneClassName="h-[150px] flex flex-col items-center justify-center"
                        {...(activityForm.watch(
                          'activity_thumbnail_image.image',
                        )
                          ? {
                              fetchImages: [
                                {
                                  image: activityForm.watch(
                                    'activity_thumbnail_image.image',
                                  ),
                                  name:
                                    activityForm.watch(
                                      'activity_thumbnail_image.name',
                                    ) || 'Thumbnail',
                                  isExisting: true,
                                },
                              ],
                            }
                          : {})}
                        onImageUpload={async (fileArray) => {
                          const file = fileArray[0];
                          if (file && file.image && file.name) {
                            activityForm.setValue('activity_thumbnail_image', {
                              image: file.image!,
                              name: file.name!,
                            });
                            const { thumbnailUrl } =
                              await uploadImageToSupabase(file.image);
                            activityForm.setValue(
                              'activity_thumbnail_url',
                              thumbnailUrl,
                            );
                          } else {
                            activityForm.setValue('activity_thumbnail_image', {
                              image: '',
                              name: '',
                            });
                          }
                        }}
                        isStandalone={true}
                        allowMultiple={false}
                      />
                    </div>
                  </InputWrapper>
                </div>
              </div>

              <div className="space-y-4">
                {/* Description with rich text editor */}
                <div className="w-full h-px bg-black mt-4 mb-4"></div>
                <InputWrapper
                  label="About"
                  required
                  classNames={{
                    label: styles.formLabel,
                    error: 'text-red-500 text-xs mt-1',
                  }}
                >
                  <RichTextEditor
                    editor={
                      currentActivityId
                        ? activityEditors.current[currentActivityId]
                        : null
                    }
                    variant="subtle"
                    classNames={{
                      content: 'min-h-[120px]',
                    }}
                  >
                    <RichTextEditor.Toolbar className={styles.toolbar}>
                      <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Bold />
                        <RichTextEditor.Italic />
                        <RichTextEditor.Underline />
                      </RichTextEditor.ControlsGroup>

                      <RichTextEditor.ControlsGroup>
                        <RichTextEditor.BulletList />
                        <RichTextEditor.OrderedList />
                      </RichTextEditor.ControlsGroup>

                      <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Link />
                        <RichTextEditor.Unlink />
                      </RichTextEditor.ControlsGroup>
                    </RichTextEditor.Toolbar>

                    <RichTextEditor.Content className={styles.editorContent} />
                  </RichTextEditor>
                </InputWrapper>
                <Input
                  type="hidden"
                  {...activityForm.register('activity_description')}
                />

                {/* Highlights Section */}
                <div className="w-full h-px bg-black mt-4 mb-4"></div>
                <div className="space-y-2">
                  <TagsInput
                    label="Highlights (3 - 10 tags)"
                    placeholder="Type and press Enter to add a tag"
                    value={activityForm.watch('activity_highlights') || []}
                    onChange={(tags) => {
                      activityForm.setValue('activity_highlights', tags, {
                        shouldValidate: true,
                      });
                    }}
                    maxTags={10}
                    classNames={{
                      label: styles.formLabel,
                      input: styles.inputField,
                      error: 'text-red-500 text-xs mt-1',
                    }}
                  />
                </div>

                {/* Address and Time same row */}
                <div className="w-full h-px bg-black mt-4 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <TextInput
                      label="Visiting Time"
                      placeholder="Enter visiting time"
                      required
                      {...activityForm.register('activity_visiting_time')}
                      error={
                        activityForm.formState.errors.activity_visiting_time
                          ?.message
                      }
                      classNames={{
                        label: styles.formLabel,
                        input: styles.inputField,
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <TextInput
                      label="Address"
                      placeholder="Enter address"
                      required
                      {...activityForm.register('activity_address')}
                      error={
                        activityForm.formState.errors.activity_address?.message
                      }
                      classNames={{
                        label: styles.formLabel,
                        input: styles.inputField,
                      }}
                    />
                  </div>
                </div>

                {/* More photos */}
                <div className="w-full h-px bg-black mt-4 mb-4"></div>
                <div className="space-y-3">
                  <InputWrapper
                    label="More Photos"
                    classNames={{
                      label: styles.formLabel,
                    }}
                  >
                    <IconicPhotoDisplay
                      photos={activityForm
                        .watch('activity_iconic_photos')
                        .map((photo) => photo.image)}
                      onDelete={(index) => handleDeleteMorePhotos(index)}
                    />
                    <div className="mt-10">
                      <ImageUploader
                        dropzoneClassName="h-[200px] flex flex-col items-center justify-center"
                        onImageUpload={async (fileArray) => {
                          if (fileArray && fileArray.length > 0) {
                            const images = fileArray
                              .filter((file) => file && file.image && file.name)
                              .map((file) => file.image!);
                            const iconicPhotos =
                              await uploadIconicPhotosToSupabase(images);
                            activityForm.setValue(
                              'new_activity_iconic_photos',
                              iconicPhotos,
                            );
                          }
                        }}
                        isStandalone={true}
                        allowMultiple={true}
                        // withResize={true}
                      />
                    </div>
                  </InputWrapper>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default EditExperienceCard;
