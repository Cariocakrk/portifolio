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

  const counts = useMemo(() => {
    return {
      all: allItems.length,
      dev: allItems.filter((i) => i.pillar === 'dev').length,
      design: allItems.filter((i) => i.pillar === 'design').length,
      community: allItems.filter((i) => i.pillar === 'community').length,
    };
  }, [allItems]);

  const filteredItems = useMemo(() => {
    const tokens = normalize(query).split(/\s+/).filter(Boolean);
    return allItems.filter((item) => {
      if (activePillar !== 'all' && item.pillar !== activePillar) return false;
      if (tokens.length === 0) return true;
      const hay = normalize(`${item.label} ${item.group} ${t.explorer.pillarLabels[item.pillar]}`);
      return tokens.every((tok) => hay.includes(tok));
    });
  }, [allItems, activePillar, query, t.explorer.pillarLabels]);

  const pillars: { id: PillarId | 'all'; label: string; count: number }[] = [
    { id: 'all', label: t.explorer.allPillars, count: counts.all },
    { id: 'dev', label: t.explorer.pillarLabels.dev, count: counts.dev },
    { id: 'design', label: t.explorer.pillarLabels.design, count: counts.design },
    { id: 'community', label: t.explorer.pillarLabels.community, count: counts.community },
  ];

  return (
    <section id="explorer" className="band" data-theme="paper">
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
                aria-label={t.explorer.clearFilters}
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
                {pillar.label} ({pillar.count})
              </button>
            ))}
          </div>
        </div>

        <div className="index-quick-row">
          <span className="mono-meta">{t.explorer.quickTagsLabel}</span>
          <div className="index-quick-tags">
            {t.explorer.quickTags.map((tag) => {
              const active = normalize(query) === normalize(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  className={`quick-tag-chip ${active ? 'is-active' : ''}`}
                  onClick={() => setQuery(active ? '' : tag)}
                >
                  {tag}
                </button>
              );
            })}
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
            {filteredItems.map((item, idx) => (
              <div key={item.id} className="index-entry">
                <div className="index-entry__head">
                  <span className="index-entry__group">{item.group}</span>
                  <span className="index-entry__num">{String(idx + 1).padStart(2, '0')}</span>
                </div>
                <span className="index-entry__label">{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
