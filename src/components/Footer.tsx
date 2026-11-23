import { PROFILE_CONFIG } from '../config/profile';
import { useLanguage } from '../i18n/LanguageContext';
import type { Language } from '../i18n/types';

interface FooterProps {
  onOpenPalette: () => void;
}

const LANGS: { code: Language; label: string }[] = [
  { code: 'pt', label: 'Português' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
];

export function Footer({ onOpenPalette }: FooterProps) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <footer className="site-footer">
      <div className="wrap site-footer__inner">
        <div className="site-footer__left">
          <strong className="site-footer__brand">{PROFILE_CONFIG.brandMark}</strong>
          <span className="site-footer__tagline">{t.footer.tagline}</span>
          <button type="button" className="site-footer__hint" onClick={onOpenPalette}>
            {t.footer.shortcutHint}
          </button>
        </div>

        <div className="site-footer__right">
          <div className="site-footer__langs" role="group" aria-label={t.nav.languageLabel}>
            {LANGS.map((item) => (
              <button
                key={item.code}
                type="button"
                className={`site-footer__lang ${language === item.code ? 'is-active' : ''}`}
                onClick={() => setLanguage(item.code)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <a href="#top" className="site-footer__top">
            {t.footer.backToTop}
          </a>
        </div>
      </div>
    </footer>
  );
}
