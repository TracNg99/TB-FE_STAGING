'use client';

import { useCallback, useMemo, useState } from 'react';

import { useStartSessionGetQuery } from '@/store/redux/slices/agents/text-to-speech';

import { AudioDrawer, Chapter } from './audio-player-popover';

type TranscriptSegment = {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  chapterId: string;
};

export type DrawerContent = {
  id: string;
  title: string;
  created_by: string;
  owner: string;
  backgroundImage: string;
  audioUrl: string;
  duration: number;
  transcript: TranscriptSegment[];
  language?: string;
  chapters?: Chapter[];
  /** Per-chapter metadata including bg image, author/created_by, transcript and per-chapter audio if available */
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
};

export type OpenAudioParams = {
  /** New style: open specific chapter (experience.id or activity.id) */
  chapterId: string;
  language?: string;
  loader?: (args: {
    contentId: string; // chapterId
    chapterId: string;
    language: string;
  }) => Promise<{ audioUrl?: string; audio_url?: string; transcript?: string }>;
};

export type UseAudioDrawerProps = {
  experience: {
    id: string;
    name: string;
    primary_photo?: string;
    created_by?: string;
    owned_by?: string;
    owner?: string;
  };
  activities?: Array<{
    id: string;
    title: string;
    primary_photo?: string;
    order_of_appearance?: number;
    author?: string;
    created_by?: string;
  }>;
};

