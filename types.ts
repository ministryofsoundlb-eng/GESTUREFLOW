export interface PhotoItem {
  id: number;
  url: string;
  title: string;
  theme: string;
  type: 'image' | 'video';
}

export enum GestureType {
  NONE = 'NONE',
  SWIPE_LEFT = 'SWIPE_LEFT',
  SWIPE_RIGHT = 'SWIPE_RIGHT',
  HOVER = 'HOVER'
}

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}