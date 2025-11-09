export interface User {
  name: string;
  email: string;
  picture: string;
}

export interface BingoNumber {
  value: number;
  marked: boolean;
}

export interface CompletedLines {
    horizontal: number;
    vertical: number;
    diagonal: number;
}

export interface BingoCardData {
  id: number;
  grid: (BingoNumber | null)[][];
  isClaimed: boolean;
  completedLines: CompletedLines;
  hasBingo: boolean;
  playerName?: string;
}

export type Winner = {
    type: 'Quina' | 'Bingo';
    cardId: number;
    playerName?: string;
    timestamp: number;
    round: number;
};

export interface GameState {
  gameId: string | null;
  isGameStarted: boolean;
  isGameFinished: boolean;
  cardSize: number;
  allCards: BingoCardData[];
  drawnNumbers: number[];
  availableNumbers: number[];
  winners: Winner[];
  lastDrawnNumber: number | null;
}

export type GameAction =
  | { type: 'SETUP_GAME'; payload: { cardSize: number; numCards: number } }
  | { type: 'DRAW_NUMBER' }
  | { type: 'CLAIM_CARD'; payload: { cardId: number; playerName: string } }
  | { type: 'RESET_GAME' };