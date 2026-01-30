
import React, { useState } from 'react';
import { useGame } from '../GameContext.tsx';
import { Role } from '../types.ts';

type Tab = 'PLAY' | 'PROFILE' | 'SETTINGS' | 'REVISIONS' | 'CREDITS';

const Icons = {
    Operations: () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" /><path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" /><path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" /><path d="M12 2V6M12 18V22M2 12H6M18 12H22" strokeLinecap="round" /></svg>,
    Dossier: () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" /><path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" /><path d="M17 11H23M17 15H23M17 7H23" strokeLinecap="round" /></svg>,
    Protocols: () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" /></svg>,
    Revisions: () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 17L11 13L9 13L12 9L15 13L13 13L13 17L11 17Z" /><path d="M12 2L12 6M12 18L12 22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" strokeLinecap="round" /></svg>,
    Intel: () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 19V9C22 7.89543 21.1046 7 20 7H11.8284C11.298 7 10.7893 6.78929 10.4142 6.41421L8.58579 4.58579C8.21071 4.21071 7.70199 4 7.17157 4H4C2.89543 4 2 4.89543 2 6V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19Z" /><path d="M12 11V17M9 14H15" strokeLinecap="round" /></svg>
};

const DIRECTORY_BLOB_ID = '1334657159740514304'; 

