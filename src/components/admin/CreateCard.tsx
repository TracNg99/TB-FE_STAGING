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
import { Link, RichTextEditor } from '@mantine/tiptap';
import Underline from '@tiptap/extension-underline';
import { useEditor } from '@tiptap/react';
import { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import ImageUploader from '@/components/image-uploader/image-picker';
import { useCreateActivityMutation } from '@/store/redux/slices/business/activity';
import { useCreateExperienceMutation } from '@/store/redux/slices/business/experience';
import { useCreateExperienceDetailsMutation } from '@/store/redux/slices/business/experience';
import {
    useCreateMediaAssetMutation,
    useUploadImageCloudRunMutation,
} from '@/store/redux/slices/storage/upload';
import { Activity } from '@/store/redux/slices/user/experience';

import styles from './CreateCard.module.css';

interface CreateExperienceCardProps {
    opened: boolean;
    onClose: () => void;
}

// Experience schema (Step 1)
const experienceSchema = z.object({
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
    iconic_photos: z.array(
        z.object({
            image: z.string(),
            name: z.string(),
        }),
    ),
});

// Activity schema (Step 2)
const activitySchema = z.object({
    activity_title: z.string().min(1, 'Activity title is required'),
    activity_thumbnail_description: z
        .string()
        .min(1, 'Short description is required'),
    activity_description: z.string().min(1, 'Description is required'),
    activity_thumbnail_image: z.object({
        image: z.string(),
        name: z.string(),
    }),
    activity_visiting_time: z.string().min(1, 'Visiting time is required'),
    activity_address: z.string().min(1, 'Address is required'),
    activity_iconic_photos: z.array(
        z.object({
            image: z.string(),
            name: z.string(),
        }),
    ),
    activity_highlights: z.array(z.string()),
});

type ExperienceFormData = z.infer<typeof experienceSchema>;
type ActivityFormData = z.infer<typeof activitySchema>;

const CITIES = ['Danang', 'Hanoi', 'Saigon', 'Mekong Delta', 'Phan Thiet'];

const CreateExperienceCard: React.FC<CreateExperienceCardProps> = ({
    opened = false,
    onClose,
}) => {
    const [currentStep, setCurrentStep] = useState<'experience' | 'activity'>(
        'experience',
    );
    const [createdExperienceId, setCreatedExperienceId] = useState<string | null>(
        null,
    );
    const [activities, setActivities] = useState<any[]>([]);
    const [formKey, setFormKey] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [uploadImageCloudRun] = useUploadImageCloudRunMutation();
    const [createMediaAsset] = useCreateMediaAssetMutation();
    const [createExperience] = useCreateExperienceMutation();
    const [createExperienceDetails] = useCreateExperienceDetailsMutation();
    const [createActivity] = useCreateActivityMutation();

    console.log('Card opened:', opened);

    // Experience form (Step 1)
    const experienceForm = useForm<ExperienceFormData>({
        resolver: zodResolver(experienceSchema),
        mode: 'onChange',
        defaultValues: {
            experience_title: '',
            experience_description: '',
            experience_thumbnail_description: '',
            address: '',
            experience_thumbnail_image: {
                image: '',
                name: '',
            },
            iconic_photos: [],
        },
    });

    // Activity form (Step 2)
    const activityForm = useForm<ActivityFormData>({
        resolver: zodResolver(activitySchema),
        mode: 'onChange',
        defaultValues: {
            activity_title: '',
            activity_thumbnail_description: '',
            activity_description: '',
            activity_thumbnail_image: {
                image: '',
                name: '',
            },
            activity_visiting_time: '',
            activity_address: '',
            activity_iconic_photos: [],
            activity_highlights: [],
        },
    });

    // Add this effect to reset the activity form when navigating to it
    useEffect(() => {
        if (currentStep === 'activity') {
            activityForm.reset();
            setFormKey((prev) => prev + 1); // This will force a remount of the activity form
        }
    }, [currentStep]);

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
        onUpdate: ({ editor }) => {
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
        onUpdate: ({ editor }) => {
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
                onUpdate: ({ editor }) => {
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
        const newActivityId = `activity-${Date.now()}`;
        setCurrentActivityId(newActivityId);
        // Create editor for new activity
        getActivityEditor(newActivityId);
        // Rest of your add activity logic
    };

    // 4. When switching activities
    const handleSelectActivity = (activityId: string) => {
        const editor = activityEditors.current[activityId];
        if (editor) {
            // Update form with selected activity's content
            activityForm.setValue('activity_description', editor.getHTML());
        }
    };

    const handleEditActivity = (activity: Activity) => {
        setCurrentActivityId(activity.id);
        activityForm.reset();
        // Initialize editor if it doesn't exist
        if (!activityEditors.current[activity.id]) {
            getActivityEditor(activity.id);
        }
        activityForm.setValue('activity_description', activity.description);
    };

    useEffect(() => {
        console.log('Activity Editor State:', {
            currentActivityId,
            hasEditor: Boolean(
                currentActivityId && activityEditors.current[currentActivityId],
            ),
            editorContent: currentActivityId
                ? activityEditors.current[currentActivityId]?.getHTML()
                : 'No editor',
            allEditorIds: Object.keys(activityEditors.current),
        });
    }, [currentActivityId]); // Re-run when currentActivityId changes

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
            console.log('🎯 STEP 1: Creating placeholder experience...');
            console.log('📊 Experience data:', data);

            const mockExperienceId = `exp_${Date.now()}`;

            console.log(
                '✅ Placeholder experience created with ID:',
                mockExperienceId,
            );
            console.log('🗄️ SQL would be:');
            console.log(`INSERT INTO experiences (id, title, description, thumbnail_description, address, status) 
                         VALUES ('${mockExperienceId}', '${data.experience_title}', '${data.experience_description}', 
                                '${data.experience_thumbnail_description}', '${data.address}', 'draft')`);

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
        console.log('🗄️ SQL would be:');
        console.log(`INSERT INTO activities (id, experience_id, title, description_thumbnail, description) 
                     VALUES ('${mockActivityId}', '${createdExperienceId}', '${data.activity_title}', 
                            '${data.activity_thumbnail_description}', '${data.activity_description}')`);

        setActivities((prev) => [...prev, newActivity]);
        // Reset the activity form state completely
        activityForm.reset({
            activity_title: '',
            activity_thumbnail_description: '',
            activity_description: '',
        });
        setCurrentStep('experience'); // Return to experience step
    };

    useEffect(() => {
        console.log('isSubmitting changed to:', isSubmitting);
    }, [isSubmitting]);

    // Publish final experience
    const publishExperience = async () => {
        console.log('Before setIsSubmitting(true), isSubmitting:', isSubmitting);
        setIsSubmitting(true);
        console.log('After setIsSubmitting(true), isSubmitting:', isSubmitting); // This might still be false due to async nature

        try {
            // First validate the current experience form
            const isFormValid = await experienceForm.trigger();
            if (!isFormValid) {
                console.log('❌ Experience form has validation errors, cannot publish');
                setIsSubmitting(false);
                return;
            }

            // Get the current form values (including any changes user made)
            const currentExperienceData = experienceForm.getValues();

            console.log('🚀 FINAL STEP: Publishing experience...');
            console.log('📊 Experience ID:', createdExperienceId);
            console.log('📋 Updated experience data:', currentExperienceData);
            console.log('🎯 Total activities:', activities.length);
            console.log('📝 Activities:', activities);

            // Update the experience with current form values AND publish
            console.log('🗄️ SQL would update experience with latest data:');
            console.log(`UPDATE experiences SET 
                        title = '${currentExperienceData.experience_title}',
                        description = '${currentExperienceData.experience_description}',
                        thumbnail_description = '${currentExperienceData.experience_thumbnail_description}',
                        address = '${currentExperienceData.address}',
                        status = 'published',
                        updated_at = NOW()
                        WHERE id = '${createdExperienceId}'`);

            console.log('✅ Experience published with latest data!');
            console.log('📊 Final payload that would be sent to API:', {
                experience: {
                    id: createdExperienceId,
                    ...currentExperienceData,
                    status: 'published',
                },
                activities: activities,
            });

            let thumbnailUrl = '';
            let image_id = '';
            // Handle thumbnail image upload using the new pattern
            if (
                currentExperienceData.experience_thumbnail_image &&
                !(currentExperienceData.experience_thumbnail_image instanceof File)
            ) {
                try {
                    const payload = {
                        media: {
                            mimeType: 'image/jpeg',
                            body: currentExperienceData.experience_thumbnail_image.image,
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
            if (
                Array.isArray(currentExperienceData.iconic_photos) &&
                currentExperienceData.iconic_photos.length > 0
            ) {
                const uploadedUrls = (
                    await Promise.all(
                        currentExperienceData.iconic_photos.map(async (photo) => {
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
                                return null;
                            }
                        }),
                    )
                ).filter((url) => url !== null) as string[];

                if (
                    uploadedUrls.length === 0 &&
                    currentExperienceData.iconic_photos.length > 0
                ) {
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
                    name: currentExperienceData.experience_title,
                    description: currentExperienceData.experience_description,
                    address: currentExperienceData.address || '',
                    thumbnail_description:
                        currentExperienceData.experience_thumbnail_description || '',
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

            for (const activity of activities) {
                let thumbnailUrl = '';
                let image_id = '';
                if (
                    activity.activity_thumbnail_image &&
                    !(activity.activity_thumbnail_image instanceof File)
                ) {
                    const thumbnailResponse = await uploadImageCloudRun({
                        media: {
                            mimeType: 'image/jpeg',
                            body: activity.activity_thumbnail_image.image,
                        },
                        bucket_name: 'destination',
                    }).unwrap();
                    thumbnailUrl = thumbnailResponse.url || '';
                    const mediaAssetResponse = await createMediaAsset({
                        signedUrl: thumbnailUrl,
                        mimeType: 'image/jpeg',
                        usage: 'thumbnail',
                    }).unwrap();
                    image_id = mediaAssetResponse.data.id || '';
                }

                const { data: newActivityData } = await createActivity({
                    experience_id: experienceId!,
                    title: activity.activity_title,
                    address: activity.activity_address || '',
                    hours: activity.activity_hours || '',
                    description: activity.activity_description || '',
                    description_thumbnail: activity.activity_thumbnail_description || '',
                    primary_photo: thumbnailUrl,
                    primary_photo_id: image_id,
                    highlights: activity.activity_highlights || '',
                });

                console.log('New Activity', newActivityData);
            }

            // Reset everything
            experienceForm.reset();
            activityForm.reset();
            setActivities([]);
            setCreatedExperienceId(null);
            setCurrentStep('experience');
            onClose();
            setIsVisible(false);
        } catch (error) {
            console.error('Error publishing experience:', error);
        } finally {
            setIsSubmitting(false);
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
        setActivities([]);
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
    const expIsValid = experienceForm.formState.isValid;

    // Activity form errors
    const actErrors = activityForm.formState.errors;

    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null; // Hide the component when closed

    return (
        <>
            {/* Overlay (non-blocking) */}
            <div className="fixed inset-0 bg-black/50 z-40 pointer-events-none" />
            {/* Floating Card (scrolls with page) */}
            <div className="absolute top-5 left-0 right-0 mx-auto z-50 w-full max-w-4xl p-4">
                <div className="bg-[#FCFCF9] rounded-lg shadow-xl p-6 w-full">
                    {/* Header */}
                    {currentStep === 'experience' ? (
                        <div className="flex pb-6 items-start justify-between">
                            <Title order={2} className={styles.formTitle}>
                                Create an Experience
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
                                    onClick={() => console.log('Save as Draft')}
                                    className={styles.buttonText}
                                >
                                    Save as Draft
                                </Button>
                                <Button
                                    color="orange"
                                    onClick={publishExperience}
                                    disabled={activities.length === 0 || !expIsValid}
                                    loading={isSubmitting}
                                    className={styles.buttonText}
                                >
                                    Publish
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex pb-6 items-start justify-between">
                            <Title order={2} className={styles.formTitle}>
                                Create an Activity
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
                            </div>
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
                                        value={experienceForm.watch('address')}
                                        onChange={(value) => {
                                            console.log('🏙️ City selected:', value);
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
                                        <div
                                            className="
                                            [&_.mantine-Dropzone-root]:h-[200px] 
                                            [&_.mantine-Dropzone-root]:flex 
                                            [&_.mantine-Dropzone-root]:items-center 
                                            [&_.mantine-Dropzone-root]:justify-center
                                            [&_.image-display-container]:max-h-[180px]
                                        "
                                        >
                                            <ImageUploader
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
                                                onImageUpload={(fileArray) => {
                                                    const file = fileArray[0];
                                                    if (file && file.image && file.name) {
                                                        experienceForm.setValue(
                                                            'experience_thumbnail_image',
                                                            {
                                                                image: file.image!,
                                                                name: file.name!,
                                                            },
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
                                {activities && activities.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {activities.map((activity) => (
                                            <div
                                                key={activity.id}
                                                onClick={() => {
                                                    handleSelectActivity(activity.id);
                                                    handleEditActivity(activity);
                                                    setCurrentStep('activity'); // Navigate to edit mode
                                                }}
                                                className="group relative rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
                                            >
                                                <div className="relative aspect-square">
                                                    <Image
                                                        src={activity.activity_thumbnail_image.image}
                                                        alt={activity.activity_title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                    {/* Action Buttons */}
                                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            className="bg-white/90 p-1.5 rounded-md shadow-sm hover:bg-white transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // TODO: Handle edit
                                                                console.log('Edit:', activity.id);
                                                            }}
                                                            title="Edit activity"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-4 w-4 text-gray-700"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            className="bg-white/90 p-1.5 rounded-md shadow-sm hover:bg-white transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // TODO: Handle view photo
                                                                console.log(
                                                                    'View photo:',
                                                                    activity.activity_thumbnail_image.image,
                                                                );
                                                            }}
                                                            title="View photo"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-4 w-4 text-gray-700"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="p-2">
                                                    <h3
                                                        className="text-sm font-medium text-gray-900 line-clamp-2"
                                                        title={activity.activity_title}
                                                    >
                                                        {activity.activity_title}
                                                    </h3>
                                                    {activity.status === 'inactive' && (
                                                        <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
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
                                        type="submit"
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
                                        label="Iconic Photos"
                                        classNames={{
                                            label: styles.formLabel,
                                        }}
                                    >
                                        <div
                                            className="
                                        [&_.mantine-Dropzone-root]:h-[200px] 
                                        [&_.mantine-Dropzone-root]:flex 
                                        [&_.mantine-Dropzone-root]:items-center 
                                        [&_.mantine-Dropzone-root]:justify-center
                                        [&_.image-display-container]:max-h-[180px]
                                    "
                                        >
                                            <ImageUploader
                                                onImageUpload={(fileArray) => {
                                                    if (fileArray && fileArray.length > 0) {
                                                        const images = fileArray
                                                            .filter((file) => file && file.image && file.name)
                                                            .map((file) => ({
                                                                image: file.image!,
                                                                name: file.name!,
                                                            }));
                                                        console.log(
                                                            '🔍 Setting iconic_photos value:',
                                                            images,
                                                        );
                                                        experienceForm.setValue('iconic_photos', images);
                                                    } else {
                                                        console.log('🔍 Clearing iconic_photos value');
                                                        experienceForm.setValue('iconic_photos', []);
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
                                        <div
                                            className="
                                            [&_.mantine-Dropzone-root]:h-[200px] 
                                            [&_.mantine-Dropzone-root]:flex 
                                            [&_.mantine-Dropzone-root]:items-center 
                                            [&_.mantine-Dropzone-root]:justify-center
                                            [&_.image-display-container]:max-h-[180px]
                                        "
                                        >
                                            <ImageUploader
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
                                                onImageUpload={(fileArray) => {
                                                    const file = fileArray[0];
                                                    if (file && file.image && file.name) {
                                                        activityForm.setValue('activity_thumbnail_image', {
                                                            image: file.image!,
                                                            name: file.name!,
                                                        });
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
                                        label="Iconic Photos"
                                        classNames={{
                                            label: styles.formLabel,
                                        }}
                                    >
                                        <div
                                            className="
                                        [&_.mantine-Dropzone-root]:h-[200px] 
                                        [&_.mantine-Dropzone-root]:flex 
                                        [&_.mantine-Dropzone-root]:items-center 
                                        [&_.mantine-Dropzone-root]:justify-center
                                        [&_.image-display-container]:max-h-[180px]
                                    "
                                        >
                                            <ImageUploader
                                                onImageUpload={(fileArray) => {
                                                    if (fileArray && fileArray.length > 0) {
                                                        const images = fileArray
                                                            .filter((file) => file && file.image && file.name)
                                                            .map((file) => ({
                                                                image: file.image!,
                                                                name: file.name!,
                                                            }));
                                                        console.log(
                                                            '🔍 Setting iconic_photos value:',
                                                            images,
                                                        );
                                                        activityForm.setValue(
                                                            'activity_iconic_photos',
                                                            images,
                                                        );
                                                    } else {
                                                        console.log('🔍 Clearing iconic_photos value');
                                                        activityForm.setValue('activity_iconic_photos', []);
                                                    }
                                                }}
                                                isStandalone={true}
                                                allowMultiple={true}
                                            // withResize={true}
                                            />
                                        </div>
                                    </InputWrapper>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-between pt-4 border-t">
                                    <Button variant="outline" onClick={goBackToExperience}>
                                        ← Back to Experience
                                    </Button>

                                    <div className="flex space-x-3">
                                        <Button variant="outline" onClick={handleCancel}>
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            color="blue"
                                            // disabled={!actIsValid}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                // 1. Save current activity data
                                                const formData = activityForm.getValues();
                                                // 2. Add to activities list
                                                setActivities((prev) => [
                                                    ...prev,
                                                    {
                                                        id: currentActivityId!,
                                                        ...formData,
                                                    },
                                                ]);
                                                // 3. Reset form
                                                activityForm.reset();
                                                // 4. Go back to experience
                                                setCurrentStep('experience');
                                            }}
                                        >
                                            Add Activity
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
};

export default CreateExperienceCard;
