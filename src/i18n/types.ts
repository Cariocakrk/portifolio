export type Language = 'pt' | 'en' | 'es';

export type CommunityCategory = 'all' | 'leadership' | 'operations' | 'growth';

export type PillarId = 'dev' | 'design' | 'community';

export interface TechItem {
  name: string;
  category: string;
  focus: string;
  layer: string;
  architectureNote: string;
  liveProof: string;
  liveAnchor: string;
}

export interface CommunityDomain {
  id: string;
  title: string;
  category: Exclude<CommunityCategory, 'all'>;
  summary: string;
  metricTag: string;
  items: string[];
}

export interface OperatingArea {
  id: string;
  title: string;
  description: string;
  deliverables: string[];
  targetSection: string;
  pillar: PillarId;
}

export interface ConvergenceNode {
  id: string;
  pair: string;
  title: string;
  description: string;
  outputs: string[];
}

export interface OrgTier {
  id: string;
  level: string;
  title: string;
  autonomy: string;
  scope: string;
  protocols: string[];
}

export interface CrisisStage {
  id: string;
  window: string;
  phase: string;
  action: string;
  outcome: string;
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
    liveStatus: string;
  };
  palette: {
    placeholder: string;
    sectionsGroup: string;
    labsGroup: string;
    actionsGroup: string;
    languageGroup: string;
    skillsGroup: string;
    copyEmailAction: string;
    copyDiscordAction: string;
    openRaidSim: string;
    openPhysicsLab: string;
    openGameHud: string;
    openDesignTokens: string;
    empty: string;
    hintNav: string;
    hintSelect: string;
    hintClose: string;
  };
  hero: {
    eyebrow: string;
    availability: string;
    unavailable: string;
    headlineStart: string;
    headlineItalic: string;
    headlineEnd: string;
    subheadline: string;
    ctaPrimary: string;
    ctaSecondary: string;
    ctaTertiary: string;
    meshLabel: string;
    meshHint: string;
    meshPulseBtn: string;
    meshModes: {
      wave: string;
      vortex: string;
      architectural: string;
    };
    stats: {
      dev: { num: string; unit: string; label: string; detail: string; spec: string };
      design: { num: string; unit: string; label: string; detail: string; spec: string };
      community: { num: string; unit: string; label: string; detail: string; spec: string };
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
    specsTitle: string;
    specs: { label: string; value: string }[];
    convergenceLabel: string;
    convergenceTitle: string;
    convergenceHint: string;
    convergences: ConvergenceNode[];
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
    archNoteLabel: string;
    copyCode: string;
    copiedCode: string;
    competenciesLabel: string;
    techStack: TechItem[];
    competencies: string[];
    sandbox: {
      badge: string;
      title: string;
      subtitle: string;
      tabs: {
        raid: string;
        physics: string;
        search: string;
      };
      raid: {
        statusLabel: string;
        states: {
          nominal: string;
          elevated: string;
          lockdown: string;
        };
        rateLabel: string;
        entropyLabel: string;
        mitigationLabel: string;
        btnNormal: string;
        btnBurst: string;
        btnAudit: string;
        btnReset: string;
        logTitle: string;
        desc: string;
      };
      physics: {
        desc: string;
        fpsLabel: string;
        stiffnessLabel: string;
        btnImpulse: string;
        naiveLabel: string;
        naiveNote: string;
        dtLabel: string;
        dtNote: string;
        driftLabel: string;
      };
      search: {
        desc: string;
        inputLabel: string;
        sampleQueries: string[];
        stageRaw: string;
        stageNormalized: string;
        stageTokens: string;
        matchesLabel: string;
        execTimeLabel: string;
      };
    };
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
    studio: {
      badge: string;
      title: string;
      subtitle: string;
      modeHud: string;
      modeWeb: string;
      hud: {
        sectorLabel: string;
        objectiveTitle: string;
        objectiveSub: string;
        shieldLabel: string;
        hullLabel: string;
        energyLabel: string;
        btnDamage: string;
        btnHeal: string;
        btnEmp: string;
        btnScan: string;
        heatmapToggle: string;
        contrastToggle: string;
        safezoneLabel: string;
        slotsLabel: string;
        rechargingLabel: string;
        criticalLabel: string;
        slots: { key: string; name: string; type: string; ready: string }[];
        zonePrimary: string;
        zonePeripheral: string;
        zoneTactical: string;
      };
      web: {
        controlsTitle: string;
        polarityLabel: string;
        polarityLight: string;
        polarityDark: string;
        radiusLabel: string;
        densityLabel: string;
        accentLabel: string;
        baselineToggle: string;
        densityCompact: string;
        densityEditorial: string;
        contrastPass: string;
        previewEyebrow: string;
        previewTitle: string;
        previewBody: string;
        previewPrimaryCta: string;
        previewPrimaryDone: string;
        previewSecondaryCta: string;
        previewMetrics: { label: string; value: string; delta: string }[];
      };
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
    blueprintBadge: string;
    blueprintTabOrg: string;
    blueprintTabCrisis: string;
    blueprintTabScale: string;
    orgHint: string;
    autonomyLabel: string;
    protocolsLabel: string;
    orgTiers: OrgTier[];
    crisisStages: CrisisStage[];
    scaleSim: {
      desc: string;
      membersLabel: string;
      activityLabel: string;
      actNormal: string;
      actHigh: string;
      actLaunch: string;
      recommendedStaff: string;
      deptLeads: string;
      deptSecOps: string;
      deptSupport: string;
      deptAcademy: string;
      rbacPostureLabel: string;
      rbacPostureValue: string;
      governanceRatioLabel: string;
    };
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
    deliverablesLabel: string;
    inspectSection: string;
    items: OperatingArea[];
  };
  explorer: {
    index: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    quickTagsLabel: string;
    quickTags: string[];
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
    architectureSummaryLabel: string;
    architectureSummary: string;
  };
  footer: {
    tagline: string;
    shortcutHint: string;
    backToTop: string;
    colophon: string;
  };
}
