
export enum GameStatus {
  PLAYING = 'playing',
  WON = 'won',
  LOST = 'lost'
}

export interface Message {
  id: string;
  sender: 'user' | 'zeze';
  text: string;
}

export interface GameState {
  patience: number; // 0 to 100
  currentPrice: number;
  status: GameStatus;
  messages: Message[];
  turnCount: number;
}

export interface GeminiResponse {
  text: string;
  patienceChange: number; // How much patience changed this turn
  newPrice: number;
  gameStatus: GameStatus;
}

export interface GameStatistics {
  gamesPlayed: number;
  wins: number;
  losses: number;
  totalTurns: number;
  bestDeal: number | null; // Lowest price bought (Won)
  lowestPriceSeen: number; // Lowest price ever offered by Zézé
}
