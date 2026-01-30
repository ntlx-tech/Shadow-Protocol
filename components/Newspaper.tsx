import React, { useEffect, useState } from 'react';

interface NewspaperProps {
  headline: string;
  subheadline: string;
  onClose: () => void;
}

const Newspaper: React.FC<NewspaperProps> = ({ headline, subheadline, onClose }) => {
  const [isSlammed, setIsSlammed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsSlammed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer"
      onClick={onClose}
    >
      <div 
        className={`
          relative w-[90%] max-w-2xl bg-paper p-8 shadow-[20px_20px_60px_rgba(0,0,0,0.8)] border-4 border-zinc-900 
          transition-all duration-500 transform
          ${isSlammed ? 'scale-100 rotate-1' : 'scale-[3] -rotate-12 opacity-0'}
        `}
      >
        {/* Newspaper Texture/Aging */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]"></div>
        
        {/* Header */}
        <div className="border-b-4 border-zinc-900 pb-4 mb-6 text-center">
          <h2 className="font-noir font-black text-4xl text-zinc-900 tracking-tighter uppercase">The Midnight Chronicle</h2>
          <div className="flex justify-between font-typewriter text-[10px] text-zinc-700 mt-2 uppercase font-bold">
            <span>Vol. LXVII — No. 128</span>
            <span>Chicago Edition</span>
            <span>Price: Two Cents</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center space-y-4">
          <h1 className="font-noir font-black text-6xl text-zinc-900 leading-none uppercase break-words border-b border-zinc-400 pb-4">
            {headline}
          </h1>
          <p className="font-typewriter text-zinc-800 text-lg italic leading-relaxed">
            {subheadline}
          </p>
        </div>

        {/* Decorative Columns */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-4 border-t border-zinc-400 font-typewriter text-[8px] text-zinc-600 leading-tight text-justify">
          <div>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Shadows lengthen across the docks as night falls. Reports of clandestine meetings continue to pour into the precinct. Witnesses describe a figure in a heavy overcoat.
          </div>
          <div className="border-x border-zinc-300 px-4">
            The city council remains silent on the recent surge of activity. "We are investigating all leads," says Commissioner [REDACTED]. Citizens are advised to stay indoors after the streetlights flicker.
          </div>
          <div>
            Rumors of the Shadow Protocol have reached the ears of the underworld. All assets are advised to remain covert. The deadline for deployment is approaching. Watch the headlines for further updates.
          </div>
        </div>

        <div className="mt-8 text-center">
            <span className="font-cinzel text-[10px] text-zinc-500 tracking-[0.3em] animate-pulse">CLICK TO DISMISS</span>
        </div>
      </div>
    </div>
  );
};

export default Newspaper;