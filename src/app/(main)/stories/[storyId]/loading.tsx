// Improved loading skeleton for story detail page - matches latest UI
export default function StoryDetailLoading() {
  return (
    <div className="w-full flex flex-col gap-4 pt-4 pb-24 md:pb-4 min-h-screen animate-pulse">
      {/* Title and Share skeleton */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-3">
        {/* Mobile buttons skeleton */}
        <div className="flex mx-2 gap-2 justify-end md:hidden">
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
        </div>

        {/* Title skeleton */}
        <div className="h-12 bg-gray-200 rounded w-2/3 animate-pulse"></div>

        {/* Desktop buttons skeleton */}
        <div className="hidden md:flex gap-2 justify-end md:ml-2 md:align-middle">
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Author and Date Info skeleton */}
      <div className="flex items-start gap-3">
        {/* Avatar skeleton */}
        <div className="flex-shrink-0">
          <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
        </div>

        {/* Author info skeleton */}
        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-600 mb-2">
            <div className="h-5 bg-gray-200 rounded w-40 animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="text-sm">
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Image carousel skeleton - improved for mobile with taller height */}
      <div className="relative w-full rounded-lg overflow-hidden">
        <div className="h-80 md:h-96 min-w-[320px] bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse">
          <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-gray-300 rounded-full animate-pulse"></div>
              <div className="h-5 bg-gray-300 rounded w-40 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Story Content skeleton */}
      <section className="flex-1">
        <div className="space-y-4">
          <div className="h-5 bg-gray-200 rounded w-full animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-5/6 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-4/5 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-2/3 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-4/5 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-5/6 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-2/3 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-4/5 animate-pulse"></div>
        </div>
      </section>
    </div>
  );
}
