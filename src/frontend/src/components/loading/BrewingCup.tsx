/**
 * Animated version of the Overflow of Jo mark: steam rises, the cup fills,
 * coffee runs over the lip and drips onto the saucer, and the splash ripples
 * outward. Everything is one inline SVG driven by loading-screen.css.
 */
export default function BrewingCup() {
  return (
    <svg
      className="brew-mark"
      viewBox="10 -6 248 224"
      xmlns="http://www.w3.org/2000/svg"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* Interior of the bowl plus the full rim ellipse, so the liquid
            surface reads correctly right up to the lip. */}
        <clipPath id="brew-cup-interior">
          <path d="M62 96 C 64 148, 90 178, 124 178 C 158 178, 184 148, 186 96 Z" />
          <ellipse cx="124" cy="96" rx="62" ry="14" />
        </clipPath>
      </defs>

      {/* Steam */}
      <g className="brew-steam">
        <path
          className="brew-steam__wisp brew-steam__wisp--a"
          d="M100 66 C 92 52, 108 45, 100 31 C 94 21, 102 14, 100 6"
        />
        <path
          className="brew-steam__wisp brew-steam__wisp--b"
          d="M124 68 C 116 52, 132 43, 124 27 C 118 15, 126 8, 124 -2"
        />
        <path
          className="brew-steam__wisp brew-steam__wisp--c"
          d="M148 66 C 140 52, 156 45, 148 31 C 142 21, 150 14, 148 6"
        />
      </g>

      {/* Cross rising behind the handle */}
      <path
        className="brew-cup__cross"
        d="M203 20 L203 78 M181 41 L225 41"
        transform="rotate(-7 203 46)"
      />

      {/* Handle */}
      <path
        className="brew-mark__stroke"
        d="M186 106 C 219 108, 221 150, 183 154"
      />

      {/* Liquid, clipped to the inside of the cup */}
      <g clipPath="url(#brew-cup-interior)">
        <g className="brew-liquid">
          <g className="brew-liquid__bob">
            <rect
              className="brew-liquid__body"
              x="52"
              y="96"
              width="144"
              height="104"
            />
            <ellipse
              className="brew-liquid__surface"
              cx="124"
              cy="96"
              rx="62"
              ry="13"
            />
            <ellipse
              className="brew-liquid__ring"
              cx="124"
              cy="96"
              rx="52"
              ry="11"
            />
            <ellipse
              className="brew-liquid__ring brew-liquid__ring--b"
              cx="124"
              cy="96"
              rx="52"
              ry="11"
            />
          </g>
        </g>
      </g>

      {/* Cup body + rim */}
      <path
        className="brew-mark__stroke"
        d="M62 96 C 64 148, 90 178, 124 178 C 158 178, 184 148, 186 96"
      />
      <ellipse className="brew-cup__rim" cx="124" cy="96" rx="62" ry="14" />

      {/* Coffee spilling over the lip and clinging to the outside wall */}
      <path
        className="brew-spill"
        d="M62 91 C 52 106, 50 124, 53 138 C 55 147, 62 147, 64 138 C 66 122, 66 105, 67 91 Z"
      />

      {/* Drops shedding off the spill and the base of the cup.
          The placement lives on an outer <g> because the CSS animation on the
          inner <g> replaces any transform attribute on the same element. */}
      <g transform="translate(57 143)">
        <g className="brew-drop brew-drop--a">
          <path d="M0 0 C 5 7, 8 11, 8 14 A 8 8 0 0 1 -8 14 C -8 11, -5 7, 0 0 Z" />
        </g>
      </g>
      <g transform="translate(57 143)">
        <g className="brew-drop brew-drop--b">
          <path d="M0 0 C 3.5 5, 5.5 8, 5.5 10 A 5.5 5.5 0 0 1 -5.5 10 C -5.5 8, -3.5 5, 0 0 Z" />
        </g>
      </g>
      <g transform="translate(124 176)">
        <g className="brew-drop brew-drop--c">
          <path d="M0 0 C 4 6, 6.5 9, 6.5 11.5 A 6.5 6.5 0 0 1 -6.5 11.5 C -6.5 9, -4 6, 0 0 Z" />
        </g>
      </g>

      {/* Saucer */}
      <path
        className="brew-mark__stroke"
        d="M68 181 C 92 207, 156 207, 180 181"
      />
      <path
        className="brew-mark__stroke brew-saucer__tick"
        d="M97 195 C 112 203, 138 203, 152 195"
      />

      {/* Splash ripples where the drips land */}
      <ellipse className="brew-splash" cx="57" cy="196" rx="26" ry="9" />
      <ellipse
        className="brew-splash brew-splash--b"
        cx="124"
        cy="202"
        rx="30"
        ry="10"
      />
    </svg>
  );
}
