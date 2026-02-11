import { PhotoItem } from './types';

export const PHOTO_ITEMS: PhotoItem[] = [
  { id: 1, url: 'https://picsum.photos/id/10/600/1067', title: 'Misty Forest', theme: 'Mysterious Nature' },
  { id: 2, url: 'https://picsum.photos/id/28/600/1067', title: 'Forest Path', theme: 'Adventure' },
  { id: 3, url: 'https://picsum.photos/id/49/600/1067', title: 'Misty Coast', theme: 'Tranquility' },
  { id: 4, url: 'https://picsum.photos/id/54/600/1067', title: 'Deep Canyon', theme: 'Vastness' },
  { id: 5, url: 'https://picsum.photos/id/60/600/1067', title: 'Office Tech', theme: 'Productivity' },
  { id: 6, url: 'https://picsum.photos/id/119/600/1067', title: 'Metal Work', theme: 'Industrial' },
  { id: 7, url: 'https://picsum.photos/id/164/600/1067', title: 'City Boat', theme: 'Urban Life' },
  { id: 8, url: 'https://picsum.photos/id/180/600/1067', title: 'Laptop Work', theme: 'Focus' },
];

export const RADIUS = 250; // Reduced radius for smaller items
export const SWIPE_THRESHOLD = 0.05; // Sensitivity for hand movement
export const COOLDOWN_MS = 800; // Time between gestures