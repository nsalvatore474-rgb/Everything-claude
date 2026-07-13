/* =========================================================
   VULCAN — Procedural 3D Engine Scene (Three.js)
   Builds a stylised V8-style engine block entirely from
   primitives (no external model/texture assets), animates
   pistons/crank/fan/belt, and reacts to scroll + mouse.
   ========================================================= */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const canvas = document.getElementById('engine-canvas');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isSmall = window.innerWidth < 860;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall ? 1.5 : 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0c0c0d, 0.055);

const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, -0.2, 13);

/* ---------- Lighting ---------- */
const ambient = new THREE.AmbientLight(0x33363c, 0.9);
scene.add(ambient);

const keyLight = new THREE.SpotLight(0x2dd4ff, 26, 30, Math.PI / 5, 0.5, 1.4);
keyLight.position.set(-6, 6, 6);
scene.add(keyLight);

const fillLight = new THREE.SpotLight(0xf5a623, 16, 30, Math.PI / 4, 0.6, 1.6);
fillLight.position.set(6, -2, 5);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xf4f6f8, 0.9);
rimLight.position.set(0, 5, -6);
scene.add(rimLight);

const mouseLight = new THREE.PointLight(0xffffff, 4, 12, 2);
mouseLight.position.set(0, 0, 4);
scene.add(mouseLight);

/* ---------- Materials ---------- */
const gunmetal = new THREE.MeshStandardMaterial({ color: 0x2a2d33, metalness: 0.85, roughness: 0.42 });
const titanium = new THREE.MeshStandardMaterial({ color: 0x9aa0a8, metalness: 0.9, roughness: 0.38 });
const brushedAlu = new THREE.MeshStandardMaterial({ color: 0xc7ccd1, metalness: 0.75, roughness: 0.5 });
const darkTrim = new THREE.MeshStandardMaterial({ color: 0x121316, metalness: 0.6, roughness: 0.55 });
const blueEmissive = new THREE.MeshStandardMaterial({ color: 0x0c2b33, emissive: 0x2dd4ff, emissiveIntensity: 1.6, metalness: 0.3, roughness: 0.3 });
const amberEmissive = new THREE.MeshStandardMaterial({ color: 0x3a2408, emissive: 0xf5a623, emissiveIntensity: 1.4, metalness: 0.3, roughness: 0.3 });
const rubberBelt = new THREE.MeshStandardMaterial({ color: 0x0a0a0b, metalness: 0.1, roughness: 0.9 });

/* ---------- Engine group ---------- */
const engine = new THREE.Group();
scene.add(engine);

// Central block (V-shaped cylinder banks emulated with two angled boxes)
const blockCore = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.7, 2.0, 2, 2, 2), gunmetal);
engine.add(blockCore);

const bankGeo = new THREE.BoxGeometry(2.4, 1.3, 0.9, 1, 1, 1);
const bankL = new THREE.Mesh(bankGeo, gunmetal);
bankL.position.set(0, 1.05, 0.55);
bankL.rotation.x = THREE.MathUtils.degToRad(18);
engine.add(bankL);

const bankR = bankL.clone();
bankR.position.z = -0.55;
bankR.rotation.x = THREE.MathUtils.degToRad(-18);
engine.add(bankR);

// Oil pan (bottom)
const pan = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.6, 1.7, 1, 1, 1), darkTrim);
pan.position.y = -1.35;
engine.add(pan);

// Valve covers with amber glow strip
[bankL, bankR].forEach((bank, i) => {
  const cover = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.22, 0.86), brushedAlu);
  cover.position.set(0, 0.72, 0);
  bank.add(cover);
  const strip = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.05, 0.06), amberEmissive);
  strip.position.set(0, 0.83, 0.42);
  bank.add(strip);
});

