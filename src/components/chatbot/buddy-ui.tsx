'use client';

import { ScrollArea, TextInput } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
// import { IoCameraOutline } from "react-icons/io5";
import { FaMicrophone } from 'react-icons/fa';
import { FaRegImage } from 'react-icons/fa';
// import { IconArrowDown } from '@tabler/icons-react';
import { IoIosClose } from 'react-icons/io';
import { MdArrowForwardIos } from 'react-icons/md';
import { RiResetLeftFill } from 'react-icons/ri';
import ReactMarkdown from 'react-markdown';

// import remarkGfm from 'remark-gfm';

import VoiceButtonForm from '@/components/audio-handler/voice-to-text';
import useStream, {
  base64ToUnicode,
} from '@/components/chatbot/streaming-hook';
import TextUnfolder from '@/components/chatbot/text-unfolding';
import ImageUploader from '@/components/image-uploader/image-picker';
import InchatUploader from '@/components/image-uploader/image-picker-in-chat';
import {
  // useGetStreamResultsQuery,
  // useCallBuddyAgentMutation,
  // usePostStreamMutation,
  useRestChatMemoryQuery,
  // usePostStreamNativeMutation
} from '@/store/redux/slices/agents/buddy';

const InactiveSvgList = [
  {
    tag: 'sunglass',
    icon: '/assets/chatbot/inactive/sunglass.gif',
  },
  { tag: 'smiling', icon: '/assets/chatbot/inactive/smiling.gif' },
  {
    tag: 'slightly-smiling-face',
    icon: '/assets/chatbot/inactive/slightly-smiling-face.svg',
  },
  { tag: 'sleepy', icon: '/assets/chatbot/inactive/sleepy.gif' },
  {
    tag: 'nerd',
    icon: '/assets/chatbot/inactive/nerd.gif',
  },
  {
    tag: 'speculative',
    icon: '/assets/chatbot/inactive/speculative.gif',
  },
  {
    tag: 'whistle',
    icon: '/assets/chatbot/inactive/whistle.gif',
  },
  {
    tag: 'wide_smile',
    icon: '/assets/chatbot/inactive/wide_smile.gif',
  },
];

const ActiveSvgList = [
  {
    tag: 'face-with-monocle',
    icon: '/assets/chatbot/active/face-with-monocle.svg',
  },
  { tag: 'nerd-face', icon: '/assets/chatbot/active/nerd-face.svg' },
  { tag: 'thinking', icon: '/assets/chatbot/active/thinking-emoji.svg' },
  {
    tag: 'face-exhaling',
    icon: '/assets/chatbot/active/fluent-emoji_face-exhaling.svg',
  },
  {
    tag: 'pleading-face',
    icon: '/assets/chatbot/active/fluent-emoji_pleading-face.svg',
  },
  {
    tag: 'saluting-face',
    icon: '/assets/chatbot/active/fluent-emoji_saluting-face.svg',
  },
  {
    tag: 'woozy-face',
    icon: '/assets/chatbot/active/fluent-emoji_woozy-face.svg',
  },
  { tag: 'fullfilled', icon: '/assets/chatbot/active/fullfilled-emoji.svg' },
  {
    tag: 'melting-face',
    icon: '/assets/chatbot/active/melting-face-emoji.svg',
  },
  { tag: 'no-comment', icon: '/assets/chatbot/active/no-comment-emoji.svg' },
  { tag: 'sleeping', icon: '/assets/chatbot/active/sleeping-emoji.svg' },
  {
    tag: 'smiling-handsup',
    icon: '/assets/chatbot/active/smiling-handsup-emoji.svg',
  },
  {
    tag: 'sunshine-face',
    icon: '/assets/chatbot/active/sunshine-face-emoji.svg',
  },
  { tag: 'whistle', icon: '/assets/chatbot/active/whistle-emoji.svg' },
];

const BuddyInactiveIcon = () => {
  let randomIndex = 0;
  setTimeout(() => {
    randomIndex = Math.floor(Math.random() * InactiveSvgList.length);
  }, 20000);
  return (
    <Image
      src={InactiveSvgList[randomIndex].icon}
      alt="Buddy Inactive"
      width={40}
      height={40}
      unoptimized
    />
  );
}; // Math.floor(Math.random() * InactiveSvgList.length)

const BuddyActiveIcon = ({ icon }: { icon: string }) => (
  <Image
    src={
      icon || '' // Fallback to the first icon if tag not found
    }
    alt="Buddy Active"
    width={40}
    height={40}
    unoptimized
  />
);

