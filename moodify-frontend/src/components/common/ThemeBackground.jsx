import React from 'react'
import { useTheme } from '../../context/ThemeContext'
import './ThemeBackground.css'

export default function ThemeBackground() {
  const { themeName } = useTheme()

  return (
    <div className={`theme-bg theme-bg--${themeName}`}>
      {themeName === 'ocean_blue'      && <OceanBg />}
      {themeName === 'forest_green'    && <ForestBg />}
      {themeName === 'game_of_thrones' && <SnowBg />}
      {themeName === 'barbie'          && <BarbieBg />}
      {themeName === 'pokemon'         && <PokemonBg />}
      {themeName === 'anime'           && <AnimeBg />}
      {themeName === 'stars'           && <StarsBg />}
      {themeName === 'sun_moon'        && <SunMoonBg />}
      {themeName === 'soft_purple'     && <PurpleBg />}
      {themeName === 'rose_gold'       && <RoseGoldBg />}      {themeName === 'retro'           && <RetroBg />}
      {themeName === 'sports'          && <SportsBg />}
      {themeName === 'gym'             && <GymBg />}
    </div>
  )
}

/* ══════════════════════════════════════
   OCEAN — rolling CSS waves
══════════════════════════════════════ */
function OceanBg() {
  return (
    <div className="ocean-bg">
      <div className="ocean-sky" />
      <div className="ocean-deep" />
      {/* 3 layered rolling waves */}
      <div className="ocean-wave ocean-wave-1">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path d="M0,160 C360,260 1080,60 1440,160 L1440,320 L0,320 Z" />
        </svg>
      </div>
      <div className="ocean-wave ocean-wave-2">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path d="M0,200 C480,100 960,300 1440,200 L1440,320 L0,320 Z" />
        </svg>
      </div>
      <div className="ocean-wave ocean-wave-3">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path d="M0,240 C300,160 1140,320 1440,240 L1440,320 L0,320 Z" />
        </svg>
      </div>
      {/* foam bubbles */}
      {[...Array(14)].map((_, i) => (
        <div key={i} className="ocean-bubble" style={{
          left: `${(i * 7.3) % 100}%`,
          animationDelay: `${(i * 0.7) % 6}s`,
          animationDuration: `${4 + (i % 4)}s`,
          width: `${6 + (i % 10)}px`,
          height: `${6 + (i % 10)}px`,
        }} />
      ))}
    </div>
  )
}

