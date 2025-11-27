
import React, { useState, useEffect, useRef } from 'react';
import { sendGunaMessage, getZezeAudio } from './services/geminiService';
import { GameState, GameStatus, Message, GameStatistics } from './types';
import ChatMessage from './components/ChatMessage';
import PatienceMeter from './components/PatienceMeter';
import ZezeAvatar from './components/ZezeAvatar';
import StatsModal from './components/StatsModal';
import { playAudioData } from './utils/audioUtils';
import { loadStats, saveStats, clearStats } from './utils/storageUtils';

// Icons
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);

const RestartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
);

const VolumeOnIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
);

const VolumeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
);

const StatsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-6M6 20V10M18 20V4"></path></svg>
);

// Randomized Opening Lines for Variety
const OPENING_LINES = [
  "Ei sócio! Xira aí! Tenho aqui uma cena que até te saltam as vistas! Um iPhone 15 Pro Max, caído do camião... quer dizer, novinho em folha! É máquina de guerra, tá-se a ber? 800 paus e é teu. Bais lebar ou bais ficar a olhar feito morcão?",
  "Oube lá mano! Psst! Anda cá! Queres um telemóvel topo de gama? iPhone 15, coisa fina. O antigo dono... digamos que já não precisa dele. 800 aéreos. É pegar ou largar antes que a bófia apareça!",
  "Boas chefe! Tás com cara de quem precisa de um upgrade e curte do FCP! Tenho aqui o bicho! iPhone 15 Pro Max. Ainda cheira a novo! Só 800 paus para ti, que tens cara de ser gente fina.",
  "Mano, olha-me para esta máquina! Nem na FNAC arranjas disto a este preço. 800 euros. Se não quiseres, tenho ali um 'cliente' do Cerco à espera, por isso despacha-te lá com isso.",
  "Então primaço? Tás a laurear a pevide? Aproveita e leba este iPhone 15. É 800 paus, mas como tens pinta de quem não é mouro, faço-te um jeito. Que dizes?",
  "Ei mano! Tás a ber este iPhone? É mais rápido que o Galeno na ala esquerda! 800 paus! É pegar ou largar antes que eu me arrependa. Bibó Porto!",
  "Oube lá! Este telemóvel tem uma câmara que até bê os penaltis que roubam ao Porto! iPhone 15 Pro Max, coisa fina da Areosa. 800 euros, preço de amigo.",
  "Xira aí, sócio! Máquina de guerra! Isto não é para mouros, é para quem sabe o que é bom. 800 paus e levas o telemóvel e a benção do Pinto da Costa!",
  "Mánica, tás com uma cara de quem quer gastar guito! Tenho aqui este iPhone que caiu... da montra. Tá impecável! 800 aéreos. Se fores Dragão, até te mostro a capa.",
  "Psiu! Queres um telemóvel que dura mais que o Pepe na defesa? iPhone 15 Pro Max! 800 euros. Se não quiseres, bai dar uma curva ao bilhar grande!"
];

const RESTART_LINES = [
  "Ei sócio! Tás de volta? Bora lá ver se tens guito hoje ou se vens só encher chouriços. 800 paus pelo iPhone, pegar ou largar!",
  "Olha quem é ele! Oube lá, bais comprar o telemóvel ou bais continuar a dar baile? 800 euros, preço de amigo!",
  "Bais tentar outra bez? Cuidado com a conversa, que hoje acordei com os azeites. O preço mantém-se: 800 paus!",
];

const getRandomLine = (lines: string[]) => lines[Math.floor(Math.random() * lines.length)];

