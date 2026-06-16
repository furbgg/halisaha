import { Link } from 'react-router-dom';

type LogoProps = {
  variant?: 'large' | 'small';
  inverted?: boolean;
  className?: string;
  withLink?: boolean;
};

export function Logo({ variant = 'small', inverted = false, className = '', withLink = false }: LogoProps) {
  const content = variant === 'large' ? (
    <img 
      src={inverted ? "/logo_dark.png" : "/logo.png"} 
      alt="Salamanda Soccer Arena Logo" 
      className={`object-contain opacity-90 ${className}`} 
    />
  ) : (
    <div className={`flex items-baseline font-display tracking-tight ${className}`}>
        <span className={`${inverted ? "text-gray-900" : "text-white"} text-base sm:text-lg md:text-xl font-black`}>
            SALAMANDA
        </span>
        <span className={`ml-1.5 text-base sm:text-lg md:text-xl font-black ${inverted ? "text-orange-600" : "text-primary drop-shadow-[0_0_8px_rgba(255,68,0,0.5)]"}`}>
            SOCCER ARENA
        </span>
        <span className={`text-[10px] sm:text-xs md:text-sm ml-2 tracking-widest font-bold ${inverted ? "text-gray-500" : "text-[#bbab9b]"}`}>
            2025
        </span>
    </div>
  );

  if (withLink) {
    return (
      <Link to="/" className="inline-block transition-transform hover:scale-[1.02] active:scale-[0.98]">
        {content}
      </Link>
    );
  }

  return content;
}
