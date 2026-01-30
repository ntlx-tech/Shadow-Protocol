
import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { GamePhase, Player, PlayerStatus, Role, GameState, LogEntry, UserProfile } from './types';

const BOT_NAMES = ["Salvatore", "Vinnie", "Claudia", "Lucky", "Malone", "Roxie", "Capone", "Dillinger", "Bonnie", "Clyde", "Bugsy", "Meyer"];
const STORAGE_KEY = 'shadow_protocol_v5_data';
const SYNC_RELAY_URL = 'https://jsonblob.com/api/jsonBlob';

interface AppState {
  user: UserProfile | null;
  profiles: UserProfile[];
  game: GameState;
  syncId: string | null;
  isHost: boolean;
  admin: {
    rolePeeker: boolean;
    godMode: boolean;
    blackoutTargetId: string | null;
    devRevealAll: boolean;
  };
}

const loadPersistentState = (): Partial<AppState> => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) { console.error("Load failed", e); }
  return {};
};

const savedState = loadPersistentState();

const initialState: AppState = {
  user: savedState.user || null,
  profiles: savedState.profiles || [],
  syncId: null,
  isHost: false,
  game: {
    lobbyCode: null,
    phase: GamePhase.MENU,
    dayCount: 1,
    players: [],
    logs: [],
    config: { mafiaCount: 2, doctorCount: 1, copCount: 1 },
    nightActions: { mafiaTargetId: null, doctorTargetId: null, copTargetId: null },
  },
  admin: { rolePeeker: false, godMode: false, blackoutTargetId: null, devRevealAll: false },
};

type Action =
  | { type: 'REGISTER_USER'; payload: UserProfile }
  | { type: 'LOGIN_USER'; payload: string }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'JOIN_LOBBY'; payload: { lobbyCode?: string; isHost: boolean; syncId?: string } }
  | { type: 'SYNC_GAME_STATE'; payload: GameState }
  | { type: 'LEAVE_LOBBY' }
  | { type: 'RESET_GAME' }
  | { type: 'ADD_BOT' }
  | { type: 'START_GAME' }
  | { type: 'FINISH_REVEAL' }
  | { type: 'SEND_CHAT'; payload: string }
  | { type: 'BOT_CHAT'; payload: { sender: string; text: string } }
  | { type: 'NEXT_PHASE' }
  | { type: 'CAST_VOTE'; payload: { voterId: string; targetId: string } }
  | { type: 'SET_NIGHT_ACTION'; payload: { role: Role; targetId: string } }
  | { type: 'DEV_COMMAND'; payload: { type: string; text?: string } }
  | { type: 'ADMIN_BLACKOUT'; payload: string | null }
  | { type: 'ADMIN_TOGGLE_PEEKER' }
  | { type: 'ADMIN_TOGGLE_GOD_MODE' }
  // Fix: Added missing actions used in AdminPanel
  | { type: 'ADD_LOG'; payload: LogEntry }
  | { type: 'ADMIN_SMITE'; payload: string }
  | { type: 'ADMIN_REVIVE'; payload: string }
  | { type: 'UPDATE_CONFIG'; payload: Partial<GameState['config']> };

