import * as THREE from 'three';

export function createShip() {
  const group = new THREE.Group();

  // --- Body (triangular arrow shape) ---
  const bodyShape = new THREE.Shape();
  bodyShape.moveTo(0, 0);
  bodyShape.lineTo(1.5, 0.6);
  bodyShape.lineTo(1.5, -0.6);
  bodyShape.closePath();

  const extrudeSettings = {
    depth: 0.2,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 4,
  };

  const bodyGeometry = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
  const bodyMaterial = new THREE.MeshPhongMaterial({
    color: 0x44ccff,
    emissive: 0x114466,
    shininess: 60,
    flatShading: false,
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.set(0, 0, 0);
  body.rotation.x = -Math.PI / 2;
  body.castShadow = false;
  body.receiveShadow = false;
  group.add(body);

  // --- Cockpit (small dome) ---
  const cockpitGeo = new THREE.SphereGeometry(0.35, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const cockpitMat = new THREE.MeshPhongMaterial({
    color: 0x88ddff,
    emissive: 0x224466,
    transparent: true,
    opacity: 0.7,
    shininess: 80,
  });
  const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
  cockpit.position.set(0.7, 0.15, 0);
  cockpit.rotation.x = -Math.PI / 2;
  group.add(cockpit);

  // --- Engine glow ---
  const glowGeo = new THREE.CircleGeometry(0.4, 12);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x00aaff,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.set(-0.2, 0, 0);
  glow.rotation.x = -Math.PI / 2;
  group.add(glow);

  // --- Engine Flame (animated) ---
  // Cone defaults to +Y; rotate around Z by -PI/2 to point along -X (backward)
  const flameGeo = new THREE.ConeGeometry(0.3, 0.6, 8);
  const flameMat = new THREE.MeshBasicMaterial({
    color: 0xff6600,
    transparent: true,
    opacity: 0.8,
  });
  const flame = new THREE.Mesh(flameGeo, flameMat);
  flame.position.set(-0.8, 0, 0);
  flame.rotation.z = -Math.PI / 2;
  group.add(flame);

  // Store flame for animation
  group.userData.flame = flame;
  group.userData.flameMat = flameMat;

  // Scale the whole ship to a reasonable size
  group.scale.set(1, 1, 1);

  return group;
}

export function updateShipThrust(ship, throttle) {
  const flame = ship.userData.flame;
  const flameMat = ship.userData.flameMat;
  if (!flame || !flameMat) return;

  if (throttle > 0.01) {
    flame.visible = true;
    const scale = 0.5 + throttle * 1.5;
    flame.scale.set(1, scale, 1);
    flameMat.opacity = 0.3 + throttle * 0.6;
  } else {
    flame.visible = false;
  }
}