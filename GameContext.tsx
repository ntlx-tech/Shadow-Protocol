
import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { GamePhase, Player, PlayerStatus, Role, GameState, LogEntry, UserProfile } from './types.ts';

const BOT_NAMES = ["Salvatore", "Vinnie", "Claudia", "Lucky", "Malone", "Roxie", "Capone", "Dillinger", "Bonnie", "Clyde", "Bugsy", "Meyer"];
const STORAGE_KEY = 'shadow_protocol_v6_persistent';
const SYNC_RELAY_URL = 'https://jsonblob.com/api/jsonBlob';
const DIRECTORY_BLOB_ID = '1335335198031863808'; 

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
  } catch (e) { console.error("Identity corrupted in storage."); }
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
  | { type: 'START_GAME' }
  | { type: 'FINISH_REVEAL' }
  | { type: 'SEND_CHAT'; payload: string }
  | { type: 'NEXT_PHASE' }
  | { type: 'CAST_VOTE'; payload: { voterId: string; targetId: string } }
  | { type: 'SET_NIGHT_ACTION'; payload: { role: Role; targetId: string } }
  | { type: 'ADMIN_BLACKOUT'; payload: string | null }
  | { type: 'ADMIN_TOGGLE_PEEKER' }
  | { type: 'ADMIN_TOGGLE_GOD_MODE' }
  | { type: 'ADMIN_SMITE'; payload: string }
  | { type: 'ADMIN_REVIVE'; payload: string }
  // Fix: Added missing action types to resolve TS errors in Lobby, AdminPanel, RoleReveal, and GameInterface components
  | { type: 'KICK_PLAYER'; payload: string }
  | { type: 'RESET_GAME' }
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
      const code = action.payload.lobbyCode || (action.payload.isHost ? generateLobbyCode() : "JOINING...");
      const me: Player = { id: state.user!.id, name: state.user!.username, role: Role.VILLAGER, status: PlayerStatus.ALIVE, isBot: false, avatarUrl: state.user!.avatarUrl, forcedRole: null };
      newState = { 
        ...state, 
        isHost: action.payload.isHost,
        syncId: action.payload.syncId || null,
        game: { ...state.game, lobbyCode: code, phase: GamePhase.LOBBY, players: [me], logs: [] } 
      };
      break;
    case 'SYNC_GAME_STATE':
        if (state.isHost) {
          // Master logic: Combine remote player intents with master state
          const remotePlayers = action.payload.players || [];
          const mergedPlayers = [...state.game.players];
          remotePlayers.forEach(rp => {
            const existing = mergedPlayers.find(mp => mp.id === rp.id);
            if (!existing) {
              mergedPlayers.push(rp);
            } else if (!existing.isBot) {
              // Update guest intent (votes/actions) but keep host-controlled fields (role/status)
              existing.voteTargetId = rp.voteTargetId;
            }
          });
          newState = { ...state, game: { ...state.game, players: mergedPlayers, logs: action.payload.logs || state.game.logs } };
        } else {
          newState = { ...state, game: action.payload };
        }
        break;
    case 'LEAVE_LOBBY':
      newState = { ...state, game: { ...initialState.game, phase: GamePhase.MENU }, syncId: null, isHost: false };
      break;
    // Fix: Implemented KICK_PLAYER to allow removing players from the lobby
    case 'KICK_PLAYER':
      newState = { ...state, game: { ...state.game, players: state.game.players.filter(p => p.id !== action.payload) } };
      break;
    // Fix: Implemented RESET_GAME to return to main menu and clear current session
    case 'RESET_GAME':
      newState = { ...state, game: { ...initialState.game, phase: GamePhase.MENU }, syncId: null, isHost: false };
      break;
    case 'ADD_BOT':
      const bName = BOT_NAMES.find(n => !state.game.players.some(p => p.name === n)) || "Agent X";
      const bot: Player = { id: `bot-${Date.now()}`, name: bName, role: Role.VILLAGER, status: PlayerStatus.ALIVE, isBot: true, avatarUrl: `https://picsum.photos/seed/${bName}/100/100`, forcedRole: null };
      newState = { ...state, game: { ...state.game, players: [...state.game.players, bot] } };
      break;
    case 'START_GAME':
      const startedPlayers = state.game.players.map(p => ({ ...p, status: PlayerStatus.ALIVE }));
      const { mafiaCount, doctorCount, copCount } = state.game.config;
      const shuffled = [...startedPlayers].sort(() => Math.random() - 0.5);
      shuffled.forEach((p, idx) => {
          if (idx < mafiaCount) p.role = Role.MAFIA;
          else if (idx < mafiaCount + doctorCount) p.role = Role.DOCTOR;
          else if (idx < mafiaCount + doctorCount + copCount) p.role = Role.COP;
          else p.role = Role.VILLAGER;
      });
      newState = { ...state, game: { ...state.game, phase: GamePhase.REVEAL, players: startedPlayers, dayCount: 1, logs: [{ id: 'sys-start', text: "Operation Shadow Protocol Initiated. Find the rats.", type: 'system', timestamp: Date.now() }] } };
      break;
    case 'FINISH_REVEAL':
      newState = { ...state, game: { ...state.game, phase: GamePhase.NIGHT } };
      break;
    case 'SEND_CHAT':
      const chat: LogEntry = { id: Date.now().toString(), text: action.payload, type: 'chat', sender: state.user?.username, timestamp: Date.now() };
      newState = { ...state, game: { ...state.game, logs: [...state.game.logs, chat] } };
      break;
    case 'NEXT_PHASE':
        const currentP = state.game.phase;
        let nextP = currentP;
        if (currentP === GamePhase.NIGHT) nextP = GamePhase.DAY;
        else if (currentP === GamePhase.DAY) nextP = GamePhase.VOTING;
        else if (currentP === GamePhase.VOTING) nextP = GamePhase.NIGHT;
        newState = { ...state, game: { ...state.game, phase: nextP, dayCount: nextP === GamePhase.NIGHT ? state.game.dayCount + 1 : state.game.dayCount } };
        break;
    case 'CAST_VOTE':
      newState = { ...state, game: { ...state.game, players: state.game.players.map(p => p.id === action.payload.voterId ? { ...p, voteTargetId: action.payload.targetId } : p) } };
      break;
    case 'SET_NIGHT_ACTION':
      const newActions = { ...state.game.nightActions };
      if (action.payload.role === Role.MAFIA) newActions.mafiaTargetId = action.payload.targetId;
      if (action.payload.role === Role.DOCTOR) newActions.doctorTargetId = action.payload.targetId;
      if (action.payload.role === Role.COP) newActions.copTargetId = action.payload.targetId;
      newState = { ...state, game: { ...state.game, nightActions: newActions } };
      break;
    case 'ADMIN_BLACKOUT': newState = { ...state, admin: { ...state.admin, blackoutTargetId: action.payload } }; break;
    case 'ADMIN_TOGGLE_PEEKER': newState = { ...state, admin: { ...state.admin, rolePeeker: !state.admin.rolePeeker } }; break;
    case 'ADMIN_TOGGLE_GOD_MODE': newState = { ...state, admin: { ...state.admin, godMode: !state.admin.godMode } }; break;
    case 'ADMIN_SMITE': newState = { ...state, game: { ...state.game, players: state.game.players.map(p => p.id === action.payload ? { ...p, status: PlayerStatus.DEAD } : p) } }; break;
    case 'ADMIN_REVIVE': newState = { ...state, game: { ...state.game, players: state.game.players.map(p => p.id === action.payload ? { ...p, status: PlayerStatus.ALIVE } : p) } }; break;
    // Fix: Implemented ADMIN_FORCE_ROLE to allow manual role assignment in the console
    case 'ADMIN_FORCE_ROLE':
      newState = { ...state, game: { ...state.game, players: state.game.players.map(p => p.id === action.payload.playerId ? { ...p, forcedRole: action.payload.role } : p) } };
      break;
    case 'DEV_COMMAND':
      if (action.payload.type === 'BROADCAST') {
        const bc: LogEntry = { id: `bc-${Date.now()}`, text: action.payload.text || '', type: 'alert', timestamp: Date.now() };
        newState = { ...state, game: { ...state.game, logs: [...state.game.logs, bc] } };
      } else newState = state;
      break;
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
                        try {
                            const dirRes = await fetch(`${SYNC_RELAY_URL}/${DIRECTORY_BLOB_ID}`);
                            let directory: Record<string, string> = {};
                            if (dirRes.ok) directory = await dirRes.json();
                            directory[state.game.lobbyCode!] = id;
                            await fetch(`${SYNC_RELAY_URL}/${DIRECTORY_BLOB_ID}`, { 
                                method: 'PUT', body: JSON.stringify(directory), headers: { 'Content-Type': 'application/json' } 
                            });
                        } catch (e) {}
                    }
                } else {
                    // Host Master Loop: Read current intents, update master state, push back.
                    const pullRes = await fetch(`${SYNC_RELAY_URL}/${state.syncId}`);
                    if (pullRes.ok) {
                      const remote = await pullRes.json();
                      dispatch({ type: 'SYNC_GAME_STATE', payload: remote });
                    }
                    await fetch(`${SYNC_RELAY_URL}/${state.syncId}`, { 
                      method: 'PUT', body: JSON.stringify(state.game), headers: { 'Content-Type': 'application/json' } 
                    });
                }
            } else if (state.syncId) {
                // Guest Loop: Pull host state, push presence/intents if needed.
                const res = await fetch(`${SYNC_RELAY_URL}/${state.syncId}`);
                if (res.ok) {
                    const remoteGame = await res.json();
                    const meInRemote = remoteGame.players.find((p: any) => p.id === state.user?.id);
                    if (!meInRemote && state.user && remoteGame.phase === GamePhase.LOBBY) {
                       remoteGame.players.push({ id: state.user.id, name: state.user.username, role: Role.VILLAGER, status: PlayerStatus.ALIVE, isBot: false, avatarUrl: state.user.avatarUrl, forcedRole: null });
                       await fetch(`${SYNC_RELAY_URL}/${state.syncId}`, { 
                         method: 'PUT', body: JSON.stringify(remoteGame), headers: { 'Content-Type': 'application/json' } 
                       });
                    }
                    dispatch({ type: 'SYNC_GAME_STATE', payload: remoteGame });
                }
            }
        } catch (e) { console.error("Signal Drop."); } finally { isSyncing.current = false; }
    };

    syncTimer.current = window.setInterval(performSync, 2000); 
    return () => { if(syncTimer.current) clearInterval(syncTimer.current); };
  }, [state.game.lobbyCode, state.isHost, state.syncId, state.game, state.game.phase]);

  const generateBotChat = async (botName: string) => {
    try {
      // Fix: Follow @google/genai guidelines for initializing client and generating content
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are ${botName}, a noir 1920s mafia character. Send a short, one-sentence cryptic chat message about the game.`,
      });
      // Fix: Use the .text property directly (do not call as a method)
      dispatch({ type: 'SEND_CHAT', payload: response.text || "Quiet night." });
    } catch (e) {}
  };

  return <GameContext.Provider value={{ state, dispatch, generateBotChat }}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame failed");
  return context;
};
