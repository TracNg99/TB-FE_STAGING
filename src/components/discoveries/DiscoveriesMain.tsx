'use client';

import { IconQrcode } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo, useState } from 'react';

import QRModal from '@/components/qr-code/qr-modal';
import StickyTitleChipsHeader from '@/components/sharing/StickyTitleChipsHeader';
import { useSidebar } from '@/contexts/sidebar-provider';
// import { useTranslation } from 'react-i18next';
import {
  Experience,
  useGetScopedExperiencesQuery,
} from '@/store/redux/slices/business/experience';
import { useGetAddressExperienceMapByCompanyIdQuery } from '@/store/redux/slices/user/experience';
import { cn } from '@/utils/class';

import EditExperienceCard from '../admin/EditCard';

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

  const selectedAddress =
    searchParams.get('address') || (role === 'business' ? 'All' : 'For you');
  const router = useRouter();
  const {
    data: addressMap,
    isLoading,
    error,
  } = useGetAddressExperienceMapByCompanyIdQuery(
    {
      companies: companies || [companyId],
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
    if (selectedAddress === 'For you' || selectedAddress === 'All') {
      experiences = Object.values(finalMap || {}).flat();
    } else {
      experiences = finalMap?.[selectedAddress] || [];
    }
    return experiences;
  }, [addressMap, selectedAddress, scopedExperiences, experiencesStatus, role]);

  const actualAddresses = useMemo(() => {
    let addresses: any[] = [];
    if ((!!role && role !== 'business') || !role || role === '') {
      addresses = Object.keys(addressMap || {});
      const numAddresses = addresses.length;
      return numAddresses === ADDRESS_LIST.length - 1
        ? ADDRESS_LIST
        : ['For you', ...addresses];
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
  }, [addressMap, scopedExperiences, role, experiencesStatus]);

  return (
    <div className="h-full relative flex flex-col mb-20">
      {/* Sticky Header and Chips */}
      <StickyTitleChipsHeader
        title="Hop on these cool adventures!"
        filters={actualAddresses}
        selected={selectedAddress}
        onSelect={(address) => {
          const params = new URLSearchParams(
            Array.from(searchParams.entries()),
          );
          params.set('address', address);
          router.push(`/discoveries?${params.toString()}`);
        }}
        className="sticky top-0"
      />

      {/* Scrollable Content Area */}
      <div className="flex-1 py-3 overflow-y-auto bg-gray-50">
        {(isLoading || scopedExperiencesLoading) && (
          <div className="text-center py-8">Loading...</div>
        )}
        {(error || scopedExperiencesError) && (
          <div className="text-red-500 text-center py-8">
            Error loading experiences
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
                    No experiences found for this address.
                  </div>
                )}
                {experiences.length > 0 && (
                  <div className="space-y-6">
                    {/* First (featured) card */}
                    <div
                      className={cn(
                        'rounded-md overflow-hidden transition-shadow border relative cursor-pointer hover:shadow-lg',
                      )}
                      style={{ borderColor: '#E2E2E2' }}
                      onClick={() =>
                        experiences[0].id &&
                        router.push(`/discoveries/${experiences[0].id}`)
                      }
                    >
                      <div className="aspect-[16/7] overflow-hidden relative">
                        <img
                          src={experiences[0].primary_photo || ''}
                          alt={experiences[0].name || ''}
                          className={cn(
                            'w-full h-full object-cover transition-transform duration-300 hover:scale-105',
                          )}
                        />
                        {role === 'business' && (
                          <button
                            className={cn(
                              'absolute bottom-3 right-3 p-2 rounded-md hover:bg-gray-100/50 cursor-pointer',
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowCard(true);
                              setExperience(experiences[0]);
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
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <h2
                            className="text-xl font-bold flex-1 break-words"
                            style={{ color: '#333333' }}
                          >
                            {experiences[0].name}
                          </h2>
                          {/* QR Icon Button (moved next to title) */}
                          <button
                            className="ml-2 p-1 rounded text-gray-700 hover:text-orange-500 transition focus:outline-none"
                            onClick={(e) => {
                              e.stopPropagation();
                              setQrModal({
                                open: true,
                                id: experiences[0].id,
                                name: experiences[0].name || '',
                              });
                            }}
                          >
                            <IconQrcode className="w-5 h-5" />
                          </button>
                        </div>
                        <p
                          className="text-md leading-relaxed"
                          style={{ color: '#333333' }}
                        >
                          {experiences[0].thumbnail_description ||
                            experiences[0].description ||
                            ''}
                        </p>
                      </div>
                    </div>

                    {/* Grid for the rest */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {experiences.slice(1).map((exp, idx) => (
                        <div
                          key={exp.id || idx}
                          className={cn(
                            'rounded-md overflow-hidden transition-shadow border relative cursor-pointer hover:shadow-lg',
                          )}
                          style={{ borderColor: '#E2E2E2' }}
                          onClick={() =>
                            exp.id && router.push(`/discoveries/${exp.id}`)
                          }
                        >
                          <div className="aspect-[4/3] overflow-hidden relative">
                            <img
                              src={exp.primary_photo || ''}
                              alt={exp.name || ''}
                              className={cn(
                                'w-full h-full object-cover transition-transform duration-300 hover:scale-105',
                              )}
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
                              <h3
                                className="text-base font-bold flex-1 break-words"
                                style={{ color: '#333333' }}
                              >
                                {exp.name}
                              </h3>
                              {/* QR Icon Button */}
                              <button
                                className="ml-2 p-1 rounded text-gray-700 hover:text-orange-500 transition focus:outline-none"
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
                            <p className="text-sm" style={{ color: '#333333' }}>
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
  );
};

export default DiscoveriesMain;
