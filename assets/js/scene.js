import * as THREE from "three";
import { GLTFLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

const canvas = document.getElementById("webgl");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = matchMedia("(max-width: 720px)").matches;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.5 : 2));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
camera.position.set(0, 0, 9);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
dirLight.position.set(4, 6, 3);
scene.add(dirLight);
const hemiLight = new THREE.HemisphereLight(0xf7c6d3, 0x16121a, 0.5);
scene.add(hemiLight);

const THEMES = {
  dark: {
    fog: 0x16121a, moon: 0xf3e2c7, moonWire: 0xf3e2c7,
    petals: [0xf2a9bd, 0xe88ca0, 0xf7c6d3, 0xd9b380],
    enso: 0xd9b380, field: 0xb89fae,
  },
  light: {
    fog: 0xfaf5ef, moon: 0xe2688c, moonWire: 0xe2688c,
    petals: [0xd97f9d, 0xc96686, 0xeaa8bd, 0xa8763e],
    enso: 0xa8763e, field: 0xb08a9a,
  },
};
const target = { ...THEMES[document.documentElement.dataset.theme || "dark"] };
scene.fog = new THREE.FogExp2(target.fog, 0.045);

const heroGroup = new THREE.Group();
scene.add(heroGroup);

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(1.25, 48, 48),
  new THREE.MeshBasicMaterial({ color: target.moon })
);
moon.position.set(3.6, 1.15, -2.5);
heroGroup.add(moon);

/* cartoon sakura tree */
const treeGroup = new THREE.Group();
heroGroup.add(treeGroup);
const BR_MAX2 = 120, BL_MAX2 = 180;
const branchMat2 = new THREE.MeshBasicMaterial({ color: 0x5a3a2a });
const blossomMat2 = new THREE.MeshBasicMaterial({ color: 0xf2a9bd });
const branchMesh2 = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.5, 1, 1, 6), branchMat2, BR_MAX2);
branchMesh2.count = 0; branchMesh2.frustumCulled = false;
const blossomMesh2 = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), blossomMat2, BL_MAX2);
blossomMesh2.count = 0; blossomMesh2.frustumCulled = false;
treeGroup.add(branchMesh2, blossomMesh2);

