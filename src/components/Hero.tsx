import { useState } from 'react';
import { PROFILE_CONFIG } from '../config/profile';
import { useLanguage } from '../i18n/LanguageContext';
import { HeroMeshCanvas, type MeshSimMode, type MeshTelemetry } from './HeroMeshCanvas';

export function Hero() {
  const { t } = useLanguage();
  const [simMode, setSimMode] = useState<MeshSimMode>('wave');
  const [pulseCount, setPulseCount] = useState(0);
  const [telemetry, setTelemetry] = useState<MeshTelemetry>({
    fps: 60,
    pointerX: 0,
    pointerY: 0,
    vertices: 1457,
  });

  const modes: { id: MeshSimMode; label: string }[] = [
    { id: 'wave', label: t.hero.meshModes.wave },
    { id: 'vortex', label: t.hero.meshModes.vortex },
    { id: 'architectural', label: t.hero.meshModes.architectural },
  ];

  return (
    <section id="top" className="hero-section" data-theme="paper">
      <div className="wrap">
        <div className="hero-top-bar">
          <div className="hero-top-bar__left">
            <span className="mono-tag">{t.hero.eyebrow}</span>
            <span className="hero-top-bar__sep" aria-hidden="true">
              /
            </span>
            <span className="mono-tag">{PROFILE_CONFIG.editionCode}</span>
            <span className="hero-top-bar__sep" aria-hidden="true">
              /
            </span>
            <span className="mono-tag">{PROFILE_CONFIG.locationCode}</span>
          </div>

          <span className="status-pill">
            <span className="status-pill__dot" aria-hidden="true" />
            {PROFILE_CONFIG.availabilityStatus ? t.hero.availability : t.hero.unavailable}
          </span>
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
              <a href="#development" className="ed-btn ed-btn--ink">
                <span>{t.hero.ctaPrimary}</span>
                <span aria-hidden="true">↘</span>
              </a>
              <a href="#design" className="ed-btn ed-btn--ghost-light">
                <span>{t.hero.ctaSecondary}</span>
                <span aria-hidden="true">→</span>
              </a>
              <a href="#explorer" className="ed-btn ed-btn--quiet">
                <span>{t.hero.ctaTertiary}</span>
              </a>
            </div>
          </div>

          <figure className="mesh-viewport" aria-label={t.hero.meshLabel}>
            <div className="mesh-viewport__hud-top">
              <div className="mesh-viewport__modes" role="tablist" aria-label="3D Simulation Mode">
                {modes.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    role="tab"
                    aria-selected={simMode === m.id}
                    className={`mesh-mode-btn ${simMode === m.id ? 'is-active' : ''}`}
                    onClick={() => setSimMode(m.id)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="mesh-pulse-btn"
                onClick={() => setPulseCount((c) => c + 1)}
              >
                <span>◎</span>
                <span>{t.hero.meshPulseBtn}</span>
              </button>
            </div>

            <div className="mesh-viewport__stage">
              <HeroMeshCanvas
                mode={simMode}
                pulseCount={pulseCount}
                onTelemetry={setTelemetry}
              />
              <div className="mesh-viewport__coords" aria-hidden="true">
                <span>{telemetry.fps} FPS</span>
                <span>{telemetry.vertices} VTX</span>
                <span>
                  X:{telemetry.pointerX >= 0 ? '+' : ''}
                  {telemetry.pointerX.toFixed(2)} Y:{telemetry.pointerY >= 0 ? '+' : ''}
                  {telemetry.pointerY.toFixed(2)}
                </span>
              </div>
            </div>

            <figcaption className="mesh-viewport__bar">
              <span className="mesh-viewport__label">{t.hero.meshLabel}</span>
              <span className="mesh-viewport__hint">{t.hero.meshHint}</span>
            </figcaption>
          </figure>
        </div>

        <div className="hero-metrics">
          <a href="#development" className="metric-card">
            <div className="metric-card__top">
              <div className="metric-card__head">
                <span className="metric-card__num">{t.hero.stats.dev.num}</span>
                <span className="metric-card__unit">{t.hero.stats.dev.unit}</span>
              </div>
              <span className="metric-card__spec">{t.hero.stats.dev.spec}</span>
            </div>
            <strong className="metric-card__label">{t.hero.stats.dev.label}</strong>
            <span className="metric-card__detail">{t.hero.stats.dev.detail}</span>
          </a>

          <a href="#design" className="metric-card">
            <div className="metric-card__top">
              <div className="metric-card__head">
                <span className="metric-card__num">{t.hero.stats.design.num}</span>
                <span className="metric-card__unit">{t.hero.stats.design.unit}</span>
              </div>
              <span className="metric-card__spec">{t.hero.stats.design.spec}</span>
            </div>
            <strong className="metric-card__label">{t.hero.stats.design.label}</strong>
            <span className="metric-card__detail">{t.hero.stats.design.detail}</span>
          </a>

          <a href="#community" className="metric-card">
            <div className="metric-card__top">
              <div className="metric-card__head">
                <span className="metric-card__num">{t.hero.stats.community.num}</span>
                <span className="metric-card__unit">{t.hero.stats.community.unit}</span>
              </div>
              <span className="metric-card__spec">{t.hero.stats.community.spec}</span>
            </div>
            <strong className="metric-card__label">{t.hero.stats.community.label}</strong>
            <span className="metric-card__detail">{t.hero.stats.community.detail}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