const gameReducer = (state: AppState, action: Action): AppState => {
  let newState: AppState;
  switch (action.type) {
    case 'REGISTER_USER':
      newState = { ...state, profiles: [...state.profiles, action.payload], user: action.payload };
      break;
    case 'LOGIN_USER':
      const found = state.profiles.find(p => p.username.toLowerCase() === action.payload.toLowerCase());
      newState = { ...state, user: found || state.user };
      break;
    case 'UPDATE_PROFILE':
      if (!state.user) return state;
      const updated = { ...state.user, ...action.payload };
      newState = { ...state, user: updated, profiles: state.profiles.map(p => p.id === state.user?.id ? updated : p) };
      break;
    case 'JOIN_LOBBY':
      const code = action.payload.lobbyCode || "OP88";
      const me: Player = { id: state.user!.id, name: state.user!.username, role: Role.VILLAGER, status: PlayerStatus.ALIVE, isBot: false, avatarUrl: state.user!.avatarUrl };
      newState = { 
        ...state, 
        isHost: action.payload.isHost,
        syncId: action.payload.syncId || state.syncId,
        game: { ...state.game, lobbyCode: code, phase: GamePhase.LOBBY, players: [me], logs: [] } 
      };
      break;
    case 'SYNC_GAME_STATE':
        newState = { ...state, game: action.payload };
        break;
    case 'LEAVE_LOBBY':
    case 'RESET_GAME':
      newState = { ...state, game: { ...state.game, phase: GamePhase.MENU, lobbyCode: null, players: [] }, syncId: null, isHost: false };
      break;
    case 'ADD_BOT':
      const bName = BOT_NAMES.find(n => !state.game.players.some(p => p.name === n)) || "Agent X";
      const bot: Player = { id: `bot-${Date.now()}`, name: bName, role: Role.VILLAGER, status: PlayerStatus.ALIVE, isBot: true, avatarUrl: `https://picsum.photos/seed/${bName}/100/100` };
      newState = { ...state, game: { ...state.game, players: [...state.game.players, bot] } };
      break;
    case 'START_GAME':
      // Basic role assignment logic
      const players = [...state.game.players];
      const shuffled = players.sort(() => Math.random() - 0.5);
      const { mafiaCount, doctorCount, copCount } = state.game.config;
      let idx = 0;
      for (let i = 0; i < mafiaCount && idx < shuffled.length; i++) shuffled[idx++].role = Role.MAFIA;
      for (let i = 0; i < doctorCount && idx < shuffled.length; i++) shuffled[idx++].role = Role.DOCTOR;
      for (let i = 0; i < copCount && idx < shuffled.length; i++) shuffled[idx++].role = Role.COP;
      while (idx < shuffled.length) shuffled[idx++].role = Role.VILLAGER;
      
      newState = { ...state, game: { ...state.game, phase: GamePhase.REVEAL, players } };
      break;
    case 'SEND_CHAT':
      const chat: LogEntry = { id: Date.now().toString(), text: action.payload, type: 'chat', sender: state.user?.username, timestamp: Date.now() };
      newState = { ...state, game: { ...state.game, logs: [...state.game.logs, chat] } };
      break;
    case 'FINISH_REVEAL':
        newState = { ...state, game: { ...state.game, phase: GamePhase.NIGHT } };
        break;
    case 'NEXT_PHASE':
        const next = state.game.phase === GamePhase.NIGHT ? GamePhase.DAY : state.game.phase === GamePhase.DAY ? GamePhase.VOTING : GamePhase.NIGHT;
        newState = { ...state, game: { ...state.game, phase: next, dayCount: next === GamePhase.NIGHT ? state.game.dayCount + 1 : state.game.dayCount } };
        break;
    // Fix: Implemented missing game actions
    case 'CAST_VOTE':
      newState = { ...state, game: { ...state.game, players: state.game.players.map(p => p.id === action.payload.voterId ? { ...p, voteTargetId: action.payload.targetId } : p) } };
      break;
    case 'SET_NIGHT_ACTION':
      const { role, targetId } = action.payload;
      const newActions = { ...state.game.nightActions };
      if (role === Role.MAFIA) newActions.mafiaTargetId = targetId;
      if (role === Role.DOCTOR) newActions.doctorTargetId = targetId;
      if (role === Role.COP) newActions.copTargetId = targetId;
      newState = { ...state, game: { ...state.game, nightActions: newActions } };
      break;
    case 'ADD_LOG':
      newState = { ...state, game: { ...state.game, logs: [...state.game.logs, action.payload] } };
      break;
    case 'ADMIN_SMITE':
      newState = { ...state, game: { ...state.game, players: state.game.players.map(p => p.id === action.payload ? { ...p, status: PlayerStatus.DEAD } : p) } };
      break;
    case 'ADMIN_REVIVE':
      newState = { ...state, game: { ...state.game, players: state.game.players.map(p => p.id === action.payload ? { ...p, status: PlayerStatus.ALIVE } : p) } };
      break;
    case 'UPDATE_CONFIG':
      newState = { ...state, game: { ...state.game, config: { ...state.game.config, ...action.payload } } };
      break;
    case 'DEV_COMMAND':
      if (action.payload.type === 'SKIP_PHASE') {
        const skipTo = state.game.phase === GamePhase.NIGHT ? GamePhase.DAY : state.game.phase === GamePhase.DAY ? GamePhase.VOTING : GamePhase.NIGHT;
        newState = { ...state, game: { ...state.game, phase: skipTo } };
      } else if (action.payload.type === 'KILL_ALL') {
        newState = { ...state, game: { ...state.game, players: state.game.players.map(p => ({ ...p, status: PlayerStatus.DEAD })) } };
      } else if (action.payload.type === 'REVEAL_ALL') {
        newState = { ...state, admin: { ...state.admin, devRevealAll: !state.admin.devRevealAll } };
      } else if (action.payload.type === 'BROADCAST') {
        const broadcast: LogEntry = { id: `bc-${Date.now()}`, text: action.payload.text || '', type: 'alert', timestamp: Date.now() };
        newState = { ...state, game: { ...state.game, logs: [...state.game.logs, broadcast] } };
      } else {
        newState = state;
      }
      break;
    case 'ADMIN_BLACKOUT': newState = { ...state, admin: { ...state.admin, blackoutTargetId: action.payload } }; break;
    case 'ADMIN_TOGGLE_PEEKER': newState = { ...state, admin: { ...state.admin, rolePeeker: !state.admin.rolePeeker } }; break;
    case 'ADMIN_TOGGLE_GOD_MODE': newState = { ...state, admin: { ...state.admin, godMode: !state.admin.godMode } }; break;
    default: return state;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: newState.user, profiles: newState.profiles }));
  return newState;
};

