'use client';

import { LayoutGroup, motion } from 'framer-motion';

import WordListSwap from '../animate-ui/text/word-list-swap';

export default function StoryCreationLoading() {
  const processingMessages = [
    'generating ✈️',
    'added with AI keywords 🎯',
    'optimizing... 🌍',
    'crafting with beautiful memories 🎉',
    'almost ready! 🚀',
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        {/* Loading Box */}
        <div className="border bg-white border-gray-200 rounded-lg p-6 text-center pt-10 -translate-y-10">
          <LayoutGroup>
            <motion.div
              className="text-orange-500 font-medium mb-4 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              layout={true}
            >
              <motion.p
                className="flex whitespace-pre text-xl"
                layout={true}
                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              >
                <motion.span
                  className="align-middle flex items-center"
                  layout={true}
                  transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                >
                  Your feedback is{' '}
                </motion.span>
                <motion.div
                  layout={true}
                  className="inline-block"
                  transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                >
                  <WordListSwap
                    texts={processingMessages}
                    mainClassName="text-white px-1 sm:px-1 md:px-2 bg-orange-500 overflow-hidden py-2 sm:py-1 md:py-2 justify-center rounded-lg text-xl"
                    staggerFrom="last"
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '-120%' }}
                    staggerDuration={0.025}
                    splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    rotationInterval={4000}
                  />
                </motion.div>
              </motion.p>
            </motion.div>
          </LayoutGroup>

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