function mulberry32(a){return function(){a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
const rng2 = mulberry32(9);
let bi2=0, bli2=0;
const blossomSeeds2=[];
const UP2=new THREE.Vector3(0,1,0);
const _q2=new THREE.Quaternion(),_m2=new THREE.Matrix4(),_p2=new THREE.Vector3(),_s2=new THREE.Vector3();

function addBlossom2(pos){
  const n=4+((rng2()*5)|0);
  for(let i=0;i<n && bli2<BL_MAX2;i++){
    blossomSeeds2.push({p:pos.clone().add(new THREE.Vector3((rng2()-0.5)*0.8,(rng2()-0.5)*0.5,(rng2()-0.5)*0.6)),s:0.18+rng2()*0.28,rx:rng2()*Math.PI*2,ry:rng2()*Math.PI*2});
    bli2++;
  }
}
function addBranch2(from,dir,len,r){
  if(bi2>=BR_MAX2-4 || len<0.12 || r<0.03){addBlossom2(from);return;}
  const to=from.clone().addScaledVector(dir,len);
  _q2.setFromUnitVectors(UP2,dir);
  _p2.copy(from).addScaledVector(dir,len/2);
  _s2.set(r,len,r);
  _m2.compose(_p2,_q2,_s2);
  branchMesh2.setMatrixAt(bi2++, _m2);
  const kids=len>0.6?3:2;
  for(let i=0;i<kids;i++){
    const nd=dir.clone();
    nd.applyAxisAngle(new THREE.Vector3(0,0,1),(rng2()-0.3)*1.0);
    nd.applyAxisAngle(new THREE.Vector3(1,0,0),(rng2()-0.5)*0.6);
    nd.y=Math.abs(nd.y)*0.5+0.4*(len>0.7?1:0.5);
    nd.normalize();
    addBranch2(to,nd,len*(0.62+rng2()*0.22),r*0.6);
  }
  if(rng2()<0.4) addBlossom2(to);
}
addBranch2(new THREE.Vector3(0,-2.2,0),new THREE.Vector3(0.1,1,-0.05).normalize(),2.4,0.2);
addBranch2(new THREE.Vector3(0.3,-0.4,0),new THREE.Vector3(-0.7,0.6,-0.1).normalize(),1.6,0.1);
addBranch2(new THREE.Vector3(-0.2,0.1,0),new THREE.Vector3(0.8,0.5,0.1).normalize(),1.4,0.08);
branchMesh2.count=bi2;
blossomMesh2.count=bli2;
branchMesh2.instanceMatrix.needsUpdate=true;
const _bq2=new THREE.Quaternion(),_be2=new THREE.Euler();
for(let i=0;i<bli2;i++){
  const b=blossomSeeds2[i];
  _be2.set(b.rx,b.ry,0);
  _bq2.setFromEuler(_be2);
  _p2.copy(b.p);
  _s2.setScalar(b.s);
  _m2.compose(_p2,_bq2,_s2);
  blossomMesh2.setMatrixAt(i,_m2);
}
blossomMesh2.instanceMatrix.needsUpdate=true;
treeGroup.position.set(-1.0,-1.0,-1.8);
if (isMobile) treeGroup.scale.setScalar(0.7);

/* sakura tree is embedded via Sketchfab iframe in the hero */

function petalGeometry() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.19);
  s.bezierCurveTo(0.13, -0.1, 0.115, 0.08, 0.03, 0.19);
  s.bezierCurveTo(0.01, 0.215, -0.01, 0.215, -0.03, 0.19);
  s.bezierCurveTo(-0.115, 0.08, -0.13, -0.1, 0, -0.19);
  const g = new THREE.ShapeGeometry(s, 8);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    pos.setZ(i, Math.cos((x / 0.13) * Math.PI * 0.5) * 0.035 * (1 - Math.abs(y) / 0.22));
  }
  g.computeVertexNormals();
  return g;
}

const PETALS = isMobile ? 20 : 120;
const petalMat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true, opacity: 0.92, fog: true });
const petalMesh = new THREE.InstancedMesh(petalGeometry(), petalMat, PETALS);
scene.add(petalMesh);

const dummy = new THREE.Object3D();
const seeds = [];
const COLOR = new THREE.Color();
function seedPetal(seed) {
  seed.x = (Math.random() - 0.5) * 18;
  seed.y = Math.random() * 14 - 7;
  seed.z = Math.random() * 9 - 6;
  seed.vy = 0.35 + Math.random() * 0.75;
  seed.swayA = 0.5 + Math.random() * 1.1;
  seed.swayF = 0.4 + Math.random() * 0.8;
  seed.phase = Math.random() * Math.PI * 2;
  seed.rx = Math.random() * Math.PI * 2;
  seed.ry = Math.random() * Math.PI * 2;
  seed.rvx = (Math.random() - 0.5) * 0.9;
  seed.rvy = (Math.random() - 0.5) * 0.9;
  seed.scale = 0.7 + Math.random() * 1.1;
  seed.ci = (Math.random() * target.petals.length) | 0;
}
function applyPetalColors() {
  for (let i = 0; i < PETALS; i++) {
    COLOR.set(target.petals[seeds[i].ci % target.petals.length]);
    petalMesh.setColorAt(i, COLOR);
  }
  petalMesh.instanceColor.needsUpdate = true;
}

const FIELD = isMobile ? 100 : 900;
const fpos = new Float32Array(FIELD * 3);
for (let i = 0; i < FIELD; i++) {
  const r = 7 + Math.random() * 13, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
  fpos[i * 3] = r * Math.sin(ph) * Math.cos(th);
  fpos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.7;
  fpos[i * 3 + 2] = r * Math.cos(ph) - 4;
}
const fieldMat = new THREE.PointsMaterial({ color: target.field, size: 0.035, transparent: true, opacity: 0.5 });
const field = new THREE.Points(
  new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(fpos, 3)),
  fieldMat
);
scene.add(field);

