import { arrivalState } from './arrival-state.js';

export function createArrival(onChange) {
  const arrival = document.querySelector('#arrival');
  const sticky = arrival.querySelector('.arrival-sticky');
  const header = arrival.querySelector('.intro');
  const lines = [...header.querySelectorAll('h1, .role, .description')];
  const navigation = header.querySelector('nav');
  const stage = arrival.querySelector('.stage');
  const cue = arrival.querySelector('.arrival-cue');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const events = new AbortController();
  const textOnly = new URLSearchParams(location.search).get('view') === 'stories';
  let frame = 0, positions = [], progress = 1, active = false, measureNeeded = true;
  function render() {
    frame = 0;
    const enabled = !textOnly && !preference.matches && document.querySelector('#motion')?.getAttribute('aria-pressed') !== 'false';
    if (enabled !== active) { active = enabled; document.documentElement.classList.toggle('has-arrival', active); measureNeeded = true; }
    if (!active) {
      for (const line of lines) { line.style.transform = ''; line.style.textAlign = ''; }
      stage.style.opacity = ''; stage.style.transform = ''; stage.inert = false;
      navigation.style.opacity = ''; navigation.inert = false; cue.hidden = true;
      progress = 1; onChange(arrivalState(1)); return;
    }
    cue.hidden = false;
    if (measureNeeded) {
      lines.forEach(line => line.style.transform = '');
      const anchor = sticky.getBoundingClientRect();
      positions = lines.map(line => { const rect = line.getBoundingClientRect(); return { x: rect.left - anchor.left, y: rect.top - anchor.top, width: rect.width, height: rect.height }; });
      measureNeeded = false;
    }
    const start = arrival.getBoundingClientRect().top + scrollY;
    const distance = Math.max(1, arrival.offsetHeight - sticky.offsetHeight);
    const state = arrivalState((scrollY - start) / distance);
    progress = state.progress;
    const scales = innerWidth > 700 ? [1.4, 1.12, 1] : [1.2, 1, 1];
    const gap = innerWidth > 700 ? 17 : 13;
    const total = positions.reduce((sum, pos, i) => sum + pos.height * scales[i], 0) + gap * (positions.length - 1);
    let y = innerHeight * .46 - total / 2;
    lines.forEach((line, i) => {
      const pos = positions[i], scale = scales[i];
      const x = (innerWidth - pos.width * scale) / 2;
      line.style.transformOrigin = '0 0';
      line.style.transform = `translate(${(x-pos.x)*(1-state.header)}px, ${(y-pos.y)*(1-state.header)}px) scale(${1+(scale-1)*(1-state.header)})`;
      line.style.textAlign = state.header < .5 ? 'center' : 'left';
      y += pos.height * scale + gap;
    });
    navigation.style.opacity = state.navigation; navigation.inert = state.navigation < .95;
    stage.style.opacity = state.opacity;
    stage.style.transform = `translateY(${(1-state.room)*24}px)`;
    stage.inert = !state.ready;
    cue.style.opacity = state.progress < .8 ? 1 : Math.max(0, (1-state.progress)/.2);
    cue.inert = state.ready;
    cue.hidden = state.ready;
    arrival.dataset.progress = state.progress.toFixed(3);
    arrival.dataset.ready = String(state.ready);
    onChange(state);
  }
  function skip() {
    if (!active) return;
    const start = arrival.getBoundingClientRect().top + scrollY;
    window.scrollTo({ top: start + Math.max(1, arrival.offsetHeight-sticky.offsetHeight), behavior: 'instant' });
    history.replaceState(null, '', '#room-ready');
    cancelAnimationFrame(frame); render();
  }
  function request(measure = false) { measureNeeded ||= measure; if (!frame) frame = requestAnimationFrame(render); }
  const on = (target, type, fn, extra = {}) => target.addEventListener(type, fn, { ...extra, signal: events.signal });
  on(window, 'scroll', () => request(), { passive: true });
  on(window, 'resize', () => request(true), { passive: true });
  on(window, 'hashchange', () => { if (location.hash === '#room-ready') skip(); else request(); });
  on(preference, 'change', () => request(true));
  on(document, 'click', event => { if (event.target.closest('#motion')) request(true); });
  document.fonts?.ready.then(() => { if (!events.signal.aborted) request(true); });
  render();
  if (location.hash === '#room-ready' && active) skip();
  return { skip, get active() { return active; }, get progress() { return progress; }, dispose() { events.abort(); cancelAnimationFrame(frame); document.documentElement.classList.remove('has-arrival'); } };
}
