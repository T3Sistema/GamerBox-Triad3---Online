import React from 'react';

export const GamepadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="6" x2="10" y1="12" y2="12" />
    <line x1="8" x2="8" y1="10" y2="14" />
    <line x1="15" x2="15.01" y1="13" y2="13" />
    <line x1="18" x2="18.01" y1="10" y2="10" />
    <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.01.152v5.516c0 .05.004.1.01.152A4 4 0 0 0 6.68 19h10.64a4 4 0 0 0 3.978-3.59c.006-.052.01-.101.01-.152V8.742c0-.05-.004-.1-.01-.152A4 4 0 0 0 17.32 5z" />
  </svg>
);