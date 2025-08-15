'use client';

import {
  Box,
  Button,
  Container,
  Skeleton,
  Text,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconLanguage, IconUserCircle } from '@tabler/icons-react';
import React, { useEffect, useRef, useState } from 'react';

import AccordionLists from '@/components/accordions/generic-accordion-list';
import { SingleTextFieldProps } from '@/components/forms/generic-text-form';
import TextForm from '@/components/forms/generic-text-form';
import AvatarUploader from '@/components/image-uploader/avatar-picker';
import { languageOptions } from '@/components/modals/WelcomeModal';
import Selector from '@/components/selector';
import { Translation } from '@/components/translation';
import { useI18n } from '@/contexts/i18n-provider';
import { useUploadImageMutation } from '@/store/redux/slices/storage/upload';
import {
  useGetProfileQuery,
  useUpdateAvatarMutation,
  useUpdateProfileMutation,
} from '@/store/redux/slices/user/profile';

const defaultValues = {
  username: '',
  avatarUrl: '',
  createdAt: '',
  language: 'en-US',
};

const userInfo = {
  firstname: 'First name',
  lastname: 'Last name',
  email: 'Email',
  phone: 'Phone',
};

const InfoSkeleton = () => (
  <Box className="flex flex-col gap-4">
    <Skeleton height={20} radius="xl" width="40%" />
    <Skeleton height={20} radius="xl" width="100%" />
    <Skeleton height={20} radius="xl" width="40%" />
    <Skeleton height={20} radius="xl" width="100%" />
  </Box>
);

