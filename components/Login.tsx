
import React, { useState } from 'react';
import { useGame } from '../GameContext.tsx';
import { UserProfile } from '../types.ts';

const Login: React.FC = () => {
  const { state, dispatch } = useGame();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('register');
  
  const [regName, setRegName] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regBio, setRegBio] = useState('');
  const [regAvatar, setRegAvatar] = useState(`https://picsum.photos/seed/${Date.now()}/200`);
  const [regAdminKey, setRegAdminKey] = useState('');
  const [regDevKey, setRegDevKey] = useState('');

  const [loginName, setLoginName] = useState('');
  const [loginPass, setLoginPass] = useState('');

  const handleRegister = () => {
      if (!regName.trim() || !regPass.trim()) return;
      const isAdmin = regAdminKey === 'MAFIA_GOD_2026';
      const isDev = regDevKey === 'DEV_SHADOW_99';
      
      const newProfile: UserProfile = {
          id: `user-${Date.now()}`,
          username: regName,
          password: regPass,
          bio: regBio || "Classified information.",
          avatarUrl: regAvatar,
          bannerUrl: "https://images.unsplash.com/photo-1533282960533-51328aa49826?auto=format&fit=crop&q=80&w=1600",
          badges: ["OPERATIVE"],
          isAdmin: isAdmin || isDev,
          isDeveloper: isDev,
          wins: 0,
          matches: 0
      };
      dispatch({ type: 'REGISTER_USER', payload: newProfile });
  };

  const handleLogin = () => {
      if (!loginName.trim()) return;
      const foundUser = state.profiles.find(p => p.username.toLowerCase() === loginName.toLowerCase() && (!p.password || p.password === loginPass));
      if (foundUser) dispatch({ type: 'LOGIN_USER', payload: loginName });
      else alert("Invalid credentials.");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] relative z-10 overflow-hidden p-6 w-full">
      {/* Removed the fixed vignette overlay here to clear up the view */}
      <div className="w-full max-w-md p-10 bg-zinc-950/90 backdrop-blur-md border border-zinc-900 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative">
        <div className="text-center mb-8">
           <h1 className="text-5xl font-noir font-bold text-zinc-100 tracking-wider mb-2">SHADOW</h1>
           <h2 className="text-xl font-cinzel text-zinc-500 tracking-[0.4em] uppercase">Protocol</h2>
        </div>
        <div className="flex mb-8 border-b border-zinc-900">
            <button onClick={() => setActiveTab('register')} className={`flex-1 py-3 font-cinzel text-xs tracking-widest transition-colors ${activeTab === 'register' ? 'text-blood border-b-2 border-blood bg-zinc-900/50' : 'text-zinc-600 hover:text-zinc-400'}`}>ESTABLISH</button>
            <button onClick={() => setActiveTab('login')} className={`flex-1 py-3 font-cinzel text-xs tracking-widest transition-colors ${activeTab === 'login' ? 'text-blood border-b-2 border-blood bg-zinc-900/50' : 'text-zinc-600 hover:text-zinc-400'}`}>RECALL</button>
        </div>
        {activeTab === 'register' ? (
            <div className="space-y-4 animate-fadeIn">
                 <input value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="CODENAME" className="w-full bg-zinc-900 border border-zinc-800 py-3 px-4 text-zinc-100 font-mono text-sm outline-none focus:border-blood" />
                 <input type="password" value={regPass} onChange={(e) => setRegPass(e.target.value)} placeholder="PASS-KEY" className="w-full bg-zinc-900 border border-zinc-800 py-3 px-4 text-zinc-100 font-mono text-sm outline-none focus:border-blood" />
                 <input type="password" value={regAdminKey} onChange={(e) => setRegAdminKey(e.target.value)} placeholder="OVERSEER KEY (OPTIONAL)" className="w-full bg-zinc-900 border border-zinc-800 py-2 px-4 text-zinc-500 font-mono text-[10px] outline-none" />
                 <input type="password" value={regDevKey} onChange={(e) => setRegDevKey(e.target.value)} placeholder="ARCHITECT KEY (OPTIONAL)" className="w-full bg-zinc-900 border border-zinc-800 py-2 px-4 text-zinc-500 font-mono text-[10px] outline-none" />
                 <button onClick={handleRegister} className="w-full py-4 bg-zinc-100 text-black font-cinzel font-bold border border-white hover:bg-blood hover:text-white transition-all duration-300 uppercase tracking-[0.2em] shadow-lg mt-6">INITIALIZE IDENTITY</button>
            </div>
        ) : (
            <div className="space-y-6 animate-fadeIn">
                <input value={loginName} onChange={(e) => setLoginName(e.target.value)} placeholder="CODENAME" className="w-full bg-zinc-900 border border-zinc-800 py-4 px-4 text-center text-xl text-zinc-100 font-cinzel outline-none focus:border-blood" />
                <input type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} placeholder="PASS-KEY" className="w-full bg-zinc-900 border border-zinc-800 py-3 px-4 text-center text-sm text-zinc-500 font-mono outline-none" />
                <button onClick={handleLogin} className="w-full py-4 bg-zinc-900 text-zinc-400 font-cinzel font-bold border border-zinc-800 hover:bg-zinc-800 transition-all uppercase tracking-[0.2em]">AUTHENTICATE</button>
            </div>
        )}
      </div>
    </div>
  );
};
export default Login;
