import { useMemo, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import type { CommunityCategory } from '../i18n/types';

type LayoutMode = 'expanded' | 'accordion';

export function CommunitySection() {
  const { t } = useLanguage();
  const [category, setCategory] = useState<CommunityCategory>('all');
  const [mode, setMode] = useState<LayoutMode>('expanded');
  const [openIds, setOpenIds] = useState<string[]>([t.community.domains[0]?.id ?? 'team-management']);

  const filteredDomains = useMemo(() => {
    if (category === 'all') return t.community.domains;
    return t.community.domains.filter((domain) => domain.category === category);
  }, [category, t.community.domains]);

  const totalSkills = useMemo(
    () => t.community.domains.reduce((sum, d) => sum + d.items.length, 0),
    [t.community.domains]
  );

  const categories: { id: CommunityCategory; label: string }[] = [
    { id: 'all', label: t.community.filters.all },
    { id: 'leadership', label: t.community.filters.leadership },
    { id: 'operations', label: t.community.filters.operations },
    { id: 'growth', label: t.community.filters.growth },
  ];

  const toggleDomain = (id: string) => {
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return (
    <section id="community" className="band band--carbon">
      <div className="wrap">
        <div className="chapter-head">
          <div className="chapter-head__left">
            <span className="chapter-tag">{t.community.index}</span>
            <h2 className="display-h2">{t.community.title}</h2>
            <p className="chapter-intro">{t.community.intro}</p>
          </div>

          <div className="chapter-metric">
            <span className="chapter-metric__num">{t.community.yearsNum}</span>
            <span className="chapter-metric__label">{t.community.yearsLabel}</span>
            <span className="chapter-metric__sub">
              {t.community.domains.length} {t.community.domainsCountLabel} · {totalSkills}{' '}
              {t.community.skillsCountLabel}
            </span>
          </div>
        </div>

        <div className="ops-controls">
          <div className="tab-line" role="tablist" aria-label="Community categories">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={category === cat.id}
                className={`tab-line__btn ${category === cat.id ? 'is-active' : ''}`}
                onClick={() => setCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="mode-toggle" role="group" aria-label="View mode">
            <button
              type="button"
              className={`mode-toggle__btn ${mode === 'expanded' ? 'is-active' : ''}`}
              onClick={() => setMode('expanded')}
            >
              {t.community.modeExpanded}
            </button>
            <span className="mode-toggle__sep">/</span>
            <button
              type="button"
              className={`mode-toggle__btn ${mode === 'accordion' ? 'is-active' : ''}`}
              onClick={() => setMode('accordion')}
            >
              {t.community.modeAccordion}
            </button>
          </div>
        </div>

        {mode === 'expanded' ? (
          <div className="ops-ledger-grid">
            {filteredDomains.map((domain, index) => (
              <article key={domain.id} className="ops-cell">
                <div className="ops-cell__top">
                  <span className="mono-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="mono-meta">{t.community.filters[domain.category]}</span>
                </div>
                <h3 className="ops-cell__title">{domain.title}</h3>
                <p className="ops-cell__summary">{domain.summary}</p>
                <ul className="dash-list">
                  {domain.items.map((item) => (
                    <li key={item}>
                      <span className="dash-list__mark" aria-hidden="true">
                        —
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        ) : (
          <div className="ops-accordion">
            <div className="ops-accordion__bar">
              <button
                type="button"
                className="text-link-btn"
                onClick={() => setOpenIds(filteredDomains.map((d) => d.id))}
              >
                {t.community.expandAll}
              </button>
              <button type="button" className="text-link-btn" onClick={() => setOpenIds([])}>
                {t.community.collapseAll}
              </button>
            </div>

            {filteredDomains.map((domain, index) => {
              const isOpen = openIds.includes(domain.id);
              return (
                <div key={domain.id} className={`acc-row ${isOpen ? 'is-open' : ''}`}>
                  <button
                    type="button"
                    className="acc-row__trigger"
                    aria-expanded={isOpen}
                    onClick={() => toggleDomain(domain.id)}
                  >
                    <span className="mono-index">{String(index + 1).padStart(2, '0')}</span>
                    <strong className="acc-row__title">{domain.title}</strong>
                    <span className="acc-row__cat">{t.community.filters[domain.category]}</span>
                    <span className="acc-row__plus" aria-hidden="true">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="acc-row__panel">
                      <p className="ops-cell__summary">{domain.summary}</p>
                      <ul className="dash-list dash-list--two-col">
                        {domain.items.map((item) => (
                          <li key={item}>
                            <span className="dash-list__mark" aria-hidden="true">
                              —
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
