'use client';

import { Container, Skeleton, UnstyledButton } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconPin, IconPinFilled, IconPlus } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import Chatbox from '@/components/chatbot/chatbox';
import { base64ToUnicode } from '@/components/chatbot/streaming-hook';
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

// Layer 1: Background Layer (Fixed, Non-scrollable)
const BackgroundLayer: React.FC<{
  isHome: boolean;
  hasMessages: boolean;
  isInputActive: boolean;
}> = ({ isHome, hasMessages, isInputActive }) => {
  return (
    <div className="absolute inset-0 z-0 bg-[#FCFCF9]">
      {/* Default Background */}
      {(!isHome || hasMessages || isInputActive) && (
        <div className="absolute inset-0 bg-[#FCFCF9]" />
      )}
    </div>
  );
};

// Layer 2: Sidebar Layer (Fixed)
const SidebarLayer: React.FC<{
  isHome: boolean;
  isSidebarOpen: boolean;
  isPinned: boolean;
  threadsList: Array<{ id: string; name: string; messages: MessagesProps[] }>;
  activeThread: string | null;
  user: any;
  isHistoryLoading: boolean;
  isHistoryFetching: boolean;
  onThreadSelect: (threadId: string) => void;
  onReset: () => void;
  onTogglePin: () => void;
  onSidebarLeave: () => void;
}> = ({
  isHome,
  isSidebarOpen,
  isPinned,
  threadsList,
  activeThread,
  user,
  isHistoryLoading,
  isHistoryFetching,
  onThreadSelect,
  onReset,
  onTogglePin,
  onSidebarLeave,
}) => {
  const router = useRouter();

  if (!isHome) return null;

  return (
    <aside
      onMouseLeave={onSidebarLeave}
      className={cn(
        'relative left-0 top-0 h-full flex-col border-r border-gray-200 bg-white p-4 z-20 transition-all duration-300 ease-in-out flex overflow-hidden justify-items-between',
        isSidebarOpen
          ? activeThread !== '' && activeThread !== null
            ? 'w-[50%]'
            : 'w-[20%]'
          : 'w-0 p-0 border-none',
      )}
    >
      <div className="mt-4 flex items-center justify-between px-4 pt-2">
        <h2 className="font-semibold text-gray-600">
          Threads ({threadsList.length})
        </h2>
        <button
          onClick={onReset}
          className="rounded-full bg-orange-100 p-1 text-orange-600 hover:bg-orange-200 cursor-pointer"
        >
          <IconPlus size={16} />
        </button>
        <button
          onClick={onTogglePin}
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
        <nav className="mt-4 flex-grow overflow-y-auto">
          {threadsList.length > 0 && !isHistoryLoading && !isHistoryFetching ? (
            <ul>
              {threadsList.map((thread) => (
                <li key={thread.id} className="mb-2">
                  <UnstyledButton
                    onClick={() => onThreadSelect(thread.id)}
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
        <div className="flex flex-col mt-5 gap-3 items-center justify-items-center">
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
  );
};

// Layer 4: Content Layer (Scrollable)
const ContentLayer: React.FC<{
  isHome: boolean;
  isMobile: boolean | undefined;
  experienceData: any;
  isThreadFetching: boolean;
  isThreadLoading: boolean;
  messages: MessagesProps[];
  isLoading: boolean;
  unfoldingTexts: string;
  floatingTexts: string;
  isSessionActive: boolean;
  onSend: (
    input: string,
    images: Array<{ image: string | null; name: string | null }>,
  ) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}> = ({
  isHome,
  isMobile,
  experienceData,
  isThreadFetching,
  isThreadLoading,
  messages,
  isLoading,
  unfoldingTexts,
  floatingTexts,
  onSend,
  messagesEndRef,
  isSessionActive,
}) => {
  return (
    <div
      className={cn(
        'relative w-full z-10 overflow-y-auto flex flex-col items-center',
        {
          'h-full': isHome,
          'h-[80%]': !isHome,
          'pt-0': !isHome,
        },
      )}
    >
      <div className="w-full mx-auto flex flex-col items-center px-4">
        {/* Experience Follow-up Card */}
        {experienceData && messages.length !== 0 && (
          <Link href={`/discoveries/${experienceData.id}`} className="w-full">
            <Container
              className={cn(
                'flex flex-col mt-5 mb-3 p-3 gap-2.5 shadow-md bg-[#FFF0E5] rounded-md hover:bg-gray-100 cursor-pointer w-full justify-between',
              )}
            >
              <span className="flex flex-row items-center text-[14px] color-purple-200 text-purple-500 gap-2 w-full">
                <Image
                  alt=""
                  src="/assets/followup.svg"
                  width={isMobile ? 12 : 16}
                  height={isMobile ? 12 : 16}
                  className="size-[24px]"
                />
                Follow up to
              </span>
              <div className="flex flex-row self-start items-center justify-between gap-2 w-full">
                <h2
                  className={cn({
                    'text-[16px]': isMobile,
                    'text-display-[16px]': !isMobile,
                  })}
                >
                  {experienceData.name}
                </h2>
              </div>
            </Container>
          </Link>
        )}

        {/* Chat Messages */}
        {(isThreadFetching || isThreadLoading) &&
        (messages.length === 0 || !isSessionActive) ? (
          <div className="w-full bg-[#FCFCF9]">
            <ThreadLoading />
          </div>
        ) : (
          <div className="w-full">
            <BuddyResponse
              threadId=""
              isLoading={isLoading}
              displayText={unfoldingTexts}
              messages={messages}
              reasoning={floatingTexts}
              setInput={(text: string) => onSend(text, [])}
              isMobile={isMobile}
              ref={messagesEndRef}
            />
          </div>
        )}
      </div>
      {messages.length === 0 &&
        !isThreadFetching &&
        !isThreadLoading &&
        !isSessionActive && (
          <div className="flex flex-col h-full place-self-center justify-center">
            <h2
              className={cn('text-[#FE6F1C]', {
                'text-[24px]': isMobile,
                'text-[40px] mt-40': !isMobile,
              })}
            >
              Welcome to Travel Buddy!
            </h2>
          </div>
        )}
    </div>
  );
};

// Move ThreadLoading to top-level
const ThreadLoading = () => (
  <div className="flex flex-col items-start justify-center gap-2 z-0 mt-5 bg-[#FCFCF9]">
    <Skeleton height={25} width="40%" />
    <Skeleton height={20} width="100%" />
    <Skeleton height={20} width="100%" />
    <Skeleton height={20} width="80%" />
    <Skeleton height={20} width="60%" />
    <Skeleton height={25} width="40%" />
    <Skeleton height={20} width="100%" />
    <Skeleton height={20} width="100%" />
    <Skeleton height={20} width="80%" />
    <Skeleton height={20} width="60%" />
  </div>
);

// Main Component with Layered Architecture
const BuddyAI = ({ context }: { context?: { [key: string]: string } }) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { user } = useAuth();
  const { resetState: resetFromContext } = useChat();
  const searchParams = useSearchParams();
  const threadId =
    searchParams.get('threadId') || sessionStorage.getItem('thread-id');
  const companyId = searchParams.get('companyId');
  const isHome = pathname === '/';
  const [experienceId, setExperienceId] = useState<string | null>(null);
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const [buddyStreamMutation] = useBuddyStreamMutation();
  const [isPinned, setIsPinned] = useState(false);
  const [resetState, setResetState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<string>('');
  const [unfoldingTexts, setUnfoldingTexts] = useState<string>('');
  const [charIndex, setCharIndex] = useState<number>(0);
  const [messages, setMessages] = useState<MessagesProps[]>([]);
  const chatSessionId = useRef<string | null>(threadId ?? null);
  const [activeThread, setActiveThread] = useState<string | null>(
    threadId ?? chatSessionId.current ?? null,
  );
  const [isInputActive, setIsInputActive] = useState(false);
  const [initialSuggestions, setInitialSuggestions] =
    useState<string[]>(suggestionChips);

  const concatenateStreamingMessage = useRef<string>('');

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

  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    setIsIOS(isIOS);
  }, []);

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
      session_id: activeThread,
    },
    {
      skip: activeThread === '' || !threadId || threadId === '',
    },
  );

  const { data: fetchedInitialSuggestions } = useGetInitialSuggestionsQuery(
    {
      experienceId: experienceId as string,
      companyId: companyId ?? (experienceData?.owned_by as string),
    },
    {
      skip: !isHome,
    },
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        block: 'end',
        behavior: 'smooth',
      });
    }
  }, [messages, unfoldingTexts]);

  // const scrollToBottom = useCallback(() => {
  //   messagesEndRef.current?.scrollTo({
  //     behavior: 'smooth',
  //     top: messagesEndRef.current?.scrollHeight,
  //   });
  // }, []);

  useEffect(() => {
    if (threadId && threadId !== '') {
      setActiveThread(threadId);
      chatSessionId.current = threadId;
    }
  }, [threadId]);

  useEffect(() => {
    if (params.experienceId) {
      setExperienceId(params.experienceId as string);
    }
    if (searchParams.get('experienceId')) {
      setExperienceId(searchParams.get('experienceId') as string);
    }
  }, [params.experienceId, searchParams.get('experienceId')]);

  const handleFollowUpTitle = useCallback(() => {
    if (experienceId && typeof window !== 'undefined') {
      const storedInput = localStorage.getItem('chat-input');
      if (storedInput && storedInput !== '' && messages.length === 0) {
        console.log('storedInput', storedInput);
        handleSend(storedInput);
        localStorage.removeItem('chat-input'); // Clear after using
      }
    }
  }, [experienceId, messages.length]);

  useEffect(() => {
    handleFollowUpTitle();
  }, [experienceId, handleFollowUpTitle]);

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

      setThreadsList(mappedChatHistory);
    }
  }, [historyData, threadsList]);

  // useEffect(() => {
  //   scrollToBottom();
  // }, [unfoldingTexts, messages, scrollToBottom]);

  useEffect(() => {
    if (resetData) {
      setResetState(false);
    }
  }, [resetData]);

  useEffect(() => {
    if (resetFromContext) {
      handleReset();
    }
  }, [resetFromContext]);

  const togglePin = () => {
    setIsPinned((prev) => !prev);
    if (!isPinned) {
      setIsSidebarOpen(true);
    }
  };

  const handleReset = useCallback(() => {
    if (
      user &&
      threadsList.find((thread) => thread.id === activeThread) === undefined
    ) {
      refetchHistoryData();
    }
    sessionStorage.removeItem('thread-id');
    localStorage.removeItem('chat-input');
    setExperienceId(null);
    setResetState(true);
    setActiveThread(null);
    chatSessionId.current = null;
    setMessages([]);
    setUnfoldingTexts('');
    concatenateStreamingMessage.current = '';
    setCharIndex(0);
    setFloatingTexts('');
    setIsLoading(false);
  }, [activeThread, refetchHistoryData, threadsList, user]);

  const handleThreadSelect = useCallback(
    (selectedThreadId: string) => {
      // console.log('selectedThreadId:', selectedThreadId);
      sessionStorage.setItem('thread-id', selectedThreadId);
      setActiveThread(selectedThreadId);
      chatSessionId.current = selectedThreadId;
      setMessages(
        threadsList.find((thread) => thread.id === selectedThreadId)
          ?.messages || [],
      );
      // scrollToBottom();
    },
    [threadsList],
  );

  const handleSend = useCallback(
    async (
      text: string,
      images: Array<{ image: string | null; name: string | null }> = [],
    ) => {
      if (!isHome) {
        handleReset();
        localStorage.setItem('chat-input', text);
        router.push(`/?experienceId=${experienceId}`);
      }
      setIsLoading(true);
      setIsInputActive(false);
      concatenateStreamingMessage.current = '';
      setUnfoldingTexts('');
      setCharIndex(0);
      setMessages([
        ...messages,
        {
          from: 'user',
          text: text,
          tag: '',
          images: images.map((image) => image.image || ''),
        },
      ]);
      try {
        await buddyStreamMutation({
          body: {
            query: text,
            images: images.map((image) => image.image || '') || [],
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
      }
    },
    [
      buddyStreamMutation,
      companyId,
      context,
      experienceId,
      handleReset,
      isHome,
      messages,
      router,
    ],
  );

  const handleOnChunkAvailable = useCallback(
    (chunk: any) => {
      setFloatingTexts('');
      if (chunk.event === 'reasoning' || chunk.event === 'retrieving') {
        // console.log('Reasoning: ', base64ToUnicode(chunk.data?.response));
        setFloatingTexts((prevText) =>
          chunk.data?.response
            ? prevText + '\n' + base64ToUnicode(chunk.data?.response)
            : prevText,
        );
        return;
      }
      if (chunk.event === 'answering') {
        concatenateStreamingMessage.current += base64ToUnicode(
          chunk.data?.response,
        );
        //   console.log("Latest message role: ", messages[messages.length - 1]?.from)
        //   if(messages[messages.length - 1]?.from === 'user') {
        //     setMessages((prevMessages) => [
        //       ...prevMessages,
        //       {
        //         from: 'assistant',
        //         text: concatenateStreamingMessage.current,
        //         tag: chunk.event,
        //         images: [],
        //         sources: [],
        //         suggestions: [],
        //       },
        //     ]);
        //   }
        //   setLatestBotMessage({
        //     from: 'assistant',
        //     text: concatenateStreamingMessage.current,
        //     tag: '',
        //     images: [],
        //     sources: [],
        //     suggestions: [],
        //   });
        //   setActiveThread(chunk.data?.session_id);
        //   sessionStorage.setItem('thread-id', chunk.data?.session_id);
        //   chatSessionId.current = chunk.data?.session_id;
      }

      if (chunk.event === 'complete') {
        setIsLoading(false);
        setActiveThread(chunk.data?.session_id);
        sessionStorage.setItem('thread-id', chunk.data?.session_id);
        chatSessionId.current = chunk.data?.session_id;
        // setMessages((prevMessages) => {
        //   const truncateLastMessage = prevMessages.slice(0, prevMessages.length - 1);
        //   // const lastMessage = prevMessages[prevMessages.length - 1];
        //   return [
        //   ...truncateLastMessage,
        //   {
        //     // ...lastMessage,
        //     from: 'assistant',
        //     tag: chunk.event,
        //     text: concatenateStreamingMessage.current,
        //     images: chunk.data?.images || [],
        //     sources: chunk.data?.sources || [],
        //     suggestions: chunk.data?.suggestions || [],
        //   },
        // ]});
        // setUnfoldingTexts('');
        // setCharIndex(0);

        setMessages((prevMessages) => [
          ...prevMessages,
          {
            from: 'assistant',
            tag: chunk.event,
            text: base64ToUnicode(chunk.data?.response),
            images: chunk.data?.images || [],
            sources: chunk.data?.sources || [],
            suggestions: chunk.data?.suggestions || [],
          },
        ]);
        refetchHistoryData();
        // scrollToBottom();
      }
      // return;
    },
    [refetchHistoryData],
  );

  const handleSidebarLeave = useCallback(() => {
    if (!isPinned) {
      setIsSidebarOpen(false);
    }
  }, [isPinned, setIsSidebarOpen]);

  useEffect(() => {
    if (threadId && threadId !== '' && threadData && threadData.data) {
      setActiveThread(threadId);
      chatSessionId.current = threadId;
      setMessages(
        threadData?.data?.chat_messages?.map((item) => ({
          from: item.role,
          text: item.content,
          tag: item.role === 'user' ? 'user' : 'assistant',
          images: item.metadata?.images || [],
          sources: item.metadata?.sources || [],
          suggestions:
            item.metadata?.suggestions ||
            item.metadata?.follow_up_questions ||
            [],
        })),
      );
      // scrollToBottom();
    }
  }, [threadId, threadData]);

  useEffect(() => {
    if (
      concatenateStreamingMessage.current !== '' &&
      concatenateStreamingMessage.current !== null &&
      concatenateStreamingMessage.current?.length > 0 &&
      charIndex < concatenateStreamingMessage.current?.length &&
      messages.length > 0 &&
      messages[messages.length - 1]?.from === 'assistant'
      // &&
      // messages[messages.length - 1]?.tag !== 'complete'
    ) {
      const text = concatenateStreamingMessage.current;
      const timer = setTimeout(() => {
        setUnfoldingTexts((prevText) => prevText + text[charIndex]);
        setCharIndex((prevIndex) => prevIndex + 1);
      }, 1);

      return () => clearTimeout(timer);
    }
  }, [charIndex, unfoldingTexts, messages, concatenateStreamingMessage]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Main flex-row container: [Sidebar][MainContentColumn] */}
      <div className="flex flex-row h-screen w-full z-10">
        {/* Sidebar Layer */}
        <SidebarLayer
          isHome={isHome}
          isSidebarOpen={isSidebarOpen}
          isPinned={isPinned}
          threadsList={threadsList}
          activeThread={activeThread}
          user={user}
          isHistoryLoading={isHistoryLoading}
          isHistoryFetching={isHistoryFetching}
          onThreadSelect={handleThreadSelect}
          onReset={handleReset}
          onTogglePin={togglePin}
          onSidebarLeave={handleSidebarLeave}
        />

        {/* MainContentColumn: flex-col [ScrollableContent][Chatbox] */}
        <div className="flex pt-18 md:pt-2 grow flex-col min-w-0">
          <BackgroundLayer
            isHome={isHome}
            hasMessages={messages.length > 0}
            isInputActive={isInputActive}
          />
          <div className="flex grow h-[100dvh] flex-col overflow-hidden mx-auto w-[90%] md:w-[70%]">
            {/* Scrollable content area (only this should scroll) */}
            <div className="relative flex-1 overscroll-none overflow-y-auto">
              <ContentLayer
                isHome={isHome}
                isMobile={isMobile}
                experienceData={experienceData}
                isThreadFetching={isThreadFetching}
                isThreadLoading={isThreadLoading}
                messages={messages}
                isLoading={isLoading}
                unfoldingTexts={unfoldingTexts}
                floatingTexts={floatingTexts}
                onSend={handleSend}
                messagesEndRef={messagesEndRef}
                isSessionActive={
                  !!activeThread && activeThread !== null && activeThread !== ''
                }
              />
            </div>
            {/* Chatbox always visible at the bottom */}
            <div
              className={cn(
                'w-full shrink min-w-0 mb-40',
                messages.length > 0 && !isMobile && 'mb-10',
                messages.length > 0 && isMobile && !isIOS && 'mb-[25vh]',
                messages.length > 0 && isMobile && isIOS && 'mb-[22dvh]',
              )}
            >
              <Chatbox
                isHome={isHome}
                isMobile={isMobile}
                onSend={handleSend}
                initialSuggestions={initialSuggestions}
                hasMessages={messages.length > 0}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuddyAI;
