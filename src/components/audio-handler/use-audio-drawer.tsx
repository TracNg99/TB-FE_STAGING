'use client';

import { useCallback, useRef, useState } from 'react';

import { useLazyStartSessionGetQuery } from '@/store/redux/slices/agents/text-to-speech';

import { AudioDrawer } from './audio-player-popover';

type TranscriptSegment = {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  chapterId: string;
};

type Chapter = {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
};

export type DrawerContent = {
  id: string;
  title: string;
  author: string;
  source: string;
  backgroundImage: string;
  audioUrl: string;
  duration: number;
  chapters: Chapter[];
  transcript: TranscriptSegment[];
  language?: string;
};

export type OpenAudioParams = {
  contentId: string;
  title: string;
  author?: string;
  source?: string;
  backgroundImage?: string;
  language?: string;
  chapters?: Chapter[];
  transcript?: string;
  loader?: (args: {
    contentId: string;
    language: string;
  }) => Promise<{ audioUrl?: string; audio_url?: string; transcript?: string }>;
};

export function useAudioDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<DrawerContent | null>(null);
  const [triggerGet] = useLazyStartSessionGetQuery();
  const requestTokenRef = useRef(0);

  const open = useCallback(
    async ({
      contentId,
      title,
      author,
      source,
      backgroundImage,
      language = 'en-US',
      chapters = [],
      transcript,
      loader,
    }: OpenAudioParams) => {
      const langToUse = language && language.length > 0 ? language : 'en-US';
      const placeholder: DrawerContent = {
        id: contentId,
        title,
        author: author ?? '',
        source: source ?? '',
        backgroundImage: backgroundImage ?? '/assets/placeholder.jpg',
        audioUrl: '',
        duration: 0,
        chapters,
        transcript: transcript
          ? [
              {
                id: 'seg-0',
                text: transcript,
                startTime: 0,
                endTime: 0,
                chapterId: '',
              },
            ]
          : [],
        language: langToUse,
      };
      setContent(placeholder);
      setIsOpen(true);

      try {
        requestTokenRef.current += 1;
        const localToken = requestTokenRef.current;
        const result = loader
          ? await loader({ contentId, language: langToUse })
          : await triggerGet(
              { content_id: contentId, language: langToUse },
              true,
            ).unwrap();

        if (localToken !== requestTokenRef.current) return;

        const audioUrl =
          (result as any).audioUrl ?? (result as any).audio_url ?? '';
        const serverTranscript: string | undefined = (result as any).transcript;

        setContent((prev) =>
          prev
            ? {
                ...prev,
                audioUrl,
                language: langToUse,
                transcript:
                  serverTranscript &&
                  (!prev.transcript || prev.transcript.length === 0)
                    ? [
                        {
                          id: 'seg-0',
                          text: serverTranscript,
                          startTime: 0,
                          endTime: 0,
                          chapterId: '',
                        },
                      ]
                    : prev.transcript,
              }
            : prev,
        );
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load audio content', err);
        // Keep drawer open with placeholder so user can retry or wait
      }
    },
    [triggerGet],
  );

  const close = useCallback(() => setIsOpen(false), []);

  const Drawer = useCallback(() => {
    if (!content) return null;
    return (
      <AudioDrawer content={content} isOpen={isOpen} onOpenChange={setIsOpen} />
    );
  }, [content, isOpen]);

  return { open, close, Drawer, isOpen, content, setContent, setIsOpen };
}
