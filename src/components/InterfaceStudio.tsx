import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export type DesignStudioMode = 'hud' | 'web';
type HudParadigm = 'diegetic' | 'contextual' | 'tactical';

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

interface SpatialNode {
  id: string;
  code: string;
  shape: 'diamond' | 'hex' | 'tri' | 'oct';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  ghostHp: number;
  hitFlash: number;
  respawnTimer: number;
  pulseCooldown: number;
}

interface BeamEffect {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  life: number;
  maxLife: number;
  color: string;
  jagged?: boolean;
}

interface RingWave {
  x: number;
  y: number;
  r: number;
  maxR: number;
  life: number;
  maxLife: number;
  color: string;
  hostile?: boolean;
  parried?: boolean;
}

interface FloatingTag {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

interface ShardParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

function createInitialNodes(w: number, h: number): SpatialNode[] {
  const safeW = Math.max(w, 560);
  const safeH = Math.max(h, 380);
  return [
    {
      id: 'n1',
      code: 'UNIT // A-01',
      shape: 'diamond',
      x: safeW * 0.26,
      y: safeH * 0.34,
      vx: 54,
      vy: 36,
      radius: 22,
      hp: 100,
      ghostHp: 100,
      hitFlash: 0,
      respawnTimer: 0,
      pulseCooldown: 2.6,
    },
    {
      id: 'n2',
      code: 'NODE // B-04',
      shape: 'hex',
      x: safeW * 0.72,
      y: safeH * 0.3,
      vx: -48,
      vy: 42,
      radius: 25,
      hp: 100,
      ghostHp: 100,
      hitFlash: 0,
      respawnTimer: 0,
      pulseCooldown: 4.1,
    },
    {
      id: 'n3',
      code: 'VECT // G-07',
      shape: 'tri',
      x: safeW * 0.64,
      y: safeH * 0.7,
      vx: -62,
      vy: -34,
      radius: 20,
      hp: 100,
      ghostHp: 100,
      hitFlash: 0,
      respawnTimer: 0,
      pulseCooldown: 5.4,
    },
    {
      id: 'n4',
      code: 'CORE // K-09',
      shape: 'oct',
      x: safeW * 0.34,
      y: safeH * 0.68,
      vx: 42,
      vy: -46,
      radius: 27,
      hp: 100,
      ghostHp: 100,
      hitFlash: 0,
      respawnTimer: 0,
      pulseCooldown: 3.5,
    },
  ];
}

function drawPolygon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  sides: number,
  rot: number
) {
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const a = rot + (i * Math.PI * 2) / sides;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export function InterfaceStudio({ mode, onModeChange }: InterfaceStudioProps) {
  const { t } = useLanguage();

  // ================= SPECIMEN A: DIEGETIC & RADIAL GAME UI ENGINE =================
  const [paradigm, setParadigm] = useState<HudParadigm>('diegetic');
  const [selectedSlot, setSelectedSlot] = useState(0);
  const [showFoveal, setShowFoveal] = useState(false);
  const [wheelPinned, setWheelPinned] = useState(false);

  // Live UX Telemetry displayed in footer bar (updated at ~10Hz to avoid DOM thrashing)
  const [telemetry, setTelemetry] = useState({
    saccadePx: 26,
    fittsBits: '2.14',
    timeScale: '1.00x',
    hits: 0,
    shots: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  // Mutable simulation state inside ref for 60/144Hz zero-re-render loop
  const simRef = useRef({
    w: 860,
    h: 440,
    pointerX: 430,
    pointerY: 220,
    rigX: 430,
    rigY: 220,
    pointerInside: false,
    recoilBloom: 0,
    hull: 92,
    ghostHull: 92,
    capacitor: 100,
    heat: 0,
    aegisTimer: 0,
    sonarTimer: 0,
    hitStopUntil: 0,
    lastActionTime: performance.now(),
    combatAlpha: 1,
    timeScale: 1,
    wheelActive: false,
    wheelHeldByInput: false,
    wheelX: 430,
    wheelY: 220,
    wheelHoverIdx: -1,
    lockedNodeId: null as string | null,
    lastFitts: 2.14,
    hits: 0,
    shots: 0,
    nodes: createInitialNodes(860, 440),
    beams: [] as BeamEffect[],
    waves: [] as RingWave[],
    tags: [] as FloatingTag[],
    shards: [] as ShardParticle[],
  });

  // Sync latest React controls & i18n strings into refs read by canvas loop
  const controlsRef = useRef({
    paradigm,
    selectedSlot,
    showFoveal,
    wheelPinned,
    hudText: t.design.studio.hud,
  });
  controlsRef.current = {
    paradigm,
    selectedSlot,
    showFoveal,
    wheelPinned,
    hudText: t.design.studio.hud,
  };

  const resetArena = useCallback(() => {
    const s = simRef.current;
    s.nodes = createInitialNodes(s.w, s.h);
    s.hull = 100;
    s.ghostHull = 100;
    s.capacitor = 100;
    s.heat = 0;
    s.aegisTimer = 0;
    s.sonarTimer = 0;
    s.beams = [];
    s.waves = [];
    s.tags = [];
    s.shards = [];
    s.hits = 0;
    s.shots = 0;
    s.lastActionTime = performance.now();
    setWheelPinned(false);
    s.wheelHeldByInput = false;
  }, []);

  const executeProtocol = useCallback((slotIndex: number) => {
    const s = simRef.current;
    const now = performance.now();
    s.lastActionTime = now;

    // Protocol 3: Chrono Sonar
    if (slotIndex === 2) {
      s.sonarTimer = 5.0;
      s.capacitor = Math.max(0, s.capacitor - 18);
      s.waves.push({
        x: s.rigX,
        y: s.rigY,
        r: 12,
        maxR: Math.max(s.w, s.h) * 0.85,
        life: 0,
        maxLife: 0.85,
        color: '#efece3',
      });
      s.tags.push({
        x: s.rigX,
        y: s.rigY - 26,
        vy: -28,
        text: 'SONAR // +1.2s VECT',
        color: '#efece3',
        life: 0,
        maxLife: 0.95,
      });
      return;
    }

    // Protocol 4: Phase Aegis
    if (slotIndex === 3) {
      s.aegisTimer = 3.6;
      s.capacitor = Math.max(0, s.capacitor - 15);
      s.waves.push({
        x: s.rigX,
        y: s.rigY,
        r: 20,
        maxR: 68,
        life: 0,
        maxLife: 0.45,
        color: '#e2a836',
      });
      s.tags.push({
        x: s.rigX,
        y: s.rigY - 26,
        vy: -28,
        text: 'AEGIS // PARRY ACTIVE',
        color: '#e2a836',
        life: 0,
        maxLife: 0.95,
      });
      return;
    }

    // Offensive Protocols 1 (Kinetic Lance) & 2 (Vector Arc)
    s.shots += 1;
    s.recoilBloom = Math.min(26, s.recoilBloom + 12);
    s.heat = Math.min(100, s.heat + 22);
    s.capacitor = Math.max(0, s.capacitor - 9);

    const aliveNodes = s.nodes.filter((n) => n.respawnTimer <= 0);
    let target = aliveNodes.find((n) => n.id === s.lockedNodeId) ?? null;

    if (!target) {
      // Direct hit check within generous Fitts capture radius
      let bestDist = 54;
      for (const n of aliveNodes) {
        const d = Math.hypot(n.x - s.pointerX, n.y - s.pointerY);
        if (d < bestDist + n.radius) {
          bestDist = d;
          target = n;
        }
      }
    }

    if (!target) {
      // Missed shot feedback
      s.waves.push({
        x: s.pointerX,
        y: s.pointerY,
        r: 4,
        maxR: 26,
        life: 0,
        maxLife: 0.25,
        color: 'rgba(239,236,227,0.45)',
      });
      return;
    }

    s.hits += 1;
    // Authentic 38ms game-feel Hit-Stop!
    s.hitStopUntil = now + 38;

    const applyDamage = (node: SpatialNode, dmg: number, accent: string) => {
      node.hp = Math.max(0, node.hp - dmg);
      node.hitFlash = 0.2;
      s.tags.push({
        x: node.x + (Math.random() - 0.5) * 16,
        y: node.y - node.radius - 6,
        vy: -38,
        text: `−${dmg}`,
        color: accent,
        life: 0,
        maxLife: 0.75,
      });

      const burstCount = node.hp <= 0 ? 14 : 6;
      for (let i = 0; i < burstCount; i++) {
        const ang = (Math.PI * 2 * i) / burstCount + Math.random() * 0.5;
        const spd = (node.hp <= 0 ? 130 : 75) + Math.random() * 65;
        s.shards.push({
          x: node.x,
          y: node.y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          life: 0,
          maxLife: node.hp <= 0 ? 0.65 : 0.36,
          color: accent,
        });
      }

      if (node.hp <= 0) {
        node.respawnTimer = 1.7;
        s.capacitor = Math.min(100, s.capacitor + 24);
        s.waves.push({
          x: node.x,
          y: node.y,
          r: 8,
          maxR: 64,
          life: 0,
          maxLife: 0.48,
          color: '#e84c2b',
        });
        s.tags.push({
          x: node.x,
          y: node.y,
          vy: -24,
          text: 'SYNC // +24% CAP',
          color: '#efece3',
          life: 0,
          maxLife: 0.9,
        });
      }
    };

    if (slotIndex === 0) {
      // Kinetic Lance
      s.beams.push({
        x1: s.rigX,
        y1: s.rigY,
        x2: target.x,
        y2: target.y,
        life: 0,
        maxLife: 0.22,
        color: '#e84c2b',
      });
      applyDamage(target, 34, '#e84c2b');
    } else if (slotIndex === 1) {
      // Vector Arc (Dual Chain)
      s.beams.push({
        x1: s.rigX,
        y1: s.rigY,
        x2: target.x,
        y2: target.y,
        life: 0,
        maxLife: 0.28,
        color: '#e2a836',
        jagged: true,
      });
      applyDamage(target, 26, '#e2a836');

      // Find nearest neighbor to chain
      let neighbor: SpatialNode | null = null;
      let best = 290;
      for (const cand of aliveNodes) {
        if (cand.id === target.id || cand.hp <= 0) continue;
        const d = Math.hypot(cand.x - target.x, cand.y - target.y);
        if (d < best) {
          best = d;
          neighbor = cand;
        }
      }
      if (neighbor) {
        s.beams.push({
          x1: target.x,
          y1: target.y,
          x2: neighbor.x,
          y2: neighbor.y,
          life: 0,
          maxLife: 0.34,
          color: '#efece3',
          jagged: true,
        });
        applyDamage(neighbor, 20, '#efece3');
      }
    }
  }, []);

  // Keyboard shortcuts: 1-4 quick-switch + Space hold for Slow-Mo Radial Wheel
  useEffect(() => {
    if (mode !== 'hud') return;

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.matches('input, textarea')) return;

      if (e.key >= '1' && e.key <= '4') {
        const idx = Number(e.key) - 1;
        setSelectedSlot(idx);
        simRef.current.lastActionTime = performance.now();
      } else if (e.code === 'Space' && simRef.current.pointerInside) {
        e.preventDefault();
        if (!simRef.current.wheelHeldByInput) {
          simRef.current.wheelHeldByInput = true;
          simRef.current.wheelX = simRef.current.pointerX;
          simRef.current.wheelY = simRef.current.pointerY;
          simRef.current.wheelHoverIdx = -1;
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && simRef.current.wheelHeldByInput) {
        e.preventDefault();
        const chosen = simRef.current.wheelHoverIdx;
        simRef.current.wheelHeldByInput = false;
        if (chosen >= 0 && chosen <= 3) {
          setSelectedSlot(chosen);
          setWheelPinned(false);
          executeProtocol(chosen);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [mode, executeProtocol]);

  // Main 60/144Hz Spatial Canvas Loop
  useEffect(() => {
    if (mode !== 'hud') return;
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const syncSize = () => {
      const rect = stage.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(Math.floor(rect.width), 320);
      const h = Math.max(Math.floor(rect.height), 380);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      simRef.current.w = w;
      simRef.current.h = h;
      if (!simRef.current.pointerInside) {
        simRef.current.pointerX = w * 0.5;
        simRef.current.pointerY = h * 0.5;
      }
    };

    syncSize();
    const ro = new ResizeObserver(syncSize);
    ro.observe(stage);

    let raf = 0;
    let prev = performance.now();
    let lastTelemetryPush = 0;

    const render = (now: number) => {
      raf = window.requestAnimationFrame(render);
      const rawDt = Math.min((now - prev) / 1000, 0.05);
      prev = now;

      const s = simRef.current;
      const ctrl = controlsRef.current;
      const { w, h } = s;

      // Check Radial Wheel state & Time Dilation (0.18x slow-motion!)
      const wheelOpen = s.wheelHeldByInput || ctrl.wheelPinned;
      s.wheelActive = wheelOpen;
      if (ctrl.wheelPinned && !s.wheelHeldByInput) {
        s.wheelX = w * 0.5;
        s.wheelY = h * 0.5;
      }

      const targetScale = wheelOpen ? 0.18 : 1.0;
      s.timeScale += (targetScale - s.timeScale) * (1 - Math.exp(-14 * rawDt));

      // Hit-stop freezes world simulation for 38ms while keeping reticle responsive!
      const inHitStop = now < s.hitStopUntil;
      const simDt = inHitStop ? 0 : rawDt * s.timeScale;

      // Contextual UI opacity (fades smoothly after 2.2s idle in 'contextual' paradigm)
      const idleSec = (now - s.lastActionTime) / 1000;
      const targetCombatAlpha =
        ctrl.paradigm === 'contextual' && idleSec > 2.2 && !s.lockedNodeId && !wheelOpen
          ? 0.14
          : 1.0;
      s.combatAlpha += (targetCombatAlpha - s.combatAlpha) * (1 - Math.exp(-8 * rawDt));

      // Passive regeneration & cooldowns
      s.capacitor = Math.min(100, s.capacitor + 9 * simDt);
      s.heat = Math.max(0, s.heat - 24 * rawDt);
      s.recoilBloom *= Math.exp(-11 * rawDt);
      s.ghostHull += (s.hull - s.ghostHull) * (1 - Math.exp(-3.2 * rawDt));
      if (s.hull < 100 && idleSec > 3.0) {
        s.hull = Math.min(100, s.hull + 6 * simDt);
      }
      if (s.aegisTimer > 0) s.aegisTimer = Math.max(0, s.aegisTimer - simDt);
      if (s.sonarTimer > 0) s.sonarTimer = Math.max(0, s.sonarTimer - simDt);

      // Update autonomous spatial nodes
      const padX = 56;
      const padY = 58;
      let closestNode: SpatialNode | null = null;
      let closestDist = 74;

      for (const node of s.nodes) {
        if (node.respawnTimer > 0) {
          node.respawnTimer -= simDt;
          if (node.respawnTimer <= 0) {
            node.hp = 100;
            node.ghostHp = 100;
            node.x = padX + Math.random() * Math.max(80, w - padX * 2);
            node.y = padY + Math.random() * Math.max(80, h - padY * 2);
            s.waves.push({
              x: node.x,
              y: node.y,
              r: 6,
              maxR: 38,
              life: 0,
              maxLife: 0.4,
              color: 'rgba(239,236,227,0.5)',
            });
          }
          continue;
        }

        node.x += node.vx * simDt;
        node.y += node.vy * simDt;
        if (node.x < padX || node.x > w - padX) {
          node.vx *= -1;
          node.x = Math.max(padX, Math.min(w - padX, node.x));
        }
        if (node.y < padY || node.y > h - padY) {
          node.vy *= -1;
          node.y = Math.max(padY, Math.min(h - padY, node.y));
        }

        node.ghostHp += (node.hp - node.ghostHp) * (1 - Math.exp(-4.5 * rawDt));
        if (node.hitFlash > 0) node.hitFlash = Math.max(0, node.hitFlash - rawDt);

        // Periodic hostile pulse ring to demonstrate directional threat / Aegis parry
        node.pulseCooldown -= simDt;
        if (node.pulseCooldown <= 0) {
          node.pulseCooldown = 3.8 + Math.random() * 2.4;
          s.waves.push({
            x: node.x,
            y: node.y,
            r: node.radius,
            maxR: 155,
            life: 0,
            maxLife: 1.05,
            color: 'rgba(232,76,43,0.55)',
            hostile: true,
          });
        }

        // Check magnetic lock-on distance
        const distToCursor = Math.hypot(node.x - s.pointerX, node.y - s.pointerY);
        if (distToCursor < closestDist) {
          closestDist = distToCursor;
          closestNode = node;
        }
      }

      // Lock-on & Fitts's Law Index of Difficulty: ID = log2(2D / W)
      if (closestNode && !wheelOpen) {
        if (s.lockedNodeId !== closestNode.id) {
          s.lastActionTime = now;
        }
        s.lockedNodeId = closestNode.id;
        const distFromRig = Math.max(12, Math.hypot(closestNode.x - s.rigX, closestNode.y - s.rigY));
        const targetWidth = closestNode.radius * 2;
        s.lastFitts = Math.max(0.4, Math.log2((2 * distFromRig) / targetWidth));

        // Subtle magnetic pull (28% toward target center)
        const snapX = s.pointerX + (closestNode.x - s.pointerX) * 0.28;
        const snapY = s.pointerY + (closestNode.y - s.pointerY) * 0.28;
        s.rigX += (snapX - s.rigX) * (1 - Math.exp(-22 * rawDt));
        s.rigY += (snapY - s.rigY) * (1 - Math.exp(-22 * rawDt));
      } else {
        s.lockedNodeId = null;
        s.rigX += (s.pointerX - s.rigX) * (1 - Math.exp(-24 * rawDt));
        s.rigY += (s.pointerY - s.rigY) * (1 - Math.exp(-24 * rawDt));
      }

      // Radial wheel quadrant math with 22px inner deadzone
      if (wheelOpen) {
        const dx = s.pointerX - s.wheelX;
        const dy = s.pointerY - s.wheelY;
        const dist = Math.hypot(dx, dy);
        if (dist < 22) {
          s.wheelHoverIdx = -1;
        } else {
          // Top=0, Right=1, Bottom=2, Left=3
          const deg = ((Math.atan2(dy, dx) * 180) / Math.PI + 360 + 135) % 360;
          s.wheelHoverIdx = Math.floor(deg / 90) % 4;
        }
      }

      // ================= RENDER PASS =================
      ctx.clearRect(0, 0, w, h);

      // 1. Deep Obsidian-Bone Arena Background
      ctx.fillStyle = wheelOpen ? '#07080a' : '#0b0c0f';
      ctx.fillRect(0, 0, w, h);

      // 2. Architectural Coordinate Grid + Plus Cross-Ticks
      const gridStep = 56;
      ctx.strokeStyle = 'rgba(239, 236, 227, 0.045)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let gx = gridStep; gx < w; gx += gridStep) {
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
      }
      for (let gy = gridStep; gy < h; gy += gridStep) {
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
      }
      ctx.stroke();

      ctx.fillStyle = 'rgba(239, 236, 227, 0.16)';
      for (let gx = gridStep; gx < w; gx += gridStep * 2) {
        for (let gy = gridStep; gy < h; gy += gridStep * 2) {
          ctx.fillRect(gx - 2, gy - 0.5, 5, 1);
          ctx.fillRect(gx - 0.5, gy - 2, 1, 5);
        }
      }

      // 3. Optional Human Foveal Vision Cone (5° & 15° X-Ray)
      if (ctrl.showFoveal) {
        ctx.save();
        // 15° Parafoveal
        ctx.beginPath();
        ctx.arc(s.pointerX, s.pointerY, 170, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(226, 168, 54, 0.04)';
        ctx.fill();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(226, 168, 54, 0.42)';
        ctx.stroke();

        // 5° Foveal sharp acuity
        ctx.beginPath();
        ctx.arc(s.pointerX, s.pointerY, 68, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(232, 76, 43, 0.07)';
        ctx.fill();
        ctx.setLineDash([]);
        ctx.strokeStyle = 'rgba(232, 76, 43, 0.65)';
        ctx.stroke();

        ctx.font = '500 10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#e84c2b';
        ctx.fillText(ctrl.hudText.fovealInnerLabel, s.pointerX + 10, s.pointerY - 73);
        ctx.fillStyle = '#e2a836';
        ctx.fillText(ctrl.hudText.fovealOuterLabel, s.pointerX + 10, s.pointerY - 175);
        ctx.restore();
      }

      // 4. Expanding Waves & Hostile Pulses (+ Aegis Parry Interception)
      for (let i = s.waves.length - 1; i >= 0; i--) {
        const wave = s.waves[i];
        wave.life += simDt;
        if (wave.life >= wave.maxLife) {
          s.waves.splice(i, 1);
          continue;
        }
        const tNorm = wave.life / wave.maxLife;
        wave.r = wave.maxR * (1 - Math.pow(1 - tNorm, 2));

        // Check hostile wave vs player rig / Phase Aegis
        if (wave.hostile && !wave.parried) {
          const dRig = Math.hypot(wave.x - s.rigX, wave.y - s.rigY);
          if (Math.abs(dRig - wave.r) < 14) {
            wave.parried = true;
            if (s.aegisTimer > 0) {
              // Parried!
              s.capacitor = Math.min(100, s.capacitor + 22);
              s.tags.push({
                x: s.rigX,
                y: s.rigY - 30,
                vy: -32,
                text: 'PARRY // +22% CAP',
                color: '#e2a836',
                life: 0,
                maxLife: 0.85,
              });
            } else {
              s.hull = Math.max(18, s.hull - 9);
              s.lastActionTime = now;
            }
          }
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.r, 0, Math.PI * 2);
        ctx.strokeStyle = wave.color;
        ctx.globalAlpha = (1 - tNorm) * 0.85;
        ctx.lineWidth = wave.hostile ? 1.2 : 1.6;
        ctx.stroke();
        ctx.restore();
      }

      // 5. Spatial Entities + World-Space Telemetry
      for (const node of s.nodes) {
        if (node.respawnTimer > 0) continue;
        const isLocked = node.id === s.lockedNodeId;

        // Chrono-Sonar Predictive Lead Vector (1.2s ahead)
        if (s.sonarTimer > 0) {
          const leadX = Math.max(padX, Math.min(w - padX, node.x + node.vx * 1.1));
          const leadY = Math.max(padY, Math.min(h - padY, node.y + node.vy * 1.1));
          ctx.save();
          ctx.setLineDash([3, 3]);
          ctx.strokeStyle = 'rgba(239, 236, 227, 0.35)';
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(leadX, leadY);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.strokeStyle = '#e2a836';
          ctx.strokeRect(leadX - 5, leadY - 5, 10, 10);
          ctx.restore();
        }

        // Ghost & Active Integrity Arcs around entity
        const startAng = -Math.PI / 2;
        const ghostEnd = startAng + (Math.PI * 2 * node.ghostHp) / 100;
        const hpEnd = startAng + (Math.PI * 2 * node.hp) / 100;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 7, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(239, 236, 227, 0.1)';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (node.ghostHp > node.hp + 0.5) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 7, startAng, ghostEnd);
          ctx.strokeStyle = 'rgba(232, 76, 43, 0.6)';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 7, startAng, hpEnd);
        ctx.strokeStyle = isLocked ? '#e84c2b' : 'rgba(239, 236, 227, 0.72)';
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // Geometric Core Shape
        const sides =
          node.shape === 'tri' ? 3 : node.shape === 'diamond' ? 4 : node.shape === 'hex' ? 6 : 8;
        const rot = now * 0.0006 * (node.vx > 0 ? 1 : -1);

        ctx.save();
        drawPolygon(ctx, node.x, node.y, node.radius * 0.72, sides, rot);
        ctx.fillStyle =
          node.hitFlash > 0
            ? '#ffffff'
            : isLocked
              ? 'rgba(232, 76, 43, 0.22)'
              : 'rgba(239, 236, 227, 0.06)';
        ctx.fill();
        ctx.strokeStyle = node.hitFlash > 0 ? '#ffffff' : isLocked ? '#e84c2b' : '#efece3';
        ctx.lineWidth = isLocked ? 1.8 : 1.2;
        ctx.stroke();
        ctx.restore();

        // Locked Target Corner Brackets & Diegetic Bezier Callout
        if (isLocked && !wheelOpen) {
          const br = node.radius + 14;
          const len = 7;
          ctx.strokeStyle = '#e84c2b';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          // Top-left
          ctx.moveTo(node.x - br, node.y - br + len);
          ctx.lineTo(node.x - br, node.y - br);
          ctx.lineTo(node.x - br + len, node.y - br);
          // Top-right
          ctx.moveTo(node.x + br - len, node.y - br);
          ctx.lineTo(node.x + br, node.y - br);
          ctx.lineTo(node.x + br, node.y - br + len);
          // Bottom-left
          ctx.moveTo(node.x - br, node.y + br - len);
          ctx.lineTo(node.x - br, node.y + br);
          ctx.lineTo(node.x - br + len, node.y + br);
          // Bottom-right
          ctx.moveTo(node.x + br - len, node.y + br);
          ctx.lineTo(node.x + br, node.y + br);
          ctx.lineTo(node.x + br, node.y + br - len);
          ctx.stroke();

          // Diegetic World-Space Callout Card (Dead Space / Death Stranding tether)
          if (ctrl.paradigm !== 'tactical') {
            const dirX = node.x > w * 0.62 ? -1 : 1;
            const cardX = node.x + dirX * (node.radius + 36);
            const cardY = Math.max(46, Math.min(h - 62, node.y - 24));
            const cardW = 148;

            ctx.strokeStyle = 'rgba(239, 236, 227, 0.6)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(node.x + dirX * (node.radius + 9), node.y - 6);
            ctx.lineTo(cardX, cardY);
            ctx.lineTo(cardX + dirX * cardW, cardY);
            ctx.stroke();

            const textLeft = dirX > 0 ? cardX + 6 : cardX - cardW + 6;
            ctx.fillStyle = 'rgba(11, 12, 15, 0.86)';
            ctx.fillRect(dirX > 0 ? cardX : cardX - cardW, cardY - 22, cardW, 42);

            ctx.font = '600 10px "JetBrains Mono", monospace';
            ctx.fillStyle = '#e84c2b';
            ctx.fillText(node.code, textLeft, cardY - 8);

            ctx.font = '500 10px "JetBrains Mono", monospace';
            ctx.fillStyle = '#efece3';
            ctx.fillText(
              `HP ${Math.round(node.hp)}% · ID ${s.lastFitts.toFixed(2)}b`,
              textLeft,
              cardY + 13
            );
          }
        }
      }

      // 6. Weapon Beams & Vector Arcs
      for (let i = s.beams.length - 1; i >= 0; i--) {
        const b = s.beams[i];
        b.life += rawDt;
        if (b.life >= b.maxLife) {
          s.beams.splice(i, 1);
          continue;
        }
        const alpha = 1 - b.life / b.maxLife;
        ctx.save();
        ctx.strokeStyle = b.color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = b.jagged ? 2.0 : 2.6;
        ctx.beginPath();
        ctx.moveTo(b.x1, b.y1);
        if (b.jagged) {
          const steps = 6;
          for (let k = 1; k < steps; k++) {
            const frac = k / steps;
            const jx = b.x1 + (b.x2 - b.x1) * frac + (Math.random() - 0.5) * 18;
            const jy = b.y1 + (b.y2 - b.y1) * frac + (Math.random() - 0.5) * 18;
            ctx.lineTo(jx, jy);
          }
        }
        ctx.lineTo(b.x2, b.y2);
        ctx.stroke();
        ctx.restore();
      }

      // 7. Shards & Floating Physics Numbers
      for (let i = s.shards.length - 1; i >= 0; i--) {
        const p = s.shards[i];
        p.life += simDt;
        if (p.life >= p.maxLife) {
          s.shards.splice(i, 1);
          continue;
        }
        p.x += p.vx * simDt;
        p.y += p.vy * simDt;
        p.vx *= 0.94;
        p.vy *= 0.94;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 1 - p.life / p.maxLife;
        ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
        ctx.globalAlpha = 1;
      }

      ctx.font = '600 11px "JetBrains Mono", monospace';
      for (let i = s.tags.length - 1; i >= 0; i--) {
        const tag = s.tags[i];
        tag.life += rawDt;
        if (tag.life >= tag.maxLife) {
          s.tags.splice(i, 1);
          continue;
        }
        tag.y += tag.vy * rawDt;
        ctx.globalAlpha = 1 - tag.life / tag.maxLife;
        ctx.fillStyle = tag.color;
        ctx.fillText(tag.text, tag.x, tag.y);
        ctx.globalAlpha = 1;
      }

      // 8. Phase Aegis Hexagonal Shield Ring (if active)
      if (s.aegisTimer > 0) {
        ctx.save();
        drawPolygon(ctx, s.rigX, s.rigY, 54, 6, now * 0.002);
        ctx.strokeStyle = '#e2a836';
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.fillStyle = 'rgba(226, 168, 54, 0.08)';
        ctx.fill();
        ctx.restore();
      }

      // 9. PARADIGM-SPECIFIC HUD RENDERING
      const activeSlot = ctrl.hudText.slots[ctrl.selectedSlot] ?? ctrl.hudText.slots[0];

      if (!wheelOpen) {
        if (ctrl.paradigm === 'diegetic') {
          // DIEGETIC: Zero corner clutter! Curved arcs orbit the cursor rig directly
          const arcR = 32 + s.recoilBloom * 0.45;
          // Left Arc: Hull / Capacitor
          const leftStart = Math.PI * 0.62;
          const leftSpan = Math.PI * 0.76;
          ctx.lineWidth = 3;
          ctx.strokeStyle = 'rgba(239, 236, 227, 0.14)';
          ctx.beginPath();
          ctx.arc(s.rigX, s.rigY, arcR, leftStart, leftStart + leftSpan);
          ctx.stroke();

          ctx.strokeStyle = '#efece3';
          ctx.beginPath();
          ctx.arc(
            s.rigX,
            s.rigY,
            arcR,
            leftStart,
            leftStart + leftSpan * (s.capacitor / 100)
          );
          ctx.stroke();

          // Right Arc: Weapon Heat / Integrity
          const rightStart = -Math.PI * 0.38;
          ctx.strokeStyle = 'rgba(239, 236, 227, 0.14)';
          ctx.beginPath();
          ctx.arc(s.rigX, s.rigY, arcR, rightStart, rightStart + leftSpan);
          ctx.stroke();

          ctx.strokeStyle = s.hull < 35 ? '#e84c2b' : '#e2a836';
          ctx.beginPath();
          ctx.arc(
            s.rigX,
            s.rigY,
            arcR,
            rightStart,
            rightStart + leftSpan * (s.hull / 100)
          );
          ctx.stroke();

          // Micro Diegetic Tag next to rig
          ctx.font = '500 10px "JetBrains Mono", monospace';
          ctx.fillStyle = 'rgba(239, 236, 227, 0.85)';
          ctx.fillText(`[${activeSlot.key}] ${activeSlot.code}`, s.rigX + arcR + 10, s.rigY + 4);
        } else if (ctrl.paradigm === 'contextual') {
          // CONTEXTUAL (NieR YoRHa style): Auto-fades when idle!
          ctx.save();
          ctx.globalAlpha = s.combatAlpha;

          // YoRHa double hairline header bar at top-left
          const bx = 22;
          const by = 22;
          ctx.fillStyle = 'rgba(239, 236, 227, 0.9)';
          ctx.fillRect(bx, by, 4, 38);
          ctx.strokeStyle = 'rgba(239, 236, 227, 0.35)';
          ctx.strokeRect(bx + 10, by, 210, 14);
          ctx.fillStyle = '#efece3';
          ctx.fillRect(bx + 12, by + 2, 206 * (s.hull / 100), 10);

          ctx.strokeRect(bx + 10, by + 20, 160, 8);
          ctx.fillStyle = '#e2a836';
          ctx.fillRect(bx + 12, by + 22, 156 * (s.capacitor / 100), 4);

          ctx.font = '500 10px "JetBrains Mono", monospace';
          ctx.fillStyle = '#efece3';
          ctx.fillText(
            `${activeSlot.code} // ${activeSlot.name.toUpperCase()}`,
            bx + 10,
            by + 44
          );
          ctx.restore();

          if (s.combatAlpha < 0.35) {
            ctx.font = '500 10px "JetBrains Mono", monospace';
            ctx.fillStyle = 'rgba(239, 236, 227, 0.42)';
            ctx.fillText(ctrl.hudText.dormantNote, 22, h - 18);
          }
        } else {
          // COMPETITIVE / TACTICAL: 100% clean center aim, crisp bottom peripheral deck
          const deckH = 44;
          const dy = h - deckH - 14;
          ctx.fillStyle = 'rgba(11, 12, 15, 0.9)';
          ctx.strokeStyle = 'rgba(239, 236, 227, 0.22)';
          ctx.lineWidth = 1;

          // Left Vitals Block
          ctx.fillRect(18, dy, 230, deckH);
          ctx.strokeRect(18, dy, 230, deckH);
          ctx.font = '700 18px "Space Grotesk", sans-serif';
          ctx.fillStyle = s.hull < 35 ? '#e84c2b' : '#efece3';
          ctx.fillText(`${Math.round(s.hull)}`, 30, dy + 28);
          ctx.font = '500 9px "JetBrains Mono", monospace';
          ctx.fillStyle = 'rgba(239, 236, 227, 0.55)';
          ctx.fillText(ctrl.hudText.integrityShort, 66, dy + 25);

          ctx.font = '700 18px "Space Grotesk", sans-serif';
          ctx.fillStyle = '#e2a836';
          ctx.fillText(`${Math.round(s.capacitor)}%`, 132, dy + 28);
          ctx.font = '500 9px "JetBrains Mono", monospace';
          ctx.fillStyle = 'rgba(239, 236, 227, 0.55)';
          ctx.fillText(ctrl.hudText.capacitorShort, 184, dy + 25);

          // Right Protocol Strip
          const stripW = 296;
          const sx = w - stripW - 18;
          ctx.fillStyle = 'rgba(11, 12, 15, 0.9)';
          ctx.fillRect(sx, dy, stripW, deckH);
          ctx.strokeRect(sx, dy, stripW, deckH);

          ctrl.hudText.slots.forEach((slot, idx) => {
            const cellW = stripW / 4;
            const cx = sx + idx * cellW;
            if (idx === ctrl.selectedSlot) {
              ctx.fillStyle = 'rgba(232, 76, 43, 0.22)';
              ctx.fillRect(cx, dy, cellW, deckH);
              ctx.fillStyle = '#e84c2b';
              ctx.fillRect(cx, dy + deckH - 3, cellW, 3);
            }
            ctx.font = '600 10px "JetBrains Mono", monospace';
            ctx.fillStyle = idx === ctrl.selectedSlot ? '#ffffff' : 'rgba(239, 236, 227, 0.55)';
            ctx.fillText(`[${slot.key}] ${slot.code}`, cx + 8, dy + 26);
          });
        }

        // Precision Crosshair (always crisp, expands with real recoil bloom!)
        const gap = 5 + s.recoilBloom;
        const tick = ctrl.paradigm === 'tactical' ? 7 : 5;
        ctx.strokeStyle = s.lockedNodeId ? '#e84c2b' : '#efece3';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(s.pointerX - gap - tick, s.pointerY);
        ctx.lineTo(s.pointerX - gap, s.pointerY);
        ctx.moveTo(s.pointerX + gap, s.pointerY);
        ctx.lineTo(s.pointerX + gap + tick, s.pointerY);
        ctx.moveTo(s.pointerX, s.pointerY - gap - tick);
        ctx.lineTo(s.pointerX, s.pointerY - gap);
        ctx.moveTo(s.pointerX, s.pointerY + gap);
        ctx.lineTo(s.pointerX, s.pointerY + gap + tick);
        ctx.stroke();

        ctx.fillStyle = '#e84c2b';
        ctx.fillRect(s.pointerX - 1.5, s.pointerY - 1.5, 3, 3);
      } else {
        // 10. SLOW-MOTION RADIAL COMMAND WHEEL (0.18x Time Dilation!)
        const wx = Math.max(135, Math.min(w - 135, s.wheelX));
        const wy = Math.max(135, Math.min(h - 135, s.wheelY));
        const innerR = 34;
        const outerR = 108;

        // Subtle backdrop ring
        ctx.save();
        ctx.beginPath();
        ctx.arc(wx, wy, outerR + 14, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(7, 8, 10, 0.76)';
        ctx.fill();

        const angles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI]; // Top, Right, Bottom, Left
        const halfSpan = (Math.PI / 4) * 0.88;

        ctrl.hudText.slots.forEach((slot, idx) => {
          const mid = angles[idx];
          const isHov = s.wheelHoverIdx === idx;
          const rOut = isHov ? outerR + 8 : outerR;
          const rIn = isHov ? innerR + 3 : innerR;

          ctx.beginPath();
          ctx.arc(wx, wy, rOut, mid - halfSpan, mid + halfSpan);
          ctx.arc(wx, wy, rIn, mid + halfSpan, mid - halfSpan, true);
          ctx.closePath();

          ctx.fillStyle = isHov
            ? '#e84c2b'
            : idx === ctrl.selectedSlot
              ? 'rgba(239, 236, 227, 0.16)'
              : 'rgba(239, 236, 227, 0.06)';
          ctx.fill();
          ctx.strokeStyle = isHov ? '#ffffff' : 'rgba(239, 236, 227, 0.26)';
          ctx.lineWidth = isHov ? 1.6 : 1;
          ctx.stroke();

          const labelR = (rIn + rOut) * 0.5;
          const lx = wx + Math.cos(mid) * labelR;
          const ly = wy + Math.sin(mid) * labelR;

          ctx.textAlign = 'center';
          ctx.font = '600 10px "JetBrains Mono", monospace';
          ctx.fillStyle = isHov ? '#ffffff' : '#e84c2b';
          ctx.fillText(`[${slot.key}] ${slot.code}`, lx, ly - 3);

          ctx.font = '600 11px "Space Grotesk", sans-serif';
          ctx.fillStyle = isHov ? '#0b0c0f' : '#efece3';
          ctx.fillText(slot.name, lx, ly + 11);
        });

        // Deadzone Hub + Vector Aim Line
        ctx.beginPath();
        ctx.arc(wx, wy, 22, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(239, 236, 227, 0.35)';
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.lineTo(s.pointerX, s.pointerY);
        ctx.strokeStyle = 'rgba(232, 76, 43, 0.7)';
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(s.pointerX, s.pointerY, 3, 0, Math.PI * 2);
        ctx.fill();

        const hoveredSlot =
          s.wheelHoverIdx >= 0 ? ctrl.hudText.slots[s.wheelHoverIdx] : null;
        ctx.textAlign = 'center';
        ctx.font = '600 10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#efece3';
        ctx.fillText(
          hoveredSlot ? hoveredSlot.role : ctrl.hudText.wheelDeadzone,
          wx,
          wy + 4
        );

        ctx.fillStyle = 'rgba(239, 236, 227, 0.65)';
        ctx.fillText(ctrl.hudText.wheelHint, wx, wy + outerR + 30);
        ctx.textAlign = 'left';
        ctx.restore();
      }

      // Push live UX metrics at ~10Hz
      if (now - lastTelemetryPush > 110) {
        lastTelemetryPush = now;
        const saccade =
          ctrl.paradigm === 'diegetic'
            ? 28
            : ctrl.paradigm === 'contextual'
              ? Math.round(64 + s.combatAlpha * 140)
              : Math.round(Math.hypot(s.pointerX - 120, h - 36 - s.pointerY));

        setTelemetry({
          saccadePx: saccade,
          fittsBits: s.lastFitts.toFixed(2),
          timeScale: `${s.timeScale.toFixed(2)}x`,
          hits: s.hits,
          shots: s.shots,
        });
      }
    };

    raf = window.requestAnimationFrame(render);
    return () => {
      window.cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [mode]);

  const onCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    simRef.current.pointerX = e.clientX - rect.left;
    simRef.current.pointerY = e.clientY - rect.top;
    simRef.current.pointerInside = true;
  };

  const onCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    simRef.current.pointerX = e.clientX - rect.left;
    simRef.current.pointerY = e.clientY - rect.top;
    simRef.current.pointerInside = true;

    // Right-click opens Radial Command Wheel at cursor!
    if (e.button === 2) {
      e.preventDefault();
      simRef.current.wheelHeldByInput = true;
      simRef.current.wheelX = simRef.current.pointerX;
      simRef.current.wheelY = simRef.current.pointerY;
      simRef.current.wheelHoverIdx = -1;
      return;
    }

    // If Pinned Radial Wheel is open, clicking selects the hovered quadrant!
    if (wheelPinned) {
      const idx = simRef.current.wheelHoverIdx;
      setWheelPinned(false);
      if (idx >= 0 && idx <= 3) {
        setSelectedSlot(idx);
        executeProtocol(idx);
      }
      return;
    }

    executeProtocol(selectedSlot);
  };

  const onCanvasPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button === 2 && simRef.current.wheelHeldByInput) {
      const chosen = simRef.current.wheelHoverIdx;
      simRef.current.wheelHeldByInput = false;
      if (chosen >= 0 && chosen <= 3) {
        setSelectedSlot(chosen);
        setWheelPinned(false);
        executeProtocol(chosen);
      }
    }
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

  const activeParadigmInfo = t.design.studio.hud.paradigms[paradigm];
  const activeSlotInfo = t.design.studio.hud.slots[selectedSlot] ?? t.design.studio.hud.slots[0];
  const accuracyPct =
    telemetry.shots > 0 ? `${Math.round((telemetry.hits / telemetry.shots) * 100)}%` : '—';

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
        <div className="diegetic-lab" role="tabpanel">
          {/* Top Paradigm Architecture Bar */}
          <div className="diegetic-bar">
            <div className="diegetic-paradigms" role="tablist" aria-label={t.design.studio.hud.paradigmLabel}>
              {(['diegetic', 'contextual', 'tactical'] as const).map((pKey) => {
                const info = t.design.studio.hud.paradigms[pKey];
                const isSelected = paradigm === pKey;
                return (
                  <button
                    key={pKey}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    className={`paradigm-tab ${isSelected ? 'is-active' : ''}`}
                    onClick={() => setParadigm(pKey)}
                  >
                    <span className="paradigm-tab__name">{info.name}</span>
                    <span className="paradigm-tab__tag">{info.tag}</span>
                  </button>
                );
              })}
            </div>

            <div className="diegetic-tools">
              <button
                type="button"
                className={`diegetic-chip ${wheelPinned ? 'is-active' : ''}`}
                onClick={() => setWheelPinned((v) => !v)}
                aria-pressed={wheelPinned}
              >
                {wheelPinned ? t.design.studio.hud.radialActive : t.design.studio.hud.radialBtn}
              </button>
              <button
                type="button"
                className={`diegetic-chip ${showFoveal ? 'is-active' : ''}`}
                onClick={() => setShowFoveal((v) => !v)}
                aria-pressed={showFoveal}
              >
                {t.design.studio.hud.fovealToggle}
              </button>
              <button type="button" className="diegetic-chip" onClick={resetArena}>
                {t.design.studio.hud.resetBtn}
              </button>
            </div>
          </div>

          {/* Paradigm Rationale Note + Quick Protocol Selector */}
          <div className="diegetic-subbar">
            <p className="diegetic-rationale">{activeParadigmInfo.desc}</p>

            <div className="protocol-pills" role="group" aria-label="Protocols">
              {t.design.studio.hud.slots.map((slot, idx) => (
                <button
                  key={slot.key}
                  type="button"
                  className={`protocol-pill ${selectedSlot === idx ? 'is-active' : ''}`}
                  onClick={() => {
                    setSelectedSlot(idx);
                    simRef.current.lastActionTime = performance.now();
                  }}
                  title={slot.desc}
                >
                  <kbd>{slot.key}</kbd>
                  <span>{slot.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive 60fps Spatial Arena */}
          <div ref={stageRef} className="diegetic-stage">
            <canvas
              ref={canvasRef}
              className="diegetic-canvas"
              onPointerMove={onCanvasPointerMove}
              onPointerEnter={() => {
                simRef.current.pointerInside = true;
              }}
              onPointerLeave={() => {
                simRef.current.pointerInside = false;
                simRef.current.wheelHeldByInput = false;
              }}
              onPointerDown={onCanvasPointerDown}
              onPointerUp={onCanvasPointerUp}
              onContextMenu={(e) => e.preventDefault()}
            />
            <div className="diegetic-stage__hint" aria-hidden="true">
              <span>{t.design.studio.hud.controlsHint}</span>
              <strong>
                [{activeSlotInfo.key}] {activeSlotInfo.name} — {activeSlotInfo.desc}
              </strong>
            </div>
          </div>

          {/* Live Ergonomic & UX Telemetry Readout */}
          <div className="diegetic-telemetry">
            <div className="diegetic-metric">
              <span>{t.design.studio.hud.telemetrySaccade}</span>
              <strong>~{telemetry.saccadePx}px</strong>
            </div>
            <div className="diegetic-metric">
              <span>{t.design.studio.hud.telemetryFitts}</span>
              <strong>{telemetry.fittsBits} bits</strong>
            </div>
            <div className="diegetic-metric">
              <span>{t.design.studio.hud.telemetryTimescale}</span>
              <strong className={telemetry.timeScale !== '1.00x' ? 'is-dilated' : ''}>
                {telemetry.timeScale}
              </strong>
            </div>
            <div className="diegetic-metric">
              <span>{t.design.studio.hud.telemetryAccuracy}</span>
              <strong>
                {accuracyPct} ({telemetry.hits}/{telemetry.shots})
              </strong>
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
