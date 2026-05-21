import { FeatureGrid } from "@/components/home/FeatureGrid";
import { HomeHero } from "@/components/home/HomeHero";

export default function HomePage() {
  return (
    <div className="pb-8">
      <HomeHero />
      <FeatureGrid />
    </div>
  );
}
