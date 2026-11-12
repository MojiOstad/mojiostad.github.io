import * as THREE from 'three';
import { createToolbox, toggleToolbox, updateToolbox, resetToolbox } from './room-toolbox.js';

// Playful props share the room's geometry, lighting and interaction registry.
export function createRoomProps(api, desk) {
  const { scene, object, box, mesh, material, light, canvasTexture } = api;
  const props = { plants: [], devices: [], tokens: [], toolboxAt: -10, screens: [], towerLights: [], duckAt: -10, glitchAt: -10, chairAt: -10, toolboxOpen: false };
  const dark = material(0x24282d, { roughness: .5, metalness: .35 });
  const fabric = material(0x292c30, { roughness: 1 });
  const pink = material(0xc15f65, { roughness: .6 });
  const code = canvasTexture(768, 448, (c,w,h) => {
    c.fillStyle = '#152226'; c.fillRect(0,0,w,h); c.fillStyle = '#25363b'; c.fillRect(0,0,w,38);
    for(let i=0;i<3;i++){c.fillStyle=['#d98072','#d6bd73','#77b898'][i];c.beginPath();c.arc(21+i*21,19,5,0,7);c.fill();}
    c.font='23px monospace'; const lines=['// a little room to play','const curiosity = true;','','function makeSomething() {','  explore();','  build();','  tryAgain();','}','','makeSomething();'];
    lines.forEach((line,i)=>{c.fillStyle=i===0?'#819a95':i%3?'#b8d6d1':'#deab88';c.fillText(line,33,83+i*31);});
  });
  const monitor = object('desktop',[0,0,0]); scene.remove(monitor); desk.add(monitor); monitor.position.set(-.3,1.43,-.27);
  box(monitor,[.62,.035,.35],[0,0,0],dark);box(monitor,[.075,.38,.07],[0,.2,-.025],dark);
  box(monitor,[1.42,.88,.065],[0,.78,0],dark,.04);
  const screen=mesh(monitor,new THREE.PlaneGeometry(1.31,.77),new THREE.MeshBasicMaterial({map:code,color:0x000000}),[0,.78,.038]);props.screens.push(screen);
  const screenLight=light(monitor,0x8ed7ce,0,3,[0,.6,.4]); props.screenLight=screenLight;
  // Keyboard, mouse and desk mat.
  box(desk,[1.5,.015,.55],[-.25,1.422,.31],material(0x303336),.025);
  box(monitor,[.85,.035,.29],[-.13,0,.6],material(0x464a4c));
  for(let row=0;row<4;row++)for(let col=0;col<12;col++)box(monitor,[.052,.014,.046],[-.49+col*.064,.025,.5+row*.065],material(0x77756c),.005);
  box(monitor,[.11,.055,.17],[.47,.025,.62],material(0x747b7b),.035);
  const tower=box(monitor,[.42,.69,.62],[.75,-.39,-.13],material(0x1f252b),.035);
  for(let i=0;i<2;i++){
    const ring=mesh(monitor,new THREE.TorusGeometry(.12,.012,8,32),material(0x59c9d7,{emissive:0x59c9d7,emissiveIntensity:0}),[.75,-.23-i*.28,.19]);props.towerLights.push(ring);
  }
  // Racing-style gaming chair with headrest, bolsters, arms and a five-spoke base.
  const chair=object('chair',[-2.45,0,.6],-1.5); props.chair=chair;
  box(chair,[.84,.17,.76],[0,.82,0],fabric,.08);
  const back=box(chair,[.76,1.18,.16],[0,1.4,-.34],fabric,.08);back.rotation.x=-.1;
  box(chair,[.49,.25,.18],[0,1.89,-.29],pink,.06);
  for(const x of [-.32,.32]){const bolster=box(chair,[.14,.86,.19],[x,1.43,-.24],pink,.06);bolster.rotation.z=x*.2;box(chair,[.11,.055,.54],[x*1.48,1.05,0],dark);box(chair,[.055,.25,.07],[x*1.45,.92,.1],dark);}
  mesh(chair,new THREE.CylinderGeometry(.055,.07,.43,12),material(0x6c7072,{metalness:.8}),[0,.49,0]);
  for(let i=0;i<5;i++){
    const a=i*Math.PI*2/5, leg=box(chair,[.08,.06,.47],[Math.sin(a)*.2,.26,Math.cos(a)*.2],dark);leg.rotation.y=a;
    const wheel=mesh(chair,new THREE.CylinderGeometry(.07,.07,.07,10),dark,[Math.sin(a)*.4,.18,Math.cos(a)*.4]);wheel.rotation.z=Math.PI/2;
  }
  const toolboxState=createToolbox(api);props.toolboxState=toolboxState;props.toolbox=toolboxState.root;props.tokens=toolboxState.tokens;
  props.resetToolbox=()=>{resetToolbox(toolboxState);props.toolboxOpen=false;};
  // A wall stand and a small abstract print bring the plant and duck off the floor.
  const stand=new THREE.Group();stand.position.set(-4.84,1.93,1.07);scene.add(stand);
  box(stand,[.73,.075,1.5],[0,0,0],material(0x896248));
  for(const z of [-.5,.5]){const bracket=box(stand,[.05,.36,.045],[-.18,-.18,z],dark);bracket.rotation.z=-.5;}
  const print=new THREE.Group();print.position.set(-5.12,2.82,1.07);print.rotation.y=Math.PI/2;scene.add(print);
  box(print,[1.08,.68,.035],[0,0,0],material(0x4c3b2f));box(print,[.97,.57,.012],[0,0,.024],material(0xd0bba0));
  mesh(print,new THREE.CircleGeometry(.18,40),material(0xb5684a),[-.16,.06,.034]);
  const arch=mesh(print,new THREE.RingGeometry(.11,.15,32,1,0,Math.PI),material(0x637f7c),[.19,-.14,.035]);

  // Rubber programming duck: squashed body, round head, beak, wings and eyes.
  const duck=object('duck',[-4.67,2.1,1.48],.8);props.duck=duck;
  const yellow=material(0xe8b94c,{roughness:.53});
  const body=mesh(duck,new THREE.SphereGeometry(.17,20,14),yellow);body.scale.set(1,.8,1.3);
  mesh(duck,new THREE.SphereGeometry(.115,16,12),yellow,[0,.15,.09]);
  const beak=mesh(duck,new THREE.SphereGeometry(.075,12,8),material(0xd87734),[0,.11,.2]);beak.scale.set(1,.35,1.1);
  for(const x of [-.073,.073])mesh(duck,new THREE.SphereGeometry(.014,8,6),material(0x1c2223),[x,.18,.16]);
  for(const x of [-.14,.14]){const wing=mesh(duck,new THREE.SphereGeometry(.085,12,8),material(0xd99f37),[x,0,-.025]);wing.scale.set(.4,.7,1.4);}
  // Side shelf for VR and mobile devices.
  const shelf=new THREE.Group();shelf.position.set(3.95,0,1.4);scene.add(shelf);
  box(shelf,[1.25,.1,1.75],[0,.91,0],material(0x79543d));
  for(const z of [-.67,.67])box(shelf,[1.1,.86,.08],[0,.43,z],dark);
  // Stand-mounted binocular goggles: visible lenses, face cushion and a curved head strap.
  box(shelf,[.61,.035,.4],[0,.985,-.4],material(0x323e42),.03);
  mesh(shelf,new THREE.CylinderGeometry(.035,.05,.16,12),material(0x667577),[0,1.075,-.4]);
  const headset=object('headset',[0,0,0]);scene.remove(headset);shelf.add(headset);headset.position.set(0,1.22,-.4);headset.rotation.y=.4;
  box(headset,[.73,.3,.25],[0,0,0],material(0xc8c7bd),.095);
  box(headset,[.65,.25,.065],[0,0,.135],material(0x26343a),.075);
  for(const x of [-.17,.17]){
    mesh(headset,new THREE.TorusGeometry(.103,.014,10,40),material(0x738d96,{metalness:.6}),[x,0,.18]);
    const lens=mesh(headset,new THREE.SphereGeometry(.091,20,12),material(0x31596b,{metalness:.6,roughness:.18,emissive:0x204251,emissiveIntensity:.15}),[x,0,.185]);lens.scale.z=.25;
    mesh(headset,new THREE.SphereGeometry(.026,10,8),material(0xa7c6cf,{roughness:.2}),[x-.025,.03,.207]);
  }
  box(headset,[.09,.06,.05],[0,-.12,.175],material(0x202a30),.025);
  const strapPath=new THREE.CatmullRomCurve3([new THREE.Vector3(-.35,.01,-.02),new THREE.Vector3(-.28,.21,-.2),new THREE.Vector3(0,.3,-.26),new THREE.Vector3(.28,.21,-.2),new THREE.Vector3(.35,.01,-.02)]);
  mesh(headset,new THREE.TubeGeometry(strapPath,36,.028,8,false),fabric);
  const topStrap=new THREE.CatmullRomCurve3([new THREE.Vector3(0,.13,.01),new THREE.Vector3(0,.3,-.16),new THREE.Vector3(0,.17,-.43)]);
  mesh(headset,new THREE.TubeGeometry(topStrap,24,.025,8,false),fabric);
  props.headset=headset;
  for(const [id,pos,w,h] of [['phone',[-.27,1.01,.42],.24,.44],['tablet',[.27,1.04,.1],.43,.63]]){
    const device=object(id,[0,0,0]);scene.remove(device);shelf.add(device);device.position.set(...pos);device.rotation.x=-Math.PI/2+.18;device.rotation.z=id==='phone'?-.2:.2;
    box(device,[w,h,.035],[0,0,0],material(0x3b424a),.035);
    const display=canvasTexture(128,192,(c,W,H)=>{c.fillStyle=id==='phone'?'#588a92':'#b98665';c.fillRect(0,0,W,H);c.fillStyle='#ebddc4';c.fillRect(15,25,70,4);for(let i=0;i<6;i++)c.fillRect(15+(i%3)*34,70+Math.floor(i/3)*40,22,22);});
    const screen=mesh(device,new THREE.PlaneGeometry(w*.85,h*.85),new THREE.MeshBasicMaterial({map:display,color:0x000000}),[0,0,.02]);
    props.devices.push({id,group:device,screen,on:false,brightness:0});
  }
  // Tall floor plant and a smaller shelf plant. Pot and foliage have separate targets.
  for(const [id,position,scale]of [['plant',[-4.82,1.98,.68],.5],['plant2',[4.5,0,-1.35],1.05]]){
    const plant=object(id,position);plant.scale.setScalar(scale);
    const pot=mesh(plant,new THREE.CylinderGeometry(.31,.22,.5,20),material(id==='plant'?0xad7759:0x747c6b),[0,.27,0]);pot.userData.part='pot';
    const lip=mesh(plant,new THREE.TorusGeometry(.29,.03,8,24),material(0xc49673),[0,.51,0]);lip.rotation.x=Math.PI/2;lip.userData.part='pot';
    const soil=mesh(plant,new THREE.CylinderGeometry(.275,.275,.025,20),material(0x342d25),[0,.51,0]);soil.userData.part='pot';
    const leaves=[];
    for(let i=0;i<17;i++){
      const angle=i*2.4,y=.75+i*.048,r=.27+Math.sin(i*2)*.11;
      const stemEnd=new THREE.Vector3(Math.sin(angle)*r,y,Math.cos(angle)*r);
      const stem=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,.49,0),stemEnd]),new THREE.LineBasicMaterial({color:0x496344}));plant.add(stem);stem.userData.part='foliage';
      const leaf=mesh(plant,new THREE.SphereGeometry(1,10,6),material(i%3?0x567b56:0x729169),stemEnd.toArray());leaf.scale.set(.14,.028,.32);leaf.rotation.set(.25,angle,.15*Math.sin(i));leaf.userData.part='foliage';
      leaves.push({mesh:leaf,stem,home:leaf.position.clone(),rotation:leaf.rotation.clone(),color:leaf.material.color.clone(),phase:'alive',progress:0,delay:0});
    }
    props.plants.push({id,group:plant,leaves});
  }
  return props;
}

