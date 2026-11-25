import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export function AboutSection() {
  const { t } = useLanguage();
  const [activeConvIndex, setActiveConvIndex] = useState(0);

  const pillars = [t.about.pillars.dev, t.about.pillars.design, t.about.pillars.community];
  const activeConv = t.about.convergences[activeConvIndex] ?? t.about.convergences[0];

  return (
    <section id="about" className="band" data-theme="paper">
      <div className="wrap">
        <div className="editorial-grid">
          <aside className="editorial-grid__rail">
            <span className="chapter-tag">{t.about.index}</span>

            <div className="rail-specs">
              <span className="micro-label">{t.about.specsTitle}</span>
              <dl className="rail-specs__list">
                {t.about.specs.map((spec) => (
                  <div key={spec.label} className="rail-specs__row">
                    <dt>{spec.label}</dt>
                    <dd>{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>

          <div className="editorial-grid__body">
            <h2 className="editorial-statement">{t.about.title}</h2>

            <div className="two-col-copy">
              <div>
                <span className="micro-label">{t.about.aboutLabel}</span>
                <p className="copy-lg">{t.about.aboutParagraphs[0]}</p>
                <p className="copy-base">{t.about.aboutParagraphs[1]}</p>
              </div>

              <div>
                <span className="micro-label">{t.about.profileLabel}</span>
                <p className="copy-serif-lead">{t.about.profileLead}</p>
                <p className="copy-base">{t.about.profileParagraphs[0]}</p>
                <p className="copy-base">{t.about.profileParagraphs[1]}</p>
                <p className="copy-base">{t.about.profileParagraphs[2]}</p>
              </div>
            </div>

            <div className="pillar-ledger">
              {pillars.map((pillar) => (
                <article key={pillar.index} className="pillar-ledger__item">
                  <div className="pillar-ledger__head">
                    <span className="mono-index">{pillar.index}</span>
                    <span className="mono-meta">{pillar.years}</span>
                  </div>
                  <h3 className="pillar-ledger__title">{pillar.title}</h3>
                  <p className="pillar-ledger__note">{pillar.note}</p>
                </article>
              ))}
            </div>

            <div className="convergence-box">
              <div className="convergence-box__head">
                <div>
                  <span className="micro-label">{t.about.convergenceLabel}</span>
                  <h3 className="convergence-box__title">{t.about.convergenceTitle}</h3>
                </div>
                <span className="mono-meta">{t.about.convergenceHint}</span>
              </div>

              <div className="convergence-tabs" role="tablist" aria-label={t.about.convergenceLabel}>
                {t.about.convergences.map((node, idx) => {
                  const selected = idx === activeConvIndex;
                  return (
                    <button
                      key={node.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      className={`convergence-tab ${selected ? 'is-active' : ''}`}
                      onClick={() => setActiveConvIndex(idx)}
                    >
                      <span className="convergence-tab__num">0{idx + 1}</span>
                      <span className="convergence-tab__pair">{node.pair}</span>
                    </button>
                  );
                })}
              </div>

              {activeConv && (
                <div className="convergence-panel" role="tabpanel">
                  <div className="convergence-panel__copy">
                    <h4>{activeConv.title}</h4>
                    <p>{activeConv.description}</p>
                  </div>

                  <ul className="convergence-panel__outputs">
                    {activeConv.outputs.map((out) => (
                      <li key={out}>
                        <span className="dash-mark" aria-hidden="true">
                          ↗
                        </span>
                        <span>{out}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
