
export enum AppScreen {
  HOME = 'HOME',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
  END = 'END',
}

export interface PolaroidData {
  id: string;
  image: string; // Base64 or URL
  caption: string;
  date: string;
  generatedAt: number;
}

export interface UploadedFile {
  id: string;
  file: File;
  previewUrl: string;
}

// Icons types
export interface IconProps {
  className?: string;
  size?: number;
  color?: string;
  onClick?: () => void;
}
