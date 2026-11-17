import React from 'react';
import { ArrowRight, ChevronLeft, Loader2, LucideIcon } from 'lucide-react';

export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const TONE: Record<Tone, string> = {
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
  neutral: 'bg-sunken text-ink-2',
};

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

/** Flat surface with a hairline border. No shadows. */
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...rest }) => (
  <div className={cx('bg-surface border border-line/70 rounded-card shadow-card', className)} {...rest} />
);

/** Status pill: soft tinted background, optional icon. */
export const Badge: React.FC<{ tone?: Tone; icon?: LucideIcon; children: React.ReactNode; className?: string }> = ({
  tone = 'neutral',
  icon: Icon,
  children,
  className,
}) => (
  <span className={cx('inline-flex items-center gap-1 h-6 px-2 rounded-full text-caption font-semibold whitespace-nowrap', TONE[tone], className)}>
    {Icon && <Icon size={12} strokeWidth={2.25} aria-hidden />}
    {children}
  </span>
);

/** Square icon holder used at the start of rows. */
export const IconTile: React.FC<{ icon: LucideIcon; tone?: Tone; size?: 'md' | 'lg' }> = ({ icon: Icon, tone = 'neutral', size = 'md' }) => (
  <span className={cx('shrink-0 grid place-items-center rounded-2xl', size === 'lg' ? 'w-14 h-14' : 'w-11 h-11', TONE[tone])}>
    <Icon size={size === 'lg' ? 24 : 20} strokeWidth={1.75} aria-hidden />
  </span>
);

/** Filter chip. Selected = ink fill. */
export const Chip: React.FC<{ selected?: boolean; onClick: () => void; children: React.ReactNode }> = ({ selected, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={!!selected}
    className={cx(
      'shrink-0 h-10 px-4 rounded-full text-meta font-semibold border transition-colors',
      selected ? 'bg-brand text-white border-brand' : 'bg-surface text-ink border-line-strong hover:bg-sunken',
    )}
  >
    {children}
  </button>
);

export const ChipRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 [scrollbar-width:none]">{children}</div>
);

/** Tappable list row: tile, title/meta, trailing badge, chevron. */
export const ListRow: React.FC<{
  icon?: LucideIcon;
  tone?: Tone;
  title: React.ReactNode;
  meta?: React.ReactNode;
  badge?: React.ReactNode;
  trailing?: React.ReactNode;
  onClick?: () => void;
}> = ({ icon, tone, title, meta, badge, trailing, onClick }) => {
  const body = (
    <>
      {icon && <IconTile icon={icon} tone={tone} />}
      <div className="flex-1 min-w-0 text-right space-y-1">
        <div className="text-body font-semibold text-ink truncate">{title}</div>
        {meta && <div className="text-meta text-ink-2">{meta}</div>}
        {badge && <div className="pt-0.5">{badge}</div>}
      </div>
      {trailing}
      {onClick && <ChevronLeft size={18} className="text-ink-3 shrink-0" aria-hidden />}
    </>
  );
  const cls = 'w-full flex items-center gap-3 p-4 bg-surface border border-line/70 rounded-card shadow-card';
  return onClick ? (
    <button type="button" onClick={onClick} className={cx(cls, 'active:bg-sunken transition-colors')}>
      {body}
    </button>
  ) : (
    <div className={cls}>{body}</div>
  );
};

/** Page title block. Pass onBack for pushed (non-tab) screens. */
export const PageHeader: React.FC<{ title: string; subtitle?: string; onBack?: () => void; action?: React.ReactNode }> = ({
  title,
  subtitle,
  onBack,
  action,
}) => (
  <div className="space-y-3 pt-2">
    {onBack && (
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 -mr-1 h-9 px-1 text-meta font-semibold text-ink-2">
        <ArrowRight size={18} aria-hidden /> رجوع
      </button>
    )}
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-1">
        <h1 className="text-display text-ink">{title}</h1>
        {subtitle && <p className="text-meta text-ink-2">{subtitle}</p>}
      </div>
      {action}
    </div>
  </div>
);

export const SectionTitle: React.FC<{ children: React.ReactNode; aside?: React.ReactNode }> = ({ children, aside }) => (
  <div className="flex items-center justify-between">
    <h2 className="text-title text-ink">{children}</h2>
    {aside}
  </div>
);

