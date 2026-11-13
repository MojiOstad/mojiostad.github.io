import { createArrival } from './arrival.js';
const host = document.querySelector('#scene');
const enter = document.querySelector('#enter-room');
const status = document.querySelector('#room-status');
const settings = document.querySelector('#room-settings');
const story = document.querySelector('#room-story');
const controls = document.querySelector('#room-controls');
const fallback = document.querySelector('#object-index');
const poster = host.innerHTML;
const textOnly = new URLSearchParams(location.search).get('view') === 'stories';
const deliberateStart = textOnly || matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData;
let loading = false, room, left = false, failed = false, focusAfterEntry = false;
const readyHint = () => matchMedia('(pointer: coarse), (max-width: 700px)').matches
  ? 'Tap an object to discover it. Enable “Move objects” to drag; keep it off to scroll.'
  : 'Choose an object. Drag the carpet or open the toolbox to discover more.';
let entranceState = { progress: 0, room: 0 };
let arrival;
enter.hidden = false;

function showFallback() {
  failed = true;
  room?.dispose(); room = undefined;
  host.innerHTML = poster;
  host.querySelector('#enter-room')?.remove();
  host.querySelector('#room-status').textContent = 'The interactive room is unavailable. Every story is still here to read.';
  host.setAttribute('aria-busy', 'false'); host.dataset.state = 'fallback';
  settings.hidden = story.hidden = controls.hidden = true;
  fallback.hidden = false;
  document.querySelector('#hint').textContent = 'Read the stories, browse selected work, or get in touch below.';
}
async function openRoom() {
  if (loading || room || left || failed) return;
  loading = true; enter.disabled = true;
  status.textContent = 'Opening the room… The stories and project links remain available below.';
  host.setAttribute('aria-busy', 'true'); host.dataset.state = 'loading';
  try {
    const { mountRoom } = await import('./exhibition-room.js');
    if (left) return;
    const focused = document.activeElement === enter;
    room = mountRoom({ onFailure: showFallback, entranceProgress: entranceState.room });
    settings.hidden = controls.hidden = false;
    story.hidden = true; fallback.hidden = true;
    host.dataset.state = 'ready'; host.setAttribute('aria-busy', 'false');
    document.querySelector('#hint').textContent = !entranceState.ready ? 'Keep scrolling to step into the room.' : readyHint();
    if (focused) { controls.open = true; controls.querySelector('summary').focus(); }
    if (focusAfterEntry && entranceState.ready) { arrival.skip(); host.querySelector('canvas')?.focus({preventScroll:true}); focusAfterEntry = false; }
  } catch { showFallback(); }
  loading = false;
}
enter.addEventListener('click', openRoom);
arrival = createArrival(state => {
  const wasReady = entranceState.ready;
  entranceState = state;
  if (!failed) {
    if (!state.ready) document.querySelector('#hint').textContent = 'Keep scrolling to step into the room.';
    else if (!wasReady) document.querySelector('#hint').textContent = readyHint();
  }
  if (state.ready && focusAfterEntry && room) { host.querySelector('canvas')?.focus({preventScroll:true}); focusAfterEntry = false; }
  room?.setEntranceProgress(state.room);
  if (state.progress > .08 && !deliberateStart) {
    const bounds = host.getBoundingClientRect();
    if (bounds.bottom > 0 && bounds.top < innerHeight) openRoom();
  }
});
document.querySelectorAll('.arrival-cue a').forEach(link => link.addEventListener('click', event => { event.preventDefault(); focusAfterEntry = true; arrival.skip(); openRoom(); }));
if (textOnly) fallback.hidden = false;
if (!deliberateStart) {
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting || (arrival.active && entranceState.progress <= .08)) return;
    observer.disconnect();
    if ('requestIdleCallback' in window) requestIdleCallback(openRoom, { timeout: 1200 });
    else setTimeout(openRoom, 100);
  }, { rootMargin: '100px' });
  observer.observe(host);
}
window.addEventListener('pagehide', event => { if (!event.persisted) { left = true; arrival?.dispose(); room?.dispose(); } });
if (import.meta.hot) import.meta.hot.dispose(() => { left = true; arrival?.dispose(); room?.dispose(); });