export function useAudioDrawer(init?: UseAudioDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<DrawerContent | null>(null);
  const [currentChapterId, setCurrentChapterId] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<string>('en-US');
  const [lastSelectedLanguage, setLastSelectedLanguage] =
    useState<string>('en-US');

  // Use normal query hook with skip when no chapter is selected
  const { data, isFetching } = useStartSessionGetQuery(
    { content_id: currentChapterId!, language: currentLanguage },
    { skip: !currentChapterId },
  );

  // Build chapters and per-chapter content metadata from props
  const built = useMemo(() => {
    if (!init?.experience) return null;
    const activities = init.activities ?? [];
    const sorted = [...activities].sort((a, b) => {
      const ao = a.order_of_appearance ?? Number.MAX_SAFE_INTEGER;
      const bo = b.order_of_appearance ?? Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      return a.title.localeCompare(b.title);
    });
    const chapterContents: NonNullable<DrawerContent['chapterContents']> = {};
    chapterContents[init.experience.id] = {
      chapterId: init.experience.id,
      bg_image_url: init.experience.primary_photo || '/assets/placeholder.jpg',
      author: init.experience.created_by,
      created_by: init.experience.created_by,
      transcript: [],
      audioUrl: '',
    };
    for (const act of activities) {
      chapterContents[act.id] = {
        chapterId: act.id,
        bg_image_url:
          act.primary_photo ||
          init.experience.primary_photo ||
          '/assets/placeholder.jpg',
        author: act.author,
        created_by: act.created_by,
        transcript: [],
        audioUrl: '',
      };
    }
    // Build chapters array: experience first, then sorted activities
    const chapters: Chapter[] = [
      {
        id: init.experience.id,
        title: init.experience.name,
        chapterId: init.experience.id,
        bg_image_url:
          init.experience.primary_photo || '/assets/placeholder.jpg',
        author: init.experience.created_by,
        created_by: init.experience.created_by,
      },
    ];

    for (const act of sorted) {
      chapters.push({
        id: act.id,
        title: act.title,
        chapterId: act.id,
        bg_image_url:
          act.primary_photo ||
          init.experience.primary_photo ||
          '/assets/placeholder.jpg',
        author: act.author,
        created_by: act.created_by,
      });
    }

    return {
      chapters,
      chapterContents,
      experience: init.experience,
    };
  }, [init?.experience, init?.activities]);

  const open = useCallback(
    async ({ chapterId, language }: OpenAudioParams) => {
      const langToUse =
        language && language.length > 0 ? language : lastSelectedLanguage;
      const exp = built?.experience;
      const chapterMeta = built?.chapterContents?.[chapterId];
      const placeholder: DrawerContent = {
        id: chapterId,
        title: exp?.name ?? '',
        created_by: exp?.created_by ?? '',
        owner: exp?.owner || '',
        backgroundImage:
          chapterMeta?.bg_image_url ||
          exp?.primary_photo ||
          '/assets/placeholder.jpg',
        audioUrl: '',
        duration: 0,
        transcript: Array.isArray(chapterMeta?.transcript)
          ? (chapterMeta?.transcript as TranscriptSegment[])
          : chapterMeta?.transcript
            ? [
                {
                  id: 'seg-0',
                  text: String(chapterMeta?.transcript),
                  startTime: 0,
                  endTime: 0,
                  chapterId,
                },
              ]
            : [],
        language: langToUse,
        chapters: built?.chapters || [],
        chapterContents: built?.chapterContents,
      };
      setContent(placeholder);
      setIsOpen(true);

      // Set up the query parameters to trigger the hook
      setCurrentChapterId(chapterId);
      setCurrentLanguage(langToUse);
    },
    [built, lastSelectedLanguage],
  );

  // Removed openWithExperience per new API

  // Derive content directly from data without useEffect
  const derivedContent = useMemo(() => {
    if (!content) return null;

    if (data) {
      const audioUrl = (data as any).audioUrl ?? (data as any).audio_url ?? '';
      const serverTranscript: string | undefined = (data as any).transcript;

      return {
        ...content,
        audioUrl,
        language: content.language || currentLanguage, // Preserve content language if set
        transcript: serverTranscript
          ? [
              {
                id: 'seg-0',
                text: serverTranscript,
                startTime: 0,
                endTime: 0,
                chapterId: currentChapterId || '',
              },
            ]
          : content.transcript,
      };
    }

    return content;
  }, [content, data, currentLanguage, currentChapterId]);

  const close = useCallback(() => {
    setIsOpen(false);
    // Reset query state to stop any ongoing requests
    setCurrentChapterId(null);
    setContent(null);
  }, []);

  const handleLanguageChange = useCallback(
    async (language: string) => {
      // Update language immediately in UI
      setContent((prev) =>
        prev
          ? {
              ...prev,
              language,
            }
          : prev,
      );

      // Update language state to trigger new query
      setCurrentLanguage(language);

      // Save the selected language for future sessions
      setLastSelectedLanguage(language);

      // The query hook will automatically refetch with new language
      // and the useEffect above will handle the response
    },
    [], // No dependencies needed since we only use setters and the language parameter
  );

  const handleChapterChange = useCallback(
    (chapterId: string) => {
      // When user navigates to a different chapter, trigger open with the new chapter
      setCurrentChapterId(chapterId);

      // Update the content to show the new chapter info immediately
      const chapterMeta = built?.chapterContents?.[chapterId];
      if (chapterMeta && built?.experience) {
        setContent((prev) =>
          prev
            ? {
                ...prev,
                id: chapterId,
                backgroundImage:
                  chapterMeta.bg_image_url ||
                  built.experience.primary_photo ||
                  '/assets/placeholder.jpg',
                transcript: Array.isArray(chapterMeta.transcript)
                  ? (chapterMeta.transcript as any[])
                  : chapterMeta.transcript
                    ? [
                        {
                          id: 'seg-0',
                          text: String(chapterMeta.transcript),
                          startTime: 0,
                          endTime: 0,
                          chapterId,
                        },
                      ]
                    : [],
                audioUrl: '', // Will be updated when new data loads
              }
            : prev,
        );
      }
    },
    [built],
  );

  const Drawer = useCallback(() => {
    if (!derivedContent) return null;
    return (
      <AudioDrawer
        content={derivedContent}
        isOpen={isOpen}
        onOpenChange={(open) => (open ? setIsOpen(true) : close())}
        onLanguageChange={handleLanguageChange}
        onChapterChange={handleChapterChange}
        isFetching={isFetching}
      />
    );
  }, [
    derivedContent,
    isOpen,
    handleLanguageChange,
    handleChapterChange,
    isFetching,
    close,
  ]);

  return {
    open,
    close,
    Drawer,
    isOpen,
    content,
    setContent,
    setIsOpen,
  };
}
