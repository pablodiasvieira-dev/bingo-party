import React, { useState, useMemo, useEffect } from 'react';
import { TicketIcon, UsersIcon, TrophyIcon, RefreshCwIcon, GoogleIcon } from '../components/icons';
import type { BingoCardData, Winner } from '../types';
import { useGame } from '@/context/GameContext';

const LoginPage: React.FC = () => {
    const { login } = useGame();

    const handleGoogleLogin = () => {
        // Simulação de um login bem-sucedido com o Google.
        // Em um app real, aqui se iniciaria o fluxo OAuth.
        const mockUser = {
            name: 'Usuário Admin',
            email: 'admin@bingo.com',
            picture: `https://api.dicebear.com/8.x/initials/svg?seed=Admin`,
        };
        login(mockUser);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
            <h1 className="text-4xl font-bold mb-2">Área do Administrador</h1>
            <p className="text-slate-400 mb-8">Por favor, faça login para criar e gerenciar seus jogos de bingo.</p>
            <button
                onClick={handleGoogleLogin}
                className="inline-flex items-center gap-4 px-6 py-3 bg-white text-slate-800 font-semibold rounded-lg hover:bg-slate-200 transition-colors transform hover:scale-105 shadow-lg"
            >
                <GoogleIcon className="w-6 h-6" />
                Entrar com Google
            </button>
        </div>
    );
};


const GameSetup: React.FC = () => {
    const { dispatch } = useGame();
    const [cardSize, setCardSize] = useState(5);
    const [numCards, setNumCards] = useState(10);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({ type: 'SETUP_GAME', payload: { cardSize, numCards } });
    };

    return (
        <div className="bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-700">
            <h2 className="text-2xl font-bold mb-4 text-center text-purple-300">Novo Jogo de Bingo</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="cardSize" className="block text-sm font-medium text-slate-300">Tamanho da Cartela</label>
                    <select
                        id="cardSize"
                        value={cardSize}
                        onChange={(e) => setCardSize(Number(e.target.value))}
                        className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    >
                        <option value="4">4x4</option>
                        <option value="5">5x5 (Padrão)</option>
                        <option value="6">6x6</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="numCards" className="block text-sm font-medium text-slate-300">Número de Cartelas para Gerar</label>
                    <input
                        type="number"
                        id="numCards"
                        value={numCards}
                        onChange={(e) => setNumCards(Math.max(1, Number(e.target.value)))}
                        min="1"
                        max="200"
                        className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-transform transform hover:scale-105 shadow-md shadow-purple-500/30"
                >
                    Iniciar Jogo
                </button>
            </form>
        </div>
    );
};

const PlayerCardLink: React.FC<{ card: BingoCardData }> = ({ card }) => {
    const { state } = useGame();
    const [copied, setCopied] = useState(false);
    const url = `${window.location.origin}${window.location.pathname}#/player/${state.gameId}/${card.id}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
            <div className="flex items-center gap-3">
                <TicketIcon className={`w-5 h-5 ${card.isClaimed ? 'text-green-400' : 'text-slate-400'}`} />
                <span className="font-mono text-sm">{card.isClaimed ? card.playerName : `Cartela #${card.id}`}</span>
                {card.isClaimed && <span className="text-xs text-green-400 bg-green-900/50 px-2 py-0.5 rounded-full">Adquirida</span>}
            </div>
            <button
                onClick={handleCopy}
                className="px-3 py-1 text-xs font-semibold bg-slate-600 hover:bg-purple-600 rounded-md transition-colors"
            >
                {copied ? 'Copiado!' : 'Copiar Link'}
            </button>
        </div>
    );
};

const BingoCage: React.FC = () => {
    const { state, dispatch } = useGame();
    const { lastDrawnNumber, availableNumbers, drawnNumbers, isGameFinished } = state;
    const currentRound = drawnNumbers.length;

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-slate-800/50 rounded-2xl shadow-lg border border-slate-700 text-center">
            <div className="w-full flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-purple-300">Globo de Bingo</h3>
                <span className="text-sm font-semibold bg-slate-700 px-3 py-1 rounded-full">Rodada: {currentRound}</span>
            </div>
            <p className="text-sm text-slate-400 mb-4">{availableNumbers.length} bolas restantes</p>
            <div className="relative w-32 h-32 md:w-40 md:h-40 bg-slate-900 rounded-full flex items-center justify-center my-4 shadow-inner">
                <div className="absolute w-full h-full border-4 border-slate-700 rounded-full animate-spin [animation-duration:10s]"></div>
                <div className="absolute w-full h-full border-4 border-dashed border-slate-600 rounded-full animate-spin [animation-duration:15s] [animation-direction:reverse]"></div>
                {lastDrawnNumber ? (
                    <span className="text-6xl md:text-7xl font-display text-yellow-300 z-10">{lastDrawnNumber}</span>
                ) : (
                    <span className="text-2xl text-slate-500 z-10">?</span>
                )}
            </div>
            <button
                onClick={() => dispatch({ type: 'DRAW_NUMBER' })}
                disabled={isGameFinished || availableNumbers.length === 0}
                className="w-full bg-yellow-500 text-slate-900 font-bold py-3 px-4 rounded-lg hover:bg-yellow-600 transition-transform transform hover:scale-105 shadow-md shadow-yellow-500/30 disabled:bg-slate-600 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
            >
                {isGameFinished ? 'Fim de Jogo!' : 'Sortear Número'}
            </button>
        </div>
    );
};

