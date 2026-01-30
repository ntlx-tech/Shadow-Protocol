
import React, { useState } from 'react';
import { useGame } from '../GameContext.tsx';
import { Role, UserProfile } from '../types.ts';

type Tab = 'PLAY' | 'PROFILE' | 'SETTINGS' | 'REVISIONS' | 'CREDITS';

const NOIR_BANNERS = [
    { id: 'rain', label: 'CHICAGO_STREETS', url: 'https://images.unsplash.com/photo-1533282960533-51328aa49826?auto=format&fit=crop&q=80&w=1600' },
    { id: 'office', label: 'THE_BUREAU', url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=1600' },
    { id: 'car', label: 'GETAWAY_VEHICLE', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1600' },
    { id: 'smoke', label: 'JAZZ_LOUNGE', url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=1600' },
    { id: 'fog', label: 'CITY_LIMITS', url: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&q=80&w=1600' },
    { id: 'whiskey', label: 'SAFEHOUSE', url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=1600' }
];

const Icons = {
    Operations: () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" /><path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" /><path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" /><path d="M12 2V6M12 18V22M2 12H6M18 12H22" strokeLinecap="round" /></svg>,
    Dossier: () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" /><path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" /><path d="M17 11H23M17 15H23M17 7H23" strokeLinecap="round" /></svg>,
    Protocols: () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" /></svg>,
    Revisions: () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 17L11 13L9 13L12 9L15 13L13 13L13 17L11 17Z" /><path d="M12 2L12 6M12 18L12 22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" strokeLinecap="round" /></svg>,
    Intel: () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 19V9C22 7.89543 21.1046 7 20 7H11.8284C11.298 7 10.7893 6.78929 10.4142 6.41421L8.58579 4.58579C8.21071 4.21071 7.70199 4 7.17157 4H4C2.89543 4 2 4.89543 2 6V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19Z" /><path d="M12 11V17M9 14H15" strokeLinecap="round" /></svg>,
    Logout: () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round"/></svg>
};

const DIRECTORY_BLOB_ID = '1334657159740514304'; 

const MainMenu: React.FC = () => {
    const { state, dispatch } = useGame();
    const user = state.user!;
    const [activeTab, setActiveTab] = useState<Tab>('PLAY');
    const [joinCode, setJoinCode] = useState('');
    const [manualSyncId, setManualSyncId] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const [showOverdrive, setShowOverdrive] = useState(false);

    const handleJoinGame = async (mode: 'create' | 'join' | 'direct') => { 
        if (mode === 'create') {
            dispatch({ type: 'JOIN_LOBBY', payload: { isHost: true } });
        } else if (mode === 'direct') {
            if (!manualSyncId.trim()) return;
            dispatch({ type: 'JOIN_LOBBY', payload: { isHost: false, lobbyCode: 'DIRECT', syncId: manualSyncId.trim() } });
        } else {
            setIsSyncing(true);
            try {
                const res = await fetch(`https://jsonblob.com/api/jsonBlob/${DIRECTORY_BLOB_ID}`);
                if (!res.ok) throw new Error("DIRECTORY_UNREACHABLE");
                
                const directory = await res.json();
                const syncId = directory[joinCode.toUpperCase()];
                
                if (syncId) {
                    dispatch({ 
                        type: 'JOIN_LOBBY', 
                        payload: { isHost: false, lobbyCode: joinCode.toUpperCase(), syncId } 
                    });
                } else {
                    alert("FREQUENCY_NOT_FOUND: '" + joinCode.toUpperCase() + "' is not active. Check code or use Manual Overdrive.");
                    setShowOverdrive(true);
                }
            } catch (e) {
                alert("GRID_INTERFERENCE: Global switchboard is unreachable. Use MANUAL OVERDRIVE with your host's Deep Sync ID.");
                setShowOverdrive(true);
            } finally {
                setIsSyncing(false);
            }
        }
    };

    const updateBanner = (url: string) => {
        dispatch({ type: 'UPDATE_PROFILE', payload: { bannerUrl: url } });
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
                <div className="p-4 border-t border-zinc-900/40">
                    <button onClick={() => dispatch({ type: 'LOGOUT_USER' })} className="w-full flex items-center justify-center md:justify-start gap-4 px-3 md:px-6 py-4 rounded-sm transition-all text-zinc-700 hover:text-blood group">
                        <span><Icons.Logout /></span>
                        <span className="hidden md:inline font-cinzel text-[10px] tracking-widest uppercase group-hover:font-black">TERMINATE IDENTITY</span>
                    </button>
                    <div className="mt-4 text-[8px] font-mono text-zinc-800 text-center tracking-widest uppercase">STABILITY: GRID_V5_RESILIENT</div>
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
                                
                                <div className="space-y-6">
                                    <div className="bg-zinc-950/40 border border-zinc-900 p-10 shadow-2xl">
                                        <h3 className="text-2xl font-cinzel text-zinc-300 mb-6 uppercase tracking-widest">INTERCEPT LINK</h3>
                                        <div className="flex gap-4">
                                            <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="XXXX" className="w-24 md:w-36 bg-black border border-zinc-800 p-4 text-center font-mono text-white text-xl uppercase outline-none focus:border-blood" maxLength={4} />
                                            <button onClick={() => handleJoinGame('join')} disabled={joinCode.length < 4 || isSyncing} className="flex-1 bg-zinc-100 text-black font-cinzel font-black hover:bg-blood hover:text-white transition-all uppercase tracking-widest disabled:opacity-50">
                                                {isSyncing ? "SCANNING..." : "SYNC"}
                                            </button>
                                        </div>
                                    </div>

                                    {showOverdrive && (
                                        <div className="bg-blood/5 border border-blood/20 p-10 animate-fadeIn">
                                            <h3 className="text-sm font-noir text-blood mb-4 font-black tracking-widest uppercase">MANUAL OVERDRIVE</h3>
                                            <p className="text-[10px] text-zinc-600 mb-4 font-mono uppercase">Directory failure. Paste Classified Sync ID below:</p>
                                            <div className="flex flex-col gap-4">
                                                <input value={manualSyncId} onChange={(e) => setManualSyncId(e.target.value)} placeholder="SYNC_ID_SERIAL_NUMBER..." className="w-full bg-black border border-zinc-900 p-4 font-mono text-zinc-400 text-[10px] uppercase outline-none focus:border-blood" />
                                                <button onClick={() => handleJoinGame('direct')} className="w-full py-3 bg-blood text-white font-cinzel font-black hover:bg-zinc-100 hover:text-black transition-all uppercase tracking-widest text-[10px]">FORCE CONNECTION</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'PROFILE' && (
                        <div className="space-y-12 animate-fadeIn max-w-4xl">
                             <h2 className="text-5xl md:text-8xl font-noir text-white tracking-tighter uppercase font-black border-b border-zinc-900 pb-10">DOSSIER</h2>
                             
                             <div className="bg-paper border-4 border-zinc-900 shadow-2xl relative overflow-hidden">
                                {/* Steam-style Banner Display */}
                                <div className="h-64 md:h-80 w-full relative">
                                    <div className="absolute inset-0 bg-black/40 z-10" />
                                    <img src={user.bannerUrl} className="w-full h-full object-cover filter grayscale contrast-125 brightness-75 transition-all duration-700" alt="Banner" />
                                    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-paper to-transparent z-20" />
                                </div>

                                <div className="p-10 pt-0 relative z-30 -mt-20">
                                    <div className="flex flex-col md:flex-row gap-10 items-end">
                                        <div className="w-48 h-64 bg-zinc-900 border-4 border-paper p-1 grayscale contrast-125 shadow-2xl">
                                            <img src={user.avatarUrl} className="w-full h-full object-cover" alt="Subject" />
                                        </div>
                                        <div className="flex-1 space-y-4 pb-4">
                                            <div className="absolute top-0 right-10 font-mono text-zinc-800 text-[10px] uppercase tracking-[0.3em]">File Ref: {user.id.split('-')[1]}</div>
                                            <div>
                                                <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-1">Subject Name</div>
                                                <div className="text-5xl font-noir font-black text-zinc-900 uppercase border-b-2 border-zinc-300 drop-shadow-sm">{user.username}</div>
                                            </div>
                                            <div className="flex gap-2">
                                                {user.badges.map(b => (
                                                    <span key={b} className="bg-zinc-900 text-white text-[9px] px-2 py-1 font-black tracking-widest uppercase">{b}</span>
                                                ))}
                                                {user.isAdmin && <span className="bg-blood text-white text-[9px] px-2 py-1 font-black tracking-widest uppercase shadow-sm">OVERSEER</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-zinc-200 pt-10">
                                        <div className="space-y-6">
                                            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Personal Statement</div>
                                            <div className="font-typewriter text-zinc-700 italic text-sm border-l-4 border-zinc-300 pl-6 py-2 leading-relaxed">
                                                "{user.bio}"
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Service Record</div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-zinc-100 p-6 border border-zinc-200">
                                                    <div className="text-[10px] font-mono text-zinc-400 uppercase">Successful Ops</div>
                                                    <div className="text-3xl font-noir text-zinc-900 font-bold">{user.wins}</div>
                                                </div>
                                                <div className="bg-zinc-100 p-6 border border-zinc-200">
                                                    <div className="text-[10px] font-mono text-zinc-400 uppercase">Total Missions</div>
                                                    <div className="text-3xl font-noir text-zinc-900 font-bold">{user.matches}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             </div>

                             {/* Operational Environments (Banner Selector) */}
                             <div className="space-y-6">
                                <h3 className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.5em] border-b border-zinc-900 pb-2">Operational Environments</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                    {NOIR_BANNERS.map((banner) => (
                                        <button 
                                            key={banner.id} 
                                            onClick={() => updateBanner(banner.url)}
                                            className={`group relative h-24 border-2 transition-all overflow-hidden ${user.bannerUrl === banner.url ? 'border-blood scale-105 shadow-[0_0_15px_rgba(138,3,3,0.5)]' : 'border-zinc-800 hover:border-zinc-500'}`}
                                        >
                                            <img src={banner.url} className={`w-full h-full object-cover grayscale contrast-125 ${user.bannerUrl === banner.url ? 'brightness-100' : 'brightness-50 group-hover:brightness-75'}`} alt={banner.label} />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                                <span className="text-[8px] font-mono text-white tracking-widest uppercase">DEPLOY</span>
                                            </div>
                                            {user.bannerUrl === banner.url && (
                                                <div className="absolute top-2 right-2 w-2 h-2 bg-blood rounded-full shadow-[0_0_5px_#8a0303]" />
                                            )}
                                            <div className="absolute bottom-1 left-1 bg-black/60 px-1 py-0.5">
                                                <span className="text-[7px] font-mono text-zinc-300 tracking-tighter uppercase">{banner.label}</span>
                                            </div>
                                        </button>
                                    ))}
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
