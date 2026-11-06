import type {
  ButtonHTMLAttributes,
  CSSProperties,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { FORM_STEPS, ORG } from './model.ts'
import type { Step } from './model.ts'

export function Wordmark({ invert = false }: { invert?: boolean }) {
  return (
    <span className={`text-lg font-semibold tracking-[-0.02em] ${invert ? 'text-white' : 'text-ink'}`}>
      {ORG}
    </span>
  )
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'invert' }

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base =
    'inline-flex h-13 items-center justify-center gap-2 rounded-full px-7 text-base font-medium transition-[transform,background-color,color] duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100'
  const styles = {
    primary: 'bg-accent text-white hover:bg-accent-dark',
    secondary: 'bg-surface text-ink hover:bg-surface-2',
    ghost: 'px-2 text-ink underline-offset-4 hover:underline',
    invert: 'bg-white text-ink hover:bg-surface',
  }
  return <button type="button" className={`${base} ${styles[variant]} ${className}`} {...props} />
}

/** Schwärzungsbalken über einem Wert. Der Text bleibt unsichtbar darunter, damit der Balken seine Länge hat. */
export function Redact({ text, delay = 0, on = true }: { text: string; delay?: number; on?: boolean }) {
  const shown = text.trim() || 'keine Angabe'
  return (
    <span className="relative inline-block max-w-full align-baseline">
      <span className={on ? 'invisible' : ''}>{shown}</span>
      {on && (
        <>
          <span
            aria-hidden
            className="absolute inset-x-[-2px] top-[0.08em] bottom-[0.02em] origin-left animate-redact bg-ink"
            style={{ animationDelay: `${delay}ms` }}
          />
          <span className="sr-only">geschwärzt</span>
        </>
      )}
    </span>
  )
}

export function Rise({ children, i = 0, className = '' }: { children: ReactNode; i?: number; className?: string }) {
  const style: CSSProperties = { animationDelay: `${i * 75}ms` }
  return (
    <div className={`animate-rise ${className}`} style={style}>
      {children}
    </div>
  )
}

const inputBase =
  'w-full rounded-lg bg-surface px-4 text-base text-ink placeholder:text-muted/70 outline-none transition-[box-shadow,background-color] focus:bg-white focus:ring-2 focus:ring-accent'

type FieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }

export function Field({ label, hint, className = '', ...props }: FieldProps) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-[15px] font-medium">{label}</span>
      <input className={`${inputBase} h-12`} {...props} />
      {hint && <span className="mt-1.5 block text-sm text-muted">{hint}</span>}
    </label>
  )
}

type AreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string; max?: number }

export function Area({ label, hint, max = 800, value, className = '', ...props }: AreaProps) {
  const len = String(value ?? '').length
  return (
    <label className={`block ${className}`}>
      <span className="block text-lg font-medium leading-snug">{label}</span>
      {hint && <span className="mt-1 block text-base text-muted">{hint}</span>}
      <textarea className={`${inputBase} mt-3 min-h-36 resize-y py-3 leading-relaxed`} maxLength={max} value={value} {...props} />
      <span className="mt-1.5 block text-right text-sm tabular-nums text-muted">
        {len} / {max} Zeichen
      </span>
    </label>
  )
}

export function Select({
  label,
  options,
  ...props
}: { label: string; options: string[] } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="mb-2 block text-[15px] font-medium">{label}</span>
      <select className={`${inputBase} h-12 appearance-none`} {...props}>
        <option value="">Bitte wählen</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  )
}

export function Header({ right }: { right?: ReactNode }) {
  return (
    <header className="mx-auto flex h-18 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
      <Wordmark />
      {right}
    </header>
  )
}