export default function App() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isPriceAnimating, setIsPriceAnimating] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  // Stats State
  const [stats, setStats] = useState<GameStatistics>(loadStats);

  // Initialize state with a random opening message
  const [gameState, setGameState] = useState<GameState>(() => ({
    patience: 50,
    currentPrice: 800,
    status: GameStatus.PLAYING,
    turnCount: 0,
    messages: [
      {
        id: 'init-1',
        sender: 'zeze',
        text: getRandomLine(OPENING_LINES)
      }
    ]
  }));

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [gameState.messages, isLoading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Trigger price animation on change
  useEffect(() => {
    if (gameState.turnCount > 0) {
      setIsPriceAnimating(true);
      const timer = setTimeout(() => setIsPriceAnimating(false), 500); // Duration matches CSS animation
      return () => clearTimeout(timer);
    }
  }, [gameState.currentPrice]);

  // Initialize AudioContext on user interaction
  const initAudio = () => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
      }
    }
    // Resume if suspended (browser policy)
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const toggleAudio = () => {
    initAudio();
    setIsAudioEnabled(!isAudioEnabled);
  };

  const updateStatistics = (newStatus: GameStatus, finalPrice: number, lowestSeen: number) => {
    const newStats = { ...stats };
    
    // Always increment turns
    newStats.totalTurns += 1;

    // Check lowest price seen globally
    if (lowestSeen < newStats.lowestPriceSeen) {
      newStats.lowestPriceSeen = lowestSeen;
    }

    // Handle Game End
    if (newStatus !== GameStatus.PLAYING) {
      newStats.gamesPlayed += 1;
      
      if (newStatus === GameStatus.WON) {
        newStats.wins += 1;
        // Check for best deal (lowest bought price)
        if (newStats.bestDeal === null || finalPrice < newStats.bestDeal) {
          newStats.bestDeal = finalPrice;
        }
      } else if (newStatus === GameStatus.LOST) {
        newStats.losses += 1;
      }
    }

    setStats(newStats);
    saveStats(newStats);
  };

  const handleResetStats = () => {
    const defaults = clearStats();
    setStats(defaults);
    setShowStats(false);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading || gameState.status !== GameStatus.PLAYING) return;

    // Ensure audio context is ready if enabled
    if (isAudioEnabled) initAudio();

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text
    };

    // Optimistic update
    setGameState(prev => ({
      ...prev,
      messages: [...prev.messages, userMsg]
    }));
    setInput('');
    setIsLoading(true);

    try {
      // Get AI response text
      const response = await sendGunaMessage(gameState, text);

      // Calculate new patience safely
      const newPatience = Math.max(0, Math.min(100, gameState.patience + response.patienceChange));
      
      const zezeMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'zeze',
        text: response.text
      };

      setGameState(prev => ({
        ...prev,
        patience: newPatience,
        currentPrice: response.newPrice,
        status: response.gameStatus,
        turnCount: prev.turnCount + 1,
        messages: [...prev.messages, zezeMsg]
      }));

      // Update Stats
      updateStatistics(response.gameStatus, response.newPrice, response.newPrice);

      // Generate and play audio if enabled
      if (isAudioEnabled) {
        // We use the response text for TTS. 
        // Note: We don't await this to block the UI update, but we do want it to play.
        getZezeAudio(response.text).then(audioData => {
          if (audioData && audioContextRef.current) {
            // Speed up playback to 1.2 to sound more like a fast-talking Guna
            playAudioData(audioData, audioContextRef.current, 1.2);
          }
        });
      }

    } catch (error) {
      console.error("Failed to get response", error);
    } finally {
      setIsLoading(false);
      // Re-focus input after sending
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage(input);
    }
  };

  const restartGame = () => {
    setGameState({
      patience: 50,
      currentPrice: 800,
      status: GameStatus.PLAYING,
      turnCount: 0,
      messages: [
        {
          id: Date.now().toString(),
          sender: 'zeze',
          text: getRandomLine(RESTART_LINES)
        }
      ]
    });
  };

  // Quick Action Helpers
  const quickActions = [
    { label: "Oferecer Cigarro", text: "Toma lá um cigarro, mano." },
    { label: "Elogiar Pinto da Costa", text: "O Pinto da Costa é o Rei disto tudo, carago!" },
    { label: "Pedir Fatura", text: "Olha, passas fatura com contribuinte?" },
    { label: "Falar do Benfica", text: "O Benfica joga muito!" },
    { label: "Oferecer um Fino", text: "Bora beber um fino que eu pago!" },
  ];

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-950 p-0 md:p-4">
      <StatsModal 
        stats={stats} 
        isOpen={showStats} 
        onClose={() => setShowStats(false)} 
        onReset={handleResetStats}
      />

      <div className="w-full max-w-2xl bg-slate-900 md:rounded-2xl shadow-2xl flex flex-col h-[100dvh] md:h-[90vh] border border-slate-800 relative overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-blue-900 border-b border-blue-800 flex justify-between items-center shadow-lg z-20">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-full border-2 border-yellow-400 overflow-hidden bg-slate-200">
               <ZezeAvatar patience={gameState.patience} isThinking={isLoading} />
             </div>
             <div>
               <h1 className="text-xl md:text-2xl font-marker text-white tracking-wide">Zézé da Areosa</h1>
               <div className="flex items-center gap-2">
                 <span className={`text-xs md:text-sm text-blue-200 font-bold bg-blue-800 px-2 py-0.5 rounded-full transition-all ${isPriceAnimating ? 'animate-price' : ''}`}>
                   {gameState.currentPrice}€
                 </span>
                 <span className="text-xs text-blue-300">iPhone 15 "Pro Max"</span>
               </div>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowStats(true)}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors text-white"
              title="Estatísticas"
            >
              <StatsIcon />
            </button>
            <button 
              onClick={toggleAudio}
              className={`p-2 rounded-full transition-colors ${isAudioEnabled ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              title={isAudioEnabled ? "Desativar Voz" : "Ativar Voz"}
            >
              {isAudioEnabled ? <VolumeOnIcon /> : <VolumeOffIcon />}
            </button>
            <button 
              onClick={restartGame}
              className="p-2 bg-blue-800 hover:bg-blue-700 rounded-full transition-colors text-white"
              title="Reiniciar Jogo"
            >
              <RestartIcon />
            </button>
          </div>
        </div>

        {/* Patience Meter Area */}
        <div className="bg-slate-800/50 p-2 md:px-4 backdrop-blur-sm z-10">
          <PatienceMeter level={gameState.patience} />
        </div>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-900 to-slate-800"
        >
          {gameState.messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          
          {isLoading && (
            <div className="flex justify-start animate-pulse">
               <div className="bg-white/10 text-slate-300 text-xs px-4 py-2 rounded-full rounded-tl-none ml-14 flex items-center gap-1">
                 <span>Zézé está a escrever</span>
                 <span className="animate-bounce">.</span>
                 <span className="animate-bounce delay-100">.</span>
                 <span className="animate-bounce delay-200">.</span>
               </div>
            </div>
          )}

          {gameState.status === GameStatus.WON && (
            <div className="mt-8 p-6 bg-green-600/20 border-2 border-green-500 rounded-xl text-center animate-fade-in">
              <h2 className="text-3xl font-marker text-green-400 mb-2">GRANDE NEGÓCIO!</h2>
              <p className="text-white mb-4">Compraste o tijol... quer dizer, o iPhone por {gameState.currentPrice}€!</p>
              <button onClick={restartGame} className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded shadow-lg transition-transform hover:scale-105">
                Jogar Outra Vez
              </button>
            </div>
          )}

          {gameState.status === GameStatus.LOST && (
             <div className="mt-8 p-6 bg-red-900/40 border-2 border-red-600 rounded-xl text-center animate-fade-in">
             <h2 className="text-3xl font-marker text-red-500 mb-2">LEVASTE NA TOLA!</h2>
             <p className="text-white mb-4">O Zézé perdeu a paciência e deu-te um "calduço". Foste embora a correr.</p>
             <button onClick={restartGame} className="px-6 py-2 bg-red-700 hover:bg-red-600 text-white font-bold rounded shadow-lg transition-transform hover:scale-105">
               Tentar de Novo (Cuidado com o Azeite)
             </button>
           </div>
          )}
        </div>

        {/* Action Buttons & Input */}
        <div className="p-3 md:p-4 bg-slate-900 border-t border-slate-700 z-20">
          
          {/* Quick Actions (Desktop/Tablet mostly, Scrollable on mobile) */}
          {gameState.status === GameStatus.PLAYING && (
            <div className="flex gap-2 overflow-x-auto pb-3 mb-1 no-scrollbar mask-gradient">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(action.text)}
                  disabled={isLoading}
                  className="whitespace-nowrap px-3 py-1.5 bg-slate-800 hover:bg-blue-900 border border-slate-700 hover:border-blue-500 rounded text-xs md:text-sm text-slate-300 transition-all flex-shrink-0"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Field */}
          <div className="flex gap-2 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={gameState.status !== GameStatus.PLAYING || isLoading}
              placeholder={gameState.status === GameStatus.PLAYING ? "Fala com o Zézé..." : "Jogo terminado."}
              className="flex-1 bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 placeholder-slate-500"
            />
            <button
              onClick={() => handleSendMessage(input)}
              disabled={!input.trim() || isLoading || gameState.status !== GameStatus.PLAYING}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white p-3 rounded-lg transition-colors flex items-center justify-center min-w-[50px]"
            >
              <SendIcon />
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