// Pistons (visible through a "cutaway" on the front bank) — travel along local Y
const pistons = [];
const pistonGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.55, 24);
const rodGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.7, 10);
for (let i = 0; i < 4; i++) {
  const x = -0.9 + i * 0.6;
  const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.9, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0x1a1b1e, metalness: 0.7, roughness: 0.4, side: THREE.DoubleSide }));
  sleeve.position.set(x, 0.15, 0.9);
  engine.add(sleeve);

  const piston = new THREE.Mesh(pistonGeo, titanium);
  piston.position.set(x, 0.15, 0.9);
  engine.add(piston);

  const rod = new THREE.Mesh(rodGeo, new THREE.MeshStandardMaterial({ color: 0x6a6e76, metalness: 0.9, roughness: 0.3 }));
  rod.position.set(x, -0.25, 0.9);
  engine.add(rod);

  pistons.push({ mesh: piston, rod, baseY: 0.15, offset: (i / 4) * Math.PI * 2, x });
}

// Crankshaft
const crankGroup = new THREE.Group();
crankGroup.position.set(0, -0.55, 0.9);
crankGroup.rotation.z = Math.PI / 2;
engine.add(crankGroup);
const crankShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.4, 20), titanium);
crankShaft.rotation.z = Math.PI / 2;
crankGroup.add(crankShaft);
for (let i = 0; i < 4; i++) {
  const web = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 16), darkTrim);
  web.position.x = -0.9 + i * 0.6;
  web.rotation.z = Math.PI / 2;
  crankGroup.add(web);
}

// Flywheel / cooling fan (front)
const fanGroup = new THREE.Group();
fanGroup.position.set(0, 0.1, 1.75);
engine.add(fanGroup);
const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.18, 24), brushedAlu);
hub.rotation.x = Math.PI / 2;
fanGroup.add(hub);
const bladeGeo = new THREE.BoxGeometry(0.1, 0.62, 0.22);
for (let i = 0; i < 6; i++) {
  const blade = new THREE.Mesh(bladeGeo, titanium);
  blade.position.set(0, 0.4, 0);
  blade.geometry = bladeGeo;
  const pivot = new THREE.Group();
  pivot.rotation.z = (i / 6) * Math.PI * 2;
  pivot.add(blade);
  fanGroup.add(pivot);
}
const fanRing = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.03, 12, 40), blueEmissive);
fanGroup.add(fanRing);

// Secondary pulley (belt-driven accessory)
const pulley = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.16, 20), darkTrim);
pulley.position.set(-1.35, 0.75, 1.75);
pulley.rotation.x = Math.PI / 2;
engine.add(pulley);

// Belt approximated as a flattened torus stretched between fan + pulley
const beltCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0.05, 0.72, 1.75), new THREE.Vector3(-0.65, 1.05, 1.75),
  new THREE.Vector3(-1.35, 1.01, 1.75), new THREE.Vector3(-1.6, 0.75, 1.75),
  new THREE.Vector3(-1.35, 0.49, 1.75), new THREE.Vector3(-0.65, 0.45, 1.75),
  new THREE.Vector3(0.05, 0.72, 1.75)
], true);
const beltGeo = new THREE.TubeGeometry(beltCurve, 60, 0.035, 8, true);
const belt = new THREE.Mesh(beltGeo, rubberBelt);
engine.add(belt);

// Intake manifold with amber highlight
const intake = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 1.0, 1, 1, 1), brushedAlu);
intake.position.set(0, 1.55, 0);
engine.add(intake);
const throttleBody = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.4, 20), gunmetal);
throttleBody.position.set(0.7, 1.55, 0);
throttleBody.rotation.z = Math.PI / 2;
engine.add(throttleBody);

// Header pipes curling from the banks (energy flow tubes)
function makeHeader(zSide, color) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.1, 0.55, zSide), new THREE.Vector3(-1.7, 0.1, zSide),
    new THREE.Vector3(-1.9, -0.6, zSide * 0.6), new THREE.Vector3(-1.6, -1.3, 0),
    new THREE.Vector3(-0.6, -1.55, 0),
  ]);
  const geo = new THREE.TubeGeometry(curve, 40, 0.075, 10, false);
  return new THREE.Mesh(geo, color);
}
const headerA = makeHeader(0.85, blueEmissive);
const headerB = makeHeader(-0.85, blueEmissive);
engine.add(headerA, headerB);

