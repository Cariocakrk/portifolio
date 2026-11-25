import { useLanguage } from '../i18n/LanguageContext';

export function AreasSection() {
  const { t } = useLanguage();

  return (
    <section id="areas" className="band" data-theme="stone">
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
                <a href={area.targetSection} className="swiss-cell__jump">
                  <span>{t.areas.inspectSection}</span>
                  <span aria-hidden="true">↗</span>
                </a>
              </div>

              <h3 className="swiss-cell__title">{area.title}</h3>
              <p className="swiss-cell__desc">{area.description}</p>

              <div className="swiss-cell__deliverables">
                <span className="swiss-cell__sub">{t.areas.deliverablesLabel}</span>
                <ul>
                  {area.deliverables.map((del) => (
                    <li key={del}>
                      <span aria-hidden="true">·</span>
                      <span>{del}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
