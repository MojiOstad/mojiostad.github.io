import * as THREE from 'three';
import { createRoomProps, updateRoomProps, plantAction, toggleDevice, spillTools } from './room-props.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { pickUpTool, packTool, dropTool } from './room-toolbox.js';
import { createCarpet } from './room-carpet.js';
import { createCloth, grabCloth, moveClothGrab, releaseCloth, nudgeCloth, resetCloth, stepCloth, clothCovers } from './room-cloth.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const host = document.querySelector('#scene');
const hint = document.querySelector('#hint');
const tooltip = document.querySelector('#tooltip');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const stories = {
  portal: ['Through the portal', 'My work at Wintor began with Unity development and experience design. I help connect museum stories with visitors through AR and location-based experiences. The view here is an existing photograph of Wintor at Portlantis.', [['Wintor', '/work/wintor/'], ['Amsterdam in Motion', '/work/amsterdam-in-motion/'], ['Marinemuseum', '/work/marinemuseum/']]],
  server: ['Behind the experience', 'From early 2026, my work at Wintor expanded into backend and web development, live production analytics, support, and infrastructure. I’m continuing to learn Azure alongside this work.', [['Explore Wintor', '/work/wintor/']]],
  carpet: ['A little piece of home', 'I’m from Iran. A Persian carpet belongs in this room. Move the carpet to find a few keepsakes from earlier chapters.', []],
  laptop: ['A toolkit that keeps growing', 'My background is in games and Unity. Today I also work across web and backend systems. Unity and C# belong in my toolkit; Azure is part of my ongoing learning.', []],
  community: ['Making things together', 'A keepsake from Global Game Jam Groningen. I previously volunteered and helped organize the site. I’m no longer part of its organization, but it remains part of my story.', [['Global Game Jam Groningen', 'https://globalgamejamgroningen.nl/']]],
  desktop: ['The workbench', 'A place for building, trying, and making things work. Click the computer again to restart it.', []],
  duck: ['A patient listener', 'Some problems make more sense when you explain them to a duck.', []],
  headset: ['Another reality', 'VR is part of my ongoing exploration. A small shift in perspective can change the whole room.', []],
  phone: ['A small screen', 'Click to wake the phone, and click again to let it sleep.', []],
  tablet: ['Another way to explore', 'Click to turn the tablet screen on or off.', []],
  plant: ['A little care', 'Click the leaves to let one go. Click the pot to grow them back.', []],
  plant2: ['Room to grow', 'Click the leaves to let one go. Click the pot to grow them back.', []],
  toolbox: ['A toolkit that keeps growing', 'Svelte, Azure, Unity, Codex, Python, Plesk, C#, Git, GitHub Actions, Vite, and npm. Open the trays and see what spills out.', []],
  chair: ['Take a seat', 'A small turn, a different view.', []],
  shosho: ['Shosho', 'One of my current work connections: Shosho, working across film, animation, interaction, and design.', [['Visit Shosho', 'https://www.shosho.nl/']]],
  wintor: ['Wintor', 'I work across experience design, Unity, web and backend development at Wintor, helping creators publish stories and visitors explore them.', [['Visit Wintor', 'https://www.wintor.com/']]],
  book: ['A page for an idea', 'A notebook for thoughts that haven’t found their shape yet. ', [['Write an email', 'mailto:moji.ostad@gmail.com'], ['LinkedIn', 'https://www.linkedin.com/in/mojiohz/']]],
};
const names = { desktop:'Desktop', duck:'duck', headset:'VR', phone:'AR app', tablet:'AR app', plant:null, plant2:null, toolbox:'Tools', chair:'Chair', portal:'XR', server:null, carpet:'Iran', laptop:'Laptop', community:'GGJG', book:'Contact', shosho:'Shosho', wintor:'Wintor' };
const objects = new Map();
let renderer, scene, camera, hovered = null, selected = null, dragging = false;
let pointerStart = null, hiddenFound = false, elapsed = 0, bookTarget = 0, bookTurn = 0;
const pointer = new THREE.Vector2(9, 9), ray = new THREE.Raycaster();
ray.params.Line.threshold = .025;
let portalPhoto, bookTimer;
let props, composer, glitchPass, portalInner, closedWave, serverLight, portalLight, laptopScreen, laptopLight;
let portalOpen = false, portalAmount = 0, serverBoot = -Infinity, laptopBoot = -Infinity, desktopBoot = -Infinity;
let soundEnabled = true, audio, clothSim;
const dragPlane = new THREE.Plane(new THREE.Vector3(0,1,0),-.06), dragPoint = new THREE.Vector3(), dragOffset = new THREE.Vector3();
let lastRevealCheck = -10;
const projectIcons = [];
let heldTool=null;
const toolDragPlane=new THREE.Plane(),toolDragPoint=new THREE.Vector3(),toolDragOffset=new THREE.Vector3();
const textureLoader = new THREE.TextureLoader();
const colors = { ivory: 0xe7d7b8, wood: 0x795039, dark: 0x24262a, blue: 0x75c8ee, copper: 0xa75d3b };

function material(color, options = {}) { return new THREE.MeshStandardMaterial({ color, roughness: .78, ...options }); }
function box(parent, size, position, mat, radius = .025) {
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(...size, 2, radius), mat);
  mesh.position.set(...position); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
