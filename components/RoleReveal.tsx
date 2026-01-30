
import React, { useState, useEffect } from 'react';
import { useGame } from '../GameContext';
import Card from './Card';

const RoleReveal: React.FC = () => {
  const { state, dispatch } = useGame();
  const [isFlipped, setIsFlipped] = useState(false);
  
  const userPlayer = state.game.players.find(p => p.id === state.user?.id);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFlipped(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!userPlayer) {
    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center space-y-8">
            <div className="text-blood font-noir text-xl animate-pulse">ERROR: IDENTITY LOST IN TRANSIT</div>
            <button onClick={() => dispatch({ type: 'RESET_GAME' })} className="px-8 py-3 border border-zinc-800 text-zinc-600 font-mono text-[10px] tracking-widest hover:border-blood hover:text-blood uppercase transition-all">[ RESCIND PROTOCOL ]</button>
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

      <div className="mt-16 flex gap-6">
        {isFlipped && (
            <button 
                onClick={() => dispatch({ type: 'FINISH_REVEAL' })}
                className="px-12 py-4 bg-transparent border border-zinc-800 text-zinc-600 font-cinzel text-[10px] tracking-[0.4em] hover:bg-zinc-900 hover:text-zinc-100 hover:border-zinc-500 transition-all opacity-0 animate-[flicker_2s_ease-in_forwards] uppercase"
                style={{ animationDelay: '2.5s' }}
            >
                [ Enter the Shadows ]
            </button>
        )}
        <button 
            onClick={() => dispatch({ type: 'LEAVE_LOBBY' })}
            className="px-6 py-4 bg-transparent border border-zinc-900/40 text-zinc-800 font-mono text-[8px] tracking-[0.4em] hover:text-blood transition-all uppercase"
        >
            [ ABORT ]
        </button>
      </div>
    </div>
  );
};

export default RoleReveal;
