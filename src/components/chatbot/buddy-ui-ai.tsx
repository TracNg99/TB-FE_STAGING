'use client';

import {
  Box,
  Container,
  ScrollArea,
  Skeleton,
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
import { base64ToUnicode } from '@/components/chatbot/streaming-hook';
import ImageUploader from '@/components/image-uploader/image-picker';
import InchatUploader from '@/components/image-uploader/image-picker-in-chat';
import TextCarousel from '@/components/text-carousel';
import { useAuth } from '@/contexts/auth-provider';
import { useSidebar } from '@/contexts/sidebar-provider';
import {
  useBuddyStreamMutation,
  useGetAllChatThreadsQuery,
  useGetInitialSuggestionsQuery,
  useGetThreadByIdQuery,
  useResetChatMemoryQuery,
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

const ThreadLoading = () => {
  return (
    <div className="flex flex-col items-start justify-center gap-2 z-0 mt-10">
      <Skeleton height={20} width={100} />
      <Skeleton height={20} width="100%" />
      <Skeleton height={20} width="100%" />
      <Skeleton height={20} width="100%" />
      <Skeleton height={20} width="100%" />
    </div>
  );
};

const CustomImageDisplay: React.FC<{
  index: number;
  image: string | null;
  handleRemoveImage: (index: number) => void;
}> = ({ index, image, handleRemoveImage }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return (
    <Box
      key={index}
      className={`relative flex flex-row overflow-hidden rounded-md ${isMobile ? 'w-24 h-16' : 'w-28 h-20'} items-center bg-gray-300/70 mx-2' : 'w-[350px] h-full items-center bg-gray-300/70 mx-2'}`}
    >
      <Box className="grow-[80vw] h-full items-center bg-transparent p-2 rounded-md ">
        <ImageDisplay
          className="rounded-md"
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
          className="flex self-end items-center text-gray-500 bg-transparent cursor-pointer h-full"
        >
          <IconX size={24} />
        </button>
      </Tooltip>
    </Box>
  );
};

const BuddyAI = ({ context }: { context?: { [key: string]: string } }) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const experienceId = params.experienceId ?? searchParams.get('experienceId');
  const threadId = searchParams.get('threadId');
  const companyId = searchParams.get('companyId');
  const isHome = pathname === '/';
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const [buddyStreamMutation] = useBuddyStreamMutation();
  // const [isSent, setIsSent] = useState(false);
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
  >([]);

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
  const chatSessionId = useRef<string | null>(threadId ?? null);
  const [activeThread, setActiveThread] = useState<string | null>(
    threadId ?? chatSessionId.current ?? null,
  );
  const [input, setInput] = useState('');
  const [isInputActive, setIsInputActive] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [selectedImages, setSelectedImages] = useState<
    Array<{ image: string | null; name: string | null }>
  >([]);
  const [initialSuggestions, setInitialSuggestions] =
    useState<string[]>(suggestionChips);

  const isMobile = useMediaQuery('(max-width: 640px)');

  const { data: resetData } = useResetChatMemoryQuery(
    {
      session_id: chatSessionId.current,
    },
    {
      skip: !resetState,
    },
  );

  const { data: historyData } = useGetAllChatThreadsQuery(undefined, {
    skip: !user,
  });

  const { data: threadData, isFetching: isThreadFetching } =
    useGetThreadByIdQuery(
      {
        session_id: threadId,
      },
      {
        skip: !user || !threadId || threadId === '',
      },
    );

  const { data: fetchedInitialSuggestions } = useGetInitialSuggestionsQuery({
    experienceId: experienceId as string,
    companyId: companyId ?? (experienceData?.owned_by as string),
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollTo({
      behavior: 'smooth',
      top: messagesEndRef.current?.scrollHeight,
    });
  };

  useEffect(() => {
    if (
      fetchedInitialSuggestions &&
      fetchedInitialSuggestions.data &&
      fetchedInitialSuggestions.data.length > 0
    ) {
      setInitialSuggestions(fetchedInitialSuggestions.data);
    }
  }, [fetchedInitialSuggestions]);

  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        const { height } = window.visualViewport;
        const threshold = window.innerHeight * 0.9; // 90% of the initial height

        if (height < threshold) {
          setIsKeyboardVisible(true);
        } else {
          setIsKeyboardVisible(false);
        }
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  useEffect(() => {
    const visualViewport = window.visualViewport;
    const handleResize = () => {
      if (visualViewport) {
        const { height, offsetTop } = visualViewport;
        console.log('Height: ', height);
        console.log('Offset Top: ', offsetTop);
        console.log('Window Inner Height: ', window.innerHeight);
        const keyboardOffset = window.innerHeight - height - offsetTop;
        setKeyboardHeight(
          keyboardOffset > 0 ? (keyboardOffset * 100) / window.innerHeight : 0,
        );
        console.log('Keyboard Height: ', keyboardHeight);
      }
    };

    if (visualViewport) {
      visualViewport.addEventListener('resize', handleResize);
      handleResize(); // Initial check

      return () => {
        visualViewport.removeEventListener('resize', handleResize);
      };
    }

    return () => {};
  }, []);

  useEffect(() => {
    if (
      historyData &&
      historyData.data &&
      historyData.data.length > 0 &&
      historyData.data[0].chat_messages.length > 0 &&
      historyData.data.length > threadsList.length
    ) {
      const mappedChatHistory = historyData.data.map((item) => ({
        id: item.id || '',
        name: item.chat_messages[0]?.content?.slice(0, 50) + '...' || '',
        messages:
          item.chat_messages?.map((message) => ({
            from: message.role,
            text: message.content,
            tag: message.role === 'user' ? 'user' : 'assistant',
            images: message.metadata?.images || [],
            sources: message.metadata?.sources || [],
            suggestions:
              message.metadata?.suggestions ||
              message.metadata?.follow_up_questions ||
              [],
          })) || [],
      }));

      setThreadsList((prevThreadList) => [
        ...prevThreadList,
        ...mappedChatHistory,
      ]);
    }
  }, [historyData, threadsList]);

  useEffect(() => {
    scrollToBottom();
  }, [input, displayedText, latestBotMessage]);

  useEffect(() => {
    if (resetData) {
      // setActiveThread(resetData.data?.session_id)
      // chatSessionId.current = resetData.data?.session_id;
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
    // console.log('activeThread: ', threadsList.find((thread) => thread.id === activeThread));
    // console.log('threadsList: ', threadsList);
    // console.log('activeThread: ', activeThread);
    // console.log('Duplicated: ', threadsList.find((thread) => thread.id === activeThread));
    if (
      user &&
      threadsList.find((thread) => thread.id === activeThread) === undefined
    ) {
      const newMessage = messages.current.length > 0 ? messages.current : [];
      const newThreadName =
        newMessage.length > 0
          ? `${newMessage?.[0]?.text?.slice(0, 10)}...`
          : '';

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
            name: newThreadName,
            messages: newMessage,
          },
        ],
      );
    }
    setResetState(true);
    setActiveThread(null);
    chatSessionId.current = null;
    messages.current = [];
    setInput('');
    setSelectedImages([]);
    setDisplayedText('');
    setCharIndex(0);
    setFloatingTexts('');
    setIsLoading(false);
  };

  const handleThreadSelect = (selectedThreadId: string) => {
    setActiveThread(selectedThreadId);
    messages.current =
      threadsList.find((thread) => thread.id === selectedThreadId)?.messages ||
      [];
    chatSessionId.current = selectedThreadId;
    scrollToBottom();
  };

  const handleOnChunkAvailable = (chunk: any) => {
    setFloatingTexts('');
    setDisplayedText('');
    setCharIndex(0);
    if (chunk.event !== 'complete') {
      setFloatingTexts((prevText) =>
        chunk.data?.response
          ? prevText + '\n' + base64ToUnicode(chunk.data?.response)
          : prevText,
      );
      return;
    }
    setIsLoading(false);
    messages.current = [
      ...messages.current,
      {
        from: 'assistant',
        text: chunk.data?.response
          ? base64ToUnicode(chunk.data?.response)
          : null,
        tag: chunk.event !== 'complete' ? 'face-with-monocle' : 'nerd-face',
        images: chunk.data?.images || [],
        sources: chunk.data?.sources || [],
        suggestions: chunk.data?.suggestions || [],
      },
    ];
    scrollToBottom();

    setLatestBotMessage(messages.current[messages.current.length - 1]);
    chatSessionId.current = chunk.data?.session_id;

    return;
  };

  useEffect(() => {
    if (threadId && threadId !== '' && threadData && threadData.data) {
      messages.current = threadData.data.chat_messages?.map((item) => ({
        from: item.role,
        text: item.content,
        tag: item.role === 'user' ? 'user' : 'assistant',
        images: item.metadata?.images || [],
        sources: item.metadata?.sources || [],
        suggestions:
          item.metadata?.suggestions ||
          item.metadata?.follow_up_questions ||
          [],
      }));
    }
  }, [threadId, threadData]);

  useEffect(() => {
    if (
      latestBotMessage?.from === 'assistant' &&
      latestBotMessage?.text !== '' &&
      latestBotMessage?.text !== null &&
      charIndex < latestBotMessage?.text?.length &&
      messages.current[messages.current.length - 1]?.from === 'assistant'
    ) {
      const text = latestBotMessage?.text;
      console.log('Displaying text: ', text);
      const timer = setTimeout(() => {
        setDisplayedText((prevText) => prevText + text[charIndex]);
        setCharIndex((prevIndex) => prevIndex + 1);
      }, 10);

      return () => clearTimeout(timer);
    }
  }, [charIndex, displayedText, latestBotMessage]);

  const handleSend = async (directInput?: string) => {
    if (!isHome) {
      router.push(
        `/?threadId=${activeThread}${experienceId ? `&experienceId=${experienceId}` : ''}`,
      );
    }
    setIsLoading(true);
    setIsInputActive(false);
    setDisplayedText('');
    setCharIndex(0);
    setInput('');
    // setIsSent(true);
    setSelectedImages([]);
    messages.current = [
      ...messages.current,
      {
        from: 'user',
        text: directInput ?? input,
        tag: '',
        images: selectedImages.map((image) => image.image || ''),
      },
    ];
    try {
      await buddyStreamMutation({
        body: {
          query: messages.current[messages.current.length - 1]?.text ?? '',
          images: messages.current[messages.current.length - 1]?.images || [],
          filters: {
            ...context,
            experience_id: (experienceId as string) || undefined,
          },
          session_id: chatSessionId.current,
        },
        onChunk: handleOnChunkAvailable,
      }).unwrap();
    } catch (error) {
      console.error('Error streaming:', error);
      notifications.show({
        title: 'Error: Chat failure',
        message: 'Failure during buddy response! Please try again!',
        color: 'red',
      });
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      // console.log('Enter pressed');
      event.preventDefault();
      event.stopPropagation();
      handleSend();
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
  };

  // Active State (Chat Overlay)
  return (
    <div className="flex h-full w-full bg-[#FCFCF9]">
      {/* Header */}
      {isHome && (
        <aside
          onMouseLeave={() => setIsSidebarOpen(false)}
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
          {user ? (
            <nav className="mt-4 flex-grow">
              {threadsList.length > 0 ? (
                <ul>
                  {threadsList.map((thread) => (
                    <li key={thread.id} className="mb-2">
                      <UnstyledButton
                        onClick={() => handleThreadSelect(thread.id)}
                        disabled={thread.id === activeThread}
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
              ) : (
                <Skeleton height={20} width={200} />
              )}
            </nav>
          ) : (
            <div className="flex flex-col items-center mt-10 gap-3 items-center justify-items-center">
              <p>Login to see your previous conversations</p>
              <button
                onClick={() => router.push('/auth/login')}
                className="rounded-full bg-orange-500 p-2 text-white font-semibold hover:bg-orange-700"
              >
                Login
              </button>
            </div>
          )}
        </aside>
      )}
      {/* Chatbot UI */}
      <Container
        fluid
        className={`
        flex flex-col 
        w-full
        h-[calc(100vh-${keyboardHeight}px)]
        items-center justify-center overflow-hidden
        ${
          messages.current.length === 0 && !isInputActive && !isThreadFetching
            ? `bg-[url(/assets/backdrop_full.png)] bg-cover transition-discrete`
            : ''
        }
        ${isHome && 'bg-transparent'}
      `}
      >
        {/* Gradient Overlay */}
        {messages.current.length === 0 &&
          !isInputActive &&
          !isThreadFetching && (
            <div
              className={`
             absolute inset-0 bg-gradient-to-b 
             from-gray-600/20 from-10% to-white to-50% z-0
            ${!isHome && 'hidden'}
            `}
            />
          )}

        <div
          className={`${
            isHome
              ? `relative z-10 flex flex-col items-center`
              : 'absolute bottom-5 flex flex-col self-center rounded-md'
          }
            w-[calc(100vw-20px)]
            ${isMobile && isKeyboardVisible && `h-[1vh]`}
            ${isMobile && !isKeyboardVisible && `h-[90vh]`}
            ${!isMobile && `h-[80vh]`}
            ${!isMobile && messages.current.length > 0 && `h-[100vh]`}
          `}
        >
          <div className="fixed top-[20%] flex flex-col items-center">
            {messages.current.length === 0 &&
              !isInputActive &&
              !isThreadFetching &&
              isHome && (
                <>
                  <div className="mb-2">
                    <Image
                      src="/assets/buddy_mascot.svg"
                      alt="Travel Buddy Mascot"
                      width={240}
                      height={180}
                    />
                  </div>
                  <h1 className="mb-1 text-2xl font-bold text-[#F47920]">
                    Welcome to Travel Buddy!
                  </h1>
                </>
              )}
          </div>
          <div
            className={`
              fixed
              flex flex-col max-h-[30vh]
              ${isMobile ? `top-[6dvh] w-[90%]` : 'top-[6dvh] w-[60%]'} 
              transition-all ${!isHome && 'hidden'} 
              mt-10 mb-60 overflow-y-auto
              ${messages.current.length > 0 && 'min-h-[calc(100vh-250px)]'}
              ${messages.current.length === 0 && 'mb-70'}
            `}
          >
            {experienceData && (
              <Link href={`/experiences/${experienceData.id}`}>
                <Container
                  className={`
                    flex mb-3 shadow-md 
                    bg-white rounded-md
                    max-w-[2000px]
                    ${isMobile ? 'w-full' : 'w-[60%]'} 
                    hover:bg-gray-100 cursor-pointer
                  `}
                >
                  <div className="p-2 flex flex-col self-start items-start justify-items-start gap-2">
                    <span className="flex flex-row items-center text-[12px] gap-2">
                      <IconGitFork size={isMobile ? 12 : 16} /> Follow up to
                    </span>
                    <h2
                      className={`font-semibold ${isMobile ? 'text-[12px]' : 'text-display-[14px]'}`}
                    >
                      {experienceData.name}
                    </h2>
                  </div>
                  <Image
                    className="m-2 self-end rounded-md aspect-square"
                    src={experienceData.primary_photo}
                    alt="Experience Photo"
                    width={isMobile ? 70 : 100}
                    height={isMobile ? 70 : 100}
                  />
                </Container>
              </Link>
            )}
            {isThreadFetching ? (
              <ThreadLoading />
            ) : (
              <ScrollArea
                className={`
                w-full h-full overflow-y-auto justify-self-center items-start overscroll-x-none
                ${isMobile && 'mt-10 mb-10'}
              `}
                // ref={messagesEndRef}
                viewportRef={messagesEndRef}
              >
                {/* <div
                className={`flex flex-col p-4 pb-10 w-full text-[14px] transition-all border`}
              > */}
                <BuddyResponse
                  isLoading={isLoading}
                  displayText={displayedText}
                  messages={messages.current}
                  reasoning={floatingTexts}
                  setInput={(input: string) => handleSend(input)}
                  isMobile={isMobile}
                  // ref={messagesEndRef}
                />
                {/* </div> */}
              </ScrollArea>
            )}
          </div>
          <div
            className={`
              ${
                isInputActive
                  ? `relative h-[5vh] left-[60dvw] ${isKeyboardVisible ? `bottom-auto` : 'top-[10%]'} `
                  : 'fixed bottom-[10%] h-[15vh]'
              }
              flex flex-col w-full items-center gap-5`}
          >
            {messages.current.length === 0 && !isInputActive && isHome && (
              <TextCarousel
                items={initialSuggestions}
                showControls={true}
                renderItem={(item) => (
                  <button
                    key={item}
                    className="text-nowrap rounded-full bg-[#FFF2E5] px-2 py-2 text-[12px] text-gray-600 shadow-lg hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSend(item)}
                  >
                    {item}
                  </button>
                )}
                className={`absolute bottom-20 ${isMobile ? 'w-[90%]' : 'w-[60%]'}`}
                slideSize={{ base: 25, sm: 50, md: 20 }}
                slideGap={16}
                // paginationType="none"
                duration={25}
              />
            )}

            <div
              className={`
              absolute bottom-1
              ${isMobile ? 'w-[90%] overflow-y-auto' : 'w-[60%]'}
              bg-white rounded-md
              ${!isHome ? 'm-10' : 'mx-6'}
              ${isInputActive ? 'right-1 bg-[#FCFCF9]' : 'pl-2 pr-2 pb-2 border-black bg-black/80 shadow-md shadow-orange-400'}
              self-center
            `}
            >
              <InchatUploader
                className={`
                ${isInputActive && 'fixed top-[10dvh] left-[2dvh] right-[2dvh]'}
                flex flex-row 
                lg:mx gap-4 my-3
              `}
                selectedImages={selectedImages}
                handleRemoveImage={handleRemoveImage}
                CustomChildren={CustomImageDisplay}
                singleImageClassName="hidden"
              />

              {/* Input bar - now with proper spacing and scaling */}
              <div
                className={`
              grid ${isMobile ? 'grid-cols-3' : 'grid-cols-5'} 
              w-full 
              bg-white rounded-md
            `}
              >
                {isInputActive && messages.current.length === 0 && (
                  <button
                    className="fixed top-[1dvh] left-[1dvh] z-1000"
                    onClick={() => setIsInputActive(false)}
                  >
                    <IconX />
                  </button>
                )}
                {/* Text input (flexible width) */}
                <TextInput
                  className={`
                    ${isMobile ? 'col-span-2' : 'col-span-4'} 
                    ${
                      isInputActive && messages.current.length === 0
                        ? `fixed top-[1dvh] left-[2dvh] 
                      right-[2dvh] z-50 w-[90%] h-[10vh] 
                      px-2 py-10 
                      border-b border-gray-300 bg-[#FCFCF9] z-100`
                        : 'pt-1 pb-4 pl-1 w-full bg-white h-[6vh]'
                    }
                `}
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={(e) => setInput(e.currentTarget.value)}
                  onKeyDown={handleKeyPress}
                  onFocus={() =>
                    isMobile &&
                    messages.current.length === 0 &&
                    pathname === '/'
                      ? setIsInputActive(true)
                      : undefined
                  }
                  variant="unstyled"
                  // disabled={isInputActive}
                  size={isInputActive ? '25px' : 'base'}
                />

                <div
                  className={`
                 flex justify-items-center
                 items-end
                 place-self-end grid grid-cols-3
                 columns-xs shrink-0
                 ${isMobile ? 'w-[90%] gap-x-1' : 'w-full gap-x-0'}
                 ${isInputActive ? 'bg-[#FCFCF9]' : ''}
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
                      className={`ml-1 mb-1 rounded-md bg-orange-500 hover:bg-orange-600 text-white cursor-pointer p-2`}
                      onClick={() => handleSend()}
                      disabled={input === ''}
                    >
                      {isHome ? (
                        <SendIcon
                          className="text-white"
                          size={isMobile ? 14 : 20}
                        />
                      ) : (
                        <IconGitFork
                          className="text-white"
                          size={isMobile ? 14 : 20}
                        />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default BuddyAI;
