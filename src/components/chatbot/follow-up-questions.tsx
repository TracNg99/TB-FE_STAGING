'use client';

import { IconChevronRight } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

interface FollowUpQuestionsProps {
  questions: string[];
  experienceId?: string;
  className?: string;
}

export default function FollowUpQuestions({
  questions,
  experienceId,
  className = '',
}: FollowUpQuestionsProps) {
  const router = useRouter();

  const handleFollowUpClick = (question: string) => {
    sessionStorage.setItem('chat-input', question);
    if (experienceId) {
      router.push(`/?experienceId=${experienceId}`);
    } else {
      router.push('/');
    }
  };

  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <section className={className}>
      <div className="text-[#222] text-[20px] font-semibold flex items-center gap-2 mb-4">
        <span className="text-pink-500">❓</span>
        <span className="text-orange-500">Follow-up Questions</span>
      </div>
      <div className="flex flex-col divide-y divide-gray-200 bg-transparent">
        {questions.map((question, idx) => (
          <button
            key={idx}
            className="flex items-center justify-between py-4 px-0 text-base text-gray-800 hover:text-orange-500 transition font-medium text-left bg-transparent cursor-pointer"
            style={{ outline: 'none', border: 'none' }}
            onClick={() => handleFollowUpClick(question)}
          >
            <span>{question}</span>
            <IconChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        ))}
      </div>
    </section>
  );
}
