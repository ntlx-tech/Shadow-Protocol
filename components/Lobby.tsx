
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

  const { isAdmin, isDeveloper, username } = state.user;
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
    if (confirm("KICK SUBJECT: Are you sure you want to remove this agent from the frequency?")) {
      dispatch({ type: 'KICK_PLAYER', payload: playerId });
    }
  };

  // Extract unique senders from chat logs for the filter
  const chatLogs = logs.filter(l => l.type === 'chat');
  const uniqueSenders = Array.from(new Set(chatLogs.map(l => l.sender).filter(Boolean))) as string[];
  const filteredLogs = filterSender 
    ? chatLogs.filter(l => l.sender === filterSender)
    : chatLogs;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen z-10 relative px-4 py-8 bg-black w-full overflow-hidden">
      <AdminPanel />
      
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fadeIn relative z-10">
        
        {/* Session Details */}
        <div className="bg-zinc-950/95 border border-zinc-900 p-10 flex flex-col shadow-2xl relative">
            <div className="flex justify-between items-start mb-10">
                <div className="space-y-2">
                    <h2 className="text-6xl font-noir text-white tracking-tighter font-black">LOBBY</h2>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${state.syncId ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`} />
                        <span className="text-[10px] font-mono text-zinc-600 tracking-widest uppercase">Grid: {state.syncId ? 'ENCRYPTED' : 'ESTABLISHING...'}</span>
                    </div>
                </div>
                <div className="text-right p-4 border border-zinc-900 bg-black">
                    <div className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest mb-1">Frequency</div>
                    <div className="text-3xl font-mono text-blood font-black tracking-widest">{lobbyCode || '----'}</div>
                </div>
            </div>

            <div className="flex-1 space-y-8">
              <div className="p-4 bg-black/40 border border-zinc-900">
                  <div className="text-[8px] font-mono text-zinc-700 uppercase tracking-[0.4em] mb-2">Classified Sync ID (Send to friends if Scan fails)</div>
                  <div className="text-[10px] font-mono text-zinc-500 break-all select-all">{state.syncId || 'GENERATING_SERIAL...'}</div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {(isAdmin || isDeveloper) && (
                    <button onClick={() => dispatch({ type: 'ADD_BOT' })} className="w-full py-4 border border-zinc-800 text-zinc-600 hover:text-white transition-all text-[10px] font-mono tracking-widest uppercase">+ INJECT ARTIFICIAL AGENT</button>
                )}
                <button onClick={() => dispatch({ type: 'LEAVE_LOBBY' })} className="w-full py-4 border border-zinc-800 text-zinc-700 hover:text-blood hover:border-blood transition-all text-[10px] font-mono tracking-widest uppercase">
                    [ ABORT FREQUENCY ]
                </button>
              </div>
            </div>

            <button onClick={() => dispatch({type: 'START_GAME'})} disabled={players.length < 3 && !isDeveloper} className="w-full py-6 mt-12 bg-zinc-100 text-black font-cinzel font-black hover:bg-blood hover:text-white transition-all uppercase tracking-widest text-sm shadow-2xl disabled:opacity-30">
                {state.isHost ? (players.length < 3 && !isDeveloper ? "AWAITING AGENTS (MIN 3)" : "INITIATE PROTOCOL") : "WAITING FOR OVERSEER"}
            </button>
        </div>

        {/* Agents & Comms */}
        <div className="flex flex-col h-[650px] border border-zinc-900 bg-[#080808] shadow-2xl overflow-hidden">
           <div className="flex border-b border-zinc-900 bg-black">
               <button onClick={() => setActiveTab('AGENTS')} className={`flex-1 py-5 text-[10px] font-mono tracking-widest uppercase transition-colors ${activeTab === 'AGENTS' ? 'text-white bg-zinc-900/40' : 'text-zinc-700 hover:text-zinc-500'}`}>Agents ({players.length})</button>
               <button onClick={() => setActiveTab('COMMS')} className={`flex-1 py-5 text-[10px] font-mono tracking-widest uppercase transition-colors ${activeTab === 'COMMS' ? 'text-white bg-zinc-900/40' : 'text-zinc-700 hover:text-zinc-500'}`}>Frequency Feed</button>
           </div>
           <div className="flex-1 flex flex-col overflow-hidden">
               {activeTab === 'AGENTS' ? (
                  <div className="flex-1 overflow-y-auto p-8 space-y-4">
                    {players.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-4 bg-black border border-zinc-900 shadow-inner group transition-all hover:border-zinc-700">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 shrink-0">
                                    <img src={p.avatarUrl} className={`w-full h-full object-cover grayscale filter brightness-75 transition-all group-hover:grayscale-0 ${p.isBot ? 'opacity-50' : ''}`} alt="A" />
                                </div>
                                <div className={`text-[12px] font-mono tracking-widest uppercase ${p.id === state.user?.id ? 'text-white' : 'text-zinc-600'}`}>{p.name}</div>
                            </div>
                            {state.isHost && p.id !== state.user?.id && (
                                <button 
                                    onClick={() => handleKick(p.id)}
                                    className="px-3 py-1 border border-zinc-900 text-zinc-800 hover:text-blood hover:border-blood text-[8px] font-mono tracking-widest uppercase transition-all"
                                >
                                    KICK
                                </button>
                            )}
                        </div>
                    ))}
                  </div>
               ) : (
                  <div className="flex-1 flex flex-col h-full">
                      {/* Message Filter Bar */}
                      <div className="px-6 py-3 bg-black border-b border-zinc-900 flex items-center gap-3 overflow-x-auto scrollbar-hide shrink-0">
                          <span className="text-[8px] font-mono text-zinc-700 uppercase tracking-widest whitespace-nowrap">Filter Intel:</span>
                          <button 
                            onClick={() => setFilterSender(null)}
                            className={`px-3 py-1 text-[8px] font-mono border transition-all uppercase tracking-tighter ${!filterSender ? 'border-blood text-blood bg-blood/5' : 'border-zinc-900 text-zinc-600 hover:text-zinc-400'}`}
                          >
                            All_Freqs
                          </button>
                          {uniqueSenders.map(sender => (
                            <button 
                              key={sender}
                              onClick={() => setFilterSender(sender)}
                              className={`px-3 py-1 text-[8px] font-mono border transition-all uppercase tracking-tighter whitespace-nowrap ${filterSender === sender ? 'border-blood text-blood bg-blood/5' : 'border-zinc-900 text-zinc-600 hover:text-zinc-400'}`}
                            >
                              {sender}
                            </button>
                          ))}
                      </div>

                      <div className="flex-1 overflow-y-auto p-8 space-y-6">
                        {filteredLogs.length === 0 ? (
                           <div className="h-full flex flex-col items-center justify-center opacity-20">
                               <div className="w-12 h-px bg-zinc-700 mb-4" />
                               <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em]">Static_Interference</div>
                           </div>
                        ) : (
                          filteredLogs.map(log => (
                              <div key={log.id} className="max-w-[80%] animate-fadeIn">
                                  <div className="text-[9px] text-zinc-700 font-mono mb-1 uppercase tracking-tighter">{log.sender}</div>
                                  <div className="bg-zinc-900 p-4 text-zinc-400 text-xs font-typewriter italic border-l-2 border-blood/40">
                                      {log.text}
                                  </div>
                              </div>
                          ))
                        )}
                        <div ref={chatEndRef} />
                      </div>
                      <form onSubmit={handleSendChat} className="p-4 bg-black border-t border-zinc-900">
                          <input value={chatMsg} onChange={(e) => setChatMsg(e.target.value)} placeholder="ENCRYPT MESSAGE..." className="w-full bg-zinc-900/50 border border-zinc-800 p-4 text-xs text-white outline-none focus:border-blood font-mono uppercase" />
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
