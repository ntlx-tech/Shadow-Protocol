
import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../GameContext';
import { GamePhase, Role, PlayerStatus, LogEntry } from '../types';
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
  const [chatMsg, setChatMsg] = useState('');
  const [lastProcessedLogId, setLastProcessedLogId] = useState<string | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Fix: Only trigger newspaper if the NEWEST log is an alert or system message
  useEffect(() => {
    if (phase === GamePhase.DAY) {
      const latestLog = logs[logs.length - 1];
      
      if (latestLog && (latestLog.type === 'alert' || latestLog.type === 'system')) {
         // Prevent re-showing for the same log ID
         if (latestLog.id !== lastProcessedLogId) {
             setLastHeadline(latestLog.text.includes('dead') || latestLog.text.includes('silenced') ? 'TRAGEDY STRIKES' : 'CITY UPDATE');
             setLastSubheadline(latestLog.text);
             setShowNewspaper(true);
             setLastProcessedLogId(latestLog.id);
         }
      }
    }
  }, [phase, logs]);

  const handleAction = (targetId: string | null) => {
    if (!user || !targetId) return;
    if (user.status !== PlayerStatus.ALIVE) return;

    if (phase === GamePhase.NIGHT) {
        if (user.role === Role.VILLAGER) return;
        dispatch({ type: 'SET_NIGHT_ACTION', payload: { role: user.role, targetId } });
    } else if (phase === GamePhase.VOTING) {
        dispatch({ type: 'CAST_VOTE', payload: { voterId: user.id, targetId } });
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim() || !user) return;
    
    // Dead players send ghost messages
    const logType = user.status === PlayerStatus.ALIVE ? 'chat' : 'ghost';
    dispatch({ type: 'SEND_CHAT', payload: chatMsg });
    setChatMsg('');
  };

  const isNight = phase === GamePhase.NIGHT;
  const isVoting = phase === GamePhase.VOTING;
  const isDay = phase === GamePhase.DAY;
  const isGameOver = phase === GamePhase.GAME_OVER;
  
  const getPhaseTitle = () => {
      switch(phase) {
          case GamePhase.NIGHT: return `Night ${dayCount}`;
          case GamePhase.DAY: return `Day ${dayCount}`;
          case GamePhase.VOTING: return 'Interrogation';
          case GamePhase.GAME_OVER: return 'Case Closed';
          default: return '';
      }
  };

  const canChat = (isDay || isVoting) && !isGameOver;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#121212] relative">
      <AdminPanel />
      {showNewspaper && <Newspaper headline={lastHeadline} subheadline={lastSubheadline} onClose={() => setShowNewspaper(false)} />}
      
      {/* Cinematic Phase Overlays - Subtle Tints only */}
      <div className={`absolute inset-0 transition-all duration-[3000ms] pointer-events-none z-0 ${isNight ? 'bg-blue-950/10' : isVoting ? 'bg-red-950/10' : 'bg-transparent'}`}>
         {isVoting && <div className="absolute inset-0 animate-pulse bg-blood/5" />}
      </div>

      {/* Sidebar: Agents */}
      <div className={`w-80 border-r border-zinc-800 bg-[#161616] flex flex-col z-20 shadow-2xl transition-all duration-700 ${isVoting ? 'border-r-blood/20' : ''}`}>
        <div className="h-20 flex items-center px-6 border-b border-zinc-800 bg-[#121212]">
           <h3 className="font-cinzel text-zinc-500 tracking-[0.2em] text-[10px] uppercase font-bold">
             {isVoting ? 'Suspect Pool' : 'Verified Agents'}
           </h3>
        </div>
        <PlayerList onAction={handleAction} />
      </div>

      {/* Main Terminal Area */}
      <div className="flex-1 flex flex-col relative z-10 bg-[#121212]">
        
        {/* Header Strip */}
        <div className="h-20 flex items-center justify-between px-10 border-b border-zinc-800 bg-[#141414] shadow-md z-20">
             <div className="flex flex-col">
                 <span className="text-[9px] font-bold text-zinc-500 tracking-[0.3em] uppercase mb-1">Grid Status</span>
                 <h1 className={`text-3xl font-noir tracking-wider font-bold transition-colors duration-1000 ${isNight ? 'text-blue-200' : isVoting ? 'text-blood' : isGameOver ? 'text-zinc-100' : 'text-amber-100'} uppercase`}>
                     {getPhaseTitle()}
                 </h1>
             </div>
             
             <div className="flex items-center space-x-6">
                 <div className="text-right hidden sm:block">
                    <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Protocol</div>
                    <div className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase">
                        {isNight ? "Silence Mandatory" : isVoting ? "Conflict Active" : "Intel Gathering"}
                    </div>
                 </div>
                 <div className="h-8 w-px bg-zinc-800"></div>
                 <button 
                    onClick={() => { if(confirm("ABORT MISSION: Are you sure you want to exit the active grid?")) dispatch({ type: 'RESET_GAME' }); }}
                    className="group px-4 py-2 border border-zinc-800 hover:border-blood transition-all rounded-sm"
                 >
                    <span className="text-[9px] font-bold text-zinc-500 group-hover:text-blood uppercase tracking-widest">Disconnect</span>
                 </button>
             </div>
        </div>

        {/* Intelligence Feed & Interrogation Comms */}
        <div className="flex-1 overflow-hidden flex flex-col relative z-10">
            <div className="flex-1 overflow-y-auto p-10 space-y-6 scrollbar-hide">
                {logs.map((log, i) => (
                    <div key={log.id} className={`flex w-full animate-fadeIn ${log.type === 'alert' || log.type === 'system' ? 'justify-center' : 'justify-start'}`}>
                        {log.type === 'system' && (
                            <div className="max-w-xl text-center border-x border-zinc-800 px-10 my-4">
                                <div className="text-[9px] font-bold text-zinc-600 mb-2 tracking-[0.4em] uppercase">Wire Transmit</div>
                                <div className="text-zinc-400 font-serif italic text-sm leading-snug">{log.text}</div>
                            </div>
                        )}
                        {log.type === 'alert' && (
                            <div className="bg-blood/5 border-y border-blood/20 py-8 px-16 max-w-4xl text-center shadow-[0_0_40px_rgba(138,3,3,0.1)] my-6">
                                <h3 className="text-blood font-black text-3xl tracking-[0.2em] uppercase font-noir leading-none drop-shadow-[0_0_15px_rgba(138,3,3,0.4)]">{log.text}</h3>
                            </div>
                        )}
                        {log.type === 'chat' && (
                             <div className="flex space-x-4 max-w-3xl group w-full">
                                 <div className="w-10 h-10 bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 p-1 grayscale group-hover:grayscale-0 transition-all rounded-sm">
                                    <span className="text-[10px] text-zinc-400 font-bold uppercase">{log.sender?.substring(0,2)}</span>
                                 </div>
                                 <div className="space-y-1 flex-1">
                                     <div className="text-[9px] font-bold text-zinc-500 tracking-widest uppercase flex justify-between">
                                         <span>{log.sender}</span>
                                     </div>
                                     <div className="bg-[#1a1a1a] border border-zinc-800 p-4 text-zinc-200 text-sm font-serif leading-relaxed shadow-md rounded-sm">
                                         "{log.text}"
                                     </div>
                                 </div>
                             </div>
                        )}
                        {log.type === 'ghost' && (
                             <div className="w-full flex justify-center opacity-50 group hover:opacity-80 transition-opacity">
                                <div className="max-w-md border-b border-zinc-800 pb-2 px-10 text-center">
                                    <div className="text-[8px] font-bold text-zinc-600 tracking-[0.6em] uppercase mb-1">Spirit Voice</div>
                                    <div className="italic font-serif text-zinc-500 text-xs">"{log.text}"</div>
                                </div>
                             </div>
                        )}
                    </div>
                ))}
                <div ref={logsEndRef} />
            </div>

            {/* Interrogation Input */}
            {canChat && (
                <div className="p-6 bg-[#141414] border-t border-zinc-800 animate-fadeIn">
                    <form onSubmit={handleSendChat} className="flex gap-4 max-w-5xl mx-auto">
                        <div className="flex-1 relative">
                            <input 
                                value={chatMsg} 
                                onChange={(e) => setChatMsg(e.target.value)} 
                                placeholder={user?.status === PlayerStatus.ALIVE ? "Transmit intel..." : "Whisper from the shadows..."}
                                className="w-full bg-[#1a1a1a] border border-zinc-800 p-4 text-xs text-white outline-none focus:border-blood/50 font-mono uppercase tracking-widest placeholder:text-zinc-600 rounded-sm focus:bg-black transition-colors"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-bold text-zinc-700 uppercase tracking-widest pointer-events-none">
                                {user?.status === PlayerStatus.ALIVE ? "Live Feed" : "Ghost Line"}
                            </div>
                        </div>
                        <button type="submit" className="px-10 bg-zinc-200 text-black font-cinzel font-black hover:bg-blood hover:text-white transition-all uppercase tracking-[0.3em] text-[10px] shadow-lg rounded-sm">
                            Send
                        </button>
                    </form>
                </div>
            )}

            {/* Night Secret Directive */}
            {isNight && user?.status === PlayerStatus.ALIVE && user?.role !== Role.VILLAGER && (
                <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-30">
                    <div className="max-w-xl mx-auto bg-[#0a0a0a] border border-blue-900/40 p-6 text-center pointer-events-auto shadow-[0_0_50px_rgba(30,58,138,0.15)] rounded-sm">
                        <div className="text-blue-400 font-noir text-xl tracking-[0.2em] font-black uppercase mb-2">Secret Directive</div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            {user.role === Role.MAFIA ? "Select a subject to silence tonight." : 
                             user.role === Role.DOCTOR ? "Choose an agent to shield from the dark." : 
                             "Scan a suspicious subject to reveal their frequency."}
                        </p>
                    </div>
                </div>
            )}
        </div>

        {/* Status Bar */}
        <div className="h-28 border-t border-zinc-800 bg-[#141414] p-4 flex items-center justify-between px-8 z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.4)]">
            <div className="flex items-center space-x-6 group">
                 <div className="w-16 h-16 bg-zinc-900 p-0.5 border border-zinc-800 group-hover:border-blood transition-all duration-700 shadow-sm overflow-hidden rounded-sm">
                     <img src={user?.avatarUrl} className={`w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000 ${user?.status !== PlayerStatus.ALIVE ? 'opacity-40' : ''}`} />
                 </div>
                 <div className="flex flex-col">
                     <div className="font-noir text-zinc-200 text-2xl leading-none mb-1 font-bold uppercase tracking-tight">{user?.name}</div>
                     <div className={`text-[10px] tracking-[0.4em] font-bold uppercase flex items-center gap-2 ${
                         user?.role === Role.MAFIA ? 'text-blood' : user?.role === Role.DOCTOR ? 'text-blue-500' : user?.role === Role.COP ? 'text-amber-500' : 'text-zinc-500'
                     }`}>
                        {user?.role}
                        {user?.status !== PlayerStatus.ALIVE && <span className="text-zinc-600 tracking-normal font-sans">[Eliminated]</span>}
                     </div>
                 </div>
            </div>
            
            <div className="flex items-center gap-10">
                {isGameOver ? (
                    <button onClick={() => dispatch({type: 'RESET_GAME'})} className="h-14 px-10 bg-zinc-200 text-black font-cinzel font-black hover:bg-white text-xs tracking-[0.4em] uppercase border-2 border-black shadow-lg rounded-sm">Return to Base</button>
                ) : (
                    <>
                    <div className="text-right hidden xl:block">
                        <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Time Elapsed</div>
                        <div className="text-zinc-400 font-cinzel text-xs tracking-widest uppercase">Day {dayCount} In Progress</div>
                    </div>
                    {user?.status === PlayerStatus.ALIVE ? (
                        <button onClick={() => dispatch({type: 'NEXT_PHASE'})} className={`h-14 px-10 font-cinzel font-black border transition-all duration-500 uppercase text-[10px] tracking-[0.3em] rounded-sm ${isVoting ? 'bg-blood border-blood text-white hover:bg-black hover:border-blood shadow-[0_0_30px_rgba(138,3,3,0.3)]' : 'bg-zinc-200 text-black border-zinc-200 hover:bg-black hover:text-zinc-200 hover:border-zinc-200'}`}>
                            {phase === GamePhase.NIGHT ? "End Night" : phase === GamePhase.DAY ? "Begin Interrogation" : "Finalize Verdict"}
                        </button>
                    ) : (
                        <div className="flex flex-col items-end opacity-50">
                            <div className="text-blood font-noir text-3xl tracking-[0.2em] uppercase leading-none font-bold">Eliminated</div>
                            <div className="text-[9px] font-bold text-zinc-500 uppercase mt-1 tracking-widest">Awaiting Case Close...</div>
                        </div>
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