interface GameContextProps { 
  state: AppState; 
  dispatch: React.Dispatch<Action>; 
  generateBotChat: (botName: string) => Promise<void>; 
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const syncTimer = useRef<number | null>(null);

  // NETWORK SYNC ENGINE
  useEffect(() => {
    if (!state.game.lobbyCode) return;

    const performSync = async () => {
        if (state.isHost) {
            // Push state to the relay
            if (!state.syncId) {
                const res = await fetch(SYNC_RELAY_URL, { method: 'POST', body: JSON.stringify(state.game), headers: { 'Content-Type': 'application/json' } });
                const blobUrl = res.headers.get('Location');
                if (blobUrl) {
                    const id = blobUrl.split('/').pop()!;
                    dispatch({ type: 'JOIN_LOBBY', payload: { isHost: true, syncId: id, lobbyCode: state.game.lobbyCode! } });
                }
            } else {
                await fetch(`${SYNC_RELAY_URL}/${state.syncId}`, { method: 'PUT', body: JSON.stringify(state.game), headers: { 'Content-Type': 'application/json' } });
            }
        } else if (state.syncId) {
            // Pull state from the relay
            const res = await fetch(`${SYNC_RELAY_URL}/${state.syncId}`);
            if (res.ok) {
                const remoteGame = await res.json();
                // Logic to add ourselves to the remote list if missing
                const meInRemote = remoteGame.players.find((p: any) => p.id === state.user?.id);
                if (!meInRemote && state.user) {
                   const me: Player = { id: state.user.id, name: state.user.username, role: Role.VILLAGER, status: PlayerStatus.ALIVE, isBot: false, avatarUrl: state.user.avatarUrl };
                   remoteGame.players.push(me);
                }
                dispatch({ type: 'SYNC_GAME_STATE', payload: remoteGame });
            }
        }
    };

    syncTimer.current = window.setInterval(performSync, 3000);
    return () => { if(syncTimer.current) clearInterval(syncTimer.current); };
  }, [state.game.lobbyCode, state.isHost, state.syncId, state.game]);

  const generateBotChat = async (botName: string) => {
    // Fix: Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Noir mafia bot ${botName}. Short sentence. No emojis.`,
      });
      // Fix: Direct property access for text
      dispatch({ type: 'SEND_CHAT', payload: res.text || "..." });
    } catch (e) {
      dispatch({ type: 'SEND_CHAT', payload: "The city never sleeps." });
    }
  };

  return <GameContext.Provider value={{ state, dispatch, generateBotChat }}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame failed");
  return context;
};
