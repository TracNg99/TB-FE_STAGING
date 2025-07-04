'use client';

import { Skeleton } from '@mantine/core';
import { Button, TextInput } from '@mantine/core';
import { IconClock, IconPlus, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { IoMdSearch } from 'react-icons/io';

export interface ChatThreadProps {
  id: string;
  user_query: string;
  assistant_response: string;
  created_at: string;
  onClick?: (id: string) => void;
}

export const getDayDifferenceFromCurrent = (date: string) => {
  const createdAt = new Date(date);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - createdAt.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

function ChatThread({
  id,
  user_query,
  assistant_response,
  created_at,
  onClick,
}: ChatThreadProps) {
  return (
    <div
      onClick={() => onClick?.(id)}
      className="flex flex-col items-start gap-3 border-b border-gray-400 cursor-pointer pb-2 mb-4"
    >
      <p>{user_query}</p>
      <p className="text-gray-500">{`${assistant_response.slice(0, 80)}...`}</p>
      <div className="flex flex-row gap-2">
        <IconClock />{' '}
        {getDayDifferenceFromCurrent(created_at) > 1
          ? `${getDayDifferenceFromCurrent(created_at)} days ago`
          : `${getDayDifferenceFromCurrent(created_at)} day ago`}
      </div>
    </div>
  );
}

export default function ChatHistory({
  threads,
  isLoading,
}: {
  threads: ChatThreadProps[];
  isLoading: boolean;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredThreads, setFilteredThreads] = useState(threads);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const filtered = threads.filter(
      (thread) =>
        thread.user_query.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thread.assistant_response
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
    );
    setFilteredThreads(filtered);
  }, [searchQuery, threads]);

  const handleThreadClick = (id: string) => {
    router.push(`/?threadId=${id}`);
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex flex-row justify-between mb-10">
        <h2 className="text-2xl font-semibold">History</h2>
        <button
          className="flex flex-row items-center gap-2"
          onClick={() => setIsSearchOpen(!isSearchOpen)}
        >
          <IoMdSearch size={24} />
        </button>
      </div>

      {isSearchOpen && (
        <TextInput
          leftSection={
            <button onClick={() => setIsSearchOpen(false)}>
              <IconX size={16} color="black" />
            </button>
          }
          className="mb-10"
          placeholder="Search threads..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      )}

      <div className="flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-200px)]">
        {isLoading ? (
          <div className="flex flex-col gap-5">
            <Skeleton height={20} width="80%" />
            <Skeleton height={20} width="100%" />
            <Skeleton height={20} width="20%" />
            <Skeleton height={20} width="80%" />
            <Skeleton height={20} width="100%" />
            <Skeleton height={20} width="20%" />
            <Skeleton height={20} width="80%" />
            <Skeleton height={20} width="100%" />
            <Skeleton height={20} width="20%" />
          </div>
        ) : filteredThreads.length === 0 ? (
          <p className="text-center">You have no chat history yet</p>
        ) : (
          filteredThreads.map((thread) => (
            <ChatThread
              key={thread.id}
              id={thread.id}
              user_query={thread.user_query}
              assistant_response={thread.assistant_response}
              created_at={thread.created_at}
              onClick={handleThreadClick}
            />
          ))
        )}
      </div>
      <Button
        className={`
                    absolute right-[10vw] bottom-[10vh] 
                    rounded-[30%] bg-orange-500
                    size-[64px]
                    items-center
                    shadow-lg
                `}
        variant="contained"
        onClick={() => router.push('/')}
      >
        <IconPlus size={24} color="white" />
      </Button>
    </div>
  );
}
