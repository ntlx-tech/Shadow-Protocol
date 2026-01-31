import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../GameContext.tsx';
import { Role } from '../types.ts';
import AdminPanel from './AdminPanel.tsx';

const Lobby: React.FC = () => {
  const { state, dispatch, generateBotChat } = useGame();
  const [activeTab, setActiveTab] = useState<'AGENTS' | 'COMMS'>('AGENTS');
  const [chatMsg, setChatMsg] = useState('');
  const [filterSender, setFilterSender] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  if (!state.user) return null;

  const { isAdmin, isDeveloper } = state.user;
  const { lobbyCode, players, logs } = state.game;

  useEffect(() => {
    const botPlayers = players.filter(p => p.isBot);
    if (botPlayers.length === 0) return;
    const interval = setInterval(() => {
        if (Math.random() > 0.4) {
            const bot = botPlayers[Math.floor(Math.random() * botPlayers.length)];
            generateBotChat(bot.name);
        }
    }, 12000);
    return () => clearInterval(interval);
  }, [players.length, generateBotChat]);

  useEffect(() => { 
    if(activeTab === 'COMMS') chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [logs.length, activeTab, filterSender]);

  const handleSendChat = (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatMsg.trim()) return;
      dispatch({ type: 'SEND_CHAT', payload: chatMsg });
      setChatMsg('');
  };

  const handleKick = (playerId: string) => {
    if (confirm("KICK SUBJECT: Remove this agent from the frequency?")) {
      dispatch({ type: 'KICK_PLAYER', payload: playerId });
    }
  };

  const chatLogs = logs.filter(l => l.type === 'chat');
  const uniqueSenders = Array.from(new Set(chatLogs.map(l => l.sender).filter(Boolean))) as string[];
  const filteredLogs = filterSender ? chatLogs.filter(l => l.sender === filterSender) : chatLogs;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen z-10 relative px-4 py-8 bg-[#0f0f0f] w-full overflow-hidden">
      <AdminPanel />
      
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fadeIn relative z-10">
        
        {/* Connection Details */}
        <div className="bg-[#141414] border border-zinc-800 p-10 flex flex-col shadow-2xl relative rounded-sm">
            <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full border border-zinc-800 transition-all duration-300 ${state.syncId ? 'bg-green-600 shadow-[0_0_15px_#16a34a]' : 'bg-red-500 shadow-[0_0_15px_#ef4444]'}`} />
                <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">{state.syncId ? 'Cipher Locked' : 'Encrypting...'}</span>
            </div>

            <div className="flex justify-between items-start mb-10 mt-6">
                <div className="space-y-2">
                    <h2 className="text-6xl font-noir text-zinc-100 tracking-tighter font-black uppercase">Lobby</h2>
                    <div className="text-[10px] font-bold text-zinc-600 tracking-widest uppercase">Overseer: {state.isHost ? 'YOU' : 'REMOTELY AUTHED'}</div>
                </div>
                <div className="text-right p-4 border border-zinc-800 bg-[#0a0a0a] min-w-[140px] rounded-sm">
                    <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Frequency</div>
                    <div className="text-3xl font-mono text-blood font-black tracking-widest leading-none">{lobbyCode || '----'}</div>
                </div>
            </div>

            <div className="flex-1 space-y-6 flex flex-col justify-end">
              <div className="grid grid-cols-1 gap-4">
                {(isAdmin || isDeveloper) && (
                    <button onClick={() => dispatch({ type: 'ADD_BOT' })} className="w-full py-4 border border-zinc-700 text-zinc-500 hover:text-white transition-all text-[11px] font-bold tracking-widest uppercase hover:bg-zinc-800 rounded-sm">+ Inject Bot Agent</button>
                )}
                <button onClick={() => dispatch({ type: 'LEAVE_LOBBY' })} className="w-full py-4 border border-zinc-700 text-zinc-500 hover:text-blood hover:border-blood transition-all text-[11px] font-bold tracking-widest uppercase rounded-sm">
                    [ Abort Mission ]
                </button>
              </div>
            </div>

            <button onClick={() => dispatch({type: 'START_GAME'})} disabled={players.length < 3 && !isDeveloper} className="w-full py-6 mt-12 bg-zinc-200 text-black font-cinzel font-black hover:bg-blood hover:text-white transition-all uppercase tracking-widest text-sm shadow-xl disabled:opacity-30 rounded-sm">
                {state.isHost ? (players.length < 3 && !isDeveloper ? "Awaiting Agents (Min 3)" : "Start Protocol") : "Waiting for Overseer"}
            </button>
        </div>

        {/* Agents & Comms */}
        <div className="flex flex-col h-[650px] border border-zinc-800 bg-[#121212] shadow-2xl overflow-hidden relative rounded-sm">
           <div className="flex border-b border-zinc-800 bg-[#0a0a0a]">
               <button onClick={() => setActiveTab('AGENTS')} className={`flex-1 py-5 text-[10px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'AGENTS' ? 'text-zinc-100 bg-zinc-800' : 'text-zinc-600 hover:text-zinc-400'}`}>Agent Roster ({players.length})</button>
               <button onClick={() => setActiveTab('COMMS')} className={`flex-1 py-5 text-[10px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'COMMS' ? 'text-zinc-100 bg-zinc-800' : 'text-zinc-600 hover:text-zinc-400'}`}>Frequency Feed</button>
           </div>
           <div className="flex-1 flex flex-col overflow-hidden">
               {activeTab === 'AGENTS' ? (
                  <div className="flex-1 overflow-y-auto p-8 space-y-3">
                    {players.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-[#18181b] border border-zinc-800 shadow-sm group transition-all hover:border-zinc-600 rounded-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-zinc-800 border border-zinc-700 shrink-0 relative overflow-hidden rounded-sm">
                                    <img src={p.avatarUrl} className={`w-full h-full object-cover grayscale filter brightness-90 transition-all group-hover:grayscale-0 ${p.isBot ? 'opacity-60' : ''}`} alt="A" />
                                    {p.id === state.user?.id && <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-tl-sm shadow-[0_0_5px_#22c55e]" />}
                                </div>
                                <div className={`text-[11px] font-bold tracking-widest uppercase ${p.id === state.user?.id ? 'text-white' : 'text-zinc-500'}`}>
                                  {p.name} {p.id === state.user?.id ? '(YOU)' : ''}
                                </div>
                            </div>
                            {state.isHost && p.id !== state.user?.id && (
                                <button onClick={() => handleKick(p.id)} className="px-3 py-1 border border-zinc-800 text-zinc-600 hover:text-blood hover:border-blood text-[9px] font-bold tracking-widest uppercase transition-all rounded-sm">Terminate</button>
                            )}
                        </div>
                    ))}
                  </div>
               ) : (
                  <div className="flex-1 flex flex-col h-full">
                      <div className="px-6 py-3 bg-[#0a0a0a] border-b border-zinc-800 flex items-center gap-3 overflow-x-auto scrollbar-hide shrink-0">
                          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Source:</span>
                          <button onClick={() => setFilterSender(null)} className={`px-2 py-1 text-[9px] border transition-all uppercase tracking-wider rounded-sm ${!filterSender ? 'border-blood text-blood bg-blood/5' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}>Broadcast</button>
                          {uniqueSenders.map(sender => (
                            <button key={sender} onClick={() => setFilterSender(sender)} className={`px-2 py-1 text-[9px] border transition-all uppercase tracking-wider whitespace-nowrap rounded-sm ${filterSender === sender ? 'border-blood text-blood bg-blood/5' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}>{sender}</button>
                          ))}
                      </div>

                      <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {filteredLogs.length === 0 ? (
                           <div className="h-full flex flex-col items-center justify-center opacity-30">
                               <div className="w-8 h-px bg-zinc-600 mb-3" />
                               <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Grid Silent...</div>
                           </div>
                        ) : (
                          filteredLogs.map(log => (
                              <div key={log.id} className={`max-w-[90%] animate-fadeIn ${log.sender === state.user?.username ? 'ml-auto text-right' : ''}`}>
                                  <div className="text-[9px] text-zinc-600 font-bold mb-1 uppercase tracking-wider">{log.sender}</div>
                                  <div className={`p-3 text-zinc-300 text-xs font-serif italic border-l-2 ${log.sender === state.user?.username ? 'bg-[#1a1a1a] border-blood/40' : 'bg-[#0f0f0f] border-zinc-700'}`}>
                                      {log.text}
                                  </div>
                              </div>
                          ))
                        )}
                        <div ref={chatEndRef} />
                      </div>
                      <form onSubmit={handleSendChat} className="p-4 bg-[#0a0a0a] border-t border-zinc-800 flex gap-2">
                          <input value={chatMsg} onChange={(e) => setChatMsg(e.target.value)} placeholder="Encrypt message..." className="flex-1 bg-[#121212] border border-zinc-800 p-3 text-xs text-white outline-none focus:border-blood font-mono uppercase rounded-sm placeholder:text-zinc-700" />
                          <button type="submit" className="px-5 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all font-cinzel text-[10px] uppercase font-bold rounded-sm">Transmit</button>
                      </form>
                  </div>
               )}
           </div>
        </div>
      </div>
    </div>
  );
};
export default Lobby;