import { LAUNCH } from '@/lib/config';

export default function Announcement() {
  return (
    <div className="w-full border-b border-tape bg-ink text-cream">
      <div className="section flex items-center justify-center gap-2 py-2.5 text-center text-xs tracking-wide sm:text-sm">
        <span className="hidden h-1.5 w-1.5 rounded-full bg-cream/70 sm:inline-block" aria-hidden />
        <span>
          Pre-orders open. First batch of {LAUNCH.batchSize}. Ships {LAUNCH.shipDateLong}.
        </span>
      </div>
    </div>
  );
}