// Bolts scattered on block for detail
const boltGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.05, 8);
for (let i = 0; i < 14; i++) {
  const bolt = new THREE.Mesh(boltGeo, darkTrim);
  const angle = (i / 14) * Math.PI * 2;
  bolt.position.set(Math.cos(angle) * 1.25, Math.sin(angle) * 0.75, 1.01);
  bolt.rotation.x = Math.PI / 2;
  engine.add(bolt);
}

engine.scale.setScalar(0.85);

/* ---------- Ground / platform reflection ---------- */
const platform = new THREE.Mesh(
  new THREE.CircleGeometry(6, 48),
  new THREE.MeshStandardMaterial({ color: 0x08090a, metalness: 0.6, roughness: 0.25, transparent: true, opacity: 0.35 })
);
platform.rotation.x = -Math.PI / 2;
platform.position.y = -2.3;
scene.add(platform);

/* ---------- Ambient particles ---------- */
const PARTICLE_COUNT = isSmall ? 90 : 220;
const particleGeo = new THREE.BufferGeometry();
const particlePos = new Float32Array(PARTICLE_COUNT * 3);
const particleSpeed = new Float32Array(PARTICLE_COUNT);
const particleColor = new Float32Array(PARTICLE_COUNT * 3);
const colA = new THREE.Color(0x2dd4ff);
const colB = new THREE.Color(0xf5a623);
for (let i = 0; i < PARTICLE_COUNT; i++) {
  particlePos[i * 3] = (Math.random() - 0.5) * 12;
  particlePos[i * 3 + 1] = (Math.random() - 0.5) * 8;
  particlePos[i * 3 + 2] = (Math.random() - 0.5) * 8;
  particleSpeed[i] = 0.15 + Math.random() * 0.35;
  const c = Math.random() > 0.6 ? colB : colA;
  particleColor[i * 3] = c.r; particleColor[i * 3 + 1] = c.g; particleColor[i * 3 + 2] = c.b;
}
particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColor, 3));
const particleMat = new THREE.PointsMaterial({ size: 0.035, vertexColors: true, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

/* ---------- Steam puffs (occasional) ---------- */
const steamGroup = new THREE.Group();
scene.add(steamGroup);
const steamMat = new THREE.SpriteMaterial({ color: 0xbfc6cc, transparent: true, opacity: 0, depthWrite: false });
function spawnSteam() {
  if (reduceMotion) return;
  const sprite = new THREE.Sprite(steamMat.clone());
  const originX = (Math.random() - 0.5) * 1.4;
  sprite.position.set(originX, -0.9, 1.4);
  sprite.scale.setScalar(0.05);
  steamGroup.add(sprite);
  const life = { t: 0, dur: 2.2 + Math.random() };
  sprite.userData.life = life;
  steamGroup.userData.active = steamGroup.userData.active || [];
  steamGroup.userData.active.push(sprite);
}
setInterval(() => { if (document.visibilityState === 'visible') spawnSteam(); }, 2600);

/* ---------- Postprocessing (bloom) ---------- */
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.55, 0.55, 0.35);
bloomPass.enabled = !isSmall;
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

/* ---------- Mouse interaction ---------- */
const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
window.addEventListener('pointermove', (e) => {
  mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.targetY = (e.clientY / window.innerHeight) * 2 - 1;
});

/* ---------- Scroll-linked transform ---------- */
// Engine stays centered through hero, drifts right + shrinks through About,
// then the canvas fades out for Products/Contact.
const scrollState = { progress: 0 };
function updateScrollProgress() {
  const heroEl = document.getElementById('home');
  const aboutEl = document.getElementById('about');
  if (!heroEl || !aboutEl) return;
  const start = 0;
  const end = heroEl.offsetHeight + aboutEl.offsetHeight * 0.85;
  const y = window.scrollY;
  scrollState.progress = THREE.MathUtils.clamp((y - start) / (end - start), 0, 1);

  const fadeStart = heroEl.offsetHeight + aboutEl.offsetHeight * 0.85;
  const fadeEnd = heroEl.offsetHeight + aboutEl.offsetHeight * 1.05;
  let opacity = 1;
  if (y > fadeStart) opacity = 1 - THREE.MathUtils.clamp((y - fadeStart) / (fadeEnd - fadeStart), 0, 1);
  canvas.style.opacity = opacity.toFixed(3);
  canvas.style.pointerEvents = 'none';
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });

