import type { Language } from '../i18n/types';

interface LanguageFlagProps {
  lang: Language;
  className?: string;
}

/**
 * Crisp inline SVG flags so all platforms (including Windows) render
 * consistent national flags instead of two-letter fallback glyphs.
 */
export function LanguageFlag({ lang, className = 'lang-flag' }: LanguageFlagProps) {
  if (lang === 'en') {
    return (
      <svg
        className={className}
        viewBox="0 0 24 16"
        width="18"
        height="12"
        aria-hidden="true"
      >
        <rect width="24" height="16" rx="1.5" fill="#B22234" />
        <path
          d="M0 2.5h24M0 5.5h24M0 8.5h24M0 11.5h24M0 14.5h24"
          stroke="#FFFFFF"
          strokeWidth="1.25"
        />
        <rect width="10.5" height="8.5" rx="1" fill="#3C3B6E" />
        <circle cx="2.5" cy="2.2" r="0.55" fill="#FFFFFF" />
        <circle cx="5.2" cy="2.2" r="0.55" fill="#FFFFFF" />
        <circle cx="7.9" cy="2.2" r="0.55" fill="#FFFFFF" />
        <circle cx="3.8" cy="4.2" r="0.55" fill="#FFFFFF" />
        <circle cx="6.6" cy="4.2" r="0.55" fill="#FFFFFF" />
        <circle cx="2.5" cy="6.2" r="0.55" fill="#FFFFFF" />
        <circle cx="5.2" cy="6.2" r="0.55" fill="#FFFFFF" />
        <circle cx="7.9" cy="6.2" r="0.55" fill="#FFFFFF" />
      </svg>
    );
  }

  if (lang === 'pt') {
    return (
      <svg
        className={className}
        viewBox="0 0 24 16"
        width="18"
        height="12"
        aria-hidden="true"
      >
        <rect width="24" height="16" rx="1.5" fill="#009B3A" />
        <polygon points="12,2 21.5,8 12,14 2.5,8" fill="#FEDF00" />
        <circle cx="12" cy="8" r="3.4" fill="#002776" />
        <path
          d="M8.9 7.4c1.9-.6 4.3-.4 6.2.7"
          stroke="#FFFFFF"
          strokeWidth="0.7"
          fill="none"
        />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 24 16"
      width="18"
      height="12"
      aria-hidden="true"
    >
      <rect width="24" height="16" rx="1.5" fill="#AA151B" />
      <rect y="4" width="24" height="8" fill="#F1BF00" />
      <rect x="5" y="6" width="2.4" height="4" rx="0.6" fill="#AA151B" />
    </svg>
  );
}
