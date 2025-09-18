import React, { useEffect, useState } from 'react';
import { Prize } from '../../types';

interface RoletaWheelProps {
  prizes: Prize[];
  isSpinning: boolean;
  spinDuration?: number; 
  winningPrizeId?: string | null;
  companyLogoUrl?: string | null; 
  segmentColorsOverride?: string[]; 
}

// Helper para determinar a cor do texto com base na cor de fundo para garantir a legibilidade.
const getTextColorForBg = (bgColor: string): string => {
  if (!bgColor?.startsWith('#')) return '#FFFFFF';
  const color = bgColor.substring(1, 7);
  if (color.length !== 6) return '#FFFFFF';
  try {
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    // Fórmula YIQ para determinar a luminosidade
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#111827' : '#FFFFFF'; // Retorna preto para fundos claros, branco para escuros.
  } catch (e) {
    return '#FFFFFF';
  }
};


export const RoletaWheel: React.FC<RoletaWheelProps> = ({ 
  prizes, 
  isSpinning, 
  spinDuration = 5, 
  winningPrizeId,
  companyLogoUrl, 
  segmentColorsOverride 
}) => {
  const numPrizes = prizes.length;
  const anglePerSlice = numPrizes > 0 ? 360 / numPrizes : 360;
  const [rotation, setRotation] = useState(0);

  const defaultSegmentColors = [
    '#00D1FF', '#0052FF', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899',
  ];
  const currentSegmentColors = segmentColorsOverride && segmentColorsOverride.length > 0 ? segmentColorsOverride : defaultSegmentColors;

  useEffect(() => {
    if (numPrizes === 0) return;

    if (isSpinning) {
      const fullSpins = Math.floor(Math.random() * 2) + 4; 
      let targetAngleForPrizeSegment = 0;

      if (winningPrizeId) {
        const winningIndex = prizes.findIndex(p => p.id === winningPrizeId);
        if (winningIndex !== -1) {
          targetAngleForPrizeSegment = -(winningIndex * anglePerSlice + anglePerSlice / 2);
        } else {
          targetAngleForPrizeSegment = Math.random() * -360; 
        }
      } else {
        targetAngleForPrizeSegment = Math.random() * -360;
      }
      
      const newTargetRotation = (fullSpins * 360) + targetAngleForPrizeSegment;
      setRotation(newTargetRotation);

    } else if (!isSpinning && winningPrizeId) {
      const winningIndex = prizes.findIndex(p => p.id === winningPrizeId);
      if (winningIndex !== -1) {
        const finalAngle = -(winningIndex * anglePerSlice + anglePerSlice / 2);
        setRotation(finalAngle);
      }
    }
  }, [isSpinning, winningPrizeId, prizes, anglePerSlice, numPrizes]);

  if (numPrizes === 0) {
    return <div className="text-neutral-500 dark:text-neutral-400 text-center py-10">Adicione prêmios para ativar a roleta.</div>;
  }

  const radius = 150; 
  const center = 160; 
  const textRadius = radius * 0.65;
  
  const centralCircleRadius = radius * 0.28; 
  const centralLogoSize = centralCircleRadius * 1.6; 

  return (
    <div className="relative w-full max-w-xs sm:max-w-sm aspect-square mx-auto my-4">
      <svg viewBox="0 0 320 320" className="w-full h-full select-none">
        <g 
          transform={`rotate(${rotation} ${center} ${center})`}
          style={{ transition: isSpinning ? `transform ${spinDuration}s cubic-bezier(0.25, 0.1, 0.25, 1)` : 'none' }}
        >
          {prizes.map((prize, index) => {
            const startAngle = index * anglePerSlice;
            const endAngle = (index + 1) * anglePerSlice;
            const x1 = center + radius * Math.cos((startAngle - 90) * Math.PI / 180);
            const y1 = center + radius * Math.sin((startAngle - 90) * Math.PI / 180);
            const x2 = center + radius * Math.cos((endAngle - 90) * Math.PI / 180);
            const y2 = center + radius * Math.sin((endAngle - 90) * Math.PI / 180);
            const largeArcFlag = anglePerSlice > 180 ? 1 : 0;

            const midAngleDeg = startAngle + anglePerSlice / 2;
            const midAngleRad = (midAngleDeg - 90) * Math.PI / 180;
            const textX = center + textRadius * Math.cos(midAngleRad);
            const textY = center + textRadius * Math.sin(midAngleRad);
            
            const bgColor = currentSegmentColors[index % currentSegmentColors.length];
            const textColor = getTextColorForBg(bgColor);

            return (
              <g key={prize.id}>
                <path
                  d={`M${center},${center} L${x1},${y1} A${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} Z`}
                  fill={bgColor}
                  stroke="#FFFFFF" 
                  strokeWidth="2"
                />
                <text
                    x={textX}
                    y={textY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={textColor}
                    style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    className="pointer-events-none"
                    transform={`rotate(${midAngleDeg + 90} ${textX} ${textY})`}
                >
                    {prize.name}
                </text>
              </g>
            );
          })}
        </g>
        
        <circle cx={center} cy={center} r={centralCircleRadius + 2} fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1" /> 
        <circle cx={center} cy={center} r={centralCircleRadius} fill="white" stroke="#D1D5DB" strokeWidth="3" />
        
        {companyLogoUrl ? (
          <image 
            href={companyLogoUrl}
            x={center - centralLogoSize / 2} 
            y={center - centralLogoSize / 2} 
            height={centralLogoSize} 
            width={centralLogoSize} 
            clipPath={`url(#centerLogoClip)`} 
            preserveAspectRatio="xMidYMid slice"
          />
        ) : (
          <text 
            x={center} y={center} 
            textAnchor="middle" 
            dominantBaseline="central"
            fill="#4B5563" 
            className="font-semibold"
            style={{ fontSize: '14px' }}
          >
            Logo
          </text>
        )}
        <defs>
            <clipPath id="centerLogoClip">
                <circle cx={center} cy={center} r={centralLogoSize / 2} />
            </clipPath>
        </defs>
      </svg>
      {/* Pointer Arrow */}
      <div 
        className="absolute top-[-4px] left-1/2 -translate-x-1/2 w-0 h-0 z-10"
        style={{
          borderLeft: '12px solid transparent',
          borderRight: '12px solid transparent',
          borderTop: '20px solid #DC2626',
          filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.4))'
        }}
        aria-hidden="true"
      />
    </div>
  );
};