'use client';

import { useEffect } from 'react';

export default function StoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log error to an error reporting service
    // console.error(error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto p-8 text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-4">
        Something went wrong
      </h1>
      <p className="text-lg text-gray-700 mb-6">
        {`Sorry, we couldn't load this story. Please try again or go back to the
        stories list.`}
      </p>
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
        >
          Try Again
        </button>
        <a
          href="/stories"
          className="text-orange-500 hover:text-orange-700 underline"
        >
          Back to Stories
        </a>
      </div>
      <div className="mt-8 text-xs text-gray-400">
        {error?.message && <div>Error: {error.message}</div>}
        {error?.digest && <div>Ref: {error.digest}</div>}
      </div>
    </div>
  );
}
