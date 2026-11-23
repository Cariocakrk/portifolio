import { useEffect, useMemo, useState } from 'react';
import { AboutSection } from './components/AboutSection';
import { AreasSection } from './components/AreasSection';
import { CommandPalette } from './components/CommandPalette';
import { CommunitySection } from './components/CommunitySection';
import { CompetencyExplorer } from './components/CompetencyExplorer';
import { ContactSection } from './components/ContactSection';
import { DesignSection } from './components/DesignSection';
import { DevelopmentSection } from './components/DevelopmentSection';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { Navbar } from './components/Navbar';
import { useActiveSection } from './hooks/useActiveSection';
import { LanguageProvider } from './i18n/LanguageContext';

function PortfolioShell() {
  const [paletteOpen, setPaletteOpen] = useState(false);

  const sectionIds = useMemo(
    () => ['top', 'about', 'development', 'design', 'community', 'areas', 'explorer', 'contact'],
    []
  );
  const activeSection = useActiveSection(sectionIds);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>('.band'));
    if (targets.length === 0) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: '0px 0px -30px 0px' }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="page-root">
      <Navbar activeSection={activeSection} onOpenPalette={() => setPaletteOpen(true)} />
      <main id="main-content">
        <Hero />
        <AboutSection />
        <DevelopmentSection />
        <DesignSection />
        <CommunitySection />
        <AreasSection />
        <CompetencyExplorer />
        <ContactSection />
      </main>
      <Footer onOpenPalette={() => setPaletteOpen(true)} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <PortfolioShell />
    </LanguageProvider>
  );
}

export default App;
