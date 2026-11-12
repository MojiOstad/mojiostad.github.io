document.querySelector('.shape-controls')?.removeAttribute('hidden');
const hint = document.querySelector('#shape-description');
if (hint) hint.textContent = 'A little room to play. Choose a form.';
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const sculpture = document.querySelector('#sculpture');
if (sculpture && !reduced.matches) {
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      observer.disconnect();
      import('./sculpture.js').then(({ mountSculpture }) => mountSculpture(sculpture)).catch(() => {});
    }
  }, { rootMargin: '100px' });
  observer.observe(sculpture);
}
const sections = ['experience-work', 'platform-work', 'exploration'];
const descriptions = ['Experiences that connect people and places.', 'The systems that help creators publish and visitors explore.', 'New possibilities for teams and museum experiences.'];
document.querySelectorAll('[data-shape]').forEach(button => {
  button.addEventListener('click', () => {
    const index = Number(button.dataset.shape);
    document.querySelectorAll('[data-shape]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.querySelector('#shape-description').textContent = descriptions[index];
    document.querySelectorAll('.is-highlighted').forEach(item => item.classList.remove('is-highlighted'));
    document.getElementById(sections[index])?.classList.add('is-highlighted');
    sculpture.dispatchEvent(new CustomEvent('shape-select', { detail: index }));
  });
});
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.tilt').forEach(element => {
    element.addEventListener('pointermove', event => {
      if (reduced.matches) return;
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      element.style.transform = `perspective(1200px) rotateX(${-y * 2}deg) rotateY(${x * 2}deg)`;
    });
    element.addEventListener('pointerleave', () => { element.style.transform = ''; });
  });
}
