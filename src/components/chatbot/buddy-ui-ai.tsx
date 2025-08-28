'use client';

import { Container, Skeleton, UnstyledButton } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import Chatbox from '@/components/chatbot/chatbox';
import { base64ToUnicode } from '@/components/chatbot/streaming-hook';
import SubSidebar from '@/components/layouts/SubSidebar';
import { Translation } from '@/components/translation';
import { useAuth } from '@/contexts/auth-provider';
import { useChat } from '@/contexts/chat-provider';
import { useSidebar } from '@/contexts/sidebar-provider';
import {
  useBuddyStreamMutation,
  useGetCustomBuddyHistoryQuery,
  // useGetAllChatThreadsQuery,
  useGetInitialSuggestionsQuery,
  useGetThreadByIdQuery,
  useResetChatMemoryQuery,
} from '@/store/redux/slices/agents/buddy';
import { useGetExperiencePublicQuery } from '@/store/redux/slices/user/experience';
import { cn } from '@/utils/class';

import PageWrapper from '../layouts/PageWrapper';
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
    <div
      className={cn('absolute inset-0 w-full h-full z-0', {
        [`bg-[url(https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/chat/thumbnail/be9f7c75bbf9040889e91b5eae71b8b84d66f7d7.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jOWIwY2JhZC1hOTc4LTRkNDgtODQyYi0yOWE1OWViY2ViYTYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjaGF0L3RodW1ibmFpbC9iZTlmN2M3NWJiZjkwNDA4ODllOTFiNWVhZTcxYjhiODRkNjZmN2Q3LmpwZyIsImlhdCI6MTc1MzY3NjgyOSwiZXhwIjoyMDY5MDM2ODI5fQ.6eCc1euD2ToslJdXQZWuJwIBouliK3-9xR4dBUqDhsw)] bg-cover bg-center bg-no-repeat`]:
          isHome && !hasMessages && !isInputActive,
        'bg-[#FCFCF9]': !isHome || hasMessages || isInputActive,
      })}
    ></div>
  );
};

// Layer 2: Sidebar Layer (Fixed)
const SidebarLayer: React.FC<{
  t: (key: string, options?: any) => string;
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
  t,
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
    <SubSidebar
      title={`${t('chat.threads')} (${threadsList.length})`}
      isSidebarOpen={isSidebarOpen}
      isPinned={isPinned}
      onSidebarLeave={onSidebarLeave}
      onTogglePin={onTogglePin}
      headerActions={
        <button
          onClick={onReset}
          className="rounded-full p-1 bg-[#FFEEE6] hover:bg-gray-100 transition-colors cursor-pointer"
          title="New chat"
        >
          <IconPlus size={16} className="text-orange-600" />
        </button>
      }
      contentClassName="flex flex-col flex-grow overflow-y-auto"
    >
      {user ? (
        <div className="flex flex-col flex-shrink">
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
                        'bg-[#FFEEE6] text-gray-900':
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
        </div>
      ) : (
        <div className="flex flex-col mt-5 gap-3 items-center justify-items-center">
          <p>{t('chat.threadLoginPhrase')}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="rounded-full bg-orange-500 p-2 text-white font-semibold hover:bg-orange-700 cursor-pointer"
          >
            {t('auth.login')}
          </button>
        </div>
      )}
    </SubSidebar>
  );
};

