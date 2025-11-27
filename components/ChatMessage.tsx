import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isZeze = message.sender === 'zeze';

  return (
    <div className={`flex w-full mb-4 ${isZeze ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isZeze ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar Bubble */}
        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-lg font-bold shadow-lg z-10 
          ${isZeze ? 'bg-blue-600 border-2 border-white -mr-3' : 'bg-emerald-600 border-2 border-white -ml-3'}
        `}>
          {isZeze ? 'Z' : 'Tu'}
        </div>

        {/* Message Content */}
        <div className={`relative px-5 py-3 rounded-2xl shadow-md text-sm md:text-base leading-relaxed break-words
          ${isZeze 
            ? 'bg-white text-slate-800 rounded-tl-none ml-4' 
            : 'bg-emerald-600 text-white rounded-tr-none mr-4'}
        `}>
          {/* Sender Name */}
          <div className={`text-xs font-bold mb-1 opacity-70 ${isZeze ? 'text-blue-700' : 'text-emerald-100'}`}>
            {isZeze ? 'Zézé da Areosa' : 'Tu'}
          </div>
          
          {message.text}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;