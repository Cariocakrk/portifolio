import { useMemo, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import type { CommunityCategory } from '../i18n/types';

type LayoutMode = 'expanded' | 'accordion';
type BlueprintTab = 'org' | 'crisis' | 'scale';
type ActivityLevel = 'normal' | 'high' | 'launch';

export function CommunitySection() {
  const { t } = useLanguage();
  const [category, setCategory] = useState<CommunityCategory>('all');
  const [mode, setMode] = useState<LayoutMode>('expanded');
  const [openIds, setOpenIds] = useState<string[]>([t.community.domains[0]?.id ?? 'team-management']);
  const [blueprintTab, setBlueprintTab] = useState<BlueprintTab>('org');
  const [selectedTierIdx, setSelectedTierIdx] = useState(0);

  // Staff Scaling Simulator state
  const [memberCount, setMemberCount] = useState(18000);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('high');

  const filteredDomains = useMemo(() => {
    if (category === 'all') return t.community.domains;
    return t.community.domains.filter((domain) => domain.category === category);
  }, [category, t.community.domains]);

  const totalSkills = useMemo(
    () => t.community.domains.reduce((sum, d) => sum + d.items.length, 0),
    [t.community.domains]
  );

  const scalePlan = useMemo(() => {
    const mult = activityLevel === 'launch' ? 1.45 : activityLevel === 'high' ? 1.2 : 1.0;
    const baseMods = Math.max(4, Math.round((Math.sqrt(memberCount) / 11) * mult));
    const leads = Math.max(2, Math.round(baseMods * 0.28));
    const secOps = Math.max(3, Math.round(baseMods * 0.45));
    const support = Math.max(3, Math.round(baseMods * 0.42));
    const academy = Math.max(2, Math.round(baseMods * 0.3));
    const total = leads + secOps + support + academy;
    const ratio = Math.round(memberCount / total);

    return { leads, secOps, support, academy, total, ratio };
  }, [activityLevel, memberCount]);

  const categories: { id: CommunityCategory; label: string }[] = [
    { id: 'all', label: t.community.filters.all },
    { id: 'leadership', label: t.community.filters.leadership },
    { id: 'operations', label: t.community.filters.operations },
    { id: 'growth', label: t.community.filters.growth },
  ];

  const toggleDomain = (id: string) => {
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const activeTier = t.community.orgTiers[selectedTierIdx] ?? t.community.orgTiers[0];

  return (
    <section id="community" className="band" data-theme="carbon">
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

        {/* Interactive Governance, Crisis & Scaling Blueprint */}
        <div className="ops-blueprint">
          <div className="ops-blueprint__head">
            <span className="sandbox-badge">{t.community.blueprintBadge}</span>
            <div className="sandbox-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={blueprintTab === 'org'}
                className={`sandbox-tab ${blueprintTab === 'org' ? 'is-active' : ''}`}
                onClick={() => setBlueprintTab('org')}
              >
                {t.community.blueprintTabOrg}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={blueprintTab === 'crisis'}
                className={`sandbox-tab ${blueprintTab === 'crisis' ? 'is-active' : ''}`}
                onClick={() => setBlueprintTab('crisis')}
              >
                {t.community.blueprintTabCrisis}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={blueprintTab === 'scale'}
                className={`sandbox-tab ${blueprintTab === 'scale' ? 'is-active' : ''}`}
                onClick={() => setBlueprintTab('scale')}
              >
                {t.community.blueprintTabScale}
              </button>
            </div>
          </div>

          {blueprintTab === 'org' && (
            <div className="org-topology" role="tabpanel">
              <div className="org-topology__stack">
                <span className="mono-meta">{t.community.orgHint}</span>
                {t.community.orgTiers.map((tier, idx) => {
                  const isSelected = idx === selectedTierIdx;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      className={`org-tier-btn ${isSelected ? 'is-active' : ''}`}
                      onClick={() => setSelectedTierIdx(idx)}
                    >
                      <span className="org-tier-btn__lvl">{tier.level}</span>
                      <strong className="org-tier-btn__title">{tier.title}</strong>
                      <span className="org-tier-btn__arrow" aria-hidden="true">
                        {isSelected ? '●' : '→'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {activeTier && (
                <div className="org-inspector">
                  <div className="org-inspector__meta">
                    <span className="mono-index">{activeTier.level}</span>
                    <span className="org-autonomy-pill">
                      {t.community.autonomyLabel}: {activeTier.autonomy}
                    </span>
                  </div>
                  <h3 className="org-inspector__title">{activeTier.title}</h3>
                  <p className="org-inspector__scope">{activeTier.scope}</p>

                  <span className="micro-label">{t.community.protocolsLabel}</span>
                  <ul className="dash-list">
                    {activeTier.protocols.map((p) => (
                      <li key={p}>
                        <span className="dash-list__mark" aria-hidden="true">
                          —
                        </span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {blueprintTab === 'crisis' && (
            <div className="crisis-timeline" role="tabpanel">
              {t.community.crisisStages.map((stage, idx) => (
                <article key={stage.id} className="crisis-card">
                  <div className="crisis-card__head">
                    <span className="mono-index">0{idx + 1}</span>
                    <span className="crisis-window">{stage.window}</span>
                  </div>
                  <h4 className="crisis-card__title">{stage.phase}</h4>
                  <p className="crisis-card__action">{stage.action}</p>
                  <div className="crisis-card__outcome">
                    <span>✓</span>
                    <span>{stage.outcome}</span>
                  </div>
                </article>
              ))}
            </div>
          )}

          {blueprintTab === 'scale' && (
            <div className="scale-sim" role="tabpanel">
              <div className="scale-sim__controls">
                <p className="sandbox-desc">{t.community.scaleSim.desc}</p>

                <div className="scale-field">
                  <div className="scale-field__head">
                    <label htmlFor="member-slider" className="mono-meta">
                      {t.community.scaleSim.membersLabel}
                    </label>
                    <strong className="scale-field__val">
                      {memberCount.toLocaleString('pt-BR')}
                    </strong>
                  </div>
                  <input
                    id="member-slider"
                    type="range"
                    min={1000}
                    max={100000}
                    step={1000}
                    value={memberCount}
                    onChange={(e) => setMemberCount(Number(e.target.value))}
                    className="scale-range"
                  />
                </div>

                <div className="scale-field">
                  <span className="mono-meta">{t.community.scaleSim.activityLabel}</span>
                  <div className="seg-pills">
                    <button
                      type="button"
                      className={`seg-pill ${activityLevel === 'normal' ? 'is-active' : ''}`}
                      onClick={() => setActivityLevel('normal')}
                    >
                      {t.community.scaleSim.actNormal}
                    </button>
                    <button
                      type="button"
                      className={`seg-pill ${activityLevel === 'high' ? 'is-active' : ''}`}
                      onClick={() => setActivityLevel('high')}
                    >
                      {t.community.scaleSim.actHigh}
                    </button>
                    <button
                      type="button"
                      className={`seg-pill ${activityLevel === 'launch' ? 'is-active' : ''}`}
                      onClick={() => setActivityLevel('launch')}
                    >
                      {t.community.scaleSim.actLaunch}
                    </button>
                  </div>
                </div>
              </div>

              <div className="scale-sim__output">
                <div className="scale-summary-top">
                  <div>
                    <span className="mono-meta">{t.community.scaleSim.recommendedStaff}</span>
                    <strong className="scale-total-num">{scalePlan.total}</strong>
                  </div>
                  <div className="scale-ratio-box">
                    <span className="mono-meta">{t.community.scaleSim.governanceRatioLabel}</span>
                    <strong>1 : {scalePlan.ratio}</strong>
                  </div>
                </div>

                <div className="scale-depts-grid">
                  <div className="scale-dept">
                    <span>{t.community.scaleSim.deptLeads}</span>
                    <strong>{scalePlan.leads}</strong>
                  </div>
                  <div className="scale-dept">
                    <span>{t.community.scaleSim.deptSecOps}</span>
                    <strong>{scalePlan.secOps}</strong>
                  </div>
                  <div className="scale-dept">
                    <span>{t.community.scaleSim.deptSupport}</span>
                    <strong>{scalePlan.support}</strong>
                  </div>
                  <div className="scale-dept">
                    <span>{t.community.scaleSim.deptAcademy}</span>
                    <strong>{scalePlan.academy}</strong>
                  </div>
                </div>

                <div className="scale-rbac-bar">
                  <span className="mono-meta">{t.community.scaleSim.rbacPostureLabel}</span>
                  <strong>{t.community.scaleSim.rbacPostureValue}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 12-Domain Dossier Controls */}
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
                  <span className="ops-cell__tag">{domain.metricTag}</span>
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
                    <span className="acc-row__cat">{domain.metricTag}</span>
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
