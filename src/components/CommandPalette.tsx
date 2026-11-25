import { useEffect, useMemo, useRef, useState } from 'react';
import { PROFILE_CONFIG } from '../config/profile';
import { useLanguage } from '../i18n/LanguageContext';
import type { Language } from '../i18n/types';
import type { DesignStudioMode } from './InterfaceStudio';
import type { EngineeringLabTab } from './SystemsSandbox';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onSelectLab: (lab: EngineeringLabTab) => void;
  onSelectStudioMode: (mode: DesignStudioMode) => void;
}

interface CommandItem {
  id: string;
  group: string;
  label: string;
  meta: string;
  action: () => void;
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function CommandPalette({
  open,
  onClose,
  onSelectLab,
  onSelectStudioMode,
}: CommandPaletteProps) {
  const { language, setLanguage, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const jumpTo = (id: string) => {
    onClose();
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const copyQuick = (value: string) => {
    navigator.clipboard?.writeText(value).catch(() => {});
    onClose();
  };

  const allCommands = useMemo<CommandItem[]>(() => {
    const list: CommandItem[] = [
      // Interactive Labs first for immediate wow
      {
        id: 'lab-raid',
        group: t.palette.labsGroup,
        label: t.palette.openRaidSim,
        meta: 'NODE.JS LAB',
        action: () => {
          onSelectLab('raid');
          jumpTo('development');
        },
      },
      {
        id: 'lab-physics',
        group: t.palette.labsGroup,
        label: t.palette.openPhysicsLab,
        meta: 'C++ / Δt LAB',
        action: () => {
          onSelectLab('physics');
          jumpTo('development');
        },
      },
      {
        id: 'lab-hud',
        group: t.palette.labsGroup,
        label: t.palette.openGameHud,
        meta: 'GAME UI',
        action: () => {
          onSelectStudioMode('hud');
          jumpTo('design');
        },
      },
      {
        id: 'lab-ds',
        group: t.palette.labsGroup,
        label: t.palette.openDesignTokens,
        meta: 'WEB UI',
        action: () => {
          onSelectStudioMode('web');
          jumpTo('design');
        },
      },
      // Sections
      { id: 'sec-about', group: t.palette.sectionsGroup, label: `01 · ${t.nav.about}`, meta: '#about', action: () => jumpTo('about') },
      { id: 'sec-dev', group: t.palette.sectionsGroup, label: `02 · ${t.nav.development}`, meta: '#development', action: () => jumpTo('development') },
      { id: 'sec-design', group: t.palette.sectionsGroup, label: `03 · ${t.nav.design}`, meta: '#design', action: () => jumpTo('design') },
      { id: 'sec-comm', group: t.palette.sectionsGroup, label: `04 · ${t.nav.community}`, meta: '#community', action: () => jumpTo('community') },
      { id: 'sec-areas', group: t.palette.sectionsGroup, label: `05 · ${t.nav.areas}`, meta: '#areas', action: () => jumpTo('areas') },
      { id: 'sec-exp', group: t.palette.sectionsGroup, label: `06 · ${t.nav.explorer}`, meta: '#explorer', action: () => jumpTo('explorer') },
      { id: 'sec-contact', group: t.palette.sectionsGroup, label: `07 · ${t.nav.contact}`, meta: '#contact', action: () => jumpTo('contact') },
      // Quick actions
      {
        id: 'act-email',
        group: t.palette.actionsGroup,
        label: `${t.palette.copyEmailAction} (${PROFILE_CONFIG.contact.email})`,
        meta: 'COPY',
        action: () => copyQuick(PROFILE_CONFIG.contact.email),
      },
      {
        id: 'act-discord',
        group: t.palette.actionsGroup,
        label: `${t.palette.copyDiscordAction} (${PROFILE_CONFIG.contact.discord})`,
        meta: 'COPY',
        action: () => copyQuick(PROFILE_CONFIG.contact.discord),
      },
    ];

    const langs: { code: Language; label: string }[] = [
      { code: 'en', label: '🇺🇸 English (EN)' },
      { code: 'pt', label: '🇧🇷 Português (PT)' },
      { code: 'es', label: '🇪🇸 Español (ES)' },
    ];

    langs.forEach((item) => {
      list.push({
        id: `lang-${item.code}`,
        group: t.palette.languageGroup,
        label: item.label,
        meta: language === item.code ? 'ACTIVE' : item.code.toUpperCase(),
        action: () => {
          setLanguage(item.code);
          onClose();
        },
      });
    });

    t.development.techStack.forEach((tech) => {
      list.push({
        id: `tech-${tech.name}`,
        group: t.palette.skillsGroup,
        label: `${tech.name} — ${tech.focus}`,
        meta: t.nav.development,
        action: () => jumpTo('development'),
      });
    });

    t.design.competencies.forEach((comp, idx) => {
      list.push({
        id: `des-${idx}`,
        group: t.palette.skillsGroup,
        label: comp,
        meta: t.nav.design,
        action: () => jumpTo('design'),
      });
    });

    t.community.domains.forEach((domain) => {
      list.push({
        id: `dom-${domain.id}`,
        group: t.palette.skillsGroup,
        label: `${domain.title} (${domain.items.length})`,
        meta: t.nav.community,
        action: () => jumpTo('community'),
      });
    });

    return list;
  }, [language, onClose, onSelectLab, onSelectStudioMode, setLanguage, t]);

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return allCommands.slice(0, 16);
    return allCommands
      .filter((cmd) => normalize(`${cmd.group} ${cmd.label} ${cmd.meta}`).includes(q))
      .slice(0, 20);
  }, [allCommands, query]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setSelectedIndex(0);
    window.setTimeout(() => inputRef.current?.focus(), 10);
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (filtered.length > 0 ? (prev + 1) % filtered.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (filtered.length > 0 ? (prev - 1 + filtered.length) % filtered.length : 0));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        filtered[selectedIndex].action();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, filtered, selectedIndex, onClose]);

  if (!open) return null;

  return (
    <div
      className="palette-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Quick navigation"
      onClick={onClose}
    >
      <div className="palette-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="palette-input-row">
          <span className="palette-prompt" aria-hidden="true">
            &gt;
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.palette.placeholder}
            className="palette-input"
          />
          <button type="button" className="palette-esc" onClick={onClose}>
            ESC
          </button>
        </div>

        <div className="palette-results" role="listbox">
          {filtered.length === 0 ? (
            <p className="palette-empty">{t.palette.empty}</p>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={idx === selectedIndex}
                className={`palette-item ${idx === selectedIndex ? 'is-active' : ''}`}
                onMouseEnter={() => setSelectedIndex(idx)}
                onClick={item.action}
              >
                <span className="palette-item__group">{item.group}</span>
                <span className="palette-item__label">{item.label}</span>
                <span className="palette-item__meta">{item.meta}</span>
              </button>
            ))
          )}
        </div>

        <div className="palette-footer">
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> {t.palette.hintNav}
          </span>
          <span>
            <kbd>↵</kbd> {t.palette.hintSelect}
          </span>
          <span>
            <kbd>ESC</kbd> {t.palette.hintClose}
          </span>
        </div>
      </div>
    </div>
  );
}
