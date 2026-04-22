'use client';

import { useEffect, useState } from 'react';
import PreOrderButton from './PreOrderButton';
import { PRODUCT } from '@/lib/config';

export default function StickyCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById('pre-order');
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0 },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-tape bg-cream/95 px-4 py-3 backdrop-blur transition-all duration-300 supports-[backdrop-filter]:bg-cream/85 md:hidden ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-full opacity-0'
      }`}
      role="region"
      aria-label="Pre-order Daily Fibre"
      aria-hidden={!visible}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink">Daily Fibre</p>
          <p className="truncate text-xs text-muted">
            Pay {PRODUCT.depositGBP} now. Remaining {PRODUCT.balanceGBP} before dispatch.
          </p>
        </div>
        <PreOrderButton className="!px-4 !py-3 !text-sm" />
      </div>
    </div>
  );
}
