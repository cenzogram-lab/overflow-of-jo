/**
 * Removes the static splash that index.html paints before the bundle runs.
 *
 * Call this from an effect, never from a `requestAnimationFrame` right after
 * `createRoot().render()` — with a concurrent root that callback can run
 * before React commits, leaving a bare frame between the splash and the
 * preloader. Effects run after the commit, so the handoff is seamless.
 */
export function dismissBootSplash(): void {
  document.getElementById("boot-splash")?.remove();
}
