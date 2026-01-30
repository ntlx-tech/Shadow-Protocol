
import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../GameContext.tsx';
import { Role } from '../types.ts';
import AdminPanel from './AdminPanel.tsx';

// Bulletproof copy function for all environments
const copyToClipboard = (text: string) => {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return Promise.resolve();
    } catch (err) {
      document.body.removeChild(textArea);
      return Promise.reject(err);
    }
  }
};

const Lobby: React.FC = () => {
  const { state, dispatch, generateBotChat } = useGame();
  const [activeTab, setActiveTab] = useState<'AGENTS' | 'COMMS'>('AGENTS');
  const [chatMsg, setChatMsg] = useState('');
  const [filterSender, setFilterSender] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'IDLE' | 'COPIED' | 'ERROR'>('IDLE');
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

  const handleCopyLink = () => {
      if (!state.syncId) return;
      const url = `${window.location.origin}${window.location.pathname}?sid=${state.syncId}`;
      copyToClipboard(url)
        .then(() => {
          setCopyStatus('COPIED');
          setTimeout(() => setCopyStatus('IDLE'), 3000);
        })
        .catch(() => {
          setCopyStatus('ERROR');
          setTimeout(() => setCopyStatus('IDLE'), 3000);
        });
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
    <div className="flex flex-col items-center justify-center min-h-screen z-10 relative px-4 py-8 bg-black w-full overflow-hidden">
      <AdminPanel />
      
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fadeIn relative z-10">
        
        {/* Connection Details */}
        <div className="bg-zinc-950/95 border border-zinc-900 p-10 flex flex-col shadow-2xl relative">
            <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full border border-zinc-800 transition-all duration-300 ${state.syncId ? 'bg-green-500 shadow-[0_0_15px_#22c55e] animate-pulse' : 'bg-red-500 shadow-[0_0_15px_#ef4444]'}`} />
                <span className="text-[9px] font-mono text-zinc-600 tracking-widest uppercase">{state.syncId ? 'CIPHER_LOCKED' : 'ENCRYPTING...'}</span>
            </div>

            <div className="flex justify-between items-start mb-10 mt-6">
                <div className="space-y-2">
                    <h2 className="text-6xl font-noir text-white tracking-tighter font-black">LOBBY</h2>
                    <div className="text-[10px] font-mono text-zinc-700 tracking-widest uppercase">Overseer: {state.isHost ? 'YOU' : 'REMOTELY_AUTHED'}</div>
                </div>
                <div className="text-right p-4 border border-zinc-900 bg-black min-w-[140px]">
                    <div className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest mb-1">Frequency</div>
                    <div className="text-3xl font-mono text-blood font-black tracking-widest leading-none">{lobbyCode || '----'}</div>
                </div>
            </div>

            <div className="flex-1 space-y-6">
              {/* Invite Section */}
              <div className="bg-paper p-6 border-4 border-zinc-900 shadow-2xl relative rotate-[-0.5deg] group transition-all hover:rotate-0">
                  <div className="absolute top-0 right-0 bg-blood text-white px-2 py-0.5 text-[8px] font-mono uppercase tracking-widest">Urgent</div>
                  <h3 className="font-noir font-black text-zinc-900 text-lg uppercase border-b border-zinc-400 mb-2">Telegram</h3>
                  <p className="font-typewriter text-[10px] text-zinc-800 mb-4 leading-tight italic">
                    "Transmit this direct cipher to verified friends. This bypasses the directory scan for a persistent, stable grid connection."
                  </p>
                  <button 
                    onClick={handleCopyLink}
                    disabled={!state.syncId}
                    className={`w-full py-3 border-2 border-zinc-900 font-cinzel font-black text-[10px] tracking-[0.3em] uppercase transition-all ${
                        copyStatus === 'COPIED' ? 'bg-green-600 text-white border-green-700' : 
                        copyStatus === 'ERROR' ? 'bg-blood text-white border-blood' : 
                        'bg-zinc-100 text-zinc-900 hover:bg-zinc-900 hover:text-white'
                    }`}
                  >
                      {copyStatus === 'COPIED' ? 'INTEL_COPIED' : copyStatus === 'ERROR' ? 'LINK_FAILURE' : 'COPY_CIPHER_LINK'}
                  </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {(isAdmin || isDeveloper) && (
                    <button onClick={() => dispatch({ type: 'ADD_BOT' })} className="w-full py-4 border border-zinc-800 text-zinc-600 hover:text-white transition-all text-[10px] font-mono tracking-widest uppercase hover:bg-zinc-900/40">+ INJECT BOT AGENT</button>
                )}
                <button onClick={() => dispatch({ type: 'LEAVE_LOBBY' })} className="w-full py-4 border border-zinc-800 text-zinc-700 hover:text-blood hover:border-blood transition-all text-[10px] font-mono tracking-widest uppercase">
                    [ ABORT MISSION ]
                </button>
              </div>
            </div>

            <button onClick={() => dispatch({type: 'START_GAME'})} disabled={players.length < 3 && !isDeveloper} className="w-full py-6 mt-12 bg-zinc-100 text-black font-cinzel font-black hover:bg-blood hover:text-white transition-all uppercase tracking-widest text-sm shadow-2xl disabled:opacity-30">
                {state.isHost ? (players.length < 3 && !isDeveloper ? "AWAITING AGENTS (MIN 3)" : "START PROTOCOL") : "WAITING FOR OVERSEER"}
            </button>
        </div>

        {/* Agents & Comms */}
        <div className="flex flex-col h-[650px] border border-zinc-900 bg-[#080808] shadow-2xl overflow-hidden relative">
           <div className="flex border-b border-zinc-900 bg-black">
               <button onClick={() => setActiveTab('AGENTS')} className={`flex-1 py-5 text-[10px] font-mono tracking-widest uppercase transition-colors ${activeTab === 'AGENTS' ? 'text-white bg-zinc-900/40' : 'text-zinc-700 hover:text-zinc-500'}`}>Agent Roster ({players.length})</button>
               <button onClick={() => setActiveTab('COMMS')} className={`flex-1 py-5 text-[10px] font-mono tracking-widest uppercase transition-colors ${activeTab === 'COMMS' ? 'text-white bg-zinc-900/40' : 'text-zinc-700 hover:text-zinc-500'}`}>Frequency Feed</button>
           </div>
           <div className="flex-1 flex flex-col overflow-hidden">
               {activeTab === 'AGENTS' ? (
                  <div className="flex-1 overflow-y-auto p-8 space-y-4">
                    {players.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-4 bg-black border border-zinc-900 shadow-inner group transition-all hover:border-zinc-700">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 shrink-0 relative">
                                    <img src={p.avatarUrl} className={`w-full h-full object-cover grayscale filter brightness-75 transition-all group-hover:grayscale-0 ${p.isBot ? 'opacity-50' : ''}`} alt="A" />
                                    {p.id === state.user?.id && <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-black shadow-[0_0_5px_#22c55e]" />}
                                </div>
                                <div className={`text-[12px] font-mono tracking-widest uppercase ${p.id === state.user?.id ? 'text-white font-bold' : 'text-zinc-600'}`}>
                                  {p.name} {p.id === state.user?.id ? '(YOU)' : ''}
                                </div>
                            </div>
                            {state.isHost && p.id !== state.user?.id && (
                                <button onClick={() => handleKick(p.id)} className="px-3 py-1 border border-zinc-900 text-zinc-800 hover:text-blood hover:border-blood text-[8px] font-mono tracking-widest uppercase transition-all">TERMINATE</button>
                            )}
                        </div>
                    ))}
                  </div>
               ) : (
                  <div className="flex-1 flex flex-col h-full">
                      <div className="px-6 py-3 bg-black border-b border-zinc-900 flex items-center gap-3 overflow-x-auto scrollbar-hide shrink-0">
                          <span className="text-[8px] font-mono text-zinc-700 uppercase tracking-widest">Source:</span>
                          <button onClick={() => setFilterSender(null)} className={`px-3 py-1 text-[8px] font-mono border transition-all uppercase tracking-tighter ${!filterSender ? 'border-blood text-blood bg-blood/5' : 'border-zinc-900 text-zinc-600 hover:text-zinc-400'}`}>Broadcast</button>
                          {uniqueSenders.map(sender => (
                            <button key={sender} onClick={() => setFilterSender(sender)} className={`px-3 py-1 text-[8px] font-mono border transition-all uppercase tracking-tighter whitespace-nowrap ${filterSender === sender ? 'border-blood text-blood bg-blood/5' : 'border-zinc-900 text-zinc-600 hover:text-zinc-400'}`}>{sender}</button>
                          ))}
                      </div>

                      <div className="flex-1 overflow-y-auto p-8 space-y-6">
                        {filteredLogs.length === 0 ? (
                           <div className="h-full flex flex-col items-center justify-center opacity-20">
                               <div className="w-12 h-px bg-zinc-700 mb-4" />
                               <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em]">Grid Silent...</div>
                           </div>
                        ) : (
                          filteredLogs.map(log => (
                              <div key={log.id} className={`max-w-[85%] animate-fadeIn ${log.sender === state.user?.username ? 'ml-auto text-right' : ''}`}>
                                  <div className="text-[9px] text-zinc-700 font-mono mb-1 uppercase tracking-tighter">{log.sender}</div>
                                  <div className={`p-4 text-zinc-400 text-xs font-typewriter italic border-l-2 ${log.sender === state.user?.username ? 'bg-zinc-900 border-blood/20' : 'bg-zinc-950 border-zinc-800'}`}>
                                      {log.text}
                                  </div>
                              </div>
                          ))
                        )}
                        <div ref={chatEndRef} />
                      </div>
                      <form onSubmit={handleSendChat} className="p-4 bg-black border-t border-zinc-900 flex gap-2">
                          <input value={chatMsg} onChange={(e) => setChatMsg(e.target.value)} placeholder="ENCRYPT MESSAGE..." className="flex-1 bg-zinc-900/50 border border-zinc-800 p-4 text-xs text-white outline-none focus:border-blood font-mono uppercase" />
                          <button type="submit" className="px-6 bg-zinc-800 text-zinc-400 hover:text-white transition-all font-cinzel text-xs uppercase font-black">Transmit</button>
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
