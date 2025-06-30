'use client';

import { Skeleton } from '@mantine/core';
import { IconArrowUpRight } from '@tabler/icons-react';
import { IconHelpCircle } from '@tabler/icons-react';
import Image from 'next/image';
import React, { useState } from 'react';
import { BsCheckLg } from 'react-icons/bs';
import { PiShareFat } from 'react-icons/pi';
import ReactMarkdown from 'react-markdown';

// import { useMediaQuery } from '@mantine/hooks';

import TextUnfolder from '@/components/chatbot/text-unfolding';
import FeatureCarousel from '@/components/feature-carousel';
import { cn } from '@/utils/class';

// import TextCarousel from '@/components/text-carousel';
import { MessagesProps, Source } from './types';

interface BuddyResponseProps {
  setInput: (input: string) => void;
  reasoning: string;
  displayText: string;
  messages: MessagesProps[];
  isLoading: boolean;
  isMobile?: boolean;
  ref: React.RefObject<HTMLDivElement | null>;
}

// Mock data for sources as the structure is not in MessagesProps
const mockSources: Source[] = [
  {
    id: 1,
    logo: 'https://www.google.com/s2/favicons?domain=vespaadventures.com&sz=256',
    name: 'Vespa Adventures',
    url: 'vespaadventures.com/tags',
    title: 'Saigon after Dark – Review of Vespa Adventures, Ho Chi Minh City',
    snippet:
      'What an incredible experience! This is a must for anyone visiting Saigon and was the highlight of our visit to Saigon. Thanks to our guide, Quy, for giving us such a brilliant tour. Driving in Saigon is extremely chaotic, but our Vespa dri...',
  },
  {
    id: 2,
    logo: 'https://www.google.com/s2/favicons?domain=vespaadventures.com&sz=256',
    name: 'Saigontourist',
    url: 'vespaadventures.com/tags',
    title: 'Saigon after Dark – Review of Vespa Adventures, Ho Chi Minh City',
    snippet:
      'What an incredible experience! This is a must for anyone visiting Saigon and was the highlight of our visit to Saigon. Thanks to our guide, Quy, for giving us such a brilliant tour. Driving in Saigon is extremely chaotic, but our Vespa dri...',
  },
  {
    id: 3,
    logo: 'https://www.google.com/s2/favicons?domain=vespaadventures.com&sz=256',
    name: 'Vietravel',
    url: 'vespaadventures.com/tags',
    title: 'Saigon after Dark – Review of Vespa Adventures, Ho Chi Minh City',
    snippet:
      'What an incredible experience! This is a must for anyone visiting Saigon and was the highlight of our visit to Saigon. Thanks to our guide, Quy, for giving us such a brilliant tour. Driving in Saigon is extremely chaotic, but our Vespa dri...',
  },
];

