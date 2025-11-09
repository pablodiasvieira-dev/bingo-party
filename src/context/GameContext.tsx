import React, { createContext, useState, useContext, type ReactNode, useCallback, useEffect } from 'react';
import type { GameState, GameAction, BingoCardData, User } from '../types';
import { mockWebSocketServer } from '../services/mockWebSocket';

const BINGO_USER_KEY = 'bingoUser';

const GameContext = createContext<{
    state: GameState;
    user: User | null;
    dispatch: (action: GameAction) => void;
    login: (user: User) => void;
    logout: () => void;
    getCardById: (id: number) => BingoCardData | undefined;
}>({
    state: {
        gameId: null,
        isGameStarted: false,
        isGameFinished: false,
        cardSize: 5,
        allCards: [],
        drawnNumbers: [],
        availableNumbers: [],
        winners: [],
        lastDrawnNumber: null,
    },
    user: null,
    dispatch: () => null,
    login: () => null,
    logout: () => null,
    getCardById: () => undefined,
});

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<GameState>(mockWebSocketServer.getState());
    const [user, setUser] = useState<User | null>(() => {
        try {
            const storedUser = localStorage.getItem(BINGO_USER_KEY);
            return storedUser ? JSON.parse(storedUser) : null;
        } catch {
            return null;
        }
    });

    useEffect(() => {
        // Inscreve-se no servidor WebSocket simulado para atualizações de estado do jogo
        const unsubscribe = mockWebSocketServer.subscribe(setState);
        return () => unsubscribe();
    }, []);

    const dispatch = (action: GameAction) => {
        mockWebSocketServer.dispatch(action);
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
        <GameContext.Provider value={{ state, user, dispatch, login, logout, getCardById }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);