const SendIcon: React.FC<{ className?: string; size?: number }> = ({
  className,
  size,
}) => (
  <Image
    src="/assets/chatbot/active/mingcute_send-fill.svg"
    alt="Send"
    width={size || 300}
    height={size || 300}
    className={className}
    unoptimized
  />
);

const LoadingChatResponse = ({
  text,
  isMobile,
}: {
  text?: string;
  isMobile?: boolean;
}) => (
  <div
    className={`flex flex-row rounded-2xl shadow-lg px-4 py-3 text-base max-w-[90%] ${'bg-gray-700/60 text-gray-600 self-start'} ${isMobile ? 'text-[13px]' : 'text-[17px]'}`}
    style={{
      borderTopLeftRadius: 0,
    }}
  >
    <div className="flex items-center justify-center space-x-1 h-6">
      <span
        className="inline-block w-2 h-2 bg-white rounded-full opacity-70 animate-bounce"
        style={{ animationDelay: '0s' }}
      />
      <span
        className="inline-block w-2 h-2 bg-white rounded-full opacity-70 animate-bounce"
        style={{ animationDelay: '0.2s' }}
      />
      <span
        className="inline-block w-2 h-2 bg-white rounded-full opacity-70 animate-bounce"
        style={{ animationDelay: '0.4s' }}
      />
    </div>
    {text && <TextUnfolder text={text} className="text-white-800" />}
  </div>
);

const initialMessages = [
  {
    from: 'bot',
    text: "Hi there, I'm your Travel Buddy! Ask me anything (except to carry your bags 😁)",
    tag: 'smiling-handsup',
  },
];