const ProfilePage = () => {
  const { changeLanguage } = useI18n();
  const [uploadImage] = useUploadImageMutation();
  const [updateProfile] = useUpdateProfileMutation();
  const [uploadAvatar] = useUpdateAvatarMutation();

  const [isEditingName, setIsEdtingName] = useState<boolean>(false);
  const [isClicked, setIsClicked] = useState<boolean>(false);
  const [editingLabels, setEditingLabels] = useState<{ [key: string]: string }>(
    {},
  );
  const [sessionLanguage, setSessionLanguage] = useState<string>('en-US');

  const [profileValues, setProfileValues] = useState<{
    username: string;
    avatarUrl: string;
    createdAt: string;
    language: string;
  }>(defaultValues);

  const profileValuesRef = useRef<{
    username: string;
    avatarUrl: string;
    createdAt: string;
    language: string;
  }>(defaultValues);

  useEffect(() => {
    const language = sessionStorage.getItem('language');
    if (language) {
      setSessionLanguage(language);
    }
  }, []);

  const localizedLanguageChangeMessage = [
    {
      lang: 'en-US',
      success: {
        title: 'Success: Profile updated!',
        message:
          'Language updated successfully! \nThis changes only affect the narrator audio playback on each Experience page in the Discover feature.',
      },
      error: {
        title: 'Error: Profile update unsuccesful!',
        message:
          'Failed to update language! \nFallback to English! \nPlease try again!',
      },
    },
    {
      lang: 'vi-VN',
      success: {
        title: 'Thành công: Cập nhật thông tin!',
        message:
          'Ngôn ngữ đã được cập nhật thành công! \nNhững thay đổi này chỉ ảnh hưởng đến giọng đọc trong mỗi trang Experience trong tính năng Discover.',
      },
      error: {
        title: 'Lỗi: Cập nhật thông tin thất bại!',
        message:
          'Thất bại khi cập nhật ngôn ngữ! \nTrở về ngôn ngữ mặc định! \nVui lòng thử lại!',
      },
    },
    {
      lang: 'fr-FR',
      success: {
        title: 'Succès: Mise à jour du profil!',
        message:
          'Cette modification affecte uniquement la lecture audio du narrateur sur chaque page d&apos;expérience dans la fonctionnalité Découvrir.',
      },
      error: {
        title: 'Erreur: Mise à jour du profil echouée!',
        message:
          'Échec de la mise à jour de la langue! Retour à l&apos;anglais! Veuillez réessayer!',
      },
    },
    {
      lang: 'ja-JP',
      success: {
        title: '成功: プロフィールを更新しました!',
        message:
          '言語が正常に更新されました! \nこの変更は、Discover 機能の各エクスペリエンス ページでのナレーターのオーディオ再生にのみ影響します。',
      },
      error: {
        title: '失敗: プロフィールの更新に失敗しました!',
        message:
          '言語の更新に失敗しました! \n英語に戻ります! \nお試しください!',
      },
    },
    {
      lang: 'ko-KR',
      success: {
        title: '성공: 프로필을 업데이트했습니다!',
        message:
          '언어가 정상적으로 업데이트되었습니다! 이 변경 사항은 Discover 기능의 각 Experience 페이지에서 내레이터 오디오 재생에만 영향을 미칩니다.',
      },
      error: {
        title: '오류: 프로필 업데이트 실패!',
        message: '언어 업데이트 실패! 영어로 돌아갑니다! 다시 시도해주세요!',
      },
    },
    {
      lang: 'zh-CN',
      success: {
        title: '成功: 更新个人资料!',
        message:
          '语言已成功更新! \n此更改仅影响“发现”功能中每个体验页面上的叙述者音频播放。',
      },
      error: {
        title: '失败: 更新个人资料失败!',
        message: '语言更新失败! 语言将回退到英语! 请再试一次!',
      },
    },
    {
      lang: 'ru-RU',
      success: {
        title: 'Успех: Обновление профиля!',
        message:
          'Язык успешно обновлен! \nЭти изменения касаются только воспроизведения звука диктора на каждой странице «Впечатления» в функции «Обзор».',
      },
      error: {
        title: 'Ошибка: Не удалось обновить профиль!',
        message:
          'Не удалось обновить язык! Язык будет возвращен к английскому! Попробуйте снова!',
      },
    },
  ];

  const personalInfoRef = useRef<SingleTextFieldProps[]>([]);

  const [personalInfo, setPersonalInfo] = useState<SingleTextFieldProps[]>([]);

  const { data: profile, isFetching: isFetchingProfile } = useGetProfileQuery();

  useEffect(() => {
    if (profile && profile?.data) {
      const mapped = {
        username: profile.data.username,
        avatarUrl: profile.data.media_assets?.url,
        createdAt: profile.data.createdAt,
        language: profile.data.language,
      };

      Object.entries(profile?.data).map(([key, value]) => {
        if (
          key in userInfo &&
          !personalInfoRef.current.find((item) => item.name === key)
        ) {
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
          position: 'top-center',
        });
      } else {
        notifications.show({
          title: 'Error: Profile update unsuccesful!',
          message: 'Failed to update profile. Please try again.',
          color: 'red',
          position: 'top-center',
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
        position: 'top-center',
      });
    } else {
      notifications.show({
        title: 'Error: Fail to update Avatar!',
        message: 'Failed to update avatar! Please try again!',
        color: 'red',
        position: 'top-center',
      });
    }
  };

  const handleLanguageChange = async (language: string) => {
    setProfileValues({
      ...profileValues,
      language,
    });
    changeLanguage(language.split('-')[0]);
    sessionStorage.setItem('language', language);
    try {
      const result = await updateProfile({
        language,
      }).unwrap();

      const localizedNotification = localizedLanguageChangeMessage.find(
        (item) => item.lang === language,
      );

      if (result.data) {
        console.log('Language updated successfully!');
        const successNoti = localizedNotification?.success || {
          title: 'Success: Language updated!',
          message: 'Language updated successfully!',
        };
        notifications.show({
          ...successNoti,
          color: 'green',
          position: 'top-center',
          className: 'whitespace-pre-line',
        });
      } else {
        console.error('Failed to update language! Please try again!');
        const errorNoti = localizedNotification?.error || {
          title: 'Error: Language update unsuccesful!',
          message: 'Failed to update language! Please try again!',
        };
        notifications.show({
          ...errorNoti,
          color: 'red',
          position: 'top-center',
          className: 'whitespace-pre-line',
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleInfoUpdate = async (data: { [x: string]: string }) => {
    setIsClicked(true);
    const result = await updateProfile(data).unwrap();

    if (result.data) {
      notifications.show({
        title: 'Success: Profile updated!',
        message: 'Profile updated successfully!',
        color: 'green',
        position: 'top-center',
      });
    } else {
      notifications.show({
        title: 'Error: Profile update unsuccesful!',
        message: 'Failed to update profile! Please try again!',
        color: 'red',
        position: 'top-center',
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
              <Translation>
                {(t) => (
                  <Text>
                    {t('profile.joinedOn')}
                    <time dateTime={profileValues.createdAt}>
                      {new Date(profileValues.createdAt).toLocaleDateString(
                        sessionLanguage,
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        },
                      )}
                    </time>
                  </Text>
                )}
              </Translation>
            </Box>
          </>
        )}
      </Box>
    );
  };

  const sectionsList = [
    {
      label: editingLabels.language,
      icon: <IconLanguage />,
      content: isFetchingProfile ? (
        <InfoSkeleton />
      ) : (
        <Selector
          options={languageOptions.map((option) => ({
            value: option.value,
            label: option.label,
            icon: option.flag,
          }))}
          value={profileValues.language}
          onChange={handleLanguageChange}
        />
      ),
    },
    {
      label: editingLabels.personalInformation,
      icon: <IconUserCircle />,
      content: isFetchingProfile ? (
        <InfoSkeleton />
      ) : (
        <TextForm
          collection={personalInfo}
          onSubmit={handleInfoUpdate}
          isLoading={isClicked}
          buttonText="Save"
          buttonColor={'orange'}
        />
      ),
    },
  ];

  return (
    <Container className="flex flex-col items-center w-full min-h-screen py-8 px-4 mb-10 gap-3 sm:px-6 lg:px-8">
      <AvatarSection />
      <Translation>
        {(t) => {
          setEditingLabels({
            language: t('common.language'),
            personalInformation: t('profile.personalInformation'),
          });
          return <AccordionLists list={sectionsList} />;
        }}
      </Translation>
    </Container>
  );
};

export default ProfilePage;
