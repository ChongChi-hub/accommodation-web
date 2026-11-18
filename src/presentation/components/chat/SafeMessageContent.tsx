'use client';

import React from 'react';

const URL_REGEX = /(https?:\/\/[^\s<>"']+)/gi;

export function SafeMessageContent({ text }: { text: string }) {
  if (!text) return null;
  const parts = text.split(URL_REGEX);
  return (
    <span className="whitespace-pre-wrap break-words">
      {parts.map((part, idx) => {
        if (/^https?:\/\//i.test(part)) {
          return (
            <a
              key={idx}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-current/70 hover:opacity-80 break-all"
            >
              {part}
            </a>
          );
        }
        return <React.Fragment key={idx}>{part}</React.Fragment>;
      })}
    </span>
  );
}
