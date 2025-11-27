import React from 'react';

interface PatienceMeterProps {
  level: number;
}

const PatienceMeter: React.FC<PatienceMeterProps> = ({ level }) => {
  // Color logic based on levels
  let colorClass = 'bg-green-500';
  if (level < 30) colorClass = 'bg-red-600';
  else if (level < 60) colorClass = 'bg-yellow-500';

  return (
    <div className="w-full bg-slate-800 p-3 rounded-lg border border-slate-700 shadow-md">
      <div className="flex justify-between items-end mb-1">
        <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Nível de Paciência</span>
        <span className={`text-xl font-marker ${level < 30 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
          {level}%
        </span>
      </div>
      <div className="w-full bg-slate-900 rounded-full h-4 border border-slate-600 overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ease-out ${colorClass}`} 
          style={{ width: `${Math.max(0, Math.min(100, level))}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-right text-slate-500 italic">
        {level < 20 ? "CUIDADO MANO! Tás a pedi-las!" : level > 80 ? "O Zézé curte de ti." : "Tás em águas de bacalhau..."}
      </div>
    </div>
  );
};

export default PatienceMeter;