// Layer 4: Content Layer (Scrollable)
const ContentLayer: React.FC<{
  t: (key: string, options?: any) => string;
  isHome: boolean;
  isMobile: boolean | undefined;
  experienceId: string | undefined | null;
  experienceData: any;
  isThreadFetching: boolean;
  isThreadLoading: boolean;
  threadId: string;
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
  t,
  isHome,
  isMobile,
  experienceId,
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
    <div className="w-full flex flex-col items-center">
      {(isThreadFetching || isThreadLoading) &&
        (!isSessionActive || messages.length === 0) && (
          <div className="w-full bg-[#FCFCF9] mx-auto my-10">
            <ThreadLoading />
          </div>
        )}
      {(experienceData || messages.length > 0) && (
        <div className="w-full mx-auto flex flex-col items-center pb-4">
          {/* Experience Follow-up Card */}
          {experienceData &&
            messages.length !== 0 &&
            experienceId &&
            experienceId !== '' && (
              <Link
                href={`/discoveries/${experienceData.id}`}
                className="w-full"
              >
                <Container
                  className={cn(
                    'flex flex-col mt-5 mb-3 p-3 gap-2.5 shadow-md bg-[#FFEEE6] rounded-md hover:bg-gray-100 cursor-pointer w-full justify-between',
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
                    {t('chat.followUpTo')}
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
          {((!isThreadFetching && !isThreadLoading) ||
            (isSessionActive && messages.length !== 0)) && (
            <div className="w-full">
              <BuddyResponse
                isLoading={isLoading}
                displayText={unfoldingTexts}
                messages={messages}
                reasoning={floatingTexts}
                setInput={(text: string) => onSend(text, [])}
                ref={messagesEndRef}
              />
            </div>
          )}
        </div>
      )}
      {messages.length === 0 &&
        !isThreadFetching &&
        !isThreadLoading &&
        !isSessionActive && (
          <div
            className={cn('flex flex-col place-self-center h-[80px]', {
              'justify-baseline': isHome && !isMobile,
            })}
          >
            <h2
              className={cn('text-white font-semibold', {
                'text-[24px]': isMobile,
                'text-[40px]': !isMobile,
              })}
            >
              {t('chat.landingPageWelcome')}
            </h2>
          </div>
        )}
    </div>
  );
};

// Move ThreadLoading to top-level
const ThreadLoading = () => (
  <div className="flex flex-col items-start justify-center gap-2 z-100 mt-5 bg-[#FCFCF9]">
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
  const { user, setIsDefault } = useAuth();
  const { resetState: resetFromContext } = useChat();
  const searchParams = useSearchParams();
  const threadId = searchParams.get('threadId');
  const companyId =
    searchParams.get('companyId') || sessionStorage.getItem('company_id');
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

  const [isSent, setIsSent] = useState<boolean>(false);

  const concatenateStreamingMessage = useRef<string>('');

  const language = useMemo(() => {
    return sessionStorage.getItem('language') || 'en-US';
  }, []);

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
  } = useGetCustomBuddyHistoryQuery(undefined, {
    skip: !user,
  });

  const {
    data: threadData,
    isFetching: isThreadFetching,
    isLoading: isThreadLoading,
    // refetch: refetchThreadData,
  } = useGetThreadByIdQuery(
    {
      session_id: activeThread,
    },
    {
      skip:
        activeThread === '' ||
        !threadId ||
        threadId === '' ||
        messages.length > 0,
      // refetchOnMountOrArgChange: true
    },
  );

  const { data: fetchedInitialSuggestions } = useGetInitialSuggestionsQuery(
    {
      experienceId: experienceId as string,
      companyId: companyId ?? (experienceData?.owned_by as string),
      language,
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

  useEffect(() => {
    if (threadId && threadId !== '') {
      setIsDefault(false);
      setActiveThread(threadId);
      chatSessionId.current = threadId;
      // refetchThreadData();
    }
  }, [threadId, setIsDefault, setActiveThread, chatSessionId]);

  useEffect(() => {
    if (params.experienceId) {
      setExperienceId(params.experienceId as string);
    }
    if (searchParams.get('experienceId')) {
      setExperienceId(searchParams.get('experienceId') as string);
    }
  }, [params.experienceId, searchParams.get('experienceId')]);

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

  const togglePin = useCallback(() => {
    setIsPinned((prev) => !prev);
    if (!isPinned) {
      setIsSidebarOpen(true);
    }
  }, [isPinned, setIsPinned, setIsSidebarOpen]);

  const handleReset = useCallback(() => {
    if (
      user &&
      threadsList.find((thread) => thread.id === activeThread) === undefined
    ) {
      refetchHistoryData();
    }
    setExperienceId(null);
    setResetState(true);
    setActiveThread(null);
    setIsDefault(true);
    chatSessionId.current = null;
    concatenateStreamingMessage.current = '';
    setMessages([]);
    setUnfoldingTexts('');
    setCharIndex(0);
    setFloatingTexts('');
    setIsLoading(false);
    sessionStorage.removeItem('chat-input');
    sessionStorage.removeItem('experience_id');
    sessionStorage.removeItem('company_id');
    router.replace('/');
  }, [activeThread, refetchHistoryData, threadsList, user, router]);

  const handleThreadSelect = useCallback(
    (selectedThreadId: string) => {
      setActiveThread(selectedThreadId);
      chatSessionId.current = selectedThreadId;
      const matchedThread = threadsList.find(
        (thread) => thread.id === selectedThreadId,
      );
      if (matchedThread) {
        setMessages(matchedThread.messages);
      }
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set('threadId', selectedThreadId);
      router.push(`/?${params.toString()}`);
    },
    [
      threadsList,
      setActiveThread,
      chatSessionId,
      searchParams,
      router,
      setMessages,
    ],
  );

  const handleOnChunkAvailable = useCallback(
    (chunk: any) => {
      setFloatingTexts('');
      if (chunk.event === 'reasoning' || chunk.event === 'retrieving') {
        setFloatingTexts((prevText) =>
          chunk.data?.response
            ? prevText + '\n' + base64ToUnicode(chunk.data?.response)
            : prevText,
        );
        return;
      }
      if (chunk.event === 'answering') {
        setIsLoading(false);
        concatenateStreamingMessage.current += chunk.data?.response
          ? base64ToUnicode(chunk.data?.response)
          : '';

        setMessages((prevMessages) => {
          const truncateLastMessage = prevMessages.slice(
            0,
            prevMessages.length - 1,
          );
          const lastMessage = prevMessages[prevMessages.length - 1];
          return [
            ...(lastMessage?.from === 'assistant'
              ? truncateLastMessage
              : prevMessages),
            {
              ...(lastMessage?.from === 'assistant' ? lastMessage : {}),
              from: 'assistant',
              tag: chunk.event,
              text: concatenateStreamingMessage.current,
              images: chunk.data?.images || [],
              sources: chunk.data?.sources || [],
              suggestions: chunk.data?.suggestions || [],
            },
          ];
        });
      }

      if (chunk.event === 'complete') {
        setIsLoading(false);
        setMessages((prevMessages) => {
          const truncateLastMessage = prevMessages.slice(
            0,
            prevMessages.length - 1,
          );
          const lastMessage = prevMessages[prevMessages.length - 1];
          return [
            ...truncateLastMessage,
            {
              ...lastMessage,
              from: 'assistant',
              tag: chunk.event,
              images: chunk.data?.images || [],
              sources: chunk.data?.sources || [],
              suggestions: chunk.data?.suggestions || [],
            },
          ];
        });
        chatSessionId.current = chunk.data?.session_id;
        sessionStorage.removeItem('chat-input');
        router.replace(
          `/?${experienceId ? `&experienceId=${experienceId}&` : ''}threadId=${chunk.data?.session_id}`,
        );
      }
    },
    [router, experienceId],
  );

  const handleSend = useCallback(
    async (
      text: string,
      images: Array<{ image: string | null; name: string | null }> = [],
    ) => {
      setIsDefault(false);
      if (!isHome) {
        handleReset();
        sessionStorage.setItem('chat-input', text);
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
      // sessionStorage.removeItem('chat-input');
      setIsSent(true);
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
      handleOnChunkAvailable,
      setIsDefault,
      setIsSent,
    ],
  );

  useEffect(() => {
    if (experienceId && !isSent) {
      setIsDefault(false);
      // console.log('Sent: ', isSent);
      const storedInput = sessionStorage.getItem('chat-input');
      if (storedInput && storedInput !== '' && messages.length === 0) {
        handleSend(storedInput);
      }
    }
  }, [
    experienceId,
    handleSend,
    setIsDefault,
    messages.length,
    isSent,
    handleReset,
  ]);

  const handleSidebarLeave = useCallback(() => {
    if (!isPinned) {
      setIsSidebarOpen(false);
    }
  }, [isPinned, setIsSidebarOpen]);

  useEffect(() => {
    if (
      threadId &&
      threadId !== '' &&
      threadData &&
      threadData.data &&
      threadData.data.chat_messages &&
      messages.length === 0 &&
      threadData.data.id === threadId
    ) {
      setUnfoldingTexts('');
      setCharIndex(0);
      setActiveThread(threadId);
      chatSessionId.current = threadId;

      setMessages(
        threadData.data.chat_messages.map((item) => ({
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
    }
  }, [threadId, threadData, activeThread, messages]);

  useEffect(() => {
    if (
      messages[messages.length - 1]?.from === 'assistant' &&
      concatenateStreamingMessage.current !== null &&
      concatenateStreamingMessage.current !== '' &&
      concatenateStreamingMessage.current.length > charIndex
    ) {
      const text = concatenateStreamingMessage.current;
      const timer = setTimeout(() => {
        setUnfoldingTexts((prevText) => prevText + text[charIndex]);
        setCharIndex((prevIndex) => prevIndex + 1);
      }, 1);

      return () => clearTimeout(timer);
    }
  }, [charIndex, unfoldingTexts, messages]); // messages

  return (
    <Translation>
      {(t) => (
        <div className="h-full w-full">
          {/* Main flex-row container: [Sidebar][MainContentColumn] */}
          <div className="flex h-full flex-row w-full z-10">
            {/* Sidebar Layer - Fixed */}
            <SidebarLayer
              t={t}
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
            <div className="flex pt-18 md:pt-2 grow flex-col min-w-0 z-10 relative h-full overflow-hidden">
              <BackgroundLayer
                isHome={isHome}
                hasMessages={messages.length > 0}
                isInputActive={
                  isInputActive || isThreadFetching || isThreadLoading
                }
              />
              {/* <ChatWrapper className='bg-transparent'> */}
              {/* Main content container with proper flex layout */}
              <div
                className={cn('flex flex-col h-full w-full z-10 gap-0', {
                  'justify-center': messages.length === 0 && !isMobile,
                })}
              >
                {/* Scrollable content area - takes remaining space */}
                <div
                  className={cn('overflow-y-auto overscroll-none min-h-0', {
                    'flex-1': messages.length > 0 || isMobile,
                  })}
                >
                  <PageWrapper className="bg-transparent">
                    <div
                      className={cn('flex flex-col h-full w-full', {
                        'justify-center': messages.length === 0 && isMobile,
                      })}
                    >
                      <ContentLayer
                        t={t}
                        isHome={isHome}
                        isMobile={isMobile}
                        experienceId={experienceId}
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
                          !!activeThread &&
                          activeThread !== null &&
                          activeThread !== ''
                        }
                        threadId={activeThread || ''}
                      />
                    </div>
                  </PageWrapper>
                </div>
                {/* Fixed chatbox at bottom */}
                <div className="flex-shrink-0 pb-4 sticky bottom-0">
                  <PageWrapper className="bg-transparent">
                    <Chatbox
                      isHome={isHome}
                      isMobile={isMobile}
                      onSend={handleSend}
                      initialSuggestions={initialSuggestions}
                      hasMessages={
                        messages.length > 0 ||
                        (!!activeThread && activeThread !== '')
                      }
                    />
                  </PageWrapper>
                </div>
              </div>
              {/* </ChatWrapper> */}
            </div>
          </div>
        </div>
      )}
    </Translation>
  );
};

export default BuddyAI;
