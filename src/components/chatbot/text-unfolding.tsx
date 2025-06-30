import { useEffect, useState } from 'react';

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
      setUnfoldedText((prevText) => prevText + text[charIndex]);
      setCharIndex((prevIndex) => prevIndex + 1);
    }, delay); // Adjust delay as needed

    return () => clearTimeout(timer);
  }, [text, unfoldedText, charIndex]);

  useEffect(() => {
    if (charIndex >= text.length) {
      setUnfoldedText('');
      setCharIndex(0); // Reset for next unfolding
    }
  }, [charIndex, text.length]);

  return (
    <span className={className + ' ml-4 wrap-break-word text-pretty'}>
      {unfoldedText}
    </span>
  );
};

export default TextUnfolder;
