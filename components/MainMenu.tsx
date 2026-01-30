
import React, { useState } from 'react';
import { useGame } from '../GameContext';

type Tab = 'PLAY' | 'PROFILE' | 'SETTINGS' | 'REVISIONS' | 'CREDITS';

const Icons = {
    Operations: () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" /><path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" /><path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" /><path d="M12 2V6M12 18V22M2 12H6M18 12H22" strokeLinecap="round" /></svg>,
    Dossier: () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" /><path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" /><path d="M17 11H23M17 15H23M17 7H23" strokeLinecap="round" /></svg>,
    Protocols: () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" /></svg>,
    Revisions: () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 17L11 13L9 13L12 9L15 13L13 13L13 17L11 17Z" /><path d="M12 2L12 6M12 18L12 22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" strokeLinecap="round" /></svg>,
    Intel: () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 19V9C22 7.89543 21.1046 7 20 7H11.8284C11.298 7 10.7893 6.78929 10.4142 6.41421L8.58579 4.58579C8.21071 4.21071 7.70199 4 7.17157 4H4C2.89543 4 2 4.89543 2 6V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19Z" /><path d="M12 11V17M9 14H15" strokeLinecap="round" /></svg>
};

const MainMenu: React.FC = () => {
    const { state, dispatch } = useGame();
    const user = state.user!;
    const [activeTab, setActiveTab] = useState<Tab>('PLAY');
    const [isEditing, setIsEditing] = useState(false);
    const [editBio, setEditBio] = useState(user.bio);
    const [joinCode, setJoinCode] = useState('');

    const handleUpdateProfile = () => { dispatch({ type: 'UPDATE_PROFILE', payload: { bio: editBio || user.bio } }); setIsEditing(false); };
    const handleJoinGame = (mode: 'create' | 'join') => { dispatch({ type: 'JOIN_LOBBY', payload: { lobbyCode: mode === 'join' ? joinCode.toUpperCase() : undefined } }); };

    const sidebarItems: { id: Tab, label: string, icon: React.ReactNode }[] = [
        { id: 'PLAY', label: 'OPERATIONS', icon: <Icons.Operations /> },
        { id: 'PROFILE', label: 'DOSSIER', icon: <Icons.Dossier /> },
        { id: 'SETTINGS', label: 'PROTOCOLS', icon: <Icons.Protocols /> },
        { id: 'REVISIONS', label: 'REVISIONS', icon: <Icons.Revisions /> },
        { id: 'CREDITS', label: 'INTEL', icon: <Icons.Intel /> },
    ];

    const ALL_BADGES = [
        { id: 'OPERATIVE', label: 'Operative', hint: 'Default clearance.' },
        { id: 'VETERAN', label: 'Night Owl', hint: 'Survive 5 missions.' },
        { id: 'SHARP_EYE', label: 'Detective', hint: 'Expose 3 Mafia members.' },
        { id: 'SILENCER', label: 'The Hitman', hint: 'Liquidate 5 Citizens.' },
        { id: 'ARCHITECT', label: 'Architect', hint: 'Developer Clearance.' },
        { id: 'GHOST', label: 'Ghost', hint: 'Die on the first night.' }
    ];

    const PATCH_NOTES = [
        { version: '1.0.5', date: '2025-05-18', title: 'NEURAL LINK DEPLOYMENT', changes: ['Integrated Google Gemini AI for dynamic bot chat', 'Added Environment Variable support for API security', 'Finalized Vercel deployment configurations'] },
        { version: '1.0.4', date: '2025-05-15', title: 'SOFT LAUNCH POLISH', changes: ['Removed Mafia slider from Lobby (moved to Admin)', 'Fixed Admin Panel flickering and re-render stutter', 'Enabled persistent storage for user accounts and profiles', 'Added Revisions tab to the main terminal'] },
        { version: '1.0.3', date: '2025-05-10', title: 'ARCHITECT OMNIPOTENCE', changes: ['Root Terminal added for Developers', 'Global Role Override in Lobby', 'Broadcast Command refined'] },
        { version: '1.0.2', date: '2025-05-05', title: 'DOSSIER EXPANSION', changes: ['Badges system added', 'Cinematic banner updates', 'Profile scrolling fixes'] }
    ];

    return (
        <div className="min-h-screen h-screen bg-black flex relative overflow-hidden animate-fadeIn font-sans">
            <aside className="w-20 md:w-80 bg-[#080808] border-r border-zinc-900 flex flex-col z-30 shadow-[10px_0_30px_rgba(0,0,0,0.5)] shrink-0">
                <div className="p-4 md:p-10 md:pb-16 flex justify-center md:block">
                    <h1 className="text-xl md:text-4xl font-noir font-black text-white tracking-tighter leading-tight md:leading-[0.85]">SHADOW<br/><span className="text-blood text-[10px] md:text-xl tracking-[0.4em] font-cinzel">PROTOCOL</span></h1>
                </div>
                <nav className="flex-1 px-2 md:px-4 space-y-1 overflow-y-auto scrollbar-hide">
                    {sidebarItems.map((item) => (
                        <button key={item.id} onClick={() => { setActiveTab(item.id); setIsEditing(false); }} className={`w-full flex items-center justify-center md:justify-start gap-4 px-3 md:px-6 py-4 md:py-5 rounded-sm transition-all duration-300 relative ${activeTab === item.id ? 'text-white bg-zinc-900/40 shadow-inner' : 'text-zinc-600 hover:text-zinc-400'}`}>
                            {activeTab === item.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 md:h-10 bg-blood shadow-[0_0_15px_#8a0303]" />}
                            <span className={`${activeTab === item.id ? 'text-white' : 'text-zinc-700'}`}>{item.icon}</span>
                            <span className="hidden md:inline font-cinzel text-xs tracking-[0.3em] font-black uppercase">{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-4 md:p-8 border-t border-zinc-900/40 bg-black/20 text-center">
                    <div className="text-[8px] font-mono text-zinc-700 tracking-[0.3em] uppercase italic">BUILD: 2025_05_18_V5</div>
                </div>
            </aside>

            <main className="flex-1 flex flex-col relative z-20 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')] scroll-smooth">
                {activeTab === 'PROFILE' && (
                    <div className="relative w-full shrink-0 border-b border-zinc-900 overflow-visible bg-black shadow-2xl">
                        <div className="h-[180px] md:h-[300px] w-full relative overflow-hidden">
                            <img src={user.bannerUrl} className="w-full h-full object-cover filter brightness-[0.25] contrast-150 scale-105" alt="Banner"/>
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                        </div>
                        <div className="px-6 md:px-20 -mt-12 md:-mt-20 relative z-30 flex flex-col md:flex-row items-start md:items-end gap-6 md:gap-14 pb-16">
                            <div className="w-40 h-40 md:w-64 md:h-64 bg-zinc-950 p-1.5 border border-zinc-900 shadow-[0_30px_60px_rgba(0,0,0,1)] relative group shrink-0">
                                <img src={user.avatarUrl} className="w-full h-full object-cover grayscale brightness-90 contrast-125 group-hover:grayscale-0 group-hover:brightness-110 transition-all duration-1000" alt="Avatar" />
                                <div className={`absolute -right-4 -top-4 w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-black flex items-center justify-center font-noir font-black text-xl shadow-2xl z-40 ${user.wins > 5 ? 'bg-amber-600 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                                    {Math.floor(user.wins / 2) + 1}
                                </div>
                            </div>
                            <div className="pb-2 md:pb-10 space-y-4 min-w-0 flex-1">
                                <h2 className="text-4xl md:text-8xl font-noir text-white tracking-tighter uppercase drop-shadow-[0_10px_20px_rgba(0,0,0,1)] truncate font-black">{user.username}</h2>
                                <div className="flex flex-wrap gap-3 md:gap-6">
                                    {user.isDeveloper ? <span className="bg-blue-900/30 text-blue-400 border border-blue-500/30 px-5 py-1.5 font-mono text-[10px] tracking-[0.2em] uppercase rounded-sm shadow-xl">ROOT_ARCHITECT</span> : user.isAdmin ? <span className="bg-blood/30 text-blood border border-blood/30 px-5 py-1.5 font-mono text-[10px] tracking-[0.2em] uppercase rounded-sm shadow-xl">PROTOCOL_OVERSEER</span> : <span className="bg-zinc-900/80 text-zinc-500 border border-zinc-800 px-5 py-1.5 font-mono text-[10px] tracking-[0.2em] uppercase rounded-sm">FIELD_OPERATIVE</span>}
                                    <span className="text-zinc-600 font-mono text-[10px] tracking-[0.2em] uppercase bg-black/40 border border-zinc-900 px-5 py-1.5 rounded-sm">X-ID: {user.id.split('-')[1]}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className={`p-6 md:p-20 max-w-7xl w-full mx-auto pb-40 flex-1 ${activeTab === 'PROFILE' ? 'pt-12' : ''}`}>
                    {activeTab === 'PLAY' && (
                        <div className="space-y-12 md:space-y-16 animate-fadeIn">
                            <div className="space-y-4">
                                <h2 className="text-5xl md:text-8xl font-noir text-white tracking-tighter uppercase border-b border-zinc-900 pb-8 font-black">ACTIVE OPERATIONS</h2>
                                <p className="font-typewriter text-zinc-500 text-sm md:text-xl max-w-2xl italic leading-relaxed">"History is written by the survivors. The rest are just ink on the protocol."</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">
                                <div onClick={() => handleJoinGame('create')} className="group bg-zinc-950/40 border border-zinc-900 p-10 md:p-14 hover:border-blood hover:bg-zinc-900/60 transition-all cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                                    <h3 className="text-2xl md:text-3xl font-cinzel text-zinc-300 mb-6 tracking-[0.2em] uppercase font-black group-hover:text-blood transition-colors">ESTABLISH NETWORK</h3>
                                    <p className="text-zinc-600 text-xs md:text-lg font-typewriter leading-relaxed italic border-l-2 border-zinc-800 pl-6">Secure a new frequency and command the grid as Overseer.</p>
                                    <div className="mt-12 font-black tracking-[0.5em] uppercase text-zinc-400 group-hover:translate-x-4 transition-transform flex items-center gap-4">HOST SESSION <span className="text-xl">→</span></div>
                                </div>
                                <div className="bg-zinc-950/40 border border-zinc-900 p-10 md:p-14 flex flex-col justify-between group hover:border-zinc-500 hover:bg-zinc-900/60 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                                    <h3 className="text-2xl md:text-3xl font-cinzel text-zinc-300 mb-6 tracking-[0.2em] uppercase font-black">INTERCEPT LINK</h3>
                                    <div className="flex gap-4 mt-10">
                                        <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="XXXX" className="w-24 md:w-36 bg-black border border-zinc-800 p-4 text-center font-mono text-zinc-100 uppercase outline-none focus:border-blood text-xl tracking-[0.3em] font-black" maxLength={4} />
                                        <button onClick={() => handleJoinGame('join')} disabled={joinCode.length < 4} className="flex-1 bg-zinc-100 text-black font-cinzel font-black hover:bg-blood hover:text-white disabled:opacity-20 uppercase tracking-[0.4em] text-xs transition-all">CONNECT</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'PROFILE' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-14 md:gap-20 animate-fadeIn">
                            <div className="lg:col-span-2 space-y-14">
                                <div className="bg-zinc-950/40 border border-zinc-900 p-8 md:p-14 shadow-inner relative">
                                    <label className="text-[10px] text-zinc-700 font-mono tracking-[0.5em] uppercase block mb-6">Subject Narrative Log</label>
                                    {isEditing ? <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} className="w-full bg-black border border-zinc-800 p-6 font-typewriter text-zinc-300 outline-none h-48 focus:border-blood/40 resize-none text-lg leading-relaxed shadow-inner" /> : <p className="text-zinc-400 font-typewriter text-sm md:text-2xl leading-relaxed italic border-l-4 border-blood/60 pl-8 md:pl-12">"{user.bio}"</p>}
                                    <button onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)} className="mt-8 text-[11px] font-mono text-zinc-700 hover:text-white uppercase tracking-[0.3em] transition-colors">{isEditing ? '[ COMMIT_CHANGES ]' : '[ REVISE_NARRATIVE ]'}</button>
                                </div>
                                <div>
                                    <label className="text-[10px] text-zinc-700 font-mono tracking-[0.5em] uppercase block mb-10 border-b border-zinc-900 pb-4">Operational Achievements</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                                        {ALL_BADGES.map(badge => {
                                            const isUnlocked = user.badges.includes(badge.id) || (badge.id === 'ARCHITECT' && user.isDeveloper);
                                            return (
                                                <div key={badge.id} className={`group relative aspect-square border p-6 flex flex-col items-center justify-center transition-all duration-500 shadow-xl overflow-hidden ${isUnlocked ? 'bg-zinc-950 border-zinc-800 hover:border-blood/50' : 'bg-black/20 border-zinc-900/50 grayscale opacity-30 cursor-not-allowed'}`}>
                                                    <div className={`transition-transform duration-700 ${isUnlocked ? 'group-hover:scale-110' : ''}`}><Icons.Dossier /></div>
                                                    <div className={`text-[10px] font-black text-center font-mono uppercase mt-4 tracking-tighter ${isUnlocked ? 'text-zinc-300' : 'text-zinc-700'}`}>{badge.label}</div>
                                                    <div className="text-[8px] text-zinc-700 text-center font-mono uppercase mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2">{badge.hint}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            <div className="lg:col-span-1">
                                <div className="bg-zinc-950 border border-zinc-900 p-8 md:p-10 space-y-10 shadow-[0_30px_60px_rgba(0,0,0,0.8)] sticky top-10">
                                    <label className="text-[11px] text-zinc-700 font-mono uppercase tracking-[0.4em] block border-b border-zinc-900 pb-4">Extraction Stats</label>
                                    <div className="space-y-8">
                                        <div className="flex justify-between items-end border-b border-zinc-900 pb-4"><span className="text-zinc-600 font-cinzel text-xs tracking-widest">SUCCESS RATE</span><span className="text-zinc-200 font-noir text-3xl font-black">{user.matches > 0 ? Math.round((user.wins / user.matches) * 100) : 0}%</span></div>
                                        <div className="flex justify-between items-end border-b border-zinc-900 pb-4"><span className="text-zinc-600 font-cinzel text-xs tracking-widest">FIELD OPS</span><span className="text-zinc-200 font-noir text-3xl font-black">{user.matches}</span></div>
                                        <div className="flex justify-between items-end border-b border-zinc-900 pb-4"><span className="text-zinc-600 font-cinzel text-xs tracking-widest text-blood">EXTRACTIONS</span><span className="text-blood font-noir text-3xl font-black">{user.wins}</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'REVISIONS' && (
                        <div className="space-y-12 animate-fadeIn max-w-4xl">
                            <h2 className="text-5xl md:text-8xl font-noir text-white tracking-tighter uppercase border-b border-zinc-900 pb-10 font-black">LOG REVISIONS</h2>
                            <div className="space-y-16">
                                {PATCH_NOTES.map(note => (
                                    <div key={note.version} className="relative pl-10 border-l border-zinc-800">
                                        <div className="absolute top-0 left-[-4px] w-2 h-2 bg-blood shadow-[0_0_10px_#8a0303]" />
                                        <div className="flex items-baseline justify-between mb-4 flex-wrap gap-4">
                                            <h3 className="text-2xl font-noir text-zinc-100 font-black tracking-widest uppercase">{note.title}</h3>
                                            <span className="font-mono text-[10px] text-zinc-600 tracking-widest uppercase">REV_{note.version} // {note.date}</span>
                                        </div>
                                        <ul className="space-y-3">
                                            {note.changes.map((change, i) => (
                                                <li key={i} className="font-typewriter text-zinc-500 text-sm leading-relaxed italic border-b border-zinc-900/50 pb-2">+ {change}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeTab === 'SETTINGS' && <div className="space-y-12 animate-fadeIn"><h2 className="text-5xl md:text-8xl font-noir text-white tracking-tighter uppercase border-b border-zinc-900 pb-10 font-black">SYSTEM PROTOCOLS</h2><div className="max-w-2xl space-y-6">{[{ label: 'Atmospheric Grain', desc: 'Vintage film simulation' }, { label: 'High-Fidelity Audio', desc: 'Ambient noir soundtrack' }, { label: 'Shadow Archives', desc: 'Auto-save session logs' }].map((s, idx) => <div key={idx} className="flex items-center justify-between p-8 bg-zinc-950/40 border border-zinc-900 hover:border-zinc-700 transition-all cursor-pointer group"><div className="flex gap-8 items-center"><div className="text-zinc-700 group-hover:text-blood transition-colors"><Icons.Protocols /></div><div><div className="text-zinc-300 font-cinzel text-sm tracking-[0.2em] group-hover:text-white uppercase font-black">{s.label}</div><div className="text-[10px] text-zinc-600 font-mono uppercase mt-2 tracking-widest">{s.desc}</div></div></div><div className="w-14 h-6 bg-blood/80 rounded-full relative shadow-[0_0_10px_rgba(138,3,3,0.3)]"><div className="absolute top-1 left-9 w-4 h-4 bg-white rounded-full shadow-lg" /></div></div>)}</div></div>}
                    {activeTab === 'CREDITS' && <div className="space-y-12 animate-fadeIn"><h2 className="text-5xl md:text-8xl font-noir text-white tracking-tighter uppercase border-b border-zinc-900 pb-10 font-black">INTERNAL INTEL</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-20"><div className="space-y-10"><h3 className="font-cinzel text-blood text-sm tracking-[0.5em] border-b border-zinc-900 pb-4 uppercase font-black">THE ARCHITECTS</h3><ul className="space-y-8 font-typewriter text-zinc-500 text-lg leading-relaxed italic"><li className="flex justify-between border-b border-zinc-900/40 pb-4"><span>CORE SYSTEMS</span><span className="text-zinc-200">AGENT [NLTX]</span></li><li className="flex justify-between border-b border-zinc-900/40 pb-4"><span>DESIGN GRID</span><span className="text-zinc-200">SHADOW_UNIT_01</span></li></ul></div></div></div>}
                </div>
            </main>
        </div>
    );
};

export default MainMenu;
