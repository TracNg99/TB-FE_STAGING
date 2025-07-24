// Improved Loading component for stories list page
export default function StoriesLoading() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="h-10 bg-gray-200 rounded w-1/3 mb-8 animate-pulse"></div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="border rounded-lg p-4 shadow-sm flex flex-col gap-3"
          >
            {/* Image skeleton */}
            <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-gray-200 animate-pulse mb-2"></div>
            {/* Title skeleton */}
            <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse mb-1"></div>
            {/* Author/date skeleton */}
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse mb-1"></div>
            {/* Hashtags skeleton */}
            <div className="flex gap-2 mb-1">
              {[1, 2, 3].map((j) => (
                <div
                  key={j}
                  className="h-4 w-12 bg-blue-100 rounded-full animate-pulse"
                ></div>
              ))}
            </div>
            {/* Content skeleton */}
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
