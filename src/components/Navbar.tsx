import { useEffect, useState } from 'react';
import { PROFILE_CONFIG } from '../config/profile';
import { useLanguage } from '../i18n/LanguageContext';
import type { Language } from '../i18n/types';

interface NavbarProps {
  activeSection: string;
  onOpenPalette: () => void;
}

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'pt', label: 'PT' },
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
];

function formatClock(): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: PROFILE_CONFIG.timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date());
  } catch {
    const d = new Date();
    return d.toTimeString().slice(0, 8);
  }
}

export function Navbar({ activeSection, onOpenPalette }: NavbarProps) {
  const { language, setLanguage, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [clock, setClock] = useState(formatClock);

  const navItems = [
    { id: 'about', num: '01', label: t.nav.about },
    { id: 'development', num: '02', label: t.nav.development },
    { id: 'design', num: '03', label: t.nav.design },
    { id: 'community', num: '04', label: t.nav.community },
    { id: 'areas', num: '05', label: t.nav.areas },
    { id: 'explorer', num: '06', label: t.nav.explorer },
    { id: 'contact', num: '07', label: t.nav.contact },
  ];

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, (y / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setClock(formatClock()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  return (
    <header className={`site-nav ${scrolled ? 'site-nav--solid' : ''}`}>
      <div className="wrap site-nav__inner">
        <a href="#top" className="site-nav__brand">
          <span className="site-nav__square" aria-hidden="true" />
          <span className="site-nav__mark">{PROFILE_CONFIG.brandMark}</span>
          <span className="site-nav__code">{PROFILE_CONFIG.brandCode}</span>
        </a>

        <nav className="site-nav__links" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`site-nav__link ${activeSection === item.id ? 'is-active' : ''}`}
            >
              <span className="site-nav__link-num">{item.num}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="site-nav__right">
          <div className="nav-telemetry" aria-hidden="true">
            <span className="nav-telemetry__dot" />
            <span>{clock}</span>
          </div>

          <button type="button" className="cmd-trigger" onClick={onOpenPalette}>
            <span>{t.nav.commandBtn}</span>
            <kbd>Ctrl K</kbd>
          </button>

          <div className="lang-bar" role="group" aria-label={t.nav.languageLabel}>
            {LANGUAGES.map((item) => (
              <button
                key={item.code}
                type="button"
                className={`lang-bar__btn ${language === item.code ? 'is-active' : ''}`}
                onClick={() => setLanguage(item.code)}
                aria-pressed={language === item.code}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={`menu-btn ${mobileOpen ? 'is-open' : ''}`}
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? t.nav.menuClose : t.nav.menuOpen}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className="site-nav__progress" aria-hidden="true">
        <div className="site-nav__progress-bar" style={{ width: `${progress}%` }} />
      </div>

      {mobileOpen && (
        <div className="mobile-drawer" role="dialog" aria-label="Menu">
          <div className="wrap mobile-drawer__list">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`mobile-drawer__link ${activeSection === item.id ? 'is-active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <span className="mobile-drawer__num">{item.num}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