/* ══════════════════════════════════════
   FOREST — trees + flying birds
══════════════════════════════════════ */
function ForestBg() {
  return (
    <div className="forest-bg">
      <div className="forest-sky" />
      {/* Sun */}
      <div className="forest-sun" />
      {/* Ground */}
      <div className="forest-ground" />
      {/* Tree layers */}
      <div className="forest-trees forest-trees-far" />
      <div className="forest-trees forest-trees-mid" />
      <div className="forest-trees forest-trees-near" />
      {/* Flying birds */}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="forest-bird" style={{
          top: `${8 + i * 6}%`,
          animationDelay: `${i * 2.5}s`,
          animationDuration: `${10 + i * 2}s`,
          transform: `scale(${0.6 + i * 0.1})`,
        }}>
          <svg viewBox="0 0 40 20" width="40" height="20">
            <path d="M0,10 Q10,0 20,10 Q30,0 40,10" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════
   GAME OF THRONES — falling snow
══════════════════════════════════════ */
function SnowBg() {
  return (
    <div className="snow-bg">
      <div className="snow-sky" />
      {/* Snowflakes */}
      {[...Array(60)].map((_, i) => (
        <div key={i} className="snowflake" style={{
          left: `${(i * 1.67) % 100}%`,
          animationDelay: `${(i * 0.3) % 8}s`,
          animationDuration: `${6 + (i % 6)}s`,
          fontSize: `${8 + (i % 14)}px`,
          opacity: 0.5 + (i % 5) * 0.1,
        }}>❄</div>
      ))}
      {/* Castle silhouette */}
      <div className="snow-castle" />
      {/* Snow ground */}
      <div className="snow-ground" />
    </div>
  )
}

/* ══════════════════════════════════════
   BARBIE — pink aesthetic bedroom
══════════════════════════════════════ */
function BarbieBg() {
  return (
    <div className="barbie-bg">
      {/* Room walls */}
      <div className="barbie-wall" />
      <div className="barbie-floor" />

      {/* Wallpaper pattern — tiny hearts */}
      <div className="barbie-wallpaper" />

      {/* Window with curtains */}
      <div className="barbie-window">
        <div className="barbie-window-glass" />
        <div className="barbie-curtain barbie-curtain-left" />
        <div className="barbie-curtain barbie-curtain-right" />
        <div className="barbie-window-sill" />
      </div>

      {/* Vanity mirror on the right */}
      <div className="barbie-vanity">
        <div className="barbie-mirror-frame">
          <div className="barbie-mirror-glass">
            {/* reflection shimmer */}
            <div className="barbie-mirror-shine" />
          </div>
          {/* mirror lights around frame */}
          {[...Array(8)].map((_, i) => (
            <div key={i} className="barbie-bulb" style={{
              animationDelay: `${i * 0.3}s`,
              '--pos': i,
            }} />
          ))}
        </div>
        {/* Vanity table */}
        <div className="barbie-vanity-table">
          <div className="barbie-perfume" />
          <div className="barbie-perfume barbie-perfume-2" />
          <div className="barbie-lipstick" />
        </div>
      </div>

      {/* Bed */}
      <div className="barbie-bed">
        <div className="barbie-headboard" />
        <div className="barbie-mattress" />
        <div className="barbie-pillow" />
        <div className="barbie-pillow barbie-pillow-2" />
        <div className="barbie-blanket" />
      </div>

      {/* Fairy lights string */}
      <div className="barbie-lights-string">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="barbie-light-bulb" style={{
            left: `${i * 8.5}%`,
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>

      {/* Floating hearts */}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="barbie-heart" style={{
          left: `${10 + i * 14}%`,
          animationDelay: `${i * 1.2}s`,
          animationDuration: `${4 + i}s`,
          fontSize: `${12 + (i % 3) * 8}px`,
        }}>♥</div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════
   POKEMON — pokeball + lightning
══════════════════════════════════════ */
function PokemonBg() {
  return (
    <div className="pokemon-bg">
      <div className="pokemon-sky" />
      {/* Giant pokeball */}
      <div className="pokeball">
        <div className="pokeball-top" />
        <div className="pokeball-stripe" />
        <div className="pokeball-bottom" />
        <div className="pokeball-btn" />
      </div>
      {/* Lightning bolts */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="poke-lightning" style={{
          left: `${15 + i * 18}%`,
          top: `${10 + (i % 3) * 20}%`,
          animationDelay: `${i * 0.8}s`,
        }} />
      ))}
    </div>
  )
}

/* ══════════════════════════════════════
   ANIME — Mount Fuji + torii gate
══════════════════════════════════════ */
function AnimeBg() {
  return (
    <div className="anime-bg">
      {/* Sky */}
      <div className="anime-sky" />
      {/* Mount Fuji */}
      <div className="anime-fuji">
        <div className="anime-fuji-snow" />
      </div>
      {/* Lake reflection */}
      <div className="anime-lake" />
      {/* Torii gate */}
      <div className="anime-torii">
        <div className="anime-torii-top" />
        <div className="anime-torii-mid" />
        <div className="anime-torii-leg anime-torii-leg-l" />
        <div className="anime-torii-leg anime-torii-leg-r" />
      </div>
      {/* Cherry blossom trees */}
      <div className="anime-tree anime-tree-left">
        <div className="anime-tree-trunk" />
        <div className="anime-tree-canopy" />
      </div>
      <div className="anime-tree anime-tree-right">
        <div className="anime-tree-trunk" />
        <div className="anime-tree-canopy" />
      </div>
      {/* Falling sakura petals */}
      {[...Array(22)].map((_, i) => (
        <div key={i} className="sakura-petal" style={{
          left: `${(i * 4.7) % 100}%`,
          animationDelay: `${(i * 0.55) % 10}s`,
          animationDuration: `${7 + (i % 5)}s`,
          width: `${8 + (i % 10)}px`,
          height: `${8 + (i % 10)}px`,
          background: ['#fda4af','#f9a8d4','#fbcfe8','#f43f5e','#fce7f3'][i % 5],
        }} />
      ))}
      {/* Lanterns */}
      <div className="anime-lantern anime-lantern-1" />
      <div className="anime-lantern anime-lantern-2" />
    </div>
  )
}

/* ══════════════════════════════════════
   STARS — twinkling star field
══════════════════════════════════════ */
function StarsBg() {
  return (
    <div className="stars-bg">
      {[...Array(80)].map((_, i) => (
        <div key={i} className="star-dot" style={{
          left: `${(i * 1.27) % 100}%`,
          top: `${(i * 1.13 + 7) % 100}%`,
          width: `${1 + (i % 3)}px`,
          height: `${1 + (i % 3)}px`,
          animationDelay: `${(i * 0.07) % 5}s`,
          animationDuration: `${2 + (i % 4)}s`,
        }} />
      ))}
      {/* Shooting star */}
      <div className="shooting-star" />
      <div className="shooting-star shooting-star-2" />
    </div>
  )
}

/* ══════════════════════════════════════
   SUN & MOON — day/night gradient
══════════════════════════════════════ */
function SunMoonBg() {
  return (
    <div className="sunmoon-bg">
      <div className="sunmoon-moon" />
      <div className="sunmoon-glow" />
      {[...Array(30)].map((_, i) => (
        <div key={i} className="star-dot" style={{
          left: `${(i * 3.3) % 100}%`,
          top: `${(i * 2.7 + 5) % 60}%`,
          width: `${1 + (i % 3)}px`,
          height: `${1 + (i % 3)}px`,
          animationDelay: `${(i * 0.15) % 5}s`,
          animationDuration: `${2 + (i % 4)}s`,
        }} />
      ))}
    </div>
  )
}

/* ══════════════════════════════════════
   SOFT PURPLE — BTS concert stage
══════════════════════════════════════ */
function PurpleBg() {
  return (
    <div className="bts-bg">
      {/* Dark arena sky */}
      <div className="bts-arena" />
      {/* Stage floor */}
      <div className="bts-stage" />
      <div className="bts-stage-glow" />
      {/* Crowd with ARMY bombs (purple lights) */}
      <div className="bts-crowd">
        {[...Array(80)].map((_, i) => (
          <div key={i} className="bts-army-bomb" style={{
            left: `${(i * 1.27) % 100}%`,
            bottom: `${2 + (i % 5) * 3}%`,
            animationDelay: `${(i * 0.13) % 3}s`,
            animationDuration: `${1.5 + (i % 3) * 0.5}s`,
            opacity: 0.5 + (i % 4) * 0.12,
          }} />
        ))}
      </div>
      {/* Stage spotlights sweeping */}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bts-spotlight" style={{
          left: `${10 + i * 16}%`,
          animationDelay: `${i * 0.5}s`,
          animationDuration: `${3 + (i % 3)}s`,
          background: `linear-gradient(180deg, ${['rgba(124,58,237,0.5)','rgba(236,72,153,0.5)','rgba(157,92,245,0.4)','rgba(255,100,200,0.4)','rgba(100,50,200,0.5)','rgba(200,50,150,0.4)'][i]}, transparent)`,
        }} />
      ))}
      {/* LED screen backdrop */}
      <div className="bts-screen">
        <div className="bts-screen-inner" />
        {/* BTS logo text */}
        <div className="bts-logo">BTS</div>
      </div>
      {/* Laser beams */}
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bts-laser" style={{
          left: `${5 + i * 13}%`,
          animationDelay: `${i * 0.3}s`,
          background: ['#7c3aed','#ec4899','#9d5cf5','#ff69b4','#6d28d9','#db2777','#8b5cf6','#f472b6'][i],
        }} />
      ))}
      {/* Confetti */}
      {[...Array(20)].map((_, i) => (
        <div key={i} className="bts-confetti" style={{
          left: `${(i * 5.1) % 100}%`,
          animationDelay: `${(i * 0.4) % 6}s`,
          animationDuration: `${4 + (i % 4)}s`,
          background: ['#7c3aed','#ec4899','#fbbf24','#34d399','#60a5fa','#f472b6'][i % 6],
          width: `${4 + (i % 6)}px`,
          height: `${4 + (i % 6)}px`,
        }} />
      ))}
    </div>
  )
}

