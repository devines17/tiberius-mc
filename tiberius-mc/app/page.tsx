import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { CitiesNations } from "@/components/home/CitiesNations";
import { WarPvp } from "@/components/home/WarPvp";
import { Diplomacy } from "@/components/home/Diplomacy";
import { MapPreview } from "@/components/home/MapPreview";
import { News } from "@/components/home/News";
import { JoinGuide } from "@/components/home/JoinGuide";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <CitiesNations />
      <WarPvp />
      <Diplomacy />
      <MapPreview />
      <News />
      <JoinGuide />
    </>
  );
}
