// src/context/GameContext.tsx
import React, { createContext, useState, useContext, type ReactNode, useCallback, useEffect, useRef } from 'react';
import type { GameState, BingoCardData, User } from '../types';

// --- Configuração do Backend ---
const API_URL = 'https://bingo-party-backend.onrender.com';
const WS_URL = 'wss://bingo-party-backend.onrender.com';
// const API_URL = 'http://localhost:8080';
// const WS_URL = 'ws://localhost:8080';
// ------------------------------
type WebSocketAction =
    | { type: 'DRAW_NUMBER' }
    | { type: 'CLAIM_CARD'; payload: { cardId: number; playerName: string } }
    | { type: 'RESET_GAME' };

const BINGO_USER_KEY = 'bingoUser';

// Estado inicial vazio, será preenchido pelo WebSocket
const initialState: GameState = {
    gameId: null,
    isGameStarted: false,
    isGameFinished: false,
    cardSize: 5,
    allCards: [],
    drawnNumbers: [],
    availableNumbers: [],
    winners: [],
    lastDrawnNumber: null,
};

const GameContext = createContext<{
    state: GameState;
    user: User | null;
    isConnected: boolean; // Novo: para saber se o WS está conectado
    dispatch: (action: WebSocketAction) => void;
    createGame: (payload: { cardSize: number; numCards: number }) => Promise<GameState>; // Nova: para a API
    login: (user: User) => void;
    logout: () => void;
    getCardById: (id: number) => BingoCardData | undefined;
}>({
    state: initialState,
    user: null,
    isConnected: false,
    dispatch: () => null,
    createGame: () => Promise.reject(new Error('GameProvider not mounted')),
    login: () => null,
    logout: () => null,
    getCardById: () => undefined,
});

export const GameProvider: React.FC<{ children: ReactNode; gameIdFromUrl?: string }> = ({ children, gameIdFromUrl }) => {
    const [state, setState] = useState<GameState>(initialState);
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);

    const [user, setUser] = useState<User | null>(() => {
        try {
            const storedUser = localStorage.getItem(BINGO_USER_KEY);
            return storedUser ? JSON.parse(storedUser) : null;
        } catch {
            return null;
        }
    });

    useEffect(() => {
        // Se não houver gameId na URL, não faz nada.
        if (!gameIdFromUrl) {
            setState(initialState); // Reseta o estado se sairmos de uma sala
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
            return;
        }

        // Evita reconexões múltiplas
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            // Se o gameId mudou, fecha a conexão antiga
            if (!wsRef.current.url.endsWith(gameIdFromUrl)) {
                wsRef.current.close();
            } else {
                return; // Já conectado à sala correta
            }
        }

        console.log(`[WS] Conectando à sala: ${gameIdFromUrl}...`);
        const ws = new WebSocket(`${WS_URL}/ws/${gameIdFromUrl}`);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('[WS] Conectado ao servidor Bingo.');
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            // O servidor *sempre* envia o GameState completo
            const newGameState = JSON.parse(event.data);
            setState(newGameState);
        };

        ws.onclose = () => {
            console.log('[WS] Desconectado do servidor Bingo.');
            setIsConnected(false);
        };

        ws.onerror = (error) => {
            console.error('[WS] Erro:', error);
            setIsConnected(false);
        };

        // Função de limpeza: fecha o WebSocket quando o componente desmonta
        return () => {
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                console.log('[WS] Fechando conexão.');
                ws.close();
            }
            wsRef.current = null;
            setIsConnected(false);
        };
    }, [gameIdFromUrl]); // Depende do gameId da URL

    /**
     * Envia ações para o servidor WebSocket.
     * Note: 'SETUP_GAME' não é mais uma ação de dispatch, é uma chamada de API.
     */
    const dispatch = (action: WebSocketAction) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(action));
        } else {
            console.error('[WS] Não conectado. Ação não enviada:', action);
        }
    };

    /**
     * Nova função para criar um jogo via API REST.
     * Isso substitui a ação 'SETUP_GAME'.
     */
    const createGame = async (payload: { cardSize: number; numCards: number }): Promise<GameState> => {
        try {
            const response = await fetch(`${API_URL}/api/create-game`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Falha ao criar o jogo');
            }
            const newGameState: GameState = await response.json();

            // Não precisamos definir o estado aqui,
            // o redirecionamento fará o useEffect conectar-se ao WS
            // e o WS enviará o estado.

            return newGameState;
        } catch (error) {
            console.error('Erro ao criar o jogo:', error);
            throw error;
        }
    };

    const login = (userData: User) => {
        localStorage.setItem(BINGO_USER_KEY, JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem(BINGO_USER_KEY);
        setUser(null);
    };

    const getCardById = useCallback((id: number) => {
        return state.allCards.find(card => card.id === id);
    }, [state.allCards]);

    return (
        <GameContext.Provider
            value={{
                state,
                user,
                isConnected,
                dispatch,
                createGame,
                login,
                logout,
                getCardById
            }}
        >
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);