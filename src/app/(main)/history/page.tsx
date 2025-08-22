'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import ChatHistory, {
  ChatThreadProps,
} from '@/components/chatbot/chat-history';
import { useGetAllChatThreadsQuery } from '@/store/redux/slices/agents/buddy';

export default function History() {
  const router = useRouter();
  const [threads, setThreads] = useState<ChatThreadProps[]>([]);
  const { data: chatHistory, isFetching } = useGetAllChatThreadsQuery();

  useEffect(() => {
    if (chatHistory?.data) {
      setThreads(
        chatHistory.data.map((thread) => ({
          id: thread.id,
          user_query:
            thread.chat_messages?.find((e) => e.role === 'user')?.content || '',
          assistant_response:
            thread.chat_messages?.find((e) => e.role === 'assistant')
              ?.content || '',
          created_at: thread.created_at,
          onClick: () => {
            router.push(`/?threadId=${thread.id}`);
          },
        })),
      );
    }
  }, [chatHistory]);

  return <ChatHistory threads={threads} isLoading={isFetching} />;
}
