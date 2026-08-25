import { MARK } from "./markPaths";

/**
 * Animated version of the Overflow of Jo mark: steam rises, the cup fills,
 * coffee runs over the lip and drips onto the saucer, and the splash ripples
 * outward.
 *
 * The geometry comes from markPaths so this and the logo on the side of the
 * food truck are the same drawing. Nothing here is timed: LoadingScreen hands
 * the liquid level and the spill down as custom properties derived from the
 * loader's progress.
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
          <path d={`${MARK.cupBody} Z`} />
          <ellipse
            cx={MARK.rim.cx}
            cy={MARK.rim.cy}
            rx={MARK.rim.rx}
            ry={MARK.rim.ry}
          />
        </clipPath>
      </defs>

      {/* Steam */}
      <g className="brew-steam">
        <path
          className="brew-steam__wisp brew-steam__wisp--a"
          d={MARK.steam.a}
        />
        <path
          className="brew-steam__wisp brew-steam__wisp--b"
          d={MARK.steam.b}
        />
        <path
          className="brew-steam__wisp brew-steam__wisp--c"
          d={MARK.steam.c}
        />
      </g>

      {/* Cross rising behind the handle */}
      <path
        className="brew-cup__cross"
        d={MARK.cross}
        transform={MARK.crossRotate}
      />

      {/* Handle */}
      <path className="brew-mark__stroke" d={MARK.handle} />

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
              cx={MARK.rim.cx}
              cy={MARK.rim.cy}
              rx={MARK.rim.rx}
              ry="13"
            />
            <ellipse
              className="brew-liquid__ring"
              cx={MARK.rim.cx}
              cy={MARK.rim.cy}
              rx="52"
              ry="11"
            />
            <ellipse
              className="brew-liquid__ring brew-liquid__ring--b"
              cx={MARK.rim.cx}
              cy={MARK.rim.cy}
              rx="52"
              ry="11"
            />
          </g>
        </g>
      </g>

      {/* Cup body + rim */}
      <path className="brew-mark__stroke" d={MARK.cupBody} />
      <ellipse
        className="brew-cup__rim"
        cx={MARK.rim.cx}
        cy={MARK.rim.cy}
        rx={MARK.rim.rx}
        ry={MARK.rim.ry}
      />

      {/* Coffee spilling over the lip and clinging to the outside wall */}
      <path className="brew-spill" d={MARK.spill} />

      {/* Drops shedding off the spill and the base of the cup.
          The placement lives on an outer <g> because the CSS animation on the
          inner <g> replaces any transform attribute on the same element. */}
      <g transform="translate(57 143)">
        <g className="brew-drop brew-drop--a">
          <path d={MARK.dropLarge} />
        </g>
      </g>
      <g transform="translate(57 143)">
        <g className="brew-drop brew-drop--b">
          <path d={MARK.dropSmall} />
        </g>
      </g>
      <g transform="translate(124 176)">
        <g className="brew-drop brew-drop--c">
          <path d={MARK.dropMedium} />
        </g>
      </g>

      {/* Saucer */}
      <path className="brew-mark__stroke" d={MARK.saucer} />
      <path
        className="brew-mark__stroke brew-saucer__tick"
        d={MARK.saucerTick}
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
