import { Card } from '@mantine/core';
import { IconMapPin, IconQrcode } from '@tabler/icons-react';
import Image from 'next/image';

interface FeatureCardProps {
  item: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    location: string;
  };
  handleCardClick: (id: string) => void;
  handleQrIconClick: (
    event: React.MouseEvent<HTMLButtonElement>,
    id: any,
    title: any,
  ) => void;
}

const FeatureCard = ({
  item,
  handleCardClick,
  handleQrIconClick,
}: FeatureCardProps) => {
  return (
    <Card
      className="flex flex-col gap-4 lg:gap-8"
      onClick={() => handleCardClick(item.id)}
    >
      <div className="w-full aspect-square relative">
        <Image
          fill
          src={item.imageUrl}
          alt={item.title}
          className="rounded-2xl object-center object-cover"
        />
        <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-white/90 rounded-lg p-2 pr-4 text-base-black font-medium text-sm lg:text-base leading-none">
          <IconMapPin className="size-6" />
          {item.location}
        </div>
      </div>
      <div className="flex flex-col gap-2 lg:gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-display-xs lg:text-display-sm font-semibold text-base-black">
              {item.title}
            </h3>
            <p className="text-sm lg:text-md text-base-black/90 text-ellipsis">
              {item.description}
            </p>
          </div>
          <button
            onClick={(event) => handleQrIconClick(event, item.id, item.title)}
            className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"
          >
            <IconQrcode className="h-5 w-5 text-gray-600 z-50" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default FeatureCard;
