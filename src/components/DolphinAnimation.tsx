const DolphinAnimation = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated Dolphins */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-dolphin-jump"
          style={{
            left: `${15 + i * 35}%`,
            bottom: '8%',
            animationDelay: `${i * 2.5}s`,
            animationDuration: '6s',
          }}
        >
          <svg
            width="80"
            height="60"
            viewBox="0 0 80 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-lg"
          >
            {/* Dolphin body */}
            <path
              d="M10 35C10 35 15 20 25 15C35 10 45 10 55 15C65 20 70 30 70 35C70 40 65 45 60 47C55 49 45 50 35 48C25 46 15 42 10 35Z"
              fill="hsl(var(--ocean-wave))"
              opacity="0.9"
            />
            {/* Dolphin fin */}
            <path
              d="M40 15C40 15 42 8 45 5C48 2 50 8 48 12C46 16 43 18 40 15Z"
              fill="hsl(var(--ocean-wave))"
              opacity="0.8"
            />
            {/* Dolphin tail */}
            <path
              d="M12 37C12 37 5 35 2 38C-1 41 0 45 5 44C10 43 12 40 12 37Z"
              fill="hsl(var(--ocean-wave))"
              opacity="0.8"
            />
            {/* Eye */}
            <circle cx="58" cy="28" r="2" fill="white" />
            <circle cx="59" cy="28" r="1" fill="hsl(var(--ocean-deep))" />
            {/* Highlight on body */}
            <ellipse
              cx="50"
              cy="28"
              rx="15"
              ry="8"
              fill="white"
              opacity="0.3"
            />
          </svg>
        </div>
      ))}
    </div>
  );
};

export default DolphinAnimation;