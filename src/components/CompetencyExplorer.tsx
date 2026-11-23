import { useMemo, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import type { PillarId } from '../i18n/types';

interface IndexedCompetency {
  id: string;
  label: string;
  group: string;
  pillar: PillarId;
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function CompetencyExplorer() {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [activePillar, setActivePillar] = useState<PillarId | 'all'>('all');

  const allItems = useMemo<IndexedCompetency[]>(() => {
    const items: IndexedCompetency[] = [];

    t.development.techStack.forEach((tech) => {
      items.push({
        id: `tech-${tech.name}`,
        label: `${tech.name} — ${tech.focus}`,
        group: t.development.stackLabel,
        pillar: 'dev',
      });
    });

    t.development.competencies.forEach((comp, idx) => {
      items.push({
        id: `dev-comp-${idx}`,
        label: comp,
        group: t.development.title,
        pillar: 'dev',
      });
    });

    t.design.competencies.forEach((comp, idx) => {
      items.push({
        id: `design-comp-${idx}`,
        label: comp,
        group: t.design.title,
        pillar: 'design',
      });
    });

    t.community.domains.forEach((domain) => {
      domain.items.forEach((comp, idx) => {
        items.push({
          id: `comm-${domain.id}-${idx}`,
          label: comp,
          group: domain.title,
          pillar: 'community',
        });
      });
    });

    return items;
  }, [t]);

  const filteredItems = useMemo(() => {
    const q = normalize(query);
    return allItems.filter((item) => {
      if (activePillar !== 'all' && item.pillar !== activePillar) return false;
      if (!q) return true;
      return (
        normalize(item.label).includes(q) ||
        normalize(item.group).includes(q) ||
        normalize(t.explorer.pillarLabels[item.pillar]).includes(q)
      );
    });
  }, [allItems, activePillar, query, t.explorer.pillarLabels]);

  const pillars: { id: PillarId | 'all'; label: string }[] = [
    { id: 'all', label: t.explorer.allPillars },
    { id: 'dev', label: t.explorer.pillarLabels.dev },
    { id: 'design', label: t.explorer.pillarLabels.design },
    { id: 'community', label: t.explorer.pillarLabels.community },
  ];

  return (
    <section id="explorer" className="band band--paper">
      <div className="wrap">
        <div className="chapter-head chapter-head--compact">
          <div className="chapter-head__left">
            <span className="chapter-tag">{t.explorer.index}</span>
            <h2 className="display-h2">{t.explorer.title}</h2>
          </div>
          <p className="chapter-side-note">{t.explorer.subtitle}</p>
        </div>

        <div className="index-toolbar">
          <div className="underline-search">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.explorer.searchPlaceholder}
              aria-label={t.explorer.searchPlaceholder}
              className="underline-search__input"
            />
            {query && (
              <button
                type="button"
                className="underline-search__clear"
                onClick={() => setQuery('')}
              >
                ×
              </button>
            )}
          </div>

          <div className="tab-line tab-line--paper" role="tablist" aria-label="Pillar filters">
            {pillars.map((pillar) => (
              <button
                key={pillar.id}
                type="button"
                role="tab"
                aria-selected={activePillar === pillar.id}
                className={`tab-line__btn ${activePillar === pillar.id ? 'is-active' : ''}`}
                onClick={() => setActivePillar(pillar.id)}
              >
                {pillar.label}
              </button>
            ))}
          </div>
        </div>

        <div className="index-count-bar">
          <span className="mono-meta">
            {filteredItems.length} / {allItems.length} {t.explorer.resultsLabel}
          </span>
          {(query || activePillar !== 'all') && (
            <button
              type="button"
              className="text-link-btn text-link-btn--dark"
              onClick={() => {
                setQuery('');
                setActivePillar('all');
              }}
            >
              {t.explorer.clearFilters}
            </button>
          )}
        </div>

        {filteredItems.length === 0 ? (
          <div className="index-empty">
            <p>{t.explorer.emptyState}</p>
            <button
              type="button"
              className="ed-btn ed-btn--dark"
              onClick={() => {
                setQuery('');
                setActivePillar('all');
              }}
            >
              {t.explorer.clearFilters}
            </button>
          </div>
        ) : (
          <div className="index-directory">
            {filteredItems.map((item) => (
              <div key={item.id} className="index-entry">
                <span className="index-entry__group">{item.group}</span>
                <span className="index-entry__label">{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
