// src/App.tsx
import React, { useState, useEffect, useMemo } from 'react';
import AdminPage from './pages/admin-page';
import HomePage from './pages/home-page';
import PlayerPage from './pages/player-page';
import { GameProvider } from './context/GameContext';
import { Header } from './components/header';

/**
 * Extrai o gameId da hash da URL.
 * Ex: #/player/ABC123/4 -> "ABC123"
 * Ex: #/manage/ABC123 -> "ABC123"
 */
const getGameIdFromHash = (hash: string): string | undefined => {
    const parts = hash.split('/');
    if (parts[0] === '#' && (parts[1] === 'player' || parts[1] === 'manage')) {
        return parts[2]; // O gameId é a segunda parte
    }
    return undefined;
};

const App: React.FC = () => {
    const [route, setRoute] = useState(window.location.hash);

    useEffect(() => {
        const handleHashChange = () => {
            setRoute(window.location.hash);
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    const gameIdFromUrl = useMemo(() => getGameIdFromHash(route), [route]);

    const renderPage = () => {
        // Formato: #/player/gameId/cardId
        if (route.startsWith('#/player/')) {
            const parts = route.split('/');
            const cardId = parts[3];
            if (cardId) {
                // O gameId será pego pelo GameProvider através do gameIdFromUrl
                return <PlayerPage cardId={cardId} />;
            }
        }

        // Formato: #/manage ou #/manage/gameId
        if (route.startsWith('#/manage')) {
            return <AdminPage />;
        }

        return <HomePage />;
    };

    return (
        // Passamos o gameId da URL para o Provider
        <GameProvider gameIdFromUrl={gameIdFromUrl}>
            <div className="min-h-screen bg-linear-to-b from-slate-900 to-indigo-900 font-sans">
                <Header />
                <main className="container mx-auto p-4 md:p-6">
                    {renderPage()}
                </main>
            </div>
        </GameProvider>
    );
};

export default App;