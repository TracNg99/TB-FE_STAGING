'use client';

import {
  Box,
  Container,
  Skeleton,
  Textarea,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { Image as ImageDisplay } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  // IconGitFork,
  IconPin,
  IconPinFilled,
  IconPlus,
  IconX,
} from '@tabler/icons-react';
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
import { useChat } from '@/contexts/chat-provider';
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
  const { resetState: resetFromContext } = useChat();
  const searchParams = useSearchParams();
  // const experienceId = params.experienceId ?? searchParams.get('experienceId');
  const threadId = searchParams.get('threadId');
  const companyId = searchParams.get('companyId');
  // const screenHeight = window.innerHeight;
  // const screenWidth = window.innerWidth;
  const isHome = pathname === '/';
  const [experienceId, setExperienceId] = useState<string | null>(null);
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const [buddyStreamMutation] = useBuddyStreamMutation();
  const [isPinned, setIsPinned] = useState(false);
  const [resetState, setResetState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [textAreaHeight, setTextAreaHeight] = useState(0);
  const [followUpSnackTitle, setFollowUpSnackTitle] = useState<string>('');
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

  const {
    data: historyData,
    refetch: refetchHistoryData,
    isLoading: isHistoryLoading,
    isFetching: isHistoryFetching,
  } = useGetAllChatThreadsQuery(undefined, {
    skip: !user,
  });

  const {
    data: threadData,
    isFetching: isThreadFetching,
    isLoading: isThreadLoading,
  } = useGetThreadByIdQuery(
    {
      session_id: threadId,
    },
    {
      skip: !user || !threadId || threadId === '',
    },
  );

  const { data: fetchedInitialSuggestions } = useGetInitialSuggestionsQuery(
    {
      experienceId: experienceId as string,
      companyId: companyId ?? (experienceData?.owned_by as string),
    },
    {
      skip: !isHome || !experienceId,
    },
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollTo({
      behavior: 'smooth',
      top: messagesEndRef.current?.scrollHeight,
    });
  };

  useEffect(() => {
    if (params.experienceId) {
      setExperienceId(params.experienceId as string);
    }
    if (searchParams.get('experienceId')) {
      setExperienceId(searchParams.get('experienceId') as string);
    }
  }, [params.experienceId, searchParams.get('experienceId')]);

  useEffect(() => {
    if (textAreaRef.current) {
      const height = textAreaRef.current.scrollHeight;
      setTextAreaHeight(height);
    }
  }, [input]);

  useEffect(() => {
    const handleFollowUpTitle = () => {
      if (experienceId && typeof window !== 'undefined') {
        const storedInput = localStorage.getItem('chat-input');
        if (
          storedInput &&
          storedInput !== '' &&
          messages.current.length === 0
        ) {
          console.log('storedInput', storedInput);
          setFollowUpSnackTitle(storedInput);
          handleSend(storedInput);
          // localStorage.removeItem('chat-input');
        }
      }
    };
    handleFollowUpTitle();
  }, [experienceId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedThreadId = localStorage.getItem('thread-id');
      if (storedThreadId && storedThreadId !== '' && threadsList.length > 0) {
        handleThreadSelect(storedThreadId);
      }
    }
  }, [threadsList.length]);

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
        const keyboardOffset = window.innerHeight - height - offsetTop;
        setKeyboardHeight(
          keyboardOffset > 0 ? (keyboardOffset * 100) / window.innerHeight : 0,
        );
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

  useEffect(() => {
    // This effect should run only on route changes, not on the initial render.
    if (resetFromContext) {
      handleReset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetFromContext]);

  const togglePin = () => {
    setIsPinned((prev) => !prev);
    if (!isPinned) {
      setIsSidebarOpen(true);
    }
  };

  const handleReset = () => {
    // console.log('activeThread: ', threadsList.find((thread) => thread.id === activeThread));
    // console.log('threadsList: ', threadsList);
    // console.log('activeThread: ', activeThread);
    // console.log('Duplicated: ', threadsList.find((thread) => thread.id === activeThread));
    if (
      user &&
      threadsList.find((thread) => thread.id === activeThread) === undefined
    ) {
      // const newMessage = messages.current.length > 0 ? messages.current : [];
      // const newThreadName =
      //   newMessage.length > 0
      //     ? `${newMessage?.[0]?.text?.slice(0, 50)}...`
      //     : '';

      // setThreadsList(
      //   (
      //     prevThreadsList: {
      //       id: string;
      //       name: string;
      //       messages: MessagesProps[];
      //     }[],
      //   ) => [
      //     ...prevThreadsList,
      //     {
      //       id: (prevThreadsList.length + 1).toString(),
      //       name: newThreadName,
      //       messages: newMessage,
      //     },
      //   ],
      // );
      refetchHistoryData();
    }
    localStorage.removeItem('thread-id');
    localStorage.removeItem('chat-input');
    setExperienceId(null);
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
    localStorage.setItem('thread-id', selectedThreadId);
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
      localStorage.setItem('chat-input', input);
      router.push(`/?experienceId=${experienceId}`);
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
            company_id: companyId || undefined,
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
          onMouseLeave={() => {
            if (!isPinned) {
              setIsSidebarOpen(false);
            }
          }}
          className={cn(
            'h-screen flex-col border-r border-gray-200 bg-white p-4 z-10 transition-all duration-300 ease-in-out flex overflow-hidden justify-items-between',
            isSidebarOpen ? 'w-80' : 'w-0 p-0 border-none',
          )}
        >
          <div className="mt-4 flex items-center justify-between px-4 pt-2">
            <h2 className="font-semibold text-gray-600">
              Threads ({threadsList.length})
            </h2>
            <button
              onClick={() => handleReset()}
              className="rounded-full bg-orange-100 p-1 text-orange-600 hover:bg-orange-200 cursor-pointer"
            >
              <IconPlus size={16} />
            </button>
            <button
              onClick={togglePin}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors place-self-end cursor-pointer"
              title={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
            >
              {isPinned ? (
                <IconPinFilled className="size-4 text-orange-500" />
              ) : (
                <IconPin className="size-4 text-gray-400" />
              )}
            </button>
          </div>
          {user ? (
            <nav className="mt-4 flex-grow">
              {threadsList.length > 0 &&
              !isHistoryLoading &&
              !isHistoryFetching ? (
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
        className={cn('flex flex-col w-full items-center justify-center', {
          [`h-[calc(100vh-${keyboardHeight}vh)] overflow-hidden`]: isHome,
          'h-[80vh] overflow-hidden': isHome && isMobile,
          'h-[10vh] bg-gray-50': !isHome,
          'bg-[url(/assets/backdrop_full.png)] bg-cover transition-discrete':
            messages.current.length === 0 &&
            !isInputActive &&
            !isThreadFetching &&
            isHome,
          'bg-transparent': isHome,
        })}
      >
        {/* Gradient Overlay */}
        {messages.current.length === 0 &&
          !isInputActive &&
          !isThreadFetching && (
            <div
              className={cn('absolute inset-0 bg-gradient-to-b', {
                'from-gray-600/20 from-10% to-white to-50% z-0': isHome,
                hidden: !isHome,
              })}
            />
          )}

        <div
          className={cn('flex flex-col', {
            'relative z-10 items-center w-[calc(100vw-20px)] mt-30': isHome,
            'relative w-full h-full': !isHome,
            'h-[1vh]': isHome && isMobile && isKeyboardVisible,
            'h-[90vh]': isHome && isMobile && !isKeyboardVisible,
            'h-[80vh]': isHome && !isMobile,
            'h-[100vh]': isHome && !isMobile && messages.current.length > 0,
          })}
        >
          <div className="fixed top-[20%] flex w-full flex-col items-center px-4">
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
                  <h1 className="mb-1 whitespace-nowrap text-xl font-bold text-[#F47920] sm:text-2xl">
                    Welcome to Travel Buddy!
                  </h1>
                </>
              )}
          </div>
          <div
            className={cn(
              'fixed flex flex-col max-h-[30vh] mt-10 mb-60 overflow-y-auto transition-all',
              {
                'top-[6dvh] w-[90%]': isMobile,
                'top-[6dvh] w-[60%]': !isMobile,
                hidden: !isHome,
                'min-h-[calc(100vh-250px)]': messages.current.length > 0,
                'mb-70': messages.current.length === 0,
              },
            )}
          >
            {experienceData && (
              <Link href={`/discoveries/${experienceData.id}`}>
                <Container
                  className={cn(
                    'flex flex-col mb-3 shadow-md bg-[#FFF0E5] rounded-md max-w-[2000px] hover:bg-gray-100 cursor-pointer w-full justify-between',
                  )}
                >
                  <span className="flex flex-row items-center text-[14px] color-purple-200 text-purple-500 gap-2 w-full">
                    <Image
                      alt=""
                      src="/assets/followup.svg"
                      width={isMobile ? 12 : 16}
                      height={isMobile ? 12 : 16}
                      className="size-[24px]"
                    />{' '}
                    Follow up to {experienceData.name}
                  </span>
                  <div className="py-2 flex flex-row self-start items-center justify-between gap-2 w-full">
                    <h2
                      className={cn({
                        'text-[16px]': isMobile,
                        'text-display-[16px]': !isMobile,
                      })}
                    >
                      {followUpSnackTitle}
                    </h2>
                    <Image
                      className="my-2 self-end rounded-md aspect-square"
                      src={experienceData.primary_photo}
                      alt="Experience Photo"
                      width={70}
                      height={70}
                    />
                  </div>
                </Container>
              </Link>
            )}
            {isThreadFetching ||
            (isThreadLoading && messages.current.length === 0) ? (
              <ThreadLoading />
            ) : (
              <BuddyResponse
                threadId={activeThread || ''}
                isLoading={isLoading}
                displayText={displayedText}
                messages={messages.current}
                reasoning={floatingTexts}
                setInput={(input: string) => handleSend(input)}
                isMobile={isMobile}
                ref={messagesEndRef}
              />
            )}
          </div>
          <div
            className={cn(
              'flex flex-col w-full items-center place-self-center gap-5',
              {
                'relative h-[5vh] left-[60dvw]': isInputActive,
                'bottom-auto': isInputActive && isKeyboardVisible,
                'top-[10%]': isInputActive && !isKeyboardVisible,
                'fixed bottom-[10%]': !isInputActive,
                'h-[15vh]': !isInputActive && isHome,
                'h-[5vh]': !isInputActive && !isHome,
              },
            )}
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
                className={cn('absolute bottom-20 mb-4', {
                  'w-[90%]': isMobile,
                  'w-[60%]': !isMobile,
                })}
                slideSize={{ base: 25, sm: 50, md: 20 }}
                slideGap={16}
                duration={25}
              />
            )}

            <div
              className={cn('bg-white rounded-md self-center', {
                'w-[90%] overflow-y-auto': isMobile,
                'w-[60%]': !isMobile,
                'fixed bottom-[8%] m-1': !isHome && isMobile,
                'fixed bottom-1': !isHome && !isMobile,
                'absolute bottom-1 mx-6': isHome,
                'right-1 bg-[#FCFCF9]': isInputActive,
                'pl-2 pr-2 pb-2 shadow-md shadow-orange-400':
                  !isInputActive && isHome,
                'min-h-[8vh] border border-gray-400': !isInputActive,
                [`bottom-[${keyboardHeight + 5}%]`]: isInputActive,
                'bottom-20': !isKeyboardVisible && isInputActive,
              })}
            >
              <InchatUploader
                className={cn('flex flex-row lg:mx gap-4 my-3', {
                  'fixed top-[10dvh] left-[2dvh] right-[2dvh]': isInputActive,
                })}
                selectedImages={selectedImages}
                handleRemoveImage={handleRemoveImage}
                CustomChildren={CustomImageDisplay}
                singleImageClassName="hidden"
              />

              {/* Input bar - now with proper spacing and scaling */}
              <div
                className={cn('grid w-[calc(100%-10px)] bg-white m-1', {
                  'grid-cols-3': isMobile,
                  'grid-cols-5': !isMobile,
                })}
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
                <Textarea
                  className={cn('w-full', {
                    'col-span-2 w-[90%]': isMobile,
                    'col-span-4': !isMobile,
                    [`fixed top-[1dvh] left-[2dvh] right-[2dvh] 
                      z-50 w-[90%] h-[10vh] 
                      px-2 pt-5 pb-20
                      bg-[#FCFCF9] z-100`]:
                      isInputActive && messages.current.length === 0,
                    'pt-1 pb-4 pl-1 bg-white h-[6vh]':
                      !isInputActive || messages.current.length > 0,
                  })}
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
                  size={isInputActive ? '25px' : 'base'}
                  autosize
                  minRows={1}
                  maxRows={isMobile && isInputActive ? 10 : 3}
                  resize="vertical"
                  ref={textAreaRef}
                />

                <div
                  className={cn(
                    'flex justify-items-center items-end place-self-end mt-6 grid grid-cols-3 shrink-0',
                    {
                      'w-[90%]': isMobile,
                      'w-full': !isMobile,
                      // Keep original behavior for desktop
                      [`bg-[#FCFCF9] top-[${textAreaHeight}px]`]: !isMobile,
                      // Use fixed positioning on mobile when input is active
                      'fixed bg-[#FCFCF9] mt-0 w-[30%]':
                        isInputActive && isMobile,
                      // Stick to bottom of screen if keyboard is not visible
                      [`bottom-20 right-[5vw]`]:
                        isInputActive && isMobile && !isKeyboardVisible,
                      // Stick above keyboard when it is visible
                      [`relative bottom-[10%] gap-8 mr-[10vw] mt-[50%] mb-10`]:
                        isInputActive && isMobile && isKeyboardVisible,
                    },
                  )}
                >
                  {/* Image upload */}
                  <div className="col-span-1">
                    <ImageUploader
                      onImageUpload={setSelectedImages}
                      fetchImages={selectedImages}
                      className={cn(
                        'flex text-gray-200 rounded-full cursor-pointer align-items-end',
                        { 'size-8': isMobile, 'size-10': !isMobile },
                      )}
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
                      className={cn(
                        'flex flex-end text-gray-600 bg-transparent rounded-full cursor-pointer self-center border items-center',
                        { 'size-6 pb-1': isMobile, 'size-10': !isMobile },
                      )}
                      customIcon={<FaMicrophone className="size-5" />}
                      asModal
                    />
                  </div>

                  {/* Send button (properly sized) */}
                  <div className="col-span-1">
                    <button
                      className={`flex shrink-0 ml-1 rounded-md bg-orange-500 hover:bg-orange-600 text-white cursor-pointer ${isMobile ? 'p-[6px] size-[24px] mb-1 ' : 'p-[6px] size-[29px] mb-[20%]'}`}
                      onClick={() => handleSend()}
                      disabled={input === ''}
                    >
                      <SendIcon
                        className="text-white"
                        // size={20}
                      />
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
