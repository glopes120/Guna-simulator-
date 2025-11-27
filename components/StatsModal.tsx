
import React from 'react';
import { GameStatistics } from '../types';

interface StatsModalProps {
  stats: GameStatistics;
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
}

const StatsModal: React.FC<StatsModalProps> = ({ stats, isOpen, onClose, onReset }) => {
  if (!isOpen) return null;

  const winRate = stats.gamesPlayed > 0 
    ? Math.round((stats.wins / stats.gamesPlayed) * 100) 
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border-2 border-blue-500 rounded-xl w-full max-w-md shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-blue-900 p-4 border-b border-blue-800 flex justify-between items-center">
          <h2 className="text-xl font-marker text-white tracking-wide">Caderneta do Negócio</h2>
          <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 p-3 rounded-lg text-center border border-slate-700">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Jogos Feitos</div>
              <div className="text-2xl font-bold text-white">{stats.gamesPlayed}</div>
            </div>
            <div className="bg-slate-800 p-3 rounded-lg text-center border border-slate-700">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Win Rate</div>
              <div className={`text-2xl font-bold ${winRate > 50 ? 'text-green-400' : 'text-yellow-400'}`}>
                {winRate}%
              </div>
            </div>
          </div>

          <div className="space-y-3">
             <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded border border-slate-700">
                <span className="text-slate-300">Vitórias (Negócios):</span>
                <span className="text-green-400 font-bold">{stats.wins}</span>
             </div>
             <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded border border-slate-700">
                <span className="text-slate-300">Derrotas (Fugidas):</span>
                <span className="text-red-400 font-bold">{stats.losses}</span>
             </div>
             <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded border border-slate-700">
                <span className="text-slate-300">Turnos Totais:</span>
                <span className="text-blue-300 font-bold">{stats.totalTurns}</span>
             </div>
             <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded border border-slate-700">
                <span className="text-slate-300">Melhor Negócio (Barato):</span>
                <span className="text-yellow-400 font-bold">
                  {stats.bestDeal ? `${stats.bestDeal}€` : '-'}
                </span>
             </div>
             <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded border border-slate-700">
                <span className="text-slate-300">Mínimo Visto:</span>
                <span className="text-purple-400 font-bold">{stats.lowestPriceSeen}€</span>
             </div>
          </div>

          <div className="pt-4 flex justify-between gap-3">
             <button 
               onClick={onReset}
               className="px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:underline"
             >
               Apagar Registo
             </button>
             <button 
               onClick={onClose}
               className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow transition-colors"
             >
               Fechar
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StatsModal;
