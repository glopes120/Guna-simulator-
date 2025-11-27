import React from 'react';

interface PatienceMeterProps {
  level: number;
}

const PatienceMeter: React.FC<PatienceMeterProps> = ({ level }) => {
  // Color logic
  let textColor = 'text-[#e9edef]';
  if (level < 30) textColor = 'text-[#f15c6d]'; // Reddish
  else if (level < 60) textColor = 'text-[#f0b330]'; // Yellowish

  return (
    <div className="w-full flex justify-center py-3 sticky top-0 z-10 pointer-events-none">
      <div className="bg-[#182229] px-4 py-1.5 rounded-lg shadow-sm border border-[#2a3942] flex items-center gap-3 backdrop-blur-md bg-opacity-95">
        <span className="text-[11px] font-bold text-[#8696a0] uppercase tracking-wide">
          PACIÊNCIA
        </span>
        
        {/* Simple Bar */}
        <div className="w-24 h-1.5 bg-[#374248] rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ease-out ${level < 30 ? 'bg-[#f15c6d]' : level < 60 ? 'bg-[#f0b330]' : 'bg-[#00a884]'}`} 
            style={{ width: `${Math.max(0, Math.min(100, level))}%` }}
          />
        </div>

        <span className={`text-xs font-bold ${textColor} min-w-[30px] text-right`}>
          {level}%
        </span>
      </div>
    </div>
  );
};

export default PatienceMeter;