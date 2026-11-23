import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function HeroMeshCanvas() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      return;
    }

    const width = Math.max(host.clientWidth, 1);
    const height = Math.max(host.clientHeight, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, -3.4, 5.2);
    camera.lookAt(0, 0.1, 0);

    // Subdivided structural plane with vertex colors for height-based vermilion response
    const segX = 34;
    const segY = 22;
    const planeGeo = new THREE.PlaneGeometry(7.2, 4.8, segX, segY);
    const posAttr = planeGeo.attributes.position as THREE.BufferAttribute;
    const count = posAttr.count;

    const heights = new Float32Array(count);
    const velocities = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    planeGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const baseColor = new THREE.Color('#393E48');
    const peakColor = new THREE.Color('#E84C2B');
    const tempColor = new THREE.Color();

    const wireMat = new THREE.MeshBasicMaterial({
      wireframe: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.78,
    });
    const lattice = new THREE.Mesh(planeGeo, wireMat);
    scene.add(lattice);

    // Subtle node dots at intersections
    const pointsMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(planeGeo, pointsMat);
    scene.add(points);

    // Invisible raycast plane matching lattice coordinates
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2(99, 99);
    const hitPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const hitPoint = new THREE.Vector3(99, 99, 0);
    let pointerActive = false;

    const onPointerMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      pointerActive = true;
    };

    const onPointerLeave = () => {
      pointerActive = false;
    };

    host.addEventListener('pointermove', onPointerMove);
    host.addEventListener('pointerleave', onPointerLeave);

    const onResize = () => {
      if (!host) return;
      const w = Math.max(host.clientWidth, 1);
      const h = Math.max(host.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let frameId = 0;

    const tick = () => {
      frameId = window.requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      if (pointerActive) {
        raycaster.setFromCamera(ndc, camera);
        raycaster.ray.intersectPlane(hitPlane, hitPoint);
      } else {
        hitPoint.set(99, 99, 0);
      }

      const colorAttr = planeGeo.attributes.color as THREE.BufferAttribute;

      for (let i = 0; i < count; i++) {
        const vx = posAttr.getX(i);
        const vy = posAttr.getY(i);

        // Gentle baseline harmonic wave
        const wave = prefersReducedMotion
          ? 0
          : Math.sin(vx * 0.65 + t * 0.85) * 0.14 + Math.cos(vy * 0.8 - t * 0.65) * 0.12;

        // Spring-damped pointer repulsion impulse
        let impulse = 0;
        if (pointerActive) {
          const dx = vx - hitPoint.x;
          const dy = vy - hitPoint.y;
          const distSq = dx * dx + dy * dy;
          impulse = Math.exp(-distSq * 0.65) * 1.05;
        }

        const targetZ = wave + impulse;
        velocities[i] += (targetZ - heights[i]) * 0.13;
        velocities[i] *= 0.83;
        heights[i] += velocities[i];

        posAttr.setZ(i, heights[i]);

        const intensity = Math.min(Math.max((heights[i] - 0.08) / 0.85, 0), 1);
        tempColor.copy(baseColor).lerp(peakColor, intensity);
        colorAttr.setXYZ(i, tempColor.r, tempColor.g, tempColor.b);
      }

      posAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;

      lattice.rotation.z = Math.sin(t * 0.18) * 0.03;
      points.rotation.z = lattice.rotation.z;

      renderer.render(scene, camera);
    };

    tick();

    return () => {
      window.cancelAnimationFrame(frameId);
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('resize', onResize);
      planeGeo.dispose();
      wireMat.dispose();
      pointsMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={hostRef} className="mesh-viewport__canvas" />;
}
