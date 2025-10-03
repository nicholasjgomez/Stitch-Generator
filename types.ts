export interface DmcColor {
  name: string;
  dmc: string;
  hex: string;
}

// FIX: Add SavedPattern interface to fix missing type error in components/MyPatternsScreen.tsx.
export interface SavedPattern {
  id: string;
  createdAt: number;
  previewDataUrl: string;
  imageDataUrl: string;
  settings: {
    gridSize: number;
    threshold: number;
    fillShape: 'circle' | 'square';
    outlineOffset: number;
    selectedColor: DmcColor;
  };
}