/* ══════════════════════════════════════
   ROSE GOLD — flower garden
══════════════════════════════════════ */
function RoseGoldBg() {
  return (
    <div className="garden-bg">
      {/* Sky gradient */}
      <div className="garden-sky" />
      {/* Sun */}
      <div className="garden-sun" />
      {/* Garden path */}
      <div className="garden-path" />
      {/* Grass layers */}
      <div className="garden-grass garden-grass-far" />
      <div className="garden-grass garden-grass-mid" />
      <div className="garden-grass garden-grass-near" />
      {/* Rose bushes */}
      {[...Array(8)].map((_, i) => (
        <div key={i} className="garden-bush" style={{
          left: `${i * 13}%`,
          bottom: `${18 + (i % 3) * 4}%`,
          animationDelay: `${i * 0.4}s`,
        }}>
          <div className="garden-bush-leaves" />
          {/* Roses on bush */}
          {[...Array(3)].map((_, j) => (
            <div key={j} className="garden-rose" style={{
              left: `${10 + j * 25}px`,
              top: `${-8 - (j % 2) * 8}px`,
              background: ['#f43f5e','#fb7185','#e11d48','#ff6b9d','#ff1f8e'][( i + j) % 5],
            }} />
          ))}
        </div>
      ))}
      {/* Tulips */}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="garden-tulip" style={{
          left: `${5 + i * 17}%`,
          bottom: '16%',
          animationDelay: `${i * 0.6}s`,
        }}>
          <div className="garden-tulip-stem" />
          <div className="garden-tulip-head" style={{
            background: ['#f43f5e','#fbbf24','#fb7185','#f97316','#e11d48','#ff6b9d'][i],
          }} />
        </div>
      ))}
      {/* Falling petals */}
      {[...Array(18)].map((_, i) => (
        <div key={i} className="garden-petal" style={{
          left: `${(i * 5.7) % 100}%`,
          animationDelay: `${(i * 0.5) % 8}s`,
          animationDuration: `${6 + (i % 5)}s`,
          background: ['#f43f5e','#fb7185','#fda4af','#ff6b9d','#fbbf24'][i % 5],
          width: `${8 + (i % 8)}px`,
          height: `${8 + (i % 8)}px`,
        }} />
      ))}
      {/* Butterflies */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className="garden-butterfly" style={{
          left: `${15 + i * 22}%`,
          top: `${20 + (i % 3) * 15}%`,
          animationDelay: `${i * 1.5}s`,
        }}>🦋</div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════
   RETRO — vintage room with CD player
══════════════════════════════════════ */
function RetroBg() {
  return (
    <div className="retro-bg">
      {/* Room */}
      <div className="retro-wall" />
      <div className="retro-floor" />
      <div className="retro-wallpaper" />

      {/* Window */}
      <div className="retro-window">
        <div className="retro-window-glass" />
        <div className="retro-window-frame" />
        <div className="retro-blinds">
          {[...Array(8)].map((_, i) => <div key={i} className="retro-blind-slat" />)}
        </div>
      </div>

      {/* Shelf with CD player */}
      <div className="retro-shelf">
        {/* CD / Boombox */}
        <div className="retro-boombox">
          <div className="retro-boombox-body" />
          <div className="retro-speaker retro-speaker-left" />
          <div className="retro-speaker retro-speaker-right" />
          <div className="retro-cd-slot" />
          <div className="retro-cd-disc">
            <div className="retro-cd-inner" />
          </div>
          <div className="retro-boombox-buttons">
            {[...Array(4)].map((_, i) => <div key={i} className="retro-btn" />)}
          </div>
          {/* Sound waves */}
          <div className="retro-sound-wave retro-sw-1" />
          <div className="retro-sound-wave retro-sw-2" />
          <div className="retro-sound-wave retro-sw-3" />
        </div>

        {/* Cassette tapes stacked */}
        <div className="retro-cassette retro-cassette-1" />
        <div className="retro-cassette retro-cassette-2" />

        {/* Old photo frames */}
        <div className="retro-frame retro-frame-1" />
        <div className="retro-frame retro-frame-2" />
      </div>

      {/* Desk lamp */}
      <div className="retro-lamp">
        <div className="retro-lamp-base" />
        <div className="retro-lamp-arm" />
        <div className="retro-lamp-shade" />
        <div className="retro-lamp-glow" />
      </div>

      {/* Vinyl record on wall */}
      <div className="retro-vinyl">
        <div className="retro-vinyl-inner" />
        <div className="retro-vinyl-label" />
      </div>

      {/* Film grain overlay */}
      <div className="retro-grain" />

      {/* Floating music notes */}
      {['♪','♫','♩','♬'].map((note, i) => (
        <div key={i} className="retro-note" style={{
          left: `${20 + i * 18}%`,
          animationDelay: `${i * 1.5}s`,
          animationDuration: `${5 + i}s`,
        }}>{note}</div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════
   SPORTS — night stadium with floodlights
══════════════════════════════════════ */
function SportsBg() {
  return (
    <div className="sports-bg">
      {/* Night sky */}
      <div className="sports-sky" />
      {/* Pitch / field */}
      <div className="sports-field" />
      {/* Field lines */}
      <div className="sports-field-lines" />
      {/* Stadium stands left & right */}
      <div className="sports-stand sports-stand-left" />
      <div className="sports-stand sports-stand-right" />
      {/* Crowd dots */}
      <div className="sports-crowd sports-crowd-left">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="sports-crowd-dot" style={{
            left: `${(i * 3.4) % 100}%`,
            top: `${(i * 7 + 10) % 60}%`,
            animationDelay: `${(i * 0.15) % 3}s`,
            background: ['#ef4444','#3b82f6','#facc15','#22c55e','#fff'][i % 5],
          }} />
        ))}
      </div>
      <div className="sports-crowd sports-crowd-right">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="sports-crowd-dot" style={{
            left: `${(i * 3.4) % 100}%`,
            top: `${(i * 7 + 10) % 60}%`,
            animationDelay: `${(i * 0.2) % 3}s`,
            background: ['#fff','#facc15','#ef4444','#3b82f6','#22c55e'][i % 5],
          }} />
        ))}
      </div>
      {/* Floodlight towers */}
      <div className="sports-floodlight sports-fl-left">
        <div className="sports-fl-pole" />
        <div className="sports-fl-head" />
        <div className="sports-fl-beam sports-fl-beam-1" />
        <div className="sports-fl-beam sports-fl-beam-2" />
        <div className="sports-fl-beam sports-fl-beam-3" />
      </div>
      <div className="sports-floodlight sports-fl-right">
        <div className="sports-fl-pole" />
        <div className="sports-fl-head" />
        <div className="sports-fl-beam sports-fl-beam-1" />
        <div className="sports-fl-beam sports-fl-beam-2" />
        <div className="sports-fl-beam sports-fl-beam-3" />
      </div>
      {/* Scoreboard */}
      <div className="sports-scoreboard">
        <div className="sports-score-text">HOME <span className="sports-score-num">2</span> — <span className="sports-score-num">1</span> AWAY</div>
        <div className="sports-score-blink" />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   GYM — dark gym room with equipment
══════════════════════════════════════ */
function GymBg() {
  return (
    <div className="gym-bg">
      {/* Dark room */}
      <div className="gym-wall" />
      <div className="gym-floor" />
      {/* Mirror wall */}
      <div className="gym-mirror-wall">
        <div className="gym-mirror-shine" />
        <div className="gym-mirror-shine gym-mirror-shine-2" />
      </div>
      {/* Neon sign */}
      <div className="gym-neon">NO PAIN NO GAIN</div>
      {/* Dumbbell rack */}
      <div className="gym-rack">
        <div className="gym-rack-bar" />
        {[20,25,30,35,40].map((w, i) => (
          <div key={i} className="gym-dumbbell" style={{ left: `${i * 22}%` }}>
            <div className="gym-db-plate" style={{ width: `${8 + i * 2}px`, height: `${20 + i * 3}px` }} />
            <div className="gym-db-handle" />
            <div className="gym-db-plate" style={{ width: `${8 + i * 2}px`, height: `${20 + i * 3}px` }} />
          </div>
        ))}
      </div>
      {/* Barbell on floor */}
      <div className="gym-barbell">
        <div className="gym-bb-plate gym-bb-plate-l gym-bb-plate-big" />
        <div className="gym-bb-plate gym-bb-plate-l" />
        <div className="gym-bb-bar" />
        <div className="gym-bb-plate gym-bb-plate-r" />
        <div className="gym-bb-plate gym-bb-plate-r gym-bb-plate-big" />
      </div>
      {/* Motivational energy lines */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="gym-energy-line" style={{
          top: `${20 + i * 14}%`,
          animationDelay: `${i * 0.4}s`,
          animationDuration: `${2 + i * 0.3}s`,
        }} />
      ))}
      {/* Ceiling spotlight */}
      <div className="gym-spotlight gym-spotlight-1" />
      <div className="gym-spotlight gym-spotlight-2" />
    </div>
  )
}
