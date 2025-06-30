'use client';

import { ActionIcon } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconMicrophone } from '@tabler/icons-react';
import React, { useRef, useState } from 'react';

// import PulsingFab from "./pulsing-button";
import { cn } from '@/utils/class';

import VoiceRecorderModal from './recorder-modal-ui';

// Returns a Promise<number[]> of normalized magnitudes (0-1) for N bars
export async function extractMagnitudesFromBlob(
  audioBlob: Blob,
  bars: number = 20,
): Promise<number[]> {
  // 1. Convert Blob to ArrayBuffer
  const arrayBuffer = await audioBlob.arrayBuffer();
  // 2. Decode audio data
  const audioCtx = new (window.AudioContext ||
    (window as any).webkitAudioContext)();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  // 3. Get PCM data from the first channel
  const pcmData = audioBuffer.getChannelData(0);
  const samplesPerBar = Math.floor(pcmData.length / bars);

  // 4. Calculate RMS or peak for each bar
  const magnitudes: number[] = [];
  for (let i = 0; i < bars; i++) {
    let sum = 0;
    const start = i * samplesPerBar;
    const end = start + samplesPerBar;
    for (let j = start; j < end; j++) {
      sum += Math.abs(pcmData[j] || 0);
    }
    // Normalize: average absolute value in this segment
    const avg = sum / samplesPerBar;
    magnitudes.push(Math.min(1, avg * 5)); // scale to 0-1 (tweak multiplier as needed)
  }

  return magnitudes;
}

interface VoiceButtonForm {
  language: string;
  className?: string;
  asModal?: boolean;
  customIcon?: React.ReactNode;
  onTranscribe: (voiceTranscription: string) => void;
  existingTexts: string;
  onUnsupportDetected?: () => void;
  onAudioRecorded?: (audioBlob: Blob) => void;
}

const punctuations = {
  ' comma': ',',
  ' period': '.',
  ' question mark': '?',
  ' exclamation mark': '!',
  ' semicolon': ';',
  ' colon': ':',
  ' dash': '-',
};

