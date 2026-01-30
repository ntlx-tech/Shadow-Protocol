
import React from 'react';
import { useGame } from '../GameContext';
import { PlayerStatus, Role, GamePhase } from '../types';
import { RoleIcon } from './Icons.tsx';

interface PlayerListProps { onAction: (targetId: string) => void; }

const PlayerList: React.FC<PlayerListProps> = ({ onAction }) => {
  const { state } = useGame();
  const { players, phase, nightActions } = state.game;
  const { rolePeeker, devRevealAll } = state.admin;
  const currentUser = players.find(p => p.id === state.user?.id);
  
  const canInteract = (targetPlayer: typeof players[0]) => {
      if (currentUser?.status !== PlayerStatus.ALIVE) return false;
      if (targetPlayer.status !== PlayerStatus.ALIVE) return false;
      if (targetPlayer.id === currentUser.id && currentUser.role !== Role.DOCTOR) return false;
      if (phase === GamePhase.NIGHT) {
          if (currentUser.role === Role.MAFIA && targetPlayer.role !== Role.MAFIA) return true;
          if (currentUser.role === Role.DOCTOR) return true;
          if (currentUser.role === Role.COP && targetPlayer.id !== currentUser.id) return true;
      }
      if (phase === GamePhase.VOTING) return true;
      return false;
  };

  const isSelected = (pid: string) => {
      if (phase === GamePhase.VOTING) return currentUser?.voteTargetId === pid;
      if (phase === GamePhase.NIGHT) {
          if (currentUser?.role === Role.MAFIA) return nightActions.mafiaTargetId === pid;
          if (currentUser?.role === Role.DOCTOR) return nightActions.doctorTargetId === pid;
          if (currentUser?.role === Role.COP) return nightActions.copTargetId === pid;
      }
      return false;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
      {players.map(player => {
        const selected = isSelected(player.id);
        const interactable = canInteract(player);
        const isDead = player.status === PlayerStatus.DEAD || player.status === PlayerStatus.EJECTED;
        const reveal = rolePeeker || devRevealAll;

        return (
            <div key={player.id} className={`relative transition-all duration-700 ${isDead ? 'opacity-20 grayscale scale-95' : 'opacity-100'} ${phase === GamePhase.VOTING && !selected && !isDead ? 'opacity-40 hover:opacity-100' : ''}`}>
                <div onClick={() => interactable && onAction(player.id)} className={`relative flex items-center gap-4 p-4 border transition-all duration-500 cursor-pointer overflow-hidden ${selected ? 'bg-zinc-900/90 border-blood shadow-[0_0_25px_rgba(138,3,3,0.4)]' : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700'}`}>
                    <div className="relative w-14 h-14 shrink-0 p-0.5 bg-zinc-900 flex items-center justify-center">
                        <img src={player.avatarUrl} className={`w-full h-full object-cover filter brightness-90 contrast-125 ${isDead ? 'grayscale' : 'grayscale-0'}`} alt="P" />
                        {reveal && (
                          <div className="absolute -top-1 -right-1 z-20 bg-zinc-100 text-black p-0.5 shadow-md rounded-sm">
                            <RoleIcon role={player.role} className="w-3 h-3" />
                          </div>
                        )}
                        {isDead && <div className="absolute inset-0 bg-black/60 flex items-center justify-center font-bold text-red-600 text-[8px] border border-red-900 bg-black/40 rotate-12">SILENCED</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className={`font-cinzel text-base tracking-widest truncate ${selected ? 'text-zinc-100 font-bold' : 'text-zinc-500'}`}>{player.name.toUpperCase()}</div>
                        <div className="text-[9px] text-zinc-700 font-mono tracking-widest uppercase mt-1">Status: {player.status === PlayerStatus.ALIVE ? 'VERIFIED' : 'TERMINATED'}</div>
                    </div>
                </div>
            </div>
        );
      })}
    </div>
  );
};
export default PlayerList;
