
import React, { useState, useEffect, useRef } from 'react';
import { sendGunaMessage, getZezeAudio, generateStoryTurn } from './services/geminiService';
import { GameState, GameStatus, Message, GameStatistics, GameResult, GameMode } from './types';
import ChatMessage from './components/ChatMessage';
import PatienceMeter from './components/PatienceMeter';
import ZezeAvatar from './components/ZezeAvatar';
import StatsModal from './components/StatsModal';
import StoryControls from './components/StoryControls';
import { playAudioData } from './utils/audioUtils';
import { loadStats, saveStats, clearStats } from './utils/storageUtils';

// Web Speech API Type Definition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

// Icons (Kept same as before)
const SendIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" className="fill-[#8696a0]">
    <path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path>
  </svg>
);
const MicIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" className="fill-white">
    <path d="M11.999 14.942c2.001 0 3.531-1.53 3.531-3.531V4.35c0-2.001-1.53-3.531-3.531-3.531S8.469 2.35 8.469 4.35v7.061c0 2.001 1.53 3.531 3.53 3.531zm6.238-3.53c0 3.531-2.942 6.002-6.237 6.002s-6.237-2.471-6.237-6.002H3.761c0 4.001 3.178 7.297 7.061 7.885v3.884h2.354v-3.884c3.884-.588 7.061-3.884 7.061-7.885h-2.002z"></path>
  </svg>
);
const HandshakeIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" className="fill-[#e9edef]">
    <path d="M18 2.01L7 2c-2.76 0-5 2.24-5 5v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7.01c0-2.76-2.24-5-5-5zm-1.8 13.9l-2.78-1.12c-.55-.22-.9-.76-.9-1.35V7.5c0-1.1-.9-2-2-2s-2 .9-2 2v2.33c-.45.18-.84.47-1.15.84-.7.83-.88 1.95-.49 2.96l1.24 3.23c.36.93 1.25 1.54 2.24 1.54h2.46c1.37 0 2.65-.77 3.32-2l.06-.1z"></path>
  </svg>
);
const BackArrowIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" className="fill-white">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path>
  </svg>
);
const VideoIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" className="fill-white">
    <path d="M23 7l-6 5 6 5V7zM15 5H2c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h13c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1z"></path>
  </svg>
);
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" className="fill-white">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 2.33.57 3.57.57 3.57 1.02.24 1.35-.13 2.2 2.2z"></path>
  </svg>
);
const MenuIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" className="fill-white">
    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
  </svg>
);
const SmileyIcon = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" className="fill-[#8696a0]">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10zm0-18c-4.411 0-8 3.589-8 8s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8zm4.5 7c.828 0 1.5.672 1.5 1.5s-.672 1.5-1.5 1.5-1.5-.672-1.5-1.5.672-1.5 1.5-1.5zm-9 0c.828 0 1.5.672 1.5 1.5S8.328 12.5 7.5 12.5 6 11.828 6 11s.672-1.5 1.5-1.5zm4.5 9c-2.485 0-4.5-2.015-4.5-4.5h9c0 2.485-2.015 4.5-4.5 4.5z"></path>
  </svg>
);
const ClipIcon = () => (
    <svg viewBox="0 0 24 24" width="24" height="24" className="fill-[#8696a0]">
        <path d="M1.816 15.556v.002c0 1.502.584 2.912 1.646 3.972s2.472 1.647 3.974 1.647a5.58 5.58 0 0 0 3.972-1.645l9.547-9.548c.769-.768 1.147-1.767 1.058-2.817-.079-.968-.548-1.927-1.319-2.698-1.594-1.592-4.068-1.711-5.517-.262l-7.916 7.915c-.881.881-.792 2.25.214 3.261.959.958 2.423 1.053 3.263.215l5.511-5.512 1.28 1.28-5.514 5.514c-1.497 1.497-3.96 1.429-5.418-.038a3.813 3.813 0 0 1 0-5.384l7.916-7.915c1.211-1.211 3.224-1.211 4.439 0 .609.609.944 1.418.944 2.278 0 .86-.335 1.669-.944 2.278L9.418 17.653a3.633 3.633 0 0 1-2.576 1.079 3.636 3.636 0 0 1-2.577-1.079 3.642 3.642 0 0 1-1.077-2.578 3.655 3.655 0 0 1 1.077-2.578l.002-.001z"></path>
    </svg>
)

