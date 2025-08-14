'use client';

import { Popover } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  ChevronDown,
  ChevronUp,
  FastForward,
  Headphones,
  Pause,
  Play,
  Rewind,
  SkipBack,
  SkipForward,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

// Removed direct lazy query import - language changes handled by parent callback

// Auto-scrolling title component for long titles
type ScrollingTitleProps = {
  title: string;
  className?: string;
};

const ScrollingTitle = ({ title, className }: ScrollingTitleProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [scrollDistance, setScrollDistance] = useState(0);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        // Force a reflow to get accurate measurements
        void containerRef.current.offsetHeight;

        const containerWidth = containerRef.current.offsetWidth;
        const textWidth = textRef.current.scrollWidth;
        const overflow = textWidth > containerWidth + 10; // Add 10px buffer
        setShouldScroll(overflow);

        if (overflow) {
          // Calculate exact scroll distance needed to show all text
          const distance = textWidth - containerWidth;
          setScrollDistance(distance);
        }
      }
    };

    // Multiple checks to ensure proper measurement
    const timeoutId1 = setTimeout(checkOverflow, 50);
    const timeoutId2 = setTimeout(checkOverflow, 200);
    const timeoutId3 = setTimeout(checkOverflow, 500);

    window.addEventListener('resize', checkOverflow);

    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [title]);

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden w-full', className)}
      style={{ minWidth: 0 }} // Ensure the container can shrink
    >
      <div
        ref={textRef}
        className="whitespace-nowrap"
        style={{
          display: 'inline-block',
          minWidth: '100%',
          animation: shouldScroll
            ? 'marqueeScroll 15s ease-in-out infinite'
            : 'none',
        }}
      >
        {title}
      </div>

      {/* Inline CSS animation definition */}
      <style>{`
        @keyframes marqueeScroll {
          0% {
            transform: translateX(0px);
          }
          10% {
            transform: translateX(0px);
          }
          30% {
            transform: translateX(-${scrollDistance}px);
          }
          40% {
            transform: translateX(-${scrollDistance}px);
          }
          60% {
            transform: translateX(0px);
          }
          100% {
            transform: translateX(0px);
          }
        }
      `}</style>
    </div>
  );
};

// Mock data structure
type TranscriptSegment = {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  chapterId: string;
};

export type Chapter = {
  id: string;
  title: string;
  chapterId: string;
  bg_image_url: string;
  author?: string;
  created_by?: string;
  transcript?: string | TranscriptSegment[];
  audioUrl?: string;
};

type AudioContent = {
  id: string;
  title: string;
  created_by: string;
  owner: string;
  backgroundImage: string;
  audioUrl: string;
  duration: number;
  transcript: TranscriptSegment[];
  chapters?: Chapter[];
  chapterContents?: Record<
    string,
    {
      chapterId: string;
      bg_image_url: string;
      author?: string;
      created_by?: string;
      transcript?: string | TranscriptSegment[];
      audioUrl?: string;
    }
  >;
  language?: string;
};

// (Removed mock data to avoid unused variable lint error)

type AudioDrawerProps = {
  content: AudioContent;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onLanguageChange?: (language: string) => Promise<void>;
  onChapterChange?: (chapterId: string) => void;
  isFetching?: boolean;
};

