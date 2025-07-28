'use client';

import BuddyAI from '@/components/chatbot/buddy-ui-ai';

export default function Home() {
  return (
    <div className="relative h-[90vh] md:h-full w-full overflow-visible">
      <BuddyAI />
    </div>
  );
}
