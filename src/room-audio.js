// Gesture-only audio: no ambient loop, autoplay, or third-party requests.
export function createRoomAudio({ contextFactory = () => new (window.AudioContext || window.webkitAudioContext)(), fetchAudio = () => fetch('/audio/duck-quack.mp3').then(response => { if (!response.ok) throw new Error('Quack unavailable'); return response.arrayBuffer(); }) } = {}) {
  let context, master, sample, bytes, enabled = true, disposed = false, generation = 0;
  const voices = new Set(), recent = new Map();
  function prepare() { bytes ??= fetchAudio().catch(() => null); return bytes; }
  function stop() { for (const voice of [...voices]) { try { voice.stop(); } catch {} } }
  function track(source, gain, end) {
    source.connect(gain); gain.connect(master); voices.add(source);
    source.onended = () => { voices.delete(source); source.disconnect(); gain.disconnect(); };
    source.start(); if (end) source.stop(end);
  }
  function tone(frequency, endFrequency, delay = 0, duration = .13, level = .12, type = 'sine') {
    const source = context.createOscillator(), gain = context.createGain(), start = context.currentTime + delay;
    source.type = type; source.frequency.setValueAtTime(frequency, start);
    source.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
    gain.gain.setValueAtTime(0, context.currentTime); gain.gain.setValueAtTime(.001, start);
    gain.gain.exponentialRampToValueAtTime(level, start + .012);
    gain.gain.exponentialRampToValueAtTime(.001, start + duration);
    track(source, gain, start + duration + .02);
  }
  function rustle() {
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * .14), context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3);
    const source = context.createBufferSource(), gain = context.createGain();
    source.buffer = buffer; gain.gain.value = .045; track(source, gain);
  }
  async function play(cue) {
    if (!enabled || disposed) return false;
    const request = generation;
    try {
      // Construct and resume synchronously within the click/tap handler.
      if (!context) { context = contextFactory(); master = context.createGain(); master.gain.value = .32; master.connect(context.destination); }
      await context.resume();
      if (!enabled || disposed || request !== generation) return false;
      const now = context.currentTime;
      if (now - (recent.get(cue) ?? -Infinity) < .1 || voices.size > 12) return true;
      recent.set(cue, now);
      if (cue === 'duck') {
        const data = await prepare();
        if (!data) throw new Error('Quack unavailable');
        sample ??= context.decodeAudioData(data.slice(0));
        const buffer = await sample;
        if (!enabled || disposed || request !== generation) return false;
        const source = context.createBufferSource(), gain = context.createGain();
        source.buffer = buffer; gain.gain.value = .8; track(source, gain);
      } else if (cue === 'portal') { tone(130, 520, 0, .48, .15); tone(260, 780, .08, .4, .06); }
      else if (cue === 'boot') { tone(330, 330); tone(495, 495, .13); tone(660, 660, .26, .18, .08); }
      else if (cue === 'on') tone(620, 880, 0, .1, .08);
      else if (cue === 'off') tone(620, 380, 0, .1, .07);
      else if (cue === 'headset') { tone(180, 1100, 0, .18, .05, 'triangle'); tone(760, 150, .12, .2, .06); }
      else if (cue === 'toolbox') { tone(180, 75, 0, .12, .16, 'triangle'); for (let i=0; i<4; i++) tone(900+i*230, 500+i*100, .12+i*.07, .1, .045); }
      else if (cue === 'tool') tone(520, 290, 0, .07, .06, 'triangle');
      else if (cue === 'grow') { rustle(); tone(460, 680, .05, .18, .045); }
      else rustle();
      return true;
    } catch { return false; }
  }
  return { prepare, play, setEnabled(value) { enabled = value; generation++; recent.clear(); if (!value) stop(); }, dispose() { if (disposed) return; disposed = true; generation++; stop(); master?.disconnect(); context?.close().catch(() => {}); } };
}