export const languages = [
  { value: 'en-US', label: 'English', flag: '🇬🇧' },
  { value: 'ko-KR', label: '한국어', flag: '🇰🇷' },
  { value: 'ja-JP', label: '日本語', flag: '🇯🇵' },
  { value: 'fr-FR', label: 'Français', flag: '🇫🇷' },
  { value: 'zh-CN', label: '中文', flag: '🇨🇳' },
  { value: 'vi-VN', label: 'Tiếng Việt', flag: '🇻🇳' },
  { value: 'ru-RU', label: 'Русский', flag: '🇷🇺' },
];
export function AudioDrawer({
  content,
  isOpen,
  onOpenChange,
  onLanguageChange,
  onChapterChange,
  isFetching = false,
}: AudioDrawerProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  // Chapters are not used in this design iteration
  const [localTranscript, setLocalTranscript] = useState<TranscriptSegment[]>(
    content.transcript || [],
  );
  // const [showChapterDropdown, setShowChapterDropdown] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [dragY, setDragY] = useState(0);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const transcriptItemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const userScrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUserScrollingRef = useRef(false);
  const isDraggingRef = useRef(false);
  const CLOSE_THRESHOLD_PX = 140;
  const MAX_DRAG_PX = 180;
  const hasReachedEndRef = useRef(false);
  const [currentLanguage, setCurrentLanguage] = useState<string>(
    content.language || 'en-US',
  );
  // isFetching now comes from parent hook
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isChapterOpen, setIsChapterOpen] = useState(false);

  // Determine current transcript index based on playback time
  const currentIndex = localTranscript.findIndex(
    (s) => currentTime >= s.startTime && currentTime < s.endTime,
  );

  // Auto-scroll to keep current line centered unless user is actively scrolling
  useEffect(() => {
    if (currentIndex < 0 || isUserScrollingRef.current) return;
    const container = transcriptContainerRef.current;
    const item = transcriptItemRefs.current[currentIndex];
    if (!container || !item) return;
    const containerCenter = container.clientHeight / 2;
    const itemCenter =
      item.offsetTop - container.scrollTop + item.clientHeight / 2;
    const delta = itemCenter - containerCenter;
    container.scrollTo({
      top: container.scrollTop + delta,
      behavior: 'smooth',
    });
  }, [currentIndex]);

  const handleTranscriptScroll: React.UIEventHandler<HTMLDivElement> = () => {
    isUserScrollingRef.current = true;
    if (userScrollTimeout.current) clearTimeout(userScrollTimeout.current);
    userScrollTimeout.current = setTimeout(() => {
      const container = transcriptContainerRef.current;
      if (!container || localTranscript.length === 0) return;
      // Do not seek playback on scroll end; simply re-enable auto-follow
      isUserScrollingRef.current = false;
    }, 1000);
    const container = transcriptContainerRef.current;
    if (container) {
      const atBottom =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 4;
      if (atBottom) hasReachedEndRef.current = true;
    }
  };
  // Reset when new content or drawer opens
  useEffect(() => {
    if (!isOpen) {
      // Pause when closing
      if (audioRef.current) {
        audioRef.current.pause();
        try {
          audioRef.current.currentTime = 0;
        } catch (_err) {
          // ignored
        }
      }
      setIsPlaying(false);
      return;
    }
    setIsLoading(true);
    setCurrentTime(0);
    setDuration(0);
    // Initialize language from content
    if (content.language) setCurrentLanguage(content.language);
    // Reset transcript from incoming content
    setLocalTranscript(
      Array.isArray(content.transcript) ? content.transcript : [],
    );
    // Stop any previous playback when switching content
    if (audioRef.current) {
      audioRef.current.pause();
      try {
        audioRef.current.currentTime = 0;
      } catch (_err) {
        // ignored
      }
    }
  }, [
    content.id,
    content.audioUrl,
    isOpen,
    content.transcript,
    content.language,
  ]);
  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle play/pause
  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle skip
  const skipTime = (seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Handle transcript click
  const jumpToTime = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Chapter navigation functions
  const getCurrentChapterIndex = () => {
    if (!content.chapters) return -1;
    return content.chapters.findIndex((chapter) => chapter.id === content.id);
  };

  const skipToPreviousChapter = () => {
    if (!content.chapters || !onChapterChange) return;

    // If current time > 10 seconds, just restart current chapter
    if (currentTime > 10) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
      }
      return;
    }

    // Otherwise, go to previous chapter
    const currentIndex = getCurrentChapterIndex();
    if (currentIndex > 0) {
      onChapterChange(content.chapters[currentIndex - 1].id);
    }
  };

  const skipToNextChapter = () => {
    if (!content.chapters || !onChapterChange) return;
    const currentIndex = getCurrentChapterIndex();
    if (currentIndex < content.chapters.length - 1 && currentIndex >= 0) {
      onChapterChange(content.chapters[currentIndex + 1].id);
    }
  };

  // Chapters not used; transcript is full list

  // Smart sentence splitting for different languages (moved outside useEffect)
  const splitIntoSentences = useCallback(
    (text: string, language: string): string[] => {
      // Chinese and Japanese sentence splitting
      if (language.startsWith('zh') || language.startsWith('ja')) {
        // Split by Chinese/Japanese punctuation: 。！？
        const sentences = text
          .split(/[。！？]+/)
          .filter((s) => s.trim().length > 0);
        if (sentences.length > 1) return sentences;

        // Fallback: split by character count for very long text
        const chars = text.trim();
        if (chars.length > 100) {
          const chunkSize = Math.ceil(
            chars.length / Math.ceil(chars.length / 50),
          );
          const chunks: string[] = [];
          for (let i = 0; i < chars.length; i += chunkSize) {
            chunks.push(chars.slice(i, i + chunkSize));
          }
          return chunks.filter(Boolean);
        }
        return [text];
      }

      // Korean sentence splitting
      if (language.startsWith('ko')) {
        const sentences = text
          .split(/[.!?]+\s*/)
          .filter((s) => s.trim().length > 0);
        return sentences.length > 0 ? sentences : [text];
      }

      // Default (English, European languages) sentence splitting
      return text.split(/(?<=[.!?])\s+/).filter(Boolean);
    },
    [],
  );

  // Process transcript when duration or transcript changes
  useEffect(() => {
    if (duration <= 0) return;

    // Check if we need to process the transcript
    const needsProcessing = (transcript: TranscriptSegment[]) => {
      return (
        transcript.length === 1 &&
        transcript[0].startTime === 0 &&
        transcript[0].endTime === 0
      );
    };

    // Process local transcript first if available
    if (
      localTranscript &&
      localTranscript.length > 0 &&
      needsProcessing(localTranscript)
    ) {
      const raw = localTranscript[0].text;
      const sentences = splitIntoSentences(raw, content.language || 'en-US');
      const pieces = Math.max(1, sentences.length);
      const step = Math.max(1, Math.floor(duration / pieces));
      const segments: TranscriptSegment[] = [];
      for (let i = 0; i < pieces; i += 1) {
        const start = Math.min(duration - 1, i * step);
        const end = Math.min(duration, start + step);
        segments.push({
          id: `seg-${i}`,
          text: sentences[i] ?? '',
          startTime: start,
          endTime: end,
          chapterId: '',
        });
      }
      setLocalTranscript(segments);
      return;
    }

    // If local transcript is properly segmented, keep it
    if (localTranscript && localTranscript.length > 0) {
      return;
    }

    // Fall back to content transcript
    if (content.transcript && content.transcript.length > 0) {
      if (needsProcessing(content.transcript)) {
        const raw = content.transcript[0].text;
        const sentences = splitIntoSentences(raw, content.language || 'en-US');
        const pieces = Math.max(1, sentences.length);
        const step = Math.max(1, Math.floor(duration / pieces));
        const segments: TranscriptSegment[] = [];
        for (let i = 0; i < pieces; i += 1) {
          const start = Math.min(duration - 1, i * step);
          const end = Math.min(duration, start + step);
          segments.push({
            id: `seg-${i}`,
            text: sentences[i] ?? '',
            startTime: start,
            endTime: end,
            chapterId: '',
          });
        }
        setLocalTranscript(segments);
      } else {
        setLocalTranscript(content.transcript);
      }
      return;
    }

    // Fallback mock transcript
    const pieces = 8;
    const step = Math.max(1, Math.floor(duration / pieces));
    const segments: TranscriptSegment[] = [];
    for (let i = 0; i < pieces; i += 1) {
      const start = Math.min(duration - 1, i * step);
      const end = Math.min(duration, start + step);
      segments.push({
        id: `seg-${i}`,
        text: `Sample transcript sentence ${i + 1}.`,
        startTime: start,
        endTime: end,
        chapterId: '',
      });
    }
    setLocalTranscript(segments);
  }, [
    duration,
    content.transcript,
    content.language,
    splitIntoSentences,
    localTranscript,
  ]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isMobile) return;
    // Allow drag-to-close only when content is at top (to avoid hijacking content scroll)
    const container = transcriptContainerRef.current;
    const atTop = !container || container.scrollTop <= 0;
    // Sticky behavior: only allow close after user reaches end of transcript at least once
    const canDrag = isLoading || (hasReachedEndRef.current && atTop);
    isDraggingRef.current = !!canDrag;
    if (!canDrag) {
      setTouchStartY(null);
      setDragY(0);
      return;
    }
    setTouchStartY(e.touches[0].clientY);
    setDragY(0);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isMobile || touchStartY === null || !isDraggingRef.current) return;
    const delta = e.touches[0].clientY - touchStartY;
    setDragY(Math.max(0, Math.min(MAX_DRAG_PX, delta)));
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;
    if (isDraggingRef.current && dragY > CLOSE_THRESHOLD_PX) {
      onOpenChange(false);
    }
    setTouchStartY(null);
    setDragY(0);
    isDraggingRef.current = false;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? 'bottom' : 'center'}
        className={cn(
          'p-0 border-none overflow-hidden h-[100dvh] w-screen rounded-none',
        )}
      >
        {/* Background Image with Overlay */}
        <div
          className="relative h-full transition-transform duration-300 will-change-transform"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform:
              isMobile && isDraggingRef.current
                ? `translateY(${dragY}px)`
                : undefined,
          }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${content.backgroundImage})` }}
          />
          <div className="absolute inset-0 bg-black/50" />

          {/* Loading Screen (crossfades out) */}
          <div
            className={cn(
              'absolute inset-0 z-51 flex flex-col items-center justify-center text-center px-8 transition-opacity duration-300',
              isLoading || isFetching
                ? 'opacity-100 pointer-events-auto'
                : 'opacity-0 pointer-events-none',
            )}
          >
            <div className="flex flex-col items-center gap-4">
              <Headphones className="w-8 h-8 text-orange-500" />
              <p className="text-orange-500 text-lg italic">
                Loading voiced content...
              </p>
            </div>
            <h1 className="mt-6 text-white text-4xl md:text-5xl font-extrabold leading-tight">
              {content.title}
            </h1>
            {(content.created_by || content.owner) && (
              <div className="mt-8 text-white/90">
                <div className="flex flex-wrap items-center justify-center gap-2 text-lg leading-tight">
                  {content.created_by && (
                    <>
                      <span>Curated by</span>
                      <span className="font-semibold">
                        {content.created_by}
                      </span>
                    </>
                  )}
                  {content.owner && (
                    <>
                      <span>from</span>
                      <span className="inline-flex items-center gap-2">
                        <img
                          src="/assets/wink_logo.png"
                          alt="WINK"
                          className="w-6 h-6 rounded-full object-contain"
                        />
                        <span className="font-semibold">{content.owner}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
            <button
              className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/90 hover:text-white active:scale-90 transition-all duration-200 group"
              aria-label="Close"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-8 h-8 group-active:text-orange-500 transition-all duration-200" />
            </button>
          </div>

          {/* Content (crossfades in) */}
          <div
            className={cn(
              'relative z-10 h-full flex flex-col transition-all duration-300',
              isLoading || isFetching
                ? 'opacity-0 translate-y-2 pointer-events-none'
                : 'opacity-100 translate-y-0 pointer-events-auto',
            )}
          >
            {/* Centered transcript overlay */}
            <div
              ref={transcriptContainerRef}
              onScroll={handleTranscriptScroll}
              className="flex-1 overflow-y-auto no-scrollbar px-6 text-center"
            >
              <div
                className="pt-16 pb-24 flex flex-col items-center gap-2"
                style={{
                  paddingTop: 'calc(4rem + env(safe-area-inset-top))',
                  paddingBottom: 'calc(8rem + env(safe-area-inset-bottom))',
                }}
              >
                {localTranscript.map((seg, idx) => {
                  const dist = Math.abs(
                    idx - (currentIndex >= 0 ? currentIndex : 0),
                  );
                  const isCurrent = idx === currentIndex;
                  const base = isCurrent
                    ? 'text-white text-xl md:text-2xl font-semibold'
                    : dist === 1
                      ? 'text-white/90'
                      : dist === 2
                        ? 'text-white/70'
                        : 'text-white/50';
                  return (
                    <div
                      key={seg.id}
                      ref={(el) => {
                        transcriptItemRefs.current[idx] = el;
                      }}
                      className="w-full"
                    >
                      <div
                        className={`mx-auto max-w-[720px] leading-relaxed drop-shadow ${base}`}
                      >
                        {seg.text}
                      </div>
                    </div>
                  );
                })}
                {/* Safe-area spacer to ensure last lines are fully reachable on iOS Safari */}
                <div
                  aria-hidden="true"
                  className="w-full"
                  style={{ height: 'env(safe-area-inset-bottom)' }}
                />
              </div>
            </div>

            {/* Bottom controls overlay */}
            <div className="p-6 bg-gradient-to-t from-black/80 to-transparent">
              <div className="mb-3">
                {/* Chapter Selector */}
                {content.chapters && content.chapters.length > 1 ? (
                  <Popover
                    opened={isChapterOpen}
                    onChange={setIsChapterOpen}
                    position="top"
                    shadow="md"
                    withinPortal={false}
                  >
                    <Popover.Target>
                      <button
                        className="flex items-center gap-3 w-full group min-w-0 "
                        onClick={() => setIsChapterOpen(!isChapterOpen)}
                      >
                        {/* Title and Chapter vertically stacked - grows to fill space */}
                        <div className="flex flex-col items-start text-left flex-1 min-w-0">
                          <ScrollingTitle
                            title={content.title}
                            className="text-white text-2xl md:text-3xl font-extrabold w-full"
                          />
                          <span className="text-orange-500 font-normal transition-colors text-md mt-1 truncate w-full">
                            {(() => {
                              const currentChapter = content.chapters?.find(
                                (ch: Chapter) => ch.id === content.id,
                              );
                              const chapterIndex =
                                content.chapters?.findIndex(
                                  (ch: Chapter) => ch.id === content.id,
                                ) ?? -1;
                              if (currentChapter && chapterIndex >= 0) {
                                // First chapter is the experience, rest are activities
                                return `Chapter ${chapterIndex + 1}. ${currentChapter.title}`;
                              }
                              return 'Select Chapter';
                            })()}
                          </span>
                        </div>

                        {/* Chevron icons - fixed width */}
                        <div className="flex-shrink-0 text-white group-hover:scale-90 transition duration-150">
                          {isChapterOpen ? (
                            <ChevronDown
                              className="w-5 h-5"
                              style={{ strokeWidth: 3 }}
                            />
                          ) : (
                            <ChevronUp
                              className="w-5 h-5"
                              style={{ strokeWidth: 3 }}
                            />
                          )}
                        </div>
                      </button>
                    </Popover.Target>
                    <Popover.Dropdown className="bg-black/90 border border-white/10 p-2 rounded-lg min-w-[280px] max-h-64 overflow-auto">
                      <div className="flex flex-col gap-1">
                        {content.chapters?.map(
                          (chapter: Chapter, index: number) => (
                            <button
                              key={chapter.id}
                              className={cn(
                                'text-left text-sm px-3 py-2 rounded hover:bg-white/10 active:bg-white/20 active:scale-90 text-white transition-all duration-200',
                                content.id === chapter.id &&
                                  'bg-orange-500/20 text-orange-400',
                              )}
                              onClick={() => {
                                if (onChapterChange) {
                                  onChapterChange(chapter.id);
                                }
                                setIsChapterOpen(false);
                              }}
                            >
                              <span className="font-medium">
                                Chapter {index + 1}.
                              </span>{' '}
                              {chapter.title}
                            </button>
                          ),
                        )}
                      </div>
                    </Popover.Dropdown>
                  </Popover>
                ) : (
                  /* Single chapter - just show title */
                  <ScrollingTitle
                    title={content.title}
                    className="text-white text-2xl md:text-3xl font-extrabold"
                  />
                )}
              </div>
              <div className="mb-4">
                <Slider
                  value={[currentTime]}
                  max={duration}
                  step={1}
                  className="w-full"
                  onValueChange={(value) => jumpToTime(value[0])}
                />
                <div className="flex justify-between text-sm text-white/80 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
              <div className="relative flex items-center justify-center gap-3">
                {/* Language Popover (left of controls) */}
                <Popover
                  opened={isLangOpen}
                  onChange={setIsLangOpen}
                  position="top-start"
                  shadow="md"
                  withinPortal={false}
                >
                  <Popover.Target>
                    <button
                      aria-label="Choose language"
                      className="w-10 h-10 rounded-full hover:bg-white/20 active:scale-90 text-white flex items-center justify-center transition-all duration-200 group"
                      onClick={() => setIsLangOpen((s) => !s)}
                    >
                      <img
                        src="/assets/la_language.svg"
                        alt="language"
                        className="w-7 h-7 brightness-0 invert group-active:brightness-0 group-active:invert group-active:hue-rotate-[20deg] group-active:saturate-[2] transition-all duration-200"
                      />
                    </button>
                  </Popover.Target>
                  <Popover.Dropdown className="bg-black/90 border border-white/10 p-2 rounded-lg min-w-[160px]">
                    <div className="flex flex-col gap-1 max-h-64 overflow-auto">
                      {languages.map((l) => (
                        <button
                          key={l.value}
                          disabled={isFetching || isLoading}
                          className={cn(
                            'text-left text-sm px-3 py-2 rounded hover:bg-white/10 active:bg-white/20 active:scale-90 text-white transition-all duration-200',
                            currentLanguage === l.value && 'bg-white/10',
                          )}
                          onClick={async () => {
                            const lang = l.value;
                            if (lang === currentLanguage) {
                              setIsLangOpen(false);
                              return;
                            }
                            setCurrentLanguage(lang);
                            if (onLanguageChange) {
                              // Close dropdown immediately for better UX
                              setIsLangOpen(false);
                              try {
                                await onLanguageChange(lang);
                                // Parent will update content prop with new data
                              } catch (err) {
                                console.error('Failed to switch language', err);
                              }
                            }
                          }}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </Popover.Dropdown>
                </Popover>

                {/* Chapter navigation */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'w-10 h-10 rounded-full text-white transition-all duration-200 group',
                    getCurrentChapterIndex() === 0 && currentTime <= 10
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-white/20 active:scale-90',
                  )}
                  onClick={skipToPreviousChapter}
                  disabled={getCurrentChapterIndex() === 0 && currentTime <= 10}
                  title={
                    currentTime > 10
                      ? 'Restart chapter'
                      : getCurrentChapterIndex() > 0
                        ? 'Previous chapter'
                        : 'First chapter'
                  }
                >
                  <SkipBack className="w-6 h-6 fill-white group-active:fill-orange-500 transition-all duration-200" />
                </Button>

                {/* Time navigation (rewind/fast-forward) */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 rounded-full hover:bg-white/20 active:scale-90 text-white transition-all duration-200 group"
                  onClick={() => skipTime(-10)}
                  title="Rewind 10 seconds"
                >
                  <Rewind className="w-6 h-6 fill-white group-active:fill-orange-500 transition-all duration-200" />
                </Button>

                {/* Play/Pause - larger and centered */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-16 h-16 rounded-full hover:bg-white/20 active:scale-90 text-white transition-all duration-200 group"
                  onClick={togglePlayback}
                >
                  {isPlaying ? (
                    <Pause className="w-10 h-10 fill-white group-active:fill-orange-500 transition-all duration-200" />
                  ) : (
                    <Play className="w-10 h-10 ml-1 fill-white group-active:fill-orange-500 transition-all duration-200" />
                  )}
                </Button>

                {/* Time navigation (fast-forward) */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 rounded-full hover:bg-white/20 active:scale-90 text-white transition-all duration-200 group"
                  onClick={() => skipTime(10)}
                  title="Fast-forward 10 seconds"
                >
                  <FastForward className="w-6 h-6 fill-white group-active:fill-orange-500 transition-all duration-200" />
                </Button>

                {/* Chapter navigation */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'w-10 h-10 rounded-full text-white transition-all duration-200 group',
                    !content.chapters ||
                      getCurrentChapterIndex() >= content.chapters.length - 1
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-white/20 active:scale-90',
                  )}
                  onClick={skipToNextChapter}
                  disabled={
                    !content.chapters ||
                    getCurrentChapterIndex() >= content.chapters.length - 1
                  }
                  title={
                    !content.chapters ||
                    getCurrentChapterIndex() >= content.chapters.length - 1
                      ? 'Last chapter'
                      : 'Next chapter'
                  }
                >
                  <SkipForward className="w-6 h-6 fill-white group-active:fill-orange-500 transition-all duration-200" />
                </Button>

                {/* Close button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 rounded-full hover:bg-white/20 active:scale-90 text-white transition-all duration-200 group"
                  onClick={() => onOpenChange(false)}
                  title="Close"
                >
                  <X
                    className="w-7 h-7 fill-white group-active:fill-orange-500 transition-all duration-200"
                    strokeWidth={3}
                  />
                </Button>
              </div>
            </div>
          </div>

          {/* Hidden Audio Element */}
          <audio
            ref={audioRef}
            src={content.audioUrl || undefined}
            preload="metadata"
            onTimeUpdate={() => {
              if (audioRef.current) {
                setCurrentTime(audioRef.current.currentTime);
              }
            }}
            onLoadedMetadata={() => {
              if (audioRef.current) {
                setDuration(audioRef.current.duration || 0);
              }
              setIsLoading(false);
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
