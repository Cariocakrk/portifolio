export interface CodeSnippetData {
  techName: string;
  fileName: string;
  languageLabel: string;
  complexityTag: string;
  code: string;
}

export const CODE_SNIPPETS: Record<string, CodeSnippetData> = {
  React: {
    techName: 'React',
    fileName: 'useCommandBus.ts',
    languageLabel: 'TypeScript 5.8 · React 19',
    complexityTag: 'O(1) dispatch · Zero listener leaks',
    code: `import { useEffect, useRef } from 'react';

export interface ShortcutBinding {
  key: string;
  mod?: boolean;
  handler: (event: KeyboardEvent) => void;
}

export function useCommandBus(bindings: readonly ShortcutBinding[], enabled = true) {
  const latestRef = useRef(bindings);
  latestRef.current = bindings;

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditable = target?.matches('input, textarea, [contenteditable="true"]');

      for (const binding of latestRef.current) {
        const modMatch = binding.mod ? event.ctrlKey || event.metaKey : true;
        if (modMatch && event.key.toLowerCase() === binding.key.toLowerCase()) {
          if (isEditable && !binding.mod) continue;
          event.preventDefault();
          binding.handler(event);
          break;
        }
      }
    };

    window.addEventListener('keydown', onKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}`,
  },
  'Three.js': {
    techName: 'Three.js',
    fileName: 'tensorFieldSolver.ts',
    languageLabel: 'WebGL · Three.js BufferGeometry',
    complexityTag: 'Zero GC alloc/frame · 60–144 Hz',
    code: `// Direct Float32Array vertex solver with radial shockwave + spring damping
export function stepTensorField(
  positions: THREE.BufferAttribute,
  heights: Float32Array,
  velocities: Float32Array,
  hit: THREE.Vector3,
  pulseOrigin: THREE.Vector2,
  pulseAge: number,
  time: number
) {
  for (let i = 0; i < positions.count; i++) {
    const vx = positions.getX(i);
    const vy = positions.getY(i);

    const harmonic = Math.sin(vx * 0.72 + time * 0.9) * 0.14
                   + Math.cos(vy * 0.84 - time * 0.68) * 0.12;

    const dx = vx - hit.x;
    const dy = vy - hit.y;
    const cursorWell = Math.exp(-(dx * dx + dy * dy) * 0.62) * 0.96;

    const rDist = Math.hypot(vx - pulseOrigin.x, vy - pulseOrigin.y);
    const ring = Math.exp(-Math.pow(rDist - pulseAge * 4.8, 2) * 2.4)
               * Math.max(0, 1 - pulseAge * 0.45) * 0.85;

    const targetZ = harmonic + cursorWell + ring;
    velocities[i] = (velocities[i] + (targetZ - heights[i]) * 0.14) * 0.82;
    heights[i] += velocities[i];
    positions.setZ(i, heights[i]);
  }
  positions.needsUpdate = true;
}`,
  },
  'Node.js': {
    techName: 'Node.js',
    fileName: 'gatewayRaidShield.mjs',
    languageLabel: 'Node.js · Discord SecOps Engine',
    complexityTag: 'Sliding Window + Account Entropy',
    code: `const guildBuckets = new Map();
const WINDOW_MS = 10_000;

export function evaluateJoinEvent(guildId, accountAgeDays, now = Date.now()) {
  const history = (guildBuckets.get(guildId) ?? [])
    .filter((entry) => now - entry.ts < WINDOW_MS);

  history.push({ ts: now, fresh: accountAgeDays < 7 });
  guildBuckets.set(guildId, history);

  const velocity = history.length;
  const freshRatio = history.filter((e) => e.fresh).length / velocity;
  const riskScore = Math.min(100, Math.round(velocity * 6.5 + freshRatio * 42));

  const posture =
    riskScore >= 75 ? 'LOCKDOWN_INVITES' :
    riskScore >= 42 ? 'ELEVATED_VERIFICATION' :
    'NOMINAL';

  return { velocity, freshRatio, riskScore, posture };
}`,
  },
  JavaScript: {
    techName: 'JavaScript',
    fileName: 'lexicalIndex.js',
    languageLabel: 'ES2023 · Zero-Dependency Search',
    complexityTag: 'Unicode NFD · Sub-millisecond',
    code: `export function canonicalize(raw) {
  return raw
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function rankCompetencies(records, rawQuery) {
  const tokens = canonicalize(rawQuery).split(/\\s+/).filter(Boolean);
  if (tokens.length === 0) return records;

  const scored = [];
  for (const item of records) {
    const haystack = canonicalize(\`\${item.label} \${item.group}\`);
    let score = 0;

    for (const token of tokens) {
      if (!haystack.includes(token)) { score = -1; break; }
      score += haystack.startsWith(token) ? 3 : 1;
    }
    if (score > 0) scored.push({ item, score });
  }

  return scored.sort((a, b) => b.score - a.score).map((entry) => entry.item);
}`,
  },
  Python: {
    techName: 'Python',
    fileName: 'department_audit.py',
    languageLabel: 'Python 3.12 · Ops Analytics',
    complexityTag: 'Immutable Audit · Workload Balance',
    code: `from dataclasses import dataclass
from statistics import mean

@dataclass(frozen=True, slots=True)
class DepartmentSnapshot:
    name: str
    active_staff: int
    open_tickets: int
    sla_minutes: float

def diagnose_bottlenecks(units: list[DepartmentSnapshot]) -> dict[str, object]:
    if not units:
        return {"status": "EMPTY", "rebalance": []}

    loads = [u.open_tickets / max(u.active_staff, 1) for u in units]
    baseline = mean(loads)

    saturated = [
        f"{u.name}: {u.open_tickets} tickets ({u.sla_minutes:.1f}m SLA)"
        for u, ratio in zip(units, loads)
        if ratio > baseline * 1.35 or u.sla_minutes > 15.0
    ]
    return {
        "status": "REBALANCE_REQUIRED" if saturated else "BALANCED",
        "avg_load_per_staff": round(baseline, 2),
        "rebalance": saturated,
    }`,
  },
  'C++': {
    techName: 'C++',
    fileName: 'frame_invariant_damp.hpp',
    languageLabel: 'C++20 · Game HUD / Camera Math',
    complexityTag: 'Exact Exponential Decay · Deterministic',
    code: `#pragma once
#include <cmath>
#include <algorithm>

namespace ui::motion {

struct DualBarState {
    float primary = 100.0f;
    float ghost   = 100.0f;
    float target  = 100.0f;

    // Frame-rate independent damping: identical curve at 24Hz, 60Hz, or 240Hz
    void step(float dt) noexcept {
        const float fastAlpha = 1.0f - std::exp(-18.0f * dt);
        const float slowAlpha = 1.0f - std::exp(-3.4f * dt);

        primary += (target - primary) * std::clamp(fastAlpha, 0.0f, 1.0f);
        ghost   += (target - ghost)   * std::clamp(slowAlpha, 0.0f, 1.0f);
    }
};

} // namespace ui::motion`,
  },
  CSS: {
    techName: 'CSS',
    fileName: 'surface-tokens.css',
    languageLabel: 'Modern CSS · Scoped Surface Architecture',
    complexityTag: 'Zero Contrast Leaks · Fluid Clamp',
    code: `[data-theme='paper'] {
  --bg-surface: #f4f1ea;
  --bg-elevated: #ffffff;
  --fg-primary: #121316;
  --fg-muted: #525661;
  --border-hairline: rgba(18, 19, 22, 0.13);
}

[data-theme='carbon'] {
  --bg-surface: #0e1014;
  --bg-elevated: #151820;
  --fg-primary: #f4f2ec;
  --fg-muted: rgba(244, 242, 236, 0.68);
  --border-hairline: rgba(244, 242, 236, 0.12);
}

.swiss-matrix {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
  background: var(--bg-surface);
  color: var(--fg-primary);
  border-top: 1px solid var(--border-hairline);
}`,
  },
  HTML: {
    techName: 'HTML',
    fileName: 'command-dialog.html',
    languageLabel: 'Semantic HTML5 · WAI-ARIA 1.2',
    complexityTag: 'Keyboard-First · Screen Reader Ready',
    code: `<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="cmd-palette-title"
  class="palette-overlay"
>
  <h2 id="cmd-palette-title" class="sr-only">Command Navigation</h2>

  <div class="palette-combobox">
    <input
      type="text"
      role="combobox"
      aria-expanded="true"
      aria-controls="cmd-results-listbox"
      aria-activedescendant="cmd-opt-01"
      autocomplete="off"
    />
  </div>

  <ul id="cmd-results-listbox" role="listbox">
    <li id="cmd-opt-01" role="option" aria-selected="true">
      <span>02 / Engineering</span>
      <kbd>Enter</kbd>
    </li>
  </ul>
</div>`,
  },
};

