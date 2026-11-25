/**
 * Central profile configuration.
 * Update these fields with your personal handles and links at any time.
 */
export const PROFILE_CONFIG = {
  brandMark: 'PORTFÓLIO',
  brandCode: 'ENG · UI/UX · OPS',
  editionCode: 'ED. 2026 // SYS-03',
  timezone: 'America/Sao_Paulo',
  locationCode: 'BR · UTC−03',
  availabilityStatus: true,
  contact: {
    email: 'contato@seuportfolio.dev',
    discord: 'seu.usuario',
    githubUrl: 'https://github.com/',
    linkedinUrl: 'https://linkedin.com/',
  },
  metrics: {
    devYears: 3,
    designYears: 2,
    communityYears: 7,
    communityDomains: 12,
    coreTechnologies: 8,
  },
} as const;
