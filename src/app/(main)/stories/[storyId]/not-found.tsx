import Link from 'next/link';

export default function StoryNotFound() {
  return (
    <div className="max-w-2xl mx-auto p-4 text-center">
      <div className="py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Story Not Found
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          {`The story you're looking for doesn't exist or has been removed.`}
        </p>

        <div className="space-y-4">
          <Link
            href="/stories"
            className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Browse All Stories
          </Link>

          <div className="text-sm text-gray-500">
            <p>Or</p>
            <Link
              href="/stories/new"
              className="text-orange-500 hover:text-orange-600 underline"
            >
              Create Your Own Story
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
