import React from 'react';
import ZezeAvatar from './ZezeAvatar';

interface MainMenuProps {
  onStartNegotiation: () => void;
  onStartStory: () => void;
  onOpenStats: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartNegotiation, onStartStory, onOpenStats }) => {
  return (
    <div className="w-full h-full bg-[#111b21] flex flex-col relative overflow-hidden font-sans">
      {/* Background Pattern */}
      <div className="absolute inset-0 wa-bg opacity-30 pointer-events-none"></div>

      <div className="z-10 flex-1 flex flex-col items-center justify-center p-6 space-y-8 animate-fade-in">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-32 h-32 rounded-full border-4 border-[#00a884] shadow-[0_0_20px_rgba(0,168,132,0.4)] overflow-hidden bg-slate-800">
            <ZezeAvatar patience={80} isThinking={false} />
          </div>
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-[#e9edef] tracking-tight">
              Guna Simulator
            </h1>
            <p className="text-[#00a884] font-medium mt-1 text-sm md:text-base uppercase tracking-wider border-b border-[#00a884] inline-block pb-1">
              Business à Moda do Porto
            </p>
            <p className="text-[#8696a0] mt-3 text-xs md:text-sm">
              Consegues enganar o mestre do OLX?
            </p>
          </div>
        </div>

        {/* Buttons Section */}
        <div className="w-full max-w-xs space-y-4 pt-4">
          
          <button 
            onClick={onStartNegotiation}
            className="w-full group relative bg-[#00a884] hover:bg-[#008f6f] text-white p-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-between overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
            <div className="flex flex-col items-start">
              <span className="font-bold text-lg">Negociar iPhone</span>
              <span className="text-xs text-white/80">Modo Clássico</span>
            </div>
            <span className="text-2xl">💰</span>
          </button>

          <button 
            onClick={onStartStory}
            className="w-full bg-[#202c33] hover:bg-[#2a3942] border border-[#2a3942] text-[#e9edef] p-4 rounded-2xl shadow-md transition-all active:scale-[0.98] flex items-center justify-between"
          >
            <div className="flex flex-col items-start">
              <span className="font-bold text-lg">História na Areosa</span>
              <span className="text-xs text-[#8696a0]">RPG de Escolhas</span>
            </div>
            <span className="text-2xl">📖</span>
          </button>

          <button 
            onClick={onOpenStats}
            className="w-full bg-[#202c33] hover:bg-[#2a3942] border border-[#2a3942] text-[#e9edef] p-4 rounded-2xl shadow-md transition-all active:scale-[0.98] flex items-center justify-between"
          >
            <div className="flex flex-col items-start">
              <span className="font-bold text-lg">A Minha Caderneta</span>
              <span className="text-xs text-[#8696a0]">Estatísticas</span>
            </div>
            <span className="text-2xl">📊</span>
          </button>

        </div>
      </div>

      {/* Footer */}
      <div className="z-10 p-6 text-center">
        <p className="text-[10px] text-[#8696a0] uppercase tracking-widest">
          Powered by Gemini 2.5 & 3 Pro
        </p>
      </div>
    </div>
  );
};

export default MainMenu;