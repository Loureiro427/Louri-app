export function visibleAppHeight(
  inner: number,
  visual: number,
  baseline: number,
  keyboard: number,
) {
  const measured = Math.min(inner, visual > 0 ? visual : inner);
  // Some WebViews overlay the IME without changing either browser height.
  return Math.max(
    120,
    Math.round(
      keyboard > 0 ? Math.min(measured, baseline - keyboard) : measured,
    ),
  );
}
