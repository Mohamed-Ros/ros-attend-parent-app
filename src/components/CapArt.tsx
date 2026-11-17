import React, { useId } from 'react';

type Palette = 'green' | 'blue';

const PALETTES: Record<Palette, { boardTop: string; boardBottom: string; edge: string; skull: string; bookA: string; bookB: string; bookC: string }> = {
  green: { boardTop: '#2C9B74', boardBottom: '#14584A', edge: '#0C3A30', skull: '#0F4538', bookA: '#17594B', bookB: '#2E9C74', bookC: '#0F3F36' },
  blue: { boardTop: '#4D90D2', boardBottom: '#24598F', edge: '#183E66', skull: '#1D4C7C', bookA: '#2A6496', bookB: '#6EACDA', bookC: '#1D4C7C' },
};

/** Flat-3D mortarboard on a stack of books. Pure SVG so it scales and recolors without raster assets. */
export const CapArt: React.FC<{ palette?: Palette; className?: string }> = ({ palette = 'green', className }) => {
  const c = PALETTES[palette];
  const uid = useId().replace(/:/g, '');
  const g = (n: string) => `${n}-${uid}`;
  return (
    <svg viewBox="0 0 220 190" className={className} role="img" aria-hidden focusable="false">
      <defs>
        <linearGradient id={g('board')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.boardTop} />
          <stop offset="1" stopColor={c.boardBottom} />
        </linearGradient>
        <linearGradient id={g('bookA')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={c.bookA} />
          <stop offset="1" stopColor={c.bookC} />
        </linearGradient>
        <linearGradient id={g('bookB')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={c.bookB} />
          <stop offset="1" stopColor={c.bookA} />
        </linearGradient>
        <linearGradient id={g('gold')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD768" />
          <stop offset="1" stopColor="#E9A21F" />
        </linearGradient>
      </defs>

      {/* soft ground shadow */}
      <ellipse cx="108" cy="176" rx="82" ry="7" fill="#0F1F1C" opacity="0.12" />

      {/* bottom book */}
      <rect x="22" y="142" width="164" height="30" rx="6" fill={`url(#${g('bookA')})`} />
      <rect x="30" y="165" width="150" height="5" rx="2.5" fill="#F6F1E4" />
      <rect x="36" y="148" width="3" height="14" rx="1.5" fill={`url(#${g('gold')})`} />
      <rect x="43" y="148" width="3" height="14" rx="1.5" fill={`url(#${g('gold')})`} />

      {/* top book (offset) */}
      <rect x="40" y="112" width="150" height="30" rx="6" fill={`url(#${g('bookB')})`} />
      <rect x="48" y="135" width="136" height="5" rx="2.5" fill="#F6F1E4" />
      <rect x="170" y="118" width="3" height="14" rx="1.5" fill={`url(#${g('gold')})`} />
      <rect x="177" y="118" width="3" height="14" rx="1.5" fill={`url(#${g('gold')})`} />

      {/* cap: skull */}
      <path d="M68 78 V102 Q108 124 148 102 V78 Z" fill={c.skull} />
      {/* cap: board thickness + top face */}
      <path d="M108 40 L206 66 L108 92 L10 66 Z" transform="translate(0 6)" fill={c.edge} />
      <path d="M108 40 L206 66 L108 92 L10 66 Z" fill={`url(#${g('board')})`} />
      <path d="M108 40 L206 66 L108 66 Z" fill="#FFFFFF" opacity="0.12" />
      <circle cx="108" cy="66" r="5" fill={`url(#${g('gold')})`} />

      {/* tassel */}
      <path d="M108 66 L190 70 V104" fill="none" stroke={`url(#${g('gold')})`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="185" y="100" width="10" height="8" rx="2" fill={`url(#${g('gold')})`} />
      <path d="M186 108 h8 l2 22 h-12 Z" fill={`url(#${g('gold')})`} />
      <path d="M188 112 v16 M190 112 v18 M192 112 v16" stroke="#C98515" strokeWidth="1" opacity="0.7" />
    </svg>
  );
};
