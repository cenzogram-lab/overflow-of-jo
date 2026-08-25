import { MARK, markTransform } from "./markPaths";

/**
 * The Overflow of Jo coffee truck — the preloader's progress indicator.
 *
 * Drawn in the same hand-inked line-art register as the logo, and branded with
 * the logo itself: the cup, cross, spill and saucer on the side panel come
 * from markPaths, the same geometry the hero cup above is built from, under
 * the same "Overflow / OF JO" lockup the site uses.
 *
 * It owns no timeline. LoadingScreen positions it along the baseline track
 * from the loader's progress, and the phase on the overlay decides whether the
 * wheels are turning or the truck has parked.
 */
export default function FoodTruck() {
  return (
    <svg
      className="brew-truck"
      viewBox="0 0 200 101"
      xmlns="http://www.w3.org/2000/svg"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      {/* Everything above the axles bounces together while rolling */}
      <g className="brew-truck__chassis">
        {/* Box body */}
        <path className="brew-truck__line" d="M8 16 L134 16 L134 76 L8 76 Z" />

        {/* Cab with a raked windscreen */}
        <path
          className="brew-truck__line"
          d="M134 44 L158 44 L178 62 L190 62 L190 76 L134 76"
        />
        <path
          className="brew-truck__line brew-truck__line--thin"
          d="M140 48 L156 48 L170 62 L140 62 Z"
        />

        {/* Serving hatch, propped open above the roofline */}
        <path className="brew-truck__panel" d="M22 22 L120 22 L130 6 L32 6 Z" />
        <path
          className="brew-truck__line brew-truck__line--thin"
          d="M22 22 L120 22 L130 6 L32 6 Z"
        />
        <path
          className="brew-truck__stripe"
          d="M50 22 L60 6 M74 22 L84 6 M98 22 L108 6"
        />

        {/* Serving window and counter ledge */}
        <path
          className="brew-truck__line brew-truck__line--thin"
          d="M22 24 L120 24 L120 40 L22 40 Z"
        />
        <path
          className="brew-truck__line brew-truck__line--thin"
          d="M16 40 L126 40"
        />

        {/* ── Livery: the logo, on the side of the truck ── */}
        <g className="brew-truck__brand" transform={markTransform(14, 44, 28)}>
          <path
            className="brew-truck__brand-cross"
            d={MARK.cross}
            transform={MARK.crossRotate}
          />
          <path d={MARK.handle} />
          <path d={MARK.cupBody} />
          <ellipse
            cx={MARK.rim.cx}
            cy={MARK.rim.cy}
            rx={MARK.rim.rx}
            ry={MARK.rim.ry}
          />
          <path d={MARK.spill} />
          <g transform="translate(57 150)">
            <path d={MARK.dropSmall} />
          </g>
          <path d={MARK.saucer} />
          <path d={MARK.saucerTick} />
        </g>

        <text className="brew-truck__wordmark" x="48" y="64">
          Overflow
        </text>
        <text className="brew-truck__wordmark-sub" x="49" y="72">
          OF JO
        </text>

        {/* Headlamp */}
        <circle className="brew-truck__lamp" cx="186" cy="69" r="3.2" />
      </g>

      {/* Wheels. The placement sits on an outer <g> because the CSS spin on
          the inner <g> replaces any transform attribute on the same element. */}
      <g transform="translate(52 88)">
        <g className="brew-truck__wheel">
          <circle className="brew-truck__line" r="13" />
          <path
            className="brew-truck__spoke"
            d="M0 -13 L0 13 M-13 0 L13 0 M-9.2 -9.2 L9.2 9.2 M-9.2 9.2 L9.2 -9.2"
          />
          <circle className="brew-truck__hub" r="3.6" />
        </g>
      </g>
      <g transform="translate(156 88)">
        <g className="brew-truck__wheel">
          <circle className="brew-truck__line" r="13" />
          <path
            className="brew-truck__spoke"
            d="M0 -13 L0 13 M-13 0 L13 0 M-9.2 -9.2 L9.2 9.2 M-9.2 9.2 L9.2 -9.2"
          />
          <circle className="brew-truck__hub" r="3.6" />
        </g>
      </g>
    </svg>
  );
}
