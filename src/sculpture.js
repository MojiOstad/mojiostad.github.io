import * as THREE from 'three';

export function mountSculpture(host) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); } catch { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setClearColor(0x161819, 0);
  host.append(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.querySelector('.sculpture-fallback').hidden = true;
  host.querySelector('.sculpture-fallback').style.display = 'none';
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 100);
  camera.position.set(0, 0, 8.8);
  scene.add(new THREE.HemisphereLight(0xeaf3ff, 0x222b36, 2.6));
  const light = new THREE.DirectionalLight(0xffffff, 4); light.position.set(-3, 5, 6); scene.add(light);
  const fill = new THREE.DirectionalLight(0x8faeff, 2); fill.position.set(4, -1, 2); scene.add(fill);
  const group = new THREE.Group(); scene.add(group);
  const material = new THREE.MeshStandardMaterial({ color: 0x94b7e6, roughness: .32, metalness: .5 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.72, .22, 28, 80), material);
  const cube = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.25, 1.25), new THREE.MeshStandardMaterial({ color: 0x919da8, roughness: .38, metalness: .7 }));
  const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(.75, 1), new THREE.MeshStandardMaterial({ color: 0x688fbd, roughness: .52, metalness: .3, flatShading: true }));
  const meshes = [ring, cube, orb]; meshes.forEach(mesh => group.add(mesh));
  ring.position.set(-1.1, .55, .3); ring.rotation.set(.4, -.3, -.4);
  cube.position.set(.8, .2, -.4); cube.rotation.set(.5, .6, .2);
  orb.position.set(-.1, -1, .4); orb.rotation.set(.4, .1, .3);
  const originals = meshes.map(mesh => mesh.position.clone());
  let selected = 0, targetX = 0, targetY = 0, frame = 0, visible = true, dirty = true, dead = false;
  const render = () => {
    frame = 0;
    if (dead || !visible || document.hidden) return;
    group.rotation.x += (targetX - group.rotation.x) * .09;
    group.rotation.y += (targetY - group.rotation.y) * .09;
    let settling = Math.abs(targetX - group.rotation.x) + Math.abs(targetY - group.rotation.y) > .001;
    meshes.forEach((mesh, index) => {
      const goal = originals[index].clone();
      if (selected === index) goal.z += .55;
      mesh.position.lerp(goal, .09);
      const size = index === selected ? 1.08 : .93;
      mesh.scale.lerp(new THREE.Vector3(size, size, size), .09);
      settling ||= mesh.position.distanceTo(goal) > .001 || Math.abs(mesh.scale.x - size) > .001;
    });
    renderer.render(scene, camera); dirty = false;
    if (settling && !reduced.matches) frame = requestAnimationFrame(render);
  };
  const request = () => { dirty = true; if (!frame && visible && !document.hidden && !dead) frame = requestAnimationFrame(render); };
  const resize = new ResizeObserver(() => {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix(); request();
  }); resize.observe(host);
  const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible && dirty) request(); else if (!visible) { cancelAnimationFrame(frame); frame = 0; dirty = true; } }); intersection.observe(host);
  const move = event => { if (reduced.matches || event.pointerType === 'touch') return; const box = host.getBoundingClientRect(); targetY = ((event.clientX - box.left) / box.width - .5) * .35; targetX = ((event.clientY - box.top) / box.height - .5) * .2; request(); };
  const leave = () => { targetX = targetY = 0; request(); };
  const choose = event => { selected = event.detail; request(); };
  const visibility = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; dirty = true; } else request(); };
  const motion = () => { targetX = targetY = 0; request(); };
  host.addEventListener('pointermove', move); host.addEventListener('pointerleave', leave); host.addEventListener('shape-select', choose);
  document.addEventListener('visibilitychange', visibility); reduced.addEventListener('change', motion);
  const raycaster = new THREE.Raycaster();
  host.addEventListener('click', event => {
    const box = host.getBoundingClientRect();
    raycaster.setFromCamera(new THREE.Vector2((event.clientX - box.left) / box.width * 2 - 1, -(event.clientY - box.top) / box.height * 2 + 1), camera);
    const hit = raycaster.intersectObjects(meshes)[0];
    if (hit) document.querySelector(`[data-shape="${meshes.indexOf(hit.object)}"]`)?.click();
  });
  window.addEventListener('pagehide', event => {
    if (event.persisted) return;
    dead = true; cancelAnimationFrame(frame); resize.disconnect(); intersection.disconnect();
    document.removeEventListener('visibilitychange', visibility); reduced.removeEventListener('change', motion);
    meshes.forEach(mesh => { mesh.geometry.dispose(); mesh.material.dispose(); }); renderer.dispose();
  });
  request();
}
