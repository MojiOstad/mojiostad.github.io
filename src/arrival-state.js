export const clamp = value => Math.max(0, Math.min(1, Number(value) || 0));
const smooth = (start, end, value) => { const t = clamp((value - start) / (end - start)); return t * t * (3 - 2 * t); };
export function arrivalState(progress) {
  const value = clamp(progress);
  return { progress: value, header: smooth(0, .45, value), room: smooth(.18, 1, value), opacity: smooth(.16, .38, value), navigation: smooth(.35, .55, value), ready: value >= .999 };
}
export function arrivalCamera(progress) {
  const p = clamp(progress), radius = Math.hypot(8, 7, 14);
  const theta = Math.atan2(8, 14) + (1 - p) * Math.PI / 10;
  const phi = Math.acos(7 / radius) - (1 - p) * .14;
  return { x: radius * Math.sin(phi) * Math.sin(theta), y: 1 + radius * Math.cos(phi), z: radius * Math.sin(phi) * Math.cos(theta), zoom: .55 + .45 * p };
}
