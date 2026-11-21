import { useCallback, useEffect, useState } from 'react';
import { CollectionShowcase } from './components/CollectionShowcase';
import { Footer } from './components/Footer';
import { GallerySection } from './components/GallerySection';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { LaravelBlueprintSection } from './components/LaravelBlueprintSection';
import { PhotoboothStudio } from './components/PhotoboothStudio';
import { FrameThemeId, SavedStrip } from './types/photobooth';

export default function App() {
  const [selectedTheme, setSelectedTheme] = useState<FrameThemeId>('blush-daisy');
  const [strips, setStrips] = useState<SavedStrip[]>([]);
  const [galleryLoading, setGalleryLoading] = useState<boolean>(true);

  const fetchGallery = useCallback(async () => {
    setGalleryLoading(true);
    try {
      const response = await fetch('/api/gallery');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.strips)) {
          setStrips(data.strips);
        }
      }
    } catch {
      // Keep empty list on network error
    } finally {
      setGalleryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const scrollToStudio = () => {
    const el = document.getElementById('studio');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectThemeAndScroll = (themeId: FrameThemeId) => {
    setSelectedTheme(themeId);
    scrollToStudio();
  };

  const handleStripSaved = (newStrip: SavedStrip) => {
    setStrips((prev) => [newStrip, ...prev]);
  };

  const handleDeleteStrip = async (id: string) => {
    const response = await fetch(`/api/gallery/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      setStrips((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8FA] text-[#35242D]">
      <Header onStartBooth={scrollToStudio} />

      <main className="flex-1">
        <HeroSection onStartBooth={scrollToStudio} />

        <PhotoboothStudio
          selectedTheme={selectedTheme}
          onSelectTheme={setSelectedTheme}
          onStripSaved={handleStripSaved}
        />

        <CollectionShowcase
          selectedTheme={selectedTheme}
          onSelectAndScroll={handleSelectThemeAndScroll}
        />

        <GallerySection
          strips={strips}
          isLoading={galleryLoading}
          onDeleteStrip={handleDeleteStrip}
          onJumpToStudio={scrollToStudio}
        />

        <LaravelBlueprintSection />
      </main>

      <Footer />
    </div>
  );
}
