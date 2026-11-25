import { useState } from 'react';
import { PROFILE_CONFIG } from '../config/profile';
import { useLanguage } from '../i18n/LanguageContext';

export function ContactSection() {
  const { t } = useLanguage();
  const [copiedField, setCopiedField] = useState<'email' | 'discord' | null>(null);

  const handleCopy = async (field: 'email' | 'discord', value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      window.setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Ignore clipboard permission errors
    }
  };

  return (
    <section id="contact" className="band band--contact" data-theme="carbon">
      <div className="wrap">
        <span className="chapter-tag">{t.contact.index}</span>

        <h2 className="contact-display">
          {t.contact.headlineStart}
          <em className="serif-italic serif-italic--vermilion">{t.contact.headlineItalic}</em>
          {t.contact.headlineEnd}
        </h2>

        <div className="contact-split">
          <div>
            <p className="chapter-intro">{t.contact.subtitle}</p>
            <div className="contact-scopes-list">
              <span className="micro-label">{t.contact.scopesLabel}</span>
              <ul className="dash-list">
                {t.contact.scopes.map((scope) => (
                  <li key={scope}>
                    <span className="dash-list__mark" aria-hidden="true">
                      —
                    </span>
                    <span>{scope}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="contact-right">
            <div className="contact-rows">
              <div className="contact-row contact-row--split">
                <a
                  href={`mailto:${PROFILE_CONFIG.contact.email}`}
                  className="contact-row__main"
                >
                  <span className="contact-row__label">{t.contact.emailLabel}</span>
                  <strong className="contact-row__value">{PROFILE_CONFIG.contact.email}</strong>
                </a>
                <div className="contact-row__actions">
                  <a
                    href={`mailto:${PROFILE_CONFIG.contact.email}`}
                    className="contact-row__pill"
                  >
                    Email ↗
                  </a>
                  <button
                    type="button"
                    className="contact-row__action"
                    onClick={() => handleCopy('email', PROFILE_CONFIG.contact.email)}
                  >
                    {copiedField === 'email' ? `${t.contact.copiedLabel} ✓` : `${t.contact.copyLabel}`}
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="contact-row"
                onClick={() => handleCopy('discord', PROFILE_CONFIG.contact.discord)}
              >
                <span className="contact-row__label">{t.contact.discordLabel}</span>
                <strong className="contact-row__value">{PROFILE_CONFIG.contact.discord}</strong>
                <span className="contact-row__action">
                  {copiedField === 'discord' ? `${t.contact.copiedLabel} ✓` : `${t.contact.copyLabel} ↗`}
                </span>
              </button>
            </div>

            <div className="contact-arch-card">
              <span className="mono-meta">{t.contact.architectureSummaryLabel}</span>
              <p>{t.contact.architectureSummary}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
