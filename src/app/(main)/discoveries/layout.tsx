'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo, useState } from 'react';

import CreateExperienceCard from '@/components/admin/CreateCard';
import PageWrapper from '@/components/layouts/PageWrapper';
import SubSidebar from '@/components/layouts/SubSidebar';
import AdminDiscoverySidebar from '@/components/layouts/admin-discovery-bar';
import { useSidebar } from '@/contexts/sidebar-provider';
import {
  Experience,
  useGetScopedExperiencesQuery,
} from '@/store/redux/slices/business/experience';
import { useGetAddressExperienceMapByCompanyIdQuery } from '@/store/redux/slices/user/experience';
import { cn } from '@/utils/class';

const ADDRESS_LIST = [
  'For you',
  'Danang',
  'Hanoi',
  'Saigon',
  'Mekong Delta',
  'Phan Thiet',
];

const AddIcon: React.FC<{ className?: string; size?: number }> = ({
  className,
  size,
}) => (
  <Image
    src="/assets/add.svg"
    alt="Add"
    width={size || 300}
    height={size || 300}
    className={className}
    style={{
      color: 'white',
    }}
    unoptimized
  />
);

const titleStatusMap = {
  Active: 'active',
  Draft: 'internal',
  Archived: 'inactive',
};

export default function DiscoveriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = localStorage.getItem('role') || '';
  const [showCard, setShowCard] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedAddress = searchParams.get('address') || ADDRESS_LIST[0];
  const companies = sessionStorage.getItem('companies')
    ? JSON.parse(sessionStorage.getItem('companies') || '')
    : null;
  const companyId = sessionStorage.getItem('company_id') || '';

  const {
    isSidebarOpen,
    setIsSidebarOpen,
    setExperiencesStatus,
    experiencesStatus,
  } = useSidebar();
  const [isPinned, setIsPinned] = useState(false);

  const { data: addressMap } = useGetAddressExperienceMapByCompanyIdQuery(
    {
      companies: companies || [companyId],
    },
    {
      skip: !!role && role === 'business',
    },
  );

  const { data: scopedExperiences } = useGetScopedExperiencesQuery(undefined, {
    skip: !!role && role !== 'business' && role !== '',
  });

  const actualAddresses = useMemo(() => {
    let addresses: any[] = [];
    if ((!!role && role !== 'business') || !role || role === '') {
      addresses = Object.keys(addressMap || {});
      const numAddresses = addresses.length;
      return numAddresses === ADDRESS_LIST.length - 1
        ? ADDRESS_LIST
        : ['For you', ...addresses];
    } else {
      addresses = Object.entries(
        scopedExperiences?.reduce(
          (acc, experience) => {
            if (!acc[experience.address || '']) {
              acc[experience.address || ''] = [];
            }
            acc[experience.address || ''].push(experience);
            return acc;
          },
          {} as Record<string, Experience[]>,
        ) || {},
      );
      return addresses.map(([address, experiences]) => {
        return {
          address,
          experiences,
        };
      });
    }
  }, [addressMap, scopedExperiences, role]);

  const mapByStatus = useMemo(() => {
    const map = ['active', 'internal', 'inactive'].map((status) => {
      const allExp = actualAddresses
        .map(({ experiences }) =>
          experiences?.filter(
            (experience: Experience) => experience.status === status,
          ),
        )
        .flat();
      const matchingStatusExperiences = actualAddresses
        ?.map(({ address, experiences }) => {
          const matchedExperiences = experiences?.filter(
            (experience: Experience) => experience.status === status,
          );
          if (matchedExperiences?.length === 0) return;
          return {
            address,
            experiences: matchedExperiences,
          };
        })
        .filter((item) => item !== undefined);

      return {
        title:
          status === 'active'
            ? 'Active'
            : status === 'internal'
              ? 'Draft'
              : 'Archived',
        items: [
          {
            address: 'All',
            experiences: allExp,
          },
          ...matchingStatusExperiences,
        ],
      };
    });
    return role === 'business' ? map : [];
  }, [actualAddresses, role]);

  const handleSelect = (address: string) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('address', address);
    router.push(`/discoveries?${params.toString()}`);
  };

  const togglePin = () => {
    setIsPinned(!isPinned);
    if (!isPinned) {
      setIsSidebarOpen(true);
    }
  };

  const handleSelectWithStatus = (status: string, address: string) => {
    setExperiencesStatus(
      status === 'Active'
        ? 'active'
        : status === 'Draft'
          ? 'internal'
          : 'inactive',
    );
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('address', address);
    router.push(`/discoveries?${params.toString()}`);
  };

  return (
    <div className="flex flex-row h-full w-full bg-gray-50">
      {/* Collapsible Sub-sidebar for Discoveries (USER Role) */}
      {role !== 'business' && (
        <SubSidebar
          title="Discover"
          isSidebarOpen={isSidebarOpen}
          isPinned={isPinned}
          onSidebarLeave={() => {
            if (!isPinned) setIsSidebarOpen(false);
          }}
          onTogglePin={togglePin}
        >
          <ul className="px-0 pb-0 space-y-2">
            {actualAddresses.map((address) => (
              <li key={address}>
                <button
                  className={cn(
                    'w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors rounded-md',
                    selectedAddress === address && 'bg-[#FFEEE6] text-black',
                  )}
                  onClick={() => handleSelect(address)}
                >
                  {address}
                </button>
              </li>
            ))}
          </ul>
        </SubSidebar>
      )}

      {role === 'business' && (
        <AdminDiscoverySidebar
          contents={mapByStatus}
          renderItems={(title, item, index) => (
            <li key={String(index)}>
              <button
                className={cn(
                  'w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors rounded-md',
                  selectedAddress === item.address &&
                    experiencesStatus ===
                      titleStatusMap[title as keyof typeof titleStatusMap] &&
                    'bg-[#FFEEE6] text-black',
                )}
                onClick={() => handleSelectWithStatus(title, item.address)}
              >
                {item.address} ({item?.experiences?.length})
              </button>
            </li>
          )}
          isSidebarOpen={isSidebarOpen}
          isPinned={isPinned}
          onSidebarLeave={() => {
            if (!isPinned) setIsSidebarOpen(false);
          }}
          onTogglePin={togglePin}
          headerActions={
            role === 'business' ? (
              <button
                onClick={() => setShowCard(true)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                title="Add new address"
              >
                <AddIcon className="size-7" />
              </button>
            ) : null
          }
        />
      )}

      {/* Main Content Area with proper spacing */}
      <main className="flex-1 overflow-y-auto">
        <PageWrapper>
          {/* Render the card at the top when needed */}
          {showCard && (
            <div className="mb-6">
              <CreateExperienceCard
                onClose={() => setShowCard(false)}
                opened={showCard}
              />
            </div>
          )}
          {children}
        </PageWrapper>
      </main>
    </div>
  );
}
