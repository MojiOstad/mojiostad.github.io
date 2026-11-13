import test from 'node:test';
import assert from 'node:assert/strict';
import { arrivalState, arrivalCamera } from '../src/arrival-state.js';
test('entrance begins with identity only and ends at an interactive resting view', () => {
  assert.equal(arrivalState(0).opacity, 0);
  assert.equal(arrivalState(0).navigation, 0);
  assert.equal(arrivalState(0).ready, false);
  assert.equal(arrivalState(1).header, 1);
  assert.equal(arrivalState(1).room, 1);
  assert.equal(arrivalState(1).ready, true);
});
test('header docks before the room finishes; scroll can reverse without accumulated state', () => {
  assert.equal(arrivalState(.5).header, 1);
  assert.ok(arrivalState(.5).room < 1);
  const middle = arrivalState(.3); arrivalState(.9);
  assert.deepEqual(arrivalState(.3), middle);
  for (const p of [-1, 0, .2, .5, .8, 1, 2]) {
    const state = arrivalState(p);
    for (const key of ['header','room','opacity','navigation']) assert.ok(state[key] >= 0 && state[key] <= 1);
  }
});
test('camera preserves the existing final composition exactly and uses a bounded opening turn', () => {
  const end = arrivalCamera(1), start = arrivalCamera(0);
  for (const [key, expected] of Object.entries({x:8,y:8,z:14,zoom:1})) assert.ok(Math.abs(end[key]-expected)<1e-10);
  assert.equal(start.zoom, .55); assert.ok(start.y > end.y);
  const turn = Math.atan2(start.x,start.z)-Math.atan2(end.x,end.z);
  assert.ok(turn > 0 && turn < Math.PI/8);
});
