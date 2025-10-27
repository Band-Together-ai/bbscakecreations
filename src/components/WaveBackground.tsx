const WaveBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Ocean gradient at the top */}
      <div 
        className="absolute top-0 left-0 right-0 opacity-40"
        style={{ 
          height: '35%',
          background: 'linear-gradient(180deg, hsl(var(--ocean-wave)) 0%, hsl(var(--ocean-foam)) 60%, transparent 100%)'
        }}
      />
      
      {/* Animated waves at the top */}
      <svg
        className="absolute top-0 w-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{ height: '35%' }}
      >
        <path
          className="animate-wave opacity-25"
          fill="hsl(var(--ocean-wave))"
          d="M0,160L48,165.3C96,171,192,181,288,186.7C384,192,480,192,576,176C672,160,768,128,864,128C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
        />
        <path
          className="animate-wave-reverse opacity-15"
          fill="hsl(var(--ocean-foam))"
          d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,208C960,192,1056,160,1152,154.7C1248,149,1344,171,1392,181.3L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
        />
      </svg>
      
      {/* Floating bubbles */}
      <div className="absolute inset-0">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-ocean-foam/30 animate-bubble"
            style={{
              width: `${Math.random() * 15 + 8}px`,
              height: `${Math.random() * 15 + 8}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 40}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${Math.random() * 4 + 5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default WaveBackground;