function mesh(parent, geo, mat, pos = [0, 0, 0]) {
  const m = new THREE.Mesh(geo, mat); m.position.set(...pos); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
function object(id, position, rotation = 0) {
  const group = new THREE.Group(); group.position.set(...position); group.rotation.y = rotation; scene.add(group);
  group.userData.id = id;
  const entry = { id, group, discovered: false, amount: 0, materials: [] }; objects.set(id, entry); return group;
}
function light(parent, color, power, distance, position) { const l = new THREE.PointLight(color, power, distance, 2); l.position.set(...position); parent.add(l); return l; }
function canvasTexture(width, height, draw) {
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  draw(canvas.getContext('2d'), width, height); const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4; return texture;
}

let leds = [], portalImage, portalRing, laptopLid, bookPages, turningPage, carpetModel, gameIcon, oldProjectIcon;
function build() {
  scene = new THREE.Scene(); scene.background = new THREE.Color('#2b2926');
  camera = new THREE.OrthographicCamera(-7.5, 7.5, 4.5, -4.5, .1, 80); camera.position.set(8, 8, 14); camera.lookAt(0, 1, 0);
  scene.add(new THREE.HemisphereLight(0xe8e1d4, 0x36302a, 1.65));
  const bounce = new THREE.DirectionalLight(0xb5c9d3, 1.1); bounce.position.set(6, 4, 10); scene.add(bounce);
  const fill = new THREE.DirectionalLight(0xffdfb0, 2.3); fill.position.set(-3, 9, 7); fill.castShadow = true; fill.shadow.mapSize.set(2048, 2048); fill.shadow.camera.left = -8; fill.shadow.camera.right = 8; fill.shadow.camera.top = 7; fill.shadow.camera.bottom = -7; fill.shadow.normalBias = .035; fill.shadow.bias = -.0003; fill.shadow.radius = 4; scene.add(fill);
  const floorMat = material(0x423b32), wallMat = material(0x39352f);
  box(scene, [10.7, .2, 6.7], [0, -.1, .1], floorMat, .06);
  box(scene, [10.7, 3.65, .16], [0, 1.65, -3.15], wallMat, .03);
  box(scene, [.16, 3.65, 6.7], [-5.28, 1.65, .1], material(0x302e2a), .03);
  box(scene, [10.45, .13, .05], [0, .065, -3.04], material(0x68513b));
  box(scene, [.05, .13, 6.5], [-5.17, .065, .1], material(0x68513b));
  const timber = canvasTexture(512, 512, (c, w, h) => {
    c.fillStyle = '#544737'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 130; i++) { const x = i * 4; c.strokeStyle = i % 3 ? '#5c4e3d' : '#483d31'; c.lineWidth = .6; c.beginPath(); c.moveTo(x, 0); c.bezierCurveTo(x + 9, h / 3, x - 7, h * .7, x, h); c.stroke(); }
  });
  for (let x = 0; x < 12; x++) for (let z = 0; z < 3; z++) box(scene, [.876, .015, 2.205], [-4.85 + x * .882, .008, -2.1 + z * 2.22], material(0xffffff, { map: timber, roughness: .87 }), .003);
  const cablePath = new THREE.CatmullRomCurve3([new THREE.Vector3(-4.12, .07, -2.5), new THREE.Vector3(-4.85, .05, -2.6), new THREE.Vector3(-4.94, .05, -.8), new THREE.Vector3(-4.3, .05, .3)]);
  mesh(scene, new THREE.TubeGeometry(cablePath, 35, .018, 5, false), material(0x20201e));
  // Server, naturally angled into the room.
  const server = object('server', [-4.12, 0, -2.28], .08);
  box(server, [1.5, .16, 1.2], [0, .09, 0], material(0x37332d));
  box(server, [1.18, 2.55, .95], [0, 1.45, 0], material(0x292c30, { metalness: .55 }));
  box(server, [1.02, 2.35, .03], [0, 1.45, .49], material(0x11151a));
  for (let row = 0; row < 8; row++) {
    const y = .47 + row * .28;
    box(server, [.93, .23, .055], [0, y, .53], material(0x3c4145, { metalness: .55 }), .01);
    for (let vent = 0; vent < 6; vent++) box(server, [.035, .09, .012], [-.34 + vent * .075, y, .565], material(0x15191b), .004);
    for (let col = 0; col < 3; col++) {
      const bulbMat = material(col === 0 ? 0xafd1c0 : 0xe5b866, { emissive: col === 0 ? 0x85c7af : 0xffad44, emissiveIntensity: .8 });
      const bulb = mesh(server, new THREE.SphereGeometry(.018, 8, 6), bulbMat, [.19 + col * .08, y, .58]); leds.push(bulb);
    }
  }
  serverLight = light(server, 0xe9b575, 0, 3, [.4, 1.2, .9]);
  // Wall portal: one coherent oval opening, with an existing project photo.
  const portal = object('portal', [3.35, 1.82, -2.92], .18);
  const ringGeo = new THREE.TorusGeometry(1, .033, 12, 100);
  portalRing = mesh(portal, ringGeo, material(colors.blue, { emissive: colors.blue, emissiveIntensity: 2 })); portalRing.scale.set(.92, 1.5, 1);
  portalInner = mesh(portal, new THREE.CircleGeometry(1, 96), material(0x131e24)); portalInner.scale.set(.91, 1.48, 1); portalInner.position.z = -.02;
  const photo = textureLoader.load('/images/wintor-portlantis.jpg',texture=>THREE.TextureUtils.cover(texture,.89/1.46)); photo.colorSpace = THREE.SRGBColorSpace;portalPhoto=photo;
  portalImage = mesh(portal, new THREE.CircleGeometry(1, 96), new THREE.MeshBasicMaterial({ map: photo, transparent: true, opacity: 0 })); portalImage.scale.set(.89, 1.46, 1); portalImage.position.z = .005;
  portalLight = light(portal, colors.blue, 0, 5, [0, -.6, .6]);
  closedWave = new THREE.Group(); portal.add(closedWave);
  for (let strand = 0; strand < 3; strand++) {
    const vertices = new Float32Array(81 * 3);
    for (let i = 0; i <= 80; i++) { vertices[i * 3 + 1] = (i / 80 - .5) * 2.6; vertices[i * 3 + 2] = .05 + strand * .008; }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3).setUsage(THREE.DynamicDrawUsage));
    closedWave.add(new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: new THREE.Color(0x79cfe6).multiplyScalar(strand ? .75 : 2.3), transparent: true })));
  }
  mesh(portal, new THREE.PlaneGeometry(1.9, 3), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }), [0, 0, .08]);
  // A movable woven carpet sits above fixed keepsakes on the floor.
  const carpet = object('carpet', [.25, .026, .9], -.09);
  carpetModel = createCarpet(carpet, canvasTexture);
  clothSim = createCloth(carpetModel,carpet);
  gameIcon = object('community', [0, 0, 0]); scene.remove(gameIcon); carpet.add(gameIcon); gameIcon.position.set(2.14, -.005, 1.23);
  box(gameIcon, [.52, .018, .68], [0, 0, 0], material(0xe4d9c1), .02);
  const ggjgLogo = textureLoader.load('/room/ggjg.png'); ggjgLogo.colorSpace = THREE.SRGBColorSpace;
  const logo = mesh(gameIcon, new THREE.PlaneGeometry(.44, .58), new THREE.MeshBasicMaterial({ map: ggjgLogo, transparent: true })); logo.rotation.x = -Math.PI / 2; logo.position.y = .012;
  oldProjectIcon = new THREE.Group(); oldProjectIcon.position.set(-2.12, -.005, 1.22); carpet.add(oldProjectIcon); oldProjectIcon.userData.secret = 'glass-garden';
  box(oldProjectIcon, [.5, .018, .36], [0, 0, 0], material(0xd0c0a0), .018);
  const oldPhoto = textureLoader.load('/room/glass-garden.png'); oldPhoto.colorSpace = THREE.SRGBColorSpace;
  const icon = mesh(oldProjectIcon, new THREE.PlaneGeometry(.44, .29), new THREE.MeshBasicMaterial({ map: oldPhoto })); icon.rotation.x = -Math.PI / 2; icon.position.y = .012;
  projectIcons.push({group:oldProjectIcon,key:'glass-garden',title:'Glass Garden',text:'An older plant-growing game, exploring care and management.'});
  for(const [key,x,file,title,text] of [
    ['northern-farm',-.65,'northern-farm.png','Northern Farm','Earlier work on game systems, social features, and live operations.'],
    ['tactics',.65,'tactics.png','Tactics','An earlier strategy prototype combining cards and base defense. Unreleased.']
  ]){
    const tile=new THREE.Group();tile.position.set(x,-.005,1.22);tile.userData.secret=key;carpet.add(tile);
    box(tile,[.47,.018,.39],[0,0,0],material(0xd0c0a0),.018);
    const texture=textureLoader.load(`/room/${file}`);texture.colorSpace=THREE.SRGBColorSpace;
    const image=mesh(tile,new THREE.PlaneGeometry(.4,.32),new THREE.MeshBasicMaterial({map:texture}));image.rotation.x=-Math.PI/2;image.position.y=.012;
    projectIcons.push({group:tile,key,title,text});
  }
  // Desk and its objects are positioned together, with the toolbox beneath it.
  const desk = new THREE.Group(); desk.position.set(-3.9, 0, .63); desk.rotation.y = 1.64; scene.add(desk);
  box(desk, [3.3, .12, 1.5], [0, 1.35, 0], material(colors.wood));
  for (const x of [-1.42, 1.42]) for (const z of [-.59, .59]) box(desk, [.095, 1.3, .095], [x, .65, z], material(0x61422f));
  box(desk, [3, .19, .1], [0, 1.17, -.39], material(0x68442f));
  const laptop = object('laptop', [0, 0, 0]); scene.remove(laptop); desk.add(laptop); laptop.position.set(1.04, 1.43, -.12); laptop.rotation.y = -.2; laptop.scale.setScalar(.72);
  box(laptop, [.99, .045, .67], [0, 0, 0], material(0x757774, { metalness: .7 }));
  laptopLid = new THREE.Group(); laptopLid.position.set(0, 0, -.28); laptopLid.rotation.x = -.2; laptop.add(laptopLid);
  box(laptopLid, [1, .65, .035], [0, .325, 0], material(0x757774, { metalness: .65 }));
  laptopScreen = box(laptopLid, [.89, .53, .008], [0, .325, -.023], material(0x8fb9c4, { emissive: 0x7cbbda, emissiveIntensity: 1.1 }));
  laptopLight = light(laptop, 0xaacddd, 0, 3, [0, .65, -.4]);
  const unityTexture = textureLoader.load('/room/unity.png'); unityTexture.colorSpace = THREE.SRGBColorSpace;
  mesh(laptopLid, new THREE.PlaneGeometry(.18, .18), new THREE.MeshBasicMaterial({ map: unityTexture, transparent: true, side: THREE.DoubleSide }), [-.25, .39, .023]);
  const sticker = canvasTexture(256, 128, c => { c.fillStyle = '#e2d6be'; c.beginPath(); c.roundRect(0, 0, 256, 128, 20); c.fill(); c.fillStyle = '#37362f'; c.font = 'bold 70px sans-serif'; c.textAlign = 'center'; c.fillText('C#', 128, 89); });
  mesh(laptopLid, new THREE.PlaneGeometry(.22, .11), new THREE.MeshBasicMaterial({ map: sticker, transparent: true }), [.19, .43, .023]);
  const blueSticker = mesh(laptopLid, new THREE.CircleGeometry(.075, 3), material(0x5eadd9), [.18, .22, .024]); blueSticker.rotation.z = .2;
  const book = object('book', [0, 0, 0]); scene.remove(book); desk.add(book); book.position.set(-1.19, 1.44, .34); book.rotation.y = -.18; book.scale.setScalar(.9);
  box(book, [.67, .035, .48], [0, 0, 0], material(0x76452e));
  bookPages = new THREE.Group(); book.add(bookPages);
  for (const x of [-.16, .16]) { const page = box(bookPages, [.31, .035, .44], [x, .028, 0], material(colors.ivory, { emissive: 0xbca178, emissiveIntensity: .12 }), .01); page.rotation.z = x < 0 ? -.07 : .07; }
  for (let i = 0; i < 6; i++) box(bookPages, [.2, .002, .005], [.16, .05, -.14 + i * .05], material(0xa99b82), .001);
  turningPage = new THREE.Group(); turningPage.position.set(0, .067, 0); bookPages.add(turningPage);
  box(turningPage, [.3, .006, .43], [.155, 0, 0], material(0xeee1c7, { side: THREE.DoubleSide }), .004);
  for (let i = 0; i < 5; i++) box(turningPage, [.19, .002, .004], [.155, .004, -.13 + i * .05], material(0xb0a18a), .001);
  light(book, 0xffd193, .18, 3, [0, .3, 0]);
  props = createRoomProps({ scene, object, box, mesh, material, light, canvasTexture }, desk);
  // Official logo artwork sits directly on the back wall, without plaques.
  for (const [id, x, width, height, color] of [['shosho', -1.35, 1.65, .36, 0xe8dbc3], ['wintor', .9, 1.62, .7, 0xffffff]]) {
    const brand = object(id, [x, 2.47, -3.035]);
    const logoTexture = textureLoader.load(`/room/${id}.png`); logoTexture.colorSpace = THREE.SRGBColorSpace;
    const tint = id === 'shosho' ? new THREE.Color(2.6, .38, .55) : new THREE.Color(.25, 1.8, 2.8);
    const logoMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, map: logoTexture, transparent: true });
    logoMaterial.onBeforeCompile = shader => {
      shader.uniforms.neonTint = { value: tint };
      shader.fragmentShader = 'uniform vec3 neonTint;\n' + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\ndiffuseColor.rgb = neonTint;');
    };
    logoMaterial.customProgramCacheKey = () => `neon-${id}`;
    mesh(brand, new THREE.PlaneGeometry(width, height), logoMaterial);
    light(brand, id === 'shosho' ? 0xee647c : 0x61c7e7, 3.5, 3, [0, -.2, .35]);
  }
  // Capture each object's own materials. Silhouette masking preserves geometry and light.
  objects.forEach(entry => {
    entry.group.traverse(child => {
      if ((!child.isMesh && !child.isLineSegments) || child === portalImage) return;
      let owner = child; while (owner && !owner.userData.id) owner = owner.parent;
      if (owner !== entry.group) return;
      const capture = original => {
        const mat = original.clone(); mat.onBeforeCompile = original.onBeforeCompile; mat.customProgramCacheKey = original.customProgramCacheKey;
        entry.materials.push({ mat, color: mat.color.clone(), map: mat.map, emission: mat.emissiveIntensity ?? 0 }); return mat;
      };
      child.material = Array.isArray(child.material) ? child.material.map(capture) : capture(child.material);
    });
  });
  // The carpet icon must stay a reward under the cloth, not a floating label.
  gameIcon.visible = true; projectIcons.forEach(p=>p.group.visible=true);
  for (const id of ['shosho', 'wintor']) { objects.get(id).discovered = true; objects.get(id).amount = 1; }
  const toolList=document.querySelector('#tool-list');
  props.tokens.forEach(token=>{const button=document.createElement('button');button.textContent=token.name;button.addEventListener('click',()=>showTool(token));toolList.append(button);});
  updateCount();
}

