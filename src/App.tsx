
import React, { useState, useEffect } from 'react';
import AdminPage from './pages/admin-page';
import HomePage from './pages/home-page';
import PlayerPage from './pages/player-page';
import { GameProvider } from './context/GameContext';
import { Header } from './components/header';


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

    const renderPage = () => {
        // Formato: #/player/gameId/cardId
        if (route.startsWith('#/player/')) {
            const parts = route.split('/');
            const cardId = parts[3];
            if (cardId) {
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
        <GameProvider>
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