'use client';

import { ReactNode } from 'react';

interface LoadingWrapperProps {
  isLoading: boolean;
  error: any;
  children: ReactNode;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
}

export default function LoadingWrapper({
  isLoading,
  error,
  children,
  loadingComponent,
  errorComponent,
}: LoadingWrapperProps) {
  if (isLoading) {
    return (
      loadingComponent || (
        <div className="max-w-2xl mx-auto p-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            </div>
          </div>
        </div>
      )
    );
  }

  if (error) {
    return (
      errorComponent || (
        <div className="max-w-2xl mx-auto p-4 text-center">
          <div className="py-12">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Error Loading Story
            </h1>
            <p className="text-gray-600 mb-4">
              {error?.message ||
                'Something went wrong while loading the story.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}

// Specialized loading wrapper for stories
export function StoryLoadingWrapper({
  isLoading,
  error,
  children,
}: Omit<LoadingWrapperProps, 'loadingComponent' | 'errorComponent'>) {
  return (
    <LoadingWrapper
      isLoading={isLoading}
      error={error}
      loadingComponent={
        <div className="max-w-2xl mx-auto p-4">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-2">
            <div className="h-8 bg-gray-200 rounded w-2/3 animate-pulse"></div>
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Author info skeleton */}
          <div className="text-gray-500 text-sm mb-2">
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>

          {/* Hashtags skeleton */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"
                ></div>
              ))}
            </div>
          </div>

          {/* Carousel skeleton */}
          <div className="mb-4">
            <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Content skeleton */}
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
          </div>
        </div>
      }
      errorComponent={
        <div className="max-w-2xl mx-auto p-4 text-center">
          <div className="py-12">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Error Loading Story
            </h1>
            <p className="text-gray-600 mb-4">
              {error?.message ||
                'Something went wrong while loading the story.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Try Again
            </button>
          </div>
        </div>
      }
    >
      {children}
    </LoadingWrapper>
  );
}
