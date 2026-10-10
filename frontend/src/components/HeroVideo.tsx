import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'

// Footage: "College Students Collaborative Study Session" by Media Hopper
// Studio on Pexels (free license, no attribution required).
const SRC = '/media/hero-students.mp4'
const POSTER = '/media/hero-students.jpg'

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Looping background video for the landing hero, toned as an indigo duotone
// so white text on top stays readable. Place it inside a `relative isolate`
// container. It never autoplays for reduced-motion users, and has a
// pause/play control because it moves on its own for longer than 5 seconds.
export function HeroVideo() {
  const video = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(() => !prefersReducedMotion())

  useEffect(() => {
    const el = video.current
    if (!el) return
    if (playing) {
      // Autoplay can still be refused (e.g. low-power mode); fall back to the poster.
      el.play().catch(() => setPlaying(false))
    } else {
      el.pause()
    }
  }, [playing])

  return (
    <>
      <video
        ref={video}
        aria-hidden
        className="absolute inset-0 -z-30 size-full object-cover grayscale"
        src={SRC}
        poster={POSTER}
        muted
        loop
        playsInline
        preload="metadata"
      />
      <div aria-hidden className="absolute inset-0 -z-20 bg-indigo mix-blend-multiply" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-coal/70 via-coal/35 to-transparent" />
      <button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        aria-label={playing ? 'Pause background video' : 'Play background video'}
        className="absolute right-4 bottom-4 flex size-10 items-center justify-center rounded-full border-2 border-white/70 text-white transition-colors outline-none hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-white sm:right-6 sm:bottom-6"
      >
        {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
      </button>
    </>
  )
}
