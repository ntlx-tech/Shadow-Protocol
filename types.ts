
export enum Role {
  VILLAGER = 'CITIZEN',
  MAFIA = 'MAFIA',
  DOCTOR = 'DOCTOR',
  COP = 'DETECTIVE',
}

export enum GamePhase {
  MENU = 'MENU',
  LOBBY = 'LOBBY',
  REVEAL = 'REVEAL',
  NIGHT = 'NIGHT',
  DAY = 'DAY',
  VOTING = 'VOTING',
  GAME_OVER = 'GAME_OVER',
}

export enum PlayerStatus {
  ALIVE = 'ALIVE',
  DEAD = 'DEAD',
  EJECTED = 'EJECTED',
}

export interface UserProfile {
    id: string;
    username: string;
    password?: string;
    bio: string;
    avatarUrl: string;
    bannerUrl: string;
    badges: string[];
    isAdmin: boolean;
    isDeveloper: boolean;
    wins: number;
    matches: number;
}

export interface Player {
  id: string;
  name: string;
  role: Role;
  status: PlayerStatus;
  isBot: boolean;
  avatarUrl: string;
  voteTargetId?: string | null;
  forcedRole?: Role | null;
  profile?: UserProfile;
}

export interface LogEntry {
  id: string;
  text: string;
  type: 'system' | 'chat' | 'alert' | 'ghost';
  sender?: string;
  timestamp: number;
}

export interface GameState {
  lobbyCode: string | null;
  phase: GamePhase;
  dayCount: number;
  players: Player[];
  logs: LogEntry[];
  config: {
    mafiaCount: number;
    doctorCount: number;
    copCount: number;
  };
  nightActions: {
    mafiaTargetId: string | null;
    doctorTargetId: string | null;
    copTargetId: string | null;
  };
}
