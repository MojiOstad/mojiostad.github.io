import test from 'node:test';
import assert from 'node:assert/strict';
import { createRoomAudio, DUCK_SAMPLES } from '../src/room-audio.js';
function harness(extra={}) {
  const sources=[],calls={contexts:0,decoded:0,closed:0};
  const param=()=>({value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}});
  const context={currentTime:1,destination:{},resume:async()=>{},close:async()=>{calls.closed++;},
    sampleRate:44100,createBuffer:(_,length)=>({getChannelData:()=>new Float32Array(length)}),
    createOscillator:()=>{const s={frequency:param(),connect(){},disconnect(){},start(){s.started=true;},stop(){s.stopped=true;}};sources.push(s);return s;},
    createGain:()=>({gain:param(),connect(){},disconnect(){}}),
    createBufferSource:()=>{const s={connect(){},disconnect(){},start(){s.started=true;},stop(){s.stopped=true;s.onended?.();}};sources.push(s);return s;},
    decodeAudioData:async data=>{calls.decoded++;return {duration:.38,id:new Uint8Array(data)[0]};},...extra};
  const audio=createRoomAudio({random:()=>0,contextFactory:()=>{calls.contexts++;return context;},fetchAudio:async url=>new Uint8Array([DUCK_SAMPLES.indexOf(url)]).buffer});
  return {audio,sources,calls,context};
}
test('preloading does not autoplay; recorded duck variations decode once per sample',async()=>{
  const h=harness();await h.audio.prepare();assert.equal(h.calls.contexts,0);
  assert.equal(await h.audio.play('duck'),true);assert.equal(h.sources[0].started,true);
  h.audio.setEnabled(false);assert.equal(h.sources[0].stopped,true);
  assert.equal(await h.audio.play('duck'),false);
  h.audio.setEnabled(true);await h.audio.play('duck');assert.equal(h.calls.decoded,2);
  h.audio.setEnabled(false);h.audio.setEnabled(true);await h.audio.play('duck');assert.equal(h.calls.decoded,2);
  h.audio.dispose();assert.equal(h.calls.closed,1);assert.equal(await h.audio.play('duck'),false);
});
test('muting cancels a duck waiting for sample decoding',async()=>{
  let resolveDecode;const h=harness({decodeAudioData:()=>new Promise(resolve=>{resolveDecode=resolve;})});
  const pending=h.audio.play('duck');
  for(let i=0;i<32&&!resolveDecode;i++)await Promise.resolve();
  assert.equal(typeof resolveDecode,'function');h.audio.setEnabled(false);resolveDecode({});
  assert.equal(await pending,false);assert.equal(h.sources.length,0);h.audio.dispose();
});
test('unavailable audio stays non-fatal and returns failure',async()=>{
  const audio=createRoomAudio({contextFactory:()=>{throw new Error('unsupported');}});
  assert.equal(await audio.play('duck'),false);audio.dispose();
});

test('every object cue creates short voices without starting ambient playback',async()=>{
  for(const cue of ['portal','boot','on','off','headset','toolbox','tool','grow','paper','cloth','leaf']) {
    const h=harness();assert.equal(h.sources.length,0);
    assert.equal(await h.audio.play(cue),true,cue);assert.ok(h.sources.length>0,cue);
    h.audio.setEnabled(false);assert.ok(h.sources.every(source=>source.stopped),cue);h.audio.dispose();
  }
});

test('each tap uses a real sample and consecutive duck taps never repeat',async()=>{
  const h=harness();
  for(let i=0;i<12;i++){h.context.currentTime+=.2;assert.equal(await h.audio.play('duck'),true);}
  const played=h.sources.filter(source=>source.buffer).map(source=>source.buffer.id);
  assert.equal(played.length,12);
  assert.ok(played.every((value,index)=>index===0||value!==played[index-1]));
  assert.ok(played.every(value=>value>=0&&value<DUCK_SAMPLES.length));
  h.audio.dispose();
});
