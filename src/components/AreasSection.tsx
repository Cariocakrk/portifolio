import { useLanguage } from '../i18n/LanguageContext';

export function AreasSection() {
  const { t } = useLanguage();

  return (
    <section id="areas" className="band band--stone">
      <div className="wrap">
        <div className="chapter-head chapter-head--compact">
          <div className="chapter-head__left">
            <span className="chapter-tag">{t.areas.index}</span>
            <h2 className="display-h2">{t.areas.title}</h2>
          </div>
          <p className="chapter-side-note">{t.areas.subtitle}</p>
        </div>

        <div className="areas-swiss-grid">
          {t.areas.items.map((area, idx) => (
            <article key={area.id} className="swiss-cell">
              <div className="swiss-cell__top">
                <span className="swiss-cell__num">0{idx + 1}</span>
                <span className="swiss-cell__arrow" aria-hidden="true">
                  ↗
                </span>
              </div>
              <h3 className="swiss-cell__title">{area.title}</h3>
              <p className="swiss-cell__desc">{area.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
