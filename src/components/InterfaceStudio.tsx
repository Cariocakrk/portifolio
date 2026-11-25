import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export type DesignStudioMode = 'hud' | 'web';

interface InterfaceStudioProps {
  mode: DesignStudioMode;
  onModeChange: (mode: DesignStudioMode) => void;
}

type AccentPreset = {
  id: string;
  label: string;
  hex: string;
  contrastLight: string;
  contrastDark: string;
};

const ACCENT_PRESETS: AccentPreset[] = [
  {
    id: 'vermilion',
    label: 'Vermilion #E84C2B',
    hex: '#e84c2b',
    contrastLight: '15.8:1 AAA · Paper #FFFFFF',
    contrastDark: '16.4:1 AAA · Carbon #111318',
  },
  {
    id: 'cobalt',
    label: 'Cobalt #2563EB',
    hex: '#2563eb',
    contrastLight: '15.8:1 AAA · Accent 5.2:1 AA',
    contrastDark: '16.4:1 AAA · Accent 4.6:1 AA',
  },
  {
    id: 'emerald',
    label: 'Emerald #10B981',
    hex: '#0d9488',
    contrastLight: '15.8:1 AAA · Accent 4.9:1 AA',
    contrastDark: '16.4:1 AAA · Accent 6.8:1 AA',
  },
];

