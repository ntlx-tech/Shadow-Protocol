
import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { GamePhase, Player, PlayerStatus, Role, GameState, LogEntry, UserProfile } from './types.ts';

const BOT_NAMES = ["Salvatore", "Vinnie", "Claudia", "Lucky", "Malone", "Roxie", "Capone", "Dillinger", "Bonnie", "Clyde", "Bugsy", "Meyer"];
const STORAGE_KEY = 'shadow_protocol_v7_vault';
const SYNC_RELAY_URL = 'https://jsonblob.com/api/jsonBlob';
const DIRECTORY_BLOB_ID = '1335414848032595968'; // Fresh, high-capacity directory

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

const generateLobbyCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
};

const loadPersistentState = (): Partial<AppState> => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) { console.error("Identity Vault Corrupted."); }
  return { profiles: [] };
};

const savedState = loadPersistentState();

const initialState: AppState = {
  user: null, // Always login fresh, but profiles are saved
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
    kickedIds: [],
  },
  admin: { rolePeeker: false, godMode: false, blackoutTargetId: null, devRevealAll: false },
};

type Action =
  | { type: 'REGISTER_USER'; payload: UserProfile }
  | { type: 'LOGIN_USER'; payload: string }
  | { type: 'LOGOUT_USER' }
  | { type: 'JOIN_LOBBY'; payload: { lobbyCode?: string; isHost: boolean; syncId?: string } }
  | { type: 'SYNC_GAME_STATE'; payload: GameState }
  | { type: 'LEAVE_LOBBY' }
  | { type: 'ADD_BOT' }
  | { type: 'KICK_PLAYER'; payload: string }
  | { type: 'START_GAME' }
  | { type: 'FINISH_REVEAL' }
  | { type: 'SEND_CHAT'; payload: string }
  | { type: 'NEXT_PHASE' }
  | { type: 'CAST_VOTE'; payload: { voterId: string; targetId: string } }
  | { type: 'SET_NIGHT_ACTION'; payload: { role: Role; targetId: string } }
  | { type: 'RESET_GAME' }
  | { type: 'ADMIN_BLACKOUT'; payload: string | null }
  | { type: 'ADMIN_TOGGLE_PEEKER' }
  | { type: 'ADMIN_TOGGLE_GOD_MODE' }
  | { type: 'ADMIN_SMITE'; payload: string }
  | { type: 'ADMIN_REVIVE'; payload: string }
  | { type: 'ADMIN_FORCE_ROLE'; payload: { playerId: string; role: Role | null } }
  | { type: 'DEV_COMMAND'; payload: { type: string; text?: string } };

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
    case 'LOGOUT_USER':
      newState = { ...state, user: null, game: { ...initialState.game }, syncId: null, isHost: false };
      break;
    case 'JOIN_LOBBY':
      const code = action.payload.lobbyCode || (action.payload.isHost ? generateLobbyCode() : "SCANNING...");
      const me: Player = { 
        id: state.user!.id, 
        name: state.user!.username, 
        role: Role.VILLAGER, 
        status: PlayerStatus.ALIVE, 
        isBot: false, 
        avatarUrl: state.user!.avatarUrl, 
        forcedRole: null 
      };
      newState = { 
        ...state, 
        isHost: action.payload.isHost,
        syncId: action.payload.syncId || null,
        game: { ...state.game, lobbyCode: code, phase: GamePhase.LOBBY, players: [me], logs: [] } 
      };
      break;
    case 'SYNC_GAME_STATE':
        if (state.isHost) {
          // Authoritative Merge: Host takes guest intents (votes/actions)
          const remotePlayers = action.payload.players || [];
          const mergedPlayers = state.game.players.map(mp => {
             const rp = remotePlayers.find(p => p.id === mp.id);
             if (rp && !mp.isBot) {
                 return { ...mp, voteTargetId: rp.voteTargetId };
             }
             return mp;
          });
          remotePlayers.forEach(rp => {
             if (!mergedPlayers.find(mp => mp.id === rp.id)) {
                 mergedPlayers.push(rp);
             }
          });
          newState = { ...state, game: { ...state.game, players: mergedPlayers } };
        } else {
          // Guest strictly follows host
          newState = { ...state, game: action.payload };
        }
        break;
    case 'LEAVE_LOBBY':
    case 'RESET_GAME':
      newState = { ...state, game: { ...initialState.game, phase: GamePhase.MENU }, syncId: null, isHost: false };
      break;
    case 'KICK_PLAYER':
      newState = { ...state, game: { ...state.game, players: state.game.players.filter(p => p.id !== action.payload) } };
      break;
    case 'ADD_BOT':
      const bName = BOT_NAMES.find(n => !state.game.players.some(p => p.name === n)) || "Agent X";
      const bot: Player = { id: `bot-${Date.now()}`, name: bName, role: Role.VILLAGER, status: PlayerStatus.ALIVE, isBot: true, avatarUrl: `https://picsum.photos/seed/${bName}/100/100`, forcedRole: null };
      newState = { ...state, game: { ...state.game, players: [...state.game.players, bot] } };
      break;
    case 'START_GAME':
      const startedPlayers = [...state.game.players].map(p => ({ ...p, status: PlayerStatus.ALIVE }));
      const { mafiaCount, doctorCount, copCount } = state.game.config;
      const shuffled = [...startedPlayers].sort(() => Math.random() - 0.5);
      shuffled.forEach((p, idx) => {
          const actualPlayer = startedPlayers.find(sp => sp.id === p.id)!;
          if (idx < mafiaCount) actualPlayer.role = Role.MAFIA;
          else if (idx < mafiaCount + doctorCount) actualPlayer.role = Role.DOCTOR;
          else if (idx < mafiaCount + doctorCount + copCount) actualPlayer.role = Role.COP;
          else actualPlayer.role = Role.VILLAGER;
      });
      newState = { ...state, game: { ...state.game, phase: GamePhase.REVEAL, players: startedPlayers, dayCount: 1, logs: [{ id: 'sys-1', text: "Operation Shadow Protocol: Initiated.", type: 'system', timestamp: Date.now() }] } };
      break;
    case 'FINISH_REVEAL':
      newState = { ...state, game: { ...state.game, phase: GamePhase.NIGHT } };
      break;
    case 'SEND_CHAT':
      const chat: LogEntry = { id: Date.now().toString(), text: action.payload, type: 'chat', sender: state.user?.username, timestamp: Date.now() };
      newState = { ...state, game: { ...state.game, logs: [...state.game.logs, chat] } };
      break;
    case 'NEXT_PHASE':
        const nextP = state.game.phase === GamePhase.NIGHT ? GamePhase.DAY : state.game.phase === GamePhase.DAY ? GamePhase.VOTING : GamePhase.NIGHT;
        newState = { ...state, game: { ...state.game, phase: nextP, dayCount: nextP === GamePhase.NIGHT ? state.game.dayCount + 1 : state.game.dayCount } };
        break;
    case 'CAST_VOTE':
      newState = { ...state, game: { ...state.game, players: state.game.players.map(p => p.id === action.payload.voterId ? { ...p, voteTargetId: action.payload.targetId } : p) } };
      break;
    case 'SET_NIGHT_ACTION':
      const na = { ...state.game.nightActions };
      if (action.payload.role === Role.MAFIA) na.mafiaTargetId = action.payload.targetId;
      if (action.payload.role === Role.DOCTOR) na.doctorTargetId = action.payload.targetId;
      if (action.payload.role === Role.COP) na.copTargetId = action.payload.targetId;
      newState = { ...state, game: { ...state.game, nightActions: na } };
      break;
    case 'ADMIN_BLACKOUT': newState = { ...state, admin: { ...state.admin, blackoutTargetId: action.payload } }; break;
    case 'ADMIN_TOGGLE_PEEKER': newState = { ...state, admin: { ...state.admin, rolePeeker: !state.admin.rolePeeker } }; break;
    case 'ADMIN_TOGGLE_GOD_MODE': newState = { ...state, admin: { ...state.admin, godMode: !state.admin.godMode } }; break;
    case 'ADMIN_SMITE': newState = { ...state, game: { ...state.game, players: state.game.players.map(p => p.id === action.payload ? { ...p, status: PlayerStatus.DEAD } : p) } }; break;
    case 'ADMIN_REVIVE': newState = { ...state, game: { ...state.game, players: state.game.players.map(p => p.id === action.payload ? { ...p, status: PlayerStatus.ALIVE } : p) } }; break;
    case 'ADMIN_FORCE_ROLE': newState = { ...state, game: { ...state.game, players: state.game.players.map(p => p.id === action.payload.playerId ? { ...p, forcedRole: action.payload.role } : p) } }; break;
    case 'DEV_COMMAND':
      if (action.payload.type === 'BROADCAST') {
        const entry: LogEntry = { id: `bc-${Date.now()}`, text: action.payload.text || '', type: 'alert', timestamp: Date.now() };
        newState = { ...state, game: { ...state.game, logs: [...state.game.logs, entry] } };
      } else newState = state;
      break;
    default: return state;
  }
  // Persistence Vault Update
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ profiles: newState.profiles }));
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
  const isSyncing = useRef(false);

  useEffect(() => {
    if (!state.user || state.game.phase !== GamePhase.MENU) return;
    const urlParams = new URLSearchParams(window.location.search);
    const sid = urlParams.get('sid');
    if (sid) dispatch({ type: 'JOIN_LOBBY', payload: { isHost: false, syncId: sid, lobbyCode: 'CIPHER' } });
  }, [state.user, state.game.phase]);

  useEffect(() => {
    if (!state.game.lobbyCode || state.game.phase === GamePhase.MENU) return;

    const performSync = async () => {
        if (isSyncing.current) return;
        isSyncing.current = true;
        try {
            if (state.isHost) {
                if (!state.syncId) {
                    const res = await fetch(SYNC_RELAY_URL, { 
                      method: 'POST', body: JSON.stringify(state.game), headers: { 'Content-Type': 'application/json' } 
                    });
                    const id = res.headers.get('Location')?.split('/').pop();
                    if (id) {
                        dispatch({ type: 'JOIN_LOBBY', payload: { isHost: true, syncId: id, lobbyCode: state.game.lobbyCode! } });
                        const dirRes = await fetch(`${SYNC_RELAY_URL}/${DIRECTORY_BLOB_ID}`);
                        let dir: Record<string, string> = {};
                        if (dirRes.ok) dir = await dirRes.json();
                        dir[state.game.lobbyCode!] = id;
                        await fetch(`${SYNC_RELAY_URL}/${DIRECTORY_BLOB_ID}`, { 
                          method: 'PUT', body: JSON.stringify(dir), headers: { 'Content-Type': 'application/json' } 
                        });
                    }
                } else {
                    const res = await fetch(`${SYNC_RELAY_URL}/${state.syncId}`);
                    if (res.ok) dispatch({ type: 'SYNC_GAME_STATE', payload: await res.json() });
                    await fetch(`${SYNC_RELAY_URL}/${state.syncId}`, { 
                      method: 'PUT', body: JSON.stringify(state.game), headers: { 'Content-Type': 'application/json' } 
                    });
                }
            } else if (state.syncId) {
                const res = await fetch(`${SYNC_RELAY_URL}/${state.syncId}`);
                if (res.ok) {
                    const remote = await res.json();
                    dispatch({ type: 'SYNC_GAME_STATE', payload: remote });
                    // Guest heartbeat: ensure I'm in the player list
                    const me = remote.players.find((p: any) => p.id === state.user?.id);
                    if (!me && state.user && remote.phase === GamePhase.LOBBY) {
                        remote.players.push({ id: state.user.id, name: state.user.username, role: Role.VILLAGER, status: PlayerStatus.ALIVE, isBot: false, avatarUrl: state.user.avatarUrl, forcedRole: null });
                        await fetch(`${SYNC_RELAY_URL}/${state.syncId}`, { method: 'PUT', body: JSON.stringify(remote), headers: { 'Content-Type': 'application/json' } });
                    }
                }
            }
        } catch (e) { console.warn("Signal Interference."); } finally { isSyncing.current = false; }
    };

    const timer = setInterval(performSync, 2000);
    return () => clearInterval(timer);
  }, [state.game.lobbyCode, state.isHost, state.syncId, state.game, state.user]);

  const generateBotChat = async (botName: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are ${botName}, a noir 1920s mafia character. Send a short, one-sentence cryptic chat message about the current game.`,
      });
      dispatch({ type: 'SEND_CHAT', payload: response.text || "Quiet night." });
    } catch (e) {}
  };

  return <GameContext.Provider value={{ state, dispatch, generateBotChat }}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame Context Failure.");
  return context;
};
