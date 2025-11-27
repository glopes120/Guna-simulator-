
import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isZeze = message.sender === 'zeze';

  // Generate a fake timestamp based on message ID if it's a number, or current time
  const getTime = () => {
    try {
      const date = new Date(parseInt(message.id));
      if (isNaN(date.getTime())) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "Now";
    }
  };

  return (
    <div className={`flex w-full mb-2 ${isZeze ? 'justify-start' : 'justify-end'}`}>
      <div 
        className={`relative max-w-[85%] md:max-w-[65%] px-2 py-1.5 shadow-sm text-[15px] leading-snug
          ${isZeze 
            ? 'bg-[#202c33] text-[#e9edef] rounded-tr-lg rounded-br-lg rounded-bl-lg rounded-tl-none' 
            : 'bg-[#005c4b] text-[#e9edef] rounded-tl-lg rounded-bl-lg rounded-br-none rounded-tr-lg'}
        `}
        style={{
          boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)'
        }}
      >
        {/* Tail SVGs */}
        {isZeze && (
          <span className="absolute top-0 -left-[8px] w-[8px] h-[13px] overflow-hidden">
            <svg viewBox="0 0 8 13" width="8" height="13" className="fill-[#202c33]">
              <path d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z"></path>
            </svg>
          </span>
        )}
        {!isZeze && (
          <span className="absolute top-0 -right-[8px] w-[8px] h-[13px] overflow-hidden">
            <svg viewBox="0 0 8 13" width="8" height="13" className="fill-[#005c4b]">
              <path d="M6.467 3.568L0 12.193V1h5.188c1.77 1 2.338 2.156 1.279 3.568z"></path>
            </svg>
          </span>
        )}

        {/* Sender Name (Optional - WhatsApp usually hides it in 1-on-1, but useful here) */}
        {isZeze && (
          <div className="text-[13px] font-medium text-[#c07c14] mb-0.5 px-1">
            ~ Zézé da Areosa
          </div>
        )}

        {/* Generated Image */}
        {message.imageUrl && (
          <div className="mb-2 rounded-lg overflow-hidden border border-[#2a3942] bg-black">
            <img src={message.imageUrl} alt="Generated Scene" className="w-full h-auto object-cover" />
          </div>
        )}

        {/* Generated Video */}
        {message.videoUrl && (
          <div className="mb-2 rounded-lg overflow-hidden border border-[#2a3942] bg-black">
            <video 
              src={message.videoUrl} 
              controls 
              autoPlay 
              loop 
              muted 
              className="w-full h-auto object-cover" 
              style={{ maxHeight: '300px' }}
            />
          </div>
        )}
        
        <div className="px-1 pt-1 pb-4 break-words whitespace-pre-wrap">
          {message.text}
        </div>

        {/* Timestamp & Checks */}
        <div className="absolute bottom-1 right-2 flex items-end gap-1 select-none">
          <span className="text-[11px] text-[#8696a0] font-light min-w-fit">
            {getTime()}
          </span>
          {!isZeze && (
             // Double Blue Check
             <svg viewBox="0 0 16 11" width="16" height="11" className="fill-[#53bdeb]">
                <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032L6.27 7.775a.365.365 0 0 0-.513.063l-.435.452a.375.375 0 0 0 .075.56L7.53 11.22a.5.5 0 0 0 .736.005l6.749-7.349a.375.375 0 0 0-.005-.56zm-5.01 3.743l-.956.996.35.35c.49.546 1.345.556 1.84.02L15.346 3.97a.56.56 0 0 0-.816-.763l-4.52 4.918zM4.77 1.29l3.96 4.316.51-.51L4.85 0 .61 4.54l.49.51 3.67-3.76z"></path>
             </svg>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
