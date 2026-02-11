import React, { useMemo, useRef, useEffect } from 'react';
import { RADIUS } from '../constants';
import { PhotoItem } from '../types';

interface CarouselProps {
  rotation: number;
  selectedIndex: number;
  items: PhotoItem[];
  perspective: number;
  tilt: number;
}

const CarouselItem: React.FC<{ item: PhotoItem; isSelected: boolean; angle: number }> = ({ item, isSelected, angle }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (item.type === 'video' && videoRef.current) {
      if (isSelected) {
        // Attempt to play
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Auto-play was prevented:", error);
          });
        }
      } else {
        // Pause and reset
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isSelected, item.type]);

  return (
    <div
      className={`absolute top-0 left-0 w-full h-full backface-hidden border-t-2 border-r-2 border-b-2 border-l-4 transition-all duration-500 rounded-r-lg rounded-l-sm overflow-hidden ${
        isSelected 
          ? 'border-l-white border-t-cyan-400/50 border-r-cyan-400/50 border-b-cyan-400/50 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(34,211,238,0.3)] opacity-100 scale-105' 
          : 'border-l-gray-400 border-gray-800 opacity-40 grayscale shadow-xl scale-95'
      }`}
      style={{
        transform: `rotateY(${angle}deg) translateZ(${RADIUS}px)`,
        backgroundColor: item.type === 'video' ? '#000000' : '#1a1a1a',
      }}
    >
      {item.type === 'video' ? (
        <video 
          ref={videoRef}
          src={item.url} 
          className="w-full h-full object-contain pointer-events-none select-none bg-black"
          muted
          loop
          playsInline
        />
      ) : (
        <img 
          src={item.url} 
          alt={item.title} 
          className="w-full h-full object-cover pointer-events-none select-none"
        />
      )}
      
      {/* Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-8 pb-4 px-3">
        <h3 className="text-white font-serif font-bold text-lg leading-tight mb-1 drop-shadow-lg truncate">{item.title}</h3>
        <div className="flex items-center gap-2">
          <div className="h-[1px] flex-1 bg-cyan-500/50"></div>
          <p className="text-cyan-400 text-[8px] uppercase tracking-[0.2em] font-sans truncate">{item.theme}</p>
        </div>
      </div>
      
      {/* Spine Highlight */}
      <div className="absolute top-0 left-0 w-[2px] h-full bg-white/20"></div>
    </div>
  );
};

const Carousel: React.FC<CarouselProps> = ({ rotation, selectedIndex, items, perspective, tilt }) => {
  const theta = 360 / items.length;

  const style = useMemo(() => ({
    transform: `perspective(${perspective}px) rotateX(${tilt}deg) rotateY(${rotation}deg)`,
  }), [rotation, perspective, tilt]);

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{ perspective: `${perspective}px` }}
    >
      <div 
        // Reduced dimensions: approx 2/3 of previous size
        className="relative w-[150px] h-[266px] md:w-[200px] md:h-[355px] transform-style-3d transition-transform duration-700 ease-out"
        style={style}
      >
        {items.map((item, index) => {
          const angle = theta * index;
          const isSelected = index === selectedIndex;
          
          return (
            <CarouselItem 
              key={item.id}
              item={item}
              isSelected={isSelected}
              angle={angle}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Carousel;