const mockImages = [
  'https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/story/1f763404-81be-4163-89d5-3f6e0dad45cc/df573be5-1fe9-4e11-b477-fb98cc7bc65a.octet-stream?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jOWIwY2JhZC1hOTc4LTRkNDgtODQyYi0yOWE1OWViY2ViYTYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdG9yeS8xZjc2MzQwNC04MWJlLTQxNjMtODlkNS0zZjZlMGRhZDQ1Y2MvZGY1NzNiZTUtMWZlOS00ZTExLWI0NzctZmI5OGNjN2JjNjVhLm9jdGV0LXN0cmVhbSIsImlhdCI6MTc1MDkzNTg2NSwiZXhwIjoyMDY2Mjk1ODY1fQ.gqLGY5-wE65Do8S8UhORnEonL-RdsfX3YOv6pdLDa3Y',
  'https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/story/1f763404-81be-4163-89d5-3f6e0dad45cc/df573be5-1fe9-4e11-b477-fb98cc7bc65a.octet-stream?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jOWIwY2JhZC1hOTc4LTRkNDgtODQyYi0yOWE1OWViY2ViYTYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdG9yeS8xZjc2MzQwNC04MWJlLTQxNjMtODlkNS0zZjZlMGRhZDQ1Y2MvZGY1NzNiZTUtMWZlOS00ZTExLWI0NzctZmI5OGNjN2JjNjVhLm9jdGV0LXN0cmVhbSIsImlhdCI6MTc1MDkzNTg2NSwiZXhwIjoyMDY2Mjk1ODY1fQ.gqLGY5-wE65Do8S8UhORnEonL-RdsfX3YOv6pdLDa3Y',
  'https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/story/1f763404-81be-4163-89d5-3f6e0dad45cc/df573be5-1fe9-4e11-b477-fb98cc7bc65a.octet-stream?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jOWIwY2JhZC1hOTc4LTRkNDgtODQyYi0yOWE1OWViY2ViYTYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdG9yeS8xZjc2MzQwNC04MWJlLTQxNjMtODlkNS0zZjZlMGRhZDQ1Y2MvZGY1NzNiZTUtMWZlOS00ZTExLWI0NzctZmI5OGNjN2JjNjVhLm9jdGV0LXN0cmVhbSIsImlhdCI6MTc1MDkzNTg2NSwiZXhwIjoyMDY2Mjk1ODY1fQ.gqLGY5-wE65Do8S8UhORnEonL-RdsfX3YOv6pdLDa3Y',
  'https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/story/1f763404-81be-4163-89d5-3f6e0dad45cc/df573be5-1fe9-4e11-b477-fb98cc7bc65a.octet-stream?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jOWIwY2JhZC1hOTc4LTRkNDgtODQyYi0yOWE1OWViY2ViYTYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdG9yeS8xZjc2MzQwNC04MWJlLTQxNjMtODlkNS0zZjZlMGRhZDQ1Y2MvZGY1NzNiZTUtMWZlOS00ZTExLWI0NzctZmI5OGNjN2JjNjVhLm9jdGV0LXN0cmVhbSIsImlhdCI6MTc1MDkzNTg2NSwiZXhwIjoyMDY2Mjk1ODY1fQ.gqLGY5-wE65Do8S8UhORnEonL-RdsfX3YOv6pdLDa3Y',
  'https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/story/1f763404-81be-4163-89d5-3f6e0dad45cc/df573be5-1fe9-4e11-b477-fb98cc7bc65a.octet-stream?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jOWIwY2JhZC1hOTc4LTRkNDgtODQyYi0yOWE1OWViY2ViYTYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdG9yeS8xZjc2MzQwNC04MWJlLTQxNjMtODlkNS0zZjZlMGRhZDQ1Y2MvZGY1NzNiZTUtMWZlOS00ZTExLWI0NzctZmI5OGNjN2JjNjVhLm9jdGV0LXN0cmVhbSIsImlhdCI6MTc1MDkzNTg2NSwiZXhwIjoyMDY2Mjk1ODY1fQ.gqLGY5-wE65Do8S8UhORnEonL-RdsfX3YOv6pdLDa3Y',
];

const mockSuggestions = [
  'Check-in spots in Da Nang',
  'Best-selling Vespa Adventures tours',
  'Boutique hotels in Da Nang',
  'Best-selling tours in Da Nang',
  'Best-selling tours in Hanoi',
];

const LoadingSkeletion = () => {
  return (
    <div className="w-full max-w-4xl mt-4 bg-[#FFF9F5] gap-4">
      <Skeleton width="100%" height={20} />
      <br />
      <Skeleton width="100%" height={20} />
      <br />
      <Skeleton width="100%" height={20} />
    </div>
  );
};

