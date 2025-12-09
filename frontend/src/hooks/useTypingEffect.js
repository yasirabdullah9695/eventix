import { useState, useEffect } from 'react';

const useTypingEffect = (text, speed = 100, delay = 0) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (delay) {
      const delayTimeout = setTimeout(() => {
        setCurrentIndex(0);
      }, delay);
      return () => clearTimeout(delayTimeout);
    }
  }, [delay]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const typingTimeout = setTimeout(() => {
        setDisplayText(prevText => prevText + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, speed);
      return () => clearTimeout(typingTimeout);
    }
  }, [text, speed, currentIndex, delay]);

  return displayText;
};

export default useTypingEffect;
