
import React, { useState } from 'react';
import { useGame } from '../GameContext.tsx';

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
    const [joinCode, setJoinCode] = useState('');

    const handleJoinGame = async (mode: 'create' | 'join') => { 
        if (mode === 'create') {
            dispatch({ type: 'JOIN_LOBBY', payload: { isHost: true } });
        } else {
            alert("Frequency sync initiated. If the host is active, you will link automatically.");
            dispatch({ type: 'JOIN_LOBBY', payload: { isHost: false, lobbyCode: joinCode.toUpperCase(), syncId: 'b78a9c3d-1234' } });
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
            <aside className="w-20 md:w-80 bg-[#080808] border-r border-zinc-900 flex flex-col z-30 shadow-2xl">
                <div className="p-4 md:p-10 md:pb-16 flex justify-center md:block">
                    <h1 className="text-xl md:text-4xl font-noir font-black text-white tracking-tighter leading-tight md:leading-[0.85]">SHADOW<br/><span className="text-blood text-[10px] md:text-xl tracking-[0.4em] font-cinzel">PROTOCOL</span></h1>
                </div>
                <nav className="flex-1 px-2 md:px-4 space-y-1">
                    {sidebarItems.map((item) => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center justify-center md:justify-start gap-4 px-3 md:px-6 py-4 rounded-sm transition-all ${activeTab === item.id ? 'text-white bg-zinc-900/40' : 'text-zinc-600 hover:text-zinc-400'}`}>
                            {activeTab === item.id && <div className="absolute left-0 w-1 h-10 bg-blood shadow-[0_0_15px_#8a0303]" />}
                            <span>{item.icon}</span>
                            <span className="hidden md:inline font-cinzel text-xs tracking-widest uppercase">{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-8 border-t border-zinc-900/40 text-center">
                    <div className="text-[8px] font-mono text-zinc-700 tracking-widest uppercase">SYNC_VER: GLOBAL_V1</div>
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
                                    <p className="text-zinc-600 font-typewriter italic leading-relaxed">Secure a new line. Broadcast to 3 other agents.</p>
                                    <div className="mt-12 font-black tracking-widest text-zinc-400">HOST SESSION →</div>
                                </div>
                                <div className="bg-zinc-950/40 border border-zinc-900 p-14 shadow-2xl">
                                    <h3 className="text-3xl font-cinzel text-zinc-300 mb-6 uppercase tracking-widest">INTERCEPT LINK</h3>
                                    <div className="flex gap-4 mt-10">
                                        <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="XXXX" className="w-24 md:w-36 bg-black border border-zinc-800 p-4 text-center font-mono text-white text-xl" maxLength={4} />
                                        <button onClick={() => handleJoinGame('join')} disabled={joinCode.length < 4} className="flex-1 bg-zinc-100 text-black font-cinzel font-black hover:bg-blood hover:text-white transition-all">SYNC</button>
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
