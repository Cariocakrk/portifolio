import { useEffect, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface ChapterRailProps {
  activeSection: string;
}

export function ChapterRail({ activeSection }: ChapterRailProps) {
  const { t } = useLanguage();
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const updateScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) {
        setScrollPct(0);
        return;
      }
      setScrollPct(Math.min(100, Math.max(0, Math.round((window.scrollY / max) * 100))));
    };
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll);
    return () => {
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
    };
  }, []);

  const chapters = [
    { id: 'top', code: '00', label: 'TOP' },
    { id: 'about', code: '01', label: t.nav.about },
    { id: 'development', code: '02', label: t.nav.development },
    { id: 'design', code: '03', label: t.nav.design },
    { id: 'community', code: '04', label: t.nav.community },
    { id: 'areas', code: '05', label: t.nav.areas },
    { id: 'explorer', code: '06', label: t.nav.explorer },
    { id: 'contact', code: '07', label: t.nav.contact },
  ];

  return (
    <aside className="chapter-rail" aria-label="Chapter index">
      <div className="chapter-rail__readout">{String(scrollPct).padStart(2, '0')}%</div>
      <div className="chapter-rail__track">
        <div className="chapter-rail__fill" style={{ height: `${scrollPct}%` }} />
      </div>
      <nav className="chapter-rail__ticks">
        {chapters.map((ch) => {
          const isCurrent = activeSection === ch.id;
          return (
            <a
              key={ch.id}
              href={`#${ch.id}`}
              className={`chapter-rail__tick ${isCurrent ? 'is-active' : ''}`}
              title={`${ch.code} · ${ch.label}`}
            >
              <span className="chapter-rail__code">{ch.code}</span>
              <span className="chapter-rail__line" />
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
