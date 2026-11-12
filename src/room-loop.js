// A bounded frame scheduler. No RAF remains scheduled once the room settles.
export function createRoomLoop(render, {
  now = () => performance.now(),
  request = callback => requestAnimationFrame(callback),
  cancel = id => cancelAnimationFrame(id),
  fps = 30,
} = {}) {
  let frame = null, until = 0, active = true, disposed = false, last = -Infinity;
  const tick = time => {
    frame = null;
    if (!active || disposed) return;
    if (time - last >= 1000 / fps - 1) {
      last = time;
      render(time);
    }
    if (time < until && active && !disposed) frame = request(tick);
  };
  return {
    wake(seconds = 1) {
      if (disposed) return;
      until = Math.max(until, now() + seconds * 1000);
      if (active && frame === null) { last = -Infinity; frame = request(tick); }
    },
    setActive(value) {
      active = value;
      if (!active && frame !== null) { cancel(frame); frame = null; }
    },
    dispose() { disposed = true; if (frame !== null) cancel(frame); frame = null; },
    get running() { return frame !== null; },
  };
}
