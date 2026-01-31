
import React, { useState, useEffect } from 'react';
import { useGame, DIRECTORY_BLOB_ID } from '../GameContext.tsx';

type Tab = 'PLAY' | 'PROFILE' | 'SETTINGS' | 'REVISIONS' | 'CREDITS';

const Icons = {
    Operations: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" /><path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" /><path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" /><path d="M12 2V6M12 18V22M2 12H6M18 12H22" strokeLinecap="round" /></svg>,
    Dossier: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" /><path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" /><path d="M17 11H23M17 15H23M17 7H23" strokeLinecap="round" /></svg>,
    Protocols: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" /></svg>,
    Revisions: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 17L11 13L9 13L12 9L15 13L13 13L13 17L11 17Z" /><path d="M12 2L12 6M12 18L12 22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" strokeLinecap="round" /></svg>,
    Intel: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 19V9C22 7.89543 21.1046 7 20 7H11.8284C11.298 7 10.7893 6.78929 10.4142 6.41421L8.58579 4.58579C8.21071 4.21071 7.70199 4 7.17157 4H4C2.89543 4 2 4.89543 2 6V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19Z" /><path d="M12 11V17M9 14H15" strokeLinecap="round" /></svg>,
    Logout: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round"/></svg>
};

const REVISION_LOGS = [
    { version: 'v7.1', date: 'March 2026', title: 'Frequency Harmonization', notes: 'Unified directory protocols. Lobby scan failure rate reduced to 0%.' },
    { version: 'v7.0', date: 'Feb 2026', title: 'Admin Override Patch', notes: 'God Mode and Phase Skipping injected into Overseer Console.' },
    { version: 'v6.0', date: 'Feb 2026', title: 'Cipher Link Repaired', notes: 'Integrated bulletproof copy-to-clipboard engine.' }
];

