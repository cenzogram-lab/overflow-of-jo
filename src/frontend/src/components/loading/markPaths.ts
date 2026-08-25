/**
 * Geometry of the Overflow of Jo mark, in the shared 248 × 224 mark viewBox.
 *
 * Single source of truth so the animated hero cup in BrewingCup and the logo
 * painted on the side of the food truck are the same drawing, not two
 * drifting copies of it.
 */
export const MARK = {
  /** Bounding box of the whole mark, used to place scaled copies of it. */
  box: { x: 50, y: 14, width: 175, height: 193 },

  cupBody: "M62 96 C 64 148, 90 178, 124 178 C 158 178, 184 148, 186 96",
  rim: { cx: 124, cy: 96, rx: 62, ry: 14 },
  handle: "M186 106 C 219 108, 221 150, 183 154",
  cross: "M203 20 L203 78 M181 41 L225 41",
  crossRotate: "rotate(-7 203 46)",
  saucer: "M68 181 C 92 207, 156 207, 180 181",
  saucerTick: "M97 195 C 112 203, 138 203, 152 195",

  /** Coffee running over the lip and clinging to the outer wall. */
  spill:
    "M62 91 C 52 106, 50 124, 53 138 C 55 147, 62 147, 64 138 C 66 122, 66 105, 67 91 Z",

  /** Teardrops, drawn about their own origin and placed by a transform. */
  dropLarge: "M0 0 C 5 7, 8 11, 8 14 A 8 8 0 0 1 -8 14 C -8 11, -5 7, 0 0 Z",
  dropMedium:
    "M0 0 C 4 6, 6.5 9, 6.5 11.5 A 6.5 6.5 0 0 1 -6.5 11.5 C -6.5 9, -4 6, 0 0 Z",
  dropSmall:
    "M0 0 C 3.5 5, 5.5 8, 5.5 10 A 5.5 5.5 0 0 1 -5.5 10 C -5.5 8, -3.5 5, 0 0 Z",

  steam: {
    a: "M100 66 C 92 52, 108 45, 100 31 C 94 21, 102 14, 100 6",
    b: "M124 68 C 116 52, 132 43, 124 27 C 118 15, 126 8, 124 -2",
    c: "M148 66 C 140 52, 156 45, 148 31 C 142 21, 150 14, 148 6",
  },
} as const;

/**
 * Transform that drops the mark into another drawing at a given height,
 * anchored by its top-left corner.
 */
export function markTransform(x: number, y: number, height: number): string {
  const s = height / MARK.box.height;
  return `translate(${(x - MARK.box.x * s).toFixed(2)} ${(y - MARK.box.y * s).toFixed(2)}) scale(${s.toFixed(4)})`;
}
