
import React, { useState, memo } from 'react';
import { useGame } from '../GameContext';
import { PlayerStatus, Role } from '../types';

const AdminPanel: React.FC = () => {
  const { state, dispatch } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'PROTOCOL' | 'SUBJECTS'>('PROTOCOL');
  const [broadcastMsg, setBroadcastMsg] = useState('');

  if (!state.user?.isAdmin) return null;

  const toggleLights = (pid: string) => {
    dispatch({ type: 'ADMIN_BLACKOUT', payload: pid });
    setTimeout(() => dispatch({ type: 'ADMIN_BLACKOUT', payload: null }), 4000);
  };

  const handleForceRole = (pid: string, role: Role | null) => {
      dispatch({ type: 'ADMIN_FORCE_ROLE', payload: { playerId: pid, role } });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`fixed top-6 right-6 z-[60] w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-[0_0_30px_rgba(0,0,0,1)] backdrop-blur-md border ${isOpen ? 'bg-zinc-900 border-blood rotate-90 scale-110' : 'bg-black/80 border-zinc-800 hover:scale-110 hover:border-zinc-500'}`}
      >
        <span className="text-2xl">{isOpen ? '✕' : '👁️'}</span>
      </button>

      <div className={`fixed inset-y-0 right-0 w-[420px] bg-[#050505]/98 backdrop-blur-3xl border-l border-zinc-900 z-[55] transform transition-all duration-500 ease-in-out shadow-[-20px_0_100px_rgba(0,0,0,1)] flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Console Header */}
        <div className="h-28 flex flex-col justify-center px-10 border-b border-zinc-900 bg-black/50 relative overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-blood/5 to-transparent pointer-events-none" />
            <h2 className="text-2xl font-noir text-zinc-100 tracking-tighter font-black">OVERSEER CONSOLE</h2>
            <div className="flex items-center space-x-3 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
                <span className="text-[10px] font-mono text-green-500/80 uppercase tracking-[0.2em]">ROOT_ACCESS_STABLE</span>
            </div>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-[#0a0a0a] border-b border-zinc-900 shrink-0">
            <button onClick={() => setActiveTab('PROTOCOL')} className={`flex-1 py-5 text-[10px] font-mono tracking-[0.4em] uppercase transition-all ${activeTab === 'PROTOCOL' ? 'bg-zinc-900 text-blood border-b-2 border-blood' : 'text-zinc-600 hover:text-zinc-400'}`}>Protocol</button>
            <button onClick={() => setActiveTab('SUBJECTS')} className={`flex-1 py-5 text-[10px] font-mono tracking-[0.4em] uppercase transition-all ${activeTab === 'SUBJECTS' ? 'bg-zinc-900 text-blood border-b-2 border-blood' : 'text-zinc-600 hover:text-zinc-400'}`}>Subjects</button>
        </div>

        {/* Content Scroll Area */}
        <div className="p-8 flex-1 overflow-y-auto space-y-10 scrollbar-hide">
            
            {activeTab === 'PROTOCOL' && (
                <div className="space-y-8 animate-fadeIn">
                    <div className="space-y-4">
                        <h3 className="text-[9px] text-zinc-700 font-mono tracking-[0.5em] uppercase border-b border-zinc-900 pb-2">Operational Toggles</h3>
                        <div className="bg-zinc-900/20 p-4 border border-zinc-900 space-y-4">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-zinc-400 font-cinzel text-[10px] tracking-widest group-hover:text-zinc-100 uppercase">Omniscience (Roles)</span>
                                <input type="checkbox" checked={state.admin.rolePeeker} onChange={() => dispatch({type: 'ADMIN_TOGGLE_PEEKER'})} className="accent-blood" />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-zinc-400 font-cinzel text-[10px] tracking-widest group-hover:text-yellow-600 uppercase">Invulnerability (God)</span>
                                <input type="checkbox" checked={state.admin.godMode} onChange={() => dispatch({type: 'ADMIN_TOGGLE_GOD_MODE'})} className="accent-yellow-600" />
                            </label>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[9px] text-zinc-700 font-mono tracking-[0.5em] uppercase border-b border-zinc-900 pb-2">Grid Commands</h3>
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={() => dispatch({type: 'DEV_COMMAND', payload: {type: 'SKIP_PHASE'}})} className="w-full py-4 bg-transparent border border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:text-white uppercase transition-all tracking-[0.3em] font-mono text-[10px]">ROOT_SKIP_PHASE</button>
                            <button onClick={() => dispatch({type: 'DEV_COMMAND', payload: {type: 'KILL_ALL'}})} className="w-full py-4 bg-transparent border border-zinc-800 text-zinc-500 hover:bg-red-900/20 hover:text-red-600 hover:border-red-900 uppercase transition-all tracking-[0.3em] font-mono text-[10px]">ROOT_WIPE_GRID</button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[9px] text-zinc-700 font-mono tracking-[0.5em] uppercase border-b border-zinc-900 pb-2">Global Transmission</h3>
                        <div className="flex flex-col gap-3">
                            <input 
                                value={broadcastMsg} 
                                onChange={(e) => setBroadcastMsg(e.target.value)} 
                                placeholder="BROADCAST_TEXT..." 
                                className="w-full bg-black border border-zinc-900 p-4 text-blood text-xs outline-none font-mono focus:border-blood/50 transition-all uppercase" 
                            />
                            <button onClick={() => { dispatch({type: 'DEV_COMMAND', payload: {type: 'BROADCAST', text: broadcastMsg}}); setBroadcastMsg(''); }} className="w-full py-3 bg-blood text-white font-mono font-black uppercase text-[10px] hover:bg-zinc-100 hover:text-black transition-all tracking-[0.5em]">EXECUTE_BROADCAST</button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'SUBJECTS' && (
                <div className="space-y-6 animate-fadeIn">
                    <h3 className="text-[9px] text-zinc-700 font-mono uppercase tracking-[0.5em] mb-4">Identity & Vitals</h3>
                    <div className="space-y-4">
                        {state.game.players.map(p => (
                            <div key={p.id} className="bg-zinc-950/60 p-5 border border-zinc-900 group hover:border-zinc-700 transition-all shadow-inner space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="relative w-12 h-12 bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0">
                                            <img src={p.avatarUrl} className={`w-full h-full object-cover filter contrast-125 ${p.status !== PlayerStatus.ALIVE ? 'opacity-30 grayscale' : 'brightness-75'}`} alt="S" />
                                            {p.status !== PlayerStatus.ALIVE && <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-red-600 font-noir bg-black/40 rotate-12 uppercase">TERMINATED</div>}
                                        </div>
                                        <div>
                                            <div className="text-[14px] text-zinc-200 font-noir tracking-widest uppercase truncate max-w-[140px] font-bold">{p.name}</div>
                                            <div className="text-[8px] text-zinc-700 font-mono tracking-tighter uppercase">{p.role}</div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-1">
                                        {p.status === PlayerStatus.ALIVE ? (
                                            <>
                                                <button onClick={() => dispatch({type: 'ADMIN_SMITE', payload: p.id})} title="Terminate" className="w-8 h-8 flex items-center justify-center bg-red-950/20 text-red-600 border border-red-900/40 hover:bg-red-600 hover:text-white transition-all text-xs">⚡</button>
                                                <button onClick={() => toggleLights(p.id)} title="Blackout" className="w-8 h-8 flex items-center justify-center bg-zinc-900 text-zinc-600 border border-zinc-800 hover:bg-zinc-100 hover:text-black transition-all text-xs">🔦</button>
                                            </>
                                        ) : (
                                            <button onClick={() => dispatch({type: 'ADMIN_REVIVE', payload: p.id})} className="w-8 h-8 flex items-center justify-center bg-green-950/20 text-green-500 border border-green-900/40 hover:bg-green-600 hover:text-white transition-all text-xs">⟳</button>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-zinc-900/50">
                                    <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Bias Identity:</span>
                                    <div className="flex gap-1">
                                        {[Role.MAFIA, Role.COP, Role.DOCTOR, Role.VILLAGER].map(r => (
                                            <button 
                                                key={r} 
                                                onClick={() => handleForceRole(p.id, p.forcedRole === r ? null : r)}
                                                className={`text-[8px] font-mono p-1 border uppercase transition-all ${p.forcedRole === r ? 'bg-blood border-blood text-white' : 'bg-black border-zinc-800 text-zinc-700 hover:border-zinc-500 hover:text-zinc-300'}`}
                                            >
                                                {r.substring(0, 3)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    </>
  );
};

export default memo(AdminPanel);
