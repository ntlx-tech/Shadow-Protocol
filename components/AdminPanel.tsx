import React, { useState, memo } from 'react';
import { useGame } from '../GameContext';
import { PlayerStatus, Role } from '../types';
import { RoleIcon } from './Icons.tsx';

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
        className={`fixed top-6 right-6 z-[60] w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md border ${isOpen ? 'bg-zinc-800 border-blood rotate-90 scale-105' : 'bg-black/60 border-zinc-700 hover:scale-105 hover:border-zinc-500'}`}
      >
        <span className="text-xl text-zinc-200">{isOpen ? '✕' : '👁️'}</span>
      </button>

      <div className={`fixed inset-y-0 right-0 w-[400px] bg-[#09090b]/95 backdrop-blur-3xl border-l border-zinc-800 z-[55] transform transition-all duration-500 ease-in-out shadow-[-20px_0_100px_rgba(0,0,0,1)] flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Console Header */}
        <div className="h-24 flex flex-col justify-center px-8 border-b border-zinc-800 bg-black/40 relative overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-blood/10 to-transparent pointer-events-none" />
            <h2 className="text-xl font-noir text-zinc-100 tracking-tighter font-black uppercase">Overseer Console</h2>
            <div className="flex items-center space-x-3 mt-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
                <span className="text-[9px] font-bold text-green-500/80 uppercase tracking-widest">Root Access Stable</span>
            </div>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-[#0a0a0a] border-b border-zinc-800 shrink-0">
            <button onClick={() => setActiveTab('PROTOCOL')} className={`flex-1 py-4 text-[10px] font-bold tracking-[0.3em] uppercase transition-all ${activeTab === 'PROTOCOL' ? 'bg-[#121212] text-blood border-b-2 border-blood' : 'text-zinc-600 hover:text-zinc-400'}`}>Protocol</button>
            <button onClick={() => setActiveTab('SUBJECTS')} className={`flex-1 py-4 text-[10px] font-bold tracking-[0.3em] uppercase transition-all ${activeTab === 'SUBJECTS' ? 'bg-[#121212] text-blood border-b-2 border-blood' : 'text-zinc-600 hover:text-zinc-400'}`}>Subjects</button>
        </div>

        {/* Content Scroll Area */}
        <div className="p-8 flex-1 overflow-y-auto space-y-8 scrollbar-hide">
            
            {activeTab === 'PROTOCOL' && (
                <div className="space-y-8 animate-fadeIn">
                    <div className="space-y-4">
                        <h3 className="text-[9px] text-zinc-500 font-bold tracking-[0.4em] uppercase border-b border-zinc-800 pb-2">Operational Toggles</h3>
                        <div className="bg-zinc-900/30 p-4 border border-zinc-800 space-y-4 rounded-sm">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-zinc-400 font-cinzel text-[10px] tracking-widest group-hover:text-zinc-200 uppercase font-bold">Omniscience (See Roles)</span>
                                <input type="checkbox" checked={state.admin.rolePeeker} onChange={() => dispatch({type: 'ADMIN_TOGGLE_PEEKER'})} className="accent-blood" />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-zinc-400 font-cinzel text-[10px] tracking-widest group-hover:text-yellow-600 uppercase font-bold">Invulnerability (God Mode)</span>
                                <input type="checkbox" checked={state.admin.godMode} onChange={() => dispatch({type: 'ADMIN_TOGGLE_GOD_MODE'})} className="accent-yellow-600" />
                            </label>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[9px] text-zinc-500 font-bold tracking-[0.4em] uppercase border-b border-zinc-800 pb-2">Grid Commands</h3>
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={() => dispatch({type: 'DEV_COMMAND', payload: {type: 'SKIP_PHASE'}})} className="w-full py-3 bg-transparent border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white uppercase transition-all tracking-[0.2em] font-bold text-[10px] rounded-sm">Skip Current Phase</button>
                            <button onClick={() => dispatch({type: 'DEV_COMMAND', payload: {type: 'KILL_ALL'}})} className="w-full py-3 bg-transparent border border-zinc-700 text-zinc-400 hover:bg-red-950/30 hover:text-red-500 hover:border-red-900 uppercase transition-all tracking-[0.2em] font-bold text-[10px] rounded-sm">Wipe Grid (Kill All)</button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[9px] text-zinc-500 font-bold tracking-[0.4em] uppercase border-b border-zinc-800 pb-2">Global Transmission</h3>
                        <div className="flex flex-col gap-3">
                            <input 
                                value={broadcastMsg} 
                                onChange={(e) => setBroadcastMsg(e.target.value)} 
                                placeholder="BROADCAST TEXT..." 
                                className="w-full bg-[#0a0a0a] border border-zinc-800 p-3 text-blood text-xs outline-none font-mono focus:border-blood/50 transition-all uppercase rounded-sm" 
                            />
                            <button onClick={() => { dispatch({type: 'DEV_COMMAND', payload: {type: 'BROADCAST', text: broadcastMsg}}); setBroadcastMsg(''); }} className="w-full py-3 bg-blood text-white font-bold uppercase text-[10px] hover:bg-zinc-200 hover:text-black transition-all tracking-[0.3em] rounded-sm">Execute Broadcast</button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'SUBJECTS' && (
                <div className="space-y-6 animate-fadeIn">
                    <h3 className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.4em] mb-4">Identity & Vitals</h3>
                    <div className="space-y-4">
                        {state.game.players.map(p => (
                            <div key={p.id} className="bg-[#121212] p-4 border border-zinc-800 group hover:border-zinc-600 transition-all shadow-sm space-y-4 rounded-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="relative w-10 h-10 bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 rounded-sm">
                                            <img src={p.avatarUrl} className={`w-full h-full object-cover filter contrast-125 ${p.status !== PlayerStatus.ALIVE ? 'opacity-30 grayscale' : 'brightness-90'}`} alt="S" />
                                            {p.status !== PlayerStatus.ALIVE && <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-red-600 font-noir bg-black/50 rotate-12 uppercase">DEAD</div>}
                                        </div>
                                        <div>
                                            <div className="text-[13px] text-zinc-200 font-noir tracking-wider uppercase truncate max-w-[120px] font-bold">{p.name}</div>
                                            <div className="text-[9px] text-zinc-600 font-bold tracking-widest uppercase">{p.role}</div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-1">
                                        {p.status === PlayerStatus.ALIVE ? (
                                            <>
                                                <button onClick={() => dispatch({type: 'ADMIN_SMITE', payload: p.id})} title="Terminate" className="w-7 h-7 flex items-center justify-center bg-red-950/20 text-red-600 border border-red-900/30 hover:bg-red-600 hover:text-white transition-all text-xs rounded-sm">⚡</button>
                                                <button onClick={() => toggleLights(p.id)} title="Blackout" className="w-7 h-7 flex items-center justify-center bg-zinc-900 text-zinc-500 border border-zinc-700 hover:bg-zinc-200 hover:text-black transition-all text-xs rounded-sm">🔦</button>
                                            </>
                                        ) : (
                                            <button onClick={() => dispatch({type: 'ADMIN_REVIVE', payload: p.id})} className="w-7 h-7 flex items-center justify-center bg-green-950/20 text-green-500 border border-green-900/30 hover:bg-green-600 hover:text-white transition-all text-xs rounded-sm">⟳</button>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
                                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Force Role:</span>
                                    <div className="flex gap-1">
                                        {[Role.MAFIA, Role.COP, Role.DOCTOR, Role.VILLAGER].map(r => (
                                            <button 
                                                key={r} 
                                                onClick={() => handleForceRole(p.id, p.forcedRole === r ? null : r)}
                                                className={`w-7 h-7 flex items-center justify-center border transition-all rounded-sm ${p.forcedRole === r ? 'bg-blood border-blood text-white' : 'bg-black border-zinc-700 text-zinc-600 hover:border-zinc-500 hover:text-zinc-300'}`}
                                                title={r}
                                            >
                                                <RoleIcon role={r} className="w-3.5 h-3.5" />
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