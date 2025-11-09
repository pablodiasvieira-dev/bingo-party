import React from 'react';
import { useGame } from '../context/GameContext';

export const Header: React.FC = () => {
    const { user, logout } = useGame();

    const handleLogout = () => {
        logout();
        window.location.hash = '';
    }

    return (
        <header className="py-4 px-6 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                <a href="#" onClick={() => window.location.hash = ''} className="text-2xl md:text-3xl font-display text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-500">
                    Bingo Party
                </a>
                <div className="flex items-center space-x-4">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border-2 border-slate-600" />
                            <span className="text-sm font-semibold hidden sm:block text-slate-300">{user.name}</span>
                            <button onClick={handleLogout} className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                                Sair
                            </button>
                        </div>
                    ) : (
                        <a href="#/manage" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                            Administrador
                        </a>
                    )}
                </div>
            </div>
        </header>
    );
};
