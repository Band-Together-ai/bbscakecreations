const DolphinSwim = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <svg
        className="absolute animate-swim"
        style={{ animationDelay: '0s' }}
        width="60"
        height="40"
        viewBox="0 0 60 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 20C10 20 15 10 25 15C35 20 40 15 45 18C50 21 55 25 55 25C55 25 50 30 45 27C40 24 35 28 25 23C15 18 10 28 10 28V20Z"
          fill="currentColor"
          className="text-ocean-wave"
        />
      </svg>
      <svg
        className="absolute animate-swim"
        style={{ animationDelay: '7s', top: '30%' }}
        width="50"
        height="35"
        viewBox="0 0 60 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 20C10 20 15 10 25 15C35 20 40 15 45 18C50 21 55 25 55 25C55 25 50 30 45 27C40 24 35 28 25 23C15 18 10 28 10 28V20Z"
          fill="currentColor"
          className="text-ocean-deep"
        />
      </svg>
      <svg
        className="absolute animate-swim"
        style={{ animationDelay: '14s', top: '60%' }}
        width="55"
        height="38"
        viewBox="0 0 60 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 20C10 20 15 10 25 15C35 20 40 15 45 18C50 21 55 25 55 25C55 25 50 30 45 27C40 24 35 28 25 23C15 18 10 28 10 28V20Z"
          fill="currentColor"
          className="text-ocean-wave/70"
        />
      </svg>
    </div>
  );
};

export default DolphinSwim;
