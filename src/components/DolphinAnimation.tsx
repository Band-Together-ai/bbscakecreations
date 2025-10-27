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
          <div className="transform -rotate-8">
            <svg
              width="160"
              height="90"
              viewBox="0 0 180 90"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-2xl"
            >
              {/* Body silhouette */}
              <path
                d="M22 48
                   C38 32, 76 22, 118 28
                   C138 31, 152 38, 160 44
                   C149 45, 140 48, 132 53
                   C118 61, 90 70, 60 67
                   C40 65, 28 58, 22 50 Z"
                fill="hsl(var(--ocean-deep))"
                opacity="0.95"
              />

              {/* Rostrum (beak) */}
              <path
                d="M160 44 Q170 42, 176 41 L176 49 Q170 48, 160 46 Z"
                fill="hsl(var(--ocean-deep))"
              />

              {/* Dorsal fin */}
              <path
                d="M96 26 Q100 12, 106 6 Q108 9, 107 18 Q106 26, 101 30 L96 26 Z"
                fill="hsl(var(--ocean-deep))"
              />

              {/* Tail flukes (horizontal) */}
              <path d="M20 46 L8 38 L10 45 L20 49 Z" fill="hsl(var(--ocean-deep))" />
              <path d="M20 50 L8 58 L10 51 L20 49 Z" fill="hsl(var(--ocean-deep))" />

              {/* Pectoral fin */}
              <path
                d="M110 56 Q104 64, 100 70 Q99 72, 100 68 Q103 61, 109 54 L110 56 Z"
                fill="hsl(var(--ocean-deep))"
                opacity="0.9"
              />

              {/* Eye */}
              <circle cx="145" cy="40" r="3" fill="white" opacity="0.95" />
              <circle cx="146" cy="40" r="1.6" fill="hsl(var(--ocean-deep))" />

              {/* Belly tint */}
              <ellipse cx="105" cy="58" rx="42" ry="9" fill="hsl(var(--ocean-wave))" opacity="0.55" />

              {/* Subtle highlight */}
              <ellipse cx="120" cy="36" rx="24" ry="6" fill="white" opacity="0.35" />

              {/* Splash droplets */}
              <g opacity="0.6">
                <circle cx="14" cy="48" r="3" fill="hsl(var(--ocean-foam))" />
                <circle cx="12" cy="53" r="2" fill="hsl(var(--ocean-foam))" />
                <circle cx="172" cy="45" r="2.2" fill="hsl(var(--ocean-foam))" />
                <circle cx="168" cy="49" r="1.6" fill="hsl(var(--ocean-foam))" />
              </g>
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DolphinAnimation;