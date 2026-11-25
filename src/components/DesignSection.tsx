import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { InterfaceStudio, type DesignStudioMode } from './InterfaceStudio';

interface DesignSectionProps {
  studioMode: DesignStudioMode;
  onStudioModeChange: (mode: DesignStudioMode) => void;
}

export function DesignSection({ studioMode, onStudioModeChange }: DesignSectionProps) {
  const { t } = useLanguage();
  const [showGrid, setShowGrid] = useState(false);

  return (
    <section
      id="design"
      data-theme="paper"
      className={`band design-band ${showGrid ? 'is-grid-visible' : ''}`}
    >
      {showGrid && (
        <div className="live-grid-overlay" aria-hidden="true">
          <div className="wrap live-grid-overlay__cols">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="live-grid-overlay__col">
                <span>{String(i + 1).padStart(2, '0')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="wrap design-band__content">
        <div className="chapter-head">
          <div className="chapter-head__left">
            <span className="chapter-tag">{t.design.index}</span>
            <h2 className="display-h2 display-h2--mixed">
              {t.design.headlineStart}
              <em className="serif-italic serif-italic--vermilion">{t.design.headlineItalic}</em>
              {t.design.headlineEnd}
            </h2>
          </div>

          <div className="chapter-metric chapter-metric--dark">
            <span className="chapter-metric__num">{t.design.yearsNum}</span>
            <span className="chapter-metric__label">{t.design.yearsLabel}</span>
            <button
              type="button"
              className={`grid-inspect-btn ${showGrid ? 'is-active' : ''}`}
              onClick={() => setShowGrid((prev) => !prev)}
              aria-pressed={showGrid}
            >
              {showGrid ? t.design.gridToggleOn : t.design.gridToggleOff}
            </button>
          </div>
        </div>

        <InterfaceStudio mode={studioMode} onModeChange={onStudioModeChange} />

        <div className="design-editorial-split">
          <div className="design-editorial-split__left">
            <p className="copy-lg">{t.design.intro}</p>

            <div className="design-duet">
              <article className="design-duet__block">
                <h3>{t.design.focusSplit.webTitle}</h3>
                <p>{t.design.focusSplit.webDesc}</p>
              </article>

              <article className="design-duet__block">
                <h3>{t.design.focusSplit.gamesTitle}</h3>
                <p>{t.design.focusSplit.gamesDesc}</p>
              </article>
            </div>
          </div>

          <div className="design-editorial-split__right">
            <div className="ledger-block__header">
              <span className="micro-label">{t.design.competenciesLabel}</span>
              <span className="mono-meta">01 — 0{t.design.competencies.length}</span>
            </div>

            <ol className="numbered-list numbered-list--paper">
              {t.design.competencies.map((item, idx) => (
                <li key={item} className="numbered-list__item">
                  <span className="mono-index">{String(idx + 1).padStart(2, '0')}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
