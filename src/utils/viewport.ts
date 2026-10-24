export function visibleAppHeight(
  inner: number,
  visual: number,
  baseline: number,
  keyboard: number,
  scale = 1,
) {
  // Pinch zoom reduces the visual viewport without opening a keyboard.
  const measured = Math.min(
    inner,
    scale > 1.01 ? inner : visual > 0 ? visual : inner,
  );
  // Some WebViews overlay the IME without changing either browser height.
  return Math.max(
    120,
    Math.round(
      keyboard > 0 ? Math.min(measured, baseline - keyboard) : measured,
    ),
  );
}
