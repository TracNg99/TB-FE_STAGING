'use client';

export default function NewStorySkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Title skeleton to align with header */}
      <div className="h-8 md:h-10 w-2/3 bg-gray-200 rounded animate-pulse mb-6" />

      {/* Form skeleton */}
      <div className="flex flex-col gap-6">
        {/* Experience select */}
        <div>
          <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse" />
        </div>

        {/* Upload area */}
        <div>
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="w-full aspect-[4/3] bg-gray-200 rounded-md animate-pulse" />
        </div>

        {/* Notes textarea */}
        <div>
          <div className="h-4 w-36 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-32 w-full bg-gray-200 rounded-md animate-pulse" />
        </div>

        {/* Submit button */}
        <div className="w-full flex justify-center">
          <div className="h-14 w-full md:w-80 bg-gray-200 rounded-md animate-pulse" />
        </div>
      </div>
    </div>
  );
}
