'use client';

import { Popover } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  Headphones,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useLazyStartSessionGetQuery } from '@/store/redux/slices/agents/text-to-speech';

// Mock data structure
interface TranscriptSegment {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  chapterId: string;
}

interface Chapter {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
}

interface AudioContent {
  id: string;
  title: string;
  author: string;
  source: string;
  backgroundImage: string;
  audioUrl: string;
  duration: number;
  chapters: Chapter[];
  transcript: TranscriptSegment[];
  chapterAudio?: Record<string, string>;
  language?: string;
}

// (Removed mock data to avoid unused variable lint error)

interface AudioDrawerProps {
  content: AudioContent;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

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
  const [currentLanguage, setCurrentLanguage] = useState<string>(
    content.language || 'en-US',
  );
  const [triggerGet, { isFetching: isFetchingLang }] =
    useLazyStartSessionGetQuery();
  const [isLangOpen, setIsLangOpen] = useState(false);

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
    }, 2000);
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
  }, [content.id, content.audioUrl, isOpen, content.transcript]);
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

  // Chapters not used; transcript is full list

  // When duration is known, compute chapter timings and mock transcript if not provided
  useEffect(() => {
    if (duration <= 0) return;

    // Prefer locally supplied transcript (e.g., after language switch)
    if (localTranscript && localTranscript.length > 0) {
      if (
        localTranscript.length === 1 &&
        localTranscript[0].startTime === 0 &&
        localTranscript[0].endTime === 0
      ) {
        const raw = localTranscript[0].text;
        const sentences = raw.split(/(?<=[.!?])\s+/).filter(Boolean);
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
      // Already segmented; nothing to do
      return;
    }

    // If no local transcript, fall back to content transcript
    if (content.transcript && content.transcript.length > 0) {
      if (
        content.transcript.length === 1 &&
        content.transcript[0].startTime === 0 &&
        content.transcript[0].endTime === 0
      ) {
        const raw = content.transcript[0].text;
        const sentences = raw.split(/(?<=[.!?])\s+/).filter(Boolean);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, localTranscript, content.transcript]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isMobile) return;
    setTouchStartY(e.touches[0].clientY);
    setDragY(0);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isMobile || touchStartY === null) return;
    const delta = e.touches[0].clientY - touchStartY;
    setDragY(Math.max(0, delta));
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;
    if (dragY > 80) {
      onOpenChange(false);
    }
    setTouchStartY(null);
    setDragY(0);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className={cn(
          'p-0 border-none overflow-hidden h-screen w-screen rounded-none',
        )}
      >
        {/* Background Image with Overlay */}
        <div
          className="relative h-full"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ transform: isMobile ? `translateY(${dragY}px)` : undefined }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${content.backgroundImage})` }}
          />
          <div className="absolute inset-0 bg-black/40" />

          {/* Loading Screen */}
          {isLoading && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center text-center px-8">
              <div className="flex flex-col items-center gap-4">
                <Headphones className="w-8 h-8 text-orange-500" />
                <p className="text-orange-500 text-lg italic">
                  Loading voiced content...
                </p>
              </div>
              <h1 className="mt-6 text-white text-4xl md:text-5xl font-extrabold leading-tight">
                {content.title}
              </h1>
              {(content.author || content.source) && (
                <div className="mt-8 flex items-center gap-2 text-white/90">
                  {content.author && (
                    <span className="text-lg">Curated by {content.author}</span>
                  )}
                  {content.source && <span className="text-lg">from</span>}
                  {content.source && (
                    <span className="inline-flex items-center gap-2">
                      <span className="bg-white text-black text-xs font-bold rounded-full px-2 py-1">
                        WINK
                      </span>
                      <span className="text-lg">{content.source}</span>
                    </span>
                  )}
                </div>
              )}
              <button
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/90 hover:text-white transition"
                aria-label="Close"
                onClick={() => onOpenChange(false)}
              >
                <X className="w-8 h-8" />
              </button>
            </div>
          )}

          {/* Content */}
          {!isLoading && (
            <div className="relative z-10 h-full flex flex-col">
              {/* Centered transcript overlay */}
              <div
                ref={transcriptContainerRef}
                onScroll={handleTranscriptScroll}
                className="flex-1 overflow-y-auto no-scrollbar px-6 text-center"
              >
                <div className="py-16 flex flex-col items-center gap-2">
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
                </div>
              </div>

              {/* Bottom controls overlay */}
              <div className="p-6 bg-gradient-to-t from-black/80 to-transparent">
                <div className="mb-3">
                  <h3 className="text-white text-2xl md:text-3xl font-extrabold truncate">
                    {content.title}
                  </h3>
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
                <div className="relative flex items-center justify-center gap-6">
                  {/* Language Popover (left of back) */}
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
                        className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                        onClick={() => setIsLangOpen((s) => !s)}
                      >
                        <img
                          src="/assets/la_language.svg"
                          alt="language"
                          className="w-5 h-5"
                        />
                      </button>
                    </Popover.Target>
                    <Popover.Dropdown className="bg-black/90 border border-white/10 p-2 rounded-lg min-w-[160px]">
                      <div className="flex flex-col gap-1 max-h-64 overflow-auto">
                        {languages.map((l) => (
                          <button
                            key={l.value}
                            disabled={isFetchingLang || isLoading}
                            className={cn(
                              'text-left text-sm px-3 py-2 rounded hover:bg-white/10 text-white',
                              currentLanguage === l.value && 'bg-white/10',
                            )}
                            onClick={async () => {
                              const lang = l.value;
                              if (lang === currentLanguage) {
                                setIsLangOpen(false);
                                return;
                              }
                              setCurrentLanguage(lang);
                              try {
                                setIsLoading(true);
                                const data = await triggerGet(
                                  { content_id: content.id, language: lang },
                                  true,
                                ).unwrap();
                                const newUrl: string | undefined = (data as any)
                                  ?.audio_url;
                                const newTranscript: string | undefined = (
                                  data as any
                                )?.transcript;
                                if (newUrl && audioRef.current) {
                                  const wasPlaying = isPlaying;
                                  audioRef.current.pause();
                                  audioRef.current.src = newUrl;
                                  audioRef.current.currentTime = 0;
                                  setCurrentTime(0);
                                  setDuration(0);
                                  setIsPlaying(false);
                                  if (wasPlaying) {
                                    void audioRef.current.play();
                                  }
                                }
                                if (newTranscript) {
                                  // Replace transcript with the new raw text; segmentation will happen after metadata
                                  setLocalTranscript([
                                    {
                                      id: 'seg-0',
                                      text: newTranscript,
                                      startTime: 0,
                                      endTime: 0,
                                      chapterId: '',
                                    },
                                  ]);
                                }
                              } catch (err) {
                                // eslint-disable-next-line no-console
                                console.error('Failed to switch language', err);
                                setIsLoading(false);
                              } finally {
                                setIsLangOpen(false);
                              }
                            }}
                          >
                            {l.label}
                          </button>
                        ))}
                      </div>
                    </Popover.Dropdown>
                  </Popover>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
                    onClick={() => skipTime(-5)}
                  >
                    <SkipBack className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-16 h-16 rounded-full bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={togglePlayback}
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 ml-1" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
                    onClick={() => skipTime(5)}
                  >
                    <SkipForward className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
                    onClick={() => onOpenChange(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          )}

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
