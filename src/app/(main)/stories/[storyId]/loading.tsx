// Improved loading skeleton for story detail page
export default function StoryDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Title and Share skeleton */}
      <div className="mb-2 flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-3">
        <div className="h-10 bg-gray-200 rounded w-2/3 mb-2 animate-pulse"></div>
        <div className="flex gap-2 md:ml-2 md:items-center">
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>
      {/* Author and Date Info skeleton */}
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
      {/* Divider */}
      <div className="h-[1px] bg-gray-300 w-full mb-4"></div>
      {/* Hashtags skeleton */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-4 w-16 bg-blue-100 rounded-full animate-pulse"
          ></div>
        ))}
      </div>
      {/* Image carousel skeleton */}
      <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-gray-200 animate-pulse mb-4"></div>
      {/* Story Content skeleton */}
      <div className="space-y-3 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
      </div>
    </div>
  );
}
