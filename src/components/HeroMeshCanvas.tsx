import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type MeshSimMode = 'wave' | 'vortex' | 'architectural';

export interface MeshTelemetry {
  fps: number;
  pointerX: number;
  pointerY: number;
  vertices: number;
}

interface HeroMeshCanvasProps {
  mode: MeshSimMode;
  pulseCount: number;
  onTelemetry?: (data: MeshTelemetry) => void;
}

interface Shockwave {
  x: number;
  y: number;
  bornAt: number;
}

export function HeroMeshCanvas({ mode, pulseCount, onTelemetry }: HeroMeshCanvasProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const modeRef = useRef<MeshSimMode>(mode);
  const telemetryCbRef = useRef(onTelemetry);
  const shockwavesRef = useRef<Shockwave[]>([]);

  modeRef.current = mode;
  telemetryCbRef.current = onTelemetry;

  useEffect(() => {
    if (pulseCount <= 0) return;
    shockwavesRef.current.push({
      x: (Math.random() - 0.5) * 2.4,
      y: (Math.random() - 0.5) * 1.6,
      bornAt: performance.now() / 1000,
    });
  }, [pulseCount]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    const width = Math.max(host.clientWidth, 1);
    const height = Math.max(host.clientHeight, 1);
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isCoarsePointer ? 1.5 : 2));
    renderer.setSize(width, height);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, -4.1, 5.4);
    camera.lookAt(0, 0.15, 0);

    // Architectural reference floor grid
    const refGrid = new THREE.GridHelper(9.5, 18, 0x2a2e38, 0x1b1e25);
    refGrid.rotation.x = Math.PI / 2;
    refGrid.position.z = -0.55;
    scene.add(refGrid);

    const segX = 46;
    const segY = 30;
    const planeGeo = new THREE.PlaneGeometry(7.8, 5.1, segX, segY);
    const posAttr = planeGeo.attributes.position as THREE.BufferAttribute;
    const count = posAttr.count;

    const heights = new Float32Array(count);
    const velocities = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    planeGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const lowColor = new THREE.Color('#2d333f');
    const midColor = new THREE.Color('#e84c2b');
    const peakColor = new THREE.Color('#ffb38a');
    const tempColor = new THREE.Color();

    const wireMat = new THREE.MeshBasicMaterial({
      wireframe: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.82,
    });
    const lattice = new THREE.Mesh(planeGeo, wireMat);
    scene.add(lattice);

    const pointsMat = new THREE.PointsMaterial({
      size: 0.048,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(planeGeo, pointsMat);
    scene.add(points);

    // Subtle cursor target ring inside 3D scene
    const ringGeo = new THREE.RingGeometry(0.18, 0.22, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xe84c2b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const cursorRing = new THREE.Mesh(ringGeo, ringMat);
    scene.add(cursorRing);

    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2(99, 99);
    const hitPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const hitPoint = new THREE.Vector3(0, 0, 0);
    let pointerActive = false;

    const updateNdc = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerMove = (e: PointerEvent) => {
      updateNdc(e);
      pointerActive = true;
    };

    const onPointerDown = (e: PointerEvent) => {
      updateNdc(e);
      raycaster.setFromCamera(ndc, camera);
      const clickHit = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(hitPlane, clickHit)) {
        shockwavesRef.current.push({
          x: clickHit.x,
          y: clickHit.y,
          bornAt: performance.now() / 1000,
        });
      }
    };

    const onPointerLeave = () => {
      pointerActive = false;
    };

    host.addEventListener('pointermove', onPointerMove);
    host.addEventListener('pointerdown', onPointerDown);
    host.addEventListener('pointerleave', onPointerLeave);

    const onResize = () => {
      const w = Math.max(host.clientWidth, 1);
      const h = Math.max(host.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Seed initial gentle shockwave so viewport looks alive immediately
    shockwavesRef.current.push({ x: 0, y: 0, bornAt: performance.now() / 1000 });

    let frameId = 0;
    let frames = 0;
    let lastFpsSample = performance.now();
    let isInViewport = true;
    let isTabVisible = !document.hidden;
    const startSec = performance.now() / 1000;

    const shouldAnimate = () => isInViewport && isTabVisible;

    const tick = () => {
      if (!shouldAnimate()) {
        frameId = 0;
        return;
      }
      frameId = window.requestAnimationFrame(tick);
      const nowMs = performance.now();
      const nowSec = nowMs / 1000;
      const t = nowSec - startSec;

      if (pointerActive) {
        raycaster.setFromCamera(ndc, camera);
        raycaster.ray.intersectPlane(hitPlane, hitPoint);
        cursorRing.position.set(hitPoint.x, hitPoint.y, 0.05);
        ringMat.opacity += (0.75 - ringMat.opacity) * 0.15;
      } else {
        ringMat.opacity += (0 - ringMat.opacity) * 0.12;
      }

      // Prune expired shockwaves
      shockwavesRef.current = shockwavesRef.current.filter((sw) => nowSec - sw.bornAt < 2.8);

      const activeMode = modeRef.current;
      const colorAttr = planeGeo.attributes.color as THREE.BufferAttribute;

      for (let i = 0; i < count; i++) {
        const vx = posAttr.getX(i);
        const vy = posAttr.getY(i);

        let fieldZ = 0;
        if (!prefersReducedMotion) {
          if (activeMode === 'wave') {
            fieldZ =
              Math.sin(vx * 0.72 + t * 1.05) * 0.16 +
              Math.cos(vy * 0.88 - t * 0.78) * 0.14 +
              Math.sin((vx + vy) * 0.45 + t * 0.5) * 0.07;
          } else if (activeMode === 'vortex') {
            const r = Math.hypot(vx, vy);
            const angle = Math.atan2(vy, vx);
            fieldZ = Math.sin(r * 1.9 - t * 2.1 + angle * 2.0) * 0.24 - Math.exp(-r * r * 0.45) * 0.35;
          } else {
            const raw =
              Math.sin(vx * 0.65 + t * 0.7) * 0.26 + Math.cos(vy * 0.75 - t * 0.55) * 0.22;
            fieldZ = Math.round(raw * 4.5) / 4.5;
          }
        }

        let pointerForce = 0;
        if (pointerActive) {
          const dx = vx - hitPoint.x;
          const dy = vy - hitPoint.y;
          const distSq = dx * dx + dy * dy;
          if (activeMode === 'vortex') {
            pointerForce = -Math.exp(-distSq * 0.75) * 0.95 + Math.exp(-distSq * 0.22) * 0.32;
          } else {
            pointerForce = Math.exp(-distSq * 0.65) * 1.08;
          }
        }

        let shockForce = 0;
        for (let s = 0; s < shockwavesRef.current.length; s++) {
          const sw = shockwavesRef.current[s];
          const age = nowSec - sw.bornAt;
          const dist = Math.hypot(vx - sw.x, vy - sw.y);
          const radius = age * 4.4;
          const envelope = Math.max(0, 1 - age / 2.6);
          shockForce += Math.exp(-Math.pow(dist - radius, 2) * 2.8) * envelope * 0.88;
        }

        let targetZ = fieldZ + pointerForce + shockForce;
        if (activeMode === 'architectural') {
          targetZ = Math.round(targetZ * 5) / 5;
        }

        velocities[i] += (targetZ - heights[i]) * 0.14;
        velocities[i] *= 0.82;
        heights[i] += velocities[i];

        posAttr.setZ(i, heights[i]);

        const norm = Math.min(Math.max((heights[i] + 0.12) / 0.95, 0), 1);
        if (norm < 0.65) {
          tempColor.copy(lowColor).lerp(midColor, norm / 0.65);
        } else {
          tempColor.copy(midColor).lerp(peakColor, (norm - 0.65) / 0.35);
        }
        colorAttr.setXYZ(i, tempColor.r, tempColor.g, tempColor.b);
      }

      posAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;

      // Subtle camera parallax
      const camTargetX = pointerActive ? ndc.x * 0.28 : 0;
      const camTargetY = -4.1 + (pointerActive ? ndc.y * 0.18 : 0);
      camera.position.x += (camTargetX - camera.position.x) * 0.06;
      camera.position.y += (camTargetY - camera.position.y) * 0.06;
      camera.lookAt(0, 0.15, 0);

      lattice.rotation.z = Math.sin(t * 0.16) * 0.025;
      points.rotation.z = lattice.rotation.z;

      renderer.render(scene, camera);

      frames += 1;
      if (nowMs - lastFpsSample >= 350) {
        const measuredFps = Math.min(240, Math.round((frames * 1000) / (nowMs - lastFpsSample)));
        frames = 0;
        lastFpsSample = nowMs;
        telemetryCbRef.current?.({
          fps: measuredFps,
          pointerX: pointerActive ? hitPoint.x : 0,
          pointerY: pointerActive ? hitPoint.y : 0,
          vertices: count,
        });
      }
    };

    const resumeIfNeeded = () => {
      if (shouldAnimate() && frameId === 0) {
        frames = 0;
        lastFpsSample = performance.now();
        tick();
      }
    };

    const onVisibilityChange = () => {
      isTabVisible = !document.hidden;
      resumeIfNeeded();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    let viewportObserver: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      viewportObserver = new IntersectionObserver(
        (entries) => {
          isInViewport = entries[0]?.isIntersecting ?? true;
          resumeIfNeeded();
        },
        { threshold: 0.01 }
      );
      viewportObserver.observe(host);
    }

    tick();

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      viewportObserver?.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerdown', onPointerDown);
      host.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('resize', onResize);
      planeGeo.dispose();
      wireMat.dispose();
      pointsMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={hostRef} className="mesh-viewport__canvas" />;
}
