'use client';

import { useState, useEffect, useRef } from 'react';
import { Typography } from '@mui/material';

interface StreamingTextProps {
  text: string;
  isComplete: boolean;
  isDarkMode: boolean;
}

export function StreamingText({ text, isComplete, isDarkMode }: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isComplete) {
      setDisplayedText(text);
      setCurrentIndex(text.length);
      return;
    }

    // Reset animation when text changes
    if (text !== displayedText) {
      setDisplayedText('');
      setCurrentIndex(0);
    }

    // Animate text display
    if (currentIndex < text.length) {
      timeoutRef.current = setTimeout(() => {
        const nextChar = text[currentIndex];
        const nextIndex = currentIndex + 1;
        
        // If it's a space, include the next word
        if (nextChar === ' ') {
          const remainingText = text.slice(nextIndex);
          const nextWord = remainingText.split(' ')[0];
          setDisplayedText(prev => `${prev} ${nextWord}`);
          setCurrentIndex(nextIndex + nextWord.length);
        } else if (currentIndex === 0) {
          // First word
          const firstWord = text.split(' ')[0];
          setDisplayedText(firstWord);
          setCurrentIndex(firstWord.length);
        } else {
          setDisplayedText(text.slice(0, nextIndex));
          setCurrentIndex(nextIndex);
        }
      }, 30); // Adjust speed here
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, currentIndex, isComplete, displayedText]);

  return (
    <Typography 
      variant="body1" 
      sx={{ 
        color: isDarkMode ? '#E5E7EB' : '#334155',
        lineHeight: 1.7,
        whiteSpace: 'pre-wrap',
        fontSize: '0.875rem',
      }}
    >
      {displayedText}
      {currentIndex < text.length && (
        <span className="cursor" style={{ opacity: 0.7 }}>▋</span>
      )}
    </Typography>
  );
} 