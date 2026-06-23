import * as THREE from 'three';

const LINK_PARTE2 = 'https://joshda777.github.io/JulySharon-3mes-parte2/';
const LINK_CUMPLE = 'https://joshda777.github.io/JulySharon-CumpleA-os/';

export function createWhiteRoom() {
  const group = new THREE.Group();

  // ========== Floor (infinite-looking white plane) ==========
  const floorGeo = new THREE.PlaneGeometry(200, 200);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0xf5f5f5,
    roughness: 0.8,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2;
  group.add(floor);

  // ========== Walls / fog boundaries ==========
  // We'll rely on fog + white background instead of walls

  // ========== Door 1: "Feliz 3er mes mi juli :3" ==========
  const door1Group = createDoor(
    'Feliz 3er mes',
    'mi juli :3',
    0x88ddff,
    0x44aaff
  );
  door1Group.position.set(-35, 0, 0);
  door1Group.rotation.y = Math.PI / 2;
  group.add(door1Group);

  // Light for door 1
  const light1 = new THREE.PointLight(0x88ddff, 1, 20);
  light1.position.set(-35, 3, 0);
  group.add(light1);

  // ========== Door 2: "cumpleaños?" ==========
  const door2Group = createDoor(
    'cumpleaños?',
    '',
    0xff88aa,
    0xff4488
  );
  door2Group.position.set(35, 0, 0);
  door2Group.rotation.y = -Math.PI / 2;
  group.add(door2Group);

  // Light for door 2
  const light2 = new THREE.PointLight(0xff88aa, 1, 20);
  light2.position.set(35, 3, 0);
  group.add(light2);

  // ========== Subtle floating particles ==========
  const particleCount = 300;
  const pPos = new Float32Array(particleCount * 3);
  const pSizes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 100;
    pPos[i * 3 + 1] = (Math.random() - 0.5) * 30;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 100;
    pSizes[i] = 0.05 + Math.random() * 0.1;
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('size', new THREE.BufferAttribute(pSizes, 1));

  const pMat = new THREE.PointsMaterial({
    color: 0x888888,
    size: 0.15,
    transparent: true,
    opacity: 0.3,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);

  // ========== Ambient light ==========
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  group.add(ambient);

  // Store door references for raycasting
  group.userData.door1 = door1Group;
  group.userData.door2 = door2Group;

  return group;
}

function createDoor(text1, text2, colorLight, colorDark) {
  const group = new THREE.Group();

  // Door frame
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    roughness: 0.5,
    metalness: 0.1,
  });

  // Left pillar
  const pillarGeo = new THREE.BoxGeometry(0.4, 5, 0.4);
  const leftPillar = new THREE.Mesh(pillarGeo, frameMat);
  leftPillar.position.set(-2, 2.5, 0);
  group.add(leftPillar);

  // Right pillar
  const rightPillar = new THREE.Mesh(pillarGeo, frameMat);
  rightPillar.position.set(2, 2.5, 0);
  group.add(rightPillar);

  // Top beam
  const beamGeo = new THREE.BoxGeometry(4.4, 0.4, 0.4);
  const beam = new THREE.Mesh(beamGeo, frameMat);
  beam.position.set(0, 5, 0);
  group.add(beam);

  // Door panel
  const panelMat = new THREE.MeshStandardMaterial({
    color: colorLight,
    roughness: 0.3,
    metalness: 0.4,
    emissive: colorDark,
    emissiveIntensity: 0.2,
  });
  const panelGeo = new THREE.BoxGeometry(3.6, 4.2, 0.15);
  const panel = new THREE.Mesh(panelGeo, panelMat);
  panel.position.set(0, 2.5, 0.05);
  group.add(panel);

  // Door handle
  const handleMat = new THREE.MeshStandardMaterial({
    color: 0xdddddd,
    metalness: 0.8,
    roughness: 0.2,
  });
  const handleGeo = new THREE.SphereGeometry(0.15, 8, 8);
  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.position.set(1.5, 2.5, 0.25);
  group.add(handle);

  // Glow around door
  const glowMat = new THREE.MeshBasicMaterial({
    color: colorLight,
    transparent: true,
    opacity: 0.1,
  });
  const glowGeo = new THREE.BoxGeometry(4.4, 5.2, 0.1);
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.set(0, 2.5, -0.1);
  group.add(glow);

  // Create text using canvas
  const textCanvas = document.createElement('canvas');
  textCanvas.width = 512;
  textCanvas.height = 256;
  const ctx = textCanvas.getContext('2d');

  // Transparent background
  ctx.clearRect(0, 0, 512, 256);

  // Draw text 1
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(255,255,255,0.5)';
  ctx.shadowBlur = 10;

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px "Courier New", monospace';
  ctx.fillText(text1, 256, 80);

  if (text2) {
    ctx.font = 'bold 36px "Courier New", monospace';
    ctx.fillText(text2, 256, 160);
  }

  const texture = new THREE.CanvasTexture(textCanvas);
  texture.needsUpdate = true;

  const textMat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const textGeo = new THREE.PlaneGeometry(3, 1.5);
  const textMesh = new THREE.Mesh(textGeo, textMat);
  textMesh.position.set(0, 3.5, 0.2);
  group.add(textMesh);

  // Store door panel for raycasting click detection
  group.userData.panel = panel;
  group.userData.label = text1;

  return group;
}

export function getDoorIntersection(whiteRoom, raycaster) {
  const doors = [whiteRoom.userData.door1, whiteRoom.userData.door2];
  let closestIntersect = null;
  let closestDoor = null;

  for (const doorGroup of doors) {
    const panel = doorGroup.userData.panel;
    if (!panel) continue;

    const intersects = raycaster.intersectObject(panel, true);
    if (intersects.length > 0) {
      const intersect = intersects[0];
      if (!closestIntersect || intersect.distance < closestIntersect.distance) {
        closestIntersect = intersect;
        closestDoor = doorGroup;
      }
    }
  }

  if (closestDoor) {
    const label = closestDoor.userData.label;
    if (label.includes('Feliz') || label.includes('3er')) {
      return LINK_PARTE2;
    } else {
      return LINK_CUMPLE;
    }
  }

  return null;
}