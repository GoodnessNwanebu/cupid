
export enum AppScreen {
  HOME = 'HOME',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
  END = 'END',
}

export interface PolaroidData {
  id: string;
  image: string; // Base64 or URL (the composite photo area)
  caption: string;
  date: string;
  generatedAt: number;
  isCollage?: boolean;
  sourceImages?: string[]; // Original images for collages
  imageOffsets?: { x: number, y: number }[]; // Custom focal points (0.0 to 1.0)
  filter?: 'none' | 'mono';
}

export interface UploadedFile {
  id: string;
  file: File;
  previewUrl: string;
}

export enum GenerationMode {
  INDIVIDUAL = 'INDIVIDUAL',
  COLLAGE = 'COLLAGE',
}

export enum CollageStyle {
  GRID = 'GRID',
  SCRAPBOOK = 'SCRAPBOOK',
}

// Icons types
export interface IconProps {
  className?: string;
  size?: number;
  color?: string;
  onClick?: () => void;
}
