'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// import FeatureGrid from '@/components/cards/feature-grid';
import FeatureCard from '@/components/cards/feature-card';
import FeatureCarousel from '@/components/feature-carousel';
import IconFeatureBackpack from '@/components/icons/icon-feature-backpack';
import IconFeatureCamera from '@/components/icons/icon-feature-camera';
import Section from '@/components/layouts/section';
import OAuthCallback from '@/components/oauth/callback';
import SectionHeader from '@/components/section-header';
import { CarouselSkeleton } from '@/components/skeletons/CarouselSkeleton';
import TweenCarousel from '@/components/tween-carousel';
import {
  useGetAllExperiencesPublicQuery,
  // useGetIconicPhotosPublicQuery
} from '@/store/redux/slices/user/experience';

// import BuddyUI from '@/components/chatbot/buddy-ui-ai';

export default function HomePage() {
  const router = useRouter();
  const hash = localStorage.getItem('hash');
  const [experiences, setExperiences] = useState<
    {
      id: string;
      title: string;
      description: string;
      imageUrl: string;
      location: string;
    }[]
  >([]);
  const [photos, setPhotos] = useState<{ title: string; imageUrl: string }[]>(
    [],
  );

  const { data: experiencesData } = useGetAllExperiencesPublicQuery();
  // const { data: photosData } = useGetIconicPhotosPublicQuery();

  useEffect(() => {
    if (experiencesData) {
      setExperiences(
        experiencesData.map((item) => ({
          id: item.id,
          title: item.name,
          description: item?.thumbnail_description || '',
          imageUrl: item.primary_photo,
          location: item.name,
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
      {hash ? (
        <OAuthCallback />
      ) : (
        <>
          <Section>
            <SectionHeader
              title="Featured Experiences"
              icon={
                <IconFeatureBackpack className="size-8 lg:size-10 shrink-0" />
              }
              subtitle="Get ready for laughter, discovery, and unforgettable moments"
            />
            <FeatureCarousel
              items={experiences}
              renderItem={(experience) => (
                <FeatureCard
                  item={experience}
                  handleCardClick={() =>
                    router.push(`/experiences/${experience.id}`)
                  }
                  handleQrIconClick={() =>
                    router.push(`/experiences/${experience.id}`)
                  }
                />
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
              icon={
                <IconFeatureCamera className="size-8 lg:size-10 shrink-0" />
              }
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
                skeletonCount={5}
              />
            </div>
          </Section>
          {/* <BuddyUI /> */}
        </>
      )}
    </div>
  );
}
