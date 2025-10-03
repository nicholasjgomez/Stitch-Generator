export interface DmcColor {
  name: string;
  dmc: string;
  hex: string;
}

// FIX: Add SavedPattern interface to fix import error in MyPatternsScreen.tsx.
export interface SavedPattern {
  id: string;
  previewDataUrl: string;
  createdAt: number;
}
