import { useLanguage } from '../i18n/LanguageContext';

export function AboutSection() {
  const { t } = useLanguage();
  const pillars = [t.about.pillars.dev, t.about.pillars.design, t.about.pillars.community];

  return (
    <section id="about" className="band band--paper">
      <div className="wrap">
        <div className="editorial-grid">
          <div className="editorial-grid__rail">
            <span className="chapter-tag">{t.about.index}</span>
          </div>

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
          </div>
        </div>
      </div>
    </section>
  );
}
