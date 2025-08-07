import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export default function MarkdownViewer({
  content,
  className = '',
}: MarkdownViewerProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children, ...props }) => (
            <p className="py-2 last:mb-0" {...props}>
              {children}
            </p>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal pl-3 space-y-1" {...props}>
              {children}
            </ol>
          ),
          ul: ({ children, ...props }) => (
            <ul className="list-disc pl-3 space-y-1" {...props}>
              {children}
            </ul>
          ),
          li: ({ children, ...props }) => (
            <li className="pb-2 ml-2 mb-0" {...props}>
              {children}
            </li>
          ),
          h1: ({ children, ...props }) => (
            <h1
              className="text-base md:text-lg font-semibold text-gray-800 mb-3 mt-4"
              {...props}
            >
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2
              className="text-base font-semibold text-gray-800 mb-2 mt-4"
              {...props}
            >
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3
              className="text-sm md:text-md font-semibold text-gray-800 mb-2 mt-2"
              {...props}
            >
              {children}
            </h3>
          ),
          a: ({ node: _, ...props }) => (
            <a
              style={{
                color: '#0066cc',
                textDecoration: 'underline',
                textUnderlineOffset: '2px',
              }}
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