export const IconButton: React.FC<{ icon: LucideIcon; label: string; onClick: () => void; dot?: boolean; spin?: boolean }> = ({
  icon: Icon,
  label,
  onClick,
  dot,
  spin,
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className="relative w-11 h-11 rounded-full bg-surface border border-line grid place-items-center text-ink active:bg-sunken"
  >
    <Icon size={20} strokeWidth={1.75} className={spin ? 'animate-spin' : ''} aria-hidden />
    {dot && <span className="absolute top-2.5 left-2.5 w-2.5 h-2.5 rounded-full bg-danger ring-2 ring-surface" />}
  </button>
);

export const Avatar: React.FC<{ name?: string; size?: number }> = ({ name, size = 44 }) => (
  <span
    className="shrink-0 grid place-items-center rounded-full bg-brand text-white font-bold"
    style={{ width: size, height: size, fontSize: size * 0.36 }}
    aria-hidden
  >
    {(name?.trim()[0] || 'ط').toUpperCase()}
  </span>
);

export const ProgressBar: React.FC<{ value: number; tone?: 'brand' | 'warning' | 'danger'; label?: string }> = ({ value, tone = 'brand', label }) => (
  <div
    className="h-2 rounded-full bg-sunken overflow-hidden"
    role="progressbar"
    aria-valuenow={Math.round(value)}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-label={label}
  >
    <div
      className={cx('h-full rounded-full', tone === 'brand' ? 'bg-brand' : tone === 'warning' ? 'bg-warning' : 'bg-danger')}
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

export const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <Loader2 className={cx('animate-spin text-brand', className)} size={22} aria-label="جارٍ التحميل" />
);

export const LoadingBlock: React.FC<{ label?: string }> = ({ label = 'جارٍ التحميل' }) => (
  <div className="py-10 grid place-items-center gap-2 text-meta text-ink-3" aria-busy="true">
    <Spinner />
    {label}
  </div>
);

export const EmptyState: React.FC<{ icon: LucideIcon; title: string; hint?: string }> = ({ icon: Icon, title, hint }) => (
  <div className="py-12 px-6 text-center space-y-2">
    <span className="mx-auto w-12 h-12 grid place-items-center rounded-full bg-sunken text-ink-3">
      <Icon size={22} strokeWidth={1.75} aria-hidden />
    </span>
    <p className="text-body font-semibold text-ink">{title}</p>
    {hint && <p className="text-meta text-ink-2">{hint}</p>}
  </div>
);

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    loading?: boolean;
    icon?: LucideIcon;
    block?: boolean;
  }
> = ({ variant = 'primary', loading, icon: Icon, block = true, className, children, disabled, ...rest }) => (
  <button
    className={cx('btn', `btn-${variant}`, block && 'w-full', className)}
    disabled={disabled || loading}
    {...rest}
  >
    {loading ? <Loader2 size={18} className="animate-spin" aria-hidden /> : Icon && <Icon size={18} aria-hidden />}
    {children}
  </button>
);

/** Labelled text input. `trailing` is rendered at the visual end (left in RTL). */
export const Field: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; trailing?: React.ReactNode; ltr?: boolean; icon?: LucideIcon }
> = ({ label, hint, trailing, ltr, icon: Icon, id, className, ...rest }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-meta font-semibold text-ink">
      {label}
    </label>
    <div className="relative">
      {Icon && <Icon size={20} strokeWidth={1.75} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" aria-hidden />}
      <input
        id={id}
        className={cx(
          'w-full h-12 rounded-control bg-surface border border-line-strong px-4 text-body text-ink placeholder:text-ink-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15',
          ltr && 'dir-ltr text-right',
          !!trailing && 'pl-12',
          !!Icon && 'pr-12',
          className,
        )}
        {...rest}
      />
      {trailing && <div className="absolute left-1 top-1/2 -translate-y-1/2">{trailing}</div>}
    </div>
    {hint && <p className="text-caption text-ink-2">{hint}</p>}
  </div>
);

export const InlineAlert: React.FC<{ tone?: Tone; children: React.ReactNode }> = ({ tone = 'danger', children }) => (
  <div role="alert" className={cx('rounded-control px-3 py-2.5 text-meta font-medium', TONE[tone])}>
    {children}
  </div>
);

/** Label/value rows separated by hairlines, inside a Card. */
export const KeyValueList: React.FC<{ items: { label: string; value: React.ReactNode }[] }> = ({ items }) => (
  <Card className="divide-y divide-line">
    {items.map((it) => (
      <div key={it.label} className="flex items-center justify-between gap-4 px-4 py-3">
        <span className="text-meta text-ink-2">{it.label}</span>
        <span className="text-body font-semibold text-ink text-left">{it.value}</span>
      </div>
    ))}
  </Card>
);

/** Large stat inside a summary card, separated by vertical hairlines. */
export const StatStrip: React.FC<{ items: { label: string; value: React.ReactNode }[] }> = ({ items }) => (
  <Card className="grid divide-x divide-x-reverse divide-line" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
    {items.map((it) => (
      <div key={it.label} className="py-4 px-2 text-center space-y-0.5">
        <div className="text-title text-ink tabular">{it.value}</div>
        <div className="text-caption text-ink-2">{it.label}</div>
      </div>
    ))}
  </Card>
);

/** Modal bottom sheet. */
export const BottomSheet: React.FC<{ open: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({
  open,
  onClose,
  title,
  children,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="absolute bottom-0 inset-x-0 max-w-md mx-auto bg-surface rounded-t-[20px] shadow-sheet p-5 pb-safe space-y-4">
        <div className="mx-auto w-10 h-1 rounded-full bg-line-strong" />
        <h2 className="text-title text-ink">{title}</h2>
        {children}
      </div>
    </div>
  );
};

/** Circular gauge, 0-100. Colors follow the parent's text color (track = currentColor at low opacity). */
export const RingGauge: React.FC<{ value: number; size?: number; label: string }> = ({ value, size = 64, label }) => {
  const r = 26;
  const c = 2 * Math.PI * r;
  const v = Math.min(100, Math.max(0, value));
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={label} className="shrink-0 -rotate-90">
      <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="7" />
      <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} />
    </svg>
  );
};

