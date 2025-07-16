'use client';

import { Loader, Popover } from '@mantine/core';
import { useCallback, useRef, useState } from 'react';
import { FaPlay } from 'react-icons/fa';
import { FaPause } from 'react-icons/fa6';
import { PiDotsThreeVerticalBold } from 'react-icons/pi';
import { PiWaveformBold } from 'react-icons/pi';
// import { IoPlayBack, IoPlayForward } from "react-icons/io5";
import { RiArrowGoBackLine, RiArrowGoForwardLine } from 'react-icons/ri';

import {
  useStartSessionMutation,
  useUpdateSessionMutation,
  // useLazyGetSessionQuery
} from '@/store/redux/slices/agents/text-to-speech';

export const languages = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'es-ES', label: 'Spanish' },
  { value: 'fr-FR', label: 'French' },
  { value: 'de-DE', label: 'German' },
  { value: 'ja-JP', label: 'Japanese' },
  { value: 'zh-CN', label: 'Chinese (Simplified)' },
  { value: 'ko-KR', label: 'Korean' },
  { value: 'ru-RU', label: 'Russian' },
  { value: 'pt-BR', label: 'Portuguese (Brazil)' },
  { value: 'it-IT', label: 'Italian' },
  { value: 'ar-SA', label: 'Arabic' },
  { value: 'hi-IN', label: 'Hindi' },
  { value: 'bn-BD', label: 'Bengali' },
  { value: 'ur-PK', label: 'Urdu' },
  { value: 'fa-IR', label: 'Persian' },
  { value: 'th-TH', label: 'Thai' },
  { value: 'vi-VN', label: 'Vietnamese' },
  { value: 'pl-PL', label: 'Polish' },
  { value: 'cs-CZ', label: 'Czech' },
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
}

interface AudioPlayerProps {
  modalClassName?: string;
  language: string;
  setLanguage: (language: string) => void;
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
}

const AudioPlayer = ({
  modalClassName,
  language,
  setLanguage,
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
            className={`rounded-lg p-4 bg-transparent ${!isAudioReady ? 'opacity-50 hover:cursor-wait' : 'cursor-pointer'}`}
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
              onChange={(e) => setLanguage(e.target.value)}
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

      <div className="flex flex-row items-center gap-2">
        {/* <button
                    className={`p-2 rounded-full cursor-pointer ${!isAudioReady ? 'opacity-50 hover:cursor-wait' : 'cursor-pointer hover:text-gray-600'}`}
                    disabled={!isAudioReady}
                >
                    <IoPlayBack size={16} />
                </button> */}

        <button
          className={`p-2 rounded-full cursor-pointer ${!isAudioReady ? 'opacity-50 hover:cursor-wait' : 'cursor-pointer hover:text-gray-600'}`}
          onClick={() => onSeekChange(position === 0 ? 0 : position - 5)}
        >
          <RiArrowGoBackLine size={16} />
        </button>

        <button
          className={`p-2 rounded-full cursor-pointer ${!isAudioReady ? 'opacity-50 hover:cursor-wait' : 'cursor-pointer hover:text-gray-600 '}`}
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
          className={`p-2 rounded-full cursor-pointer ${!isAudioReady ? 'opacity-50 hover:cursor-wait' : 'cursor-pointer hover:text-gray-600'}`}
          onClick={() => onSeekChange(position + 5)}
          disabled={!isAudioReady}
        >
          <RiArrowGoForwardLine size={16} />
        </button>

        {/* <button
                    className={`p-2 rounded-full cursor-pointer ${!isAudioReady ? 'opacity-50 hover:cursor-wait' : 'cursor-pointer hover:text-gray-600'}`}
                    // onClick={togglePlayback}
                    disabled={!isAudioReady}
                >
                    <IoPlayForward size={16} />
                </button> */}

        <div className="text-sm text-gray-600">
          {position.toFixed(1)}s /{' '}
          {duration ? duration.toFixed(1) + 's' : 'Loading...'}
        </div>
      </div>
      <button
        className={`p-2 hover:text-gray-600 rounded-full cursor-pointer ${!isAudioReady ? 'opacity-50 hover:cursor-wait' : 'cursor-pointer'}`}
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
}: TTSPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [language, setLanguage] = useState('en-US');
  const [isSessionStart, setIsSessionStart] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);

  // RTK Query hooks
  const [startSession] = useStartSessionMutation();
  // const [getSession] = useLazyGetSessionQuery();
  const [updateSession] = useUpdateSessionMutation();

  const throttledUpdateSession = useRef(
    throttle((pos: number, playing: boolean) => {
      if (sessionId) {
        updateSession({ sessionId, position: pos, is_playing: playing });
      }
    }, 5000),
  ).current;

  // Initialize session
  const initializeSession = useCallback(
    async (languageUpdate?: string) => {
      try {
        const session = await startSession({
          content_id: contentId,
          language: languageUpdate ?? language,
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
    [contentId, language, startSession],
  );

  const handleLanguageChange = useCallback(
    (value: string) => {
      setLanguage(value);
      setSessionId(null); // Reset session for new language
      setPosition(0);
      setIsPlaying(false);
      setIsAudioReady(false);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.currentTime = 0;
      }

      initializeSession(value);
    },
    [audioRef, initializeSession],
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
    <div className={className ?? 'rounded-lg py-4 bg-transparent'}>
      {!isSessionStart ? (
        <button
          className={buttonClassName ?? 'py-2 rounded-lg cursor-pointer'}
          onClick={handleAudioPopOver}
        >
          <PiWaveformBold className="text-3xl text-black" />
        </button>
      ) : (
        <AudioPlayer
          modalClassName={modalClassName}
          language={language}
          setLanguage={handleLanguageChange}
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
