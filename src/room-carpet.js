import * as THREE from 'three';

export const carpetSize = { width: 5.3, depth: 3.45 };

export function createCarpet(parent, makeTexture) {
  const pattern = makeTexture(2048, 1334, (c, w, h) => {
    c.fillStyle = '#74392f'; c.fillRect(0, 0, w, h);
    const frame = (inset, color, thickness) => { c.strokeStyle = color; c.lineWidth = thickness; c.strokeRect(inset, inset, w - inset * 2, h - inset * 2); };
    frame(14, '#c1a173', 16); frame(40, '#263e40', 26); frame(64, '#d0af78', 8); frame(115, '#b68656', 78); frame(164, '#293d3e', 12); frame(183, '#d1ac71', 9);
    function leaf(x, y, r, angle, color) {
      c.save(); c.translate(x, y); c.rotate(angle); c.fillStyle = color;
      c.beginPath(); c.ellipse(0, 0, r, r * .34, 0, 0, Math.PI * 2); c.fill(); c.restore();
    }
    function flower(x, y, r, color = '#c5a170') {
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; leaf(x + Math.cos(a) * r * .58, y + Math.sin(a) * r * .58, r * .55, a, color); }
      c.fillStyle = '#293d3c'; c.beginPath(); c.arc(x, y, r * .25, 0, Math.PI * 2); c.fill();
    }
    for (let x = 113; x < w - 90; x += 75) { flower(x, 114, 22); flower(x, h - 114, 22); }
    for (let y = 187; y < h - 150; y += 75) { flower(114, y, 22); flower(w - 114, y, 22); }
    for (let y = 225; y < h - 205; y += 91) for (let x = 230; x < w - 215; x += 91) {
      const offset = Math.round(y / 91) % 2 * 30;
      flower(x + offset, y, 17, '#bd8b5d');
      c.strokeStyle = '#9a7753'; c.lineWidth = 3;
      c.beginPath(); c.moveTo(x + offset, y + 22); c.bezierCurveTo(x + 40 + offset, y + 46, x - 32 + offset, y + 58, x + offset, y + 80); c.stroke();
      leaf(x + offset + 15, y + 42, 12, -.55, '#9d9c73'); leaf(x + offset - 13, y + 65, 11, .55, '#b38d61');
    }
    const medallion = (radius, color) => {
      c.fillStyle = color; c.beginPath();
      for (let i = 0; i <= 160; i++) { const a = i / 160 * Math.PI * 2, r = radius * (1 + .055 * Math.cos(a * 16)); const x = w / 2 + Math.cos(a) * r, y = h / 2 + Math.sin(a) * r * .82; i ? c.lineTo(x, y) : c.moveTo(x, y); }
      c.closePath(); c.fill();
    };
    medallion(340, '#d2b17c'); medallion(326, '#263c3e'); medallion(285, '#b28256'); medallion(269, '#63382f');
    for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; flower(w / 2 + Math.cos(a) * 217, h / 2 + Math.sin(a) * 177, 19); }
    medallion(156, '#c6a275'); medallion(138, '#2f4544'); flower(w / 2, h / 2, 85, '#d0b583');
    c.globalAlpha = .13; c.lineWidth = 1;
    for (let y = 0; y < h; y += 3) { c.strokeStyle = y % 2 ? '#edcc94' : '#231c18'; c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
    for (let x = 0; x < w; x += 4) { c.strokeStyle = '#e3bd83'; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
  });
  const backing = makeTexture(256, 256, c => {
    c.fillStyle = '#80705c'; c.fillRect(0, 0, 256, 256); c.lineWidth = 1;
    for (let i = 0; i < 256; i += 4) { c.strokeStyle = '#a39277'; c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 256); c.stroke(); c.strokeStyle = '#5b5144'; c.beginPath(); c.moveTo(0, i); c.lineTo(256, i); c.stroke(); }
  });
  backing.wrapS = backing.wrapT = THREE.RepeatWrapping; backing.repeat.set(8, 5);
  const base = new THREE.PlaneGeometry(carpetSize.width, carpetSize.depth, 80, 52); base.rotateX(-Math.PI / 2);
  const count = base.attributes.position.count, vertices = [], uvs = [], indices = [];
  for (const layer of [1, -1]) for (let i = 0; i < count; i++) {
    const x = base.attributes.position.getX(i), z = base.attributes.position.getZ(i);
    const ripple = .005 * Math.sin(x * 12 + z * 9) * Math.pow(Math.abs(x) / 2.65, 8);
    vertices.push(x, layer * .018 + ripple, z); uvs.push(base.attributes.uv.getX(i), base.attributes.uv.getY(i));
  }
  const top = [...base.index.array]; indices.push(...top);
  for (let i = 0; i < top.length; i += 3) indices.push(top[i + 2] + count, top[i + 1] + count, top[i] + count);
  const perimeter = [];
  for (let x = 0; x <= 80; x++) perimeter.push(x);
  for (let z = 1; z <= 52; z++) perimeter.push(z * 81 + 80);
  for (let x = 79; x >= 0; x--) perimeter.push(52 * 81 + x);
  for (let z = 51; z > 0; z--) perimeter.push(z * 81);
  const sideStart = indices.length;
  for (let i = 0; i < perimeter.length; i++) { const a = perimeter[i], b = perimeter[(i + 1) % perimeter.length]; indices.push(a, a + count, b, b, a + count, b + count); }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3).setUsage(THREE.DynamicDrawUsage)); geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); geometry.setIndex(indices);
  geometry.addGroup(0, top.length, 0); geometry.addGroup(top.length, top.length, 1); geometry.addGroup(sideStart, indices.length - sideStart, 2); geometry.computeVertexNormals();
  const mats = [new THREE.MeshStandardMaterial({ color: 0xffffff, map: pattern, bumpMap: pattern, bumpScale: .009, roughness: 1, side: THREE.DoubleSide }), new THREE.MeshStandardMaterial({ color: 0xbbaa8d, map: backing, roughness: 1, side: THREE.DoubleSide }), new THREE.MeshStandardMaterial({ color: 0x95654c, roughness: 1, side: THREE.DoubleSide })];
  const cloth = new THREE.Mesh(geometry, mats); cloth.castShadow = true; cloth.receiveShadow = true; parent.add(cloth);
  const threads = [];
  for (const zSign of [-1, 1]) for (let i = 0; i < 74; i++) for (let strand = 0; strand < 3; strand++) {
    const x = -2.58 + i * .07 + strand * .008, z = zSign * 1.725, endZ = z + zSign * (.09 + .025 * Math.sin(i * 2.4));
    threads.push(x, 0, z, x + .008 * Math.sin(i), .003, endZ);
  }
  const fringeGeometry = new THREE.BufferGeometry(); fringeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(threads, 3).setUsage(THREE.DynamicDrawUsage));
  const fringe = new THREE.LineSegments(fringeGeometry, new THREE.LineBasicMaterial({ color: 0xb9a07a })); parent.add(fringe);
  base.dispose();
  return { cloth, fringe, originals: [Float32Array.from(vertices), Float32Array.from(threads)], lastLift: -1, lastCorner: '' };
}

export function updateCarpet(carpet, lift, corner) {
  const key = corner.join(','); if (Math.abs(lift - carpet.lastLift) < .00001 && key === carpet.lastCorner) return;
  carpet.lastLift = lift; carpet.lastCorner = key;
  [carpet.cloth, carpet.fringe].forEach((part, p) => {
    const pos = part.geometry.attributes.position, original = carpet.originals[p];
    for (let i = 0; i < pos.count; i++) {
      const x = original[i * 3], y = original[i * 3 + 1], z = original[i * 3 + 2];
      const distance = Math.hypot((2.65 - x * corner[0]) / 1.85, (1.725 - z * corner[1]) / 1.65);
      const influence = Math.pow(Math.max(0, 1 - distance), 1.8), curl = influence * lift;
      pos.setXYZ(i, x - corner[0] * curl * curl * .42, y + curl * 1.25, z - corner[1] * curl * curl * .46);
    }
    pos.needsUpdate = true; part.geometry.computeBoundingSphere();
  });
  carpet.cloth.geometry.computeVertexNormals();
}
