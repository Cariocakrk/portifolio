export interface CodeSnippetData {
  techName: string;
  fileName: string;
  languageLabel: string;
  code: string;
}

export const CODE_SNIPPETS: Record<string, CodeSnippetData> = {
  React: {
    techName: 'React',
    fileName: 'useCommandShortcut.ts',
    languageLabel: 'TypeScript / React',
    code: `import { useEffect } from 'react';

export function useCommandShortcut(onOpen: () => void) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        onOpen();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onOpen]);
}`,
  },
  'Three.js': {
    techName: 'Three.js',
    fileName: 'springLattice.ts',
    languageLabel: 'WebGL / Three.js',
    code: `// Spring-damped vertex displacement driven by pointer raycast
for (let i = 0; i < positions.count; i++) {
  const vx = positions.getX(i);
  const vy = positions.getY(i);
  const dist = Math.hypot(vx - hit.x, vy - hit.y);

  const force = Math.exp(-dist * dist * 0.55) * 0.95;
  velocities[i] += (force - heights[i]) * 0.12;
  velocities[i] *= 0.84;
  heights[i] += velocities[i];

  positions.setZ(i, heights[i]);
}
positions.needsUpdate = true;`,
  },
  'Node.js': {
    techName: 'Node.js',
    fileName: 'raidGuard.mjs',
    languageLabel: 'Node.js',
    code: `const joinWindow = new Map();

export function detectRaidSpike(guildId, now = Date.now()) {
  const recent = (joinWindow.get(guildId) ?? [])
    .filter((ts) => now - ts < 10_000);

  recent.push(now);
  joinWindow.set(guildId, recent);

  return {
    alert: recent.length >= 8,
    joinsIn10s: recent.length,
    action: recent.length >= 8 ? 'LOCK_INVITES' : 'NOMINAL',
  };
}`,
  },
  JavaScript: {
    techName: 'JavaScript',
    fileName: 'searchIndex.js',
    languageLabel: 'ES2022',
    code: `export function normalize(input) {
  return input
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function filterSkills(entries, query) {
  const needle = normalize(query);
  if (!needle) return entries;
  return entries.filter((item) =>
    normalize(\`\${item.group} \${item.label}\`).includes(needle)
  );
}`,
  },
  Python: {
    techName: 'Python',
    fileName: 'staff_audit.py',
    languageLabel: 'Python 3.12',
    code: `from dataclasses import dataclass

@dataclass(frozen=True)
class StaffMember:
    handle: str
    department: str
    active_tasks: int

def balance_workload(team: list[StaffMember]) -> list[str]:
    ordered = sorted(team, key=lambda m: m.active_tasks)
    return [
        f"{m.handle} ({m.department}) -> {m.active_tasks} tasks"
        for m in ordered
    ]`,
  },
  'C++': {
    techName: 'C++',
    fileName: 'hud_lerp.hpp',
    languageLabel: 'C++20',
    code: `#include <algorithm>

struct SmoothValue {
    float current = 1.0f;
    float target  = 1.0f;

    float step(float dt, float sharpness = 12.0f) {
        const float factor = std::clamp(dt * sharpness, 0.0f, 1.0f);
        current += (target - current) * factor;
        return current;
    }
};`,
  },
  CSS: {
    techName: 'CSS',
    fileName: 'layout.css',
    languageLabel: 'Modern CSS',
    code: `:root {
  --space-unit: 8px;
  --wrap-max: 1280px;
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
}

.editorial-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  gap: clamp(24px, 4vw, 64px);
  align-items: start;
}`,
  },
  HTML: {
    techName: 'HTML',
    fileName: 'landmarks.html',
    languageLabel: 'Semantic HTML5',
    code: `<header role="banner">
  <nav aria-label="Primary navigation">
    <a href="#development">Development</a>
    <a href="#design">UI/UX Design</a>
    <a href="#community">Community Ops</a>
  </nav>
</header>

<main id="main-content" tabindex="-1">
  <!-- Accessible landmark hierarchy -->
</main>`,
  },
};

export type TokenType = 'plain' | 'keyword' | 'string' | 'comment' | 'number';

export interface CodeToken {
  type: TokenType;
  value: string;
}

const TOKEN_REGEX =
  /(\/\/[^\n]*|#[^\n]*|<!--[\s\S]*?-->|\/\*[\s\S]*?\*\/|`[^`]*`|'[^']*'|"[^"]*"|\b(?:import|export|from|function|const|let|return|if|for|struct|def|class|in|float|true|false|new|void|include)\b|\b\d+(?:[._]\d+)*f?\b)/g;

const KEYWORDS = new Set([
  'import',
  'export',
  'from',
  'function',
  'const',
  'let',
  'return',
  'if',
  'for',
  'struct',
  'def',
  'class',
  'in',
  'float',
  'true',
  'false',
  'new',
  'void',
  'include',
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
    let type: TokenType = 'plain';

    if (
      value.startsWith('//') ||
      value.startsWith('#') ||
      value.startsWith('/*') ||
      value.startsWith('<!--')
    ) {
      type = 'comment';
    } else if (value.startsWith("'") || value.startsWith('"') || value.startsWith('`')) {
      type = 'string';
    } else if (KEYWORDS.has(value)) {
      type = 'keyword';
    } else if (/^\d/.test(value)) {
      type = 'number';
    }

    tokens.push({ type, value });
    lastIndex = index + value.length;
  }

  if (lastIndex < code.length) {
    tokens.push({ type: 'plain', value: code.slice(lastIndex) });
  }

  return tokens;
}
