const host = document.querySelector('#scene');
const enter = document.querySelector('#enter-room');
const status = document.querySelector('#room-status');
const settings = document.querySelector('#room-settings');
const story = document.querySelector('#room-story');
const controls = document.querySelector('#room-controls');
const fallback = document.querySelector('#object-index');
const poster = host.innerHTML;
const textOnly = new URLSearchParams(location.search).get('view') === 'stories';
const deliberateStart = textOnly || matchMedia('(max-width: 700px), (pointer: coarse), (prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData;
let loading = false, room, left = false;
enter.hidden = false;

function showFallback() {
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
  if (loading || room || left) return;
  loading = true; enter.disabled = true;
  status.textContent = 'Opening the room… The stories and project links remain available below.';
  host.setAttribute('aria-busy', 'true'); host.dataset.state = 'loading';
  try {
    const { mountRoom } = await import('./exhibition-room.js');
    if (left) return;
    const focused = document.activeElement === enter;
    room = mountRoom({ onFailure: showFallback });
    settings.hidden = controls.hidden = false;
    story.hidden = true; fallback.hidden = true;
    host.dataset.state = 'ready'; host.setAttribute('aria-busy', 'false');
    document.querySelector('#hint').textContent = matchMedia('(pointer: coarse)').matches
      ? 'Tap an object to discover it. Enable “Move objects” to drag; keep it off to scroll.'
      : 'Choose an object. Drag the carpet or open the toolbox to discover more.';
    if (focused) { controls.open = true; controls.querySelector('summary').focus(); }
  } catch { showFallback(); }
  loading = false;
}
enter.addEventListener('click', openRoom);
if (textOnly) fallback.hidden = false;
if (!deliberateStart) {
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    if ('requestIdleCallback' in window) requestIdleCallback(openRoom, { timeout: 1200 });
    else setTimeout(openRoom, 100);
  }, { rootMargin: '100px' });
  observer.observe(host);
}
window.addEventListener('pagehide', event => { if (!event.persisted) { left = true; room?.dispose(); } });
if (import.meta.hot) import.meta.hot.dispose(() => { left = true; room?.dispose(); });
