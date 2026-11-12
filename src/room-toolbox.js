import * as THREE from 'three';

export const TOOL_DEFS = [
  {id:'svelte',name:'Svelte',color:0xb74d30,asset:'svelte.svg',note:'Part of my web development toolkit.'},
  {id:'azure',name:'Azure',color:0x226991,note:'Cloud services, infrastructure, and ongoing learning.'},
  {id:'unity',name:'Unity',color:0xe0d4bb,asset:'unity.png',kind:'cube',note:'My foundation in games, AR, and interactive experiences.'},
  {id:'codex',name:'Codex',color:0x344543,kind:'terminal',note:'AI-assisted development workflows.'},
  {id:'python',name:'Python',color:0x54758b,asset:'python.svg',kind:'coin',note:'Scripting and development.'},
  {id:'plesk',name:'Plesk',color:0x4f7368,asset:'plesk.svg',note:'Web hosting and server administration.'},
  {id:'csharp',name:'C#',color:0x765b85,note:'Unity development and game systems.'},
  {id:'git',name:'Git',color:0xb86a4b,asset:'git.svg',kind:'hex',note:'Version control across projects.'},
  {id:'githubactions',name:'GitHub Actions',color:0x547a98,asset:'githubactions.svg',note:'Build and deployment workflows, including this portfolio.'},
  {id:'vite',name:'Vite',color:0x746687,asset:'vite.svg',note:'Local development and production builds for this portfolio.'},
  {id:'npm',name:'npm',color:0x9b5350,asset:'npm.svg',note:'Dependencies and project scripts, including this portfolio.'},
];

