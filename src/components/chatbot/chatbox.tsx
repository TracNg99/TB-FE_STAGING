import { Box, Image as ImageDisplay, Tooltip } from '@mantine/core';
// import { useMediaQuery } from '@mantine/hooks';
import { IconX } from '@tabler/icons-react';
import Image from 'next/image';
import React, { useRef, useState } from 'react';
import { FaMicrophone } from 'react-icons/fa';

import VoiceButtonForm from '@/components/audio-handler/voice-to-text';
import TextCarousel from '@/components/text-carousel';
import { cn } from '@/utils/class';

import ImageUploader from '../image-uploader/image-picker';
import InchatUploader from '../image-uploader/image-picker-in-chat';

interface ChatboxProps {
  isHome: boolean;
  isMobile: boolean | undefined;
  onSend: (
    input: string,
    images: Array<{ image: string | null; name: string | null }>,
  ) => void;
  initialSuggestions: string[];
  hasMessages: boolean;
}

// Layer 6: Input Layer (Fixed, Bottom)
const InputLayer: React.FC<{
  isMobile: boolean | undefined;
  input: string;
  selectedImages: Array<{ image: string | null; name: string | null }>;
  onInputChange: (value: string) => void;
  onSend: (input: string) => void;
  onKeyPress: (event: React.KeyboardEvent) => void;
  onImageUpload: (
    images: Array<{ image: string | null; name: string | null }>,
  ) => void;
  onRemoveImage: (index: number) => void;
  onVoiceTranscribe: (text: string) => void;
}> = ({
  isMobile,
  input,
  selectedImages,
  onInputChange,
  onSend,
  onKeyPress,
  onImageUpload,
  onRemoveImage,
  onVoiceTranscribe,
}) => {
  const CustomImageDisplay: React.FC<{
    index: number;
    image: string | null;
    handleRemoveImage: (index: number) => void;
  }> = ({ index, image, handleRemoveImage }) => {
    // const isMobile = useMediaQuery('(max-width: 768px)');
    return (
      <Box
        key={index}
        className={`relative flex flex-row overflow-hidden${isMobile ? 'w-24 h-16' : 'w-full h-20'} items-center mx-2`}
      >
        <Box className="grow h-full items-center bg-transparent p-2 rounded-md overflow-hidden">
          <ImageDisplay
            className="rounded-md"
            src={
              !image
                ? 'https://via.placeholder.com/100x100?text=No+Image'
                : image
            }
            alt={'Uploaded'}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        </Box>
        <Tooltip label="Remove">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleRemoveImage(index);
            }}
            className="flex self-end items-center text-gray-500 bg-transparent cursor-pointer h-full"
          >
            <IconX size={24} />
          </button>
        </Tooltip>
      </Box>
    );
  };

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div
      className={'relative z-30 w-full min-h-[40px] flex flex-col justify-end'}
    >
      {' '}
      {/* Dynamic height, grows with content */}
      <div
        className={cn('w-full mx-auto h-full flex flex-col justify-end px-3')}
      >
        <InchatUploader
          className={cn('flex flex-row w-full lg:mx gap-4 my-3')}
          selectedImages={selectedImages}
          handleRemoveImage={onRemoveImage}
          CustomChildren={CustomImageDisplay}
          singleImageClassName="hidden"
        />

        <div
          className={cn(
            'w-full flex flex-row items-center bg-white m-1 h-full gap-2',
          )}
        >
          {' '}
          {/* Flex row, full height */}
          {/* Text input */}
          <textarea
            className="flex-grow h-full bg-transparent border-none outline-none text-lg placeholder-gray-400 px-2 py-1 resize-none focus:ring-0"
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyPress}
            ref={textAreaRef}
            style={{ minHeight: '60px', maxHeight: '100%', overflow: 'auto' }}
            rows={isMobile ? 2 : 4}
          />
          {/* Image upload */}
          <div className="flex flex-row items-center place-self-end">
            <ImageUploader
              onImageUpload={onImageUpload}
              fetchImages={selectedImages}
              className={cn(
                'flex text-gray-200 rounded-full cursor-pointer align-items-end',
                { 'size-8': isMobile, 'size-10': !isMobile },
              )}
              allowMultiple={true}
            >
              <Image
                src="/assets/image_uploader_icon.svg"
                alt="Upload"
                width={isMobile ? 28 : 32}
                height={isMobile ? 28 : 32}
              />
            </ImageUploader>
            {/* Voice button */}
            <VoiceButtonForm
              language="en-US"
              onTranscribe={onVoiceTranscribe}
              existingTexts={input}
              className={cn(
                'flex flex-end text-gray-600 bg-transparent rounded-full cursor-pointer self-center border items-center',
                { 'size-6 pb-1': isMobile, 'size-10': !isMobile },
              )}
              customIcon={<FaMicrophone className="size-5" />}
              asModal
            />
            {/* Send button */}
            <button
              className={`flex shrink-0 ml-1 rounded-md bg-orange-500 hover:bg-orange-600 text-white cursor-pointer p-[6px] size-[28px]`}
              onClick={() => onSend(input)}
              disabled={input === ''}
            >
              <SendIcon className="text-white" size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
const SendIcon: React.FC<{ className?: string; size?: number }> = ({
  className,
  size,
}) => (
  <Image
    src="/assets/arrow_white.svg"
    alt="Send"
    width={size || 300}
    height={size || 300}
    className={className}
    style={{
      color: 'white',
    }}
    unoptimized
  />
);

const Chatbox: React.FC<ChatboxProps> = ({
  isHome,
  isMobile,
  onSend,
  initialSuggestions,
  hasMessages = false,
}) => {
  const [input, setInput] = useState('');
  const [selectedImages, setSelectedImages] = useState<
    Array<{ image: string | null; name: string | null }>
  >([]);

  const handleSend = (text?: string) => {
    const message = text ?? input;
    if (message.trim() !== '' || selectedImages.length > 0) {
      onSend(message, selectedImages);
      setInput('');
      setSelectedImages([]);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      handleSend();
    }
  };

  return (
    <div className="w-full flex flex-col items-center relative z-50">
      {/* Suggestions Layer */}
      {isHome &&
        initialSuggestions &&
        !hasMessages &&
        initialSuggestions.length > 0 && (
          <div className="w-full flex flex-col items-center mb-2">
            <TextCarousel
              items={initialSuggestions}
              showControls={true}
              renderItem={(item) => (
                <button
                  key={item}
                  className="text-nowrap rounded-full bg-[#FFF2E5] px-2 py-2 text-[11px] text-black hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSend(item)}
                >
                  {item}
                </button>
              )}
              className="w-full mx-auto shrink"
              slideSize={{ base: 25, sm: 50, md: 20 }}
              slideGap={16}
              duration={25}
            />
          </div>
        )}
      {/* Input Layer */}
      <div
        className={cn(
          'w-full flex flex-col bg-white items-center h-full shadow-none border-1 border-black/25 rounded-lg',
        )}
      >
        <InputLayer
          isMobile={isMobile}
          input={input}
          selectedImages={selectedImages}
          onInputChange={setInput}
          onSend={handleSend}
          onKeyPress={handleKeyPress}
          onImageUpload={setSelectedImages}
          onRemoveImage={(idx: number) =>
            setSelectedImages(selectedImages.filter((_, i) => i !== idx))
          }
          onVoiceTranscribe={setInput}
        />
      </div>
    </div>
  );
};

export default Chatbox;
