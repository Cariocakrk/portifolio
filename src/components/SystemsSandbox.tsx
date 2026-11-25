import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export type EngineeringLabTab = 'raid' | 'physics' | 'search';

interface SystemsSandboxProps {
  activeLab: EngineeringLabTab;
  onSelectLab: (lab: EngineeringLabTab) => void;
}

interface JoinRecord {
  ts: number;
  freshAccount: boolean;
}

interface LogEntry {
  id: number;
  stamp: string;
  level: 'info' | 'warn' | 'crit';
  message: string;
}

function nowStamp(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  const ms = String(Math.floor(d.getMilliseconds() / 10)).padStart(2, '0');
  return `${hh}:${mm}:${ss}.${ms}`;
}

function canonicalize(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function SystemsSandbox({ activeLab, onSelectLab }: SystemsSandboxProps) {
  const { t } = useLanguage();

  // ================= LAB 1: ANTI-RAID GATEWAY ENGINE =================
  const joinsRef = useRef<JoinRecord[]>([]);
  const logSeqRef = useRef(3);
  const [velocity, setVelocity] = useState(1);
  const [riskScore, setRiskScore] = useState(8);
  const [sparkline, setSparkline] = useState<number[]>(() => Array(28).fill(6));
  const [logs, setLogs] = useState<LogEntry[]>(() => [
    { id: 1, stamp: nowStamp(), level: 'info', message: 'GATEWAY_READY window=10s threshold=75' },
    { id: 2, stamp: nowStamp(), level: 'info', message: 'RBAC_WATCHER permissions=nominal invites=open' },
  ]);

  const appendLog = (level: LogEntry['level'], message: string) => {
    logSeqRef.current += 1;
    const next: LogEntry = { id: logSeqRef.current, stamp: nowStamp(), level, message };
    setLogs((prev) => [next, ...prev].slice(0, 8));
  };

  useEffect(() => {
    if (activeLab !== 'raid') return;
    let prevPosture: 'nominal' | 'elevated' | 'lockdown' = 'nominal';

    const timer = window.setInterval(() => {
      const now = Date.now();
      joinsRef.current = joinsRef.current.filter((j) => now - j.ts < 10_000);
      const count = joinsRef.current.length;
      const freshCount = joinsRef.current.filter((j) => j.freshAccount).length;
      const freshRatio = count > 0 ? freshCount / count : 0;
      const score = count === 0 ? 4 : Math.min(100, Math.round(count * 5.8 + freshRatio * 44));

      const nextPosture: 'nominal' | 'elevated' | 'lockdown' =
        score >= 75 ? 'lockdown' : score >= 42 ? 'elevated' : 'nominal';

      if (nextPosture !== prevPosture) {
        if (nextPosture === 'lockdown') {
          appendLog('crit', `CIRCUIT_BREAKER -> LOCKDOWN (risk=${score}% rate=${count}/10s)`);
        } else if (nextPosture === 'elevated') {
          appendLog('warn', `ENTROPY_SPIKE -> ELEVATED_GATE (risk=${score}%)`);
        } else {
          appendLog('info', 'TRAFFIC_COOLED -> NOMINAL invites_restored=true');
        }
        prevPosture = nextPosture;
      }

      setVelocity(count);
      setRiskScore(score);
      setSparkline((prev) => [...prev.slice(1), score]);
    }, 280);

    return () => window.clearInterval(timer);
  }, [activeLab]);

  const triggerLegitJoin = () => {
    joinsRef.current.push({ ts: Date.now(), freshAccount: false });
    appendLog('info', `MEMBER_JOIN age=640d entropy=low window=${joinsRef.current.length}`);
  };

  const triggerRaidBurst = () => {
    const base = Date.now();
    for (let i = 0; i < 12; i++) {
      window.setTimeout(() => {
        joinsRef.current.push({ ts: Date.now(), freshAccount: true });
      }, i * 45);
    }
    appendLog('crit', `SYNTHETIC_BURST +12 token_accounts (<48h age) @ ${base % 10000}`);
  };

  const triggerPermissionAudit = () => {
    appendLog('info', 'RBAC_AUDIT roles=24 webhooks=3 admin_drift=0 -> HARDENED');
  };

  const resetRaidSim = () => {
    joinsRef.current = [];
    setVelocity(0);
    setRiskScore(4);
    setSparkline(Array(28).fill(4));
    appendLog('info', 'TELEMETRY_FLUSH window_cleared=true posture=NOMINAL');
  };

  const raidPosture: 'nominal' | 'elevated' | 'lockdown' =
    riskScore >= 75 ? 'lockdown' : riskScore >= 42 ? 'elevated' : 'nominal';

  const sparkPoints = useMemo(() => {
    const w = 360;
    const h = 84;
    return sparkline
      .map((val, idx) => {
        const x = (idx / Math.max(sparkline.length - 1, 1)) * w;
        const y = h - (Math.min(Math.max(val, 0), 100) / 100) * (h - 12) - 6;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [sparkline]);

  // ================= LAB 2: DELTA-TIME PHYSICS COMPARATOR =================
  const [simFps, setSimFps] = useState<144 | 60 | 20>(20);
  const [lambda, setLambda] = useState(11);
  const [targetPct, setTargetPct] = useState(84);
  const [naivePct, setNaivePct] = useState(14);
  const [exactPct, setExactPct] = useState(14);

  const physicsStateRef = useRef({
    target: 84,
    naive: 14,
    exact: 14,
    accumNaive: 0,
  });
  physicsStateRef.current.target = targetPct;

  useEffect(() => {
    if (activeLab !== 'physics') return;
    let raf = 0;
    let last = performance.now();

    const step = (now: number) => {
      raf = window.requestAnimationFrame(step);
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      const st = physicsStateRef.current;
      // Exact continuous-time exponential decay stepped at native display rate or throttled rate
      // Even when throttled, 1 - exp(-lambda * frameInterval) reaches the exact same curve!
      const frameInterval = 1 / simFps;
      st.accumNaive += dt;

      if (st.accumNaive >= frameInterval) {
        const stepDt = st.accumNaive;
        st.accumNaive = 0;
        // Naive fixed-factor lerp assumes 60fps; breaks at 20Hz or 144Hz
        st.naive += (st.target - st.naive) * 0.12;
        // Exact frame-rate independent decay
        const exactAlpha = 1 - Math.exp(-lambda * stepDt);
        st.exact += (st.target - st.exact) * exactAlpha;

        setNaivePct(st.naive);
        setExactPct(st.exact);
      }
    };

    raf = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(raf);
  }, [activeLab, simFps, lambda]);

  const triggerPhysicsImpulse = () => {
    setTargetPct((prev) => (prev > 50 ? 12 : 88));
  };

  // ================= LAB 3: UNICODE NFD SEARCH PIPELINE =================
  const [searchInput, setSearchInput] = useState(t.development.sandbox.search.sampleQueries[0] ?? 'gestao');

  const corpus = useMemo(() => {
    const rows: { id: string; group: string; label: string }[] = [];
    t.development.techStack.forEach((tech) =>
      rows.push({ id: `t-${tech.name}`, group: tech.category, label: `${tech.name} — ${tech.focus}` })
    );
    t.design.competencies.forEach((c, i) =>
      rows.push({ id: `d-${i}`, group: 'UI/UX', label: c })
    );
    t.community.domains.forEach((dom) =>
      dom.items.forEach((item, i) =>
        rows.push({ id: `c-${dom.id}-${i}`, group: dom.title, label: item })
      )
    );
    return rows;
  }, [t]);

  const searchDiagnostic = useMemo(() => {
    const t0 = performance.now();
    const normalized = canonicalize(searchInput);
    const tokens = normalized.split(/\s+/).filter(Boolean);

    const matched =
      tokens.length === 0
        ? corpus.slice(0, 6)
        : corpus.filter((entry) => {
            const hay = canonicalize(`${entry.group} ${entry.label}`);
            return tokens.every((tok) => hay.includes(tok));
          });

    const elapsedMs = Math.max(0.01, performance.now() - t0);
    return {
      normalized: normalized || '∅',
      tokens,
      totalMatches: tokens.length === 0 ? corpus.length : matched.length,
      preview: matched.slice(0, 6),
      elapsedMs: elapsedMs.toFixed(2),
    };
  }, [corpus, searchInput]);

  return (
    <div className="sandbox-shell">
      <div className="sandbox-shell__top">
        <div>
          <span className="sandbox-badge">{t.development.sandbox.badge}</span>
          <h3 className="sandbox-title">{t.development.sandbox.title}</h3>
          <p className="sandbox-subtitle">{t.development.sandbox.subtitle}</p>
        </div>

        <div className="sandbox-tabs" role="tablist" aria-label={t.development.sandbox.badge}>
          <button
            type="button"
            role="tab"
            aria-selected={activeLab === 'raid'}
            className={`sandbox-tab ${activeLab === 'raid' ? 'is-active' : ''}`}
            onClick={() => onSelectLab('raid')}
          >
            {t.development.sandbox.tabs.raid}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeLab === 'physics'}
            className={`sandbox-tab ${activeLab === 'physics' ? 'is-active' : ''}`}
            onClick={() => onSelectLab('physics')}
          >
            {t.development.sandbox.tabs.physics}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeLab === 'search'}
            className={`sandbox-tab ${activeLab === 'search' ? 'is-active' : ''}`}
            onClick={() => onSelectLab('search')}
          >
            {t.development.sandbox.tabs.search}
          </button>
        </div>
      </div>

      {activeLab === 'raid' && (
        <div className="sandbox-body sandbox-body--raid" role="tabpanel">
          <div className="raid-left">
            <p className="sandbox-desc">{t.development.sandbox.raid.desc}</p>

            <div className={`raid-banner raid-banner--${raidPosture}`}>
              <span className="raid-banner__label">{t.development.sandbox.raid.statusLabel}</span>
              <strong className="raid-banner__state">
                {t.development.sandbox.raid.states[raidPosture]}
              </strong>
            </div>

            <div className="raid-kpis">
              <div className="raid-kpi">
                <span>{t.development.sandbox.raid.rateLabel}</span>
                <strong>{velocity} joins</strong>
              </div>
              <div className="raid-kpi">
                <span>{t.development.sandbox.raid.entropyLabel}</span>
                <strong>{riskScore}%</strong>
              </div>
              <div className="raid-kpi">
                <span>{t.development.sandbox.raid.mitigationLabel}</span>
                <strong>
                  {raidPosture === 'lockdown'
                    ? 'INVITE_LOCK'
                    : raidPosture === 'elevated'
                      ? 'CAPTCHA_GATE'
                      : 'PASSIVE_MONITOR'}
                </strong>
              </div>
            </div>

            <div className="raid-chart-wrap" aria-hidden="true">
              <svg viewBox="0 0 360 84" preserveAspectRatio="none" className="raid-chart">
                <line x1="0" y1="24" x2="360" y2="24" className="raid-chart__thresh-crit" />
                <line x1="0" y1="48" x2="360" y2="48" className="raid-chart__thresh-warn" />
                <polyline fill="none" points={sparkPoints} className="raid-chart__line" />
              </svg>
            </div>

            <div className="raid-actions">
              <button type="button" className="lab-btn" onClick={triggerLegitJoin}>
                {t.development.sandbox.raid.btnNormal}
              </button>
              <button type="button" className="lab-btn lab-btn--danger" onClick={triggerRaidBurst}>
                {t.development.sandbox.raid.btnBurst}
              </button>
              <button type="button" className="lab-btn" onClick={triggerPermissionAudit}>
                {t.development.sandbox.raid.btnAudit}
              </button>
              <button type="button" className="lab-btn lab-btn--ghost" onClick={resetRaidSim}>
                {t.development.sandbox.raid.btnReset}
              </button>
            </div>
          </div>

          <div className="raid-terminal">
            <div className="raid-terminal__head">
              <span>{t.development.sandbox.raid.logTitle}</span>
              <span>WS // SHARD_00</span>
            </div>
            <ul className="raid-terminal__list">
              {logs.map((entry) => (
                <li key={entry.id} className={`raid-log raid-log--${entry.level}`}>
                  <span className="raid-log__time">[{entry.stamp}]</span>
                  <span className="raid-log__msg">{entry.message}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeLab === 'physics' && (
        <div className="sandbox-body sandbox-body--physics" role="tabpanel">
          <p className="sandbox-desc">{t.development.sandbox.physics.desc}</p>

          <div className="physics-controls">
            <div className="physics-control-group">
              <span className="mono-meta">{t.development.sandbox.physics.fpsLabel}</span>
              <div className="seg-pills">
                {([144, 60, 20] as const).map((hz) => (
                  <button
                    key={hz}
                    type="button"
                    className={`seg-pill ${simFps === hz ? 'is-active' : ''}`}
                    onClick={() => setSimFps(hz)}
                  >
                    {hz} Hz{hz === 20 ? ' (Drop)' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div className="physics-control-group">
              <label className="mono-meta" htmlFor="lambda-range">
                {t.development.sandbox.physics.stiffnessLabel}: {lambda}
              </label>
              <input
                id="lambda-range"
                type="range"
                min={4}
                max={22}
                value={lambda}
                onChange={(e) => setLambda(Number(e.target.value))}
                className="lab-range"
              />
            </div>

            <button type="button" className="lab-btn lab-btn--danger" onClick={triggerPhysicsImpulse}>
              {t.development.sandbox.physics.btnImpulse} ⇄
            </button>
          </div>

          <div className="physics-tracks">
            <div className="physics-lane">
              <div className="physics-lane__meta">
                <strong>{t.development.sandbox.physics.naiveLabel}</strong>
                <span>{t.development.sandbox.physics.naiveNote}</span>
              </div>
              <div className="physics-rail">
                <div className="physics-target-pin" style={{ left: `${targetPct}%` }} />
                <div className="physics-puck physics-puck--naive" style={{ left: `${naivePct}%` }} />
              </div>
            </div>

            <div className="physics-lane">
              <div className="physics-lane__meta">
                <strong>{t.development.sandbox.physics.dtLabel}</strong>
                <span>{t.development.sandbox.physics.dtNote}</span>
              </div>
              <div className="physics-rail">
                <div className="physics-target-pin" style={{ left: `${targetPct}%` }} />
                <div className="physics-puck physics-puck--exact" style={{ left: `${exactPct}%` }} />
              </div>
            </div>
          </div>

          <div className="physics-telemetry">
            <span>TARGET: {targetPct.toFixed(0)}%</span>
            <span>NAIVE: {naivePct.toFixed(1)}%</span>
            <span>EXACT Δt: {exactPct.toFixed(1)}%</span>
            <span>
              {t.development.sandbox.physics.driftLabel}: {Math.abs(exactPct - naivePct).toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {activeLab === 'search' && (
        <div className="sandbox-body sandbox-body--search" role="tabpanel">
          <p className="sandbox-desc">{t.development.sandbox.search.desc}</p>

          <div className="lex-input-bar">
            <label htmlFor="lex-query" className="mono-meta">
              {t.development.sandbox.search.inputLabel}
            </label>
            <input
              id="lex-query"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="lex-input"
            />
            <div className="lex-chips">
              {t.development.sandbox.search.sampleQueries.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  className={`seg-pill ${searchInput === sample ? 'is-active' : ''}`}
                  onClick={() => setSearchInput(sample)}
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          <div className="lex-pipeline">
            <div className="lex-stage">
              <span className="mono-meta">{t.development.sandbox.search.stageRaw}</span>
              <code>"{searchInput}"</code>
            </div>
            <div className="lex-stage">
              <span className="mono-meta">{t.development.sandbox.search.stageNormalized}</span>
              <code>"{searchDiagnostic.normalized}"</code>
            </div>
            <div className="lex-stage">
              <span className="mono-meta">{t.development.sandbox.search.stageTokens}</span>
              <div className="lex-token-list">
                {searchDiagnostic.tokens.length === 0 ? (
                  <code>[ALL]</code>
                ) : (
                  searchDiagnostic.tokens.map((tok, i) => <code key={`${tok}-${i}`}>{tok}</code>)
                )}
              </div>
            </div>
          </div>

          <div className="lex-results-head">
            <span>
              {t.development.sandbox.search.matchesLabel}:{' '}
              <strong>
                {searchDiagnostic.totalMatches} / {corpus.length}
              </strong>
            </span>
            <span>
              {t.development.sandbox.search.execTimeLabel}: <strong>{searchDiagnostic.elapsedMs} ms</strong>
            </span>
          </div>

          <div className="lex-preview-grid">
            {searchDiagnostic.preview.map((row) => (
              <div key={row.id} className="lex-preview-item">
                <span>{row.group}</span>
                <strong>{row.label}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
