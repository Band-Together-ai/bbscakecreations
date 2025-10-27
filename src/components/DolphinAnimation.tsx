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
            width="160"
            height="100"
            viewBox="0 0 160 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-2xl"
          >
            {/* Main body - sleek torpedo shape */}
            <ellipse
              cx="80"
              cy="50"
              rx="45"
              ry="18"
              fill="hsl(var(--ocean-deep))"
              opacity="0.95"
            />
            
            {/* Head/rostrum - distinctive pointed beak */}
            <path
              d="M125 50 Q135 49, 145 48 L145 52 Q135 51, 125 50 Z"
              fill="hsl(var(--ocean-deep))"
              opacity="0.95"
            />
            <ellipse
              cx="115"
              cy="50"
              rx="25"
              ry="16"
              fill="hsl(var(--ocean-deep))"
              opacity="0.95"
            />
            
            {/* Dorsal fin - curved and prominent */}
            <path
              d="M85 32 Q88 20, 92 15 Q94 18, 95 25 Q95 30, 92 33 L85 32 Z"
              fill="hsl(var(--ocean-deep))"
              opacity="0.95"
            />
            
            {/* Tail section - tapered body */}
            <ellipse
              cx="45"
              cy="50"
              rx="20"
              ry="14"
              fill="hsl(var(--ocean-deep))"
              opacity="0.95"
            />
            
            {/* Tail flukes - horizontal (not vertical!) */}
            <path
              d="M25 45 Q15 40, 8 38 Q5 37, 3 40 Q2 43, 5 45 Q12 47, 20 48 L25 45 Z"
              fill="hsl(var(--ocean-deep))"
              opacity="0.95"
            />
            <path
              d="M25 55 Q15 60, 8 62 Q5 63, 3 60 Q2 57, 5 55 Q12 53, 20 52 L25 55 Z"
              fill="hsl(var(--ocean-deep))"
              opacity="0.95"
            />
            
            {/* Pectoral fin - angled backward */}
            <path
              d="M95 58 Q90 65, 85 72 Q83 74, 82 72 Q83 68, 87 62 Q91 57, 95 56 L95 58 Z"
              fill="hsl(var(--ocean-deep))"
              opacity="0.85"
            />
            
            {/* Belly - lighter underside for dimension */}
            <ellipse
              cx="85"
              cy="58"
              rx="38"
              ry="10"
              fill="hsl(var(--ocean-wave))"
              opacity="0.6"
            />
            
            {/* Body highlight - shiny wet surface */}
            <ellipse
              cx="90"
              cy="42"
              rx="30"
              ry="8"
              fill="white"
              opacity="0.4"
            />
            
            {/* Eye - positioned correctly on head */}
            <circle cx="120" cy="45" r="3.5" fill="white" opacity="0.95" />
            <circle cx="121" cy="45" r="2" fill="#1a1a1a" />
            <circle cx="121.5" cy="44.5" r="0.8" fill="white" opacity="0.8" />
            
            {/* Mouth line - subtle smile */}
            <path
              d="M135 52 Q130 54, 125 54"
              stroke="hsl(var(--ocean-deep))"
              strokeWidth="1.5"
              opacity="0.6"
              fill="none"
            />
            
            {/* Water splash effects - at tail and head */}
            <g opacity="0.6">
              <circle cx="20" cy="48" r="4" fill="hsl(var(--ocean-foam))" />
              <circle cx="15" cy="52" r="3" fill="hsl(var(--ocean-foam))" />
              <circle cx="25" cy="45" r="2.5" fill="hsl(var(--ocean-foam))" />
              <circle cx="12" cy="45" r="2" fill="hsl(var(--ocean-foam))" />
              <circle cx="148" cy="50" r="2.5" fill="hsl(var(--ocean-foam))" />
              <circle cx="145" cy="53" r="2" fill="hsl(var(--ocean-foam))" />
              <circle cx="150" cy="47" r="1.8" fill="hsl(var(--ocean-foam))" />
            </g>
          </svg>
        </div>
      ))}
    </div>
  );
};

export default DolphinAnimation;