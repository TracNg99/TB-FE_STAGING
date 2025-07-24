'use client';

import { motion } from 'framer-motion';

interface StoryCreationLoadingProps {
  message?: string;
}

export default function StoryCreationLoading({
  message = 'Your AI-assisted story is on the way...',
}: StoryCreationLoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        className="max-w-sm w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Loading Box */}
        <div className="border bg-white border-gray-200 rounded-lg p-6 text-center">
          <motion.p
            className="text-orange-500 font-medium mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {message}
          </motion.p>

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
      </motion.div>
    </div>
  );
}
