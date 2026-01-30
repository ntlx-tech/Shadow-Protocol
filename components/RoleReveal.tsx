import React, { useState, useEffect } from 'react';
import { useGame } from '../GameContext';
import Card from './Card';

const RoleReveal: React.FC = () => {
  const { state, dispatch } = useGame();
  const [isFlipped, setIsFlipped] = useState(false);
  
  // FIXED: Looking for the player matching the current authenticated user's ID
  const userPlayer = state.game.players.find(p => p.id === state.user?.id);

  useEffect(() => {
    // Auto flip after a delay for dramatic effect
    const timer = setTimeout(() => {
      setIsFlipped(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!userPlayer) {
    console.error("User player not found in lobby players during reveal.");
    return (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
            <div className="text-blood font-noir text-xl animate-pulse">ERROR: IDENTITY LOST IN TRANSIT</div>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl">
      <div className="mb-12 text-center">
        <h2 className="text-2xl font-cinzel text-zinc-500 tracking-[0.5em] mb-2 animate-pulse">IDENTITY ASSIGNMENT</h2>
        <div className="h-px w-24 bg-blood mx-auto mt-4 opacity-50"></div>
      </div>

      <div className="animate-fadeIn">
        <Card role={userPlayer.role} isFlipped={isFlipped} />
      </div>

      {isFlipped && (
        <button 
          onClick={() => dispatch({ type: 'FINISH_REVEAL' })}
          className="mt-16 px-12 py-4 bg-transparent border border-zinc-800 text-zinc-600 font-cinzel text-[10px] tracking-[0.4em] hover:bg-zinc-900 hover:text-zinc-100 hover:border-zinc-500 transition-all opacity-0 animate-[flicker_2s_ease-in_forwards] uppercase"
          style={{ animationDelay: '2.5s' }}
        >
          [ Enter the Shadows ]
        </button>
      )}
    </div>
  );
};

export default RoleReveal;