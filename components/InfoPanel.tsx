import React, { useEffect, useState } from 'react';
import { PhotoItem } from '../types';
import { generateDescription } from '../services/gemini';
import { Sparkles, Loader2 } from 'lucide-react';

interface InfoPanelProps {
  item: PhotoItem;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ item }) => {
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    
    const fetchDescription = async () => {
      setLoading(true);
      setDescription(""); // Clear old desc
      
      // Small artificial delay to let the animation settle before fetching, gives better UX feel
      await new Promise(r => setTimeout(r, 500));
      if (!mounted) return;

      const text = await generateDescription(item.theme, item.title);
      if (mounted) {
        setDescription(text);
        setLoading(false);
      }
    };

    fetchDescription();

    return () => {
      mounted = false;
    };
  }, [item]);

  return (
    <div className="fixed top-8 left-1/2 transform -translate-x-1/2 md:left-12 md:top-1/2 md:transform-none md:-translate-y-1/2 w-[90%] md:w-[320px] z-40">
      <div className="bg-black/60 backdrop-blur-md border border-gray-800 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Gemini Analysis</span>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-1">{item.title}</h1>
        <p className="text-sm text-gray-400 mb-6 uppercase tracking-wider">{item.theme}</p>

        <div className="min-h-[80px] text-gray-200 text-sm leading-relaxed border-l-2 border-purple-500 pl-4 relative">
          {loading ? (
             <div className="flex items-center gap-2 text-gray-500">
               <Loader2 className="w-4 h-4 animate-spin" />
               <span>Generating insight...</span>
             </div>
          ) : (
            <p className="animate-in fade-in duration-500">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;