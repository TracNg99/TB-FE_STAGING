'use client';

import { IconArrowUpRight, IconHelpCircle } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

interface FollowUpQuestionsProps {
  questions: string[];
  experienceId?: string;
  className?: string;
  disabled?: boolean;
}

export default function FollowUpQuestions({
  questions,
  experienceId,
  className = '',
  disabled = false,
}: FollowUpQuestionsProps) {
  const router = useRouter();

  const handleFollowUpClick = (question: string) => {
    if (disabled) return;
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
      <div className="text-[#222] text-[20px] font-semibold flex items-center gap-2 mb-2">
        <IconHelpCircle size={32} className="text-orange-500" />{' '}
        <span className="text-orange-500">Follow-up Questions</span>
      </div>
      <div className="flex flex-col divide-y divide-gray-200 bg-transparent">
        {questions.map((question, idx) => (
          <button
            key={idx}
            onClick={() => handleFollowUpClick(question)}
            className="w-full text-left flex justify-between items-center py-3 px-2 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
          >
            <span className="text-gray-700">{question}</span>
            <IconArrowUpRight size={20} className="text-gray-400" />
          </button>
        ))}
      </div>
    </section>
  );
}