const VoiceToTextButton: React.FC<VoiceButtonForm> = ({
  language,
  onTranscribe,
  existingTexts,
  onUnsupportDetected,
  className,
  asModal = false,
  customIcon,
  // onAudioRecorded,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [magnitude, setMagnitude] = useState<number[]>([]);
  const [openModal, setOpenModal] = useState(false);
  // const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const recognitionInstance = useRef<any>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const persistentListening = useRef(false);
  const audioChunks = useRef<BlobPart[]>([]);

  const SpeechRecognition =
    (typeof window !== 'undefined' && (window as any).SpeechRecognition) ||
    (typeof window !== 'undefined' && (window as any).webkitSpeechRecognition);

  if (!SpeechRecognition) {
    notifications.show({
      title: 'Speech recognition not supported',
      message: 'Your browser does not support speech recognition.',
      color: 'red',
    });
    onUnsupportDetected?.();
    return;
  }

  const handlePersistentListening = () => {
    if (persistentListening.current === true) {
      recognitionInstance.current.start();
      setTimeout(() => {
        persistentListening.current = false;
        setIsListening(false);
        recognitionInstance.current.stop();
        recognitionInstance.current = null;
      }, 300000); // Five minute standy after restart for any speech before termination
      return;
    }
  };

  const initializeRecognition = () => {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = handleRecognitionResult;
    recognition.onerror = handleRecognitionError;
    recognition.onend = handlePersistentListening;

    recognitionInstance.current = recognition;

    return recognition;
  };

  const handleRecognitionResult = (event: any) => {
    let finalTranscript = '';

    for (let i = 0; i < event.results.length; i += 1) {
      const result = event.results[i];
      if (result.isFinal && isMobile) {
        finalTranscript += ` ${processTranscription(result[0].transcript, result.isFinal)}`;
      } else if (!isMobile) {
        finalTranscript += ` ${processTranscription(result[0].transcript, result.isFinal)}`;
      }
    }

    const uniqueInterim = isMobile
      ? Array.from(new Set(finalTranscript.trim().split(' '))).join(' ')
      : finalTranscript;

    const updatedTranscript = `${uniqueInterim}`.replace(/\s+/g, ' ').trim();

    onTranscribe(existingTexts + updatedTranscript);
  };

  const handleRecognitionError = (event: any) => {
    let message = event.error;
    let severity: 'yellow' | 'red' = 'red';

    if (event.error === 'no-speech') {
      message = 'Do you want to say something?';
      severity = 'yellow';
    } else if (event.error === 'aborted') {
      message = 'Sorry! Your message was aborted. Please try again!';
    }

    notifications.show({
      title: 'Regcognition ERROR',
      message: message,
      color: severity,
    });
  };

  const startListening = async () => {
    const recognition = initializeRecognition();
    setIsListening(true);
    recognition.start();
    persistentListening.current = true;
    let requestDataInterval: NodeJS.Timeout | null = null;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
          const audioBlob = new Blob(audioChunks.current, {
            type: 'audio/webm',
          });
          extractMagnitudesFromBlob(audioBlob, 12)
            .then(setMagnitude)
            .catch((error) =>
              notifications.show({
                title: 'Error extracting voice waveform',
                message: error.message,
                color: 'red',
              }),
            );
        }
      };

      recorder.onstop = () => {
        if (requestDataInterval) {
          clearInterval(requestDataInterval);
          // requestDataInterval = null;
        }
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        console.log('Final audio Blob:', audioBlob);
        audioChunks.current = []; // Reset chunks
        extractMagnitudesFromBlob(audioBlob, 12)
          .then(setMagnitude)
          .catch((error) =>
            notifications.show({
              title: 'Error extracting voice waveform',
              message: error.message,
              color: 'red',
            }),
          );
        // onAudioRecorded?.(audioBlob);
      };

      recorder.start();
      setMediaRecorder(recorder);

      requestDataInterval = setInterval(() => {
        if (recorder.state !== 'inactive') {
          recorder.requestData();
        }
      }, 150);
    } catch (error) {
      console.error('Error accessing audio stream:', error);
      notifications.show({
        title: 'Audio stream accessing error',
        message: 'Unable to access microphone.',
        color: 'red',
      });
    }
  };

  const stopListening = () => {
    // Stop Speech Recognition
    if (recognitionInstance) {
      persistentListening.current = false;
      recognitionInstance.current.stop();
      recognitionInstance.current = null;
    }

    // Stop Media Recorder
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }

    // Stop all tracks in the media stream
    if (mediaRecorder?.stream) {
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }

    setIsListening(false);
  };

  const processTranscription = (rawText: string, isFinal: boolean) => {
    const capitalized = isFinal
      ? rawText.charAt(0).toUpperCase() + rawText.slice(1)
      : rawText;
    return capitalized
      .replace(
        /(\s)(comma|period|question mark|exclamation mark|semicolon|colon|dash)/gi,
        (match) => (punctuations as any)[match] || match,
      )
      .replace(/([.!?]\s)(\w)/g, (s) => s.toUpperCase())
      .replace(/([-,:;]\s)(\w)/g, (s) => s.toLowerCase());
  };

  const handleRedo = () => {
    stopListening();
    startListening();
  };

  const handleDone = () => {
    if (recognitionInstance.current && mediaRecorder) {
      stopListening();
    }
    setOpenModal(false);
  };

  return (
    <>
      <ActionIcon
        className={cn(
          className ??
            'absolute bg-base-black hover:bg-base-black/90 text-white right-4 bottom-7 rounded-full',
          isListening && 'bg-red-500 hover:bg-red-600',
        )}
        // size="xl"
        type="button"
        onClick={
          asModal
            ? () => setOpenModal((prev) => !prev)
            : isListening
              ? stopListening
              : startListening
        }
      >
        {customIcon || <IconMicrophone className="size-5" />}
      </ActionIcon>
      {asModal && (
        <VoiceRecorderModal
          opened={openModal}
          onClose={() => setOpenModal(false)}
          state={isListening ? 'recording' : 'paused'}
          transcript={existingTexts}
          magnitude={magnitude}
          onMicClick={startListening}
          onPauseClick={stopListening}
          onRedoClick={handleRedo}
          onDoneClick={handleDone}
        />
      )}
    </>
  );
};

export default VoiceToTextButton;