const NumbersPanel: React.FC = () => {
    const { state } = useGame();
    const { drawnNumbers, cardSize } = state;
    const drawnSet = new Set(drawnNumbers);

    const headers = ['B', 'I', 'N', 'G', 'O', '...'].slice(0, cardSize);
    const numbersPerColumn = 15;
    const maxNumber = cardSize * numbersPerColumn;

    // Layout para telas móveis: BINGO como colunas verticais
    const MobileLayout = () => {
        const gridColsClass = {
            4: 'grid-cols-4',
            5: 'grid-cols-5',
            6: 'grid-cols-6',
        }[cardSize] || 'grid-cols-5';

        return (
            <div className={`grid ${gridColsClass} gap-2`}>
                {headers.map((letter, colIndex) => {
                    const min = colIndex * numbersPerColumn + 1;
                    const max = (colIndex + 1) * numbersPerColumn;
                    const columnNumbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

                    return (
                        <div key={letter} className="flex flex-col items-center gap-2">
                            <div className="flex items-center justify-center text-2xl font-display text-purple-300 h-8">
                                {letter}
                            </div>
                            <div className="space-y-1.5 w-full">
                                {columnNumbers.map(num => {
                                    const isDrawn = drawnSet.has(num);
                                    return (
                                        <div
                                            key={num}
                                            className={`flex items-center justify-center w-full aspect-square text-sm font-bold rounded-full transition-colors duration-300 ${isDrawn
                                                    ? 'bg-yellow-500 text-slate-900 shadow-sm shadow-yellow-400/50'
                                                    : 'bg-slate-700 text-slate-400'
                                                }`}
                                        >
                                            {num}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    // Layout para telas maiores: BINGO como linhas horizontais
    const DesktopLayout = () => {
        return (
            <div className="inline-flex flex-col gap-3">
                {headers.map((letter, colIndex) => {
                    const min = colIndex * numbersPerColumn + 1;
                    const max = (colIndex + 1) * numbersPerColumn;
                    const columnNumbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

                    return (
                        <div key={letter} className="flex items-center gap-4">
                            <div className="w-10 shrink-0 text-center font-display text-3xl text-purple-300">
                                {letter}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {columnNumbers.map(num => {
                                    const isDrawn = drawnSet.has(num);
                                    return (
                                        <div
                                            key={num}
                                            className={`flex items-center justify-center w-10 h-10 text-base font-bold rounded-full transition-colors duration-300 ${isDrawn
                                                    ? 'bg-yellow-500 text-slate-900 shadow-md shadow-yellow-400/50'
                                                    : 'bg-slate-700 text-slate-400'
                                                }`}
                                        >
                                            {num}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="p-4 bg-slate-800/50 rounded-xl shadow-lg border border-slate-700">
            <h3 className="text-lg font-bold text-purple-300 mb-3 text-center">Painel de Números ({drawnNumbers.length}/{maxNumber})</h3>

            <div className="md:hidden">
                <MobileLayout />
            </div>

            <div className="hidden md:flex md:justify-center">
                <DesktopLayout />
            </div>
        </div>
    );
}

const GameStatusTabs: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'winners' | 'round' | 'overview'>('winners');
    const { state } = useGame();
    const { winners, drawnNumbers, allCards } = state;

    const winnerSortLogic = (a: Winner, b: Winner) => {
        if (a.type === 'Bingo' && b.type !== 'Bingo') return -1;
        if (b.type === 'Bingo' && a.type !== 'Bingo') return 1;
        if (a.round !== b.round) return a.round - b.round;
        return a.timestamp - b.timestamp;
    };

    const sortedWinners = [...winners].sort(winnerSortLogic);

    const winnersThisRound = winners
        .filter(w => w.round === drawnNumbers.length && drawnNumbers.length > 0)
        .sort(winnerSortLogic);


    const gameOverviewStats = useMemo(() => {
        const stats: { [key: number]: number } = {};
        allCards
            .filter(card => card.isClaimed && !card.hasBingo)
            .forEach(card => {
                const unmarkedCount = card.grid.flat().filter(cell => cell && !cell.marked).length;
                if (unmarkedCount > 0) {
                    stats[unmarkedCount] = (stats[unmarkedCount] || 0) + 1;
                }
            });
        return Object.entries(stats).map(([key, value]) => ({
            numbersLeft: parseInt(key),
            playerCount: value
        })).sort((a, b) => a.numbersLeft - b.numbersLeft);
    }, [allCards, drawnNumbers]);

    const renderWinnerCard = (winner: Winner) => (
        <div key={`${winner.cardId}-${winner.type}-${winner.timestamp}`} className={`p-3 rounded-lg flex items-center gap-3 ${winner.type === 'Bingo' ? 'bg-yellow-500/20 border border-yellow-500' : 'bg-purple-500/20'}`}>
            <TrophyIcon className={`w-6 h-6 ${winner.type === 'Bingo' ? 'text-yellow-400' : 'text-purple-400'}`} />
            <div>
                <p className={`font-bold ${winner.type === 'Bingo' ? 'text-yellow-300' : 'text-purple-300'}`}>
                    {winner.type.toUpperCase()}!
                    {winner.type === 'Quina' && <span className="text-xs font-normal text-slate-400 ml-2">(Rodada {winner.round})</span>}
                </p>
                <p className="text-sm text-slate-300">{winner.playerName || `Cartela #${winner.cardId}`}</p>
            </div>
        </div>
    );

    return (
        <div className="p-4 bg-slate-800/50 rounded-xl shadow-lg border border-slate-700">
            <div className="flex border-b border-slate-700 mb-4">
                <button onClick={() => setActiveTab('winners')} className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'winners' ? 'text-purple-300 border-b-2 border-purple-400' : 'text-slate-400 hover:text-white'}`}>Vencedores do Jogo</button>
                <button onClick={() => setActiveTab('round')} className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'round' ? 'text-purple-300 border-b-2 border-purple-400' : 'text-slate-400 hover:text-white'}`}>Vencedores na Rodada</button>
                <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'overview' ? 'text-purple-300 border-b-2 border-purple-400' : 'text-slate-400 hover:text-white'}`}>Visão do Jogo</button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {activeTab === 'winners' && (
                    sortedWinners.length === 0
                        ? <p className="text-center text-sm text-slate-400">Nenhum vencedor ainda...</p>
                        : sortedWinners.map(renderWinnerCard)
                )}
                {activeTab === 'round' && (
                    winnersThisRound.length === 0
                        ? <p className="text-center text-sm text-slate-400">Nenhum vencedor nesta rodada.</p>
                        : winnersThisRound.map(renderWinnerCard)
                )}
                {activeTab === 'overview' && (
                    gameOverviewStats.length === 0
                        ? <p className="text-center text-sm text-slate-400">Nenhuma cartela ativa para exibir estatísticas.</p>
                        : gameOverviewStats.map(stat => (
                            <div key={stat.numbersLeft} className="flex justify-between items-center p-2 bg-slate-700/50 rounded-md">
                                <span className="text-slate-300">{stat.playerCount} jogador{stat.playerCount > 1 ? 'es' : ''}</span>
                                <span className="font-semibold text-purple-300">por {stat.numbersLeft} pedra{stat.numbersLeft > 1 ? 's' : ''}</span>
                            </div>
                        ))
                )}
            </div>
        </div>
    );
}


const AdminDashboard: React.FC = () => {
    const { state, user, dispatch } = useGame();
    const { allCards } = state;

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold">Painel do Administrador</h1>
                <p className="text-slate-400">Bem-vindo, {user?.name}! Gerencie seu jogo abaixo.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <BingoCage />
                    <GameStatusTabs />
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <NumbersPanel />
                    <div className="p-4 bg-slate-800/50 rounded-xl shadow-lg border border-slate-700">
                        <h3 className="flex items-center justify-center gap-2 text-lg font-bold text-purple-300 mb-3"><UsersIcon className="w-5 h-5" /> Cartelas dos Jogadores ({allCards.length})</h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                            {allCards.map(card => <PlayerCardLink key={card.id} card={card} />)}
                        </div>
                    </div>
                </div>
            </div>
            <div className="text-center mt-6">
                <button
                    onClick={() => { if (window.confirm('Você tem certeza que deseja reiniciar o jogo?')) dispatch({ type: 'RESET_GAME' }) }}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-red-600 text-white font-semibold text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                    <RefreshCwIcon className="w-4 h-4" />
                    Reiniciar Jogo
                </button>
            </div>
        </div>
    );
};

const AdminPage: React.FC = () => {
    const { state, user } = useGame();

    useEffect(() => {
        const currentHash = window.location.hash;

        // Este efeito só deve gerenciar rotas de administração para evitar redirecionamentos indesejados.
        if (!currentHash.startsWith('#/manage')) {
            return;
        }

        // Redireciona para a URL do jogo com ID se um jogo estiver ativo e a URL não corresponder.
        if (state.isGameStarted && state.gameId) {
            const expectedHash = `#/manage/${state.gameId}`;
            if (currentHash !== expectedHash) {
                window.location.hash = expectedHash;
            }
        }
        // Redireciona para a página de setup se o jogo for resetado e ainda estivermos em uma URL de jogo.
        else if (!state.isGameStarted && currentHash.startsWith('#/manage/')) {
            window.location.hash = '#/manage';
        }
    }, [state.isGameStarted, state.gameId]);

    if (!user) {
        return <LoginPage />;
    }

    return (
        <div>
            {state.isGameStarted ? <AdminDashboard /> : <GameSetup />}
        </div>
    );
};

export default AdminPage;