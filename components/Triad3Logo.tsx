import React from 'react';

export const Triad3Logo: React.FC<{ className?: string }> = ({ className }) => (
    <img 
        src="https://aisfizoyfpcisykarrnt.supabase.co/storage/v1/object/public/imagens/LOGO%20TRIAD3%20.png" 
        alt="Triad3 Logo" 
        className={`rounded-full transition-all duration-300 ease-in-out hover:scale-110 shadow-[0_0_20px_rgba(0,209,255,0.5)] hover:shadow-[0_0_35px_rgba(0,209,255,0.7)] ${className}`}
    />
);