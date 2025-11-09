
import React from 'react';
import { PlayIcon } from '../components/icons';

const HomePage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
            <h1 className="text-5xl md:text-7xl font-display text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-500 mb-4">
                Bem-vindo ao Bingo Party!
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-8">
                A ferramenta definitiva para criar, gerenciar e se divertir com jogos de bingo com amigos e família. Comece criando seu primeiro jogo.
            </p>
            <a
                href="#/manage"
                className="inline-flex items-center gap-3 px-8 py-4 bg-purple-600 text-white font-bold text-lg rounded-full hover:bg-purple-700 transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30"
            >
                <PlayIcon className="w-6 h-6" />
                Criar & Gerenciar Jogo de Bingo
            </a>
        </div>
    );
};

export default HomePage;