function showStory(id) {
  const entry = objects.get(id); if (entry) entry.discovered = true; selected = id;

  document.querySelector('#story-title').textContent = stories[id][0];
  document.querySelector('#story-text').textContent = stories[id][1];
  const actions = document.querySelector('#story-actions'); actions.replaceChildren();
  for (const [label, url] of stories[id][2]) { const a = document.createElement('a'); a.textContent = label; a.href = url; actions.append(a); }
  if (id === 'carpet') {
    for (const [label,dx,dz] of [['Slide left',-.85,0],['Slide right',.85,0],['Slide back',0,-1],['Slide forward',0,1]]) {
      const b=document.createElement('button');b.textContent=label;b.addEventListener('click',()=>nudgeCloth(clothSim,dx,dz));actions.append(b);
    }
    const reset=document.createElement('button');reset.textContent='Lay carpet flat';reset.addEventListener('click',()=>resetCloth(clothSim));actions.append(reset);
  }
  if (id === 'book') { const turn = document.createElement('button'); turn.textContent = 'Open contact'; turn.addEventListener('click', turnNotebook); actions.prepend(turn); }

  hint.textContent = id === 'carpet' ? 'Grab anywhere on the carpet and drag it across the floor. Let go to let it settle.' : 'Discovered. Move over the object to see it come to life.';
  updateCount();
}
function showTool(token){
  document.querySelector('#story-title').textContent=token.name;
  document.querySelector('#story-text').textContent=token.note+' Drag the icon to pick it up; drop it over an open tray to put it back.';
  const actions=document.querySelector('#story-actions');actions.replaceChildren();
  const put=document.createElement('button');put.textContent='Put in toolbox';
  put.addEventListener('click',()=>{
    if(!props.toolboxOpen)spillTools(props,elapsed);
    token.group.visible=true;packTool(props.toolboxState,token);hint.textContent=token.name+' is back in the toolbox.';
  });actions.append(put);
  const take=document.createElement('button');take.textContent='Take out';take.addEventListener('click',()=>{
    token.group.visible=true;
    if(token.phase==='hidden'){scene.attach(token.group);token.group.position.copy(props.toolbox.localToWorld(new THREE.Vector3(0,.7,0)));}
    pickUpTool(props.toolboxState,scene,token);token.phase='flying';token.bounces=0;token.velocity.set(.8,1,.3);hint.textContent=token.name+' is out of the box.';
  });actions.append(take);
}
function showContact(){
  const section=document.querySelector('#contact'),heading=document.querySelector('#contact-title');
  section.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});
  heading.focus({preventScroll:true});history.replaceState(null,'','#contact');
}
function turnNotebook(){
  bookTarget=1;clearTimeout(bookTimer);bookTimer=setTimeout(showContact,reduced.matches?0:450);
}
async function quack() {
  if (!soundEnabled) return;
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    await audio.resume();
    const time=audio.currentTime;
    for (let i=0;i<2;i++) {
      const oscillator=audio.createOscillator(), filter=audio.createBiquadFilter(), gain=audio.createGain(), start=time+i*.13;
      oscillator.type='sawtooth';oscillator.frequency.setValueAtTime(430-i*35,start);oscillator.frequency.exponentialRampToValueAtTime(230,start+.13);
      filter.type='bandpass';filter.frequency.value=1050;filter.Q.value=2.2;
      gain.gain.setValueAtTime(.001,start);gain.gain.exponentialRampToValueAtTime(.09,start+.02);gain.gain.exponentialRampToValueAtTime(.001,start+.15);
      oscillator.connect(filter);filter.connect(gain);gain.connect(audio.destination);oscillator.start(start);oscillator.stop(start+.17);
      oscillator.onended=()=>{oscillator.disconnect();filter.disconnect();gain.disconnect();};
    }
  } catch { hint.textContent='Quack! Sound isn’t available in this browser right now.'; }
}
function activate(id,part) {
  if (!stories[id]) return;
  showStory(id);
  if(id==='portal'){if(portalOpen){window.open('https://www.wintor.com/','_blank','noopener,noreferrer');hint.textContent='Through the portal to Wintor.';}else{portalOpen=true;hint.textContent='The portal is open. Click again to visit Wintor.';}}
  if(id==='server'){serverBoot=elapsed;hint.textContent='Power on. One light, then the rest. Click again to restart.';}
  if(id==='laptop'){laptopBoot=elapsed;hint.textContent='The laptop wakes up. Click it again to restart.';}
  if(id==='desktop'){desktopBoot=elapsed;hint.textContent='The desktop boots up. The monitor and tower come to life.';}
  if(id==='book'){turnNotebook();hint.textContent='Turn the page. Let’s get in touch.';}
  if(id==='duck'){props.duckAt=elapsed;quack();hint.textContent=soundEnabled?'Quack. Ready to listen.':'A quiet quack. Sound is muted.';}
  if(id==='headset'){props.glitchAt=elapsed;hint.textContent='Reality slipped for a moment.';}
  if(id==='chair'){props.chairAt=elapsed;hint.textContent='A little spin. Make yourself at home.';}
  if(id==='toolbox'){spillTools(props,elapsed);hint.textContent=props.toolboxOpen?'A little overpacked. Here come the tools.':'Tools packed away. Ready for another surprise.';}
  if(id==='phone'||id==='tablet'){const on=toggleDevice(props,id);hint.textContent=`${id==='phone'?'Phone':'Tablet'} screen ${on?'on':'off'}.`;}
  if(id==='plant'||id==='plant2')hint.textContent=plantAction(props,id,part==='pot'?'pot':'foliage');
  const actions=document.querySelector('#story-actions');
  const button=(label,handler)=>{const b=document.createElement('button');b.textContent=label;b.addEventListener('click',handler);actions.append(b);};
  if(['server','laptop','desktop'].includes(id))button('Restart',()=>activate(id));
  if(id==='portal'){const a=document.createElement('a');a.textContent='Visit Wintor';a.href='https://www.wintor.com/';a.target='_blank';a.rel='noopener noreferrer';actions.append(a);}
  if(id==='duck')button('Quack',()=>activate(id));
  if(id==='headset')button('Shift reality',()=>activate(id));
  if(id==='toolbox')button(props.toolboxOpen?'Close toolbox':'Open toolbox',()=>activate(id));
  if(id==='plant'||id==='plant2'){button('Let a leaf fall',()=>activate(id,'foliage'));button('Grow leaves back',()=>activate(id,'pot'));}
  if(id==='phone'||id==='tablet')button(props.devices.find(d=>d.id===id)?.on?'Turn screen off':'Turn screen on',()=>activate(id));
  document.querySelector('#reset').hidden=false;
}
function resetProps() {
  if(!props)return;
  props.glitchAt=props.duckAt=props.chairAt=-10;props.resetToolbox();heldTool=null;props.toolboxState.dropHint=false;
  props.devices.forEach(d=>d.on=false);props.tokens.forEach(t=>{t.phase='hidden';t.group.visible=false;});props.toolbox.rotation.z=0;
  props.plants.forEach(p=>p.leaves.forEach(l=>{l.phase='alive';l.progress=0;l.mesh.position.copy(l.home);l.mesh.rotation.copy(l.rotation);l.mesh.material.color.copy(l.color);l.mesh.scale.set(.14,.028,.32);l.stem.visible=true;}));
}
function updateCount() { document.querySelector('#count').textContent = `${[...objects.values()].filter(o => o.discovered).length} / ${objects.size} discovered`; }
function pick(event) {
  const rect = renderer.domElement.getBoundingClientRect(); pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1); ray.setFromCamera(pointer, camera);
  for (const hit of ray.intersectObjects([...objects.values()].map(o => o.group).concat(props.tokens.filter(t=>t.group.visible).map(t=>t.group)), true)) {
    let node = hit.object, secret = false, part = hit.object.userData.part;
    let visible = true; for (let ancestor = node; ancestor; ancestor = ancestor.parent) if (!ancestor.visible) visible = false;
    if (!visible) continue;
    while(node){
      if(node.userData.tool){const token=props.tokens.find(t=>t.id===node.userData.tool);return{id:'tool',token,hit};}
      if(node.userData.secret)secret=node.userData.secret;
      if(node.userData.id)return{id:node.userData.id,hit,secret,part};
      node=node.parent;
    }
  }
  return null;
}
function setHover(found,event){
  const id=found?.id??null;hovered=id;const entry=objects.get(id);
  host.style.cursor=id?(id==='tool'||id==='carpet'?'grab':'pointer'):'default';
  const project=found?.secret?projectIcons.find(item=>item.key===found.secret):null;
  const label=project?project.title:id==='tool'?found.token.name:entry?.discovered?names[id]:null;
  tooltip.hidden=!label;if(!label)return;
  tooltip.textContent=label;const rect=host.getBoundingClientRect();
  tooltip.style.left=`${Math.max(8,Math.min(event.clientX-rect.left+12,rect.width-tooltip.offsetWidth-8))}px`;
  tooltip.style.top=`${Math.max(8,event.clientY-rect.top-32)}px`;
}

