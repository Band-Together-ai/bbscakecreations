import { TeaserBakeBook } from "@/components/TeaserBakeBook";
import Navigation from "@/components/Navigation";
import WaveBackground from "@/components/WaveBackground";

const BakeBookLanding = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
      <WaveBackground />
      <Navigation />
      <TeaserBakeBook />
    </div>
  );
};

export default BakeBookLanding;
