import { useLanguage } from '../i18n/LanguageContext';
import { HeroMeshCanvas } from './HeroMeshCanvas';

export function Hero() {
  const { t } = useLanguage();

  return (
    <section id="top" className="hero-section">
      <div className="wrap">
        <div className="hero-top-bar">
          <span className="mono-tag">{t.hero.eyebrow}</span>
          <span className="mono-tag mono-tag--vermilion">{t.hero.availability}</span>
        </div>

        <div className="hero-split">
          <div className="hero-copy">
            <h1 className="hero-heading">
              {t.hero.headlineStart}
              <em className="hero-heading__italic">{t.hero.headlineItalic}</em>
              {t.hero.headlineEnd}
            </h1>

            <p className="hero-sub">{t.hero.subheadline}</p>

            <div className="hero-actions">
              <a href="#explorer" className="ed-btn ed-btn--ink">
                <span>{t.hero.ctaPrimary}</span>
                <span aria-hidden="true">↗</span>
              </a>
              <a href="#development" className="ed-btn ed-btn--ghost-light">
                <span>{t.hero.ctaSecondary}</span>
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          <figure className="mesh-viewport" aria-label={t.hero.meshLabel}>
            <HeroMeshCanvas />
            <figcaption className="mesh-viewport__bar">
              <span className="mesh-viewport__label">{t.hero.meshLabel}</span>
              <span className="mesh-viewport__hint">{t.hero.meshHint}</span>
            </figcaption>
          </figure>
        </div>

        <div className="hero-metrics">
          <a href="#development" className="metric-card">
            <div className="metric-card__head">
              <span className="metric-card__num">{t.hero.stats.dev.num}</span>
              <span className="metric-card__unit">{t.hero.stats.dev.unit}</span>
            </div>
            <strong className="metric-card__label">{t.hero.stats.dev.label}</strong>
            <span className="metric-card__detail">{t.hero.stats.dev.detail}</span>
          </a>

          <a href="#design" className="metric-card">
            <div className="metric-card__head">
              <span className="metric-card__num">{t.hero.stats.design.num}</span>
              <span className="metric-card__unit">{t.hero.stats.design.unit}</span>
            </div>
            <strong className="metric-card__label">{t.hero.stats.design.label}</strong>
            <span className="metric-card__detail">{t.hero.stats.design.detail}</span>
          </a>

          <a href="#community" className="metric-card">
            <div className="metric-card__head">
              <span className="metric-card__num">{t.hero.stats.community.num}</span>
              <span className="metric-card__unit">{t.hero.stats.community.unit}</span>
            </div>
            <strong className="metric-card__label">{t.hero.stats.community.label}</strong>
            <span className="metric-card__detail">{t.hero.stats.community.detail}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
