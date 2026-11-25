import { useEffect, useRef } from 'react';

export function PrecisionReticle() {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reducedMotion) return;

    const outer = outerRef.current;
    const dot = dotRef.current;
    if (!outer || !dot) return;

    let targetX = -100;
    let targetY = -100;
    let curX = -100;
    let curY = -100;
    let visible = false;
    let suppressed = false;
    let interactive = false;
    let pressed = false;
    let frameId = 0;
    let prevTime = performance.now();

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!visible) {
        curX = targetX;
        curY = targetY;
        visible = true;
      }

      const el = e.target as HTMLElement | null;
      const inCustomCanvas = Boolean(el?.closest('.diegetic-canvas'));
      if (inCustomCanvas !== suppressed) {
        suppressed = inCustomCanvas;
      }
      outer.style.opacity = suppressed ? '0' : '1';
      dot.style.opacity = suppressed ? '0' : '1';

      const isHit = Boolean(
        el?.closest('a, button, input, [role="tab"], [role="option"], .mesh-viewport__canvas')
      );
      if (isHit !== interactive) {
        interactive = isHit;
        outer.classList.toggle('is-interactive', interactive);
      }
    };

    const onLeave = () => {
      visible = false;
      outer.style.opacity = '0';
      dot.style.opacity = '0';
    };

    const onDown = () => {
      pressed = true;
    };
    const onUp = () => {
      pressed = false;
    };

    const tick = (now: number) => {
      frameId = window.requestAnimationFrame(tick);
      const dt = Math.min((now - prevTime) / 1000, 0.05);
      prevTime = now;

      if (!visible) return;
      const alpha = 1 - Math.exp(-24 * dt);
      curX += (targetX - curX) * alpha;
      curY += (targetY - curY) * alpha;

      dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      outer.style.transform = `translate3d(${curX}px, ${curY}px, 0) scale(${pressed ? 0.8 : 1})`;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  return (
    <>
      <div ref={outerRef} className="precision-reticle" aria-hidden="true" />
      <div ref={dotRef} className="precision-reticle__dot" aria-hidden="true" />
    </>
  );
}