const MainMenu: React.FC = () => {
    const { state, dispatch } = useGame();
    const user = state.user!;
    const [activeTab, setActiveTab] = useState<Tab>('PLAY');
    const [joinCode, setJoinCode] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);

    const handleJoinGame = async (mode: 'create' | 'join') => { 
        if (mode === 'create') {
            dispatch({ type: 'JOIN_LOBBY', payload: { isHost: true } });
        } else {
            setIsSyncing(true);
            try {
                // Look up the directory for the syncId
                const res = await fetch(`https://jsonblob.com/api/jsonBlob/${DIRECTORY_BLOB_ID}`);
                const directory = await res.json();
                const syncId = directory[joinCode.toUpperCase()];
                
                if (syncId) {
                    dispatch({ 
                        type: 'JOIN_LOBBY', 
                        payload: { isHost: false, lobbyCode: joinCode.toUpperCase(), syncId } 
                    });
                } else {
                    alert("FREQUENCY_NOT_FOUND: The code provided does not match any active terminal.");
                }
            } catch (e) {
                alert("GRID_ERROR: Interference detected. Try again.");
            } finally {
                setIsSyncing(false);
            }
        }
    };

    const sidebarItems: { id: Tab, label: string, icon: React.ReactNode }[] = [
        { id: 'PLAY', label: 'OPERATIONS', icon: <Icons.Operations /> },
        { id: 'PROFILE', label: 'DOSSIER', icon: <Icons.Dossier /> },
        { id: 'SETTINGS', label: 'PROTOCOLS', icon: <Icons.Protocols /> },
        { id: 'REVISIONS', label: 'REVISIONS', icon: <Icons.Revisions /> },
        { id: 'CREDITS', label: 'INTEL', icon: <Icons.Intel /> },
    ];

    return (
        <div className="min-h-screen h-screen bg-black flex relative overflow-hidden animate-fadeIn font-sans w-full">
            <aside className="w-20 md:w-80 bg-[#080808] border-r border-zinc-900 flex flex-col z-30 shadow-2xl shrink-0">
                <div className="p-4 md:p-10 md:pb-16 flex justify-center md:block">
                    <h1 className="text-xl md:text-4xl font-noir font-black text-white tracking-tighter leading-tight md:leading-[0.85]">SHADOW<br/><span className="text-blood text-[10px] md:text-xl tracking-[0.4em] font-cinzel">PROTOCOL</span></h1>
                </div>
                <nav className="flex-1 px-2 md:px-4 space-y-1">
                    {sidebarItems.map((item) => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center justify-center md:justify-start gap-4 px-3 md:px-6 py-4 rounded-sm transition-all relative ${activeTab === item.id ? 'text-white bg-zinc-900/40' : 'text-zinc-600 hover:text-zinc-400'}`}>
                            {activeTab === item.id && <div className="absolute left-0 w-1 h-10 bg-blood shadow-[0_0_15px_#8a0303]" />}
                            <span>{item.icon}</span>
                            <span className="hidden md:inline font-cinzel text-xs tracking-widest uppercase">{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-8 border-t border-zinc-900/40 text-center">
                    <div className="text-[8px] font-mono text-zinc-700 tracking-widest uppercase">SYNC_VER: GLOBAL_V2.1</div>
                </div>
            </aside>

            <main className="flex-1 flex flex-col relative z-20 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')]">
                <div className="p-6 md:p-20 max-w-7xl w-full mx-auto">
                    {activeTab === 'PLAY' && (
                        <div className="space-y-12 animate-fadeIn">
                            <h2 className="text-5xl md:text-8xl font-noir text-white tracking-tighter uppercase font-black border-b border-zinc-900 pb-10">OPERATIONS</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
                                <div onClick={() => handleJoinGame('create')} className="group bg-zinc-950/40 border border-zinc-900 p-14 hover:border-blood cursor-pointer shadow-2xl transition-all">
                                    <h3 className="text-3xl font-cinzel text-zinc-300 mb-6 uppercase tracking-widest">ESTABLISH FREQUENCY</h3>
                                    <p className="text-zinc-600 font-typewriter italic leading-relaxed">Secure a new line. Broadcast to other verified agents.</p>
                                    <div className="mt-12 font-black tracking-widest text-zinc-400 group-hover:text-blood transition-colors uppercase">HOST SESSION →</div>
                                </div>
                                <div className="bg-zinc-950/40 border border-zinc-900 p-14 shadow-2xl">
                                    <h3 className="text-3xl font-cinzel text-zinc-300 mb-6 uppercase tracking-widest">INTERCEPT LINK</h3>
                                    <p className="text-zinc-600 font-typewriter italic mb-8">Enter the 4-digit frequency code.</p>
                                    <div className="flex gap-4">
                                        <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="XXXX" className="w-24 md:w-36 bg-black border border-zinc-800 p-4 text-center font-mono text-white text-xl uppercase outline-none focus:border-blood" maxLength={4} />
                                        <button onClick={() => handleJoinGame('join')} disabled={joinCode.length < 4 || isSyncing} className="flex-1 bg-zinc-100 text-black font-cinzel font-black hover:bg-blood hover:text-white transition-all uppercase tracking-widest disabled:opacity-50">
                                            {isSyncing ? "SYNCING..." : "SYNC"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'PROFILE' && (
                        <div className="space-y-12 animate-fadeIn max-w-3xl">
                             <h2 className="text-5xl md:text-8xl font-noir text-white tracking-tighter uppercase font-black border-b border-zinc-900 pb-10">DOSSIER</h2>
                             <div className="bg-paper p-10 border-4 border-zinc-900 shadow-2xl rotate-1 relative">
                                <div className="absolute top-4 right-6 font-mono text-zinc-800 text-[10px] uppercase">File Ref: {user.id.split('-')[1]}</div>
                                <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
                                    <div className="w-48 h-64 bg-zinc-900 border-2 border-zinc-800 p-1 grayscale contrast-125 brightness-75">
                                        <img src={user.avatarUrl} className="w-full h-full object-cover" alt="Subject" />
                                    </div>
                                    <div className="flex-1 space-y-6">
                                        <div>
                                            <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-1">Subject Name</div>
                                            <div className="text-4xl font-noir font-black text-zinc-900 uppercase border-b border-zinc-300">{user.username}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-1">Status</div>
                                            <div className="flex gap-2">
                                                {user.badges.map(b => (
                                                    <span key={b} className="bg-zinc-900 text-white text-[9px] px-2 py-1 font-black tracking-widest uppercase">{b}</span>
                                                ))}
                                                {user.isAdmin && <span className="bg-blood text-white text-[9px] px-2 py-1 font-black tracking-widest uppercase">OVERSEER</span>}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-1">Service Record</div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-zinc-100 p-4 border border-zinc-200">
                                                    <div className="text-[10px] font-mono text-zinc-500 uppercase">Successful Ops</div>
                                                    <div className="text-2xl font-noir text-zinc-900 font-bold">{user.wins}</div>
                                                </div>
                                                <div className="bg-zinc-100 p-4 border border-zinc-200">
                                                    <div className="text-[10px] font-mono text-zinc-500 uppercase">Total Missions</div>
                                                    <div className="text-2xl font-noir text-zinc-900 font-bold">{user.matches}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="font-typewriter text-zinc-700 italic text-sm border-l-2 border-zinc-300 pl-4 py-2">
                                            "{user.bio}"
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </div>
                    )}

                    {activeTab === 'SETTINGS' && (
                        <div className="space-y-12 animate-fadeIn max-w-4xl">
                            <h2 className="text-5xl md:text-8xl font-noir text-white tracking-tighter uppercase font-black border-b border-zinc-900 pb-10">PROTOCOLS</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-zinc-900/40 p-10 border border-zinc-800 shadow-xl space-y-8">
                                    <h3 className="font-cinzel text-xl text-zinc-100 uppercase tracking-[0.2em] border-b border-zinc-800 pb-4">Game Parameters</h3>
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-mono text-zinc-500 uppercase">Mafia Presence</span>
                                            <span className="text-xl font-noir text-white">{state.game.config.mafiaCount}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-mono text-zinc-500 uppercase">Medic Support</span>
                                            <span className="text-xl font-noir text-white">{state.game.config.doctorCount}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-mono text-zinc-500 uppercase">Intel Detective</span>
                                            <span className="text-xl font-noir text-white">{state.game.config.copCount}</span>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-mono text-zinc-700 mt-4 leading-relaxed uppercase border-t border-zinc-800 pt-4">
                                        * Parameters can only be modified by the Overseer during initialization.
                                    </div>
                                </div>

                                <div className="bg-zinc-900/40 p-10 border border-zinc-800 shadow-xl space-y-8">
                                    <h3 className="font-cinzel text-xl text-zinc-100 uppercase tracking-[0.2em] border-b border-zinc-800 pb-4">Communication</h3>
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-mono text-zinc-500 uppercase">Encrypted Chat</span>
                                            <span className="text-[10px] font-mono text-green-500 uppercase">ENABLED</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-mono text-zinc-500 uppercase">AI Agents</span>
                                            <span className="text-[10px] font-mono text-green-500 uppercase">STABLE</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-mono text-zinc-500 uppercase">Frequency Relay</span>
                                            <span className="text-[10px] font-mono text-zinc-600 uppercase">v2.1-DIR</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'REVISIONS' && (
                        <div className="space-y-12 animate-fadeIn max-w-4xl">
                            <h2 className="text-5xl md:text-8xl font-noir text-white tracking-tighter uppercase font-black border-b border-zinc-900 pb-10">REVISIONS</h2>
                            <div className="space-y-10">
                                <div className="bg-zinc-900/40 p-10 border border-zinc-800 border-l-4 border-l-blood relative">
                                    <div className="absolute top-10 right-10 text-[10px] font-mono text-zinc-700">FEB 2026</div>
                                    <h3 className="font-noir text-2xl text-white font-bold mb-4 uppercase">Case File #06: The Synchronization Hub</h3>
                                    <div className="font-typewriter text-zinc-500 space-y-4 text-sm">
                                        <p>+ Unified 4-digit code directory for multi-device play.</p>
                                        <p>+ Locked down UI to prevent accidental text selection.</p>
                                        <p>+ Fixed Overseer bias bug in Lobby phase.</p>
                                        <p>+ Enabled Lobby console for pre-game identity assignment.</p>
                                    </div>
                                </div>
                                <div className="bg-zinc-900/40 p-10 border border-zinc-800 opacity-50 relative">
                                    <div className="absolute top-10 right-10 text-[10px] font-mono text-zinc-700">JAN 2026</div>
                                    <h3 className="font-noir text-2xl text-zinc-400 font-bold mb-4 uppercase">Case File #05: The Overseer Patch</h3>
                                    <div className="font-typewriter text-zinc-600 space-y-4 text-sm">
                                        <p>+ Initial console dual-channel operation.</p>
                                        <p>+ Implemented direct identity forcing.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'CREDITS' && (
                        <div className="space-y-12 animate-fadeIn max-w-2xl">
                            <h2 className="text-5xl md:text-8xl font-noir text-white tracking-tighter uppercase font-black border-b border-zinc-900 pb-10">INTEL</h2>
                            <div className="bg-paper p-12 text-zinc-900 border-4 border-zinc-900 rotate-[-1deg] shadow-2xl">
                                <div className="text-center space-y-8">
                                    <h3 className="font-cinzel text-xl font-bold tracking-[0.5em] border-b border-zinc-300 pb-4 uppercase">Confidential Project</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-[10px] font-mono text-zinc-500 uppercase">Lead Architect</div>
                                            <div className="text-2xl font-noir font-black uppercase">Gemini & Human Operator</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-mono text-zinc-500 uppercase">Visual Identity</div>
                                            <div className="text-2xl font-noir font-black uppercase">Noir Renaissance Studio</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-mono text-zinc-500 uppercase">Neural Engine</div>
                                            <div className="text-2xl font-noir font-black uppercase">Google Generative AI</div>
                                        </div>
                                    </div>
                                    <div className="pt-8 border-t border-zinc-300 font-typewriter text-xs text-zinc-600 leading-relaxed italic">
                                        "This simulation is provided for authorized agents only. Any unauthorized access to the protocol will result in immediate termination of assets."
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MainMenu;
