
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { GamePhase, Player, PlayerStatus, Role, GameState, LogEntry, UserProfile } from './types';

const BOT_NAMES = ["Salvatore", "Vinnie", "Claudia", "Lucky", "Malone", "Roxie", "Capone", "Dillinger", "Bonnie", "Clyde", "Bugsy", "Meyer"];
const BOT_QUOTES = [
  "Anyone seen the heat? It's getting quiet out here.",
  "I don't trust the look of things tonight.",
  "If I find out who's behind this, they're sleeping with the fishes.",
  "Stay sharp, people. The shadows are moving.",
  "Is it just me, or is the air getting colder?",
  "I've got a bad feeling about this city...",
  "Don't look at me, I was at the docks all night.",
  "The protocol is compromised, I can feel it.",
  "I saw someone lurking near the warehouse last night...",
  "Keep your friends close, and your suspects closer."
];

const ACTIVE_LOBBIES = ['OP88', 'JOIN', 'TEST'];

interface AppState {
  user: UserProfile | null;
  profiles: UserProfile[];
  game: GameState;
  admin: {
    rolePeeker: boolean;
    godMode: boolean;
    blackoutTargetId: string | null;
    devRevealAll: boolean;
  };
}

// Persistence Helpers
const STORAGE_KEY = 'shadow_protocol_data';

const loadPersistentState = (): Partial<AppState> => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to load state", e);
  }
  return {};
};

const savedState = loadPersistentState();

const initialState: AppState = {
  user: savedState.user || null,
  profiles: savedState.profiles || [],
  game: {
    lobbyCode: null,
    phase: GamePhase.MENU,
    dayCount: 1,
    players: [],
    logs: [],
    config: { mafiaCount: 2, doctorCount: 1, copCount: 1 },
    nightActions: { mafiaTargetId: null, doctorTargetId: null, copTargetId: null },
  },
  admin: {
    rolePeeker: false,
    godMode: false,
    blackoutTargetId: null,
    devRevealAll: false,
  },
};

type Action =
  | { type: 'REGISTER_USER'; payload: UserProfile }
  | { type: 'LOGIN_USER'; payload: string }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'JOIN_LOBBY'; payload: { lobbyCode?: string } }
  | { type: 'LEAVE_LOBBY' }
  | { type: 'RESET_GAME' }
  | { type: 'UPDATE_CONFIG'; payload: Partial<GameState['config']> }
  | { type: 'ADD_BOT' }
  | { type: 'KICK_PLAYER'; payload: string }
  | { type: 'SET_FORCED_ROLE'; payload: { playerId: string; role: Role | undefined } }
  | { type: 'START_GAME' }
  | { type: 'FINISH_REVEAL' }
  | { type: 'ADD_LOG'; payload: LogEntry }
  | { type: 'SEND_CHAT'; payload: string }
  | { type: 'BOT_CHAT'; payload: { sender: string; text: string } }
  | { type: 'SET_NIGHT_ACTION'; payload: { role: Role; targetId: string } }
  | { type: 'NEXT_PHASE' }
  | { type: 'ADMIN_TOGGLE_PEEKER' }
  | { type: 'ADMIN_TOGGLE_GOD_MODE' }
  | { type: 'ADMIN_SMITE'; payload: string }
  | { type: 'ADMIN_REVIVE'; payload: string }
  | { type: 'ADMIN_FORCE_VOTE'; payload: { voterId: string; targetId: string } }
  | { type: 'ADMIN_BLACKOUT'; payload: string | null }
  | { type: 'CAST_VOTE'; payload: { voterId: string; targetId: string } }
  | { type: 'DEV_COMMAND'; payload: { type: 'WIN_MAFIA' | 'WIN_TOWN' | 'REVEAL_ALL' | 'BROADCAST' | 'SKIP_PHASE' | 'KILL_ALL'; text?: string } };

