'use client';

import {
  Box,
  Container,
  ScrollArea,
  TextInput,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { Image as ImageDisplay } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconGitFork, IconX } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { FaMicrophone } from 'react-icons/fa';

import VoiceButtonForm from '@/components/audio-handler/voice-to-text';
import useStream, {
  base64ToUnicode,
} from '@/components/chatbot/streaming-hook';
import ImageUploader from '@/components/image-uploader/image-picker';
import InchatUploader from '@/components/image-uploader/image-picker-in-chat';
import TextCarousel from '@/components/text-carousel';
import { useSidebar } from '@/contexts/sidebar-provider';
import {
  // useGetStreamResultsQuery,
  // useCallBuddyAgentMutation,
  // usePostStreamMutation,
  useRestChatMemoryQuery,
  // usePostStreamNativeMutation
} from '@/store/redux/slices/agents/buddy';
import { useGetExperiencePublicQuery } from '@/store/redux/slices/user/experience';
import { cn } from '@/utils/class';

import BuddyResponse from './buddy-response';
import { MessagesProps } from './types';

const suggestionChips = [
  'Check-in spots in Da Nang',
  'Best-selling Vespa Adventures tours',
  'Boutique hotels in Da Nang',
  'Best-selling tours in Da Nang',
  'Best-selling tours in Hanoi',
];

const SendIcon: React.FC<{ className?: string; size?: number }> = ({
  className,
  size,
}) => (
  <Image
    src="/assets/arrow_white.svg"
    alt="Send"
    width={size || 300}
    height={size || 300}
    className={className}
    style={{
      color: 'white',
    }}
    unoptimized
  />
);

const CustomImageDisplay: React.FC<{
  index: number;
  image: string | null;
  handleRemoveImage: (index: number) => void;
}> = ({ index, image, handleRemoveImage }) => {
  return (
    <Box
      key={index}
      className="relative flex flex-row overflow-hidden rounded-md w-28 h-20 items-center bg-gray-300/70"
    >
      <Box className="rounded-md w-full h-full items-center bg-black">
        <ImageDisplay
          src={
            !image ? 'https://via.placeholder.com/100x100?text=No+Image' : image
          }
          alt={'Uploaded'}
          style={{
            objectFit: 'cover',
            width: '100%',
            height: '100%',
          }}
        />
      </Box>
      <Tooltip label="Remove">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleRemoveImage(index);
          }}
          className="absolute top-0 right-0 p-1 text-white bg-black/50 rounded-bl-md cursor-pointer"
        >
          <IconX size="16px" />
        </button>
      </Tooltip>
    </Box>
  );
};

