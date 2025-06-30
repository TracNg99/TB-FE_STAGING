import { Modal } from '@mantine/core';
// import { FaCheck } from 'react-icons/fa';
import React from 'react';
import { IoIosArrowBack, IoIosMic, IoIosPause } from 'react-icons/io';

interface VoiceRecorderModalProps {
  opened: boolean;
  onClose: () => void;
  state: 'idle' | 'recording' | 'paused' | 'review';
  transcript?: string;
  magnitude?: number[];
  onMicClick?: () => void;
  onPauseClick?: () => void;
  onRedoClick?: () => void;
  onDoneClick?: () => void;
}

const Dots = () => (
  <div className="flex justify-center gap-2 my-8">
    {Array.from({ length: 12 }).map((_, i) => (
      <span key={i} className="block w-2 h-2 bg-gray-200 rounded-full" />
    ))}
  </div>
);

interface WaveformProps {
  animated?: boolean;
  magnitude?: number[]; // Array of values (0-1 or 0-100) for each bar
}

const Waveform: React.FC<WaveformProps> = ({ animated = false, magnitude }) => {
  const barCount = 12;

  // Generate the bar heights
  const bars = Array.from({ length: barCount }).map((_, i) => {
    let height = 16;
    let bg = animated ? '#FF7A00' : '#E5E7EB';
    if (magnitude && magnitude.length) {
      const mag = Math.max(0.1, Math.min(1, magnitude[i % magnitude.length]));
      height = 16 + mag * 48; // 16-48px
      bg = '#FF7A00';
    } else if (animated) {
      height = 16 + Math.sin(i * 0.4 + Date.now() * 0.01) * 16;
      bg = '#FF7A00';
    }
    return { height, bg, i };
  });

  return (
    <div className="flex flex-col items-center my-8 h-24">
      {/* Top */}
      <div className="flex flex-col items-center">
        <div className="flex justify-center items-end">
          {bars.map((bar) => (
            <span
              key={`top-${bar.i}`}
              className="block w-2 rounded-full mx-0.5 transition-all duration-75"
              style={{
                height: bar.height,
                background: bar.bg,
              }}
            />
          ))}
        </div>
        <div className="flex justify-center items-start top-0">
          {bars.map((bar) => (
            <span
              key={`bottom-${bar.i}`}
              className="block w-2 rounded-full mx-0.5 transition-all duration-75"
              style={{
                height: bar.height,
                background: bar.bg,
                transform: 'scaleY(-1)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const VoiceRecorderModal: React.FC<VoiceRecorderModalProps> = ({
  opened,
  onClose,
  state,
  transcript,
  magnitude,
  onMicClick,
  onPauseClick,
  onRedoClick,
  onDoneClick,
}) => {
  // Determine which UI to show based on state
  const isIdle = state === 'idle';
  const isRecording = state === 'recording';
  const isPaused = state === 'paused';
  const isReview = state === 'review';

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      withCloseButton={false}
      overlayProps={{
        blur: 2,
        backgroundOpacity: 0.6,
        color: '#000',
      }}
      classNames={{
        body: 'p-0',
      }}
      styles={{
        content: {
          borderRadius: '1.5rem',
          padding: 0,
          minWidth: 340,
          maxWidth: 370,
        },
      }}
      zIndex={9999}
    >
      <div className="bg-white rounded-3xl px-6 pt-7 pb-7 flex flex-col items-center min-w-[320px]">
        <div
          className="text-2xl font-bold text-gray-900 mb-2"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          Ask me anything...
        </div>

        {/* Waveform or Dots */}
        {isIdle && <Dots />}
        {(isRecording || isPaused || isReview) && (
          <div className="mt-2 mb-4 text-lg w-full text-center">
            <Waveform
              animated={isRecording || isReview}
              magnitude={magnitude}
            />
            <span className="text-gray-900 font-medium">
              {transcript?.split(/(?= [A-Z])/)[0] || ''}
            </span>
            <span className="text-gray-400">
              {transcript?.split(/(?= [A-Z])/)[1] || ''}
            </span>
          </div>
        )}

        {/* Transcript */}
        {isReview && (
          <div className="mt-2 mb-4 text-lg w-full text-center">
            <span className="text-gray-900 font-medium">
              {transcript?.split(/(?= [A-Z])/)[0] || ''}
            </span>
            <span className="text-gray-400">
              {transcript?.split(/(?= [A-Z])/)[1] || ''}
            </span>
          </div>
        )}

        {/* Main Button(s) */}
        <div className="w-full flex justify-center items-center mt-4">
          {isIdle && (
            <button
              className="w-14 h-14 rounded-full bg-orange-500 border-4 border-white shadow-lg flex items-center justify-center"
              onClick={onMicClick}
            >
              <IoIosMic size={36} color="#fff" />
            </button>
          )}
          {/* {(isRecording || isPaused) && (
            <button
              className="w-14 h-14 rounded-full bg-orange-500 border-4 border-white shadow-lg flex items-center justify-center"
              onClick={isRecording ? onPauseClick : onMicClick}
            >
              {isRecording ? (
                <IoIosPause size={36} color="#fff" />
              ) : (
                <IoIosMic size={36} color="#fff" />
              )}
            </button>
          )} */}
          {(isRecording || isPaused) && (
            <div className="flex w-full items-center justify-between px-3">
              <button
                className="w-10 h-10 rounded-full bg-white border border-orange-500 flex items-center justify-center cursor-pointer"
                onClick={onRedoClick}
              >
                <IoIosArrowBack size={24} color="#FF7A00" />
              </button>
              <button
                className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center cursor-pointer"
                onClick={isRecording ? onPauseClick : onMicClick}
              >
                {isRecording ? (
                  <IoIosPause size={36} color="#fff" />
                ) : (
                  <IoIosMic size={36} color="#fff" />
                )}
              </button>
              <button
                className="text-orange-500 font-semibold text-lg cursor-pointer"
                onClick={onDoneClick}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default VoiceRecorderModal;
