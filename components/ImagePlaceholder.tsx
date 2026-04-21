type Props = {
  label?: string;
  aspect?: string;
  className?: string;
};

export default function ImagePlaceholder({
  label = 'Image placeholder',
  aspect = 'aspect-[4/3]',
  className = '',
}: Props) {
  return (
    <div
      className={`relative ${aspect} w-full overflow-hidden rounded-[10px] border border-tape bg-tape/50 ${className}`}
      role="img"
      aria-label={label}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(135deg, transparent 46%, rgba(138,106,80,0.18) 46%, rgba(138,106,80,0.18) 54%, transparent 54%)',
          backgroundSize: '18px 18px',
        }}
        aria-hidden
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="rounded border border-tape bg-cream/90 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted">
          {label}
        </span>
      </div>
    </div>
  );
}
