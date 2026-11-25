import { useEffect, useState } from 'react';

/**
 * Determines the active section deterministically from viewport scroll position
 * so tall sections on mobile never lose focus to shorter neighbors.
 */
export function useActiveSection(sectionIds: string[]) {
  const [activeSection, setActiveSection] = useState<string>(sectionIds[0] ?? '');

  useEffect(() => {
    if (sectionIds.length === 0) return;

    let raf = 0;

    const computeActive = () => {
      raf = 0;
      const elements = sectionIds
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null);

      if (elements.length === 0) return;

      // If scrolled to the very bottom, activate the last section
      const scrollBottom = window.scrollY + window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      if (docHeight - scrollBottom <= 24) {
        setActiveSection(elements[elements.length - 1].id);
        return;
      }

      const anchorY = Math.min(window.innerHeight * 0.3, 220);
      let current = elements[0].id;

      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= anchorY) {
          current = el.id;
        } else {
          break;
        }
      }

      setActiveSection(current);
    };

    const onScroll = () => {
      if (!raf) {
        raf = window.requestAnimationFrame(computeActive);
      }
    };

    computeActive();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [sectionIds]);

  return activeSection;
}
