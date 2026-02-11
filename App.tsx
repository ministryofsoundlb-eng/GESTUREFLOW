import React, { useState, useCallback, useRef } from 'react';
import Carousel from './components/Carousel';
import HandController from './components/HandController';
import { PHOTO_ITEMS } from './constants';
import { GestureType, PhotoItem } from './types';
import { ArrowLeft, ArrowRight, MousePointer2, Upload, Edit3, Check, X, Eye, EyeOff } from 'lucide-react';

const App: React.FC = () => {
  const [items, setItems] = useState<PhotoItem[]>(PHOTO_ITEMS);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [showControls, setShowControls] = useState(true);
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editTheme, setEditTheme] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (isEditing) return; // Disable gestures while editing
    if (gesture === GestureType.SWIPE_LEFT) {
      rotateNext();
    } else if (gesture === GestureType.SWIPE_RIGHT) {
      rotatePrev();
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newUrl = URL.createObjectURL(file);
      setItems((prevItems) => {
        const newItems = [...prevItems];
        newItems[selectedIndex] = {
          ...newItems[selectedIndex],
          url: newUrl,
          title: file.name.split('.')[0] || "Custom Image", // Use filename as title
          theme: "User Upload"
        };
        return newItems;
      });
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
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

  return (
    <div className="relative w-screen h-screen bg-[#050505] overflow-hidden flex flex-col">
      {/* Background Gradient Mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/20 blur-[100px]" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <Carousel rotation={rotation} selectedIndex={selectedIndex} items={items} />
      </div>

      {/* Hand Controller (Bottom Right) */}
      {!isEditing && <HandController onGesture={handleGesture} />}

      {/* Visibility Toggle Button (Bottom Left) */}
      <button 
        onClick={() => setShowControls(prev => !prev)}
        className="fixed bottom-6 left-6 z-50 p-3 bg-gray-900/50 hover:bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-full text-gray-400 hover:text-cyan-400 transition-all shadow-lg group"
        title={showControls ? "Hide Controls" : "Show Controls"}
      >
        {showControls ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Edit Modal Overlay */}
      {isEditing && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl w-[90%] max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold text-white mb-4">Edit Image Details</h2>
            
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

      {/* Manual Controls & Upload - Hide when editing OR showControls is false */}
      {!isEditing && showControls && (
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-6 z-30 w-full px-4 animate-in slide-in-from-bottom-10 fade-in duration-300">
          
           <div className="flex gap-4">
             {/* Upload Button */}
             <button 
               onClick={handleUploadClick}
               className="flex items-center gap-2 bg-gray-800/80 hover:bg-gray-700 backdrop-blur-md border border-gray-600 px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-lg group"
             >
               <Upload className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
               <span>Replace Image</span>
             </button>

             {/* Edit Text Button */}
             <button 
               onClick={startEditing}
               className="flex items-center gap-2 bg-gray-800/80 hover:bg-gray-700 backdrop-blur-md border border-gray-600 px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-lg group"
             >
               <Edit3 className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
               <span>Edit Text</span>
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

      {/* Header / Branding */}
      <div className="absolute top-0 left-0 w-full p-6 z-30 flex justify-between items-start pointer-events-none">
         <div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 tracking-tighter">
              GESTURE FLOW
            </h1>
            <p className="text-xs text-gray-400 tracking-[0.2em] uppercase">Touchless Interface v2.0</p>
         </div>
      </div>

    </div>
  );
};

export default App;