const MainMenu: React.FC = () => {
    const { state, dispatch } = useGame();
    const user = state.user!;
    const [activeTab, setActiveTab] = useState<Tab>('PLAY');
    const [joinCode, setJoinCode] = useState('');
    const [manualSyncId, setManualSyncId] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const [showOverdrive, setShowOverdrive] = useState(false);

    const [grainEnabled, setGrainEnabled] = useState(true);
    const [vignetteEnabled, setVignetteEnabled] = useState(true);

    useEffect(() => {
        const grain = document.querySelector('.noir-grain');
        if (grain) {
          grain.classList.toggle('opacity-0', !grainEnabled);
          // When enabled, use the new very subtle class from index.css (default opacity)
          grain.classList.toggle('opacity-100', grainEnabled); 
        }
    }, [grainEnabled]);

    const handleJoinGame = async (mode: 'create' | 'join' | 'direct') => { 
        if (mode === 'create') {
            dispatch({ type: 'JOIN_LOBBY', payload: { isHost: true } });
        } else if (mode === 'direct') {
            const sid = manualSyncId.trim();
            if (!sid) return;
            dispatch({ type: 'JOIN_LOBBY', payload: { isHost: false, lobbyCode: 'DIRECT', syncId: sid } });
        } else {
            setIsSyncing(true);
            try {
                // Use the correct directory ID from context
                const res = await fetch(`https://jsonblob.com/api/jsonBlob/${DIRECTORY_BLOB_ID}`);
                if (!res.ok) throw new Error();
                const directory = await res.json();
                const sid = directory[joinCode.toUpperCase()];
                if (sid) {
                    dispatch({ type: 'JOIN_LOBBY', payload: { isHost: false, lobbyCode: joinCode.toUpperCase(), syncId: sid } });
                } else {
                    setShowOverdrive(true);
                }
            } catch (e) {
                setShowOverdrive(true);
            } finally {
                setIsSyncing(false);
            }
        }
    };

    const sidebarItems: { id: Tab, label: string, icon: React.ReactNode }[] = [
        { id: 'PLAY', label: 'Operations', icon: <Icons.Operations /> },
        { id: 'PROFILE', label: 'Dossier', icon: <Icons.Dossier /> },
        { id: 'SETTINGS', label: 'Protocols', icon: <Icons.Protocols /> },
        { id: 'REVISIONS', label: 'Revisions', icon: <Icons.Revisions /> },
        { id: 'CREDITS', label: 'Intel', icon: <Icons.Intel /> },
    ];

    return (
        <div className="min-h-screen h-screen bg-[#0f0f0f] flex relative overflow-hidden animate-fadeIn font-sans w-full text-zinc-100">
            {/* Sidebar */}
            <aside className="w-20 md:w-72 bg-[#141414] border-r border-zinc-800 flex flex-col z-30 shadow-2xl shrink-0">
                <div className="p-6 md:p-8 md:pb-12 flex justify-center md:block">
                    <h1 className="text-xl md:text-3xl font-noir font-bold text-zinc-100 tracking-tighter leading-tight">SHADOW<br/><span className="text-blood text-[10px] md:text-sm tracking-[0.4em] font-cinzel font-normal">PROTOCOL</span></h1>
                </div>
                <nav className="flex-1 px-2 md:px-4 space-y-2">
                    {sidebarItems.map((item) => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center justify-center md:justify-start gap-4 px-3 md:px-5 py-3 rounded-md transition-all relative ${activeTab === item.id ? 'text-white bg-zinc-800 shadow-inner' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'}`}>
                            {activeTab === item.id && <div className="absolute left-0 top-2 bottom-2 w-1 bg-blood rounded-r-md" />}
                            <span>{item.icon}</span>
                            <span className="hidden md:inline font-cinzel text-[11px] tracking-widest uppercase font-semibold">{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-zinc-800">
                    <button onClick={() => dispatch({ type: 'LOGOUT_USER' })} className="w-full flex items-center justify-center md:justify-start gap-4 px-3 md:px-5 py-3 rounded-md transition-all text-zinc-600 hover:text-blood hover:bg-blood/5 group">
                        <span><Icons.Logout /></span>
                        <span className="hidden md:inline font-cinzel text-[10px] tracking-widest uppercase font-bold group-hover:text-blood">Rescind Identity</span>
                    </button>
                </div>
            </aside>

            {/* Content - Removed Texture for Clean Look */}
            <main className="flex-1 flex flex-col relative z-20 overflow-y-auto bg-[#0f0f0f]">
                <div className="p-6 md:p-16 max-w-6xl w-full mx-auto pb-32">
                    {activeTab === 'PLAY' && (
                        <div className="space-y-10 animate-fadeIn">
                            <h2 className="text-4xl md:text-7xl font-noir text-zinc-100 tracking-tighter uppercase font-bold border-b border-zinc-800 pb-8">Operations</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div onClick={() => handleJoinGame('create')} className="group bg-[#161616] border border-zinc-800 p-10 hover:border-blood cursor-pointer shadow-xl transition-all relative overflow-hidden rounded-sm hover:-translate-y-1">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                                        <div className="w-8 h-8 border-2 border-blood rounded-full animate-ping" />
                                    </div>
                                    <h3 className="text-2xl font-cinzel text-zinc-200 mb-4 uppercase tracking-wider">Initiate Grid</h3>
                                    <p className="text-zinc-500 font-sans text-sm leading-relaxed">Secure a fresh line for your cell. Broadcast the cipher once established to begin the operation.</p>
                                    <div className="mt-8 font-bold tracking-widest text-zinc-500 text-xs group-hover:text-blood transition-colors uppercase flex items-center gap-2">
                                        Create Authority <span className="text-lg">→</span>
                                    </div>
                                </div>
                                
                                <div className="space-y-6">
                                    <div className="bg-[#161616] border border-zinc-800 p-8 shadow-xl rounded-sm">
                                        <h3 className="text-xl font-cinzel text-zinc-200 mb-6 uppercase tracking-wider">Scan Frequency</h3>
                                        <div className="flex gap-3">
                                            <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="CODE" className="w-24 md:w-32 bg-black border border-zinc-700 p-3 text-center font-mono text-white text-lg uppercase outline-none focus:border-blood transition-colors rounded-sm" maxLength={4} />
                                            <button onClick={() => handleJoinGame('join')} disabled={joinCode.length < 4 || isSyncing} className="flex-1 bg-zinc-200 text-black font-cinzel font-bold hover:bg-blood hover:text-white transition-all uppercase tracking-widest disabled:opacity-50 text-xs rounded-sm">
                                                {isSyncing ? "Scanning..." : "Intercept"}
                                            </button>
                                        </div>
                                    </div>

                                    {(showOverdrive || joinCode.length >= 4) && (
                                        <div className="bg-blood/5 border border-blood/20 p-6 animate-fadeIn rounded-sm">
                                            <h3 className="text-xs font-bold text-blood mb-3 tracking-widest uppercase">Frequency Overdrive</h3>
                                            <p className="text-[10px] text-zinc-500 mb-4 font-sans uppercase">Directory scanning is busy. Enter a direct SID to force entry.</p>
                                            <div className="flex flex-col gap-3">
                                                <input value={manualSyncId} onChange={(e) => setManualSyncId(e.target.value)} placeholder="SERIAL ID STRING" className="w-full bg-black border border-zinc-800 p-3 font-mono text-zinc-400 text-[10px] uppercase outline-none focus:border-blood rounded-sm" />
                                                <button onClick={() => handleJoinGame('direct')} className="w-full py-3 bg-blood text-white font-cinzel font-bold hover:bg-zinc-200 hover:text-black transition-all uppercase tracking-widest text-[10px] rounded-sm">Force Sync Protocol</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'PROFILE' && (
                        <div className="space-y-10 animate-fadeIn max-w-4xl">
                             <h2 className="text-4xl md:text-7xl font-noir text-zinc-100 tracking-tighter uppercase font-bold border-b border-zinc-800 pb-8">Dossier</h2>
                             
                             <div className="bg-[#f5f0e1] border border-zinc-800 shadow-2xl relative overflow-hidden rounded-sm">
                                <div className="h-56 md:h-72 w-full relative">
                                    <div className="absolute inset-0 bg-zinc-900/20 z-10" />
                                    <img src={user.bannerUrl} className="w-full h-full object-cover filter brightness-90 transition-all duration-700" alt="Banner" />
                                    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#f5f0e1] to-transparent z-20" />
                                </div>

                                <div className="p-8 pt-0 relative z-30 -mt-16">
                                    <div className="flex flex-col md:flex-row gap-8 items-end">
                                        <div className="w-40 h-52 bg-zinc-100 border-4 border-white shadow-xl p-1 relative rotate-1">
                                            <img src={user.avatarUrl} className="w-full h-full object-cover filter sepia-[0.2]" alt="Subject" />
                                        </div>
                                        <div className="flex-1 space-y-2 pb-2">
                                            <div className="absolute top-0 right-8 font-mono text-zinc-500 text-[10px] uppercase tracking-widest">ID: {user.id.split('-')[1]}</div>
                                            <div>
                                                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Codenamed</div>
                                                <div className="text-4xl md:text-5xl font-noir font-bold text-zinc-900 border-b-2 border-zinc-300 inline-block pb-1">{user.username}</div>
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                {user.badges.map(b => (
                                                    <span key={b} className="bg-zinc-800 text-zinc-100 text-[9px] font-bold px-2 py-1 uppercase rounded-sm">{b}</span>
                                                ))}
                                                {user.isAdmin && <span className="bg-blood text-white text-[9px] font-bold px-2 py-1 uppercase shadow-sm rounded-sm">Overseer</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-zinc-300 pt-8">
                                        <div className="space-y-4">
                                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Statement</div>
                                            <div className="font-serif text-zinc-800 italic text-sm border-l-2 border-blood/30 pl-4 py-1 leading-relaxed">"{user.bio}"</div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Record</div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-white p-4 border border-zinc-200 shadow-sm"><div className="text-[9px] font-bold text-zinc-400 uppercase">Operations Won</div><div className="text-2xl font-noir text-zinc-900 font-bold">{user.wins}</div></div>
                                                <div className="bg-white p-4 border border-zinc-200 shadow-sm"><div className="text-[9px] font-bold text-zinc-400 uppercase">Total Missions</div><div className="text-2xl font-noir text-zinc-900 font-bold">{user.matches}</div></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </div>
                    )}

                    {activeTab === 'SETTINGS' && (
                        <div className="space-y-10 animate-fadeIn max-w-4xl">
                            <h2 className="text-4xl md:text-7xl font-noir text-zinc-100 tracking-tighter uppercase font-bold border-b border-zinc-800 pb-8">Protocols</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="bg-[#161616] p-8 border border-zinc-800 shadow-xl relative rounded-sm">
                                    <div className="absolute top-0 right-0 bg-blood text-white px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-bl-sm">Visual Calibration</div>
                                    <div className="space-y-8 mt-6">
                                        <div className="flex items-center justify-between group">
                                            <div className="space-y-1">
                                                <div className="text-zinc-200 font-cinzel text-sm uppercase tracking-wider">Atmospheric Grain</div>
                                                <div className="text-[10px] font-sans text-zinc-500">Noir filter intensity</div>
                                            </div>
                                            <button onClick={() => setGrainEnabled(!grainEnabled)} className={`w-12 h-6 rounded-full transition-all relative border ${grainEnabled ? 'bg-blood/20 border-blood' : 'bg-zinc-900 border-zinc-700'}`}>
                                                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-zinc-200 transition-all ${grainEnabled ? 'left-7' : 'left-1 bg-zinc-600'}`} />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between group">
                                            <div className="space-y-1">
                                                <div className="text-zinc-200 font-cinzel text-sm uppercase tracking-wider">Vignette Depth</div>
                                                <div className="text-[10px] font-sans text-zinc-500">Peripheral shading</div>
                                            </div>
                                            <button onClick={() => setVignetteEnabled(!vignetteEnabled)} className={`w-12 h-6 rounded-full transition-all relative border ${vignetteEnabled ? 'bg-blood/20 border-blood' : 'bg-zinc-900 border-zinc-700'}`}>
                                                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-zinc-200 transition-all ${vignetteEnabled ? 'left-7' : 'left-1 bg-zinc-600'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-[#f5f0e1] p-8 border border-zinc-300 shadow-xl rotate-1 text-zinc-800 rounded-sm">
                                    <h3 className="text-zinc-900 font-noir text-2xl font-bold border-b-2 border-zinc-300 pb-2 mb-4 uppercase">Field Manual</h3>
                                    <div className="space-y-3 font-serif text-sm leading-relaxed">
                                        <p><strong className="uppercase text-xs tracking-wider">Citizens:</strong> Flush out the infiltrators during daylight.</p>
                                        <p><strong className="uppercase text-xs tracking-wider">Mafia:</strong> Silence targets each night. Don't be caught.</p>
                                        <p><strong className="uppercase text-xs tracking-wider">Doctor:</strong> Protect one soul each night.</p>
                                        <p><strong className="uppercase text-xs tracking-wider">Detective:</strong> Investigate. Reveal the truth.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'REVISIONS' && (
                        <div className="space-y-10 animate-fadeIn max-w-4xl">
                            <h2 className="text-4xl md:text-7xl font-noir text-zinc-100 tracking-tighter uppercase font-bold border-b border-zinc-800 pb-8">Revisions</h2>
                            <div className="space-y-6 relative ml-4">
                                <div className="absolute left-6 top-2 bottom-0 w-px bg-zinc-800" />
                                {REVISION_LOGS.map((log, i) => (
                                    <div key={log.version} className="flex gap-8 items-start relative group">
                                        <div className="w-12 pt-5 flex flex-col items-center z-10">
                                            <div className={`w-3 h-3 rounded-full border-2 border-zinc-700 bg-[#0f0f0f] ${i === 0 ? 'border-blood bg-blood' : ''}`} />
                                        </div>
                                        <div className={`flex-1 p-6 border border-zinc-800 transition-all rounded-sm ${i === 0 ? 'bg-zinc-900/40 border-blood/30' : 'bg-[#161616] hover:bg-zinc-900'}`}>
                                            <div className="flex justify-between items-baseline mb-2">
                                                <h3 className="text-zinc-200 font-cinzel text-lg tracking-wider uppercase font-bold">{log.title}</h3>
                                                <span className="text-[10px] font-bold text-zinc-600 uppercase">{log.version} • {log.date}</span>
                                            </div>
                                            <p className="text-zinc-500 font-sans text-sm">{log.notes}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'CREDITS' && (
                        <div className="space-y-10 animate-fadeIn max-w-4xl">
                            <h2 className="text-4xl md:text-7xl font-noir text-zinc-100 tracking-tighter uppercase font-bold border-b border-zinc-800 pb-8">Intel</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-[#161616] p-8 border border-zinc-800 flex flex-col items-center text-center rounded-sm hover:border-zinc-600 transition-colors">
                                    <h4 className="text-zinc-100 font-cinzel text-sm uppercase tracking-widest mb-3 font-bold">Neural Core</h4>
                                    <p className="text-xs font-sans text-zinc-500 leading-relaxed">Logic driven by Google Gemini API.</p>
                                </div>
                                <div className="bg-[#161616] p-8 border border-zinc-800 flex flex-col items-center text-center rounded-sm hover:border-zinc-600 transition-colors">
                                    <h4 className="text-zinc-100 font-cinzel text-sm uppercase tracking-widest mb-3 font-bold">Aesthetic Grid</h4>
                                    <p className="text-xs font-sans text-zinc-500 leading-relaxed">Calibrated with Tailwind CSS Engine.</p>
                                </div>
                                <div className="bg-[#161616] p-8 border border-zinc-800 flex flex-col items-center text-center rounded-sm hover:border-zinc-600 transition-colors">
                                    <h4 className="text-zinc-100 font-cinzel text-sm uppercase tracking-widest mb-3 font-bold">Relay Sync</h4>
                                    <p className="text-xs font-sans text-zinc-500 leading-relaxed">Frequency established via JSON Relay.</p>
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
