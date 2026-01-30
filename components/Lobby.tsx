import React, { useEffect, useState, useRef } from 'react';
import { useGame, BOT_QUOTES_LIST } from '../GameContext';
import { Role } from '../types';

const Lobby: React.FC = () => {
  const { state, dispatch } = useGame();
  const [activeTab, setActiveTab] = useState<'AGENTS' | 'COMMS'>('AGENTS');
  const [chatMsg, setChatMsg] = useState('');
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
            const quote = BOT_QUOTES_LIST[Math.floor(Math.random() * BOT_QUOTES_LIST.length)];
            dispatch({ type: 'BOT_CHAT', payload: { sender: bot.name, text: quote } });
        }
    }, 8000);
    return () => clearInterval(interval);
  }, [players.length, dispatch]);

  useEffect(() => { if(activeTab === 'COMMS') chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs.length, activeTab]);

  const handleForceRole = (id: string, roleName: string) => {
      let role: Role | undefined = undefined;
      if (roleName === 'MAFIA') role = Role.MAFIA;
      if (roleName === 'DOCTOR') role = Role.DOCTOR;
      if (roleName === 'COP') role = Role.COP;
      if (roleName === 'VILLAGER') role = Role.VILLAGER;
      dispatch({ type: 'SET_FORCED_ROLE', payload: { playerId: id, role } });
  };

  const handleSendChat = (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatMsg.trim()) return;
      dispatch({ type: 'SEND_CHAT', payload: chatMsg });
      setChatMsg('');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen z-10 relative px-4 py-8 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')]">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 animate-fadeIn">
        
        {/* Left Section: Session Details */}
        <div className="bg-zinc-950/95 border border-zinc-900 p-10 flex flex-col shadow-[0_30px_60px_rgba(0,0,0,1)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blood/5 -rotate-45 translate-x-16 -translate-y-16 pointer-events-none" />
            
            <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                    <h2 className="text-5xl font-noir text-white tracking-tighter uppercase font-black">LOBBY</h2>
                    <button onClick={() => dispatch({type: 'LEAVE_LOBBY'})} className="text-[9px] text-zinc-600 font-mono hover:text-red-500 transition-colors tracking-[0.2em] uppercase">[ DISCONNECT_SESSION ]</button>
                </div>
                <div className="text-right p-4 border border-zinc-900 bg-black shadow-inner">
                    <div className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest mb-1">Frequency</div>
                    <div className="text-3xl font-mono text-blood font-black tracking-widest drop-shadow-[0_0_10px_rgba(138,3,3,0.3)]">{lobbyCode}</div>
                </div>
            </div>

            <div className="h-0.5 w-full bg-gradient-to-r from-blood/40 to-transparent mb-10" />
            
            <div className="flex-1 space-y-10">
              <div className="flex items-center space-x-6 p-4 bg-black/40 border border-zinc-900 rounded-sm">
                  <div className="relative w-14 h-14">
                    <img src={state.user.avatarUrl} className="w-full h-full object-cover grayscale opacity-80" alt="U" />
                    <div className="absolute inset-0 border border-zinc-800" />
                  </div>
                  <div>
                    <div className="text-zinc-600 font-cinzel text-[10px] tracking-[0.3em] uppercase mb-1">Verified Operator</div>
                    <div className="text-zinc-100 font-black tracking-[0.2em] uppercase text-lg">{username}</div>
                  </div>
              </div>

              {(isAdmin || isDeveloper) && (
                <div className="space-y-6 pt-4 animate-fadeIn">
                  <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em] italic border-l-2 border-blood pl-4">
                    "Overseer authorization active. Deploy artificial assets to fill the grid."
                  </p>
                  <button onClick={() => dispatch({ type: 'ADD_BOT' })} className="w-full py-4 bg-transparent border border-zinc-800 text-zinc-500 hover:text-zinc-100 hover:border-zinc-500 text-[10px] font-mono tracking-widest uppercase transition-all shadow-xl">+ INJECT ARTIFICIAL AGENT</button>
                </div>
              )}
            </div>

            <button onClick={() => dispatch({type: 'START_GAME'})} className="w-full py-6 mt-12 bg-zinc-100 text-black font-cinzel font-black hover:bg-blood hover:text-white transition-all duration-500 uppercase tracking-[0.5em] text-sm shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                {(isAdmin || isDeveloper) ? "INITIATE PROTOCOL" : "WAITING FOR OVERSEER"}
            </button>
        </div>

        {/* Right Section: Agents & Comms */}
        <div className="flex flex-col h-[650px] border border-zinc-900 bg-black/80 relative overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,1)]">
           <div className="flex bg-[#080808] border-b border-zinc-900">
               <button onClick={() => setActiveTab('AGENTS')} className={`flex-1 py-5 text-[10px] font-mono tracking-widest uppercase transition-all ${activeTab === 'AGENTS' ? 'bg-zinc-900 text-zinc-100' : 'text-zinc-600 hover:text-zinc-400'}`}>
                   Active Subjects ({players.length})
               </button>
               <button onClick={() => setActiveTab('COMMS')} className={`flex-1 py-5 text-[10px] font-mono tracking-widest uppercase transition-all ${activeTab === 'COMMS' ? 'bg-zinc-900 text-zinc-100' : 'text-zinc-600 hover:text-zinc-400'}`}>
                   Frequency Feed
               </button>
           </div>

           <div className="flex-1 flex flex-col overflow-hidden">
               {activeTab === 'AGENTS' ? (
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                    {players.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-4 bg-zinc-950/60 border border-zinc-900 group hover:border-zinc-700 transition-all shadow-inner">
                            <div className="flex items-center space-x-4">
                                <div className="relative w-12 h-12 bg-zinc-900 overflow-hidden">
                                    <img src={p.avatarUrl} className={`w-full h-full object-cover filter brightness-75 ${p.isBot ? 'grayscale' : ''}`} alt="A" />
                                    {!p.isBot && <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-black shadow-[0_0_5px_#22c55e]" />}
                                </div>
                                <div>
                                    <div className={`text-[12px] font-mono tracking-widest uppercase ${p.id === state.user?.id ? 'text-zinc-100 font-black underline decoration-blood' : 'text-zinc-500'}`}>{p.name}</div>
                                    {p.forcedRole && <div className="text-[8px] text-blood font-black tracking-widest mt-1">LOCK: {p.forcedRole}</div>}
                                </div>
                            </div>
                            {(isAdmin || isDeveloper) && (
                                <select 
                                    className="bg-black text-[10px] text-zinc-600 border border-zinc-900 p-2 uppercase outline-none focus:text-zinc-100 focus:border-blood transition-all" 
                                    onChange={(e) => handleForceRole(p.id, e.target.value)} 
                                    value={p.forcedRole || ''}
                                >
                                    <option value="">AUTO_ASSIGN</option>
                                    <option value="MAFIA">MAFIA</option>
                                    <option value="DOCTOR">DOCTOR</option>
                                    <option value="COP">DETECTIVE</option>
                                    <option value="VILLAGER">CITIZEN</option>
                                </select>
                            )}
                        </div>
                    ))}
                  </div>
               ) : (
                  <div className="flex-1 flex flex-col h-full overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')]">
                      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                        {logs.filter(l => l.type === 'chat').map(log => (
                            <div key={log.id} className="animate-fadeIn group max-w-[85%]">
                                <div className="text-[9px] text-zinc-700 font-mono mb-2 uppercase tracking-[0.2em] group-hover:text-zinc-400 transition-colors">{log.sender}</div>
                                <div className="bg-zinc-900/80 p-4 text-zinc-400 text-xs border-l-2 border-zinc-800 font-typewriter italic group-hover:border-blood/40 transition-all leading-relaxed shadow-lg">
                                    {log.text}
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>
                      <form onSubmit={handleSendChat} className="p-4 bg-zinc-950 border-t border-zinc-900">
                          <input 
                              value={chatMsg} 
                              onChange={(e) => setChatMsg(e.target.value)} 
                              placeholder="ENCRYPT MESSAGE..." 
                              className="w-full bg-black border border-zinc-900 p-4 text-xs text-zinc-100 outline-none focus:border-blood font-mono uppercase tracking-widest transition-all" 
                          />
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