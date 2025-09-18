
import React, { useState, useEffect } from 'react';

const messages = [
    "Analyzing your selection...",
    "Warming up the creative cores...",
    "Mixing digital paints...",
    "Consulting with the art director AI...",
    "Applying pixels with precision...",
    "Rendering the final masterpiece...",
    "This can take a moment, great art needs patience!"
];

export const Loader: React.FC = () => {
  const [message, setMessage] = useState(messages[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage(prevMessage => {
        const currentIndex = messages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % messages.length;
        return messages[nextIndex];
      });
    }, 3000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-4 bg-gray-800/60 border border-gray-700 rounded-lg p-4">
      <p className="text-sm text-center text-gray-300 animate-pulse">{message}</p>
    </div>
  );
};