export function InterfaceStudio({ mode, onModeChange }: InterfaceStudioProps) {
  const { t } = useLanguage();

  // ================= SPECIMEN A: TACTICAL GAME HUD =================
  const [targetShield, setTargetShield] = useState(86);
  const [targetHull, setTargetHull] = useState(94);
  const [targetEnergy, setTargetEnergy] = useState(78);

  const [dispShield, setDispShield] = useState(86);
  const [ghostShield, setGhostShield] = useState(86);
  const [dispHull, setDispHull] = useState(94);
  const [ghostHull, setGhostHull] = useState(94);
  const [dispEnergy, setDispEnergy] = useState(78);

  const [selectedSlot, setSelectedSlot] = useState(0);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [safeInset, setSafeInset] = useState(16);
  const [hitFlash, setHitFlash] = useState(false);
  const [scanPulse, setScanPulse] = useState(false);
  const [recharging, setRecharging] = useState(false);
  const [hudFeed, setHudFeed] = useState<string[]>([
    'SYS // HUD_SYNC_OK 144Hz',
    'WPN // EQUIP -> V4_PULSE',
  ]);

  const lastHitAtRef = useRef<number>(0);
  const barsRef = useRef({
    sCur: 86,
    sGhost: 86,
    sTgt: 86,
    hCur: 94,
    hGhost: 94,
    hTgt: 94,
    eCur: 78,
    eTgt: 78,
  });
  barsRef.current.sTgt = targetShield;
  barsRef.current.hTgt = targetHull;
  barsRef.current.eTgt = targetEnergy;

  const pushFeed = (line: string) => {
    setHudFeed((prev) => [line, ...prev].slice(0, 4));
  };

  useEffect(() => {
    if (mode !== 'hud') return;
    let raf = 0;
    let prev = performance.now();

    const loop = (now: number) => {
      raf = window.requestAnimationFrame(loop);
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;

      const b = barsRef.current;

      // Auto-recharge kinetic shield 3.2s after last hit (authentic game HUD mechanic)
      if (lastHitAtRef.current > 0 && now - lastHitAtRef.current > 3200 && b.sTgt < 100) {
        const nextShield = Math.min(100, b.sTgt + 18 * dt);
        b.sTgt = nextShield;
        setTargetShield(nextShield);
        setRecharging(nextShield < 99.5);
      } else {
        setRecharging(false);
      }

      const fast = 1 - Math.exp(-16 * dt);
      const ghost = 1 - Math.exp(-2.6 * dt);

      b.sCur += (b.sTgt - b.sCur) * fast;
      b.sGhost = b.sTgt > b.sGhost ? b.sCur : b.sGhost + (b.sTgt - b.sGhost) * ghost;

      b.hCur += (b.hTgt - b.hCur) * fast;
      b.hGhost = b.hTgt > b.hGhost ? b.hCur : b.hGhost + (b.hTgt - b.hGhost) * ghost;

      b.eCur += (b.eTgt - b.eCur) * fast;

      setDispShield(b.sCur);
      setGhostShield(b.sGhost);
      setDispHull(b.hCur);
      setGhostHull(b.hGhost);
      setDispEnergy(b.eCur);
    };

    raf = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(raf);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'hud') return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.matches('input, textarea')) return;
      if (e.key >= '1' && e.key <= '4') {
        const idx = Number(e.key) - 1;
        setSelectedSlot(idx);
        const name = t.design.studio.hud.slots[idx]?.name ?? `SLOT_${idx + 1}`;
        pushFeed(`WPN // HOTKEY [${e.key}] -> ${name.toUpperCase()}`);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, t.design.studio.hud.slots]);

  const handleTakeHit = () => {
    lastHitAtRef.current = performance.now();
    setHitFlash(true);
    window.setTimeout(() => setHitFlash(false), 240);

    const dmg = 28;
    if (targetShield >= dmg) {
      setTargetShield((s) => Math.max(0, s - dmg));
      pushFeed('DMG // KINETIC_ABSORB -28');
    } else {
      const overflow = dmg - targetShield;
      setTargetShield(0);
      setTargetHull((h) => Math.max(8, h - overflow));
      pushFeed(`CRIT // SHIELD_BREAK -> HULL -${Math.round(overflow)}`);
    }
  };

  const handleHeal = () => {
    setTargetHull((h) => Math.min(100, h + 32));
    setTargetShield((s) => Math.min(100, s + 26));
    setTargetEnergy((e) => Math.min(100, e + 18));
    pushFeed('MED // NANITE_REPAIR +32');
  };

  const handleEmp = () => {
    lastHitAtRef.current = performance.now();
    setHitFlash(true);
    window.setTimeout(() => setHitFlash(false), 260);
    setTargetShield((s) => Math.max(0, s - 45));
    setTargetEnergy((e) => Math.max(10, e - 34));
    pushFeed('WARN // EMP_SURGE SHIELD -45');
  };

  const handleScan = () => {
    setScanPulse(true);
    setTargetEnergy((e) => Math.max(0, e - 12));
    pushFeed('SCAN // PING_CONTACTS (2)');
    window.setTimeout(() => setScanPulse(false), 900);
  };

  // ================= SPECIMEN B: WEB DESIGN SYSTEM INSPECTOR =================
  const [polarity, setPolarity] = useState<'light' | 'dark'>('light');
  const [radiusPx, setRadiusPx] = useState<0 | 4 | 14>(4);
  const [density, setDensity] = useState<'compact' | 'editorial'>('editorial');
  const [accentIdx, setAccentIdx] = useState(0);
  const [showBaseline, setShowBaseline] = useState(false);
  const [deployed, setDeployed] = useState(false);

  const activeAccent = ACCENT_PRESETS[accentIdx] ?? ACCENT_PRESETS[0];

  const handlePreviewDeploy = () => {
    setDeployed(true);
    window.setTimeout(() => setDeployed(false), 2200);
  };

  return (
    <div className="studio-shell">
      <div className="studio-shell__head">
        <div>
          <span className="studio-badge">{t.design.studio.badge}</span>
          <h3 className="studio-title">{t.design.studio.title}</h3>
          <p className="studio-subtitle">{t.design.studio.subtitle}</p>
        </div>

        <div className="studio-mode-switch" role="tablist" aria-label={t.design.studio.badge}>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'hud'}
            className={`studio-mode-btn ${mode === 'hud' ? 'is-active' : ''}`}
            onClick={() => onModeChange('hud')}
          >
            {t.design.studio.modeHud}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'web'}
            className={`studio-mode-btn ${mode === 'web' ? 'is-active' : ''}`}
            onClick={() => onModeChange('web')}
          >
            {t.design.studio.modeWeb}
          </button>
        </div>
      </div>

      {mode === 'hud' ? (
        <div className="hud-workbench" role="tabpanel">
          <div className="hud-toolbar">
            <div className="hud-toolbar__actions">
              <button type="button" className="hud-ctrl-btn hud-ctrl-btn--hit" onClick={handleTakeHit}>
                {t.design.studio.hud.btnDamage}
              </button>
              <button type="button" className="hud-ctrl-btn hud-ctrl-btn--heal" onClick={handleHeal}>
                {t.design.studio.hud.btnHeal}
              </button>
              <button type="button" className="hud-ctrl-btn" onClick={handleEmp}>
                {t.design.studio.hud.btnEmp}
              </button>
              <button type="button" className="hud-ctrl-btn" onClick={handleScan}>
                {t.design.studio.hud.btnScan}
              </button>
            </div>

            <div className="hud-toolbar__toggles">
              <button
                type="button"
                className={`hud-toggle-chip ${showHeatmap ? 'is-active' : ''}`}
                onClick={() => setShowHeatmap((v) => !v)}
                aria-pressed={showHeatmap}
              >
                {t.design.studio.hud.heatmapToggle}
              </button>
              <button
                type="button"
                className={`hud-toggle-chip ${highContrast ? 'is-active' : ''}`}
                onClick={() => setHighContrast((v) => !v)}
                aria-pressed={highContrast}
              >
                {t.design.studio.hud.contrastToggle}
              </button>
              <label className="hud-safe-slider">
                <span>
                  {t.design.studio.hud.safezoneLabel}: {safeInset}px
                </span>
                <input
                  type="range"
                  min={8}
                  max={32}
                  value={safeInset}
                  onChange={(e) => setSafeInset(Number(e.target.value))}
                />
              </label>
            </div>
          </div>

          <div
            className={`hud-stage ${highContrast ? 'is-high-contrast' : ''} ${hitFlash ? 'is-hit' : ''}`}
            style={{ padding: `${18 + safeInset}px` }}
          >
            {/* Tactical Wireframe Horizon Grid */}
            <svg
              className="hud-horizon-svg"
              viewBox="0 0 800 420"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line x1="0" y1="210" x2="800" y2="210" stroke="rgba(244,242,236,0.08)" />
              <line x1="400" y1="210" x2="80" y2="420" stroke="rgba(56,189,248,0.12)" />
              <line x1="400" y1="210" x2="240" y2="420" stroke="rgba(56,189,248,0.12)" />
              <line x1="400" y1="210" x2="400" y2="420" stroke="rgba(56,189,248,0.16)" />
              <line x1="400" y1="210" x2="560" y2="420" stroke="rgba(56,189,248,0.12)" />
              <line x1="400" y1="210" x2="720" y2="420" stroke="rgba(56,189,248,0.12)" />
              <line x1="120" y1="265" x2="680" y2="265" stroke="rgba(56,189,248,0.07)" />
              <line x1="60" y1="330" x2="740" y2="330" stroke="rgba(56,189,248,0.09)" />
            </svg>

            <div className="hud-stage__safe-guide" style={{ inset: `${safeInset}px` }} aria-hidden="true" />

            {/* Top HUD Row: Objective + Compass + Radar */}
            <div className="hud-top-row">
              <div className="hud-objective">
                <span className="hud-eyebrow">{t.design.studio.hud.sectorLabel}</span>
                <strong className="hud-objective__title">{t.design.studio.hud.objectiveTitle}</strong>
                <span className="hud-objective__sub">{t.design.studio.hud.objectiveSub}</span>
              </div>

              <div className="hud-compass" aria-hidden="true">
                <span>285° NW</span>
                <div className="hud-compass__ticks">
                  <i>W</i>
                  <i>·</i>
                  <i className="is-center">▼</i>
                  <i>·</i>
                  <i>N</i>
                </div>
              </div>

              <div className="hud-top-right">
                <div className={`hud-radar ${scanPulse ? 'is-scanning' : ''}`} aria-hidden="true">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="44" className="hud-radar__ring" />
                    <circle cx="50" cy="50" r="26" className="hud-radar__ring" />
                    <line x1="50" y1="6" x2="50" y2="94" className="hud-radar__axis" />
                    <line x1="6" y1="50" x2="94" y2="50" className="hud-radar__axis" />
                    <circle cx="66" cy="34" r="3" className="hud-radar__blip" />
                    <circle cx="32" cy="40" r="2.5" className="hud-radar__blip hud-radar__blip--ally" />
                    <polygon points="50,45 46,55 54,55" className="hud-radar__self" />
                  </svg>
                </div>

                <ul className="hud-event-feed" aria-hidden="true">
                  {hudFeed.map((item, i) => (
                    <li key={`${item}-${i}`}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Center Tactical Reticle */}
            <div className="hud-center-reticle" aria-hidden="true">
              <div className="hud-reticle-ring">
                <span className="hud-reticle-cross" />
              </div>
              <span className="hud-reticle-meta">
                {t.design.studio.hud.slots[selectedSlot]?.name} · RNG 42.8m
              </span>
              {recharging && (
                <span className="hud-status-alert hud-status-alert--cyan">
                  {t.design.studio.hud.rechargingLabel}
                </span>
              )}
              {dispHull < 30 && (
                <span className="hud-status-alert hud-status-alert--crit">
                  ⚠ {t.design.studio.hud.criticalLabel}
                </span>
              )}
              {showHeatmap && (
                <div className="ux-zone-callout ux-zone-callout--center">
                  {t.design.studio.hud.zonePrimary}
                </div>
              )}
            </div>

            {/* Bottom HUD Row: Vitals Left + Quick-Slots Right */}
            <div className="hud-bottom-row">
              <div className="hud-vitals">
                {showHeatmap && (
                  <div className="ux-zone-callout ux-zone-callout--vitals">
                    {t.design.studio.hud.zonePeripheral}
                  </div>
                )}

                <div className="hud-bar-group">
                  <div className="hud-bar-head">
                    <span>{t.design.studio.hud.shieldLabel}</span>
                    <strong>{Math.round(dispShield)}</strong>
                  </div>
                  <div className="hud-bar-track">
                    <div className="hud-bar-ghost" style={{ width: `${ghostShield}%` }} />
                    <div className="hud-bar-fill hud-bar-fill--shield" style={{ width: `${dispShield}%` }} />
                  </div>
                </div>

                <div className="hud-bar-group">
                  <div className="hud-bar-head">
                    <span>{t.design.studio.hud.hullLabel}</span>
                    <strong className={dispHull < 30 ? 'is-critical' : ''}>{Math.round(dispHull)}</strong>
                  </div>
                  <div className="hud-bar-track">
                    <div className="hud-bar-ghost hud-bar-ghost--hull" style={{ width: `${ghostHull}%` }} />
                    <div
                      className={`hud-bar-fill hud-bar-fill--hull ${dispHull < 30 ? 'is-critical' : ''}`}
                      style={{ width: `${dispHull}%` }}
                    />
                  </div>
                </div>

                <div className="hud-bar-group hud-bar-group--compact">
                  <div className="hud-bar-head">
                    <span>{t.design.studio.hud.energyLabel}</span>
                    <strong>{Math.round(dispEnergy)}%</strong>
                  </div>
                  <div className="hud-bar-track hud-bar-track--thin">
                    <div className="hud-bar-fill hud-bar-fill--energy" style={{ width: `${dispEnergy}%` }} />
                  </div>
                </div>
              </div>

              <div className="hud-slots-wrap">
                {showHeatmap && (
                  <div className="ux-zone-callout ux-zone-callout--slots">
                    {t.design.studio.hud.zoneTactical}
                  </div>
                )}
                <span className="hud-eyebrow">{t.design.studio.hud.slotsLabel}</span>
                <div className="hud-slots">
                  {t.design.studio.hud.slots.map((slot, idx) => {
                    const active = idx === selectedSlot;
                    return (
                      <button
                        key={slot.key}
                        type="button"
                        className={`hud-slot ${active ? 'is-active' : ''}`}
                        onClick={() => {
                          setSelectedSlot(idx);
                          pushFeed(`WPN // EQUIP -> ${slot.name.toUpperCase()}`);
                        }}
                      >
                        <div className="hud-slot__top">
                          <kbd>{slot.key}</kbd>
                          <span>{slot.type}</span>
                        </div>
                        <strong className="hud-slot__name">{slot.name}</strong>
                        <span className="hud-slot__status">{slot.ready}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="ds-workbench" role="tabpanel">
          <aside className="ds-controls">
            <span className="micro-label">{t.design.studio.web.controlsTitle}</span>

            <div className="ds-control-block">
              <span className="ds-control-label">{t.design.studio.web.polarityLabel}</span>
              <div className="seg-pills seg-pills--paper">
                <button
                  type="button"
                  className={`seg-pill ${polarity === 'light' ? 'is-active' : ''}`}
                  onClick={() => setPolarity('light')}
                >
                  {t.design.studio.web.polarityLight}
                </button>
                <button
                  type="button"
                  className={`seg-pill ${polarity === 'dark' ? 'is-active' : ''}`}
                  onClick={() => setPolarity('dark')}
                >
                  {t.design.studio.web.polarityDark}
                </button>
              </div>
            </div>

            <div className="ds-control-block">
              <span className="ds-control-label">{t.design.studio.web.radiusLabel}</span>
              <div className="seg-pills seg-pills--paper">
                {([0, 4, 14] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`seg-pill ${radiusPx === r ? 'is-active' : ''}`}
                    onClick={() => setRadiusPx(r)}
                  >
                    {r}px
                  </button>
                ))}
              </div>
            </div>

            <div className="ds-control-block">
              <span className="ds-control-label">{t.design.studio.web.densityLabel}</span>
              <div className="seg-pills seg-pills--paper">
                <button
                  type="button"
                  className={`seg-pill ${density === 'compact' ? 'is-active' : ''}`}
                  onClick={() => setDensity('compact')}
                >
                  {t.design.studio.web.densityCompact}
                </button>
                <button
                  type="button"
                  className={`seg-pill ${density === 'editorial' ? 'is-active' : ''}`}
                  onClick={() => setDensity('editorial')}
                >
                  {t.design.studio.web.densityEditorial}
                </button>
              </div>
            </div>

            <div className="ds-control-block">
              <span className="ds-control-label">{t.design.studio.web.accentLabel}</span>
              <div className="ds-swatches">
                {ACCENT_PRESETS.map((preset, idx) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={`ds-swatch-btn ${accentIdx === idx ? 'is-active' : ''}`}
                    onClick={() => setAccentIdx(idx)}
                  >
                    <span className="ds-swatch-dot" style={{ background: preset.hex }} />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className={`ds-baseline-btn ${showBaseline ? 'is-active' : ''}`}
              onClick={() => setShowBaseline((v) => !v)}
              aria-pressed={showBaseline}
            >
              {t.design.studio.web.baselineToggle}
            </button>

            <div className="ds-wcag-readout">
              <span>{t.design.studio.web.contrastPass}</span>
              <strong>
                {polarity === 'light' ? activeAccent.contrastLight : activeAccent.contrastDark}
              </strong>
            </div>
          </aside>

          <div
            className={`ds-preview-canvas ${showBaseline ? 'has-baseline' : ''} ds-preview--${density} ds-preview--${polarity}`}
            style={
              {
                '--ds-radius': `${radiusPx}px`,
                '--ds-accent': activeAccent.hex,
              } as React.CSSProperties
            }
          >
            <div className="ds-card">
              <div className="ds-card__top">
                <span className="ds-card__eyebrow">{t.design.studio.web.previewEyebrow}</span>
                <span className="ds-card__token-tag">
                  {polarity} · r:{radiusPx}px · pad:{density === 'compact' ? '18px' : '28px'}
                </span>
              </div>

              <h4 className="ds-card__title">{t.design.studio.web.previewTitle}</h4>
              <p className="ds-card__body">{t.design.studio.web.previewBody}</p>

              <div className="ds-metrics-row">
                {t.design.studio.web.previewMetrics.map((m) => (
                  <div key={m.label} className="ds-metric-box">
                    <span>{m.label}</span>
                    <strong>{m.value}</strong>
                    <em>{m.delta}</em>
                  </div>
                ))}
              </div>

              <div className="ds-card__actions">
                <button type="button" className="ds-btn-primary" onClick={handlePreviewDeploy}>
                  {deployed
                    ? t.design.studio.web.previewPrimaryDone
                    : t.design.studio.web.previewPrimaryCta}
                </button>
                <button type="button" className="ds-btn-secondary">
                  {t.design.studio.web.previewSecondaryCta}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
