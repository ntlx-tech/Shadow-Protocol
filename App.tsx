
import React from 'react';
import { GameProvider, useGame } from './GameContext.tsx';
import Login from './components/Login.tsx';
import MainMenu from './components/MainMenu.tsx';
import Lobby from './components/Lobby.tsx';
import RoleReveal from './components/RoleReveal.tsx';
import GameInterface from './components/GameInterface.tsx';
import { GamePhase } from './types.ts';

const GameContainer: React.FC = () => {
  const { state } = useGame();
  const { user, game, admin } = state;

  if (!user) {
    return <Login />;
  }

  const isBlackout = user && admin.blackoutTargetId === user.id;

  return (
    <div className="relative w-full h-full">
      <div className={`fixed inset-0 bg-black z-[100] transition-opacity duration-200 pointer-events-none ${isBlackout ? 'opacity-100' : 'opacity-0'}`}>
         {isBlackout && (
             <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                 <div className="text-zinc-800 font-cinzel text-3xl animate-[flicker_0.2s_infinite] tracking-[0.5em] font-black uppercase shadow-blood drop-shadow-[0_0_10px_rgba(138,3,3,0.5)]">
                     SYSTEM MALFUNCTION
                 </div>
                 <div className="text-blood font-mono text-[10px] animate-pulse tracking-widest">
                     CONNECTION_SEVERED_BY_OVERSEER
                 </div>
             </div>
         )}
      </div>

      {game.phase === GamePhase.MENU && <MainMenu />}
      {game.phase === GamePhase.LOBBY && <Lobby />}
      {game.phase === GamePhase.REVEAL && <RoleReveal />}
      {(game.phase === GamePhase.NIGHT || game.phase === GamePhase.DAY || game.phase === GamePhase.VOTING || game.phase === GamePhase.GAME_OVER) && (
        <GameInterface />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <GameProvider>
      <GameContainer />
    </GameProvider>
  );
};

export default App;
