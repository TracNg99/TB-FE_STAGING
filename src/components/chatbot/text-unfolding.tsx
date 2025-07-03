import { useEffect, useState } from 'react';

import { cn } from '@/utils/class';

const TextUnfolder = ({
  text,
  className,
  delay = 30,
}: {
  text: string;
  className: string;
  delay?: number;
}) => {
  const [unfoldedText, setUnfoldedText] = useState<string>('');
  const [charIndex, setCharIndex] = useState<number>(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (charIndex >= text.length) {
        return;
      }
      setUnfoldedText((prevText) => prevText + text[charIndex]);
      setCharIndex((prevIndex) => prevIndex + 1);
    }, delay); // Adjust delay as needed

    return () => clearTimeout(timer);
  }, [text, unfoldedText, charIndex, delay]);

  return (
    <span className={cn(className, 'ml-4 wrap-break-word text-pretty')}>
      {unfoldedText}
    </span>
  );
};

export default TextUnfolder;
