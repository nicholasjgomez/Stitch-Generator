export interface DmcColor {
  name: string;
  dmc: string;
  hex: string;
}

export interface SavedPattern {
  id: string;
  imageDataUrl: string;
  previewDataUrl: string;
  gridSize: number;
  threshold: number;
  fillShape: 'circle' | 'square';
  outlineOffset: number;
  selectedColor: DmcColor;
  createdAt: string;
}
