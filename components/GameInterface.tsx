
import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../GameContext';
import { GamePhase, Role, PlayerStatus } from '../types';
import PlayerList from './PlayerList';
import AdminPanel from './AdminPanel';
import Newspaper from './Newspaper';

const GameInterface: React.FC = () => {
  const { state, dispatch } = useGame();
  const { phase, logs, dayCount, players } = state.game;
  const user = state.game.players.find(p => p.id === state.user?.id);

  const [showNewspaper, setShowNewspaper] = useState(false);
  const [lastHeadline, setLastHeadline] = useState('');
  const [lastSubheadline, setLastSubheadline] = useState('');

  const logsEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (phase === GamePhase.DAY) {
      const latestAlert = [...logs].reverse().find(l => l.type === 'alert' || l.type === 'system');
      if (latestAlert) {
        setLastHeadline(latestAlert.text.includes('dead') || latestAlert.text.includes('silenced') ? 'TRAGEDY STRIKES' : 'CITY UPDATE');
        setLastSubheadline(latestAlert.text);
        setShowNewspaper(true);
      }
    }
  }, [phase, logs]);

  const handleAction = (targetId: string | null) => {
    if (!user || !targetId) return;
    if (phase === GamePhase.NIGHT) {
        if (user.role === Role.VILLAGER) return;
        dispatch({ type: 'SET_NIGHT_ACTION', payload: { role: user.role, targetId } });
    } else if (phase === GamePhase.VOTING) {
        dispatch({ type: 'CAST_VOTE', payload: { voterId: user.id, targetId } });
    }
  };

  const isNight = phase === GamePhase.NIGHT;
  const isVoting = phase === GamePhase.VOTING;
  const isGameOver = phase === GamePhase.GAME_OVER;
  
  const getPhaseTitle = () => {
      switch(phase) {
          case GamePhase.NIGHT: return `NIGHT ${dayCount}`;
          case GamePhase.DAY: return `DAY ${dayCount}`;
          case GamePhase.VOTING: return 'INTERROGATION';
          case GamePhase.GAME_OVER: return 'CASE CLOSED';
          default: return '';
      }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black relative">
      <AdminPanel />
      {showNewspaper && <Newspaper headline={lastHeadline} subheadline={lastSubheadline} onClose={() => setShowNewspaper(false)} />}
      
      <div className={`absolute inset-0 transition-opacity duration-[2000ms] pointer-events-none z-0 ${isNight ? 'opacity-40' : 'opacity-10'}`}>
         <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent"></div>
      </div>

      <div className={`w-80 border-r border-zinc-900 bg-[#080808] flex flex-col z-20 shadow-2xl transition-all duration-700 ${isVoting ? 'ring-1 ring-blood/30' : ''}`}>
        <div className="h-20 flex items-center px-6 border-b border-zinc-900 bg-black/20">
           <h3 className="font-cinzel text-zinc-500 tracking-[0.2em] text-[10px] uppercase font-bold">
             {isVoting ? 'Suspect Pool' : 'Verified Agents'}
           </h3>
        </div>
        <PlayerList onAction={handleAction} />
      </div>

      <div className="flex-1 flex flex-col relative z-10 bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')]">
        <div className="h-20 flex items-center justify-between px-10 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-sm shadow-md">
             <div className="flex flex-col">
                 <span className="text-[9px] font-mono text-zinc-600 tracking-[0.3em] uppercase mb-1">Grid Status</span>
                 <h1 className={`text-3xl font-noir tracking-wider font-bold ${isNight ? 'text-blue-200' : isVoting ? 'text-blood' : isGameOver ? 'text-zinc-100' : 'text-amber-100'}`}>
                     {getPhaseTitle()}
                 </h1>
             </div>
             
             <div className="flex items-center space-x-6">
                 <button 
                    onClick={() => { if(confirm("ABORT MISSION: Are you sure you want to exit the active grid?")) dispatch({ type: 'RESET_GAME' }); }}
                    className="group flex flex-col items-center"
                 >
                    <span className="text-[8px] font-mono text-zinc-700 tracking-widest uppercase mb-1 group-hover:text-blood">Detach</span>
                    <div className="px-3 py-1 border border-zinc-800 text-zinc-600 group-hover:border-blood group-hover:text-blood font-cinzel text-[9px] tracking-widest">EXIT</div>
                 </button>
                 <div className="h-8 w-px bg-zinc-900"></div>
                 <div className="flex items-center space-x-3">
                     <div className={`w-2 h-2 rounded-full ${isNight ? 'bg-blue-500 shadow-[0_0_10px_#3b82f6]' : isVoting ? 'bg-blood animate-pulse shadow-[0_0_15px_#8a0303]' : 'bg-amber-500 shadow-[0_0_10px_#f59e0b]'}`}></div>
                     <span className="hidden md:inline text-[10px] font-mono text-zinc-500 tracking-widest uppercase">
                        {isNight ? "Encrypted" : isVoting ? "Hostile" : "Clear"}
                     </span>
                 </div>
             </div>
        </div>

        <div className={`flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide transition-all duration-1000 ${isVoting ? 'opacity-40 blur-[1px]' : 'opacity-100'}`}>
            {logs.map(log => (
                <div key={log.id} className={`flex w-full animate-fadeIn ${log.type === 'alert' || log.type === 'system' ? 'justify-center' : 'justify-start'}`}>
                    {log.type === 'system' && (
                        <div className="max-w-xl text-center">
                            <div className="text-[9px] font-mono text-zinc-700 mb-2 tracking-widest uppercase italic">System Transmit</div>
                            <div className="text-zinc-400 font-serif italic text-lg leading-snug drop-shadow-sm">{log.text}</div>
                        </div>
                    )}
                    {log.type === 'alert' && (
                        <div className="bg-blood/5 border-y border-blood/20 py-6 px-16 max-w-3xl text-center shadow-2xl">
                            <h3 className="text-blood font-black text-2xl tracking-[0.4em] uppercase font-noir leading-none drop-shadow-[0_0_10px_rgba(138,3,3,0.3)]">{log.text}</h3>
                        </div>
                    )}
                    {log.type === 'chat' && (
                         <div className="flex space-x-4 max-w-2xl group">
                             <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 p-1"><span className="text-[10px] text-zinc-600 font-bold uppercase">{log.sender?.substring(0,2)}</span></div>
                             <div className="space-y-1">
                                 <div className="text-[9px] font-mono text-zinc-700 tracking-widest uppercase font-bold">{log.sender}</div>
                                 <div className="bg-black/40 border-l border-zinc-800 p-4 text-zinc-400 text-sm font-typewriter italic rounded-sm transition-all group-hover:border-blood/40">{log.text}</div>
                             </div>
                         </div>
                    )}
                    {log.type === 'ghost' && <div className="w-full text-center opacity-40 italic font-mono text-zinc-100 text-[10px] tracking-[0.5em] uppercase">{log.text}</div>}
                </div>
            ))}
            <div ref={logsEndRef} />
        </div>

        <div className="h-32 border-t border-zinc-900 bg-[#050505] p-6 flex items-center justify-between px-12 z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
            <div className="flex items-center space-x-6 group">
                 <div className="w-20 h-20 bg-zinc-950 p-1 border border-zinc-900 group-hover:border-blood transition-all duration-700 shadow-inner">
                     <img src={user?.avatarUrl} className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000" />
                 </div>
                 <div className="flex flex-col">
                     <div className="font-noir text-zinc-200 text-3xl leading-none mb-1 font-bold uppercase">{user?.name}</div>
                     <div className={`text-[10px] tracking-[0.5em] font-black uppercase ${
                         user?.role === Role.MAFIA ? 'text-blood' : user?.role === Role.DOCTOR ? 'text-blue-500' : user?.role === Role.COP ? 'text-amber-500' : 'text-zinc-700'
                     }`}>{user?.role}</div>
                 </div>
            </div>
            
            <div className="flex items-center gap-10">
                {isGameOver ? (
                    <button onClick={() => dispatch({type: 'RESET_GAME'})} className="h-16 px-12 bg-zinc-100 text-black font-cinzel font-black hover:bg-white text-xs tracking-[0.5em] uppercase border-4 border-black shadow-[0_0_20px_rgba(255,255,255,0.2)]">Return to Base</button>
                ) : (
                    <>
                    <div className="text-right hidden xl:block">
                        <div className="text-[10px] text-zinc-700 font-mono uppercase tracking-widest mb-1">Mission Clock</div>
                        <div className="text-zinc-500 font-cinzel text-xs tracking-widest uppercase">{getPhaseTitle()} ACTIVE</div>
                    </div>
                    {user?.status === PlayerStatus.ALIVE ? (
                        <button onClick={() => dispatch({type: 'NEXT_PHASE'})} className={`h-16 px-12 font-cinzel font-black border-2 transition-all duration-500 uppercase text-[11px] tracking-[0.4em] ${isVoting ? 'bg-blood border-blood text-white hover:bg-black hover:border-blood shadow-[0_0_30px_rgba(138,3,3,0.3)]' : 'bg-zinc-200 text-black border-zinc-200 hover:bg-black hover:text-zinc-200 hover:border-zinc-200'}`}>
                            {phase === GamePhase.NIGHT ? "End Night" : phase === GamePhase.DAY ? "Go to Interrogation" : "Seal Verdict"}
                        </button>
                    ) : (
                        <div className="text-blood font-noir text-4xl tracking-[0.3em] uppercase animate-pulse">Eliminated</div>
                    )}
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default GameInterface;
