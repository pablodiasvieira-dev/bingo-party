// import type { GameState, GameAction, Winner } from '../types';
// import { generateBingoCard, checkWins } from '@/utils/bindoUtils';

// const initialState: GameState = {
//     gameId: null,
//     isGameStarted: false,
//     isGameFinished: false,
//     cardSize: 5,
//     allCards: [],
//     drawnNumbers: [],
//     availableNumbers: [],
//     winners: [],
//     lastDrawnNumber: null,
// };

// // A lógica do reducer foi movida do contexto para este serviço central
// const gameReducer = (state: GameState, action: GameAction): GameState => {
//     switch (action.type) {
//         case 'SETUP_GAME': {
//             const { cardSize, numCards } = action.payload;
//             const maxNumber = cardSize * 15;
//             const availableNumbers = Array.from({ length: maxNumber }, (_, i) => i + 1);
//             const allCards = Array.from({ length: numCards }, (_, i) => generateBingoCard(i + 1, cardSize));
//             const gameId = Math.random().toString(36).substring(2, 8);
//             return {
//                 ...initialState,
//                 gameId,
//                 isGameStarted: true,
//                 cardSize,
//                 availableNumbers,
//                 allCards,
//             };
//         }
//         case 'DRAW_NUMBER': {
//             if (state.availableNumbers.length === 0 || state.isGameFinished) return state;

//             const randomIndex = Math.floor(Math.random() * state.availableNumbers.length);
//             const newNumber = state.availableNumbers[randomIndex];
            
//             const drawnNumbers = [...state.drawnNumbers, newNumber];
//             const availableNumbers = state.availableNumbers.filter(n => n !== newNumber);
//             const currentRound = drawnNumbers.length;

//             const updatedCards = state.allCards.map(card => {
//                 const newGrid = card.grid.map(row => 
//                     row.map(cell => 
//                         cell && cell.value === newNumber ? { ...cell, marked: true } : cell
//                     )
//                 );
//                 return { ...card, grid: newGrid };
//             });

//             const newWinners: Winner[] = [];
//             updatedCards.forEach(card => {
//                 if (card.isClaimed && !card.hasBingo) {
//                     const previousTotalLines = card.completedLines.horizontal + card.completedLines.vertical + card.completedLines.diagonal;
//                     const { lines: newLines, isBingo } = checkWins(card.grid);
//                     const newTotalLines = newLines.horizontal + newLines.vertical + newLines.diagonal;

//                     // Primeiro, verifica novas Quinas
//                     if (newTotalLines > previousTotalLines) {
//                         const newQuinasCount = newTotalLines - previousTotalLines;
//                         for (let i = 0; i < newQuinasCount; i++) {
//                             newWinners.push({ type: 'Quina', cardId: card.id, playerName: card.playerName, timestamp: Date.now() + i, round: currentRound });
//                         }
//                     }
//                     card.completedLines = newLines;

//                     // Depois, verifica o Bingo
//                     if (isBingo) {
//                         card.hasBingo = true;
//                         newWinners.push({ type: 'Bingo', cardId: card.id, playerName: card.playerName, timestamp: Date.now(), round: currentRound });
//                     }
//                 }
//             });
            
//             const allWinners = [...state.winners, ...newWinners].sort((a,b) => a.timestamp - b.timestamp);
//             const gameFinished = allWinners.some(w => w.type === 'Bingo');

//             return {
//                 ...state,
//                 drawnNumbers,
//                 availableNumbers,
//                 allCards: updatedCards,
//                 lastDrawnNumber: newNumber,
//                 winners: allWinners,
//                 isGameFinished: gameFinished,
//             };
//         }
//         case 'CLAIM_CARD': {
//             return {
//                 ...state,
//                 allCards: state.allCards.map(card =>
//                     card.id === action.payload.cardId ? { ...card, isClaimed: true, playerName: action.payload.playerName } : card
//                 ),
//             };
//         }
//         case 'RESET_GAME':
//             return initialState;
//         default:
//             return state;
//     }
// };

// class MockWebSocketServer {
//     private state: GameState;
//     private listeners: Set<(state: GameState) => void> = new Set();
//     private readonly storageKey = 'bingoGameState_ws';

//     constructor() {
//         // Tenta carregar o estado do localStorage para persistir entre atualizações
//         try {
//             const storedState = localStorage.getItem(this.storageKey);
//             this.state = storedState ? JSON.parse(storedState) : initialState;
//         } catch (error) {
//             console.error("Não foi possível analisar o estado do jogo armazenado para WebSocket", error);
//             this.state = initialState;
//         }
//     }
    
//     private broadcast() {
//         // Persiste o estado em cada alteração, simulando um banco de dados
//         localStorage.setItem(this.storageKey, JSON.stringify(this.state));
//         this.listeners.forEach(listener => listener(this.state));
//     }

//     subscribe(callback: (state: GameState) => void): () => void {
//         this.listeners.add(callback);
//         callback(this.state); // Envia imediatamente o estado atual para o novo assinante
//         return () => this.unsubscribe(callback);
//     }

//     unsubscribe(callback: (state: GameState) => void) {
//         this.listeners.delete(callback);
//     }

//     dispatch(action: GameAction) {
//         this.state = gameReducer(this.state, action);
//         this.broadcast();
//     }
    
//     getState(): GameState {
//         return this.state;
//     }
// }

// // Instância única (Singleton) do servidor
// export const mockWebSocketServer = new MockWebSocketServer();