const lerpC = (mat, hex, k) => mat.color.lerp(new THREE.Color(hex), k);
let themeMix = 1;
function setTheme(name) {
  if (!THEMES[name]) return;
  target.fog = THEMES[name].fog; target.moon = THEMES[name].moon;
  target.moonWire = THEMES[name].moonWire; target.petals = [...THEMES[name].petals];
  target.enso = THEMES[name].enso; target.field = THEMES[name].field;
  applyPetalColors();
  themeMix = 0;
}
document.addEventListener("mp:theme", (e) => setTheme(e.detail));

const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
addEventListener("pointermove", (e) => {
  mouse.tx = (e.clientX / innerWidth) * 2 - 1;
  mouse.ty = (e.clientY / innerHeight) * 2 - 1;
}, { passive: true });

let scrollP = 0;
const onScroll = () => { scrollP = Math.min(1, Math.max(0, (window.scrollY || 0) / innerHeight)); };
addEventListener("scroll", onScroll, { passive: true });
onScroll();

const resize = () => {
  const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
};
addEventListener("resize", resize);
resize();

const layout = () => { heroGroup.position.x = innerWidth > 960 ? 0 : -1.3; };
addEventListener("resize", layout);
layout();

const clock = new THREE.Clock();
let visible = true;
document.addEventListener("visibilitychange", () => { visible = !document.hidden; });

function frame() {
  requestAnimationFrame(frame);
  if (!visible) return;

  const t = clock.getElapsedTime();
  mouse.x += (mouse.tx - mouse.x) * 0.045;
  mouse.y += (mouse.ty - mouse.y) * 0.045;

  if (themeMix < 1) {
    themeMix = Math.min(1, themeMix + 0.05);
    const k = themeMix;
    scene.fog.color.lerp(new THREE.Color(target.fog), k);
    lerpC(moon.material, target.moon, k);
    lerpC(fieldMat, target.field, k);
  }

  moon.position.y = 1.15 + Math.sin(t * 0.4) * 0.12;

  heroGroup.position.x += (mouse.x * 0.35 - heroGroup.position.x) * 0.03;
  heroGroup.position.y += (-mouse.y * 0.25 - heroGroup.position.y) * 0.03;

  treeGroup.rotation.z = Math.sin(t * 0.45) * 0.012;
  treeGroup.rotation.x = Math.sin(t * 0.3 + 1) * 0.006;


  for (let i = 0; i < PETALS; i++) {
    const s = seeds[i];
    s.y -= s.vy * 0.016;
    s.x += Math.sin(t * s.swayF + s.phase) * s.swayA * 0.004;
    s.rx += s.rvx * 0.016;
    s.ry += s.rvy * 0.016;
    if (s.y < -7.5) { s.y = 7.5; s.x = (Math.random() - 0.5) * 18; }
    dummy.position.set(s.x, s.y, s.z);
    dummy.rotation.set(s.rx, s.ry, s.phase);
    dummy.scale.setScalar(s.scale);
    dummy.updateMatrix();
    petalMesh.setMatrixAt(i, dummy.matrix);
  }
  petalMesh.instanceMatrix.needsUpdate = true;

  const sp = scrollP;
  petalMesh.position.y = sp * 4;
  heroGroup.position.z = -sp * 5;

  field.rotation.y = t * 0.02 + mouse.x * 0.06;
  field.position.y = sp * 3.2;
  camera.position.z = 9 - sp * 1.5;
  camera.lookAt(scene.position);

  renderer.render(scene, camera);
}

for (let i = 0; i < PETALS; i++) { const s = {}; seedPetal(s); seeds.push(s); }
applyPetalColors();

if (reduced) {
  renderer.render(scene, camera);
} else {
  frame();
}