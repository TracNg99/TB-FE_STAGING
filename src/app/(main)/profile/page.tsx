'use client';

import {
  Box,
  Button,
  Card,
  Container,
  Modal,
  Skeleton,
  Text,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconBrandInstagram,
  IconBrandSafari,
  IconEdit,
  IconPlus,
  IconSparkles,
  IconUserCircle,
} from '@tabler/icons-react';
import React, { useEffect, useRef, useState } from 'react';

import AccordionLists from '@/components/accordions/generic-accordion-list';
import { RowProps } from '@/components/cards/card-with-button';
import { SingleTextFieldProps } from '@/components/forms/generic-text-form';
import TextForm from '@/components/forms/generic-text-form';
import AvatarUploader from '@/components/image-uploader/avatar-picker';
import CardsList from '@/components/lists/card-listing';
import { useUploadImageMutation } from '@/store/redux/slices/storage/upload';
import {
  useCreateChannelMutation,
  useGetAllChannelsQuery,
  useUpdateChannelMutation,
} from '@/store/redux/slices/user/channel';
import {
  useGetProfileQuery,
  useUpdateAvatarMutation,
  useUpdateProfileMutation,
} from '@/store/redux/slices/user/profile';

const channelFieldsHeaderMap = [
  {
    name: 'name',
    label: 'Channel Title',
    placeholder: 'A joyful traveller',
    contents: '',
    rows: 1,
    required: true,
  },
  {
    name: 'url',
    label: 'Channel URL',
    placeholder: '',
    contents: '',
    rows: 1,
    required: true,
  },
  {
    name: 'brand_voice',
    label: 'Your Channel Prompt',
    placeholder: 'You are a traveler...',
    contents: '',
    rows: 7,
    required: true,
  },
];

const channelTypes = [
  {
    name: 'Travel Buddy',
    icon: (
      <IconBrandSafari
        className="text-orange-300 size-10"
        stroke={2}
        style={{
          transform: 'rotate(135deg)',
          fontSize: '100px',
        }}
      />
    ),
  },
  {
    name: 'Instagram',
    icon: (
      <IconBrandInstagram
        className="text-orange-300 size-10"
        stroke={2}
        style={{
          fontSize: '100px',
        }}
      />
    ),
  },
];

const defaultValues = {
  username: '',
  avatarUrl: '',
  createdAt: '',
};

const userInfo = {
  firstname: 'First name',
  lastname: 'Last name',
  email: 'Email',
  phone: 'Phone',
};

