import * as THREE from 'three';
import { createShip, updateShipThrust } from './ship.js';
import { createPulsar, updatePulsar } from './pulsar.js';
import { createStarField } from './stars.js';
import { createWhiteRoom, getDoorIntersection } from './whiteroom.js';

// ===================== YouTube Audio (simple, reliable) =====================
let ytPlayer = null;
let ytReady = false;
let audioStarted = false;
let fadeInterval = null;

// Create container and load API
const playerDiv = document.createElement('div');
playerDiv.id = 'yt-audio-' + Date.now();
playerDiv.style.cssText = 'position:fixed;bottom:-100px;left:-100px;width:1px;height:1px;opacity:0;pointer-events:none;z-index:-1;';
document.body.appendChild(playerDiv);

window.onYouTubeIframeAPIReady = () => {
  ytPlayer = new YT.Player(playerDiv.id, {
    height: '1',
    width: '1',
    videoId: '5qJvG3B-F3I',
    playerVars: {
      autoplay: 0,
      controls: 0,
      showinfo: 0,
      rel: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      loop: 0,
    },
    events: {
      onReady: () => {
        ytReady = true;
        ytPlayer.setVolume(0);
        ytPlayer.mute();
      },
    },
  });
};

const tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
tag.async = true;
document.head.appendChild(tag);

function startAudio() {
  if (audioStarted || !ytReady || !ytPlayer) return;
  audioStarted = true;
  try {
    ytPlayer.unMute();
    ytPlayer.setVolume(50);
    ytPlayer.playVideo();
  } catch (e) {
    setTimeout(startAudio, 300);
  }
}

function fadeOutAudio(durationMs = 4000) {
  if (fadeInterval) clearInterval(fadeInterval);
  if (!ytPlayer) return;

  const steps = 40;
  let step = 0;

  fadeInterval = setInterval(() => {
    step++;
    try {
      const vol = Math.max(0, 50 * (1 - step / steps));
      ytPlayer.setVolume(vol);
    } catch (e) {}
    if (step >= steps) {
      clearInterval(fadeInterval);
      fadeInterval = null;
      try { ytPlayer.stopVideo(); } catch (e) {}
    }
  }, durationMs / steps);
}

// Start on first click/key
document.addEventListener('click', startAudio, { once: true });
document.addEventListener('keydown', startAudio, { once: true });

// ===================== Scene Setup =====================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 2000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// ===================== Phase State =====================
const PHASE_SPACE = 0;
const PHASE_WHITE = 2;
let phase = PHASE_SPACE;

