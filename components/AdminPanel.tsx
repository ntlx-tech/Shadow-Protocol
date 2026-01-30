import React, { useState, memo } from 'react';
import { useGame } from '../GameContext';
import { PlayerStatus } from '../types';

const AdminPanel: React.FC = () => {
  const { state, dispatch } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'game' | 'players' | 'architect'>('game');
  const [ghostMsg, setGhostMsg] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');

  if (!state.user?.isAdmin) return null;

  const handleGhostWhisper = () => { 
    if (!ghostMsg.trim()) return; 
    dispatch({ type: 'ADD_LOG', payload: { id: `ghost-${Date.now()}`, text: ghostMsg, type: 'ghost', timestamp: Date.now() } }); 
    setGhostMsg(''); 
  };

  const toggleLights = (pid: string) => {
    dispatch({ type: 'ADMIN_BLACKOUT', payload: pid });
    setTimeout(() => dispatch({ type: 'ADMIN_BLACKOUT', payload: null }), 4000);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`fixed top-6 right-6 z-[60] w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-[0_0_30px_rgba(0,0,0,1)] backdrop-blur-md border ${isOpen ? 'bg-zinc-900 border-blood rotate-90 scale-110' : 'bg-black/80 border-zinc-800 hover:scale-110 hover:border-zinc-500'}`}
      >
        <span className="text-2xl">{isOpen ? '✕' : '👁️'}</span>
      </button>

      <div className={`fixed inset-y-0 right-0 w-[420px] bg-[#050505]/98 backdrop-blur-3xl border-l border-zinc-900 z-[55] transform transition-all duration-500 ease-in-out shadow-[-20px_0_100px_rgba(0,0,0,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Terminal Header */}
        <div className="h-28 flex flex-col justify-center px-10 border-b border-zinc-900 bg-black/50 relative overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-blood/5 to-transparent pointer-events-none" />
            <h2 className="text-2xl font-noir text-zinc-100 tracking-tighter font-black">OVERSEER CONSOLE</h2>
            <div className="flex items-center space-x-3 mt-1">
                <div className="flex space-x-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
                    <div className="w-1.5 h-1.5 bg-green-900/40 rounded-full" />
                    <div className="w-1.5 h-1.5 bg-green-900/40 rounded-full" />
                </div>
                <span className="text-[10px] font-mono text-green-500/80 uppercase tracking-[0.2em]">{state.user?.isDeveloper ? 'AUTH_ROOT' : 'AUTH_ADMIN'} // STABLE</span>
            </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-[#0a0a0a] border-b border-zinc-900 shrink-0">
            <button onClick={() => setActiveTab('game')} className={`flex-1 py-5 text-[10px] font-mono tracking-[0.3em] uppercase transition-all ${activeTab === 'game' ? 'bg-zinc-900 text-blood border-b-2 border-blood shadow-inner' : 'text-zinc-600 hover:text-zinc-400'}`}>Protocol</button>
            <button onClick={() => setActiveTab('players')} className={`flex-1 py-5 text-[10px] font-mono tracking-[0.3em] uppercase transition-all ${activeTab === 'players' ? 'bg-zinc-900 text-blood border-b-2 border-blood shadow-inner' : 'text-zinc-600 hover:text-zinc-400'}`}>Subjects</button>
            {state.user?.isDeveloper && (
                <button onClick={() => setActiveTab('architect')} className={`flex-1 py-5 text-[10px] font-mono tracking-[0.3em] uppercase transition-all ${activeTab === 'architect' ? 'bg-zinc-900 text-blue-500 border-b-2 border-blue-500 shadow-inner' : 'text-zinc-600 hover:text-blue-400'}`}>Architect</button>
            )}
        </div>

        {/* Content Scroll Area */}
        <div className="p-8 h-[calc(100vh-192px)] overflow-y-auto space-y-10 scrollbar-hide">
            
            {activeTab === 'game' && (
                <div className="space-y-10 animate-fadeIn">
                    <div className="bg-zinc-900/30 p-6 border border-zinc-900 space-y-6 rounded-sm shadow-xl">
                        <h3 className="text-[9px] text-zinc-600 font-mono tracking-[0.5em] uppercase border-b border-zinc-800 pb-3">Operational Hooks</h3>
                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="text-zinc-400 font-cinzel text-xs tracking-widest group-hover:text-zinc-100 transition-colors uppercase">Peek Roles</span>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={state.admin.rolePeeker} onChange={() => dispatch({type: 'ADMIN_TOGGLE_PEEKER'})} className="sr-only peer" />
                                <div className="w-11 h-6 bg-zinc-800 rounded-full peer peer-checked:bg-blood transition-all after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                            </div>
                        </label>
                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="text-zinc-400 font-cinzel text-xs tracking-widest group-hover:text-yellow-600 transition-colors uppercase">God Mode (Self)</span>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={state.admin.godMode} onChange={() => dispatch({type: 'ADMIN_TOGGLE_GOD_MODE'})} className="sr-only peer" />
                                <div className="w-11 h-6 bg-zinc-800 rounded-full peer peer-checked:bg-yellow-700 transition-all after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                            </div>
                        </label>
                    </div>

                    <div className="space-y-4 bg-zinc-900/20 p-6 border border-zinc-900/40 rounded-sm">
                        <label className="block text-[9px] font-mono text-zinc-700 uppercase tracking-widest mb-4">Frequency Manipulation</label>
                        <div className="space-y-4">
                             <input 
                                value={ghostMsg} 
                                onChange={(e) => setGhostMsg(e.target.value)} 
                                placeholder="GHOST_PACKET_CONTENT..." 
                                className="w-full bg-black border border-zinc-900 p-4 text-xs text-zinc-300 outline-none focus:border-zinc-700 font-mono italic" 
                             />
                             <button onClick={handleGhostWhisper} className="w-full py-4 bg-zinc-900/60 border border-zinc-800 text-zinc-500 text-[10px] font-mono hover:text-white hover:border-zinc-500 transition-all uppercase tracking-[0.4em] shadow-lg">INJECT LOG_WHISPER</button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'players' && (
                <div className="space-y-6 animate-fadeIn">
                    <h3 className="text-[9px] text-zinc-700 font-mono uppercase tracking-[0.5em] mb-4">Subject Management</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {state.game.players.map(p => (
                            <div key={p.id} className="flex items-center justify-between bg-zinc-950/60 p-4 border border-zinc-900 group hover:border-zinc-700 transition-all shadow-inner">
                                <div className="flex items-center space-x-4">
                                    <div className="relative w-10 h-10 bg-zinc-900 border border-zinc-800 overflow-hidden">
                                        <img src={p.avatarUrl} className={`w-full h-full object-cover filter contrast-125 ${p.status !== PlayerStatus.ALIVE ? 'opacity-30 grayscale' : 'brightness-75'}`} alt="S" />
                                        {p.status !== PlayerStatus.ALIVE && <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-red-600 font-noir">RIP</div>}
                                    </div>
                                    <div>
                                        <div className="text-[12px] text-zinc-200 font-mono tracking-widest uppercase truncate max-w-[120px]">{p.name}</div>
                                        <div className="text-[8px] text-zinc-700 font-mono tracking-tighter uppercase">{p.role} // {p.status}</div>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    {p.status === PlayerStatus.ALIVE ? (
                                        <>
                                            <button onClick={() => dispatch({type: 'ADMIN_SMITE', payload: p.id})} title="Terminate" className="w-8 h-8 flex items-center justify-center bg-red-950/20 text-red-600 border border-red-900/40 hover:bg-red-600 hover:text-white transition-all text-sm shadow-xl">⚡</button>
                                            <button onClick={() => toggleLights(p.id)} title="Blackout" className="w-8 h-8 flex items-center justify-center bg-zinc-900 text-zinc-600 border border-zinc-800 hover:bg-white hover:text-black transition-all text-sm shadow-xl">🔦</button>
                                        </>
                                    ) : (
                                        <button onClick={() => dispatch({type: 'ADMIN_REVIVE', payload: p.id})} className="w-8 h-8 flex items-center justify-center bg-green-950/20 text-green-500 border border-green-900/40 hover:bg-green-600 hover:text-white transition-all text-sm">⟳</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'architect' && (
                <div className="space-y-10 animate-fadeIn">
                    <div className="p-6 bg-blue-950/5 border border-blue-900/40 space-y-6 relative rounded-sm shadow-xl">
                        <div className="absolute top-2 right-2 flex space-x-1.5"><div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" /><div className="w-1 h-1 bg-blue-900 rounded-full" /></div>
                        <h3 className="text-blue-500 font-mono text-[10px] uppercase font-black tracking-[0.5em]">Network Topology</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[9px] text-blue-900 uppercase font-mono tracking-widest">Infiltrators</label>
                                <input type="number" value={state.game.config.mafiaCount} onChange={(e) => dispatch({type: 'UPDATE_CONFIG', payload: {mafiaCount: parseInt(e.target.value)}})} className="w-full bg-black border border-blue-900/30 p-2 text-blue-400 text-xs font-mono outline-none focus:border-blue-500 transition-all shadow-inner" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] text-blue-900 uppercase font-mono tracking-widest">Medics</label>
                                <input type="number" value={state.game.config.doctorCount} onChange={(e) => dispatch({type: 'UPDATE_CONFIG', payload: {doctorCount: parseInt(e.target.value)}})} className="w-full bg-black border border-blue-900/30 p-2 text-blue-400 text-xs font-mono outline-none focus:border-blue-500 transition-all shadow-inner" />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-black/40 border border-zinc-900 font-mono text-[10px] space-y-3 shadow-2xl rounded-sm">
                        <h3 className="text-zinc-600 uppercase mb-6 tracking-[0.4em] border-b border-zinc-900 pb-3">Hard Override Commands</h3>
                        <button onClick={() => dispatch({type: 'DEV_COMMAND', payload: {type: 'SKIP_PHASE'}})} className="w-full py-4 bg-transparent border border-blue-900/30 text-blue-900 hover:bg-blue-600 hover:text-white uppercase transition-all tracking-[0.3em] font-black">ROOT_SKIP_PHASE</button>
                        <button onClick={() => dispatch({type: 'DEV_COMMAND', payload: {type: 'KILL_ALL'}})} className="w-full py-4 bg-transparent border border-red-900/30 text-red-900 hover:bg-red-700 hover:text-white uppercase transition-all tracking-[0.3em] font-black">ROOT_WIPE_GRID</button>
                        <button onClick={() => dispatch({type: 'DEV_COMMAND', payload: {type: 'REVEAL_ALL'}})} className="w-full py-4 bg-transparent border border-zinc-800 text-zinc-500 hover:text-white uppercase transition-all tracking-[0.3em] font-black">
                            {state.admin.devRevealAll ? 'FORCE_HIDE_ROLES' : 'FORCE_REVEAL_ROLES'}
                        </button>
                    </div>

                    <div className="space-y-4 bg-blue-950/10 p-6 border border-blue-900/20 rounded-sm">
                        <label className="text-[9px] text-blue-700 uppercase font-mono tracking-[0.4em]">Global Architect Broadcast</label>
                        <div className="flex flex-col gap-3">
                            <input 
                                value={broadcastMsg} 
                                onChange={(e) => setBroadcastMsg(e.target.value)} 
                                placeholder="BROADCAST_TRANSMISSION..." 
                                className="w-full bg-black border border-blue-900/40 p-4 text-blue-500 text-xs outline-none font-mono focus:border-blue-400 transition-all" 
                            />
                            <button onClick={() => { dispatch({type: 'DEV_COMMAND', payload: {type: 'BROADCAST', text: broadcastMsg}}); setBroadcastMsg(''); }} className="w-full py-3 bg-blue-700 text-white font-mono font-black uppercase text-[10px] hover:bg-blue-500 transition-all tracking-[0.5em] shadow-xl">EXECUTE_BROADCAST</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </>
  );
};

export default memo(AdminPanel);