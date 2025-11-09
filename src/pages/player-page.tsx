
import React, { useEffect, useState, useMemo } from 'react';
import type { BingoCardData, BingoNumber } from '../types';
import { CheckCircleIcon, TrophyIcon, TicketIcon } from '../components/icons';
import { useGame } from '@/context/GameContext';

const BingoCard: React.FC<{ card: BingoCardData; lastDrawnNumber: number | null; isRevealed: boolean }> = ({ card, lastDrawnNumber, isRevealed }) => {
    const headers = ['B', 'I', 'N', 'G', 'O'].slice(0, card.grid.length);

    const displayGrid = card.grid;

    return (
        <div className="bg-slate-800/50 border border-slate-700 p-3 rounded-2xl shadow-lg aspect-square">
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${card.grid.length}, 1fr)`}}>
                 {headers.map(header => (
                    <div key={header} className="flex items-center justify-center text-2xl md:text-3xl font-display text-purple-300 pb-2">
                        {header}
                    </div>
                 ))}
            </div>
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${displayGrid.length}, 1fr)`}}>
                {displayGrid.flat().map((cell, index) => (
                    <div key={index} className={`relative flex items-center justify-center rounded-lg aspect-square transition-all duration-300 ${isRevealed && (cell === null || cell.marked) ? 'bg-purple-600' : 'bg-slate-700'}`}>
                        {cell === null ? (
                            <span className="text-xs font-bold text-yellow-300">LIVRE</span>
                        ) : !isRevealed ? (
                            <TicketIcon className="w-8 h-8 text-slate-500" />
                        ) : (
                            <span className={`text-xl md:text-2xl font-bold transition-opacity ${cell.marked ? 'opacity-50' : 'opacity-100'}`}>
                                {cell.value}
                            </span>
                        )}
                        {isRevealed && cell?.marked && (
                             <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-4/5 h-4/5 rounded-full bg-purple-400/80 transform scale-100"></div>
                            </div>
                        )}
                        {isRevealed && cell?.value === lastDrawnNumber && (
                           <span className="absolute -top-1 -right-1 flex h-4 w-4">
                               <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                               <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-500"></span>
                           </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const DrawnNumbersDisplay: React.FC = () => {
    const { state } = useGame();
    const { lastDrawnNumber } = state;

    return (
        <div className="text-center p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
            <p className="text-slate-400 text-sm">Último Número Sorteado</p>
            {lastDrawnNumber ? (
                <p className="text-6xl font-display text-yellow-300">{lastDrawnNumber}</p>
            ) : (
                <p className="text-6xl font-display text-slate-600">-</p>
            )}
        </div>
    );
};

const PlayerStats: React.FC<{ card: BingoCardData }> = ({ card }) => {
    const unmarkedCount = useMemo(() => {
        return card.grid.flat().filter(cell => cell && !cell.marked).length;
    }, [card.grid]);

    const { completedLines } = card;
    const quinaCount = completedLines.horizontal + completedLines.vertical + completedLines.diagonal;


    if (card.hasBingo) {
        return (
            <div className="p-4 bg-yellow-500/20 border-2 border-yellow-500 rounded-xl text-center animate-pulse-fast">
                <p className="text-2xl font-bold text-yellow-300">BINGO!</p>
                <p className="text-slate-300">Você completou sua cartela! Parabéns!</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                <p className="text-3xl font-bold text-purple-300">{unmarkedCount}</p>
                <p className="text-sm text-slate-400">Pedra{unmarkedCount !== 1 ? 's' : ''} Restante{unmarkedCount !== 1 ? 's' : ''}</p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                <p className="text-3xl font-bold text-purple-300">{quinaCount}</p>
                <p className="text-sm text-slate-400">Quina{quinaCount !== 1 ? 's' : ''} Feita{quinaCount !== 1 ? 's' : ''}</p>
                 {quinaCount > 0 && (
                    <p className="text-xs text-slate-500 font-mono mt-1 tracking-tighter">
                        H:{completedLines.horizontal} | V:{completedLines.vertical} | D:{completedLines.diagonal}
                    </p>
                )}
            </div>
        </div>
    );
};


const PlayerPage: React.FC<{ cardId: string }> = ({ cardId }) => {
    const { state, dispatch, getCardById } = useGame();
    const [playerName, setPlayerName] = useState('');
    const [showWinnerModal, setShowWinnerModal] = useState<'Quina' | 'Bingo' | null>(null);
    const [lastNotifiedWinTimestamp, setLastNotifiedWinTimestamp] = useState<number | null>(null);
    
    const cardIdNum = parseInt(cardId, 10);
    const card = useMemo(() => getCardById(cardIdNum), [cardIdNum, getCardById]);

    useEffect(() => {
        if (!card || !card.isClaimed) return;

        const myWins = state.winners.filter(w => w.cardId === cardIdNum);
        if (myWins.length === 0) return;

        const latestWin = myWins.reduce((latest, current) => current.timestamp > latest.timestamp ? current : latest, myWins[0]);
        
        if (latestWin.timestamp > (lastNotifiedWinTimestamp || 0)) {
            setTimeout(() => {
                setShowWinnerModal(latestWin.type);
                setLastNotifiedWinTimestamp(latestWin.timestamp);
            }, 500);
        }
    }, [state.winners, card, cardIdNum, lastNotifiedWinTimestamp]);


    if (!card) {
        return <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-red-500">Cartela não Encontrada</h2>
            <p className="text-slate-400 mt-2">O ID da cartela de bingo é inválido ou o jogo foi reiniciado.</p>
            <a href="#" onClick={() => window.location.hash = ''} className="mt-6 inline-block bg-purple-600 px-6 py-2 rounded-lg font-semibold">Ir para a Página Inicial</a>
        </div>;
    }

    const handleClaimCard = () => {
        if (playerName.trim()) {
            dispatch({ type: 'CLAIM_CARD', payload: { cardId: cardIdNum, playerName: playerName.trim() } });
        } else {
            alert('Por favor, digite seu nome.');
        }
    };
    
    const handleCloseModal = () => {
        setShowWinnerModal(null);
    }

    return (
        <div className="max-w-md mx-auto space-y-4">
            {showWinnerModal && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
                    <div className="bg-linear-to-br from-purple-800 to-indigo-900 p-8 rounded-2xl text-center border-2 border-yellow-400 shadow-2xl shadow-yellow-500/20" onClick={(e) => e.stopPropagation()}>
                        <TrophyIcon className="w-24 h-24 text-yellow-300 mx-auto animate-pulse-fast"/>
                        <h2 className="text-6xl font-display text-yellow-300 mt-4">{showWinnerModal.toUpperCase()}!</h2>
                        <p className="text-slate-200 mt-2">Parabéns, você ganhou!</p>
                        <button onClick={handleCloseModal} className="mt-6 bg-yellow-500 text-slate-900 font-bold px-6 py-2 rounded-lg">
                            Incrível!
                        </button>
                    </div>
                </div>
            )}

            {!card.isClaimed ? (
                state.isGameFinished ? (
                    <div className="p-6 bg-slate-800/50 rounded-2xl text-center border border-slate-700">
                        <h2 className="text-xl font-bold text-red-500">Jogo Encerrado</h2>
                        <p className="text-slate-400 mt-2">Este jogo já foi finalizado e não é mais possível adquirir novas cartelas.</p>
                    </div>
                ) : (
                    <div className="p-6 bg-slate-800/50 rounded-2xl text-center border border-slate-700">
                        <h2 className="text-2xl font-bold mb-2">Adquira sua Cartela de Bingo</h2>
                        <p className="text-slate-400 mb-4">Digite seu nome para entrar no jogo.</p>
                        <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="Seu Nome"
                            className="w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 mb-4"
                        />
                        <button onClick={handleClaimCard} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors">
                            Adquirir Cartela & Revelar
                        </button>
                    </div>
                )
            ) : (
                <>
                    <div className="flex items-center justify-center gap-3 p-3 bg-green-900/50 rounded-xl text-green-300">
                        <CheckCircleIcon className="w-6 h-6"/>
                        <p>Bem-vindo, <span className="font-bold">{card.playerName}</span>! Cartela adquirida. Boa sorte!</p>
                    </div>
                    <PlayerStats card={card} />
                    <DrawnNumbersDisplay />
                </>
            )}
            
            <BingoCard card={card} lastDrawnNumber={state.lastDrawnNumber} isRevealed={card.isClaimed} />
        </div>
    );
};

export default PlayerPage;