const BuddyUI = ({ context }: { context?: { [key: string]: string } }) => {
  const [active, setActive] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [resetState, setResetState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snack, setSnack] = useState({
    visible: true,
    message: 'Ask me anything!',
  });
  const [floatingTexts, setFloatingTexts] = useState<string>('');
  const [displayedText, setDisplayedText] = useState<string>('');
  const [charIndex, setCharIndex] = useState<number>(0);

  const [messages, setMessages] = useState<
    {
      from: string;
      text: string;
      tag: string;
      images?: string[];
      souces?: string[];
      suggestions?: string[];
    }[]
  >(initialMessages);
  const chatSessionId = useRef<string | null>(null);
  const [input, setInput] = useState('');
  const [selectedImages, setSelectedImages] = useState<
    Array<{ image: string | null; name: string | null }>
  >([]);

  const isMobile = useMediaQuery('(max-width: 640px)');

  const { data: resetData } = useRestChatMemoryQuery(
    {
      session_id: chatSessionId.current,
    },
    {
      skip: !resetState,
    },
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Reset displayed text and character index when messages change
    if (
      messages[messages.length - 1].from === 'bot' &&
      messages[messages.length - 1].text !== '' &&
      messages[messages.length - 1].text !== null &&
      charIndex < messages[messages.length - 1].text?.length
    ) {
      const text = messages[messages.length - 1].text;
      const timer = setTimeout(() => {
        setDisplayedText((prevText) => prevText + text[charIndex]);
        setCharIndex((prevIndex) => prevIndex + 1);
      }, 30); // Adjust delay as needed

      return () => clearTimeout(timer);
    }

    // if (
    //   messages[messages.length -1].from ==="bot"
    //   && messages[messages.length -1].text.length - 1 === charIndex
    // ) {
    //   setDisplayedText('');
    //   setCharIndex(0);
    // }
  }, [charIndex, displayedText, messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (resetData) {
      notifications.show({
        title: 'Chat Reset',
        message: 'Your chat has been reset.',
        color: 'green',
      });
      setResetState(false);
    }
  }, [resetData]);

  useEffect(() => {
    if (snack.visible) {
      const timer = setTimeout(() => {
        setSnack({ ...snack, visible: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [snack.visible]);

  const handleReset = () => {
    setMessages(initialMessages);
    setInput('');
    setSelectedImages([]);
    setResetState(true);
    setIsSent(false);
    setDisplayedText('');
    setCharIndex(0);
    setFloatingTexts('');
    setIsLoading(false);
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleOnChunkAvailable = (chunk: any) => {
    console.log('Chunk event:', chunk.event);
    setFloatingTexts('');
    setDisplayedText('');
    setCharIndex(0);
    if (chunk.event !== 'complete') {
      setFloatingTexts(
        chunk.data?.response ? base64ToUnicode(chunk.data?.response) : null,
      );
      return;
    }
    setIsLoading(false);
    console.log('Emoticon', chunk.data?.emoticon, typeof chunk.data?.emoticon);
    console.log(
      'Response:',
      chunk.data?.response ? base64ToUnicode(chunk.data?.response) : null,
    );
    setMessages((msgs) => [
      ...msgs,
      {
        from: 'bot',
        text: chunk.data?.response
          ? base64ToUnicode(chunk.data?.response)
          : null,
        tag: chunk.event !== 'complete' ? 'face-with-monocle' : 'nerd-face',
        images: chunk.data?.images || [],
        souces: chunk.data?.souces || [],
        suggestions: chunk.data?.suggestions || [],
      },
    ]);

    // console.log('Decoded response', base64ToUnicode(chunk.data?.response));
    chatSessionId.current = chunk.data?.session_id;
  };

  useStream({
    body: {
      query: messages[messages.length - 1].text,
      images: messages[messages.length - 1].images || [],
      filters: {
        ...context,
      },
      session_id: chatSessionId.current,
    },
    onDataAvailable: handleOnChunkAvailable,
    isSent,
    isLoading,
    setIsSent,
    setIsLoading,
  });

  const handleSend = async () => {
    if (!input.trim() && selectedImages.length === 0) return;
    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      {
        from: 'user',
        text: input,
        tag: '',
        images: selectedImages.map((image) => image.image || ''),
      },
    ]);
    setDisplayedText('');
    setCharIndex(0);
    setInput('');
    setIsSent(true);
    setSelectedImages([]);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
  };

  // Minimized State
  if (!active) {
    return (
      <div className="fixed bottom-6 right-6 flex flex-col items-end z-50">
        {snack.visible && (
          <div className="mb-2 px-4 py-2 rounded-xl bg-white shadow-lg text-gray-800 text-sm animate-bounce">
            {snack.message}
          </div>
        )}
        <button
          className="bg-orange-600 hover:bg-orange-500 rounded-full shadow-lg p-3 transition"
          aria-label="Open chatbot"
          onClick={() => setActive(true)}
        >
          <BuddyInactiveIcon />
        </button>
      </div>
    );
  }

  // Active State (Chat Overlay)
  return (
    <div className="fixed bottom-0 right-0 z-50 flex flex-col w-full max-w-[460px] h-[500px] mr-0 mb-0 rounded-t-lg bg-transparent shadow-md overflow-clip backdrop-blur-sm sm:w-[460px] sm:mr-5 sm:mb-5">
      {/* Header */}
      <div className="bg-orange-400 text-white p-3 rounded-t-lg flex justify-between items-center">
        {/* AI Buddy text component */}
        <span className="font-semibold text-lg ml-2">AI Buddy</span>
        {/* Right side - Button group */}
        <div className="flex items-center mr-2">
          {/* Clear chat button - matched to close button size */}
          <button
            className="flex items-center bg-orange-400 hover:bg-orange-600 rounded-full p-2 gap-2 transition text-white text-sm mr-1"
            aria-label="Reset chat memory"
            onClick={handleReset}
          >
            <RiResetLeftFill className="text-2xl" />
          </button>

          {/* Minimize button */}
          <button
            className="p-2 text-white bg-orange-400 hover:bg-orange-600 rounded-full transition"
            onClick={() => setActive(false)}
            aria-label="Close chat"
          >
            <IoIosClose className="text-5xl -m-3" />
          </button>
        </div>
      </div>
      {/* <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-bold">Travel Buddy</h2>
        <button
          className="bg-orange-400 hover:bg-orange-500 rounded-full shadow-lg p-3 transition"
          aria-label="Close chatbot"
          onClick={() => setActive(false)}
        >
          <BuddyInactiveIcon />
        </button>
      </div> */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full overflow-y-auto">
          <div className="flex flex-col gap-4 p-4 pb-10">
            {messages.map(
              (msg, i) =>
                msg.text && (
                  <div
                    key={i}
                    className="flex flex-col gap-2"
                    ref={messagesEndRef}
                  >
                    <div
                      key={i}
                      className={`flex flex-row items-center gap-2 bg-opacity-0 ${
                        msg.from === 'bot' ? 'self-start' : 'self-end'
                      }`}
                    >
                      {msg.from === 'bot' && (
                        <BuddyActiveIcon
                          icon={
                            ActiveSvgList.find((e) => e.tag === msg.tag)
                              ?.icon || ActiveSvgList[0].icon
                          }
                        />
                      )}
                      <div
                        key={i}
                        className={`rounded-2xl shadow-lg px-4 py-3 text-base max-w-[90%] ${
                          msg.from === 'bot'
                            ? 'bg-white text-gray-900 self-start'
                            : 'bg-orange-100 text-orange-900 self-end'
                        } ${isMobile ? 'text-[13px]' : 'text-[17px]'}`}
                        style={{
                          borderTopLeftRadius:
                            msg.from === 'bot' ? 0 : undefined,
                          borderTopRightRadius:
                            msg.from === 'user' ? 0 : undefined,
                        }}
                      >
                        <ReactMarkdown
                          // remarkPlugins={[remarkGfm]}
                          components={{
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
                          {msg.from === 'bot' && i === messages.length - 1
                            ? displayedText
                            : msg.text}
                        </ReactMarkdown>
                      </div>
                    </div>
                    {msg.images && msg.images.length > 0 && (
                      <div
                        className={`flex flex-row gap-2 ${msg.from === 'bot' ? 'ml-14 self-start' : 'mr-14 self-end'}`}
                      >
                        {msg.images.map((image, i) => (
                          <Image
                            key={i}
                            src={image}
                            alt="Image"
                            width={100}
                            height={100}
                            className="rounded-2xl shadow-lg"
                          />
                        ))}
                      </div>
                    )}
                    {msg.souces &&
                      msg.souces.length > 0 &&
                      msg.from === 'bot' && (
                        <div
                          className={`flex flex-col gap-2 self-start ml-14 ${isMobile ? 'text-[13px]' : 'text-[17px]'}`}
                        >
                          {msg.souces.map((source, i) => (
                            <a
                              key={i}
                              href={source}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              {source}
                            </a>
                          ))}
                        </div>
                      )}
                    {msg.suggestions &&
                      msg.suggestions.length > 0 &&
                      msg.from === 'bot' && (
                        <div
                          className={`flex flex-col gap-2 self-start ml-14 ${isMobile ? 'text-[13px]' : 'text-[17px]'}`}
                        >
                          {msg.suggestions.map((suggestion, i) => (
                            <button
                              key={i}
                              className="flex flex-row items-center gap-2 bg-gray-100 text-orange-500 rounded-2xl shadow-lg px-4 py-3 text-base cursor-pointer"
                              onClick={() => handleSuggestion(suggestion)}
                            >
                              {suggestion}{' '}
                              <MdArrowForwardIos className="text-orange-500 text-[20px]" />
                            </button>
                          ))}
                        </div>
                      )}
                    {isLoading &&
                      // msg.from === 'bot' &&
                      i === messages.length - 1 && (
                        <LoadingChatResponse
                          text={floatingTexts}
                          isMobile={isMobile}
                        />
                      )}
                  </div>
                ),
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="border-t border-gray-300 bg-gray-800 p-2 pb-2 flex-shrink-0">
        <InchatUploader
          selectedImages={selectedImages}
          handleRemoveImage={handleRemoveImage}
        />

        {/* Input bar - now with proper spacing and scaling */}
        <div className="flex items-center w-full gap-1">
          {/* Image upload */}
          <ImageUploader
            onImageUpload={setSelectedImages}
            fetchImages={selectedImages}
            className="p-1 text-gray-200 hover:bg-gray-700 rounded-full cursor-pointer"
            allowMultiple={true}
          >
            <FaRegImage className="text-lg" />
          </ImageUploader>

          {/* Voice button */}
          <VoiceButtonForm
            language="en-US"
            onTranscribe={(e) => setInput(e)}
            existingTexts={input}
            className="p-1 text-gray-200 hover:bg-gray-700 rounded-full cursor-pointer"
            customIcon={<FaMicrophone className="text-lg" />}
            asModal
          />

          {/* Text input (flexible width) */}
          <div className="flex-1 min-w-[120px] bg-gray-700 rounded-md px-3 py-2 mx-1">
            <TextInput
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              onKeyUp={handleKeyPress}
              variant="unstyled"
              styles={{
                input: {
                  color: 'white',
                  width: '100%',
                  fontSize: isMobile ? '14px' : '16px',
                },
              }}
            />
          </div>

          {/* Send button (properly sized) */}
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-1 text-orange-400 hover:bg-gray-700 rounded-full transition"
          >
            <SendIcon size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuddyUI;
