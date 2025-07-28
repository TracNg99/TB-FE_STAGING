'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function StoryCreationLoading() {
  const processingMessages = [
    'Generating your custom story...',
    'Enhancing with targeted keywords',
    'Refining structure and flow',
    'Enriching with local highlights',
    'Ready! Your optimized story awaits',
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % processingMessages.length);
    }, 2000); // Even faster duration to reduce flickering

    return () => clearInterval(interval);
  }, [processingMessages.length]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        {/* Loading Box */}
        <div className="border bg-white border-gray-200 rounded-lg p-6 text-center pt-10 -translate-y-10">
          <div className="text-orange-500 font-medium mb-4 flex justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMessageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-xl font-medium"
              >
                {processingMessages[currentMessageIndex]}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Spinner */}
          <motion.div
            className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>
      </div>
    </div>
  );
}
