import { AnnouncementBar } from "@/components/theme/AnnouncementBar";
import { Footer } from "@/components/theme/Footer";
import { Header } from "@/components/theme/Header";
import { HeroVideo } from "@/components/theme/HeroVideo";
import { ImageGrid } from "@/components/theme/ImageGrid";
import { SlideshowHero } from "@/components/theme/SlideshowHero";
import { TextAndImage } from "@/components/theme/TextAndImage";
import { TextWithIcons } from "@/components/theme/TextWithIcons";

/**
 * Homepage. Section order mirrors the reference exactly:
 * video hero -> journal -> dresses hero -> collection tiles -> value props.
 */
export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main id="MainContent" className="flex-1">
        <HeroVideo />
        <TextAndImage />
        <SlideshowHero />
        <ImageGrid />
        <TextWithIcons />
      </main>
      <Footer />
    </>
  );
}
