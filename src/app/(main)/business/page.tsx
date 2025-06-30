'use client';

// clone from (main)/page.tsx, will need to merge the two files
import { Card } from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// import { string } from 'zod';

import FeatureCarousel from '@/components/feature-carousel';
import IconFeatureBackpack from '@/components/icons/icon-feature-backpack';
import IconFeatureCamera from '@/components/icons/icon-feature-camera';
import Section from '@/components/layouts/section';
import SectionHeader from '@/components/section-header';
import { CarouselSkeleton } from '@/components/skeletons/CarouselSkeleton';
import TweenCarousel from '@/components/tween-carousel';
import { useGetAllExperiencesBusinessQuery } from '@/store/redux/slices/business/experience';

// import { Experience } from '@/types/experience';

// const experiencesPH = Array.from({ length: 5 }).map((_, index) => ({
//   id: index.toString(),
//   title: `Experience ${index + 1}`,
//   description: `Description of experience ${index + 1}`,
//   imageUrl: `https://picsum.photos/60${index}`,
//   location: index % 2 ? 'Ha Noi' : 'Ho Chi Minh',
// })) satisfies Experience[];

export default function HomePage() {
  const router = useRouter();
  const [experiences, setExperiences] = useState<
    {
      id: string;
      title: string;
      description: string;
      imageUrl: string;
      location: string;
      status: string;
    }[]
  >([]);
  const [photos, setPhotos] = useState<{ title: string; imageUrl: string }[]>(
    [],
  );

  const { data: experiencesData } = useGetAllExperiencesBusinessQuery();

  useEffect(() => {
    if (experiencesData) {
      setExperiences(
        experiencesData.map((item) => ({
          id: item.id,
          title: item.name,
          description: item?.thumbnail_description || '',
          imageUrl: item.primary_photo,
          location: item.name,
          status: item.status || 'inactive',
        })),
      );

      try {
        setPhotos(
          experiencesData.map((item) => ({
            title: item.name,
            imageUrl: item.primary_photo,
          })),
        );
      } catch (error) {
        console.error('Error processing photos:', error);
        setPhotos([]);
      }
    } else {
      setExperiences([]);
      setPhotos([]);
    }
  }, [experiencesData]);

  return (
    <div className="pt-15 lg:pt-32 overflow-x-hidden">
      <Section>
        <div className="flex items-start gap-10">
          <SectionHeader
            title="Featured Experiences"
            icon={
              <IconFeatureBackpack className="size-8 lg:size-10 shrink-0" />
            }
            subtitle="Get ready for laughter, discovery, and unforgettable moments"
          />
          <button
            onClick={() => {
              router.replace(`/experiences/business/create`);
            }}
            className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded shadow hover:bg-gray-50 px-4 py-2"
            // Adjust the height as needed so it's slightly shorter than the SectionHeader
            style={{ height: '80%' }}
          >
            <span className="text-2xl font-bold">+</span>
            <span className="text-xs mt-1">Add a new experience</span>
          </button>
        </div>
        <FeatureCarousel
          items={[...experiences]
            // Sort experiences: active first, then inactive
            .sort((a, b) => {
              if (a.status === 'active' && b.status !== 'active') return -1;
              if (a.status !== 'active' && b.status === 'active') return 1;
              return 0;
            })}
          renderItem={(experience) => (
            <Card
              className={`flex flex-col gap-4 lg:gap-8 cursor-pointer ${
                experience.status === 'inactive' ? 'opacity-60' : ''
              }`}
              onClick={() =>
                router.push(`/experiences/${experience.id}/business/edit`)
              }
            >
              <div className="w-full aspect-square relative">
                <Image
                  fill
                  src={experience.imageUrl}
                  alt={experience.title}
                  className={`rounded-2xl object-center object-cover ${
                    experience.status === 'inactive' ? 'grayscale-[30%]' : ''
                  }`}
                />
                <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-white/90 rounded-lg p-2 pr-4 text-base-black font-medium text-sm lg:text-base leading-none">
                  <IconMapPin className="size-6" />
                  {experience.location}
                </div>
              </div>
              <div className="flex flex-col gap-2 lg:gap-4">
                <h3 className="text-display-xs lg:text-display-sm font-semibold text-base-black">
                  {experience.title}
                </h3>
                <p className="text-sm lg:text-md text-base-black/90">
                  {experience.description}
                </p>
                {/* Optional: Add status badge */}
                {experience.status === 'inactive' && (
                  <span className="text-xs text-red-500">Inactive</span>
                )}
              </div>
            </Card>
          )}
          className="mt-10 lg:mt-12"
          classNames={{
            controls: 'hidden lg:flex',
          }}
          slideSize={{
            base: 100,
            sm: 50,
            md: 33.33,
          }}
          slideGap={32}
          paginationType="count"
        />
      </Section>
      <Section className="mt-20 lg:mt-32">
        <SectionHeader
          className="items-center"
          classNames={{
            subtitle: 'text-center',
          }}
          icon={<IconFeatureCamera className="size-8 lg:size-10 shrink-0" />}
          title="Let's Go Photo"
          subtitle="Get ready for laughter, discovery, and unforgettable moments"
        />
        <div className="mt-10 lg:mt-16 py-10 lg:pt-[104px] lg:pb-[72px] bg-orange-50 rounded-4xl">
          <TweenCarousel
            items={photos}
            renderItem={(photo) => (
              <div className="w-full aspect-[16/10] max-h-[600px] relative rounded-2xl shadow-carousel overflow-clip">
                {photo.imageUrl ? (
                  <Image
                    fill
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="object-center object-cover"
                  />
                ) : (
                  <CarouselSkeleton className="w-full h-full" />
                )}
              </div>
            )}
            slideSize={{
              base: 80,
              sm: 60,
            }}
            tweenFactorBase={0.12}
            classNames={{
              controls: 'justify-center hidden lg:flex',
            }}
            slideGap={0}
            options={{
              loop: true,
            }}
          />
        </div>
      </Section>
    </div>
  );
}