// ===================== Phase 1: Space =====================
const ambientLight = new THREE.AmbientLight(0x222244, 0.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

const stars = createStarField();
scene.add(stars);

const pulsar = createPulsar();
pulsar.position.set(0, 0, -150);
scene.add(pulsar);

const ship = createShip();
ship.position.set(0, 0, 30);
ship.rotation.y = -Math.PI / 2;
scene.add(ship);

// ===================== Input (Space Phase) =====================
const keys = { w: false, a: false, d: false };

document.addEventListener('keydown', (e) => {
  if (phase === PHASE_SPACE) {
    switch (e.code) {
      case 'KeyW': keys.w = true; break;
      case 'KeyA': keys.a = true; break;
      case 'KeyD': keys.d = true; break;
    }
  }
});

document.addEventListener('keyup', (e) => {
  if (phase === PHASE_SPACE) {
    switch (e.code) {
      case 'KeyW': keys.w = false; break;
      case 'KeyA': keys.a = false; break;
      case 'KeyD': keys.d = false; break;
    }
  }
});

// ===================== Ship Physics =====================
let velocity = new THREE.Vector3(0, 0, 0);
const maxSpeed = 1.5;
const acceleration = 0.06;
const friction = 0.97;
const rotationSpeed = 0.04;
let throttle = 0;

const SHIP_FORWARD = new THREE.Vector3(-1, 0, 0);

function updateCamera(immediate) {
  const targetPos = new THREE.Vector3();
  ship.getWorldPosition(targetPos);
  const shipForward = SHIP_FORWARD.clone().applyQuaternion(ship.quaternion);
  const camPos = targetPos.clone().add(shipForward.clone().multiplyScalar(-12));
  camPos.y += 5;
  if (immediate) camera.position.copy(camPos);
  else camera.position.lerp(camPos, 0.08);
  camera.lookAt(targetPos);
}

updateCamera(true);

// ===================== Win Condition =====================
const winOverlay = document.getElementById('win-overlay');
const distanceDisplay = document.getElementById('distance-display');
let hasWon = false;
let whiteOverlay = null;
const gameClock = new THREE.Clock();

function checkWinCondition() {
  const d = ship.position.distanceTo(pulsar.position);
  distanceDisplay.textContent = `Distancia: ${Math.round(d)} u`;
  if (d < 10 && !hasWon) {
    hasWon = true;
    winOverlay.classList.add('show');
    whiteOverlay = document.createElement('div');
    whiteOverlay.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:white;z-index:25;pointer-events:none;opacity:0;transition:opacity 3s ease;`;
    document.body.appendChild(whiteOverlay);
    setTimeout(() => { whiteOverlay.style.opacity = '1'; }, 2000);
    setTimeout(() => { enterWhiteRoom(); }, 5500);
  }
}

// ===================== Phase 2: White Room =====================
let whiteRoom = null;
let isPointerLocked = false;
let yaw = 0;
let pitch = 0;
const mouseSensitivity = 0.002;
let wrKeys = { w: false, a: false, s: false, d: false };
const moveSpeed = 8;

function enterWhiteRoom() {
  scene.remove(stars);
  scene.remove(pulsar);
  scene.remove(ship);
  scene.remove(ambientLight);
  scene.remove(dirLight);

  scene.background = new THREE.Color(0xffffff);
  scene.fog = new THREE.Fog(0xffffff, 40, 80);

  whiteRoom = createWhiteRoom();
  scene.add(whiteRoom);

  camera.position.set(0, 1.6, 0);
  yaw = 0;
  pitch = 0;

  if (whiteOverlay) {
    whiteOverlay.style.opacity = '0';
    setTimeout(() => { if (whiteOverlay) document.body.removeChild(whiteOverlay); whiteOverlay = null; }, 1000);
  }

  distanceDisplay.style.display = 'none';
  document.getElementById('controls-info').style.display = 'none';
  winOverlay.classList.remove('show');

  phase = PHASE_WHITE;
  fadeOutAudio(4000);
  renderer.domElement.requestPointerLock();
}

document.addEventListener('pointerlockchange', () => {
  isPointerLocked = document.pointerLockElement === renderer.domElement;
});

document.addEventListener('click', () => {
  if (phase === PHASE_WHITE) {
    if (!isPointerLocked) { renderer.domElement.requestPointerLock(); return; }
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(0, 0);
    raycaster.setFromCamera(mouse, camera);
    const link = getDoorIntersection(whiteRoom, raycaster);
    if (link) window.location.href = link;
  }
});

document.addEventListener('mousemove', (e) => {
  if (phase !== PHASE_WHITE || !isPointerLocked) return;
  yaw += e.movementX * mouseSensitivity;
  pitch -= e.movementY * mouseSensitivity;
  pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, pitch));
});

document.addEventListener('keydown', (e) => {
  if (phase !== PHASE_WHITE) return;
  switch (e.code) {
    case 'KeyW': wrKeys.w = true; break;
    case 'KeyA': wrKeys.a = true; break;
    case 'KeyS': wrKeys.s = true; break;
    case 'KeyD': wrKeys.d = true; break;
  }
});

document.addEventListener('keyup', (e) => {
  if (phase !== PHASE_WHITE) return;
  switch (e.code) {
    case 'KeyW': wrKeys.w = false; break;
    case 'KeyA': wrKeys.a = false; break;
    case 'KeyS': wrKeys.s = false; break;
    case 'KeyD': wrKeys.d = false; break;
  }
});

function updateFirstPersonCamera(delta) {
  const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
  const right = new THREE.Vector3(forward.z, 0, -forward.x);
  const moveVec = new THREE.Vector3(0, 0, 0);
  if (wrKeys.w) moveVec.add(forward);
  if (wrKeys.s) moveVec.sub(forward);
  if (wrKeys.a) moveVec.sub(right);  // A = izquierda
  if (wrKeys.d) moveVec.add(right);  // D = derecha
  if (moveVec.length() > 0) {
    moveVec.normalize().multiplyScalar(moveSpeed * delta);
    camera.position.add(moveVec);
  }
  camera.quaternion.setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
}

// ===================== Animation Loop =====================
function animate() {
  requestAnimationFrame(animate);

  const delta = gameClock.getDelta();
  const elapsedTime = gameClock.getElapsedTime();

  if (phase === PHASE_SPACE) {
    // A = izquierda, D = derecha (correcto)
    if (keys.a) ship.rotation.y += rotationSpeed;
    if (keys.d) ship.rotation.y -= rotationSpeed;
    if (keys.w) throttle = Math.min(throttle + 0.02, 1);
    else throttle = Math.max(throttle - 0.015, 0);

    const fwd = SHIP_FORWARD.clone().applyQuaternion(ship.quaternion);
    velocity.x += fwd.x * acceleration * throttle;
    velocity.y += fwd.y * acceleration * throttle;
    velocity.z += fwd.z * acceleration * throttle;
    if (velocity.length() > maxSpeed) velocity.normalize().multiplyScalar(maxSpeed);
    velocity.multiplyScalar(friction);
    ship.position.add(velocity);

    updateShipThrust(ship, throttle);
    updatePulsar(pulsar, elapsedTime);
    updateCamera();
    checkWinCondition();

    if (hasWon && whiteOverlay) {
      const op = parseFloat(whiteOverlay.style.opacity) || 0;
      if (op < 1) scene.background.setRGB(op * 0.5, op * 0.5, op * 0.5);
    }
  } else if (phase === PHASE_WHITE) {
    updateFirstPersonCamera(delta);
  }

  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});