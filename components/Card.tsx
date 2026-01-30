import React from 'react';
import { Role } from '../types';

interface CardProps {
  role: Role;
  isFlipped: boolean;
  onFlip?: () => void;
}

const Card: React.FC<CardProps> = ({ role, isFlipped, onFlip }) => {
  // Determine imagery/colors based on role
  let roleTitle = '';
  let roleDesc = '';
  let icon = '';
  let borderColor = 'border-zinc-500';
  let textColor = 'text-zinc-200';

  switch (role) {
    case Role.MAFIA:
      roleTitle = 'THE MAFIA';
      roleDesc = 'Eliminate the town. Don\'t get caught.';
      icon = '🔫';
      borderColor = 'border-blood';
      textColor = 'text-blood';
      break;
    case Role.DOCTOR:
      roleTitle = 'THE DOCTOR';
      roleDesc = 'Save one life each night. Even yourself.';
      icon = '💉';
      borderColor = 'border-blue-800';
      textColor = 'text-blue-300';
      break;
    case Role.COP:
      roleTitle = 'DETECTIVE';
      roleDesc = 'Investigate suspects. Find the Mafia.';
      icon = '🕵️‍♂️';
      borderColor = 'border-amber-700';
      textColor = 'text-amber-200';
      break;
    case Role.VILLAGER:
      roleTitle = 'CITIZEN';
      roleDesc = 'Survival is your only objective.';
      icon = '👁️';
      borderColor = 'border-zinc-600';
      textColor = 'text-zinc-400';
      break;
  }

  return (
    <div 
      className="group w-72 h-[28rem] perspective-1000 cursor-pointer"
      onClick={onFlip}
    >
      <div className={`relative w-full h-full transition-transform duration-[1500ms] transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* FRONT (Hidden initially) - The Role */}
        <div className={`absolute w-full h-full backface-hidden rotate-y-180 bg-zinc-900 border-4 ${borderColor} rounded-lg shadow-2xl flex flex-col items-center justify-between p-6`}>
           {/* Decorative corners */}
           <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-zinc-600"></div>
           <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-zinc-600"></div>
           <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-zinc-600"></div>
           <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-zinc-600"></div>

           <div className="mt-8 text-center">
             <div className="text-6xl mb-4 opacity-90 drop-shadow-lg filter grayscale contrast-125">{icon}</div>
             <h2 className={`text-3xl font-noir font-black tracking-widest ${textColor} uppercase border-b border-zinc-800 pb-2`}>
               {roleTitle}
             </h2>
           </div>

           <p className="text-center font-typewriter text-zinc-400 text-sm leading-relaxed px-2">
             {roleDesc}
           </p>

           <div className="font-cinzel text-xs text-zinc-700 tracking-[0.3em]">CONFIDENTIAL</div>
        </div>

        {/* BACK (Visible initially) - The Cover */}
        <div className="absolute w-full h-full backface-hidden bg-zinc-950 border-4 border-zinc-800 rounded-lg flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')]">
          <div className="absolute inset-4 border border-zinc-700 border-dashed rounded opacity-30"></div>
          <div className="text-center">
            <h1 className="text-4xl font-noir text-zinc-800 tracking-widest font-black uppercase">SHADOW</h1>
            <div className="w-12 h-1 bg-blood mx-auto my-4"></div>
            <h1 className="text-4xl font-noir text-zinc-800 tracking-widest font-black uppercase">PROTOCOL</h1>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Card;