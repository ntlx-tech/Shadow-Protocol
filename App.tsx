import React from 'react';
import { GameProvider, useGame } from './GameContext';
import Login from './components/Login';
import MainMenu from './components/MainMenu';
import Lobby from './components/Lobby';
import RoleReveal from './components/RoleReveal';
import GameInterface from './components/GameInterface';
import { GamePhase } from './types';

const GameContainer: React.FC = () => {
  const { state } = useGame();
  const { user, game, admin } = state;

  // Render Login if no user
  if (!user) {
    return <Login />;
  }

  // Blackout Effect (Admin Troll)
  const isBlackout = admin.blackoutTargetId === user.id;

  return (
    <div className="relative w-full h-full">
      {/* Global Blackout Overlay */}
      <div className={`fixed inset-0 bg-black z-[100] transition-opacity duration-200 pointer-events-none ${isBlackout ? 'opacity-100' : 'opacity-0'}`}>
         {isBlackout && <div className="absolute inset-0 flex items-center justify-center text-zinc-800 font-cinzel animate-pulse">SYSTEM MALFUNCTION</div>}
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