/* ---------- Resize ---------- */
function onResize() {
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  composer.setSize(w, h);
}
window.addEventListener('resize', onResize);

/* ---------- Animation loop ---------- */
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  const dt = clock.getDelta();

  // smooth mouse follow
  mouse.x += (mouse.targetX - mouse.x) * 0.05;
  mouse.y += (mouse.targetY - mouse.y) * 0.05;

  // Pistons up/down
  const rpm = reduceMotion ? 0.6 : 1.6;
  pistons.forEach((p) => {
    const phase = t * rpm * Math.PI * 2 + p.offset;
    const travel = Math.sin(phase) * 0.16;
    p.mesh.position.y = p.baseY + travel;
    p.rod.position.y = p.baseY - 0.4 + travel * 0.5;
  });

  // Crank spin
  crankGroup.rotation.x += dt * rpm * Math.PI * 2 * 0.5;

  // Fan spin
  fanGroup.rotation.z -= dt * rpm * 3.2;
  pulley.rotation.z -= dt * rpm * 3.2 * (0.62 / 0.26);

  // Energy pulse through headers / valve covers
  const pulse = 1.1 + Math.sin(t * 2.4) * 0.6;
  blueEmissive.emissiveIntensity = pulse;
  amberEmissive.emissiveIntensity = 1.0 + Math.sin(t * 1.7 + 1) * 0.5;
  fanRing.material.emissiveIntensity = pulse;

  // Base rotation + scroll drift
  const baseRotation = reduceMotion ? 0.3 : t * 0.12;
  const scrollRotation = scrollState.progress * Math.PI * 0.9;
  engine.rotation.y = baseRotation + scrollRotation + mouse.x * 0.15;
  engine.rotation.x = THREE.MathUtils.lerp(engine.rotation.x, -mouse.y * 0.08, 0.08);
  engine.position.x = THREE.MathUtils.lerp(engine.position.x, scrollState.progress * 2.6, 0.06);
  engine.position.y = THREE.MathUtils.lerp(engine.position.y, -1.9 - scrollState.progress * 0.2, 0.06);
  const scale = 0.85 - scrollState.progress * 0.22;
  engine.scale.setScalar(THREE.MathUtils.lerp(engine.scale.x, scale, 0.06));

  // Camera subtle drift
  camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 0.4, 0.04);
  camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.4 - mouse.y * 0.25, 0.04);
  camera.lookAt(0, 0, 0);

  // mouse-follow light for reflections
  mouseLight.position.set(mouse.x * 4, -mouse.y * 3 + 1, 4.5);

  // particle drift
  const pos = particleGeo.attributes.position;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    let y = pos.getY(i) + particleSpeed[i] * dt * 0.4;
    if (y > 4) y = -4;
    pos.setY(i, y);
  }
  pos.needsUpdate = true;

  // steam update
  const active = steamGroup.userData.active || [];
  for (let i = active.length - 1; i >= 0; i--) {
    const s = active[i];
    const life = s.userData.life;
    life.t += dt;
    const p = life.t / life.dur;
    s.position.y += dt * 0.35;
    s.position.x += Math.sin(t + i) * dt * 0.05;
    s.scale.setScalar(0.05 + p * 0.5);
    s.material.opacity = Math.sin(Math.PI * p) * 0.35;
    if (p >= 1) { steamGroup.remove(s); active.splice(i, 1); }
  }

  composer.render();
}

updateScrollProgress();
animate();

// Expose a hook so main.js can trigger a bright pulse (e.g. on hero CTA click)
window.__vulcanEnginePulse = () => {
  bloomPass.strength = 1.1;
  setTimeout(() => { bloomPass.strength = 0.55; }, 450);
};
