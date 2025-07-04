'use client';

import { IconQrcode } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

import QRModal from '@/components/qr-code/qr-modal';
import { Experience } from '@/store/redux/slices/business/experience';
import { useGetAddressExperienceMapQuery } from '@/store/redux/slices/user/experience';

const ADDRESS_LIST = [
  'For you',
  'Danang',
  'Hanoi',
  'Saigon',
  'Mekong Delta',
  'Phan Thiet',
];

const DiscoveriesMain: React.FC = () => {
  const searchParams = useSearchParams();
  const selectedAddress = searchParams.get('address') || 'For you';
  const router = useRouter();
  const {
    data: addressMap,
    isLoading,
    error,
  } = useGetAddressExperienceMapQuery();
  const [qrModal, setQrModal] = useState<{
    open: boolean;
    id: string;
    name: string;
  } | null>(null);

  let experiences: Experience[] = [];
  if (selectedAddress === 'For you') {
    experiences = Object.values(addressMap || {}).flat();
  } else {
    experiences = addressMap?.[selectedAddress] || [];
  }

  return (
    <div className="h-full flex flex-col mb-20">
      {/* Sticky Header and Chips */}
      <div className="sticky top-0 z-30 bg-gray-50 px-4 py-2 border-b border-gray-200">
        <h1 className="text-2xl font-bold my-2" style={{ color: '#333333' }}>
          Hop on one of our tour!
        </h1>
        <div className="flex gap-3 flex-nowrap overflow-x-auto scrollbar-hide">
          {ADDRESS_LIST.map((address) => (
            <button
              key={address}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-all border-2 cursor-pointer hover:shadow-sm whitespace-nowrap flex-shrink-0 ${
                selectedAddress === address
                  ? 'bg-orange-50 text-black border-orange-500'
                  : 'bg-orange-50 text-black border-transparent hover:bg-orange-100'
              }`}
              onClick={() => {
                const params = new URLSearchParams(
                  Array.from(searchParams.entries()),
                );
                params.set('address', address);
                router.push(`/discoveries?${params.toString()}`);
              }}
            >
              {address}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 py-3 overflow-y-auto bg-gray-50">
        {isLoading && <div className="text-center py-8">Loading...</div>}
        {error && (
          <div className="text-red-500 text-center py-8">
            Error loading experiences
          </div>
        )}
        <AnimatePresence mode="wait">
          {!isLoading && !error && (
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
                    className="rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border relative"
                    style={{ borderColor: '#E2E2E2' }}
                    onClick={() =>
                      experiences[0].id &&
                      router.push(`/discoveries/${experiences[0].id}`)
                    }
                  >
                    <div className="aspect-[16/7] overflow-hidden">
                      <img
                        src={experiences[0].primary_photo || ''}
                        alt={experiences[0].name || ''}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
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
                        className="text-sm leading-relaxed"
                        style={{ color: '#8D8D8D' }}
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
                        className="rounded-xl overflow-hidden cursor-pointer transition-shadow border relative"
                        style={{ borderColor: '#E2E2E2' }}
                        onClick={() =>
                          exp.id && router.push(`/discoveries/${exp.id}`)
                        }
                      >
                        <div className="aspect-[4/3] overflow-hidden">
                          <img
                            src={exp.primary_photo || ''}
                            alt={exp.name || ''}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
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
                          <p className="text-sm" style={{ color: '#8D8D8D' }}>
                            {exp.thumbnail_description || exp.description || ''}
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
      </div>
    </div>
  );
};

export default DiscoveriesMain;