function tray(api,parent,width,depth,height,position,color){
  const {box,material}=api,g=new THREE.Group();g.position.set(...position);parent.add(g);
  box(g,[width,.035,depth],[0,0,0],material(color),.025);
  for(const x of [-1,1])box(g,[.045,height,depth],[x*(width/2-.02),height/2,0],material(color),.012);
  for(const z of [-1,1])box(g,[width,height,.04],[0,height/2,z*(depth/2-.02)],material(color),.012);
  // Dividers make each tray read as storage rather than a floating shelf.
  if(height<.2)for(const x of [-.24,.24])box(g,[.015,height*.65,depth-.08],[x,height*.32,0],material(0x3e545a),.004);
  return g;
}
export function createToolbox(api){
  const {scene,object,box,mesh,material,canvasTexture}=api;
  const root=object('toolbox',[-.3,.1,-2],0);
  const body=tray(api,root,1.64,.96,.42,[0,0,0],0x405a60);
  box(root,[1.7,.1,1.01],[0,-.035,0],material(0x242e33),.05);
  for(const x of [-.79,.79])for(const z of [-.43,.43])box(root,[.09,.45,.09],[x,.16,z],material(0x28373b),.025);
  for(const x of [-.51,.51])box(root,[.13,.18,.06],[x,.31,.5],material(0xc5a367,{metalness:.65}),.025);
  const lid=new THREE.Group();lid.position.set(0,.46,-.47);root.add(lid);
  box(lid,[1.69,.1,.98],[0,0,.47],material(0x65828a,{metalness:.4}),.04);
  for(let i=0;i<5;i++)box(lid,[1.48,.025,.018],[0,.06,.13+i*.16],material(0x78949a),.006);
  box(lid,[.5,.07,.11],[0,.2,.46],material(0x202e33),.035);
  for(const x of [-.22,.22])box(lid,[.07,.18,.11],[x,.13,.46],material(0x202e33),.02);
  const trays=[body];
  for(const side of [-1,1]){
    const g=tray(api,root,1.48,.43,.12,[0,.27,side*.23],side===1?0x78918e:0x5c797e);g.userData.side=side;trays.push(g);
  }
  const arms=[];
  for(let i=1;i<trays.length;i++)for(const x of [-.67,.67]){
    const arm=mesh(root,new THREE.CylinderGeometry(.018,.018,1,8),material(0x9baca8,{metalness:.8}));
    arms.push({mesh:arm,tray:trays[i],x,side:trays[i].userData.side});
  }
  const loader=api.textureLoader??new THREE.TextureLoader();
  const tokens=TOOL_DEFS.map((def,index)=>{
    const group=new THREE.Group();scene.add(group);group.visible=false;group.userData.tool=def.id;
    const thickness=def.kind==='cube'?.3:def.kind==='terminal'?.14:.075;
    if(def.kind==='coin'||def.kind==='hex'){
      const disc=mesh(group,new THREE.CylinderGeometry(.19,.19,thickness,def.kind==='hex'?6:32),material(def.color,{metalness:.35,roughness:.5}));disc.rotation.x=Math.PI/2;
    }else box(group,def.kind==='cube'?[.3,.3,.3]:def.kind==='terminal'?[.39,.27,.14]:[.35,.35,.075],[0,0,0],material(def.color,{metalness:.3,roughness:.5}),.035);
    let texture;
    if(def.asset){texture=loader.load(`/room/${def.asset}`);texture.colorSpace=THREE.SRGBColorSpace;}
    else texture=canvasTexture(256,256,(c,w,h)=>{
      c.clearRect(0,0,w,h);c.fillStyle='#f1e7d0';c.strokeStyle='#f1e7d0';
      if(def.id==='csharp'){c.font='bold 86px sans-serif';c.textAlign='center';c.fillText('C#',128,160);}
      if(def.id==='azure'){c.beginPath();c.moveTo(126,35);c.lineTo(43,199);c.lineTo(130,199);c.lineTo(106,163);c.lineTo(180,163);c.lineTo(126,35);c.fill();}
      if(def.id==='codex'){c.lineWidth=14;c.lineCap='round';c.beginPath();c.moveTo(56,76);c.lineTo(104,124);c.lineTo(56,172);c.moveTo(133,173);c.lineTo(201,173);c.stroke();}
    });
    const faceSize=def.kind==='terminal'?[.29,.19]:[.25,.25];
    mesh(group,new THREE.PlaneGeometry(...faceSize),new THREE.MeshBasicMaterial({map:texture,transparent:true}),[0,0,thickness/2+.002]);
    if(def.kind==='cube'){
      const top=mesh(group,new THREE.PlaneGeometry(.24,.24),new THREE.MeshBasicMaterial({map:texture,transparent:true}),[0,.152,0]);top.rotation.x=-Math.PI/2;
    }
    return{...def,index,group,velocity:new THREE.Vector3(),phase:'hidden',bounces:0,tray:-1,slot:-1,floorY:def.kind==='cube'?.17:def.kind==='terminal'?.15:.065,packTarget:new THREE.Vector3(),restRotation:def.kind==='cube'||def.kind==='terminal'?new THREE.Euler(0,.35,0):new THREE.Euler(-Math.PI/2,0,index*.3)};
  });
  const guides=trays.map((t,i)=>{
    const w=i===0?.82:.74,d=i===0?.48:.215,y=i===0?.44:.14;
    const line=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-w,y,-d),new THREE.Vector3(w,y,-d),new THREE.Vector3(w,y,d),new THREE.Vector3(-w,y,d)]),new THREE.LineBasicMaterial({color:0xe8c181}));t.add(line);line.visible=false;return line;
  });
  const state={root,lid,trays,arms,tokens,guides,dropHint:false,open:false,openAmount:0,openedAt:-10};
  return state;
}
export function toggleToolbox(state,scene,time){
  state.open=!state.open;state.openedAt=time;state.root.updateMatrixWorld(true);
  state.tokens.forEach(token=>{
    if(state.open){
      // Every stored item is ejected on opening; tools on the floor stay there.
      if(!['hidden','packed','packing','queued'].includes(token.phase))return;
      scene.attach(token.group);token.group.scale.setScalar(1);token.group.visible=true;token.phase='queued';token.bounces=0;token.tray=-1;token.slot=-1;
      token.group.position.copy(state.root.localToWorld(new THREE.Vector3((token.index%4-1.5)*.29,.4,(Math.floor(token.index/4)-1)*.18)));
      token.group.rotation.set(-.1,token.index*.3,0);
      const angle=(token.index/(state.tokens.length-1)-.5)*1.8,speed=1.45+(token.index%4)*.4;
      token.velocity.set(Math.sin(angle)*speed,2.7+(token.index%3)*.3,Math.cos(angle)*speed);
    }else if(token.phase==='queued'){packTool(state,token,0);
    }else if(token.phase==='packed'||token.phase==='packing'){
      // Stored icons ride the folding trays. Floor objects stay where they landed.
      token.group.visible=true;
    }
  });
  return state.open;
}
export function pickUpTool(state,scene,token){
  scene.attach(token.group);token.group.scale.setScalar(1);token.phase='held';token.tray=-1;token.slot=-1;token.velocity.set(0,0,0);
}
function freeSlot(state,tray){
  const used=new Set(state.tokens.filter(t=>t.tray===tray&&(t.phase==='packed'||t.phase==='packing')).map(t=>t.slot));
  const capacity=tray===0?8:3;for(let i=0;i<capacity;i++)if(!used.has(i))return i;return -1;
}
export function packTool(state,token,preferred=1){
  const bulky=token.kind==='cube'||token.kind==='terminal';
  const order=bulky?[0]:state.open?[preferred,...[1,2,0].filter(x=>x!==preferred)]:[0,1,2];
  for(const index of order){const slot=freeSlot(state,index);if(slot<0)continue;
    const tray=state.trays[index];tray.updateMatrixWorld(true);tray.attach(token.group);token.tray=index;token.slot=slot;token.phase='packing';
    token.packTarget.set(index===0?(slot%4-1.5)*.35:(slot-1)*.43,token.kind==='cube'?.125:token.kind==='terminal'?.115:.06,index===0?(Math.floor(slot/4)-.5)*.35:0);return true;
  }return false;
}
export function dropTool(state,token,ray){
  if(state.open&&ray){
    for(const index of [2,1,0]){
      const tray=state.trays[index];tray.updateMatrixWorld(true);
      const dropHeight=tray.localToWorld(new THREE.Vector3(0,index===0?.44:.14,0)).y;
      const plane=new THREE.Plane(new THREE.Vector3(0,1,0),-dropHeight),point=ray.intersectPlane(plane,new THREE.Vector3());
      if(!point)continue;const local=tray.worldToLocal(point);
      if(Math.abs(local.x)<.94&&Math.abs(local.z)<(index===0?.62:.39))return packTool(state,token,index);
    }
    const bounds=new THREE.Box3().setFromObject(state.root).expandByScalar(.1);
    if(ray.intersectsBox(bounds))return packTool(state,token,0);
  }
  token.phase='flying';token.bounces=0;token.velocity.set(0,0,0);return false;
}
export function resetToolbox(state){state.open=false;state.openAmount=0;state.root.rotation.z=0;state.tokens.forEach(t=>{t.phase='hidden';t.group.visible=false;t.tray=-1;t.slot=-1;});}
export function updateToolbox(state,dt,time,reduced){
  state.guides.forEach(g=>g.visible=state.open&&state.dropHint);
  state.openAmount=THREE.MathUtils.damp(state.openAmount,state.open?1:0,reduced?100:6,dt);
  state.lid.rotation.x=-1.95*state.openAmount;
  for(let i=1;i<state.trays.length;i++){
    const t=state.trays[i],side=t.userData.side;t.position.y=.27+state.openAmount*(i===1?.51:.72);t.position.z=side*(.23+state.openAmount*.51);
  }
  for(const arm of state.arms){
    const a=new THREE.Vector3(arm.x,.16,arm.side*.18),b=new THREE.Vector3(arm.x,arm.tray.position.y-.02,arm.tray.position.z),delta=b.clone().sub(a);
    arm.mesh.position.copy(a).add(b).multiplyScalar(.5);arm.mesh.scale.y=delta.length();arm.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
  }
  const age=time-state.openedAt;state.root.rotation.z=!reduced&&state.open&&age<.65?Math.sin(age*35)*.05*(1-age/.65):0;
  state.tokens.forEach(token=>{
    if(token.phase==='queued'&&age>.55+token.index*.025)token.phase='flying';
    if(token.phase==='flying'){
      if(reduced){token.group.position.set(-1.1+(token.index%4)*.5,token.floorY,-1.2+Math.floor(token.index/4)*.4);token.phase='settled';}
      else{
        token.velocity.y-=9.8*dt;token.group.position.addScaledVector(token.velocity,dt);token.group.rotation.x+=dt*(2+token.index%3);token.group.rotation.z+=dt*(token.index%3-1)*2;
        token.group.position.x=THREE.MathUtils.clamp(token.group.position.x,-4.9,4.8);token.group.position.z=THREE.MathUtils.clamp(token.group.position.z,-2.9,3.17);
        if(token.group.position.y<token.floorY){token.group.position.y=token.floorY;token.velocity.y=Math.abs(token.velocity.y)*.22;token.velocity.x*=.6;token.velocity.z*=.6;if(++token.bounces>=2)token.phase='settled';}
      }
    }
    if(token.phase==='settled'||token.phase==='packing'||token.phase==='packed'){
      const target=new THREE.Quaternion().setFromEuler(token.restRotation);token.group.quaternion.slerp(target,1-Math.exp(-dt*10));
      if(token.phase==='packing'||token.phase==='packed')token.group.scale.lerp(new THREE.Vector3().setScalar(token.kind==='cube'||token.kind==='terminal'?.68:.8),1-Math.exp(-dt*10));
      if(token.phase==='packing'){token.group.position.lerp(token.packTarget,1-Math.exp(-dt*10));if(token.group.position.distanceTo(token.packTarget)<.008){token.group.position.copy(token.packTarget);token.phase='packed';}}
    }
  });
}
