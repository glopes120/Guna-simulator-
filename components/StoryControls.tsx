
import React from 'react';

interface StoryControlsProps {
  options: string[];
  onChoose: (option: string) => void;
  isLoading: boolean;
  gameOver: boolean;
  onRestart: () => void;
}

const StoryControls: React.FC<StoryControlsProps> = ({ options, onChoose, isLoading, gameOver, onRestart }) => {
  if (gameOver) {
    return (
      <div className="p-4 bg-[#202c33] flex justify-center w-full pb-8">
        <button
          onClick={onRestart}
          className="bg-[#00a884] hover:bg-[#008f6f] text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform active:scale-95 uppercase tracking-wide w-full max-w-xs"
        >
          Jogar Outra Vez
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 bg-[#202c33] flex justify-center items-center h-[120px]">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-[#00a884] rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-[#00a884] rounded-full animate-bounce delay-100"></div>
          <div className="w-3 h-3 bg-[#00a884] rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 bg-[#202c33] flex flex-col gap-2 w-full pb-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)] z-30">
      <div className="text-[10px] text-center text-[#8696a0] uppercase font-bold tracking-widest mb-1 mt-1">
        Escolhe o teu destino
      </div>
      {options.map((option, idx) => (
        <button
          key={idx}
          onClick={() => onChoose(option)}
          className="w-full text-left bg-[#2a3942] hover:bg-[#374248] text-[#e9edef] py-3 px-4 rounded-xl border-l-4 border-[#00a884] transition-all active:scale-[0.99] shadow-sm text-sm md:text-base font-medium"
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default StoryControls;