const ProfilePage = () => {
  const [uploadImage] = useUploadImageMutation();
  const [updateProfile] = useUpdateProfileMutation();
  const [uploadAvatar] = useUpdateAvatarMutation();
  const [createChannel] = useCreateChannelMutation();
  const [updateChannel] = useUpdateChannelMutation();

  const [isEditingName, setIsEdtingName] = useState<boolean>(false);
  const [channels, setChannels] = useState<RowProps[]>([]);
  const [isClicked, setIsClicked] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  // const theme = useMantineTheme();
  // const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const [profileValues, setProfileValues] = useState<{
    username: string;
    avatarUrl: string;
    createdAt: string;
  }>(defaultValues);

  const profileValuesRef = useRef<{
    username: string;
    avatarUrl: string;
    createdAt: string;
  }>(defaultValues);

  const personalInfoRef = useRef<SingleTextFieldProps[]>([]);

  const [personalInfo, setPersonalInfo] = useState<SingleTextFieldProps[]>([]);

  const { data: profile, isFetching: isFetchingProfile } = useGetProfileQuery();

  const { data: channelsData, isFetching: isFetchingChannels } =
    useGetAllChannelsQuery();

  useEffect(() => {
    if (profile && profile?.data) {
      const mapped = {
        username: profile.data.username,
        avatarUrl: profile.data.media_assets?.url,
        createdAt: profile.data.createdAt,
      };

      Object.entries(profile?.data).map(([key, value]) => {
        if (key in userInfo) {
          const displayName = (userInfo as any)[key];
          personalInfoRef.current = [
            ...personalInfoRef.current,
            {
              name: key,
              label: displayName,
              placeholder: `Your ${displayName.toLowerCase()}`,
              contents: value,
              required: false,
            },
          ];
          setPersonalInfo([...personalInfoRef.current]);
        }
      });

      Object.entries(mapped).map(([key, value]) => {
        if (key in defaultValues) {
          const storedValues = sessionStorage.getItem(key);
          const valueToSet =
            storedValues && storedValues !== '' ? storedValues : value;

          const newObj = {
            ...profileValuesRef.current,
            [key]: valueToSet,
          };

          profileValuesRef.current = newObj;

          setProfileValues({
            ...profileValuesRef.current,
            [key]: valueToSet,
          });
        }
      });
    }
  }, [profile]);

  useEffect(() => {
    if (channelsData?.data) {
      setChannels(
        channelsData?.data?.map((item, index) => ({
          id: item.id || '',
          name: `channel${index}`,
          label: item.name || '',
          type: item.channel_type || '',
          url: item.url || '',
          text: item.brand_voice || '',
          icon: channelTypes.find((e) => e.name === item.channel_type)?.icon,
          required: true,
        })),
      );
    }
  }, [channelsData]);

  const onUserNameEditClicked = async () => {
    setIsEdtingName(!isEditingName);
    if (isEditingName && profile?.data?.username !== profileValues.username) {
      const result = await updateProfile({
        username: profileValues.username,
      }).unwrap();

      if (result.data) {
        notifications.show({
          title: 'Success: Profile updated!',
          message: 'Profile updated successfully!',
          color: 'green',
        });
      } else {
        notifications.show({
          title: 'Error: Profile update unsuccesful!',
          message: 'Failed to update profile. Please try again.',
          color: 'red',
        });
      }
    }
  };

  const handleAvatarUpload = async (
    uploadedAvatar: { image: string | null; name: string | null }[],
  ) => {
    setProfileValues({
      ...profileValues,
      avatarUrl: uploadedAvatar?.[0]?.image || '',
    });

    sessionStorage.setItem('avatarUrl', uploadedAvatar?.[0]?.image || '');

    const imageResult = await uploadImage({
      imageBase64: uploadedAvatar?.[0]?.image || '',
      title: `avatar`,
      bucket: 'profile',
    });

    const result = await uploadAvatar({
      avatarUrl: imageResult?.data?.signedUrl,
    }).unwrap();

    if (result.data) {
      notifications.show({
        title: 'Success: Avatar updated!',
        message: 'Avatar updated successfully!',
        color: 'green',
      });
    } else {
      notifications.show({
        title: 'Error: Fail to update Avatar!',
        message: 'Failed to update avatar! Please try again!',
        color: 'red',
      });
    }
  };

  const handleInfoUpdate = async (data: { [x: string]: string }) => {
    console.log(data);
    const result = await updateProfile(data).unwrap();

    if (result.data) {
      notifications.show({
        title: 'Success: Profile updated!',
        message: 'Profile updated successfully!',
        color: 'green',
      });
    } else {
      notifications.show({
        title: 'Error: Profile update unsuccesful!',
        message: 'Failed to update profile! Please try again!',
        color: 'red',
      });
    }
  };

  const handleAddChannel = async (channelInfo: {
    name?: string;
    channel_type?: string;
    brand_voice?: string;
  }) => {
    console.log(channelInfo);
    setIsClicked(true);
    const result = await createChannel({
      payload: {
        ...channelInfo,
      },
    });

    if (result?.data) {
      notifications.show({
        title: 'Success: You have a new channel!',
        message: 'A new channel was successfully created!',
        color: 'green',
      });
      setIsClicked(false);
    } else {
      notifications.show({
        title: 'Error: Fail to create a new channel!',
        message: result?.error as string,
        color: 'red',
      });
      setIsClicked(false);
    }
  };

  const handleUpdateChannel = async (currentChannel: {
    id: string;
    text: string;
  }) => {
    setIsClicked(true);
    const result = await updateChannel({
      channelId: currentChannel.id,
      payload: { brand_voice: currentChannel.text },
    });

    if (result?.data) {
      notifications.show({
        title: 'Successful Brand Voice update!',
        message: 'Brand voice is updated!',
        color: 'green',
      });
    } else {
      notifications.show({
        title: 'Error: fail to update Brand Voice!',
        message: 'Brand voice was not updated! Please try again!',
        color: 'red',
      });
    }
    setIsClicked(false);
  };

  const AvatarSection = () => {
    return (
      <Box
        className={`flex flex-row 
                items-center justify-center 
                w-full 
                gap-3`}
      >
        {isFetchingProfile ? (
          <>
            <Skeleton height={70} circle visible={isFetchingProfile} />
            <Box className="flex flex-col">
              <Skeleton
                height={10}
                radius="xl"
                width="20%"
                visible={isFetchingProfile}
              />
              <Skeleton
                height={8}
                radius="xl"
                width="40%"
                visible={isFetchingProfile}
              />
            </Box>
          </>
        ) : (
          <>
            <AvatarUploader
              avatar={{
                image: profileValues.avatarUrl,
                name: profileValues.username,
              }}
              onImageUpload={handleAvatarUpload}
              // withResize
            />
            <Box className="flex flex-col">
              <Box className="flex flex-auto flex-row gap-1">
                {isEditingName ? (
                  <TextInput
                    className="font-bold"
                    defaultValue={profileValues.username}
                    onChange={(e) =>
                      setProfileValues({
                        ...profileValues,
                        username: e.currentTarget.value,
                      })
                    }
                  />
                ) : (
                  <Text className="font-bold">{profileValues.username}</Text>
                )}
                <Button
                  // variant="outline"
                  size="compact-md"
                  bg="white"
                  onClick={onUserNameEditClicked}
                >
                  <IconEdit size="15px" color="grey" />
                </Button>
              </Box>
              <Text>
                {'Joined on '}
                <time dateTime={profileValues.createdAt}>
                  {new Date(profileValues.createdAt).toLocaleDateString(
                    'en-US',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    },
                  )}
                </time>
              </Text>
            </Box>
          </>
        )}
      </Box>
    );
  };

  const ChannelSection = () => {
    return (
      <Card className="flex flex-col">
        <Box className="flex flex-row justify-between">
          <Text variant="h5" className="font-bold">
            Your Brand Voice channels
          </Text>
          <Button
            variant="outline"
            size="compact-md"
            leftSection={<IconPlus />}
            color="green"
            onClick={() => setOpenModal(true)}
          >
            Add Channel
          </Button>
        </Box>
        <CardsList
          tableData={channels}
          onRowSubmit={handleUpdateChannel}
          isButtonClicked={isClicked}
          subject="channel"
          modalTitle="Update your Brand voice"
          isFetching={isFetchingChannels}
          withButton
        />
        <Modal
          opened={openModal}
          onClose={() => setOpenModal(false)}
          size="xl"
          className="max-w-screen-xl"
          centered
        >
          <TextForm
            mainTitle="Create a new channel"
            storageVarName="channelData"
            collection={channelFieldsHeaderMap}
            selections={channelTypes}
            onSubmit={handleAddChannel}
            onCancel={() => setOpenModal(false)}
            isLoading={isClicked}
            buttonColor={'orange'}
          />
        </Modal>
      </Card>
    );
  };

  const sectionsList = [
    {
      label: 'Personal Information',
      icon: <IconUserCircle />,
      content: isFetchingProfile ? (
        <Box className="flex flex-col gap-4">
          <Skeleton
            height={10}
            radius="xl"
            width="20%"
            visible={isFetchingProfile}
          />
          <Skeleton
            height={10}
            radius="xl"
            width="40%"
            visible={isFetchingProfile}
          />
          <Skeleton
            height={10}
            radius="xl"
            width="20%"
            visible={isFetchingProfile}
          />
          <Skeleton
            height={10}
            radius="xl"
            width="40%"
            visible={isFetchingProfile}
          />
          <Skeleton
            height={10}
            radius="xl"
            width="20%"
            visible={isFetchingProfile}
          />
          <Skeleton
            height={10}
            radius="xl"
            width="40%"
            visible={isFetchingProfile}
          />
        </Box>
      ) : (
        <TextForm
          collection={personalInfo}
          onSubmit={handleInfoUpdate}
          onCancel={() => setOpenModal(false)}
          isLoading={isClicked}
          buttonText="Save"
          buttonColor={'orange'}
        />
      ),
    },
    {
      label: 'Channel Settings',
      icon: <IconSparkles />,
      content: <ChannelSection />,
    },
  ];

  return (
    <Container className="flex flex-col items-center w-full min-h-screen py-8 px-4 gap-3 sm:px-6 lg:px-8">
      <AvatarSection />
      <AccordionLists list={sectionsList} />
    </Container>
  );
};

export default ProfilePage;
