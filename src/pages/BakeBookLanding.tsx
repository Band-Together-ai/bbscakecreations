import { TeaserBakeBook } from "@/components/TeaserBakeBook";
import Navigation from "@/components/Navigation";
import WaveBackground from "@/components/WaveBackground";
import { FloatingCTA } from "@/components/FloatingCTA";

const BakeBookLanding = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
      <WaveBackground />
      <Navigation />
      <TeaserBakeBook />
      <FloatingCTA page="bakebook" />
    </div>
  );
};

export default BakeBookLanding;