const BuddyUI = ({ context }: { context?: { [key: string]: string } }) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const experienceId = params.experienceId ?? searchParams.get('experienceId');
  const threadId = searchParams.get('threadId');
  const isHome = pathname === '/';
  const { isSidebarOpen } = useSidebar();
  const [isSent, setIsSent] = useState(false);
  const [resetState, setResetState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snack, setSnack] = useState({
    visible: true,
    message: 'Ask me anything!',
  });
  const [floatingTexts, setFloatingTexts] = useState<string>('');
  const [displayedText, setDisplayedText] = useState<string>('');
  const [charIndex, setCharIndex] = useState<number>(0);
  const [threadsList, setThreadsList] = useState<
    {
      id: string;
      name: string;
      messages: MessagesProps[];
    }[]
  >([
    { id: '1', name: 'Hello', messages: [] },
    { id: '2', name: 'Where to get food near Ben Than...', messages: [] },
    { id: '3', name: 'Local specialty in Delkong Meta', messages: [] },
  ]);

  const [activeThread, setActiveThread] = useState(threadId ?? 'new');

  const { data: experienceData } = useGetExperiencePublicQuery(
    {
      id: experienceId as string,
    },
    {
      skip: !experienceId,
    },
  );

  const messages = useRef<MessagesProps[]>([]);
  const [latestBotMessage, setLatestBotMessage] =
    useState<MessagesProps | null>(null);
  const chatSessionId = useRef<string | null>(null);
  const [input, setInput] = useState('');
  const [selectedImages, setSelectedImages] = useState<
    Array<{ image: string | null; name: string | null }>
  >([]);

  const isMobile = useMediaQuery('(max-width: 640px)');

  const { data: resetData } = useRestChatMemoryQuery(
    {
      session_id: chatSessionId.current,
    },
    {
      skip: !resetState,
    },
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (resetData) {
      notifications.show({
        title: 'Chat Reset',
        message: 'Your chat has been reset.',
        color: 'green',
      });
      setResetState(false);
    }
  }, [resetData]);

  useEffect(() => {
    if (snack.visible) {
      const timer = setTimeout(() => {
        setSnack((s) => ({ ...s, visible: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [snack]);

  const handleReset = () => {
    setThreadsList(
      (
        prevThreadsList: {
          id: string;
          name: string;
          messages: MessagesProps[];
        }[],
      ) => [
        ...prevThreadsList,
        {
          id: (prevThreadsList.length + 1).toString(),
          name: `${messages.current[0].text?.slice(0, 10)}...`,
          messages: messages.current,
        },
      ],
    );
    setActiveThread(threadsList[threadsList.length - 1].id);
    messages.current = [];
    setInput('');
    setSelectedImages([]);
    setResetState(true);
    setIsSent(false);
    setDisplayedText('');
    setCharIndex(0);
    setFloatingTexts('');
    setIsLoading(false);
  };

  const handleThreadSelect = (threadId: string) => {
    setActiveThread(threadId);
    messages.current =
      threadsList.find((thread) => thread.id === threadId)?.messages || [];
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleOnChunkAvailable = (chunk: any) => {
    console.log('Chunk event:', chunk.event);
    setFloatingTexts('');
    setDisplayedText('');
    setCharIndex(0);
    if (chunk.event !== 'complete') {
      setFloatingTexts(
        chunk.data?.response ? base64ToUnicode(chunk.data?.response) : null,
      );
      return;
    }
    setIsLoading(false);
    // console.log('Emoticon', chunk.data?.emoticon, typeof chunk.data?.emoticon);
    // console.log(
    //   'Response:',
    //   chunk.data?.response ? base64ToUnicode(chunk.data?.response) : null,
    // );
    messages.current = [
      ...messages.current,
      {
        from: 'bot',
        text: chunk.data?.response
          ? base64ToUnicode(chunk.data?.response)
          : null,
        tag: chunk.event !== 'complete' ? 'face-with-monocle' : 'nerd-face',
        images: chunk.data?.images || [],
        sources: chunk.data?.sources || [],
        suggestions: chunk.data?.suggestions || [],
      },
    ];

    setLatestBotMessage(messages.current[messages.current.length - 1]);

    // console.log('Decoded response', base64ToUnicode(chunk.data?.response));
    chatSessionId.current = chunk.data?.session_id;

    return;
  };

  useEffect(() => {
    // Reset displayed text and character index when messages change
    if (
      latestBotMessage?.from === 'bot' &&
      latestBotMessage?.text !== '' &&
      latestBotMessage?.text !== null &&
      charIndex < latestBotMessage?.text?.length
    ) {
      const text = latestBotMessage?.text;
      console.log('Displaying text: ', text);
      const timer = setTimeout(() => {
        setDisplayedText((prevText) => prevText + text[charIndex]);
        setCharIndex((prevIndex) => prevIndex + 1);
      }, 30); // Adjust delay as needed

      return () => clearTimeout(timer);
    }
  }, [charIndex, displayedText, latestBotMessage]);

  useStream({
    body: {
      query: messages.current[messages.current.length - 1]?.text ?? '',
      images: messages.current[messages.current.length - 1]?.images || [],
      filters: {
        ...context,
      },
      session_id: chatSessionId.current,
    },
    onDataAvailable: handleOnChunkAvailable,
    isSent,
    isLoading,
    setIsSent,
    setIsLoading,
  });

  const handleSend = async () => {
    if (!input.trim() && selectedImages.length === 0) return;
    if (!isHome) {
      router.push(
        `/?threadId=${activeThread}${experienceId ? `&experienceId=${experienceId}` : ''}`,
      );
    }
    setIsLoading(true);
    messages.current = [
      ...messages.current,
      {
        from: 'user',
        text: input,
        tag: '',
        images: selectedImages.map((image) => image.image || ''),
      },
    ];
    setDisplayedText('');
    setCharIndex(0);
    setInput('');
    setIsSent(true);
    setSelectedImages([]);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
  };

  // Active State (Chat Overlay)
  return (
    <div className="flex h-full w-full bg-[#FFF9F5]">
      {/* Header */}
      {isHome && (
        <aside
          className={cn(
            'h-screen flex-col border-r border-gray-200 bg-white p-4 z-10 transition-all duration-300 ease-in-out flex overflow-hidden',
            isSidebarOpen ? 'w-80' : 'w-0 p-0 border-none',
          )}
        >
          <div className="mt-4 flex items-center justify-between px-4 pt-2">
            <h2 className="font-semibold text-gray-600">
              Threads ({threadsList.length})
            </h2>
            <button
              onClick={() => handleReset()}
              className="rounded-full bg-orange-100 p-1 text-orange-600 hover:bg-orange-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>
          <nav className="mt-4 flex-grow">
            <ul>
              {threadsList.map((thread) => (
                <li key={thread.id} className="mb-2">
                  <UnstyledButton
                    onClick={() => handleThreadSelect(thread.id)}
                    className={cn(
                      'w-full rounded-lg p-3 text-left text-sm font-medium text-gray-700 hover:bg-orange-100/50',
                      {
                        'bg-[#FFF0E5] text-gray-900':
                          activeThread === thread.id,
                      },
                    )}
                  >
                    {thread.name}
                  </UnstyledButton>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      )}
      {/* Chatbot UI */}
      <Container
        fluid
        className={`
        flex flex-col 
        w-full
        items-center justify-center overflow-hidden
        ${
          messages.current.length === 0
            ? `bg-[url(/assets/backdrop_full.png)] bg-cover transition-discrete`
            : ''
        }
        ${isHome && 'bg-transparent'}
      `}
      >
        {/* Gradient Overlay */}
        {messages.current.length === 0 && (
          <div
            className={`
          absolute inset-0 bg-gradient-to-b 
          from-gray-600/20 to-white z-0
          ${!isHome && 'hidden'}
        `}
          />
        )}

        <div
          className={`${
            isHome
              ? 'relative z-10 flex flex-col items-center'
              : 'absolute bottom-5 flex flex-col self-center rounded-md'
          }
            w-[calc(100vw-20px)]
            `}
        >
          {messages.current.length === 0 && isHome && (
            <>
              <div className="mb-2">
                <Image
                  src="/assets/buddy_mascot.svg"
                  alt="Travel Buddy Mascot"
                  width={240}
                  height={180}
                />
              </div>
              <h1 className="mb-8 text-2xl font-bold text-[#F47920]">
                Welcome to Travel Buddy!
              </h1>
            </>
          )}
          <div
            className={`flex-1 max-h-[calc(100vh-200px)] w-full transition-all ${!isHome && 'hidden'}`}
          >
            {experienceData && (
              <Link href={`/experiences/${experienceData.id}`}>
                <Container
                  className={`
                  flex mb-3 shadow-md 
                  bg-white rounded-md w-[60%] 
                  justify-between self-end 
                  ${isMobile ? 'w-[90%]' : 'w-[60%]'} 
                  hover:bg-gray-100 cursor-pointer
                `}
                >
                  <div className="p-4 flex flex-col self-start items-start justify-items-start text-display-[14px] gap-2">
                    <span className="flex flex-row items-center text-[12px]">
                      <IconGitFork size={16} /> Follow up to
                    </span>
                    <h2 className="text-display-[14px] font-semibold">
                      {experienceData.name}
                    </h2>
                  </div>
                  <Image
                    className="object-cover p-3 self-end rounded-md aspect-square"
                    src={experienceData.primary_photo}
                    alt="Experience Photo"
                    width={100}
                    height={100}
                  />
                </Container>
              </Link>
            )}
            <ScrollArea className={`h-full overflow-y-auto`}>
              <div
                className={`flex flex-col p-4 pb-10 w-full text-[14px] transition-all`}
              >
                <BuddyResponse
                  isLoading={isLoading}
                  displayText={displayedText}
                  messages={messages.current}
                  reasoning={floatingTexts}
                  setInput={setInput}
                  isMobile={isMobile}
                  ref={messagesEndRef}
                />
              </div>
            </ScrollArea>
          </div>

          {messages.current.length === 0 && isHome && (
            <TextCarousel
              items={suggestionChips}
              showControls={true}
              renderItem={(item) => (
                <button
                  key={item}
                  className="text-nowrap rounded-full bg-white px-2 py-2 text-[12px] text-gray-600 shadow-sm hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSuggestion(item)}
                >
                  {item}
                </button>
              )}
              className={`flex flex-row mb-4 ${isMobile ? 'w-[90%]' : 'w-[60%]'}`}
              slideSize={{ base: 25, sm: 50, md: 20 }}
              slideGap={16}
              // paginationType="none"
              duration={25}
            />
          )}

          <div
            className={`
            pl-2 pr-2 pb-2 
            ${isMobile ? 'w-[80%]' : 'w-[60%]'}
            flex-shrink-0 bg-white rounded-md border-1
            ${!isHome ? 'drop-shadow-lg drop-shadow-red-800/50 m-2' : 'mx-6'}
            border-gray-400/70 border
            self-center
            `}
          >
            <InchatUploader
              className="flex flex-row lg:mx gap-4 my-3"
              selectedImages={selectedImages}
              handleRemoveImage={handleRemoveImage}
              CustomChildren={CustomImageDisplay}
              singleImageClassName={`
            hidden
            relative 
            overflow-hidden 
            rounded-md border 
            w-[100px] h-[70px]
            border-gray-300 bg-black/80
            `}
            />

            {/* Input bar - now with proper spacing and scaling */}
            <div
              className={`
              grid ${isMobile ? 'grid-cols-3' : 'grid-cols-5'} 
              w-full 
              bg-white rounded-md
            `}
            >
              {/* Text input (flexible width) */}
              <TextInput
                className={`
                    ${isMobile ? 'col-span-2' : 'col-span-4'} 
                    w-full bg-white pb-4 pl-1 text-base`}
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.currentTarget.value)}
                onKeyUp={handleKeyPress}
                variant="unstyled"
                // styles={{
                //   input: {
                //     color: 'black',
                //     width: '100%',
                //     fontSize: isMobile ? '14px' : '16px',
                //   },
                // }}
              />

              <div
                className={`
                col-span-1 grid grid-cols-3 
                columns-3xs
                right-0 shrink-0 
                justify-items-center
                items-end
                ${isMobile ? 'w-[90%] gap-x-1' : 'w-full gap-x-0'}
              `}
              >
                {/* Image upload */}
                <div className="col-span-1">
                  <ImageUploader
                    onImageUpload={setSelectedImages}
                    fetchImages={selectedImages}
                    className={`
                    flex
                    text-gray-200 rounded-full cursor-pointer 
                    ${isMobile ? 'size-8' : 'size-10'}
                    align-items-end
                  `}
                    allowMultiple={true}
                  >
                    <Image
                      src="/assets/image_uploader_icon.svg"
                      alt="Upload"
                      width={isMobile ? 56 : 76}
                      height={isMobile ? 56 : 76}
                    />
                  </ImageUploader>
                </div>

                {/* Voice button */}
                <div className="col-span-1">
                  <VoiceButtonForm
                    language="en-US"
                    onTranscribe={(e) => setInput(e)}
                    existingTexts={input}
                    className={`
                    flex flex-end
                    text-gray-600 bg-transparent 
                    rounded-full cursor-pointer 
                    self-center border 
                    items-center
                    ${isMobile ? 'size-6 pb-1' : 'size-10'}
                  `}
                    customIcon={<FaMicrophone className="size-5" />}
                    asModal
                  />
                </div>

                {/* Send button (properly sized) */}
                <div className="col-span-1">
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className={`ml-1 mb-1 rounded-md bg-orange-500 hover:bg-orange-600 text-white cursor-pointer ${isMobile ? 'size-6' : 'size-8'} p-1`}
                  >
                    {isHome ? (
                      <SendIcon className="text-white" />
                    ) : (
                      <IconGitFork className="text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default BuddyUI;
