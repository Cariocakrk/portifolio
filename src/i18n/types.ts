export type Language = 'pt' | 'en' | 'es';

export type CommunityCategory = 'all' | 'leadership' | 'operations' | 'growth';

export type PillarId = 'dev' | 'design' | 'community';

export interface TechItem {
  name: string;
  category: string;
  focus: string;
}

export interface CommunityDomain {
  id: string;
  title: string;
  category: Exclude<CommunityCategory, 'all'>;
  summary: string;
  items: string[];
}

export interface OperatingArea {
  id: string;
  title: string;
  description: string;
  pillar: PillarId;
}

export interface PortfolioTranslation {
  meta: {
    htmlLang: string;
    title: string;
    description: string;
  };
  nav: {
    about: string;
    development: string;
    design: string;
    community: string;
    areas: string;
    explorer: string;
    contact: string;
    commandBtn: string;
    menuOpen: string;
    menuClose: string;
    languageLabel: string;
  };
  palette: {
    placeholder: string;
    sectionsGroup: string;
    languageGroup: string;
    skillsGroup: string;
    empty: string;
    hintNav: string;
    hintSelect: string;
    hintClose: string;
  };
  hero: {
    eyebrow: string;
    availability: string;
    headlineStart: string;
    headlineItalic: string;
    headlineEnd: string;
    subheadline: string;
    ctaPrimary: string;
    ctaSecondary: string;
    meshLabel: string;
    meshHint: string;
    stats: {
      dev: { num: string; unit: string; label: string; detail: string };
      design: { num: string; unit: string; label: string; detail: string };
      community: { num: string; unit: string; label: string; detail: string };
    };
  };
  about: {
    index: string;
    title: string;
    aboutLabel: string;
    aboutParagraphs: [string, string];
    profileLabel: string;
    profileLead: string;
    profileParagraphs: [string, string, string];
    pillars: {
      dev: { index: string; title: string; years: string; note: string };
      design: { index: string; title: string; years: string; note: string };
      community: { index: string; title: string; years: string; note: string };
    };
  };
  development: {
    index: string;
    title: string;
    yearsNum: string;
    yearsLabel: string;
    intro: string;
    closingNote: string;
    stackLabel: string;
    stackHint: string;
    codeHeaderLabel: string;
    copyCode: string;
    copiedCode: string;
    competenciesLabel: string;
    techStack: TechItem[];
    competencies: string[];
  };
  design: {
    index: string;
    title: string;
    yearsNum: string;
    yearsLabel: string;
    headlineStart: string;
    headlineItalic: string;
    headlineEnd: string;
    intro: string;
    gridToggleOn: string;
    gridToggleOff: string;
    competenciesLabel: string;
    competencies: string[];
    focusSplit: {
      webTitle: string;
      webDesc: string;
      gamesTitle: string;
      gamesDesc: string;
    };
  };
  community: {
    index: string;
    title: string;
    yearsNum: string;
    yearsLabel: string;
    intro: string;
    domainsCountLabel: string;
    skillsCountLabel: string;
    modeExpanded: string;
    modeAccordion: string;
    expandAll: string;
    collapseAll: string;
    filters: {
      all: string;
      leadership: string;
      operations: string;
      growth: string;
    };
    domains: CommunityDomain[];
  };
  areas: {
    index: string;
    title: string;
    subtitle: string;
    items: OperatingArea[];
  };
  explorer: {
    index: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    allPillars: string;
    pillarLabels: Record<PillarId, string>;
    resultsLabel: string;
    emptyState: string;
    clearFilters: string;
  };
  contact: {
    index: string;
    headlineStart: string;
    headlineItalic: string;
    headlineEnd: string;
    subtitle: string;
    scopesLabel: string;
    scopes: string[];
    emailLabel: string;
    discordLabel: string;
    copyLabel: string;
    copiedLabel: string;
    configNote: string;
  };
  footer: {
    tagline: string;
    shortcutHint: string;
    backToTop: string;
  };
}
