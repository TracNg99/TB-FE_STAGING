import { User } from './user';

export type Story = {
  id: string;
  title: string;
  by?: User;
  location?: string;
  createdAt?: string;
  photos: string[];
  story: string;
};

export type StoryInputsProps = {
  index: number;
  texts: string | null;
  media: (string | null)[];
};
