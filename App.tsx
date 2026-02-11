import React, { useState, useCallback, useRef } from 'react';
import Carousel from './components/Carousel';
import HandController from './components/HandController';
import { PHOTO_ITEMS } from './constants';
import { GestureType, PhotoItem } from './types';
import { ArrowLeft, ArrowRight, MousePointer2, Upload, Edit3, Check, X, Eye, EyeOff, Image as ImageIcon, Trash2, Film, Monitor, Volume2, VolumeX } from 'lucide-react';

const App: React.FC = () => {
  const [items, setItems] = useState<PhotoItem[]>(PHOTO_ITEMS);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [showControls, setShowControls] = useState(true);
  
  // Custom Background State
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [bgText, setBgText] = useState<string>('GESTURE FLOW');

  // View Settings State
  const [perspective, setPerspective] = useState(1000);
  const [tilt, setTilt] = useState(0);

  // Sound State
  const [isMuted, setIsMuted] = useState(true);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingBg, setIsEditingBg] = useState(false);
  const [isEditingView, setIsEditingView] = useState(false);
  
  const [editTitle, setEditTitle] = useState('');
  const [editTheme, setEditTheme] = useState('');
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const theta = 360 / items.length;

  const rotateNext = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % items.length);
    setRotation((prev) => prev - theta);
  }, [items.length, theta]);

  const rotatePrev = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
    setRotation((prev) => prev + theta);
  }, [items.length, theta]);

  const handleGesture = (gesture: GestureType) => {
    if (isEditing || isEditingBg || isEditingView) return; // Disable gestures while editing
    if (gesture === GestureType.SWIPE_LEFT) {
      rotateNext();
    } else if (gesture === GestureType.SWIPE_RIGHT) {
      rotatePrev();
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleBgUploadClick = () => {
    bgInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newUrl = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video/');
      const fileType = isVideo ? 'video' : 'image';
      
      setItems((prevItems) => {
        const newItems = [...prevItems];
        newItems[selectedIndex] = {
          ...newItems[selectedIndex],
          url: newUrl,
          title: file.name.split('.')[0] || "Custom Media",
          theme: "User Upload",
          type: fileType
        };
        return newItems;
      });
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleBgFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBgImage(URL.createObjectURL(file));
    }
    if (bgInputRef.current) bgInputRef.current.value = '';
  };

  const startEditing = () => {
    const currentItem = items[selectedIndex];
    setEditTitle(currentItem.title);
    setEditTheme(currentItem.theme);
    setIsEditing(true);
  };

  const saveEdit = () => {
    setItems((prev) => {
      const newItems = [...prev];
      newItems[selectedIndex] = {
        ...newItems[selectedIndex],
        title: editTitle,
        theme: editTheme
      };
      return newItems;
    });
    setIsEditing(false);
  };

  const isModalOpen = isEditing || isEditingBg || isEditingView;

  return (
    <div className="relative w-screen h-screen bg-[#050505] overflow-hidden flex flex-col">
      {/* Dynamic Background Layer */}
      {bgImage ? (
        <div className="absolute inset-0 z-0">
          <img src={bgImage} alt="Background" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
        </div>
      ) : (
        /* Default Gradient Mesh */
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[100px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/20 blur-[100px]" />
        </div>
      )}
      
      {/* Background Text Layer */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
         <h1 className="text-[12vw] font-black text-white/5 whitespace-nowrap tracking-tighter select-none transform scale-y-150 blur-sm">
            {bgText}
         </h1>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <Carousel 
          rotation={rotation} 
          selectedIndex={selectedIndex} 
          items={items} 
          perspective={perspective}
          tilt={tilt}
          isMuted={isMuted}
        />
      </div>

      {/* Hand Controller (Bottom Right) - Always mounted, hidden via CSS if modal open to prevent restart */}
      <div className={isModalOpen ? "opacity-0 pointer-events-none" : "opacity-100"}>
         <HandController onGesture={handleGesture} />
      </div>

      {/* Visibility Toggle Button (Bottom Left) */}
      <button 
        onClick={() => setShowControls(prev => !prev)}
        className="fixed bottom-6 left-6 z-50 p-3 bg-gray-900/50 hover:bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-full text-gray-400 hover:text-cyan-400 transition-all shadow-lg group"
        title={showControls ? "Hide Controls" : "Show Controls"}
      >
        {showControls ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>

      {/* Hidden File Inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*,video/*" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={bgInputRef} 
        onChange={handleBgFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Edit Image Modal Overlay */}
      {isEditing && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl w-[90%] max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold text-white mb-4">Edit Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Title</label>
                <input 
                  type="text" 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Enter title..."
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Theme / Subtitle</label>
                <input 
                  type="text" 
                  value={editTheme}
                  onChange={(e) => setEditTheme(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Enter theme..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button 
                onClick={saveEdit}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors shadow-lg shadow-cyan-900/20"
              >
                <Check className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Background Modal Overlay */}
      {isEditingBg && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl w-[90%] max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold text-white mb-4">Background Settings</h2>
            
            <div className="space-y-6">
              {/* Background Image Control */}
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Background Image</label>
                <div className="flex gap-3">
                   <button 
                     onClick={handleBgUploadClick}
                     className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 border-dashed rounded-lg py-3 transition-colors"
                   >
                     <Upload className="w-4 h-4 text-cyan-400" />
                     <span className="text-sm text-gray-300">Upload Image</span>
                   </button>
                   {bgImage && (
                     <button 
                        onClick={() => setBgImage(null)}
                        className="p-3 bg-red-900/30 hover:bg-red-900/50 border border-red-900 rounded-lg text-red-400 transition-colors"
                        title="Remove Background Image"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                   )}
                </div>
              </div>

              {/* Background Text Control */}
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Background Text</label>
                <input 
                  type="text" 
                  value={bgText}
                  onChange={(e) => setBgText(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Enter background text..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setIsEditingBg(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors shadow-lg shadow-cyan-900/20 w-full justify-center"
              >
                <Check className="w-4 h-4" />
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit View/Perspective Modal Overlay */}
      {isEditingView && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl w-[90%] max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold text-white mb-4">View Perspective</h2>
            
            <div className="space-y-6">
              {/* Perspective Slider */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Depth (Perspective)</label>
                  <span className="text-xs text-cyan-400">{perspective}px</span>
                </div>
                <input 
                  type="range" 
                  min="200" 
                  max="2000" 
                  step="50"
                  value={perspective}
                  onChange={(e) => setPerspective(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <p className="text-[10px] text-gray-500 mt-1">Controls the 3D depth intensity.</p>
              </div>

              {/* Tilt Slider */}
              <div>
                <div className="flex justify-between mb-2">
                   <label className="text-xs text-gray-400 uppercase tracking-wider">Vertical Tilt</label>
                   <span className="text-xs text-cyan-400">{tilt}°</span>
                </div>
                <input 
                  type="range" 
                  min="-45" 
                  max="45" 
                  step="1"
                  value={tilt}
                  onChange={(e) => setTilt(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <p className="text-[10px] text-gray-500 mt-1">Rotate the wheel up or down.</p>
              </div>

              {/* Presets */}
              <div className="flex gap-2 justify-center pt-2">
                 <button 
                   onClick={() => { setPerspective(1000); setTilt(0); }}
                   className="text-xs px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded border border-gray-600 text-gray-400"
                 >
                   Reset
                 </button>
                 <button 
                   onClick={() => { setPerspective(600); setTilt(15); }}
                   className="text-xs px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded border border-gray-600 text-gray-400"
                 >
                   Dramatic
                 </button>
                 <button 
                   onClick={() => { setPerspective(2000); setTilt(-10); }}
                   className="text-xs px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded border border-gray-600 text-gray-400"
                 >
                   Flat
                 </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setIsEditingView(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors shadow-lg shadow-cyan-900/20 w-full justify-center"
              >
                <Check className="w-4 h-4" />
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Controls - Hide when editing OR showControls is false */}
      {!isEditing && !isEditingBg && !isEditingView && showControls && (
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-6 z-30 w-full px-4 animate-in slide-in-from-bottom-10 fade-in duration-300">
          
           <div className="flex gap-4">
             {/* Upload Button */}
             <button 
               onClick={handleUploadClick}
               className="flex items-center gap-2 bg-gray-800/80 hover:bg-gray-700 backdrop-blur-md border border-gray-600 px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-lg group"
               title="Replace Selected Content"
             >
               {items[selectedIndex].type === 'video' ? <Film className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" /> : <Upload className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />}
               <span className="hidden md:inline">Media</span>
             </button>

             {/* Edit Text Button */}
             <button 
               onClick={startEditing}
               className="flex items-center gap-2 bg-gray-800/80 hover:bg-gray-700 backdrop-blur-md border border-gray-600 px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-lg group"
               title="Edit Text"
             >
               <Edit3 className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
               <span className="hidden md:inline">Text</span>
             </button>

             {/* Background Settings Button */}
             <button 
               onClick={() => setIsEditingBg(true)}
               className="flex items-center gap-2 bg-gray-800/80 hover:bg-gray-700 backdrop-blur-md border border-gray-600 px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-lg group"
               title="Edit Background"
             >
               <ImageIcon className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform" />
               <span className="hidden md:inline">Background</span>
             </button>

             {/* View Perspective Button */}
             <button 
               onClick={() => setIsEditingView(true)}
               className="flex items-center gap-2 bg-gray-800/80 hover:bg-gray-700 backdrop-blur-md border border-gray-600 px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-lg group"
               title="Adjust Perspective"
             >
               <Monitor className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
               <span className="hidden md:inline">View</span>
             </button>

             {/* Sound Toggle Button */}
             <button 
               onClick={() => setIsMuted(!isMuted)}
               className={`flex items-center gap-2 bg-gray-800/80 hover:bg-gray-700 backdrop-blur-md border border-gray-600 px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-lg group ${!isMuted ? 'text-cyan-400' : 'text-gray-400'}`}
               title={isMuted ? "Unmute Sound" : "Mute Sound"}
             >
               {isMuted ? (
                 <VolumeX className="w-4 h-4 group-hover:scale-110 transition-transform" />
               ) : (
                 <Volume2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
               )}
               <span className="hidden md:inline">Sound</span>
             </button>
           </div>

           {/* Navigation */}
           <div className="flex items-center gap-8">
              <button 
                onClick={rotatePrev}
                className="p-4 rounded-full bg-gray-800/50 hover:bg-gray-700/80 backdrop-blur-sm border border-gray-600 transition-all active:scale-95 group"
                aria-label="Previous"
              >
                <ArrowLeft className="w-6 h-6 text-white group-hover:text-cyan-400" />
              </button>
              <div className="flex flex-col items-center justify-center gap-1 text-gray-500">
                  <MousePointer2 className="w-4 h-4 opacity-50" />
                  <span className="text-[10px] uppercase tracking-widest">Swipe</span>
              </div>
              <button 
                onClick={rotateNext}
                className="p-4 rounded-full bg-gray-800/50 hover:bg-gray-700/80 backdrop-blur-sm border border-gray-600 transition-all active:scale-95 group"
                aria-label="Next"
              >
                <ArrowRight className="w-6 h-6 text-white group-hover:text-cyan-400" />
              </button>
           </div>
        </div>
      )}

    </div>
  );
};

export default App;