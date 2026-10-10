import { Building2, GraduationCap } from 'lucide-react'

// Skills that cross the bridge, one after another. Negative delays start the
// loop mid-flight so the deck is never empty once it has appeared. `rest` is
// where a chip sits when motion is reduced (only the first two are shown).
const TRAVELERS = [
  { label: 'React', delay: '0s', rest: 8 },
  { label: 'Marketing', delay: '-2.4s', rest: 112 },
  { label: 'Figma', delay: '-4.8s', rest: 0 },
  { label: 'Python', delay: '-7.2s', rest: 0 },
]

const CHIP_WIDTH = 76

// Landing hero illustration: the bridge builds itself (piers rise, the deck
// extends, the two ends pop in), then skills travel from the organization's
// side to the student's. With reduced motion it shows the finished bridge.
export function HeroBridge() {
  return (
    <svg
      viewBox="0 0 400 300"
      role="img"
      aria-label="A bridge between a business and a student, with skills crossing it"
      className="hero-bridge h-auto w-full"
    >
      <rect className="fill-accent" x="0" y="252" width="400" height="48" rx="24" />

      <rect className="hb-pier fill-periwinkle" x="64" y="150" width="48" height="110" rx="10" />
      <rect className="hb-pier hb-pier-2 fill-periwinkle" x="288" y="150" width="48" height="110" rx="10" />

      <g className="hb-deck">
        <rect className="fill-primary" x="24" y="110" width="352" height="52" rx="14" />
        {[152, 200, 248].map((cx) => (
          <path key={cx} className="fill-background" d={`M${cx - 20} 162 A20 20 0 0 1 ${cx + 20} 162 Z`} />
        ))}
      </g>

      <g className="hb-travelers">
        {TRAVELERS.map(({ label, delay, rest }) => (
          <g
            key={label}
            className="hb-traveler"
            style={{ animationDelay: delay, '--rest': `${rest}px` } as React.CSSProperties}
          >
            <rect
              className="fill-card stroke-line-strong"
              x="98"
              y="80"
              width={CHIP_WIDTH}
              height="26"
              rx="13"
              strokeWidth="2"
            />
            <text
              className="fill-foreground font-mono text-[11px] font-semibold"
              x={98 + CHIP_WIDTH / 2}
              y="97"
              textAnchor="middle"
            >
              {label}
            </text>
          </g>
        ))}
      </g>

      <g className="hb-end">
        <circle className="fill-line-strong" cx="64" cy="64" r="32" />
        <circle className="fill-card stroke-line-strong" cx="60" cy="60" r="32" strokeWidth="2" />
        <Building2 className="text-primary" x="46" y="46" width="28" height="28" strokeWidth={2} />
      </g>
      <g className="hb-end hb-end-2">
        <circle className="fill-line-strong" cx="344" cy="64" r="32" />
        <circle className="fill-card stroke-line-strong" cx="340" cy="60" r="32" strokeWidth="2" />
        <GraduationCap className="text-primary" x="326" y="46" width="28" height="28" strokeWidth={2} />
      </g>
    </svg>
  )
}