export type TokenType = 'plain' | 'keyword' | 'string' | 'comment' | 'number' | 'type';

export interface CodeToken {
  type: TokenType;
  value: string;
}

const TOKEN_REGEX =
  /(\/\/[^\n]*|#[^\n]*|<!--[\s\S]*?-->|\/\*[\s\S]*?\*\/|`[^`]*`|'[^']*'|"[^"]*"|\b(?:import|export|from|function|const|let|return|if|else|for|of|in|struct|def|class|float|int|void|true|false|new|namespace|continue|break|readonly|interface|type|noexcept)\b|\b(?:THREE|Float32Array|Map|KeyboardEvent|HTMLElement|ShortcutBinding|DepartmentSnapshot|DualBarState|BufferAttribute|Vector2|Vector3|Math)\b|\b\d+(?:[._]\d+)*f?\b)/g;

const KEYWORDS = new Set([
  'import',
  'export',
  'from',
  'function',
  'const',
  'let',
  'return',
  'if',
  'else',
  'for',
  'of',
  'in',
  'struct',
  'def',
  'class',
  'float',
  'int',
  'void',
  'true',
  'false',
  'new',
  'namespace',
  'continue',
  'break',
  'readonly',
  'interface',
  'type',
  'noexcept',
]);

const TYPES = new Set([
  'THREE',
  'Float32Array',
  'Map',
  'KeyboardEvent',
  'HTMLElement',
  'ShortcutBinding',
  'DepartmentSnapshot',
  'DualBarState',
  'BufferAttribute',
  'Vector2',
  'Vector3',
  'Math',
]);

export function tokenizeCode(code: string): CodeToken[] {
  const tokens: CodeToken[] = [];
  let lastIndex = 0;

  for (const match of code.matchAll(TOKEN_REGEX)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      tokens.push({ type: 'plain', value: code.slice(lastIndex, index) });
    }

    const value = match[0];
    let tokenType: TokenType = 'plain';

    if (
      value.startsWith('//') ||
      value.startsWith('#') ||
      value.startsWith('/*') ||
      value.startsWith('<!--')
    ) {
      tokenType = 'comment';
    } else if (value.startsWith("'") || value.startsWith('"') || value.startsWith('`')) {
      tokenType = 'string';
    } else if (KEYWORDS.has(value)) {
      tokenType = 'keyword';
    } else if (TYPES.has(value)) {
      tokenType = 'type';
    } else if (/^\d/.test(value)) {
      tokenType = 'number';
    }

    tokens.push({ type: tokenType, value });
    lastIndex = index + value.length;
  }

  if (lastIndex < code.length) {
    tokens.push({ type: 'plain', value: code.slice(lastIndex) });
  }

  return tokens;
}
