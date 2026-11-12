import * as THREE from 'three';

// A small position-based cloth grid drives the denser visible weave and fringe.
const NX=26,NZ=18,FLOOR=.058;
export function createCloth(carpet,parent){
  parent.updateMatrixWorld(true);
  const positions=new Float32Array((NX+1)*(NZ+1)*3),point=new THREE.Vector3();
  for(let z=0;z<=NZ;z++)for(let x=0;x<=NX;x++){
    point.set((x/NX-.5)*5.3,0,(z/NZ-.5)*3.45).applyMatrix4(parent.matrixWorld);point.y=FLOOR;
    positions.set(point.toArray(),(z*(NX+1)+x)*3);
  }
  const links=[];
  const link=(a,b,stiffness)=>{const ai=a*3,bi=b*3;links.push([a,b,Math.hypot(positions[ai]-positions[bi],positions[ai+2]-positions[bi+2]),stiffness]);};
  for(let z=0;z<=NZ;z++)for(let x=0;x<=NX;x++){
    const i=z*(NX+1)+x;
    if(x<NX)link(i,i+1,.9);if(z<NZ)link(i,i+NX+1,.9);
    if(x<NX&&z<NZ){link(i,i+NX+2,.65);link(i+1,i+NX+1,.65);}
    if(x<NX-1)link(i,i+2,.3);if(z<NZ-1)link(i,i+2*(NX+1),.3);
  }
  const sim={carpet,parent,positions,previous:positions.slice(),rest:positions.slice(),links,grab:-1,target:new THREE.Vector3(),autoTime:0,awake:0,grabOrigin:new THREE.Vector3(),lastTarget:new THREE.Vector3(),pin:new THREE.Vector3()};renderCloth(sim);return sim;
}
export function grabCloth(sim,worldPoint){
  let best=Infinity;
  for(let i=0;i<sim.positions.length;i+=3){const d=(sim.positions[i]-worldPoint.x)**2+(sim.positions[i+2]-worldPoint.z)**2;if(d<best){best=d;sim.grab=i/3;}}
  const j=sim.grab*3;sim.grabOrigin.set(sim.positions[j],sim.positions[j+1],sim.positions[j+2]);
  sim.target.copy(sim.grabOrigin);sim.target.y=.23;sim.pin.copy(sim.grabOrigin);sim.lastTarget.copy(sim.target);sim.awake=4;
}
export function moveClothGrab(sim,point){const coords=[THREE.MathUtils.clamp(point.x,-4.8,4.8),.23,THREE.MathUtils.clamp(point.z,-2.7,3.05)];collide(coords,0);sim.target.fromArray(coords);sim.awake=4;}
export function releaseCloth(sim){sim.grab=-1;sim.autoTime=0;sim.awake=3;}
export function nudgeCloth(sim,dx,dz){
  const mid=Math.floor(sim.positions.length/6)*3;
  grabCloth(sim,new THREE.Vector3(sim.positions[mid],FLOOR,sim.positions[mid+2]));
  moveClothGrab(sim,sim.target.clone().add(new THREE.Vector3(dx,0,dz)));sim.autoTime=.95;
}
export function resetCloth(sim){sim.positions.set(sim.rest);sim.previous.set(sim.rest);sim.grab=-1;sim.autoTime=0;sim.awake=.2;renderCloth(sim);}
function collide(p,i){
  p[i]=THREE.MathUtils.clamp(p[i],-5.02,5.02);p[i+2]=THREE.MathUtils.clamp(p[i+2],-2.98,3.28);p[i+1]=THREE.MathUtils.clamp(p[i+1],FLOOR,.34);
  // Solid furniture footprints keep fabric out of the desk and right cabinet.
  if(p[i]<-3.13&&p[i+2]<2.12)p[i]=-3.13;
  if(p[i]>3.3&&p[i+2]>.48&&p[i+2]<2.35)p[i]=3.3;
}
export function stepCloth(sim,dt){
  if(sim.awake<=0&&sim.grab<0)return;
  sim.awake-=dt;
  if(sim.autoTime>0){sim.autoTime-=dt;if(sim.autoTime<=0)releaseCloth(sim);}
  const p=sim.positions,prev=sim.previous,h=Math.min(dt,1/30)/2;
  for(let sub=0;sub<2;sub++){
    if(sim.grab>=0){const delta=sim.target.clone().sub(sim.pin);delta.clampLength(0,4*h);sim.pin.add(delta);}
    for(let i=0;i<p.length;i+=3){
      const damping=p[i+1]<=FLOOR+.008?.91:.97;
      for(let axis=0;axis<3;axis++){const value=p[i+axis],velocity=THREE.MathUtils.clamp((value-prev[i+axis])*(axis===1?.7:damping),-.07,.07);prev[i+axis]=value;p[i+axis]+=velocity;}
      p[i+1]-=9.8*h*h;
    }
    for(let iteration=0;iteration<7;iteration++){
      for(const [a,b,rest,stiffness]of sim.links){
        const ai=a*3,bi=b*3,dx=p[bi]-p[ai],dy=p[bi+1]-p[ai+1],dz=p[bi+2]-p[ai+2],length=Math.hypot(dx,dy,dz)||1;
        const correction=(length-rest)/length*stiffness*.5;
        if(a!==sim.grab){p[ai]+=dx*correction;p[ai+1]+=dy*correction;p[ai+2]+=dz*correction;}
        if(b!==sim.grab){p[bi]-=dx*correction;p[bi+1]-=dy*correction;p[bi+2]-=dz*correction;}
      }
      for(let i=0;i<p.length;i+=3)collide(p,i);
      if(sim.grab>=0){const j=sim.grab*3;p[j]=sim.pin.x;p[j+1]=sim.pin.y;p[j+2]=sim.pin.z;}
    }
  }
  renderCloth(sim);
}
function sample(sim,u,v,out){
  const x=THREE.MathUtils.clamp(u,0,1)*NX,z=THREE.MathUtils.clamp(v,0,1)*NZ,ix=Math.min(NX-1,Math.floor(x)),iz=Math.min(NZ-1,Math.floor(z)),fx=x-ix,fz=z-iz;
  const a=(iz*(NX+1)+ix)*3,b=a+3,c=a+(NX+1)*3,d=c+3,p=sim.positions;
  for(let axis=0;axis<3;axis++)out.setComponent(axis,THREE.MathUtils.lerp(THREE.MathUtils.lerp(p[a+axis],p[b+axis],fx),THREE.MathUtils.lerp(p[c+axis],p[d+axis],fx),fz));
}
function renderCloth(sim){
  const inverse=sim.parent.matrixWorld.clone().invert(),world=new THREE.Vector3();
  [sim.carpet.cloth,sim.carpet.fringe].forEach((part,k)=>{
    const original=sim.carpet.originals[k],pos=part.geometry.attributes.position;
    for(let i=0;i<pos.count;i++){
      const x=original[i*3],y=original[i*3+1],z=original[i*3+2];
      sample(sim,x/5.3+.5,z/3.45+.5,world);
      // Keep fringe extensions outside the sample boundary and preserve cloth thickness.
      if(Math.abs(z)>1.725){const extension=new THREE.Vector3(0,0,z-Math.sign(z)*1.725).transformDirection(sim.parent.matrixWorld).multiplyScalar(Math.abs(z)-1.725);world.add(extension);}
      world.y+=y;world.applyMatrix4(inverse);pos.setXYZ(i,world.x,world.y,world.z);
    }
    pos.needsUpdate=true;part.geometry.computeBoundingSphere();
  });
  sim.carpet.cloth.geometry.computeVertexNormals();
}
export function clothCovers(sim,point){
  const p=sim.positions;
  const inside=(ia,ib,ic)=>{
    const ax=p[ia*3],az=p[ia*3+2],bx=p[ib*3],bz=p[ib*3+2],cx=p[ic*3],cz=p[ic*3+2];
    const area=(bx-ax)*(cz-az)-(bz-az)*(cx-ax);if(Math.abs(area)<1e-8)return false;
    const e1=(bx-ax)*(point.z-az)-(bz-az)*(point.x-ax),e2=(cx-bx)*(point.z-bz)-(cz-bz)*(point.x-bx),e3=(ax-cx)*(point.z-cz)-(az-cz)*(point.x-cx);
    return(e1>=0&&e2>=0&&e3>=0)||(e1<=0&&e2<=0&&e3<=0);
  };
  for(let z=0;z<NZ;z++)for(let x=0;x<NX;x++){const a=z*(NX+1)+x,b=a+1,c=a+NX+1,d=c+1;if(inside(a,b,c)||inside(b,d,c))return true;}
  return false;
}