try {
  renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
  renderer.domElement.setAttribute('aria-label', 'Interactive exhibition room. Use the object list below for keyboard exploration.'); renderer.domElement.setAttribute('role', 'img');
  host.replaceChildren(renderer.domElement); build();
  composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scene,camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(800,500),.32,.4,1.8));
  glitchPass = new ShaderPass({ uniforms: { tDiffuse: { value:null }, amount:{value:0}, time:{value:0} }, vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}', fragmentShader:'uniform sampler2D tDiffuse; uniform float amount; uniform float time; varying vec2 vUv; void main(){ float band=step(.76,sin(vUv.y*66.0+time*11.0));vec2 uv=vUv+vec2(sin(vUv.y*92.0+time*7.0)*amount*band,0.0);float r=texture2D(tDiffuse,uv+vec2(amount*.6,0.0)).r;float g=texture2D(tDiffuse,uv).g;float b=texture2D(tDiffuse,uv-vec2(amount*.6,0.0)).b;gl_FragColor=vec4(r,g,b,1.0);}' });
  composer.addPass(glitchPass); composer.addPass(new OutputPass());
  function resize() {
    const width = host.clientWidth, height = host.clientHeight, aspect = width / height;
    const vertical = Math.max(7.9, 13.2 / aspect); camera.left = -vertical * aspect / 2; camera.right = vertical * aspect / 2; camera.top = vertical / 2; camera.bottom = -vertical / 2;
    camera.updateProjectionMatrix(); renderer.setSize(width, height); composer.setSize(width,height);
  }
  new ResizeObserver(resize).observe(host); resize();
  const canvas = renderer.domElement;
  function floorPoint(event){
    const rect=canvas.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);
    return ray.ray.intersectPlane(dragPlane,dragPoint);
  }
  canvas.addEventListener('pointermove',event=>{
    if(heldTool){
      floorPoint(event);
      if(ray.ray.intersectPlane(toolDragPlane,toolDragPoint)){
        heldTool.group.position.copy(toolDragPoint).add(toolDragOffset);heldTool.group.position.y=THREE.MathUtils.clamp(heldTool.group.position.y,.12,3.3);heldTool.group.position.x=THREE.MathUtils.clamp(heldTool.group.position.x,-4.9,4.9);heldTool.group.position.z=THREE.MathUtils.clamp(heldTool.group.position.z,-2.95,3.2);
      }
      event.preventDefault();return;
    }
    if(dragging){if(floorPoint(event))moveClothGrab(clothSim,dragPoint.clone().add(dragOffset));event.preventDefault();return;}
    setHover(pick(event),event);
  });
  canvas.addEventListener('pointerdown',event=>{
    const found=pick(event);pointerStart={x:event.clientX,y:event.clientY,found};
    if(found?.token){
      heldTool=found.token;pickUpTool(props.toolboxState,scene,heldTool);showTool(heldTool);
      toolDragPlane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()),heldTool.group.position);
      floorPoint(event);ray.ray.intersectPlane(toolDragPlane,toolDragPoint);toolDragOffset.copy(heldTool.group.position).sub(toolDragPoint);toolDragOffset.y+=.08;
      props.toolboxState.dropHint=true;canvas.setPointerCapture(event.pointerId);host.style.cursor='grabbing';tooltip.hidden=true;hint.textContent='Drop the tool over an open tray to put it back.';return;
    }
    if(found?.id==='carpet'&&!found.secret){
      if(!floorPoint(event))return;
      dragOffset.copy(found.hit.point).sub(dragPoint);dragOffset.y=0;
      grabCloth(clothSim,found.hit.point);dragging=true;showStory('carpet');
      canvas.setPointerCapture(event.pointerId);host.style.cursor='grabbing';tooltip.hidden=true;
    }
  });
  function release(event) {
    if(heldTool){
      floorPoint(event);const name=heldTool.name,packed=dropTool(props.toolboxState,heldTool,ray.ray);heldTool=null;props.toolboxState.dropHint=false;
      if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);pointerStart=null;host.style.cursor='grab';hint.textContent=packed?name+' is back in the toolbox.':name+' settles onto the floor.';return;
    }
    if(dragging){dragging=false;releaseCloth(clothSim);if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);host.style.cursor='grab';pointerStart=null;return;}
    if (pointerStart && Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) < 8) {
      const found = pick(event);
      if(found?.secret){const project=projectIcons.find(p=>p.key===found.secret);if(project){document.querySelector('#story-title').textContent=project.title;document.querySelector('#story-text').textContent=project.text;document.querySelector('#story-actions').replaceChildren();}}
      else if (found?.id && ['shosho', 'wintor'].includes(found.id)) { showStory(found.id); window.open(stories[found.id][2][0][1], '_blank', 'noopener,noreferrer'); }
      else if (found?.id) activate(found.id, found.part);
    }
    pointerStart = null;
  }
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', () => { if(heldTool){dropTool(props.toolboxState,heldTool,null);heldTool=null;props.toolboxState.dropHint=false;}dragging=false;releaseCloth(clothSim);pointerStart=null; });
  canvas.addEventListener('pointerleave', () => { if (!dragging&&!heldTool) { hovered = null; tooltip.hidden = true; } });
  let inView = true; new IntersectionObserver(entries => { inView = entries[0].isIntersecting; }).observe(host);
  let previous = performance.now();
  renderer.setAnimationLoop(now => {
    if (document.hidden || !inView) { previous = now; return; }
    const dt = Math.min((now - previous) / 1000, .05); previous = now; elapsed += dt;
    // Natural resting materials remain visible; power is a separate state.
    const serverAge = elapsed - serverBoot, laptopAge = elapsed - laptopBoot, desktopAge = elapsed - desktopBoot;
    leds.forEach((led,i) => {
      let intensity = 0;
      if (Number.isFinite(serverBoot)) {
        if (serverAge < 2) intensity = reduced.matches ? .8 : i === 0 ? (Math.sin(serverAge*10)>0?2:.04) : serverAge > .45+i*.045 ? 1.6 : 0;
        else intensity = reduced.matches ? .7 : (Math.sin(elapsed*1.5+i*2.7)>.7?1.7:.18);
      }
      led.material.emissiveIntensity = intensity;
      led.material.color.setHex(intensity ? (i%3===0?0x8db9a2:0xc6a065) : 0x20282a);
    });
    serverLight.intensity = Number.isFinite(serverBoot) ? Math.min(1,serverAge/2)*1.7 : 0;
    const laptopPower = Number.isFinite(laptopBoot) ? laptopAge < 1.2 ? (reduced.matches?.5:Math.sin(laptopAge*9)>0?.6:.04) : 1 : 0;
    laptopScreen.material.emissiveIntensity = laptopPower*.8; laptopScreen.material.color.setHex(laptopPower?0x8bb5bb:0x141b20); laptopLight.intensity=laptopPower*2;
    const desktopPower = Number.isFinite(desktopBoot) ? desktopAge < 1.4 ? (reduced.matches?.5:Math.sin(desktopAge*8)>0?.7:.03) : 1 : 0;
    portalAmount = THREE.MathUtils.damp(portalAmount,portalOpen?1:0,reduced.matches?100:5,dt);
    portalRing.visible = portalInner.visible = portalImage.visible = portalAmount>.015;
    portalRing.scale.x=.92*portalAmount; portalInner.scale.x=.91*portalAmount; portalImage.scale.x=.89*portalAmount;
    portalImage.material.opacity=portalAmount*.95; portalRing.material.emissiveIntensity=1.5;
    if(portalPhoto?.image?.width)THREE.TextureUtils.cover(portalPhoto,Math.max(.001,.89*portalAmount/1.46));
    portalLight.intensity=portalAmount*6;closedWave.visible=portalAmount<.98;
    closedWave.children.forEach((line,strand)=>{const pos=line.geometry.attributes.position;for(let i=0;i<pos.count;i++){const y=(i/80-.5)*2.6;pos.setX(i,(reduced.matches?.045:Math.sin(y*7+elapsed*1.3+strand*.5)*.065+Math.sin(y*13-elapsed)*.023)*(1-portalAmount));}pos.needsUpdate=true;line.material.opacity=1-portalAmount;});
    updateRoomProps(props,dt,elapsed,hovered,reduced.matches,desktopPower);
    const glitchAge=elapsed-props.glitchAt;
    glitchPass.uniforms.amount.value = glitchAge<.85 ? (reduced.matches?.003:.018*(1-glitchAge/.85)) : 0;
    glitchPass.uniforms.time.value=reduced.matches?0:elapsed;
    if (!reduced.matches) {
      laptopLid.rotation.x = THREE.MathUtils.damp(laptopLid.rotation.x, hovered === 'laptop' ? -.32 : -.2, 6, dt);
      bookPages.rotation.z = THREE.MathUtils.damp(bookPages.rotation.z, hovered === 'book' ? .09 : 0, 5, dt);

    }
    bookTurn = THREE.MathUtils.damp(bookTurn, bookTarget, reduced.matches ? 100 : 5, dt);
    turningPage.rotation.z = bookTurn * Math.PI + (!reduced.matches && hovered === 'book' && !bookTarget ? .12 : 0);
    stepCloth(clothSim,dt);
    if(elapsed-lastRevealCheck>.15){
      lastRevealCheck=elapsed;
      const visible=!clothCovers(clothSim,gameIcon.getWorldPosition(new THREE.Vector3()));
      if(visible&&!objects.get('community').discovered){objects.get('community').discovered=true;updateCount();hint.textContent='GGJG — a keepsake from a past chapter.';}
      if(!hiddenFound&&projectIcons.some(p=>!clothCovers(clothSim,p.group.getWorldPosition(new THREE.Vector3())))){hiddenFound=true;hint.textContent='A few older projects were hiding underneath. Select an icon to explore.';}
    }
    composer.render();
  });
} catch (error) {
  console.error('Room could not open:', error);
  host.innerHTML = '<p class="loading">The 3D room could not open. You can explore every story using the object list below.</p>';
}
document.querySelectorAll('[data-object]').forEach(button => button.addEventListener('click', () => activate(button.dataset.object,button.dataset.part)));
document.querySelector('#work').addEventListener('click', () => { showStory('portal'); document.querySelector('.reading').scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'nearest' }); });
document.querySelector('#contact-trigger').addEventListener('click',event=>{event.preventDefault();showContact();});
document.querySelector('#reveal-all').addEventListener('click', () => { objects.forEach(o => o.discovered = true); portalOpen=true; serverBoot=laptopBoot=desktopBoot=elapsed; document.querySelector('#reset').hidden = false; hint.textContent = 'The room, revealed. Move over the objects. Try moving the carpet.'; updateCount(); });
document.querySelector('#reset').addEventListener('click', () => { clearTimeout(bookTimer);objects.forEach(o => o.discovered = ['shosho', 'wintor'].includes(o.id)); portalOpen=false;serverBoot=laptopBoot=desktopBoot=-Infinity;resetProps();resetCloth(clothSim);selected = null; hovered = null; bookTarget = 0; hiddenFound = false; tooltip.hidden = true; document.querySelector('#reset').hidden = true; document.querySelector('#story-title').textContent = 'A few objects. A few stories.'; document.querySelector('#story-text').textContent = 'A room for my work, where I come from, and the things that keep me curious.'; document.querySelector('#story-actions').replaceChildren(); hint.textContent = 'Some things are waiting to be discovered. Choose an object.'; updateCount(); });

document.querySelector('#sound').addEventListener('click',event=>{soundEnabled=!soundEnabled;event.currentTarget.textContent=soundEnabled?'Sound on':'Sound off';event.currentTarget.setAttribute('aria-pressed',String(soundEnabled));if(!soundEnabled&&audio)audio.suspend();});
