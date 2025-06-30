'use client';

import { useEffect } from 'react';

import { BuddyAgentReq } from '@/store/redux/slices/agents/buddy';
import { agentServerUrl } from '@/store/redux/slices/baseQuery';

export function base64ToUnicode(str: string) {
  // Step 1: Remove non-Base64 characters
  const cleaned = str.replace(/[^A-Za-z0-9+/=]/g, '');

  // Step 2: Add padding if needed
  const padded = cleaned.padEnd(
    cleaned.length + ((4 - (cleaned.length % 4)) % 4),
    '=',
  );

  // Step 3: Decode
  try {
    const raw_decoded = atob(padded);
    const decoded = decodeURIComponent(
      raw_decoded
        .split('')
        // Convert each character to its UTF-8 byte representation
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return decoded;
  } catch (e: any) {
    console.error('Failed to decode Base64 string:', e);
    return e;
  }
}

interface StreamingProps {
  isSent: boolean;
  isLoading: boolean;
  setIsSent: (isSent: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  body: BuddyAgentReq;
  onDataAvailable: (data: any) => void;
}

// In your component
const useStream = ({
  body,
  onDataAvailable,
  isSent,
  isLoading,
  setIsSent,
  setIsLoading,
}: StreamingProps) => {
  useEffect(() => {
    const token = localStorage.getItem('jwt');
    // const controller = new AbortController();

    const runStream = async () => {
      let response: Response;
      let reader: any;
      if (isSent) {
        response = await fetch(`${agentServerUrl}/api/v1/chat/stream_v2`, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
            Authorization: `Bearer ${token}`,
          },
          method: 'POST',
          body: JSON.stringify(body),
        });
        reader = response?.body?.getReader();
        setIsSent(false);
        // setIsLoading(true);
      }

      while (reader && isLoading) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('Stream finished');
          setIsLoading(false);
          break;
        }

        if (value) {
          // Decode the Uint8Array value to a string
          const chunk = new TextDecoder().decode(value);
          // console.log('Received chunk:', chunk);
          setIsLoading(true);
          onDataAvailable(JSON.parse(chunk));
        }
      }
      // setIsLoading(false);
    };

    runStream();
  }, [body, onDataAvailable, isSent, setIsSent, setIsLoading, isLoading]);
};

export default useStream;