export function plantAction(props,id,part) {
  const plant=props.plants.find(p=>p.id===id);if(!plant)return;
  if(part==='pot'){
    let count=0;plant.leaves.forEach(leaf=>{if(leaf.phase!=='alive'){leaf.phase='grow';leaf.progress=0;leaf.delay=count++*.07;leaf.mesh.position.copy(leaf.home);leaf.mesh.rotation.copy(leaf.rotation);leaf.mesh.material.color.copy(leaf.color);leaf.mesh.scale.setScalar(.001);leaf.stem.visible=true;}});
    return 'A little care. The leaves are growing back.';
  }
  const available=plant.leaves.filter(l=>l.phase==='alive');if(!available.length)return 'The plant needs a little care. Try its pot.';
  const leaf=available[Math.floor(Math.random()*available.length)];leaf.phase='fall';leaf.progress=0;
  return 'One leaf turns gold and drifts down. Try the pot to grow it back.';
}

export function toggleDevice(props,id){
  const device=props.devices.find(d=>d.id===id);if(!device)return false;
  device.on=!device.on;return device.on;
}
export function spillTools(props,t){props.toolboxOpen=toggleToolbox(props.toolboxState,props.toolbox.parent,t);}

export function updateRoomProps(props,dt,t,hovered,reduced,computer) {
  props.screens.forEach(s=>s.material.color.setScalar(computer));props.screenLight.intensity=computer*3;
  props.towerLights.forEach((l,i)=>l.material.emissiveIntensity=computer*(1.7+(reduced?0:Math.sin(t+i)*.2)));
  updateToolbox(props.toolboxState,dt,t,reduced);
  const quackAge=t-props.duckAt;
  props.duck.scale.y=THREE.MathUtils.damp(props.duck.scale.y,!reduced&&quackAge<.3?.73:1,18,dt);
  props.chair.rotation.y=THREE.MathUtils.damp(props.chair.rotation.y,-1.5+(!reduced&&t-props.chairAt<1?.35:0),5,dt);
  props.headset.rotation.z=!reduced&&t-props.glitchAt<.8?Math.sin((t-props.glitchAt)*10)*.06:0;
  props.devices.forEach(device=>{device.brightness=THREE.MathUtils.damp(device.brightness,device.on?1:0,14,dt);device.screen.material.color.setScalar(device.brightness);});
  props.plants.forEach(plant=>plant.leaves.forEach((leaf,i)=>{
    if(leaf.phase==='fall'){
      leaf.progress+=dt;const age=leaf.progress;
      leaf.mesh.material.color.copy(leaf.color).lerp(new THREE.Color(0xc9ad4c),Math.min(1,age*3));
      const fall=reduced?1:Math.min(1,Math.max(0,age-.35)/1.3);
      leaf.mesh.position.set(leaf.home.x+Math.sin(i)*fall*.35,THREE.MathUtils.lerp(leaf.home.y,.06,fall*fall),leaf.home.z+fall*.35);
      leaf.mesh.rotation.z=leaf.rotation.z+(reduced?0:fall*2);leaf.stem.visible=age<.5;
      if(fall===1)leaf.phase='fallen';
    }else if(leaf.phase==='grow'){
      leaf.progress+=dt;const growth=reduced?1:THREE.MathUtils.smoothstep(leaf.progress-leaf.delay,0,.7);
      leaf.mesh.scale.set(.14*growth,.028*growth,.32*growth);if(growth>=1)leaf.phase='alive';
    }else if(leaf.phase==='alive'&&!reduced)leaf.mesh.rotation.z=leaf.rotation.z+Math.sin(t*.8+i)*.025;
  }));
}
