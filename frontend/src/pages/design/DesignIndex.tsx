import { Link } from 'react-router'

const DESIGNS = [
  {
    slug: 'sunday-paper',
    name: 'Sunday Paper',
    pitch: 'A local broadsheet. Serif masthead, dateline, pull quotes, four-column rhythm.',
    swatches: ['#f5efe3', '#16130d', '#a3271a'],
  },
  {
    slug: 'bulletin-board',
    name: 'Bulletin Board',
    pitch: 'A cork board of pinned flyers. Rotated cards, push pins, tear-off tabs.',
    swatches: ['#c99a68', '#fef28a', '#c2362b'],
  },
  {
    slug: 'soft-civic',
    name: 'Soft Civic',
    pitch: 'Contemporary nonprofit. Peach, lilac, mint, generous radius, friendly Fraunces italic.',
    swatches: ['#fde0cc', '#e4ddff', '#d4ecd8'],
  },
]

export default function DesignIndex() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px', fontFamily: 'Figtree, system-ui, sans-serif' }}>
      <p style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6a6479', fontWeight: 600 }}>
        Design directions
      </p>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 'clamp(32px, 5vw, 56px)', letterSpacing: '-0.02em', margin: '8px 0 10px' }}>
        Three visual worlds for Talent Bridge.
      </h1>
      <p style={{ fontSize: 17, color: '#5b5668', maxWidth: '55ch', margin: 0 }}>
        Each page shows the same hero + how-it-works + CTA so they're directly comparable. Open one, switch themes, resize — then pick the one that reads right.
      </p>
      <div style={{ marginTop: 36, display: 'grid', gap: 16 }}>
        {DESIGNS.map((d) => (
          <Link
            key={d.slug}
            to={`/design/${d.slug}`}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              alignItems: 'center',
              gap: 24,
              padding: '20px 24px',
              background: '#fff',
              border: '1px solid #e9e5ed',
              borderRadius: 20,
              textDecoration: 'none',
              color: '#1f1a2b',
            }}
          >
            <div>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 500 }}>{d.name}</div>
              <div style={{ color: '#6a6479', fontSize: 14, marginTop: 4 }}>{d.pitch}</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {d.swatches.map((c) => (
                <span
                  key={c}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: c,
                    border: '1px solid rgba(0,0,0,0.08)',
                    display: 'inline-block',
                  }}
                />
              ))}
            </div>
          </Link>
        ))}
      </div>
      <p style={{ marginTop: 36, color: '#6a6479', fontSize: 13 }}>
        Each design renders at <code>/design/&lt;slug&gt;</code>. The current prod landing stays at <Link to="/" style={{ color: '#4b3b96' }}>/</Link>.
      </p>
    </div>
  )
}