const BuddyResponse: React.FC<BuddyResponseProps> = ({
  setInput,
  messages,
  displayText,
  isLoading,
  reasoning,
  isMobile,
  ref,
}) => {
  const [activeTab, setActiveTab] = useState<'answer' | 'sources'>('answer');
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = () => {
    if (navigator.clipboard && typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
    }
  };

  return (
    <>
      {messages.map(
        (msg, i) =>
          msg.text && (
            <div key={i} className={`flex flex-col gap-2 w-full`} ref={ref}>
              <div
                className={`max-w-4xl p-2 sm:p-6 bg-[#FFF9F5] ${isMobile ? 'w-[80%]' : 'w-full'}`}
              >
                {msg.from === 'user' && (
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                    {msg.text}
                  </h1>
                )}

                {isLoading && (
                  <>
                    <LoadingSkeletion />
                    {reasoning && (
                      <TextUnfolder
                        text={reasoning}
                        className="text-gray-600 mt-2"
                      />
                    )}
                  </>
                )}
                {msg.from === 'bot' && (
                  <div
                    className={`text-wrap ${isMobile ? 'w-[70%]' : 'w-full'}`}
                  >
                    <div className={`flex border-b mb-4`}>
                      <button
                        onClick={() => setActiveTab('answer')}
                        className={cn(
                          'py-2 px-4 text-md',
                          activeTab === 'answer'
                            ? 'border-b-2 border-orange-500 text-orange-500'
                            : 'text-gray-500',
                        )}
                      >
                        Answer
                      </button>
                      <button
                        onClick={() => setActiveTab('sources')}
                        className={cn(
                          'py-2 px-4 text-md',
                          activeTab === 'sources'
                            ? 'border-b-2 border-orange-500 text-orange-500'
                            : 'text-gray-500',
                        )}
                      >
                        Sources (
                        {msg.sources?.length && msg.sources?.length > 0
                          ? msg.sources?.length
                          : mockSources.length}
                        )
                      </button>
                    </div>
                    {activeTab === 'answer' ? (
                      <div className="prose prose-lg w-full text-wrap">
                        {(msg.images && msg.images.length > 0) ||
                          (mockImages.length > 0 && (
                            <div className="mb-4">
                              <FeatureCarousel
                                items={
                                  msg.images && msg.images.length > 0
                                    ? msg.images
                                    : mockImages
                                }
                                renderItem={(item) => (
                                  <div className="w-[120px] h-[90px] relative">
                                    <Image
                                      src={item}
                                      alt="Response image"
                                      width={120}
                                      height={90}
                                      className="rounded-lg object-cover aspect-3/2 w-[120px] h-[90px]"
                                    />
                                  </div>
                                )}
                                className="flex flex-row overflow-hidden"
                                classNames={{
                                  controls: 'hidden lg:flex',
                                }}
                                slideSize={{
                                  base: 33.33,
                                  sm: 50,
                                  md: 25,
                                }}
                                slideGap={16}
                                paginationType="none"
                              />
                            </div>
                          ))}
                        <div className="prose prose-lg max-w-[100%] text-gray-700 text-wrap">
                          <ReactMarkdown>
                            {msg.from === 'bot' && i === messages.length - 1
                              ? displayText
                              : msg.text}
                          </ReactMarkdown>
                        </div>
                        <div className="mt-6">
                          <button
                            onClick={handleShare}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                          >
                            {isCopied ? (
                              <BsCheckLg size={20} color="green" />
                            ) : (
                              <PiShareFat size={20} />
                            )}
                            <span>
                              {isCopied ? 'Copied to clipboard' : 'Share'}
                            </span>
                          </button>
                        </div>
                        {(msg.suggestions && msg.suggestions.length > 0) ||
                          (mockSuggestions.length > 0 && (
                            <div className="mt-8">
                              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                                <IconHelpCircle
                                  size={24}
                                  className="text-orange-500"
                                />
                                Follow-up Questions
                              </h3>
                              <div className="border-t border-gray-200">
                                {(msg.suggestions && msg.suggestions.length > 0
                                  ? msg.suggestions
                                  : mockSuggestions
                                ).map((q, i) => (
                                  <button
                                    key={i}
                                    onClick={() => setInput(q)}
                                    className="w-full text-left flex justify-between items-center py-3 px-2 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                                  >
                                    <span className="text-gray-700">{q}</span>
                                    <IconArrowUpRight
                                      size={20}
                                      className="text-gray-400"
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div>
                        {(msg.sources && msg.sources.length > 0
                          ? msg.sources
                          : mockSources
                        )?.map((source) => (
                          <div key={source.id} className="mb-6">
                            <div className="flex items-center gap-3 mb-2">
                              <Image
                                src={source.logo}
                                alt={`${source.name} logo`}
                                width={24}
                                height={24}
                                className="rounded-full"
                              />
                              <div>
                                <p className="font-semibold text-gray-800">
                                  {source.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {source.url}
                                </p>
                              </div>
                            </div>
                            <a
                              href={`https://${source.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-lg font-semibold text-blue-600 hover:underline"
                            >
                              {source.title}
                            </a>
                            <p className="text-gray-600 mt-1">
                              {source.snippet}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ),
      )}
    </>
  );
};

export default BuddyResponse;
