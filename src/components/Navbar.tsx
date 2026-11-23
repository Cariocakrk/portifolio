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

export function Navbar({ activeSection, onOpenPalette }: NavbarProps) {
  const { language, setLanguage, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { id: 'about', label: t.nav.about },
    { id: 'development', label: t.nav.development },
    { id: 'design', label: t.nav.design },
    { id: 'community', label: t.nav.community },
    { id: 'areas', label: t.nav.areas },
    { id: 'explorer', label: t.nav.explorer },
    { id: 'contact', label: t.nav.contact },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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
              {item.label}
            </a>
          ))}
        </nav>

        <div className="site-nav__right">
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

      {mobileOpen && (
        <div className="mobile-drawer" role="dialog" aria-label="Menu">
          <div className="wrap mobile-drawer__list">
            {navItems.map((item, idx) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`mobile-drawer__link ${activeSection === item.id ? 'is-active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <span className="mobile-drawer__num">0{idx + 1}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
