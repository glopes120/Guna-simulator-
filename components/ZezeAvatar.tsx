import React, { useState, useEffect } from 'react';

interface ZezeAvatarProps {
  patience: number;
  isThinking: boolean;
}

const ZezeAvatar: React.FC<ZezeAvatarProps> = ({ patience, isThinking }) => {
  const [isBlinking, setIsBlinking] = useState(false);

  // Random blink logic
  useEffect(() => {
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200); // Blink duration
      
      // Schedule next blink randomly between 2s and 6s
      const nextBlink = Math.random() * 4000 + 2000;
      setTimeout(triggerBlink, nextBlink);
    };

    const timeoutId = setTimeout(triggerBlink, 3000);
    return () => clearTimeout(timeoutId);
  }, []);

  // Determine animation classes
  let containerClasses = "w-full h-full object-cover transition-transform duration-300 ";
  
  if (patience < 30) {
    // Angry shake
    containerClasses += "animate-shake grayscale-[0.2] contrast-125";
  } else if (isThinking) {
    // Excited/Thinking pulse (handled via tailwind usually, but let's add a bounce)
    containerClasses += "animate-bounce"; 
  } else {
    // Idle vibe (listening to music)
    containerClasses += "animate-float";
  }

  // Blink is applied to the image scaleY
  const blinkStyle = isBlinking ? { transform: 'scaleY(0.1)', transformOrigin: 'center' } : {};

  return (
    <div className="w-full h-full relative bg-slate-200">
        <img 
            src="https://picsum.photos/seed/zeze/200/200?grayscale" 
            alt="Zézé" 
            className={containerClasses}
            style={blinkStyle}
        />
        {/* Optional: Add a 'sweat drop' or 'anger symbol' overlay if patience is low */}
        {patience < 20 && (
            <div className="absolute top-0 right-0 text-red-500 text-xl font-bold animate-pulse">
                💢
            </div>
        )}
        {/* Optional: Music notes if happy/idle */}
        {patience > 70 && !isThinking && (
             <div className="absolute -top-1 -right-1 text-blue-400 text-xs animate-bounce delay-75">
             🎵
         </div>
        )}
    </div>
  );
};

export default ZezeAvatar;