const assignRoles = (currentPlayers: Player[], config: GameState['config']): Player[] => {
    let pool: Role[] = [
        ...Array(config.mafiaCount).fill(Role.MAFIA),
        ...Array(config.doctorCount).fill(Role.DOCTOR),
        ...Array(config.copCount).fill(Role.COP),
    ];

    let playersWithRoles = currentPlayers.map(p => {
        if (p.forcedRole) {
            const idx = pool.indexOf(p.forcedRole);
            if (idx > -1) pool.splice(idx, 1);
            return { ...p, role: p.forcedRole };
        }
        return { ...p, role: Role.VILLAGER }; 
    });

    const unassignedPlayers = playersWithRoles.filter(p => !p.forcedRole);
    const neededCount = unassignedPlayers.length;
    
    if (pool.length < neededCount) {
        pool = [...pool, ...Array(neededCount - pool.length).fill(Role.VILLAGER)];
    }

    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    return playersWithRoles.map(p => {
        if (p.forcedRole) return p;
        const assignedRole = pool.pop() || Role.VILLAGER;
        return { ...p, role: assignedRole };
    });
};

const gameReducer = (state: AppState, action: Action): AppState => {
  let newState: AppState;
  switch (action.type) {
    case 'REGISTER_USER':
        newState = { ...state, profiles: [...state.profiles, action.payload], user: action.payload, game: { ...state.game, phase: GamePhase.MENU } };
        break;
    case 'LOGIN_USER':
        const foundUser = state.profiles.find(p => p.username.toLowerCase() === action.payload.toLowerCase());
        newState = { ...state, user: foundUser || state.user, game: { ...state.game, phase: GamePhase.MENU } };
        break;
    case 'UPDATE_PROFILE':
        if (!state.user) return state;
        const updatedUser = { ...state.user, ...action.payload };
        newState = { ...state, user: updatedUser, profiles: state.profiles.map(p => p.id === state.user?.id ? updatedUser : p) };
        break;
    case 'JOIN_LOBBY': {
      if (!state.user) return state;
      const codeInput = action.payload.lobbyCode?.toUpperCase();
      if (codeInput && !ACTIVE_LOBBIES.includes(codeInput)) {
          alert(`Lobby ${codeInput} not found.`);
          return state;
      }
      const lobbyCode = codeInput || "OP88";
      newState = { ...state, game: { ...state.game, lobbyCode, phase: GamePhase.LOBBY, players: [{ id: state.user.id, name: state.user.username, role: Role.VILLAGER, status: PlayerStatus.ALIVE, isBot: false, avatarUrl: state.user.avatarUrl, profile: state.user }], logs: [], dayCount: 1, nightActions: { mafiaTargetId: null, doctorTargetId: null, copTargetId: null } } };
      break;
    }
    case 'LEAVE_LOBBY':
    case 'RESET_GAME':
        newState = { ...state, game: { ...state.game, phase: GamePhase.MENU, lobbyCode: null, players: [], logs: [], dayCount: 1 }, admin: { ...state.admin, devRevealAll: false } };
        break;
    case 'ADD_BOT': {
        const availableNames = BOT_NAMES.filter(n => !state.game.players.some(p => p.name === n));
        if (availableNames.length === 0) return state; 
        const name = availableNames[Math.floor(Math.random() * availableNames.length)];
        newState = { ...state, game: { ...state.game, players: [...state.game.players, { id: `bot-${Date.now()}-${Math.random()}`, name, role: Role.VILLAGER, status: PlayerStatus.ALIVE, isBot: true, avatarUrl: `https://picsum.photos/seed/${name}/100/100` }] } };
        break;
    }
    case 'KICK_PLAYER':
        newState = { ...state, game: { ...state.game, players: state.game.players.filter(p => p.id !== action.payload) } };
        break;
    case 'SET_FORCED_ROLE':
        newState = { ...state, game: { ...state.game, players: state.game.players.map(p => p.id === action.payload.playerId ? { ...p, forcedRole: action.payload.role } : p) } };
        break;
    case 'UPDATE_CONFIG':
      newState = { ...state, game: { ...state.game, config: { ...state.game.config, ...action.payload } } };
      break;
    case 'START_GAME':
      newState = { ...state, game: { ...state.game, phase: GamePhase.REVEAL, players: assignRoles(state.game.players, state.game.config), logs: [{ id: Date.now().toString(), text: "Protocol initiated. Trust no one.", type: 'system', timestamp: Date.now() }] } };
      break;
    case 'FINISH_REVEAL':
      newState = { ...state, game: { ...state.game, phase: GamePhase.NIGHT } };
      break;
    case 'SEND_CHAT':
    case 'BOT_CHAT':
        const chatLog: LogEntry = { id: `${Date.now()}-${Math.random()}`, text: action.payload instanceof Object ? action.payload.text : action.payload, type: 'chat', sender: action.payload instanceof Object ? action.payload.sender : (state.user?.username || 'SYSTEM'), timestamp: Date.now() };
        newState = { ...state, game: { ...state.game, logs: [...state.game.logs, chatLog] } };
        break;
    case 'SET_NIGHT_ACTION':
      const nActions = { ...state.game.nightActions };
      if (action.payload.role === Role.MAFIA) nActions.mafiaTargetId = action.payload.targetId;
      if (action.payload.role === Role.DOCTOR) nActions.doctorTargetId = action.payload.targetId;
      if (action.payload.role === Role.COP) nActions.copTargetId = action.payload.targetId;
      newState = { ...state, game: { ...state.game, nightActions: nActions } };
      break;
    case 'NEXT_PHASE': {
      const currentPhase = state.game.phase;
      let nextPhase = currentPhase;
      let nextPlayers = [...state.game.players];
      let newLogs = [...state.game.logs];
      let newDayCount = state.game.dayCount;

      if (currentPhase === GamePhase.NIGHT) {
        const { mafiaTargetId, doctorTargetId } = state.game.nightActions;
        let finalMafiaTarget = mafiaTargetId;
        const aliveMafia = nextPlayers.filter(p => p.role === Role.MAFIA && p.status === PlayerStatus.ALIVE);
        if (!finalMafiaTarget && aliveMafia.length > 0) {
            const targets = nextPlayers.filter(p => p.status === PlayerStatus.ALIVE && p.role !== Role.MAFIA);
            if (targets.length > 0) finalMafiaTarget = targets[Math.floor(Math.random() * targets.length)].id;
        }
        if (state.admin.godMode && finalMafiaTarget === state.user?.id) finalMafiaTarget = null;
        if (finalMafiaTarget && finalMafiaTarget !== doctorTargetId) {
          nextPlayers = nextPlayers.map(p => p.id === finalMafiaTarget ? { ...p, status: PlayerStatus.DEAD } : p);
          newLogs.push({ id: `alert-${Date.now()}`, text: `${nextPlayers.find(p => p.id === finalMafiaTarget)?.name} was liquidated.`, type: 'alert', timestamp: Date.now() });
        } else {
          newLogs.push({ id: `sys-${Date.now()}`, text: "The night was quiet.", type: 'system', timestamp: Date.now() });
        }
        nextPhase = GamePhase.DAY;
      } else if (currentPhase === GamePhase.DAY) {
        nextPhase = GamePhase.VOTING;
      } else if (currentPhase === GamePhase.VOTING) {
        const alivePlayers = nextPlayers.filter(p => p.status === PlayerStatus.ALIVE);
        const votes: Record<string, number> = {};
        alivePlayers.forEach(p => {
            let targetId = p.voteTargetId;
            if (!targetId && p.isBot) {
                const possible = alivePlayers.filter(ap => ap.id !== p.id && (p.role !== Role.MAFIA || ap.role !== Role.MAFIA));
                if (possible.length > 0) targetId = possible[Math.floor(Math.random() * possible.length)].id;
            }
            if (targetId) votes[targetId] = (votes[targetId] || 0) + 1;
        });
        let maxVotes = 0, ejectedId: string | null = null, tied = false;
        Object.entries(votes).forEach(([pid, count]) => { if (count > maxVotes) { maxVotes = count; ejectedId = pid; tied = false; } else if (count === maxVotes) tied = true; });
        if (tied) ejectedId = null;
        if (ejectedId) {
            nextPlayers = nextPlayers.map(p => p.id === ejectedId ? { ...p, status: PlayerStatus.EJECTED } : p);
            newLogs.push({ id: `alert-${Date.now()}`, text: `${nextPlayers.find(p => p.id === ejectedId)?.name} was silenced by the protocol.`, type: 'alert', timestamp: Date.now() });
        }
        nextPhase = GamePhase.NIGHT;
        newDayCount++;
      }

      const mafiaAlive = nextPlayers.filter(p => p.role === Role.MAFIA && p.status === PlayerStatus.ALIVE).length;
      const othersAlive = nextPlayers.filter(p => p.role !== Role.MAFIA && p.status === PlayerStatus.ALIVE).length;
      if (mafiaAlive === 0) nextPhase = GamePhase.GAME_OVER;
      else if (mafiaAlive >= othersAlive) nextPhase = GamePhase.GAME_OVER;

      newState = { ...state, game: { ...state.game, phase: nextPhase, players: nextPlayers, logs: newLogs, dayCount: newDayCount, nightActions: { mafiaTargetId: null, doctorTargetId: null, copTargetId: null } } };
      break;
    }
    case 'ADMIN_TOGGLE_PEEKER': 
        newState = { ...state, admin: { ...state.admin, rolePeeker: !state.admin.rolePeeker } };
        break;
    case 'ADMIN_TOGGLE_GOD_MODE': 
        newState = { ...state, admin: { ...state.admin, godMode: !state.admin.godMode } };
        break;
    case 'ADMIN_SMITE': 
        newState = { ...state, game: { ...state.game, players: state.game.players.map(p => p.id === action.payload ? { ...p, status: PlayerStatus.DEAD } : p), logs: [...state.game.logs, { id: `smite-${Date.now()}`, text: `TERMINATED: ${state.game.players.find(p => p.id === action.payload)?.name}`, type: 'alert', timestamp: Date.now() }] } };
        break;
    case 'ADMIN_REVIVE': 
        newState = { ...state, game: { ...state.game, players: state.game.players.map(p => p.id === action.payload ? { ...p, status: PlayerStatus.ALIVE } : p) } };
        break;
    case 'ADMIN_FORCE_VOTE': 
        newState = { ...state, game: { ...state.game, players: state.game.players.map(p => p.id === action.payload.voterId ? { ...p, voteTargetId: action.payload.targetId } : p) } };
        break;
    case 'ADMIN_BLACKOUT': 
        newState = { ...state, admin: { ...state.admin, blackoutTargetId: action.payload } };
        break;
    case 'CAST_VOTE': 
        newState = { ...state, game: { ...state.game, players: state.game.players.map(p => p.id === action.payload.voterId ? { ...p, voteTargetId: action.payload.targetId } : p) } };
        break;
    case 'DEV_COMMAND': {
        if (!state.user?.isDeveloper) return state;
        let nPhase = state.game.phase;
        let nPlayers = [...state.game.players];
        let nLogs = [...state.game.logs];
        if (action.payload.type === 'WIN_MAFIA') {
            nPlayers = nPlayers.map(p => p.role !== Role.MAFIA ? { ...p, status: PlayerStatus.DEAD } : p);
            nPhase = GamePhase.GAME_OVER;
        } else if (action.payload.type === 'WIN_TOWN') {
            nPlayers = nPlayers.map(p => p.role === Role.MAFIA ? { ...p, status: PlayerStatus.DEAD } : p);
            nPhase = GamePhase.GAME_OVER;
        } else if (action.payload.type === 'REVEAL_ALL') {
            newState = { ...state, admin: { ...state.admin, devRevealAll: !state.admin.devRevealAll } };
            break;
        } else if (action.payload.type === 'SKIP_PHASE') {
             nPhase = nPhase === GamePhase.NIGHT ? GamePhase.DAY : nPhase === GamePhase.DAY ? GamePhase.VOTING : GamePhase.NIGHT;
        } else if (action.payload.type === 'KILL_ALL') {
             nPlayers = nPlayers.map(p => p.id !== state.user?.id ? { ...p, status: PlayerStatus.DEAD } : p);
             nLogs.push({ id: `dev-${Date.now()}`, text: `GRID WIPE INITIATED.`, type: 'alert', timestamp: Date.now() });
        } else if (action.payload.type === 'BROADCAST') {
            nLogs.push({ id: `dev-${Date.now()}`, text: `[ARCHITECT]: ${action.payload.text}`, type: 'system', timestamp: Date.now() });
        }
        newState = { ...state, game: { ...state.game, phase: nPhase, players: nPlayers, logs: nLogs } };
        break;
    }
    default: return state;
  }

  // Save to persistence on critical updates
  if (newState.profiles !== state.profiles || newState.user !== state.user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      user: newState.user,
      profiles: newState.profiles
    }));
  }
  return newState;
};

interface GameContextProps { state: AppState; dispatch: React.Dispatch<Action>; }
const GameContext = createContext<GameContextProps | undefined>(undefined);
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
};
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame error");
  return context;
};
export const BOT_QUOTES_LIST = BOT_QUOTES;
