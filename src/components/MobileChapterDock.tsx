import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface MobileChapterDockProps {
  activeSection: string;
}

export function MobileChapterDock({ activeSection }: MobileChapterDockProps) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const fillRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;

      setVisible(y > 260);
      if (fillRef.current) {
        fillRef.current.style.transform = `scaleX(${ratio})`;
      }
      const nextPct = Math.round(ratio * 100);
      setProgressPct((prev) => (prev === nextPct ? prev : nextPct));
    };

    const onScroll = () => {
      if (!raf) {
        raf = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  const chapters: Record<string, { num: string; label: string }> = {
    top: { num: '00', label: 'Hero' },
    about: { num: '01', label: t.nav.about },
    development: { num: '02', label: t.nav.development },
    design: { num: '03', label: t.nav.design },
    community: { num: '04', label: t.nav.community },
    areas: { num: '05', label: t.nav.areas },
    explorer: { num: '06', label: t.nav.explorer },
    contact: { num: '07', label: t.nav.contact },
  };

  const current = chapters[activeSection] ?? chapters.top;

  return (
    <div
      className={`mobile-dock ${visible ? 'is-visible' : ''}`}
      aria-hidden={!visible}
    >
      <div className="mobile-dock__info">
        <span className="mobile-dock__num">{current.num}</span>
        <span className="mobile-dock__label">{current.label}</span>
      </div>

      <div className="mobile-dock__track" aria-hidden="true">
        <div ref={fillRef} className="mobile-dock__fill" />
      </div>

      <span className="mobile-dock__pct">{progressPct}%</span>

      <a
        href="#top"
        className="mobile-dock__top"
        aria-label={t.footer.backToTop}
      >
        ↑
      </a>
    </div>
  );
}