export type MetricTone = 'brand' | 'danger' | 'warning' | 'info';
const SOFT: Record<MetricTone, { card: string; chip: string; num: string; mark: string }> = {
  brand: { card: 'to-success-soft', chip: 'bg-success/15 text-success', num: 'text-brand-ink', mark: 'text-success/10' },
  danger: { card: 'to-danger-soft', chip: 'bg-danger/10 text-danger', num: 'text-danger-ink', mark: 'text-danger/10' },
  warning: { card: 'to-gold-soft', chip: 'bg-gold/15 text-warning', num: 'text-warning-ink', mark: 'text-gold/20' },
  info: { card: 'to-info-soft', chip: 'bg-info/15 text-info', num: 'text-info-ink', mark: 'text-info/10' },
};

const PILL: Record<'success' | 'danger' | 'warning' | 'info', string> = {
  success: 'bg-success/10 text-success',
  danger: 'bg-danger/10 text-danger',
  warning: 'bg-gold/15 text-warning',
  info: 'bg-info/10 text-info',
};

/** Rounded status line at the bottom of a metric card. */
export const StatusPill: React.FC<{ tone: keyof typeof PILL; icon?: LucideIcon; children: React.ReactNode }> = ({ tone, icon: Icon, children }) => (
  <span className={cx('inline-flex items-center gap-1 md:gap-1.5 h-7 md:h-8 px-2.5 md:px-3 rounded-full text-caption md:text-meta font-semibold max-w-full', PILL[tone])}>
    {Icon && <Icon size={15} strokeWidth={2.25} className="shrink-0" aria-hidden />}
    <span className="truncate">{children}</span>
  </span>
);

/**
 * Large soft home card: tinted gradient, tinted icon chip, one hero number, optional meter and status pill.
 * `art` is an illustration pinned to the left (end) side; content then keeps to the right 60%.
 */
export const MetricCard: React.FC<{
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  unit?: string;
  tone: MetricTone;
  meter?: React.ReactNode;
  pill?: React.ReactNode;
  art?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ icon: Icon, label, value, unit, tone, meter, pill, art, className, onClick }) => {
  const t = SOFT[tone];
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      {...(onClick ? { type: 'button' as const, onClick } : {})}
      className={cx(
        'relative overflow-hidden min-w-0 min-h-[184px] md:min-h-[210px] p-4 md:p-5 rounded-card text-right border border-white/80 shadow-card bg-gradient-to-br from-white',
        t.card,
        onClick && 'active:scale-[0.98] transition-transform',
        className,
      )}
    >
      {art ? (
        <div className="absolute left-2 bottom-1 w-[42%] max-w-[210px] pointer-events-none">{art}</div>
      ) : (
        <Icon aria-hidden strokeWidth={1.25} className={cx('absolute -bottom-4 -left-4 w-28 h-28 md:w-36 md:h-36', t.mark)} />
      )}
      <div className={cx('relative h-full flex flex-col justify-between gap-4', !!art && 'w-[58%]')}>
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={cx('w-11 h-11 shrink-0 grid place-items-center rounded-2xl', t.chip)}>
            <Icon size={22} strokeWidth={1.9} aria-hidden />
          </span>
          <span className="text-title text-ink truncate">{label}</span>
        </div>
        <div className="space-y-2.5 min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className={cx('text-[3.25rem] md:text-[3.75rem] leading-none font-bold tabular', t.num)}>{value}</span>
            {unit && <span className={cx('text-title font-bold', t.num)}>{unit}</span>}
          </div>
          {meter}
          {pill}
        </div>
      </div>
    </Tag>
  );
};
