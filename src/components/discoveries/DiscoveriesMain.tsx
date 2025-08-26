'use client';

import { IconQrcode } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo, useState } from 'react';

import QRModal from '@/components/qr-code/qr-modal';
import DiscoveriesHeader from '@/components/sharing/DiscoveriesHeader';
import { Translation } from '@/components/translation';
import { useI18n } from '@/contexts/i18n-provider';
import { useSidebar } from '@/contexts/sidebar-provider';
import {
  Experience,
  useGetScopedExperiencesQuery,
} from '@/store/redux/slices/business/experience';
import { useGetAddressExperienceMapByCompanyIdQuery } from '@/store/redux/slices/user/experience';
import { cn } from '@/utils/class';

import EditExperienceCard from '../admin/EditCard';

export const firstAddressLanguageMap = {
  en: 'For you',
  vi: 'Dành cho bạn',
  ja: 'あなたにとって',
  ko: '당신에게',
  zh: '对您而言',
  fr: 'Pour vous',
  ru: 'Для вас',
};

const ADDRESS_LIST = [
  'For you',
  'Danang',
  'Hanoi',
  'Saigon',
  'Mekong Delta',
  'Phan Thiet',
];

const DiscoveriesMain: React.FC = () => {
  const { experiencesStatus } = useSidebar();
  const { currentLanguage } = useI18n();
  const searchParams = useSearchParams();

  // Initialize state with actual storage values to ensure consistent skip conditions
  const role = useMemo<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('role') || '';
    }
    return '';
  }, []);

  const companies = useMemo<any>(() => {
    if (typeof window !== 'undefined') {
      const companiesData = sessionStorage.getItem('companies');
      return companiesData ? JSON.parse(companiesData) : null;
    }
    return null;
  }, []);

  const companyId = useMemo<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('company_id') || null;
    }
    return null;
  }, []);

  const language = useMemo(() => {
    const language_code = sessionStorage.getItem('language') || '';
    return language_code.split('-')[0];
  }, [sessionStorage.getItem('language')]);

  const selectedAddress =
    searchParams.get('address') ||
    (role === 'business'
      ? 'All'
      : firstAddressLanguageMap[
          currentLanguage as keyof typeof firstAddressLanguageMap
        ]);
  const router = useRouter();
  const {
    data: addressMap,
    isLoading,
    error,
  } = useGetAddressExperienceMapByCompanyIdQuery(
    {
      companies: companies || [companyId],
      language,
    },
    {
      skip: !!role && role === 'business',
    },
  );

  const {
    data: scopedExperiences,
    isLoading: scopedExperiencesLoading,
    error: scopedExperiencesError,
  } = useGetScopedExperiencesQuery(undefined, {
    skip: (!!role && role !== 'business') || !role,
  });

  const [qrModal, setQrModal] = useState<{
    open: boolean;
    id: string;
    name: string;
  } | null>(null);

  const [showCard, setShowCard] = useState(false);
  const [experience, setExperience] = useState<Experience | null>(null);

  const experiences = useMemo(() => {
    let experiences: Experience[] = [];
    let finalMap: Record<string, Experience[]> = {};
    const localizedFirstSelection =
      firstAddressLanguageMap[
        currentLanguage as keyof typeof firstAddressLanguageMap
      ];
    if ((!!role && role !== 'business') || !role) {
      finalMap = addressMap || {};
    } else {
      const scopedExperiencesMap = scopedExperiences?.reduce(
        (acc, experience) => {
          if (!acc[experience.address || '']) {
            acc[experience.address || ''] = [];
          }
          if (experience.status === experiencesStatus) {
            acc[experience.address || ''].push(experience);
          }
          return acc;
        },
        {} as Record<string, Experience[]>,
      );
      finalMap = scopedExperiencesMap || {};
    }
    if (
      selectedAddress === localizedFirstSelection ||
      selectedAddress === 'All'
    ) {
      experiences = Object.values(finalMap || {}).flat();
    } else {
      experiences = finalMap?.[selectedAddress] || [];
    }
    return experiences;
  }, [
    addressMap,
    selectedAddress,
    scopedExperiences,
    experiencesStatus,
    role,
    currentLanguage,
  ]);

  const actualAddresses = useMemo(() => {
    let addresses: any[] = [];
    const localizedFirstSelection =
      firstAddressLanguageMap[
        currentLanguage as keyof typeof firstAddressLanguageMap
      ];
    if ((!!role && role !== 'business') || !role || role === '') {
      addresses = Object.keys(addressMap || {});
      const numAddresses = addresses.length;
      return numAddresses === ADDRESS_LIST.length - 1
        ? ADDRESS_LIST
        : [localizedFirstSelection, ...addresses];
    } else {
      addresses = Object.keys(
        scopedExperiences?.reduce(
          (acc, experience) => {
            if (
              !acc[experience.address || ''] &&
              experience.status === experiencesStatus
            ) {
              acc[experience.address || ''] = [];
            }
            if (experience.status === experiencesStatus) {
              acc[experience.address || ''].push(experience);
            }
            return acc;
          },
          {} as Record<string, Experience[]>,
        ) || {},
      );
      return ['All', ...addresses];
    }
  }, [addressMap, scopedExperiences, role, experiencesStatus, currentLanguage]);

  return (
    <Translation>
      {(t) => (
        <div className="h-full relative flex flex-col mb-20">
          <DiscoveriesHeader
            title={t('experiences.title')}
            subTitle={t('experiences.subtitle')}
            className="mb-3"
          />

          {/* Sticky filters */}
          {actualAddresses && actualAddresses.length > 0 && (
            <div className="sticky z-1 top-0 pb-3 bg-gray-50">
              <div className="pt-3 flex gap-3 flex-nowrap overflow-x-auto scrollbar-hide">
                {actualAddresses.map((filter) => (
                  <button
                    key={filter}
                    className={cn(
                      'px-4 py-2 rounded-full text-md font-medium transition-all border-2 cursor-pointer hover:shadow-sm whitespace-nowrap flex-shrink-0',
                      selectedAddress === filter
                        ? 'bg-orange-50 text-black border-orange-500'
                        : 'bg-orange-50 text-black border-transparent hover:bg-orange-100',
                    )}
                    onClick={(e) => {
                      e.preventDefault(); // Prevent default behavior if needed
                      const params = new URLSearchParams(
                        Array.from(searchParams.entries()),
                      );
                      params.set('address', filter);
                      router.push(`/discoveries?${params.toString()}`);
                    }}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Scrollable Content Area */}
          <div className="flex-1 py-3 overflow-y-auto bg-gray-50">
            {(isLoading || scopedExperiencesLoading) && (
              <div className="text-center py-8">{t('common.loading')}</div>
            )}
            {(error || scopedExperiencesError) && (
              <div className="text-red-500 text-center py-8">
                {t('experiences.error')}
              </div>
            )}
            <AnimatePresence mode="wait">
              {!isLoading &&
                !scopedExperiencesLoading &&
                !error &&
                !scopedExperiencesError && (
                  <motion.div
                    key={selectedAddress}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                  >
                    {experiences.length === 0 && (
                      <div className="text-gray-400 italic text-center py-20">
                        {t('experiences.noExperiencesFound')}
                      </div>
                    )}
                    {experiences.length > 0 && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {experiences.map((exp, idx) => (
                            <div
                              key={exp.id || idx}
                              className="border-[#E2E2E2] rounded-md overflow-hidden transition-shadow border relative group hover:shadow-lg"
                            >
                              {exp.id && (
                                <Link
                                  href={`/discoveries/${exp.id}`}
                                  aria-label={
                                    exp.name
                                      ? `View ${exp.name}`
                                      : 'View experience'
                                  }
                                  className="absolute inset-0 z-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                                >
                                  <span aria-hidden="true" />
                                </Link>
                              )}
                              <div className="aspect-[4/3] overflow-hidden relative">
                                <img
                                  src={exp.primary_photo || ''}
                                  alt={exp.name || ''}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                {role === 'business' && (
                                  <button
                                    className="absolute bottom-3 right-3 p-2 rounded-md cursor-pointer hover:bg-gray-100/50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowCard(true);
                                      setExperience(exp);
                                    }}
                                  >
                                    <img
                                      src="/assets/edit.svg"
                                      alt="Edit"
                                      className="w-10 h-10"
                                    />
                                  </button>
                                )}
                              </div>
                              <div className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-[#333333] text-base font-bold flex-1 break-words">
                                    {exp.name}
                                  </h3>
                                  {/* QR Icon Button */}
                                  <button
                                    className="ml-2 p-1 rounded text-gray-700 hover:text-orange-500 transition focus:outline-none relative z-3"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setQrModal({
                                        open: true,
                                        id: exp.id,
                                        name: exp.name || '',
                                      });
                                    }}
                                  >
                                    <IconQrcode className="w-5 h-5" />
                                  </button>
                                </div>
                                <p
                                  className="text-sm"
                                  style={{ color: '#333333' }}
                                >
                                  {exp.thumbnail_description ||
                                    exp.description ||
                                    ''}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
            </AnimatePresence>
            {/* QR Modal */}
            {qrModal && (
              <QRModal
                open={qrModal.open}
                onClose={() => setQrModal(null)}
                contentId={qrModal.id}
                displayText={qrModal.name}
              />
            )}
            {/* Edit Experience Card */}
            {showCard && experience && role === 'business' && (
              <EditExperienceCard
                opened={showCard}
                onClose={() => setShowCard(false)}
                experience={experience}
              />
            )}
          </div>
        </div>
      )}
    </Translation>
  );
};

export default DiscoveriesMain;
