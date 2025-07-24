'use client';

import { ScrollArea, Skeleton } from '@mantine/core';
import { IconArrowUpRight, IconCopy } from '@tabler/icons-react';
import Image from 'next/image';
import React, { useCallback, useState } from 'react';
import { BsCheckLg } from 'react-icons/bs';
import { IoHelpCircle as IconHelpCircle } from 'react-icons/io5';
import { PiShareFat } from 'react-icons/pi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// import { useMediaQuery } from '@mantine/hooks';

// import TextUnfolder from '@/components/chatbot/text-unfolding';
import FeatureCarousel from '@/components/feature-carousel';
import { cn } from '@/utils/class';

// import TextCarousel from '@/components/text-carousel';
import { MessagesProps } from './types';

interface BuddyResponseProps {
  setInput: (input: string) => void;
  reasoning: string;
  displayText: string;
  messages: MessagesProps[];
  threadId: string;
  isLoading: boolean;
  isMobile?: boolean;
  ref?: React.RefObject<HTMLDivElement | null>;
}

const mockImages: string[] = [];
//   'https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/story/1f763404-81be-4163-89d5-3f6e0dad45cc/df573be5-1fe9-4e11-b477-fb98cc7bc65a.octet-stream?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jOWIwY2JhZC1hOTc4LTRkNDgtODQyYi0yOWE1OWViY2ViYTYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdG9yeS8xZjc2MzQwNC04MWJlLTQxNjMtODlkNS0zZjZlMGRhZDQ1Y2MvZGY1NzNiZTUtMWZlOS00ZTExLWI0NzctZmI5OGNjN2JjNjVhLm9jdGV0LXN0cmVhbSIsImlhdCI6MTc1MDkzNTg2NSwiZXhwIjoyMDY2Mjk1ODY1fQ.gqLGY5-wE65Do8S8UhORnEonL-RdsfX3YOv6pdLDa3Y',
//   'https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/story/1f763404-81be-4163-89d5-3f6e0dad45cc/df573be5-1fe9-4e11-b477-fb98cc7bc65a.octet-stream?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jOWIwY2JhZC1hOTc4LTRkNDgtODQyYi0yOWE1OWViY2ViYTYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdG9yeS8xZjc2MzQwNC04MWJlLTQxNjMtODlkNS0zZjZlMGRhZDQ1Y2MvZGY1NzNiZTUtMWZlOS00ZTExLWI0NzctZmI5OGNjN2JjNjVhLm9jdGV0LXN0cmVhbSIsImlhdCI6MTc1MDkzNTg2NSwiZXhwIjoyMDY2Mjk1ODY1fQ.gqLGY5-wE65Do8S8UhORnEonL-RdsfX3YOv6pdLDa3Y',
//   'https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/story/1f763404-81be-4163-89d5-3f6e0dad45cc/df573be5-1fe9-4e11-b477-fb98cc7bc65a.octet-stream?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jOWIwY2JhZC1hOTc4LTRkNDgtODQyYi0yOWE1OWViY2ViYTYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdG9yeS8xZjc2MzQwNC04MWJlLTQxNjMtODlkNS0zZjZlMGRhZDQ1Y2MvZGY1NzNiZTUtMWZlOS00ZTExLWI0NzctZmI5OGNjN2JjNjVhLm9jdGV0LXN0cmVhbSIsImlhdCI6MTc1MDkzNTg2NSwiZXhwIjoyMDY2Mjk1ODY1fQ.gqLGY5-wE65Do8S8UhORnEonL-RdsfX3YOv6pdLDa3Y',
//   'https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/story/1f763404-81be-4163-89d5-3f6e0dad45cc/df573be5-1fe9-4e11-b477-fb98cc7bc65a.octet-stream?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jOWIwY2JhZC1hOTc4LTRkNDgtODQyYi0yOWE1OWViY2ViYTYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdG9yeS8xZjc2MzQwNC04MWJlLTQxNjMtODlkNS0zZjZlMGRhZDQ1Y2MvZGY1NzNiZTUtMWZlOS00ZTExLWI0NzctZmI5OGNjN2JjNjVhLm9jdGV0LXN0cmVhbSIsImlhdCI6MTc1MDkzNTg2NSwiZXhwIjoyMDY2Mjk1ODY1fQ.gqLGY5-wE65Do8S8UhORnEonL-RdsfX3YOv6pdLDa3Y',
//   'https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/story/1f763404-81be-4163-89d5-3f6e0dad45cc/df573be5-1fe9-4e11-b477-fb98cc7bc65a.octet-stream?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jOWIwY2JhZC1hOTc4LTRkNDgtODQyYi0yOWE1OWViY2ViYTYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdG9yeS8xZjc2MzQwNC04MWJlLTQxNjMtODlkNS0zZjZlMGRhZDQ1Y2MvZGY1NzNiZTUtMWZlOS00ZTExLWI0NzctZmI5OGNjN2JjNjVhLm9jdGV0LXN0cmVhbSIsImlhdCI6MTc1MDkzNTg2NSwiZXhwIjoyMDY2Mjk1ODY1fQ.gqLGY5-wE65Do8S8UhORnEonL-RdsfX3YOv6pdLDa3Y',
// ];

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
  threadId,
  messages,
  displayText,
  isLoading,
  // reasoning,
  isMobile,
  ref,
}) => {
  const [activeTab, setActiveTab] = useState<'answer' | 'sources'>('answer');
  const [isCopied, setIsCopied] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(messages.length - 1);

  const handleShare = useCallback(() => {
    if (navigator.clipboard && typeof window !== 'undefined') {
      navigator.clipboard.writeText(
        window.location.href + `?threadId=${threadId}`,
      );
      setIsShared(true);
      setTimeout(() => {
        setIsShared(false);
      }, 3000);
    }
  }, [threadId]);

  const handleCopy = useCallback(() => {
    if (
      navigator.clipboard &&
      typeof window !== 'undefined' &&
      messages[messages.length - 1].text
    ) {
      navigator.clipboard.writeText(messages[messages.length - 1].text || '');
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 3000);
    }
  }, [messages]);

  const handleTabSelect = useCallback(
    (index: number, tab: 'answer' | 'sources') => {
      setCurrentMessage(index);
      setActiveTab(tab);
    },
    [setCurrentMessage, setActiveTab],
  );

  return (
    <ScrollArea
      className={cn(
        'w-full h-full overflow-y-auto justify-self-center items-start overscroll-none ',
        { 'mt-5 mb-10': isMobile },
      )}
    >
      {messages.map(
        (msg, i) =>
          msg.text && (
            <div key={i} className={`flex flex-col w-full`} ref={ref}>
              <div className={`sm:p-6 bg-[#FCFCF9] w-full`}>
                {msg.from === 'user' && (
                  <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
                    {msg.text}
                  </h1>
                )}
                {isLoading && i === messages.length - 1 && <LoadingSkeletion />}
                {msg.from === 'assistant' && (
                  <div className={`text-wrap w-full`}>
                    <div className={`flex border-b border-gray-300 mb-4`}>
                      <button
                        onClick={() => handleTabSelect(i, 'answer')}
                        className={cn(
                          'py-2 px-4 text-md',
                          activeTab === 'answer' || i !== currentMessage
                            ? 'border-b-2 border-orange-500 text-orange-500'
                            : 'text-gray-500',
                        )}
                      >
                        Answer
                      </button>
                      <button
                        onClick={() => handleTabSelect(i, 'sources')}
                        className={cn(
                          'py-2 px-4 text-md',
                          msg.sources && msg.sources.length === 0 && 'hidden',
                          activeTab === 'sources' && i === currentMessage
                            ? 'border-b-2 border-orange-500 text-orange-500'
                            : 'text-gray-500',
                        )}
                      >
                        Sources (
                        {msg.sources?.length && msg.sources?.length > 0
                          ? msg.sources?.length
                          : 0}
                        )
                      </button>
                    </div>
                    {activeTab === 'answer' || i !== currentMessage ? (
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
                        <div className="text-gray-700 text-pretty whitespace-normal">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              ol: ({ children, ...props }) => (
                                <ol
                                  className="list-decimal list-inside"
                                  {...props}
                                >
                                  {children}
                                </ol>
                              ),
                              ul: ({ children, ...props }) => (
                                <ul
                                  className="list-disc list-inside"
                                  {...props}
                                >
                                  {children}
                                </ul>
                              ),
                              h1: ({ children, ...props }) => (
                                <h1
                                  className="text-2xl sm:text-3xl font-semibold text-gray-800"
                                  {...props}
                                >
                                  {children}
                                </h1>
                              ),
                              h2: ({ children, ...props }) => (
                                <h2
                                  className="text-xl sm:text-2xl font-semibold text-gray-800"
                                  {...props}
                                >
                                  {children}
                                </h2>
                              ),
                              h3: ({ children, ...props }) => (
                                <h3
                                  className="text-lg sm:text-xl font-semibold text-gray-800"
                                  {...props}
                                >
                                  {children}
                                </h3>
                              ),
                              a: ({ node: _, ...props }) => (
                                <a
                                  style={{
                                    color: '#0066cc',
                                    textDecoration: 'underline',
                                    textUnderlineOffset: '2px',
                                  }}
                                  {...props}
                                />
                              ),
                            }}
                          >
                            {msg.from === 'assistant' &&
                            i === messages.length - 1 &&
                            displayText &&
                            displayText !== ''
                              ? displayText
                              : msg.text}
                          </ReactMarkdown>
                        </div>
                        <div
                          className={`flex items-center gap-4 ${i !== messages.length - 1 ? 'border-b border-gray-300' : ''}`}
                        >
                          <div className="mt-6 mb-10">
                            <button
                              onClick={handleShare}
                              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer"
                            >
                              {isShared ? (
                                <BsCheckLg size={20} color="green" />
                              ) : (
                                <PiShareFat size={20} />
                              )}
                              <span>
                                {isShared
                                  ? 'Link is copied to clipboard'
                                  : 'Share'}
                              </span>
                            </button>
                          </div>
                          <div className="mt-6 mb-10">
                            <button
                              onClick={handleCopy}
                              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer"
                            >
                              {isCopied ? (
                                <BsCheckLg size={20} color="green" />
                              ) : (
                                <IconCopy size={20} />
                              )}
                              <span>
                                {isCopied
                                  ? 'Contents are copied to clipboard'
                                  : 'Copy'}
                              </span>
                            </button>
                          </div>
                        </div>
                        {msg.suggestions &&
                          msg.suggestions.length > 0 &&
                          i === messages.length - 1 && (
                            <div className="mt-8">
                              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                                <IconHelpCircle
                                  size={32}
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
                          )}
                      </div>
                    ) : (
                      i === currentMessage && (
                        <div>
                          {(msg.sources && msg.sources.length > 0
                            ? msg.sources
                            : []
                          )?.map((source, index) => (
                            <div key={index} className="mb-6 gap-4">
                              <p className="text-gray-600 font-bold mt-1">
                                {`[${index + 1}]`}
                              </p>
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-lg font-semibold text-blue-600 hover:underline"
                              >
                                {source.url}
                              </a>
                              <p className="text-gray-600 mt-1">
                                {source.snippet}
                              </p>
                            </div>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          ),
      )}
    </ScrollArea>
  );
};

export default BuddyResponse;