export function Progress({ current }: { current: Step }) {
  const idx = FORM_STEPS.findIndex((s) => s.id === current)
  const left = FORM_STEPS.length - idx - 1
  return (
    <div className="mx-auto w-full max-w-3xl px-5 sm:px-8">
      <div className="flex gap-1.5" aria-hidden>
        {FORM_STEPS.map((s, i) => (
          <span key={s.id} className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
            <span
              className={`block h-full origin-left rounded-full bg-ink transition-transform duration-500 ${i <= idx ? 'scale-x-100' : 'scale-x-0'}`}
            />
          </span>
        ))}
      </div>
      <p className="mt-3 text-[15px] text-muted">
        <span className="font-medium text-ink">{FORM_STEPS[idx]?.label}</span>
        {left > 0 ? `, danach noch ${left} ${left === 1 ? 'Schritt' : 'Schritte'}` : ', letzter Schritt'}
      </p>
    </div>
  )
}

/** Rahmen für alle Formularschritte: Kopf, Fortschritt, Titel, Inhalt, Zurück/Weiter. */
export function FormShell({
  step,
  title,
  intro,
  children,
  onBack,
  onNext,
  nextLabel = 'Weiter',
  nextDisabled = false,
  wide = false,
}: {
  step: Step
  title: string
  intro?: ReactNode
  children: ReactNode
  onBack?: () => void
  onNext: () => void
  nextLabel?: string
  nextDisabled?: boolean
  wide?: boolean
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <Header right={<span className="text-sm text-muted">Gespeichert als Entwurf</span>} />
      <Progress current={step} />
      <main className={`mx-auto w-full flex-1 px-5 pt-10 pb-36 sm:px-8 sm:pt-14 ${wide ? 'max-w-5xl' : 'max-w-3xl'}`}>
        <Rise>
          <h1 className="text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.035em]">{title}</h1>
        </Rise>
        {intro && (
          <Rise i={1}>
            <div className="mt-4 max-w-[60ch] text-lg leading-relaxed">{intro}</div>
          </Rise>
        )}
        <Rise i={2} className="mt-10">
          {children}
        </Rise>
      </main>
      <ActionBar wide={wide} onBack={onBack} onNext={onNext} nextLabel={nextLabel} nextDisabled={nextDisabled} />
    </div>
  )
}

export function ActionBar({
  onBack,
  onNext,
  nextLabel = 'Weiter',
  nextDisabled = false,
  wide = false,
}: {
  onBack?: () => void
  onNext: () => void
  nextLabel?: string
  nextDisabled?: boolean
  wide?: boolean
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-10 bg-white/95 pb-[env(safe-area-inset-bottom)]">
      <div className={`mx-auto flex w-full items-center justify-between gap-3 px-5 py-4 sm:px-8 ${wide ? 'max-w-5xl' : 'max-w-3xl'}`}>
        {onBack ? (
          <Button variant="ghost" onClick={onBack}>
            Zurück
          </Button>
        ) : (
          <span />
        )}
        <Button onClick={onNext} disabled={nextDisabled} className="min-w-40">
          {nextLabel}
        </Button>
      </div>
    </div>
  )
}

/** Unechter, aber stabiler QR-Code als Bild für den Touchpoint. */
const QR_N = 25
const QR_CELLS: [number, number][] = (() => {
  const cells: [number, number][] = []
  let seed = 7
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
  const inFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x > QR_N - 9 && y < 8) || (x < 8 && y > QR_N - 9)
  for (let y = 0; y < QR_N; y++)
    for (let x = 0; x < QR_N; x++) if (!inFinder(x, y) && rnd() > 0.52) cells.push([x, y])
  return cells
})()

export function QrCode({ size = 200 }: { size?: number }) {
  const n = QR_N
  const finder = (fx: number, fy: number) => (
    <g key={`${fx}-${fy}`}>
      <rect x={fx} y={fy} width={7} height={7} fill="currentColor" />
      <rect x={fx + 1} y={fy + 1} width={5} height={5} fill="white" />
      <rect x={fx + 2} y={fy + 2} width={3} height={3} fill="currentColor" />
    </g>
  )
  return (
    <svg viewBox={`-2 -2 ${n + 4} ${n + 4}`} width={size} height={size} role="img" aria-label="QR-Code zur Bewerbung" className="bg-white text-ink">
      {QR_CELLS.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill="currentColor" />
      ))}
      {finder(0, 0)}
      {finder(n - 7, 0)}
      {finder(0, n - 7)}
    </svg>
  )
}
