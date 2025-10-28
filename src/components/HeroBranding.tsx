import logoSquare from "@/assets/logo-square-transparent.png";

const HeroBranding = () => {
  return (
    <div className="relative h-32 md:h-40 overflow-hidden pointer-events-none">
      {/* Decorative wave layer */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
      >
        {/* First wave */}
        <path
          className="animate-wave opacity-20"
          fill="hsl(var(--ocean-wave))"
          d="M0,96L48,90.7C96,85,192,75,288,80C384,85,480,107,576,112C672,117,768,107,864,96C960,85,1056,75,1152,74.7C1248,75,1344,85,1392,90.7L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
        />
        
        {/* Second wave */}
        <path
          className="animate-wave-reverse opacity-15"
          fill="hsl(var(--ocean-foam))"
          d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,85.3C1248,85,1344,75,1392,69.3L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
        />
        
        {/* Third subtle wave */}
        <path
          className="animate-wave opacity-10"
          fill="hsl(var(--ocean-deep))"
          d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,42.7C960,43,1056,53,1152,53.3C1248,53,1344,43,1392,37.3L1440,32L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
        />
      </svg>

      {/* Logo overlay with tagline */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-auto">
        <img 
          src={logoSquare} 
          alt="BB's Cake Creations Logo" 
          className="w-20 h-20 md:w-24 md:h-24 opacity-80 animate-float"
        />
        <p className="text-sm md:text-base font-quicksand italic text-ocean-deep/70">
          From Scratch, With Love
        </p>
      </div>
    </div>
  );
};

export default HeroBranding;
