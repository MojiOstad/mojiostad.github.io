import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createRoomLoop } from '../src/room-loop.js';
import { createToolbox, toggleToolbox, packTool, resetToolbox, updateToolbox } from '../src/room-toolbox.js';

function clock() {
  let time = 0, next = 0;
  const callbacks = new Map(), rendered = [];
  const loop = createRoomLoop(t => rendered.push(t), { now: () => time, request: cb => { callbacks.set(++next, cb); return next; }, cancel: id => callbacks.delete(id), fps: 30 });
  return { loop, callbacks, rendered, step(ms) { time += ms; const pending = [...callbacks.values()]; callbacks.clear(); pending.forEach(cb => cb(time)); } };
}
test('bounded rendering settles with no pending frame, then wakes on interaction', () => {
  const c = clock(); c.loop.wake(.1);
  for (let i = 0; i < 10; i++) c.step(20);
  assert.ok(c.rendered.length > 0 && c.rendered.length < 8);
  assert.equal(c.callbacks.size, 0);
  const before = c.rendered.length; c.step(1000); assert.equal(c.rendered.length, before);
  c.loop.wake(.1); c.step(20); assert.ok(c.rendered.length > before);
});
test('hidden/offscreen state cancels frames and teardown prevents restarts', () => {
  const c = clock(); c.loop.wake(2); c.loop.setActive(false); c.step(200);
  assert.equal(c.rendered.length, 0); assert.equal(c.callbacks.size, 0);
  c.loop.wake(1); assert.equal(c.callbacks.size, 0);
  c.loop.setActive(true); c.loop.wake(.1); c.step(40); assert.equal(c.rendered.length, 1);
  c.loop.dispose(); c.loop.wake(1); assert.equal(c.callbacks.size, 0);
});
function toolbox() {
  const scene = new THREE.Scene();
  const api = { scene, object() { const g = new THREE.Group(); scene.add(g); return g; }, material: (color, rest) => new THREE.MeshStandardMaterial({ color, ...rest }), canvasTexture: () => new THREE.Texture(), textureLoader: { load: () => new THREE.Texture() },
    box(parent, size, pos, material) { const m = new THREE.Mesh(new THREE.BoxGeometry(...size), material); m.position.set(...pos); parent.add(m); return m; },
    mesh(parent, geo, material, pos = [0,0,0]) { const m = new THREE.Mesh(geo, material); m.position.set(...pos); parent.add(m); return m; },
  };
  return { scene, state: createToolbox(api) };
}
test('all eleven tools can be stored, closed, and re-ejected without losing stored identities', () => {
  const { scene, state } = toolbox();
  assert.equal(state.tokens.length, 11);
  toggleToolbox(state, scene, 0);
  for (const token of state.tokens) assert.equal(packTool(state, token), true, token.name);
  for (let i = 0; i < 120; i++) updateToolbox(state, 1/30, i/30, true);
  assert.equal(state.tokens.filter(t => t.phase === 'packed').length, 11);
  assert.equal(toggleToolbox(state, scene, 4), false);
  for (let i = 0; i < 60; i++) updateToolbox(state, 1/30, 4+i/30, true);
  assert.equal(toggleToolbox(state, scene, 6), true);
  assert.equal(state.tokens.filter(t => t.phase === 'queued').length, 11);
  assert.equal(new Set(state.tokens.map(t => t.group)).size, 11);
  resetToolbox(state); assert.ok(state.tokens.every(t => t.phase === 'hidden' && !t.group.visible));
});

test('unavailable WebGL aborts cleanly before replacing the readable HTML fallback', async () => {
  const { mountRoom } = await import('../src/exhibition-room.js');
  const previous = { document: globalThis.document, matchMedia: globalThis.matchMedia, error: console.error };
  let replaced = false;
  const host = { getAttribute: () => 'false', replaceChildren: () => { replaced = true; } };
  globalThis.document = { querySelector: () => host, createElementNS: () => { throw new Error('WebGL unavailable'); } };
  globalThis.matchMedia = () => ({ matches: false });
  console.error = () => {};
  try { assert.throws(() => mountRoom(), /WebGL unavailable/); assert.equal(replaced, false); }
  finally { globalThis.document = previous.document; globalThis.matchMedia = previous.matchMedia; console.error = previous.error; }
});
