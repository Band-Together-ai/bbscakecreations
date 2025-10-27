const DolphinAnimation = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated Dolphins jumping from the top ocean */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-dolphin-jump"
          style={{
            left: `${10 + i * 30}%`,
            top: '20%',
            animationDelay: `${i * 3}s`,
            animationDuration: '7s',
          }}
        >
          <svg
            width="120"
            height="90"
            viewBox="0 0 120 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-2xl"
          >
            {/* Dolphin main body - curved streamlined shape */}
            <path
              d="M15 45 Q20 30, 35 25 Q50 22, 65 25 Q80 28, 92 35 Q100 42, 102 48 Q102 54, 98 58 Q92 62, 82 63 Q70 64, 55 62 Q40 60, 28 56 Q18 52, 15 45 Z"
              fill="hsl(var(--ocean-deep))"
              opacity="0.95"
            />
            
            {/* Dorsal fin */}
            <path
              d="M60 22 Q62 12, 65 8 Q68 6, 70 10 Q71 15, 68 20 Q66 24, 62 25 L60 22 Z"
              fill="hsl(var(--ocean-deep))"
              opacity="0.9"
            />
            
            {/* Pectoral fin (side fin) */}
            <path
              d="M45 48 Q40 52, 35 58 Q33 60, 32 58 Q32 55, 35 50 Q38 46, 43 44 L45 48 Z"
              fill="hsl(var(--ocean-deep))"
              opacity="0.85"
            />
            
            {/* Tail flukes */}
            <path
              d="M12 42 Q8 38, 4 36 Q2 35, 1 37 Q1 40, 4 43 Q8 46, 12 48 L12 42 Z M12 48 Q8 52, 4 56 Q2 58, 1 56 Q1 53, 4 50 Q8 48, 12 48 Z"
              fill="hsl(var(--ocean-deep))"
              opacity="0.9"
            />
            
            {/* Rostrum (beak/nose) */}
            <path
              d="M100 48 Q105 47, 108 46 Q110 45, 109 47 Q108 49, 105 50 Q102 51, 100 50 L100 48 Z"
              fill="hsl(var(--ocean-deep))"
              opacity="0.9"
            />
            
            {/* Belly highlight - lighter underside */}
            <ellipse
              cx="65"
              cy="52"
              rx="25"
              ry="10"
              fill="hsl(var(--ocean-wave))"
              opacity="0.5"
            />
            
            {/* Body highlight - shiny top */}
            <ellipse
              cx="70"
              cy="38"
              rx="20"
              ry="8"
              fill="white"
              opacity="0.35"
            />
            
            {/* Eye */}
            <circle cx="92" cy="42" r="3" fill="white" opacity="0.9" />
            <circle cx="93" cy="42" r="1.5" fill="hsl(var(--ocean-deep))" />
            
            {/* Water splash effect */}
            <g opacity="0.5">
              <circle cx="15" cy="48" r="3" fill="hsl(var(--ocean-foam))" />
              <circle cx="10" cy="45" r="2" fill="hsl(var(--ocean-foam))" />
              <circle cx="18" cy="52" r="2.5" fill="hsl(var(--ocean-foam))" />
              <circle cx="105" cy="48" r="2" fill="hsl(var(--ocean-foam))" />
              <circle cx="108" cy="52" r="1.5" fill="hsl(var(--ocean-foam))" />
            </g>
          </svg>
        </div>
      ))}
    </div>
  );
};

export default DolphinAnimation;