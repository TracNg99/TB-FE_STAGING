import { User } from './user';

export type Experience = {
  id: string;
  created_by: string;
  name: string;
  primary_photo: string;
  photos: string[];
  address: string;
  status: string;
  created_at: string;
  updated_at: string;
  primary_keyword: string;
  url_slug: string;
  description: string;
  thumbnail_description: string;
  primary_video: string;
  parent_experience: string;
  primary_photo_id: string;
  photos_id: string[];
  primary_video_id: string;
  embedding: any;
  owned_by: string;
  is_deleted: boolean;
  // legacy/old fields for compatibility
  location: string;
  imageUrl: string;
};

export type PartialExperience = Partial<Experience>;

export type ExperienceDetail = Experience & {
  // attractions: Experience[];
  iconicPhotos: IconicPhoto[];
  userPhotos: CustomUserPhoto[];
};

export type ExperienceDetailHeaderProps = {
  id: string;
  name: string;
  status: string;
  description: string;
  thumbnail_description: string;
  location: string;
  imageUrl: string;
  checked?: boolean;
  onCheckIn?: () => void;
};

export type ExperienceIconicPhotosProps = {
  iconicPhotos: IconicPhoto[];
};

export type PhotosFromTravelersProps = {
  userPhotos: CustomUserPhoto[];
};

export type IconicPhoto = {
  id: string;
  title: string;
  content: { icon: React.FC<any>; text: string }[];
  imageUrl: string;
  caption: string;
};

export type UserPhoto = {
  id: string;
  imageUrl: string;
  by: User;
};

export type CustomUserPhoto = {
  id: string;
  imageUrl: string;
  by: {
    email?: string;
    id: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    rank: string;
  };
};
