'use client';

import { Loader, Popover } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FaPlay } from 'react-icons/fa';
import { FaPause } from 'react-icons/fa6';
import { IoPlayBack, IoPlayForward } from 'react-icons/io5';
import { PiDotsThreeVerticalBold } from 'react-icons/pi';
import { RiArrowGoBackLine, RiArrowGoForwardLine } from 'react-icons/ri';

import {
  useStartSessionMutation,
  useUpdateSessionMutation,
} from '@/store/redux/slices/agents/text-to-speech';
import { cn } from '@/utils/class';

export const languages = [
  { value: 'en-US', label: 'English', flag: '🇬🇧' },
  { value: 'ko-KR', label: '한국어', flag: '🇰🇷' },
  { value: 'ja-JP', label: '日本語', flag: '🇯🇵' },
  { value: 'fr-FR', label: 'Français', flag: '🇫🇷' },
  { value: 'zh-CN', label: '中文', flag: '🇨🇳' },
  { value: 'vi-VN', label: 'Tiếng Việt', flag: '🇻🇳' },
  { value: 'ru-RU', label: 'Русский', flag: '🇷🇺' },
];

// Throttle function for position updates
const throttle = (func: (...args: any[]) => void, limit: number) => {
  let lastFunc: ReturnType<typeof setTimeout>;
  let lastRan: number;
  return function (this: any, ...args: any[]) {
    if (!lastRan) {
      func.apply(this, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(
        () => {
          if (Date.now() - lastRan >= limit) {
            func.apply(this, args);
            lastRan = Date.now();
          }
        },
        limit - (Date.now() - lastRan),
      );
    }
  };
};

interface TTSPlayerProps {
  className?: string;
  buttonClassName?: string;
  modalClassName?: string;
  contentId: string;
  language: string;
}

interface AudioPlayerProps {
  isMobile: boolean;
  modalClassName?: string;
  language: string;
  position: number;
  setPosition: (position: number) => void;
  duration: number;
  setDuration: (duration: number) => void;
  isPlaying: boolean;
  isAudioReady: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onTimeUpdate: () => void;
  onLoadedMetadata: () => void;
  onSeekChange: (position: number) => void;
  togglePlayback: () => void;
  onPlay: () => void;
  onPause: () => void;
  onEnded: () => void;
  onClose: () => void;
  onLanguageChange: (language: string) => void;
}

const AudioPlayer = ({
  isMobile,
  modalClassName,
  language,
  position,
  duration,
  isPlaying,
  isAudioReady,
  audioRef,
  onTimeUpdate,
  onLoadedMetadata,
  onSeekChange,
  togglePlayback,
  onPlay,
  onPause,
  onEnded,
  onClose,
  onLanguageChange,
}: AudioPlayerProps) => {
  return (
    <div
      className={`
       w-full h-auto
        flex flex-row items-center justify-center 
        self-center z-50
        rounded-xl border
        ${modalClassName}`}
    >
      <Popover>
        <Popover.Target>
          <button
            className={`rounded-lg p-1 bg-transparent ${!isAudioReady ? 'opacity-50 hover:cursor-wait' : 'cursor-pointer'}`}
            disabled={!isAudioReady}
          >
            <PiDotsThreeVerticalBold className="text-2xl text-black" />
          </button>
        </Popover.Target>
        <Popover.Dropdown>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className={`w-full p-2 border rounded ${!isAudioReady ? 'opacity-50 hover:cursor-wait' : 'cursor-pointer'}`}
              disabled={!isAudioReady}
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </Popover.Dropdown>
      </Popover>

      <audio
        ref={audioRef}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
      />

      <div
        className={`flex flex-row items-center ${isMobile ? 'gap-0' : 'gap-2 flex-row'}`}
      >
        <button
          className={cn(
            'rounded-full cursor-pointer',
            !isAudioReady
              ? 'opacity-50 hover:cursor-wait'
              : 'cursor-pointer hover:text-gray-600',
            {
              'p-1 text-[12px]': isMobile,
              'p-2 text-[16px]': !isMobile,
            },
          )}
          onClick={() => onSeekChange(0)}
          disabled={!isAudioReady}
        >
          <IoPlayBack size={16} />
        </button>

        <button
          className={cn(
            'rounded-full cursor-pointer',
            !isAudioReady
              ? 'opacity-50 hover:cursor-wait'
              : 'cursor-pointer hover:text-gray-600',
            {
              'p-1 text-[11px]': isMobile,
              'p-2 text-[16px]': !isMobile,
            },
          )}
          onClick={() => onSeekChange(position === 0 ? 0 : position - 5)}
        >
          <RiArrowGoBackLine size={16} />
        </button>

        <button
          className={cn(
            'rounded-full cursor-pointer',
            !isAudioReady
              ? 'opacity-50 hover:cursor-wait'
              : 'cursor-pointer hover:text-gray-600',
            {
              'p-1 text-[11px]': isMobile,
              'p-2 text-[16px]': !isMobile,
            },
          )}
          onClick={togglePlayback}
          disabled={!isAudioReady}
        >
          {isPlaying ? (
            <FaPause size={16} />
          ) : !isAudioReady ? (
            <Loader size={16} type="oval" />
          ) : (
            <FaPlay size={16} />
          )}
        </button>

        <button
          className={cn(
            'rounded-full cursor-pointer',
            !isAudioReady
              ? 'opacity-50 hover:cursor-wait'
              : 'cursor-pointer hover:text-gray-600',
            {
              'p-1 text-[11px]': isMobile,
              'p-2 text-[16px]': !isMobile,
            },
          )}
          onClick={() => onSeekChange(position + 5)}
          disabled={!isAudioReady}
        >
          <RiArrowGoForwardLine size={16} />
        </button>

        <button
          className={cn(
            'rounded-full cursor-pointer',
            !isAudioReady
              ? 'opacity-50 hover:cursor-wait'
              : 'cursor-pointer hover:text-gray-600',
            {
              'p-1 text-[11px]': isMobile,
              'p-2 text-[16px]': !isMobile,
            },
          )}
          onClick={() => onSeekChange(duration - 5)}
          disabled={!isAudioReady}
        >
          <IoPlayForward size={16} />
        </button>

        <div
          className={cn('text-gray-600', {
            'text-[12px]': isMobile,
            'text-[16px]': !isMobile,
          })}
        >
          {position.toFixed(1)}s /{' '}
          {duration ? duration.toFixed(1) + 's' : 'Loading...'}
        </div>
      </div>
      <button
        className={cn(
          'hover:text-gray-600 rounded-full cursor-pointer',
          !isAudioReady ? 'opacity-50 hover:cursor-wait' : 'cursor-pointer',
          {
            'p-1 text-[12px]': isMobile,
            'p-2 text-[16px]': !isMobile,
          },
        )}
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
};

const TTSPlayer: React.FC<TTSPlayerProps> = ({
  className,
  buttonClassName,
  modalClassName,
  contentId,
  language,
}: TTSPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isSessionStart, setIsSessionStart] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<string | null>(null);

  const isMobile = useMediaQuery('(max-width: 768px)');

  // RTK Query hooks
  const [startSession] = useStartSessionMutation();
  const [updateSession] = useUpdateSessionMutation();

  const throttledUpdateSession = useRef(
    throttle((pos: number, playing: boolean) => {
      if (sessionId) {
        updateSession({ sessionId, position: pos, is_playing: playing });
      }
    }, 5000),
  ).current;

  useEffect(() => {
    if (language) {
      setCurrentLanguage(language);
    }
  }, [language]);

  // Initialize session
  const initializeSession = useCallback(
    async (languageUpdate?: string) => {
      console.log('Language Update:', languageUpdate);
      console.log('Language:', currentLanguage);
      try {
        const session = await startSession({
          content_id: contentId,
          language:
            languageUpdate ??
            (currentLanguage !== null ? currentLanguage : 'en-US'),
        }).unwrap();

        setSessionId(session.session_id);
        const startPosition = session.position || 0;
        setPosition(startPosition);
        setIsAudioReady(true);

        if (audioRef.current) {
          console.log('Audio URL:', session.audio_url);
          console.log('Audio Ref:', audioRef.current);
          audioRef.current.src = session.audio_url;
          audioRef.current.currentTime = startPosition;
        }
      } catch (error) {
        console.error('Failed to start session:', error);
      }
    },
    [contentId, startSession, currentLanguage],
  );

  // Update session state
  const updateSessionState = useCallback(
    (pos: number, playing: boolean) => {
      if (!sessionId) return;

      updateSession({
        sessionId,
        position: pos,
        is_playing: playing,
      });

      throttledUpdateSession(pos, playing);
    },
    [sessionId, updateSession, throttledUpdateSession],
  );

  // Handle play/pause
  const togglePlayback = useCallback(async () => {
    console.log('Audio Ref:', audioRef.current);
    if (!audioRef.current) return;

    console.log('Audio Ref:', audioRef.current);
    console.log('Audio Src: ', audioRef.current.src);

    if (isPlaying) {
      audioRef.current.pause();
      updateSessionState(position, false);
    } else {
      audioRef.current.play();
      updateSessionState(position, true);
    }
  }, [audioRef, isPlaying, position, updateSessionState]);

  // Handle time updates
  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current) return;

    const newPosition = audioRef.current.currentTime;
    setPosition(newPosition);

    updateSessionState(newPosition, isPlaying);
  }, [audioRef, isPlaying, updateSessionState]);

  // Handle audio loaded
  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, [audioRef]);

  // Handle seek
  const handleSeek = useCallback(
    (value: number) => {
      if (!audioRef.current) return;

      audioRef.current.currentTime = value;
      setPosition(value);
      updateSessionState(value, isPlaying);
    },
    [audioRef, isPlaying, updateSessionState],
  );

  const handleLanguageChange = useCallback(
    (chosenLanguage: string) => {
      setCurrentLanguage(chosenLanguage);
      if (sessionId) {
        updateSession({
          sessionId,
          language: chosenLanguage,
          position: 0,
          is_playing: false,
        });
      }
      setPosition(0);
      setIsAudioReady(false);
      initializeSession(chosenLanguage);
    },
    [sessionId, updateSession, setPosition, setIsAudioReady, initializeSession],
  );

  // Handle audio pop over
  const handleAudioPopOver = useCallback(() => {
    setIsSessionStart(true);

    if (contentId) {
      initializeSession();
    }
  }, [contentId, initializeSession]);

  // Stop playback completely
  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPosition(0);
    setIsPlaying(false);
    updateSessionState(0, false);
  }, [audioRef, updateSessionState]);

  return (
    <div className={className ?? 'h-full flex-col rounded-lg bg-transparent'}>
      {!isSessionStart ? (
        <button
          className={buttonClassName ?? 'relative rounded-lg cursor-pointer'}
          onClick={handleAudioPopOver}
        >
          <Image
            src="/assets/welcome_modal_welcome.png"
            alt="headphone"
            width={35}
            height={35}
            objectFit="contain"
          />
        </button>
      ) : (
        <AudioPlayer
          isMobile={isMobile || false}
          modalClassName={modalClassName}
          language={currentLanguage || 'en-US'}
          onLanguageChange={handleLanguageChange}
          position={position}
          setPosition={setPosition}
          duration={duration}
          setDuration={setDuration}
          isPlaying={isPlaying}
          isAudioReady={isAudioReady}
          audioRef={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onSeekChange={handleSeek}
          togglePlayback={togglePlayback}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={stopPlayback}
          onClose={() => setIsSessionStart(false)}
        />
      )}
    </div>
  );
};

export default TTSPlayer;