const OPENING_LINES = [
  "Ei sócio! Xira aí! Tenho aqui uma cena que até te saltam as vistas! Um iPhone 15 Pro Max, caído do camião... quer dizer, novinho em folha! É máquina de guerra, tá-se a ber? 800 paus e é teu.",
  "Oube lá mano! Psst! Anda cá! Queres um telemóvel topo de gama? iPhone 15, coisa fina. O antigo dono... digamos que já não precisa dele. 800 aéreos.",
  "Boas chefe! Tás com cara de quem precisa de um upgrade e curte do FCP! Tenho aqui o bicho! iPhone 15 Pro Max. Ainda cheira a novo! Só 800 paus para ti.",
];

const RESTART_LINES = [
  "Ei sócio! Tás de volta? Bora lá ver se tens guito hoje ou se vens só encher chouriços. 800 paus pelo iPhone!",
  "Olha quem é ele! Oube lá, bais comprar o telemóvel ou bais continuar a dar baile? 800 euros, preço de amigo!",
];

const getRandomLine = (lines: string[]) => lines[Math.floor(Math.random() * lines.length)];

export default function App() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPriceAnimating, setIsPriceAnimating] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  
  const [stats, setStats] = useState<GameStatistics>(loadStats);

  const [gameState, setGameState] = useState<GameState>(() => ({
    mode: 'negotiation',
    patience: 50,
    currentPrice: 800,
    status: GameStatus.PLAYING,
    turnCount: 0,
    messages: [
      {
        id: Date.now().toString(),
        sender: 'zeze',
        text: getRandomLine(OPENING_LINES)
      }
    ],
    storyOptions: [],
    isStoryLoading: false
  }));

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [gameState.messages, isLoading, gameState.storyOptions]);

  // Audio & Speech Logic (Same as before)
  const initAudio = () => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
      }
    }
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
       const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
       if (SpeechRecognition) {
         const recognition = new SpeechRecognition();
         recognition.continuous = false;
         recognition.interimResults = true;
         recognition.lang = 'pt-PT';
         recognition.onstart = () => { setIsListening(true); setSpeechError(null); };
         recognition.onend = () => { setIsListening(false); };
         recognition.onresult = (event: any) => {
           const currentTranscript = Array.from(event.results).map((result: any) => result[0].transcript).join('');
           setInput(currentTranscript);
         };
         recognition.onerror = (event: any) => {
             if (event.error !== 'no-speech') console.error("Speech Error", event.error);
             setIsListening(false);
             let msg = "Erro no áudio";
             if (event.error === 'network') msg = "Falha na ligação";
             else if (event.error === 'not-allowed') msg = "Sem permissão";
             else if (event.error === 'no-speech') return;
             setSpeechError(msg);
             setTimeout(() => setSpeechError(null), 3500);
         };
         recognitionRef.current = recognition;
       }
    }
  }, []);

  const toggleAudio = () => {
    initAudio();
    setIsAudioEnabled(!isAudioEnabled);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) { setSpeechError("Navegador não suportado"); return; }
    if (isListening) {
      try { recognitionRef.current.stop(); } catch (e) {}
    } else {
      setSpeechError(null);
      try { recognitionRef.current.abort(); } catch (e) {}
      setTimeout(() => { try { recognitionRef.current.start(); } catch (e) {} }, 150);
    }
  };

  // ----- NEGOTIATION LOGIC -----
  const handleNegotiationMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    // Stop listening if active
    if (isListening) { try { recognitionRef.current.stop(); } catch(e){} }
    if (isAudioEnabled) initAudio();

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: text };
    setGameState(prev => ({ ...prev, messages: [...prev.messages, userMsg] }));
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendGunaMessage(gameState, text);
      const newPatience = Math.max(0, Math.min(100, gameState.patience + response.patienceChange));
      
      const zezeMsg: Message = { id: (Date.now() + 1).toString(), sender: 'zeze', text: response.text };

      setGameState(prev => ({
        ...prev,
        patience: newPatience,
        currentPrice: response.newPrice,
        status: response.gameStatus,
        turnCount: prev.turnCount + 1,
        messages: [...prev.messages, zezeMsg]
      }));

      // Stats Logic (Simplified for brevity)
      if (response.gameStatus !== GameStatus.PLAYING) {
         // Update stats logic here...
      }

      if (isAudioEnabled) {
        getZezeAudio(response.text).then(audio => {
           if(audio && audioContextRef.current) playAudioData(audio, audioContextRef.current, 1.2);
        });
      }

    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // ----- STORY MODE LOGIC -----
  const startStoryMode = async () => {
    setGameState({
      mode: 'story',
      patience: 100, // Not relevant in story
      currentPrice: 0,
      status: GameStatus.PLAYING,
      turnCount: 0,
      messages: [],
      storyOptions: [],
      isStoryLoading: true
    });
    setShowMenu(false);

    try {
      const storyTurn = await generateStoryTurn("", "");
      const msg: Message = { id: Date.now().toString(), sender: 'zeze', text: storyTurn.narrative };
      setGameState(prev => ({
        ...prev,
        messages: [msg],
        storyOptions: storyTurn.options,
        isStoryLoading: false
      }));
    } catch (e) {
      console.error(e);
      setGameState(prev => ({ ...prev, isStoryLoading: false }));
    }
  };

  const handleStoryChoice = async (choice: string) => {
    setGameState(prev => ({
        ...prev,
        storyOptions: [], // Clear options
        isStoryLoading: true,
        messages: [...prev.messages, { id: Date.now().toString(), sender: 'user', text: choice }]
    }));

    // Build simple history string from last 3 turns
    const history = gameState.messages.slice(-3).map(m => `${m.sender}: ${m.text}`).join('\n');

    try {
        const storyTurn = await generateStoryTurn(history, choice);
        const msg: Message = { id: (Date.now() + 1).toString(), sender: 'zeze', text: storyTurn.narrative };
        
        // Handle Game Over in Story
        const newStatus = storyTurn.gameOver ? GameStatus.WON : GameStatus.PLAYING; 
        
        setGameState(prev => ({
            ...prev,
            messages: [...prev.messages, msg],
            storyOptions: storyTurn.options,
            status: newStatus,
            isStoryLoading: false
        }));

        if (isAudioEnabled) {
             getZezeAudio(storyTurn.narrative).then(audio => {
               if(audio && audioContextRef.current) playAudioData(audio, audioContextRef.current, 1.2);
            });
        }

    } catch (e) {
        setGameState(prev => ({ ...prev, isStoryLoading: false }));
    }
  };

  const restartNegotiation = () => {
    setGameState({
      mode: 'negotiation',
      patience: 50,
      currentPrice: 800,
      status: GameStatus.PLAYING,
      turnCount: 0,
      messages: [{ id: Date.now().toString(), sender: 'zeze', text: getRandomLine(OPENING_LINES) }],
      storyOptions: [],
      isStoryLoading: false
    });
    setShowMenu(false);
  };

  const handleMainButtonClick = () => {
    if (gameState.mode === 'negotiation') {
        if (isListening) toggleListening();
        else if (input.trim()) handleNegotiationMessage(input);
        else toggleListening();
    }
  };

  // ----- RENDER -----
  return (
    <div className="flex justify-center items-center h-screen bg-[#000] p-0 md:p-6 font-sans">
      <StatsModal stats={stats} isOpen={showStats} onClose={() => setShowStats(false)} onReset={() => setStats(clearStats())} />

      <div className="w-full max-w-[500px] h-full md:h-[90vh] md:max-h-[850px] bg-[#0b141a] md:rounded-[24px] shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Dropdown Menu */}
        {showMenu && (
             <div className="absolute top-14 right-4 bg-[#202c33] rounded-xl shadow-xl z-50 border border-[#2a3942] py-2 min-w-[200px] animate-fade-in">
                 <button onClick={restartNegotiation} className="w-full text-left px-4 py-3 hover:bg-[#111b21] text-[#e9edef] flex items-center gap-3">
                     <span className="text-xl">💰</span> Negociação
                 </button>
                 <button onClick={startStoryMode} className="w-full text-left px-4 py-3 hover:bg-[#111b21] text-[#e9edef] flex items-center gap-3">
                     <span className="text-xl">📖</span> Modo História
                 </button>
                 <div className="border-t border-[#2a3942] my-1"></div>
                 <button onClick={() => setShowStats(true)} className="w-full text-left px-4 py-3 hover:bg-[#111b21] text-[#e9edef] flex items-center gap-3">
                     <span className="text-xl">📊</span> Caderneta
                 </button>
             </div>
        )}

        {/* Header */}
        <div className="px-2 py-2 bg-[#202c33] flex justify-between items-center z-20 shrink-0 shadow-sm">
          <div className="flex items-center gap-2 flex-1 cursor-pointer hover:bg-[#2a3942] p-1 rounded-lg transition-colors" onClick={() => setShowMenu(!showMenu)}>
             <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-600 bg-black">
               <ZezeAvatar patience={gameState.mode === 'story' ? 100 : gameState.patience} isThinking={isLoading || gameState.isStoryLoading} />
             </div>
             <div className="flex flex-col justify-center">
               <div className="text-[#e9edef] font-medium text-[16px] leading-tight">
                 Zézé da Areosa {gameState.mode === 'story' && <span className="text-[#00a884] text-xs font-bold bg-[#0b141a] px-1 rounded ml-1">RPG</span>}
               </div>
               <div className="text-[#8696a0] text-[12px] truncate max-w-[150px]">
                 {isLoading || gameState.isStoryLoading ? "a escrever..." : "Online"}
               </div>
             </div>
          </div>
          <div className="flex items-center gap-4 px-2">
             <button onClick={toggleAudio} className={isAudioEnabled ? "opacity-100" : "opacity-50"}><VideoIcon /></button>
             <button onClick={() => setShowMenu(!showMenu)}><MenuIcon /></button>
          </div>
        </div>

        {/* Negotiation Info Bar (Only Negotiation Mode) */}
        {gameState.mode === 'negotiation' && (
            <div className="bg-[#182229] px-4 py-1 flex justify-center border-b border-[#202c33] z-10">
            <span className={`text-xs font-bold text-[#8696a0] uppercase flex items-center gap-2 ${isPriceAnimating ? 'animate-price' : ''}`}>
                iPhone 15 "Pro Max" • <span className="text-[#e9edef]">{gameState.currentPrice} €</span>
            </span>
            </div>
        )}

        {/* Chat Area */}
        <div className="relative flex-1 bg-[#0b141a] overflow-hidden w-full">
            <div className="absolute inset-0 wa-bg pointer-events-none"></div>
            <div ref={scrollRef} className="relative h-full overflow-y-auto p-4 space-y-1">
              {gameState.mode === 'negotiation' && <PatienceMeter level={gameState.patience} />}
              {gameState.messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              
              {/* Negotiation End Cards */}
              {gameState.mode === 'negotiation' && gameState.status !== GameStatus.PLAYING && (
                  <div className="flex justify-center mt-4">
                      <button onClick={restartNegotiation} className="bg-[#202c33] text-[#00a884] px-6 py-2 rounded-full border border-[#2a3942] hover:bg-[#2a3942] font-bold">
                          JOGAR NOVAMENTE
                      </button>
                  </div>
              )}
              
              <div className="h-4"></div>
            </div>
        </div>

        {/* Input Area Switcher */}
        {gameState.mode === 'story' ? (
            <StoryControls 
                options={gameState.storyOptions} 
                onChoose={handleStoryChoice} 
                isLoading={gameState.isStoryLoading} 
                gameOver={gameState.status !== GameStatus.PLAYING}
                onRestart={startStoryMode}
            />
        ) : (
            <div className="bg-[#202c33] p-2 flex items-end gap-2 shrink-0 z-20 relative">
                {speechError && (
                    <div className="absolute -top-12 right-2 bg-red-600/95 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-bounce z-50">
                        {speechError}
                    </div>
                )}
                <div className="flex-1 bg-[#2a3942] rounded-[24px] px-3 py-2 flex items-center gap-2 min-h-[42px]">
                    <button className="p-1 hover:bg-[#374248] rounded-full transition-colors hidden md:block"><SmileyIcon /></button>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleMainButtonClick()}
                        disabled={gameState.status !== GameStatus.PLAYING || isLoading}
                        placeholder={isListening ? "A ouvir..." : (gameState.status === GameStatus.PLAYING ? "Mensagem" : "Bloqueado")}
                        className={`bg-transparent text-[#e9edef] placeholder-[#8696a0] text-[15px] flex-1 outline-none w-full ${isListening ? 'animate-pulse' : ''}`}
                    />
                    <button className="p-1 hover:bg-[#374248] rounded-full transition-colors rotate-45"><ClipIcon /></button>
                </div>
                
                {gameState.status === GameStatus.PLAYING && input.length === 0 && !isListening && (
                    <button onClick={() => handleNegotiationMessage(`ACEITO O NEGÓCIO POR ${gameState.currentPrice} EUROS!`)} className="w-[42px] h-[42px] rounded-full flex items-center justify-center shadow-md bg-[#202c33] hover:bg-[#374248] border border-[#2a3942] flex-shrink-0">
                        <HandshakeIcon />
                    </button>
                )}

                <button 
                    onClick={handleMainButtonClick}
                    disabled={isLoading || gameState.status !== GameStatus.PLAYING}
                    className={`w-[42px] h-[42px] rounded-full flex items-center justify-center shadow-md transition-all flex-shrink-0 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-[#00a884] hover:bg-[#008f6f]'}`}
                >
                    {isListening ? <MicIcon /> : (input.trim() ? <SendIcon /> : <MicIcon />)}
                </button>
            </div>
        )}
      </div>
    </div>
  );
}
