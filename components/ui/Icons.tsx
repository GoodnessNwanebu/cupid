import React from 'react';

export const HeartDashed: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    viewBox="0 0 200 200" 
    className={className} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M100 180.5C98.5 180.5 97 179.9 96 178.8C65.4 148.6 40.2 126.8 24.3 107.5C10.7 91.1 4 75.8 4 60C4 31.8 26.2 10 54 10C69.4 10 84.3 17.5 93.5 29.8C96.9 34.3 103.1 34.3 106.5 29.8C115.7 17.5 130.6 10 146 10C173.8 10 196 31.8 196 60C196 75.8 189.3 91.1 175.7 107.5C159.8 126.8 134.6 148.6 104 178.8C103 179.9 101.5 180.5 100 180.5Z" 
      stroke="currentColor" 
      strokeWidth="4" 
      strokeDasharray="12 12" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const HeartSolid: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" />
  </svg>
);